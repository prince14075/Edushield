document.addEventListener('DOMContentLoaded', async () => {
  // Check admin session
  const admin = await Auth.checkSession('ADMIN');
  if (!admin) return;
});
