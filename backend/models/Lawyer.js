const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Lawyer name is required'], trim: true },
    initials: { type: String, maxlength: 3 },
    specialisation: { type: String, required: true },
    court: { type: String, required: true },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    chamber: { type: String },
    colorVariant: {
      type: String,
      enum: ['blue', 'green', 'purple', 'gold', 'red'],
      default: 'blue',
    },
    feesYTD: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: active case count
lawyerSchema.virtual('activeCases', {
  ref: 'Case',
  localField: '_id',
  foreignField: 'lawyer',
  count: true,
  match: { status: { $in: ['active', 'urgent'] } },
});

lawyerSchema.virtual('closedCases', {
  ref: 'Case',
  localField: '_id',
  foreignField: 'lawyer',
  count: true,
  match: { status: 'closed' },
});

// Auto-generate initials
lawyerSchema.pre('save', function (next) {
  if (!this.initials) {
    this.initials = this.name
      .replace(/^Adv\.\s*/i, '')
      .split(' ')
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }
  next();
});

module.exports = mongoose.model('Lawyer', lawyerSchema);
