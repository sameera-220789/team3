const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(() => {
    console.log("SUCCESS");
    process.exit(0);
  })
  .catch(err => {
    console.log("ERROR_MESSAGE:", err.message);
    process.exit(1);
  });
