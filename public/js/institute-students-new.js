document.addEventListener('DOMContentLoaded', async () => {
  const user = await Auth.checkSession('INSTITUTE');
  if (!user) return;

  const statusBadge = document.getElementById('status-badge');
  const sidebarUserName = document.querySelector('.sidebar-user-name');
  const sidebarUserRole = document.querySelector('.sidebar-user-role');

  async function fetchStatus() {
    try {
      const res = await API.getInstituteMe();
      if (res.success) {
        const risk = res.data.riskStatus || 'PENDING_REGISTRATION';
        statusBadge.textContent = risk === 'SAFE' ? 'Verified' : risk.replace('_', ' ');
        statusBadge.className = 'dashboard-badge ' + (risk === 'SAFE' ? 'success' : 'alert-error');

                if (sidebarUserName) sidebarUserName.textContent = res.data.name;
        if (sidebarUserRole) sidebarUserRole.textContent = `ID: ${res.data.instituteId}`;
      }
    } catch (err) {
      console.error(err);
    }
  }
  fetchStatus();

  const form = document.getElementById('student-form');
  const errorAlert = document.getElementById('form-error-alert');
  const errorMessage = document.getElementById('error-message');
  const successView = document.getElementById('success-view');
  const formFieldsView = document.getElementById('form-fields-view');

    const nameInput = document.getElementById('student-name');
  const photoInput = document.getElementById('student-photo');
  const photoUploadLabel = document.getElementById('photo-upload-label');
  const photoPreviewContainer = document.getElementById('photo-preview-container');
  const photoPreviewImg = document.getElementById('photo-preview');

    const aadhaarInput = document.getElementById('student-aadhaar');
  const aadhaarHelper = document.getElementById('aadhaar-helper');
  const dobInput = document.getElementById('student-dob');
  const qualificationSelect = document.getElementById('student-qualification');
  const emailInput = document.getElementById('student-email');
  const courseInput = document.getElementById('student-course');
  const guardianNameInput = document.getElementById('guardian-name');
  const guardianContactInput = document.getElementById('guardian-contact');

    const enrollAnotherBtn = document.getElementById('enroll-another-btn');
  const successMessage = document.getElementById('success-message');
  const submitBtn = document.getElementById('submit-btn');

  let photoUrl = '';

  const today = new Date();
  const maxYear = today.getFullYear() - 16;
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const maxDateOfBirth = `${maxYear}-${month}-${day}`;
  dobInput.max = maxDateOfBirth;

  aadhaarInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 12);
    aadhaarInput.value = val;

    aadhaarHelper.innerHTML = `Must be exactly 12 digits (${val.length}/12) ${val.length === 12 ? '<span style="color: var(--color-emerald); font-weight: 600; margin-left: 0.25rem;">✓ Valid</span>' : ''}`;

    if (val.length === 12 && !dobInput.value) {
      const mockYear = today.getFullYear() - 17;
      dobInput.value = `${mockYear}-01-01`;
      alert(`Mock Aadhaar Verified: Auto-extracted DOB: ${mockYear}-01-01`);
    }
  });

  photoInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      photoUploadLabel.textContent = 'Uploading...';

            try {
        const result = await API.uploadFile(file);
        if (result.success) {
          photoUrl = result.url;
          photoPreviewImg.src = photoUrl;
          photoPreviewContainer.style.display = 'flex';
          photoUploadLabel.textContent = 'Change Photo';
        } else {
          alert('Upload failed: ' + (result.error || 'Unknown error'));
          photoUploadLabel.textContent = 'Upload Photo';
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred while uploading photo');
        photoUploadLabel.textContent = 'Upload Photo';
      }
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorAlert.style.display = 'none';
    errorMessage.textContent = '';

        const name = nameInput.value.trim();
    const aadhaarNumber = aadhaarInput.value.trim();
    const dob = dobInput.value;
    const qualification = qualificationSelect.value;
    const email = emailInput.value.trim();
    const course = courseInput.value.trim();
    const guardianName = guardianNameInput.value.trim();
    const guardianContact = guardianContactInput.value.trim();

    if (aadhaarNumber.length !== 12) {
      showError('Aadhaar number must be exactly 12 digits');
      return;
    }

    const dobDate = new Date(dob);
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    if (age < 16) {
      showError('Guidelines Violation: Student must be at least 16 years old to enroll in a coaching center.');
      return;
    }

    if (qualification !== 'Class X Passed' && qualification !== 'Class XII Passed' && qualification !== 'Graduate') {
      showError('Guidelines Violation: Student must have completed at least Class X to enroll.');
      return;
    }

    setLoadingState(true);

    try {
      const response = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          aadhaarNumber,
          dob,
          qualification,
          email,
          course,
          guardianName,
          guardianContact,
          photoUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'Failed to enroll student');
        setLoadingState(false);
        return;
      }

      successMessage.textContent = `${name} has been verified as ${age} years old and meets the secondary education criteria. The institute's live capacity has been updated.`;
      formFieldsView.style.display = 'none';
      successView.style.display = 'block';
    } catch (err) {
      console.error(err);
      showError(err.message || 'An error occurred during registration');
    } finally {
      setLoadingState(false);
    }
  });

  enrollAnotherBtn.addEventListener('click', () => {
    form.reset();
    photoUrl = '';
    photoPreviewContainer.style.display = 'none';
    photoPreviewImg.src = '';
    photoUploadLabel.textContent = 'Upload Photo';

        aadhaarHelper.textContent = 'Must be exactly 12 digits (0/12)';
    successView.style.display = 'none';
    formFieldsView.style.display = 'flex';
  });

  function showError(msg) {
    errorMessage.textContent = msg;
    errorAlert.style.display = 'flex';
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <div class="spinner" style="width: 1.1rem; height: 1.1rem; border-top-color: #ffffff; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></div>
        Verifying Details...
      `;
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Validate & Enroll Student';
    }
  }
});
