const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("Token is not valid");
        }

        const decoded = jwt.verify(token, "Dev1234@123");
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).send("User not found");
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).send("AUTH ERROR: " + err.message);
    }
};

module.exports = { userAuth };
