import mongoose from "mongoose";
import CareerProfile from "../models/careerProfile.model.js";
import { callAI } from "../utils/aiClient.js";
const sampleMarketplace = [
    {
        id: "mp-001",
        title: "Junior Product Designer",
        company: "Ayonaire Labs",
        location: "Remote",
        remote: true,
        salaryRange: "$40k - $55k",
        skills: ["Figma", "UX Research", "Prototyping"],
        summary: "An entry-level design role for graduates who want to build product experiences for education platforms.",
        postedAt: "2026-06-30",
    },
    {
        id: "mp-002",
        title: "Growth Marketing Associate",
        company: "SkillSpark",
        location: "Lagos, Nigeria",
        remote: false,
        salaryRange: "$35k - $50k",
        skills: ["SEO", "Content Marketing", "Analytics"],
        summary: "Help grow a student learning marketplace with content, campaigns, and audience optimization.",
        postedAt: "2026-07-01",
    },
    {
        id: "mp-003",
        title: "Freelance Web Developer",
        company: "Remote Collective",
        location: "Remote",
        remote: true,
        salaryRange: "$25/hr - $40/hr",
        skills: ["React", "Next.js", "Node.js"],
        summary: "Build and maintain web applications for learning communities and portfolio sites.",
        postedAt: "2026-07-02",
    },
];
const sampleJobs = [
    {
        id: "job-001",
        title: "Junior Frontend Developer",
        company: "BrightPath",
        location: "Remote",
        remote: true,
        salaryRange: "$30k - $42k",
        skills: ["HTML", "CSS", "JavaScript", "React"],
        summary: "Work on learning dashboard interfaces, build responsive pages, and help improve user retention.",
        postedAt: "2026-07-01",
    },
    {
        id: "job-002",
        title: "Entry-level Data Analyst",
        company: "EduMetric",
        location: "Nairobi, Kenya",
        remote: false,
        salaryRange: "$28k - $38k",
        skills: ["SQL", "Excel", "Power BI", "Data storytelling"],
        summary: "Translate student learning data into actionable insights to help improve course performance.",
        postedAt: "2026-07-02",
    },
    {
        id: "job-003",
        title: "Instructional Design Assistant",
        company: "LearnWave",
        location: "Remote",
        remote: true,
        salaryRange: "$32k - $45k",
        skills: ["Curriculum Development", "Content Strategy", "LMS"],
        summary: "Support course creation, write learner-focused content, and help structure assessment journeys.",
        postedAt: "2026-07-03",
    },
];
const normalizeSkills = (skills) => Array.from(new Set((skills || []).map((skill) => skill.trim()).filter(Boolean)));
export const generateAiResume = async (data) => {
    const prompt = `Write a professional resume summary and role-focused bullet points for ${data.name} targeting ${data.targetRole}. Include experience, education, skills, achievements, and a compelling profile summary. Use these details:

Experience: ${data.experience || "N/A"}
Education: ${data.education || "N/A"}
Skills: ${data.skills?.join(", ") || "N/A"}
Accomplishments: ${data.accomplishments || "N/A"}
Additional context: ${data.additionalContext || "N/A"}`;
    const generatedText = await callAI("AI Resume Generator", prompt);
    return { generatedText };
};
export const generateCoverLetter = async (data) => {
    const prompt = `Write a personalized cover letter for ${data.name} applying to ${data.company} for a ${data.targetRole} role${data.recipientName ? ` addressed to ${data.recipientName}` : ""}. Use the applicant's experience, skills, education, accomplishments, and motivation.

Experience: ${data.experience || "N/A"}
Education: ${data.education || "N/A"}
Skills: ${data.skills?.join(", ") || "N/A"}
Accomplishments: ${data.accomplishments || "N/A"}
Additional context: ${data.additionalContext || "N/A"}`;
    const generatedText = await callAI("Cover Letter Generator", prompt);
    return { generatedText };
};
export const searchAyonaireJobs = async (query) => {
    if (!query || (!query.keywords && !query.location && !query.skills && !query.role)) {
        return sampleJobs;
    }
    const keywords = `${query.keywords || ""} ${query.skills || ""} ${query.role || ""}`.toLowerCase();
    return sampleJobs.filter((job) => {
        return [job.title, job.company, job.location, job.summary, job.skills.join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(keywords);
    });
};
export const importLinkedInProfile = async (data) => {
    const prompt = data.profileText
        ? `Extract the most important career summary, skills, experience highlights, and recommended resume bullets from this LinkedIn profile text:

${data.profileText}`
        : `Read the LinkedIn profile at ${data.profileUrl} and extract a professional career summary, skill list, and experience bullets. Provide the output in plain text.`;
    const importedProfile = await callAI("LinkedIn Import", prompt);
    return { importedProfile };
};
export const generatePortfolio = async (data) => {
    const prompt = `Create an AI portfolio summary and project showcase for ${data.name}, a ${data.headline}. Target role: ${data.targetRole || "N/A"} in ${data.industry || "a relevant industry"}.

Summary: ${data.summary || "N/A"}
Skills: ${data.skills?.join(", ") || "N/A"}
Projects: ${data.projects?.join(", ") || "N/A"}
Portfolio links: ${data.portfolioLinks?.join(", ") || "N/A"}`;
    const generatedText = await callAI("Portfolio Builder", prompt);
    const projectSuggestions = data.projects || ["Project showcase for a capstone, a mentor collaboration, and a real-world case study"];
    return { generatedText, projectSuggestions };
};
export const buildResume = async (data) => {
    const prompt = `Create a complete resume builder output for ${data.name}. Include contact information, a role summary, skills section, experience highlights, education entries, and suggested projects.

Title: ${data.title || data.targetRole || "Career Accelerator Student"}
Summary: ${data.summary || "N/A"}
Skills: ${data.skills?.join(", ") || "N/A"}
Experience: ${data.experience || "N/A"}
Education: ${data.education || "N/A"}
Projects: ${data.projects?.join(", ") || "N/A"}
Additional context: ${data.additionalContext || "N/A"}`;
    const generatedText = await callAI("AI Resume Builder", prompt);
    const resumeDraft = {
        contact: {
            name: data.name,
            title: data.title || data.targetRole || "Student / Emerging Professional",
        },
        summary: data.summary ||
            "A motivated student focused on practical experience, career growth, and delivering impact through project work.",
        skills: normalizeSkills(data.skills),
        experience: [
            {
                role: data.targetRole || "Professional Aspirant",
                company: "Sample Organization",
                dates: "2025 - Present",
                description: "Collaborated with peers to deliver learning solutions, build technical projects, and support team goals.",
            },
        ],
        education: [
            {
                school: "Your School or Bootcamp",
                degree: data.education || "Relevant coursework and capstone projects",
                dates: "2023 - 2026",
                details: "Studied modern technologies, digital product development, and career-ready project delivery.",
            },
        ],
        projects: (data.projects || ["Capstone project", "Personal portfolio site"]).map((project) => ({
            name: project,
            description: `Designed and delivered ${project} with a strong focus on outcomes and practical learning.`,
        })),
    };
    return { generatedText, resumeDraft };
};
export const analyzeSkillGap = async (data) => {
    const prompt = `Analyze the skill gap for someone targeting ${data.targetRole}. Current skills: ${data.currentSkills.join(", ")}.
Experience level: ${data.experienceLevel || "Student / Beginner"}.
Learning focus: ${data.learningFocus || "N/A"}.
Provide a skill gap summary, missing skills, recommended resources, and a suggested timeline.`;
    const generatedText = await callAI("Skill Gap Analysis", prompt);
    const recommendedResources = [
        "Online project-based bootcamp course",
        "Role-specific certification pathway",
        "Mentored portfolio project",
    ];
    const missingSkills = data.currentSkills.length
        ? ["Communication", "Domain knowledge", "Problem solving"].filter((skill) => !data.currentSkills.includes(skill))
        : ["Core technical skills", "Problem solving", "Communication"];
    return {
        gapSummary: generatedText,
        missingSkills,
        recommendedResources,
        suggestedTimeline: "3-6 months with consistent learning, hands-on projects, and mentorship.",
    };
};
export const getTalentMarketplace = async (query) => {
    if (!query || (!query.keywords && !query.location && !query.skills && !query.role)) {
        return sampleMarketplace;
    }
    const filterText = `${query.keywords || ""} ${query.skills || ""} ${query.role || ""} ${query.location || ""}`.toLowerCase();
    return sampleMarketplace.filter((item) => {
        return [item.title, item.company, item.location, item.summary, item.skills.join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(filterText);
    });
};
export const saveFreelanceProfile = async (userId, data) => {
    const profile = await CareerProfile.create({
        user: new mongoose.Types.ObjectId(userId),
        headline: data.headline,
        summary: data.summary,
        skills: normalizeSkills(data.skills),
        portfolioLinks: data.portfolioLinks || [],
        hourlyRate: data.hourlyRate,
        availability: data.availability || "Available",
        services: data.services || [],
        expertiseAreas: normalizeSkills(data.expertiseAreas),
    });
    return profile.toObject();
};
export const generateCareerRoadmap = async (data) => {
    const prompt = `Create a clear career roadmap for ${data.name} targeting ${data.targetRole}.

Current experience: ${data.currentExperience || "N/A"}
Timeline: ${data.timeline || "6 months"}
Skills: ${data.skills?.join(", ") || "N/A"}
Learning preferences: ${data.learningPreferences || "N/A"}`;
    const overview = await callAI("Career Roadmap Generator", prompt);
    return {
        overview,
        milestones: [
            "Define your target role and update your resume.",
            "Complete three applied projects and publish a portfolio.",
            "Practice interview questions and refine your pitch.",
            "Apply to targeted companies and freelance opportunities.",
        ],
        skillsToLearn: normalizeSkills(data.skills).length
            ? normalizeSkills(data.skills)
            : ["Role-specific tools", "Communication", "Portfolio storytelling"],
        recommendedResources: [
            "Structured online course",
            "Mentored capstone project",
            "Mock interview coaching",
        ],
        timeline: data.timeline || "6 months with weekly goals, milestone reviews, and regular practice.",
    };
};
export const generateAIInterview = async (data) => {
    const prompt = `Create a list of interview practice questions and suggested answers for a ${data.targetRole} at ${data.experienceLevel || "early career"} level. Focus on ${data.focusAreas?.join(", ") || "core strengths and problem solving"}.`;
    const generatedText = await callAI("AI Interview", prompt);
    return {
        introduction: generatedText,
        questions: [
            `Tell me about yourself and why you're a great fit for ${data.targetRole}.`,
            "Describe a challenge you solved during a project.",
            "What tools and techniques do you use to stay organized?",
        ],
        suggestedAnswers: [
            `A strong answer should connect your background to the expectations of a ${data.targetRole}.`,
            "Share a concrete example of your process and outcome.",
            "Show that you can balance time, communication, and delivery.",
        ],
        tips: [
            "Practice with a timer and review your stories.",
            "Keep answers concise, structured, and examples-focused.",
            "Use the STAR method for behavioral questions.",
        ],
    };
};
export const generateCompanyInterview = async (data) => {
    const prompt = `Create company-specific interview questions and preparation tips for ${data.role} at ${data.companyName}.

Experience level: ${data.experienceLevel || "early career"}
Focus areas: ${data.focusAreas?.join(", ") || "company fit and role skills"}`;
    const generatedText = await callAI("Company Interview", prompt);
    return {
        introduction: generatedText,
        questions: [
            `Why are you interested in ${data.companyName} as a ${data.role}?`,
            "How would you solve a real problem for the company's learners?",
            "Tell me about a time you worked with a teammate to complete a tough task.",
        ],
        suggestedAnswers: [
            "Connect your values and past work to the company's mission.",
            "Describe a clear process for breaking down the challenge.",
            "Highlight collaboration, learning, and results.",
        ],
        tips: [
            "Review the company's mission and product strategy.",
            "Prepare short stories showing ownership and growth.",
            "Ask thoughtful questions about team culture and success metrics.",
        ],
    };
};
