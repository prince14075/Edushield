document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const pincodeInput = document.getElementById('pincode-input');
  
  const loadingState = document.getElementById('loading-state');
  const emptyState = document.getElementById('empty-state');
  const queriedPincodeText = document.getElementById('queried-pincode');
  const resultsList = document.getElementById('results-list');
  
  const searchSpinner = document.getElementById('search-spinner');
  const submitBtn = searchForm.querySelector('.btn-submit');

  // Input filter for numbers only
  pincodeInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });

  // Calculate safety score helper
  function calculateSafetyScore(inst) {
    let score = 100;
    
    // Capacity check
    const enrolled = inst.capacity?.currentlyEnrolled || 0;
    const max = inst.capacity?.maxAllowed || 0;
    if (enrolled >= max && max > 0) {
      score -= 20;
    }

    // Risk status
    if (inst.riskStatus === 'WARNING') score -= 15;
    if (inst.riskStatus === 'UNSAFE') score -= 50;

    // Safety NOC checks
    const certs = inst.safetyCertificates || [];
    const verifiedCerts = certs.filter(c => c.aiVerificationStatus === 'Verified').length;
    const totalCerts = certs.length;

    if (totalCerts > 0 && verifiedCerts < totalCerts) {
      score -= (totalCerts - verifiedCerts) * 10;
    }

    return Math.max(0, score);
  }

  // Handle Search Submission
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pincode = pincodeInput.value.trim();

    if (pincode.length !== 6) {
      return alert('Pincode must be exactly 6 digits.');
    }

    // Reset view states
    emptyState.style.display = 'none';
    resultsList.innerHTML = '';
    
    loadingState.style.display = 'block';
    submitBtn.disabled = true;
    searchSpinner.style.display = 'block';

    try {
      const result = await API.queryPublicInstitutes(pincode);
      
      loadingState.style.display = 'none';

      if (result.success && result.data.length > 0) {
        renderResults(result.data);
      } else {
        queriedPincodeText.textContent = pincode;
        emptyState.style.display = 'block';
      }
    } catch (err) {
      loadingState.style.display = 'none';
      alert(err.message || 'Search failed. Please try again.');
    } finally {
      submitBtn.disabled = false;
      searchSpinner.style.display = 'none';
    }
  });

  function renderResults(institutes) {
    institutes.forEach(inst => {
      const score = calculateSafetyScore(inst);
      
      // Safety Score Badge Styling
      let scoreColor = 'var(--color-emerald)';
      let scoreIcon = 'shield-check';
      let scoreText = 'Perfect 1:1 Student/Area Ratio';

      if (score < 80) {
        scoreColor = 'var(--color-red)';
        scoreIcon = 'alert-triangle';
        scoreText = 'Warning: Overcrowded / Unverified Docs';
      } else if (score < 100) {
        scoreColor = 'var(--color-amber)';
        scoreIcon = 'alert-triangle';
        scoreText = 'Approaching Max Capacity';
      }

      const card = document.createElement('div');
      card.className = 'result-card';
      card.innerHTML = `
        <!-- Left Side: Basic details -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <div class="align-center" style="gap: 0.75rem; margin-bottom: 0.25rem; flex-wrap: wrap;">
              <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--color-slate-900);">${inst.name}</h3>
              <span class="dashboard-badge success" style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase;">
                <i data-lucide="check" style="width: 0.75rem; height: 0.75rem; vertical-align: middle; margin-right: 0.1rem;"></i>
                District Verified
              </span>
            </div>
            <p style="font-size: 0.875rem; color: var(--color-slate-500); display: flex; align-items: center; gap: 0.35rem;">
              <i data-lucide="map-pin" style="width: 1rem; height: 1rem; flex-shrink: 0;"></i>
              ${inst.address.street}, ${inst.address.areaLocality}, ${inst.address.city}, ${inst.address.state} - ${inst.address.pincode}
            </p>
          </div>

          <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 1rem;">
            <div style="background-color: var(--color-slate-50); border: 1px solid var(--border-color); padding: 0.75rem 1rem; border-radius: var(--radius-sm);">
              <p style="font-size: 0.7rem; font-weight: 700; color: var(--color-slate-500); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Infrastructure</p>
              <p style="font-size: 0.875rem; font-weight: 600; color: var(--color-slate-900);">${inst.infrastructure.totalArea} sq.m (${inst.infrastructure.totalClassrooms} Rooms)</p>
            </div>
            <div style="background-color: var(--color-slate-50); border: 1px solid var(--border-color); padding: 0.75rem 1rem; border-radius: var(--radius-sm);">
              <p style="font-size: 0.7rem; font-weight: 700; color: var(--color-slate-500); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Legal Max Capacity</p>
              <p style="font-size: 0.875rem; font-weight: 600; color: var(--color-slate-900); display: flex; align-items: center; gap: 0.35rem;">
                <i data-lucide="users" style="width: 1rem; height: 1rem; color: var(--color-primary);"></i>
                ${inst.capacity.maxAllowed} Students
              </p>
            </div>
          </div>
        </div>

        <!-- Right Side: Safety Panel -->
        <div class="result-safety-score-box">
          <p style="font-size: 0.7rem; font-weight: 800; color: var(--color-primary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem;">EduShield Safety Score</p>
          
          <div class="align-center" style="gap: 0.5rem; color: ${scoreColor}; margin-bottom: 0.5rem;">
            <i data-lucide="${scoreIcon}" style="width: 2.25rem; height: 2.25rem;"></i>
            <span style="font-size: 2.25rem; font-weight: 900; letter-spacing: -0.04em;">${score}%</span>
          </div>

          <p style="font-size: 0.75rem; font-weight: 600; color: var(--color-slate-600); margin-bottom: 1rem;">${scoreText}</p>

          <button class="btn btn-primary view-audit-btn" style="width: 100%; border-radius: var(--radius-sm); font-size: 0.75rem; height: 2rem; padding: 0;" data-id="${inst._id}">
            View Audit Details
          </button>
        </div>
      `;
      resultsList.appendChild(card);
    });

    // Re-initialize icons inside dynamic content
    lucide.createIcons();

    // Bind Audit details button click
    const auditBtns = resultsList.querySelectorAll('.view-audit-btn');
    auditBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        alert(`Mock Audit: Profile details query for Mongo ID ${id} is fully verified.`);
      });
    });
  }
});
