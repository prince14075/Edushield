const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Email_Verification", "Phone_Verification", "Password_Reset"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1800, // 30 minutes TTL
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.models.Verification || mongoose.model("Verification", VerificationSchema);
