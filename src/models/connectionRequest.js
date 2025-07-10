const mongoose  = require("mongoose");
const connectionRequestSchema = new mongoose.Schema (
    {
        fromUserId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
        },
        toUserId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
        },
        status :{
            type:String,
            required:true,
            enum:{
                values:["ignore","interested","accepeted ","rejected"],
                message: `{VALUE} is incorrect status type`,

            },
        },

},
{timestamps:true}
); 



//pre hook kund of a middleware that is used to check whether that touser id and fromuser id is same if it same then give res..
connectionRequestSchema.pre("save", function () {
  const connectionRequest = this;

  // Check if the fromUserId is same as toUserId
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send connection request to yourself!");
  }

  next();
});






const ConnectionRequestModel = new mongoose.model("ConnectionRequest",connectionRequestSchema);

module.exports = ConnectionRequestModel;


