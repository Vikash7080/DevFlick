require('dotenv').config();
const mongoose = require("mongoose");
const connectDB  = async () =>{


await mongoose.connect(process.env.CONNECT_URL);
};
module.exports = connectDB;
