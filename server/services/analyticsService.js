const Complaint = require('../models/Complaint');
const User = require('../models/User');

/**
 * Generates advanced analytics and AI insights for the admin dashboard
 */
const getAdminInsights = async () => {
  const totalUsers = await User.countDocuments();
  const totalComplaints = await Complaint.countDocuments();
  const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
  
  // Daily trends for the last 14 days
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const dailyTrend = await Complaint.aggregate([
    { $match: { createdAt: { $gte: fourteenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  // Category distribution
  const categoryBreakdown = await Complaint.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Priority breakdown
  const priorityBreakdown = await Complaint.aggregate([
    { $group: { _id: "$urgency", count: { $sum: 1 } } }
  ]);

  // Resolution Rate
  const resolutionRate = totalComplaints > 0 
    ? Math.round((resolvedComplaints / totalComplaints) * 100) 
    : 0;

  // AI Hotspot Analysis (Geospatial Clustering)
  const hotspots = await Complaint.aggregate([
    { 
      $match: { 
        status: { $nin: ['resolved', 'rejected'] },
        'location.coordinates': { $exists: true, $type: 'array', $size: 2 }
      } 
    },
    {
      $group: {
        _id: {
          lat: { $round: [{ $arrayElemAt: ["$location.coordinates", 1] }, 3] }, // ~110m precision
          lng: { $round: [{ $arrayElemAt: ["$location.coordinates", 0] }, 3] }
        },
        count: { $sum: 1 },
        avgUrgency: { $avg: "$aiAnalysis.urgency_score" }
      }
    },
    { $match: { "_id.lat": { $ne: null }, "_id.lng": { $ne: null }, count: { $gt: 2 } } }, // Areas with 3+ issues
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // Predictive AI Insights (Simple heuristic for now)
  const insights = [];
  
  // Trend Insight
  const last3Days = dailyTrend.slice(-3);
  if (last3Days.length >= 2) {
    const growth = last3Days[last3Days.length - 1].count - last3Days[0].count;
    if (growth > 5) {
      insights.push({
        type: 'warning',
        message: `Issue volume increased by ${growth} in the last 72 hours. Consider increasing staff allocation.`,
        title: 'Spike Detected'
      });
    }
  }

  // Category Insight
  const topCategory = categoryBreakdown[0];
  if (topCategory && topCategory.count > totalComplaints * 0.4) {
    insights.push({
      type: 'info',
      message: `${topCategory._id} accounts for ${Math.round((topCategory.count/totalComplaints)*100)}% of all reports. Targeted maintenance recommended.`,
      title: 'Structural Concentration'
    });
  }

  // Hotspot Insight
  if (hotspots.length > 0) {
    insights.push({
      type: 'alert',
      message: `Critical clustering detected near ${hotspots[0]._id.lat}, ${hotspots[0]._id.lng}. Emergency dispatch may be needed.`,
      title: 'High Risk Hotspot'
    });
  }

  return {
    overview: {
      totalUsers,
      totalComplaints,
      resolvedComplaints,
      resolutionRate,
      activeIssues: totalComplaints - resolvedComplaints
    },
    dailyTrend,
    categoryBreakdown,
    priorityBreakdown,
    hotspots: hotspots.map(h => ({
      location: [h._id.lng, h._id.lat],
      count: h.count,
      riskLevel: h.avgUrgency > 7 ? 'Critical' : h.avgUrgency > 4 ? 'High' : 'Medium'
    })),
    aiInsights: insights
  };
};

module.exports = { getAdminInsights };
