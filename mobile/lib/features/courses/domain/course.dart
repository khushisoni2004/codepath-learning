class Lesson {
  const Lesson(this.title, this.description);
  final String title;
  final String description;
}

class Course {
  const Course({required this.slug, required this.title, required this.category,
    required this.duration, required this.description, required this.lessons});
  final String slug;
  final String title;
  final String category;
  final String duration;
  final String description;
  final List<Lesson> lessons;
}

const courses = <Course>[
  Course(slug: 'web-development', title: 'Web Development', category: 'Web Development', duration: '6 Weeks',
    description: 'Learn HTML, CSS, JavaScript and Bootstrap through practical website development.', lessons: [
      Lesson('Coding setup', 'Computer basics, VS Code and Live Server.'), Lesson('HTML structure', 'Semantic pages, text, images, links, lists, forms and tables.'),
      Lesson('CSS foundations', 'Colours, typography, spacing, box model and Flexbox.'), Lesson('Responsive design', 'Build layouts that work across screen sizes.'),
      Lesson('JavaScript basics', 'Variables, conditions, functions, DOM and events.'), Lesson('Portfolio project', 'Build and publish a responsive portfolio website.')]),
  Course(slug: 'python', title: 'Python Programming', category: 'Programming', duration: '6 Weeks',
    description: 'Learn Python basics, logic building, file handling and mini automation.', lessons: [
      Lesson('Python setup', 'Install Python and write your first program.'), Lesson('Core language', 'Variables, types, operators, input and output.'),
      Lesson('Program flow', 'Conditions, loops and reusable functions.'), Lesson('Collections', 'Lists, tuples and dictionaries.'),
      Lesson('Files and errors', 'File handling plus try and except.'), Lesson('Mini projects', 'Marks calculator and beginner automation.')]),
  Course(slug: 'c-programming', title: 'C Programming', category: 'Programming', duration: '6 Weeks',
    description: 'Build strong programming fundamentals using C and logic practice.', lessons: [Lesson('C setup', 'Program structure, compiler and input/output.'), Lesson('Logic', 'Operators, conditions, loops and patterns.'), Lesson('Data', 'Arrays, strings and structures.'), Lesson('Functions and pointers', 'Modular code, addresses and dereferencing.'), Lesson('Practice project', 'Menu-driven programs and exam practice.')]),
  Course(slug: 'cpp-programming', title: 'C++ Programming', category: 'Programming', duration: '6 Weeks',
    description: 'Learn C++ from scratch, object-oriented concepts and logic building.', lessons: [Lesson('C++ foundations', 'Setup, variables, operators and control flow.'), Lesson('Functions and data', 'Functions, arrays, vectors and strings.'), Lesson('OOP', 'Classes, constructors, inheritance and polymorphism.'), Lesson('Project', 'Build a student or library management application.')]),
  Course(slug: 'mysql', title: 'MySQL Database', category: 'Database', duration: '4 Weeks',
    description: 'Learn database concepts and SQL queries used in real projects.', lessons: [Lesson('Database foundations', 'DBMS, RDBMS, tables and data types.'), Lesson('SQL operations', 'CREATE, INSERT, UPDATE, DELETE and SELECT.'), Lesson('Queries', 'Filtering, ordering and aggregate functions.'), Lesson('Relationships', 'Keys, joins and database design.'), Lesson('Project', 'Create a student registration database.')]),
  Course(slug: 'oops', title: 'Object-Oriented Programming', category: 'Programming Concepts', duration: '4 Weeks',
    description: 'Understand OOP concepts with practical examples.', lessons: [Lesson('Classes and objects', 'Model data and behaviour.'), Lesson('Core principles', 'Encapsulation, inheritance, polymorphism and abstraction.'), Lesson('Practice', 'Interview questions and an object-based program.')]),
  Course(slug: 'dsa', title: 'Data Structures and Algorithms', category: 'Computer Science', duration: '6 Weeks',
    description: 'Learn beginner data structures and problem-solving basics.', lessons: [Lesson('Complexity and arrays', 'Problem decomposition, arrays and strings.'), Lesson('Search and sort', 'Linear/binary search and elementary sorting.'), Lesson('Core structures', 'Stacks, queues and linked lists.'), Lesson('Problem practice', 'Beginner placement questions.')]),
  Course(slug: 'vibe-coding-ai', title: 'Vibe Coding with AI', category: 'AI-Assisted Learning', duration: '2 Weeks Add-on',
    description: 'Use AI as a coding assistant without blind copy-paste.', lessons: [Lesson('Prompting', 'Ask clearly for code and explanations.'), Lesson('Build and debug', 'Generate layouts, improve UI and diagnose errors.'), Lesson('Responsible use', 'Understand and verify generated code.')]),
  Course(slug: 'ai-tools-projects', title: 'AI Tools for Smart Projects', category: 'AI Tools', duration: '2 Weeks Add-on',
    description: 'Use AI for project ideas, UI planning, debugging and documentation.', lessons: [Lesson('Plan', 'Brainstorm projects and user experiences.'), Lesson('Build', 'Debug and document projects.'), Lesson('Present', 'Prepare project descriptions and interviews.')]),
];

