const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");

const app = express();
app.use(express.json()); // Middleware to parse incoming JSON requests

// Route: Signup new user
app.post("/signup", async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        res.send("User added successfully!");
    } catch (err) {
        res.status(400).send("Error saving the user: " + err.message);
    }
});

// Route: Get a single user by email (via query param)
app.get("/user", async (req, res) => {
    const userEmail = req.query.email; // URL: /user?email=test@example.com

    if (!userEmail) {
        return res.status(400).send("email query parameter is required");
    }

    try {
        const user = await User.findOne({ emailId: userEmail });

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.send(user);
    } catch (err) {
        res.status(500).send("Something went wrong: " + err.message);
    }
});

// Route: Get all users
app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (err) {
        res.status(500).send("Something went wrong: " + err.message);
    }
});

// Delete user from database
 app.delete("/user", async (req, res) => {
    const userId = req.body.userId;

    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.send("User deleted successfully");
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
});

// Update user info in the database
// Update user info in the database
app.patch("/user", async (req, res) => {
    const userId = req.body.userId;
    const data = req.body;

    const ALLOWED_UPDATES = [
        "userId",
        "firstName",
        "lastName",
        "emailId",
        "password",
        "photoUrl",
        "about",
        "gender",
        "age",
        "skills"
    ];

    const isUpdateAllowed = Object.keys(data).every((key) =>
        ALLOWED_UPDATES.includes(key)
    );

    if (!isUpdateAllowed) {
        return res.status(400).send("Invalid update fields detected.");
    }
    if(data?.skills.length>10){
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

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.send("User updated successfully");
    } catch (err) {
        res.status(400).send("UPDATE FAILED: " + err.message);
    }
});

// Connect to database and start server
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
