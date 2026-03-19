import { AppError } from "../errors/AppError.js";
import assignmentModel from "../models/assignment.model.js";
import courseModel from "../models/course.model.js";
import instructorProfileModel from "../models/instructorProfile.model.js";
import moduleModel from "../models/module.model.js";
import { AssignmentMaterialDataResponse, CreateAssignmentRequest, CreateAssignmentResponse } from "../types/assignment.types.js";
import { uploadFile } from "../utils/uploadToCloudinary.js";
export const createAssignmentForAModule = async (
  userId: string,
  data: CreateAssignmentRequest
): Promise<CreateAssignmentResponse> => {

  const instructor = await instructorProfileModel.findOne({
    instructorId: userId,
  });

  if (!instructor) {
    throw new AppError("Instructor profile not found", 400);
  }

  const courseToUpdate = await courseModel.findOne({
    _id: data.course,
    instructor: userId,
  });

  if (!courseToUpdate) {
    throw new AppError("Course for this instructor not found", 404);
  }


  const moduleExistsInCourse = courseToUpdate.modules
    .map((id) => id.toString())
    .includes(data.module);

  if (!moduleExistsInCourse) {
    throw new AppError("Module does not belong to this course", 400);
  }

  // ✅ Check if assignment already exists for module
  const isModuleExistForAssignment = await assignmentModel.findOne({
    module: data.module,
  });

  if (isModuleExistForAssignment) {
    throw new AppError(
      "Assignment already exists for this module",
      400
    );
  }

  // ✅ Upload materials
  let uploadedMaterials: {
    title: string;
    url: string;
    publicId: string;
  }[] = [];

  for (const material of data.materials) {
    const result = await uploadFile(material.buffer, "raw");

    uploadedMaterials.push({
      title: material.title,
      url: result.secure_url,
      publicId: result.public_id,
    });
  }

  
  const newAssignment = await assignmentModel.create({
    instructor: userId,
    course: data.course,
    title: data.title,
    description: data.description,
    module: data.module,
    materials: uploadedMaterials,
  });

  
  await moduleModel.findByIdAndUpdate(
    data.module,
    { assignment: newAssignment._id },
    { new: true }
  );


  return {
    assignmentId: newAssignment._id.toString(),
    assignmentTitle: newAssignment.title,
    module: newAssignment.module?.toString(),
    course: newAssignment.course.toString(),
    description: newAssignment.description,
   materials: newAssignment.materials.map((material) => ({
    title: material.title ?? "",
    url: material.url ?? "",
    publicId: material.publicId ?? "",
  })),
  };
};