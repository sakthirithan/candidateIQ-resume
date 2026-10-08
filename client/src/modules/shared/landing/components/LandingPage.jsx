import React, { useState } from 'react';
import { getCurrentUser } from '@/utils/auth';
import ProfileMenu from '../../layout/components/ProfileMenu';
import {
  Sparkles, ArrowRight, Play, CheckCircle2, Cpu, ShieldCheck, Zap, BarChart3,
  Layers, Users, Award, FileText, ChevronRight, Menu, X, Code, Search, Brain, Target,
  ArrowDown, HelpCircle, Briefcase, User, Check, AlertTriangle, TrendingUp
} from 'lucide-react';

function LandingPage({
  onGetStarted,
  onLogin,
  onRegister,
  onRegisterCandidate,
  onRegisterRecruiter,
  onExploreDemo,
  onExploreCandidateDemo,
  onExploreRecruiterDemo,
  onOpenWorkspace,
  onOpenSettings,
  onNavigateToProfile,
  onLogout
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUser = getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 flex flex-col font-sans antialiased select-none">
      {/* 3. NAVBAR STRATEGY */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          {/* Left Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center text-white font-black text-sm font-outfit shadow-md">
              IQ
            </div>
            <div>
              <span className="text-lg font-extrabold font-outfit tracking-tight text-slate-950 block leading-none">
                Candidate<span className="text-indigo-600">IQ</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider block mt-0.5">AI CANDIDATE INTELLIGENCE</span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#product" className="hover:text-slate-950 transition-colors">Product</a>
            <a href="#features" className="hover:text-slate-950 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-950 transition-colors">How It Works</a>
            <a href="#candidates" className="hover:text-slate-950 transition-colors">For Candidates</a>
            <a href="#recruiters" className="hover:text-slate-950 transition-colors">For Recruiters</a>
          </nav>

          {/* Right Section — Authenticated vs Guest (Point 28) */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenWorkspace}
                  className="btn-primary text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-sm"
                >
                  Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <ProfileMenu
                  onOpenSettings={onOpenSettings}
                  onNavigateToProfile={onNavigateToProfile}
                  onLogoutSuccess={onLogout}
                />
              </div>
            ) : (
              <>
                <button
                  onClick={onGetStarted}
                  className="btn-primary text-xs font-bold px-4 py-2.5 shadow-md shadow-indigo-500/10 flex items-center gap-2"
                >
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-6 py-4 space-y-3 text-xs font-semibold text-slate-700">
            <a href="#product" onClick={() => setMobileMenuOpen(false)} className="block py-1">Product</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-1">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-1">How It Works</a>
            <a href="#candidates" onClick={() => setMobileMenuOpen(false)} className="block py-1">For Candidates</a>
            <a href="#recruiters" onClick={() => setMobileMenuOpen(false)} className="block py-1">For Recruiters</a>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {currentUser ? (
                <button onClick={() => { setMobileMenuOpen(false); onOpenWorkspace(); }} className="btn-primary w-full text-xs">
                  Open Workspace ({currentUser.name})
                </button>
              ) : (
                <>
                  <button onClick={() => { setMobileMenuOpen(false); onLogin(); }} className="btn-secondary w-full text-xs">Login</button>
                  <button onClick={() => { setMobileMenuOpen(false); onRegister(); }} className="btn-outline w-full text-xs">Register</button>
                  <button onClick={() => { setMobileMenuOpen(false); onGetStarted(); }} className="btn-primary w-full text-xs">Get Started</button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 4. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-gradient-to-tr from-indigo-200/40 via-purple-200/30 to-blue-200/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {/* Hero Positioning Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>AI-Powered Candidate Intelligence for Smarter Hiring</span>
        </div>

        {/* Headlines */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-outfit text-slate-950 tracking-tight leading-[1.1]">
            From resume to interview — <span className="gradient-text">one intelligent candidate profile.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Build a stronger professional profile, understand your strengths, and give recruiters the intelligence they need to make better hiring decisions.
          </p>
        </div>

        {/* Hero Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onRegisterCandidate || onGetStarted}
            className="btn-primary text-sm font-bold px-6 py-3.5 shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            Create Your Profile <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onExploreDemo}
            className="btn-secondary text-sm font-bold px-6 py-3.5 flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-100"
          >
            <Play className="w-4 h-4 text-indigo-600 fill-indigo-600/20" /> Explore Interactive Demo
          </button>
        </div>

        {/* 5. HERO PRODUCT VISUAL MOCKUP */}
        <div className="pt-6 max-w-5xl mx-auto">
          <div className="saas-card p-3 md:p-4 bg-white border border-slate-200/90 shadow-2xl rounded-2xl relative overflow-hidden text-left">
            <div className="p-4 md:p-6 bg-slate-950 rounded-xl text-white space-y-6">
              {/* Header Bar Mockup */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs font-outfit">
                    IQ
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-outfit text-slate-100">CandidateIQ Intelligence Suite</h3>
                    <p className="text-[11px] text-slate-400">Good morning, Theeran</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Profile Strength</span>
                  <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '86%' }}></div>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 font-mono">86%</span>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Technical Skills</span>
                  <div className="text-3xl font-black font-outfit text-indigo-400">92%</div>
                  <p className="text-[11px] text-slate-400">React, Node.js, MongoDB, ES6+</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Unified Score</span>
                  <div className="text-3xl font-black font-outfit text-cyan-400">88 / 100</div>
                  <p className="text-[11px] text-slate-400">Resume + Interview + Skill Evidence</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Job Compatibility</span>
                  <div className="text-3xl font-black font-outfit text-emerald-400">88% Match</div>
                  <p className="text-[11px] text-slate-400">Senior MERN & AI Architect Requisitions</p>
                </div>
              </div>

              {/* AI Profile Insights Callout */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                <span className="font-bold text-indigo-400 uppercase tracking-wider">AI Profile Insights</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <p className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Strong technical foundation & architecture depth</p>
                  <p className="flex items-center gap-1.5 text-amber-400"><ArrowRight className="w-3.5 h-3.5 shrink-0" /> Improve communication evidence in STAR responses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST / POSITIONING STRIP */}
      <section className="py-8 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span className="text-slate-900">Built for the complete hiring journey:</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Candidate Intelligence</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> AI Profile Analysis</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Skill Intelligence</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Recruiter Discovery</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Hiring Insights</span>
        </div>
      </section>

      {/* 7. PROBLEM SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">The Problem</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit text-slate-950 tracking-tight">
            Hiring shouldn't start with a pile of resumes.
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Candidates have skills, experiences and potential that are difficult to communicate through a traditional resume. Recruiters, meanwhile, spend valuable time sorting through fragmented information to understand who actually fits a role.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Candidates Problem Card */}
          <div className="saas-card p-8 bg-white border border-slate-200 space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold">For Candidates</span>
              <h3 className="text-xl font-bold font-outfit text-slate-950 pt-2">Your resume doesn't tell the whole story.</h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> Skills hidden across multiple fragmented sections</li>
              <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> Difficulties presenting true technical strengths</li>
              <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> No clear profile intelligence or feedback score</li>
              <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> Unclear areas for technical and behavioural improvement</li>
            </ul>
            <button onClick={onRegisterCandidate || onGetStarted} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5">
              Build a smarter profile <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* For Recruiters Problem Card */}
          <div className="saas-card p-8 bg-white border border-slate-200 space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">For Recruiters</span>
              <h3 className="text-xl font-bold font-outfit text-slate-950 pt-2">Finding the right candidate shouldn't require endless screening.</h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" /> Resume overload & unstructured PDF clutter</li>
              <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" /> Time-consuming manual candidate comparison</li>
              <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" /> Difficult technical skill proficiency evaluation</li>
              <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" /> Fragmented applicant information across spreadsheets</li>
            </ul>
            <button onClick={onRegisterRecruiter || onGetStarted} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5">
              Discover better candidates <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. SOLUTION SECTION */}
      <section id="product" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 space-y-12 text-center">
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">The Solution</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit text-slate-950 tracking-tight">
              One intelligent profile. A clearer hiring picture.
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              CandidateIQ brings candidate information, skills, experience and AI-driven insights into a unified profile designed for both candidates and recruiters.
            </p>
          </div>

          {/* Visual Flow Pipeline */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6 text-xs font-bold">
            <div className="px-4 py-3 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">Raw Resume</div>
            <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="px-4 py-3 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200">Candidate Profile</div>
            <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="px-4 py-3 rounded-xl bg-purple-50 text-purple-900 border border-purple-200">AI Analysis</div>
            <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="px-4 py-3 rounded-xl bg-cyan-50 text-cyan-900 border border-cyan-200">Skills + Insights</div>
            <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="px-4 py-3 rounded-xl bg-slate-950 text-white shadow-md">Recruiter Intelligence</div>
            <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-md">Better Hiring Decisions</div>
          </div>
        </div>
      </section>

      {/* 9. CANDIDATE EXPERIENCE */}
      <section id="candidates" className="py-20 px-6 max-w-7xl mx-auto space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Candidate Experience</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit text-slate-950 tracking-tight">
              Turn your experience into candidate intelligence.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Build a professional profile that goes beyond a static resume. Organize your experience, showcase your skills and understand how your profile can become stronger.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1">
                <h4 className="text-xs font-bold font-outfit text-slate-900">Intelligent Profile</h4>
                <p className="text-[11px] text-slate-500">Create a structured professional identity.</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1">
                <h4 className="text-xs font-bold font-outfit text-slate-900">Skill Intelligence</h4>
                <p className="text-[11px] text-slate-500">Showcase technical & soft competencies.</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1">
                <h4 className="text-xs font-bold font-outfit text-slate-900">Resume Insights</h4>
                <p className="text-[11px] text-slate-500">Transform resume data into profile metrics.</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1">
                <h4 className="text-xs font-bold font-outfit text-slate-900">Profile Strength</h4>
                <p className="text-[11px] text-slate-500">Understand completeness and competitiveness.</p>
              </div>
            </div>

            <button
              onClick={onRegisterCandidate || onGetStarted}
              className="btn-primary text-xs font-bold px-6 py-3 flex items-center gap-2"
            >
              Build My Candidate Profile <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 10. CANDIDATE PRODUCT PREVIEW MOCKUP */}
          <div className="saas-card p-6 bg-white border border-slate-200 space-y-5 shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-bold font-outfit text-slate-900">Candidate Strength Breakdown</span>
              <span className="text-xs font-bold text-indigo-600">86% Overall</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-slate-700">Technical Skills</span>
                  <span className="text-indigo-600 font-bold font-mono">91%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '91%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-slate-700">Professional Experience</span>
                  <span className="text-purple-600 font-bold font-mono">82%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-slate-700">Profile Completeness</span>
                  <span className="text-emerald-600 font-bold font-mono">89%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '89%' }}></div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px]">AI Recommendations</span>
              <p className="text-slate-700 flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Strong technical skills & MERN architecture</p>
              <p className="text-slate-700 flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Relevant project experience & live URLs</p>
              <p className="text-slate-600 flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5 text-indigo-600" /> Add measurable project outcomes</p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. RECRUITER EXPERIENCE */}
      <section id="recruiters" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* 12. RECRUITER PRODUCT PREVIEW MOCKUP */}
          <div className="saas-card p-6 bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs font-bold font-outfit text-slate-100">Candidate Intelligence Sandbox</span>
              <span className="text-[10px] text-cyan-400 font-mono">4 Candidates Found</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-100 font-outfit">Theeran Austin</h4>
                  <p className="text-[11px] text-indigo-400 font-semibold">Full Stack Developer</p>
                  <p className="text-[10px] text-slate-400 mt-1">Skills: 91% • Experience: 3 Yrs</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">94% Match</span>
                  <div className="flex gap-1.5 mt-2">
                    <button className="px-2 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold">View Profile</button>
                    <button className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">Shortlist</button>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-100 font-outfit">Priya Sharma</h4>
                  <p className="text-[11px] text-purple-400 font-semibold">AI Engineer</p>
                  <p className="text-[10px] text-slate-400 mt-1">Skills: 93% • Experience: 2 Yrs</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-cyan-400 font-mono">89% Match</span>
                  <div className="flex gap-1.5 mt-2">
                    <button className="px-2 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold">View Profile</button>
                    <button className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">Shortlist</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Recruiter Experience</span>
            <h2 className="text-3xl sm:text-4xl font-black font-outfit tracking-tight">
              See candidates beyond the resume.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              CandidateIQ gives recruiters a structured view of candidate profiles, skills and AI-assisted insights so they can spend less time sorting information and more time evaluating potential.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="font-bold text-slate-100 font-outfit">Candidate Discovery</h4>
                <p className="text-slate-400 text-[11px]">Find relevant candidates quickly.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="font-bold text-slate-100 font-outfit">Skill Matching</h4>
                <p className="text-slate-400 text-[11px]">Compare skills against requirements.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="font-bold text-slate-100 font-outfit">Shortlisting</h4>
                <p className="text-slate-400 text-[11px]">Organize promising candidates.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="font-bold text-slate-100 font-outfit">Hiring Pipeline</h4>
                <p className="text-slate-400 text-[11px]">Track candidates through recruitment.</p>
              </div>
            </div>

            <button
              onClick={onRegisterRecruiter || onGetStarted}
              className="btn-primary text-xs font-bold px-6 py-3 flex items-center gap-2"
            >
              Explore Recruiter Workspace <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 13. AI INTELLIGENCE SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Practical AI Intelligence</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit text-slate-950 tracking-tight">
            AI that turns candidate data into useful insight.
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Practical decision-support software transforming raw resumes into explainable metric evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="saas-card p-6 bg-white border border-slate-200 space-y-3">
            <Brain className="w-6 h-6 text-indigo-600" />
            <h3 className="text-base font-bold font-outfit text-slate-950">Profile Intelligence</h3>
            <p className="text-xs text-slate-600">Structured evaluation across technical and behavioural markers.</p>
          </div>
          <div className="saas-card p-6 bg-white border border-slate-200 space-y-3">
            <Code className="w-6 h-6 text-purple-600" />
            <h3 className="text-base font-bold font-outfit text-slate-950">Skill Intelligence</h3>
            <p className="text-xs text-slate-600">Category breakdown with confidence ratings and experience tenure.</p>
          </div>
          <div className="saas-card p-6 bg-white border border-slate-200 space-y-3">
            <Target className="w-6 h-6 text-cyan-600" />
            <h3 className="text-base font-bold font-outfit text-slate-950">Candidate Matching</h3>
            <p className="text-xs text-slate-600">Weighted requisition compatibility score with skill gap highlights.</p>
          </div>
          <div className="saas-card p-6 bg-white border border-slate-200 space-y-3">
            <Zap className="w-6 h-6 text-emerald-600" />
            <h3 className="text-base font-bold font-outfit text-slate-950">Actionable Insights</h3>
            <p className="text-xs text-slate-600">Explainable evidence callouts for candidates and talent acquisition leads.</p>
          </div>
        </div>
      </section>

      {/* 14. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-slate-100/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit text-slate-950 tracking-tight">
              A smarter hiring journey in four steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
              <span className="text-3xl font-black font-outfit text-indigo-600">01</span>
              <h3 className="text-base font-bold font-outfit text-slate-950">Create</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Build your CandidateIQ profile and upload your resume.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
              <span className="text-3xl font-black font-outfit text-purple-600">02</span>
              <h3 className="text-base font-bold font-outfit text-slate-950">Analyze</h3>
              <p className="text-xs text-slate-600 leading-relaxed">AI organizes candidate information and identifies insights.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
              <span className="text-3xl font-black font-outfit text-cyan-600">03</span>
              <h3 className="text-base font-bold font-outfit text-slate-950">Discover</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Recruiters discover and evaluate candidates through profiles.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
              <span className="text-3xl font-black font-outfit text-emerald-600">04</span>
              <h3 className="text-base font-bold font-outfit text-slate-950">Decide</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Use candidate intelligence to support better hiring decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 15. INTERACTIVE DEMO SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center space-y-12">
        <div className="space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Interactive Sandbox</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit text-slate-950 tracking-tight">
            See CandidateIQ in action.
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Explore both sides of the platform before creating an account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="saas-card p-8 bg-white border border-slate-200 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mx-auto">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-outfit text-slate-950">Candidate Workspace</h3>
            <p className="text-xs text-slate-600">See how candidates build and improve their professional profile.</p>
            <button
              onClick={onExploreCandidateDemo || onExploreDemo}
              className="btn-primary text-xs font-bold w-full py-3 flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5" /> Try Candidate Demo
            </button>
          </div>

          <div className="saas-card p-8 bg-white border border-slate-200 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-outfit text-slate-950">Recruiter Workspace</h3>
            <p className="text-xs text-slate-600">Explore how recruiters discover, evaluate and shortlist candidates.</p>
            <button
              onClick={onExploreRecruiterDemo || onExploreDemo}
              className="btn-secondary text-xs font-bold w-full py-3 flex items-center justify-center gap-2 border border-slate-200"
            >
              <Play className="w-3.5 h-3.5 text-indigo-600" /> Try Recruiter Demo
            </button>
          </div>
        </div>
      </section>

      {/* 21. WHY CANDIDATEIQ (3 PILLARS) */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 space-y-12 text-center">
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Concrete Differentiation</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit text-slate-950 tracking-tight">
              Built around the candidate, not just the resume.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="saas-card p-8 bg-slate-50 border border-slate-200 text-left space-y-3">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Unified</span>
              <h3 className="text-lg font-bold font-outfit text-slate-950">One Structured Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Candidate information lives in one structured profile rather than scattered files.</p>
            </div>
            <div className="saas-card p-8 bg-slate-50 border border-slate-200 text-left space-y-3">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Intelligent</span>
              <h3 className="text-lg font-bold font-outfit text-slate-950">Actionable AI Insights</h3>
              <p className="text-xs text-slate-600 leading-relaxed">AI helps transform raw information into useful, explainable decision support.</p>
            </div>
            <div className="saas-card p-8 bg-slate-50 border border-slate-200 text-left space-y-3">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Connected</span>
              <h3 className="text-lg font-bold font-outfit text-slate-950">Shared Layer</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Candidates and recruiters interact through the exact same intelligence layer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 22. ROLE-BASED CTA SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="saas-card p-8 bg-indigo-950 text-white space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Candidates</span>
            <h3 className="text-2xl font-bold font-outfit">Your next opportunity starts with a stronger profile.</h3>
            <button
              onClick={onRegisterCandidate || onGetStarted}
              className="btn-primary text-xs font-bold px-6 py-3"
            >
              Create Candidate Account
            </button>
          </div>

          <div className="saas-card p-8 bg-slate-950 text-white space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">Recruiters</span>
            <h3 className="text-2xl font-bold font-outfit">Find the people behind the resumes.</h3>
            <div className="space-y-3">
              <button
                onClick={onRegisterRecruiter || onGetStarted}
                className="btn-primary text-xs font-bold px-6 py-3 w-full sm:w-auto"
              >
                Create Recruiter Account
              </button>
              <p className="text-[11px] text-slate-400">Includes ₹1 demo activation license</p>
            </div>
          </div>
        </div>
      </section>

      {/* 23. FINAL CTA */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <div className="saas-card p-10 bg-slate-950 text-white rounded-3xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black font-outfit tracking-tight">
            From profile to potential.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Build smarter candidate profiles and make recruitment decisions with better intelligence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button onClick={onGetStarted} className="btn-primary text-xs font-bold px-6 py-3">
              Get Started
            </button>
            <button onClick={onExploreDemo} className="btn-secondary text-xs font-bold px-6 py-3 bg-slate-900 border border-slate-800 text-slate-200">
              Explore Demo
            </button>
          </div>
        </div>
      </section>

      {/* 24. FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 text-xs text-slate-600">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 font-bold font-outfit text-slate-950 text-base">
              <div className="w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center text-xs">IQ</div>
              CandidateIQ
            </div>
            <p className="text-slate-500 leading-relaxed max-w-xs">
              AI-powered candidate intelligence for smarter hiring. From resume to interview — one intelligent candidate profile.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-950 font-outfit uppercase tracking-wider text-[11px]">Product</h4>
            <ul className="space-y-1.5">
              <li><a href="#features" className="hover:text-slate-950">Candidate Intelligence</a></li>
              <li><a href="#features" className="hover:text-slate-950">Recruiter Intelligence</a></li>
              <li><a href="#features" className="hover:text-slate-950">AI Insights</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-950 font-outfit uppercase tracking-wider text-[11px]">Candidates</h4>
            <ul className="space-y-1.5">
              <li><button onClick={onRegisterCandidate} className="hover:text-slate-950 text-left">Build Profile</button></li>
              <li><a href="#candidates" className="hover:text-slate-950">Resume Parsing</a></li>
              <li><a href="#candidates" className="hover:text-slate-950">Skill Matrix</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-950 font-outfit uppercase tracking-wider text-[11px]">Recruiters</h4>
            <ul className="space-y-1.5">
              <li><button onClick={onRegisterRecruiter} className="hover:text-slate-950 text-left">Candidate Discovery</button></li>
              <li><a href="#recruiters" className="hover:text-slate-950">Matching & Matrix</a></li>
              <li><button onClick={onLogin} className="hover:text-slate-950">Login</button></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-100 flex flex-wrap justify-between items-center text-xs text-slate-500">
          <p>&copy; 2026 CandidateIQ Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <button onClick={onLogin} className="hover:text-slate-950">Login</button>
            <button onClick={onRegister} className="hover:text-slate-950 font-bold text-indigo-600">Register</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
