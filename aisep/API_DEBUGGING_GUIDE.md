# 🔍 API Debugging Guide - Investment Feature Troubleshooting

## Problem Summary
The investment feature is not showing data in the dashboard after creation. This guide will help identify the exact issue.

---

## Quick Debugging Steps

### Step 1️⃣: Check Authentication
Open browser console (F12) and run:
```javascript
// Check if token exists
const token = localStorage.getItem('aisep_token');
console.log('Token:', token ? '✓ Present' : '❌ Missing');
console.log('All localStorage keys:', Object.keys(localStorage));
```

**Expected**: Should show `aisep_token` in the keys array

---

### Step 2️⃣: Check API Call After Login
After logging in as investor, go to Dashboard > "Đang đầu tư" tab and open console (F12).

**Look for these logs in order:**
```
[InvestorDashboard] === FETCHING DEALS ===
[InvestorDashboard] Auth check: 
  ✓ isAuthenticated: true
[dealsService] GET /api/Deals - Starting request
[dealsService] GET /api/Deals - Response:
  ✓ success: true
  ✓ statusCode: 200
[InvestorDashboard] Full deals response:
```

---

### Step 3️⃣: Common Issues and Solutions

#### ❌ Issue 1: `Auth check: isAuthenticated: false`
**Problem**: Token not found in localStorage

**Solution**:
1. Make sure you're logged in
2. Check that login is saving token with key `aisep_token` (not just `token`)
3. Try logging in again, then immediately check localStorage

**Verification code**:
```javascript
console.log('After login - all localStorage:', Object.keys(localStorage).filter(k => k.includes('token')));
```

---

#### ❌ Issue 2: `401 Unauthorized` or `403 Forbidden` errors
**Problem**: Token is set but API rejects it

**Solution**:
1. Double-check backend API URL in `vite.config.js`
2. Verify token is still valid (tokens expire)
3. Try logging out and logging back in
4. Check backend logs for why token was rejected

**Check in Console**:
```javascript
console.log('Token (first 50 chars):', localStorage.getItem('aisep_token')?.substring(0, 50));
```

---

#### ❌ Issue 3: `GET /api/Deals` returns empty array or no data
**Problem**: API returns `{success: true, data: []}` but deals list is empty

**This is NORMAL if you haven't made any investments yet!**

**Verify by**:
1. Clicking "Đầu tư" button on a project
2. Submitting the investment form
3. Look for: `[InvestmentModal] ✓ Successfully dispatched deal_created event`
4. Check dashboard "Đang đầu tư" tab - new deal should appear

---

#### ❌ Issue 4: Investment form doesn't open or doesn't submit
**Problem**: "Đầu tư" button not working

**Check in console**:
```javascript
// Check if InvestmentModal component is registered
console.log('InvestmentModal available:', typeof InvestmentModal);
```

**Look for these logs when clicking invest**:
```
[InvestmentModal] Full response from POST /api/Deals:
[InvestmentModal] ✓ Extracted dealId: {number}
[InvestmentModal] Fetching contract status for dealId={number}
```

If you DON'T see these logs, the modal didn't open or form didn't submit.

---

### Step 4️⃣: Advanced Debug - Full API Test

Run this in browser console:

```javascript
// Test if GET /api/Deals works
const testGetDeals = async () => {
  try {
    const response = await fetch('/api/Deals', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('aisep_token')}`
      }
    });
    const data = await response.json();
    console.log('✓ Direct API test successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Direct API test failed:', error);
  }
};

testGetDeals();
```

---

## 📊 Expected Log Sequence After Investing

### When You Click "Đầu tư" Button:
```
[InvestmentModal] Full response from POST /api/Deals: {success: true, data: {dealId: 14, ...}}
[InvestmentModal] ✓ Extracted dealId: 14
[InvestmentModal] Fetching contract status for dealId=14
[InvestmentModal] Contract status response: {success: true, data: {status: "Pending", ...}}
[InvestmentModal] ✓ Deal status fetched and set: Chờ xác nhận
[InvestmentModal] 📤 Dispatching deal_created event: {dealId: 14, ...}
[InvestmentModal] ✓ Successfully dispatched deal_created event
```

### Automatically in Dashboard:
```
[InvestorDashboard] New deal created event received: {dealId: 14, ...}
[InvestorDashboard] refreshDeals() called - triggering refetch
[InvestorDashboard] === FETCHING DEALS ===
[dealsService] GET /api/Deals - Starting request
[dealsService] GET /api/Deals - Response: {success: true, dataLength: 1}
[InvestorDashboard] ✓ Using dealsRes.data.items structure: [...]
[InvestorDashboard] Found 1 deals
[InvestorDashboard] Processing deal 1/1 (ID: 14)
[InvestorDashboard] ✓ All deals processed: [...]
```

---

## 🔴 Red Flags to Look For

| Log Message | Problem |
|--|--|
| `❌ NOT AUTHENTICATED - No token found` | Not logged in or token not saved |
| `⚠️ Unexpected data structure:` | API response format changed - backend issue |
| `GET /api/Deals - Error: 404` | API endpoint doesn't exist |
| `GET /api/Deals - Error: 500` | Backend server error |
| `timeout of 8000ms exceeded` | API not responding - network/backend issue |

---

## 🛠️ Detailed Debugging Commands

Paste these in browser console (F12) to test:

### Test 1: Check Authentication State
```javascript
import apiDebug from './utils/apiDebug.js';
apiDebug.checkAuth();
```

### Test 2: Get all deals (if authenticated)
```javascript
import apiDebug from './utils/apiDebug.js';
import { apiClient } from './services/apiClient.js';
apiDebug.testGetDeals(apiClient);
```

### Test 3: Get contract status for a deal
```javascript
import apiDebug from './utils/apiDebug.js';
import { apiClient } from './services/apiClient.js';
apiDebug.testContractStatus(apiClient, 14); // Replace 14 with an actual dealId
```

---

## 📝 What to Report If It Still Doesn't Work

Open browser console (F12) and provide these details:

1. **Screenshot of console logs** when:
   - ✓ After you log in
   - ✓ When you click "Đầu tư" button
   - ✓ After you submit the investment form
   - ✓ When you check the "Đang đầu tư" dashboard tab

2. **Network tab errors** (F12 > Network):
   - Look for requests to `/api/Deals`
   - Check if responses are 200, 401, 403, 404, or 500

3. **Your role**: Are you logging in as:
   - [ ] Investor
   - [ ] Startup  
   - [ ] Advisor
   - [ ] Staff

4. **API URL**: Is it making requests to:
   - `https://api.aisep.tech/` ?
   - `http://localhost:5000/` ?
   - Something else?

---

## 🎯 Quick Checklist

- [ ] Logged in as **Investor** role
- [ ] Token present in localStorage (`aisep_token`)
- [ ] Can see project cards with "Đầu tư" button
- [ ] "Đầu tư" button opens Investment Modal
- [ ] Form submission succeeds (see success message with deal ID)
- [ ] Dashboard "Đang đầu tư" tab shows the new deal
- [ ] Investment shows with status badge and details

---

## 💡 Next Steps

1. **Follow the debugging steps above in order**
2. **Check the console logs** - they will pinpoint the exact issue
3. **Report what you see** - logs are the best debugging tool
4. **Try the verification scripts** - they'll test the API directly

The enhanced logging will help identify whether the problem is:
- 🔐 Authentication (token issue)
- 🌐 API endpoint (backend issue)
- 📝 Response format (data structure mismatch)  
- 🎯 Component logic (frontend rendering)
