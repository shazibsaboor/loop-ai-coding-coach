"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, BookOpen, Check, CheckCheck, ChevronRight, CircleCheck, CircleHelp, Clock3, Code2, Command, Download, FileCode2, Flame, FolderCode, GraduationCap, LayoutDashboard, Lightbulb, Loader2, Menu, MessageSquare, Moon, Play, Plus, RotateCcw, Search, Send, Settings2, ShieldCheck, Sparkles, Square, Sun, Target, Terminal, Trophy, Upload, X, XCircle, Zap } from "lucide-react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import ReactMarkdown from "react-markdown";
import { challenges, getChallenge, type Challenge } from "@/lib/challenges";
import { emptyProgress, localDate, progressSchema, readProgress, STORAGE_KEY, type Progress } from "@/lib/progress";
import { savedHelpQuestions, savedTutorReply } from "@/lib/saved-tutor";
import { runCode, type RunResult } from "@/lib/runner";

type View = "overview" | "challenges" | "progress" | "resources" | "settings" | "practice";
const labels: Record<View, string> = { overview: "Overview", challenges: "Challenges", progress: "My progress", resources: "Learning guide", settings: "Settings", practice: "Practice workspace" };
const courseIcons = [Code2, Zap, Target, FolderCode, MessageSquare, BarChart3, Search, CircleHelp, FolderCode, GraduationCap];

function LoopMark({ small = false }: { small?: boolean }) {
  return <span className={`loop-mark ${small ? "small" : ""}`} aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M9 11v13a8 8 0 0 0 16 0V11M16 11v13a8 8 0 0 0 16 0V11" /></svg></span>;
}
function download(name: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function NavButton({ icon: Icon, label, active, onClick, count }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void; count?: string }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick} aria-current={active ? "page" : undefined}><Icon size={18} /><span>{label}</span>{count && <span className="nav-count">{count}</span>}</button>;
}
function ProgressBar({ value }: { value: number }) { return <div className="progress-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label="Learning path completion"><span style={{ width: `${value}%` }} /></div>; }

export function LearningApp() {
  const [view, setView] = useState<View>("overview");
  const [selected, setSelected] = useState(challenges[0].id);
  const [progress, setProgress] = useState<Progress>({ ...emptyProgress });
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [savingBlocked, setSavingBlocked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [search, setSearch] = useState("");
  const [aiReady, setAiReady] = useState<boolean | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState("");
  const [welcomeName, setWelcomeName] = useState("");

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => { setCompact(media.matches); if (!media.matches) setMobileOpen(false); };
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (document.activeElement !== searchRef.current) mainRef.current?.focus({ preventScroll: true });
  }, [view, selected]);
  useEffect(() => {
    if (!compact || !mobileOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const buttons = sidebarRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
    buttons?.[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !buttons?.length) return;
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", trap);
    return () => { document.removeEventListener("keydown", trap); previous?.focus({ preventScroll: true }); };
  }, [compact, mobileOpen]);
  useEffect(() => {
    try { setProgress(readProgress()); } catch {
      setSavingBlocked(true);
      setStorageError("Your saved progress could not be loaded. It has been left untouched. You can practise in this session, or restore a backup in Settings.");
    }
    setReady(true);
    const sync = () => {
      const hash = window.location.hash.slice(1);
      if (hash === "main-content") return;
      if (hash.startsWith("practice/")) {
        const id = hash.slice(9);
        if (getChallenge(id)) { setSelected(id); setView("practice"); return; }
      }
      setView(Object.keys(labels).includes(hash) && hash !== "practice" ? hash as View : "overview");
    };
    sync(); window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    if (!ready || savingBlocked) return;
    const timer = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); setStorageError(""); }
      catch { setStorageError("Browser storage is unavailable or full. Export your progress to keep a copy."); }
    }, 350);
    const flush = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* reported by autosave */ } };
    window.addEventListener("pagehide", flush);
    return () => { clearTimeout(timer); window.removeEventListener("pagehide", flush); };
  }, [progress, ready, savingBlocked]);
  useEffect(() => {
    let live = true;
    fetch("/api/tutor").then(r => r.json()).then(d => { if (live) setAiReady(d.configured === true); }).catch(() => { if (live) setAiReady(null); });
    return () => { live = false; };
  }, [view]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); searchRef.current?.focus(); } if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(""), 4000); return () => clearTimeout(t); }, [notice]);

  const navigate = (next: View) => { setView(next); setMobileOpen(false); window.location.hash = next; };
  const openChallenge = (id: string) => {
    setSelected(id); setView("practice"); setMobileOpen(false);
    setProgress(p => ({ ...p, lastChallenge: id }));
    window.location.hash = `practice/${id}`;
  };
  const completeCount = challenges.filter(c => progress.completed.includes(c.id)).length;
  const percent = Math.round(completeCount / challenges.length * 100);
  const nextChallenge = getChallenge(progress.lastChallenge) && !progress.completed.includes(progress.lastChallenge)
    ? getChallenge(progress.lastChallenge)! : challenges.find(c => !progress.completed.includes(c.id)) || challenges[0];
  const today = localDate();
  const activeDays = new Set(progress.runs.map(r => r.date));
  let streak = 0;
  const cursor = new Date();
  if (!activeDays.has(localDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (activeDays.has(localDate(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
  const saveDraft = useCallback((id: string, code: string) => setProgress(p => ({ ...p, drafts: { ...p.drafts, [id]: code } })), []);
  const recordRun = useCallback((id: string, passed: boolean) => setProgress(p => ({ ...p,
    completed: passed ? [...new Set([...p.completed, id])] : p.completed,
    runs: [...p.runs.slice(-999), { id, date: localDate(), passed }],
  })), []);

  if (!ready) return <div className="app-shell welcome-shell"><p role="status">Opening your learning space…</p></div>;
  if (!progress.welcomed && !progress.name.trim() && !savingBlocked) return <div className="app-shell welcome-shell" data-theme={progress.theme}>
    <main className="welcome-card">
      <LoopMark /><p className="eyebrow">SMALL STEPS. YOUR OWN PACE.</p><h1>Your first line of code starts here.</h1>
      <p>14 easy lessons, examples you can change, and a learning buddy when you get stuck. No sign-up needed.</p>
      <form onSubmit={e => { e.preventDefault(); setProgress(p => ({ ...p, name: welcomeName.trim(), welcomed: true })); }}>
        <label className="field-label" htmlFor="welcome-name">What should we call you? <span>(optional)</span></label>
        <input className="text-input" id="welcome-name" autoComplete="given-name" maxLength={32} placeholder="Your first name or nickname" value={welcomeName} onChange={e => setWelcomeName(e.target.value)} aria-describedby="welcome-privacy" />
        <button className="primary-button" type="submit">Start learning <ArrowRight size={17} /></button>
        <button className="text-button" type="button" onClick={() => setProgress(p => ({ ...p, name: "", welcomed: true }))}>Continue as a guest</button>
      </form>
      <p id="welcome-privacy" className="field-help">Your name and progress stay in this browser. Change your name in Settings anytime. Using a shared device? Everyone using this browser shares the same learning space.</p>
    </main>
  </div>;
  return <div className="app-shell" data-theme={progress.theme}>
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); mainRef.current?.focus(); mainRef.current?.scrollIntoView(); }}>Skip to content</a>
    {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside ref={sidebarRef} className={`sidebar ${mobileOpen ? "mobile-open" : ""}`} aria-label="Main navigation" inert={compact && !mobileOpen} role={compact && mobileOpen ? "dialog" : undefined} aria-modal={compact && mobileOpen ? true : undefined}>
      <button className="brand" onClick={() => navigate("overview")} aria-label="Loop home"><LoopMark /><span>loop<span className="brand-dot">.</span></span></button>
      <div className="workspace-label"><span className="workspace-avatar">{progress.name ? progress.name.charAt(0).toUpperCase() : "Y"}</span><span>{progress.name.trim() ? progress.name.trim() + "’s space" : "Your workspace"}<small>No account needed</small></span></div>
      <p className="nav-label">WORKSPACE</p>
      <nav>
        <NavButton icon={LayoutDashboard} label="Overview" active={view === "overview"} onClick={() => navigate("overview")} />
        <NavButton icon={Code2} label="Challenges" active={view === "challenges" || view === "practice"} onClick={() => navigate("challenges")} count={String(challenges.length)} />
        <NavButton icon={BarChart3} label="My progress" active={view === "progress"} onClick={() => navigate("progress")} />
        <p className="nav-label second">SUPPORT</p>
        <NavButton icon={BookOpen} label="Learning guide" active={view === "resources"} onClick={() => navigate("resources")} />
        <NavButton icon={Settings2} label="Settings" active={view === "settings"} onClick={() => navigate("settings")} />
      </nav>
      <div className="sidebar-bottom"><div className="little-note"><Sparkles size={20} /><h3>Small steps.<br />Real breakthroughs.</h3><p>You don’t have to know everything. Just take the next step.</p><button onClick={() => openChallenge(nextChallenge.id)}>Let’s practise <ArrowUpRight size={15} /></button></div>
      <div className="sidebar-footer"><span className="status-dot" />Saved on this device<button className="icon-button" onClick={() => setProgress(p => ({ ...p, theme: p.theme === "dark" ? "light" : "dark" }))} aria-label={`Switch to ${progress.theme === "dark" ? "light" : "dark"} theme`}>{progress.theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button></div></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="breadcrumb"><button className="icon-button menu-toggle" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}><Menu size={20} /></button><span>Workspace</span><ChevronRight size={14} /><strong>{labels[view]}</strong></div>
        <div className="topbar-actions"><div className="global-search"><Search size={16} /><input ref={searchRef} aria-label="Search challenges" placeholder="Search challenges…" value={search} onChange={e => { setSearch(e.target.value); if (view !== "challenges") navigate("challenges"); }} /><kbd>⌘ K</kbd></div><button className="streak" onClick={() => navigate("progress")}><Flame size={17} /><span>{streak} day{streak !== 1 ? "s" : ""}</span></button><button className="profile-button" aria-label="Open your settings" onClick={() => navigate("settings")}>{progress.name ? progress.name.charAt(0).toUpperCase() : "Y"}</button></div>
      </header>
      <main id="main-content" ref={mainRef} tabIndex={-1} className={`main-content ${view === "practice" ? "practice-main" : ""}`}>
        {storageError && <div role="alert" className="notice error-notice">{storageError}</div>}
        {view === "overview" && <>
          <div className="page-heading"><div><p className="eyebrow"><span className="status-dot" /> YOUR NEXT CHAPTER STARTS HERE</p><h1>{progress.name ? `Welcome back, ${progress.name}.` : "A little practice. A lot of possibility."}</h1><p>Build your skills, one small breakthrough at a time.</p></div><span className="date-label">JavaScript learning path <span className="tiny-dot" /> Vol. 01</span></div>
          <section className="panel beginner-entry"><div><h2>New to coding? Start here.</h2><p>Learn what each line means. Change one small thing, then see your result.</p></div><button className="primary-button" onClick={() => openChallenge("first-message")}>Start from zero <ArrowRight size={17} /></button></section><section className="hero-grid">
            <div className="continue-card"><div className="hero-copy"><span className="pill lime-outline"><span className="status-dot" /> {completeCount === challenges.length ? "PATH COMPLETE · KEEP EXPLORING" : progress.runs.length ? "PICK UP WHERE YOU LEFT OFF" : "YOUR FIRST STEP"}</span><h2>Less watching.<br />More <span>“I built that.”</span></h2><p>Never coded before? Start with one small change.<br className="desktop-break" /> A patient tutor. Your own pace.</p><button className="primary-button" onClick={() => openChallenge(nextChallenge.id)}>{progress.runs.length ? "Continue learning" : "Start from zero"}<ArrowRight size={17} /></button><div className="hero-meta"><span className="js-icon">JS</span><span>JavaScript fundamentals</span><span className="tiny-dot" /><span>14 easy guided lessons</span></div></div>
              <div className="code-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="floating-symbol">{ "{ }" }</div><div className="mini-code"><div className="mini-code-bar"><i /><i /><i /><span>your-first-step.js</span></div><pre><span className="token-purple">function</span> <span className="token-blue">learn</span>() {"{"}{"\n"}  <span className="token-purple">const</span> you = <span className="token-lime">"a builder"</span>;{"\n\n"}  <span className="token-muted">// one step at a time</span>{"\n"}  <span className="token-purple">return</span> practice(you);{"\n"}{"}"}</pre><div className="mini-code-footer"><span className="status-dot" /> A little better than yesterday.</div></div><div className="floating-check"><Check size={20} />Made progress.</div></div>
            </div>
            <div className="path-card"><div className="card-overline"><span>YOUR LEARNING PATH</span><ArrowUpRight size={18} /></div><div className="path-icon"><GraduationCap size={27} /></div><h3>JavaScript<br />Foundations</h3><p>From changing one word to<br />making simple choices.</p><div className="path-progress"><span>{completeCount} <small>/ {challenges.length} completed</small></span><strong>{percent}%</strong></div><ProgressBar value={percent} /><button className="text-button" onClick={() => navigate("challenges")}>Explore the path <ArrowRight size={16} /></button></div>
          </section>
          <section className="stats-grid" aria-label="Your learning statistics">
            <Stat icon={CircleCheck} value={`${completeCount}`} label="Challenges completed" detail="Every finish is a fresh start." color="green" />
            <Stat icon={Terminal} value={`${progress.runs.length}`} label="Code runs" detail="Trying is how learning happens." color="purple" />
            <Stat icon={Flame} value={`${streak} ${streak === 1 ? "day" : "days"}`} label="Current streak" detail={streak ? "You’re building a good habit." : "Your next run starts a streak."} color="orange" />
          </section>
          <section className="section-block"><div className="section-heading"><div><h2>A good place to begin <span className="subtle-count">01 — 03</span></h2><p>Short challenges. Skills that stay with you.</p></div><button className="text-button" onClick={() => { setSearch(""); navigate("challenges"); }}>View all challenges <ArrowRight size={16} /></button></div><div className="challenge-grid">{challenges.slice(0, 3).map((c, i) => <ChallengeCard key={c.id} challenge={c} index={i} done={progress.completed.includes(c.id)} started={!!progress.drafts[c.id]} onOpen={() => openChallenge(c.id)} />)}</div></section>
          <section className="bottom-grid"><div className="activity-card"><div className="section-heading"><h3>A little consistency goes a long way.</h3><span className="muted">Last 7 days</span></div><div className="week-grid">{Array.from({ length: 7 }, (_, i) => { const date = new Date(); date.setDate(date.getDate() - 6 + i); const day = localDate(date); const count = progress.runs.filter(r => r.date === day).length; return <div key={day} className={`day ${day === today ? "today" : ""}`}><span>{date.toLocaleDateString("en", { weekday: "short" })}</span><div className={`day-square ${count ? "practised" : ""}`} title={`${day}: ${count} runs`}>{count ? <Check size={18} /> : <span />}</div></div>; })}</div></div><div className="tip-card"><div className="tip-icon"><Lightbulb size={22} /></div><div><p className="eyebrow">A FRIENDLY REMINDER</p><h3>Getting stuck is part of getting better.</h3><p>Try an idea. Read the error. Ask for a hint.<br />That’s what learning looks like.</p></div></div></section>
        </>}
        {view === "challenges" && <ChallengeLibrary search={search} setSearch={setSearch} progress={progress} open={openChallenge} />}
        {view === "progress" && <>
          <div className="page-heading"><div><p className="eyebrow">YOUR WORK ADDS UP</p><h1>Look how far you can go.</h1><p>Your attempts, your progress, your next step.</p></div><button className="secondary-button" onClick={() => download("loop-progress.json", JSON.stringify(progress, null, 2), "application/json")}><Download size={16} />Export progress</button></div>
          <div className="stats-grid"><Stat icon={Trophy} value={`${completeCount}/${challenges.length}`} label="Challenges completed" detail="Completed after passing every check." color="green" /><Stat icon={Terminal} value={String(progress.runs.length)} label="Total attempts" detail="Including the ones you learned from." color="purple" /><Stat icon={Flame} value={String(activeDays.size)} label="Days practised" detail="Based on runs saved in this browser." color="orange" /></div>
          <section className="panel progress-panel"><div className="section-heading"><h2>Your JavaScript journey</h2><span className="pill">{percent}% complete</span></div><ProgressBar value={percent} /><div className="journey-list">{challenges.map((c, i) => <button key={c.id} onClick={() => openChallenge(c.id)}><span className={`journey-number ${progress.completed.includes(c.id) ? "complete" : ""}`}>{progress.completed.includes(c.id) ? <Check size={17} /> : String(i + 1).padStart(2, "0")}</span><span><strong>{c.title}</strong><small>{c.concept}</small></span><span className="journey-state">{progress.completed.includes(c.id) ? "Completed" : progress.drafts[c.id] ? "In progress" : "Ready when you are"}</span><ChevronRight size={17} /></button>)}</div></section>
          <section className="panel"><h2>Recent attempts</h2>{progress.runs.length === 0 ? <div className="empty-state"><Terminal size={30} /><h3>Your first run belongs here.</h3><p>Open a challenge and run your code to start your story.</p><button className="primary-button" onClick={() => openChallenge(nextChallenge.id)}>Try a challenge <ArrowRight size={16} /></button></div> : <div className="attempt-list">{progress.runs.slice(-8).reverse().map((r, i) => <div key={`${r.date}-${i}`}><span className={`status-icon ${r.passed ? "success" : ""}`}>{r.passed ? <Check size={16} /> : <RotateCcw size={16} />}</span><strong>{getChallenge(r.id)?.title || r.id}</strong><span>{r.passed ? "All checks passed" : "Practice attempt"}</span><time>{r.date}</time></div>)}</div>}</section>
        </>}
        {view === "resources" && <>
          <div className="page-heading"><div><p className="eyebrow">A GUIDE FOR THE JOURNEY</p><h1>You don’t need all the answers.</h1><p>You just need a way to find the next one.</p></div><BookOpen className="heading-icon" size={38} /></div>
          <div className="guide-grid">{[{ icon: BookOpen, title: "1. Understand the task", text: "Read the brief and example. Write down what goes in and what should come out. Each challenge includes a short lesson before you begin." }, { icon: Code2, title: "2. Try something small", text: "Change the small part described in the lesson. Use Run code to see actual check results. You can press Ctrl+Enter or Command+Enter from the editor." }, { icon: Lightbulb, title: "3. Ask a better question", text: "Reveal one lesson hint at a time, or ask the AI tutor about your current code. Try: ‘Why does this return undefined?’ instead of asking for the whole solution." }, { icon: CheckCheck, title: "4. Make it make sense", text: "After the checks pass, answer the understanding question. Explain your code in your own words, then move on when you feel ready." }].map(g => <article className="panel guide-card" key={g.title}><g.icon size={24} /><h2>{g.title}</h2><p>{g.text}</p></article>)}</div>
          <section className="panel"><h2>Keep these nearby</h2><div className="resource-links"><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" target="_blank" rel="noreferrer"><span><strong>MDN JavaScript Guide</strong><small>Reference explanations and language fundamentals.</small></span><ArrowUpRight size={20} /></a><a href="https://javascript.info/" target="_blank" rel="noreferrer"><span><strong>The Modern JavaScript Tutorial</strong><small>Detailed lessons to complement your practice.</small></span><ArrowUpRight size={20} /></a></div></section>
        </>}
        {view === "settings" && <>
          <div className="page-heading"><div><p className="eyebrow">MAKE YOURSELF AT HOME</p><h1>Your space, your pace.</h1><p>A few things to make learning feel like you.</p></div></div>
          <div className="settings-grid"><section className="panel"><h2>Workspace preferences</h2><label className="field-label" htmlFor="display-name">What should we call you?</label><input className="text-input" id="display-name" maxLength={32} placeholder="Your first name" value={progress.name} onChange={e => setProgress(p => ({ ...p, name: e.target.value }))} /><p className="field-help">Saved only in this browser. No account required. Changing this name does not create a separate profile.</p><p className="field-label">Appearance</p><div className="segmented"><button aria-pressed={progress.theme === "dark"} className={progress.theme === "dark" ? "selected" : ""} onClick={() => setProgress(p => ({ ...p, theme: "dark" }))}><Moon size={16} />Dark</button><button aria-pressed={progress.theme === "light"} className={progress.theme === "light" ? "selected" : ""} onClick={() => setProgress(p => ({ ...p, theme: "light" }))}><Sun size={16} />Light</button></div></section>
          <section className="panel"><div className="section-heading"><h2>Your AI learning buddy</h2><span className={"pill " + (aiReady ? "green-pill" : "")}>{aiReady === null ? "Checking availability" : aiReady ? "Available" : "Currently unavailable"}</span></div><p className="muted">Ask for help inside any lesson. No account or personal API key is needed.</p><p className="field-help">AI questions have a shared daily allowance. If the allowance is used up, you can still practise and use saved hints, explanations, and solutions in the tutor.</p><p className="field-help"><ShieldCheck size={15} />Your code and questions are sent to Groq only when you ask the tutor. Do not include passwords or private information. Your display name is not sent.</p><p className="field-help">To limit abuse, the server keeps short-lived usage counts linked to a protected version of your network address. People on the same network share an allowance. Tutor conversations last for the current exercise visit.</p></section>
          <section className="panel"><h2>Your learning data</h2><p className="muted">Drafts, completions, and attempts stay in this browser. Export a backup before switching devices or clearing browser data.</p><div className="button-row"><button className="secondary-button" onClick={() => download("loop-progress.json", JSON.stringify(progress, null, 2), "application/json")}><Download size={16} />Export backup</button><button className="secondary-button" onClick={() => importRef.current?.click()}><Upload size={16} />Restore backup</button></div><input hidden ref={importRef} type="file" accept="application/json,.json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { if (file.size > 500000) throw new Error(); const restored = progressSchema.parse(JSON.parse(await file.text())); const ids = new Set([...challenges.map(c => c.id), "hello-functions", "temperature", "tickets", "basket", "words", "scores", "search", "discount", "expenses", "cart"]); if (restored.completed.some(id => !ids.has(id)) || Object.keys(restored.drafts).some(id => !ids.has(id)) || restored.runs.some(r => !ids.has(r.id) || !/^\d{4}-\d{2}-\d{2}$/.test(r.date))) throw new Error(); setProgress(restored); setSavingBlocked(false); setStorageError(""); setNotice("Your backup has been restored."); } catch { setNotice("That file is not a valid Loop backup. Your current progress is unchanged."); } e.target.value = ""; }} /><p className="field-help">Restoring a backup replaces the progress on this device.</p></section>
          <section className="panel"><h2>A fresh start</h2><p className="muted">Clear this device’s Loop drafts, attempts, and completed challenges.</p><AlertDialog.Root><AlertDialog.Trigger asChild><button className="danger-button"><RotateCcw size={16} />Reset learning progress</button></AlertDialog.Trigger><AlertDialog.Portal><AlertDialog.Overlay className="dialog-overlay" /><AlertDialog.Content className="dialog-content"><AlertDialog.Title>Start fresh?</AlertDialog.Title><AlertDialog.Description>This removes your saved Loop progress from this browser. Export a backup first if you want to keep it.</AlertDialog.Description><div className="button-row"><AlertDialog.Cancel asChild><button className="secondary-button">Keep my progress</button></AlertDialog.Cancel><AlertDialog.Action asChild><button className="danger-button" onClick={() => { setProgress({ ...emptyProgress }); setSavingBlocked(false); setStorageError(""); setNotice("Your learning space has been reset."); }}>Reset progress</button></AlertDialog.Action></div></AlertDialog.Content></AlertDialog.Portal></AlertDialog.Root></section></div>
        </>}
        {view === "practice" && <Practice key={selected} challenge={getChallenge(selected) || challenges[0]} initialCode={progress.drafts[selected]} onDraft={saveDraft} onRun={recordRun} back={() => navigate("challenges")} next={openChallenge} aiReady={aiReady} setup={() => navigate("settings")} />}
        {view !== "practice" && <footer className="content-footer"><span><LoopMark small />Built for the “aha!” moments.</span><span>Keep showing up. You’re learning.</span></footer>}
      </main>
    </div>
    {notice && <div className="toast" role="status">{notice}<button className="icon-button" aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={16} /></button></div>}
  </div>;
}

function Stat({ icon: Icon, value, label, detail, color }: { icon: LucideIcon; value: string; label: string; detail: string; color: string }) {
  return <article className="stat-card"><div className={`stat-icon ${color}`}><Icon size={21} /></div><div><div className="stat-top"><strong>{value}</strong><span>{label}</span></div><p>{detail}</p></div></article>;
}
function ChallengeCard({ challenge: c, index, done, started, onOpen }: { challenge: Challenge; index: number; done: boolean; started: boolean; onOpen: () => void }) {
  const Icon = courseIcons[index % courseIcons.length] ?? Code2;
  return <button className={`challenge-card ${done ? "is-done" : ""}`} onClick={onOpen}><div className="challenge-card-top"><span className={`challenge-icon hue-${index % 3}`}><Icon size={23} /></span><span className="challenge-number">{String(index + 1).padStart(2, "0")}</span></div><span className="challenge-concept">{c.concept}</span><h3>{c.title}</h3><p>{c.subtitle}</p><div className="challenge-card-bottom"><span className={`difficulty ${c.level === "Intermediate" ? "intermediate" : ""}`}><i />{c.level}</span><span><Clock3 size={13} />{c.minutes} min</span><span className="card-arrow">{done ? <CircleCheck size={19} /> : <ArrowUpRight size={19} />}</span></div>{(done || started) && <span className="card-status">{done ? "Completed" : "In progress"}</span>}</button>;
}
export function ChallengeLibrary({ search, setSearch, progress, open }: { search: string; setSearch: (s: string) => void; progress: Progress; open: (id: string) => void }) {
  const [filter, setFilter] = useState("All challenges");
  const shown = challenges.filter(c => `${c.title} ${c.concept} ${c.subtitle}`.toLowerCase().includes(search.toLowerCase()) && (filter === "All challenges" || filter === "Beginner" && c.level === "Beginner" || filter === "Intermediate" && c.level === "Intermediate" || filter === "Completed" && progress.completed.includes(c.id)));
  return <><div className="page-heading"><div><p className="eyebrow">LEARN IT. BUILD IT. MAKE IT YOURS.</p><h1>Your next breakthrough is here.</h1><p>Every lesson explains one idea and gives you a small change to try.</p></div><span className="pill">14 EASY GUIDED LESSONS</span></div><div className="library-toolbar"><div className="filter-tabs" aria-label="Filter challenges">{["All challenges", "Beginner", "Completed"].map(f => <button aria-pressed={filter === f} className={filter === f ? "selected" : ""} key={f} onClick={() => setFilter(f)}>{f}</button>)}</div><span className="muted">{shown.length} challenge{shown.length === 1 ? "" : "s"}</span></div>{search && <div className="search-summary">Results for “{search}”<button className="text-button" onClick={() => setSearch("")}>Clear search <X size={14} /></button></div>}<div className="challenge-grid library-grid">{shown.map(c => <ChallengeCard key={c.id} challenge={c} index={challenges.indexOf(c)} done={progress.completed.includes(c.id)} started={!!progress.drafts[c.id]} onOpen={() => open(c.id)} />)}</div>{!shown.length && <div className="empty-state"><Search size={30} /><h3>No challenges here yet.</h3><p>Try a different search or filter.</p><button className="secondary-button" onClick={() => { setSearch(""); setFilter("All challenges"); }}>Show all challenges</button></div>}</>;
}

function Highlight({ code }: { code: string }) {
  const tokens = code.split(/(\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:function|return|const|let|var|if|else|for|of|while|new|true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b)/g);
  return <>{tokens.map((t, i) => <span key={i} className={t.startsWith("//") ? "token-muted" : /^["'`]/.test(t) ? "token-lime" : /^(function|return|const|let|var|if|else|for|of|while|new|true|false|null|undefined)$/.test(t) ? "token-purple" : /^\d/.test(t) ? "token-orange" : undefined}>{t}</span>)}</>;
}

function Practice({ challenge: c, initialCode, onDraft, onRun, back, next, aiReady, setup }: { challenge: Challenge; initialCode?: string; onDraft: (id: string, code: string) => void; onRun: (id: string, passed: boolean) => void; back: () => void; next: (id: string) => void; aiReady: boolean | null; setup: () => void }) {
  const [code, setCode] = useState(initialCode ?? c.starter);
  const [result, setResult] = useState<RunResult | null>(null);
  const [testedCode, setTestedCode] = useState("");
  const [running, setRunning] = useState(false);
  const [hints, setHints] = useState(0);
  const [leftTab, setLeftTab] = useState("Challenge");
  const [mobileTab, setMobileTab] = useState(c.guided ? "Brief" : "Code");
  const [showAnswer, setShowAnswer] = useState(false);
  const [reflection, setReflection] = useState("");
  const runAbort = useRef<AbortController | null>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => () => runAbort.current?.abort(), []);
  const update = (value: string) => { setCode(value); onDraft(c.id, value); };
  const run = async () => {
    if (running) return;
    const controller = new AbortController(); runAbort.current = controller;
    setRunning(true); setResult(null); setTestedCode(code);
    const r = await runCode(c, code, controller.signal);
    if (controller.signal.aborted) { setRunning(false); setResult(r); return; }
    setResult(r); setRunning(false);
    onRun(c.id, !r.error && r.tests.length === c.checks.length && r.tests.every(t => t.passed));
  };
  const allPassed = result && !result.error && result.tests.length === c.checks.length && result.tests.every(t => t.passed) && testedCode === code;
  const index = challenges.indexOf(c);
  return <>
    <div className="practice-heading"><div><button className="text-button" onClick={back}><ArrowLeft size={15} />All challenges</button><h1>{c.title}</h1><div className="practice-meta"><span className="difficulty"><i />{c.level}</span><span>{c.concept}</span><span><Clock3 size={13} />{c.minutes} min</span></div></div><div className="practice-step"><span className="js-icon">JS</span><span>CHALLENGE <strong>{String(index + 1).padStart(2, "0")}</strong> / {challenges.length}</span></div></div>
    <div className="mobile-practice-tabs">{["Brief", "Code", "Tutor"].map(t => <button key={t} aria-pressed={mobileTab === t} className={mobileTab === t ? "selected" : ""} onClick={() => setMobileTab(t)}>{t}</button>)}</div>
    <div className={`practice-grid mobile-${mobileTab.toLowerCase()}`}>
      <section className="brief-pane"><div className="pane-tabs">{["Challenge", "Lesson"].map(t => <button key={t} aria-pressed={leftTab === t} className={leftTab === t ? "selected" : ""} onClick={() => setLeftTab(t)}>{t === "Challenge" ? <Target size={15} /> : <BookOpen size={15} />}{t}</button>)}</div><div className="brief-body">{c.guided && <section className="guided-intro"><span className="eyebrow">START FROM ZERO · STEP {index + 1} OF {challenges.length}</span><h2>First, understand it</h2><p>{c.lesson}</p><h3>See an example</h3><pre className="guided-example"><code>{c.guided.example}</code></pre><ol>{c.guided.steps.map(step => <li key={step}>{step}</li>)}</ol><button className="secondary-button" onClick={() => { setMobileTab("Code"); requestAnimationFrame(() => editorRef.current?.focus()); }}>Try it in the code box <ArrowRight size={15} /></button></section>}{leftTab === "Lesson" ? <><span className="eyebrow">THE IDEA BEHIND THE CODE</span><h2>{c.concept}</h2><p>{c.lesson}</p><div className="lesson-callout"><Lightbulb size={18} /><span>You can switch back to this lesson at any time. Learning isn’t a memory test.</span></div></> : <><span className="eyebrow">YOUR MISSION</span><h2>Let’s build this.</h2><p>{c.task}</p><h3>What your code should do</h3><ul className="requirements">{c.requirements.map(r => <li key={r}><span className="requirement-dot" />{r}</li>)}</ul><h3>For example</h3><div className="example-block"><span>INPUT</span><code>{c.functionName}({c.checks[0].args.map(a => JSON.stringify(a)).join(", ")})</code><span>EXPECTED OUTPUT</span><code className="token-lime">{JSON.stringify(c.checks[0].expected)}</code></div></>}
        <div className="hints-section"><div className="section-heading"><h3>A nudge in the right direction</h3><Lightbulb size={17} /></div><p>Written lesson hints. Reveal just what you need.</p>{c.hints.slice(0, hints).map((hint, i) => <div className="hint" key={hint}><span>HINT {i + 1}</span><p>{hint}</p></div>)}<button className="secondary-button" disabled={hints === 3} onClick={() => setHints(n => Math.min(3, n + 1))}><Plus size={15} />{hints === 3 ? "All hints revealed" : `Show hint ${hints + 1} of 3`}</button></div>
      </div></section>
      <section className="editor-pane"><div className="editor-toolbar"><span><FileCode2 size={16} /><strong>solution.js</strong></span><div><span className="autosave"><Check size={13} />Draft retained</span><AlertDialog.Root><AlertDialog.Trigger asChild><button className="icon-button" title="Reset code" aria-label="Reset code" disabled={running}><RotateCcw size={16} /></button></AlertDialog.Trigger><AlertDialog.Portal><AlertDialog.Overlay className="dialog-overlay" /><AlertDialog.Content className="dialog-content"><AlertDialog.Title>Reset this solution?</AlertDialog.Title><AlertDialog.Description>Your current code will be replaced with the starter code. Your completion history stays saved.</AlertDialog.Description><div className="button-row"><AlertDialog.Cancel asChild><button className="secondary-button">Keep code</button></AlertDialog.Cancel><AlertDialog.Action asChild><button className="danger-button" onClick={() => { update(c.starter); setResult(null); }}>Reset code</button></AlertDialog.Action></div></AlertDialog.Content></AlertDialog.Portal></AlertDialog.Root><button className="icon-button" aria-label="Download solution" title="Download solution" onClick={() => download(`${c.id}.js`, code)}><ArrowDownToLine size={16} /></button></div></div>
        <div className="code-editor"><div ref={linesRef} className="line-numbers" aria-hidden="true">{Array.from({ length: Math.max(12, code.split("\n").length) }, (_, i) => <div key={i}>{i + 1}</div>)}</div><div className="code-surface"><pre ref={preRef} aria-hidden="true"><Highlight code={code} />{"\n"}</pre><textarea ref={editorRef} aria-label="JavaScript code editor" value={code} onChange={e => update(e.target.value)} spellCheck={false} autoCapitalize="off" autoCorrect="off" maxLength={16000} disabled={running} wrap="off" onScroll={e => { if (preRef.current) { preRef.current.scrollTop = e.currentTarget.scrollTop; preRef.current.scrollLeft = e.currentTarget.scrollLeft; } if (linesRef.current) linesRef.current.scrollTop = e.currentTarget.scrollTop; }} onKeyDown={e => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); void run(); }
          if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); const start = e.currentTarget.selectionStart; const end = e.currentTarget.selectionEnd; update(code.slice(0, start) + "  " + code.slice(end)); requestAnimationFrame(() => editorRef.current?.setSelectionRange(start + 2, start + 2)); }
        }} /></div></div><div className="editor-status"><span>JavaScript <span className="tiny-dot" />UTF-8</span><span>Tab to indent · Shift+Tab to leave</span></div>
        <div className="run-toolbar"><span><ShieldCheck size={14} />Isolated browser run</span><button className="primary-button" onClick={() => running ? runAbort.current?.abort() : void run()}>{running ? <><Square size={14} />Stop run</> : <><Play size={14} fill="currentColor" />Run code<kbd>⌘ ↵</kbd></>}</button></div>
        <div className="results-pane"><div className="results-heading"><span><Terminal size={16} />Test results</span>{result && <span className={allPassed ? "success-text" : "muted"}>{testedCode !== code ? "Code changed · run again" : `${result.tests.filter(t => t.passed).length}/${c.checks.length} passed`}</span>}</div><div className="results-body" aria-live="polite">{running ? <div className="empty-results"><Loader2 className="spin" size={25} /><p>Running your checks…</p></div> : !result ? <div className="empty-results"><Terminal size={27} /><h3>Let’s see what your code can do.</h3><p>Run your solution to check it against {c.checks.length} {c.checks.length === 1 ? "example" : "examples"}.</p></div> : <>{result.error && <div className="run-error"><XCircle size={17} /><p>{result.error}</p></div>}{result.tests.map((t, i) => <details className={`test-result ${t.passed ? "passed" : "failed"}`} key={i}><summary>{t.passed ? <CircleCheck size={16} /> : <XCircle size={16} />}<span>{t.label}</span><small>{t.passed ? "Passed" : "Needs a look"}</small><ChevronRight size={14} /></summary><div><p>Expected: <code>{t.expected}</code></p><p>Received: <code>{t.actual}</code></p>{t.error && <p className="error-text">{t.error}</p>}</div></details>)}{result.logs.length > 0 && <div className="console-output"><h4>Console output</h4>{result.logs.map((l, i) => <pre key={i}>{l}</pre>)}</div>}{allPassed && <div className="completion"><div><Trophy size={22} /><h3>You made it work.</h3></div><p>All example checks passed. One last thought:</p><label htmlFor="reflection">{c.reflection}</label><textarea id="reflection" placeholder="Explain it in your own words…" value={reflection} onChange={e => setReflection(e.target.value)} maxLength={1000} /><button className="text-button" onClick={() => setShowAnswer(!showAnswer)}>{showAnswer ? "Hide explanation" : "Compare with an explanation"}<ChevronRight size={14} /></button>{showAnswer && <p className="reflection-answer">{c.answer}</p>}<button className="primary-button" onClick={() => index < challenges.length - 1 ? next(challenges[index + 1].id) : back()}>{index < challenges.length - 1 ? "Next challenge" : "Explore your completed path"}<ArrowRight size={15} /></button></div>}</>}</div></div>
      </section>
      <Tutor challenge={c} code={code} result={testedCode === code ? result : null} aiReady={aiReady} setup={setup} />
    </div>
  </>;
}

type Message = { role: "user" | "assistant"; content: string; saved?: boolean };
function Tutor({ challenge, code, result, aiReady, setup }: { challenge: Challenge; code: string; result: RunResult | null; aiReady: boolean | null; setup: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savedMode, setSavedMode] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const abort = useRef<AbortController | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => { const el = bodyRef.current; if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 220) el.scrollTop = el.scrollHeight; }, [messages]);
  const ask = async (text: string, retry = false, savedOnly = false) => {
    if (!text.trim() || busy) return;
    setBusy(true); setError(""); setLastQuestion(text); setQuestion("");
    const history = retry ? messages.slice(0, Math.max(0, messages.length - 2)) : messages;
    const outgoing: Message[] = [...history.filter(m => m.content.trim()), { role: "user", content: text }];
    const showSaved = () => {
      setSavedMode(true);
      setMessages([...outgoing, { role: "assistant", content: savedTutorReply(challenge, text), saved: true }]);
    };
    if (savedOnly || (!retry && (aiReady === false || savedMode))) {
      showSaved(); setBusy(false); return;
    }
    const limited = outgoing.filter(m => !m.saved).slice(-11).map(m => ({ role: m.role, content: m.content.slice(0, 3000) }));
    setMessages([...outgoing, { role: "assistant", content: "" }]);
    const controller = new AbortController(); abort.current = controller;
    let receivedDone = false;
    const timeout = setTimeout(() => controller.abort("timeout"), 50000);
    try {
      const res = await fetch("/api/tutor", { method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ challengeId: challenge.id, code, results: result ? JSON.stringify(result).slice(0, 5000) : "Not run for the current code.", messages: limited }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "The tutor could not respond."); }
      if (!res.body) throw new Error("No response was received.");
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; let content = "";
      while (true) {
        const chunk = await reader.read(); if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const event = JSON.parse(line.slice(6));
          if (event.error) throw new Error(event.error);
          if (event.done) receivedDone = true;
          if (event.text) { content += event.text; setMessages([...outgoing, { role: "assistant", content }]); }
        }
      }
      if (!receivedDone) throw new Error("The response ended early. Try your question again.");
      if (!content.trim()) throw new Error("The tutor returned an empty response. Try again.");
      setSavedMode(false);
    } catch {
      if (controller.signal.aborted && controller.signal.reason !== "timeout") {
        setError("Response stopped. You can retry when you’re ready.");
      } else {
        showSaved();
      }
    } finally { clearTimeout(timeout); setBusy(false); }
  };
  return <section className="tutor-pane"><div className="tutor-header"><span className="tutor-mark"><Sparkles size={18} /></span><span><strong>Your learning buddy</strong><small>A little help, when you need it.</small></span><span className={`status-dot ${aiReady ? "" : "inactive"}`} /></div><div className="tutor-body" ref={bodyRef}>{messages.length === 0 && <><div className="tutor-welcome"><LoopMark /><h3>Let’s figure it out together.</h3><p>I can help you understand the challenge, work through an error, or think about your approach.</p><p className="field-help">Live AI receives your current code when you ask. Saved help stays in your browser.</p></div><div className="tutor-suggestions">{["Tell me the first small step", "Explain this challenge simply", "Explain each line of my code"].map(s => <button key={s} onClick={() => void ask(s)} disabled={busy}><Sparkles size={13} />{s}<ArrowUpRight size={13} /></button>)}</div></>}{messages.map((m, i) => <div key={i} className={`chat-message ${m.role}`}><div className="message-author">{m.role === "assistant" ? <><Sparkles size={13} />{m.saved ? "SAVED LESSON HELP" : "LOOP TUTOR"}</> : "YOU"}</div>{m.content ? <div className="markdown"><ReactMarkdown disallowedElements={["img"]}>{m.content}</ReactMarkdown></div> : busy ? <span className="thinking"><i /><i /><i /><span className="sr-only">Thinking</span></span> : <span className="muted">No response received.</span>}</div>)}{error && <div className="tutor-error" role="alert"><p>{error}</p>{aiReady === false ? <button className="text-button" onClick={setup}>About your tutor <ArrowRight size={14} /></button> : <button className="text-button" disabled={busy} onClick={() => void ask(lastQuestion, true)}><RotateCcw size={14} />Retry question</button>}</div>}</div><div className="tutor-bottom">{(savedMode || aiReady === false) && <><p className="field-help" role="status">Live AI is unavailable. Saved lesson help works without an AI connection.</p><div className="tutor-suggestions">{savedHelpQuestions.map(text => <button key={text} disabled={busy} onClick={() => void ask(text, false, true)}>{text}<ArrowRight size={14} /></button>)}</div>{savedMode && <button className="text-button" disabled={busy} onClick={() => void ask(lastQuestion, true)}>Try live AI again <RotateCcw size={14} /></button>}</>}{aiReady === false && messages.length === 0 && <button className="setup-banner" onClick={setup}><CircleHelp size={15} /><span>About live AI and saved lesson help</span><ChevronRight size={14} /></button>}<form onSubmit={e => { e.preventDefault(); void ask(question); }}><textarea aria-label="Ask your AI tutor" placeholder="Ask a question about your code…" maxLength={3000} rows={3} value={question} onChange={e => setQuestion(e.target.value)} disabled={busy} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void ask(question); } }} /><div className="composer-footer"><span>Shift + Enter for a new line</span>{busy ? <button type="button" aria-label="Stop AI response" onClick={() => abort.current?.abort()}><Square size={15} /></button> : <button type="submit" aria-label="Send question" disabled={!question.trim()}><Send size={16} /></button>}</div></form><p className="tutor-disclaimer">AI can make mistakes. Test ideas in your code.</p></div></section>;
}
