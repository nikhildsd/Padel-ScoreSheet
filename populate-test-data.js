#!/usr/bin/env node

// Simple script to populate test data
// Run this with: node populate-test-data.js

const baseUrl = 'http://localhost:3000';

async function populateTestData() {
  try {
    console.log('🎾 Populating Padel courts with random test data...');

    const response = await fetch(`${baseUrl}/api/populate-test-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Success!', result.message);
      console.log('🕒 Timestamp:', result.timestamp);
      console.log('\n🏆 All courts now have random team names and scores!');
      console.log('📱 Check your app at http://localhost:3000');
    } else {
      console.error('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('\n💡 Make sure your Next.js app is running on http://localhost:3000');
  }
}

// Run the script
populateTestData();