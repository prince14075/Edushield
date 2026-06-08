const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/Edushield?appName=Edushield";

const InstituteSchema = new mongoose.Schema({
  instituteId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  ownerDetails: {
    name: String, email: String, contact: String, studentEmail: String, aadhaarPan: String, photoUrl: String
  },
  address: {
    street: String, areaLocality: String, city: String, state: String, pincode: String
  },
  infrastructure: {
    totalArea: Number, totalClassrooms: Number, classroomDimensions: String
  },
  facilities: {
    drinkingWater: { type: Boolean, default: false },
    separateToilets: { type: Boolean, default: false },
    cctvInstalled: { type: Boolean, default: false },
    firstAid: { type: Boolean, default: false },
    ventilation: { type: Boolean, default: false },
    emergencyExits: { type: Boolean, default: false },
    facilityPhotos: [String]
  },
  safetyCertificates: [{
    url: String,
    type: { type: String, enum: ['Fire', 'Building', 'Other'] },
    aiVerificationStatus: { type: String, default: 'Pending' }
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
  riskStatus: { type: String, default: 'PENDING_REGISTRATION' },
  status: { type: String, default: 'Pending' }
});

const Institute = mongoose.models.Institute || mongoose.model('Institute', InstituteSchema);

async function main() {
  try {
    await mongoose.connect(uri);

    const plainPassword = "Password123!";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await Institute.deleteOne({ instituteId: "INS-8888" });

    const newInst = new Institute({
      instituteId: "INS-8888",
      name: "Elite Coaching Academy",
      password: hashedPassword,
      ownerDetails: {
        name: "Vikram Malhotra",
        email: "vikram@eliteacademy.com",
        contact: "9876543210",
        studentEmail: "support@eliteacademy.com"
      },
      address: {
        street: "15, Civil Lines Road",
        areaLocality: "Civil Lines",
        city: "Gorakhpur",
        state: "Uttar Pradesh",
        pincode: "273001"
      },
      infrastructure: {
        totalArea: 150,
        totalClassrooms: 6,
        classroomDimensions: "15x10"
      },
      facilities: {
        drinkingWater: true,
        separateToilets: true,
        cctvInstalled: true,
        firstAid: true,
        ventilation: true,
        emergencyExits: true,
        facilityPhotos: []
      },
      safetyCertificates: [
        { type: "Fire", url: "/uploads/mock_fire_noc.pdf", aiVerificationStatus: "Verified" },
        { type: "Building", url: "/uploads/mock_building_noc.pdf", aiVerificationStatus: "Verified" }
      ],
      undertakings: {
        noUnder16: true,
        noSchoolHours: true,
        graduateTutors: true,
        noMisleadingAds: true,
        oneSqMeterRule: true
      },
      capacity: {
        maxAllowed: 150,
        currentlyEnrolled: 84
      },
      riskStatus: "SAFE",
      status: "Approved"
    });

    await newInst.save();
    console.log("Successfully created Elite test institute!");
    console.log("---------------------------------------");
    console.log("Institute ID: INS-8888");
    console.log("Password:     Password123!");
    console.log("---------------------------------------");

      } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
