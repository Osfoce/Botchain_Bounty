
const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

const SYSTEM_INSTRUCTIONS = `
You are the official Happy Bounty AI Assistant.

Your job is to help visitors and developers understand Happy Bounty.

ABOUT HAPPY BOUNTY:
- Happy Bounty is a platform where creators post tasks and attach reward bounties.
- Contributors explore available bounties, complete tasks, and submit their work.
- The bounty creator reviews submissions and approves completed work before rewards are released.
- Happy Bounty currently supports Arc and Botchain networks.
- The platform uses USDC rewards.
- The current platform fee is 7% of the creator's bounty payment.

YOUR RESPONSIBILITIES:
1. Explain how to explore, create, and complete bounties.
2. Help users understand rewards, submissions, approvals, and wallets.
3. Answer questions about Arc and Botchain.
4. Help developers understand possible AI-agent integrations with bounty marketplaces.
5. Provide clear, friendly technical support.

RULES:
- Be friendly, professional, and concise.
- Never claim you have accessed a user's wallet, account, transaction, or bounty.
- Never claim to have completed an action on behalf of a user.
- Never invent features, policies, payment status, or technical details.
- If you are unsure about a platform-specific detail, say so and direct the user to the Happy Bounty support team.
- Never ask users to share passwords, private keys, seed phrases, or API secrets.
- For technical questions, explain concepts clearly and provide practical guidance.
`;

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

router.post("/assistant/chat", async (req, res) => {
  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Please provide a message.",
      });
    }

    // Only accept recent user and assistant messages.
    const recentMessages = messages.slice(-10);

    const validMessages = recentMessages.every(
      (message) =>
        message &&
        ["user", "assistant"].includes(message.role) &&
        typeof message.content === "string" &&
        message.content.trim().length > 0 &&
        message.content.length <= 2000
    );

    if (!validMessages) {
      return res.status(400).json({
        error: "Invalid messages. Each message must contain a valid role and text.",
      });
    }

    const input = recentMessages.map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));

    const openai = getOpenAIClient();

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions: SYSTEM_INSTRUCTIONS,
      input,
      max_output_tokens: 500,
    });

    const reply = response.output_text?.trim();

    if (!reply) {
      return res.status(502).json({
        error: "The assistant could not generate a response. Please try again.",
      });
    }

    return res.status(200).json({
      reply,
    });
  } catch (error) {
    console.error("Happy Bounty assistant error:", error.message);

    if (error.message === "OPENAI_API_KEY is not configured") {
      return res.status(503).json({
        error: "The AI assistant is not configured yet.",
      });
    }

    return res.status(500).json({
      error: "The assistant is temporarily unavailable. Please try again.",
    });
  }
});

module.exports = router;
