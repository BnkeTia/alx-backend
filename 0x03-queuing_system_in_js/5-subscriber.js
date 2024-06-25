#!/usr/bin/node

// Import the Redis client
const { createClient } = require('redis');

// Create a Redis client
const client = createClient();

// Handle connection events
client.on('connect', () => {
  console.log('Redis client connected to the server');
});

client.on('error', (err) => {
  console.log(`Redis client not connected to the server: ${err.message}`);
});

// Subscribe to the 'holberton school channel'
client.subscribe('holberton school channel');

// Handle messages received on the subscribed channel
client.on('message', (channel, message) => {
  console.log(message);
  if (message === 'KILL_SERVER') {
    client.unsubscribe('holberton school channel');
    client.quit();
  }
});
