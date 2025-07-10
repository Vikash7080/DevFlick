const express = require("express");
const requestRouter = express.Router();
const jwt = require("jsonwebtoken");
const { userAuth } = require("../middlewares/auth"); // ✅ Correct import path

requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
    const user = req.user;
    res.send(user.firstName + " sent the connect request!");
});

module.exports = requestRouter;
