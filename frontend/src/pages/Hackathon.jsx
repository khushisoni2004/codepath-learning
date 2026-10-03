import { Link } from "react-router-dom";
import "../styles/hackathon.css";

const tracks = [
  { icon: "⌘", name: "Smart campus", detail: "Solve everyday challenges in labs, libraries, hostels and classrooms." },
  { icon: "◈", name: "Build for your branch", detail: "Create practical ideas for mechanical, civil, electrical, electronics or CS." },
  { icon: "✦", name: "Technology for good", detail: "Make useful, inclusive solutions for your community and environment." },
];

const steps = ["Pick a real problem", "Build a four-member team", "Create a working prototype", "Present your solution"];
const prizes = [
  { place: "1st place", amount: "₹5,000", detail: "Winner", className: "prize-first", medal: "✦" },
  { place: "2nd place", amount: "₹2,500", detail: "Runner-up", className: "prize-second", medal: "◆" },
  { place: "3rd place", amount: "₹1,000", detail: "Second runner-up", className: "prize-third", medal: "●" },
];

export default function Hackathon() {
  return (
    <main className="hackathon-page">
      <section className="hackathon-hero">
        <div className="container hackathon-hero-grid">
          <div className="hackathon-hero-copy">
            <span className="hackathon-eyebrow"><i /> CODEPATH POLYTECHNIC HACKATHON</span>
            <h1>Big ideas.<br /><span>Built together.</span></h1>
            <p className="hackathon-hero-lede">A hands-on build challenge for polytechnic students ready to turn what they know into something that matters.</p>
            <div className="hackathon-hero-facts"><div><b>4</b><span>students per team</span></div><i /><div><b>₹8,500</b><span>total prize money</span></div><i /><div><b>All</b><span>branches welcome</span></div></div>
            <div className="hackathon-actions"><Link className="hackathon-primary" to="/register">Register your interest <span>→</span></Link><a className="hackathon-secondary" href="#prizes">Explore prizes <span>↓</span></a></div>
            <p className="hackathon-hero-note">No hackathon experience needed. Bring your curiosity and your team.</p>
          </div>
          <div className="hackathon-hero-visual" aria-label="Hackathon details: teams of four, prizes for the top three teams">
            <div className="hackathon-visual-glow" />
            <div className="hackathon-visual-top"><span>THE STUDENT BUILD CHALLENGE</span><b>CP / 01</b></div>
            <div className="hackathon-visual-title">IDEA<br /><span>TO IMPACT</span></div>
            <div className="hackathon-visual-code"><span>team.prototype</span><div><i /><i /><i /><i /></div><small><b>●</b> made by students, for the real world</small></div>
            <div className="hackathon-visual-stamp">BUILD<br />TOGETHER</div>
            <div className="hackathon-visual-footer"><span>POLYTECHNIC + DIPLOMA STUDENTS</span><span>LEARN · MAKE · PRESENT</span></div>
          </div>
        </div>
        <div className="hackathon-marquee"><div>THINK PRACTICAL <span>✳</span> BUILD TOGETHER <span>✳</span> SHOW WHAT YOU CAN DO <span>✳</span> THINK PRACTICAL <span>✳</span> BUILD TOGETHER <span>✳</span></div></div>
      </section>

      <section className="hackathon-prizes" id="prizes"><div className="container"><div className="hackathon-prize-heading"><div><span className="hackathon-label">A LITTLE MOTIVATION FOR BIG IDEAS</span><h2>Build it. Pitch it.<br /><span>Win together.</span></h2></div><p>Three standout teams will take home prize money for the ideas they bring to life.</p></div><div className="hackathon-prize-grid">{prizes.map((prize) => <article className={`hackathon-prize-card ${prize.className}`} key={prize.place}><div className="hackathon-prize-card-top"><span className="hackathon-medal">{prize.medal}</span><span className="hackathon-place">{prize.place}</span></div><strong>{prize.amount}</strong><span className="hackathon-prize-caption">{prize.detail}</span><div className="hackathon-prize-rule" /><small>PER WINNING TEAM</small></article>)}</div><p className="hackathon-prize-note">Prize amounts are awarded to the winning team.</p></div></section>

      <section className="hackathon-team"><div className="container hackathon-team-grid"><div className="hackathon-team-art"><div className="hackathon-team-orbit" /><div className="hackathon-team-number">04</div><div className="hackathon-team-label">ONE TEAM<br />ONE BIG IDEA</div><span className="team-spark spark-a">✳</span><span className="team-spark spark-b">✦</span></div><div className="hackathon-team-copy"><span className="hackathon-label">FOUR MINDS. ONE BUILD.</span><h2>Better ideas happen<br />when you build <span>together.</span></h2><p>Each team must have exactly four student members. Bring your friends from the same branch or mix your skills across disciplines—programming, electronics, design, fabrication and presentation all matter.</p><div className="hackathon-team-points"><span><b>01</b> Polytechnic and diploma students</span><span><b>02</b> Exactly 4 members per team</span><span><b>03</b> Every branch and skill level welcome</span></div></div></div></section>

      <section className="hackathon-tracks"><div className="container"><div className="hackathon-section-heading"><span className="hackathon-label">CHOOSE YOUR CHALLENGE</span><h2>Start with a problem<br />you understand.</h2><p>Bring your classroom knowledge to the real world around you.</p></div><div className="hackathon-track-grid">{tracks.map((track, index) => <article className="hackathon-track-card" key={track.name}><div className="hackathon-track-top"><span>{track.icon}</span><small>0{index + 1}</small></div><h3>{track.name}</h3><p>{track.detail}</p><div className="hackathon-track-line" /></article>)}</div></div></section>

      <section className="hackathon-journey"><div className="container hackathon-journey-grid"><div><span className="hackathon-label">HOW THE CHALLENGE WORKS</span><h2>From “what if?”<br />to “we built it.”</h2><p>Keep the first version simple. Share the work, test your idea and show the thinking behind your solution.</p><Link to="/register" className="hackathon-primary">Register your interest <span>→</span></Link></div><ol>{steps.map((step, index) => <li key={step}><span>0{index + 1}</span><b>{step}</b><i>↗</i></li>)}</ol></div></section>

      <section className="hackathon-cta"><div className="container hackathon-cta-inner"><span className="hackathon-label">YOUR TEAM’S STORY STARTS HERE</span><h2>Ready to make<br />something real?</h2><p>Get your four-member team together and register your interest. We’ll share event schedule and venue details when they’re confirmed.</p><Link className="hackathon-primary" to="/register">Register your interest <span>→</span></Link><small>For polytechnic and diploma students · All branches welcome</small></div></section>
    </main>
  );
}
