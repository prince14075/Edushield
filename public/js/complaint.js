document.addEventListener('DOMContentLoaded', () => {
  const typeComplaintBtn = document.getElementById('type-complaint');
  const typeSuggestionBtn = document.getElementById('type-suggestion');
  const isAnonymousCheck = document.getElementById('isAnonymous');
  const complainantFields = document.getElementById('complainant-fields');
  
  const nameInput = document.getElementById('name');
  const contactInput = document.getElementById('contact');
  
  const complainantTypeGroup = document.getElementById('complainant-type-group');
  const complaintForm = document.getElementById('complaint-form');
  
  const formView = document.getElementById('form-view');
  const successView = document.getElementById('success-view');
  const successHeaderText = document.getElementById('success-header-text');
  const successBodyText = document.getElementById('success-body-text');
  const trackingIdText = document.getElementById('tracking-id-text');
  
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const submitBtn = complaintForm.querySelector('.btn-submit');

  let activeType = 'COMPLAINT';
  let complainantType = 'STUDENT';

  // Toggle Type Selection
  typeComplaintBtn.addEventListener('click', () => {
    activeType = 'COMPLAINT';
    typeComplaintBtn.classList.add('active');
    typeSuggestionBtn.classList.remove('active');
    btnText.textContent = 'Submit Official Complaint';
  });

  typeSuggestionBtn.addEventListener('click', () => {
    activeType = 'SUGGESTION';
    typeSuggestionBtn.classList.add('active');
    typeComplaintBtn.classList.remove('active');
    btnText.textContent = 'Submit Suggestion';
  });

  // Handle Anonymous Checkbox
  isAnonymousCheck.addEventListener('change', (e) => {
    if (e.target.checked) {
      complainantFields.classList.add('disabled');
      nameInput.required = false;
      contactInput.required = false;
    } else {
      complainantFields.classList.remove('disabled');
      nameInput.required = true;
      contactInput.required = true;
    }
  });

  // Complainant Type selection
  complainantTypeGroup.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const buttons = complainantTypeGroup.querySelectorAll('button');
      buttons.forEach(btn => btn.classList.remove('active'));
      
      e.target.classList.add('active');
      complainantType = e.target.getAttribute('data-type');
    }
  });

  // Mock Evidence Box click
  document.getElementById('evidence-box').addEventListener('click', () => {
    alert('Mock Upload: Evidence upload is simulation-only. Evidence fields will log securely in audits.');
  });

  // Submit Complaint
  complaintForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isAnon = isAnonymousCheck.checked;
    const complaintData = {
      type: activeType,
      complainantType: isAnon ? 'PUBLIC' : complainantType,
      complainantName: isAnon ? 'Anonymous' : nameInput.value.trim(),
      complainantContact: isAnon ? '' : contactInput.value.trim(),
      instituteNameText: document.getElementById('instituteNameText').value.trim(),
      category: document.getElementById('category').value,
      description: document.getElementById('description').value.trim()
    };

    submitBtn.disabled = true;
    btnSpinner.style.display = 'block';
    btnText.textContent = 'Submitting...';

    try {
      const result = await API.submitComplaint(complaintData);
      
      if (result.success) {
        trackingIdText.textContent = result.data.complaintId;
        successHeaderText.textContent = activeType === 'SUGGESTION' 
          ? 'Suggestion Submitted Securely' 
          : 'Complaint Submitted Securely';
        successBodyText.textContent = activeType === 'SUGGESTION'
          ? 'Your suggestion has been logged and sent to the compliance portal.'
          : 'Your grievance has been securely logged and forwarded to the Ministry compliance authorities for immediate review.' + (isAnon ? ' Your identity has been completely obfuscated.' : '');
        
        formView.style.display = 'none';
        successView.style.display = 'block';
      } else {
        alert(result.error || 'Failed to submit grievance');
      }
    } catch (err) {
      alert(err.message || 'An unexpected error occurred during submission.');
    } finally {
      submitBtn.disabled = false;
      btnSpinner.style.display = 'none';
      btnText.textContent = activeType === 'SUGGESTION' ? 'Submit Suggestion' : 'Submit Official Complaint';
    }
  });
});
