import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { hackathonConfig as event } from "../data/hackathonConfig";
import "../styles/hackathon.css";

const rounds = [
  ["ROUND 1", "Pitch your idea", "Explain the real problem, who faces it, your solution, key features, technology choices and expected impact in a concise presentation."],
  ["ROUND 2", "Top 10 teams", "Judges shortlist ten teams using the published criteria: relevance, feasibility, originality, impact and presentation clarity."],
  ["ROUND 3", "Build a prototype", "Shortlisted teams turn their ideas into working prototypes during the announced development period."],
  ["ROUND 4", "Demo day", "Present your working project to the judges. The top three teams receive prizes and winner certificates under the final rules."],
];
const slides = ["Project title and team", "The problem and who it affects", "What people do today and its limits", "Your proposed solution", "Key features and user journey", "Technology choices and build plan", "Expected impact and how you will measure it"];
const judging = [["Problem relevance",25],["Feasibility",25],["Innovation",20],["Expected real-world impact",20],["Presentation clarity",10]];
const faqs = [
  ["Who can participate?", "Diploma Computer Science students in years 1, 2 and 3."],
  ["Can beginners join?", "Yes. Round 1 focuses on a clear, useful and feasible idea. You do not need an advanced coding background to begin."],
  ["How big should a team be?", "Teams have 2–4 students."],
  ["Do we need a finished project to enter?", "No. Round 1 is an idea presentation. Shortlisted teams build their project afterward."],
  ["Can we use AI tools?", "Yes, subject to the final rules. Your team should understand and be able to explain its work."],
  ["Can we bring our own idea?", "Yes. Choose Open Innovation. The suggested topics are starting points, not required projects."],
  ["What is the fee?", `${event.fee.display} is listed, but the organizer must confirm whether it is per student or per team before registration and payment open.`],
  ["How are winners chosen?", "Round 1 uses the 100-mark criteria below. Final project judging will use a separately published rubric and demonstration."],
  ["Will participants get certificates?", "Eligible participants and shortlisted teams may receive certificates under the final event rules."],
  ["When is the event?", `${event.schedule}.`],
];

export default function Hackathon() {
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [formError, setFormError] = useState("");
  useEffect(() => {
    document.title = `${event.name} | CodePath Learning`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "CodePath Buildathon 1.0 helps diploma Computer Science students pitch ideas, build practical projects and present solutions to real problems.");
  }, []);
  useEffect(() => {
    if (registrationOpen) document.getElementById("registration-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [registrationOpen]);
  useEffect(() => {
    if (!registrationOpen && !activeChallenge) return undefined;
    function closeOnEscape(e) { if (e.key === "Escape") { setRegistrationOpen(false); setActiveChallenge(null); } }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [registrationOpen, activeChallenge]);
  function handleSubmit(e) {
    e.preventDefault();
    setFormError("Registration is not open yet. The organizer must configure submissions and confirm whether the ₹200 fee is per student or per team before accepting entries or payment.");
  }
  return <main className="hackathon-page">
    <section className="hb-hero"><div className="container hb-hero-grid"><div>
      <span className="hb-kicker"><i /> CODEPATH LEARNING PRESENTS</span>
      <h1>{event.name}</h1><h2>Find a real problem.<br/><em>Build something useful.</em></h2>
      <p>A friendly, hands-on challenge for diploma CS students. Start with an idea, work with your team, and show how technology can make a difference.</p>
      <div className="hb-actions"><button className="hb-button" type="button" onClick={() => setRegistrationOpen(true)}>Registration updates <span>→</span></button><a className="hb-button hb-outline" href="#challenges">Explore challenge ideas</a><a className="hb-text-link" href="#how-it-works">See the 4 stages ↓</a></div>
      <div className="hb-tagline">{event.tagline}</div>
      <div className="hb-hero-meta"><span><b>01</b> Start with an idea</span><span><b>02</b> Build as a team</span><span><b>03</b> Demo your solution</span></div>
    </div><div className="hb-hero-art" aria-label="Buildathon project journey illustration"><div className="hb-art-orbit hb-orbit-one"/><div className="hb-art-orbit hb-orbit-two"/><div className="hb-art-spark hb-spark-one">✳</div><div className="hb-art-spark hb-spark-two">✦</div><div className="hb-art-window"><div className="hb-window-top"><i/><i/><i/><span>YOUR NEXT BIG IDEA</span></div><div className="hb-window-content"><div className="hb-art-badge">BUILDATHON<br/><b>1.0</b></div><div className="hb-art-lines"><i/><i/><i/></div><div className="hb-art-nodes"><span>IDEA</span><b>→</b><span>IMPACT</span></div></div></div><span className="hb-art-sticker">Make it<br/><b>matter.</b></span><span className="hb-art-caption">IDEAS → PROTOTYPES → IMPACT</span></div></div></section>

    <section className="hb-overview"><div className="container hb-overview-row"><div className="hb-section-head"><span className="hb-eyebrow">AT A GLANCE</span><h2>Buildathon basics</h2><p>Key details to help you decide and get your team ready.</p></div><div className="hb-facts">{[["♟","Who can join","Diploma CS · Years 1–3"],["♟","Team size","2–4 students"],["₹","Listed fee",`${event.fee.display} · unit pending`],["▤","Start with","Idea presentation"],["★","Build stage","Top 10 teams"],["↗","Final round","Project demonstration"]].map(([icon,a,b])=><article key={a}><i>{icon}</i><span>{a}</span><strong>{b}</strong></article>)}</div></div><div className="container"><p className="hb-note">The organizer has not announced event dates or prize amounts. Fee unit and registration details still need confirmation.</p></div></section>

    <section className="hb-challenges" id="challenges"><div className="container hb-challenge-layout"><div className="hb-section-head"><span className="hb-eyebrow">PICK A STARTING POINT</span><h2>What could you solve?</h2><p>Explore a topic that matters to you. Shape it around a real person and a problem you can explain.</p><a className="hb-text-link" href="#how-it-works">How to take an idea forward ↓</a></div><div className="hb-challenge-grid">{event.categories.map((c,i)=><article className="hb-challenge" key={c.title}><div className="hb-challenge-top"><div className="hb-challenge-icon">{c.icon}</div><span>0{i+1}</span></div><h3>{c.title}</h3><p>{c.description}</p><button className="hb-explore" type="button" onClick={()=>setActiveChallenge(c)} aria-label={`Explore ${c.title}`}>Explore topic <span>↗</span></button></article>)}</div></div><div className="container hb-open-idea"><span>Have a different problem in mind?</span><b>Open Innovation is for your original idea.</b><a href="#how-it-works">See what makes a strong proposal ↓</a></div></section>

    <section className="hb-process" id="how-it-works"><div className="container"><div className="hb-section-head"><span className="hb-eyebrow">YOUR PATH THROUGH THE EVENT</span><h2>Four stages, one idea at a time.</h2><p>You do not need every answer today. Make progress at each stage with your team.</p></div><ol className="hb-timeline">{rounds.map(([label,title,body],i)=><li key={label}><span className="hb-round-num">0{i+1}</span><div><small>{label}</small><h3>{title}</h3><p>{body}</p></div></li>)}</ol></div></section>

    <section className="hb-ppt"><div className="container hb-ppt-grid"><div><span className="hb-eyebrow">ROUND 1 · THE IDEA PITCH</span><h2>Make your idea<br/>easy to follow.</h2><p>Tell a simple story: who has the problem, why current options fall short, and what your team could build.</p><button className="hb-button" type="button" onClick={() => setRegistrationOpen(true)}>Get registration updates <span>→</span></button><p className="hb-small-note">Submissions are not open yet. The organizer will announce the format and deadline.</p></div><ol>{slides.map((s,i)=><li key={s}><span>0{i+1}</span>{s}</li>)}</ol><aside><b>Good pitches help judges understand</b><ul><li>The problem is specific and affects real people.</li><li>The first version is small enough for a student team to build.</li><li>Each feature connects to a user need.</li><li>Your team can explain its choices and expected impact.</li></ul></aside></div></section>

    <section className="hb-judging"><div className="container hb-judging-grid"><div className="hb-section-head"><span className="hb-eyebrow">ROUND 1 · 100 MARKS</span><h2>Know what judges look for.</h2><p>The idea round rewards clear thinking, practical scope and a solution grounded in a real need.</p></div><div className="hb-score">{judging.map(([title,score])=><div className="hb-score-row" key={title}><div><span>{title}</span><b>{score} marks</b></div><i><em style={{width:`${score*4}%`}} /></i></div>)}<div className="hb-total"><span>Total</span><b>100 marks</b></div></div></div><div className="container hb-rubric"><b>Final project round</b><p>A separate rubric will be announced for working functionality, problem-solving effectiveness, innovation, usability, technical implementation and demonstration.</p></div></section>

    <section className="hb-prizes"><div className="container"><div className="hb-prize-intro"><div className="hb-section-head"><span className="hb-eyebrow">RECOGNIZING YOUR WORK</span><h2>Every build is progress.</h2><p>Show what you learned, what you made and how it could help.</p></div><div className="hb-prize-callout"><span>🏆</span><div><b>Top 3 teams</b><p>Prizes and winner certificates under the final event rules.</p></div></div></div><div className="hb-prize-grid">{[["01","First Prize"],["02","Second Prize"],["03","Third Prize"]].map(([n,x])=><article key={x}><span>{n}</span><h3>{x}</h3><strong>Prize details to be announced</strong></article>)}<article><span>✳</span><h3>Participation</h3><strong>Certificates for eligible participants under final rules</strong></article><article><span>✦</span><h3>Finalist</h3><strong>Certificates for shortlisted teams under final rules</strong></article></div><p className="hb-note">Prize values and certificate eligibility will be published by the organizer.</p></div></section>

    <section className="hb-faq"><div className="container hb-faq-grid"><div className="hb-section-head"><span className="hb-eyebrow">GOOD TO KNOW</span><h2>Questions before you start?</h2><p>Here are the basics students usually need first.</p></div><div className="hb-faq-list">{faqs.map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></div></section>

    <section className="hb-final"><div className="container"><span className="hb-eyebrow">CODEPATH BUILDATHON 1.0</span><h2>Have a problem<br/>you want to solve?</h2><p>Find two to four teammates, choose a topic and start with the people you want to help.</p><div><button className="hb-button hb-light" type="button" onClick={() => setRegistrationOpen(true)}>Registration updates</button><a className="hb-button hb-clear" href="#challenges">Explore challenge ideas</a></div><small>Registration is currently closed. Event date and fee unit are pending organizer confirmation.</small></div></section>

    {registrationOpen&&<section id="registration-form" className="hb-registration-section"><div className="hb-registration-panel"><button className="hb-close" type="button" onClick={()=>setRegistrationOpen(false)} aria-label="Close registration information">×</button><span className="hb-eyebrow">TEAM REGISTRATION</span><h2 id="hb-registration-title">Registration is not open yet</h2><p className="hb-modal-intro">The organizer still needs to confirm event logistics and set up a submission backend. No entries or payments can be accepted right now.</p><div className="hb-registration-details"><div className="hb-fee"><span>Listed registration fee</span><b>{event.fee.display}</b><small>The organizer must confirm whether this is per student or per team. Payment is disabled.</small></div><div className="hb-form-status"><span className="hb-status-dot" aria-hidden="true"/><span><b>Registration opening soon</b><small>Entries are not being accepted yet</small></span></div></div><div className="hb-registration-next"><span className="hb-next-icon" aria-hidden="true">✦</span><div><b>What you can do now</b><p>Find 2–4 teammates, choose a challenge, and prepare a clear idea pitch. Check the CodePath site for updates.</p></div></div><a className="hb-button" href="https://www.codepathlearning.co.in/">Visit CodePath Learning <span>↗</span></a><form className="hb-form" onSubmit={handleSubmit} noValidate><p className="hb-form-caption">Privacy: this page does not collect personal details. The registration form will appear once submissions are enabled.</p>{formError&&<p className="hb-form-error" role="alert">{formError}</p>}</form></div></section>}

    {activeChallenge&&createPortal(<div className="hb-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setActiveChallenge(null)}}><section className="hb-modal" role="dialog" aria-modal="true" aria-labelledby="hb-modal-title"><button className="hb-close" onClick={()=>setActiveChallenge(null)} aria-label="Close challenge details">×</button><span className="hb-eyebrow">SUGGESTED CHALLENGE</span><h2 id="hb-modal-title">{activeChallenge.title}</h2><p className="hb-modal-intro">{activeChallenge.overview}</p><dl>{[["Who experiences this problem?",activeChallenge.users],["What could you build?",activeChallenge.solution],["Suggested features",activeChallenge.features],["Possible technologies",activeChallenge.tech],["Expected project outcome",activeChallenge.outcome]].map(([a,b])=><div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl><p className="hb-note">Suggestions are starting points. Your team may propose a different original solution.</p></section></div>, document.body)}
  </main>;
}
