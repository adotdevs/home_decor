import { Schema, model, models } from "mongoose";

/**
 * Append-only admin audit trail (retention enforced by scheduled cleanup).
 * Wire `appendAdminAuditLog` from sensitive routes when you need compliance logs.
 */
const AdminAuditLogSchema = new Schema(
  {
    actorEmail: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, default: "", index: true },
    resourceId: { type: String, default: "" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed },
    diff: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

AdminAuditLogSchema.index({ createdAt: -1 });
AdminAuditLogSchema.index({ actorEmail: 1, createdAt: -1 });

export const AdminAuditLog = models.AdminAuditLog || model("AdminAuditLog", AdminAuditLogSchema);
