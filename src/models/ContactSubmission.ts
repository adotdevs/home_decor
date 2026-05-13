import { Schema, model, models } from "mongoose";

const ALLOWED_SUBJECTS = ["editorial", "advertising", "collaboration", "press", "other"] as const;

const ContactSubmissionSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 200, trim: true },
    email: { type: String, required: true, maxlength: 320, lowercase: true, trim: true },
    subject: { type: String, required: true, enum: [...ALLOWED_SUBJECTS] },
    message: { type: String, required: true, maxlength: 10000, trim: true },
  },
  { timestamps: true },
);

ContactSubmissionSchema.index({ createdAt: -1 });

export const ContactSubmission =
  models.ContactSubmission || model("ContactSubmission", ContactSubmissionSchema);
