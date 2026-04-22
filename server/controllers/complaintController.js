const Complaint = require('../models/Complaint');
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const aiService = require('../services/aiService');
const routingService = require('../services/routingService');
const apifyService = require('../services/apifyService');
const rewardService = require('../services/rewardService');
const analyticsService = require('../services/analyticsService');

exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, images, voiceUrl } = req.body;
    const userId = req.user.id;

    // 1. AI Analysis (Gemini)
    const aiAnalysis = await aiService.classifyComplaint(description);
    
    // 2. Fraud & Duplicate Check
    const fraudScore = await aiService.calculateFraudScore(Complaint, userId);
    const duplicate = await aiService.checkDuplicate(Complaint, description, location.coordinates);
    
    // 3. Authority Routing
    const routing = routingService.assignAuthority(aiAnalysis.category, aiAnalysis.priority);

    const complaint = new Complaint({
      user: userId,
      title,
      description,
      category: aiAnalysis.category || category,
      location,
      images,
      voiceUrl,
      urgency: aiAnalysis.priority,
      aiAnalysis,
      fraudScore,
      isDuplicate: !!duplicate,
      originalComplaint: duplicate ? duplicate.id : null,
      assignedDepartment: routing.department,
      assignedOfficer: routing.assignedTo
    });

    await complaint.save();

    // 4. Update User Stats & Rewards
    if (!complaint.isDuplicate) {
      // Increment count first so milestones trigger correctly
      await User.findByIdAndUpdate(userId, { $inc: { complaintsSubmitted: 1 } });
      
      await rewardService.awardPoints(userId, 'submit_complaint', complaint._id);
      if (images && images.length > 0) {
        await rewardService.awardPoints(userId, 'upload_images', complaint._id);
      }
    }

    // 5. Trigger Async Discovery (Nearby Services)
    apifyService.discoverNearbyServices(
      complaint.category, 
      location.coordinates[1], 
      location.coordinates[0], 
      ServiceProvider
    ).catch(err => console.error("Async Discovery Error:", err));

    res.status(201).json(complaint);
  } catch (error) {
    console.error("Create Complaint Error:", error);
    res.status(500).json({ message: "Failed to submit complaint" });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const { category, status, urgency, area, limit = 20 } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (area) query['location.area'] = new RegExp(area, 'i');

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('user', 'name reputationScore isVerifiedReporter');

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name reputationScore tier')
      .populate('originalComplaint', 'title status');

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Fetch nearby discovered services for this category
    const nearbyServices = await ServiceProvider.find({
      category: complaint.category,
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: complaint.location.coordinates },
          $maxDistance: 3000
        }
      }
    }).limit(3);

    res.json({ complaint, nearbyServices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.voteComplaint = async (req, res) => {
  try {
    const { type } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.id;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: "Not found" });

    // Remove existing votes from this user
    complaint.upvotes = complaint.upvotes.filter(id => id.toString() !== userId);
    complaint.downvotes = complaint.downvotes.filter(id => id.toString() !== userId);

    if (type === 'upvote') {
      complaint.upvotes.push(userId);
    } else if (type === 'downvote') {
      complaint.downvotes.push(userId);
    }

    complaint.voteScore = complaint.upvotes.length - complaint.downvotes.length;
    await complaint.save();

    res.json({ score: complaint.voteScore, upvotes: complaint.upvotes.length, downvotes: complaint.downvotes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Controllers
exports.updateStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: "Not found" });

    complaint.status = status;
    complaint.statusHistory.push({ status, comment });
    complaint.updatedAt = Date.now();

    await complaint.save();

    // Reward user if resolved
    if (status === 'resolved') {
      await rewardService.awardPoints(complaint.user, 'complaint_resolved', complaint._id);
      await User.findByIdAndUpdate(complaint.user, { $inc: { complaintsResolved: 1 } });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const stats = await analyticsService.getAdminInsights();
    res.json(stats);
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};
