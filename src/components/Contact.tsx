import { useState, useEffect, FormEvent, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageSquare, Send, CheckCircle2, Inbox, Trash2, Search, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { Profile } from '../types';

interface ContactProps {
  profile: Profile;
}

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
}

export default function Contact({ profile }: ContactProps) {
  // Form input states
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formErrors, setFormErrors] = useState({ name: '', email: '', subject: '', message: '' });
  const [touched, setTouched] = useState({ name: false, email: false, subject: false, message: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Inbound inbox drawer toggles
  const [inboxOpen, setInboxOpen] = useState(false);
  const [storedMessages, setStoredMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  // Load message store on initial mount
  useEffect(() => {
    try {
      const messagesJSON = localStorage.getItem('portfolio_received_messages');
      if (messagesJSON) {
        setStoredMessages(JSON.parse(messagesJSON));
      }
    } catch (e) {
      console.error("Local storage error loading portfolio messages", e);
    }
  }, []);

  // Real-time validation checks
  const runValidation = (data: typeof formData, activeTouched: typeof touched) => {
    const errors = { name: '', email: '', subject: '', message: '' };

    if (activeTouched.name && !data.name.trim()) {
      errors.name = 'Please provide your name.';
    }

    if (activeTouched.email) {
      if (!data.email.trim()) {
        errors.email = 'An email address is required.';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
        errors.email = 'Please provide a valid email format.';
      }
    }

    if (activeTouched.subject && !data.subject.trim()) {
      errors.subject = 'Please supply a request subject line.';
    }

    if (activeTouched.message) {
      if (!data.message.trim()) {
        errors.message = 'Please provide your message note.';
      } else if (data.message.trim().length < 10) {
        errors.message = 'Message must be at least 10 characters.';
      }
    }

    return errors;
  };

  // Run validation whenever input metrics change
  useEffect(() => {
    const errors = runValidation(formData, touched);
    setFormErrors(errors);
  }, [formData, touched]);

  const handleInputChange = (field: 'name' | 'email' | 'subject' | 'message', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleInputBlur = (field: 'name' | 'email' | 'subject' | 'message') => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validation checking for submission
  const validateForm = () => {
    const allTouched = { name: true, email: true, subject: true, message: true };
    setTouched(allTouched);
    
    const errors = runValidation(formData, allTouched);
    setFormErrors(errors);
    
    return !errors.name && !errors.email && !errors.subject && !errors.message;
  };

  // Form submit handler
  const handleFormSubmission = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const nameVal = formData.name.trim();
    const emailVal = formData.email.trim();
    const subjectVal = formData.subject.trim();
    const messageVal = formData.message.trim();

    // Simulate Network Latency
    setTimeout(() => {
      try {
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          name: nameVal,
          email: emailVal,
          subject: subjectVal,
          message: messageVal,
          date: new Date().toLocaleString()
        };

        const currentMessages = JSON.parse(localStorage.getItem('portfolio_received_messages') || '[]');
        const updatedMessages = [newMessage, ...currentMessages];

        localStorage.setItem('portfolio_received_messages', JSON.stringify(updatedMessages));
        setStoredMessages(updatedMessages);

        // Build elegant mailto link pre-drafted to target email
        const mailtoUrl = `mailto:godtimebenson09@gmail.com?subject=${encodeURIComponent(
          subjectVal
        )}&body=${encodeURIComponent(
          `Hello! You have received a new contact submission from your portfolio website.\n\n` +
          `--------------------------------------------------\n` +
          `Sender Name: ${nameVal}\n` +
          `Sender Email: ${emailVal}\n` +
          `Subject: ${subjectVal}\n` +
          `--------------------------------------------------\n\n` +
          `Message:\n${messageVal}\n\n` +
          `--\nThis message was draft-assembled automatically by your portfolio system, ready to send.`
        )}`;

        // Redirect to trigger mail client directly
        window.location.href = mailtoUrl;

        setIsSubmitting(false);
        setIsSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTouched({ name: false, email: false, subject: false, message: false });
      } catch (err) {
        console.error("Local storage submission error", err);
        setIsSubmitting(false);
        setIsSuccess(true); // fall-through grace
      }
    }, 1200);
  };

  // Inbox operations
  const handleDeleteMessage = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    try {
      const filtered = storedMessages.filter(m => m.id !== id);
      localStorage.setItem('portfolio_received_messages', JSON.stringify(filtered));
      setStoredMessages(filtered);
      if (activeMessageId === id) setActiveMessageId(null);
    } catch (err) {
      console.error("Local storage deletion error", err);
    }
  };

  const handleExportMessages = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storedMessages, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `portfolio_inbound_leads_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Local export error", err);
    }
  };

  const filteredInbound = storedMessages.filter(m => {
    const query = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.subject.toLowerCase().includes(query) ||
      m.message.toLowerCase().includes(query)
    );
  });

  return (
    <section
      id="contact"
      className="py-16 sm:py-20 lg:py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200/40 dark:border-zinc-900/40 transition-colors duration-300"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section title and visual hidden inbox switch trigger with In-View Animation */}
        <motion.div 
          className="flex justify-between items-end mb-10 lg:mb-12 gap-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-blue-500 block mb-2">Collaboration & Consulting</span>
            <div className="flex items-center gap-3">
              <h2
                id="contact-heading"
                className="text-3xl md:text-4xl font-display font-bold text-zinc-900 dark:text-zinc-50 tracking-tight cursor-help select-none"
                onClick={() => setInboxOpen(!inboxOpen)}
                title="Double click or click the dashboard icon to view locally submitted messages!"
              >
                Get in Touch
              </h2>
              {/* Subtle visual indicator portal to access local leads submissions offline */}
              <button
                id="open-inbox-portal-btn"
                onClick={() => setInboxOpen(!inboxOpen)}
                className={`p-1.5 rounded-lg border text-zinc-500 dark:text-zinc-400 transition-all cursor-pointer relative ${
                  inboxOpen ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950 font-bold' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0e0e0e]'
                }`}
                title="Open Local Leads Inbound Hub"
              >
                <Inbox size={12} />
                {storedMessages.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                )}
              </button>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">&lt;contact@developer.hub&gt;</span>
        </motion.div>

        {/* Dynamic content rendering: Inbound Lead Workspace Hub VS Standard Contact Form */}
        <div id="contact-outer-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <AnimatePresence mode="wait">
            {inboxOpen ? (
              /* THE LOCAL INBOUND MESSAGES INBOX DEVELOPER WORKSPACE */
              <motion.div
                key="local-inbox-portal"
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 12 }}
                transition={{ duration: 0.3 }}
                className="col-span-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-805 p-6 md:p-8 shadow-md"
              >
                {/* Inbox dashboard top details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-5 mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-blue-500">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5 font-display">
                        Leads Inbox Hub <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">LOCAL HUB</span>
                      </h4>
                      <p className="text-xs text-zinc-450">Manage or inspect leads submitted in this local session browser.</p>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {storedMessages.length > 0 && (
                      <button
                        onClick={handleExportMessages}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 text-xs font-mono font-medium text-zinc-650 dark:text-zinc-350 cursor-pointer"
                      >
                        <ExternalLink size={12} /> Export JSON
                      </button>
                    )}
                    <button
                      onClick={() => setInboxOpen(false)}
                      className="px-3 py-1.5 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 rounded text-xs font-medium cursor-pointer"
                    >
                      Back To Form
                    </button>
                  </div>
                </div>

                {/* Message display system */}
                {storedMessages.length === 0 ? (
                  <div className="text-center py-16">
                    <Inbox size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3 animate-bounce" />
                    <p className="text-sm font-semibold text-zinc-500">No leads captured yet.</p>
                    <p className="text-xs text-zinc-450 mt-1 max-w-sm mx-auto leading-relaxed">
                      Submit a test message via the contact form on this screen to see it logged instantly in this local developer panel!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column: Inbox List */}
                    <div className="md:col-span-4 flex flex-col gap-2 border-r border-zinc-200/50 dark:border-zinc-800/50 pr-2 max-h-[420px] overflow-y-auto">
                      <div className="relative mb-2">
                        <Search size={12} className="absolute left-2.5 top-2.5 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="Search leads..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full text-xs font-mono py-2 pl-8 pr-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded outline-none text-zinc-700 dark:text-zinc-300 focus:border-blue-500"
                        />
                      </div>

                      {filteredInbound.map(lead => (
                        <div
                          key={lead.id}
                          onClick={() => setActiveMessageId(lead.id)}
                          className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                            activeMessageId === lead.id
                              ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/10 dark:border-blue-900/50'
                              : 'bg-zinc-50/50 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900/30 dark:border-zinc-800/60 dark:hover:bg-zinc-850'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1 text-[10px] font-mono text-zinc-400">
                            <span className="truncate max-w-[100px]">{lead.date.split(',')[0]}</span>
                            <button
                              onClick={(e) => handleDeleteMessage(lead.id, e)}
                              className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Delete message"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                          <h5 className="text-xs font-bold text-zinc-850 dark:text-zinc-200 truncate">{lead.name}</h5>
                          <p className="text-[10px] text-zinc-500 truncate">{lead.subject}</p>
                        </div>
                      ))}
                    </div>

                    {/* Right Column: Detailed Reader pane */}
                    <div className="md:col-span-8 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-200/60 dark:border-zinc-850/60 p-5 md:p-6 min-h-[300px] flex flex-col justify-between">
                      {activeMessageId ? (
                        (() => {
                          const msg = storedMessages.find(m => m.id === activeMessageId);
                          if (!msg) return <p className="text-xs text-zinc-400 text-center my-auto">Select a lead message header.</p>;
                          return (
                            <div className="h-full flex flex-col justify-between flex-1">
                              <div>
                                <div className="border-b border-zinc-200/50 dark:border-zinc-850 pb-4 mb-4">
                                  <div className="flex justify-between items-baseline gap-2 mb-1.5 flex-wrap">
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{msg.name}</h4>
                                    <span className="text-[10px] font-mono text-zinc-400">{msg.date}</span>
                                  </div>
                                  <p className="text-xs text-blue-500 font-mono hover:underline truncate">
                                    <a href={`mailto:${msg.email}`}>{msg.email}</a>
                                  </p>
                                </div>

                                <div className="mb-4">
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">Subject</span>
                                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{msg.subject}</p>
                                </div>

                                <div>
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">Lead Message</span>
                                  <p className="text-xs text-zinc-600 dark:text-zinc-300 font-light leading-relaxed whitespace-pre-wrap font-sans">
                                    {msg.message}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-3 justify-end mt-6 border-t border-zinc-200/50 dark:border-zinc-850 pt-4">
                                <a
                                  href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                  className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 text-white dark:bg-zinc-50 dark:text-zinc-950 rounded text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                                >
                                  Reply Lead <Send size={10} />
                                </a>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="text-center my-auto py-10">
                          <MessageSquare size={24} className="mx-auto text-zinc-400 animate-pulse mb-2" />
                          <p className="text-xs text-zinc-405 font-mono">Select a message ledger from the left sidebar panel to read detailed notes.</p>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </motion.div>
            ) : (
              /* THE REVOLUTIONARY MINIMALLY BEAUTIFUL INTERACTIVE CONTACT FORM */
              <>
                {/* Left Side: Context details (Grid column 1 to 5) */}
                <div className="lg:col-span-5 space-y-6 pr-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-display font-medium text-zinc-900 dark:text-zinc-50 leading-tight mb-3">
                      Let's build something beautiful together.
                    </h3>
                    <p className="text-xs font-light leading-relaxed text-zinc-500 dark:text-zinc-400">
                      I'm currently accepting selective freelance consulting, freelance design, interface development, or engineering leadership contracts. Drop me detailed specifications about your layout!
                    </p>
                  </div>

                  {/* Standard cards details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-805 shadow-xs">
                      <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center">
                        <Mail size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-zinc-400 block tracking-wider">Personal Inbox</span>
                        <a href={`mailto:${profile.email}`} className="text-sm font-mono font-medium text-zinc-850 dark:text-zinc-200 hover:text-blue-500 transition-colors">
                          {profile.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-805 shadow-xs">
                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
                        <MessageSquare size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-zinc-400 block tracking-wider">Response times</span>
                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 font-sans">
                          Usually within 24 hours
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Animated Input Contact Form (Grid column 6 to 12) */}
                <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-805 p-6 md:p-8 relative overflow-hidden shadow-xs">
                  
                  <AnimatePresence mode="wait">
                    {isSuccess ? (
                      /* Success State Component Card */
                      <motion.div
                        key="contact-success-panel"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-center py-12 flex flex-col items-center justify-center h-full select-none"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                          className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center mb-4"
                        >
                          <CheckCircle2 size={24} />
                        </motion.div>
                        <h4 className="text-lg font-display font-bold text-zinc-900 dark:text-zinc-50 mb-1.5">
                          Message Received Successfully!
                        </h4>
                        <p className="text-xs text-zinc-450 leading-relaxed max-w-sm mb-6 font-light">
                          Thank you for reaching out. Your proposal is logged securely and I will get back to you as soon as possible!
                        </p>
                        <button
                          onClick={() => setIsSuccess(false)}
                          className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-850 text-xs font-mono rounded cursor-pointer transition-colors"
                        >
                          SUBMIT ANOTHER LEADS
                        </button>
                      </motion.div>
                    ) : (
                      /* Direct Input Form fields */
                      <motion.form
                        key="contact-regular-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleFormSubmission}
                        className="space-y-4"
                        noValidate
                      >
                        {/* Name and Email side-by-side */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="name" className="block text-[10px] font-mono uppercase text-zinc-500 mb-1.5 font-bold">
                              Your Name
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                onBlur={() => handleInputBlur('name')}
                                className={`w-full text-xs py-3 pl-4 pr-10 bg-zinc-50 dark:bg-zinc-950 border rounded-lg focus:ring-1 outline-none transition-all dark:text-zinc-200 ${
                                  formErrors.name 
                                    ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 ring-1 ring-red-500/10' 
                                    : touched.name && formData.name.trim() 
                                      ? 'border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500 ring-1 ring-emerald-500/10' 
                                      : 'border-zinc-200 dark:border-zinc-800 focus:ring-blue-500/20 focus:border-blue-500'
                                }`}
                                placeholder="e.g. Alexis"
                              />
                              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none select-none">
                                {formErrors.name ? (
                                  <AlertCircle size={14} className="text-red-500" />
                                ) : touched.name && formData.name.trim() ? (
                                  <CheckCircle2 size={14} className="text-emerald-500 animate-pulse" />
                                ) : null}
                              </div>
                            </div>
                            {formErrors.name && (
                              <p className="text-[9px] text-red-505 font-mono mt-1 flex items-center gap-1">
                                <AlertCircle size={10} /> {formErrors.name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-[10px] font-mono uppercase text-zinc-500 mb-1.5 font-bold">
                              Email Address
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                onBlur={() => handleInputBlur('email')}
                                className={`w-full text-xs py-3 pl-4 pr-10 bg-zinc-50 dark:bg-zinc-950 border rounded-lg focus:ring-1 outline-none transition-all dark:text-zinc-200 ${
                                  formErrors.email 
                                    ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 ring-1 ring-red-500/10' 
                                    : touched.email && formData.email.trim() 
                                      ? 'border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500 ring-1 ring-emerald-500/10' 
                                      : 'border-zinc-200 dark:border-zinc-800 focus:ring-blue-500/20 focus:border-blue-500'
                                }`}
                                placeholder="e.g. alexis@company.com"
                              />
                              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none select-none">
                                {formErrors.email ? (
                                  <AlertCircle size={14} className="text-red-500" />
                                ) : touched.email && formData.email.trim() ? (
                                  <CheckCircle2 size={14} className="text-emerald-500 animate-pulse" />
                                ) : null}
                              </div>
                            </div>
                            {formErrors.email && (
                              <p className="text-[9px] text-red-550 font-mono mt-1 flex items-center gap-1">
                                <AlertCircle size={10} /> {formErrors.email}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Subject header */}
                        <div>
                          <label htmlFor="subject" className="block text-[10px] font-mono uppercase text-zinc-500 mb-1.5 font-bold">
                            Subject Request
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="subject"
                              value={formData.subject}
                              onChange={(e) => handleInputChange('subject', e.target.value)}
                              onBlur={() => handleInputBlur('subject')}
                              className={`w-full text-xs py-3 pl-4 pr-10 bg-zinc-50 dark:bg-zinc-950 border rounded-lg focus:ring-1 outline-none transition-all dark:text-zinc-200 ${
                                formErrors.subject 
                                  ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 ring-1 ring-red-500/10' 
                                  : touched.subject && formData.subject.trim() 
                                    ? 'border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500 ring-1 ring-emerald-500/10' 
                                    : 'border-zinc-200 dark:border-zinc-800 focus:ring-blue-500/20 focus:border-blue-500'
                              }`}
                              placeholder="e.g. Interface Contract Project"
                            />
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none select-none">
                              {formErrors.subject ? (
                                <AlertCircle size={14} className="text-red-500" />
                              ) : touched.subject && formData.subject.trim() ? (
                                <CheckCircle2 size={14} className="text-emerald-500 animate-pulse" />
                              ) : null}
                            </div>
                          </div>
                          {formErrors.subject && (
                            <p className="text-[9px] text-red-500 font-mono mt-1 flex items-center gap-1">
                              <AlertCircle size={10} /> {formErrors.subject}
                            </p>
                          )}
                        </div>

                        {/* Text note message */}
                        <div>
                          <label htmlFor="message" className="block text-[10px] font-mono uppercase text-zinc-500 mb-1.5 font-bold">
                            Message Detail
                          </label>
                          <div className="relative">
                            <textarea
                              id="message"
                              rows={4}
                              value={formData.message}
                              onChange={(e) => handleInputChange('message', e.target.value)}
                              onBlur={() => handleInputBlur('message')}
                              className={`w-full text-xs py-3 pl-4 pr-10 bg-zinc-50 dark:bg-zinc-950 border rounded-lg focus:ring-1 outline-none transition-all dark:text-zinc-200 ${
                                formErrors.message 
                                  ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 ring-1 ring-red-500/10' 
                                  : touched.message && formData.message.trim().length >= 10 
                                    ? 'border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500 ring-1 ring-emerald-500/10' 
                                    : 'border-zinc-200 dark:border-zinc-800 focus:ring-blue-500/20 focus:border-blue-500'
                              }`}
                              placeholder="Detail your requirements, technology choices, timeline, and goals..."
                            />
                            <div className="absolute right-3.5 top-4 flex items-center justify-center pointer-events-none select-none">
                              {formErrors.message ? (
                                <AlertCircle size={14} className="text-red-500" />
                              ) : touched.message && formData.message.trim().length >= 10 ? (
                                <CheckCircle2 size={14} className="text-emerald-500 animate-pulse" />
                              ) : null}
                            </div>
                          </div>
                          {formErrors.message && (
                            <p className="text-[9px] text-red-500 font-mono mt-1 flex items-center gap-1">
                              <AlertCircle size={10} /> {formErrors.message}
                            </p>
                          )}
                        </div>

                        {/* Submit Actions button */}
                        <motion.button
                          id="submit-contact-btn"
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-900 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 py-3.5 px-6 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-colors select-none disabled:opacity-50 disabled:cursor-wait cursor-pointer group"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-50 border-t-transparent animate-spin"></div>
                              TRANSMITTING DETAILS...
                            </>
                          ) : (
                            <>
                              TRANSMIT MESSAGE
                              <Send size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </>
                          )}
                        </motion.button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
}
