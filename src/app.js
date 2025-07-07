const express = require("express");
 const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
// app.get("/user",(req,res)=> {
//     res.send({firstName:"vikash",lastName:"sengar"});
// });
// app.post("/user",(req,res) => {
//     console.log("save data to the database");
//     res.send("data send successfully to the database!");
// });
// app.delete("/user",(req,res)=>{
//     res.send("deleted successfully");
// });
// app.use("/test",(req,res) => {
//     res.send("hello from the server");
// });
// app.get("/admin/getAllData",(req,res) =>{
//     res.send("all data sent");
// });
// app.get("/admin/deleteUser",(req,res) =>{
//     res.send("deleted data");
// });

app.post("/signup",async(req,res) =>{
    // const userObj = {
    //     firstName:"shresth",
    //     lastName:"singhal",
    //     emailId:"shresth@123",
    //     password:"8990843745"
    // }
    //creating a new instance of the 
    const user = new User ({
          firstName:"virat",
        lastName:"kohli",
        emailId:"virat@123",
        password:"carpedium@123"

    });
    try {
   await user.save();
   res.send("User added successfully!");
    }catch (err) {
        res.status(400).send("Error saving the user:"+err.message);
    };
});




connectDB()
.then(() => {
        console.log("database connection established");
        app.listen(7777,() => {
    console.log("server is successfully listening on port 7777....");
});

})
.catch ((err) => {
    console.error("database cannot be connected");
});

