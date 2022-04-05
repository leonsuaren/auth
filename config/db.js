const monggose = require('mongoose');

const connectDB = async () => {
  await monggose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
    });

    console.log("MongoDb connected");
}

module.exports = connectDB;