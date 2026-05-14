const express = require("express");
const router = express.Router();
const { handleIncoming } = require("../controllers/webhookController");

// POST /webhook/whatsapp  ← Set this as your Twilio webhook URL
router.post("/whatsapp", handleIncoming);

module.exports = router;
