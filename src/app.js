const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middlewares/auth.js");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId });
        if (!user) throw new Error("Invalid credentials");

        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) throw new Error("Invalid credentials");
        const token = await user.getJWT();

        // const token = jwt.sign({ _id: user._id }, "Dev1234@123", {
        //     expiresIn: "7d"
        // });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        });

        res.send("Login Successful!!!");
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

app.get("/profile", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(401).send("Invalid or missing token: " + err.message);
    }
});

app.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.send("Logged out successfully");
});

app.get("/user", async (req, res) => {
    const userEmail = req.query.email;
    if (!userEmail) {
        return res.status(400).send("email query parameter is required");
    }
    try {
        const user = await User.findOne({ emailId: userEmail });
        if (!user) return res.status(404).send("User not found");
        res.send(user);
    } catch (err) {
        res.status(500).send("Something went wrong: " + err.message);
    }
});

app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (err) {
        res.status(500).send("Something went wrong: " + err.message);
    }
});

app.delete("/user", async (req, res) => {
    const userId = req.body.userId;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) return res.status(404).send("User not found");
        res.send("User deleted successfully");
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
});

app.patch("/user", async (req, res) => {
    const userId = req.body.userId;
    const data = req.body;
    const ALLOWED_UPDATES = [
        "userId", "firstName", "lastName", "emailId", "password",
        "photoUrl", "about", "gender", "age", "skills"
    ];

    const isUpdateAllowed = Object.keys(data).every((key) =>
        ALLOWED_UPDATES.includes(key)
    );

    if (!isUpdateAllowed) {
        return res.status(400).send("Invalid update fields detected.");
    }

    if (data?.skills?.length > 10) {
        throw new Error("skills cannot be more than 10");
    }

    try {
        const user = await User.findByIdAndUpdate(
            { _id: userId },
            data,
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!user) return res.status(404).send("User not found");
        res.send("User updated successfully");
    } catch (err) {
        res.status(400).send("UPDATE FAILED: " + err.message);
    }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
    const user = req.user;
    res.send(user.firstName + " sent the connect request!");
});

connectDB()
    .then(() => {
        console.log("Database connection established");
        app.listen(7777, () => {
            console.log("Server is listening on port 7777...");
        });
    })
    .catch((err) => {
        console.error("Database cannot be connected:", err.message);
    });
