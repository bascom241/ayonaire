import { AppError } from "../errors/AppError.js";
import paymentGatewayModel from "../models/paymentGateway.model.js";
import pricingPlanModel from "../models/pricingPlan.model.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
import {
  ConnectGatewayRequest,
  UpdateGatewayRequest,
  CreatePricingPlanRequest,
  UpdatePricingPlanRequest,
} from "../types/paymentGateway.types.js";

export const listGateways = async () => {
  return paymentGatewayModel.find().sort({ name: 1 });
};

export const connectGateway = async (
  userId: string,
  data: ConnectGatewayRequest,
) => {
  validateRequestBodyWithValues<ConnectGatewayRequest>(data, [
    "name",
    "secretKey",
  ]);

  const last4 = data.secretKey.slice(-4);

  if (data.isPrimary) {
    await paymentGatewayModel.updateMany({}, { $set: { isPrimary: false } });
  }

  const gateway = await paymentGatewayModel.findOneAndUpdate(
    { name: data.name },
    {
      name: data.name,
      isConnected: true,
      mode: data.mode || "test",
      publicKey: data.publicKey,
      secretKey: data.secretKey,
      secretKeyLast4: last4,
      isPrimary: Boolean(data.isPrimary),
      connectedBy: userId,
      connectedAt: new Date(),
    },
    { upsert: true, new: true },
  );

  return gateway;
};

export const updateGateway = async (
  name: string,
  data: UpdateGatewayRequest,
) => {
  const gateway = await paymentGatewayModel.findOne({ name });
  if (!gateway) {
    throw new AppError("gateway not connected", 404);
  }

  if (data.mode !== undefined) gateway.mode = data.mode as any;
  if (data.publicKey !== undefined) gateway.publicKey = data.publicKey;
  if (data.secretKey !== undefined) {
    gateway.secretKey = data.secretKey;
    gateway.secretKeyLast4 = data.secretKey.slice(-4);
  }

  await gateway.save();
  return gateway;
};

export const disconnectGateway = async (name: string) => {
  const gateway = await paymentGatewayModel.findOne({ name });
  if (!gateway) {
    throw new AppError("gateway not connected", 404);
  }

  gateway.isConnected = false;
  gateway.isPrimary = false;
  gateway.secretKey = undefined;
  gateway.secretKeyLast4 = undefined;
  await gateway.save();
  return gateway;
};

export const setPrimaryGateway = async (name: string) => {
  const gateway = await paymentGatewayModel.findOne({ name });
  if (!gateway || !gateway.isConnected) {
    throw new AppError("gateway is not connected", 400);
  }

  await paymentGatewayModel.updateMany({}, { $set: { isPrimary: false } });
  gateway.isPrimary = true;
  await gateway.save();
  return gateway;
};

/// ---------- Pricing Plans ---------- ///

export const listPricingPlans = async (query: any) => {
  const filter: Record<string, any> = {};
  if (query.course) filter.course = query.course;
  if (query.status) filter.status = query.status;

  return pricingPlanModel.find(filter).populate("course", "title").sort({ createdAt: -1 });
};

export const createPricingPlan = async (
  userId: string,
  data: CreatePricingPlanRequest,
) => {
  validateRequestBodyWithValues<CreatePricingPlanRequest>(data, [
    "course",
    "price",
  ]);

  return pricingPlanModel.create({
    course: data.course,
    planType: data.planType,
    price: data.price,
    duration: data.duration,
    accessType: data.accessType,
    status: data.status,
    createdBy: userId,
  });
};

export const updatePricingPlan = async (
  planId: string,
  data: UpdatePricingPlanRequest,
) => {
  const plan = await pricingPlanModel.findById(planId);
  if (!plan) {
    throw new AppError("pricing plan not found", 404);
  }

  if (data.planType !== undefined) plan.planType = data.planType as any;
  if (data.price !== undefined) plan.price = data.price;
  if (data.duration !== undefined) plan.duration = data.duration;
  if (data.accessType !== undefined) plan.accessType = data.accessType as any;
  if (data.status !== undefined) plan.status = data.status as any;

  await plan.save();
  return plan;
};

export const deletePricingPlan = async (planId: string) => {
  const plan = await pricingPlanModel.findByIdAndDelete(planId);
  if (!plan) {
    throw new AppError("pricing plan not found", 404);
  }
};
