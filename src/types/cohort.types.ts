export interface CreateCohortRequest {
  name: string;
  description?: string;
  creator?: string;
  isActive?: boolean;
  course: string;
}

export interface CreateCohortResponse {
  name: string;
  description?: string;
  creator?: string;
  isActive?: boolean;
  course?: string;
  students: string[];
}


export interface AssignStudentRequest {
    userId:string
    cohortId: string
}


export interface AssignInstructorRequest {
    instructorId: string 
    cohortId: string
}