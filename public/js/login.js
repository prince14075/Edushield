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

  let activeRole = 'institute'; 

  const rememberMeCheckbox = document.getElementById('remember-me');
  const passwordInput = document.getElementById('password');

  const getRememberedId = (role) => {
    return role === 'admin' 
      ? localStorage.getItem('remembered_admin_id') 
      : localStorage.getItem('remembered_institute_id');
  };

  const getRememberedPassword = (role) => {
    return role === 'admin' 
      ? localStorage.getItem('remembered_admin_pass') 
      : localStorage.getItem('remembered_institute_pass');
  };

  const populateCredentials = (role) => {
    const savedId = getRememberedId(role);
    const savedPass = getRememberedPassword(role);
    if (savedId) {
      instituteIdInput.value = savedId;
      passwordInput.value = savedPass || '';
      if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
    } else {
      instituteIdInput.value = '';
      passwordInput.value = '';
      if (rememberMeCheckbox) rememberMeCheckbox.checked = false;
    }
  };

  const initialRole = localStorage.getItem('remembered_role') || 'institute';
  activeRole = initialRole;

  populateCredentials(activeRole);

  if (activeRole === 'admin') {
    toggleAdminBtn.classList.add('active');
    toggleInstituteBtn.classList.remove('active');
    idLabel.textContent = 'Admin ID';
    instituteIdInput.placeholder = 'admin';
  } else {
    toggleInstituteBtn.classList.add('active');
    toggleAdminBtn.classList.remove('active');
    idLabel.textContent = 'Institute ID';
    instituteIdInput.placeholder = 'e.g. INS-1204';
  }

  toggleInstituteBtn.addEventListener('click', () => {
    activeRole = 'institute';
    toggleInstituteBtn.classList.add('active');
    toggleAdminBtn.classList.remove('active');
    idLabel.textContent = 'Institute ID';
    instituteIdInput.placeholder = 'e.g. INS-1204';
    errorAlert.style.display = 'none';

    populateCredentials('institute');
  });

  toggleAdminBtn.addEventListener('click', () => {
    activeRole = 'admin';
    toggleAdminBtn.classList.add('active');
    toggleInstituteBtn.classList.remove('active');
    idLabel.textContent = 'Admin ID';
    instituteIdInput.placeholder = 'admin';
    errorAlert.style.display = 'none';

    populateCredentials('admin');
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

        const id = instituteIdInput.value.trim();
    const password = passwordInput.value;

    if (rememberMeCheckbox && rememberMeCheckbox.checked) {
      if (activeRole === 'admin') {
        localStorage.setItem('remembered_admin_id', id);
        localStorage.setItem('remembered_admin_pass', password);
      } else {
        localStorage.setItem('remembered_institute_id', id);
        localStorage.setItem('remembered_institute_pass', password);
      }
      localStorage.setItem('remembered_role', activeRole);
    } else {
      if (activeRole === 'admin') {
        localStorage.removeItem('remembered_admin_id');
        localStorage.removeItem('remembered_admin_pass');
      } else {
        localStorage.removeItem('remembered_institute_id');
        localStorage.removeItem('remembered_institute_pass');
      }
      if (!localStorage.getItem('remembered_admin_id') && !localStorage.getItem('remembered_institute_id')) {
        localStorage.removeItem('remembered_role');
      }
    }

    errorAlert.style.display = 'none';

    submitBtn.disabled = true;
    btnText.textContent = 'Signing in...';
    btnSpinner.style.display = 'block';

    try {
      const result = await API.login(id, password);

      if (result.success) {
        if (result.role === 'ADMIN' && activeRole !== 'admin') {
          showError('Admin credentials cannot be used to log in as an Institute.');
          await API.logout(); 
          return;
        }
        if (result.role === 'INSTITUTE' && activeRole !== 'institute') {
          showError('Institute credentials cannot be used to log in as Admin.');
          await API.logout(); 
          return;
        }

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
