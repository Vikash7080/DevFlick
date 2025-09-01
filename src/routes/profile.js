const express = require("express");
const profileRouter = express.Router();
const { validateEditProfileData } = require("../utils/validation");
const { userAuth } = require("../middlewares/auth");

// View profile
profileRouter.get("/profile/view", async (req, res) => {
  try {
    // Try to get user from token
    let user = null;
    try {
      await userAuth(req, res, () => {});
      user = req.user; // If authenticated
    } catch (_) {
      user = null; // If not authenticated, return null
    }
    res.json(user); // user object if logged in, else null
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Edit profile
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            throw new Error("Invalid Edit Request");
        }

        const loggedInUser = req.user;

        // ✅ update fields safely
        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key];
        });

        await loggedInUser.save();

        res.json({
            message: `${loggedInUser.firstName}, your profile updated successfully!`,
            data: loggedInUser,
        });
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

module.exports = profileRouter;
