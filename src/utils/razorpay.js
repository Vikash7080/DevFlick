require("dotenv").config(); // make sure envs load first

const Razorpay = require("razorpay");

// // Debug log
// console.log("Razorpay key:", process.env.RAZORPAY_KEY_ID);
// console.log("Razorpay secret:", process.env.RAZORPAY_KEY_SECRET);

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = instance;
