export interface SocialLink {
  platform: 'github' | 'linkedin' | 'twitter' | 'email' | 'instagram' | 'dribbble';
  url: string;
  label: string;
}

export interface Profile {
  name: string;
  sirName?: string; // e.g. "John" and "Doe"
  title: string;
  role: string;
  bio: string;
  avatar: string; // URL or emoji placeholder
  location: string;
  status: string; // e.g., "Available for new projects"
  email: string;
  resumeUrl: string;
  socialLinks: SocialLink[];
}

export interface Project {
  id: string;
  title: string;
  role: string;
  description: string;
  longDescription?: string;
  image: string; // URL, placeholder, or visual style flag
  tags: string[];
  codeUrl?: string;
  demoUrl?: string;
  featured: boolean;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string; // e.g., "2023 - Present"
  location?: string;
  description: string;
  bullets?: string[];
}

export interface SkillItem {
  name: string;
  level: number; // 0 to 100 percentage
  category: string; // e.g., "Frontend", "Backend", "Design", "Utilities"
  icon?: string; // Lucide icon name matching
}

export interface PortfolioData {
  profile: Profile;
  projects: Project[];
  experiences: Experience[];
  skills: SkillItem[];
}
