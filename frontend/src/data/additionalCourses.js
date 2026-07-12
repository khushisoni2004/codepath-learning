export const additionalCourses = [
  {
    _id: "local-oops-course",
    slug: "oops",
    title: "Object-Oriented Programming",
    category: "Computer Science",
    level: "Beginner to Intermediate",
    icon: "OOP",
    lessonCount: 15,
    description:
      "Learn classes, objects, inheritance, polymorphism, abstraction, encapsulation and practical object-oriented software design.",
    syllabus: [
      {
        title: "Introduction to OOP",
        description:
          "Understand procedural programming and object-oriented programming."
      },
      {
        title: "Classes and Objects",
        description:
          "Create classes, objects, properties and methods."
      },
      {
        title: "Constructors",
        description:
          "Learn default, parameterized and copy constructors."
      },
      {
        title: "Encapsulation",
        description:
          "Use access modifiers, getters, setters and data hiding."
      },
      {
        title: "Inheritance",
        description:
          "Learn single, multilevel, multiple and hierarchical inheritance."
      },
      {
        title: "Polymorphism",
        description:
          "Understand method overloading and method overriding."
      },
      {
        title: "Abstraction",
        description:
          "Work with abstract classes and interfaces."
      },
      {
        title: "Access Modifiers",
        description:
          "Understand public, private and protected members."
      },
      {
        title: "Static Members",
        description:
          "Use static variables and static methods."
      },
      {
        title: "Association",
        description:
          "Understand association, aggregation and composition."
      },
      {
        title: "Exception Handling",
        description:
          "Handle program errors using try, catch and finally."
      },
      {
        title: "OOP Design Principles",
        description:
          "Understand reusable and maintainable object-oriented design."
      },
      {
        title: "OOP Practical Project",
        description:
          "Build a practical project using classes and objects."
      }
    ]
  },

  {
    _id: "local-dsa-course",
    slug: "data-structures-algorithms",
    aliases: ["dsa"],
    title: "Data Structures & Algorithms",
    category: "Computer Science",
    level: "Beginner to Intermediate",
    icon: "DSA",
    lessonCount: 20,
    description:
      "Learn important data structures, algorithms, complexity analysis and coding problem-solving techniques.",
    syllabus: [
      {
        title: "Introduction to DSA",
        description:
          "Understand data structures, algorithms and problem solving."
      },
      {
        title: "Time and Space Complexity",
        description:
          "Learn Big O notation and algorithm complexity analysis."
      },
      {
        title: "Arrays",
        description:
          "Learn traversal, insertion, deletion and array problems."
      },
      {
        title: "Strings",
        description:
          "Solve string manipulation and pattern-based problems."
      },
      {
        title: "Recursion",
        description:
          "Understand recursive calls, base cases and call stack."
      },
      {
        title: "Searching",
        description:
          "Learn linear search and binary search."
      },
      {
        title: "Sorting",
        description:
          "Learn bubble, selection, insertion, merge and quick sort."
      },
      {
        title: "Linked Lists",
        description:
          "Learn singly, doubly and circular linked lists."
      },
      {
        title: "Stacks",
        description:
          "Understand stack operations and practical applications."
      },
      {
        title: "Queues",
        description:
          "Learn simple queue, circular queue and priority queue."
      },
      {
        title: "Hashing",
        description:
          "Use hash maps and sets for efficient problem solving."
      },
      {
        title: "Trees",
        description:
          "Learn binary trees and tree traversals."
      },
      {
        title: "Binary Search Trees",
        description:
          "Perform insertion, searching and deletion in BST."
      },
      {
        title: "Heaps",
        description:
          "Understand min heap, max heap and priority queue."
      },
      {
        title: "Graphs",
        description:
          "Learn graph representation, BFS and DFS."
      },
      {
        title: "Greedy Algorithms",
        description:
          "Solve optimization problems using greedy techniques."
      },
      {
        title: "Dynamic Programming",
        description:
          "Learn memoization and tabulation."
      },
      {
        title: "Backtracking",
        description:
          "Solve maze, permutation and N-Queens problems."
      },
      {
        title: "Sliding Window",
        description:
          "Solve array and string problems efficiently."
      },
      {
        title: "DSA Practice Project",
        description:
          "Apply data structures and algorithms in practical problems."
      }
    ]
  }
];

export function findAdditionalCourse(slug = "") {
  const currentSlug = slug.toLowerCase();

  return additionalCourses.find((course) => {
    const slugMatches = course.slug.toLowerCase() === currentSlug;

    const aliasMatches =
      Array.isArray(course.aliases) &&
      course.aliases.some(
        (alias) => alias.toLowerCase() === currentSlug
      );

    return slugMatches || aliasMatches;
  });
}

export function mergeAdditionalCourses(apiCourses = []) {
  const existingSlugs = new Set(
    apiCourses.map((course) =>
      course.slug?.toLowerCase()
    )
  );

  return [
    ...apiCourses,
    ...additionalCourses.filter(
      (course) =>
        !existingSlugs.has(course.slug.toLowerCase())
    )
  ];
}
