import { createQuestion, editQuestion, deleteQuestion, viewQuestions, likeQuestion, answerQuestion, deleteAnswer, shareQuestion, resolveQuestion, } from "../services/askForHelp.service.js";
const parseTags = (tags) => {
    if (Array.isArray(tags))
        return tags.map(String);
    if (typeof tags === "string" && tags.trim()) {
        try {
            const parsed = JSON.parse(tags);
            if (Array.isArray(parsed))
                return parsed.map(String);
        }
        catch {
            return tags.split(",").map((t) => t.trim()).filter(Boolean);
        }
    }
    return undefined;
};
export const create = async (req, res, next) => {
    try {
        const dataToSend = {
            content: req.body.content,
            tags: parseTags(req.body.tags),
            media: req.file,
        };
        const data = await createQuestion(dataToSend, req.user?.id);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const edit = async (req, res, next) => {
    try {
        const dataToSend = {
            questionId: req.body.questionId,
            content: req.body.content,
            tags: parseTags(req.body.tags),
            media: req.file,
        };
        const data = await editQuestion(dataToSend, req.user?.id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const deleteQ = async (req, res, next) => {
    try {
        const dataToSend = {
            questionId: req.body.questionId,
        };
        const data = await deleteQuestion(dataToSend, req.user?.id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const view = async (req, res, next) => {
    try {
        const { resolved, page, limit } = req.query;
        const data = await viewQuestions({
            resolved: resolved === undefined ? undefined : resolved === "true",
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const like = async (req, res, next) => {
    try {
        const dataToSend = {
            questionId: req.body.questionId,
        };
        const data = await likeQuestion(dataToSend, req.user?.id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const answer = async (req, res, next) => {
    try {
        const dataToSend = {
            questionId: req.body.questionId,
            text: req.body.text,
        };
        const data = await answerQuestion(dataToSend, req.user?.id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const deleteAns = async (req, res, next) => {
    try {
        const dataToSend = {
            questionId: req.body.questionId,
            answerId: req.body.answerId,
        };
        const data = await deleteAnswer(dataToSend, req.user?.id);
        res.status(200).json({ success: true, message: data });
    }
    catch (error) {
        next(error);
    }
};
export const share = async (req, res, next) => {
    try {
        const dataToSend = {
            questionId: req.body.questionId,
        };
        const data = await shareQuestion(dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const resolve = async (req, res, next) => {
    try {
        const dataToSend = {
            questionId: req.body.questionId,
            resolved: req.body.resolved,
        };
        const data = await resolveQuestion(dataToSend, req.user?.id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
