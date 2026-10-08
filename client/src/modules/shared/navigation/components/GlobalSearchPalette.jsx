import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Briefcase, Code, FileText, ArrowRight, Loader2, X, Command } from 'lucide-react';
import { mockGlobalSearchService } from '@/services/mockApi/globalSearchService';

function GlobalSearchPalette({ isOpen, onClose, onNavigate, userRole = 'candidate' }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ candidates: [], jobs: [], skills: [], applications: [], totalCount: 0 });
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ candidates: [], jobs: [], skills: [], applications: [], totalCount: 0 });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ candidates: [], jobs: [], skills: [], applications: [], totalCount: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await mockGlobalSearchService.search(query, userRole);
      setResults(res);
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query, userRole]);

  if (!isOpen) return null;

  const handleSelectResult = (item) => {
    onClose();
    if (onNavigate && item.targetTab) {
      onNavigate(item.targetTab, item.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-16 md:pt-24 px-4 z-50 animate-in fade-in duration-150 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 relative">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates, skills, jobs, applications..."
            className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {loading ? (
            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
          ) : query ? (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-md">
              ESC to close
            </kbd>
          )}
        </div>

        {/* Results Stream */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {!query.trim() && (
            <div className="py-8 text-center space-y-2">
              <Command className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Type a search term to find candidate profiles, job requisitions, skills, or applications.</p>
              <div className="flex justify-center gap-2 pt-2">
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[11px] font-semibold">Try "React"</span>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[11px] font-semibold">Try "Alex"</span>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[11px] font-semibold">Try "Senior"</span>
              </div>
            </div>
          )}

          {query.trim() && !loading && results.totalCount === 0 && (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-500 font-medium">No results found matching "<span className="font-bold text-slate-800">{query}</span>".</p>
            </div>
          )}

          {/* Candidates */}
          {results.candidates?.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                <User className="w-3 h-3 text-indigo-600" /> Candidates ({results.candidates.length})
              </div>
              <div className="space-y-1">
                {results.candidates.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-100 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 font-outfit group-hover:text-indigo-600 transition-colors">{item.title}</h5>
                      <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Jobs */}
          {results.jobs?.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                <Briefcase className="w-3 h-3 text-purple-600" /> Job Requisitions ({results.jobs.length})
              </div>
              <div className="space-y-1">
                {results.jobs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-purple-50/70 border border-transparent hover:border-purple-100 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 font-outfit group-hover:text-purple-600 transition-colors">{item.title}</h5>
                      <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold bg-purple-50 border border-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {results.skills?.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                <Code className="w-3 h-3 text-emerald-600" /> Skill Matrix ({results.skills.length})
              </div>
              <div className="space-y-1">
                {results.skills.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-100 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 font-outfit group-hover:text-emerald-600 transition-colors">{item.title}</h5>
                      <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Applications */}
          {results.applications?.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                <FileText className="w-3 h-3 text-amber-600" /> Applications ({results.applications.length})
              </div>
              <div className="space-y-1">
                {results.applications.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-100 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 font-outfit group-hover:text-amber-600 transition-colors">{item.title}</h5>
                      <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">Press <kbd className="bg-white border border-slate-200 rounded px-1 text-slate-600 font-semibold">Cmd/Ctrl + K</kbd> anytime to open Global Search</p>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearchPalette;
