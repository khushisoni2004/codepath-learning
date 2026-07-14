import { Link } from "react-router-dom";
import "../styles/about.css";

const values = [
  {
    number: "01",
    title: "Simple Learning",
    description:
      "Programming concepts are explained step by step in simple Hindi-English language.",
  },
  {
    number: "02",
    title: "Practical Teaching",
    description:
      "Students learn through basic examples, coding practice and small projects.",
  },
  {
    number: "03",
    title: "Student-Friendly Access",
    description:
      "Courses are designed for beginners and diploma-level students at an affordable price.",
  },
];

const courses = [
  {
    logo:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    title: "Python Programming",
    className: "about-python-course",
    topics: [
      "Python introduction",
      "Variables and data types",
      "Operators",
      "Conditions and loops",
      "Lists, tuples and dictionaries",
      "Functions",
      "File handling",
      "Mini automation project",
      "Beginner projects",
    ],
  },
  {
    logos: [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
    ],
    title: "Web Development",
    className: "about-web-course",
    topics: [
      "HTML",
      "CSS",
      "JavaScript",
      "Bootstrap",
      "Responsive website basics",
      "Portfolio website project",
    ],
  },
  {
    logo:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
    title: "C Programming",
    className: "about-c-course",
    topics: [
      "Introduction to C",
      "Variables and data types",
      "Operators",
      "Conditions",
      "Loops",
      "Arrays and strings",
      "Functions",
      "Pointers basics",
      "College practice programs",
    ],
  },
  {
    logo:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
    title: "MySQL Database",
    className: "about-sql-course",
    topics: [
      "Database basics",
      "Tables and data types",
      "Create and insert queries",
      "Select queries",
      "Update and delete",
      "Constraints",
      "Joins",
      "Basic database project",
    ],
  },
  {
    customIcon: "✦",
    title: "Vibe Coding with AI",
    className: "about-vibe-course",
    topics: [
      "What is vibe coding?",
      "Prompt writing basics",
      "Generate website layout",
      "Generate HTML/CSS/JS code",
      "Debug errors with AI",
      "Improve UI with AI",
      "Understand AI-generated code",
      "AI-assisted mini project",
      "Safe and correct AI usage",
    ],
  },
  {
    customIcon: "⚙",
    title: "AI Tools for Smart Projects",
    className: "about-ai-tools-course",
    topics: [
      "ChatGPT for project ideas",
      "AI for notes and explanation",
      "AI for website planning",
      "AI for UI/UX ideas",
      "AI for debugging",
      "AI for documentation",
      "AI for presentations",
      "AI for interview preparation",
      "Safe AI usage rules",
    ],
  },
];

function AboutCourseLogo({ course }) {
  if (course.logos) {
    return (
      <div className="professional-course-icon about-course-multi-logo">
        {course.logos.map((logo) => (
          <img src={logo} alt="" key={logo} />
        ))}
      </div>
    );
  }

  if (course.logo) {
    return (
      <div className="professional-course-icon about-course-single-logo">
        <img src={course.logo} alt={`${course.title} logo`} />
      </div>
    );
  }

  return (
    <div className="professional-course-icon about-course-custom-logo">
      {course.customIcon}
    </div>
  );
}

export default function About() {
  return (
    <main className="professional-about-page">
      <section className="professional-about-hero">
        <div className="about-hero-grid" />
        <div className="about-hero-light about-hero-light-one" />
        <div className="about-hero-light about-hero-light-two" />

        <div className="container professional-about-hero-content">
          <span className="professional-about-label">
            ABOUT CODEPATH LEARNING
          </span>

          <h1>
            Learn programming with
            <span> clarity and confidence.</span>
          </h1>

          <p>
            CodePath Learning is designed for beginners and diploma-level
            students who want to understand programming through simple
            explanations, basic practical examples and structured learning.
          </p>

          <div className="professional-about-actions">
            <Link to="/courses" className="professional-primary-button">
              Explore Courses
              <span>→</span>
            </Link>

            <Link to="/notes" className="professional-secondary-button">
              View Learning Resources
            </Link>
          </div>
        </div>
      </section>

      <section className="professional-purpose-section">
        <div className="container professional-purpose-layout">
          <div className="professional-purpose-content">
            <span className="professional-section-label">
              OUR MISSION
            </span>

            <h2>
              Making programming easier for beginner students.
            </h2>

            <p>
              Our purpose is to make technical education easy to understand.
              Every course starts from the basics and focuses on important
              diploma-level topics that help students build a strong
              programming foundation. Students receive notes and assignments
              through Google Classroom, attend practical live classes on
              Google Meet and receive important updates through their
              registered email. We also provide guidance for creating a
              professional LinkedIn profile and uploading projects properly
              on GitHub. After completing the course, students must complete
              a final assessment before receiving their course completion
              certificate through email.
            </p>

            <div className="professional-values-list">
              {values.map((value) => (
                <article
                  className="professional-value-card"
                  key={value.number}
                >
                  <span>{value.number}</span>

                  <div>
                    <h3>{value.title}</h3>
                    <p>{value.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="professional-learning-box">
            <span className="professional-card-label">
              WHAT STUDENTS RECEIVE
            </span>

            <h3>Simple and structured course learning</h3>

            <ul>
              <li>
                <span>✓</span>
                Beginner-level structured course syllabus
              </li>

              <li>
                <span>✓</span>
                Simple Hindi-English video explanations
              </li>

              <li>
                <span>✓</span>
                Notes and assignments through Google Classroom
              </li>

              <li>
                <span>✓</span>
                Live practical classes through Google Meet
              </li>

              <li>
                <span>✓</span>
                Important updates sent to the registered email
              </li>

              <li>
                <span>✓</span>
                Offer letter shared through email after enrollment
              </li>

              <li>
                <span>✓</span>
                Professional LinkedIn profile guidance
              </li>

              <li>
                <span>✓</span>
                Support for uploading projects properly on GitHub
              </li>

              <li>
                <span>✓</span>
                Final assessment after completing the course
              </li>

              <li>
                <span>✓</span>
                Course completion certificate sent through email
              </li>
            </ul>

            <div className="professional-launch-fee">
              <span className="professional-launch-label">
                LAUNCH BATCH FEE
              </span>

              <div className="professional-price-grid professional-single-price-grid">
                <div className="professional-complete-plan">
                  <span>Complete Learning Plan</span>
                  <strong>₹599</strong>
                  <small>
                    Live Google Meet classes + notes + assignments + practical coding exercises + final assessment + CodePath Learning completion certificate
                  </small>
                </div>
              </div>
            </div>

            <p className="professional-learning-note">
              Enrollment updates, class details and completion certificate
              will be sent to the student's registered email address.
            </p>

            <div className="professional-certificate-policy">
              <strong>Certificate Terms &amp; Conditions</strong>
              <p>
                CodePath Learning directly issues the completion certificate after full payment verification, required classes, assignments, practical work and final assessment are completed. Student details must match the registered account. This is a private skill-based course completion certificate and is not a Government, AICTE, UGC, University or Board certificate.
              </p>
            </div>
          </aside>
        </div>
      </section>


      <section className="professional-certificate-section">
        <div className="container professional-certificate-layout">
          <div className="professional-certificate-content">
            <span className="professional-section-label">CERTIFICATE BY CODEPATH LEARNING</span>
            <h2>Training and certificate issued directly by CodePath Learning.</h2>
            <p>
              CodePath Learning provides the course structure, live classes,
              assignments, practical learning support and final assessment.
              Eligible students receive the completion certificate directly from
              CodePath Learning after satisfying the certificate requirements.
            </p>
            <Link to="/certificate-policy" className="professional-primary-button">
              View Certificate Policy
              <span>→</span>
            </Link>
          </div>

          <div className="professional-certificate-cards">
            <article>
              <span>01</span>
              <h3>Eligibility Terms</h3>
              <p>Full payment, required coursework, practical tasks and final assessment must be completed.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Direct Certificate Issuance</h3>
              <p>CodePath Learning verifies eligibility and issues the private course completion certificate.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="professional-courses-section">
        <div className="container">
          <div className="professional-section-heading">
            <div>
              <span className="professional-section-label">
                OUR COURSES
              </span>

              <h2>Beginner-friendly programming courses.</h2>
            </div>

            <p>
              Every course includes important beginner topics in a simple
              and structured order.
            </p>
          </div>

          <div className="professional-course-grid">
            {courses.map((course) => (
              <article
                className={`professional-course-card ${course.className}`}
                key={course.title}
              >
                <AboutCourseLogo course={course} />

                <div className="professional-course-content">
                  <h3>{course.title}</h3>

                  <ul className="about-course-topic-list">
                    {course.topics.map((topic) => (
                      <li key={topic}>
                        <span>✓</span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      

      <section className="professional-about-cta-section">
        <div className="container professional-about-cta">
          <div>
            <span className="professional-section-label">
              START YOUR JOURNEY
            </span>

            <h2>Start learning programming from the basics.</h2>

            <p>
              Choose a course, complete your enrollment and begin learning
              important programming topics step by step.
            </p>
          </div>

          <Link to="/courses" className="professional-primary-button">
            Browse Courses
            <span>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
