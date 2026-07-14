import { useEffect, useState } from "react";
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
              <span>COMPLETE SYLLABUS</span>
              <h2>Topics You Will Study</h2>
            </div>

            <Link to="/courses" className="detail-small-back">← Back to Courses</Link>
          </div>

          <div className="detail-topic-grid">
            {course.syllabus.map((topic, index) => (
              <article className="detail-topic-item" key={`${course.slug}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{topic.title}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
