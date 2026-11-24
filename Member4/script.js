/* ============================================
   RaktSetu — Member 4: Hospital & Healthcare
   60% milestone
   - localStorage save/load (inventory + volunteers)
   - dynamic tables/lists
   - real search filtering
   - JS form validation with inline errors
   - dynamic volunteer stats
   ============================================ */

var KEYS = {
  inventory: 'raktsetu_inventory',
  volunteers: 'raktsetu_volunteers'
};

/* ---------- Helpers ---------- */

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function esc(text) {
  var div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function fmtDate(iso) {
  if (!iso) return '-';
  var d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Could not save to localStorage', e);
  }
}

function load(key, seedFn) {
  try {
    var raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Could not read localStorage', e);
  }
  var seed = seedFn();
  save(key, seed);
  return seed;
}

/* ---------- Seed (sample) data, used only the first time ---------- */

function seedInventory() {
  var t = todayISO();
  return [
    { id: uid(), hospital: 'City Care Hospital', city: 'Mathura', contact: '9812345601', group: 'O+', units: 42, updated: t },
    { id: uid(), hospital: 'City Care Hospital', city: 'Mathura', contact: '9812345601', group: 'A+', units: 27, updated: t },
    { id: uid(), hospital: 'City Care Hospital', city: 'Mathura', contact: '9812345601', group: 'O-', units: 4, updated: t },
    { id: uid(), hospital: 'Sanjeevani Hospital', city: 'Mathura', contact: '9812345602', group: 'B-', units: 9, updated: t },
    { id: uid(), hospital: 'Sanjeevani Hospital', city: 'Mathura', contact: '9812345602', group: 'B+', units: 18, updated: t },
    { id: uid(), hospital: 'Prakash Nursing Home', city: 'Vrindavan', contact: '9812345603', group: 'AB-', units: 2, updated: t },
    { id: uid(), hospital: 'Prakash Nursing Home', city: 'Vrindavan', contact: '9812345603', group: 'A+', units: 15, updated: t }
  ];
}

function seedVolunteers() {
  return [
    { id: uid(), name: 'Riya Pandey', city: 'Mathura', phone: '9876500001', drives: 3, donors: 52 },
    { id: uid(), name: 'Aman Kumar', city: 'Vrindavan', phone: '9876500002', drives: 2, donors: 41 },
    { id: uid(), name: 'Sana Sheikh', city: 'Mathura', phone: '9876500003', drives: 1, donors: 22 },
    { id: uid(), name: 'Dev Verma', city: 'Govardhan', phone: '9876500004', drives: 1, donors: 19 }
  ];
}

/* ---------- Stock status rule ---------- */
// <= 5 units  -> Critical, 6-20 -> Moderate, > 20 -> Healthy
function stockStatus(units) {
  if (units <= 5) return { cls: 'low', label: 'Critical' };
  if (units <= 20) return { cls: 'mid', label: 'Moderate' };
  return { cls: 'high', label: 'Healthy' };
}

/* ---------- Validation helpers ---------- */

function setError(input, message) {
  var field = input.closest('.field');
  if (!field) return;
  field.classList.add('has-error');
  var err = field.querySelector('.error-text');
  if (!err) {
    err = document.createElement('div');
    err.className = 'error-text';
    field.appendChild(err);
  }
  err.textContent = message;
}

function clearErrors(form) {
  form.querySelectorAll('.field.has-error').forEach(function (f) {
    f.classList.remove('has-error');
  });
  var msg = form.querySelector('.form-msg');
  if (msg) {
    msg.className = 'form-msg';
    msg.textContent = '';
  }
}

function showMessage(form, text, type) {
  var msg = form.querySelector('.form-msg');
  if (!msg) return;
  msg.textContent = text;
  msg.className = 'form-msg show ' + type;
}

var PHONE_RE = /^[6-9]\d{9}$/;
var NAME_RE = /^[A-Za-z][A-Za-z .'-]{1,}$/;

/* ============================================
   PAGE: Hospital Inventory
   ============================================ */
(function initInventory() {
  var form = document.getElementById('stockForm');
  if (!form) return;

  var tbody = document.getElementById('invBody');
  var emptyBox = document.getElementById('invEmpty');
  var inventory = load(KEYS.inventory, seedInventory);

  form.lastUpdated.value = todayISO();

  function renderSummary() {
    var total = inventory.reduce(function (sum, r) { return sum + r.units; }, 0);
    var critical = inventory.filter(function (r) { return r.units <= 5; }).length;
    var hospitals = {};
    inventory.forEach(function (r) { hospitals[r.hospital.toLowerCase()] = true; });

    document.getElementById('sumUnits').textContent = total;
    document.getElementById('sumCritical').textContent = critical;
    document.getElementById('sumHospitals').textContent = Object.keys(hospitals).length;
  }

  function render() {
    var rows = inventory.slice().sort(function (a, b) {
      return a.hospital.localeCompare(b.hospital) || a.group.localeCompare(b.group);
    });

    tbody.innerHTML = rows.map(function (r) {
      var s = stockStatus(r.units);
      return '<tr>' +
        '<td>' + esc(r.hospital) + '<div style="color:var(--muted);font-size:0.82rem">' + esc(r.city) + '</div></td>' +
        '<td><strong>' + esc(r.group) + '</strong></td>' +
        '<td>' + r.units + '</td>' +
        '<td><span class="stock-pill"><span class="stock-dot ' + s.cls + '"></span>' + s.label + '</span></td>' +
        '<td>' + fmtDate(r.updated) + '</td>' +
        '<td><button type="button" class="btn-link-danger" data-id="' + r.id + '">Delete</button></td>' +
        '</tr>';
    }).join('');

    emptyBox.classList.toggle('show', rows.length === 0);
    renderSummary();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors(form);

    var hospital = form.hospitalName.value.trim();
    var city = form.city.value.trim();
    var contact = form.contact.value.trim();
    var group = form.bloodGroup.value;
    var unitsRaw = form.units.value.trim();
    var date = form.lastUpdated.value || todayISO();
    var ok = true;

    if (hospital.length < 3) { setError(form.hospitalName, 'Enter at least 3 characters.'); ok = false; }
    if (!NAME_RE.test(city)) { setError(form.city, 'Enter a valid city name (letters only).'); ok = false; }
    if (!PHONE_RE.test(contact)) { setError(form.contact, 'Enter a valid 10-digit mobile number.'); ok = false; }
    if (!group) { setError(form.bloodGroup, 'Please select a blood group.'); ok = false; }

    if (!/^\d+$/.test(unitsRaw)) {
      setError(form.units, 'Enter a whole number (0 or more).');
      ok = false;
    } else if (parseInt(unitsRaw, 10) > 500) {
      setError(form.units, 'Units cannot be more than 500.');
      ok = false;
    }

    if (date > todayISO()) { setError(form.lastUpdated, 'Date cannot be in the future.'); ok = false; }

    if (!ok) {
      showMessage(form, 'Please fix the highlighted fields.', 'error');
      return;
    }

    var units = parseInt(unitsRaw, 10);

    // Same hospital + same blood group => update, otherwise add new
    var existing = inventory.filter(function (r) {
      return r.hospital.toLowerCase() === hospital.toLowerCase() && r.group === group;
    })[0];

    if (existing) {
      existing.units = units;
      existing.city = city;
      existing.contact = contact;
      existing.updated = date;
      showMessage(form, 'Stock updated for ' + hospital + ' (' + group + ').', 'success');
    } else {
      inventory.push({ id: uid(), hospital: hospital, city: city, contact: contact, group: group, units: units, updated: date });
      showMessage(form, 'New stock entry added for ' + hospital + ' (' + group + ').', 'success');
    }

    save(KEYS.inventory, inventory);
    render();

    form.bloodGroup.value = '';
    form.units.value = '';
    form.lastUpdated.value = todayISO();
  });

  // Delete a row (event delegation on tbody)
  tbody.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-id]');
    if (!btn) return;
    if (!confirm('Delete this stock entry?')) return;

    inventory = inventory.filter(function (r) { return r.id !== btn.getAttribute('data-id'); });
    save(KEYS.inventory, inventory);
    render();
  });

  render();
})();

/* ============================================
   PAGE: Blood Stock Search
   ============================================ */
(function initSearch() {
  var form = document.getElementById('searchForm');
  if (!form) return;

  var tbody = document.getElementById('resultsBody');
  var emptyBox = document.getElementById('resultsEmpty');
  var countBox = document.getElementById('resultCount');
  var inventory = load(KEYS.inventory, seedInventory);

  function runSearch() {
    var city = form.city.value.trim().toLowerCase();
    var group = form.searchGroup.value;

    var results = inventory.filter(function (r) {
      var cityMatch = !city || r.city.toLowerCase().indexOf(city) !== -1;
      var groupMatch = !group || r.group === group;
      return cityMatch && groupMatch;
    });

    // most stock first
    results.sort(function (a, b) { return b.units - a.units; });

    tbody.innerHTML = results.map(function (r) {
      var s = stockStatus(r.units);
      return '<tr>' +
        '<td>' + esc(r.hospital) + '</td>' +
        '<td>' + esc(r.city) + '</td>' +
        '<td><strong>' + esc(r.group) + '</strong></td>' +
        '<td><span class="stock-pill"><span class="stock-dot ' + s.cls + '"></span>' + r.units + ' units</span></td>' +
        '<td>+91 ' + esc(r.contact) + '</td>' +
        '</tr>';
    }).join('');

    countBox.textContent = results.length + (results.length === 1 ? ' hospital found' : ' hospitals found');
    emptyBox.classList.toggle('show', results.length === 0);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    runSearch();
  });

  form.city.addEventListener('input', runSearch);
  form.searchGroup.addEventListener('change', runSearch);

  var resetBtn = document.getElementById('resetSearch');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      form.reset();
      runSearch();
    });
  }

  runSearch();
})();

/* ============================================
   PAGE: Volunteer Dashboard
   ============================================ */
(function initVolunteers() {
  var form = document.getElementById('volunteerForm');
  if (!form) return;

  var driveForm = document.getElementById('driveForm');
  var listBox = document.getElementById('volList');
  var emptyBox = document.getElementById('volEmpty');
  var volunteers = load(KEYS.volunteers, seedVolunteers);

  function initials(name) {
    return name.split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
  }

  function renderStats() {
    var drives = volunteers.reduce(function (s, v) { return s + v.drives; }, 0);
    var donors = volunteers.reduce(function (s, v) { return s + v.donors; }, 0);
    document.getElementById('statVolunteers').textContent = volunteers.length;
    document.getElementById('statDrives').textContent = drives;
    document.getElementById('statDonors').textContent = donors;
  }

  function renderDriveOptions() {
    var current = driveForm.driveVolunteer.value;
    driveForm.driveVolunteer.innerHTML = '<option value="">Select volunteer</option>' +
      volunteers.map(function (v) {
        return '<option value="' + v.id + '">' + esc(v.name) + ' (' + esc(v.city) + ')</option>';
      }).join('');
    driveForm.driveVolunteer.value = current;
  }

  function renderList() {
    var sorted = volunteers.slice().sort(function (a, b) {
      return b.drives - a.drives || b.donors - a.donors;
    });

    listBox.innerHTML = sorted.map(function (v, i) {
      var top = i === 0 && v.drives > 0 ? '<span class="badge">Top volunteer</span>' : '';
      return '<div class="volunteer-row">' +
        '<div class="avatar">' + esc(initials(v.name)) + '</div>' +
        '<div>' +
          '<div class="volunteer-name">' + esc(v.name) + '</div>' +
          '<div class="volunteer-meta">' + esc(v.city) + ' · ' + v.drives + (v.drives === 1 ? ' drive' : ' drives') +
          ' · ' + v.donors + ' donors connected</div>' +
        '</div>' + top +
        '</div>';
    }).join('');

    emptyBox.classList.toggle('show', volunteers.length === 0);
    renderStats();
    renderDriveOptions();
  }

  // --- Volunteer signup ---
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors(form);

    var name = form.volName.value.trim();
    var city = form.volCity.value.trim();
    var phone = form.volPhone.value.trim();
    var ok = true;

    if (!NAME_RE.test(name)) { setError(form.volName, 'Enter a valid name (letters only, min 2 characters).'); ok = false; }
    if (!NAME_RE.test(city)) { setError(form.volCity, 'Enter a valid city name (letters only).'); ok = false; }
    if (!PHONE_RE.test(phone)) {
      setError(form.volPhone, 'Enter a valid 10-digit mobile number (starts with 6-9).');
      ok = false;
    } else if (volunteers.some(function (v) { return v.phone === phone; })) {
      setError(form.volPhone, 'This phone number is already registered.');
      ok = false;
    }

    if (!ok) {
      showMessage(form, 'Please fix the highlighted fields.', 'error');
      return;
    }

    volunteers.push({ id: uid(), name: name, city: city, phone: phone, drives: 0, donors: 0 });
    save(KEYS.volunteers, volunteers);
    renderList();

    showMessage(form, 'Welcome, ' + name + '! You are now a registered volunteer.', 'success');
    form.reset();
  });

  // --- Log a drive ---
  driveForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors(driveForm);

    var id = driveForm.driveVolunteer.value;
    var donorsRaw = driveForm.driveDonors.value.trim();
    var ok = true;

    if (!id) { setError(driveForm.driveVolunteer, 'Please select a volunteer.'); ok = false; }

    if (!/^\d+$/.test(donorsRaw)) {
      setError(driveForm.driveDonors, 'Enter a whole number (0 or more).');
      ok = false;
    } else if (parseInt(donorsRaw, 10) > 1000) {
      setError(driveForm.driveDonors, 'Donors count seems too high (max 1000).');
      ok = false;
    }

    if (!ok) {
      showMessage(driveForm, 'Please fix the highlighted fields.', 'error');
      return;
    }

    var vol = volunteers.filter(function (v) { return v.id === id; })[0];
    vol.drives += 1;
    vol.donors += parseInt(donorsRaw, 10);

    save(KEYS.volunteers, volunteers);
    renderList();

    showMessage(driveForm, 'Drive logged for ' + vol.name + '.', 'success');
    driveForm.reset();
  });

  renderList();
})();

/* ============================================
   SHARED: FAQ accordion + active nav link
   ============================================ */
document.querySelectorAll('.accordion-trigger').forEach(function (btn) {
  btn.addEventListener('click', function () {
    btn.closest('.accordion-item').classList.toggle('open');
  });
});

(function highlightActiveNav() {
  var current = window.location.pathname.split('/').pop();
  document.querySelectorAll('nav.mainnav a').forEach(function (link) {
    if (link.getAttribute('href') === current) {
      link.classList.add('active');
    }
  });
})();