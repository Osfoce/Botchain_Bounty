
const express = require("express");

const router = express.Router();

const SUPPORT_EMAIL = "happybounty9@gmail.com";

// Update this if your Contact Us page uses a different route.
const CONTACT_PATH = "/contact";

const SYSTEM_FALLBACK = `I don't have an answer to that question yet.

Our support team will be happy to guide you.

Email us at ${SUPPORT_EMAIL} or visit the Contact Us page on Happy Bounty for further assistance.`;

const FREE_RESPONSES = [
  {
    match: /^(hi|hello|hey|good morning|good afternoon|good evening)[!. ]*$/i,
    answer:
      "Hello! 👋 Welcome to Happy Bounty Help Center. I can help you understand how to create bounties, fund tasks, submit work, receive rewards, and use the platform. What would you like to know?",
  },

  {
    match: /what is happy bounty|about happy bounty|explain happy bounty|how does happy bounty work/i,
    answer:
      "Happy Bounty is a Web3 bounty marketplace where creators post tasks with rewards and contributors complete those tasks to earn. Creators review submissions and approve completed work before rewards are released. Happy Bounty currently supports Arc and Botchain.",
  },

  // Funding questions must come before general bounty questions.
  {
    match: /fund.*bounty|bounty.*fund|how.*pay.*bounty|pay.*for.*bounty/i,
    answer:
      "Creators fund their bounties through the wallet transaction during bounty creation.\n\n1. Connect your wallet.\n2. Open the Create Bounty page.\n3. Select your supported network.\n4. Enter your task details and reward amount.\n5. Review the transaction and confirm it in your wallet.\n\nMake sure you have enough USDC and any required network gas fees. Never approve a transaction you do not understand.",
  },

  {
    match: /deposit|top.?up|add funds|platform balance|wallet balance/i,
    answer:
      "Happy Bounty does not currently offer a general-purpose platform deposit or wallet balance feature. Creators fund their bounties directly through the wallet transaction during bounty creation.",
  },

  {
    match: /create.*bounty|post.*bounty|how.*bounty/i,
    answer:
      "To create a bounty:\n\n1. Connect your supported wallet.\n2. Open the Create Bounty page.\n3. Select your preferred network.\n4. Enter the task title and description.\n5. Configure the reward and deadline.\n6. Review the details and confirm the transaction through your wallet.\n\nFollow the instructions displayed in the application.",
  },

  {
    match: /submit.*work|submit.*task|how.*submit/i,
    answer:
      "To submit your work:\n\n1. Open the bounty you want to complete.\n2. Read the requirements carefully.\n3. Complete the requested task.\n4. Open the submission section on the bounty page.\n5. Provide your work according to the submission instructions.\n6. Submit it and wait for the creator to review it.",
  },

  {
    match: /complete.*bounty|do.*task|participate|join.*bounty/i,
    answer:
      "To participate in a bounty:\n\n1. Explore available active bounties.\n2. Choose a task that interests you.\n3. Read the requirements and deadline.\n4. Complete the requested work.\n5. Submit your work using the bounty's submission instructions.\n6. Wait for the creator to review your submission.",
  },

  {
    match: /reward|payment|earn|withdraw|receive.*money/i,
    answer:
      "Contributors earn rewards by completing bounty tasks successfully. The bounty creator reviews submitted work and approves it before rewards are released. I cannot check your individual payment or transaction status. If you need help with a specific reward, contact our support team.",
  },

  {
    match: /network|arc|botchain|supported chain|which chain/i,
    answer:
      "Happy Bounty currently supports two networks:\n\n1. Arc\n2. Botchain\n\nMake sure your wallet is connected to the correct network for the bounty you want to create or complete.",
  },

  {
    match: /fee|7%|platform charge|platform commission/i,
    answer:
      "Happy Bounty currently charges a 7% platform fee on the creator's bounty payment. Please review the fee displayed during the bounty creation process before confirming your transaction.",
  },

  {
    match: /connect.*wallet|wallet.*connect/i,
    answer:
      "To connect your wallet, click the Connect Wallet button on Happy Bounty and select a supported wallet. Make sure you are connected to the correct network for the bounty. Never share your recovery phrase or private key with anyone.",
  },

  {
    match: /creator|contributor|who can use/i,
    answer:
      "Happy Bounty is designed for both creators and contributors. Creators can post tasks and attach rewards, while contributors can explore available bounties, complete tasks, and submit their work for review.",
  },

  {
    match: /deadline|due date|time limit|expire/i,
    answer:
      "Every bounty has its own deadline. Check the bounty details before participating and make sure you submit your work before the deadline.",
  },

  {
    match: /multiple winner|multi.?winner|single winner/i,
    answer:
      "Some Happy Bounty tasks support different winner and reward distribution structures. Check the reward configuration displayed when creating a bounty to see the available options.",
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
        error:
          "Invalid messages. Each message must contain a valid role and text.",
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

    // FREE FAQ RESPONSE
    const freeAnswer = getFreeAnswer(latestUserMessage.content);

    if (freeAnswer) {
      return res.status(200).json({
        reply: freeAnswer,
        source: "free",
      });
    }

    // CONTACT SUPPORT FALLBACK
    return res.status(200).json({
      reply: SYSTEM_FALLBACK,
      source: "support",
      supportEmail: SUPPORT_EMAIL,
      contactPath: CONTACT_PATH,
    });
  } catch (error) {
    console.error("Happy Bounty assistant error:", error);

    return res.status(500).json({
      reply:
        "Something went wrong while processing your question. Please contact our support team at " +
        SUPPORT_EMAIL,
      source: "support",
      supportEmail: SUPPORT_EMAIL,
      contactPath: CONTACT_PATH,
    });
  }
});

module.exports = router;
