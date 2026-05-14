const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DEFAULT_SYSTEM = `You are ${process.env.BOT_NAME || "an AI assistant"}, a helpful assistant. 
Be concise, warm, and professional. Keep replies under 200 words unless the user needs more detail.
If you don't know something, say so honestly. Never make up information.`;

/**
 * Generate a reply using Claude given a conversation history.
 * @param {Array} messages - Array of {role, content} objects
 * @param {string} systemPrompt - Override the default system prompt
 * @returns {string} Claude's reply text
 */
async function generateReply(messages, systemPrompt = null) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 400,
    system: systemPrompt || process.env.BOT_SYSTEM_PROMPT || DEFAULT_SYSTEM,
    messages,
  });

  return response.content[0].text;
}

module.exports = { generateReply };
