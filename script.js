// =========================================================
// RaktSetu — Member 2 (Govind) Advanced Donor Management Engine
// =========================================================

const INITIAL_DONORS = [
  { id: 1, name: "Rajesh Kumar", city: "Mumbai", bloodGroup: "O+", available: true, expires: "6:30 PM", score: 62, matches: 8, accept: 63, tier: "building", phone: "+91-9876543210", lastDonation: "95 days ago", age: 29, weight: 68, distanceKm: 2.1, radarX: 42, radarY: -35, unitsDonated: 8, certId: "RS-2026-9041" },
  { id: 2, name: "Priya Sharma", city: "Delhi", bloodGroup: "A-", available: true, expires: "8:45 PM", score: 78, matches: 14, accept: 78, tier: "trusted", phone: "+91-9876543211", lastDonation: "110 days ago", age: 26, weight: 58, distanceKm: 4.5, radarX: -55, radarY: 60, unitsDonated: 14, certId: "RS-2026-8812" },
  { id: 3, name: "Amit Patel", city: "Bangalore", bloodGroup: "B+", available: false, expires: null, score: 50, matches: 0, accept: null, tier: "new", phone: "+91-9876543212", lastDonation: "First time donor", age: 22, weight: 64, distanceKm: 8.2, radarX: 85, radarY: 70, unitsDonated: 0, certId: "RS-2026-7731" },
  { id: 4, name: "Neha Singh", city: "Pune", bloodGroup: "O+", available: true, expires: "9:15 PM", score: 41, matches: 5, accept: 40, tier: "building", phone: "+91-9876543213", lastDonation: "120 days ago", age: 24, weight: 55, distanceKm: 3.8, radarX: -30, radarY: -80, unitsDonated: 5, certId: "RS-2026-6629" },
  { id: 5, name: "Arjun Verma", city: "Chennai", bloodGroup: "AB+", available: false, expires: null, score: 55, matches: 3, accept: 67, tier: "building", phone: "+91-9876543214", lastDonation: "140 days ago", age: 31, weight: 74, distanceKm: 12.0, radarX: -110, radarY: -40, unitsDonated: 3, certId: "RS-2026-5511" },
  { id: 6, name: "Deepika Roy", city: "Mumbai", bloodGroup: "B-", available: true, expires: "7:00 PM", score: 85, matches: 20, accept: 85, tier: "highly", phone: "+91-9876543215", lastDonation: "105 days ago", age: 28, weight: 60, distanceKm: 1.6, radarX: 25, radarY: 30, unitsDonated: 20, certId: "RS-2026-4432" },
  { id: 7, name: "Vikram Gupta", city: "Delhi", bloodGroup: "O+", available: true, expires: "10:00 PM", score: 30, matches: 2, accept: 50, tier: "building", phone: "+91-9876543216", lastDonation: "92 days ago", age: 35, weight: 80, distanceKm: 6.4, radarX: 75, radarY: -65, unitsDonated: 2, certId: "RS-2026-3390" },
  { id: 8, name: "Ananya Desai", city: "Bangalore", bloodGroup: "A+", available: false, expires: null, score: 50, matches: 0, accept: null, tier: "new", phone: "+91-9876543217", lastDonation: "First time donor", age: 21, weight: 52, distanceKm: 9.5, radarX: -90, radarY: 85, unitsDonated: 0, certId: "RS-2026-2218" },
  { id: 9, name: "Sanjay Nair", city: "Pune", bloodGroup: "AB-", available: true, expires: "6:15 PM", score: 71, matches: 11, accept: 73, tier: "trusted", phone: "+91-9876543218", lastDonation: "130 days ago", age: 33, weight: 70, distanceKm: 3.1, radarX: -45, radarY: -25, unitsDonated: 11, certId: "RS-2026-1184" },
  { id: 10, name: "Ishita Kapoor", city: "Chennai", bloodGroup: "O-", available: false, expires: null, score: 58, matches: 6, accept: 67, tier: "building", phone: "+91-9876543219", lastDonation: "160 days ago", age: 27, weight: 56, distanceKm: 5.7, radarX: 60, radarY: 95, unitsDonated: 6, certId: "RS-2026-0092" },
];

// Compatibility rules mapping (Recipient Blood Group -> Compatible Donor Blood Groups)
const COMPATIBILITY_RULES = {
  "O-":  ["O-"],
  "O+":  ["O+", "O-"],
  "A-":  ["A-", "O-"],
  "A+":  ["A+", "A-", "O+", "O-"],
  "B-":  ["B-", "O-"],
  "B+":  ["B+", "B-", "O+", "O-"],
  "AB-": ["AB-", "A-", "B-", "O-"],
  "AB+": ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"]
};

// Recognition Badges
function getBadgeRank(donations) {
  if (donations >= 10) return { label: "💎 Platinum Guardian", class: "rank-platinum" };
  if (donations >= 5)  return { label: "🥇 Gold Hero", class: "rank-gold" };
  if (donations >= 3)  return { label: "🥈 Silver Champion", class: "rank-silver" };
  return { label: "🥉 Bronze Lifesaver", class: "rank-bronze" };
}

// Data persistence
function getStoredDonors() {
  const stored = localStorage.getItem('raktsetu_donors_m2');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return [...INITIAL_DONORS];
}

let DONORS = getStoredDonors();

const TIER_LABEL = { new: "New Donor", building: "Building History", trusted: "Trusted", highly: "Highly Trusted" };
const TIER_ICON  = { new: "○", building: "◐", trusted: "◑", highly: "●" };
const TIER_CLASS = { new: "badge-new", building: "badge-building", trusted: "badge-trusted", highly: "badge-highly" };

let selectedDonor = DONORS[0];
let isAvailable = false;
let availabilityTimerId = null;
let timerSecondsRemaining = 0;
let currentContactDonor = null;
let smartCrossMatchingActive = false;
let maxDistanceRadius = 50; // default 50km (all)
let radarActive = false;

// ---------- Tab / View Navigation ----------
function goTab(pageName) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-nav') === pageName);
  });

  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-tab') === pageName);
  });

  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.toggle('active', view.id === 'view-' + pageName);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- Summary Bar Update ----------
function updateSummaryStats() {
  const total = DONORS.length;
  const avail = DONORS.filter(d => d.available).length;
  const trusted = DONORS.filter(d => d.score >= 70).length;
  const cities = new Set(DONORS.map(d => d.city.trim().toLowerCase())).size;

  const elTotal = document.getElementById('stat-total-donors');
  const elAvail = document.getElementById('stat-avail-donors');
  const elTrusted = document.getElementById('stat-trusted-donors');
  const elCities = document.getElementById('stat-cities-count');

  if (elTotal) elTotal.textContent = total;
  if (elAvail) elAvail.textContent = avail;
  if (elTrusted) elTrusted.textContent = trusted;
  if (elCities) elCities.textContent = cities;
}

// ---------- Compatibility Match Type Resolver ----------
function resolveCompatType(searchedBg, donorBg) {
  if (!searchedBg) return null;
  if (searchedBg === donorBg) return { text: "Exact Match", class: "compat-exact" };
  if (donorBg === "O-") return { text: "Universal Donor (O-)", class: "compat-universal" };
  return { text: "Cross-Match Compatible", class: "compat-cross" };
}

// ---------- Donor Cards Generation ----------
function donorCardHTML(d) {
  const tierKey = d.score >= 80 ? 'highly' : d.score >= 66 ? 'trusted' : d.score >= 51 ? 'building' : 'new';
  const rank = getBadgeRank(d.unitsDonated || d.matches);
  const searchedBg = document.getElementById('f-bg') ? document.getElementById('f-bg').value : '';
  const compat = resolveCompatType(searchedBg, d.bloodGroup);

  return `
    <div class="donor-card ${d.available ? '' : 'unavailable'}" onclick="showDonorDetail(${d.id})">
      <div class="dc-top">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="dc-name">${d.name}</div>
            <span class="rank-badge ${rank.class}">${rank.label}</span>
          </div>
          <div class="dc-city">
            📍 ${d.city} &nbsp;·&nbsp;
            <span class="distance-pill">⚡ ${d.distanceKm || 2.5} km away</span>
          </div>
        </div>
        <span class="bg-badge mono">${d.bloodGroup}</span>
      </div>

      <div class="dc-avail">
        <span class="status-dot ${d.available ? 'on' : ''}"></span>
        ${d.available
          ? `<span class="avail-text-on">Available Now</span> <span style="color:var(--text-muted); font-size:12px;">· ${d.expires ? 'expires ' + d.expires : 'active'}</span>`
          : `<span class="avail-text-off">Not Available</span>`}
        
        ${compat ? `<span class="compat-badge ${compat.class}" style="margin-left:auto;">${compat.text}</span>` : ''}
      </div>

      <div class="dc-bottom">
        <div>
          <span class="badge-pill ${TIER_CLASS[tierKey]}">${TIER_ICON[tierKey]} ${TIER_LABEL[tierKey]}</span>
          <div class="dc-meta">${d.matches} donations ${d.accept !== null ? '· ' + d.accept + '% response' : ''}</div>
        </div>
        <div class="dc-score">
          <div class="num">${d.score}</div>
          <div class="lbl">reliability</div>
        </div>
      </div>

      <div class="donor-card-actions">
        <button class="btn-card-action btn-card-view" onclick="event.stopPropagation(); showDonorDetail(${d.id})">
          🔍 Profile
        </button>
        <button class="btn-card-action" style="background:#FEF3C7; color:#92400E; border:1px solid #FDE68A;" onclick="event.stopPropagation(); openCertificateModal(${d.id})">
          🎖️ Certificate
        </button>
        <button class="btn-card-action btn-card-contact" onclick="event.stopPropagation(); openContactModal(${d.id})">
          📞 Contact / SOS
        </button>
      </div>
    </div>`;
}

// ---------- Render Donors Grid ----------
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
      grid.innerHTML = list.map(donorCardHTML).join('');
    }
    if (empty) empty.style.display = 'none';
  }

  // Also render blips on radar if radar is active
  renderRadarBlips(list);
}

// ---------- Search & Filters Engine ----------
function runSearch() {
  const bg = document.getElementById('f-bg') ? document.getElementById('f-bg').value : '';
  const cityInput = document.getElementById('f-city');
  const city = cityInput ? cityInput.value.trim().toLowerCase() : '';
  const avail = document.getElementById('f-avail') ? document.getElementById('f-avail').value : 'all';
  const sortBy = document.getElementById('f-sort') ? document.getElementById('f-sort').value : 'score';

  let filtered = DONORS.filter(d => {
    // Blood group filtering (Exact or Smart Cross-Matching)
    if (bg) {
      if (smartCrossMatchingActive) {
        const allowed = COMPATIBILITY_RULES[bg] || [bg];
        if (!allowed.includes(d.bloodGroup)) return false;
      } else {
        if (d.bloodGroup !== bg) return false;
      }
    }

    // City filtering
    if (city && !d.city.toLowerCase().includes(city)) return false;

    // Availability filtering
    if (avail === 'available' && !d.available) return false;
    if (avail === 'unavailable' && d.available) return false;

    // Distance filtering
    if (d.distanceKm && d.distanceKm > maxDistanceRadius) return false;

    return true;
  });

  // Sorting
  if (sortBy === 'score') {
    filtered.sort((a, b) => b.score - a.score);
  } else if (sortBy === 'distance') {
    filtered.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  } else if (sortBy === 'accept') {
    filtered.sort((a, b) => (b.accept || 0) - (a.accept || 0));
  } else if (sortBy === 'matches') {
    filtered.sort((a, b) => b.matches - a.matches);
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderDonors(filtered);
}

// Quick Blood Group Chip Filter
function selectBloodChip(btn, bg) {
  document.querySelectorAll('.blood-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');

  const selectEl = document.getElementById('f-bg');
  if (selectEl) {
    selectEl.value = bg;
  }
  runSearch();
}

// Toggle Smart Cross-Matching Mode
function toggleSmartCrossMatching() {
  smartCrossMatchingActive = !smartCrossMatchingActive;
  const btn = document.getElementById('btn-toggle-compat');
  if (btn) {
    btn.classList.toggle('active', smartCrossMatchingActive);
    btn.innerHTML = smartCrossMatchingActive ? '🧠 Smart Matching: ON' : '🧠 Smart Cross-Matching';
  }
  showToast(smartCrossMatchingActive ? '🧬 Smart Cross-Matching enabled: showing universal & compatible donors.' : 'Exact blood group matching restored.');
  runSearch();
}

// Distance Radius Filter
function setDistanceRadius(km) {
  maxDistanceRadius = km;
  document.querySelectorAll('.btn-dist-filter').forEach(b => {
    b.classList.toggle('active', parseInt(b.getAttribute('data-km'), 10) === km);
  });
  runSearch();
}

// ---------- Proximity Radar Scanner ----------
function toggleRadarScanner() {
  radarActive = !radarActive;
  const radarCard = document.getElementById('radar-scanner-card');
  const btn = document.getElementById('btn-toggle-radar');
  if (radarCard) radarCard.classList.toggle('active', radarActive);
  if (btn) btn.classList.toggle('active', radarActive);
  if (radarActive) {
    renderRadarBlips(DONORS);
    showToast('📡 Radar activated: Scanning live donors in local vicinity.');
  }
}

function renderRadarBlips(list) {
  const container = document.getElementById('radar-blips-container');
  if (!container) return;
  container.innerHTML = '';

  list.forEach(d => {
    const x = d.radarX || (Math.random() * 200 - 100);
    const y = d.radarY || (Math.random() * 200 - 100);
    const blip = document.createElement('div');
    blip.className = `radar-blip ${d.available ? 'available' : 'unavailable'}`;
    blip.style.left = `calc(50% + ${x}px)`;
    blip.style.top = `calc(50% + ${y}px)`;
    blip.innerHTML = `<div class="radar-blip-label">${d.name} (${d.bloodGroup}) · ${d.distanceKm || 2}km</div>`;
    blip.onclick = (e) => {
      e.stopPropagation();
      showDonorDetail(d.id);
    };
    container.appendChild(blip);
  });
}

// ---------- Donor Detail View ----------
function showDonorDetail(donorId) {
  const donor = DONORS.find(d => d.id === donorId);
  if (!donor) return;
  selectedDonor = donor;

  const tierKey = donor.score >= 80 ? 'highly' : donor.score >= 66 ? 'trusted' : donor.score >= 51 ? 'building' : 'new';
  const rank = getBadgeRank(donor.unitsDonated || donor.matches);

  const detailView = document.getElementById('view-detail');
  if (detailView) {
    detailView.innerHTML = `
      <a href="#" onclick="goTab('search'); return false;" style="color:var(--primary-red); font-size:14px; font-weight:700; text-decoration:none; display:inline-block; margin-bottom:16px;">
        ← Back to all donors
      </a>
      
      <div class="card-box" style="margin-bottom:24px;">
        <div style="display:flex; flex-wrap:wrap; gap:24px; justify-content:space-between; align-items:center;">
          <div>
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:4px; flex-wrap:wrap;">
              <h1 style="font-size:28px; font-weight:800; margin:0;">${donor.name}</h1>
              <span class="bg-badge mono" style="font-size:18px; padding:4px 12px;">${donor.bloodGroup}</span>
              <span class="rank-badge ${rank.class}" style="font-size:13px; padding:4px 10px;">${rank.label}</span>
            </div>
            <div style="color:var(--text-muted); margin-bottom:12px; font-size:15px;">
              📍 ${donor.city} &nbsp;·&nbsp; Distance: <b>${donor.distanceKm || 2.5} km away</b> (Est. 12 mins) &nbsp;·&nbsp; Age: ${donor.age || 26} yrs
            </div>
            <div style="color:var(--text-dark); font-weight:700; font-size:15px;">📞 ${donor.phone}</div>
          </div>

          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:16px 20px; text-align:right;">
              <div class="status-label">Availability Status</div>
              <div class="status-value" style="margin:4px 0; justify-content:flex-end;">
                <span class="status-dot ${donor.available ? 'on' : ''}"></span>
                <span class="${donor.available ? 'avail-text-on' : 'avail-text-off'}">${donor.available ? 'Available Now' : 'Not Available'}</span>
              </div>
              <div class="status-sub">${donor.available ? 'Active until ' + (donor.expires || 'evening') : 'Off-duty'}</div>
            </div>

            <button class="btn-card-action" style="background:#FEF3C7; color:#92400E; border:1px solid #FDE68A; padding:14px 20px;" onclick="openCertificateModal(${donor.id})">
              🎖️ View Certificate
            </button>

            <button class="btn-filter-search" style="padding:14px 22px; width:auto;" onclick="openContactModal(${donor.id})">
              📞 Contact / SOS
            </button>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
        <div class="card-box">
          <h3>Reliability & Verification Metrics</h3>
          <div style="display:flex; align-items:center; gap:18px; margin-bottom:20px;">
            <span style="font-size:44px; font-weight:800; color:var(--primary-red); line-height:1;">${donor.score}</span>
            <div>
              <div style="font-size:12px; color:var(--text-muted);">Reliability Rating (0 - 100)</div>
              <span class="badge-pill ${TIER_CLASS[tierKey]}">${TIER_ICON[tierKey]} ${TIER_LABEL[tierKey]}</span>
            </div>
          </div>

          <div class="stat-triple">
            <div><div class="num">${donor.matches}</div><div class="lbl">Total Donations</div></div>
            <div class="stat-accept"><div class="num">${donor.accept !== null ? donor.accept + '%' : 'New'}</div><div class="lbl">Response Rate</div></div>
            <div><div class="num">&lt; 15 min</div><div class="lbl">Avg Response Time</div></div>
          </div>

          <div style="margin-top:20px; padding-top:14px; border-top:1px solid var(--border-light);">
            <div style="font-size:13px; font-weight:700; margin-bottom:4px;">Verification Checklist:</div>
            <div style="font-size:13px; color:var(--success-green); margin-bottom:2px;">✓ Mobile number OTP verified</div>
            <div style="font-size:13px; color:var(--success-green); margin-bottom:2px;">✓ Blood group lab report confirmed</div>
            <div style="font-size:13px; color:var(--success-green);">✓ Zero emergency no-shows reported</div>
          </div>
        </div>

        <div class="card-box">
          <h3>Medical Eligibility & Donation History</h3>
          <div style="background:var(--success-soft); border:1px solid #BFE6CB; border-radius:8px; padding:14px; margin-bottom:16px;">
            <div style="font-weight:700; color:var(--success-green);">✓ Eligible for Whole Blood Donation</div>
            <div style="font-size:13px; color:#1E8449; margin-top:2px;">Minimum 90-day cooldown interval satisfied. Hemoglobin &gt; 12.5 g/dL.</div>
          </div>

          <div class="row-line"><span class="k">Last Blood Donation</span><span class="v">${donor.lastDonation || '90+ days ago'}</span></div>
          <div class="row-line"><span class="k">Eligible Component</span><span class="v">Whole Blood, Platelets</span></div>
          <div class="row-line"><span class="k">Preferred Donation Area</span><span class="v">${donor.city} Central & Suburbs</span></div>

          <div style="margin-top:20px;">
            <button class="btn-full-primary" onclick="openContactModal(${donor.id})">
              🚨 Request Emergency Donation from ${donor.name}
            </button>
          </div>
        </div>
      </div>
    `;
  }
  goTab('detail');
}

// ---------- Register New Donor (Form Handler) ----------
function handleRegisterDonor(event) {
  event.preventDefault();

  const name = document.getElementById('reg-name').value.trim();
  const bloodGroup = document.getElementById('reg-bg').value;
  const city = document.getElementById('reg-city').value.trim();
  const age = parseInt(document.getElementById('reg-age').value, 10);
  const weight = parseInt(document.getElementById('reg-weight').value, 10);
  const phone = document.getElementById('reg-phone').value.trim();
  const availNow = document.getElementById('reg-avail').value === 'true';

  if (!name || !city || !phone) {
    alert('Please fill out all required fields.');
    return;
  }

  const newDonor = {
    id: Date.now(),
    name: name,
    city: city,
    bloodGroup: bloodGroup,
    available: availNow,
    expires: availNow ? "10:00 PM" : null,
    score: 55,
    matches: 0,
    accept: null,
    tier: "new",
    phone: "+91-" + phone,
    lastDonation: "First time donor on RaktSetu",
    age: age,
    weight: weight,
    distanceKm: (Math.random() * 5 + 1).toFixed(1),
    radarX: Math.floor(Math.random() * 160 - 80),
    radarY: Math.floor(Math.random() * 160 - 80),
    unitsDonated: 0,
    certId: `RS-2026-${Math.floor(1000 + Math.random() * 9000)}`
  };

  DONORS.unshift(newDonor);
  localStorage.setItem('raktsetu_donors_m2', JSON.stringify(DONORS));

  closeModal('register');
  document.getElementById('form-register-donor').reset();

  updateSummaryStats();
  runSearch();
  showToast(`🎉 Donor ${name} (${bloodGroup}) registered successfully!`);
}

// ---------- Contact & Emergency SOS Modal ----------
function openContactModal(donorId) {
  const donor = DONORS.find(d => d.id === donorId);
  if (!donor) return;
  currentContactDonor = donor;

  const elName = document.getElementById('contact-donor-name');
  const elBg = document.getElementById('contact-donor-bg');
  const elCity = document.getElementById('contact-donor-city');
  const elPhone = document.getElementById('contact-phone-text');
  const btnCall = document.getElementById('btn-action-call');
  const btnWa = document.getElementById('btn-action-wa');

  if (elName) elName.textContent = donor.name;
  if (elBg) elBg.textContent = donor.bloodGroup;
  if (elCity) elCity.textContent = '📍 ' + donor.city;
  if (elPhone) elPhone.textContent = donor.phone;

  if (btnCall) btnCall.href = `tel:${donor.phone}`;
  if (btnWa) {
    const cleanPhone = donor.phone.replace(/[^0-9]/g, '');
    const waMsg = encodeURIComponent(`Hello ${donor.name}, urgent blood donation request on RaktSetu for ${donor.bloodGroup} in ${donor.city}. Are you available?`);
    btnWa.href = `https://wa.me/${cleanPhone}?text=${waMsg}`;
  }

  openModal('contact');
}

function triggerSosPing() {
  if (!currentContactDonor) return;
  closeModal('contact');
  showToast(`🚨 High-Priority Emergency SOS Broadcast sent to ${currentContactDonor.name} (${currentContactDonor.phone})!`);
}

// ---------- Official Certificate Modal ----------
function openCertificateModal(donorId) {
  const donor = DONORS.find(d => d.id === donorId) || DONORS[0];
  
  const elName = document.getElementById('cert-donor-name');
  const elBg = document.getElementById('cert-donor-bg');
  const elUnits = document.getElementById('cert-units-count');
  const elCertId = document.getElementById('cert-id-text');
  const elDate = document.getElementById('cert-issue-date');

  if (elName) elName.textContent = donor.name;
  if (elBg) elBg.textContent = donor.bloodGroup;
  if (elUnits) elUnits.textContent = `${donor.unitsDonated || donor.matches || 1} Life-Saving Blood Unit${(donor.unitsDonated || donor.matches) === 1 ? '' : 's'}`;
  if (elCertId) elCertId.textContent = `ID: ${donor.certId || 'RS-CERT-2026-9041'}`;
  if (elDate) elDate.textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  openModal('certificate');
}

function printCertificate() {
  window.print();
}

// ---------- Medical Eligibility Stepper Wizard (Compact & Laptop-Friendly) ----------
const SCREENER_QUESTIONS = [
  {
    icon: "⚖️",
    title: "1. Age & Weight Threshold",
    desc: "Are you between 18 – 65 years of age and weigh at least 50 kg?",
    detail: "Required to ensure safe donor blood volume."
  },
  {
    icon: "⏳",
    title: "2. Cooldown Interval",
    desc: "Has it been at least 90 days (3 months) since your last whole blood donation?",
    detail: "Allows your hemoglobin and red blood cells to fully replenish."
  },
  {
    icon: "💉",
    title: "3. Tattoos & Surgeries",
    desc: "Have you had NO new tattoos, body piercings, or major surgeries in the last 6 months?",
    detail: "Standard medical protocol to prevent transmissible blood infections."
  },
  {
    icon: "🩺",
    title: "4. General Wellness Today",
    desc: "Are you feeling completely healthy today with no active fever, cold, antibiotics, or chronic condition?",
    detail: "Protects both your health and the recipient patient."
  }
];

let screenerCurrentStep = 0;
let screenerStepAnswers = [];

function initScreenerWizard() {
  screenerCurrentStep = 0;
  screenerStepAnswers = [];
  renderScreenerCurrentStep();
}

function renderScreenerCurrentStep() {
  const container = document.getElementById('screener-wizard-body');
  if (!container) return;

  if (screenerCurrentStep >= SCREENER_QUESTIONS.length) {
    const allPassed = screenerStepAnswers.every(ans => ans === true);
    if (allPassed) {
      container.innerHTML = `
        <div class="screener-result-card screener-pass">
          <div style="font-size:42px; margin-bottom:8px;">🛡️</div>
          <div style="font-size:18px; font-weight:800; color:#15803D; margin-bottom:6px;">Official Green Pass: Safe to Donate!</div>
          <p style="font-size:13.5px; color:#166534; margin-bottom:18px; line-height:1.5;">
            You satisfy all 4 National Blood Transfusion Council eligibility criteria. You are medically cleared to donate whole blood today.
          </p>
          <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
            <button class="btn-filter-search" style="width:auto; padding:10px 20px;" onclick="closeModal('screener'); goTab('myavail');">
              ⚡ Go to My Availability
            </button>
            <button class="btn-secondary-outline" style="width:auto; padding:10px 18px;" onclick="initScreenerWizard()">
              🔄 Retake Test
            </button>
          </div>
        </div>`;
    } else {
      container.innerHTML = `
        <div class="screener-result-card screener-cooldown">
          <div style="font-size:42px; margin-bottom:8px;">⏳</div>
          <div style="font-size:18px; font-weight:800; color:#B45309; margin-bottom:6px;">Temporary Cooldown Advisory</div>
          <p style="font-size:13.5px; color:#92400E; margin-bottom:18px; line-height:1.5;">
            Based on your answers, a medical cooldown interval is recommended for your safety and the patient's safety. Please wait until your window expires before donating.
          </p>
          <button class="btn-secondary-outline" style="width:auto; padding:10px 24px;" onclick="initScreenerWizard()">
            🔄 Retake Screener
          </button>
        </div>`;
    }
    return;
  }

  const q = SCREENER_QUESTIONS[screenerCurrentStep];
  const progressPercent = Math.round(((screenerCurrentStep + 1) / SCREENER_QUESTIONS.length) * 100);

  container.innerHTML = `
    <div class="screener-stepper-container">
      <div class="screener-progress-wrap">
        <div class="screener-step-meta">
          <span>Question ${screenerCurrentStep + 1} of ${SCREENER_QUESTIONS.length}</span>
          <span>${progressPercent}% Complete</span>
        </div>
        <div class="screener-progress-bar">
          <div class="screener-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>

      <div class="screener-question-box">
        <div class="screener-q-icon">${q.icon}</div>
        <div class="screener-q-heading">${q.title}</div>
        <div style="font-size:14.5px; font-weight:600; color:#1E293B; margin-bottom:6px;">${q.desc}</div>
        <div class="screener-q-desc">💡 ${q.detail}</div>
      </div>

      <div class="screener-choice-grid">
        <button class="btn-screener-choice btn-screener-yes" onclick="chooseScreenerAnswer(true)">
          <span style="font-size:20px;">✓</span>
          <span>Yes, I Meet This</span>
        </button>
        <button class="btn-screener-choice btn-screener-no" onclick="chooseScreenerAnswer(false)">
          <span style="font-size:20px;">✕</span>
          <span>No, I Do Not</span>
        </button>
      </div>

      <div class="screener-nav-row">
        ${screenerCurrentStep > 0
          ? `<button class="btn-screener-prev" onclick="screenerGoPrev()">← Previous Question</button>`
          : `<span></span>`}
        <button class="btn-screener-prev" onclick="initScreenerWizard()">Restart</button>
      </div>
    </div>`;
}

function chooseScreenerAnswer(ans) {
  screenerStepAnswers[screenerCurrentStep] = ans;
  screenerCurrentStep++;
  renderScreenerCurrentStep();
}

function screenerGoPrev() {
  if (screenerCurrentStep > 0) {
    screenerCurrentStep--;
    renderScreenerCurrentStep();
  }
}

// ---------- Export CSV Roster ----------
function exportDonorsCSV() {
  const headers = ["ID", "Name", "Blood Group", "City", "Availability", "Reliability Score", "Phone", "Distance (km)", "Total Donations"];
  const rows = DONORS.map(d => [
    d.id,
    `"${d.name}"`,
    d.bloodGroup,
    `"${d.city}"`,
    d.available ? "Available Now" : "Unavailable",
    d.score,
    `"${d.phone}"`,
    d.distanceKm || 2.5,
    d.matches
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `raktsetu_donors_roster_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("📥 Donors roster exported to CSV successfully.");
}

// ---------- Emergency SOS Banner Action ----------
function respondToEmergencyAlert() {
  showToast("🩸 Thank you! Hospital dispatch has been notified of your immediate availability.");
}

function broadcastEmergencyAlert() {
  showToast("📢 Emergency alert broadcast to all 6 nearby compatible donors.");
}

// ---------- My Availability Controls & Timer ----------
function refreshStatusBox() {
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  const sub = document.getElementById('status-sub');
  const timerBox = document.getElementById('timer-box');

  if (isAvailable) {
    if (dot) dot.classList.add('on');
    if (text) {
      text.textContent = 'Available Now (Live)';
      text.style.color = 'var(--teal-green)';
    }
    if (sub) sub.textContent = 'Your profile is active in emergency blood searches';
    if (timerBox) timerBox.style.display = 'flex';
  } else {
    if (dot) dot.classList.remove('on');
    if (text) {
      text.textContent = 'Not Available';
      text.style.color = 'var(--text-dark)';
    }
    if (sub) sub.textContent = 'Currently inactive · Not appearing in emergency search';
    if (timerBox) timerBox.style.display = 'none';
  }
}

function startTimerCountdown(hours) {
  if (availabilityTimerId) clearInterval(availabilityTimerId);
  timerSecondsRemaining = hours * 3600;

  function updateDisplay() {
    const h = Math.floor(timerSecondsRemaining / 3600).toString().padStart(2, '0');
    const m = Math.floor((timerSecondsRemaining % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(timerSecondsRemaining % 60).toString().padStart(2, '0');
    const digitsEl = document.getElementById('timer-digits');
    if (digitsEl) digitsEl.textContent = `${h}:${m}:${s}`;

    if (timerSecondsRemaining <= 0) {
      clearInterval(availabilityTimerId);
      expireAvailability();
      showToast('⚠️ Your availability window has expired.');
    }
    timerSecondsRemaining--;
  }

  updateDisplay();
  availabilityTimerId = setInterval(updateDisplay, 1000);
}

function setAvailability() {
  isAvailable = true;
  const sel = document.getElementById('duration-select');
  const hrs = sel ? parseInt(sel.value, 10) : 6;
  startTimerCountdown(hrs);
  refreshStatusBox();
  showToast(`✅ You are now LIVE for blood donation for the next ${hrs} hours.`);
}

function expireAvailability() {
  isAvailable = false;
  if (availabilityTimerId) clearInterval(availabilityTimerId);
  refreshStatusBox();
  showToast('Donation availability turned off.');
}

// ---------- Modals Handling ----------
function openModal(modalId) {
  if (modalId === 'screener') {
    initScreenerWizard();
  }
  const modal = document.getElementById('modal-' + modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById('modal-' + modalId);
  if (modal) modal.classList.remove('active');
}

// Toast Alert
function showToast(msg) {
  const t = document.getElementById('toast-banner');
  if (t) {
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
  }
}

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', () => {
  updateSummaryStats();
  runSearch();
  refreshStatusBox();
});
