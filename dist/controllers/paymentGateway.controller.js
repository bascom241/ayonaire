import { AppError } from "../errors/AppError.js";
import { listGateways, connectGateway, updateGateway, disconnectGateway, setPrimaryGateway, listPricingPlans, createPricingPlan, updatePricingPlan, deletePricingPlan, } from "../services/paymentGateway.service.js";
export const getGateways = async (req, res, next) => {
    try {
        const data = await listGateways();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const connect = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const data = await connectGateway(userId, req.body);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const update = async (req, res, next) => {
    try {
        const name = req.params.name;
        const data = await updateGateway(name, req.body);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const disconnect = async (req, res, next) => {
    try {
        const name = req.params.name;
        const data = await disconnectGateway(name);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const setPrimary = async (req, res, next) => {
    try {
        const name = req.params.name;
        const data = await setPrimaryGateway(name);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const getPricingPlans = async (req, res, next) => {
    try {
        const data = await listPricingPlans(req.query);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const createPlan = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const data = await createPricingPlan(userId, req.body);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const updatePlan = async (req, res, next) => {
    try {
        const planId = req.params.planId;
        const data = await updatePricingPlan(planId, req.body);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const removePlan = async (req, res, next) => {
    try {
        const planId = req.params.planId;
        await deletePricingPlan(planId);
        res.status(200).json({ success: true, message: "Pricing plan deleted" });
    }
    catch (error) {
        next(error);
    }
};
