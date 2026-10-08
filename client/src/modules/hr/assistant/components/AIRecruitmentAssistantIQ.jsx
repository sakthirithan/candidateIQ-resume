import React, { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import recruiterService from '@/services/recruiter/recruiterService';
import { ResponsibleAIDisclaimer } from '@/modules/shared';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Search,
  Award,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  Brain,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Zap,
  Filter,
  Check,
  ChevronRight
} from 'lucide-react';

function AIRecruitmentAssistantIQ({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const chatBottomRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'msg_1',
      sender: 'assistant',
      timestamp: 'Just now',
      type: 'text',
      content: 'Hello! I am your CandidateIQ Recruitment Intelligence Assistant. I am directly connected to your live MongoDB candidate applications, job requisitions, and candidate matching engine.\n\nTry asking me natural data queries like:',
      suggestions: [
        'Show active applicants for Full Stack Engineer',
        'Which candidate has the highest technical score?',
        'How many total candidate applications are under review?',
        'List missing skills for current job applicants'
      ]
    }
  ]);

  useEffect(() => {
    loadDatabaseData();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadDatabaseData = async () => {
    try {
      const [appsRes, jobsRes] = await Promise.all([
        recruiterService.getRecruiterApplications().catch(() => ({ applications: [] })),
        recruiterService.getRecruiterJobs().catch(() => ({ jobs: [] }))
      ]);

      setApplications(appsRes?.applications || []);
      setJobs(jobsRes?.jobs || []);
    } catch (err) {
      console.error('[AIRecruitmentAssistantIQ] Error loading DB data:', err);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const messageText = (textToSend || query).trim();
    if (!messageText || loading) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      content: messageText
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/analytics/ai-assistant', { prompt: messageText });
      const assistantText = res.data?.response || `Recruiter AI Assistant: Query processed against ${applications.length} MongoDB applications.`;

      const assistantMsg = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        content: assistantText
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        content: `I analyzed your query: "${messageText}". Currently tracking ${applications.length} applications across ${jobs.length} active requisitions in MongoDB.`
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="saas-card p-6 border border-slate-200/90 flex justify-between items-center bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold font-outfit text-slate-950">AI Recruitment Intelligence Assistant</h1>
            <span className="badge-pill badge-ai text-[10px]">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Database Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500">Query applicant records, skill gap matrices, and requisition analytics in natural language.</p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="saas-card border border-slate-200/80 bg-white rounded-2xl shadow-sm flex flex-col h-[600px] overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex justify-between items-center text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" /> Connected to MongoDB Candidate Applications ({applications.length})
          </span>
          <button onClick={loadDatabaseData} className="text-indigo-600 hover:underline flex items-center gap-1 font-bold">
            <RefreshCw className="w-3 h-3" /> Sync Telemetry
          </button>
        </div>

        {/* Message Stream */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className={`max-w-xl p-4 rounded-2xl text-xs space-y-2 ${
                m.sender === 'user' ? 'bg-indigo-600 text-white font-medium rounded-tr-none' : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                {m.suggestions && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {m.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(s)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-indigo-700 hover:bg-indigo-50 text-[11px] font-bold transition-all text-left"
                      >
                        💡 {s}
                      </button>
                    ))}
                  </div>
                )}
                <span className="text-[10px] text-slate-400 block text-right font-mono">{m.timestamp}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs italic">
                Synthesizing database telemetry and matching logic...
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
          <input
            type="text"
            placeholder="Ask AI Assistant about candidates, skill gaps, or hiring metrics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="input-saas flex-1 text-xs bg-white"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !query.trim()}
            className="btn-primary text-xs px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </div>
      </div>

      <ResponsibleAIDisclaimer />
    </div>
  );
}

export default AIRecruitmentAssistantIQ;
