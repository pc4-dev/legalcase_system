const mongoose = require('mongoose');

// ── Sub-schemas ──────────────────────────────────────────────
const adjournmentSchema = new mongoose.Schema(
  {
    date:    { type: Date, required: true },
    reason:  { type: String, required: true },
    dotType: { type: String, enum: ['done', 'warn', 'info', 'idle'], default: 'info' },
    notes:   { type: String },
  },
  { timestamps: true }
);

const documentSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    originalName: { type: String },
    fileType: {
      type: String,
      enum: ['plaint', 'annexure', 'letter', 'affidavit', 'order', 'decree', 'evidence', 'contract', 'other'],
      default: 'other',
    },
    filePath:   { type: String },
    fileSize:   { type: String },
    mimeType:   { type: String },
    status:     { type: String, enum: ['uploaded', 'pending', 'draft'], default: 'uploaded' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ── Main Case schema ─────────────────────────────────────────
const caseSchema = new mongoose.Schema(
  {
    caseCode: {
      type: String,
      required: [true, 'Case code is required'],
      unique: true, uppercase: true, trim: true,
    },
    title:          { type: String, required: [true, 'Case title is required'], trim: true },
    subtitle:       { type: String, trim: true },
    petitionerName: { type: String, trim: true },
    respondentName: { type: String, trim: true },

    entity: { type: String, required: [true, 'Entity is required'], trim: true },

    court:           { type: String, required: true },
    bench:           { type: String },
    lawyer:      { type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer' },
    lawyerName:  { type: String, trim: true },
    opposingCounsel: { type: String },

    status: {
      type: String,
      enum: ['urgent', 'active', 'pending', 'closed'],
      default: 'active',
    },
    stage: {
      type: String,
      enum: ['filing', 'hearing', 'arguments', 'decree', 'appeal', 'settled', 'other'],
      default: 'filing',
    },

    nextHearingDate: { type: Date },
    hearingType:     { type: String },
    filedDate:       { type: Date, default: Date.now },
    closedDate:      { type: Date },
    settlementDate:  { type: Date },

    reliefByPlaintiff: { type: String },
    ourPosition:       { type: String },
    strategyRemarks:   { type: String },

    adjournments: [adjournmentSchema],
    documents:    [documentSchema],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Text index for search
caseSchema.index({ title: 'text', caseCode: 'text', court: 'text', entity: 'text', petitionerName: 'text', respondentName: 'text' });

module.exports = mongoose.model('Case', caseSchema);
