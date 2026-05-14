const Conversation = require("../models/Conversation");
const { generateReply } = require("../services/claude");
const { sendMessage } = require("../services/twilio");

/**
 * POST /webhook/whatsapp
 * Twilio sends incoming WhatsApp messages here.
 */
async function handleIncoming(req, res) {
  // Acknowledge Twilio immediately (must respond within 15s)
  res.status(200).send("<Response></Response>");

  const { From, Body, ProfileName } = req.body;

  if (!From || !Body) return;

  const phoneNumber = From; // e.g. "whatsapp:+919876543210"
  const userMessage = Body.trim();

  console.log(`📩 [${ProfileName || phoneNumber}]: ${userMessage}`);

  try {
    // ── 1. Load or create conversation ──────────────────────────
    let conversation = await Conversation.findOne({ phoneNumber });

    if (!conversation) {
      conversation = new Conversation({
        phoneNumber,
        displayName: ProfileName || phoneNumber,
      });
    }

    // ── 2. Add user message ──────────────────────────────────────
    conversation.messages.push({ role: "user", content: userMessage });
    conversation.totalMessages += 1;
    conversation.lastActive = new Date();
    conversation.displayName = ProfileName || conversation.displayName;

    // ── 3. Build context & call Claude ──────────────────────────
    const contextMessages = conversation.getContextMessages();
    const reply = await generateReply(contextMessages);

    // ── 4. Save assistant reply ──────────────────────────────────
    conversation.messages.push({ role: "assistant", content: reply });
    await conversation.save();

    // ── 5. Send reply via Twilio ─────────────────────────────────
    await sendMessage(phoneNumber, reply);

    console.log(`🤖 Replied to ${ProfileName || phoneNumber}`);
  } catch (err) {
    console.error("❌ Error handling message:", err.message);
    // Attempt to send a fallback message
    try {
      await sendMessage(
        phoneNumber,
        "Sorry, I'm having trouble right now. Please try again in a moment."
      );
    } catch (_) {}
  }
}

module.exports = { handleIncoming };
