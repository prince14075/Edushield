document.addEventListener('DOMContentLoaded', () => {
  const step1Form = document.getElementById('step-1-form');
  const step2Form = document.getElementById('step-2-form');
  const step3Form = document.getElementById('step-3-form');
  const sentIdentifierText = document.getElementById('sent-identifier-text');

    const s1Spinner = document.getElementById('s1-spinner');
  const s2Spinner = document.getElementById('s2-spinner');
  const s3Spinner = document.getElementById('s3-spinner');

    const backToS1Btn = document.querySelector('.back-to-s1');

  let savedIdentifier = '';
  let resetToken = '';

  step1Form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifierInput = document.getElementById('identifier');
    const identifier = identifierInput.value.trim();

    const isEmail = identifier.includes("@");
    if (isEmail && !identifier.toLowerCase().endsWith("@gmail.com")) {
      return alert("Only @gmail.com email addresses are allowed.");
    }

    const submitBtn = step1Form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    s1Spinner.style.display = 'block';

    try {
      const result = await API.sendOTP(identifier, 'Password_Reset');
      if (result.success) {
        savedIdentifier = identifier;
        sentIdentifierText.textContent = identifier;

        step1Form.classList.remove('active');
        step2Form.classList.add('active');
      } else {
        alert(result.error || 'Failed to send OTP.');
      }
    } catch (err) {
      alert(err.message || 'Failed to send OTP.');
    } finally {
      submitBtn.disabled = false;
      s1Spinner.style.display = 'none';
    }
  });

  step2Form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = document.getElementById('otp').value.trim();

    if (otp.length !== 6) {
      return alert('Please enter exactly 6 digits.');
    }

    const submitBtn = step2Form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    s2Spinner.style.display = 'block';

    try {
      const result = await API.verifyOTP(savedIdentifier, otp, 'Password_Reset');
      if (result.success && result.token) {
        resetToken = result.token;

        step2Form.classList.remove('active');
        step3Form.classList.add('active');
      } else {
        alert(result.error || 'Invalid OTP code.');
      }
    } catch (err) {
      alert(err.message || 'Failed to verify OTP.');
    } finally {
      submitBtn.disabled = false;
      s2Spinner.style.display = 'none';
    }
  });

  backToS1Btn.addEventListener('click', () => {
    step2Form.classList.remove('active');
    step1Form.classList.add('active');
  });

  step3Form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      return alert('Passwords do not match.');
    }

    if (newPassword.length < 6) {
      return alert('Password must be at least 6 characters long.');
    }

    const submitBtn = step3Form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    s3Spinner.style.display = 'block';

    try {
      const result = await API.resetPassword(resetToken, newPassword);
      if (result.success) {
        alert('Password reset successfully! You can now log in.');
        window.location.href = '/login';
      } else {
        alert(result.error || 'Password reset failed.');
      }
    } catch (err) {
      alert(err.message || 'Failed to reset password.');
    } finally {
      submitBtn.disabled = false;
      s3Spinner.style.display = 'none';
    }
  });
});
