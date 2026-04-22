const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  
  // Advanced Map Location
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: String,
    area: String
  },
  
  images: [String],
  voiceUrl: String,
  
  status: { 
    type: String, 
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'rejected', 'duplicate'], 
    default: 'pending' 
  },
  
  urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  
  // AI Analysis Results
  aiAnalysis: {
    sentiment: String,
    keywords: [String],
    confidence: Number,
    summary: String,
    urgency_score: Number,
    source: String // 'gemini' or 'fallback'
  },
  
  // Fraud & Security
  fraudScore: { type: Number, default: 0 },
  isDuplicate: { type: Boolean, default: false },
  originalComplaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  
  // Routing Info
  assignedDepartment: String,
  assignedOfficer: String,
  
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  voteScore: { type: Number, default: 0 },
  
  statusHistory: [{
    status: String,
    comment: String,
    updatedAt: { type: Date, default: Date.now }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

complaintSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Complaint', complaintSchema);
