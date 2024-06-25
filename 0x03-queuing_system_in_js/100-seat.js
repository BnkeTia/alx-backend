const redis = require('redis');
const { promisify } = require('util');
const express = require('express');
const kue = require('kue');

const app = express();
const port = 1245;

// Redis client setup
const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Initialize available seats and reservation status
let availableSeats = 50;
let reservationEnabled = true;

// Reserve seat function
async function reserveSeat(number) {
  await setAsync('available_seats', number);
}

// Get current available seats function
async function getCurrentAvailableSeats() {
  const seats = await getAsync('available_seats');
  return parseInt(seats) || 0;
}

// Kue queue setup
const queue = kue.createQueue();

// Routes
app.get('/available_seats', async (req, res) => {
  const numberOfAvailableSeats = await getCurrentAvailableSeats();
  res.json({ numberOfAvailableSeats });
});

app.get('/reserve_seat', async (req, res) => {
  if (!reservationEnabled) {
    return res.json({ status: "Reservation are blocked" });
  }

  const job = queue.create('reserve_seat').save((err) => {
    if (err) {
      return res.json({ status: "Reservation failed" });
    }
    res.json({ status: "Reservation in process" });
  });
});

app.get('/process', async (req, res) => {
  res.json({ status: "Queue processing" });

  queue.process('reserve_seat', async (job, done) => {
    const currentSeats = await getCurrentAvailableSeats();

    if (currentSeats === 0) {
      reservationEnabled = false;
      return done(new Error('Not enough seats available'));
    } else {
      availableSeats--;
      await reserveSeat(availableSeats);

      if (availableSeats === 0) {
        reservationEnabled = false;
      }

      console.log(`Seat reservation job ${job.id} completed`);
      done();
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
