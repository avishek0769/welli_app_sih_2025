import mongoose, { Schema } from "mongoose";

const counselingSchema = Schema({
    requestedBy: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    concernType: {
        type: String,
        enum: [
            "academic_stress",
            "relationship_issues",
            "career_guidance",
            "mental_health",
            "self_improvement",
            "other",
        ],
        required: true,
    },
    meetInPerson: {
        type: Boolean,
        default: false,
    },
    preferedDate: {
        type: Date,
    },
    preferedTime: {
        type: String,
        enum: ["morning", "afternoon", "evening", "night"],
    },
    message: {
        type: String,
    },
    counselor: {
        type: Schema.Types.ObjectId,
        ref: "counselors",
    },
    requestedOn: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "completed"],
        default: "pending",
    },
})

export default Counseling = mongoose.model("counseling", counselingSchema);