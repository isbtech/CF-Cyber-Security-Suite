const express = require('express');
const { mockNotifications, addNotification } = require('../data/mockData');

const router = express.Router();

// Get notifications
router.get('/', (req, res) => {
  try {
    const userId = req.userId;
    const { type, limit = 20, offset = 0 } = req.query;
    
    // Filter notifications for the user
    let userNotifications = mockNotifications.filter(n => n.user_id === userId);
    
    // Filter by type if specified
    if (type && type !== 'all') {
      userNotifications = userNotifications.filter(n => n.type === type);
    }
    
    // Sort by date (most recent first)
    userNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Calculate unread count
    const unreadCount = userNotifications.filter(n => !n.read).length;
    
    // Apply pagination
    const paginatedNotifications = userNotifications.slice(offset, offset + limit);
    
    res.json({
      success: true,
      data: {
        unread_count: unreadCount,
        notifications: paginatedNotifications
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch notifications'
      }
    });
  }
});

// Mark notification as read
router.put('/:notificationId/read', (req, res) => {
  try {
    const userId = req.userId;
    const notificationId = parseInt(req.params.notificationId);
    
    // Find notification
    const notification = mockNotifications.find(n => 
      n.id === notificationId && n.user_id === userId
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }
    
    // Mark as read
    notification.read = true;
    
    res.json({
      success: true,
      data: {
        id: notification.id,
        read: notification.read
      }
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to mark notification as read'
      }
    });
  }
});

// Mark all notifications as read
router.put('/read-all', (req, res) => {
  try {
    const userId = req.userId;
    
    // Mark all user notifications as read
    let updatedCount = 0;
    mockNotifications.forEach(notification => {
      if (notification.user_id === userId && !notification.read) {
        notification.read = true;
        updatedCount++;
      }
    });
    
    res.json({
      success: true,
      data: {
        updated_count: updatedCount,
        message: `${updatedCount} notifications marked as read`
      }
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to mark all notifications as read'
      }
    });
  }
});

// Delete notification
router.delete('/:notificationId', (req, res) => {
  try {
    const userId = req.userId;
    const notificationId = parseInt(req.params.notificationId);
    
    // Find notification index
    const notificationIndex = mockNotifications.findIndex(n => 
      n.id === notificationId && n.user_id === userId
    );
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }
    
    // Remove notification
    mockNotifications.splice(notificationIndex, 1);
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete notification'
      }
    });
  }
});

// Get notification stats
router.get('/stats', (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user notifications
    const userNotifications = mockNotifications.filter(n => n.user_id === userId);
    
    // Calculate stats
    const totalCount = userNotifications.length;
    const unreadCount = userNotifications.filter(n => !n.read).length;
    const typeStats = {};
    
    userNotifications.forEach(notification => {
      typeStats[notification.type] = (typeStats[notification.type] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: {
        total_count: totalCount,
        unread_count: unreadCount,
        read_count: totalCount - unreadCount,
        type_breakdown: typeStats
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch notification stats'
      }
    });
  }
});

// Create notification (for testing purposes)
router.post('/', (req, res) => {
  try {
    const userId = req.userId;
    const { type, title, message, icon, action_url } = req.body;
    
    // Validate input
    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Type, title, and message are required'
        }
      });
    }
    
    // Create notification
    const notificationData = {
      user_id: userId,
      type: type,
      title: title,
      message: message,
      icon: icon || '📱',
      read: false,
      action_url: action_url || null
    };
    
    const newNotification = addNotification(notificationData);
    
    // Send via WebSocket if available
    if (global.wsSendToUser) {
      global.wsSendToUser(userId, {
        type: 'notification',
        data: newNotification
      });
    }
    
    res.json({
      success: true,
      data: newNotification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create notification'
      }
    });
  }
});

// Clear all notifications
router.delete('/clear-all', (req, res) => {
  try {
    const userId = req.userId;
    
    // Remove all user notifications
    let removedCount = 0;
    for (let i = mockNotifications.length - 1; i >= 0; i--) {
      if (mockNotifications[i].user_id === userId) {
        mockNotifications.splice(i, 1);
        removedCount++;
      }
    }
    
    res.json({
      success: true,
      data: {
        removed_count: removedCount,
        message: `${removedCount} notifications cleared`
      }
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to clear all notifications'
      }
    });
  }
});

module.exports = router;