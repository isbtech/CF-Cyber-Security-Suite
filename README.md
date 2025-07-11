# Prophetic Prayer Diary - Mock API Server

A comprehensive mock API server for the Prophetic Prayer Diary Android application, built with Node.js and Express.

## Features

- **Authentication System**: JWT-based authentication with delegate ID, OTP, and date of birth
- **Prayer Management**: Weekly prayer points with video content and user progress tracking
- **Community Features**: Private prayer groups, messaging, and prayer requests
- **Real-time Notifications**: WebSocket support for live updates
- **Admin Dashboard**: Complete admin interface for user and content management
- **User Progress Tracking**: Scoring system, achievements, and statistics
- **File Upload Support**: Avatar uploads with validation
- **Rate Limiting**: Protection against API abuse
- **Comprehensive Error Handling**: Consistent error responses

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd prophetic-prayer-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. Create upload directories:
```bash
mkdir -p uploads/avatars
```

5. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API server will be available at `http://localhost:3001`

## API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "delegate_id": "DEL001",
  "otp": "123456",
  "date_of_birth": "1990-01-15"
}
```

#### Test Users
- **Regular User**: `DEL001` (password: any 6-digit OTP, DOB: 1990-01-15)
- **Admin User**: `ADMIN001` (password: any 6-digit OTP, DOB: 1985-01-01)

### Core Endpoints

#### Dashboard
```http
GET /api/v1/dashboard
Authorization: Bearer <token>
```

#### Prayer Management
```http
# Get current prayer
GET /api/v1/prayer/current

# Complete prayer
POST /api/v1/prayer/complete
{
  "week": 3,
  "day": 5,
  "note": "Prayer reflection note"
}

# Get prayer history
GET /api/v1/prayer/history?limit=20&offset=0
```

#### Community Features
```http
# Get prayer groups
GET /api/v1/community/groups

# Send group message
POST /api/v1/community/groups/1/messages
{
  "content": "Hello prayer group!"
}

# Get prayer requests
GET /api/v1/community/prayer-requests
```

#### User Management
```http
# Get user profile
GET /api/v1/users/profile

# Update preferences
PUT /api/v1/users/preferences
{
  "daily_reminder": true,
  "reminder_time": "09:00"
}
```

#### Admin Features
```http
# Get admin dashboard
GET /api/v1/admin/dashboard

# Send bulk notification
POST /api/v1/admin/notifications/send
{
  "title": "New Content Available",
  "message": "Week 4 prayer points are now available!",
  "type": "content_update",
  "target_users": "all"
}
```

## WebSocket Support

Connect to WebSocket for real-time updates:
```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  // Subscribe to user events
  ws.send(JSON.stringify({
    type: 'subscribe',
    userId: 123
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### WebSocket Events
- `prayer_completed`: User completes a prayer
- `new_message`: New group message
- `new_prayer_request`: New prayer request
- `notification`: New notification
- `achievement_unlocked`: Achievement unlocked

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"delegate_id":"DEL001","otp":"123456","date_of_birth":"1990-01-15"}'

# Get dashboard (replace TOKEN with actual token)
curl -X GET http://localhost:3001/api/v1/dashboard \
  -H "Authorization: Bearer TOKEN"

# Complete prayer
curl -X POST http://localhost:3001/api/v1/prayer/complete \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"week":3,"day":5,"note":"Felt blessed today"}'
```

### Using Postman

1. Import the API collection (create from documentation)
2. Set up environment variables:
   - `base_url`: `http://localhost:3001/api/v1`
   - `token`: (set after login)
3. Test the authentication flow
4. Explore all endpoints

## Project Structure

```
prophetic-prayer-api/
├── server.js                 # Main server file
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
├── README.md                 # This file
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Error handling
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management
│   ├── prayer.js            # Prayer content
│   ├── dashboard.js         # Dashboard data
│   ├── community.js         # Community features
│   ├── notifications.js     # Notifications
│   ├── admin.js             # Admin features
│   └── settings.js          # App settings
├── data/
│   └── mockData.js          # Mock data store
└── uploads/
    └── avatars/             # User avatar uploads
```

## Mock Data

The API uses in-memory mock data for demonstration purposes. The data includes:

- **Users**: 3 sample users including admin
- **Prayer Points**: Weekly prayer content with video links
- **Groups**: Private prayer groups with members
- **Messages**: Group messages and conversations
- **Notifications**: Various notification types
- **Achievements**: Unlockable achievements
- **Progress**: User prayer progress and statistics

## Environment Variables

Key environment variables in `.env`:

```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": [
      {
        "field": "field_name",
        "message": "Field specific error"
      }
    ]
  }
}
```

## Rate Limiting

- **Standard endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes
- **Admin endpoints**: 50 requests per 15 minutes

## Security Features

- JWT token authentication
- Input validation and sanitization
- Rate limiting protection
- CORS configuration
- File upload validation
- Admin role protection

## Development

### Running in Development Mode

```bash
npm run dev
```

Uses nodemon for automatic restarts on file changes.

### Adding New Endpoints

1. Create route handler in appropriate file under `routes/`
2. Add route to `server.js`
3. Update mock data in `data/mockData.js` if needed
4. Test the endpoint

### Mock Data Manipulation

The mock data is stored in memory and resets when the server restarts. To modify data:

```javascript
// In routes/example.js
const { mockUsers, addNotification } = require('../data/mockData');

// Add a new notification
const notification = addNotification({
  user_id: 123,
  type: 'info',
  title: 'Test Notification',
  message: 'This is a test'
});
```

## Deployment

### Production Deployment

1. Set environment variables:
```bash
export NODE_ENV=production
export JWT_SECRET=your-production-secret
export PORT=3001
```

2. Install production dependencies:
```bash
npm ci --only=production
```

3. Start the server:
```bash
npm start
```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## API Testing Tools

### Recommended Tools
- **Postman**: GUI-based API testing
- **Insomnia**: Alternative REST client
- **curl**: Command-line testing
- **HTTPie**: Modern command-line HTTP client

### Test Scenarios
- Authentication flow
- Prayer completion workflow
- Community interactions
- Admin operations
- Error handling
- Rate limiting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues:
- Open an issue on GitHub
- Contact the development team
- Check the API documentation

---

**Note**: This is a mock API server for development and testing purposes. For production use, replace the in-memory data store with a real database and implement proper security measures.
