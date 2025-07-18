const mongoose  = require("mongoose");
const connectionRequestSchema = new mongoose.Schema (
    {
        fromUserId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",//reference to the User collection
            required:true,
        },
        toUserId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        status :{
            type:String,
            required:true,
         enum: {
  values: ["ignored", "interested", "accepted", "rejected"],
  message: `{VALUE} is an incorrect status type`,
}
,
        },

},
{timestamps:true}
); 

// compound indexes..to manage faster query
connectionRequestSchema.index({fromUserId:1,toUserId:1});




//pre hook kund of a middleware that is used to check whether that touser id and fromuser id is same if it same then give res..
connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;

  // Check if the fromUserId is same as toUserId
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send connection request to yourself!");
  }

  next();
});






const ConnectionRequestModel = new mongoose.model("ConnectionRequest",connectionRequestSchema);

module.exports = ConnectionRequestModel;


