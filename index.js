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
  const { text, lat, lon } = req.body;

  if (!text || !lat || !lon) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const messageBody = `A drowsiness driver detected with the probable car number ${text} at the location with Latitude-${lat} and Longitude-${lon}. Please take necessary action immediately.`;

  const recipients = [
    process.env.RECEIVER_PHONE_NUMBER,
    // "+919875519510",
    // "+919836356250"
  ];

  try {
    const results = await Promise.all(
      recipients.map((to) =>
        client.messages.create({
          body: messageBody,
          from: process.env.TWILIO_PHONE_NUMBER,
          to,
        })
      )
    );

    res.status(200).json({
      success: true,
      message: `Sent to ${recipients.length} numbers`,
      sids: results.map((msg) => msg.sid),
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ error: 'Failed to send SMS to all numbers' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
