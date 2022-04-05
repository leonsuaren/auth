require('dotenv').config({path: "./config.env"});
const express = require('express');

const app = express();
const routes = require('./routes/auth');

app.use(express.json());

app.use('/api/auth', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})