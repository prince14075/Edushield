document.addEventListener('DOMContentLoaded', async () => {
  const admin = await Auth.checkSession('ADMIN');
  if (!admin) return;

  const tableBody = document.getElementById('institutes-table-body');
  const searchInput = document.getElementById('institute-search');
  const riskFilter = document.getElementById('risk-filter');

  let allInstitutes = [];

  async function loadInstitutes() {
    try {
      const result = await API.getAdminInstitutes();
      if (result.success) {
        allInstitutes = result.data;
        renderTable(allInstitutes);
      } else {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--color-red-text);">Failed to load institutes.</td></tr>`;
      }
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--color-red-text);">Failed to load institutes.</td></tr>`;
      console.error(err);
    }
  }

  function renderTable(list) {
    tableBody.innerHTML = '';

    if (list.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--color-slate-500); padding: 2rem;">No registered coaching centers found.</td></tr>`;
      return;
    }

    list.forEach(inst => {
      const tr = document.createElement('tr');

      const isOver = inst.capacityPercentage > 100;
      const barFillColor = isOver ? 'var(--color-red)' : 'var(--color-emerald)';
      const barBgColor = isOver ? 'var(--color-red-light)' : 'var(--color-emerald-light)';
      const capText = isOver ? 'Over' : 'Safe';
      const capTextColor = isOver ? 'var(--color-red-text)' : 'var(--color-slate-600)';

      let riskBadgeHtml = '';
      if (inst.riskStatus === 'SAFE') {
        riskBadgeHtml = `<span class="dashboard-badge success" style="display: inline-flex; align-items: center; gap: 0.2rem;"><i data-lucide="shield-check" style="width: 0.8rem; height: 0.8rem;"></i>Verified Safe</span>`;
      } else if (inst.riskStatus === 'WARNING') {
        riskBadgeHtml = `<span class="dashboard-badge" style="background-color: var(--color-amber-light); color: var(--color-amber-text); border: 1px solid hsl(38, 92%, 90%); display: inline-flex; align-items: center; gap: 0.2rem;"><i data-lucide="alert-triangle" style="width: 0.8rem; height: 0.8rem;"></i>Warning</span>`;
      } else if (inst.riskStatus === 'UNSAFE') {
        riskBadgeHtml = `<span class="dashboard-badge" style="background-color: var(--color-red-light); color: var(--color-red-text); border: 1px solid hsl(0, 84%, 90%); display: inline-flex; align-items: center; gap: 0.2rem;"><i data-lucide="alert-triangle" style="width: 0.8rem; height: 0.8rem;"></i>High Risk Flag</span>`;
      } else {
        riskBadgeHtml = `<span class="dashboard-badge" style="background-color: var(--color-slate-50); color: var(--color-slate-600); border: 1px solid var(--border-color);">Pending</span>`;
      }

      tr.innerHTML = `
        <!-- Column 1: Institute Identity details -->
        <td>
          <div class="table-user-cell">
            <div class="table-user-avatar" style="${isOver ? 'background-color: var(--color-red-light); color: var(--color-red);' : ''}">
              <i data-lucide="building-2" style="width: 1.1rem; height: 1.1rem;"></i>
            </div>
            <div>
              <p class="table-user-name">${inst.name}</p>
              <p class="table-user-sub">${inst.instituteId} &bull; ${inst.city}</p>
            </div>
          </div>
        </td>

        <!-- Column 2: Capacity progress bar -->
        <td>
          <div class="capacity-bar-wrapper" style="background-color: ${barBgColor}; height: 0.5rem; max-width: 12rem; margin-bottom: 0.25rem;">
            <div class="capacity-bar-fill" style="width: ${Math.min(inst.capacityPercentage, 100)}%; background-color: ${barFillColor};"></div>
          </div>
          <span style="font-size: 0.75rem; font-weight: 600; color: ${capTextColor};">
            ${inst.capacityPercentage}% Capacity (${capText})
          </span>
        </td>

        <!-- Column 3: Risk badge status -->
        <td>
          ${riskBadgeHtml}
        </td>

        <!-- Column 4: Action button review profile -->
        <td style="text-align: right;">
          <button class="table-link review-profile-btn" style="border: none; background: transparent; cursor: pointer;" data-id="${inst.id}">
            Review Profile
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    lucide.createIcons();

    const reviewBtns = tableBody.querySelectorAll('.review-profile-btn');
    reviewBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        alert(`Mock Review: Full details query for Institute ID ${id} is fully verified.`);
      });
    });
  }

  function filterRegistry() {
    const term = searchInput.value.toLowerCase().trim();
    const risk = riskFilter.value;

    const filtered = allInstitutes.filter(inst => {
      const matchesSearch = inst.name.toLowerCase().includes(term) || inst.instituteId.toLowerCase().includes(term);
      const matchesRisk = risk === 'ALL' || inst.riskStatus === risk;
      return matchesSearch && matchesRisk;
    });

    renderTable(filtered);
  }

  searchInput.addEventListener('input', filterRegistry);
  riskFilter.addEventListener('change', filterRegistry);

  loadInstitutes();
});
