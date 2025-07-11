const express = require('express');
const { 
  mockPrayerPoints, 
  mockUserProgress 
} = require('../data/mockData');

const router = express.Router();

// Get dashboard data
router.get('/', (req, res) => {
  try {
    const user = req.user;
    
    // Get user's prayer progress
    const userProgress = mockUserProgress.filter(p => p.user_id === user.id);
    const completedPrayers = userProgress.filter(p => p.completed);
    
    // Calculate statistics
    const daysCompleted = completedPrayers.length;
    const weeksCompleted = Math.floor(daysCompleted / 7);
    const consistencyPercentage = daysCompleted > 0 ? Math.round((daysCompleted / (user.current_week * 7)) * 100) : 0;
    const currentStreak = daysCompleted; // Simplified for demo
    
    // Get today's prayer (demo: use week 3, day 5)
    const todayPrayer = mockPrayerPoints.find(p => p.week === 3 && p.day === 5);
    const todayProgress = userProgress.find(p => p.prayer_id === todayPrayer?.id);
    
    // Calculate progress percentages
    const currentWeekProgress = Math.round((user.total_score / 100) * 100);
    const overallProgress = Math.round((user.total_score / 100) * 100);
    
    // Recent activity
    const recentActivity = [
      {
        type: 'prayer_completed',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'Completed Day 4 prayer'
      },
      {
        type: 'note_saved',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60 * 1000).toISOString(),
        description: 'Saved reflection note'
      },
      {
        type: 'achievement_unlocked',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Unlocked 7-Day Streak achievement'
      }
    ];
    
    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          current_week: user.current_week,
          total_score: user.total_score,
          rank: user.rank
        },
        statistics: {
          days_prayed: daysCompleted,
          weeks_completed: weeksCompleted,
          consistency_percentage: consistencyPercentage,
          current_streak: currentStreak
        },
        progress: {
          current_week_progress: currentWeekProgress,
          overall_progress: overallProgress
        },
        today_prayer: todayPrayer ? {
          week: todayPrayer.week,
          day: todayPrayer.day,
          title: todayPrayer.title,
          completed: todayProgress ? todayProgress.completed : false
        } : null,
        recent_activity: recentActivity
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch dashboard data'
      }
    });
  }
});

module.exports = router;