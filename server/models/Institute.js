const mongoose = require('mongoose');

const InstituteSchema = new mongoose.Schema({
  instituteId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  ownerDetails: {
    name: { type: String },
    contact: { type: String },
    email: { type: String },
    studentEmail: { type: String },
    aadhaarPan: { type: String },
    photoUrl: { type: String }
  },
  address: {
    street: { type: String },
    areaLocality: { type: String },
    city: { type: String },
    state: { type: String, default: 'Uttar Pradesh' },
    pincode: { type: String }
  },
  infrastructure: {
    totalArea: { type: Number },
    totalClassrooms: { type: Number },
    classroomDimensions: { type: String }
  },
  facilities: {
    drinkingWater: { type: Boolean, default: false },
    separateToilets: { type: Boolean, default: false },
    cctvInstalled: { type: Boolean, default: false },
    firstAid: { type: Boolean, default: false },
    ventilation: { type: Boolean, default: false },
    emergencyExits: { type: Boolean, default: false },
    facilityPhotos: [{ type: String }]
  },
  safetyCertificates: [{
    url: { type: String },
    type: { type: String, enum: ['Fire', 'Building', 'Other'] },
    aiVerificationStatus: { type: String, enum: ['Pending', 'Verified', 'Failed'], default: 'Pending' }
  }],
  undertakings: {
    noUnder16: { type: Boolean, default: false },
    noSchoolHours: { type: Boolean, default: false },
    graduateTutors: { type: Boolean, default: false },
    noMisleadingAds: { type: Boolean, default: false },
    oneSqMeterRule: { type: Boolean, default: false }
  },
  capacity: {
    maxAllowed: { type: Number, default: 0 },
    currentlyEnrolled: { type: Number, default: 0 }
  },
  riskStatus: {
    type: String,
    enum: ['SAFE', 'WARNING', 'UNSAFE', 'PENDING_REGISTRATION'],
    default: 'PENDING_REGISTRATION'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  registrationDate: { type: Date, default: Date.now },
  expiryDate: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.models.Institute || mongoose.model('Institute', InstituteSchema);
