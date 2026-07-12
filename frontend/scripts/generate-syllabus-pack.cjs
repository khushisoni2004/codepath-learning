const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const outputDir = path.join(__dirname, "..", "public", "resources", "syllabus");
fs.mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, "CodePath-Learning-Course-Syllabus-Pack.pdf");

const courses = [
  {
    title: "Web Development",
    duration: "6 Weeks",
    topics: [
      "Computer basics and coding setup",
      "VS Code and Live Server",
      "HTML website structure",
      "Text, image, links and lists",
      "Forms and tables",
      "CSS colors, fonts and spacing",
      "Box model and layout",
      "Flexbox basics",
      "Responsive design",
      "JavaScript basics",
      "DOM and events",
      "Form validation",
      "GitHub project upload",
      "Portfolio mini project",
    ],
  },
  {
    title: "Python Programming",
    duration: "6 Weeks",
    topics: [
      "Python setup and introduction",
      "Variables and data types",
      "Input and output",
      "Operators",
      "If-else conditions",
      "Loops",
      "Lists and tuples",
      "Dictionary basics",
      "Functions",
      "String handling",
      "File handling basics",
      "Error handling basics",
      "Simple logic building",
      "Marks calculator project",
      "Mini automation project",
    ],
  },
  {
    title: "C Programming",
    duration: "6 Weeks",
    topics: [
      "C language introduction",
      "Compiler and setup",
      "Variables and data types",
      "Input and output",
      "Operators",
      "If-else statements",
      "Loops",
      "Pattern programs",
      "Arrays",
      "Strings",
      "Functions",
      "Pointers basics",
      "Structure basics",
      "Menu-driven program",
      "College exam practice programs",
    ],
  },
  {
    title: "MySQL Database",
    duration: "4 Weeks",
    topics: [
      "Database introduction",
      "DBMS vs RDBMS",
      "Tables, rows and columns",
      "Data types",
      "Create database and table",
      "Insert, update and delete data",
      "SELECT queries",
      "WHERE, ORDER BY, LIMIT",
      "Aggregate functions",
      "Primary key and foreign key",
      "JOIN basics",
      "Simple database design",
      "Student registration database project",
    ],
  },
  {
    title: "Vibe Coding with AI",
    duration: "2 Weeks Add-on",
    topics: [
      "What is vibe coding?",
      "AI tools introduction",
      "Prompt writing basics",
      "How to ask AI for code",
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
    title: "AI Tools for Smart Projects",
    duration: "2 Weeks Add-on",
    topics: [
      "ChatGPT for project ideas",
      "AI for notes and explanation",
      "AI for website planning",
      "AI for UI/UX ideas",
      "AI for debugging",
      "AI for documentation",
      "AI for resume/project description",
      "AI for presentation making",
      "AI for interview preparation",
      "Safe AI usage rules",
    ],
  },
];

const doc = new PDFDocument({
  size: "A4",
  margin: 46,
});

doc.pipe(fs.createWriteStream(outputPath));

const blue = "#2563eb";
const purple = "#7c3aed";
const dark = "#111827";
const gray = "#4b5563";

function addHeader() {
  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor(dark)
    .text("CodePath Learning", { align: "center" });

  doc
    .moveDown(0.3)
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor(blue)
    .text("Complete Course Syllabus Pack", { align: "center" });

  doc
    .moveDown(0.5)
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(gray)
    .text(
      "Professional syllabus pack for launch batch, student sharing and course presentation.",
      { align: "center" }
    );

  doc.moveDown(1);
  doc
    .moveTo(46, doc.y)
    .lineTo(549, doc.y)
    .strokeColor("#dbe4ff")
    .lineWidth(1)
    .stroke();

  doc.moveDown(1);
}

function ensureSpace(height = 120) {
  if (doc.y + height > doc.page.height - 60) {
    doc.addPage();
  }
}

addHeader();

courses.forEach((course, courseIndex) => {
  ensureSpace(150);

  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor(courseIndex % 2 === 0 ? blue : purple)
    .text(`${course.title} - ${course.duration}`);

  doc.moveDown(0.35);

  course.topics.forEach((topic, index) => {
    ensureSpace(22);

    doc
      .font("Helvetica")
      .fontSize(10.5)
      .fillColor(dark)
      .text(`${index + 1}. ${topic}`, {
        indent: 10,
        lineGap: 3,
      });
  });

  doc.moveDown(0.85);
});

doc.moveDown(0.5);
doc
  .font("Helvetica-Oblique")
  .fontSize(9)
  .fillColor(gray)
  .text(
    "Note: This syllabus is for private skill-based learning and practical coding training by CodePath Learning.",
    { align: "center" }
  );

doc.end();

console.log("Updated syllabus pack created:");
console.log(outputPath);
