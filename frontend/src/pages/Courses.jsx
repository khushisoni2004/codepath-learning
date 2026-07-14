import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { courseCatalog } from "../data/courseCatalog";
import PaymentModal from "../components/PaymentModal";
import { useAuth } from "../context/AuthContext";
import { paymentApi } from "../services/api";
import "../styles/courses.css";

const courseVisuals = {
  "web-development": {
    logos: [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
    ],
  },
  python: {
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  "c-programming": {
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
  },
  mysql: {
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  },
  oops: {
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  },
  dsa: {
    icon: "DSA",
  },
  "vibe-coding-ai": {
    icon: "✦",
  },
  "ai-tools-projects": {
    icon: "⚙",
  },
};

function CourseLogo({ course }) {
  const visual = courseVisuals[course.slug] || { icon: course.icon };

  if (visual.logos) {
    return (
      <div className="course-page-icon course-page-multi-logo">
        {visual.logos.map((logo) => (
          <img src={logo} alt="" key={logo} />
        ))}
      </div>
    );
  }

  if (visual.logo) {
    return (
      <div className="course-page-icon course-page-single-logo">
        <img src={visual.logo} alt={`${course.title} logo`} />
      </div>
    );
  }

  return <div className="course-page-icon course-page-custom-logo">{visual.icon}</div>;
}

export default function Courses() {
  const { user, loading } = useAuth();
  const userId = user?.id;
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

  const markPaid = (slug) => setPaidCourses((current) => current.includes(slug) ? current : [...current, slug]);
  return (
    <main className="courses-page">
      <section className="courses-hero">
        <div className="courses-bg courses-bg-one" />
        <div className="courses-bg courses-bg-two" />

        <div className="container courses-hero-content">
          <span className="courses-kicker">EXPLORE OUR PROGRAMS</span>

          <h1>
            Courses Designed for
            <span> Beginners.</span>
          </h1>

          <p>
            Choose a course and start building practical programming skills
            through live learning, guided practice, mini projects and AI support.
          </p>

          <div className="courses-hero-points">
            <div><span>✓</span> Beginner Friendly</div>
            <div><span>✓</span> Live Classes</div>
            <div><span>✓</span> Practical Learning</div>
          </div>
        </div>
      </section>

      <section className="courses-grid-section">
        <div className="container courses-grid">
          {courseCatalog
            .filter((course) => !["oops", "dsa", "oops-concepts", "dsa-basics"].includes(course.slug))
            .map((course) => (
            <article className="course-page-card" key={course.id}>
              <CourseLogo course={course} />

              <div className="course-page-meta">
                <span>{course.duration}</span>
                <span>{course.level}</span>
              </div>

              <h2>{course.title}</h2>
              <p>{course.description}</p>

              <div className="course-page-actions">
                <Link to={`/courses/${course.slug}`} className="course-page-button">View Course <span>→</span></Link>
                <PaymentModal course={course} paid={paidCourses.includes(course.slug)} onPaid={markPaid} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
