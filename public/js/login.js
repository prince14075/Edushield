document.addEventListener('DOMContentLoaded', () => {
  const toggleInstituteBtn = document.getElementById('toggle-institute');
  const toggleAdminBtn = document.getElementById('toggle-admin');
  const idLabel = document.getElementById('id-label');
  const instituteIdInput = document.getElementById('instituteId');
  const loginForm = document.getElementById('login-form');
  const errorAlert = document.getElementById('error-alert');
  const errorMsg = document.getElementById('error-msg');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const submitBtn = loginForm.querySelector('.btn-submit');

  let activeRole = 'institute'; // Default active role

  // Toggle roles functionality
  toggleInstituteBtn.addEventListener('click', () => {
    activeRole = 'institute';
    toggleInstituteBtn.classList.add('active');
    toggleAdminBtn.classList.remove('active');
    idLabel.textContent = 'Institute ID';
    instituteIdInput.placeholder = 'e.g. INS-1204';
    errorAlert.style.display = 'none';
  });

  toggleAdminBtn.addEventListener('click', () => {
    activeRole = 'admin';
    toggleAdminBtn.classList.add('active');
    toggleInstituteBtn.classList.remove('active');
    idLabel.textContent = 'Admin ID';
    instituteIdInput.placeholder = 'admin';
    errorAlert.style.display = 'none';
  });

  // Handle Form Submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = instituteIdInput.value.trim();
    const password = document.getElementById('password').value;

    // Reset error
    errorAlert.style.display = 'none';
    
    // Set loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Signing in...';
    btnSpinner.style.display = 'block';

    try {
      const result = await API.login(id, password);

      if (result.success) {
        // Enforce role checks matching the selected tab
        if (result.role === 'ADMIN' && activeRole !== 'admin') {
          showError('Admin credentials cannot be used to log in as an Institute.');
          await API.logout(); // Clear the cookie set by the server
          return;
        }
        if (result.role === 'INSTITUTE' && activeRole !== 'institute') {
          showError('Institute credentials cannot be used to log in as Admin.');
          await API.logout(); // Clear the cookie set by the server
          return;
        }

        // Redirect to appropriate dashboard
        if (result.role === 'ADMIN') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/institute/dashboard';
        }
      } else {
        showError('Sign in failed. Please try again.');
      }
    } catch (err) {
      showError(err.message || 'Invalid credentials. Please check your ID and Password.');
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Sign in';
      btnSpinner.style.display = 'none';
    }
  });

  function showError(message) {
    errorMsg.textContent = message;
    errorAlert.style.display = 'flex';
  }
});
