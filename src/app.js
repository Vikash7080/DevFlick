const express = require("express");
require("dotenv").config(); 
const connectDB = require("./config/database");
const app = express();

const PORT = process.env.PORT || 5000;


const cookieParser = require("cookie-parser");
const cors = require("cors");
// const { userAuth } = require("./middlewares/auth.js");


app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"], // explicitly allow PATCH etc.
  allowedHeaders: ["Content-Type", "Authorization"], // optional: customize if needed
}));


const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);



connectDB()
    .then(() => {
        console.log("Database connection established");
        app.listen(PORT, () => {
            console.log("Server is listening on port 7777...");
        });
    })
    .catch((err) => {
        console.error("Database cannot be connected:", err.message);
    });
