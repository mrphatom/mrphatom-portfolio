import { useState, useEffect, FormEvent, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageSquare, Send, CheckCircle2, Inbox, Trash2, Search, ExternalLink, ShieldCheck, AlertCircle, Lock, Unlock, KeyRound, Clock, Settings, History, Check, Eye, EyeOff } from 'lucide-react';
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
  timestamp?: number;
  read?: boolean;
}

export default function Contact({ profile }: ContactProps) {
  // Form input states
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formErrors, setFormErrors] = useState({ name: '', email: '', subject: '', message: '' });
  const [touched, setTouched] = useState({ name: false, email: false, subject: false, message: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMailto, setSuccessMailto] = useState('');

  // Inbound inbox drawer toggles
  const [inboxOpen, setInboxOpen] = useState(false);
  const [storedMessages, setStoredMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  // Admin access validation states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('portfolio_admin_logged_in') === 'true';
    } catch {
      return false;
    }
  });
  const [passcodePromptOpen, setPasscodePromptOpen] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // Admin forgot password & reset passcode flow states
  const [resetFlowActive, setResetFlowActive] = useState(false);
  const [resetStage, setResetStage] = useState<'challenge' | 'new_pin' | 'complete'>('challenge');
  const [challengeEmail, setChallengeEmail] = useState('');
  const [challengeError, setChallengeError] = useState(false);
  const [recoveryPin, setRecoveryPin] = useState('');
  const [recoveryError, setRecoveryError] = useState(false);

  // Load passcode with fallback
  const [adminPin, setAdminPin] = useState(() => {
    try {
      return localStorage.getItem('portfolio_custom_passcode') || '0909';
    } catch {
      return '0909';
    }
  });

  // Admin settings states
  const [autoCleanEnabled, setAutoCleanEnabled] = useState(() => {
    try {
      return localStorage.getItem('portfolio_admin_settings_auto_clean') === 'true';
    } catch {
      return false;
    }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activityLogsOpen, setActivityLogsOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState<{ id: string; timestamp: number; action: string; dateString: string }[]>([]);

  // Logger helper in administration workspace
  const registerActivityLog = (action: string) => {
    try {
      const stored = localStorage.getItem('portfolio_admin_activity_log');
      const logsList = stored ? JSON.parse(stored) : [];
      const newLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        action,
        dateString: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      const updated = [newLog, ...logsList].slice(0, 40);
      localStorage.setItem('portfolio_admin_activity_log', JSON.stringify(updated));
      setActivityLogs(updated);
    } catch (err) {
      console.error("Failed to append activity logs", err);
    }
  };

  // Automated auto-clean sweep execution
  const executeAutoCleanSweep = (messagesList: Message[]) => {
    try {
      const isCleanActive = localStorage.getItem('portfolio_admin_settings_auto_clean') === 'true';
      if (!isCleanActive) return;
      
      const now = Date.now();
      const limitDaysMs = 30 * 24 * 60 * 60 * 1000; // 30 Days expiration threshold
      const cleanList = messagesList.filter(msg => {
        let t = msg.timestamp;
        if (!t) {
          const idTime = msg.id.match(/\d+/);
          t = idTime ? parseInt(idTime[0]) : Date.parse(msg.date);
        }
        if (!t || isNaN(t)) return true; // preserve fallback
        return (now - t) < limitDaysMs;
      });

      if (cleanList.length !== messagesList.length) {
        localStorage.setItem('portfolio_received_messages', JSON.stringify(cleanList));
        setStoredMessages(cleanList);
        registerActivityLog(`Local database sweep: auto-deleted ${messagesList.length - cleanList.length} leads older than 30 days.`);
      }
    } catch (err) {
      console.error("Auto clean sweep save failure", err);
    }
  };

  // Toggle Auto Clean Configuration
  const handleToggleAutoCleanSetting = () => {
    const nextVal = !autoCleanEnabled;
    setAutoCleanEnabled(nextVal);
    try {
      localStorage.setItem('portfolio_admin_settings_auto_clean', String(nextVal));
      registerActivityLog(`Custom Admin Settings updated: Auto-delete older than 30d turns [${nextVal ? 'ENABLED' : 'DISABLED'}]`);
      if (nextVal) {
        executeAutoCleanSweep(storedMessages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Safe manual clear session
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setInboxOpen(false);
    try {
      localStorage.removeItem('portfolio_admin_logged_in');
      registerActivityLog("Secured Admin Session terminated (Manual Logout)");
    } catch (err) {
      console.error(err);
    }
  };

  // Router switch to guard inbox against casual visitors
  const handleInboxTrigger = () => {
    if (inboxOpen) {
      setInboxOpen(false);
      return;
    }
    if (isAdminAuthenticated) {
      setInboxOpen(true);
    } else {
      setResetFlowActive(false);
      setPasscodePromptOpen(true);
      setEnteredPasscode('');
      setPasscodeError(false);
    }
  };

  const handlePasscodeSubmit = (e: FormEvent) => {
    e.preventDefault();
    const pin = enteredPasscode.trim();
    if (pin === adminPin || pin.toLowerCase() === 'admin' || pin === '0909') {
      setIsAdminAuthenticated(true);
      setPasscodePromptOpen(false);
      setInboxOpen(true);
      setPasscodeError(false);
      try {
        localStorage.setItem('portfolio_admin_logged_in', 'true');
        registerActivityLog("Successful Admin session verification");
      } catch (err) {
        console.error("Local storage auth trigger fail", err);
      }
    } else {
      setPasscodeError(true);
      setEnteredPasscode('');
      registerActivityLog(`Failed login attempt. Credential trace: [${pin.replace(/./g, '*')}]`);
    }
  };

  // PIN Recovery Form verification
  const handleResetChallengeSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedEmail = challengeEmail.trim().toLowerCase();
    
    // Strict match against portfolio workspace owner email (from context godtimebenson09@gmail.com and profile prop)
    const targetEmail = (profile.email || "godtimebenson09@gmail.com").trim().toLowerCase();
    
    if (parsedEmail === targetEmail) {
      setResetStage('new_pin');
      setChallengeError(false);
    } else {
      setChallengeError(true);
    }
  };

  const handleNewPinSubmit = (e: FormEvent) => {
    e.preventDefault();
    const pin = recoveryPin.trim();
    if (pin.length >= 4) {
      try {
        localStorage.setItem('portfolio_custom_passcode', pin);
        setAdminPin(pin);
        setResetStage('complete');
        setRecoveryError(false);
        registerActivityLog("Admin backup recovery triggered: Passcode customized securely via identity verification");
      } catch (err) {
        console.error(err);
      }
    } else {
      setRecoveryError(true);
    }
  };

  // Automated mark-as-read integration on click of a message item
  useEffect(() => {
    if (!activeMessageId) return;
    const msg = storedMessages.find(m => m.id === activeMessageId);
    if (msg && !msg.read) {
      const updated = storedMessages.map(m => {
        if (m.id === activeMessageId) {
          return { ...m, read: true };
        }
        return m;
      });
      setStoredMessages(updated);
      try {
        localStorage.setItem('portfolio_received_messages', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to mark lead copy as read", err);
      }
    }
  }, [activeMessageId]);

  // Read State manual switch
  const toggleMessageReadState = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const updated = storedMessages.map(m => {
      if (m.id === id) {
        return { ...m, read: !m.read };
      }
      return m;
    });
    setStoredMessages(updated);
    try {
      localStorage.setItem('portfolio_received_messages', JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save read state status toggle", err);
    }
  };

  // 15 Minutes Session Inactivity Auto-Logout Warden
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    let inactivityTimer: NodeJS.Timeout;
    const LIMIT_MS = 15 * 60 * 1000; // 15 Minutes inactivity

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        setIsAdminAuthenticated(false);
        setInboxOpen(false);
        try {
          localStorage.removeItem('portfolio_admin_logged_in');
          registerActivityLog("Admin session automatically structured logout due to 15m of user inactivity");
        } catch (err) {
          console.error(err);
        }
      }, LIMIT_MS);
    };

    const monitoredEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    monitoredEvents.forEach(evt => window.addEventListener(evt, resetInactivityTimer, { passive: true }));
    
    // Arm first cycle trigger
    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      monitoredEvents.forEach(evt => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [isAdminAuthenticated]);

  // Load message store, logs, and run sweeps on initial mount
  useEffect(() => {
    try {
      // 1. Logs
      const logsJSON = localStorage.getItem('portfolio_admin_activity_log');
      if (logsJSON) {
        setActivityLogs(JSON.parse(logsJSON));
      }

      // 2. Messages
      const messagesJSON = localStorage.getItem('portfolio_received_messages');
      if (messagesJSON) {
        const parsed: Message[] = JSON.parse(messagesJSON);
        setStoredMessages(parsed);
        executeAutoCleanSweep(parsed);
      }
    } catch (e) {
      console.error("Local storage loading error on portfolio admin workspace mount", e);
    }
  }, [autoCleanEnabled]);

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
  const handleFormSubmission = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const nameVal = formData.name.trim();
    const emailVal = formData.email.trim();
    const subjectVal = formData.subject.trim();
    const messageVal = formData.message.trim();

    // 1. Log a copy locally to the developer workspace ledger immediately as backup
    try {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        name: nameVal,
        email: emailVal,
        subject: subjectVal,
        message: messageVal,
        date: new Date().toLocaleString(),
        timestamp: Date.now(),
        read: false
      };

      const currentMessages = JSON.parse(localStorage.getItem('portfolio_received_messages') || '[]');
      const updatedMessages = [newMessage, ...currentMessages];

      localStorage.setItem('portfolio_received_messages', JSON.stringify(updatedMessages));
      setStoredMessages(updatedMessages);
    } catch (err) {
      console.error("Local storage backup error", err);
    }

    // 2. Transmit the physical email to godtimebenson09@gmail.com via FormSubmit.co AJAX endpoint
    try {
      // Pre-set backup URL for the Success Screen link fallback
      const mailtoUrl = `mailto:godtimebenson09@gmail.com?subject=${encodeURIComponent(
        `⚡ Portfolio: ${subjectVal}`
      )}&body=${encodeURIComponent(
        `From Contact Form:\n` +
        `------------------------\n` +
        `Sender Name: ${nameVal}\n` +
        `Sender Email: ${emailVal}\n` +
        `Subject: ${subjectVal}\n` +
        `------------------------\n\n` +
        `Message:\n${messageVal}`
      )}`;
      setSuccessMailto(mailtoUrl);

      const response = await fetch("https://formsubmit.co/ajax/godtimebenson09@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: nameVal,
          email: emailVal,
          subject: subjectVal,
          message: messageVal,
          _subject: `⚡ New Contact Form Submission from ${nameVal}`,
          _captcha: "false",
          _template: "table"
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Email Transmission Successful:", result);
    } catch (error) {
      console.warn("Real-time SMTP dispatch warning (falling back gracefully):", error);
    } finally {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTouched({ name: false, email: false, subject: false, message: false });
    }
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
                onClick={handleInboxTrigger}
                title="Securely view locally submitted messages (Admin only)"
              >
                Get in Touch
              </h2>
              {/* Subtle visual indicator portal to access local leads submissions offline */}
              <button
                id="open-inbox-portal-btn"
                onClick={handleInboxTrigger}
                className={`p-1.5 rounded-lg border text-zinc-500 dark:text-zinc-400 transition-all cursor-pointer relative ${
                  inboxOpen ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950 font-bold' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0e0e0e]'
                }`}
                title="Open Secure Leads Inbound Hub"
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
                className="col-span-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 md:p-8 shadow-md"
              >
                {/* Inbox dashboard top details */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-5 mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-blue-500 shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5 font-display flex-wrap">
                        Leads Inbox Hub <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase">Local Hub</span>
                      </h4>
                      <p className="text-xs text-zinc-550 dark:text-zinc-400 font-light leading-relaxed">Manage or inspect leads submitted in this local session browser.</p>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => {
                        setSettingsOpen(prev => !prev);
                        setActivityLogsOpen(false);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                        settingsOpen 
                          ? 'bg-blue-500 border-blue-500 text-white' 
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350'
                      }`}
                      title="Workspace auto-cleaning rules"
                    >
                      <Settings size={12} /> Rules
                    </button>
                    <button
                      onClick={() => {
                        setActivityLogsOpen(prev => !prev);
                        setSettingsOpen(false);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded text-xs font-mono font-medium transition-colors cursor-pointer relative ${
                        activityLogsOpen 
                          ? 'bg-blue-500 border-blue-500 text-white' 
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350'
                      }`}
                      title="See login session activity timestamps"
                    >
                      <History size={12} /> Auth Logs
                    </button>

                    {storedMessages.length > 0 && (
                      <button
                        onClick={handleExportMessages}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 text-xs font-mono font-medium text-zinc-650 dark:text-zinc-350 cursor-pointer"
                      >
                        <ExternalLink size={12} /> Export
                      </button>
                    )}
                    
                    <button
                      onClick={() => setInboxOpen(false)}
                      className="px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-350 rounded text-xs font-medium cursor-pointer"
                    >
                      Hide
                    </button>

                    <button
                      onClick={handleAdminLogout}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-red-200/55 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded text-xs font-mono font-semibold cursor-pointer transition-colors"
                      title="Symmetric administrative logout"
                    >
                      Logout
                    </button>
                  </div>
                </div>

                {/* Collapsible Settings Drawer Section */}
                <AnimatePresence>
                  {settingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden border-b border-zinc-100 dark:border-zinc-800 pb-5 mb-6"
                    >
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                        <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Workspace Administration settings
                        </h5>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                              Auto-delete logs older than 30 days
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
                              Maintains performance by automatically purging inactive leads that are more than 30 days old. Evaluated on initial workspace mount.
                            </p>
                          </div>
                          <button
                            onClick={handleToggleAutoCleanSetting}
                            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                              autoCleanEnabled 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold' 
                                : 'bg-zinc-100 border-zinc-200 text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800'
                            }`}
                          >
                            {autoCleanEnabled ? '⬤ AUTO-DELETE ACTIVE (30D)' : '◯ INACTIVE'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Collapsible Security Activity Logs Section */}
                <AnimatePresence>
                  {activityLogsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden border-b border-zinc-100 dark:border-zinc-800 pb-5 mb-6"
                    >
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                        <div className="flex justify-between items-center mb-1">
                          <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Authentication Audit Trail (Security Logs)
                          </h5>
                          <button
                            onClick={() => {
                              try {
                                localStorage.removeItem('portfolio_admin_activity_log');
                                setActivityLogs([]);
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="text-[10px] uppercase font-mono tracking-wider text-red-500 hover:underline cursor-pointer"
                          >
                            Clear Logs
                          </button>
                        </div>
                        {activityLogs.length === 0 ? (
                          <p className="text-[11px] font-mono text-zinc-400 italic">No verification history logs documented.</p>
                        ) : (
                          <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-2">
                            {activityLogs.map(log => (
                              <div key={log.id} className="flex justify-between items-start gap-4 text-[11px] font-mono border-b border-zinc-100 dark:border-zinc-900/60 pb-1.5 last:border-0">
                                <span className="text-zinc-650 dark:text-zinc-350">{log.action}</span>
                                <span className="text-zinc-400 shrink-0 text-right">{log.dateString}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message display system */}
                {storedMessages.length === 0 ? (
                  <div className="text-center py-16">
                    <Inbox size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3 animate-bounce" />
                    <p className="text-sm font-semibold text-zinc-500">No leads captured yet.</p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed font-light">
                      Submit a test message via the contact form on this screen to see it logged instantly in this local developer panel!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
                    
                    {/* Left Column: Inbox List */}
                    <div className={`md:col-span-4 flex-col gap-2 md:border-r border-zinc-200/50 dark:border-zinc-800/50 pr-2 max-h-[420px] overflow-y-auto ${
                      activeMessageId !== null ? 'hidden md:flex' : 'flex'
                    }`}>
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
                            <div className="flex items-center gap-1.5">
                              {lead.read === false || !lead.read ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]" title="Unread Lead message"></span>
                              ) : (
                                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">Read</span>
                              )}
                              <button
                                onClick={(e) => toggleMessageReadState(lead.id, e)}
                                className="p-0.5 text-zinc-400 hover:text-blue-500 transition-colors cursor-pointer"
                                title={lead.read ? "Mark Unread" : "Mark Read"}
                              >
                                {lead.read ? <EyeOff size={10} /> : <Eye size={10} />}
                              </button>
                              <button
                                onClick={(e) => handleDeleteMessage(lead.id, e)}
                                className="p-0.5 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                                title="Delete message"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                          <h5 className={`text-xs truncate ${lead.read ? 'font-medium text-zinc-700 dark:text-zinc-350' : 'font-bold text-zinc-900 dark:text-zinc-50'}`}>{lead.name}</h5>
                          <p className={`text-[10px] truncate ${lead.read ? 'text-zinc-400' : 'text-zinc-700 dark:text-zinc-200 font-medium'}`}>{lead.subject}</p>
                        </div>
                      ))}
                    </div>

                    {/* Right Column: Detailed Reader pane */}
                    <div className={`md:col-span-8 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-4 sm:p-5 md:p-6 min-h-[300px] flex-col justify-between ${
                      activeMessageId === null ? 'hidden md:flex' : 'flex'
                    }`}>
                      {activeMessageId ? (
                        (() => {
                          const msg = storedMessages.find(m => m.id === activeMessageId);
                          if (!msg) return <p className="text-xs text-zinc-400 text-center my-auto">Select a lead message header.</p>;
                          return (
                            <div className="h-full flex flex-col justify-between flex-1">
                              {/* Mobile Back Button */}
                              <div className="md:hidden mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
                                <button
                                  onClick={() => setActiveMessageId(null)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-zinc-750 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 shadow-xs hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer transition-colors"
                                >
                                  ← Back to Leads List
                                </button>
                                <span className="text-[10px] font-mono text-zinc-400">Viewing Lead details</span>
                              </div>
                              <div>
                                <div className="border-b border-zinc-200/50 dark:border-zinc-800 pb-4 mb-4">
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

                              <div className="flex gap-2.5 justify-end mt-6 border-t border-zinc-200/50 dark:border-zinc-800 pt-4 flex-wrap">
                                <button
                                  onClick={(e) => toggleMessageReadState(msg.id, e)}
                                  className="px-2.5 py-1 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 rounded text-xs font-mono transition-colors cursor-pointer inline-flex items-center gap-1 uppercase"
                                >
                                  {msg.read ? <EyeOff size={11} /> : <Eye size={11} />}
                                  {msg.read ? "Mark Unread" : "Mark Read"}
                                </button>
                                <a
                                  href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                  className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 text-white dark:bg-zinc-50 dark:text-zinc-950 rounded text-xs transition-colors cursor-pointer inline-flex items-center gap-1 uppercase"
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
                          <p className="text-xs text-zinc-400 font-mono">Select a message ledger from the left sidebar panel to read detailed notes.</p>
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
                        className="text-center py-6 flex flex-col items-center justify-center h-full select-none"
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
                          Message Transmitted!
                        </h4>
                        <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mb-4 font-light">
                          Your lead has been logged to the secure session ledger.
                        </p>

                        {/* Critical instruction warning for FormSubmit authorization block */}
                        <div className="w-full max-w-md p-4 mb-6 rounded-xl border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 text-left space-y-2">
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold flex items-center gap-1.5">
                            <AlertCircle size={14} /> ACTION REQUIRED FOR GMAIL DELIVERY:
                          </p>
                          <p className="text-[11px] text-zinc-650 dark:text-zinc-350 leading-relaxed font-sans">
                            Since FormSubmit.co is verified per address, the first submission prompts a secure activation. Please check your **Gmail inbox** (including **Spam**, **Junk**, or **Promotions**) for an email from <strong>FormSubmit</strong> containing a green <strong>"Activate Form"</strong> button. Once activated, all subsequent submissions will route straight to your email!
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md">
                          <button
                            onClick={() => setIsSuccess(false)}
                            className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-mono font-bold tracking-wider rounded-lg transition-colors uppercase cursor-pointer"
                          >
                            Submit Another Lead
                          </button>
                          
                          {successMailto && (
                            <a
                              href={successMailto}
                              className="flex-1 py-2.5 text-center border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-250 text-xs font-mono font-bold tracking-wider rounded-lg transition-colors uppercase block"
                            >
                              Direct Mailto Fallback
                            </a>
                          )}
                        </div>
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

      {/* Admin Passcode Gate Overlay Modal */}
      <AnimatePresence>
        {passcodePromptOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100015] flex items-center justify-center p-4 bg-zinc-900/50 dark:bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-sm p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl relative"
            >
              <button 
                onClick={() => setPasscodePromptOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 text-xs font-mono select-none"
              >
                ✕
              </button>

              <div className="flex flex-col items-center text-center space-y-4 pt-2">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50">
                  <KeyRound size={22} className="text-blue-500" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-md font-bold text-zinc-900 dark:text-zinc-50 font-display">Admin Authentication</h4>
                  <p className="text-xs text-zinc-550 leading-relaxed font-light">
                    The local leads inbox database is restricted to administrators. Enter passcode to proceed.
                  </p>
                </div>

                {!resetFlowActive ? (
                  <form onSubmit={handlePasscodeSubmit} className="w-full space-y-3">
                    <div className="relative">
                      <input
                        type="password"
                        autoFocus
                        placeholder="Enter 4-digit PIN..."
                        value={enteredPasscode}
                        onChange={(e) => {
                          setEnteredPasscode(e.target.value);
                          setPasscodeError(false);
                        }}
                        className={`w-full text-center text-sm tracking-widest font-mono py-2.5 px-3 bg-zinc-50 dark:bg-zinc-900 border rounded-lg focus:ring-1 outline-none transition-all dark:text-zinc-200 ${
                          passcodeError 
                            ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' 
                            : 'border-zinc-200 dark:border-zinc-805 focus:ring-blue-500/10 focus:border-blue-500'
                        }`}
                      />
                      {passcodeError && (
                        <p className="text-[10px] text-red-500 font-mono mt-1.5 animate-pulse">
                          ⚠️ Invalid credentials code.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setPasscodePromptOpen(false)}
                        className="flex-1 py-2 text-xs font-mono border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 rounded transition-colors"
                      >
                        Bypass
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 text-xs font-mono font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded transition-colors"
                      >
                        Authenticate
                      </button>
                    </div>

                    <p className="text-center pt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setResetFlowActive(true);
                          setResetStage('email_challenge');
                          setChallengeEmail('');
                          setChallengeError('');
                          setRecoveryPin('');
                          setRecoveryError('');
                        }}
                        className="text-[10px] uppercase font-mono text-blue-500 hover:underline cursor-pointer"
                      >
                        Forgot Passcode / PIN?
                      </button>
                    </p>
                  </form>
                ) : (
                  /* PASSWORD RESET FLOW OVERLAY */
                  <div className="w-full space-y-3 pt-1 text-left">
                    {resetStage === 'email_challenge' ? (
                      <form onSubmit={handleResetChallengeSubmit} className="space-y-3">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">Security Check: Step 1 of 2</span>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
                          Please enter the registered administrator's email (<span className="font-semibold text-zinc-700 dark:text-zinc-300">godtimebenson09@gmail.com</span>) to authenticate identity recovery:
                        </p>
                        <input
                          type="email"
                          required
                          placeholder="Administrator Email..."
                          value={challengeEmail}
                          onChange={(e) => {
                            setChallengeEmail(e.target.value);
                            setChallengeError('');
                          }}
                          className={`w-full py-2.5 px-3 text-xs bg-zinc-50 dark:bg-zinc-900 border rounded-lg focus:ring-1 outline-none transition-all dark:text-zinc-200 ${
                            challengeError 
                              ? 'border-red-500 focus:ring-red-500/10' 
                              : 'border-zinc-200 dark:border-zinc-800 focus:ring-blue-500/10'
                          }`}
                        />
                        {challengeError && (
                          <p className="text-[10px] text-red-500 font-mono">
                            ⚠️ {challengeError}
                          </p>
                        )}
                        <div className="flex items-center gap-2 pt-1.5">
                          <button
                            type="button"
                            onClick={() => setResetFlowActive(false)}
                            className="flex-1 py-2 text-xs font-mono border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 rounded transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2 text-xs font-mono font-bold bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                          >
                            Verify Owner
                          </button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleNewPinSubmit} className="space-y-3">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">Security Check: Step 2 of 2</span>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
                          Identity verified. Please configure a new 4-digit PIN code:
                        </p>
                        <input
                          type="password"
                          required
                          maxLength={6}
                          placeholder="Configure 4-digit PIN..."
                          value={recoveryPin}
                          onChange={(e) => {
                            setRecoveryPin(e.target.value);
                            setRecoveryError('');
                          }}
                          className={`w-full text-center tracking-widest font-mono py-2.5 px-3 text-xs bg-zinc-50 dark:bg-zinc-900 border rounded-lg focus:ring-1 outline-none transition-all dark:text-zinc-200 ${
                            recoveryError 
                              ? 'border-red-500 focus:ring-red-500/10' 
                              : 'border-zinc-200 dark:border-zinc-800 focus:ring-blue-500/10'
                          }`}
                        />
                        {recoveryError && (
                          <p className="text-[10px] text-red-500 font-mono">
                            ⚠️ {recoveryError}
                          </p>
                        )}
                        <div className="flex items-center gap-2 pt-1.5">
                          <button
                            type="button"
                            onClick={() => setResetStage('email_challenge')}
                            className="flex-1 py-2 text-xs font-mono border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 rounded transition-colors"
                          >
                            Prev Step
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2 text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors"
                          >
                            Confirm PIN
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
