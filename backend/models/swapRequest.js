import mongoose from "mongoose";

const swapRequestSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skillOffered: { type: String, required: true },
    skillRequested: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled'],
        default: 'pending'
    },
    message: { type: String, trim: true },
}, { timestamps: true });

export default mongoose.model("SwapRequest", swapRequestSchema);
