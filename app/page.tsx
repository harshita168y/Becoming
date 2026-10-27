 "use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight, ArrowUpRight, BookOpen, BriefcaseBusiness, Check,
  ChevronLeft, ChevronRight, CircleHelp, Dumbbell, Flame, Heart, Leaf,
  Moon, RotateCcw, Sparkles, Target, Trophy, Utensils, Brain, CalendarDays
} from "lucide-react";

type Habit = { id: string; title: string; detail: string; icon: typeof Heart };
type DayRecord = { checks: Record<string, boolean>; note: string };
type SavedState = { startDate: string | null; records: Record<string, DayRecord> };

const habits: Habit[] = [
  { id: "move", title: "Move your body", detail: "Workout, walk, stretch — show up for yourself.", icon: Dumbbell },
  { id: "nourish", title: "Nourish yourself", detail: "Choose food that helps you feel good and focused.", icon: Utensils },
  { id: "learn", title: "Deep study", detail: "One focused study block. Phone away, mind present.", icon: BookOpen },
  { id: "career", title: "Build your future", detail: "A job-search action or a practical career skill.", icon: BriefcaseBusiness },
  { id: "mind", title: "Feed your mind", detail: "Read, reflect, journal, or practise a new idea.", icon: Brain },
];

const emptyState: SavedState = { startDate: null, records: {} };
const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const fromKey = (s: string) => { const [y,m,d] = s.split("-").map(Number); return new Date(y,m-1,d,12); };
const addDays = (date: Date, days: number) => { const d = new Date(date); d.setDate(d.getDate()+days); return d; };
const prettyDate = (d: Date, options: Intl.DateTimeFormatOptions = { weekday:"long", month:"long", day:"numeric" }) => d.toLocaleDateString(undefined, options);
const todayKey = () => dateKey(new Date());

function makePlan(start: Date | null) {
  if (!start) return [];
  // 60 intentional days with a reset day after each 15 active days: 64 calendar days total.
  const plan: { date: Date; index: number; activeDay: number; isBreak: boolean }[] = [];
  let activeDay = 0;
  for (let i = 0; i < 64; i++) {
    const isBreak = (i + 1) % 16 === 0;
    plan.push({ date: addDays(start, i), index: i, activeDay: isBreak ? activeDay : activeDay + 1, isBreak });
    if (!isBreak) activeDay++;
  }
  return plan;
}

export default function Home() {
  const [saved, setSaved] = useState<SavedState>(emptyState);
  const [selected, setSelected] = useState(todayKey());
  const [ready, setReady] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("becoming-tracker-v1");
      if (raw) {
        const parsed = JSON.parse(raw) as SavedState;
        setSaved(parsed);
        if (parsed.startDate) {
          const plan = makePlan(fromKey(parsed.startDate));
          const today = todayKey();
          const selectedInPlan = plan.find(p => dateKey(p.date) === today);
          setSelected(selectedInPlan ? today : dateKey(plan[0]?.date ?? new Date()));
        }
      }
    } catch { /* Keep a clean start if saved data is unavailable. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("becoming-tracker-v1", JSON.stringify(saved));
  }, [saved, ready]);

  const start = saved.startDate ? fromKey(saved.startDate) : null;
  const plan = useMemo(() => makePlan(start), [saved.startDate]);
  const selectedDate = fromKey(selected);
  const selectedPlanDay = plan.find(p => dateKey(p.date) === selected);
  const record = saved.records[selected] ?? { checks: {}, note: "" };
  const checkedCount = habits.filter(h => record.checks[h.id]).length;
  const completion = Math.round((checkedCount / habits.length) * 100);
  const todayRecord = saved.records[todayKey()] ?? { checks: {}, note: "" };
  const todayCount = habits.filter(h => todayRecord.checks[h.id]).length;
  const completedActiveDays = plan.filter(p => !p.isBreak && habits.every(h => saved.records[dateKey(p.date)]?.checks[h.id])).length;
  const elapsedDays = start ? Math.max(0, Math.floor((fromKey(todayKey()).getTime()-start.getTime())/86400000)) : 0;
  const nextNewYear = new Date(new Date().getFullYear() + (new Date().getMonth() === 11 ? 1 : 0), 11, 31, 12);
  const daysToNewYear = Math.max(0, Math.ceil((new Date(new Date().getFullYear()+1,0,1,12).getTime()-fromKey(todayKey()).getTime())/86400000));

  function ensureStarted() {
    if (!saved.startDate) {
      const now = todayKey();
      setSaved(prev => ({ ...prev, startDate: now }));
      setSelected(now);
      setToast("Your journey has started. One small promise at a time.");
      window.setTimeout(() => setToast(""), 3200);
      return now;
    }
    return selected;
  }

  function toggleHabit(id: string) {
    const key = ensureStarted();
    setSaved(prev => {
      const old = prev.records[key] ?? { checks: {}, note: "" };
      return { ...prev, records: { ...prev.records, [key]: { ...old, checks: { ...old.checks, [id]: !old.checks[id] } } } };
    });
  }

  function updateNote(value: string) {
    const key = selected;
    setSaved(prev => {
      const old = prev.records[key] ?? { checks: {}, note: "" };
      return { ...prev, records: { ...prev.records, [key]: { ...old, note: value } } };
    });
  }

  function resetJourney() {
    if (window.confirm("Reset your journey and clear all saved check-ins on this device? This cannot be undone.")) {
      setSaved(emptyState); setSelected(todayKey()); setToast("Fresh page. You can begin whenever you're ready.");
      window.setTimeout(() => setToast(""), 3200);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Becoming home"><span className="brand-mark"><Sparkles size={19}/></span><span>becoming<span className="brand-dot">.</span></span></a>
        <div className="side-label">YOUR SPACE</div>
        <a className="nav-item active" href="#today"><span className="nav-icon"><Target size={17}/></span>Daily check-in</a>
        <a className="nav-item" href="#journey"><span className="nav-icon"><CalendarDays size={17}/></span>Your journey</a>
        <a className="nav-item" href="#reflection"><span className="nav-icon"><BookOpen size={17}/></span>Reflection</a>
        <div className="sidebar-bottom">
          <div className="quote-card"><span className="quote-spark">✳</span><p>“You do not rise to the level of your goals. You fall to the level of your systems.”</p><span className="quote-author">— A little reminder</span></div>
          <button className="help-link" onClick={() => setShowHelp(!showHelp)}><CircleHelp size={16}/> How this works</button>
          {showHelp && <div className="help-panel">Your first check-in starts the clock. Tick the habits you complete, use reset days to recover, and return without guilt. Your progress stays in this browser.</div>}
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar"><div className="breadcrumb">PERSONAL GROWTH <span>/</span> DAILY PRACTICE</div><div className="top-actions"><span className="local-save"><span className="save-dot"/> Saved on this device</span><button className="icon-button" onClick={resetJourney} aria-label="Reset tracker" title="Reset tracker"><RotateCcw size={16}/></button><div className="avatar">B</div></div></header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div><div className="eyebrow"><span className="eyebrow-line"/> A NEW CHAPTER, ON YOUR TERMS</div><h1>Become who you<br className="desktop-break"/> <em>keep promising</em> to be.</h1><p className="intro">Not a perfect life. Just small promises, kept daily.<br/>Build your body, sharpen your mind, and move toward the life you want.</p></div>
            <div className="sun-art" aria-hidden="true"><div className="sun-ring ring-one"/><div className="sun-ring ring-two"/><div className="sun-core"><Sparkles size={27}/></div><span className="sun-leaf leaf-one">✳</span><span className="sun-leaf leaf-two">✦</span></div>
          </section>

          <section className="stats-grid" aria-label="Your progress">
            <article className="stat-card"><div className="stat-top"><span className="stat-icon lavender"><CalendarDays size={17}/></span><span className="stat-caption">THE PLAN</span></div><div className="stat-number">60 <small>days</small></div><div className="stat-foot">4 intentional reset days included</div><div className="stat-progress"><span style={{width:`${Math.min(100, completedActiveDays/60*100)}%`}}/></div></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon peach"><Flame size={17}/></span><span className="stat-caption">FULL DAYS</span></div><div className="stat-number">{completedActiveDays}<small> / 60</small></div><div className="stat-foot">Every habit checked off</div><div className="stat-progress peach-bar"><span style={{width:`${completedActiveDays/60*100}%`}}/></div></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon sage"><Trophy size={17}/></span><span className="stat-caption">TODAY'S ENERGY</span></div><div className="stat-number">{todayCount}<small> / 5</small></div><div className="stat-foot">{todayCount === 5 ? "You showed up for yourself!" : "Progress, not perfection."}</div><div className="stat-progress sage-bar"><span style={{width:`${todayCount/5*100}%`}}/></div></article>
          </section>

          <section className="daily-layout" id="today">
            <div className="habit-panel panel">
              <div className="panel-heading"><div><div className="section-kicker">YOUR DAILY PROMISES</div><h2>Today's check-in <span className="tiny-spark">✳</span></h2><p className="panel-sub">{prettyDate(selectedDate)}</p></div><div className="day-pill">{selectedPlanDay?.isBreak ? "RESET DAY" : selectedPlanDay ? `DAY ${selectedPlanDay.activeDay} OF 60` : saved.startDate ? "BEFORE START" : "NOT STARTED"}</div></div>
              {!saved.startDate && <div className="start-nudge"><Sparkles size={16}/><span>Your journey starts the moment you tick your first promise. No start date to set up.</span></div>}
              <div className="habit-list">
                {habits.map((habit, i) => {
                  const Icon = habit.icon; const checked = !!record.checks[habit.id];
                  return <button className={`habit-row ${checked ? "is-checked" : ""}`} key={habit.id} onClick={() => toggleHabit(habit.id)} aria-pressed={checked}>
                    <span className={`habit-icon icon-${i}`}><Icon size={19}/></span><span className="habit-copy"><strong>{habit.title}</strong><span>{habit.detail}</span></span><span className={`check-circle ${checked ? "checked" : ""}`}>{checked && <Check size={15} strokeWidth={3}/>}</span>
                  </button>;
                })}
              </div>
              <div className="checkin-footer"><div><span className="completion-label">DAILY COMPLETION</span><div className="completion-line"><span style={{width:`${completion}%`}}/></div></div><strong>{completion}%</strong></div>
              {completion === 100 && <div className="complete-message"><Sparkles size={16}/> Five promises kept. Take a breath and be proud of yourself.</div>}
            </div>

            <div className="right-column">
              <div className="focus-card"><div className="focus-top"><span className="focus-icon"><Brain size={18}/></span><span className="focus-label">A THOUGHT TO KEEP</span></div><p className="focus-quote">“You don't need to feel ready. You need to be willing to begin.”</p><div className="focus-bottom"><span>One day. One choice. Repeat.</span><Heart size={16}/></div><div className="focus-decoration">✳</div></div>
              <div className="note-panel panel" id="reflection"><div className="note-title"><span className="note-icon"><BookOpen size={17}/></span><div><h3>A note to yourself</h3><p>What did you learn or feel today?</p></div></div><textarea value={record.note} onChange={e => updateNote(e.target.value)} placeholder="A win, a lesson, a thought to remember..." rows={4}/><div className="note-foot"><span>Be honest, not harsh.</span><span>{record.note.length} characters</span></div></div>
            </div>
          </section>

          <section className="journey-section" id="journey">
            <div className="journey-header"><div><div className="section-kicker">THE BIGGER PICTURE</div><h2>Your journey, one day at a time.</h2><p>60 active days, with a reset day after every 15 active days.</p></div><div className="journey-legend"><span><i className="legend-active"/> Active day</span><span><i className="legend-break"/> Reset day</span><span><i className="legend-done"/> Complete</span></div></div>
            {!saved.startDate ? <div className="empty-journey"><div className="empty-icon"><CalendarDays size={24}/></div><div><strong>Your calendar will appear here.</strong><p>Tick your first habit to start your personal 64-day timeline.</p></div><ArrowDownRight size={20}/></div> :
              <div className="calendar-grid">{plan.map(p => {
                const key = dateKey(p.date); const r = saved.records[key]; const full = !p.isBreak && habits.every(h => r?.checks[h.id]); const any = !!r && habits.some(h => r.checks[h.id]); const isSelected = key === selected; const isToday = key === todayKey();
                return <button key={key} className={`calendar-day ${p.isBreak ? "break-day" : ""} ${full ? "day-complete" : ""} ${any ? "day-started" : ""} ${isSelected ? "day-selected" : ""} ${isToday ? "day-today" : ""}`} onClick={() => setSelected(key)} title={`${prettyDate(p.date)}${p.isBreak ? " · Reset day" : ` · Active day ${p.activeDay}`}`}>
                  <span className="cal-weekday">{p.date.toLocaleDateString(undefined,{weekday:"short"})}</span><strong>{p.date.getDate()}</strong><span className="cal-bottom">{p.isBreak ? "REST" : full ? <Check size={12}/> : `D${p.activeDay}`}</span>
                </button>;
              })}</div>}
            <div className="journey-foot"><span><span className="inline-dot"/> {start ? `Started ${prettyDate(start,{month:"short",day:"numeric",year:"numeric"})}` : "Start date is set by your first check-in"}</span><span>{daysToNewYear} days until New Year <ArrowUpRight size={14}/></span></div>
          </section>
          <footer className="page-footer"><span>MADE FOR YOUR NEXT CHAPTER <span>✳</span></span><span>Consistency is a form of self-respect.</span></footer>
        </div>
      </section>
      {toast && <div className="toast"><Sparkles size={16}/>{toast}</div>}
    </main>
  );
}
