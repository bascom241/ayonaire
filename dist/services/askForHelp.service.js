import askForHelpModel from "../models/askForHelp.model.js";
import userModel from "../models/user.model.js";
import { uploadMedia, deleteImage } from "../utils/uploadToCloudinary.js";
import { AppError } from "../errors/AppError.js";
import mongoose from "mongoose";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
import { getPagination } from "../utils/getPagination.js";
const getUserProfilePayload = (user) => user?.profile
    ? {
        url: user.profile.url,
        publicId: user.profile.publicId,
    }
    : null;
// userId/answers[].userId are populated refs, but the referenced User can be
// deleted after a question/answer was posted - every field pulled off a
// populated ref is guarded so one orphaned record can't take down the whole
// list response.
const toQuestionResponse = (q) => ({
    id: q._id.toString(),
    content: q.content,
    media: q.media
        ? {
            url: q.media.url,
            publicId: q.media.publicId,
        }
        : undefined,
    tags: q.tags ?? [],
    resolved: !!q.resolved,
    user: {
        id: q.userId?._id?.toString() ?? "",
        name: q.userId?.name ?? "Deleted user",
        profile: getUserProfilePayload(q.userId),
    },
    likes: (q.likes ?? []).map((id) => id.toString()),
    answers: (q.answers ?? []).map((a) => ({
        id: a._id?.toString(),
        user: {
            id: a.userId?._id?.toString() ?? "",
            name: a.userId?.name ?? "Deleted user",
        },
        text: a.text,
        createdAt: a.createdAt?.toISOString?.() ?? new Date().toISOString(),
    })),
    shares: q.shares ?? 0,
    createdAt: q.createdAt.toISOString(),
});
const getQuestionById = async (questionId) => {
    const question = await askForHelpModel
        .findById(questionId)
        .populate("userId", "name profile")
        .populate("answers.userId", "name");
    return question ? toQuestionResponse(question) : null;
};
export const createQuestion = async (data, userId) => {
    const user = await userModel.findById(userId);
    if (!user) {
        throw new AppError("user does not exist", 400);
    }
    validateRequestBodyWithValues(data, [
        "content",
    ]);
    let uploadResult;
    if (data.media) {
        try {
            uploadResult = await uploadMedia(data.media.buffer, "image");
        }
        catch (err) {
            throw new AppError("Failed to upload file to cloudinary", 400);
        }
    }
    const questionData = {
        userId: new mongoose.Types.ObjectId(userId),
        content: data.content.trim(),
        tags: data.tags ?? [],
    };
    if (uploadResult) {
        questionData.media = {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
        };
    }
    const created = await askForHelpModel.create(questionData);
    const newQuestion = await getQuestionById(created._id.toString());
    if (!newQuestion) {
        throw new AppError("Failed to retrieve created question", 500);
    }
    return newQuestion;
};
export const editQuestion = async (data, userId) => {
    validateRequestBodyWithValues(data, [
        "questionId",
    ]);
    const { questionId, content, tags, media } = data;
    const question = await askForHelpModel.findOne({
        _id: questionId,
        userId,
    });
    if (!question) {
        throw new AppError("question not found / not yours", 400);
    }
    if (media) {
        if (question.media?.publicId) {
            await deleteImage(question.media.publicId);
        }
        const uploaded = await uploadMedia(media.buffer, "image");
        question.media = {
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
        };
    }
    if (content !== undefined)
        question.content = content;
    if (tags !== undefined)
        question.tags = tags;
    await question.save();
    const updated = await getQuestionById(question._id.toString());
    if (!updated) {
        throw new AppError("Failed to retrieve updated question", 500);
    }
    return updated;
};
export const deleteQuestion = async (data, userId) => {
    validateRequestBodyWithValues(data, [
        "questionId",
    ]);
    const question = await askForHelpModel.findOne({
        _id: data.questionId,
        userId,
    });
    if (!question) {
        throw new AppError("question not found / not yours", 400);
    }
    if (question.media?.publicId) {
        await deleteImage(question.media.publicId);
    }
    await askForHelpModel.findByIdAndDelete(data.questionId);
    return "Question deleted successfully";
};
export const viewQuestions = async (query = {}) => {
    const { limit, skip } = getPagination({
        page: query.page,
        limit: query.limit || 20,
    });
    const filter = {};
    if (query.resolved !== undefined) {
        filter.resolved = query.resolved;
    }
    const questions = await askForHelpModel
        .find(filter)
        .populate("userId", "name profile")
        .populate("answers.userId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    return questions.map(toQuestionResponse);
};
export const likeQuestion = async (data, userId) => {
    validateRequestBodyWithValues(data, [
        "questionId",
    ]);
    const { questionId } = data;
    const convertedUserId = new mongoose.Types.ObjectId(userId);
    const question = await askForHelpModel.findById(questionId);
    if (!question) {
        throw new AppError("question does not exist", 400);
    }
    const hasLiked = question.likes.some((id) => id.equals(convertedUserId));
    if (hasLiked) {
        await askForHelpModel.updateOne({ _id: questionId }, { $pull: { likes: convertedUserId } });
    }
    else {
        await askForHelpModel.updateOne({ _id: questionId }, { $addToSet: { likes: convertedUserId } });
    }
    const updated = await getQuestionById(question._id.toString());
    if (!updated) {
        throw new AppError("question does not exist", 400);
    }
    return updated;
};
export const answerQuestion = async (data, userId) => {
    validateRequestBodyWithValues(data, [
        "questionId",
        "text",
    ]);
    const { questionId, text } = data;
    const question = await askForHelpModel.findById(questionId);
    if (!question) {
        throw new AppError("question does not exist", 400);
    }
    question.answers.push({
        userId: new mongoose.Types.ObjectId(userId),
        text,
        createdAt: new Date(),
    });
    await question.save();
    const updated = await getQuestionById(question._id.toString());
    if (!updated) {
        throw new AppError("question does not exist", 400);
    }
    return updated;
};
export const deleteAnswer = async (data, userId) => {
    validateRequestBodyWithValues(data, [
        "questionId",
        "answerId",
    ]);
    const { questionId, answerId } = data;
    const question = await askForHelpModel.findOne({
        _id: questionId,
        "answers._id": answerId,
        "answers.userId": userId,
    });
    if (!question) {
        throw new AppError("answer not found / not yours", 400);
    }
    await askForHelpModel.updateOne({ _id: questionId }, { $pull: { answers: { _id: answerId } } });
    return "Answer deleted successfully";
};
export const shareQuestion = async (data) => {
    validateRequestBodyWithValues(data, [
        "questionId",
    ]);
    const { questionId } = data;
    const shared = await askForHelpModel.findByIdAndUpdate(questionId, { $inc: { shares: 1 } }, { new: true });
    if (!shared) {
        throw new AppError("question does not exist", 400);
    }
    return {
        questionId: shared._id.toString(),
        shares: shared.shares,
    };
};
export const resolveQuestion = async (data, userId) => {
    validateRequestBodyWithValues(data, [
        "questionId",
    ]);
    const { questionId, resolved } = data;
    const question = await askForHelpModel.findOne({
        _id: questionId,
        userId,
    });
    if (!question) {
        throw new AppError("question not found / not yours", 400);
    }
    question.resolved = !!resolved;
    await question.save();
    const updated = await getQuestionById(question._id.toString());
    if (!updated) {
        throw new AppError("Failed to retrieve updated question", 500);
    }
    return updated;
};
