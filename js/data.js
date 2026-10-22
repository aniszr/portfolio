/* =============================================================================
   PORTFOLIO DATA  —  single source of truth
   -----------------------------------------------------------------------------
   This is the "JSON data in the JS part" the whole site reads from.
   To ADD / UPDATE / REMOVE content later, edit the object below ONLY.
   No HTML or CSS edits are needed — the renderer (js/render.js) injects it all.
   Keep the shape (keys) intact so the renderer keeps working.
============================================================================= */

const PORTFOLIO_DATA = {
  /* --- Identity / Hero -------------------------------------------------- */
  profile: {
    name: "Anis Zouari",
    firstName: "Anis",
    role: "QA Engineer",
    title: "QA Engineer — Functional & Automated Testing",
    tagline:
      "Functional & automation testing specialist with Robot Framework. ISTQB® Certified Tester turning requirements into reliable, user-focused software.",
    location: "La Médina, Sfax, Tunisia",
    availability: "Open to opportunities",
    initials: "AZ",
    resumeUrl: "Profile.pdf"
  },

  /* --- Quick stats (animated counters) ---------------------------------- */
  stats: [
    { label: "Years in QA", value: 3, suffix: "+" },
    { label: "Years of career experience", value: 14, suffix: "+" },
    { label: "ISTQB Certified", value: 1, suffix: "" },
    { label: "Automation framework", value: 1, suffix: "" }
  ],

  /* --- About ------------------------------------------------------------ */
  about: {
    headline: "Quality is not an afterthought — it's built in.",
    paragraphs: [
      "I'm a QA Engineer based in Sfax, Tunisia, specialized in functional and automated testing. I design and execute test plans, build automation suites with Robot Framework (SeleniumLibrary for the front-end, Postman for APIs), and track defects rigorously through Jira and Redmine.",
      "I validate conformity to business and technical requirements with a constant focus on the user experience, and I work closely with developers inside Agile ceremonies — dailies, sprint reviews and planning — to ship with confidence.",
      "Before software, I spent over a decade leading production and technical studies in the manufacturing industry, which gave me a rigorous, process-driven mindset I now bring to quality engineering."
    ],
    highlights: [
      "Functional, regression & UAT testing",
      "Test automation with Robot Framework",
      "API testing with Postman",
      "Defect tracking (Jira / Redmine)",
      "Agile / Scrum collaboration"
    ]
  },

  /* --- Skills (grouped) ------------------------------------------------- */
  skills: [
    {
      category: "Testing & QA",
      items: [
        { name: "Functional Testing", level: 95 },
        { name: "Test Automation", level: 88 },
        { name: "Regression & UAT", level: 90 },
        { name: "API Testing (Postman)", level: 82 }
      ]
    },
    {
      category: "Automation & Tools",
      items: [
        { name: "Robot Framework", level: 88 },
        { name: "SeleniumLibrary", level: 80 },
        { name: "Jira / Redmine", level: 85 },
        { name: "Agile / Scrum", level: 85 }
      ]
    },
    {
      category: "Development",
      items: [
        { name: "HTML", level: 80 },
        { name: "CSS", level: 78 },
        { name: "VBA", level: 70 },
        { name: "Odoo (Functional)", level: 72 }
      ]
    }
  ],

  /* --- Experience (timeline) -------------------------------------------- */
  experience: [
    {
      company: "DarbTech",
      role: "QA Engineer",
      period: "Jan 2026 — Present",
      location: "Tunisia",
      current: true,
      description:
        "Quality engineering across functional and automated testing, ensuring product reliability and conformity to requirements.",
      tags: ["QA", "Automation", "Agile"]
    },
    {
      company: "SiFAST",
      role: "Functional Tester / QA Analyst",
      period: "May 2023 — Dec 2025",
      location: "Tunisia",
      current: false,
      description:
        "Wrote test plans and cases; executed manual and automated tests (functional, regression, UAT). Built automation scripts with Robot Framework using SeleniumLibrary for the front-end and Postman for APIs. Tracked defects rigorously (Jira/Redmine) and collaborated proactively with developers. Validated conformity to business and technical requirements with a constant focus on UX. Active in Agile ceremonies: dailies, sprint reviews and planning.",
      tags: ["Robot Framework", "Selenium", "Postman", "Jira", "Redmine", "UAT"]
    },
    {
      company: "SEGULA Technologies",
      role: "Electronic Engineer — ADAS",
      period: "Dec 2022 — Feb 2023",
      location: "Sfax, Tunisia",
      current: false,
      description:
        "Responsible for ADAS functions on chassis components for automobiles (Project P512). Tested feature specifications against technical requirement documents, followed the project lifecycle and coordinated between client and supplier.",
      tags: ["ADAS", "Specifications", "Automotive"]
    },
    {
      company: "LE PARIS MODE",
      role: "Production Manager",
      period: "Aug 2012 — Jul 2021",
      location: "Sfax, Tunisia",
      current: false,
      description:
        "Led the study office and production management. Prepared production plans, tracked ongoing orders, read technical sheets of accepted contracts and prepared technical sheets for tenders. Managed automated cutting and tracing tools, teams and production flow.",
      tags: ["Production", "Technical Studies", "Team Management"]
    }
  ],

  /* --- Education -------------------------------------------------------- */
  education: [
    {
      school: "ESPS — Sfax, Tunisia",
      degree: "Software Engineering (Génie Logiciel)",
      field: "Computer Engineering",
      period: "Jan 2022 — Aug 2022"
    },
    {
      school: "ESPS — Sfax, Tunisia",
      degree: "Certificate in Software Testing",
      field: "Information Technology",
      period: "Jul 2022 — Sep 2022"
    },
    {
      school: "Institut Supérieur d'Informatique et Multimédia — Sfax",
      degree: "Master's in Business Computing & E-commerce",
      field: "IT Administration & Management",
      period: "Sep 2006 — Jun 2010"
    }
  ],

  /* --- Certifications --------------------------------------------------- */
  certifications: [
    {
      name: "ISTQB® Certified Tester — Foundation Level",
      issuer: "GASQ",
      year: "2022"
    },
    {
      name: "Odoo 19 Functional Certification",
      issuer: "Odoo",
      year: "2026"
    }
  ],

  /* --- Contact / Social ------------------------------------------------- */
  contact: {
    email: "zouarii.anis@gmail.com",
    phone: "21170120",
    location: "Sfax, Tunisia",
    socials: [
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/anis-zr",
        handle: "anis-zr"
      },
      {
        label: "Email",
        url: "mailto:zouarii.anis@gmail.com",
        handle: "zouarii.anis@gmail.com"
      }
    ]
  }
};

/* Expose for the renderer (and for easy console inspection). */
if (typeof window !== "undefined") {
  window.PORTFOLIO_DATA = PORTFOLIO_DATA;
}
