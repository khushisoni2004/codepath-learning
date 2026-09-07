import { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import { apiFetch } from "../services/api";
import "../styles/achievements-page.css";

const FEATURED_POSTERS = [
  {
    _id: "web-development-top-performers",
    title: "Web Development Top Performers",
    description: "Celebrating excellence across the Web Development internship batch.",
    posterImage: "/images/achievements/web-development-top-performers.jpg",
  },
  {
    _id: "c-programming-top-performers",
    title: "C Programming Top Performers",
    description: "Recognizing consistent assignment submissions and outstanding class performance.",
    posterImage: "/images/achievements/c-programming-top-performers.jpg",
  },
];

function Poster({ poster, priority = false }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="achievement-poster-fallback" aria-label="Achievement poster unavailable">🏆</div>;
  return <img src={poster.posterImage} alt={`${poster.title || "CodePath Learning"} achievement poster`} width="640" height="640" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" onError={() => setFailed(true)} />;
}

export default function Achievements() {
  const [posters, setPosters] = useState(FEATURED_POSTERS);

  useEffect(() => {
    let active = true;

    apiFetch(`${API_URL}/achievements`)
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!active || !response.ok) return;
        const remotePosters = data.achievements || [];
        setPosters([...FEATURED_POSTERS, ...remotePosters.filter((poster) => !FEATURED_POSTERS.some((featured) => featured.posterImage === poster.posterImage))]);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return <main className="achievements-page">
    <section className="achievements-hero"><div className="container achievements-hero-content">
      <span className="achievements-kicker">STUDENT SUCCESS • CODEPATH LEARNING</span>
      <h1>Celebrating Our Student Achievements</h1>
      <p>Explore the milestones, performances and proud moments of our student community.</p>
    </div></section>
    <section className="achievements-listing container" aria-live="polite">
      <div className="achievement-poster-grid">{posters.map((poster, index) => <article className="achievement-poster" key={poster._id}>
        <Poster poster={poster} priority={index === 0} />
        {(poster.title || poster.description) ? <div className="achievement-poster-copy">
          {poster.title ? <h2>{poster.title}</h2> : null}
          {poster.description ? <p>{poster.description}</p> : null}
        </div> : null}
      </article>)}</div>
    </section>
  </main>;
}
