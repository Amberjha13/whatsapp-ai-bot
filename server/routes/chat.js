const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");

// GET /api/chat/conversations  — list all conversations
router.get("/conversations", async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .sort({ lastActive: -1 })
      .select("phoneNumber displayName totalMessages lastActive isActive");
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/conversations/:id  — get full conversation
router.get("/conversations/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ error: "Not found" });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/stats  — dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const total = await Conversation.countDocuments();
    const active = await Conversation.countDocuments({ isActive: true });
    const totalMessages = await Conversation.aggregate([
      { $group: { _id: null, sum: { $sum: "$totalMessages" } } },
    ]);
    res.json({
      totalConversations: total,
      activeConversations: active,
      totalMessages: totalMessages[0]?.sum || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
