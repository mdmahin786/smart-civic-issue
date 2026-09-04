import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['pothole', 'garbage', 'water_leakage', 'streetlight', 'sewage', 'park', 'other'],
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  location: {
    address: { type: String, required: true },
    area: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    }
  },
  images: [{
    type: String,
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  department: {
    type: String,
    enum: ['roads', 'sanitation', 'water', 'electricity', 'parks', 'other'],
  },
  timeline: [{
    status: { type: String },
    note: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
  }],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isDuplicate: {
    type: Boolean,
    default: false,
  },
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
  },
  resolutionNote: {
    type: String,
  },
  resolvedAt: {
    type: Date,
  },
  isImageVerified: {
    type: Boolean,
    default: true,
  },
  imageMetrics: {
    edgeDensity: Number,
    variance: Number,
    brightness: Number,
    detectedLabel: String,
  },
}, {
  timestamps: true,
});

// Category to Department Mapping
const categoryToDept = {
  pothole: 'roads',
  garbage: 'sanitation',
  water_leakage: 'water',
  sewage: 'water',
  streetlight: 'electricity',
  park: 'parks',
  other: 'other',
};

// Pre-save hook to set department based on category
issueSchema.pre('save', function(next) {
  if (this.isModified('category')) {
    this.department = categoryToDept[this.category] || 'other';
  }
  next();
});

issueSchema.set('toJSON', { virtuals: true });
issueSchema.set('toObject', { virtuals: true });

issueSchema.virtual('address').get(function() {
  return this.location ? this.location.address : undefined;
});

issueSchema.virtual('area').get(function() {
  return this.location ? this.location.area : undefined;
});

issueSchema.virtual('pincode').get(function() {
  return this.location ? this.location.pincode : undefined;
});

const Issue = mongoose.model('Issue', issueSchema);
export default Issue;
