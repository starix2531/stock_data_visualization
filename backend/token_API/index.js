const express = require('express');
const { GoogleAuth } = require('google-auth-library');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/token', async (req, res) => {
  try {
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    res.json({ token: accessToken.token });
  } catch (error) {
    console.error('Error fetching access token:', error);
    res.status(500).json({ error: 'Failed to fetch access token' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
