const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// get all users except current user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user.id }, // exclude logged-in user
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;