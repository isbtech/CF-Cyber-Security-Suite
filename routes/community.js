const express = require('express');
const { 
  mockPrayerGroups, 
  mockGroupMessages, 
  mockPrayerRequests, 
  mockUsers,
  addGroupMessage,
  addPrayerRequest
} = require('../data/mockData');

const router = express.Router();

// Get user's prayer groups
router.get('/groups', (req, res) => {
  try {
    const userId = req.userId;
    
    // Filter groups where user is a member
    const userGroups = mockPrayerGroups.filter(group => 
      group.members.includes(userId)
    );
    
    // Add unread message count and user role
    const groupsWithDetails = userGroups.map(group => {
      const groupMessages = mockGroupMessages.filter(m => m.group_id === group.id);
      const unreadCount = groupMessages.filter(m => !m.read_by.includes(userId)).length;
      const userRole = group.created_by === userId ? 'admin' : 'member';
      
      return {
        id: group.id,
        name: group.name,
        description: group.description,
        icon: group.icon,
        members_count: group.members_count,
        privacy: group.privacy,
        role: userRole,
        created_at: group.created_at,
        last_activity: group.updated_at,
        unread_messages: unreadCount
      };
    });
    
    res.json({
      success: true,
      data: groupsWithDetails
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch groups'
      }
    });
  }
});

// Get group messages
router.get('/groups/:groupId/messages', (req, res) => {
  try {
    const userId = req.userId;
    const groupId = parseInt(req.params.groupId);
    const { limit = 50, offset = 0 } = req.query;
    
    // Validate group access
    const group = mockPrayerGroups.find(g => g.id === groupId);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied to this group'
        }
      });
    }
    
    // Get messages for the group
    let messages = mockGroupMessages.filter(m => m.group_id === groupId);
    
    // Sort by date (most recent first)
    messages.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
    
    // Apply pagination
    const paginatedMessages = messages.slice(offset, offset + limit);
    
    // Map messages with sender details
    const messagesWithSenders = paginatedMessages.map(message => {
      const sender = mockUsers.find(u => u.id === message.sender_id);
      return {
        id: message.id,
        sender: {
          id: sender?.id || message.sender_id,
          name: sender?.name || 'Unknown User',
          avatar: sender?.avatar || null
        },
        content: message.content,
        type: message.type,
        sent_at: message.sent_at,
        read: message.read_by.includes(userId)
      };
    });
    
    res.json({
      success: true,
      data: {
        group: {
          id: group.id,
          name: group.name,
          members_count: group.members_count
        },
        messages: messagesWithSenders
      }
    });
  } catch (error) {
    console.error('Get group messages error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch group messages'
      }
    });
  }
});

// Send group message
router.post('/groups/:groupId/messages', (req, res) => {
  try {
    const userId = req.userId;
    const groupId = parseInt(req.params.groupId);
    const { content, type = 'text' } = req.body;
    
    // Validate input
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Message content is required'
        }
      });
    }
    
    // Validate group access
    const group = mockPrayerGroups.find(g => g.id === groupId);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied to this group'
        }
      });
    }
    
    // Create message
    const messageData = {
      group_id: groupId,
      sender_id: userId,
      content: content.trim(),
      type: type
    };
    
    const newMessage = addGroupMessage(messageData);
    
    // Update group's last activity
    group.updated_at = new Date().toISOString();
    
    // Get sender details
    const sender = mockUsers.find(u => u.id === userId);
    
    // Broadcast to WebSocket if available
    if (global.wsBroadcast) {
      global.wsBroadcast({
        type: 'new_message',
        data: {
          group_id: groupId,
          message: {
            id: newMessage.id,
            sender: {
              id: sender.id,
              name: sender.name
            },
            content: newMessage.content,
            sent_at: newMessage.sent_at
          }
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        id: newMessage.id,
        sender: {
          id: sender.id,
          name: sender.name,
          avatar: sender.avatar
        },
        content: newMessage.content,
        type: newMessage.type,
        sent_at: newMessage.sent_at
      }
    });
  } catch (error) {
    console.error('Send group message error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to send message'
      }
    });
  }
});

// Get prayer requests
router.get('/prayer-requests', (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user's groups
    const userGroups = mockPrayerGroups.filter(group => 
      group.members.includes(userId)
    );
    const userGroupIds = userGroups.map(g => g.id);
    
    // Get prayer requests from user's groups
    const prayerRequests = mockPrayerRequests.filter(request => 
      userGroupIds.includes(request.group_id)
    );
    
    // Map requests with author and group details
    const requestsWithDetails = prayerRequests.map(request => {
      const author = mockUsers.find(u => u.id === request.author_id);
      const group = userGroups.find(g => g.id === request.group_id);
      const userPraying = request.prayers.some(p => p.user_id === userId);
      
      return {
        id: request.id,
        author: {
          id: author?.id || request.author_id,
          name: author?.name || 'Unknown User',
          avatar: author?.avatar || null
        },
        group: {
          id: group?.id || request.group_id,
          name: group?.name || 'Unknown Group'
        },
        content: request.content,
        created_at: request.created_at,
        prayer_count: request.prayers.length,
        user_praying: userPraying,
        status: request.status
      };
    });
    
    // Sort by date (most recent first)
    requestsWithDetails.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json({
      success: true,
      data: requestsWithDetails
    });
  } catch (error) {
    console.error('Get prayer requests error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch prayer requests'
      }
    });
  }
});

// Submit prayer request
router.post('/prayer-requests', (req, res) => {
  try {
    const userId = req.userId;
    const { group_id, content } = req.body;
    
    // Validate input
    if (!group_id || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Group ID and content are required'
        }
      });
    }
    
    // Validate group access
    const group = mockPrayerGroups.find(g => g.id === group_id);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied to this group'
        }
      });
    }
    
    // Create prayer request
    const requestData = {
      author_id: userId,
      group_id: group_id,
      content: content.trim()
    };
    
    const newRequest = addPrayerRequest(requestData);
    
    // Get author details
    const author = mockUsers.find(u => u.id === userId);
    
    // Broadcast to WebSocket if available
    if (global.wsBroadcast) {
      global.wsBroadcast({
        type: 'new_prayer_request',
        data: {
          group_id: group_id,
          request: {
            id: newRequest.id,
            author: {
              id: author.id,
              name: author.name
            },
            content: newRequest.content,
            created_at: newRequest.created_at
          }
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        id: newRequest.id,
        author: {
          id: author.id,
          name: author.name,
          avatar: author.avatar
        },
        group: {
          id: group.id,
          name: group.name
        },
        content: newRequest.content,
        created_at: newRequest.created_at,
        prayer_count: 0,
        user_praying: false,
        status: newRequest.status
      }
    });
  } catch (error) {
    console.error('Submit prayer request error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to submit prayer request'
      }
    });
  }
});

// Commit to pray for request
router.post('/prayer-requests/:requestId/pray', (req, res) => {
  try {
    const userId = req.userId;
    const requestId = parseInt(req.params.requestId);
    
    // Find prayer request
    const request = mockPrayerRequests.find(r => r.id === requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Prayer request not found'
        }
      });
    }
    
    // Check if user has access to this group
    const group = mockPrayerGroups.find(g => g.id === request.group_id);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied to this group'
        }
      });
    }
    
    // Check if user is already praying
    const alreadyPraying = request.prayers.some(p => p.user_id === userId);
    
    if (alreadyPraying) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'You are already praying for this request'
        }
      });
    }
    
    // Add user to prayers
    request.prayers.push({
      user_id: userId,
      prayed_at: new Date().toISOString()
    });
    
    res.json({
      success: true,
      data: {
        prayer_count: request.prayers.length,
        user_praying: true
      }
    });
  } catch (error) {
    console.error('Commit to pray error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to commit to pray'
      }
    });
  }
});

// Create prayer group
router.post('/groups', (req, res) => {
  try {
    const userId = req.userId;
    const { name, description, privacy = 'private', icon = '👥' } = req.body;
    
    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Group name is required'
        }
      });
    }
    
    // Create new group
    const newGroupId = Math.max(...mockPrayerGroups.map(g => g.id)) + 1;
    const newGroup = {
      id: newGroupId,
      name: name.trim(),
      description: description || '',
      icon: icon,
      privacy: privacy,
      created_by: userId,
      members_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      members: [userId]
    };
    
    mockPrayerGroups.push(newGroup);
    
    res.json({
      success: true,
      data: {
        id: newGroup.id,
        name: newGroup.name,
        description: newGroup.description,
        icon: newGroup.icon,
        privacy: newGroup.privacy,
        members_count: newGroup.members_count,
        role: 'admin',
        created_at: newGroup.created_at,
        last_activity: newGroup.updated_at,
        unread_messages: 0
      }
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create group'
      }
    });
  }
});

// Get group details
router.get('/groups/:groupId', (req, res) => {
  try {
    const userId = req.userId;
    const groupId = parseInt(req.params.groupId);
    
    // Find group
    const group = mockPrayerGroups.find(g => g.id === groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Group not found'
        }
      });
    }
    
    // Check access
    if (!group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied to this group'
        }
      });
    }
    
    // Get group members
    const members = mockUsers.filter(u => group.members.includes(u.id));
    const memberDetails = members.map(member => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      role: member.id === group.created_by ? 'admin' : 'member'
    }));
    
    res.json({
      success: true,
      data: {
        id: group.id,
        name: group.name,
        description: group.description,
        icon: group.icon,
        privacy: group.privacy,
        created_by: group.created_by,
        members_count: group.members_count,
        created_at: group.created_at,
        updated_at: group.updated_at,
        members: memberDetails,
        user_role: userId === group.created_by ? 'admin' : 'member'
      }
    });
  } catch (error) {
    console.error('Get group details error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch group details'
      }
    });
  }
});

module.exports = router;