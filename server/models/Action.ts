import mongoose from 'mongoose';

const actionSchema = new mongoose.Schema(
  {
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    actionType: {
      type: String,
      enum: ['Session', 'Follow-up', 'Assessment', 'Crisis Intervention', 'Other'],
      required: true,
    },
    description: String,
    duration: Number,
    notes: String,
    outcome: String,
    nextSteps: String,
  },
  { timestamps: true }
);

export const Action = mongoose.models.Action || mongoose.model('Action', actionSchema);
