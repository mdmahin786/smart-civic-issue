import Issue from '../models/Issue.model.js';
import User from '../models/User.model.js';
import Notification from '../models/Notification.model.js';

export const getStats = async (req, res) => {
  try {
    const total = await Issue.countDocuments();
    const pending = await Issue.countDocuments({ status: 'pending' });
    const inProgress = await Issue.countDocuments({ status: 'in_progress' });
    const resolved = await Issue.countDocuments({ status: 'resolved' });
    const rejected = await Issue.countDocuments({ status: 'rejected' });

    const byCategory = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const byDepartment = await Issue.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    // Last 7 days trend
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentTrend = await Issue.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      { $group: { 
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
        count: { $sum: 1 } 
      } },
      { $sort: { _id: 1 } }
    ]);

    const geoData = await Issue.find().select('location.coordinates category title status');

    res.json({
      success: true,
      total, pending, inProgress, resolved, rejected,
      byCategory,
      byDepartment,
      recentTrend,
      geoData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllIssues = async (req, res) => {
  try {
    const { search, category, status, department, priority, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;
    if (department) query.department = department;
    if (priority) query.priority = priority;

    const total = await Issue.countDocuments(query);
    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('reportedBy', 'name email');

    res.json({
      success: true,
      issues,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignIssue = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    issue.assignedTo = assignedTo;
    issue.status = 'assigned';
    issue.timeline.push({
      status: 'assigned',
      note: `Issue assigned to official`,
      updatedBy: req.user._id,
    });

    await issue.save();

    const notification = await Notification.create({
      user: issue.reportedBy,
      issue: issue._id,
      type: 'issue_assigned',
      title: 'Officer Assigned',
      message: `An official has been assigned to look into your issue: "${issue.title}".`,
    });

    const io = req.app.get('socketio');
    io.to(issue.reportedBy.toString()).emit('notification', notification);

    res.json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
