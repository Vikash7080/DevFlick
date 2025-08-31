const express = require("express");
require("dotenv").config();
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { initializeSocket } = require("./utils/socket");

const PORT = process.env.PORT || 5000;

// ---------- Middlewares ----------
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ---------- Webhook Route (raw body must be BEFORE express.json) ----------
app.use(
  "/payment/webhook",
  express.raw({ type: "application/json" }),
  require("./routes/payment")
);

// ---------- Normal JSON parsing for other routes ----------
app.use(express.json());

// ---------- Test route ----------
app.get("/", (req, res) => res.send("✅ Backend is running!"));

// ---------- Routers ----------
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chat");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);   // /payment/create + /premium/verify
app.use("/", chatRouter);

// ---------- Start server ----------
const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database connection established");
    server.listen(PORT, () => console.log(`Server listening on ${PORT}..`));
  })
  .catch(err => console.error("DB connection failed:", err.message));
