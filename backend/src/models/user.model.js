import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 20,
    },
    lastName: {
      type: String,
      minLength: 0,
      maxLength: 20,
      default: "",
    },

    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
      lowercase: true,
      sparse : true,
    },

    age: {
      type: Number,
      min: 5,
      max: 80,
      default: 18,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    problemSolved: {
      type: [String],
      default: [],
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
