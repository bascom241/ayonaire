import { Types } from "mongoose";

export interface CareerResumeRequest {
  name: string;
  targetRole: string;
  experience?: string;
  education?: string;
  skills?: string[];
  accomplishments?: string;
  summary?: string;
  additionalContext?: string;
}

export interface CareerCoverLetterRequest {
  name: string;
  targetRole: string;
  company: string;
  recipientName?: string;
  experience?: string;
  education?: string;
  skills?: string[];
  accomplishments?: string;
  additionalContext?: string;
}

export interface LinkedinImportRequest {
  profileUrl?: string;
  profileText?: string;
}

export interface CareerPortfolioRequest {
  name: string;
  headline: string;
  summary?: string;
  skills?: string[];
  projects?: string[];
  targetRole?: string;
  industry?: string;
  portfolioLinks?: string[];
}

export interface CareerResumeBuilderRequest {
  name: string;
  title?: string;
  summary?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  projects?: string[];
  targetRole?: string;
  additionalContext?: string;
}

export interface CareerSkillGapRequest {
  targetRole: string;
  currentSkills: string[];
  experienceLevel?: string;
  learningFocus?: string;
}

export interface TalentMarketplaceQuery {
  keywords?: string;
  location?: string;
  skills?: string;
  role?: string;
}

export interface FreelanceProfileRequest {
  headline: string;
  summary: string;
  skills: string[];
  portfolioLinks?: string[];
  hourlyRate?: string;
  availability?: string;
  services?: string[];
  expertiseAreas?: string[];
}

export interface CareerRoadmapRequest {
  name: string;
  currentExperience?: string;
  targetRole: string;
  timeline?: string;
  skills?: string[];
  learningPreferences?: string;
}

export interface CareerInterviewRequest {
  targetRole: string;
  experienceLevel?: string;
  focusAreas?: string[];
}

export interface CompanyInterviewRequest {
  companyName: string;
  role: string;
  experienceLevel?: string;
  focusAreas?: string[];
}

export interface AIResponse {
  generatedText: string;
}

export interface CareerResumeBuilderResponse {
  generatedText: string;
  resumeDraft: {
    contact: {
      name: string;
      title: string;
    };
    summary: string;
    skills: string[];
    experience: Array<{ role: string; company: string; dates: string; description: string }>;
    education: Array<{ school: string; degree: string; dates: string; details: string }>;
    projects: Array<{ name: string; description: string; url?: string }>;
  };
}

export interface SkillGapResult {
  gapSummary: string;
  missingSkills: string[];
  recommendedResources: string[];
  suggestedTimeline: string;
}

export interface TalentMarketplaceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salaryRange: string;
  skills: string[];
  summary: string;
  postedAt: string;
}

export interface CareerProfile {
  _id?: string;
  user: Types.ObjectId | string;
  headline: string;
  summary: string;
  skills: string[];
  portfolioLinks: string[];
  hourlyRate?: string;
  availability: string;
  services: string[];
  expertiseAreas: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CareerRoadmapResult {
  overview: string;
  milestones: string[];
  skillsToLearn: string[];
  recommendedResources: string[];
  timeline: string;
}

export interface InterviewPracticeResult {
  introduction: string;
  questions: string[];
  suggestedAnswers: string[];
  tips: string[];
}

export interface LinkedInImportResult {
  importedProfile: string;
}

export interface PortfolioResult {
  generatedText: string;
  projectSuggestions: string[];
}
