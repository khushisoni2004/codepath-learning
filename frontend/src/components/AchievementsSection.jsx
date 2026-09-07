import React, { useState } from "react";
import { Link } from "react-router-dom";
import ashutoshImage from "../assets/ashutosh.jpg";
import rudraImage from "../assets/rudra.jpg";
import "../styles/achievements.css";

// Reusable Top Performer Card Component
function AchievementCard({ performer, programTitle, courseName }) {
  return (
    <article className={`achievement-card ${performer.cardClass} achievements-entrance`}>
      <div className="card-image-container">
        <img
          src={performer.image}
          alt={`${performer.name}`}
          className="card-student-photo"
          loading="lazy"
        />
      </div>
      <div className="card-details">
        <span className="position-badge">
          {performer.medal} {performer.position}
        </span>
        <h3 className="student-name">{performer.name}</h3>
        <p className="recognition-tag">{performer.recognition}</p>
        <div className="course-info">
          <p className="program-name">{programTitle}</p>
          <p className="course-title">{courseName}</p>
        </div>
      </div>
    </article>
  );
}

// Reusable Special Recognition Card Component
function SpecialRecognitionCard({ student }) {
  return (
    <div className="special-card achievements-entrance">
      <span className="special-icon">⭐</span>
      <span className="special-name">{student.name}</span>
    </div>
  );
}

// Reusable Course Filter Component
function CourseFilter({ filters, activeFilter, onFilterChange }) {
  return (
    <div className="achievements-filters-wrapper">
      <div className="achievements-filters">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`filter-btn ${activeFilter === filter.id ? "active" : ""}`}
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Main Achievements Section Component
export default function AchievementsSection() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All" },
    { id: "python-programming", label: "Python Programming" },
    { id: "c-programming", label: "C Programming" },
    { id: "web-development", label: "Web Development" }
  ];

  // Extensible achievements database structure
  const achievementsData = [
    {
      courseId: "python-programming",
      courseName: "Python Programming",
      programName: "4-Week Internship Program",
      programTitle: "4-Week Python Programming Internship Program",
      topPerformers: [
        {
          position: "1st Position",
          name: "Ashutosh Namdev",
          recognition: "Top Performer",
          image: ashutoshImage,
          medal: "🥇",
          cardClass: "gold-card"
        },
        {
          position: "2nd Position",
          name: "Rudra Pratap Soni",
          recognition: "Outstanding Performer",
          image: rudraImage,
          medal: "🥈",
          cardClass: "silver-card"
        }
      ],
      specialRecognitions: [
        { name: "Aditya Anjane" },
        { name: "Govind Thakre" },
        { name: "Kushagra Gangrade" }
      ]
    },
    {
      courseId: "c-programming",
      courseName: "C Programming",
      programName: "4-Week Internship Program",
      programTitle: "4-Week C Programming Internship Program",
      topPerformers: [],
      specialRecognitions: []
    },
    {
      courseId: "web-development",
      courseName: "Web Development",
      programName: "4-Week Internship Program",
      programTitle: "4-Week Web Development Internship Program",
      topPerformers: [],
      specialRecognitions: []
    }
  ];

  // Filtering Logic
  // - If 'All' is selected: display all courses that currently have achievements.
  // - Otherwise: display the specific course matching the filter.
  const filteredCourses = activeFilter === "all"
    ? achievementsData.filter(course => course.topPerformers.length > 0 || course.specialRecognitions.length > 0)
    : achievementsData.filter(course => course.courseId === activeFilter);

  const hasAchievements = filteredCourses.some(
    (course) => course.topPerformers.length > 0 || course.specialRecognitions.length > 0
  );

  return (
    <section className="achievements-section" id="student-achievements">
      <div className="container">
        {/* Section Heading with Hall of Achievement Badge */}
        <div className="home-section-heading">
          <div className="achievements-badge-wrapper">
            <span className="achievements-badge">
              <span />
              CODEPATH LEARNING • HALL OF ACHIEVEMENT
            </span>
          </div>
          <h2>🏆 Celebrating Our Student Achievements</h2>
          <p>
            Recognizing students who demonstrated outstanding performance, consistency,
            and dedication during CodePath Learning programs.
          </p>
        </div>

        {/* Tab Filters */}
        <CourseFilter
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Display Achievements Content */}
        {hasAchievements ? (
          <div className="achievements-content-area">
            {filteredCourses.map((course) => (
              <div key={course.courseId} className="course-achievements-group">
                {/* 1st & 2nd Performers Side-by-Side */}
                {course.topPerformers.length > 0 && (
                  <div className="performers-grid">
                    {course.topPerformers.map((performer, idx) => (
                      <AchievementCard
                        key={idx}
                        performer={performer}
                        programTitle={course.programTitle}
                        courseName={course.courseName}
                      />
                    ))}
                  </div>
                )}

                {/* Special Recognition Sub-section */}
                {course.specialRecognitions.length > 0 && (
                  <div className="special-recognition-container">
                    <h3 className="special-recognition-title">Special Recognition</h3>
                    <div className="special-grid">
                      {course.specialRecognitions.map((student, idx) => (
                        <SpecialRecognitionCard key={idx} student={student} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Elegant placeholder for courses without achievements yet */
          <div className="achievements-empty achievements-entrance">
            <span>🎓</span>
            <h4>Achievements Coming Soon!</h4>
            <p>
              Achievements for the {filters.find(f => f.id === activeFilter)?.label} course are
              being compiled and will be announced here soon.
            </p>
          </div>
        )}

        {/* Motivational Bottom CTA */}
        <div className="achievements-cta">
          <div className="achievements-cta-text">
            <h4>Your dedication deserves recognition.</h4>
            <p>Learn • Practice • Build • Achieve</p>
          </div>
          <Link to="/courses" className="achievements-cta-btn">
            Explore Our Courses
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
