const mongoose = require("mongoose");
require('colors')

// Replace this with your MONGOURI.
const MONGOURI = "mongodb+srv://tarun:12345@cluster0.0xysk.mongodb.net/insulink?retryWrites=true&w=majority";

const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(MONGOURI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true
      
    });
    console.log("Connected to DB !!".america);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = InitiateMongoServer;