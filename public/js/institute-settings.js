document.addEventListener('DOMContentLoaded', async () => {
  const user = await Auth.checkSession('INSTITUTE');
  if (!user) return;

  const statusBadge = document.getElementById('status-badge');
  const verifyBadge = document.getElementById('profile-verify-badge');
  const sidebarUserName = document.querySelector('.sidebar-user-name');
  const sidebarUserRole = document.querySelector('.sidebar-user-role');
  
  const instNameInput = document.getElementById('inst-name');
  const instEmailInput = document.getElementById('inst-email');
  const instPhoneInput = document.getElementById('inst-phone');
  const saveBtn = document.getElementById('save-settings-btn');

  let currentInstitute = null;

  async function loadSettings() {
    try {
      const result = await API.getInstituteMe();
      if (result.success) {
        currentInstitute = result.data;
        
        // Fill fields
        instNameInput.value = currentInstitute.name || '';
        instEmailInput.value = currentInstitute.ownerDetails?.email || '';
        instPhoneInput.value = currentInstitute.ownerDetails?.contact || '';

        // Verification status details
        const risk = currentInstitute.riskStatus || 'PENDING_REGISTRATION';
        const isSafe = risk === 'SAFE';
        
        statusBadge.textContent = isSafe ? 'Verified' : risk.replace('_', ' ');
        statusBadge.className = 'dashboard-badge ' + (isSafe ? 'success' : 'alert-error');
        
        verifyBadge.innerHTML = `<i data-lucide="${isSafe ? 'shield-check' : 'alert-triangle'}" style="width: 0.9rem; height: 0.9rem;"></i> <span>${isSafe ? 'Verified' : 'Review Needed'}</span>`;
        verifyBadge.className = 'dashboard-badge ' + (isSafe ? 'success' : 'alert-error');

        // Sidebar update
        if (sidebarUserName) sidebarUserName.textContent = currentInstitute.name;
        if (sidebarUserRole) sidebarUserRole.textContent = `ID: ${currentInstitute.instituteId}`;
        
        lucide.createIcons();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load settings');
    }
  }

  // Handle settings update
  saveBtn.addEventListener('click', async () => {
    const name = instNameInput.value.trim();
    const supportPhone = instPhoneInput.value.trim();

    if (!name) {
      alert('Institute Name cannot be empty');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (supportPhone && !phoneRegex.test(supportPhone.replace(/[\s-+]/g, '').slice(-10))) {
      alert('Support Phone must be a valid 10-digit number');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<div class="spinner" style="width: 1rem; height: 1rem; border-top-color: #ffffff; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></div> Saving...`;

    try {
      const result = await API.updateSettings({
        name,
        supportPhone: supportPhone.replace(/[\s-+]/g, '').slice(-10) // Normalize to 10 digits
      });

      if (result.success) {
        alert('Settings saved successfully!');
        await loadSettings();
      } else {
        alert(result.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving settings');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<i data-lucide="save" style="width: 1.1rem; height: 1.1rem; display: inline-block; vertical-align: middle;"></i> Save Changes`;
      lucide.createIcons();
    }
  });

  // Load Settings
  loadSettings();
});
