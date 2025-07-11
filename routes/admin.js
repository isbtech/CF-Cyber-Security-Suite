const express = require('express');
const { adminMiddleware } = require('../middleware/auth');
const { 
  mockUsers, 
  mockAdminStats, 
  mockPrayerPoints, 
  mockNotifications,
  addNotification
} = require('../data/mockData');

const router = express.Router();

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Get admin dashboard
router.get('/dashboard', (req, res) => {
  try {
    // Calculate real-time stats
    const activeUsers = mockUsers.filter(u => u.status === 'active').length;
    const totalUsers = mockUsers.length;
    const newUsersToday = mockUsers.filter(u => {
      const today = new Date().toISOString().split('T')[0];
      return u.created_at.startsWith(today);
    }).length;
    
    // Get top users
    const topUsers = mockUsers
      .filter(u => u.status === 'active')
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 10)
      .map(user => ({
        id: user.id,
        name: user.name,
        delegate_id: user.delegate_id,
        score: user.total_score,
        streak: 7, // Mock streak
        screen_time: Math.floor(Math.random() * 60) + 10 // Mock screen time
      }));
    
    const dashboardData = {
      statistics: {
        active_users: activeUsers,
        average_engagement: mockAdminStats.average_engagement,
        daily_screen_time: mockAdminStats.daily_screen_time,
        daily_prayers: mockAdminStats.daily_prayers,
        total_users: totalUsers,
        weekly_retention: mockAdminStats.weekly_retention
      },
      recent_activity: [
        {
          type: 'new_user',
          count: newUsersToday,
          date: new Date().toISOString().split('T')[0] + 'T00:00:00Z'
        },
        {
          type: 'prayers_completed',
          count: mockAdminStats.daily_prayers,
          date: new Date().toISOString().split('T')[0] + 'T00:00:00Z'
        }
      ],
      top_users: topUsers
    };
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch admin dashboard'
      }
    });
  }
});

// Get user analytics
router.get('/users/analytics', (req, res) => {
  try {
    const totalUsers = mockUsers.length;
    const activeUsers = mockUsers.filter(u => u.status === 'active').length;
    const newUsersThisWeek = mockUsers.filter(u => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(u.created_at) >= weekAgo;
    }).length;
    
    const analyticsData = {
      total_users: totalUsers,
      active_users_today: activeUsers,
      new_users_this_week: newUsersThisWeek,
      retention_rates: mockAdminStats.retention_rates,
      engagement_metrics: mockAdminStats.engagement_metrics
    };
    
    res.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user analytics'
      }
    });
  }
});

// Send bulk notification
router.post('/notifications/send', (req, res) => {
  try {
    const { title, message, type, target_users = 'all', schedule_at } = req.body;
    
    // Validate input
    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title, message, and type are required'
        }
      });
    }
    
    // Determine target users
    let targetUserIds = [];
    if (target_users === 'all') {
      targetUserIds = mockUsers.map(u => u.id);
    } else if (target_users === 'active') {
      targetUserIds = mockUsers.filter(u => u.status === 'active').map(u => u.id);
    } else if (Array.isArray(target_users)) {
      targetUserIds = target_users;
    }
    
    // Create notifications for each user
    const notifications = [];
    targetUserIds.forEach(userId => {
      const notificationData = {
        user_id: userId,
        type: type,
        title: title,
        message: message,
        icon: '📢',
        read: false,
        action_url: null
      };
      
      const notification = addNotification(notificationData);
      notifications.push(notification);
      
      // Send via WebSocket if available
      if (global.wsSendToUser) {
        global.wsSendToUser(userId, {
          type: 'notification',
          data: notification
        });
      }
    });
    
    res.json({
      success: true,
      data: {
        notifications_sent: notifications.length,
        target_users: targetUserIds.length,
        message: `Notification sent to ${targetUserIds.length} users`
      }
    });
  } catch (error) {
    console.error('Send bulk notification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to send bulk notification'
      }
    });
  }
});

// Get prayer content
router.get('/content/prayers', (req, res) => {
  try {
    const { week, published } = req.query;
    
    let prayers = [...mockPrayerPoints];
    
    // Filter by week if specified
    if (week) {
      prayers = prayers.filter(p => p.week === parseInt(week));
    }
    
    // Filter by published status if specified
    if (published !== undefined) {
      prayers = prayers.filter(p => p.published === (published === 'true'));
    }
    
    // Sort by week and day
    prayers.sort((a, b) => {
      if (a.week !== b.week) return a.week - b.week;
      return a.day - b.day;
    });
    
    res.json({
      success: true,
      data: prayers
    });
  } catch (error) {
    console.error('Get prayer content error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch prayer content'
      }
    });
  }
});

// Update prayer content
router.put('/content/prayers/:prayerId', (req, res) => {
  try {
    const prayerId = parseInt(req.params.prayerId);
    const { title, content, video_url, published } = req.body;
    
    // Find prayer point
    const prayer = mockPrayerPoints.find(p => p.id === prayerId);
    if (!prayer) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Prayer point not found'
        }
      });
    }
    
    // Update prayer data
    if (title) prayer.title = title;
    if (content) prayer.content = content;
    if (video_url) prayer.video_url = video_url;
    if (published !== undefined) prayer.published = published;
    prayer.updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      data: prayer
    });
  } catch (error) {
    console.error('Update prayer content error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update prayer content'
      }
    });
  }
});

// Create new prayer content
router.post('/content/prayers', (req, res) => {
  try {
    const { week, day, title, content, video_url, published = false } = req.body;
    
    // Validate input
    if (!week || !day || !title || !content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Week, day, title, and content are required'
        }
      });
    }
    
    // Check if prayer point already exists
    const existingPrayer = mockPrayerPoints.find(p => p.week === week && p.day === day);
    if (existingPrayer) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: `Prayer point for Week ${week}, Day ${day} already exists`
        }
      });
    }
    
    // Create new prayer point
    const newPrayerId = Math.max(...mockPrayerPoints.map(p => p.id)) + 1;
    const newPrayer = {
      id: newPrayerId,
      week: week,
      day: day,
      title: title,
      content: content,
      video_url: video_url || null,
      video_thumbnail: video_url ? video_url.replace('.mp4', '.jpg') : null,
      video_duration: 180, // Default duration
      published: published,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockPrayerPoints.push(newPrayer);
    
    res.json({
      success: true,
      data: newPrayer
    });
  } catch (error) {
    console.error('Create prayer content error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create prayer content'
      }
    });
  }
});

// Get user list
router.get('/users', (req, res) => {
  try {
    const { status, limit = 50, offset = 0, sort = 'created_at' } = req.query;
    
    let users = [...mockUsers];
    
    // Filter by status if specified
    if (status) {
      users = users.filter(u => u.status === status);
    }
    
    // Sort users
    users.sort((a, b) => {
      switch (sort) {
        case 'score':
          return b.total_score - a.total_score;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created_at':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
    
    // Apply pagination
    const paginatedUsers = users.slice(offset, offset + limit);
    
    // Map to admin view
    const userList = paginatedUsers.map(user => ({
      id: user.id,
      delegate_id: user.delegate_id,
      name: user.name,
      email: user.email,
      total_score: user.total_score,
      rank: user.rank,
      status: user.status,
      joined_date: user.joined_date,
      last_active: user.last_active,
      current_week: user.current_week
    }));
    
    res.json({
      success: true,
      data: {
        users: userList,
        total_count: users.length,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_next: offset + limit < users.length
        }
      }
    });
  } catch (error) {
    console.error('Get user list error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user list'
      }
    });
  }
});

// Update user status
router.put('/users/:userId/status', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { status } = req.body;
    
    // Validate status
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status must be active, inactive, or suspended'
        }
      });
    }
    
    // Find user
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    // Update status
    user.status = status;
    user.updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        status: user.status,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update user status'
      }
    });
  }
});

// Get system stats
router.get('/stats', (req, res) => {
  try {
    const stats = {
      users: {
        total: mockUsers.length,
        active: mockUsers.filter(u => u.status === 'active').length,
        inactive: mockUsers.filter(u => u.status === 'inactive').length,
        suspended: mockUsers.filter(u => u.status === 'suspended').length
      },
      content: {
        total_prayer_points: mockPrayerPoints.length,
        published_prayers: mockPrayerPoints.filter(p => p.published).length,
        draft_prayers: mockPrayerPoints.filter(p => !p.published).length
      },
      notifications: {
        total_sent: mockNotifications.length,
        unread: mockNotifications.filter(n => !n.read).length
      },
      engagement: mockAdminStats.engagement_metrics
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch system stats'
      }
    });
  }
});

module.exports = router;