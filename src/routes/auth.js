const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateSignUpData } = require("../utils/validation");

// ✅ SIGNUP Route
authRouter.post("/signup", async (req, res) => {
    try {
        // Validate request body
        validateSignUpData(req);

        const { firstName, lastName, emailId, password } = req.body;

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create a new user instance
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
        });

        // Save user to database
        const savedUser = await user.save();

        // Generate JWT
        const token = await savedUser.getJWT();

        // Set token in cookie
        res.cookie("token", token, {
            expires: new Date(Date.now() + 8 * 3600000), // 8 hours
            httpOnly: true,
            secure: true, // Set to true in production with HTTPS
            sameSite: "none",
        });

        // Respond with success
        res.json({ message: "User added successfully!", data: savedUser });
    } catch (err) {
        res.status(400).send("Error saving the user: " + err.message);
    }
});

// ✅ LOGIN Route
authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        // Find user by email
        const user = await User.findOne({ emailId });
        if (!user) throw new Error("Invalid credentials");

        // Validate password
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) throw new Error("Invalid credentials");

        // Generate JWT
        const token = await user.getJWT();

        // Set token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true, // Set to true in production with HTTPS
            sameSite: "none",
        });

        res.send(user);
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// ✅ LOGOUT Route
authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()), // Expire cookie now
        httpOnly: true,
        secures:true,
        sameSite: "none",
    });
    res.send("Logout Successful!!!");
});

module.exports = authRouter;
