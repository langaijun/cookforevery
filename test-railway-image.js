// Test script for Railway image generation API
const fs = require('fs');
const path = require('path');

// Test the API endpoint directly
const testUrl = 'https://cookforevery-production.up.railway.app/api/test-image-generation';

console.log('Testing Railway image generation API...');
console.log('URL:', testUrl);

// Simple test using fetch
fetch(testUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: '测试菜品',
    description: '这是一个测试菜品'
  })
})
.then(response => {
  console.log('Response status:', response.status);
  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
})
.then(data => {
  console.log('Response data:', data);
})
.catch(error => {
  console.error('Error:', error.message);
});