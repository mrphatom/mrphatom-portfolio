import { PortfolioData } from './types';

/**
 * PORTFOLIO CONFIGURATION DATA
 * ============================
 * Edit any values in this file to personalize the entire portfolio website!
 * All names, bios, projects, skills, and experiences update dynamically.
 */
export const portfolioData: PortfolioData = {
  profile: {
    name: "Jonathan",
    sirName: "Kaelen",
    title: "Design-Driven Frontend Engineer & Creative Developer",
    role: "Senior Frontend Engineer",
    bio: "I specialize in bridging the gap between sophisticated aesthetics and high-performance frontend engineering. Currently design-engineering pixel-perfect interfaces, scalable system architectures, and immersive interactive web applications.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400", // Modern minimalist neutral avatar
    location: "London, UK (GMT+1)",
    status: "Available for contract & remote roles",
    email: "jonathan.kaelen@example.com",
    resumeUrl: "#", // Can be a local PDF path like "/resume.pdf"
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
        platform: "dribbble",
        url: "https://dribbble.com",
        label: "Dribbble"
      },
      {
        platform: "email",
        url: "mailto:jonathan.kaelen@example.com",
        label: "Email"
      }
    ]
  },
  projects: [
    {
      id: "aether-dash",
      title: "Aether Analytics Dashboard",
      role: "Lead Frontend Engineer",
      description: "A high-performance real-time analytics web dashboard that monitors cloud databases and visualizes usage metrics with sub-millisecond latencies.",
      longDescription: "Aether is a custom enterprise-grade analytics engine designed to help cloud operators visualize traffic spikes and monitor complex database schemas. Built with React and optimized custom D3 charts, it features automated refresh states, a highly customized grid layout, and complex filtering mechanisms.",
      image: "dashboard", // Represented by specialized stylish interactive mockup component
      tags: ["React", "TypeScript", "Tailwind CSS", "D3.js", "Framer Motion"],
      codeUrl: "https://github.com",
      demoUrl: "https://example.com",
      featured: true
    },
    {
      id: "solaris-ecommerce",
      title: "Solaris Headless Commerce Platform",
      role: "UX Architect & Developer",
      description: "A hyper-minimalist, lightning-fast e-commerce shopfront built with headless CMS architecture and buttery smooth micro-animations.",
      longDescription: "Solaris reimagines digital retail by eliminating clutter. Integrating an API-driven checkout and fully dynamic sizing selections, the app maintains standard core SEO configurations and high web vital scores, resulting in a dramatic 22% increase in page engagement.",
      image: "commerce", // Represented by specialized stylish interactive mockup component
      tags: ["Next.js", "React", "GraphQL", "Tailwind CSS", "Motion"],
      codeUrl: "https://github.com",
      demoUrl: "https://example.com",
      featured: true
    },
    {
      id: "cognitive-canvas",
      title: "Cognitive AI Collaborative Canvas",
      role: "Fullstack Engineer",
      description: "An interactive, collaborative vector whiteboard where distributed teams can brainstorm, map nodes, and generate dynamic AI schemas.",
      longDescription: "Cognitive Canvas delivers instant multiplayer brainstorm sessions using modern real-time synchronization. Users can map visual nodes, save workspace snapshots, and call AI generation pipelines server-side to auto-generate diagram categories dynamically.",
      image: "canvas", // Represented by specialized stylish interactive mockup component
      tags: ["React", "TypeScript", "Tailwind CSS", "Convex", "Gemini Node SDK"],
      codeUrl: "https://github.com",
      demoUrl: "https://example.com",
      featured: true
    },
    {
      id: "nova-ui",
      title: "Nova Design System Token Hub",
      role: "Design System Engineer",
      description: "A comprehensive developer-focused visual workspace representing accessible design tokens, core patterns, and customizable Figma interfaces.",
      longDescription: "Created to sync design and engineering workflows, Nova UI automates design token conversion directly from Figma REST variables to Tailwind theme extensions. It contains comprehensive documentation, live-rendered components, and beautiful playground panels.",
      image: "design-system", // Represented by specialized stylish interactive mockup component
      tags: ["React", "Framer Motion", "Tailwind CSS", "Storybook", "Figma API"],
      codeUrl: "https://github.com",
      demoUrl: "https://example.com",
      featured: false
    }
  ],
  experiences: [
    {
      id: "exp-1",
      role: "Lead Interface Engineer",
      company: "Prism Digital Labs",
      period: "2023 - Present",
      location: "London, UK (Remote)",
      description: "Spearheading design token integration and core library construction across international developer teams.",
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
      period: "2021 - 2023",
      location: "San Francisco, CA (Hybrid)",
      description: "Led headless application refactoring and optimized GraphQL API layers for high-traffic commerce platforms.",
      bullets: [
        "Coordinated across cross-functional product cells to transition legacy interfaces to modern React codebases.",
        "Improved rendering pipeline through strategic lazy-loading, code splitting, and browser cache optimization.",
        "Created custom high-performance data visualizations with SVG and D3 modules."
      ]
    },
    {
      id: "exp-3",
      role: "Creative technologist",
      company: "Studio Digital Arts",
      period: "2019 - 2021",
      location: "Berlin, DE (On-site)",
      description: "Engineered web experiences and interactive installations focusing heavily on custom animations and creative layouts.",
      bullets: [
        "Crafted outstanding marketing modules using advanced Framer Motion transitions and CSS grids.",
        "Collaborated closely with visual designers to build award-winning interactive interfaces.",
        "Maintained 100% test coverage benchmarks across core responsive landing models."
      ]
    }
  ],
  skills: [
    // Frontend core
    { name: "React", level: 95, category: "Frontend", icon: "Flame" },
    { name: "TypeScript", level: 92, category: "Frontend", icon: "FileCode" },
    { name: "Tailwind CSS", level: 98, category: "Frontend", icon: "Layers" },
    { name: "CSS / CSS Grid", level: 90, category: "Frontend", icon: "Palette" },
    { name: "Framer Motion", level: 94, category: "Frontend", icon: "Sparkles" },
    { name: "Next.js", level: 88, category: "Frontend", icon: "Cpu" },

    // Design / Creative
    { name: "UI/UX Design", level: 85, category: "Design", icon: "Layout" },
    { name: "Figma Mapping", level: 90, category: "Design", icon: "PenTool" },
    { name: "Design Systems", level: 95, category: "Design", icon: "Box" },
    { name: "Motion Choreography", level: 88, category: "Design", icon: "Activity" },

    // Utilities / Backend
    { name: "Node.js", level: 82, category: "Utilities", icon: "Terminal" },
    { name: "GraphQL / REST APIs", level: 85, category: "Utilities", icon: "Network" },
    { name: "Git & CI/CD Pipelines", level: 92, category: "Utilities", icon: "GitBranch" },
    { name: "D3.js Visualization", level: 84, category: "Utilities", icon: "BarChart" }
  ]
};
