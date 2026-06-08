document.addEventListener('DOMContentLoaded', async () => {
  const user = await Auth.checkSession('INSTITUTE');
  if (!user) return;

  const tableBody = document.getElementById('students-table-body');
  const searchInput = document.getElementById('students-search');
  const totalCountBadge = document.getElementById('total-count-badge');
  const statusBadge = document.getElementById('status-badge');

  let allStudents = [];

  // Fetch status badge verified details
  async function fetchStatus() {
    try {
      const res = await API.getInstituteMe();
      if (res.success) {
        const risk = res.data.riskStatus || 'PENDING_REGISTRATION';
        statusBadge.textContent = risk === 'SAFE' ? 'Verified' : risk.replace('_', ' ');
        statusBadge.className = 'dashboard-badge ' + (risk === 'SAFE' ? 'success' : 'alert-error');
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Fetch student roster
  async function loadStudents() {
    try {
      const result = await API.getStudentsList();
      if (result.success) {
        allStudents = result.data;
        totalCountBadge.textContent = `Total Enrolled: ${allStudents.length}`;
        renderTable(allStudents);
      } else {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-red-text);">Failed to load students.</td></tr>`;
      }
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-red-text);">Failed to load students.</td></tr>`;
      console.error(err);
    }
  }

  // Render list
  function renderTable(list) {
    tableBody.innerHTML = '';

    if (list.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 4rem 2rem;">
            <div class="sidebar-avatar" style="width: 3rem; height: 3rem; background-color: var(--color-slate-50); color: var(--color-slate-400); margin: 0 auto 1rem;">
              <i data-lucide="users" style="width: 1.5rem; height: 1.5rem;"></i>
            </div>
            <h3 style="font-size: 0.95rem; font-weight: 750; color: var(--color-slate-900);">No students found</h3>
            <p style="font-size: 0.8rem; color: var(--color-slate-500); margin-top: 0.25rem; margin-bottom: 1rem;">Get started by enrolling your first student.</p>
            <a href="/institute/students/new" class="btn btn-secondary" style="border-radius: var(--radius-sm); font-size: 0.75rem;">Enroll Student</a>
          </td>
        </tr>
      `;
      lucide.createIcons();
      return;
    }

    list.forEach(student => {
      const tr = document.createElement('tr');
      
      const date = new Date(student.enrollmentDate || student.createdAt).toLocaleDateString();
      const guardianHtml = student.guardianDetails?.contact 
        ? `<p class="table-user-sub">Guardian: ${student.guardianDetails.contact}</p>` 
        : '';

      tr.innerHTML = `
        <!-- Column 1: Student details -->
        <td>
          <div class="table-user-cell">
            <div class="table-user-avatar">
              ${student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p class="table-user-name">${student.name}</p>
              <p class="table-user-sub">ID: ${student.studentId || 'N/A'}</p>
            </div>
          </div>
        </td>

        <!-- Column 2: Course details -->
        <td>
          <p style="font-weight: 600; color: var(--color-slate-900);">${student.courseEnrolled}</p>
          <p class="table-user-sub">${student.age} yrs old</p>
        </td>

        <!-- Column 3: Contact details -->
        <td>
          <p style="color: var(--color-slate-700); font-weight: 500;">${student.email}</p>
          ${guardianHtml}
        </td>

        <!-- Column 4: Date -->
        <td>
          <span style="color: var(--color-slate-600); font-weight: 550;">${date}</span>
        </td>

        <!-- Column 5: Status -->
        <td style="text-align: right;">
          <span class="dashboard-badge success" style="font-size: 0.65rem; font-weight: 750;">
            Active
          </span>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    lucide.createIcons();
  }

  // Filter roster
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const filtered = allStudents.filter(student => 
      student.name.toLowerCase().includes(term) || 
      student.courseEnrolled.toLowerCase().includes(term) || 
      (student.studentId && student.studentId.toLowerCase().includes(term))
    );
    renderTable(filtered);
  });

  // Init
  fetchStatus();
  loadStudents();
});
