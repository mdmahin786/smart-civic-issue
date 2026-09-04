import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.model.js';
import Issue from './src/models/Issue.model.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicwatch';

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // 1. Create or find Demo User
    let demoUser = await User.findOne({ email: 'demo@presidency.edu' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo User',
        email: 'demo@presidency.edu',
        password: 'password123', // pre-save hook will hash it
        phone: '9876543210',
        role: 'admin',
        isVerified: true
      });
      console.log('Demo User created.');
    } else {
      console.log('Demo User already exists.');
    }

    // 2. Clear existing issues to start clean (or keep, but user requested to add example issues)
    await Issue.deleteMany({});
    console.log('Cleared existing issues.');

    // 3. Create example issues
    const sampleIssues = [
      {
        title: 'Huge Pothole on 80ft Road',
        description: 'A very large and deep pothole is causing traffic issues and safety concerns near the junction.',
        category: 'pothole',
        status: 'pending',
        priority: 'high',
        location: {
          address: '80ft Road, near Metro station',
          area: 'Koramangala',
          pincode: '560034',
          coordinates: { lat: 12.9344, lng: 77.6192 }
        },
        images: ['https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=800&q=80'],
        reportedBy: demoUser._id,
        timeline: [{ status: 'pending', note: 'Issue reported by citizen' }]
      },
      {
        title: 'Garbage Pileup near Public Park',
        description: 'Garbage has not been cleared for over a week near the entrance of the public park. Stray dogs are scattering it.',
        category: 'garbage',
        status: 'in_progress',
        priority: 'medium',
        location: {
          address: '12th Main, outer boundary',
          area: 'Indiranagar',
          pincode: '560038',
          coordinates: { lat: 12.9784, lng: 77.6408 }
        },
        images: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'],
        reportedBy: demoUser._id,
        timeline: [
          { status: 'pending', note: 'Issue reported' },
          { status: 'assigned', note: 'Assigned to Sanitation Department' },
          { status: 'in_progress', note: 'Cleanup scheduled for tomorrow morning' }
        ]
      },
      {
        title: 'Water Leakage from Main Pipeline',
        description: 'Continuous drinking water leakage from the main pipeline. Thousands of liters of water are being wasted.',
        category: 'water_leakage',
        status: 'pending',
        priority: 'medium',
        location: {
          address: 'MG Road, near Exit A',
          area: 'MG Road',
          pincode: '560001',
          coordinates: { lat: 12.9754, lng: 77.6068 }
        },
        images: ['https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80'],
        reportedBy: demoUser._id,
        timeline: [{ status: 'pending', note: 'Leakage reported' }]
      },
      {
        title: 'Flickering Streetlights on Park Avenue',
        description: 'Multiple streetlights are flickering or completely dark, making the road unsafe for walking at night.',
        category: 'streetlight',
        status: 'resolved',
        priority: 'low',
        location: {
          address: 'Park Avenue Road',
          area: 'Jayanagar',
          pincode: '560041',
          coordinates: { lat: 12.9304, lng: 77.5838 }
        },
        images: ['https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80'],
        reportedBy: demoUser._id,
        timeline: [
          { status: 'pending', note: 'Issue logged' },
          { status: 'assigned', note: 'Assigned to BESCOM inspector' },
          { status: 'resolved', note: 'Bulbs replaced, wiring fixed' }
        ],
        resolvedAt: new Date(),
        resolutionNote: 'All flickering streetlights repaired successfully.'
      }
    ];

    await Issue.insertMany(sampleIssues);
    console.log('Sample issues seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
