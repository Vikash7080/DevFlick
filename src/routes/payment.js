const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const User = require("../models/user");
const { membershipAmount } = require("../utils/constants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

// ✅ Create Razorpay Order
paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType,
      },
    });

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

// ✅ Confirm Payment instantly (called from frontend handler)
paymentRouter.post("/payment/confirm", userAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id } = req.body;

    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    payment.status = "captured";
    payment.paymentId = razorpay_payment_id;
    await payment.save();

    const user = await User.findById(payment.userId);
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();

    return res.json({ msg: "Payment confirmed & user upgraded to premium" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

// ✅ Webhook (backup if handler misses)
paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get("X-Razorpay-Signature");
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      return res.status(400).json({ msg: "Invalid webhook signature" });
    }

    const paymentDetails = req.body.payload.payment.entity;
    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    if (!payment) return res.status(404).json({ msg: "Payment not found" });

    payment.status = paymentDetails.status;
    await payment.save();

    const user = await User.findById(payment.userId);
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();

    return res.status(200).json({ msg: "Webhook processed successfully" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

// ✅ Verify Premium
paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  const user = req.user.toJSON();
  return res.json({ ...user });
});

module.exports = paymentRouter;
