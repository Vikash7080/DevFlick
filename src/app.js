const express = require("express");
require("dotenv").config();
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
//const chatRouter = require("./routes/chat");   
const http = require("http");
const {initializeSocket} = require("./utils/socket");

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Normal JSON parsing for normal routes
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Test route
app.get("/", (req, res) => res.send("✅ Backend is running!"));

// Routers
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chat")

// ✅ Webhook route – raw body only
app.post(
  "/payment/webhook",
  express.raw({ type: "application/json" }),
  paymentRouter.stack.find(r => r.route && r.route.path === '/payment/webhook').route.stack[0].handle
);

// Normal routes
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter); // /payment/create and /premium/verify
app.use("/", chatRouter); 
const server = http.createServer(app);//configuration for the sockets
initializeSocket(server);



// Start server
connectDB()
  .then(() => {
    console.log("Database connection established");
    server.listen(PORT, () => console.log(`Server listening on ${PORT}..`));
  })
  .catch(err => console.error("DB connection failed:", err.message));
