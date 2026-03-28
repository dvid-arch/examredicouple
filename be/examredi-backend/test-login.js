import http from 'http';
import https from 'https';

const API_BASE = 'http://localhost:5000/api'; // Assuming backend runs on 5000

async function testFlow() {
  const fetch = (await import('node-fetch')).default || global.fetch;

  console.log('1. Registering user...');
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Testy',
      email: 'testy3@example.com',
      password: 'Password1!',
    })
  });

  const regData = await regRes.json();
  console.log('Register Response Status:', regRes.status);
  
  if (!regRes.ok) {
     console.log('Register failed:', regData);
     return;
  }
  
  const token = regData.accessToken;
  console.log('Got token:', token ? 'yes' : 'no');

  console.log('2. Fetching profile...');
  const profRes = await fetch(`${API_BASE}/auth/profile`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const profData = await profRes.text();
  console.log('Profile Response Status:', profRes.status);
  console.log('Profile Response Body:', profData);
}

testFlow().catch(console.error);
