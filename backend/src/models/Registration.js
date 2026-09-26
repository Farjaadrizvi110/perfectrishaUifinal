import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    // ── Status ──
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["Silver", "Gold", "Platinum", "Free"],
      default: "Free",
    },
    // ── Contact (unique per user for dup guard) ──
    email: {
      type: String,
      trim: true,
      default: "",
      lowercase: true,
      index: true,
    },
    phone: { type: String, trim: true, default: "", index: true },
    // ── Name ──
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    // ── Personal ──
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
      trim: true,
    },
    dob: { type: String, trim: true, default: "" },
    age: { type: String, trim: true, default: "" },
    height: { type: String, trim: true, default: "" },
    languages: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, required: true },
    nationality: { type: String, trim: true, default: "" },
    ethnicity: { type: String, trim: true, default: "" },
    disability: { type: String, trim: true, default: "" },
    // ── Religious ──
    religion: { type: String, trim: true, default: "Islam" },
    sect: { type: String, trim: true, default: "" },
    hijabi: { type: String, trim: true, default: "" },
    beardStyle: { type: String, trim: true, default: "" },
    religiousExpectations: { type: String, trim: true, default: "" },
    // ── Education & Employment ──
    education: { type: String, trim: true, default: "" },
    occupation: { type: String, trim: true, default: "" },
    annualIncome: { type: String, trim: true, default: "" },
    // ── Lifestyle ──
    smoker: { type: String, trim: true, default: "" },
    drivingLicence: { type: String, trim: true, default: "" },
    willingToRelocate: { type: String, trim: true, default: "" },
    hobbies: { type: String, trim: true, default: "" },
    // ── Marital ──
    maritalStatus: { type: String, trim: true, required: true },
    secondWife: { type: String, trim: true, default: "" },
    // ── About ──
    aboutMe: { type: String, trim: true, default: "" },
    // ── Looking For ──
    partnerEducation: { type: String, trim: true, default: "" },
    partnerOccupation: { type: String, trim: true, default: "" },
    partnerSect: { type: String, trim: true, default: "" },
    partnerReligiousPractice: { type: String, trim: true, default: "" },
    partnerIslamicValues: { type: String, trim: true, default: "" },
    partnerAgeRange: { type: String, trim: true, default: "" },
    partnerEthnicity: { type: String, trim: true, default: "" },
    partnerLivingArrangement: { type: String, trim: true, default: "" },
    partnerWillingRelocate: { type: String, trim: true, default: "" },
    openToDivorcee: { type: String, trim: true, default: "" },
    openToWidow: { type: String, trim: true, default: "" },
    acceptChildren: { type: String, trim: true, default: "" },
    partnerDescription: { type: String, trim: true, default: "" },
    otherInfo: { type: String, trim: true, default: "" },
    confirmInfo: { type: Boolean, default: false },
    // ── Admin actions ──
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("Registration", registrationSchema);
