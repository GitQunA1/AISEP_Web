# 🔔 Notification System - Visual Workflows

## Real-Time Notification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  (Deal Created / Contract Signed / Investment Accepted)         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              SignalR NotificationHub                             │
│         Broadcasts: notification_received(data)                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               Frontend SignalR Connection                        │
│    signalRService.onNotificationReceived(callback)              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│           NotificationCenter Component                           │
│  - Receives notification object                                 │
│  - Updates state: [newNotif, ...prev]                          │
│  - Unread badge updates                                         │
│  - Bell icon highlights                                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              User Sees:                                          │
│  [🔔 Bell Icon with Red Badge (5)]                             │
│   ▼                                                              │
│  ┌─────────────────────────────────────┐                       │
│  │ Thông báo (Notifications Panel)     │                       │
│  ├─────────────────────────────────────┤                       │
│  │ 📋 Contract finalized                │ ← NEW (just arrived!)│
│  │ Deal #39 is now ready to sign      │                       │
│  │ 3 phút trước          [🗑️]          │                       │
│  ├─────────────────────────────────────┤                       │
│  │ 💭 New message                       │                       │
│  │ Investor replied to your inquiry   │                       │
│  │ 1 giờ trước           [🗑️]          │                       │
│  └─────────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

## Notification Click Routing

```
┌──────────────────────┐
│  User Clicks Notif   │
└──────────┬───────────┘
           │
           ▼
    ┌──────────────────────────────────────┐
    │ Get referenceType from notification  │
    └──────────┬───────────────────────────┘
               │
    ┌──────────┴──────────┬─────────────────┬──────────────────┐
    │                     │                 │                  │
    ▼                     ▼                 ▼                  ▼
┌─────────┐          ┌──────────┐    ┌──────────────┐   ┌──────────┐
│  Deal   │          │ChatSession│   │ConnectionReq │   │ Project  │
├─────────┤          ├──────────┤    ├──────────────┤   ├──────────┤
│         │          │          │    │              │   │          │
│ Mark    │          │Mark Read │    │Mark Read     │   │Mark Read │
│ as Read │          │          │    │              │   │          │
│    ↓    │          │   ↓      │    │   ↓          │   │   ↓      │
│Navigate │          │onOpenChat│    │Fetch Chat    │   │Navigate  │
│  to     │          │(callback)│    │Session then  │   │  to      │
│Dashboard│          │   ↓      │    │onOpenChat    │   │Project   │
│ Section │          │Opens Chat│    │   ↓          │   │  Detail  │
│         │          │ Window   │    │Opens Chat    │   │  Page    │
└─────────┘          └──────────┘    └──────────────┘   └──────────┘
```

## Data Flow with API Calls

```
NOTIFICATION LIFECYCLE:

1️⃣ CREATION (Backend)
   Deal.status = 3 (Contract_Signed)
          ↓
   Create Notification
   {
     notificationId: 82,
     referenceId: 39,
     referenceType: "Deal",
     title: "Contract finalized",
     type: "Deal",
     isRead: false,
     createdAt: "2026-04-05T20:10:48Z"
   }
          ↓
   SignalR Broadcast: notification_received(...)

2️⃣ RECEPTION (Frontend)
   SignalR Event Received
          ↓
   NotificationCenter updates state
   [newNotification, ...existingNotifications]
          ↓
   UI Updates:
   - Bell badge: 5 → 6
   - Panel shows new item at top

3️⃣ USER INTERACTION
   User Clicks Notification
          ↓
   PUT /api/Notifications/82/read
   Response: { success: true }
          ↓
   UI Updates:
   - Notification marked as read (grayed out)
   - Badge: 6 → 5
   - Navigate to Deal location

4️⃣ CLEANUP (Optional)
   User clicks Delete [🗑️]
          ↓
   DELETE /api/Notifications/82
   Response: { success: true }
          ↓
   Remove from list
   Badge: 5 → 4
```

## Notification Type Decision Tree

```
START: Notification arrives
  │
  ├─ What is referenceType?
  │
  ├─ "Deal"
  │  └─ Is it about contract? → Yes
  │     └─ Show: 📋 "Contract finalized"
  │        Icon: Sky Blue (#0ea5e9)
  │        Route: Investor/Startup Dashboard
  │
  ├─ "ChatSession"
  │  └─ Is it a message? → Yes
  │     └─ Show: 💭 "New message"
  │        Icon: Cyan (#06b6d4)
  │        Route: Open Chat Window
  │
  ├─ "ConnectionRequest"
  │  └─ Is it an inquiry? → Yes
  │     └─ Show: 💬 "Connection request"
  │        Icon: Purple (#8b5cf6)
  │        Route: Fetch chat, then open
  │
  └─ "Project"
     └─ Is it a project update? → Yes
        └─ Show: 🚀 "Project updated"
           Icon: Amber (#f59e0b)
           Route: /project/{id}
```

## Component Hierarchy

```
App
│
├─ MainLayout
│  │
│  ├─ FeedHeader
│  │  └─ NotificationCenter ← YOU ARE HERE
│  │     │
│  │     ├─ Bell Icon + Badge
│  │     │
│  │     └─ Dropdown Panel
│  │        ├─ Header + Close
│  │        ├─ Notification List
│  │        │  └─ forEach notification
│  │        │     ├─ Icon + Type
│  │        │     ├─ Title + Message
│  │        │     ├─ Timestamp
│  │        │     └─ Delete Button
│  │        │
│  │        └─ Actions
│  │           └─ "Mark all as read"
│  │
│  ├─ StartupCard (Main Feed)
│  │
│  └─ ChatWindow
│     └─ onOpenChat callback
│
└─ Services
   ├─ SignalRService
   │  └─ onNotificationReceived(callback)
   │
   └─ NotificationService
      ├─ getNotifications()
      ├─ markAsRead(id)
      ├─ markAllAsRead()
      ├─ deleteNotification(id)
      └─ Helper functions
```

## State Management Flow

```
NotificationCenter (useState)
│
├─ notifications: []
│  ├─ Initial: loaded from API
│  ├─ Real-time: prepend new from SignalR
│  ├─ On mark read: update isRead flag
│  └─ On delete: filter out
│
├─ unreadCount: number
│  ├─ Initial: calculated from notifications
│  ├─ On new notification: increment
│  ├─ On mark as read: decrement
│  └─ On mark all: reset to 0
│
├─ isOpen: boolean
│  └─ Toggle panel visibility
│
└─ isClosing: boolean
   └─ Animate out before hiding
```

## Browser Element IDs (for routing)

```
Dashboard Sections:

Investor Dashboard:
  /investor-dashboard
  └─ #deals-section (scroll to show deals)
     └─ Deal #39 highlighted

Startup Dashboard:
  /startup-dashboard
  └─ #deals-section (scroll to show deals)
     └─ Incoming deal highlighted

Project Detail:
  /project/{id}
  └─ Direct navigation

Chat:
  NotificationCenter
  └─ onOpenChat(chatSessionId)
     └─ ChatWindow component opens
```

## Example Real-World Scenarios

### Scenario 1: Investor Gets Investment Confirmation
```
Timeline:
T+0s    Backend: Startup signed the contract
T+0.1s  SignalR: Sends notification_received
T+1s    Frontend: Bell badge appears (6 notifications)
T+1.5s  User: Clicks bell to open notification center
T+2s    Notification visible:
        📋 "Contract finalized"
        "Startup has signed deal #39"
        "2 giây trước"
T+3s    User clicks notification
T+3.1s  API: Mark as read
T+3.2s  Navigation: User navigated to Investor Dashboard
T+3.5s  Deals section visible with deal #39 highlighted
```

### Scenario 2: Startup Gets Connection Request
```
Timeline:
T+0s    Backend: Investor sends connection request
T+0.2s  SignalR: Sends notification_received
T+1.5s  Frontend: Bell badge (3 notifications)
T+2s    Type: ConnectionRequest
        referenceId: 25
        Title: "Connection request"
        "Investor interested in your startup"
T+3s    User clicks notification
T+3.1s  API: Mark as read
T+3.2s  System: Fetch chat session from connection request
T+3.5s  ChatWindow opens with investor's profile
T+4s    User can now chat with investor
```

### Scenario 3: Live Update During Deal Negotiation
```
Timeline:
T+0s    User: Opens Investor Dashboard
T+5s    Notification 1:
        "Startup confirmed deal #40"
T+10s   Notification 2:
        "Startup ready to sign contract #40"
T+15s   Notification 3:
        "Contract finalized #40"
        
All appear in real-time without page refresh!
```

## API Endpoints Used

```
GET /api/Notifications
├─ params: page=1, pageSize=10
├─ returns: { items: [...], totalCount: 15, totalPages: 2 }
└─ called: on component mount

PUT /api/Notifications/{notificationId}/read
├─ notificationId: number
├─ returns: { success: true }
└─ called: when user clicks or opens notification

PUT /api/Notifications/read-all
├─ returns: { success: true }
└─ called: when user clicks "Mark all as read"

DELETE /api/Notifications/{notificationId}
├─ notificationId: number
├─ returns: { success: true }
└─ called: when user clicks [🗑️] delete button

SignalR: /hubs/notifications
├─ connection.on('notification_received', (data) => ...)
├─ called: whenever backend sends new notification
└─ real-time, no polling needed
```

## Performance Considerations

```
✅ Good
- Real-time via SignalR (no polling)
- Pagination: only 10 notifications loaded
- State updates localized to NotificationCenter
- No re-renders of entire app

⚠️ Consider if growing
- Add virtual scrolling for 100+ notifications
- Archive old notifications (30+ days)
- Implement notification preferences
- Add search/filter capability
```

## Troubleshooting Decision Tree

```
Problem: Notifications not appearing
├─ Check 1: Is bell icon visible?
│  └─ No → NotificationCenter not mounted in FeedHeader
│  └─ Yes → Continue
├─ Check 2: Is unread badge showing?
│  └─ No → No unread notifications exist
│  └─ Yes → Continue
└─ Check 3: Click bell, does panel open?
   └─ No → CSS issue or onClick not working
   └─ Yes → Continue

Problem: Real-time notifications not working
├─ Check 1: Is SignalR connected?
│  └─ Open DevTools > Network > WS filter
│  └─ If red: /hubs/notifications not connected
├─ Check 2: Is notificationReceived callback registered?
│  └─ Search console for '[SignalRService] Notification received'
└─ Check 3: Does state update happen?
   └─ Add console.log in setNotifications to verify

Problem: Click notification but nothing happens
├─ Check 1: What is referenceType value?
├─ Check 2: Is referenceId set?
├─ Check 3: Check console for errors in click handler
└─ Check 4: Verify window.location.href hasn't changed
```
