document.addEventListener('DOMContentLoaded', async () => {
  const user = await Auth.checkSession('INSTITUTE');
  if (!user) return;

  const dashboardLoading = document.getElementById('dashboard-loading');
  const dashboardView = document.getElementById('dashboard-view');
  
  const welcomeTitle = document.getElementById('welcome-title');
  const statusBadge = document.getElementById('status-badge');
  
  // Live capacity monitor elements
  const currentEnrolledCount = document.getElementById('current-enrolled-count');
  const maxAllowedCount = document.getElementById('max-allowed-count');
  const capacityPercentText = document.getElementById('capacity-percent-text');
  const capacityProgressBar = document.getElementById('capacity-progress-bar');
  const capacityStatusBadge = document.getElementById('capacity-status-badge');
  const capacityWarningAlert = document.getElementById('capacity-warning-alert');
  const alertHeader = document.getElementById('alert-header');
  const alertBody = document.getElementById('alert-body');

  // Profile details elements
  const instProfileName = document.getElementById('inst-profile-name');
  const instProfileId = document.getElementById('inst-profile-id');
  const instProfileAddress = document.getElementById('inst-profile-address');
  const verifyStatusText = document.getElementById('verify-status-text');
  const verifyStatusIcon = document.getElementById('verify-status-icon');

  // Task list and enrollments
  const complianceTaskRows = document.getElementById('compliance-task-rows');
  const recentEnrollmentsBox = document.getElementById('recent-enrollments-box');

  async function loadDashboardData() {
    try {
      const [profileRes, studentsRes] = await Promise.all([
        API.getInstituteMe(),
        API.getStudentsList()
      ]);

      dashboardLoading.style.display = 'none';
      dashboardView.style.display = 'block';

      if (profileRes.success && studentsRes.success) {
        renderProfile(profileRes.data);
        renderStudents(studentsRes.data);
      }
    } catch (err) {
      dashboardLoading.style.display = 'none';
      alert('Failed to load dashboard. Redirecting to login.');
      window.location.href = '/login';
    }
  }

  function renderProfile(profile) {
    welcomeTitle.textContent = `Welcome back, ${profile.name}`;
    instProfileName.textContent = profile.name;
    instProfileId.textContent = `ID: ${profile.instituteId}`;
    
    // Format address
    const street = profile.address?.street || '';
    const city = profile.address?.city || '';
    const state = profile.address?.state || '';
    const pincode = profile.address?.pincode || '';
    instProfileAddress.textContent = `${street}, ${city}, ${state} ${pincode}`;

    // Format Status Badge
    const riskStatus = profile.riskStatus || 'PENDING_REGISTRATION';
    statusBadge.textContent = riskStatus === 'SAFE' ? 'Verified' : riskStatus.replace('_', ' ');
    statusBadge.className = 'dashboard-badge ' + (riskStatus === 'SAFE' ? 'success' : 'alert-error');
    
    verifyStatusText.textContent = riskStatus.replace('_', ' ');
    verifyStatusText.style.color = riskStatus === 'SAFE' ? 'var(--color-emerald-text)' : 'var(--color-red-text)';
    
    // Live Capacity Monitor logic
    const current = profile.capacity?.currentlyEnrolled || 0;
    const max = profile.capacity?.maxAllowed || 0;
    const percent = max > 0 ? Math.round((current / max) * 100) : 0;

    currentEnrolledCount.textContent = current;
    maxAllowedCount.textContent = `/ ${max} students`;
    capacityPercentText.textContent = `${percent}% filled`;
    
    // Progress bar fill width
    capacityProgressBar.style.width = `${Math.min(percent, 100)}%`;

    const isOver = current > max;
    const isNear = percent >= 90;

    if (isOver) {
      capacityProgressBar.style.backgroundColor = 'var(--color-red)';
      capacityStatusBadge.textContent = 'Over Limit!';
      capacityStatusBadge.className = 'dashboard-badge alert-error';
      capacityWarningAlert.className = 'alert-box alert-error';
      alertHeader.textContent = 'DANGER: Exceeds Approved Capacity! Violation Risk';
      alertBody.textContent = 'You have exceeded your maximum allowed students based on your infrastructure size. Please halt admissions immediately to avoid penalization.';
    } else if (isNear) {
      capacityProgressBar.style.backgroundColor = 'var(--color-amber)';
      capacityStatusBadge.textContent = 'Near Capacity';
      capacityStatusBadge.className = 'dashboard-badge alert-warning';
      capacityWarningAlert.className = 'alert-box alert-warning';
      alertHeader.textContent = 'WARNING: Approaching Seating Limit';
      alertBody.textContent = 'Your enrollments are reaching maximum guidelines capacity limits. Monitor admissions closely.';
    } else {
      capacityProgressBar.style.backgroundColor = 'var(--color-emerald)';
      capacityStatusBadge.textContent = 'Compliant';
      capacityStatusBadge.className = 'dashboard-badge success';
      capacityWarningAlert.className = 'alert-box alert-success';
      alertHeader.textContent = 'Safe: Within Approved Limit';
      alertBody.textContent = "Your institute's active enrollments are compliant with the 1 sq.m per student rule.";
    }

    // Render Compliance Tasks list
    renderComplianceTasks(profile);
  }

  function renderComplianceTasks(profile) {
    complianceTaskRows.innerHTML = '';
    
    const certs = profile.safetyCertificates || [];
    const complianceDocs = [
      { name: "Fire Safety Certificate", key: "Fire", type: "Document" },
      { name: "Building Safety Certificate", key: "Building", type: "Document" },
      { name: "Statutory Undertakings", key: "Undertakings", type: "Agreement" }
    ];

    complianceDocs.forEach(doc => {
      let isVerified = false;
      let statusText = 'Not Uploaded';

      if (doc.key === 'Undertakings') {
        const agreed = profile.undertakings && Object.values(profile.undertakings).every(v => v === true);
        isVerified = agreed;
        statusText = agreed ? 'Verified ✓' : 'Pending Action';
      } else {
        const cert = certs.find(c => c.type === doc.key);
        if (cert) {
          isVerified = cert.aiVerificationStatus === 'Verified';
          statusText = cert.aiVerificationStatus === 'Pending' ? 'Pending Scan' : (isVerified ? 'Verified ✓' : 'Failed');
        }
      }

      const row = document.createElement('div');
      row.className = 'align-center justify-between';
      row.style.padding = '0.75rem';
      row.style.border = '1px solid var(--border-color)';
      row.style.borderRadius = 'var(--radius-sm)';
      row.style.backgroundColor = '#fff';

      row.innerHTML = `
        <div class="align-center" style="gap: 0.75rem;">
          <i data-lucide="${isVerified ? 'check-circle' : 'clock'}" style="width: 1.25rem; height: 1.25rem; color: ${isVerified ? 'var(--color-emerald)' : 'var(--color-amber)'}; flex-shrink: 0;"></i>
          <div>
            <p style="font-size: 0.85rem; font-weight: 700; color: var(--color-slate-900);">${doc.name}</p>
            <p style="font-size: 0.75rem; color: var(--color-slate-500);">${doc.type}</p>
          </div>
        </div>
        ${isVerified ? `
          <span style="font-size: 0.75rem; font-weight: 600; color: var(--color-slate-500); background-color: var(--color-slate-50); padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">${statusText}</span>
        ` : `
          <a href="/institute/compliance" class="btn btn-secondary" style="font-size: 0.7rem; border-radius: var(--radius-sm); padding: 0.35rem 0.75rem; box-shadow: none;">Upload</a>
        `}
      `;
      complianceTaskRows.appendChild(row);
    });

    lucide.createIcons();
  }

  function renderStudents(students) {
    recentEnrollmentsBox.innerHTML = '';
    
    const slice = students.slice(0, 3);
    
    if (slice.length === 0) {
      recentEnrollmentsBox.innerHTML = `<p style="font-size: 0.85rem; color: var(--color-slate-500); text-align: center; padding: 1rem 0;">No students enrolled yet.</p>`;
      return;
    }

    slice.forEach(student => {
      const row = document.createElement('div');
      row.className = 'justify-between align-center';
      
      row.innerHTML = `
        <div class="align-center" style="gap: 0.75rem;">
          <div class="sidebar-avatar" style="width: 2rem; height: 2rem; font-size: 0.8rem; background-color: var(--color-primary-light); color: var(--color-primary);">
            ${student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style="font-size: 0.85rem; font-weight: 700; color: var(--color-slate-900);">${student.name}</p>
            <p style="font-size: 0.75rem; color: var(--color-slate-500);">${student.courseEnrolled} &bull; ${student.age} yrs old</p>
          </div>
        </div>
        <span style="font-size: 0.75rem; color: var(--color-slate-400); font-weight: 550;">
          ${new Date(student.createdAt).toLocaleDateString()}
        </span>
      `;
      recentEnrollmentsBox.appendChild(row);
    });

    lucide.createIcons();
  }

  // Double columns responsiveness utility
  function checkDoubleColumnLayout() {
    const detailsRow = document.getElementById('dashboard-details-row');
    if (window.innerWidth >= 768) {
      detailsRow.style.gridTemplateCols = '1fr 1fr';
    } else {
      detailsRow.style.gridTemplateCols = '1fr';
    }
  }

  window.addEventListener('resize', checkDoubleColumnLayout);
  checkDoubleColumnLayout();

  // Load details
  loadDashboardData();
});
