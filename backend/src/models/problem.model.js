import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  tags: {
    type: [String],
    enum: ["Array", "String", "Dynamic Programming", "Graph", "Tree", "Math"],
    required: true,
    default: [],
  },
  visibleTestCases: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
      explanation: {
        type: String,
        required: true,
      },
    },
  ],
  hiddenTestCases: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
    },
  ],
  startCode: [
    {
      language: {
        type: String,
        lowercase: true,
        trim: true,
        enum: ["javascript", "c++", "java"],
        required: true,
      },
      initialCode: {
        type: String,
        required: true,
      },
    },
  ],
  referenceSolution: [
    {
      language: {
        type: String,
        lowercase: true,
        trim: true,
        enum: ["javascript", "c++", "java"],
        required: true,
      },
      completeCode: {
        type: String,
        required: true,
      },
    },
  ],
  problemCreator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const problemModel = mongoose.model("Problem", problemSchema);

export default problemModel;
