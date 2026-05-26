import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Unlock, LogOut, Save, Plus, Trash2, Edit2, Check, 
  Copy, ArrowLeft, Eye, FileCode, Briefcase, Sparkles, User,
  ExternalLink, Download, Undo, ShieldAlert, Mail, MessageSquare,
  Inbox, EyeOff, Search, Clock
} from 'lucide-react';
import { PortfolioData, Profile, Project, Experience, SkillItem } from '../types';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  timestamp?: number;
  read?: boolean;
}

interface AdminPanelProps {
  currentData: PortfolioData;
  onSave: (newData: PortfolioData) => void;
  onClose: () => void;
}

export default function AdminPanel({ currentData, onSave, onClose }: AdminPanelProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Draft Data State
  const [draftData, setDraftData] = useState<PortfolioData>(() => JSON.parse(JSON.stringify(currentData)));
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'experience' | 'skills' | 'raw_code' | 'inbox'>('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Inbox & message management states
  const [adminMessages, setAdminMessages] = useState<Message[]>([]);
  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  // Experience and Project Editing states (tracking active item expands)
  const [expandedProj, setExpandedProj] = useState<string | null>(null);
  const [expandedExp, setExpandedExp] = useState<string | null>(null);

  // Sync messages from local storage on mount and tab switch
  const loadMessages = () => {
    try {
      const stored = localStorage.getItem('portfolio_received_messages') || '[]';
      const parsed = JSON.parse(stored) as Message[];
      // sort chronologically by timestamp or date
      parsed.sort((a, b) => {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return timeB - timeA;
      });
      setAdminMessages(parsed);
    } catch (e) {
      console.error('Failed to load received messages', e);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [activeTab]);

  const toggleMessageRead = (id: string) => {
    const updated = adminMessages.map((msg) => {
      if (msg.id === id) {
        return { ...msg, read: !msg.read };
      }
      return msg;
    });
    setAdminMessages(updated);
    try {
      localStorage.setItem('portfolio_received_messages', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteInboxMessage = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message permanently?')) return;
    const updated = adminMessages.filter((msg) => msg.id !== id);
    setAdminMessages(updated);
    if (activeMessageId === id) {
      setActiveMessageId(null);
    }
    try {
      localStorage.setItem('portfolio_received_messages', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const clearAllInboxMessages = () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently clear/delete ALL received messages? This action is irreversible.')) return;
    setAdminMessages([]);
    setActiveMessageId(null);
    try {
      localStorage.setItem('portfolio_received_messages', '[]');
    } catch (e) {
      console.error(e);
    }
  };

  const exportInboxMessages = (format: 'csv' | 'json') => {
    if (adminMessages.length === 0) {
      alert('No messages available to export.');
      return;
    }

    let mimeType = 'application/json';
    let fileExtension = 'json';
    let dataStr = '';

    if (format === 'json') {
      dataStr = JSON.stringify(adminMessages, null, 2);
    } else {
      mimeType = 'text/csv';
      fileExtension = 'csv';
      // CSV Headers
      const headers = ['ID', 'Date', 'Sender Name', 'Sender Email', 'Subject', 'Message'];
      const rows = adminMessages.map(msg => [
        msg.id,
        msg.date,
        `"${(msg.name || '').replace(/"/g, '""')}"`,
        `"${(msg.email || '').replace(/"/g, '""')}"`,
        `"${(msg.subject || '').replace(/"/g, '""')}"`,
        `"${(msg.message || '').replace(/"/g, '""')}"`
      ]);
      dataStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio_messages_export_${Date.now()}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Authenticate logic
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const envPassword = (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'admin123';
    
    if (password === envPassword) {
      setIsAuthenticated(true);
      setAuthError('');
      try {
        sessionStorage.setItem('admin_authenticated', 'true');
      } catch (e) {
        console.error(e);
      }
    } else {
      setAuthError('Access denied. Invalid secure key.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('admin_authenticated');
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to trigger save feedback
  const handleSubmitAllChanges = () => {
    onSave(draftData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Reset Draft changes
  const handleResetToCurrent = () => {
    if (window.confirm('Discard all active edits and reset to current portfolio state?')) {
      setDraftData(JSON.parse(JSON.stringify(currentData)));
    }
  };

  // Profile Field updates
  const handleProfileChange = (key: keyof Profile, value: any) => {
    setDraftData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [key]: value
      }
    }));
  };

  // Experiences actions
  const handleAddExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      role: 'New Engineering Role',
      company: 'Corporate Partner Inc',
      period: '2026 - Present',
      location: 'Remote',
      description: 'Detailing core architectural contributions and front-end engineering pipeline improvements in dynamic environments.',
      bullets: [
        'Designed high-performance component frameworks and automated layout benchmarks.',
        'Developed smooth web experiences utilizing modern CSS, TypeScript, and Framer Motion animation loops.'
      ]
    };
    setDraftData((prev) => ({
      ...prev,
      experiences: [newExp, ...prev.experiences]
    }));
    setExpandedExp(newExp.id);
  };

  const handleRemoveExperience = (id: string) => {
    if (window.confirm('Delete this professional experience block?')) {
      setDraftData((prev) => ({
        ...prev,
        experiences: prev.experiences.filter((exp) => exp.id !== id)
      }));
      if (expandedExp === id) setExpandedExp(null);
    }
  };

  const handleExperienceChange = (id: string, key: keyof Experience, value: any) => {
    setDraftData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === id) {
          return { ...exp, [key]: value };
        }
        return exp;
      })
    }));
  };

  const handleExperienceBulletChange = (expId: string, idx: number, val: string) => {
    setDraftData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          const newBullets = [...(exp.bullets || [])];
          newBullets[idx] = val;
          return { ...exp, bullets: newBullets };
        }
        return exp;
      })
    }));
  };

  const handleAddExperienceBullet = (expId: string) => {
    setDraftData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          return { ...exp, bullets: [...(exp.bullets || []), 'New engineering contribution...'] };
        }
        return exp;
      })
    }));
  };

  const handleRemoveExperienceBullet = (expId: string, idx: number) => {
    setDraftData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          return { ...exp, bullets: (exp.bullets || []).filter((_, i) => i !== idx) };
        }
        return exp;
      })
    }));
  };

  // Projects actions
  const handleAddProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: 'Dynamic Web Platform',
      role: 'Creator & Architect',
      description: 'A brief description of the technical research-oriented project outcome.',
      longDescription: 'A modern, rich description elaborating the architectural paradigms, UI token configurations, integration guidelines, and telemetry endpoints.',
      image: 'dashboard',
      tags: ['React', 'TypeScript', 'Tailwind CSS'],
      demoUrl: 'https://github.com',
      codeUrl: 'https://github',
      featured: true
    };
    setDraftData((prev) => ({
      ...prev,
      projects: [newProj, ...prev.projects]
    }));
    setExpandedProj(newProj.id);
  };

  const handleRemoveProject = (id: string) => {
    if (window.confirm('Delete this project portfolio block?')) {
      setDraftData((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== id)
      }));
      if (expandedProj === id) setExpandedProj(null);
    }
  };

  const handleProjectChange = (id: string, key: keyof Project, value: any) => {
    setDraftData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id === id) {
          return { ...p, [key]: value };
        }
        return p;
      })
    }));
  };

  const handleCopyCode = () => {
    const rawCode = `export const portfolioData: PortfolioData = ${JSON.stringify(draftData, null, 2)};`;
    navigator.clipboard.writeText(rawCode).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const handleDownloadBackup = () => {
    const rawData = JSON.stringify(draftData, null, 2);
    const blob = new Blob([rawData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolioData.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSkillChange = (idx: number, field: keyof SkillItem, val: any) => {
    setDraftData((prev) => {
      const copySkills = [...prev.skills];
      copySkills[idx] = { ...copySkills[idx], [field]: val };
      return { ...prev, skills: copySkills };
    });
  };

  const handleDeleteSkill = (idx: number) => {
    if (window.confirm('Delete this skill index?')) {
      setDraftData((prev) => ({
        ...prev,
        skills: prev.skills.filter((_, i) => i !== idx)
      }));
    }
  };

  const handleAddSkill = () => {
    const newSkill: SkillItem = {
      name: 'New SkillName',
      level: 80,
      category: 'Frontend',
      icon: 'FileCode'
    };
    setDraftData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  };

  // Secure Auth Form View
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-zinc-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden select-none">
        {/* Ambient Grid styling backgrounds */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-8 backdrop-blur-xl relative z-10 shadow-2xl"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
              <Lock className="text-blue-400" size={20} />
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-white mb-1">
              Admin Gateway
            </h1>
            <p className="text-sm text-zinc-400/80">
              Provide dynamic security key to unlock dashboard access.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
                Security Access Code
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono placeholder-zinc-700 focus:outline-hidden focus:border-blue-500 transition-colors"
                autoFocus
              />
              <p className="mt-1.5 text-[10px] text-zinc-500 font-mono">
                Hint: The default environment key is <code className="text-blue-400">admin123</code>.
              </p>
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 text-xs">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={13} /> Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5"
              >
                Authenticate <Unlock size={13} />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // Loaded Dashboard Admin Workspace
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative z-50 md:h-screen md:overflow-hidden">
      
      {/* Dynamic Header Controls Bar */}
      <header className="relative md:sticky md:top-0 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shrink-0 z-30">
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Unlock className="text-emerald-400" size={15} />
            </div>
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 block leading-tight">Workspace Live Sync</span>
              <h1 className="text-sm sm:text-base font-bold font-display tracking-tight text-white flex items-center gap-1.5 leading-tight">
                Admin Console
              </h1>
            </div>
          </div>
          
          {/* Saved Status Indicator on Mobile/Tablet */}
          {isSaved && (
            <span className="sm:hidden text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 py-1 px-2.5 rounded-md flex items-center gap-1.5 animate-pulse">
              <Check size={11} /> Saved
            </span>
          )}
        </div>

        {/* Header Action Row with full responsiveness */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end border-t border-zinc-900 sm:border-t-0 pt-3 sm:pt-0">
          {isSaved && (
            <span className="hidden sm:flex text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-3 rounded-lg items-center gap-1 mr-2">
              <Check size={12} /> Changes synced live!
            </span>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap">
            <button
              onClick={handleResetToCurrent}
              className="p-2.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-850 rounded-lg border border-zinc-800/80 transition-all cursor-pointer text-xs flex items-center gap-1.5 px-3 active:scale-95 duration-100"
              title="Discard all changes & reload portfolio"
            >
              <Undo size={14} /> <span className="hidden xs:inline">Reset</span>
            </button>

            <button
              onClick={handleSubmitAllChanges}
              className="p-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all cursor-pointer text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/10 flex-1 sm:flex-none justify-center active:scale-95 duration-100"
            >
              <Save size={14} /> <span>Save<span className="hidden xs:inline"> & Apply</span></span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 text-zinc-400 hover:text-red-400 bg-zinc-900 hover:bg-red-500/10 rounded-lg border border-zinc-800/80 hover:border-red-900/30 transition-all cursor-pointer active:scale-95"
              title="Lock Dashboard Session"
            >
              <LogOut size={14} />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 px-3 bg-zinc-855 hover:bg-zinc-800 text-white rounded-lg transition-all cursor-pointer text-xs flex items-center gap-1.5 border border-zinc-700/80 font-medium active:scale-95 duration-100"
            >
              <ArrowLeft size={14} /> <span className="hidden xs:inline sm:inline">Quit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Primary Layout Columns */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden h-full">
        {/* Left Vertical Sub-Navigation */}
        <nav className="w-64 bg-zinc-900/20 border-r border-zinc-850/80 p-4 shrink-0 flex flex-col gap-1 hidden md:flex">
          <div className="px-2 pb-3 mb-3 border-b border-zinc-800/50 flex flex-col pt-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Modules Management</span>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
              activeTab === 'profile' ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
            }`}
          >
            <User size={14} /> Profile & Identity
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
              activeTab === 'projects' ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
            }`}
          >
            <Sparkles size={14} /> Featured Projects
          </button>

          <button
            onClick={() => setActiveTab('experience')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
              activeTab === 'experience' ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
            }`}
          >
            <Briefcase size={14} /> Roles & Experience
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
              activeTab === 'skills' ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
            }`}
          >
            <FileCode size={14} /> Core Skillsets
          </button>

          <button
            onClick={() => setActiveTab('inbox')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
              activeTab === 'inbox' ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
            }`}
          >
            <Mail size={14} /> Received Messages
            {adminMessages.filter(m => !m.read).length > 0 && (
              <span className="ml-auto bg-red-500 hover:bg-red-400 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none shrink-0 animate-pulse">
                {adminMessages.filter(m => !m.read).length}
              </span>
            )}
          </button>

          <div className="border-t border-zinc-800/50 my-3 pt-3 px-2 flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Export & Backup</span>
          </div>

          <button
            onClick={() => setActiveTab('raw_code')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer mb-2 ${
              activeTab === 'raw_code' ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:bg-zinc-805/50 hover:text-white'
            }`}
          >
            <FileCode size={14} /> Dynamic JSON Source
          </button>

          <button
            onClick={handleDownloadBackup}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-mono text-left text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-colors cursor-pointer"
          >
            <Download size={14} /> Download Backup
          </button>
        </nav>

        {/* Mobile/Tablet Horizontal Tabs - Sticky only on mobile for quick swapping */}
        <div className="bg-zinc-900 border-b border-zinc-800/80 p-2 overflow-x-auto flex md:hidden gap-1.5 max-w-full z-20 sticky top-0 scrollbar-none shrink-0 bg-opacity-95 backdrop-blur-xs select-none shadow-md">
          {(['profile', 'projects', 'experience', 'skills', 'inbox', 'raw_code'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-[10px] uppercase tracking-wider font-mono shrink-0 cursor-pointer transition-all active:scale-95 ${
                activeTab === tab ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 bg-zinc-900'
              }`}
            >
              {tab === 'inbox' ? (
                <span className="flex items-center gap-1">
                  Inbox
                  {adminMessages.filter(m => !m.read).length > 0 && (
                    <span className="bg-red-500 text-white font-mono text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none">
                      {adminMessages.filter(m => !m.read).length}
                    </span>
                  )}
                </span>
              ) : tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Scrollable Work Deck Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-zinc-950/40 select-text">
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-3xl">
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-xl font-bold text-white">Profile & Brand Identity</h2>
                <p className="text-xs text-zinc-400">Modify landing descriptions, headlines, and avatar references here.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={draftData.profile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Surname / Last Name</label>
                  <input
                    type="text"
                    value={draftData.profile.sirName || ''}
                    onChange={(e) => handleProfileChange('sirName', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Hero Title (Left Column Header)</label>
                  <input
                    type="text"
                    value={draftData.profile.title}
                    onChange={(e) => handleProfileChange('title', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Design Role Identifier</label>
                  <input
                    type="text"
                    value={draftData.profile.role}
                    onChange={(e) => handleProfileChange('role', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Hero Big Heading (Line 1)</label>
                  <input
                    type="text"
                    value={draftData.profile.headingLine1 || ''}
                    onChange={(e) => handleProfileChange('headingLine1', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Hero Big Heading (Line 2)</label>
                  <input
                    type="text"
                    value={draftData.profile.headingLine2 || ''}
                    onChange={(e) => handleProfileChange('headingLine2', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Availability Status Capsule</label>
                  <input
                    type="text"
                    value={draftData.profile.status}
                    onChange={(e) => handleProfileChange('status', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Geographic Location</label>
                  <input
                    type="text"
                    value={draftData.profile.location}
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Primary Contact Email</label>
                  <input
                    type="email"
                    value={draftData.profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Resume / PDF Access Route (leave # if none)</label>
                  <input
                    type="text"
                    value={draftData.profile.resumeUrl}
                    onChange={(e) => handleProfileChange('resumeUrl', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Avatar Image URL (preferably Unsplash/HTTPS)</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={draftData.profile.avatar}
                    onChange={(e) => handleProfileChange('avatar', e.target.value)}
                    className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-hidden focus:border-blue-500"
                  />
                  <div className="w-10 h-10 rounded-full border border-zinc-800 overflow-hidden shrink-0 bg-zinc-900">
                    <img 
                      src={draftData.profile.avatar} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400";
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Biographical Showcase Pitch</label>
                <textarea
                  value={draftData.profile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-hidden focus:border-blue-500 resize-y"
                />
              </div>

              <div>
                <div className="border-b border-zinc-800 pb-2 mb-3">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Social Communication Links</span>
                </div>
                <div className="space-y-3">
                  {draftData.profile.socialLinks.map((link, lIdx) => (
                    <div key={link.platform} className="flex gap-3 items-center bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/80">
                      <span className="w-20 font-mono text-xs text-zinc-300 capitalize text-slate-400">{link.platform}</span>
                      <input
                        type="text"
                        placeholder="Link address..."
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...draftData.profile.socialLinks];
                          updated[lIdx].url = e.target.value;
                          handleProfileChange('socialLinks', updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md text-white text-xs focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Featured Portfolio Projects</h2>
                  <p className="text-xs text-zinc-400">Add, edit, and re-order custom project spotlights.</p>
                </div>
                <button
                  onClick={handleAddProject}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Project
                </button>
              </div>

              <div className="space-y-4">
                {draftData.projects.map((proj) => {
                  const isExpanded = expandedProj === proj.id;
                  return (
                    <div 
                      key={proj.id} 
                      className={`bg-zinc-905 border rounded-xl overflow-hidden transition-all ${
                        isExpanded ? 'border-zinc-700 bg-zinc-900/40 shadow-xl' : 'border-zinc-800 bg-zinc-900/10 hover:border-zinc-750'
                      }`}
                    >
                      {/* Collapse/Expand Toggle Row */}
                      <div 
                        onClick={() => setExpandedProj(isExpanded ? null : proj.id)}
                        className="p-4 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3.5 h-3.5 rounded-full ${proj.featured ? 'bg-orange-500' : 'bg-slate-700'}`} title={proj.featured ? "Featured spotlight" : "Auxiliary item"} />
                          <div>
                            <h3 className="text-sm font-bold text-white font-mono">{proj.title}</h3>
                            <span className="text-[10px] text-zinc-500 font-mono">{proj.role}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setExpandedProj(isExpanded ? null : proj.id)}
                            className="p-1 px-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-md text-[10px] font-mono uppercase tracking-wider cursor-pointer"
                          >
                            {isExpanded ? 'Minimize' : 'Edit Fields'}
                          </button>
                          <button
                            onClick={() => handleRemoveProject(proj.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-zinc-800/80 p-5 space-y-4"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Project Spotlight Name</label>
                                <input
                                  type="text"
                                  value={proj.title}
                                  onChange={(e) => handleProjectChange(proj.id, 'title', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-hidden focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Your Professional Role</label>
                                <input
                                  type="text"
                                  value={proj.role}
                                  onChange={(e) => handleProjectChange(proj.id, 'role', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-hidden focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Repository Code Link</label>
                                <input
                                  type="text"
                                  value={proj.codeUrl || ''}
                                  onChange={(e) => handleProjectChange(proj.id, 'codeUrl', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-hidden focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Active Demo Link</label>
                                <input
                                  type="text"
                                  value={proj.demoUrl || ''}
                                  onChange={(e) => handleProjectChange(proj.id, 'demoUrl', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-hidden focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Interactive Showcase Graphic Module</label>
                                <select
                                  value={proj.image}
                                  onChange={(e) => handleProjectChange(proj.id, 'image', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-hidden focus:border-blue-500"
                                >
                                  <option value="dashboard">Developer Dashboard Canvas</option>
                                  <option value="canvas">Whiteboard Interactive Nodes</option>
                                  <option value="design-system">Token Design Component Workshop</option>
                                  <option value="commerce">Mockup Interactive E-Shop Customizer</option>
                                </select>
                              </div>
                              <div className="flex items-center gap-4 pt-4">
                                <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider select-none cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={proj.featured}
                                    onChange={(e) => handleProjectChange(proj.id, 'featured', e.target.checked)}
                                    className="rounded border-zinc-800 bg-zinc-950 text-blue-500 focus:ring-opacity-0"
                                  />
                                  Feature on Spotlight (Large Banner)
                                </label>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Tags / Technologies (comma separated list)</label>
                              <input
                                type="text"
                                value={proj.tags.join(', ')}
                                onChange={(e) => {
                                  const splitTags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                                  handleProjectChange(proj.id, 'tags', splitTags);
                                }}
                                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-hidden focus:border-blue-500 font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Core Card Description</label>
                              <textarea
                                value={proj.description}
                                onChange={(e) => handleProjectChange(proj.id, 'description', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-hidden focus:border-blue-500 resize-y"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Detailed Long Experience Description (Renders on Click/Hover dialog)</label>
                              <textarea
                                value={proj.longDescription || ''}
                                onChange={(e) => handleProjectChange(proj.id, 'longDescription', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-hidden focus:border-blue-500 resize-y"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {draftData.projects.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
                    <p className="text-sm text-zinc-500 font-mono">No active projects loaded. Create one!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Roles & Professional Experience</h2>
                  <p className="text-xs text-zinc-400">Manage chronologized jobs, corporate timelines, and bullet milestones.</p>
                </div>
                <button
                  onClick={handleAddExperience}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Role
                </button>
              </div>

              <div className="space-y-4">
                {draftData.experiences.map((exp) => {
                  const isExpanded = expandedExp === exp.id;
                  return (
                    <div 
                      key={exp.id} 
                      className={`bg-zinc-905 border rounded-xl overflow-hidden transition-all ${
                        isExpanded ? 'border-zinc-700 bg-zinc-900/40 shadow-xl' : 'border-zinc-800 bg-zinc-900/10 hover:border-zinc-750'
                      }`}
                    >
                      {/* Collapse/Expand Toggle Row */}
                      <div 
                        onClick={() => setExpandedExp(isExpanded ? null : exp.id)}
                        className="p-4 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div>
                          <h3 className="text-sm font-bold text-white font-mono">{exp.role}</h3>
                          <span className="text-[10px] text-zinc-500 font-mono">{exp.company}  |  {exp.period}</span>
                        </div>
                        
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setExpandedExp(isExpanded ? null : exp.id)}
                            className="p-1 px-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-md text-[10px] font-mono uppercase tracking-wider cursor-pointer"
                          >
                            {isExpanded ? 'Minimize' : 'Edit Details'}
                          </button>
                          <button
                            onClick={() => handleRemoveExperience(exp.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-zinc-800/80 p-5 space-y-4"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Role Title</label>
                                <input
                                  type="text"
                                  value={exp.role}
                                  onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-hidden focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Company / Partner Name</label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-hidden focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Employment Duration</label>
                                <input
                                  type="text"
                                  value={exp.period}
                                  onChange={(e) => handleExperienceChange(exp.id, 'period', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-hidden focus:border-blue-500 font-mono"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Workspace Location</label>
                                <input
                                  type="text"
                                  value={exp.location || ''}
                                  onChange={(e) => handleExperienceChange(exp.id, 'location', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-hidden focus:border-blue-500 whitespace-nowrap"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Summary of Primary Context</label>
                              <textarea
                                value={exp.description}
                                onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-hidden focus:border-blue-500 resize-y"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider">Milestone Contribution Bullets</label>
                                <button
                                  type="button"
                                  onClick={() => handleAddExperienceBullet(exp.id)}
                                  className="text-[10px] text-zinc-400 hover:text-white font-mono flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus size={12} /> Add Bullet
                                </button>
                              </div>
                              
                              <div className="space-y-2">
                                {(exp.bullets || []).map((bullet, bIdx) => (
                                  <div key={bIdx} className="flex gap-2 items-start">
                                    <span className="text-zinc-650 font-mono text-xs pt-1.5 select-none shrink-0">•</span>
                                    <textarea
                                      value={bullet}
                                      onChange={(e) => handleExperienceBulletChange(exp.id, bIdx, e.target.value)}
                                      rows={2}
                                      className="flex-1 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-hidden focus:border-blue-500 resize-y"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveExperienceBullet(exp.id, bIdx)}
                                      className="text-zinc-600 hover:text-red-400 p-1 bg-zinc-900 rounded-md shrink-0 cursor-pointer"
                                      title="Delete milestone bullet"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {draftData.experiences.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
                    <p className="text-sm text-zinc-500 font-mono">No active experience logs. Create one!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Skillsets & Level Indices</h2>
                  <p className="text-xs text-zinc-400">Configure core developer, design or utilitarian technologies.</p>
                </div>
                <button
                  onClick={handleAddSkill}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Skill
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {draftData.skills.map((skill, sIdx) => (
                  <div key={sIdx} className="bg-zinc-900/30 p-4 border border-zinc-800/80 rounded-xl space-y-3 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-3">
                        <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Skill Name</label>
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => handleSkillChange(sIdx, 'name', e.target.value)}
                          className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-800/80 rounded-md text-white text-xs focus:outline-hidden focus:border-blue-500 font-bold"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteSkill(sIdx)}
                        className="text-zinc-600 hover:text-red-400 p-1.5 hover:bg-red-500/5 rounded-md cursor-pointer shrink-0 mt-4"
                        title="Delete index"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Category</label>
                        <select
                          value={skill.category}
                          onChange={(e) => handleSkillChange(sIdx, 'category', e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800/80 rounded-md text-white text-[10px] focus:outline-hidden focus:border-blue-500"
                        >
                          <option value="Frontend">Frontend Core</option>
                          <option value="Design">Visual Design</option>
                          <option value="Utilities">Utilities & Backend</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Lucide Symbol</label>
                        <select
                          value={skill.icon || ''}
                          onChange={(e) => handleSkillChange(sIdx, 'icon', e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800/80 rounded-md text-white text-[10px] focus:outline-hidden"
                        >
                          <option value="Flame">Flame (Fire)</option>
                          <option value="FileCode">FileCode (Code)</option>
                          <option value="Layers">Layers (Grid)</option>
                          <option value="Palette">Palette (Art)</option>
                          <option value="Sparkles">Sparkles (Magic)</option>
                          <option value="Cpu">Cpu (Tech)</option>
                          <option value="Layout">Layout (System)</option>
                          <option value="PenTool">PenTool (Vectors)</option>
                          <option value="Box">Box (Cube)</option>
                          <option value="Activity">Activity (Pulse)</option>
                          <option value="Terminal">Terminal (Shell)</option>
                          <option value="Network">Network (Nodes)</option>
                          <option value="GitBranch">GitBranch (Version)</option>
                          <option value="BarChart">BarChart (Metrics)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-1">
                        <span>PROFICIENCY LEVEL</span>
                        <span className="text-white font-bold">{skill.level}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={skill.level}
                        onChange={(e) => handleSkillChange(sIdx, 'level', parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'raw_code' && (
            <div className="space-y-6 max-w-4xl">
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-xl font-bold text-white">Dynamic JSON Source Code</h2>
                <p className="text-xs text-zinc-400">
                  Instantly copy the complete code representation of your customized changes to paste into <code className="text-white">src/data.ts</code> or download a clean JSON backup file.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center font-mono">
                  <span className="text-xs text-zinc-500">FORMATTED PORTFOLIODATA CODE STRING</span>
                  <div className="flex gap-2 flex-wrap xs:flex-nowrap">
                    <button
                      onClick={handleCopyCode}
                      className="p-2.5 px-3 bg-zinc-800 hover:bg-zinc-750 text-white text-xs rounded-lg transition-all border border-zinc-700 font-mono active:scale-95 flex items-center gap-1.5 cursor-pointer flex-1 xs:flex-none justify-center"
                    >
                      {copyFeedback ? (
                        <>
                          <Check size={13} className="text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Copy Code block
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadBackup}
                      className="p-2.5 px-3 bg-zinc-800 hover:bg-zinc-750 text-white text-xs rounded-lg transition-all border border-zinc-700 font-mono active:scale-95 flex items-center gap-1.5 cursor-pointer flex-1 xs:flex-none justify-center"
                    >
                      <Download size={13} /> Download JSON
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl overflow-x-auto max-h-[500px] scrollbar-thin">
                  <pre className="text-xs font-mono text-emerald-400 select-all leading-normal">
                    {`export const portfolioData: PortfolioData = `}
                    {JSON.stringify(draftData, null, 2)}
                    {`;`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inbox' && (() => {
            const filtered = adminMessages.filter((msg) => {
              // 1. apply filter category
              if (inboxFilter === 'unread' && msg.read) return false;
              if (inboxFilter === 'read' && !msg.read) return false;
              
              // 2. apply search terms query
              const term = inboxSearch.toLowerCase().trim();
              if (!term) return true;
              return (
                msg.name.toLowerCase().includes(term) ||
                msg.email.toLowerCase().includes(term) ||
                msg.subject.toLowerCase().includes(term) ||
                msg.message.toLowerCase().includes(term)
              );
            });

            const activeMessage = adminMessages.find((msg) => msg.id === activeMessageId) || null;

            const highlightText = (text: string, search: string) => {
              if (!search.trim()) return text;
              const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
              const parts = text.split(regex);
              return parts.map((part, i) => regex.test(part) ? <mark key={i} className="bg-yellow-500/30 text-yellow-250 font-semibold px-0.5 rounded">{part}</mark> : part);
            };

            return (
              <div className="space-y-6 max-w-6xl h-full flex flex-col">
                {/* Header & General controls block */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-zinc-800 pb-4 shrink-0">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Inbox size={20} className="text-blue-400" /> Received Messages Inbox
                    </h2>
                    <p className="text-xs text-zinc-400">Read, organize, and administer incoming site user submissions here.</p>
                  </div>

                  <div className="flex gap-2 flex-wrap w-full md:w-auto">
                    <button
                      onClick={() => exportInboxMessages('csv')}
                      className="p-2 px-3 bg-zinc-800 hover:bg-zinc-750 text-white text-xs rounded-lg transition-all border border-zinc-700 font-mono active:scale-95 flex items-center gap-1.5 cursor-pointer flex-1 md:flex-none justify-center"
                    >
                      <Download size={13} /> Export CSV
                    </button>
                    <button
                      onClick={() => exportInboxMessages('json')}
                      className="p-2 px-3 bg-zinc-800 hover:bg-zinc-750 text-white text-xs rounded-lg transition-all border border-zinc-700 font-mono active:scale-95 flex items-center gap-1.5 cursor-pointer flex-1 md:flex-none justify-center"
                    >
                      <Download size={13} /> Export JSON
                    </button>
                    {adminMessages.length > 0 && (
                      <button
                        onClick={clearAllInboxMessages}
                        className="p-2 px-3 bg-red-950/40 hover:bg-red-900/40 text-red-400 hover:text-red-300 text-xs rounded-lg transition-all border border-red-900/30 font-mono active:scale-95 flex items-center gap-1.5 cursor-pointer flex-1 md:flex-none justify-center"
                      >
                        <Trash2 size={13} /> Clear Inbox
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Double Deck Container */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[500px] h-[calc(100vh-270px)] md:h-[calc(100vh-320px)] select-text">
                  
                  {/* Panel 1: List column */}
                  <div className={`lg:col-span-5 border border-zinc-800/80 rounded-xl bg-zinc-900/10 flex flex-col overflow-hidden h-full ${activeMessage && 'hidden lg:flex'}`}>
                    
                    {/* Search & filters tools header */}
                    <div className="p-3 border-b border-zinc-805/80 bg-zinc-900/10 flex flex-col gap-2 shrink-0">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-zinc-500">
                          <Search size={14} />
                        </span>
                        <input
                          type="text"
                          placeholder="Search sender, email, subject, or message content..."
                          value={inboxSearch}
                          onChange={(e) => setInboxSearch(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-855 text-xs text-white pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-sans"
                        />
                        {inboxSearch && (
                          <button
                            onClick={() => setInboxSearch('')}
                            className="absolute right-3 top-2.5 text-xs font-mono text-zinc-500 hover:text-white"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Filter category capsules */}
                      <div className="flex gap-1 pt-1.5">
                        {(['all', 'unread', 'read'] as const).map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setInboxFilter(filter)}
                            className={`flex-1 py-1.5 text-[9px] font-bold tracking-widest uppercase rounded-md transition-all font-mono border ${
                              inboxFilter === filter
                                ? 'bg-blue-600/15 border-blue-500 text-blue-400'
                                : 'bg-transparent border-zinc-800 hover:bg-zinc-800/30 text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {filter} ({
                              filter === 'all'
                                ? adminMessages.length
                                : filter === 'unread'
                                ? adminMessages.filter(m => !m.read).length
                                : adminMessages.filter(m => m.read).length
                            })
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Messages Stack Scroll list */}
                    <div className="flex-1 overflow-y-auto divide-y divide-zinc-850/60 scrollbar-thin">
                      {filtered.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-500 gap-2.5">
                          <Inbox size={32} className="opacity-40" />
                          <p className="text-xs font-mono">No matching messages found in ledger.</p>
                        </div>
                      ) : (
                        filtered.map((msg) => {
                          const isSelected = msg.id === activeMessageId;
                          return (
                            <div
                              key={msg.id}
                              onClick={() => {
                                setActiveMessageId(msg.id);
                                if (!msg.read) {
                                  toggleMessageRead(msg.id);
                                }
                              }}
                              className={`p-3.5 transition-all cursor-pointer border-l-4 text-left select-none relative group ${
                                isSelected
                                  ? 'bg-blue-600/10 border-blue-500'
                                  : msg.read
                                  ? 'border-transparent hover:bg-zinc-900/30'
                                  : 'border-amber-500 bg-amber-500/[0.03] hover:bg-amber-500/[0.05]'
                              }`}
                            >
                              {/* Meta Info */}
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <span className="text-xs font-bold text-zinc-200 truncate pr-4">
                                  {highlightText(msg.name, inboxSearch)}
                                </span>
                                <span className="text-[9px] font-mono text-zinc-500 whitespace-nowrap pt-0.5">
                                  {msg.date.split(',')[0]}
                                </span>
                              </div>

                              <div className="text-[11px] font-bold text-zinc-400 truncate mb-1.5">
                                {highlightText(msg.subject || '(No Subject)', inboxSearch)}
                              </div>

                              <p className="text-[11px] text-zinc-500 leading-normal line-clamp-2 pr-4 break-words">
                                {msg.message}
                              </p>

                              {/* Small status badges */}
                              <div className="absolute right-3.5 bottom-3.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMessageRead(msg.id);
                                  }}
                                  className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                                  title={msg.read ? "Mark Unread" : "Mark Read"}
                                >
                                  {msg.read ? <EyeOff size={10} /> : <Eye size={10} />}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteInboxMessage(msg.id);
                                  }}
                                  className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40"
                                  title="Delete Message"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>

                              {/* Dot indicators */}
                              {!msg.read && (
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]"></span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Panel 2: Expanded active view details */}
                  <div className={`lg:col-span-7 border border-zinc-800/80 rounded-xl bg-zinc-900/10 flex flex-col overflow-hidden h-full ${!activeMessage && 'hidden lg:flex'}`}>
                    {activeMessage ? (
                      <div className="flex flex-col h-full overflow-hidden">
                        
                        {/* Mobile back trigger */}
                        <div className="p-3 bg-zinc-900/20 border-b border-zinc-850/80 flex lg:hidden items-center justify-between shrink-0 select-none">
                          <button
                            onClick={() => setActiveMessageId(null)}
                            className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer bg-zinc-800/50 py-1.5 px-3 rounded-md"
                          >
                            <ArrowLeft size={13} /> Message List
                          </button>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => toggleMessageRead(activeMessage.id)}
                              className="p-1.5 rounded-md bg-zinc-850 text-zinc-300 hover:text-white"
                            >
                              {activeMessage.read ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            <button
                              onClick={() => deleteInboxMessage(activeMessage.id)}
                              className="p-1.5 rounded-md bg-rose-950/40 text-rose-400 hover:text-white"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Visual Card Headers */}
                        <div className="p-5 border-b border-zinc-850 bg-zinc-950/40 flex justify-between items-start shrink-0">
                          <div className="space-y-1.5 min-w-0">
                            <span className="text-[9px] uppercase tracking-widest font-bold font-mono text-zinc-400 bg-zinc-800/70 border border-zinc-750 px-2 py-0.5 rounded">
                              Sender Profiles
                            </span>
                            <h3 className="text-base font-bold text-white leading-tight">
                              {activeMessage.name}
                            </h3>
                            <a
                              href={`mailto:${activeMessage.email}`}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 truncate w-fit font-mono font-medium underline decoration-blue-500/20"
                            >
                              {activeMessage.email} <ExternalLink size={10} />
                            </a>
                            <div className="text-xs text-zinc-400 font-medium italic mt-1 break-words">
                              Subject: <span className="text-zinc-200 not-italic font-semibold">{highlightText(activeMessage.subject || '(No Subject)', inboxSearch)}</span>
                            </div>
                          </div>

                          <div className="text-right hidden sm:block shrink-0 gap-1.5">
                            <span className="text-[10px] font-mono text-zinc-500 block">
                              {activeMessage.date}
                            </span>
                            <div className="flex gap-2 justify-end mt-2 animate-none">
                              <button
                                onClick={() => toggleMessageRead(activeMessage.id)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 text-[10px] rounded border border-zinc-750 font-mono transition-all"
                                title={activeMessage.read ? "Mark Unread" : "Mark Read"}
                              >
                                {activeMessage.read ? (
                                  <>
                                    <EyeOff size={11} /> Mark Unread
                                  </>
                                ) : (
                                  <>
                                    <Eye size={11} /> Mark Read
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => deleteInboxMessage(activeMessage.id)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-950/40 text-rose-400 hover:bg-rose-900/40 border border-rose-900/30 text-[10px] rounded font-mono transition-all"
                                title="Delete message permanently from disk"
                              >
                                <Trash2 size={11} /> Delete
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Visual Message Body */}
                        <div className="flex-1 p-5 overflow-y-auto bg-zinc-950/10 scrollbar-thin">
                          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 sm:p-5 text-xs text-zinc-200 leading-relaxed font-sans min-h-[150px] break-words whitespace-pre-wrap">
                            {highlightText(activeMessage.message, inboxSearch)}
                          </div>
                        </div>

                        {/* Footer Reply proxy trigger */}
                        <div className="p-4 bg-zinc-950/20 border-t border-zinc-850/80 shrink-0 flex justify-end gap-2.5">
                          <a
                            href={`mailto:${activeMessage.email}?subject=RE: ${encodeURIComponent(activeMessage.subject)}`}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-blue-500/10 select-none"
                          >
                            <Mail size={13} /> Reply to Sender
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-500 gap-3 italic select-none">
                        <MessageSquare size={36} className="opacity-40 animate-pulse text-zinc-400" />
                        <span className="text-xs font-mono not-italic text-zinc-400">Select an item from listing to read the full body content.</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
}
