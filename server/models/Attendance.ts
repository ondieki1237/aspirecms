import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      default: Date.now,
    },
    checkInTime: Date,
    checkOutTime: Date,
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      default: 'Present',
    },
    notes: String,
  },
  { timestamps: true }
);

export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
