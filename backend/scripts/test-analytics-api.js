const fetch = require('node-fetch');

async function testAnalyticsAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/analytics/users?startDate=2026-01-01');
    const data = await response.json();
    
    // Find Yaakov in the results
    const yaakov = data.data.find(u => u.email === 'yaakoveidan@gmail.com' || u.full_name?.includes('Yaakov'));
    
    console.log('Yaakov in Analytics API:');
    console.log(JSON.stringify(yaakov, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAnalyticsAPI();
