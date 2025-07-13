const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateSignUpData } = require("../utils/validation");

// Signup route
authRouter.post("/signup", async (req, res) => {
    try {
        validateSignUpData(req);
        const { firstName, lastName, emailId, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
        });

        await user.save();
        res.send("User added successfully!");
    } catch (err) {
        res.status(400).send("Error saving the user: " + err.message);
    }
});

// Login route
authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId });
        if (!user) throw new Error("Invalid credentials");

        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) throw new Error("Invalid credentials");

        const token = await user.getJWT();

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        });

        res.send(user);
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});
//Logout
authRouter.post("/logout",async(req,res) => {
    res.cookie("token",null,{
        expires:new Date(Date.now()),
    });
    res.send("Logout Successful!!!");
})

module.exports = authRouter;
