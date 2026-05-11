import { Schema, model, models } from "mongoose";
const VisitorSchema = new Schema({ sessionId: { type: String, unique: true, index: true }, firstSeenAt: Date, lastSeenAt: Date, country: String, deviceType: String, referrer: String }, { timestamps: true });
export const Visitor = models.Visitor || model("Visitor", VisitorSchema);