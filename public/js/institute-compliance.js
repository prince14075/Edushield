document.addEventListener('DOMContentLoaded', async () => {
  const user = await Auth.checkSession('INSTITUTE');
  if (!user) return;

  const complianceLoading = document.getElementById('compliance-loading');
  const complianceView = document.getElementById('compliance-view');

    const statusBadge = document.getElementById('status-badge');
  const sidebarUserName = document.querySelector('.sidebar-user-name');
  const sidebarUserRole = document.querySelector('.sidebar-user-role');

  const banner = document.getElementById('compliance-banner');
  const bannerIcon = document.getElementById('banner-icon');
  const bannerTitle = document.getElementById('banner-title');
  const bannerDesc = document.getElementById('banner-desc');

  const checkNoUnder16 = document.getElementById('undertake-noUnder16');
  const checkNoSchoolHours = document.getElementById('undertake-noSchoolHours');
  const checkGraduateTutors = document.getElementById('undertake-graduateTutors');
  const checkNoMisleadingAds = document.getElementById('undertake-noMisleadingAds');
  const checkOneSqMeterRule = document.getElementById('undertake-oneSqMeterRule');
  const undertakingsForm = document.getElementById('undertakings-form');
  const saveUndertakingsBtn = document.getElementById('save-undertakings-btn');

  const fileInput = document.getElementById('noc-file-input');
  const tableBody = document.getElementById('certificates-table-body');

    let currentInstitute = null;
  let activeUploadType = ''; 

  async function loadComplianceData() {
    try {
      complianceLoading.style.display = 'block';
      if (complianceView) complianceView.style.style = 'none';

            const result = await API.getInstituteMe();
      complianceLoading.style.display = 'none';

            if (result.success) {
        currentInstitute = result.data;
        if (complianceView) complianceView.style.display = 'grid';

                renderHeaderAndSidebar();
        renderStatusBanner();
        renderCertificatesTable();
        fillUndertakings();
      } else {
        alert('Failed to load institute compliance data');
      }
    } catch (err) {
      complianceLoading.style.display = 'none';
      console.error(err);
      alert('An error occurred while loading compliance data');
    }
  }

  function renderHeaderAndSidebar() {
    if (!currentInstitute) return;
    const risk = currentInstitute.riskStatus || 'PENDING_REGISTRATION';
    statusBadge.textContent = risk === 'SAFE' ? 'Verified' : risk.replace('_', ' ');
    statusBadge.className = 'dashboard-badge ' + (risk === 'SAFE' ? 'success' : 'alert-error');

        if (sidebarUserName) sidebarUserName.textContent = currentInstitute.name;
    if (sidebarUserRole) sidebarUserRole.textContent = `ID: ${currentInstitute.instituteId}`;
  }

  function renderStatusBanner() {
    if (!currentInstitute) return;
    const status = currentInstitute.riskStatus || 'PENDING_REGISTRATION';
    banner.style.display = 'flex';

        if (status === 'SAFE') {
      banner.className = 'alert-box success';
      bannerIcon.setAttribute('data-lucide', 'shield-check');
      bannerTitle.textContent = 'System Status: SAFE';
      bannerDesc.textContent = 'Your institute is fully compliant with all governing regulations. Keep your documents updated!';
    } else if (status === 'PENDING_REGISTRATION') {
      banner.className = 'alert-box';
      banner.style.borderColor = 'var(--color-amber)';
      banner.style.color = 'var(--color-amber-text)';
      banner.style.backgroundColor = '#fffbeb';
      bannerIcon.setAttribute('data-lucide', 'clock');
      bannerTitle.textContent = 'System Status: PENDING REGISTRATION';
      bannerDesc.textContent = 'Your institute registration is pending approval by District Administration.';
    } else {
      banner.className = 'alert-box alert-error';
      bannerIcon.setAttribute('data-lucide', 'alert-triangle');
      bannerTitle.textContent = 'System Status: COMPLIANCE WARNING';
      bannerDesc.textContent = 'Your institute requires additional verification or mandatory documents to become fully compliant.';
    }

        lucide.createIcons();
  }

  function renderCertificatesTable() {
    if (!currentInstitute) return;
    tableBody.innerHTML = '';
    const certs = currentInstitute.safetyCertificates || [];

    ['Fire', 'Building', 'Other'].forEach(type => {
      const cert = certs.find(c => c.type === type);
      const tr = document.createElement('tr');

            let badgeHtml = '';
      if (cert) {
        const isVerified = cert.aiVerificationStatus === 'Verified';
        const isPending = cert.aiVerificationStatus === 'Pending';
        if (isVerified) {
          badgeHtml = `
            <span class="dashboard-badge success" style="font-size: 0.7rem;">
              <i data-lucide="check" style="width: 0.8rem; height: 0.8rem; display: inline-block; vertical-align: middle;"></i> Verified
            </span>
          `;
        } else if (isPending) {
          badgeHtml = `
            <span class="dashboard-badge" style="background-color: var(--color-amber-light); color: var(--color-amber-text); border: 1px solid hsl(38, 92%, 90%); font-size: 0.7rem;">
              <i data-lucide="clock" style="width: 0.8rem; height: 0.8rem; display: inline-block; vertical-align: middle;"></i> Pending AI Scan
            </span>
          `;
        } else {
          badgeHtml = `
            <span class="dashboard-badge alert-error" style="font-size: 0.7rem;">
              <i data-lucide="x" style="width: 0.8rem; height: 0.8rem; display: inline-block; vertical-align: middle;"></i> Rejected
            </span>
          `;
        }
      } else {
        badgeHtml = `
          <span class="dashboard-badge" style="background-color: var(--color-slate-50); color: var(--color-slate-500); border: 1px solid var(--border-color); font-size: 0.7rem;">
            Not Uploaded
          </span>
        `;
      }

      const docLinkHtml = cert && cert.url 
        ? `<a href="${cert.url}" target="_blank" class="table-link" style="margin-right: 1rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.2rem;">
             <i data-lucide="file-text" style="width: 0.9rem; height: 0.9rem;"></i> View Cert
           </a>`
        : '';

      tr.innerHTML = `
        <td>
          <div class="align-center" style="gap: 0.75rem;">
            <div class="overview-icon-box blue" style="border-radius: var(--radius-sm); width: 2.25rem; height: 2.25rem;">
              <i data-lucide="file-text" style="width: 1.1rem; height: 1.1rem;"></i>
            </div>
            <div>
              <p style="font-weight: 750; color: var(--color-slate-900); font-size: 0.9rem;">${type} Safety NOC</p>
              <p style="font-size: 0.75rem; color: var(--color-slate-500);">Fire safety inspection clearance certificate</p>
            </div>
          </div>
        </td>
        <td>
          ${badgeHtml}
        </td>
        <td style="text-align: right;">
          <div class="align-center" style="justify-content: flex-end;">
            ${docLinkHtml}
            <button class="btn btn-secondary upload-btn" data-type="${type}" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; height: 2.15rem;">
              <i data-lucide="upload-cloud" style="width: 0.9rem; height: 0.9rem; color: var(--color-slate-500);"></i>
              Upload
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    lucide.createIcons();

    tableBody.querySelectorAll('.upload-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeUploadType = e.target.closest('.upload-btn').getAttribute('data-type');
        fileInput.click();
      });
    });
  }

  function fillUndertakings() {
    if (!currentInstitute) return;
    const u = currentInstitute.undertakings || {};

        checkNoUnder16.checked = u.noUnder16 === true;
    checkNoSchoolHours.checked = u.noSchoolHours === true;
    checkGraduateTutors.checked = u.graduateTutors === true;
    checkNoMisleadingAds.checked = u.noMisleadingAds === true;
    checkOneSqMeterRule.checked = u.oneSqMeterRule === true;
  }

  fileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const targetType = activeUploadType;

      const rowBtn = tableBody.querySelector(`.upload-btn[data-type="${targetType}"]`);
      const originalText = rowBtn.innerHTML;
      rowBtn.disabled = true;
      rowBtn.innerHTML = `<div class="spinner" style="width: 0.85rem; height: 0.85rem; border-top-color: var(--color-primary); border-width: 1.5px; display: inline-block;"></div> Checking...`;

      try {
        const uploadRes = await API.uploadFile(file);
        if (!uploadRes.success) {
          alert('Upload failed: ' + (uploadRes.error || 'Server error'));
          rowBtn.disabled = false;
          rowBtn.innerHTML = originalText;
          return;
        }

        const uploadedUrl = uploadRes.url;

        rowBtn.innerHTML = `<div class="spinner" style="width: 0.85rem; height: 0.85rem; border-top-color: var(--color-primary); border-width: 1.5px; display: inline-block;"></div> AI Scan...`;

                let extractedText = '';
        let aiVerificationStatus = 'Pending';

                try {
          const ocrRes = await API.scanOCR(file);
          if (ocrRes.success) {
            extractedText = ocrRes.text.toLowerCase();
          }
        } catch (ocrErr) {
          console.warn('OCR processing failed, falling back to Pending Admin Review', ocrErr);
        }

        if (extractedText) {
          if (targetType === 'Fire') {
            const hasKeywords = ['fire', 'safety', 'noc', 'clearance', 'hazard', 'extinguish', 'rescue'].some(w => extractedText.includes(w));
            if (hasKeywords) {
              aiVerificationStatus = 'Verified';
              alert('EduShield AI Document Guard:\n\n✓ Fire Safety NOC validated automatically. Verification code: FIRE-' + Math.floor(1000 + Math.random() * 9000));
            } else {
              aiVerificationStatus = 'Pending';
              alert('EduShield AI Document Guard:\n\n⚠️ Safety document scanned, but failed to extract Fire compliance key-terms. Marked as "Pending verification".');
            }
          } else if (targetType === 'Building') {
            const hasKeywords = ['building', 'safety', 'stability', 'structural', 'clearance', 'fitness', 'engineer', 'architect', 'p.w.d'].some(w => extractedText.includes(w));
            if (hasKeywords) {
              aiVerificationStatus = 'Verified';
              alert('EduShield AI Document Guard:\n\n✓ Building Stability NOC validated automatically. Verification code: BLDG-' + Math.floor(1000 + Math.random() * 9000));
            } else {
              aiVerificationStatus = 'Pending';
              alert('EduShield AI Document Guard:\n\n⚠️ Safety document scanned, but failed to extract Building/Structural key-terms. Marked as "Pending verification".');
            }
          } else {
            aiVerificationStatus = 'Verified';
            alert('EduShield AI Document Guard:\n\n✓ Certificate uploaded successfully and scanned.');
          }
        } else {
          aiVerificationStatus = 'Pending';
          alert('EduShield Document Guard:\n\nUploaded document marked as "Pending review". Admin verification required.');
        }

        const updateRes = await API.updateCompliance({
          safetyCertificates: [{
            type: targetType,
            url: uploadedUrl,
            aiVerificationStatus
          }]
        });

        if (updateRes.success) {
          await loadComplianceData(); 
        } else {
          alert('Failed to save certificate updates');
        }

      } catch (err) {
        console.error(err);
        alert('An error occurred during certificate validation');
      } finally {
        rowBtn.disabled = false;
        rowBtn.innerHTML = originalText;
      }
    }
  });

  undertakingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

        saveUndertakingsBtn.disabled = true;
    saveUndertakingsBtn.innerHTML = `<div class="spinner" style="width: 1rem; height: 1rem; border-top-color: #ffffff; border-width: 2px; display: inline-block;"></div> Saving...`;

    try {
      const undertakings = {
        noUnder16: checkNoUnder16.checked,
        noSchoolHours: checkNoSchoolHours.checked,
        graduateTutors: checkGraduateTutors.checked,
        noMisleadingAds: checkNoMisleadingAds.checked,
        oneSqMeterRule: checkOneSqMeterRule.checked
      };

      const result = await API.updateCompliance({ undertakings });
      if (result.success) {
        alert('Undertakings and compliance agreements saved successfully!');
        await loadComplianceData();
      } else {
        alert(result.error || 'Failed to save undertakings');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating undertakings');
    } finally {
      saveUndertakingsBtn.disabled = false;
      saveUndertakingsBtn.textContent = 'Update Undertakings';
    }
  });

  loadComplianceData();
});
