import mongoose from "mongoose";

const counsellorSchema = new mongoose.Schema({
    // Auth
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },

    // Personal Info
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    gender: {
        type: String,
        enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    dateOfBirth: {
        type: Date,
    },
    // Professional Info
    professionTitle: {
        type: String,
        enum: [
            "psychologist",
            "counsellor",
            "therapist",
            "psychiatrist",
            "student_intern",
        ],
        required: true,
    },
    highestQualification: {
        type: String,
        required: true,
    },
    yearsOfExperience: {
        type: String,
        enum: ["0-1", "1-3", "3-5", "5+"],
        required: true,
    },
    specializations: {
        type: [String],
        default: [],
    },

    // Verification
    idProofUrl: {
        type: String,
    },
    certificateUrl: {
        type: String,
    },
    verificationStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },

    // Availability
    availability: {
        days: {
            type: [String], // ["mon", "tue", "wed"]
            default: [],
        },
        timeSlot: {
            type: String,
            enum: ["morning", "afternoon", "evening", "night"],
        },
    }
}, { timestamps: true });

export default mongoose.model("Counsellor", counsellorSchema);
