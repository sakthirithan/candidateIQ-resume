import React, { useState } from 'react';
import api from '@/services/api';
import { mockAnalyticsService } from '@/services/mockApi/analyticsService';
import { Bot, Send, User, Sparkles, Database, HelpCircle } from 'lucide-react';

function AIRecruitmentAssistant() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am your AI Recruitment Intelligence Assistant. Ask me questions like:\n- "Show candidates with React and Node.js skills"\n- "Who has the highest technical interview score?"\n- "Which candidates have AWS skill gaps?"'
    }
  ]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);

    try {
      setLoading(true);
      const res = await api.post('/analytics/ai-assistant', { query: userText });
      setMessages((prev) => [...prev, { sender: 'assistant', text: res.data.answer }]);
    } catch (err) {
      const mockRes = await mockAnalyticsService.queryAssistant(userText);
      setMessages((prev) => [...prev, { sender: 'assistant', text: mockRes.answer }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 border border-slate-800 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-outfit">AI Recruitment Intelligence Assistant</h2>
          <p className="text-xs text-slate-400">Natural language data retrieval querying actual candidate profiles, skills, and match scores.</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="space-y-4 min-h-[300px] max-h-[450px] overflow-y-auto p-4 bg-slate-900/60 rounded-xl border border-slate-800">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`p-3.5 rounded-xl text-xs max-w-md ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 space-y-1'
              }`}
            >
              {msg.text.split('\n').map((line, lIdx) => (
                <p key={lIdx}>{line}</p>
              ))}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-slate-400">
            <Bot className="w-4 h-4 text-indigo-400 animate-spin" /> Querying candidate database...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AI recruitment assistant about candidates, skills, or job matches..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" /> Ask AI
        </button>
      </form>
    </div>
  );
}

export default AIRecruitmentAssistant;
