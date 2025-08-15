const mongoose = require("mongoose");

const connect_MongoNoSQL_DB = (url) => {
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("NoSQL DB connected success"); // Changed success log message
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process on connection failure
  });
};

module.exports = connect_MongoNoSQL_DB;
