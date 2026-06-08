document.addEventListener('DOMContentLoaded', async () => {
  const admin = await Auth.checkSession('ADMIN');
  if (!admin) return;
});
