import mongoose, { Schema } from "mongoose";
const paymentGatewaySchema = new Schema({
    name: {
        type: String,
        enum: ["stripe", "paystack"],
        required: true,
        unique: true,
    },
    isConnected: {
        type: Boolean,
        default: false,
    },
    mode: {
        type: String,
        enum: ["live", "test"],
        default: "test",
    },
    publicKey: {
        type: String,
    },
    // Never returned by any API response - selected explicitly only when
    // needed server-side to call the provider.
    secretKey: {
        type: String,
        select: false,
    },
    secretKeyLast4: {
        type: String,
    },
    isPrimary: {
        type: Boolean,
        default: false,
    },
    connectedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    connectedAt: {
        type: Date,
    },
}, { timestamps: true });
export default mongoose.model("PaymentGateway", paymentGatewaySchema);
