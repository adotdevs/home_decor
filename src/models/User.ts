import { Schema, model, models } from "mongoose";
const UserSchema = new Schema({ name: String, email: { type: String, unique: true, index: true }, role: { type: String, default: "admin" }, passwordHash: String, isActive: { type: Boolean, default: true } }, { timestamps: true });
export const User = models.User || model("User", UserSchema);