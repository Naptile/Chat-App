const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");

// ========================================
// GET CONVERSATION (CHAT HISTORY)
// ========================================
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name")
      .populate("receiver", "name");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
//  MARK MESSAGES AS SEEN
// ========================================
router.put("/seen/:userId", authMiddleware, async (req, res) => {
  try {
    await Message.updateMany(
      {
        sender: req.params.userId,
        receiver: req.user.id,
        status: { $ne: "seen" },
      },
      {
        status: "seen",
        seenAt: new Date(),
      }
    );

    res.json({ message: "Messages marked as seen" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;