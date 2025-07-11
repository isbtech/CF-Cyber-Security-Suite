const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { mockUsers, mockAchievements, mockGoals } = require('../data/mockData');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get user profile
router.get('/profile', (req, res) => {
  try {
    const user = req.user;
    const userAchievements = mockAchievements.filter(a => a.unlocked);
    
    res.json({
      success: true,
      data: {
        id: user.id,
        delegate_id: user.delegate_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        date_of_birth: user.date_of_birth,
        avatar: user.avatar,
        joined_date: user.joined_date,
        current_week: user.current_week,
        rank: user.rank,
        total_score: user.total_score,
        statistics: {
          days_prayed: 18,
          weeks_completed: 3,
          consistency_percentage: 94,
          notes_written: 18,
          achievements: userAchievements
        },
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch profile'
      }
    });
  }
});

// Update user profile
router.put('/profile', (req, res) => {
  try {
    const user = req.user;
    const { name, email, phone } = req.body;
    
    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email format'
        }
      });
    }
    
    // Update user data
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    user.updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      data: {
        id: user.id,
        delegate_id: user.delegate_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update profile'
      }
    });
  }
});

// Update user preferences
router.put('/preferences', (req, res) => {
  try {
    const user = req.user;
    const preferences = req.body;
    
    // Validate preferences
    const validPreferences = [
      'daily_reminder',
      'weekly_summary',
      'achievement_notifications',
      'reminder_time',
      'private_notes',
      'share_progress',
      'dark_mode',
      'auto_play_videos'
    ];
    
    const invalidKeys = Object.keys(preferences).filter(key => !validPreferences.includes(key));
    if (invalidKeys.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid preference keys: ${invalidKeys.join(', ')}`
        }
      });
    }
    
    // Update preferences
    user.preferences = { ...user.preferences, ...preferences };
    user.updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      data: {
        preferences: user.preferences,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update preferences'
      }
    });
  }
});

// Get user goals
router.get('/goals', (req, res) => {
  try {
    const userId = req.userId;
    const userGoals = mockGoals.filter(g => g.user_id === userId);
    
    const goalsWithPercentage = userGoals.map(goal => ({
      ...goal,
      percentage: Math.round((goal.current_progress / goal.target_progress) * 100)
    }));
    
    res.json({
      success: true,
      data: goalsWithPercentage
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch goals'
      }
    });
  }
});

// Get user statistics
router.get('/statistics', (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        total_score: user.total_score,
        rank: user.rank,
        days_prayed: 18,
        weeks_completed: 3,
        consistency_percentage: 94,
        notes_written: 18,
        current_streak: 7,
        longest_streak: 12,
        achievements_count: mockAchievements.filter(a => a.unlocked).length,
        weekly_progress: [
          {
            week: 1,
            completed: true,
            score: 95,
            days_completed: 7
          },
          {
            week: 2,
            completed: true,
            score: 88,
            days_completed: 7
          },
          {
            week: 3,
            completed: false,
            score: 85,
            days_completed: 5
          }
        ]
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch statistics'
      }
    });
  }
});

// Export user data
router.get('/export', (req, res) => {
  try {
    const user = req.user;
    const exportData = {
      user_profile: {
        id: user.id,
        delegate_id: user.delegate_id,
        name: user.name,
        email: user.email,
        joined_date: user.joined_date
      },
      statistics: {
        total_score: user.total_score,
        rank: user.rank,
        days_prayed: 18,
        weeks_completed: 3,
        consistency_percentage: 94
      },
      preferences: user.preferences,
      achievements: mockAchievements.filter(a => a.unlocked),
      goals: mockGoals.filter(g => g.user_id === user.id)
    };
    
    // In a real application, you would generate a file and store it temporarily
    const mockExportUrl = `https://cdn.propheticprayer.com/exports/user_${user.id}_export.json`;
    
    res.json({
      success: true,
      data: {
        export_url: mockExportUrl,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        export_data: exportData // Include data directly in mock
      }
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to export data'
      }
    });
  }
});

// Upload avatar
router.post('/avatar', upload.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Avatar image is required'
        }
      });
    }
    
    const user = req.user;
    const avatarUrl = `https://cdn.propheticprayer.com/avatars/${req.file.filename}`;
    
    // Update user avatar
    user.avatar = avatarUrl;
    user.updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      data: {
        avatar_url: avatarUrl,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to upload avatar'
      }
    });
  }
});

// Delete account (for demo purposes, just deactivate)
router.delete('/account', (req, res) => {
  try {
    const user = req.user;
    user.status = 'deactivated';
    user.updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to deactivate account'
      }
    });
  }
});

// Reset progress
router.post('/reset-progress', (req, res) => {
  try {
    const user = req.user;
    
    // Reset user progress
    user.total_score = 0;
    user.current_week = 1;
    user.rank = 999;
    user.updated_at = new Date().toISOString();
    
    // Reset achievements
    mockAchievements.forEach(achievement => {
      achievement.unlocked = false;
      achievement.unlocked_date = null;
    });
    
    // Reset goals
    mockGoals.forEach(goal => {
      if (goal.user_id === user.id) {
        goal.current_progress = 0;
      }
    });
    
    res.json({
      success: true,
      message: 'Progress reset successfully',
      data: {
        total_score: user.total_score,
        current_week: user.current_week,
        rank: user.rank
      }
    });
  } catch (error) {
    console.error('Reset progress error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to reset progress'
      }
    });
  }
});

module.exports = router;