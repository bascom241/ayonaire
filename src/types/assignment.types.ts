
export interface AssignmentMaterialDataRequest {

  title: string 
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface AssignmentMaterialDataResponse {
 title: string
    url: string
    publicId: string
}

export interface CreateAssignmentRequest {
    course: string 
    title: string
    description: string
    module: string 
    materials: AssignmentMaterialDataRequest[]
}

export interface CreateAssignmentResponse {
    assignmentId : string
    course: string 
    assignmentTitle: string
    description: string
    module: string 
    materials: AssignmentMaterialDataResponse[]
}