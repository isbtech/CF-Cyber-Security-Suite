const express = require('express');
const { mockAppSettings } = require('../data/mockData');

const router = express.Router();

// Get app settings
router.get('/app', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAppSettings
    });
  } catch (error) {
    console.error('Get app settings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch app settings'
      }
    });
  }
});

// Update app settings (admin only)
router.put('/app', (req, res) => {
  try {
    const user = req.user;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        }
      });
    }
    
    const updates = req.body;
    
    // Validate updates
    const allowedFields = [
      'maintenance_mode',
      'features',
      'content_schedule'
    ];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key === 'features' && typeof updates[key] === 'object') {
          mockAppSettings.features = { ...mockAppSettings.features, ...updates[key] };
        } else if (key === 'content_schedule' && typeof updates[key] === 'object') {
          mockAppSettings.content_schedule = { ...mockAppSettings.content_schedule, ...updates[key] };
        } else {
          mockAppSettings[key] = updates[key];
        }
      }
    });
    
    res.json({
      success: true,
      data: mockAppSettings
    });
  } catch (error) {
    console.error('Update app settings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update app settings'
      }
    });
  }
});

// Check for app updates
router.get('/app/version', (req, res) => {
  try {
    const currentVersion = mockAppSettings.current_version;
    const minimumVersion = mockAppSettings.minimum_version;
    
    res.json({
      success: true,
      data: {
        current_version: currentVersion,
        minimum_version: minimumVersion,
        update_available: false, // For demo purposes
        update_required: false,
        release_notes: "Bug fixes and performance improvements"
      }
    });
  } catch (error) {
    console.error('Get app version error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch app version'
      }
    });
  }
});

// Get feature flags
router.get('/features', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAppSettings.features
    });
  } catch (error) {
    console.error('Get features error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch features'
      }
    });
  }
});

// Update feature flags (admin only)
router.put('/features', (req, res) => {
  try {
    const user = req.user;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        }
      });
    }
    
    const features = req.body;
    
    // Validate feature flags
    const validFeatures = [
      'community_enabled',
      'video_content_enabled',
      'push_notifications_enabled',
      'admin_dashboard_enabled'
    ];
    
    Object.keys(features).forEach(feature => {
      if (validFeatures.includes(feature)) {
        mockAppSettings.features[feature] = Boolean(features[feature]);
      }
    });
    
    res.json({
      success: true,
      data: mockAppSettings.features
    });
  } catch (error) {
    console.error('Update features error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update features'
      }
    });
  }
});

// Get content schedule
router.get('/content-schedule', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAppSettings.content_schedule
    });
  } catch (error) {
    console.error('Get content schedule error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch content schedule'
      }
    });
  }
});

// Update content schedule (admin only)
router.put('/content-schedule', (req, res) => {
  try {
    const user = req.user;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        }
      });
    }
    
    const schedule = req.body;
    
    // Validate schedule
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (schedule.new_content_day && !validDays.includes(schedule.new_content_day.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid day of week'
        }
      });
    }
    
    if (schedule.new_content_time && !timeRegex.test(schedule.new_content_time)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid time format (HH:MM)'
        }
      });
    }
    
    // Update schedule
    if (schedule.new_content_day) {
      mockAppSettings.content_schedule.new_content_day = schedule.new_content_day.toLowerCase();
    }
    
    if (schedule.new_content_time) {
      mockAppSettings.content_schedule.new_content_time = schedule.new_content_time;
    }
    
    res.json({
      success: true,
      data: mockAppSettings.content_schedule
    });
  } catch (error) {
    console.error('Update content schedule error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update content schedule'
      }
    });
  }
});

// Get maintenance mode status
router.get('/maintenance', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        maintenance_mode: mockAppSettings.maintenance_mode,
        message: mockAppSettings.maintenance_mode ? 
          'The app is currently under maintenance. Please try again later.' : 
          null
      }
    });
  } catch (error) {
    console.error('Get maintenance status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch maintenance status'
      }
    });
  }
});

// Toggle maintenance mode (admin only)
router.put('/maintenance', (req, res) => {
  try {
    const user = req.user;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        }
      });
    }
    
    const { maintenance_mode } = req.body;
    
    if (typeof maintenance_mode !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'maintenance_mode must be a boolean'
        }
      });
    }
    
    mockAppSettings.maintenance_mode = maintenance_mode;
    
    res.json({
      success: true,
      data: {
        maintenance_mode: mockAppSettings.maintenance_mode,
        message: maintenance_mode ? 
          'Maintenance mode enabled' : 
          'Maintenance mode disabled'
      }
    });
  } catch (error) {
    console.error('Toggle maintenance mode error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to toggle maintenance mode'
      }
    });
  }
});

module.exports = router;