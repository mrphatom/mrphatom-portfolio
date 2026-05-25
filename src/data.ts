import { PortfolioData } from './types';

/**
 * PORTFOLIO CONFIGURATION DATA
 * ============================
 * Edit any values in this file to personalize the entire portfolio website!
 * All names, bios, projects, skills, and experiences update dynamically.
 */
export const portfolioData: PortfolioData = {
  profile: {
    name: "Godtime",
    sirName: "Benson",
    title: "Senior Frontend Engineer & Design Systems Architect",
    role: "Senior Frontend Engineer",
    bio: "I specialize in bridging the gap between sophisticated aesthetics and high-performance frontend engineering. Currently design-engineering pixel-perfect interfaces, robust component architectures, and fluid interactive web applications.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400",
    location: "Remote / Lagos, Nigeria (GMT+1)",
    status: "Available for contract & remote roles",
    email: "godtimebenson09@gmail.com",
    resumeUrl: "#", // Can be a local PDF path like "/resume.pdf"
    headingLine1: "Creative",
    headingLine2: "Developer",
    socialLinks: [
      {
        platform: "github",
        url: "https://github.com",
        label: "GitHub"
      },
      {
        platform: "linkedin",
        url: "https://linkedin.com",
        label: "LinkedIn"
      },
      {
        platform: "twitter",
        url: "https://twitter.com",
        label: "Twitter / X"
      },
      {
        platform: "email",
        url: "mailto:godtimebenson09@gmail.com",
        label: "Email"
      }
    ]
  },
  projects: [
    {
      id: "leadsradar",
      title: "LeadsRadar Workspace",
      role: "Creator & Lead Architect",
      description: "An outreach tracking workspace and geo-location lead discovering engine designed specifically for freelance developers and agencies.",
      longDescription: "LeadsRadar is an intelligent target tracking panel and outreach hub tailored for freelance practitioners. Integrates an automated Kanban-style outreach pipeline, customizable tag filters, geographical contact scouting widgets, and structured communication playbooks, boosting pitch efficiencies.",
      image: "dashboard", // Uses the elegant interactive dashboard bento visualization
      tags: ["React", "TypeScript", "Tailwind CSS", "Kanban API", "Geographic Mapping"],
      codeUrl: "https://github.com/mrphatom/LeadsRadar",
      demoUrl: "https://github.com/mrphatom/LeadsRadar",
      featured: true
    },
    {
      id: "askzen",
      title: "AskZen Telegram Bot",
      role: "Creator & Lead Developer",
      description: "A production-grade AI-powered Telegram chatbot integrating premium paywalls via Telegram Stars and custom AI modes.",
      longDescription: "AskZen is a highly sophisticated, monetize-ready Telegram assistant engineered with TypeScript. Features custom persona modules, secure rate-limited token streaming, and Telegram Stars payment integration, enabling seamless freemium subscriptions.",
      image: "canvas", // Uses the interactive whiteboard node canvas simulation
      tags: ["TypeScript", "Node.js", "Groq API", "Telegram API", "Railway CRM"],
      codeUrl: "https://github.com/mrphatom/AskZen",
      demoUrl: "https://github.com/mrphatom/AskZen",
      featured: true
    },
    {
      id: "chatgpt3-portal",
      title: "ChatGPT Multi-Turn Interface",
      role: "Developer",
      description: "A lightweight, secure chatbot workspace featuring full thread context preservation, custom system prompts, and fluid dark-mode overlays.",
      longDescription: "An elegant conversational window built using React and Tailwind. Integrates OpenAI's Chat Completion APIs with custom token streaming handlers, multi-turn state trees, prompt templates, and local synchronization.",
      image: "design-system", // Uses the interactive components token designer simulation
      tags: ["React", "Vite", "OpenAI APIs", "Tailwind CSS", "LocalState"],
      codeUrl: "https://github.com/mrphatom/chatgpt3",
      demoUrl: "https://github.com/mrphatom/chatgpt3",
      featured: true
    },
    {
      id: "haywhy-constructions",
      title: "Haywhy Constructions Showroom",
      role: "Lead Fullstack Developer",
      description: "A custom high-performance property listing showroom and consultation organizer with smooth layout choreographies.",
      longDescription: "Created a highly visible, fluid, responsive property presentation panel for structural design consulting. Features high-definition image galleries, an automated consultation query drawer, and custom contact dispatch modules.",
      image: "commerce", // Uses the interactive e-commerce mockup showing custom body styles
      tags: ["React", "CSS Grid", "Tailwind CSS", "Framer Motion", "Nodemailer"],
      codeUrl: "https://github.com/mrphatom/haywhyconstructions",
      demoUrl: "https://github.com/mrphatom/haywhyconstructions",
      featured: false
    }
  ],
  experiences: [
    {
      id: "exp-mercor",
      role: "AI Specialist / Evaluator",
      company: "Mercor",
      period: "Apr 2026 - Present",
      location: "San Francisco, CA (Remote)",
      description: "Evaluating, training, aligning, and building state-of-the-art AI agents and Large Language Models for complex reasoning capabilities.",
      bullets: [
        "Spearheaded LLM alignment strategies and custom evaluation benchmarks to validate multi-step reasoning capabilities.",
        "Collaborated closely on complex prompt architectures and Reinforcement Learning from Human Feedback (RLHF) guidelines.",
        "Engineered custom playground interfaces and high-performance evaluation tools to streamline fine-tuning cycles."
      ]
    },
    {
      id: "exp-discord",
      role: "Senior Frontend Engineer",
      company: "Discord",
      period: "Jan 2024 - Apr 14, 2026",
      location: "San Francisco, CA (Remote)",
      description: "Architected real-time communication UI components, streaming overlays, and high-performance layout systems for desktop and web screens.",
      bullets: [
        "Rebuilt the primary interactive server chat viewports with memoized render gates, decreasing user memory footprint by 18%.",
        "Orchestrated buttery-smooth dynamic overlays and entrance choreographies triggering micro-reactions.",
        "Formulated cross-functional testing suites that verified 100% viewport compliance across different viewport densities."
      ]
    },
    {
      id: "exp-1",
      role: "Lead Interface Engineer",
      company: "Prism Digital Labs",
      period: "2022 - 2024",
      location: "London, UK (Remote)",
      description: "Spearheaded design token integration and core library construction across international developer teams.",
      bullets: [
        "Architected core system patterns in React, reducing build drift and saving approximately 180 designer/developer hours.",
        "Reconstructed performance-critical web analytic dashboards, boosting core Web Vital metrics by 34% across consumer channels.",
        "Facilitated seamless integration of motion-guided landing pages and responsive interactive data widgets."
      ]
    },
    {
      id: "exp-2",
      role: "Senior Software Developer",
      company: "Apex Tech Inc",
      period: "2020 - 2022",
      location: "San Francisco, CA (Hybrid)",
      description: "Led headless application refactoring and optimized GraphQL API layers for high-traffic commerce platforms.",
      bullets: [
        "Coordinated across cross-functional product cells to transition legacy interfaces to modern React codebases.",
        "Improved rendering pipeline through strategic lazy-loading, code splitting, and browser cache optimization.",
        "Created custom high-performance data visualizations with SVG and D3 modules."
      ]
    }
  ],
  skills: [
    // Frontend core
    { name: "React", level: 96, category: "Frontend", icon: "Flame" },
    { name: "TypeScript", level: 95, category: "Frontend", icon: "FileCode" },
    { name: "Tailwind CSS", level: 98, category: "Frontend", icon: "Layers" },
    { name: "CSS / CSS Grid", level: 92, category: "Frontend", icon: "Palette" },
    { name: "Framer Motion", level: 94, category: "Frontend", icon: "Sparkles" },
    { name: "Next.js", level: 91, category: "Frontend", icon: "Cpu" },
 
    // Design / Creative
    { name: "UI/UX Design", level: 88, category: "Design", icon: "Layout" },
    { name: "Figma Mapping", level: 90, category: "Design", icon: "PenTool" },
    { name: "Design Systems", level: 96, category: "Design", icon: "Box" },
    { name: "Motion Choreography", level: 90, category: "Design", icon: "Activity" },
 
    // Utilities / Backend
    { name: "Blockchain Engineering", level: 90, category: "Utilities", icon: "Box" },
    { name: "Node.js", level: 85, category: "Utilities", icon: "Terminal" },
    { name: "GraphQL / REST APIs", level: 88, category: "Utilities", icon: "Network" },
    { name: "Git & CI/CD Pipelines", level: 93, category: "Utilities", icon: "GitBranch" },
    { name: "D3.js Visualization", level: 85, category: "Utilities", icon: "BarChart" }
  ]
};
