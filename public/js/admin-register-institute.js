document.addEventListener('DOMContentLoaded', async () => {
  const admin = await Auth.checkSession('ADMIN');
  if (!admin) return;

  const registerForm = document.getElementById('register-form');
  const formPanel = document.getElementById('form-panel');
  const successCard = document.getElementById('success-card');
  const refIdText = document.getElementById('ref-id-text');
  const resetFormBtn = document.getElementById('reset-form-btn');
  
  // OTP Verification
  const sendPhoneOtpBtn = document.getElementById('send-phone-otp-btn');
  const verifyPhoneOtpBtn = document.getElementById('verify-phone-otp-btn');
  const phoneOtpBox = document.getElementById('phone-otp-box');
  const phoneVerifiedBadge = document.getElementById('phone-verified-badge');
  const contactInput = document.getElementById('contact');
  let phoneVerified = false;

  const sendEmailOtpBtn = document.getElementById('send-email-otp-btn');
  const verifyEmailOtpBtn = document.getElementById('verify-email-otp-btn');
  const emailOtpBox = document.getElementById('email-otp-box');
  const emailVerifiedBadge = document.getElementById('email-verified-badge');
  const emailInput = document.getElementById('email');
  let emailVerified = false;

  // Photo uploads & previews variables
  const photoFileInput = document.getElementById('photo-file-input');
  const photoPreviewCircle = document.getElementById('photo-preview-circle');
  const photoPreviewImg = document.getElementById('photo-preview-img');
  const photoOcrStatus = document.getElementById('photo-ocr-status');
  const photoBtnText = document.getElementById('photo-btn-text');
  let ownerPhotoUrl = '';

  // Autocomplete Pincode
  const pincodeInput = document.getElementById('pincode');
  const areaInput = document.getElementById('areaLocality');
  const cityInput = document.getElementById('city');
  const stateInput = document.getElementById('state');

  // Capacity calculation
  const totalAreaInput = document.getElementById('totalArea');
  const maxAllowedText = document.getElementById('max-allowed-text');
  let maxSeatingCapacity = 0;

  // Documents
  const fireCertInput = document.getElementById('fire-cert-input');
  const fireOcrStatus = document.getElementById('fire-ocr-status');
  const fireFilenameText = document.getElementById('fire-filename-text');
  let fireCertUrl = '';
  let fireCertFilename = '';

  const buildingCertInput = document.getElementById('building-cert-input');
  const buildingOcrStatus = document.getElementById('building-ocr-status');
  const buildingFilenameText = document.getElementById('building-filename-text');
  let buildingCertUrl = '';
  let buildingCertFilename = '';

  // Facility photos
  const facPhotoPreviewsBox = document.getElementById('facility-photo-previews');
  let facilityPhotosUrls = [];

  // Modal previews
  const previewModal = document.getElementById('preview-modal');
  const modalFilenameTitle = document.getElementById('modal-filename-title');
  const modalViewport = document.getElementById('modal-viewport');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // Form submitting button spinner
  const submitText = document.getElementById('submit-text');
  const submitSpinner = document.getElementById('submit-spinner');
  const submitBtn = registerForm.querySelector('.btn-submit');

  // --- Phone OTP Verifications ---
  sendPhoneOtpBtn.addEventListener('click', async () => {
    const contact = contactInput.value.trim();
    if (!/^\d{10}$/.test(contact)) {
      return alert('Please enter a valid 10-digit mobile number.');
    }
    try {
      const res = await API.sendOTP(contact, 'Phone_Verification');
      if (res.success) {
        phoneOtpBox.style.display = 'flex';
        sendPhoneOtpBtn.textContent = 'Resend';
        alert(res.message || 'OTP sent successfully');
      }
    } catch (err) {
      alert(err.message || 'Failed to send phone OTP.');
    }
  });

  verifyPhoneOtpBtn.addEventListener('click', async () => {
    const contact = contactInput.value.trim();
    const otp = document.getElementById('phone-otp').value.trim();
    if (otp.length !== 6) return alert('Enter 6-digit OTP code.');
    try {
      const res = await API.verifyOTP(contact, otp, 'Phone_Verification');
      if (res.success) {
        phoneVerified = true;
        phoneOtpBox.style.display = 'none';
        sendPhoneOtpBtn.style.display = 'none';
        contactInput.disabled = true;
        phoneVerifiedBadge.style.display = 'flex';
      }
    } catch (err) {
      alert(err.message || 'Failed to verify OTP.');
    }
  });

  // --- Email OTP Verifications ---
  sendEmailOtpBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) return alert('Please enter an email.');
    
    // Check if ends with @gmail.com
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return alert('Only @gmail.com email addresses are allowed.');
    }

    try {
      const res = await API.sendOTP(email, 'Email_Verification');
      if (res.success) {
        emailOtpBox.style.display = 'flex';
        sendEmailOtpBtn.textContent = 'Resend';
        alert(res.message || 'OTP sent successfully');
      }
    } catch (err) {
      alert(err.message || 'Failed to send email OTP.');
    }
  });

  verifyEmailOtpBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const otp = document.getElementById('email-otp').value.trim();
    if (otp.length !== 6) return alert('Enter 6-digit OTP code.');
    try {
      const res = await API.verifyOTP(email, otp, 'Email_Verification');
      if (res.success) {
        emailVerified = true;
        emailOtpBox.style.display = 'none';
        sendEmailOtpBtn.style.display = 'none';
        emailInput.disabled = true;
        emailVerifiedBadge.style.display = 'flex';
      }
    } catch (err) {
      alert(err.message || 'Failed to verify OTP.');
    }
  });

  // --- Owner Passport Photo Upload ---
  photoFileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Render Preview
      photoPreviewImg.src = URL.createObjectURL(file);
      photoPreviewCircle.style.display = 'block';
      photoBtnText.textContent = 'Change Image';
      
      // Scanning Mock state
      photoOcrStatus.style.display = 'block';
      photoOcrStatus.textContent = 'AI Scanning...';
      photoOcrStatus.style.color = 'var(--color-primary)';

      try {
        const uploadRes = await API.uploadFile(file);
        if (uploadRes.success) {
          ownerPhotoUrl = uploadRes.url;
          
          // Triggers Mock OCR scan
          const ocrRes = await API.scanOCR(file);
          if (ocrRes.success) {
            photoOcrStatus.textContent = 'AI Verified';
            photoOcrStatus.style.color = 'var(--color-emerald)';
          } else {
            photoOcrStatus.textContent = 'AI Scan Failed';
            photoOcrStatus.style.color = 'var(--color-red)';
          }
        }
      } catch (err) {
        photoOcrStatus.textContent = 'Upload Failed';
        photoOcrStatus.style.color = 'var(--color-red)';
      }
    }
  });

  // --- Autocomplete Pincode ---
  pincodeInput.addEventListener('input', async (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    const pincode = e.target.value.trim();
    
    if (pincode.length === 6) {
      try {
        const res = await API.lookupPincode(pincode);
        if (res.success && res.data) {
          const po = res.data;
          areaInput.value = po.Name || '';
          cityInput.value = po.District || po.Block || po.Region || '';
          stateInput.value = po.State || 'Uttar Pradesh';
        }
      } catch (err) {
        console.error('Failed to lookup pincode autocomplete:', err);
      }
    }
  });

  // --- Seating Capacity Auto Calculation ---
  totalAreaInput.addEventListener('input', (e) => {
    const area = Number(e.target.value) || 0;
    maxSeatingCapacity = area; // 1 sq.m per student
    maxAllowedText.textContent = maxSeatingCapacity;
  });

  // --- PDF NOC Document Uploads ---
  async function handleNocUpload(fileInput, ocrStatusEl, filenameTextEl, cb) {
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      filenameTextEl.textContent = file.name;
      
      ocrStatusEl.innerHTML = '<span style="color: var(--color-primary); animation: pulse 1s infinite;">Scanning...</span>';

      try {
        const uploadRes = await API.uploadFile(file);
        if (uploadRes.success) {
          cb(uploadRes.url, file.name);

          // Simulated OCR OCR processing
          const ocrRes = await API.scanOCR(file);
          if (ocrRes.success) {
            ocrStatusEl.innerHTML = '<span style="color: var(--color-emerald);">AI Verified ✓</span>';
          } else {
            ocrStatusEl.innerHTML = '<span style="color: var(--color-red);">AI Failed</span>';
          }
        }
      } catch (err) {
        ocrStatusEl.innerHTML = '<span style="color: var(--color-red);">Upload Failed</span>';
      }
    }
  }

  fireCertInput.addEventListener('change', () => {
    handleNocUpload(fireCertInput, fireOcrStatus, fireFilenameText, (url, name) => {
      fireCertUrl = url;
      fireCertFilename = name;
      bindFilenamePreview(fireFilenameText, url, name);
    });
  });

  buildingCertInput.addEventListener('change', () => {
    handleNocUpload(buildingCertInput, buildingOcrStatus, buildingFilenameText, (url, name) => {
      buildingCertUrl = url;
      buildingCertFilename = name;
      bindFilenamePreview(buildingFilenameText, url, name);
    });
  });

  function bindFilenamePreview(element, url, name) {
    element.style.color = 'var(--color-primary)';
    element.style.textDecoration = 'underline';
    element.style.cursor = 'pointer';
    
    // Clear old listener
    const newEl = element.cloneNode(true);
    element.parentNode.replaceChild(newEl, element);
    
    newEl.addEventListener('click', () => {
      modalFilenameTitle.textContent = name;
      modalViewport.innerHTML = `<iframe src="${url}" title="${name}"></iframe>`;
      previewModal.classList.add('open');
    });
  }

  // --- Modal control Close ---
  modalCloseBtn.addEventListener('click', () => {
    previewModal.classList.remove('open');
    modalViewport.innerHTML = '';
  });

  // --- Facility Photos previews ---
  const facFileInputs = document.querySelectorAll('.fac-file-input');
  facFileInputs.forEach(input => {
    input.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        try {
          const res = await API.uploadFile(file);
          if (res.success) {
            facilityPhotosUrls.push(res.url);
            
            // Check facility checkbox
            const facId = 'fac-' + e.target.getAttribute('data-facility');
            const check = document.getElementById(facId);
            if (check) check.checked = true;

            // Render preview thumbnail
            renderFacilityThumbnails();
          }
        } catch (err) {
          alert('Failed to upload facility photo');
        }
      }
    });
  });

  function renderFacilityThumbnails() {
    // Clear old thumb items except header title
    const title = facPhotoPreviewsBox.querySelector('.testing-title');
    facPhotoPreviewsBox.innerHTML = '';
    facPhotoPreviewsBox.appendChild(title);
    
    if (facilityPhotosUrls.length > 0) {
      facPhotoPreviewsBox.style.display = 'flex';
      
      facilityPhotosUrls.forEach((url, index) => {
        const thumb = document.createElement('div');
        thumb.className = 'upload-thumbnail-box';
        thumb.innerHTML = `
          <img src="${url}" alt="Facility Preview ${index+1}">
          <button type="button" class="upload-thumbnail-remove" data-index="${index}">Remove</button>
        `;
        
        // Modal Preview binding on image click
        thumb.querySelector('img').addEventListener('click', () => {
          modalFilenameTitle.textContent = `Facility Photo ${index+1}`;
          modalViewport.innerHTML = `<img src="${url}" alt="Facility ${index+1}">`;
          previewModal.classList.add('open');
        });

        // Remove binding
        thumb.querySelector('.upload-thumbnail-remove').addEventListener('click', (ev) => {
          ev.stopPropagation();
          const idx = Number(ev.target.getAttribute('data-index'));
          facilityPhotosUrls.splice(idx, 1);
          renderFacilityThumbnails();
        });

        facPhotoPreviewsBox.appendChild(thumb);
      });
    } else {
      facPhotoPreviewsBox.style.display = 'none';
    }
  }

  // --- Submit Registration ---
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!phoneVerified || !emailVerified) {
      return alert('Please verify both Email and Contact Number via OTP before registering.');
    }

    // Prepare full JSON payload
    const formData = {
      name: document.getElementById('name').value.trim(),
      ownerDetails: {
        name: document.getElementById('ownerName').value.trim(),
        contact: contactInput.value.trim(),
        email: emailInput.value.trim(),
        studentEmail: document.getElementById('studentEmail').value.trim(),
        aadhaarPan: document.getElementById('aadhaarPan').value.trim(),
        photoUrl: ownerPhotoUrl
      },
      address: {
        street: document.getElementById('street').value.trim(),
        areaLocality: areaInput.value.trim(),
        city: cityInput.value.trim(),
        state: stateInput.value.trim(),
        pincode: pincodeInput.value.trim()
      },
      infrastructure: {
        totalArea: Number(totalAreaInput.value) || 0,
        totalClassrooms: Number(document.getElementById('totalClassrooms').value) || 0,
        classroomDimensions: 'N/A'
      },
      facilities: {
        drinkingWater: document.getElementById('fac-separateToilets').checked, // Map mock keys
        separateToilets: document.getElementById('fac-separateToilets').checked,
        cctvInstalled: document.getElementById('fac-cctvInstalled').checked,
        firstAid: document.getElementById('fac-firstAid').checked,
        ventilation: document.getElementById('fac-ventilation').checked,
        emergencyExits: document.getElementById('fac-emergencyExits').checked,
        facilityPhotos: facilityPhotosUrls
      },
      safetyCertificates: [
        { type: 'Fire', url: fireCertUrl },
        { type: 'Building', url: buildingCertUrl }
      ],
      undertakings: {
        noUnder16: document.getElementById('und-noUnder16').checked,
        noSchoolHours: document.getElementById('und-noSchoolHours').checked,
        graduateTutors: document.getElementById('und-graduateTutors').checked,
        noMisleadingAds: document.getElementById('und-noMisleadingAds').checked,
        oneSqMeterRule: document.getElementById('und-oneSqMeterRule').checked
      },
      capacity: {
        maxAllowed: maxSeatingCapacity,
        currentlyEnrolled: 0
      }
    };

    submitBtn.disabled = true;
    submitSpinner.style.display = 'block';
    submitText.textContent = 'Processing Protocol...';

    try {
      const res = await API.registerInstitute(formData);
      if (res.success) {
        refIdText.textContent = res.data.instituteId;
        formPanel.style.display = 'none';
        successCard.style.display = 'block';
      } else {
        alert(res.error || 'Failed to submit registration');
      }
    } catch (err) {
      alert(err.message || 'An unexpected error occurred during registration.');
    } finally {
      submitBtn.disabled = false;
      submitSpinner.style.display = 'none';
      submitText.textContent = 'Submit Formal Registration';
    }
  });

  // --- Reset/Restart form ---
  resetFormBtn.addEventListener('click', () => {
    registerForm.reset();
    ownerPhotoUrl = '';
    fireCertUrl = '';
    fireCertFilename = '';
    buildingCertUrl = '';
    buildingCertFilename = '';
    facilityPhotosUrls = [];
    phoneVerified = false;
    emailVerified = false;
    
    // Reset badges
    phoneVerifiedBadge.style.display = 'none';
    emailVerifiedBadge.style.display = 'none';
    sendPhoneOtpBtn.style.display = 'block';
    sendPhoneOtpBtn.textContent = 'Send OTP';
    contactInput.disabled = false;
    
    sendEmailOtpBtn.style.display = 'block';
    sendEmailOtpBtn.textContent = 'Send OTP';
    emailInput.disabled = false;
    
    photoPreviewCircle.style.display = 'none';
    photoOcrStatus.style.display = 'none';
    photoBtnText.textContent = 'Upload Image';
    maxAllowedText.textContent = '0';
    
    fireFilenameText.textContent = 'No file chosen';
    fireFilenameText.style.color = '';
    fireFilenameText.style.textDecoration = '';
    fireFilenameText.style.cursor = '';
    
    buildingFilenameText.textContent = 'No file chosen';
    buildingFilenameText.style.color = '';
    buildingFilenameText.style.textDecoration = '';
    buildingFilenameText.style.cursor = '';
    
    facPhotoPreviewsBox.style.display = 'none';

    successCard.style.display = 'none';
    formPanel.style.display = 'block';
  });
});
