const express = require('express');
const { 
  mockPrayerPoints, 
  mockUserProgress, 
  addUserProgress, 
  addNotification 
} = require('../data/mockData');

const router = express.Router();

// Get current week prayer points
router.get('/current', (req, res) => {
  try {
    const user = req.user;
    const currentWeek = user.current_week;
    
    // Get prayer points for current week
    const weekPrayers = mockPrayerPoints.filter(p => p.week === currentWeek);
    
    // Get user progress for current week
    const userProgress = mockUserProgress.filter(p => 
      p.user_id === user.id && p.week === currentWeek
    );
    
    // Find current day (for demo, use day 5)
    const currentDay = 5;
    
    // Map prayer points with user progress
    const prayerPointsWithProgress = weekPrayers.map(prayer => {
      const progress = userProgress.find(p => p.prayer_id === prayer.id);
      return {
        ...prayer,
        completed: progress ? progress.completed : false,
        user_note: progress ? progress.note : '',
        prayed_at: progress ? progress.prayed_at : null
      };
    });
    
    res.json({
      success: true,
      data: {
        week: currentWeek,
        title: `Week ${currentWeek} - Prayer Points`,
        current_day: currentDay,
        total_days: 7,
        unlocked: true,
        prayer_points: prayerPointsWithProgress.filter(p => p.day === currentDay)
      }
    });
  } catch (error) {
    console.error('Get current prayer error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch current prayer'
      }
    });
  }
});

// Get prayer point by week and day
router.get('/week/:week/day/:day', (req, res) => {
  try {
    const user = req.user;
    const week = parseInt(req.params.week);
    const day = parseInt(req.params.day);
    
    // Validate parameters
    if (isNaN(week) || isNaN(day) || week < 1 || day < 1 || day > 7) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid week or day parameter'
        }
      });
    }
    
    // Check if user has access to this week
    if (week > user.current_week) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Week not yet unlocked'
        }
      });
    }
    
    // Find prayer point
    const prayerPoint = mockPrayerPoints.find(p => p.week === week && p.day === day);
    
    if (!prayerPoint) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Prayer point not found'
        }
      });
    }
    
    // Get user progress
    const progress = mockUserProgress.find(p => 
      p.user_id === user.id && p.prayer_id === prayerPoint.id
    );
    
    const response = {
      ...prayerPoint,
      completed: progress ? progress.completed : false,
      user_note: progress ? progress.note : '',
      prayed_at: progress ? progress.prayed_at : null
    };
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Get prayer point error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch prayer point'
      }
    });
  }
});

// Mark prayer as completed
router.post('/complete', (req, res) => {
  try {
    const user = req.user;
    const { week, day, note } = req.body;
    
    // Validate required fields
    if (!week || !day) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Week and day are required'
        }
      });
    }
    
    // Find prayer point
    const prayerPoint = mockPrayerPoints.find(p => p.week === week && p.day === day);
    
    if (!prayerPoint) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Prayer point not found'
        }
      });
    }
    
    // Check if already completed
    const existingProgress = mockUserProgress.find(p => 
      p.user_id === user.id && p.prayer_id === prayerPoint.id
    );
    
    if (existingProgress && existingProgress.completed) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Prayer already completed'
        }
      });
    }
    
    // Award points
    const scoreAwarded = 5;
    const newTotalScore = user.total_score + scoreAwarded;
    
    // Update user score
    user.total_score = newTotalScore;
    user.updated_at = new Date().toISOString();
    
    // Add progress record
    const progressData = {
      user_id: user.id,
      week: week,
      day: day,
      prayer_id: prayerPoint.id,
      completed: true,
      note: note || '',
      score_awarded: scoreAwarded,
      prayed_at: new Date().toISOString()
    };
    
    const newProgress = addUserProgress(progressData);
    
    // Add achievement notification
    addNotification({
      user_id: user.id,
      type: 'achievement',
      title: 'Prayer Completed! 🙏',
      message: `You earned ${scoreAwarded} points for completing today's prayer`,
      icon: '🎉'
    });
    
    // Check for streaks and achievements
    const userPrayerCount = mockUserProgress.filter(p => 
      p.user_id === user.id && p.completed
    ).length + 1;
    
    let achievementsUnlocked = [];
    
    // Check for 7-day streak achievement
    if (userPrayerCount === 7) {
      achievementsUnlocked.push({
        id: 1,
        name: '7-Day Streak',
        icon: '🔥'
      });
    }
    
    // Broadcast to WebSocket if available
    if (global.wsSendToUser) {
      global.wsSendToUser(user.id, {
        type: 'prayer_completed',
        data: {
          week: week,
          day: day,
          score_awarded: scoreAwarded,
          new_total_score: newTotalScore
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        score_awarded: scoreAwarded,
        new_total_score: newTotalScore,
        streak_updated: true,
        current_streak: userPrayerCount,
        achievements_unlocked: achievementsUnlocked
      }
    });
  } catch (error) {
    console.error('Complete prayer error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to complete prayer'
      }
    });
  }
});

// Save prayer note
router.post('/note', (req, res) => {
  try {
    const user = req.user;
    const { week, day, note } = req.body;
    
    // Validate required fields
    if (!week || !day || !note) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Week, day, and note are required'
        }
      });
    }
    
    // Find prayer point
    const prayerPoint = mockPrayerPoints.find(p => p.week === week && p.day === day);
    
    if (!prayerPoint) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Prayer point not found'
        }
      });
    }
    
    // Find existing progress or create new
    let progress = mockUserProgress.find(p => 
      p.user_id === user.id && p.prayer_id === prayerPoint.id
    );
    
    if (progress) {
      // Update existing note
      progress.note = note;
    } else {
      // Create new progress record
      const progressData = {
        user_id: user.id,
        week: week,
        day: day,
        prayer_id: prayerPoint.id,
        completed: false,
        note: note,
        score_awarded: 0,
        prayed_at: null
      };
      
      progress = addUserProgress(progressData);
    }
    
    res.json({
      success: true,
      data: {
        note: progress.note,
        saved_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Save note error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to save note'
      }
    });
  }
});

// Get prayer history
router.get('/history', (req, res) => {
  try {
    const user = req.user;
    const { week, limit = 20, offset = 0 } = req.query;
    
    // Get user's prayer progress
    let userProgress = mockUserProgress.filter(p => p.user_id === user.id);
    
    // Filter by week if specified
    if (week) {
      userProgress = userProgress.filter(p => p.week === parseInt(week));
    }
    
    // Sort by date (most recent first)
    userProgress.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Apply pagination
    const total = userProgress.length;
    const paginatedProgress = userProgress.slice(offset, offset + limit);
    
    // Map to response format with prayer details
    const prayers = paginatedProgress.map(progress => {
      const prayerPoint = mockPrayerPoints.find(p => p.id === progress.prayer_id);
      return {
        week: progress.week,
        day: progress.day,
        title: prayerPoint ? prayerPoint.title : 'Unknown Prayer',
        content: prayerPoint ? prayerPoint.content : '',
        date: new Date(progress.created_at).toISOString().split('T')[0] + 'T00:00:00Z',
        completed: progress.completed,
        user_note: progress.note,
        prayed_at: progress.prayed_at
      };
    });
    
    res.json({
      success: true,
      data: {
        total_count: total,
        prayers: prayers
      }
    });
  } catch (error) {
    console.error('Get prayer history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch prayer history'
      }
    });
  }
});

// Get all available weeks
router.get('/weeks', (req, res) => {
  try {
    const user = req.user;
    const currentWeek = user.current_week;
    
    // Generate weeks data
    const weeks = [];
    for (let i = 1; i <= 4; i++) {
      const weekPrayers = mockPrayerPoints.filter(p => p.week === i);
      const userProgress = mockUserProgress.filter(p => 
        p.user_id === user.id && p.week === i
      );
      
      const completedCount = userProgress.filter(p => p.completed).length;
      const totalCount = weekPrayers.length;
      
      weeks.push({
        week: i,
        title: `Week ${i}`,
        unlocked: i <= currentWeek,
        completed: completedCount === totalCount && totalCount > 0,
        progress: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        days_completed: completedCount,
        total_days: totalCount
      });
    }
    
    res.json({
      success: true,
      data: weeks
    });
  } catch (error) {
    console.error('Get weeks error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch weeks'
      }
    });
  }
});

// Get week details
router.get('/week/:week', (req, res) => {
  try {
    const user = req.user;
    const week = parseInt(req.params.week);
    
    if (isNaN(week) || week < 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid week parameter'
        }
      });
    }
    
    // Check if user has access to this week
    if (week > user.current_week) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Week not yet unlocked'
        }
      });
    }
    
    // Get prayer points for the week
    const weekPrayers = mockPrayerPoints.filter(p => p.week === week);
    
    // Get user progress for the week
    const userProgress = mockUserProgress.filter(p => 
      p.user_id === user.id && p.week === week
    );
    
    // Map prayer points with user progress
    const prayerPointsWithProgress = weekPrayers.map(prayer => {
      const progress = userProgress.find(p => p.prayer_id === prayer.id);
      return {
        ...prayer,
        completed: progress ? progress.completed : false,
        user_note: progress ? progress.note : '',
        prayed_at: progress ? progress.prayed_at : null
      };
    });
    
    const completedCount = userProgress.filter(p => p.completed).length;
    
    res.json({
      success: true,
      data: {
        week: week,
        title: `Week ${week} - Prayer Points`,
        unlocked: true,
        completed: completedCount === weekPrayers.length && weekPrayers.length > 0,
        progress: weekPrayers.length > 0 ? Math.round((completedCount / weekPrayers.length) * 100) : 0,
        days_completed: completedCount,
        total_days: weekPrayers.length,
        prayer_points: prayerPointsWithProgress.sort((a, b) => a.day - b.day)
      }
    });
  } catch (error) {
    console.error('Get week details error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch week details'
      }
    });
  }
});

module.exports = router;