require('dotenv').config({path: "./config.env"});
const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

const app = express();
const auth = require('./routes/auth');
const private = require('./routes/private');
connectDB();

app.use(express.json());

app.use('/api/auth', auth);
app.use('/api/private', private);

//Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})