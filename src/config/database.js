const mongoose = require("mongoose");
const connectDB  = async () =>{


await mongoose.connect("mongodb+srv://sengarvikash256:vihaan%407080@vikash.egta2x2.mongodb.net/DevFlick");
};
module.exports = connectDB;
