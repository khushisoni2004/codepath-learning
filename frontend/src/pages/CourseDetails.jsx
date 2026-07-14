import { useEffect, useId, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourseBySlug } from "../data/courseCatalog";
import PaymentModal from "../components/PaymentModal";
import { useAuth } from "../context/AuthContext";
import { paymentApi } from "../services/api";
import "../styles/course-details.css";

const courseVisuals = {
  "web-development": {
    logos: [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
    ],
  },
  python: { logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  "c-programming": { logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" },
  mysql: { logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
  oops: { logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  dsa: { icon: "DSA" },
  "vibe-coding-ai": { icon: "AI" },
  "ai-tools-projects": { icon: "AI" },
};

const syllabusSectionTitles = [
  "Getting Started",
  "Core Concepts",
  "Practical Learning",
  "Practice and Project",
];

function groupSyllabus(syllabus) {
  const sections = [];
  for (let index = 0; index < syllabus.length; index += 4) {
    sections.push({
      title: syllabusSectionTitles[sections.length] || `Advanced Topics ${sections.length - 3}`,
      topics: syllabus.slice(index, index + 4),
      startIndex: index,
    });
  }
  return sections;
}

function SyllabusSection({ section, sectionIndex }) {
  const [open, setOpen] = useState(true);
  const contentId = useId();

  return (
    <section className={`detail-syllabus-section ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="detail-syllabus-toggle"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((current) => !current)}
      >
        <div>
          <span>SECTION {String(sectionIndex + 1).padStart(2, "0")}</span>
          <h3>{section.title}</h3>
          <p>{section.topics.length} topics</p>
        </div>
        <span className="detail-syllabus-chevron" aria-hidden="true">⌄</span>
      </button>

      <div id={contentId} className="detail-syllabus-topics" hidden={!open}>
        {section.topics.map((topic, topicIndex) => {
          const topicNumber = section.startIndex + topicIndex + 1;
          return (
            <article className="detail-syllabus-topic" key={topic.title}>
              <span className="detail-topic-number">{String(topicNumber).padStart(2, "0")}</span>
              <div>
                <h4>{topic.title}</h4>
                <p>{topic.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DetailLogo({ course }) {
  const visual = courseVisuals[course.slug] || { icon: course.icon };

  if (visual.logos) {
    return (
      <div className="detail-course-icon detail-multi-logo">
        {visual.logos.map((logo) => (
          <img src={logo} alt="" key={logo} />
        ))}
      </div>
    );
  }

  if (visual.logo) {
    return (
      <div className="detail-course-icon detail-single-logo">
        <img src={visual.logo} alt={`${course.title} logo`} />
      </div>
    );
  }

  return <div className="detail-course-icon detail-custom-logo">{visual.icon}</div>;
}

export default function CourseDetails() {
  const { user, loading } = useAuth();
  const userId = user?.id;
  const { slug } = useParams();
  const course = getCourseBySlug(slug);
  const syllabusSections = course ? groupSyllabus(course.syllabus) : [];
  const [paidCourses, setPaidCourses] = useState([]);

  useEffect(() => {
    if (loading) return undefined;
    if (!userId) {
      setPaidCourses([]);
      return undefined;
    }

    let cancelled = false;
    paymentApi("/my-courses")
      .then((data) => { if (!cancelled) setPaidCourses(data.paidCourses || []); })
      .catch(() => { if (!cancelled) setPaidCourses([]); });

    return () => { cancelled = true; };
  }, [loading, userId]);

  if (!course) {
    return (
      <main className="course-detail-page">
        <section className="course-not-found">
          <div className="course-not-found-icon">!</div>
          <h1>Course not found</h1>
          <p>This course is currently not available.</p>
          <Link to="/courses">Back to Courses</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="course-detail-page">
      <section className="course-detail-hero">
        <div className="detail-hero-bg-one" />
        <div className="detail-hero-bg-two" />

        <div className="container detail-hero-simple">
          <Link to="/courses" className="detail-back-top">← Back to Courses</Link>
          <DetailLogo course={course} />
          <span className="detail-kicker">COURSE TOPICS</span>

          <h1>
            {course.title}
            <span> Topics.</span>
          </h1>

          <p>{course.description}</p>
          <div className="detail-buy-action">
            <PaymentModal course={course} paid={paidCourses.includes(course.slug)} onPaid={(paidSlug) => setPaidCourses((current) => current.includes(paidSlug) ? current : [...current, paidSlug])} />
          </div>
        </div>
      </section>

      <section className="detail-content-section">
        <div className="container detail-syllabus-card">
          <div className="detail-section-heading">
            <div>
              <span>STRUCTURED SYLLABUS</span>
              <h2>Course Content</h2>
            </div>

            <Link to="/courses" className="detail-small-back">← Back to Courses</Link>
          </div>

          <div className="detail-syllabus-list">
            {syllabusSections.map((section, index) => (
              <SyllabusSection
                section={section}
                sectionIndex={index}
                key={`${course.slug}-${section.title}`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
