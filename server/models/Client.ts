import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: String,
    age: Number,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave'],
      default: 'Active',
    },
    description: String,
    issueCategory: String,
    tokens: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Client = mongoose.models.Client || mongoose.model('Client', clientSchema);
