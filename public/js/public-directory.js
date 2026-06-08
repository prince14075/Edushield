document.addEventListener('DOMContentLoaded', () => {
  const dirLoading = document.getElementById('dir-loading');
  const dirEmpty = document.getElementById('dir-empty');
  const dirResultsGrid = document.getElementById('dir-results-grid');
  const directorySearch = document.getElementById('directory-search');

  let allInstitutes = [];

  async function fetchDirectory() {
    try {
      const result = await API.getPublicInstitutes();
      dirLoading.style.display = 'none';

      if (result.success) {
        allInstitutes = result.data;
        renderDirectory(allInstitutes);
      } else {
        dirEmpty.style.display = 'block';
      }
    } catch (err) {
      dirLoading.style.display = 'none';
      dirEmpty.style.display = 'block';
      console.error('Failed to load directory:', err);
    }
  }

  function renderDirectory(list) {
    dirResultsGrid.innerHTML = '';

        if (list.length === 0) {
      dirEmpty.style.display = 'block';
      return;
    }

    dirEmpty.style.display = 'none';

    list.forEach((inst, index) => {
      const card = document.createElement('div');
      card.className = 'portal-card';
      card.style.position = 'relative';
      card.style.overflow = 'hidden';
      card.style.padding = '2rem 1.75rem 2.25rem';

      let headerCautionHtml = '';
      let marginClass = '';
      if (!inst.safe) {
        headerCautionHtml = `
          <div style="position: absolute; top: 0; left: 0; right: 0; background-color: var(--color-amber); color: #fff; font-size: 0.7rem; font-weight: 800; padding: 0.35rem; text-align: center; text-transform: uppercase;">
            Caution: ${inst.issue}
          </div>
        `;
        marginClass = 'margin-top: 0.75rem;';
      }

      const badgeClass = inst.safe ? 'success' : 'alert-error';
      const badgeIcon = inst.safe ? 'shield-check' : 'alert-triangle';
      const badgeText = inst.status;

      card.innerHTML = `
        ${headerCautionHtml}
        
        <div class="justify-between align-center" style="margin-bottom: 1rem; ${marginClass}">
          <div class="portal-icon-wrapper" style="margin: 0; width: 2.75rem; height: 2.75rem; background-color: var(--color-slate-50); color: var(--color-slate-500);">
            <i data-lucide="building-2" style="width: 1.25rem; height: 1.25rem;"></i>
          </div>
          <span class="dashboard-badge ${badgeClass}" style="display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.65rem; font-weight: 750;">
            <i data-lucide="${badgeIcon}" style="width: 0.8rem; height: 0.8rem;"></i>
            ${badgeText}
          </span>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column;">
          <h3 class="portal-title" style="font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--color-slate-900); font-weight: 800;">${inst.name}</h3>
          <p style="font-size: 0.8rem; color: var(--color-slate-500); display: flex; align-items: center; gap: 0.25rem; margin-bottom: 1.5rem;">
            <i data-lucide="map-pin" style="width: 0.9rem; height: 0.9rem;"></i>
            ${inst.location}
          </p>

          <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 1rem; margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <div>
              <p style="font-size: 0.65rem; font-weight: 700; color: var(--color-slate-400); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.15rem;">Courses</p>
              <p style="font-size: 0.8rem; font-weight: 600; color: var(--color-slate-700); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${inst.courses}</p>
            </div>
            <div>
              <p style="font-size: 0.65rem; font-weight: 700; color: var(--color-slate-400); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.15rem;">Admissions</p>
              <p style="font-size: 0.8rem; font-weight: 750; color: ${inst.capacity === 'Full' ? 'var(--color-red)' : 'var(--color-emerald)'};">${inst.capacity}</p>
            </div>
          </div>
        </div>

        <!-- Hover Overlay -->
        <div class="hover-overlay">
          <button class="btn btn-emerald view-profile-btn" style="width: 100%; border-radius: var(--radius-sm); font-size: 0.8rem; background-color: var(--color-emerald);" data-id="${inst.id}">
            View Full Profile
          </button>
        </div>
      `;
      dirResultsGrid.appendChild(card);
    });

    lucide.createIcons();

    const profileBtns = dirResultsGrid.querySelectorAll('.view-profile-btn');
    profileBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        alert(`Mock Review: Full details query for Institute ID ${id} is fully verified.`);
      });
    });
  }

  directorySearch.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const filtered = allInstitutes.filter(inst => 
      inst.name.toLowerCase().includes(term) || 
      inst.location.toLowerCase().includes(term)
    );
    renderDirectory(filtered);
  });

  fetchDirectory();
});
