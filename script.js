// ---------- Donor Dataset ----------
const DONORS = [
  { id: 1, name: "Rajesh Kumar", city: "Mumbai", bloodGroup: "O+", available: true, expires: "6:30 PM", score: 62, matches: 8, accept: 63, tier: "trusted", phone: "+91-9876543210" },
  { id: 2, name: "Priya Sharma", city: "Delhi", bloodGroup: "A-", available: true, expires: "8:45 PM", score: 78, matches: 14, accept: 78, tier: "highly", phone: "+91-9876543211" },
  { id: 3, name: "Amit Patel", city: "Bangalore", bloodGroup: "B+", available: false, expires: null, score: 50, matches: 0, accept: null, tier: "new", phone: "+91-9876543212" },
  { id: 4, name: "Neha Singh", city: "Pune", bloodGroup: "O+", available: true, expires: "9:15 PM", score: 41, matches: 5, accept: 40, tier: "building", phone: "+91-9876543213" },
  { id: 5, name: "Arjun Verma", city: "Chennai", bloodGroup: "AB+", available: false, expires: null, score: 55, matches: 3, accept: 67, tier: "trusted", phone: "+91-9876543214" },
  { id: 6, name: "Deepika Roy", city: "Mumbai", bloodGroup: "B-", available: true, expires: "7:00 PM", score: 85, matches: 20, accept: 85, tier: "highly", phone: "+91-9876543215" },
  { id: 7, name: "Vikram Gupta", city: "Delhi", bloodGroup: "O+", available: true, expires: "10:00 PM", score: 30, matches: 2, accept: 50, tier: "building", phone: "+91-9876543216" },
  { id: 8, name: "Ananya Desai", city: "Bangalore", bloodGroup: "A+", available: false, expires: null, score: 50, matches: 0, accept: null, tier: "new", phone: "+91-9876543217" },
  { id: 9, name: "Sanjay Nair", city: "Pune", bloodGroup: "AB-", available: true, expires: "6:15 PM", score: 71, matches: 11, accept: 73, tier: "trusted", phone: "+91-9876543218" },
  { id: 10, name: "Ishita Kapoor", city: "Chennai", bloodGroup: "O-", available: false, expires: null, score: 58, matches: 6, accept: 67, tier: "trusted", phone: "+91-9876543219" },
];

const TIER_LABEL = { new: "New Donor", building: "Building History", trusted: "Trusted", highly: "Highly Trusted" };
const TIER_ICON  = { new: "○", building: "◐", trusted: "◑", highly: "●" };
const TIER_CLASS = { new: "badge-new", building: "badge-building", trusted: "badge-trusted", highly: "badge-highly" };

let selectedDonor = DONORS[1]; // Default to Priya Sharma for detail view
let isAvailable = false;

// ---------- Tab / Page Navigation ----------
function goTab(pageName) {
  // Update header nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-nav') === pageName);
  });

  // Update section tabs
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-tab') === pageName);
  });

  // Update page views
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.toggle('active', view.id === 'view-' + pageName);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- Render Donors Grid ----------
function donorCardHTML(d) {
  return `
    <div class="donor-card ${d.available ? '' : 'unavailable'}" onclick="showDonorDetail(${d.id})">
      <div class="dc-top">
        <div>
          <div class="dc-name">${d.name}</div>
          <div class="dc-city">📍 ${d.city}</div>
        </div>
        <span class="bg-badge mono">${d.bloodGroup}</span>
      </div>
      <div class="dc-avail">
        <span class="status-dot ${d.available ? 'on' : ''}"></span>
        ${d.available
          ? `<span class="avail-text-on">Available Now</span> <span style="color:var(--text-muted);">· expires ${d.expires}</span>`
          : `<span class="avail-text-off">Not available</span>`}
      </div>
      <div class="dc-bottom">
        <div>
          <span class="badge-pill ${TIER_CLASS[d.tier]}">${TIER_ICON[d.tier]} ${TIER_LABEL[d.tier]}</span>
          <div class="dc-meta">${d.matches} matches ${d.accept !== null ? '· ' + d.accept + '% acceptance' : ''}</div>
        </div>
        <div class="dc-score">
          <div class="num">${d.score}</div>
          <div class="lbl">reliability</div>
        </div>
      </div>
    </div>`;
}

function renderDonors(list) {
  const grid = document.getElementById('donor-grid');
  const empty = document.getElementById('empty-state');
  const countEl = document.getElementById('results-count');

  if (countEl) countEl.textContent = `${list.length} donor${list.length === 1 ? '' : 's'} found`;

  if (list.length === 0) {
    if (grid) grid.style.display = 'none';
    if (empty) empty.style.display = 'block';
  } else {
    if (grid) {
      grid.style.display = 'grid';
      grid.innerHTML = list.slice().sort((a, b) => b.score - a.score).map(donorCardHTML).join('');
    }
    if (empty) empty.style.display = 'none';
  }
}

function runSearch() {
  const bg = document.getElementById('f-bg') ? document.getElementById('f-bg').value : '';
  const cityInput = document.getElementById('f-city');
  const city = cityInput ? cityInput.value.trim().toLowerCase() : '';
  const avail = document.getElementById('f-avail') ? document.getElementById('f-avail').value : 'all';

  let filtered = DONORS.filter(d => {
    if (bg && d.bloodGroup !== bg) return false;
    if (city && !d.city.toLowerCase().includes(city)) return false;
    if (avail === 'available' && !d.available) return false;
    if (avail === 'unavailable' && d.available) return false;
    return true;
  });

  renderDonors(filtered);
}

// ---------- Show Donor Detail ----------
function showDonorDetail(donorId) {
  const donor = DONORS.find(d => d.id === donorId);
  if (!donor) return;
  selectedDonor = donor;

  const detailView = document.getElementById('view-detail');
  if (detailView) {
    detailView.innerHTML = `
      <a href="#" onclick="goTab('search'); return false;" style="color:var(--primary-red); font-size:14px; font-weight:700; text-decoration:none; display:inline-block; margin-bottom:16px;">← Back to search results</a>
      
      <div class="card-box" style="margin-bottom:24px;">
        <div style="display:flex; flex-wrap:wrap; gap:28px; justify-content:space-between; align-items:center;">
          <div>
            <h1 style="font-size:28px; font-weight:800; margin-bottom:4px;">${donor.name}</h1>
            <div style="color:var(--text-muted); margin-bottom:14px; font-size:15px;">📍 ${donor.city}</div>
            <span class="bg-badge mono" style="font-size:16px; padding:6px 14px;">${donor.bloodGroup}</span>
            <div style="margin-top:14px; color:var(--text-dark); font-weight:600;">📞 ${donor.phone}</div>
          </div>
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:20px 24px; min-width:240px;">
            <div class="status-label">Current Status</div>
            <div class="status-value" style="margin:6px 0;">
              <span class="status-dot ${donor.available ? 'on' : ''}"></span>
              <span class="${donor.available ? 'avail-text-on' : 'avail-text-off'}">${donor.available ? 'Available Now' : 'Not Available'}</span>
            </div>
            <div class="status-sub">${donor.available ? 'Expires at ' + donor.expires : 'Currently inactive'}</div>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
        <div class="card-box">
          <h3>Reliability Profile</h3>
          <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
            <span style="font-size:42px; font-weight:800; color:var(--primary-red);">${donor.score}</span>
            <div>
              <div style="font-size:12px; color:var(--text-muted);">out of 100</div>
              <span class="badge-pill ${TIER_CLASS[donor.tier]}">${TIER_ICON[donor.tier]} ${TIER_LABEL[donor.tier]}</span>
            </div>
          </div>
          <div class="stat-triple">
            <div><div class="num">${donor.matches}</div><div class="lbl">Total Matches</div></div>
            <div class="stat-accept"><div class="num">${donor.accept !== null ? donor.accept + '%' : 'N/A'}</div><div class="lbl">Acceptance Rate</div></div>
          </div>
        </div>

        <div class="card-box">
          <h3>Donation Eligibility</h3>
          <div style="background:var(--success-soft); border:1px solid #BFE6CB; border-radius:8px; padding:14px; margin-bottom:16px;">
            <div style="font-weight:700; color:var(--success-green);">✓ Eligible to Donate</div>
            <div style="font-size:13px; color:#1E8449; margin-top:2px;">All health parameters & 90-day interval satisfied.</div>
          </div>
          <div class="row-line"><span class="k">Last Donation</span><span class="v">June 30, 2026</span></div>
          <div class="row-line"><span class="k">Days Since Last Donation</span><span class="v">83 days</span></div>
        </div>
      </div>
    `;
  }
  goTab('detail');
}

// ---------- My Availability Controls ----------
function refreshStatusBox() {
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  const sub = document.getElementById('status-sub');
  const sel = document.getElementById('duration-select');

  if (isAvailable) {
    if (dot) dot.classList.add('on');
    if (text) {
      text.textContent = 'Available';
      text.style.color = 'var(--teal-green)';
    }
    const hrs = sel ? sel.value : '6';
    if (sub) sub.textContent = `${hrs}h remaining window`;
  } else {
    if (dot) dot.classList.remove('on');
    if (text) {
      text.textContent = 'Not Available';
      text.style.color = 'var(--text-dark)';
    }
    if (sub) sub.textContent = 'Currently inactive';
  }
}

function showToast(msg) {
  const t = document.getElementById('toast-banner');
  if (t) {
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }
}

function setAvailability() {
  isAvailable = true;
  refreshStatusBox();
  const sel = document.getElementById('duration-select');
  const hrs = sel ? sel.value : '6';
  showToast(`You are now available for donation for the next ${hrs} hours.`);
}

function expireAvailability() {
  isAvailable = false;
  refreshStatusBox();
  showToast('Donation availability turned off.');
}

// ---------- Modals ----------
function openModal(modalId) {
  const modal = document.getElementById('modal-' + modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById('modal-' + modalId);
  if (modal) modal.classList.remove('active');
}

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', () => {
  renderDonors(DONORS);
  refreshStatusBox();
});
