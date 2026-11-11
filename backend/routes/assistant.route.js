
const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

const SYSTEM_INSTRUCTIONS = `
You are the official Happy Bounty AI Assistant.

You help users understand and use the Happy Bounty platform.

ABOUT HAPPY BOUNTY:
- Happy Bounty is a Web3 bounty marketplace.
- Creators post tasks and attach reward bounties.
- Contributors explore available bounties, complete tasks, and submit their work.
- Bounty creators review submissions and approve completed work before rewards are released.
- Happy Bounty currently supports Arc and Botchain networks.
- The platform uses USDC rewards.
- The current platform fee is 7% of the creator's bounty payment.

IMPORTANT GUIDELINES:
- Give practical, step-by-step instructions.
- Never invent platform features or policies.
- Do not claim to access a user's wallet, account, transaction, or bounty.
- Never claim a payment has been made.
- Never request passwords, private keys, seed phrases, or API secrets.
- There is no general-purpose platform deposit or wallet balance feature.
- Creators fund their bounties through the wallet transaction during bounty creation.
- If unsure about a platform-specific detail, say so.
- Keep answers friendly, clear, and concise.
`;

const FREE_RESPONSES = [
  {
    match: /^(hi|hello|hey|good morning|good afternoon|good evening)[!. ]*$/i,
    answer:
      "Hello! 👋 Welcome to Happy Bounty. I'm your AI assistant. I can help you create bounties, understand rewards, submit tasks, and navigate the platform. What would you like to know?",
  },
  {
    match: /what is happy bounty|about happy bounty|explain happy bounty/i,
    answer:
      "Happy Bounty is a Web3 bounty marketplace where creators post tasks with rewards and contributors complete those tasks to earn. Creators review submissions and approve completed work before rewards are released. Happy Bounty currently supports Arc and Botchain.",
  },
  {
    match: /create.*bounty|post.*bounty|how.*bounty/i,
    answer:
      "To create a bounty:\n\n1. Connect your supported wallet.\n2. Open the Create Bounty page.\n3. Select your preferred network.\n4. Enter the task title and description.\n5. Configure the reward and deadline.\n6. Review the details and submit the transaction through your wallet.\n\nFollow the instructions displayed in the application.",
  },
  {
    match: /deposit|top.?up|add funds|platform balance/i,
    answer:
      "Happy Bounty does not currently have a general-purpose platform deposit or wallet balance feature. To fund a bounty, connect your wallet and create a bounty. The reward is funded through the wallet transaction during the creation process. Make sure you select the correct supported network.",
  },
  {
    match: /fund.*bounty|pay.*bounty/i,
    answer:
      "Creators fund their bounties through the wallet transaction during bounty creation. Connect your wallet, select a supported network, configure your reward, and review the transaction before approving it. Never approve a transaction you do not understand.",
  },
  {
    match: /submit.*work|complete.*bounty|do.*task/i,
    answer:
      "To complete a bounty:\n\n1. Explore available active bounties.\n2. Open a bounty and read its requirements carefully.\n3. Complete the requested task.\n4. Submit your work using the submission instructions on the bounty page.\n5. Wait for the creator to review your submission.",
  },
  {
    match: /reward|payment|earn|withdraw/i,
    answer:
      "Contributors earn rewards by completing bounty tasks successfully. The bounty creator reviews submitted work and approves it before rewards are released. I cannot check your individual payment or transaction status.",
  },
  {
    match: /network|arc|botchain|supported chain/i,
    answer:
      "Happy Bounty currently supports two networks: Arc and Botchain. Make sure your wallet is connected to the network selected for the bounty you want to create or complete.",
  },
  {
    match: /fee|7%|platform charge|platform commission/i,
    answer:
      "Happy Bounty currently charges a 7% platform fee on the creator's bounty payment. Please review the fee displayed in the bounty creation process before confirming your transaction.",
  },
  {
    match: /connect.*wallet|wallet.*connect/i,
    answer:
      "To connect your wallet, use the Connect Wallet button on Happy Bounty and select a supported wallet. Make sure you are connected to the correct network for the bounty. Never share your recovery phrase or private key with anyone.",
  },
];

const getFreeAnswer = (message) => {
  const normalized = message.trim();

  for (const item of FREE_RESPONSES) {
    if (item.match.test(normalized)) {
      return item.answer;
    }
  }

  return null;
};

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
    const { messages, selectedPrompt } = req.body || {};

    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 30
    ) {
      return res.status(400).json({
        error: "Please provide a valid conversation.",
      });
    }

    if (
      selectedPrompt !== undefined &&
      (typeof selectedPrompt !== "string" ||
        selectedPrompt.trim().length === 0 ||
        selectedPrompt.length > 200)
    ) {
      return res.status(400).json({
        error: "Invalid selected prompt.",
      });
    }

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

    const latestUserMessage = [...recentMessages]
      .reverse()
      .find((message) => message.role === "user");

    if (!latestUserMessage) {
      return res.status(400).json({
        error: "Please send a user message.",
      });
    }

    // FREE RESPONSE: common Happy Bounty questions
    const freeAnswer = getFreeAnswer(latestUserMessage.content);

    if (freeAnswer) {
      return res.status(200).json({
        reply: freeAnswer,
        source: "free",
      });
    }

    // PAID RESPONSE: questions requiring AI-generated answers
    const openai = getOpenAIClient();

    const instructions = selectedPrompt
      ? `${SYSTEM_INSTRUCTIONS}\n\nThe user selected this help topic: "${selectedPrompt}". Prioritize answering this topic directly.`
      : SYSTEM_INSTRUCTIONS;

    const input = recentMessages.map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions,
      input,
      max_output_tokens: 700,
    });

    const reply = response.output_text?.trim();

    if (!reply) {
      return res.status(502).json({
        error: "The assistant could not generate a response. Please try again.",
      });
    }

    return res.status(200).json({
      reply,
      source: "openai",
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
