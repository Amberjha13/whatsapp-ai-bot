const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send a WhatsApp message via Twilio
 * @param {string} to   - Recipient WhatsApp number e.g. "whatsapp:+919876543210"
 * @param {string} body - Message text
 */
async function sendMessage(to, body) {
  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to,
    body,
  });
}

/**
 * Validate that the incoming request is genuinely from Twilio
 */
function validateRequest(req) {
  const signature = req.headers["x-twilio-signature"];
  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  return twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    signature,
    url,
    req.body
  );
}

module.exports = { sendMessage, validateRequest };
