import { Link } from "react-router-dom";
import ProtectedStudentResourceLink from "../components/ProtectedStudentResourceLink";
import "../styles/notes.css";

const resources = [
  {
    number: "01",
    icon: "▤",
    title: "Topic-wise Notes",
    description:
      "Every important topic will be explained through simple and structured notes.",
  },
  {
    number: "02",
    icon: "✓",
    title: "Practice Assignments",
    description:
      "Students will receive regular assignments to practice concepts after every module.",
  },
  {
    number: "03",
    icon: "</>",
    title: "Practical Questions",
    description:
      "Programming questions, code examples and practical exercises will be provided.",
  },
  {
    number: "04",
    icon: "▶",
    title: "Class Resources",
    description:
      "Class notes, useful links and assignment instructions will be shared through Google Classroom.",
  },
];

const courseNotes = [
  {
    title: "Python Programming",
    className: "notes-python-card",
    logo:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    topics: [
      "Variables and data types",
      "Conditions and loops",
      "Functions",
      "Lists and dictionaries",
      "File handling",
      "Mini automation practice",
    ],
  },
  {
    title: "Web Development",
    className: "notes-web-card",
    logos: [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
    ],
    topics: [
      "HTML",
      "CSS",
      "JavaScript",
      "Bootstrap",
      "Responsive design",
      "Portfolio website project",
    ],
  },
  {
    title: "C Programming",
    className: "notes-c-card",
    logo:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
    topics: [
      "Variables and operators",
      "Conditions and loops",
      "Arrays and strings",
      "Functions",
      "Pointers basics",
      "College practice programs",
    ],
  },
  {
    title: "MySQL Database",
    className: "notes-sql-card",
    logo:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
    topics: [
      "Database fundamentals",
      "Create and insert queries",
      "Select queries",
      "Update and delete",
      "Constraints",
      "Joins",
    ],
  },
  {
    title: "Vibe Coding with AI",
    className: "notes-vibe-card",
    customIcon: "✦",
    topics: [
      "What is vibe coding?",
      "Prompt writing basics",
      "Generate website layout",
      "Debug errors with AI",
      "Improve UI with AI",
      "AI-assisted mini project",
    ],
  },
  {
    title: "AI Tools for Smart Projects",
    className: "notes-ai-tools-card",
    customIcon: "⚙",
    topics: [
      "AI for project ideas",
      "AI for notes and explanation",
      "AI for UI/UX planning",
      "AI for documentation",
      "AI for presentations",
      "Safe AI usage rules",
    ],
  },
];

const platformLinks = [
  {
    icon: "WA",
    title: "Join WhatsApp Group",
    description:
      "Receive class reminders, important announcements and quick student updates.",
    resource: "whatsapp",
    button: "Join WhatsApp Group",
    className: "notes-whatsapp-link",
  },
  {
    icon: "GF",
    title: "Fill Enrollment Form",
    description:
      "Submit your course details, contact information and selected learning plan.",
    resource: "enrollment",
    button: "Open Google Form",
    className: "notes-form-link",
  },

];

function NotesCourseLogo({ course }) {
  if (course.logos) {
    return (
      <div className="notes-course-icon notes-course-multi-logo">
        {course.logos.map((logo) => (
          <img src={logo} alt="" key={logo} />
        ))}
      </div>
    );
  }

  if (course.logo) {
    return (
      <div className="notes-course-icon notes-course-single-logo">
        <img src={course.logo} alt={`${course.title} logo`} />
      </div>
    );
  }

  return (
    <div className="notes-course-icon notes-course-custom-logo">
      {course.customIcon}
    </div>
  );
}

export default function Notes() {
  return (
    <main className="notes-page">
      <section className="notes-hero">
        <div className="notes-grid-background" />
        <div className="notes-hero-glow notes-glow-one" />
        <div className="notes-hero-glow notes-glow-two" />

        <div className="container notes-hero-content">
          <span className="notes-eyebrow">
            STUDENT LEARNING RESOURCES
          </span>

          <h1>
            Notes, assignments and
            <span> practical learning resources.</span>
          </h1>

          <p>
            Enrolled students receive structured notes, regular assignments,
            practical programming questions and useful class material through
            Google Classroom.
          </p>

          <div className="notes-hero-actions">
            <ProtectedStudentResourceLink resource="classroom" className="notes-primary-button">
              Join Google Classroom
              <span>→</span>
            </ProtectedStudentResourceLink>

            <ProtectedStudentResourceLink resource="enrollment" className="notes-secondary-button">
              Fill Enrollment Form
            </ProtectedStudentResourceLink>
          </div>

          <div className="notes-hero-points">
            <div>
              <span>✓</span>
              Topic-wise Notes
            </div>

            <div>
              <span>✓</span>
              Weekly Assignments
            </div>

            <div>
              <span>✓</span>
              Practical Questions
            </div>
          </div>
        </div>
      </section>

      <section className="notes-resources-section">
        <div className="container">
          <div className="notes-section-heading">
            <div>
              <span className="notes-section-label">
                WHAT STUDENTS RECEIVE
              </span>

              <h2>Complete support for regular learning.</h2>
            </div>

            <p>
              Learning material will be provided in a simple and organized
              format so students can revise and practice properly.
            </p>
          </div>

          <div className="notes-resource-grid">
            {resources.map((resource) => (
              <article
                className="notes-resource-card"
                key={resource.number}
              >
                <div className="notes-resource-top">
                  <div className="notes-resource-icon">
                    {resource.icon}
                  </div>

                  <span>{resource.number}</span>
                </div>

                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="notes-courses-section">
        <div className="container">
          <div className="notes-section-heading">
            <div>
              <span className="notes-section-label">
                COURSE-WISE MATERIAL
              </span>

              <h2>Notes for every programming course.</h2>
            </div>

            <p>
              Course notes will cover important diploma-level basic topics
              with examples and practice questions.
            </p>
          </div>

          <div className="notes-course-grid">
            {courseNotes.map((course) => (
              <article
                className={`notes-course-card ${course.className}`}
                key={course.title}
              >
                <NotesCourseLogo course={course} />

                <div className="notes-course-content">
                  <span>COURSE NOTES</span>
                  <h3>{course.title}</h3>

                  <ul>
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

      <section className="notes-platform-section">
        <div className="container">
          <div className="notes-section-heading">
            <div>
              <span className="notes-section-label">
                STUDENT LINKS
              </span>

              <h2>Join the learning platforms.</h2>
            </div>

            <p>
              Use these links to register, receive updates and access your
              course resources.
            </p>
          </div>

          <div className="notes-platform-grid">
            {platformLinks.map((item) => (
              <article
                className={`notes-platform-card ${item.className}`}
                key={item.title}
              >
                <div className="notes-platform-icon">
                  {item.icon}
                </div>

                <div className="notes-platform-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <ProtectedStudentResourceLink resource={item.resource} className="notes-platform-button">
                  {item.button}
                  <span>→</span>
                </ProtectedStudentResourceLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="notes-process-section">
        <div className="container notes-process-box">
          <div>
            <span className="notes-section-label">HOW IT WORKS</span>
            <h2>Student resource access process</h2>
          </div>

          <div className="notes-process-list">
            <article>
              <span>01</span>
              <div>
                <h3>Complete Enrollment</h3>
                <p>
                  Choose your course, complete payment and submit your details.
                </p>
              </div>
            </article>

            <article>
              <span>02</span>
              <div>
                <h3>Join Student Platforms</h3>
                <p>
                  Join the WhatsApp group and Google Classroom using the
                  provided links.
                </p>
              </div>
            </article>

            <article>
              <span>03</span>
              <div>
                <h3>Access Notes and Assignments</h3>
                <p>
                  Notes, assignments and practical questions will be uploaded
                  regularly in Classroom.
                </p>
              </div>
            </article>

            <article>
              <span>04</span>
              <div>
                <h3>Complete Final Assessment</h3>
                <p>
                  After completing the course, students will take a final test
                  before receiving the completion certificate.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="notes-launch-fee-section">
        <div className="container">
          <div className="notes-launch-fee-box">
            <div className="notes-launch-fee-heading">
              <span>LIMITED-TIME PRICING</span>
              <h2>Launch Batch Fee</h2>
              <p>
                Beginner-friendly live coding program with structured
                learning resources and practical guidance.
              </p>
            </div>

            <div className="notes-launch-fee-plans notes-single-fee-plan">
              <div className="notes-launch-featured-plan">
                <span>Complete Learning Plan</span>
                <strong>₹599</strong>
                <small>
                  Live Google Meet classes + notes + assignments + practical exercises + final assessment + CodePath Learning completion certificate
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="notes-information-section">
        <div className="container notes-information-box">
          <div className="notes-information-icon">i</div>

          <div>
            <h3>Important information</h3>
            <p>
              Google Classroom access, WhatsApp group access, offer letter,
              course notes, assignments and certificate-related updates will
              be provided after enrollment and payment verification.
            </p>
          </div>

          <Link to="/courses" className="notes-primary-button">
            View Courses
            <span>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
