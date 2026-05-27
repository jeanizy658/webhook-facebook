const express = require('express');
const app = express();

app.use(express.json());

const VERIFY_TOKEN = 'allstore123';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];

      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message) {
        const messageText = webhookEvent.message.text;

        console.log('Message reçu:', messageText);

        await sendMessage(senderId, `Vous avez dit: ${messageText}`);
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

async function sendMessage(senderId, message) {
  await fetch(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: {
          id: senderId,
        },
        message: {
          text: message,
        },
      }),
    }
  );
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
