const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, index: true },
    displayName: { type: String, default: "Unknown" },
    messages: [messageSchema],
    totalMessages: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Keep only the last 20 messages in context (cost control)
conversationSchema.methods.getContextMessages = function () {
  return this.messages.slice(-20).map((m) => ({
    role: m.role,
    content: m.content,
  }));
};

module.exports = mongoose.model("Conversation", conversationSchema);
