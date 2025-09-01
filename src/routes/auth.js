const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateSignUpData } = require("../utils/validation");

// ---------- SIGNUP ----------
authRouter.post("/signup", async (req, res) => {
  try {
    // Validate request body
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ firstName, lastName, emailId, password: passwordHash });
    const savedUser = await user.save();

    // Generate JWT
    const token = await savedUser.getJWT();

    // Set cookie
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), // 8 hours
      httpOnly: true,
      secure: true,       // ✅ Production: HTTPS
      sameSite: "none",   // ✅ Cross-site
    });

    res.json({ message: "User added successfully!", data: savedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- LOGIN ----------
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    // Generate JWT
    const token = await user.getJWT();

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 8 * 3600000, // 8 hours
    });

    res.json({ message: "Login successful!", data: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- LOGOUT ----------
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({ message: "Logout successful!" });
});

module.exports = authRouter;
