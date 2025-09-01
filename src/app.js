const express = require("express");
require("dotenv").config();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { initializeSocket } = require("./utils/socket");

// Routers
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chat");

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- CORS ----------
const allowedOrigins = [
  "http://localhost:5173",                 // Dev frontend
  "https://dev-flick-web.vercel.app",  
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ---------- Webhook Route (must be raw body) ----------
app.use(
  "/payment/webhook",
  express.raw({ type: "application/json" }),
  paymentRouter
);

// ---------- Middlewares ----------
app.use(cookieParser());
app.use(express.json());

// ---------- Test route ----------
app.get("/", (req, res) => res.send("✅ Backend is running!"));

// ---------- Routers ----------
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);   // /payment/create + /premium/verify
app.use("/", chatRouter);

// ---------- Start Server + Socket ----------
const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database connection established");
    server.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}..`));
  })
  .catch(err => console.error("DB connection failed:", err.message));
