import { Link, useParams } from "react-router-dom";
import { additionalGovernmentJobs } from "../data/additionalGovernmentJobs";
import { jobs, slugifyGovernmentJob } from "./DiplomaGovernmentCareers";
import "../styles/diploma-careers.css";

const allJobs = [...jobs, ...additionalGovernmentJobs];
const sources = (name, language) => [
  ["Complete syllabus playlist", `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} complete syllabus ${language} playlist`)}`],
  ["Exam strategy and eligibility", `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} eligibility exam strategy ${language} Testbook`)}`],
  ["Previous papers and mock tests", `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} previous year paper mock test ${language} Adda247`)}`],
];

export default function GovernmentJobDetails() {
  const { slug } = useParams();
  const job = allJobs.find((item) => slugifyGovernmentJob(item.name) === slug);

  if (!job) return <main className="diploma-detail-page"><div className="container"><h1>Government job not found</h1><Link to="/diploma-government-careers">← Back to Government Jobs</Link></div></main>;

  return (
    <main className="diploma-detail-page">
      <div className="container">
        <Link className="diploma-detail-back" to="/diploma-government-careers">← Back to Government Jobs</Link>
        <article className="diploma-detail-sheet">
          <span className="diploma-careers-label">{job.organization}</span>
          <h1>{job.name}</h1>
          <p className="diploma-detail-description">{job.description}</p>
          <div className="diploma-detail-grid">
            <section><h2>Eligibility & qualification</h2><p>{job.qualification}</p><p><strong>Age limit:</strong> {job.age}</p></section>
            <section><h2>Syllabus</h2><p>{job.syllabus}</p></section>
            <section><h2>Selection / hiring process</h2><p>{job.selection}</p></section>
            <section><h2>Preparation strategy</h2><p>{job.strategy}</p></section>
            <section><h2>Difficulty and salary</h2><p><strong>Difficulty:</strong> {job.difficulty}</p><p><strong>Expected salary/stipend:</strong> {job.salary}</p></section>
            <section><h2>Career growth</h2><p>{job.growth}</p></section>
          </div>
          <section className="diploma-youtube-section">
            <h2>English YouTube playlists</h2>
            <div className="diploma-youtube-links">{sources(job.name, "English").map(([label, href]) => <a key={href} href={href} target="_blank" rel="noreferrer">{label} ↗</a>)}</div>
            <h2>हिन्दी YouTube playlists</h2>
            <div className="diploma-youtube-links">{sources(job.name, "Hindi").map(([label, href]) => <a key={href} href={href} target="_blank" rel="noreferrer">{label} ↗</a>)}</div>
          </section>
          <p className="diploma-detail-note"><strong>Important:</strong> Eligibility, vacancies, age, salary and selection can change. Always verify the latest official notification before applying.</p>
        </article>
      </div>
    </main>
  );
}
