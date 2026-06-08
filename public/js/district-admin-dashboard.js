document.addEventListener('DOMContentLoaded', async () => {
  const admin = await Auth.checkSession('ADMIN');
  if (!admin) return;

  const deoLoading = document.getElementById('deo-loading');
  const deoEmpty = document.getElementById('deo-empty');
  const pendingCounter = document.getElementById('pending-counter');
  const queueList = document.getElementById('deo-queue-list');

  async function fetchQueue() {
    deoLoading.style.display = 'block';
    deoEmpty.style.display = 'none';
    queueList.innerHTML = '';

    try {
      const res = await API.getPendingInstitutes();
      deoLoading.style.display = 'none';

      if (res.success) {
        pendingCounter.textContent = res.data.length;
        if (res.data.length === 0) {
          deoEmpty.style.display = 'block';
        } else {
          renderQueue(res.data);
        }
      }
    } catch (err) {
      deoLoading.style.display = 'none';
      deoEmpty.style.display = 'block';
      console.error(err);
    }
  }

  function renderQueue(items) {
    items.forEach(req => {
      const card = document.createElement('div');
      card.className = 'deo-card';

            const fireUrl = req.safetyCertificates?.[0]?.url || '#';
      const buildingUrl = req.safetyCertificates?.[1]?.url || '#';

            const photoHtml = req.ownerDetails?.photoUrl 
        ? `<img src="${req.ownerDetails.photoUrl}" alt="Owner Avatar" style="width: 2.5rem; height: 2.5rem; border-radius: var(--radius-full); border: 1px solid var(--border-color); object-fit: cover;">`
        : '';

      card.innerHTML = `
        <div class="deo-grid">
          
          <!-- Details panel -->
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div class="justify-between align-center" style="flex-wrap: wrap; gap: 0.5rem;">
              <div class="align-center" style="gap: 0.75rem;">
                <div class="overview-icon-box blue" style="width: 2.5rem; height: 2.5rem; border-radius: var(--radius-sm);">
                  <i data-lucide="building-2" style="width: 1.25rem; height: 1.25rem;"></i>
                </div>
                <div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--color-slate-900);">${req.name}</h3>
                  <p style="font-family: monospace; font-size: 0.75rem; color: var(--color-slate-500);">${req.instituteId}</p>
                </div>
              </div>
              <span class="dashboard-badge" style="background-color: var(--color-amber-light); color: var(--color-amber-text); border: 1px solid hsl(38, 92%, 90%); font-size: 0.65rem; font-weight: 800;">
                PENDING VERIFICATION
              </span>
            </div>

            <!-- Owner & address info -->
            <div class="deo-info-panel">
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <span class="testing-title">Owner Details</span>
                <div class="align-center" style="gap: 0.75rem;">
                  ${photoHtml}
                  <div>
                    <p style="font-size: 0.85rem; font-weight: 750; color: var(--color-slate-900);">${req.ownerDetails?.name || 'N/A'}</p>
                    <p style="font-size: 0.7rem; color: var(--color-emerald); display: flex; align-items: center; gap: 0.15rem;">
                      <i data-lucide="check" style="width: 0.75rem; height: 0.75rem;"></i> Verified Mobile
                    </p>
                    <p style="font-size: 0.7rem; color: var(--color-emerald); display: flex; align-items: center; gap: 0.15rem;">
                      <i data-lucide="check" style="width: 0.75rem; height: 0.75rem;"></i> Verified Email
                    </p>
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <span class="testing-title">Location Address</span>
                <p style="font-size: 0.8rem; color: var(--color-slate-600); display: flex; align-items: flex-start; gap: 0.25rem;">
                  <i data-lucide="map-pin" style="width: 1rem; height: 1rem; color: var(--color-slate-400); flex-shrink: 0; margin-top: 0.1rem;"></i>
                  <span>
                    ${req.address?.street || ''}, ${req.address?.areaLocality || ''}<br>
                    ${req.address?.city || ''}, ${req.address?.state || ''} - ${req.address?.pincode || ''}
                  </span>
                </p>
              </div>
            </div>

            <!-- Seating & undertakings summary -->
            <div style="display: grid; grid-template-cols: 1fr; gap: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                <span style="font-size: 0.85rem; color: var(--color-slate-600); font-weight: 550;">Max Allowed Capacity</span>
                <span style="font-size: 0.875rem; font-weight: 750; color: var(--color-primary);">${req.capacity?.maxAllowed || 0} Students</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                <span style="font-size: 0.85rem; color: var(--color-slate-600); font-weight: 550;">Undertakings Consent</span>
                <span style="font-size: 0.85rem; font-weight: 750; color: var(--color-emerald); display: flex; align-items: center; gap: 0.2rem;">
                  <i data-lucide="shield-check" style="width: 1rem; height: 1rem;"></i> Agreed (5/5)
                </span>
              </div>
            </div>

            <!-- Documents -->
            <div style="display: flex; gap: 1.5rem; font-size: 0.75rem; font-weight: 600;">
              <a href="${fireUrl}" target="_blank" style="color: var(--color-primary); text-decoration: underline; display: inline-flex; align-items: center; gap: 0.25rem;">
                <i data-lucide="file-text" style="width: 0.9rem; height: 0.9rem;"></i>
                View Fire Certificate
              </a>
              <a href="${buildingUrl}" target="_blank" style="color: var(--color-primary); text-decoration: underline; display: inline-flex; align-items: center; gap: 0.25rem;">
                <i data-lucide="file-text" style="width: 0.9rem; height: 0.9rem;"></i>
                View Building Certificate
              </a>
            </div>

          </div>

          <!-- Actions sidebar panel -->
          <div class="action-panel">
            <button class="btn btn-emerald approve-btn" style="flex: 1; border-radius: var(--radius-sm); height: 2.75rem; justify-content: center;" data-id="${req._id}">
              <i data-lucide="check-circle-2" style="width: 1.1rem; height: 1.1rem;"></i>
              Approve Request
            </button>
            <button class="btn btn-secondary reject-btn" style="flex: 1; border-radius: var(--radius-sm); height: 2.75rem; border-color: var(--color-red); color: var(--color-red); justify-content: center;" data-id="${req._id}">
              <i data-lucide="x-circle" style="width: 1.1rem; height: 1.1rem;"></i>
              Reject Request
            </button>
            <p style="font-size: 0.65rem; text-align: center; color: var(--color-slate-400); margin-top: 0.5rem;">
              Approving generates and emails credentials automatically.
            </p>
          </div>

        </div>
      `;
      queueList.appendChild(card);
    });

    lucide.createIcons();

    queueList.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.closest('.approve-btn').getAttribute('data-id');
        if (!confirm('Are you sure you want to APPROVE this application?')) return;

                try {
          const res = await API.updatePendingInstitute(id, 'Approve');
          if (res.success) {
            alert(res.message);
            fetchQueue(); 
          } else {
            alert(res.error || 'Approval failed');
          }
        } catch (err) {
          alert('Failed to approve registration');
        }
      });
    });

    queueList.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.closest('.reject-btn').getAttribute('data-id');
        if (!confirm('Are you sure you want to REJECT this application?')) return;

                try {
          const res = await API.updatePendingInstitute(id, 'Reject');
          if (res.success) {
            alert(res.message);
            fetchQueue(); 
          } else {
            alert(res.error || 'Rejection failed');
          }
        } catch (err) {
          alert('Failed to reject registration');
        }
      });
    });
  }

  fetchQueue();
});
