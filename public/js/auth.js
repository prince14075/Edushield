// Client-side authentication and session helper
const Auth = {
  // Query server to get logged-in profile.
  // Redirects to /login if token cookie is missing/expired.
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

      // Populate user panel fields in DOM if they exist
      Auth.populateUI(data.user);
      return data.user;
    } catch (error) {
      console.error('Session check failed:', error);
      window.location.href = '/login';
      return null;
    }
  },

  // Perform signout api call and clear local routing
  signOut: async () => {
    try {
      await API.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback redirect
      window.location.href = '/login';
    }
  },

  // Populates common dashboard profile elements
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

// Bind signout buttons globally on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const signOutBtns = document.querySelectorAll('.sign-out-btn');
  signOutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.signOut();
    });
  });
});
