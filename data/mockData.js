const moment = require('moment');

// Mock Users
const mockUsers = [
  {
    id: 123,
    delegate_id: 'DEL001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    date_of_birth: '1990-01-15',
    avatar: null,
    joined_date: '2024-01-15T00:00:00Z',
    current_week: 3,
    rank: 12,
    total_score: 85,
    role: 'user',
    status: 'active',
    last_active: new Date().toISOString(),
    created_at: '2024-01-15T00:00:00Z',
    updated_at: new Date().toISOString(),
    preferences: {
      daily_reminder: true,
      weekly_summary: true,
      achievement_notifications: false,
      reminder_time: '09:00',
      private_notes: true,
      share_progress: false,
      dark_mode: false,
      auto_play_videos: false
    }
  },
  {
    id: 456,
    delegate_id: 'DEL002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 234-5678',
    date_of_birth: '1988-03-22',
    avatar: null,
    joined_date: '2024-01-20T00:00:00Z',
    current_week: 3,
    rank: 8,
    total_score: 92,
    role: 'user',
    status: 'active',
    last_active: new Date().toISOString(),
    created_at: '2024-01-20T00:00:00Z',
    updated_at: new Date().toISOString(),
    preferences: {
      daily_reminder: true,
      weekly_summary: true,
      achievement_notifications: true,
      reminder_time: '08:00',
      private_notes: true,
      share_progress: true,
      dark_mode: false,
      auto_play_videos: true
    }
  },
  {
    id: 1,
    delegate_id: 'ADMIN001',
    name: 'Admin User',
    email: 'admin@propheticprayer.com',
    phone: '+1 (555) 000-0000',
    date_of_birth: '1985-01-01',
    avatar: null,
    joined_date: '2024-01-01T00:00:00Z',
    current_week: 4,
    rank: 1,
    total_score: 100,
    role: 'admin',
    status: 'active',
    last_active: new Date().toISOString(),
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    preferences: {
      daily_reminder: true,
      weekly_summary: true,
      achievement_notifications: true,
      reminder_time: '07:00',
      private_notes: true,
      share_progress: false,
      dark_mode: true,
      auto_play_videos: false
    }
  }
];

// Mock Prayer Points
const mockPrayerPoints = [
  {
    id: 21,
    week: 3,
    day: 5,
    title: "Today's Prayer Point - Day 5",
    content: "Lord, grant me strength to overcome challenges and walk in Your purpose. Help me to be a light to those around me and spread Your love through my actions.",
    video_url: "https://cdn.propheticprayer.com/videos/week3/day5.mp4",
    video_thumbnail: "https://cdn.propheticprayer.com/thumbnails/week3/day5.jpg",
    video_duration: 180,
    published: true,
    created_at: "2024-03-15T00:00:00Z",
    updated_at: "2024-03-15T00:00:00Z"
  },
  {
    id: 20,
    week: 3,
    day: 4,
    title: "Yesterday's Reflection - Day 4",
    content: "Father, help me to trust in Your timing and have patience in all situations.",
    video_url: "https://cdn.propheticprayer.com/videos/week3/day4.mp4",
    video_thumbnail: "https://cdn.propheticprayer.com/thumbnails/week3/day4.jpg",
    video_duration: 165,
    published: true,
    created_at: "2024-03-14T00:00:00Z",
    updated_at: "2024-03-14T00:00:00Z"
  },
  {
    id: 19,
    week: 3,
    day: 3,
    title: "Day 3 Prayer Point",
    content: "Help me to love my neighbors as myself.",
    video_url: "https://cdn.propheticprayer.com/videos/week3/day3.mp4",
    video_thumbnail: "https://cdn.propheticprayer.com/thumbnails/week3/day3.jpg",
    video_duration: 145,
    published: true,
    created_at: "2024-03-13T00:00:00Z",
    updated_at: "2024-03-13T00:00:00Z"
  }
];

// Mock User Progress
const mockUserProgress = [
  {
    id: 1,
    user_id: 123,
    week: 3,
    day: 4,
    prayer_id: 20,
    completed: true,
    note: "Made some tough decisions at work with peace in my heart.",
    score_awarded: 5,
    prayed_at: "2024-03-18T09:15:00Z",
    created_at: "2024-03-18T09:15:00Z"
  },
  {
    id: 2,
    user_id: 123,
    week: 3,
    day: 3,
    prayer_id: 19,
    completed: true,
    note: "Helped my elderly neighbor with groceries. Felt God's love.",
    score_awarded: 5,
    prayed_at: "2024-03-17T08:30:00Z",
    created_at: "2024-03-17T08:30:00Z"
  }
];

// Mock Prayer Groups
const mockPrayerGroups = [
  {
    id: 1,
    name: "Family Prayer Circle",
    description: "Private family prayer group",
    icon: "🏠",
    privacy: "private",
    created_by: 123,
    members_count: 5,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-03-19T07:00:00Z",
    members: [123, 456, 789, 101, 102]
  },
  {
    id: 2,
    name: "Church Leadership",
    description: "Leadership prayer and discussion",
    icon: "⛪",
    privacy: "private",
    created_by: 456,
    members_count: 4,
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-03-18T15:30:00Z",
    members: [123, 456, 789, 101]
  },
  {
    id: 3,
    name: "Prayer Partners",
    description: "Prayer accountability group",
    icon: "👥",
    privacy: "private",
    created_by: 123,
    members_count: 3,
    created_at: "2024-02-15T00:00:00Z",
    updated_at: "2024-03-19T04:00:00Z",
    members: [123, 456, 789]
  }
];

// Mock Group Messages
const mockGroupMessages = [
  {
    id: 123,
    group_id: 1,
    sender_id: 456,
    content: "Please pray for grandma's health. Doctor visit tomorrow. Thank you family. 🙏",
    type: "text",
    sent_at: "2024-03-19T07:00:00Z",
    read_by: [123]
  },
  {
    id: 122,
    group_id: 3,
    sender_id: 789,
    content: "Completed Week 3! Feeling blessed and grateful for your accountability support.",
    type: "text",
    sent_at: "2024-03-19T04:00:00Z",
    read_by: [123, 456]
  },
  {
    id: 121,
    group_id: 1,
    sender_id: 123,
    content: "Thank you for your prayers. Doctor visit went well! 🙏",
    type: "text",
    sent_at: "2024-03-19T10:00:00Z",
    read_by: []
  }
];

// Mock Prayer Requests
const mockPrayerRequests = [
  {
    id: 1,
    author_id: 456,
    group_id: 1,
    content: "Please pray for my job interview next week. Feeling nervous but trusting God's plan.",
    created_at: "2024-03-18T14:00:00Z",
    status: "active",
    prayers: [
      { user_id: 123, prayed_at: "2024-03-18T14:30:00Z" },
      { user_id: 789, prayed_at: "2024-03-18T15:00:00Z" }
    ]
  },
  {
    id: 2,
    author_id: 789,
    group_id: 3,
    content: "Struggling with consistency in daily prayers. Please keep me accountable this week.",
    created_at: "2024-03-18T10:00:00Z",
    status: "active",
    prayers: []
  }
];

// Mock Notifications
const mockNotifications = [
  {
    id: 1,
    user_id: 123,
    type: "prayer_reminder",
    title: "Daily Prayer Reminder",
    message: "Time for your morning prayer session",
    icon: "🙏",
    read: false,
    action_url: "/prayer/current",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    user_id: 123,
    type: "achievement",
    title: "Achievement Unlocked!",
    message: "You've completed Week 3 - Well done!",
    icon: "🎉",
    read: false,
    action_url: "/profile",
    created_at: moment().subtract(1, 'day').toISOString()
  },
  {
    id: 3,
    user_id: 123,
    type: "social",
    title: "Sarah liked your prayer",
    message: "\"Grateful for God's blessings today\"",
    icon: "❤️",
    read: true,
    action_url: "/community",
    created_at: moment().subtract(2, 'hours').toISOString()
  },
  {
    id: 4,
    user_id: 123,
    type: "social",
    title: "New group invitation",
    message: "Emily invited you to \"College Prayer Group\"",
    icon: "👥",
    read: true,
    action_url: "/community",
    created_at: moment().subtract(2, 'days').toISOString()
  },
  {
    id: 5,
    user_id: 123,
    type: "content_update",
    title: "Weekly Prayer Points Available",
    message: "Week 4 content is now unlocked!",
    icon: "📱",
    read: true,
    action_url: "/prayer/current",
    created_at: moment().subtract(3, 'days').toISOString()
  }
];

// Mock Achievements
const mockAchievements = [
  {
    id: 1,
    name: "7-Day Streak",
    icon: "🔥",
    description: "Pray for 7 consecutive days",
    unlocked: true,
    unlocked_date: "2024-01-22T00:00:00Z"
  },
  {
    id: 2,
    name: "First Note",
    icon: "📝",
    description: "Write your first prayer note",
    unlocked: true,
    unlocked_date: "2024-01-16T00:00:00Z"
  },
  {
    id: 3,
    name: "Week 1 Complete",
    icon: "⭐",
    description: "Complete all prayers in Week 1",
    unlocked: true,
    unlocked_date: "2024-01-21T00:00:00Z"
  },
  {
    id: 4,
    name: "Week 2 Complete",
    icon: "🎯",
    description: "Complete all prayers in Week 2",
    unlocked: true,
    unlocked_date: "2024-02-04T00:00:00Z"
  },
  {
    id: 5,
    name: "Community Helper",
    icon: "🤝",
    description: "Help 5 prayer requests in community",
    unlocked: false,
    unlocked_date: null
  }
];

// Mock Admin Statistics
const mockAdminStats = {
  active_users: 1247,
  average_engagement: 89,
  daily_screen_time: 45,
  daily_prayers: 342,
  total_users: 1500,
  weekly_retention: 78,
  new_users_today: 15,
  new_users_this_week: 45,
  retention_rates: {
    day_1: 95,
    day_7: 78,
    day_30: 65
  },
  engagement_metrics: {
    average_session_duration: 45,
    daily_active_users: 1247,
    weekly_active_users: 1350,
    monthly_active_users: 1450
  }
};

// Mock Goals
const mockGoals = [
  {
    id: 1,
    user_id: 123,
    title: "Pray daily for 30 days",
    current_progress: 18,
    target_progress: 30,
    active: true,
    created_at: "2024-01-15T00:00:00Z"
  },
  {
    id: 2,
    user_id: 123,
    title: "Complete 5 weeks of prayer",
    current_progress: 3,
    target_progress: 5,
    active: true,
    created_at: "2024-01-15T00:00:00Z"
  }
];

// Mock App Settings
const mockAppSettings = {
  current_version: "1.0.0",
  minimum_version: "1.0.0",
  maintenance_mode: false,
  features: {
    community_enabled: true,
    video_content_enabled: true,
    push_notifications_enabled: true,
    admin_dashboard_enabled: true
  },
  content_schedule: {
    new_content_day: "friday",
    new_content_time: "06:00"
  }
};

// Helper functions to manipulate data
const addUserProgress = (progress) => {
  const newId = Math.max(...mockUserProgress.map(p => p.id)) + 1;
  const newProgress = {
    ...progress,
    id: newId,
    created_at: new Date().toISOString()
  };
  mockUserProgress.push(newProgress);
  return newProgress;
};

const addNotification = (notification) => {
  const newId = Math.max(...mockNotifications.map(n => n.id)) + 1;
  const newNotification = {
    ...notification,
    id: newId,
    created_at: new Date().toISOString()
  };
  mockNotifications.push(newNotification);
  return newNotification;
};

const addGroupMessage = (message) => {
  const newId = Math.max(...mockGroupMessages.map(m => m.id)) + 1;
  const newMessage = {
    ...message,
    id: newId,
    sent_at: new Date().toISOString(),
    read_by: []
  };
  mockGroupMessages.push(newMessage);
  return newMessage;
};

const addPrayerRequest = (request) => {
  const newId = Math.max(...mockPrayerRequests.map(r => r.id)) + 1;
  const newRequest = {
    ...request,
    id: newId,
    created_at: new Date().toISOString(),
    status: 'active',
    prayers: []
  };
  mockPrayerRequests.push(newRequest);
  return newRequest;
};

module.exports = {
  mockUsers,
  mockPrayerPoints,
  mockUserProgress,
  mockPrayerGroups,
  mockGroupMessages,
  mockPrayerRequests,
  mockNotifications,
  mockAchievements,
  mockAdminStats,
  mockGoals,
  mockAppSettings,
  addUserProgress,
  addNotification,
  addGroupMessage,
  addPrayerRequest
};