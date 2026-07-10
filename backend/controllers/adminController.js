// backend/controllers/adminController.js
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Layout from '../models/Layout.js';

/**
 * @route   GET /api/v1/admin/metrics
 * @desc    Aggregates global platform health metrics and financial telemetry.
 * @access  Private (Admin Only)
 */
export const getSystemMetrics = asyncHandler(async (req, res) => {
  const [
    totalUsers, 
    totalEvents, 
    totalLayouts, 
    events
  ] = await Promise.all([
    User.countDocuments(),
    Event.countDocuments(),
    Layout.countDocuments(),
    Event.find().select('budget.total budget.spent guestCount')
  ]);

  const totalBudget = events.reduce((sum, e) => sum + (e.budget?.total || 0), 0);
  const totalSpent = events.reduce((sum, e) => sum + (e.budget?.spent || 0), 0);
  
  // Calculate deviation (Spent / Total) safely
  const budgetDeviation = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;

  res.status(200).json({
    success: true,
    data: {
      users: totalUsers,
      events: totalEvents,
      layouts: totalLayouts,
      financials: {
        totalBudget,
        totalSpent,
        deviationIndex: `${budgetDeviation}%`
      }
    }
  });
});