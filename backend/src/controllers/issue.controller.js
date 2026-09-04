import Issue from '../models/Issue.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';

export const getIssues = async (req, res) => {
  try {
    const { category, status, department, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (department) query.department = department;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.area': { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Issue.countDocuments(query);
    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('reportedBy', 'name');

    res.json({
      success: true,
      issues,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name phone')
      .populate('timeline.updatedBy', 'name role');

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    res.json({ success: true, ...issue.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createIssue = async (req, res) => {
  try {
    console.log("CREATE ISSUE BODY:", req.body);
    console.log("CREATE ISSUE FILES:", req.files);
    const { title, description, category, location, address, area, pincode } = req.body;
    
    let parsedLocation = {};
    if (location) {
      parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    } else {
      parsedLocation = {
        address,
        area,
        pincode
      };
    }

    const imageUrls = req.files ? req.files.map(file => {
      if (file.path.startsWith('http')) {
        return file.path;
      }
      return `http://localhost:5000/${file.path.replace(/\\/g, '/')}`;
    }) : [];

    // Image Analyzer call
    let isImageVerified = true;
    let imageMetrics = null;
    if (req.files && req.files.length > 0) {
      try {
        const localImgPath = req.files[0].path;
        const imgResponse = await fetch('http://localhost:8000/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_path: localImgPath })
        });
        if (imgResponse.ok) {
          const imgData = await imgResponse.json();
          isImageVerified = imgData.verified;
          imageMetrics = {
            edgeDensity: imgData.metrics?.edge_density || 0,
            variance: imgData.metrics?.variance || 0,
            brightness: imgData.metrics?.brightness || 0,
            detectedLabel: imgData.detected || 'other'
          };
        }
      } catch (imgErr) {
        console.log("Image Analyzer service offline", imgErr.message);
      }
    }

    // Coordinates mapping
    if (!parsedLocation.coordinates || !parsedLocation.coordinates.lat) {
      parsedLocation.coordinates = {
        lat: 12.9716 + (Math.random() * 0.06 - 0.03),
        lng: 77.5946 + (Math.random() * 0.06 - 0.03)
      };
    }

    // Call NLP/Triage ML microservice
    let predictedCategory = category || 'pothole';
    let predictedPriority = 'medium';
    let isDuplicate = false;
    let duplicateOf = null;

    try {
      const activeIssues = await Issue.find({ status: { $ne: 'resolved' } }).select('_id title description location');
      const mappedRefs = activeIssues.map(iss => ({
        id: iss._id.toString(),
        title: iss.title || '',
        description: iss.description || '',
        lat: iss.location?.coordinates?.lat || 12.9716,
        lng: iss.location?.coordinates?.lng || 77.5946
      }));

      const triageResponse = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          lat: parsedLocation.coordinates.lat,
          lng: parsedLocation.coordinates.lng,
          has_images: imageUrls.length > 0,
          area: parsedLocation.area || 'Bangalore',
          existing_issues: mappedRefs
        })
      });

      if (triageResponse.ok) {
        const triageData = await triageResponse.json();
        predictedCategory = triageData.suggested_category || predictedCategory;
        predictedPriority = triageData.suggested_priority || predictedPriority;
        isDuplicate = triageData.is_duplicate || false;
        duplicateOf = triageData.similar_issue_id || null;
      }
    } catch (mlErr) {
      console.log("Triage ML service offline", mlErr.message);
    }

    // Determine default status: if image verification fails or duplicate is detected
    let initialStatus = 'pending';
    let timelineNote = 'Issue reported and logged into system';
    if (!isImageVerified) {
      initialStatus = 'rejected';
      timelineNote = 'Auto-rejected: Image did not pass verification (not recognized as a valid civic issue)';
    } else if (isDuplicate) {
      initialStatus = 'rejected';
      timelineNote = `Auto-rejected: Tagged as a duplicate of issue ID ${duplicateOf}`;
    }

    const issue = await Issue.create({
      title,
      description,
      category: predictedCategory,
      priority: predictedPriority,
      location: parsedLocation,
      images: imageUrls,
      reportedBy: req.user._id,
      status: initialStatus,
      isImageVerified,
      imageMetrics,
      isDuplicate,
      duplicateOf,
      timeline: [{ status: initialStatus, note: timelineNote }],
    });

    // 1. Create notification for reporter (citizen)
    const citizenNotification = await Notification.create({
      user: issue.reportedBy,
      issue: issue._id,
      type: 'new_issue',
      title: 'Issue Reported Successfully',
      message: `Your issue "${issue.title}" has been submitted and is pending official review.`,
    });

    // 2. Get all Admins and create notification for them
    const admins = await User.find({ role: 'admin' });
    const adminNotifications = await Promise.all(
      admins.map(admin => 
        Notification.create({
          user: admin._id,
          issue: issue._id,
          type: 'new_issue',
          title: 'New Issue Logged',
          message: `A new issue "${issue.title}" has been reported in ${issue.location.area || 'Bangalore'}.`,
        })
      )
    );

    // Emit socket events
    const io = req.app.get('socketio');
    io.emit('new-issue', issue);
    
    // Emit notification to reporter
    io.to(issue.reportedBy.toString()).emit('notification', citizenNotification);
    
    // Emit notification to admins
    admins.forEach((admin, index) => {
      io.to(admin._id.toString()).emit('notification', adminNotifications[index]);
    });

    res.status(201).json({ success: true, ...issue.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    issue.status = status;
    issue.timeline.push({
      status,
      note: note || `Status updated to ${status}`,
      updatedBy: req.user._id,
    });

    if (status === 'resolved') {
      issue.resolvedAt = Date.now();

      // Update reporter reputation
      const reporter = await User.findById(issue.reportedBy);
      if (reporter) {
        reporter.reputationScore = (reporter.reputationScore || 0) + 15;
        
        // Dynamic Badge awarding
        if (reporter.reputationScore >= 100 && !reporter.badges.includes('Elite Guardian')) {
          reporter.badges.push('Elite Guardian');
        } else if (reporter.reputationScore >= 50 && !reporter.badges.includes('Civic Inspector')) {
          reporter.badges.push('Civic Inspector');
        } else if (reporter.reputationScore >= 25 && !reporter.badges.includes('Active Reporter')) {
          reporter.badges.push('Active Reporter');
        }
        await reporter.save();
      }
    }

    await issue.save();

    // Create Notification for reporter
    const notification = await Notification.create({
      user: issue.reportedBy,
      issue: issue._id,
      type: 'status_update',
      title: 'Issue Status Updated',
      message: `Your reported issue "${issue.title}" is now ${status.replace('_', ' ')}.`,
    });

    // Socket emission
    const io = req.app.get('socketio');
    io.to(issue.reportedBy.toString()).emit('notification', notification);
    io.emit('issue-updated', issue);

    res.json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const index = issue.upvotes.indexOf(req.user._id);
    let voted = false;

    if (index === -1) {
      issue.upvotes.push(req.user._id);
      voted = true;
    } else {
      issue.upvotes.splice(index, 1);
      voted = false;
    }

    await issue.save();

    // Reward reporter for community validation
    const reporter = await User.findById(issue.reportedBy);
    if (reporter) {
      reporter.reputationScore = Math.max(0, (reporter.reputationScore || 0) + (voted ? 2 : -2));
      await reporter.save();
    }

    res.json({ success: true, upvotes: issue.upvotes.length, voted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const claimIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    issue.assignedTo = req.user._id;
    issue.status = 'in_progress';
    issue.timeline.push({
      status: 'in_progress',
      note: `Issue claimed by official ${req.user.name} and set to in-progress`,
      updatedBy: req.user._id,
    });

    await issue.save();

    const notification = await Notification.create({
      user: issue.reportedBy,
      issue: issue._id,
      type: 'status_update',
      title: 'Issue Claimed by Official',
      message: `Official ${req.user.name} has claimed your issue: "${issue.title}" and is working on it.`,
    });

    const io = req.app.get('socketio');
    io.to(issue.reportedBy.toString()).emit('notification', notification);
    io.emit('issue-updated', issue);

    res.json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveIssueByOfficial = async (req, res) => {
  try {
    const { resolutionNote } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    issue.status = 'resolved';
    issue.resolutionNote = resolutionNote || 'Resolved by official';
    issue.resolvedAt = Date.now();
    issue.timeline.push({
      status: 'resolved',
      note: resolutionNote || `Issue marked resolved by official ${req.user.name}`,
      updatedBy: req.user._id,
    });

    // Update reporter reputation
    const reporter = await User.findById(issue.reportedBy);
    if (reporter) {
      reporter.reputationScore = (reporter.reputationScore || 0) + 15;
      if (reporter.reputationScore >= 100 && !reporter.badges.includes('Elite Guardian')) {
        reporter.badges.push('Elite Guardian');
      } else if (reporter.reputationScore >= 50 && !reporter.badges.includes('Civic Inspector')) {
        reporter.badges.push('Civic Inspector');
      } else if (reporter.reputationScore >= 25 && !reporter.badges.includes('Active Reporter')) {
        reporter.badges.push('Active Reporter');
      }
      await reporter.save();
    }

    await issue.save();

    const notification = await Notification.create({
      user: issue.reportedBy,
      issue: issue._id,
      type: 'status_update',
      title: 'Issue Resolved',
      message: `Your issue "${issue.title}" has been successfully resolved by the department!`,
    });

    const io = req.app.get('socketio');
    io.to(issue.reportedBy.toString()).emit('notification', notification);
    io.emit('issue-updated', issue);

    res.json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
