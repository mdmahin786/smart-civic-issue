const express = require('express');
const cors = require('cors');
const multer = require('multer');
const upload = multer();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock Data
let issues = [
  {
    _id: '1',
    title: 'Huge Pothole on 80ft Road',
    description: 'A very large and deep pothole is causing traffic issues and safety concerns near the junction.',
    category: 'pothole',
    status: 'pending',
    address: '80ft Road, Koramangala',
    area: 'Koramangala',
    pincode: '560034',
    upvotes: ['user1', 'user2'],
    images: ['https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=800&q=80'],
    reportedBy: { _id: 'user2', name: 'Rahul Sharma' },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    history: [{ status: 'pending', createdAt: new Date(Date.now() - 86400000).toISOString(), note: 'Issue reported by citizen' }]
  },
  {
    _id: '2',
    title: 'Garbage Pileup near Park',
    description: 'Garbage has not been cleared for over a week near the entrance of the public park.',
    category: 'garbage',
    status: 'in_progress',
    address: '12th Main, Indiranagar',
    area: 'Indiranagar',
    pincode: '560038',
    upvotes: ['user3'],
    images: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'],
    reportedBy: { _id: 'user1', name: 'Demo User' },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    history: [
      { status: 'pending', createdAt: new Date(Date.now() - 172800000).toISOString(), note: 'Issue reported' },
      { status: 'assigned', createdAt: new Date(Date.now() - 86400000).toISOString(), note: 'Assigned to Ward Officer' },
      { status: 'in_progress', createdAt: new Date(Date.now() - 43200000).toISOString(), note: 'Cleanup scheduled' }
    ]
  },
  {
    _id: '3',
    title: 'Water Leakage from Pipeline',
    description: 'Continuous water leakage from the main pipeline near the metro station.',
    category: 'water_leakage',
    status: 'resolved',
    address: 'MG Road Metro Station',
    area: 'MG Road',
    pincode: '560001',
    upvotes: ['user1', 'user2', 'user3', 'user4', 'user5'],
    images: ['https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80'],
    reportedBy: { _id: 'user3', name: 'Ananya Rao' },
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    history: [
      { status: 'pending', createdAt: new Date(Date.now() - 604800000).toISOString(), note: 'Leaking pipe reported' },
      { status: 'resolved', createdAt: new Date(Date.now() - 86400000).toISOString(), note: 'Pipe repaired and tested' }
    ]
  }
];

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  // Demo login for any email
  res.json({ 
    token: 'mock_jwt_token_for_demo', 
    user: { 
      _id: 'user1', 
      name: 'Demo User', 
      email: email || 'demo@presidency.edu', 
      role: email.includes('admin') ? 'admin' : 'citizen' 
    } 
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ _id: 'user1', name: 'Demo User', email: 'demo@presidency.edu', role: 'admin' });
});

// Issue Routes
app.get('/api/issues', (req, res) => {
  let filtered = [...issues];
  if (req.query.category && req.query.category !== 'all') {
    filtered = filtered.filter(i => i.category === req.query.category);
  }
  if (req.query.status) {
    filtered = filtered.filter(i => i.status === req.query.status);
  }
  res.json({ issues: filtered, totalPages: 1 });
});

app.get('/api/issues/my-issues', (req, res) => {
    res.json({ issues: issues.filter(i => i.reportedBy._id === 'user1') });
});

app.get('/api/issues/:id', (req, res) => {
  const issue = issues.find(i => i._id === req.params.id);
  if (issue) res.json(issue);
  else res.status(404).json({ message: 'Issue not found' });
});

app.post('/api/issues', upload.any(), (req, res) => {
  const { title, description, category, location } = req.body;
  const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
  
  const newIssue = {
    _id: Math.random().toString(36).substr(2, 9),
    title,
    description,
    category,
    location: parsedLocation,
    status: 'pending',
    upvotes: [],
    images: ['https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=800&q=80'], // Placeholder for demo
    reportedBy: { _id: 'user1', name: 'Demo User' },
    createdAt: new Date().toISOString(),
    history: [{ status: 'pending', note: 'Issue reported' }]
  };
  issues.unshift(newIssue);
  res.status(201).json(newIssue);
});

app.post('/api/issues/:id/upvote', (req, res) => {
  const issue = issues.find(i => i._id === req.params.id);
  if (issue) {
    const voted = issue.upvotes.includes('user1');
    if (voted) issue.upvotes = issue.upvotes.filter(u => u !== 'user1');
    else issue.upvotes.push('user1');
    res.json({ upvotes: issue.upvotes.length, voted: !voted });
  } else {
    res.status(404).json({ message: 'Issue not found' });
  }
});

app.patch('/api/issues/:id/status', (req, res) => {
    const issue = issues.find(i => i._id === req.params.id);
    if (issue) {
      issue.status = req.body.status;
      issue.history.push({ 
          status: req.body.status, 
          note: req.body.note || 'Status updated by official',
          createdAt: new Date().toISOString()
      });
      res.json(issue);
    } else {
      res.status(404).json({ message: 'Issue not found' });
    }
});

// Admin Routes
app.get('/api/admin/stats', (req, res) => {
  res.json({
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    in_progress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    rejected: issues.filter(i => i.status === 'rejected').length
  });
});

app.get('/api/admin/issues', (req, res) => {
    res.json({ issues, total: issues.length, totalPages: 1 });
});

app.get('/api/admin/users', (req, res) => {
    res.json({ users: [
        { _id: 'user1', name: 'Demo User', email: 'demo@presidency.edu', role: 'admin' },
        { _id: 'user2', name: 'Rahul Sharma', email: 'rahul@gmail.com', role: 'citizen' }
    ] });
});

app.listen(port, () => {
  console.log(`Mock Backend running at http://localhost:${port}`);
});
