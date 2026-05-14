require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const webhookRoutes = require("./routes/webhook");
const chatRoutes = require("./routes/chat");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Required for Twilio webhooks

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// ─── Routes ──────────────────────────────────────────────────
app.use("/webhook", webhookRoutes);   // Twilio posts here
app.use("/api/chat", chatRoutes);     // Dashboard API

app.get("/health", (req, res) => res.json({ status: "ok", bot: process.env.BOT_NAME || "AI Bot" }));

// ─── MongoDB ─────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
