# Prophetic Prayer Diary - Android App API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Prayer Content](#prayer-content)
4. [User Progress](#user-progress)
5. [Community Features](#community-features)
6. [Notifications](#notifications)
7. [Admin Features](#admin-features)
8. [Settings](#settings)
9. [Data Models](#data-models)
10. [Error Handling](#error-handling)

---

## Base URL
```
https://api.propheticprayer.com/v1
```

## Authentication

### Login
**POST** `/auth/login`

**Request:**
```json
{
  "delegate_id": "DEL001",
  "otp": "123456",
  "date_of_birth": "1990-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 123,
      "delegate_id": "DEL001",
      "name": "John Smith",
      "email": "john.smith@email.com",
      "phone": "+1 (555) 123-4567",
      "avatar": null,
      "joined_date": "2024-01-15T00:00:00Z",
      "current_week": 3,
      "rank": 12,
      "total_score": 85
    }
  }
}
```

### Refresh Token
**POST** `/auth/refresh`

**Request:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Logout
**POST** `/auth/logout`

**Request:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

## User Management

### Get User Profile
**GET** `/users/profile`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "delegate_id": "DEL001",
    "name": "John Smith",
    "email": "john.smith@email.com",
    "phone": "+1 (555) 123-4567",
    "date_of_birth": "1990-01-15",
    "avatar": null,
    "joined_date": "2024-01-15T00:00:00Z",
    "current_week": 3,
    "rank": 12,
    "total_score": 85,
    "statistics": {
      "days_prayed": 18,
      "weeks_completed": 3,
      "consistency_percentage": 94,
      "notes_written": 18,
      "achievements": [
        {
          "id": 1,
          "name": "7-Day Streak",
          "icon": "🔥",
          "unlocked_date": "2024-01-22T00:00:00Z"
        },
        {
          "id": 2,
          "name": "First Note",
          "icon": "📝",
          "unlocked_date": "2024-01-16T00:00:00Z"
        }
      ]
    },
    "preferences": {
      "daily_reminder": true,
      "weekly_summary": true,
      "achievement_notifications": false,
      "reminder_time": "09:00",
      "private_notes": true,
      "share_progress": false,
      "dark_mode": false,
      "auto_play_videos": false
    }
  }
}
```

### Update User Profile
**PUT** `/users/profile`

**Request:**
```json
{
  "name": "John Smith",
  "email": "john.smith@email.com",
  "phone": "+1 (555) 123-4567"
}
```

### Update User Preferences
**PUT** `/users/preferences`

**Request:**
```json
{
  "daily_reminder": true,
  "weekly_summary": true,
  "achievement_notifications": false,
  "reminder_time": "09:00",
  "private_notes": true,
  "share_progress": false,
  "dark_mode": false,
  "auto_play_videos": false
}
```

### Get User Goals
**GET** `/users/goals`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Pray daily for 30 days",
      "current_progress": 18,
      "target_progress": 30,
      "percentage": 60,
      "active": true
    },
    {
      "id": 2,
      "title": "Complete 5 weeks of prayer",
      "current_progress": 3,
      "target_progress": 5,
      "percentage": 60,
      "active": true
    }
  ]
}
```

---

## Prayer Content

### Get Current Week Prayer Points
**GET** `/prayer/current`

**Response:**
```json
{
  "success": true,
  "data": {
    "week": 3,
    "title": "Week 3 - Prayer Points",
    "current_day": 5,
    "total_days": 7,
    "unlocked": true,
    "prayer_points": [
      {
        "day": 5,
        "title": "Today's Prayer Point - Day 5",
        "content": "Lord, grant me strength to overcome challenges and walk in Your purpose. Help me to be a light to those around me and spread Your love through my actions.",
        "video_url": "https://cdn.propheticprayer.com/videos/week3/day5.mp4",
        "video_thumbnail": "https://cdn.propheticprayer.com/thumbnails/week3/day5.jpg",
        "date": "2024-03-19T00:00:00Z",
        "completed": false,
        "user_note": "",
        "prayed_at": null
      }
    ]
  }
}
```

### Get Prayer Point by Day
**GET** `/prayer/week/{week_number}/day/{day_number}`

**Response:**
```json
{
  "success": true,
  "data": {
    "week": 3,
    "day": 5,
    "title": "Today's Prayer Point - Day 5",
    "content": "Lord, grant me strength to overcome challenges and walk in Your purpose. Help me to be a light to those around me and spread Your love through my actions.",
    "video_url": "https://cdn.propheticprayer.com/videos/week3/day5.mp4",
    "video_thumbnail": "https://cdn.propheticprayer.com/thumbnails/week3/day5.jpg",
    "date": "2024-03-19T00:00:00Z",
    "completed": false,
    "user_note": "",
    "prayed_at": null
  }
}
```

### Mark Prayer as Completed
**POST** `/prayer/complete`

**Request:**
```json
{
  "week": 3,
  "day": 5,
  "note": "Today I felt God's presence during my morning prayer. I'm learning to be more patient with my family and colleagues."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score_awarded": 5,
    "new_total_score": 90,
    "streak_updated": true,
    "current_streak": 19,
    "achievements_unlocked": []
  }
}
```

### Save Prayer Note
**POST** `/prayer/note`

**Request:**
```json
{
  "week": 3,
  "day": 5,
  "note": "Today I felt God's presence during my morning prayer. I'm learning to be more patient with my family and colleagues."
}
```

### Get Prayer History
**GET** `/prayer/history`

**Query Parameters:**
- `week` (optional): Filter by week number
- `limit` (optional): Number of records to return (default: 20)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_count": 21,
    "prayers": [
      {
        "week": 3,
        "day": 4,
        "title": "Yesterday's Reflection - Day 4",
        "content": "Father, help me to trust in Your timing and have patience in all situations.",
        "date": "2024-03-18T00:00:00Z",
        "completed": true,
        "user_note": "Made some tough decisions at work with peace in my heart.",
        "prayed_at": "2024-03-18T09:15:00Z"
      },
      {
        "week": 3,
        "day": 3,
        "title": "Day 3 Prayer Point",
        "content": "Help me to love my neighbors as myself.",
        "date": "2024-03-17T00:00:00Z",
        "completed": true,
        "user_note": "Helped my elderly neighbor with groceries. Felt God's love.",
        "prayed_at": "2024-03-17T08:30:00Z"
      }
    ]
  }
}
```

---

## User Progress

### Get Dashboard Data
**GET** `/dashboard`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "name": "John Smith",
      "current_week": 3,
      "total_score": 85,
      "rank": 12
    },
    "statistics": {
      "days_prayed": 18,
      "weeks_completed": 3,
      "consistency_percentage": 94,
      "current_streak": 7
    },
    "progress": {
      "current_week_progress": 71,
      "overall_progress": 85
    },
    "today_prayer": {
      "week": 3,
      "day": 5,
      "title": "Today's Prayer Point - Day 5",
      "completed": false
    },
    "recent_activity": [
      {
        "type": "prayer_completed",
        "date": "2024-03-18T09:15:00Z",
        "description": "Completed Day 4 prayer"
      },
      {
        "type": "note_saved",
        "date": "2024-03-18T09:16:00Z",
        "description": "Saved reflection note"
      }
    ]
  }
}
```

### Get User Statistics
**GET** `/users/statistics`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_score": 85,
    "rank": 12,
    "days_prayed": 18,
    "weeks_completed": 3,
    "consistency_percentage": 94,
    "notes_written": 18,
    "current_streak": 7,
    "longest_streak": 12,
    "achievements_count": 4,
    "weekly_progress": [
      {
        "week": 1,
        "completed": true,
        "score": 95,
        "days_completed": 7
      },
      {
        "week": 2,
        "completed": true,
        "score": 88,
        "days_completed": 7
      },
      {
        "week": 3,
        "completed": false,
        "score": 85,
        "days_completed": 5
      }
    ]
  }
}
```

### Export User Data
**GET** `/users/export`

**Response:**
```json
{
  "success": true,
  "data": {
    "export_url": "https://cdn.propheticprayer.com/exports/user_123_export.json",
    "generated_at": "2024-03-19T10:30:00Z",
    "expires_at": "2024-03-26T10:30:00Z"
  }
}
```

---

## Community Features

### Get User Prayer Groups
**GET** `/community/groups`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Family Prayer Circle",
      "description": "Private family prayer group",
      "icon": "🏠",
      "members_count": 5,
      "privacy": "private",
      "role": "admin",
      "created_at": "2024-01-15T00:00:00Z",
      "last_activity": "2024-03-19T07:00:00Z",
      "unread_messages": 2
    },
    {
      "id": 2,
      "name": "Church Leadership",
      "description": "Leadership prayer and discussion",
      "icon": "⛪",
      "members_count": 4,
      "privacy": "private",
      "role": "member",
      "created_at": "2024-02-01T00:00:00Z",
      "last_activity": "2024-03-18T15:30:00Z",
      "unread_messages": 0
    }
  ]
}
```

### Get Group Messages
**GET** `/community/groups/{group_id}/messages`

**Query Parameters:**
- `limit` (optional): Number of messages to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "group": {
      "id": 1,
      "name": "Family Prayer Circle",
      "members_count": 5
    },
    "messages": [
      {
        "id": 123,
        "sender": {
          "id": 456,
          "name": "Sarah Smith",
          "avatar": null
        },
        "content": "Please pray for grandma's health. Doctor visit tomorrow. Thank you family. 🙏",
        "type": "text",
        "sent_at": "2024-03-19T07:00:00Z",
        "read": false
      },
      {
        "id": 122,
        "sender": {
          "id": 789,
          "name": "Michael Smith",
          "avatar": null
        },
        "content": "Completed Week 3! Feeling blessed and grateful for your accountability support.",
        "type": "text",
        "sent_at": "2024-03-19T04:00:00Z",
        "read": true
      }
    ]
  }
}
```

### Send Group Message
**POST** `/community/groups/{group_id}/messages`

**Request:**
```json
{
  "content": "Thank you for your prayers. Doctor visit went well! 🙏",
  "type": "text"
}
```

### Get Prayer Requests
**GET** `/community/prayer-requests`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "author": {
        "id": 456,
        "name": "Sarah",
        "avatar": null
      },
      "group": {
        "id": 1,
        "name": "Family Prayer Circle"
      },
      "content": "Please pray for my job interview next week. Feeling nervous but trusting God's plan.",
      "created_at": "2024-03-18T14:00:00Z",
      "prayer_count": 2,
      "user_praying": true,
      "status": "active"
    },
    {
      "id": 2,
      "author": {
        "id": 789,
        "name": "Michael",
        "avatar": null
      },
      "group": {
        "id": 3,
        "name": "Prayer Partners"
      },
      "content": "Struggling with consistency in daily prayers. Please keep me accountable this week.",
      "created_at": "2024-03-18T10:00:00Z",
      "prayer_count": 0,
      "user_praying": false,
      "status": "active"
    }
  ]
}
```

### Submit Prayer Request
**POST** `/community/prayer-requests`

**Request:**
```json
{
  "group_id": 1,
  "content": "Please pray for my upcoming presentation at work. Feeling anxious but trusting God."
}
```

### Commit to Pray for Request
**POST** `/community/prayer-requests/{request_id}/pray`

**Response:**
```json
{
  "success": true,
  "data": {
    "prayer_count": 3,
    "user_praying": true
  }
}
```

### Create Prayer Group
**POST** `/community/groups`

**Request:**
```json
{
  "name": "College Prayer Group",
  "description": "Prayer group for college students",
  "privacy": "private",
  "icon": "🎓"
}
```

---

## Notifications

### Get Notifications
**GET** `/notifications`

**Query Parameters:**
- `type` (optional): Filter by type (all, prayers, social, reminders)
- `limit` (optional): Number of notifications to return (default: 20)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "unread_count": 2,
    "notifications": [
      {
        "id": 1,
        "type": "prayer_reminder",
        "title": "Daily Prayer Reminder",
        "message": "Time for your morning prayer session",
        "icon": "🙏",
        "read": false,
        "created_at": "2024-03-19T09:00:00Z",
        "action_url": "/prayer/current"
      },
      {
        "id": 2,
        "type": "achievement",
        "title": "Achievement Unlocked!",
        "message": "You've completed Week 3 - Well done!",
        "icon": "🎉",
        "read": false,
        "created_at": "2024-03-18T20:00:00Z",
        "action_url": "/profile"
      },
      {
        "id": 3,
        "type": "social",
        "title": "Sarah liked your prayer",
        "message": "\"Grateful for God's blessings today\"",
        "icon": "❤️",
        "read": true,
        "created_at": "2024-03-18T16:00:00Z",
        "action_url": "/community"
      }
    ]
  }
}
```

### Mark Notification as Read
**PUT** `/notifications/{notification_id}/read`

### Mark All Notifications as Read
**PUT** `/notifications/read-all`

### Delete Notification
**DELETE** `/notifications/{notification_id}`

---

## Admin Features

### Get Admin Dashboard
**GET** `/admin/dashboard`

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "active_users": 1247,
      "average_engagement": 89,
      "daily_screen_time": 45,
      "daily_prayers": 342,
      "total_users": 1500,
      "weekly_retention": 78
    },
    "recent_activity": [
      {
        "type": "new_user",
        "count": 15,
        "date": "2024-03-19T00:00:00Z"
      },
      {
        "type": "prayers_completed",
        "count": 342,
        "date": "2024-03-19T00:00:00Z"
      }
    ],
    "top_users": [
      {
        "id": 123,
        "name": "John Smith",
        "delegate_id": "DEL001",
        "score": 95,
        "streak": 7,
        "screen_time": 34
      },
      {
        "id": 456,
        "name": "Sarah Johnson",
        "delegate_id": "DEL002",
        "score": 88,
        "streak": 6,
        "screen_time": 28
      }
    ]
  }
}
```

### Get User Analytics
**GET** `/admin/users/analytics`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_users": 1500,
    "active_users_today": 1247,
    "new_users_this_week": 45,
    "retention_rates": {
      "day_1": 95,
      "day_7": 78,
      "day_30": 65
    },
    "engagement_metrics": {
      "average_session_duration": 45,
      "daily_active_users": 1247,
      "weekly_active_users": 1350,
      "monthly_active_users": 1450
    }
  }
}
```

### Send Bulk Notification
**POST** `/admin/notifications/send`

**Request:**
```json
{
  "title": "New Prayer Points Available",
  "message": "Week 4 content is now unlocked!",
  "type": "content_update",
  "target_users": "all", // or "active" or array of user IDs
  "schedule_at": null // or ISO date string for scheduling
}
```

### Manage Prayer Content
**GET** `/admin/content/prayers`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "week": 4,
      "day": 1,
      "title": "New Week Prayer Point",
      "content": "Lord, guide me in this new week...",
      "video_url": "https://cdn.propheticprayer.com/videos/week4/day1.mp4",
      "published": false,
      "created_at": "2024-03-15T00:00:00Z"
    }
  ]
}
```

### Update Prayer Content
**PUT** `/admin/content/prayers/{prayer_id}`

**Request:**
```json
{
  "title": "Updated Prayer Point",
  "content": "Lord, guide me in this new week with wisdom and understanding...",
  "video_url": "https://cdn.propheticprayer.com/videos/week4/day1.mp4",
  "published": true
}
```

---

## Settings

### Get App Settings
**GET** `/settings/app`

**Response:**
```json
{
  "success": true,
  "data": {
    "current_version": "1.0.0",
    "minimum_version": "1.0.0",
    "maintenance_mode": false,
    "features": {
      "community_enabled": true,
      "video_content_enabled": true,
      "push_notifications_enabled": true,
      "admin_dashboard_enabled": true
    },
    "content_schedule": {
      "new_content_day": "friday",
      "new_content_time": "06:00"
    }
  }
}
```

---

## Data Models

### User
```json
{
  "id": 123,
  "delegate_id": "DEL001",
  "name": "John Smith",
  "email": "john.smith@email.com",
  "phone": "+1 (555) 123-4567",
  "date_of_birth": "1990-01-15",
  "avatar": "https://cdn.propheticprayer.com/avatars/123.jpg",
  "joined_date": "2024-01-15T00:00:00Z",
  "current_week": 3,
  "rank": 12,
  "total_score": 85,
  "status": "active",
  "last_active": "2024-03-19T09:00:00Z",
  "created_at": "2024-01-15T00:00:00Z",
  "updated_at": "2024-03-19T09:00:00Z"
}
```

### Prayer Point
```json
{
  "id": 21,
  "week": 3,
  "day": 5,
  "title": "Today's Prayer Point - Day 5",
  "content": "Lord, grant me strength to overcome challenges...",
  "video_url": "https://cdn.propheticprayer.com/videos/week3/day5.mp4",
  "video_thumbnail": "https://cdn.propheticprayer.com/thumbnails/week3/day5.jpg",
  "video_duration": 180,
  "published": true,
  "created_at": "2024-03-15T00:00:00Z",
  "updated_at": "2024-03-15T00:00:00Z"
}
```

### User Progress
```json
{
  "id": 1,
  "user_id": 123,
  "week": 3,
  "day": 5,
  "prayer_id": 21,
  "completed": true,
  "note": "Today I felt God's presence during my morning prayer...",
  "score_awarded": 5,
  "prayed_at": "2024-03-19T09:15:00Z",
  "created_at": "2024-03-19T09:15:00Z"
}
```

### Prayer Group
```json
{
  "id": 1,
  "name": "Family Prayer Circle",
  "description": "Private family prayer group",
  "icon": "🏠",
  "privacy": "private",
  "created_by": 123,
  "members_count": 5,
  "created_at": "2024-01-15T00:00:00Z",
  "updated_at": "2024-03-19T07:00:00Z"
}
```

### Notification
```json
{
  "id": 1,
  "user_id": 123,
  "type": "prayer_reminder",
  "title": "Daily Prayer Reminder",
  "message": "Time for your morning prayer session",
  "icon": "🙏",
  "read": false,
  "action_url": "/prayer/current",
  "created_at": "2024-03-19T09:00:00Z"
}
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "delegate_id",
        "message": "Delegate ID is required"
      }
    ]
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` (400): Invalid request data
- `UNAUTHORIZED` (401): Invalid or missing authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_SERVER_ERROR` (500): Server error
- `SERVICE_UNAVAILABLE` (503): Service temporarily unavailable

---

## Authentication Headers

All authenticated requests must include:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

---

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Standard endpoints: 100 requests per minute
- Admin endpoints: 50 requests per minute
- Upload endpoints: 10 requests per minute

---

## WebSocket Events (Real-time Features)

### Connect to WebSocket
```
wss://api.propheticprayer.com/ws?token={access_token}
```

### Events
- `prayer_completed`: When a user completes a prayer
- `new_message`: New group message
- `new_prayer_request`: New prayer request in user's groups
- `achievement_unlocked`: User unlocks an achievement
- `notification`: New notification for user

---

## Pagination

Paginated endpoints support:
- `limit`: Number of items per page (max 100)
- `offset`: Number of items to skip
- `cursor`: Cursor-based pagination token (alternative to offset)

Response format:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total_count": 150,
      "limit": 20,
      "offset": 0,
      "has_next": true,
      "next_cursor": "eyJpZCI6MjB9"
    }
  }
}
```

---

## File Upload

### Upload Profile Picture
**POST** `/users/avatar`

**Request:** `multipart/form-data`
- `avatar`: Image file (max 5MB, PNG/JPG)

**Response:**
```json
{
  "success": true,
  "data": {
    "avatar_url": "https://cdn.propheticprayer.com/avatars/123.jpg"
  }
}
```