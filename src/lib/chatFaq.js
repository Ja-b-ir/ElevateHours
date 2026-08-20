// lib/chatFaq.js
// Canned FAQ content for the landing-page chat widget.
// Edit freely — this drives the quick-answer chips before a visitor escalates to live chat.

export const CHAT_FAQS = [
  {
    id: 'what-is-sparks',
    question: 'What are Sparks?',
    answer:
      "Sparks (SPK) are ElevateHours' internal unit of value. You earn them by completing work or education requests for others, and spend them to get help from someone else — 100 SPK = $10 in equivalent value. It's a liquidity layer for a community built on time-banking, not a cashout system.",
  },
  {
    id: 'how-earn',
    question: 'How do I earn Sparks?',
    answer:
      'Browse the Marketplace for open requests, apply, and complete the work or mentoring session. Once the requester confirms it\'s done, Sparks land in your balance automatically based on the track (Work or Education) and tier.',
  },
  {
    id: 'tiers',
    question: 'What are the skill tiers?',
    answer:
      'Tier 1 (Foundational) pays 150 SPK/hr for work or 90 SPK/hr for education. Tier 2 (Specialized) pays 200 / 120. Tier 3 (Strategic) pays 300 / 180. Your tier reflects the skill level of the task, not your personal rank.',
  },
  {
    id: 'buy-sparks',
    question: 'Can I buy Sparks?',
    answer:
      "Yes — Buy Sparks bundles (Starter, Growth, Pro, Impact) let you top up if you need help faster than you can earn. It's a liquidity option on top of the time-banking system, not a replacement for it — most value on the platform still comes from real contribution.",
  },
  {
    id: 'cashout',
    question: 'Can I cash out my Sparks?',
    answer:
      "No — Sparks aren't withdrawable to cash. They're designed to circulate inside the community as a way to trade time, skills, and support.",
  },
  {
    id: 'funding',
    question: 'What are Funding Requests?',
    answer:
      "If your balance is low, you can post a Funding Request (min 100 SPK, max 2,000 SPK) and other members can gift you Sparks to help you access an opportunity you couldn't otherwise afford.",
  },
  {
    id: 'org-accounts',
    question: 'Why would an organization join?',
    answer:
      'Organizations get access to spare capacity and motivated talent, CSR storytelling opportunities, a talent pipeline, and an NGO trust score plus an annual impact report — all without a cash outlay.',
  },
]
