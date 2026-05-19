const mongoose = require('mongoose');

const entitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Entity name is required'],
      unique: true,
      trim: true,
    },
    shortName: { type: String, trim: true },
    type: {
      type: String,
      enum: ['Private Limited', 'LLP', 'Partnership', 'Proprietorship', 'Trust', 'Other'],
      default: 'Private Limited',
    },
    registrationNo: { type: String, trim: true },
    address:        { type: String, trim: true },
    contactPerson:  { type: String, trim: true },
    contactPhone:   { type: String, trim: true },
    contactEmail:   { type: String, trim: true, lowercase: true },
    description:    { type: String, trim: true },
    colorVariant: {
      type: String,
      enum: ['orange', 'blue', 'green', 'purple', 'red', 'teal'],
      default: 'orange',
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Entity', entitySchema);
