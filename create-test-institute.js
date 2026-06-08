const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/Edushield?appName=Edushield";

// Minimal schema logic matching the db
const InstituteSchema = new mongoose.Schema({
  instituteId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  ownerDetails: {
    name: String, email: String, contact: String
  },
  status: { type: String, default: 'Pending' }
});

const Institute = mongoose.models.Institute || mongoose.model('Institute', InstituteSchema);

async function main() {
  try {
    await mongoose.connect(uri);
    
    // Hash password
    const plainPassword = "Password123!";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const testInstitute = new Institute({
      instituteId: "INST_TEST_001",
      name: "Test Institute",
      password: hashedPassword,
      ownerDetails: {
        name: "Test Owner",
        email: "test@institute.com",
        contact: "9876543210"
      },
      status: "Approved" // Or 'Pending' depending on rules
    });

    await testInstitute.save();
    console.log("Successfully created test institute!");
    console.log("Institute ID: INST_TEST_001");
    console.log("Password: " + plainPassword);
    
  } catch (err) {
    if (err.code === 11000) {
      console.log("Test institute already exists!");
      console.log("Institute ID: INST_TEST_001");
      console.log("Password: Password123!");
    } else {
      console.error(err);
    }
  } finally {
    await mongoose.disconnect();
  }
}

main();
