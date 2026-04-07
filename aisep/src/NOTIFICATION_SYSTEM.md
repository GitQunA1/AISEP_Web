# Notification System Documentation

## Overview

The notification system handles real-time alerts for critical interactions:
- **Deals**: Investment agreements and status changes
- **Contracts**: Dual-party contract signing events
- **Connections**: Investor-startup relationship requests
- **Chat**: New messages and session updates

## 📋 Data Structure

```json
{
  "notificationId": 82,
  "referenceId": 39,
  "referenceType": "Deal",
  "title": "Contract finalized",
  "message": "Startup has signed deal #39. The contract is now finalized.",
  "type": "Deal",
  "isRead": false,
  "createdAt": "2026-04-05T20:10:48.285633Z"
}
```

### Field Meanings

| Field | Type | Description |
|-------|------|-------------|
| `notificationId` | number | Unique identifier |
| `referenceId` | number | ID of related entity (Deal, Project, ChatSession) |
| `referenceType` | string | Type of entity (Deal, ChatSession, ConnectionRequest, Project) |
| `title` | string | Short notification title |
| `message` | string | Detailed message |
| `type` | string | Notification category (Deal, ConnectionRequest, ChatSession, Contract, Investment, Project) |
| `isRead` | boolean | Read status |
| `createdAt` | ISO string | Timestamp |

## 🔄 API Endpoints

### Core Endpoints
- **GET** `/api/Notifications` - Fetch notifications (paginated)
- **PUT** `/api/Notifications/{notificationId}/read` - Mark single as read
- **PUT** `/api/Notifications/read-all` - Mark all as read

### Optional Endpoints
- **GET** `/api/Notifications/{notificationId}` - Get specific notification
- **DELETE** `/api/Notifications/{notificationId}` - Delete notification
- **GET** `/api/Notifications/unread-count` - Get unread count

## 📡 Real-Time Updates (SignalR)

### High-Level Flow

```
Backend (Deal Created/Signed)
    ↓
SignalR NotificationHub
    ↓
Frontend NotificationCenter Component
    ↓
Update Notifications List + Badge
```

### SignalR Events

**Event: `notification_received`**
```javascript
// Listener
signalRService.onNotificationReceived((notification) => {
  // Add to front of list
  setNotifications(prev => [notification, ...prev]);
});
```

## 🎨 Notification Types & Styling

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| Deal | 📋 | Sky Blue (#0ea5e9) | Investment deals, confirmations |
| Contract | ✍️ | Green (#10b981) | Signature events |
| ChatSession | 💭 | Cyan (#06b6d4) | New messages |
| Connection | 💬 | Purple (#8b5cf6) | Investor-startup requests |
| Investment | 💼 | Indigo (#6366f1) | Investment-specific events |
| Project | 🚀 | Amber (#f59e0b) | Project updates |

## 🎯 Notification Routing

### When User Clicks Notification

```javascript
// Deal notification → Investor/Startup Dashboard
if (referenceType === 'Deal') {
  navigate('/investor-dashboard'); // or startup-dashboard
  // Scrolls to deals section
}

// ChatSession → Open chat window
if (referenceType === 'ChatSession') {
  onOpenChat(referenceId, notification);
}

// ConnectionRequest → Open related chat
if (referenceType === 'ConnectionRequest') {
  // Fetch chat session, then open
}

// Project → Project detail page
if (referenceType === 'Project') {
  navigate(`/project/${referenceId}`);
}
```

## 💻 Usage in Components

### NotificationCenter (FeedHeader.jsx)

```jsx
<NotificationCenter onOpenChat={handleOpenChat} />
```

**Features:**
- Bell icon with unread badge
- Dropdown panel with notification list
- Real-time updates via SignalR
- Click to navigate/handle action
- Delete individual notifications
- Mark all as read
- Timestamps ("5 phút trước", "2 giờ trước")

### Service Usage

```javascript
// Fetch with pagination
const { items, totalCount } = await notificationService.getNotifications();

// Mark as read
await notificationService.markAsRead(notificationId);

// Mark all as read
await notificationService.markAllAsRead();

// Get styling info
const { icon, color, bgColor } = notificationService.getNotificationStyle('Deal');

// Check if actionable
const isActionable = notificationService.isActionableNotification(notification);

// Get navigation URL
const url = notificationService.getNotificationActionUrl(notification);
```

## 🚀 Implementation Checklist

- [x] NotificationService with API endpoints (PUT endpoints)
- [x] NotificationCenter component with UI
- [x] SignalR real-time subscription
- [x] Different icons for notification types
- [x] Navigation routing on click
- [x] Mark as read functionality
- [x] Unread badge counter
- [x] Timestamp formatting (Vietnamese)
- [x] Delete notification
- [x] Mark all as read
- [ ] Sound/browser notifications (optional)
- [ ] Notification preferences (optional)
- [ ] Retry failed delivery (optional)

## 📝 Example Notification Flows

### Flow 1: Investor Signs Contract

```
1. Backend: Deal status → 3 (Contract_Signed)
2. SignalR: Send notification_received event
3. Frontend: NotificationCenter receives via SignalR
4. UI: New notification appears (Bell updates, list updates)
5. User clicks: Navigates to Investor Dashboard
```

### Flow 2: Startup Gets Investment

```
1. Backend: Deal created with investor details
2. SignalR: Sends notification to startup owner
3. Frontend: NotificationCenter receives, updates UI
4. Notification title: "Investor interested"
5. User clicks: Opens deal details in Startup Dashboard
```

### Flow 3: New Chat Message

```
1. Backend: Chat message sent + notification created
2. SignalR: notification_received event
3. Frontend: NotificationCenter receives
4. User clicks: Opens chat window via onOpenChat callback
```

## 🔧 Troubleshooting

### Notifications Not Appearing

1. Check SignalR connection: `signalRService.notificationConnection.state`
2. Verify NotificationCenter is mounted in FeedHeader
3. Check browser console for errors
4. Verify API endpoints are correct (PUT not PATCH)

### Real-Time Not Working

1. SignalR not initialized: Check token is passed correctly
2. NotificationHub not connected: Check server logs
3. SignalR callback not registered: Ensure `onNotificationReceived` is called

### Performance Issues

1. Pagination: Only fetch first 10-20 notifications
2. Virtualization: Can add virtual scroll for large lists
3. Cache: Consider caching notification icons/styling

## 🎁 Future Enhancements

1. **Sound Alerts**: Play sound for critical notifications
2. **Browser Notifications**: Push notifications via Service Worker
3. **Notification Preferences**: User settings for notification types
4. **Status Badges**: Show notification status (pending, success, error)
5. **Grouping**: Group similar notifications by type/date
6. **Retry Logic**: Automatic retry for failed notifications
7. **Archive**: Archive old notifications
8. **Categories**: Filter notifications by category
