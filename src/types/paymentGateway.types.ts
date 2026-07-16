export interface ConnectGatewayRequest {
  name: "stripe" | "paystack";
  mode?: "live" | "test";
  publicKey?: string;
  secretKey: string;
  isPrimary?: boolean;
}

export interface UpdateGatewayRequest {
  mode?: "live" | "test";
  publicKey?: string;
  secretKey?: string;
}

export interface CreatePricingPlanRequest {
  course: string;
  planType?: string;
  price: number;
  duration?: string;
  accessType?: string;
  status?: string;
}

export interface UpdatePricingPlanRequest {
  planType?: string;
  price?: number;
  duration?: string;
  accessType?: string;
  status?: string;
}
