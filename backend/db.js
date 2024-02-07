const mongoose = require('mongoose');

const mongoURL = "mongodb://0.0.0.0:27017";

const connectToMongo = () => {
    mongoose.connect(mongoURL)
    console.log("Connected to Mongo");
}
module.exports = connectToMongo;
 