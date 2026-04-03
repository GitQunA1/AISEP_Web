/**
 * Quick API Test Script
 * Run this in browser console to debug the investment API
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Make sure you're on the investor dashboard
 * 3. Copy and paste this entire script
 * 4. Run: testInvestmentAPI()
 */

const testInvestmentAPI = async () => {
  console.clear();
  console.log('🔍 AISEP Investment API Debug Test');
  console.log('=====================================\n');

  // Test 1: Check Authentication
  console.log('📋 TEST 1: Authentication Check');
  console.log('------------------------------');
  
  const token = localStorage.getItem('aisep_token');
  const refreshToken = localStorage.getItem('aisep_refresh_token');
  const user = localStorage.getItem('aisep_user');
  
  if (!token) {
    console.error('❌ FAILED: No token found!');
    console.log('   Make sure you are logged in as an investor');
    console.log('   Available localStorage keys:', Object.keys(localStorage));
    return;
  }
  
  console.log('✓ Token found:', token.substring(0, 30) + '...');
  console.log('✓ User:', user ? JSON.parse(user) : 'Not stored');
  console.log('✓ Status: AUTHENTICATED\n');

  // Test 2: Direct API Call
  console.log('📋 TEST 2: GET /api/Deals Request');
  console.log('------------------------------');
  
  try {
    const response = await fetch('/api/Deals', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Network Response:');
    console.log('  Status:', response.status, response.statusText);
    console.log('  Headers:', {
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    });

    const data = await response.json();
    
    console.log('\nResponse Body:');
    console.log('  Success:', data.success);
    console.log('  Status Code:', data.statusCode);
    console.log('  Message:', data.message);
    
    console.log('\nResponse Data:');
    if (Array.isArray(data.data)) {
      console.log(`  Type: Array with ${data.data.length} items`);
      if (data.data.length > 0) {
        console.log('  First item:', data.data[0]);
      } else {
        console.log('  ℹ️  No deals found (array is empty)');
      }
    } else if (data.data && data.data.items) {
      console.log(`  Type: Object with items array (${data.data.items.length} items)`);
      if (data.data.items.length > 0) {
        console.log('  First item:', data.data.items[0]);
      }
    } else {
      console.log('  Type:', typeof data.data);
      console.log('  Structure:', data.data);
    }
    
    console.log('\n✓ API Request SUCCESSFUL\n');
    
    // Test 3: Get Contract Status if deals exist
    if (data.data && (Array.isArray(data.data) ? data.data.length > 0 : data.data.items?.length > 0)) {
      const deals = Array.isArray(data.data) ? data.data : data.data.items;
      const firstDeal = deals[0];
      const dealId = firstDeal.dealId || firstDeal.id;
      
      console.log('📋 TEST 3: GET /api/Deals/{dealId}/contract-status');
      console.log('------------------------------');
      console.log(`Testing with dealId: ${dealId}\n`);
      
      try {
        const statusResponse = await fetch(`/api/Deals/${dealId}/contract-status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Status Response:');
        console.log('  HTTP Status:', statusResponse.status);
        
        const statusData = await statusResponse.json();
        console.log('  Success:', statusData.success);
        console.log('  Status:', statusData.data?.status);
        console.log('  Full response:', statusData);
        
        console.log('\n✓ Contract Status SUCCESSFUL\n');
      } catch (err) {
        console.error('❌ Contract Status FAILED:', err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ API Request FAILED:', error);
    console.error('  Message:', error.message);
    console.error('  Make sure backend is running');
    console.error('  Check CORS settings if error is about network');
    return;
  }

  console.log('🎉 All tests completed!');
  console.log('\nSummary:');
  console.log('  ✓ Authentication: OK');
  console.log('  ✓ API Connection: OK');
  console.log('\nIf deals still not showing:');
  console.log('  1. Make sure you have made at least one investment');
  console.log('  2. Check dashboard "Đang đầu tư" tab');
  console.log('  3. Try refreshing the page (Ctrl+R)');
};

// Run the test
testInvestmentAPI();
