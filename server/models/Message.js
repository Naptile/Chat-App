const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status:{
      type:String,
      enum:['sent','delivered','seen'],
      default:'sent'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);