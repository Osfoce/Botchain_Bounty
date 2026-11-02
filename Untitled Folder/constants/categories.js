// constants/categories.js
export const BOUNTY_CATEGORIES = [
  {
    group: "Technical",
    values: [
      "Development",
      "Security",
      "AI & Machine Learning",
      "Blockchain & Smart Contracts",
      "Documentation",
    ],
  },
  {
    group: "Non-Technical",
    values: [
      "Design",
      "Marketing",
      "Content Creation",
      "Community Management",
      "Translation",
      "Research",
    ],
  },
  { group: "Other", values: ["Other"] },
];

// Tag suggestions keyed by category
export const TAGS_BY_CATEGORY = {
  Development: [
    "Frontend",
    "Backend",
    "Smart Contract",
    "Mobile",
    "DevOps",
    "Testing",
    "Bug Fix",
  ],
  Security: [
    "Audit",
    "Exploit",
    "Reentrancy",
    "Access Control",
    "Flash Loan",
    "Oracle",
  ],
  "AI & Machine Learning": [
    "LLM",
    "Computer Vision",
    "NLP",
    "Model Training",
    "AI Agent",
    "Data Pipeline",
  ],
  "Blockchain & Smart Contracts": [
    "Solidity",
    "EVM",
    "DeFi",
    "NFT",
    "DAO",
    "Layer 2",
    "Gas Optimization",
  ],
  Documentation: [
    "Tutorial",
    "API Docs",
    "Whitepaper",
    "Guides",
    "Translation",
  ],
  Design: [
    "UI/UX",
    "Figma",
    "Branding",
    "Illustration",
    "Motion",
    "Landing Page",
  ],
  Marketing: [
    "Social Media",
    "SEO",
    "Growth",
    "Campaign",
    "Twitter/X",
    "Discord",
  ],
  "Content Creation": ["Article", "Video", "Thread", "Podcast", "Newsletter"],
  "Community Management": [
    "Moderation",
    "Onboarding",
    "Events",
    "Discord",
    "Telegram",
  ],
  Translation: ["Spanish", "French", "Mandarin", "Arabic", "Portuguese"],
  Research: [
    "Market Research",
    "Competitive Analysis",
    "Tokenomics",
    "User Survey",
  ],
  Other: ["Misc"],
};

// Fallback if a category has no tags defined
export const DEFAULT_TAGS = ["General", "Beginner", "Advanced", "Urgent"];
