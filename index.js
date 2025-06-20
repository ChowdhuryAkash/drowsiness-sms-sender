require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const app = express();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Parse JSON body
app.use(express.json());

app.post('/sendAlertSms', async (req, res) => {
  const {
    text, // Car number text from the request body
    lat,
    lon
   } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Missing car number text' });
  }

  const messageBody = 
  `Drowsy Driver Alert\n` +
  `Vehicle No: ${text}\n` +
  `Location: Lat ${lat}, Lon ${lon}\n` +
  `See in Map: https://www.google.com/maps?q=${lat},${lon}\n` +
  `Please Take immediate action.`;

  try {
    const message = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.RECEIVER_PHONE_NUMBER,
    });

    res.status(200).json({ success: true, sid: message.sid });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
