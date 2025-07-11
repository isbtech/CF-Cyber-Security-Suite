const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { mockUsers } = require('../data/mockData');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-here';

// Mock OTP verification (in real app, this would be validated against SMS/email service)
const validateOTP = (otp) => {
  // For demo purposes, accept any 6-digit OTP
  return otp && otp.length === 6 && /^\d+$/.test(otp);
};

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { delegate_id, otp, date_of_birth } = req.body;

    // Validate required fields
    if (!delegate_id || !otp || !date_of_birth) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Delegate ID, OTP, and date of birth are required',
          details: [
            !delegate_id && { field: 'delegate_id', message: 'Delegate ID is required' },
            !otp && { field: 'otp', message: 'OTP is required' },
            !date_of_birth && { field: 'date_of_birth', message: 'Date of birth is required' }
          ].filter(Boolean)
        }
      });
    }

    // Validate OTP format
    if (!validateOTP(otp)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid OTP format',
          details: [
            { field: 'otp', message: 'OTP must be 6 digits' }
          ]
        }
      });
    }

    // Find user by delegate_id
    const user = mockUsers.find(u => u.delegate_id === delegate_id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid delegate ID'
        }
      });
    }

    // Verify date of birth
    if (user.date_of_birth !== date_of_birth) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid date of birth'
        }
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Account is not active'
        }
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, delegate_id: user.delegate_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, delegate_id: user.delegate_id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Update user's last active time
    user.last_active = new Date().toISOString();

    // Send response
    res.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          delegate_id: user.delegate_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          joined_date: user.joined_date,
          current_week: user.current_week,
          rank: user.rank,
          total_score: user.total_score
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Login failed'
      }
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required'
        }
      });
    }

    try {
      const decoded = jwt.verify(refresh_token, JWT_REFRESH_SECRET);
      
      // Find user
      const user = mockUsers.find(u => u.id === decoded.userId);
      
      if (!user || user.status !== 'active') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid refresh token'
          }
        });
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { userId: user.id, delegate_id: user.delegate_id },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Generate new refresh token
      const newRefreshToken = jwt.sign(
        { userId: user.id, delegate_id: user.delegate_id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken
        }
      });

    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token'
        }
      });
    }

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Token refresh failed'
      }
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    // In a real app, you would invalidate the refresh token in the database
    // For this mock API, we'll just return success
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Logout failed'
      }
    });
  }
});

// Validate token endpoint (for debugging)
router.get('/validate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token is required'
        }
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = mockUsers.find(u => u.id === decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not found'
          }
        });
      }

      res.json({
        success: true,
        data: {
          valid: true,
          user: {
            id: user.id,
            delegate_id: user.delegate_id,
            name: user.name,
            email: user.email
          },
          expires_at: new Date(decoded.exp * 1000).toISOString()
        }
      });

    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token'
        }
      });
    }

  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Token validation failed'
      }
    });
  }
});

module.exports = router;