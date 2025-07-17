const express = require("express");
require("dotenv").config(); 
const connectDB = require("./config/database");
const app = express();

const PORT = process.env.PORT || 5000;

const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// 👉 Add this test route
app.get("/", (req, res) => {
  res.send("✅ Backend is running on Render!");
});

// Routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

// Start server after DB connection
connectDB()
  .then(() => {
    console.log("Database connection established");
    app.listen(PORT, () => {
      console.log(`Server is listening on ${PORT}..`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected:", err.message);
  });
