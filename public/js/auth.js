const Auth = {
  checkSession: async (requiredRole) => {
    try {
      const data = await API.getMe();
      if (!data.success || !data.user) {
        window.location.href = '/login';
        return null;
      }

            if (requiredRole && data.user.role !== requiredRole) {
        window.location.href = '/login';
        return null;
      }

      Auth.populateUI(data.user);
      return data.user;
    } catch (error) {
      console.error('Session check failed:', error);
      window.location.href = '/login';
      return null;
    }
  },

  signOut: async () => {
    try {
      await API.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/login';
    }
  },

  populateUI: (user) => {
    const userNameEls = document.querySelectorAll('.sidebar-user-name');
    const userRoleEls = document.querySelectorAll('.sidebar-user-role');
    const avatarEls = document.querySelectorAll('.sidebar-avatar');

    userNameEls.forEach(el => el.textContent = user.name || 'User');
    userRoleEls.forEach(el => el.textContent = user.role === 'ADMIN' ? 'HQ Admin' : `ID: ${user.instituteId}`);

        avatarEls.forEach(el => {
      const name = user.name || 'U';
      el.textContent = name.charAt(0).toUpperCase();
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const signOutBtns = document.querySelectorAll('.sign-out-btn');
  signOutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.signOut();
    });
  });
});
