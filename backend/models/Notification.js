const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ['urgent', 'warn', 'info', 'success'],
      default: 'info',
    },
    icon: { type: String, default: 'ti-bell' },
    relatedCase: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
    dueDate: { type: Date },
    isRead: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
