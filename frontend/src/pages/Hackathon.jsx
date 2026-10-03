import { Link } from "react-router-dom";
import "../styles/hackathon.css";

const tracks = [
  { icon: "⌘", name: "Campus, made smarter", detail: "Solve everyday challenges in labs, libraries, hostels and classrooms." },
  { icon: "◈", name: "Build for your branch", detail: "Create practical ideas for mechanical, civil, electrical, electronics or CS." },
  { icon: "✦", name: "Tech for good", detail: "Make useful, inclusive solutions for your community and local environment." },
];

const steps = ["Bring a problem worth solving", "Form a small, cross-skill team", "Build a working prototype", "Pitch what you learned and made"];

export default function Hackathon() {
  return (
    <main className="hackathon-page">
      <section className="hackathon-hero">
        <div className="container hackathon-hero-grid">
          <div className="hackathon-hero-copy">
            <span className="hackathon-eyebrow"><i /> CODEPATH STUDENT BUILD CHALLENGE</span>
            <h1>Your skills.<br /><span>Your idea.</span><br />Built for the real world.</h1>
            <p>A welcoming hackathon for polytechnic and diploma students. Team up, turn a campus or community problem into a working prototype, and learn by building—no prior hackathon experience needed.</p>
            <div className="hackathon-actions"><a className="hackathon-primary" href="mailto:hello@codepathlearning.in?subject=Polytechnic%20Hackathon%20Interest">I'm interested <span>↗</span></a><Link className="hackathon-secondary" to="/courses">Explore learning tracks</Link></div>
            <div className="hackathon-facts"><span><b>01</b> Learn by doing</span><span><b>02</b> Beginner friendly</span><span><b>03</b> Every branch welcome</span></div>
          </div>
          <div className="hackathon-art" aria-label="Illustration of a student team building a prototype">
            <div className="hackathon-art-orbit orbit-one" /><div className="hackathon-art-orbit orbit-two" />
            <div className="hackathon-code-card"><span>team.build()</span><strong>IDEA <em>→</em> IMPACT</strong><small>prototype in progress <b>●</b></small><div className="hackathon-progress"><i /></div></div>
            <div className="hackathon-sticker sticker-spark">✦</div><div className="hackathon-sticker sticker-bracket">&lt;/&gt;</div><div className="hackathon-art-caption">A good idea starts<br />with a real problem.</div>
          </div>
        </div>
        <div className="hackathon-marquee"><div>THINK PRACTICAL <span>✳</span> BUILD TOGETHER <span>✳</span> SHOW WHAT YOU CAN DO <span>✳</span> THINK PRACTICAL <span>✳</span> BUILD TOGETHER <span>✳</span></div></div>
      </section>

      <section className="hackathon-about"><div className="container hackathon-about-grid"><div><span className="hackathon-label">NOT JUST A CODING CONTEST</span><h2>Make something useful.<br /><span>Learn something lasting.</span></h2></div><div><p>Great projects come from noticing what could work better. Bring your branch knowledge, curiosity and a team spirit. Use code, electronics, design or a clever combination—what matters is solving a real problem and explaining your approach.</p><div className="hackathon-callout"><b>→</b><span>No fancy setup required. Start with what you know, and grow the idea as a team.</span></div></div></div></section>

      <section className="hackathon-tracks"><div className="container"><div className="hackathon-section-heading"><span className="hackathon-label">PICK A DIRECTION</span><h2>Build for the world<br />you know.</h2><p>Choose a challenge that feels close to home, then make it better.</p></div><div className="hackathon-track-grid">{tracks.map((track, index) => <article className="hackathon-track-card" key={track.name}><div className="hackathon-track-top"><span>{track.icon}</span><small>0{index + 1}</small></div><h3>{track.name}</h3><p>{track.detail}</p><div className="hackathon-track-line" /></article>)}</div></div></section>

      <section className="hackathon-journey"><div className="container hackathon-journey-grid"><div><span className="hackathon-label">THE BUILD JOURNEY</span><h2>From “what if?”<br />to “we made it.”</h2><p>Keep the first version simple. Learn fast, share the work and show the thinking behind your solution.</p><Link to="/register" className="hackathon-primary">Start learning <span>→</span></Link></div><ol>{steps.map((step, index) => <li key={step}><span>0{index + 1}</span><b>{step}</b><i>↗</i></li>)}</ol></div></section>

      <section className="hackathon-cta"><div className="container hackathon-cta-inner"><span className="hackathon-label">YOUR NEXT PROJECT STARTS HERE</span><h2>Ready to build beyond<br />the classroom?</h2><p>Tell us you’re interested in the CodePath student hackathon. We’ll share event details when they’re announced.</p><a className="hackathon-primary" href="mailto:hello@codepathlearning.in?subject=Polytechnic%20Hackathon%20Interest">Get event updates <span>↗</span></a><small>Open to polytechnic and diploma students across branches.</small></div></section>
    </main>
  );
}
