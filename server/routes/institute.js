const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Institute = require('../models/Institute');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/me', authMiddleware('INSTITUTE'), async (req, res) => {
  try {
    const instituteId = req.user.instituteId;

        if (!instituteId) {
      return res.status(400).json({ success: false, error: 'Institute ID not found in token' });
    }

    const institute = await Institute.findOne({ instituteId });

    if (!institute) {
      return res.status(404).json({ success: false, error: 'Institute not found' });
    }

    const formattedInstitute = {
      id: institute._id.toString(),
      instituteId: institute.instituteId,
      name: institute.name,
      address: institute.address || {},
      capacity: institute.capacity || { maxAllowed: 0, currentlyEnrolled: 0 },
      infrastructure: institute.infrastructure || {},
      facilities: institute.facilities || {},
      riskStatus: institute.riskStatus,
      ownerDetails: institute.ownerDetails || {},
      safetyCertificates: institute.safetyCertificates || [],
      undertakings: institute.undertakings || {}
    };

    return res.json({ success: true, data: formattedInstitute });

  } catch (error) {
    console.error('Error fetching institute profile:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch institute profile' });
  }
});

router.get('/admin', authMiddleware('ADMIN'), async (req, res) => {
  try {
    const institutes = await Institute.find({}).sort({ registrationDate: -1 });

    const formattedInstitutes = institutes.map((institute) => {
      let capacityPercentage = 0;
      if (institute.capacity?.maxAllowed > 0) {
        capacityPercentage = Math.round((institute.capacity.currentlyEnrolled / institute.capacity.maxAllowed) * 100);
      } else if (institute.capacity?.currentlyEnrolled > 0) {
        capacityPercentage = 100;
      }

      return {
        id: institute._id.toString(),
        instituteId: institute.instituteId,
        name: institute.name,
        city: institute.address?.city || 'Unspecified',
        capacityPercentage,
        currentlyEnrolled: institute.capacity?.currentlyEnrolled || 0,
        maxAllowed: institute.capacity?.maxAllowed || 0,
        riskStatus: institute.riskStatus || 'PENDING_REGISTRATION',
      };
    });

    return res.json({ success: true, data: formattedInstitutes });
  } catch (error) {
    console.error('Error fetching admin institutes:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch institutes' });
  }
});

router.get('/public', async (req, res) => {
  try {
    const institutes = await Institute.find({}).sort({ registrationDate: -1 });

    const formattedInstitutes = institutes.map((institute) => ({
      id: institute.instituteId || institute._id.toString(),
      name: institute.name,
      location: `${institute.address?.city || 'Unknown City'}, ${institute.address?.state || 'Unknown State'}`,
      status: institute.riskStatus === 'SAFE' ? 'Verified' : 
              institute.riskStatus === 'WARNING' ? 'Warning' : 
              institute.riskStatus === 'UNSAFE' ? 'Unsafe' : 'Pending Verification',
      safe: institute.riskStatus === 'SAFE',
      capacity: institute.capacity?.currentlyEnrolled >= institute.capacity?.maxAllowed && institute.capacity?.maxAllowed > 0 
                ? 'Full' : 'Available',
      courses: 'Various Courses',
      rating: 4.5,
      issue: institute.riskStatus !== 'SAFE' ? 'Compliance review needed' : undefined
    }));

    return res.json({ success: true, count: formattedInstitutes.length, data: formattedInstitutes });
  } catch (error) {
    console.error('Error fetching public institutes:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch institutes' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      ownerDetails, 
      address, 
      infrastructure, 
      facilities,
      safetyCertificates,
      undertakings,
      capacity 
    } = req.body;

    if (!name || !ownerDetails || !ownerDetails.name || !ownerDetails.email || !ownerDetails.contact || !ownerDetails.studentEmail || !address || !capacity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mandatory fields are missing. Please fill all required fields.' 
      });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(ownerDetails.contact)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Contact number must be exactly 10 digits.' 
      });
    }

    const newId = `INS-${Math.floor(1000 + Math.random() * 9000)}`;
    const plainPassword = Math.random().toString(36).slice(-8).toUpperCase();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const newInstitute = new Institute({
      instituteId: newId,
      name,
      password: hashedPassword,
      ownerDetails: {
        name: ownerDetails.name,
        contact: ownerDetails.contact,
        email: ownerDetails.email,
        studentEmail: ownerDetails.studentEmail,
        aadhaarPan: ownerDetails.aadhaarPan,
        photoUrl: ownerDetails.photoUrl || '',
      },
      address,
      infrastructure,
      facilities: {
        ...facilities,
        facilityPhotos: facilities?.facilityPhotos || [],
      },
      safetyCertificates: safetyCertificates?.map((cert) => ({
        type: cert.type,
        url: cert.url || '',
        aiVerificationStatus: 'Pending'
      })) || [],
      undertakings,
      capacity
    });

    await newInstitute.save();

    return res.status(201).json({ 
      success: true, 
      message: "Registration successful! Save your credentials carefully.",
      data: {
        instituteId: newId,
        plainPassword: plainPassword,
      } 
    });

  } catch (error) {
    console.error('Registration error:', error);

        if (error && error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        error: 'A duplicate institute ID was generated. Please try again.' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      error: 'Failed to register institute. Please try again.' 
    });
  }
});

router.put('/compliance', authMiddleware('INSTITUTE'), async (req, res) => {
  try {
    const instituteId = req.user.instituteId;
    if (!instituteId) {
      return res.status(400).json({ success: false, error: 'Institute ID not found in token' });
    }

    const { safetyCertificates, undertakings } = req.body;

    const institute = await Institute.findOne({ instituteId });
    if (!institute) {
      return res.status(404).json({ success: false, error: 'Institute not found' });
    }

    if (safetyCertificates) {
      safetyCertificates.forEach(newCert => {
        const index = institute.safetyCertificates.findIndex(c => c.type === newCert.type);
        if (index > -1) {
          institute.safetyCertificates[index].url = newCert.url;
          institute.safetyCertificates[index].aiVerificationStatus = newCert.aiVerificationStatus || 'Pending';
        } else {
          institute.safetyCertificates.push(newCert);
        }
      });
    }

    if (undertakings) {
      institute.undertakings = {
        ...institute.undertakings,
        ...undertakings
      };
    }

    const fireCert = institute.safetyCertificates.find(c => c.type === 'Fire');
    const buildingCert = institute.safetyCertificates.find(c => c.type === 'Building');

        const hasFire = fireCert && fireCert.url && fireCert.aiVerificationStatus === 'Verified';
    const hasBuilding = buildingCert && buildingCert.url && buildingCert.aiVerificationStatus === 'Verified';

        const undertakingsChecked = 
      institute.undertakings.noUnder16 && 
      institute.undertakings.noSchoolHours && 
      institute.undertakings.graduateTutors && 
      institute.undertakings.noMisleadingAds && 
      institute.undertakings.oneSqMeterRule;

    if (hasFire && hasBuilding && undertakingsChecked) {
      institute.riskStatus = 'SAFE';
    } else if (undertakingsChecked || (fireCert?.url || buildingCert?.url)) {
      institute.riskStatus = 'WARNING';
    } else {
      institute.riskStatus = 'UNSAFE';
    }

    await institute.save();

    return res.json({ success: true, message: 'Compliance updated successfully', data: institute });
  } catch (error) {
    console.error('Compliance update error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update compliance details' });
  }
});

router.put('/settings', authMiddleware('INSTITUTE'), async (req, res) => {
  try {
    const instituteId = req.user.instituteId;
    if (!instituteId) {
      return res.status(400).json({ success: false, error: 'Institute ID not found in token' });
    }

    const { name, supportPhone } = req.body;

    const institute = await Institute.findOne({ instituteId });
    if (!institute) {
      return res.status(404).json({ success: false, error: 'Institute not found' });
    }

    if (name) {
      institute.name = name;
    }
    if (supportPhone) {
      if (!institute.ownerDetails) {
        institute.ownerDetails = {};
      }
      institute.ownerDetails.contact = supportPhone;
    }

    await institute.save();

    return res.json({ success: true, message: 'Settings saved successfully', data: institute });
  } catch (error) {
    console.error('Settings update error:', error);
    return res.status(500).json({ success: false, error: 'Failed to save settings' });
  }
});

module.exports = router;
