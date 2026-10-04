import mongoose from "mongoose";

/**
 * Profile model — created automatically when a Registration is approved.
 * Only visible to premium (paid) members via the /api/profiles endpoint.
 */
const profileSchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // ── Contact (kept private, released via WhatsApp only on request) ──
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    // ── Name ──
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    // ── Personal ──
    gender: { type: String, enum: ["Male", "Female"], required: true },
    age: { type: String, default: "" },
    height: { type: String, default: "" },
    location: { type: String, required: true },
    nationality: { type: String, default: "" },
    ethnicity: { type: String, default: "" },
    languages: { type: String, default: "" },
    disability: { type: String, default: "" },
    // ── Religious ──
    sect: { type: String, default: "" },
    hijabi: { type: String, default: "" },
    beardStyle: { type: String, default: "" },
    religiousExpectations: { type: String, default: "", maxlength: 2000 },
    // ── Education & Employment ──
    education: { type: String, default: "" },
    occupation: { type: String, default: "" },
    annualIncome: { type: String, default: "" },
    // ── Lifestyle ──
    smoker: { type: String, default: "" },
    drivingLicence: { type: String, default: "" },
    willingToRelocate: { type: String, default: "" },
    hobbies: { type: String, default: "" },
    // ── Marital ──
    maritalStatus: { type: String, required: true },
    secondWife: { type: String, default: "" },
    // ── About ──
    aboutMe: { type: String, default: "", maxlength: 2000 },
    // ── Looking For ──
    partnerEducation: { type: String, default: "" },
    partnerOccupation: { type: String, default: "" },
    partnerSect: { type: String, default: "" },
    partnerReligiousPractice: { type: String, default: "" },
    partnerIslamicValues: { type: String, default: "" },
    partnerAgeRange: { type: String, default: "" },
    partnerEthnicity: { type: String, default: "" },
    partnerLivingArrangement: { type: String, default: "" },
    partnerWillingRelocate: { type: String, default: "" },
    openToDivorcee: { type: String, default: "" },
    openToWidow: { type: String, default: "" },
    acceptChildren: { type: String, default: "" },
    partnerDescription: { type: String, default: "", maxlength: 2000 },
    otherInfo: { type: String, default: "", maxlength: 2000 },
    // ── Membership ──
    plan: {
      type: String,
      enum: ["Silver", "Gold", "Platinum"],
      default: "Silver",
    },
    isPaid: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Index for efficient filtering
profileSchema.index({ gender: 1, isActive: 1 });
profileSchema.index({ location: 1 });

export default mongoose.model("Profile", profileSchema);
