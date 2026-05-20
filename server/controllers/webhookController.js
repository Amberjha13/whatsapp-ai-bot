const Conversation = require("../models/Conversation");
const { generateReply } = require("../services/claude");
const { sendMessage } = require("../services/twilio");

const FALLBACK_MESSAGE = "Sorry, I'm having trouble right now. Please try again in a moment.";
const TWILIO_TIMEOUT_MS = 14000; // Leave 1s margin for Twilio's 15s limit

/**
 * POST /webhook/whatsapp
 * Twilio sends incoming WhatsApp messages here.
 */
async function handleIncoming(req, res) {
  // Acknowledge Twilio immediately (must respond within 15s)
  res.status(200).send("<Response></Response>");

  // Validate incoming request
  const { From, Body, ProfileName } = req.body;

  if (!From?.trim() || !Body?.trim()) {
    console.warn("⚠️ Invalid webhook payload: missing From or Body");
    return;
  }

  const phoneNumber = From.trim();
  const userMessage = Body.trim();
  const displayName = ProfileName?.trim() || phoneNumber;

  console.log(`📩 [${displayName}]: ${userMessage}`);

  try {
    // ── 1. Load or create conversation ──────────────────────────
    let conversation = await Conversation.findOne({ phoneNumber }).exec();

    if (!conversation) {
      conversation = new Conversation({
        phoneNumber,
        displayName,
      });
    } else {
      // Update display name if provided
      conversation.displayName = displayName;
    }

    // ── 2. Add user message ──────────────────────────────────────
    conversation.messages.push({ role: "user", content: userMessage });
    conversation.totalMessages += 1;
    conversation.lastActive = new Date();

    // ── 3. Build context & call Claude ──────────────────────────
    const contextMessages = conversation.getContextMessages();
    
    console.debug(`📤 Sending ${contextMessages.length} messages to Claude`);
    const reply = await generateReply(contextMessages);

    // Validate Claude response
    if (!reply?.trim()) {
      console.error("❌ Claude returned empty response");
      await sendFallbackMessage(phoneNumber);
      return;
    }

    // ── 4. Save assistant reply ──────────────────────────────────
    conversation.messages.push({ role: "assistant", content: reply });
    
    try {
      await conversation.save();
    } catch (dbError) {
      console.error("❌ Database save failed:", dbError.message);
      // Still try to send the reply even if save failed
      await sendFallbackMessage(phoneNumber);
      return;
    }

    // ── 5. Send reply via Twilio ─────────────────────────────────
    await sendMessage(phoneNumber, reply);
    console.log(`✅ Replied to ${displayName}`);

  } catch (err) {
    console.error("❌ Error handling message:", {
      error: err.message,
      stack: err.stack,
      phoneNumber,
    });
    await sendFallbackMessage(phoneNumber);
  }
}

/**
 * Send fallback message with error handling
 */
async function sendFallbackMessage(phoneNumber) {
  try {
    await sendMessage(phoneNumber, FALLBACK_MESSAGE);
  } catch (err) {
    console.error("❌ Failed to send fallback message:", err.message);
  }
}

module.exports = { handleIncoming };
