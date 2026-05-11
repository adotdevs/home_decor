import { Schema, model, models } from "mongoose";
const SeoSettingSchema = new Schema({ key: { type: String, unique: true }, value: Schema.Types.Mixed }, { timestamps: true });
export const SeoSetting = models.SeoSetting || model("SeoSetting", SeoSettingSchema);