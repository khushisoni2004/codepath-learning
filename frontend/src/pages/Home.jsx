import { Link } from "react-router-dom";
import heroImage from "../assets/girl-coding.png";
import "../styles/home.css";

const courses = [
  {
    logos: [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
    ],
    title: "Web Development",
    description: "HTML, CSS, JavaScript and Bootstrap",
    className: "course-web",
    slug: "web-development",
  },
  {
    logo:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    title: "Python Programming",
    description: "Learn Python from beginner level",
    className: "course-python",
    slug: "python-programming",
  },
  {
    logo:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
    title: "C Programming",
    description: "Programming fundamentals and logic",
    className: "course-c",
    slug: "c-programming",
  },
  {
    logo:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
    title: "MySQL Database",
    description: "Queries, tables and database concepts",
    className: "course-sql",
    slug: "mysql-database",
  },
  {
    customIcon: "✦",
    title: "Vibe Coding with AI",
    description: "Build websites and projects faster using AI",
    className: "course-vibe",
    slug: "vibe-coding-ai",
  },
  {
    customIcon: "⚙",
    title: "AI Tools for Smart Projects",
    description: "Use AI for ideas, UI, debugging and documentation",
    className: "course-ai-tools",
    slug: "ai-tools-projects",
  },
];

const steps = [
  {
    number: "01",
    icon: "▤",
    title: "Register",
    description: "Choose your course and submit the registration form.",
  },
  {
    number: "02",
    icon: "▶",
    title: "Attend Live Classes",
    description: "Join beginner-friendly sessions through Google Meet.",
  },
  {
    number: "03",
    icon: "</>",
    title: "Practice Daily",
    description: "Complete assignments and practical coding questions.",
  },
  {
    number: "04",
    icon: "✓",
    title: "Final Assessment",
    description: "Complete the final assessment after your course.",
  },
  {
    number: "05",
    icon: "★",
    title: "Earn Certificate",
    description: "Eligible students receive a completion certificate.",
  },
];

const highlights = [
  {
    icon: "◉",
    title: "Beginner Friendly",
  },
  {
    icon: "▣",
    title: "Hindi-English Classes",
  },
  {
    icon: "</>",
    title: "Practical Learning",
  },
  {
    icon: "₹",
    title: "Affordable Fees",
  },
  {
    icon: "✓",
    title: "Completion Certificate",
  },
  {
    icon: "◌",
    title: "Student Support",
  },
];


function HomeCourseLogo({ course }) {
  if (course.logos) {
    return (
      <div
        className={`home-course-icon home-course-multi-logo ${course.className}`}
      >
        {course.logos.map((logo) => (
          <img src={logo} alt="" key={logo} />
        ))}
      </div>
    );
  }

  if (course.logo) {
    return (
      <div
        className={`home-course-icon home-course-single-logo ${course.className}`}
      >
        <img src={course.logo} alt={`${course.title} logo`} />
      </div>
    );
  }

  return (
    <div
      className={`home-course-icon home-course-custom-logo ${course.className}`}
    >
      {course.customIcon}
    </div>
  );
}

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-background-shape home-shape-one" />
        <div className="home-background-shape home-shape-two" />
        <div className="home-dot-pattern home-dot-one" />
        <div className="home-dot-pattern home-dot-two" />

        <div className="container home-hero-container">
          <div className="home-hero-content">
            <div className="home-program-badge">
              <span />
              1–2 MONTH BEGINNER-FRIENDLY PROGRAM
            </div>

            <h1 className="home-heading">
              Learn Today.
              <br />
              Build Tomorrow.
              <br />
              <span>Create Your Future.</span>
            </h1>

            <p className="home-hero-description">
              Learn programming through live classes, practical assignments,
              projects and simple Hindi-English explanations designed specially
              for beginners and diploma students.
            </p>

            <div className="home-actions">
              <Link to="/courses" className="home-primary-button">
                Explore Courses
                <span>→</span>
              </Link>

              <Link to="/register" className="home-secondary-button">
                Register Now
              </Link>
            </div>

            <div className="home-benefits-grid">
              <div className="home-benefit-item">
                <div className="home-benefit-icon">▣</div>
                <div>
                  <strong>Live Google Meet</strong>
                  <span>Interactive classes</span>
                </div>
              </div>

              <div className="home-benefit-item">
                <div className="home-benefit-icon">▤</div>
                <div>
                  <strong>Notes & Assignments</strong>
                  <span>Google Classroom access</span>
                </div>
              </div>

              <div className="home-benefit-item">
                <div className="home-benefit-icon">&lt;/&gt;</div>
                <div>
                  <strong>Practical Coding</strong>
                  <span>Learn with examples</span>
                </div>
              </div>

              <div className="home-benefit-item">
                <div className="home-benefit-icon">✓</div>
                <div>
                  <strong>Certificate</strong>
                  <span>Based on performance</span>
                </div>
              </div>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="home-visual-background" />
            <div className="home-visual-circle home-circle-one" />
            <div className="home-visual-circle home-circle-two" />

            <img
              src={heroImage}
              alt="Student learning programming online"
              className="home-hero-image"
            />

            <div className="home-floating-card home-floating-live">
              <div className="home-floating-icon">▶</div>
              <div>
                <span>Learning Mode</span>
                <strong>Live Classes</strong>
              </div>
            </div>

            <div className="home-floating-card home-floating-code">
              <div className="home-floating-icon">&lt;/&gt;</div>
              <div>
                <span>Practical Learning</span>
                <strong>Code Every Day</strong>
              </div>
            </div>

            <div className="home-floating-card home-floating-certificate">
              <div className="home-floating-icon">✓</div>
              <div>
                <span>Completion</span>
                <strong>Certificate</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-course-section">
        <div className="container">
          <div className="home-section-heading">
            <span>EXPLORE OUR PROGRAMS</span>
            <h2>Courses Designed for Beginners</h2>
            <p>
              Choose a course and start building practical programming skills
              through live learning and guided practice.
            </p>
          </div>

          <div className="home-course-grid">
            {courses.map((course) => (
              <Link
                to={`/courses/${course.slug}`}
                className="home-course-card"
                key={course.title}
              >
                <HomeCourseLogo course={course} />

                <div className="home-course-content">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <span>View Course →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-process-section">
        <div className="container">
          <div className="home-section-heading">
            <span>SIMPLE LEARNING JOURNEY</span>
            <h2>How CodePath Learning Works</h2>
            <p>
              Follow a clear learning path from registration to course
              completion.
            </p>
          </div>

          <div className="home-process-grid">
            {steps.map((step) => (
              <article className="home-process-card" key={step.number}>
                <div className="home-process-icon">{step.icon}</div>
                <span className="home-process-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-plans-section">
        <div className="container">
          <div className="home-section-heading">
            <span>FLEXIBLE LEARNING OPTIONS</span>
            <h2>Choose Your Learning Plan</h2>
            <p>
              Select the plan that matches your learning and certification
              requirements.
            </p>
          </div>

          <div className="home-pricing-layout">
            <article className="home-price-card home-price-featured">
              <div className="home-popular-badge">LAUNCH BATCH</div>

              <div className="home-price-header">
                <span>Complete Learning Plan</span>
                <h3>₹599</h3>
                <p>Best for live learning, assignments, practical knowledge and certification.</p>
              </div>

              <ul>
                <li>Live classes through Google Meet</li>
                <li>Topic-wise notes and learning material</li>
                <li>Assignments and practical coding questions</li>
                <li>Google Classroom access</li>
                <li>Final assessment</li>
                <li>CodePath Learning private completion certificate</li>
              </ul>

              <Link to="/register" className="home-plan-button">
                Register Now
              </Link>
            </article>

            <div className="home-certificate-preview">
              <div className="home-certificate-card">
                <div className="home-certificate-brand">
                  <div className="home-certificate-logo">&lt;/&gt;</div>
                  <strong>CodePath Learning</strong>
                </div>

                <span className="home-certificate-label">
                  CERTIFICATE OF COMPLETION
                </span>

                <p>This is to certify that</p>

                <h3>STUDENT NAME</h3>

                <p>
                  has successfully completed the selected programming course
                  conducted by CodePath Learning.
                </p>

                <div className="home-certificate-info">
                  <span>Date</span>
                  <span>Certificate ID</span>
                  <span>Signature</span>
                </div>
              </div>

              <p className="home-certificate-note">
                Private course completion certificate issued by CodePath Learning after classes, assignments, practical exercises and final assessment.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-cta-section">
        <div className="container home-cta-container">
          <div className="home-cta-content">
            <span>START LEARNING TODAY</span>
            <h2>Begin Your Coding Journey with CodePath Learning</h2>
            <p>
              Learn programming through live classes, practical assignments,
              projects and guided support.
            </p>
          </div>

          <Link to="/register" className="home-primary-button">
            Register Now
            <span>→</span>
          </Link>
        </div>
      </section>

      <section className="home-highlights-section">
        <div className="container home-highlights-grid">
          {highlights.map((item) => (
            <div className="home-highlight-item" key={item.title}>
              <span>{item.icon}</span>
              <strong>{item.title}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
