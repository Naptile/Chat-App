const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },

    image: {
  type: String,
},

    //  store when message was seen
    seenAt: {
      type: Date,
    },

    //  (for future features like images/files)
    type: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
  },
  { timestamps: true } // createdAt = sent time
);

module.exports = mongoose.model("Message", messageSchema);