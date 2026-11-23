/* ============================================
   RaktSetu — Member 4: Hospital & Healthcare
   100% milestone
   - localStorage (inventory, volunteers, activity)
   - validation + toast notifications + confirm modal
   - edit / delete / filter / CSV export (inventory)
   - blood-group compatibility matching (search)
   - volunteer levels, search, activity log
   - eligibility checker (healthcare info)
   - mobile menu
   ============================================ */

var KEYS = {
  inventory: 'raktsetu_inventory',
  volunteers: 'raktsetu_volunteers',
  activity: 'raktsetu_activity'
};

var GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// recipient group -> donor groups that can give to them
var COMPAT = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
  'AB-': ['A-', 'B-', 'O-', 'AB-']
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
    toast('Could not save data in this browser.', 'error');
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

/* ---------- Toast notifications ---------- */

function toast(message, type) {
  var wrap = document.getElementById('toastWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toastWrap';
    wrap.className = 'toast-wrap';
    wrap.setAttribute('aria-live', 'polite');
    document.body.appendChild(wrap);
  }
  var t = document.createElement('div');
  t.className = 'toast ' + (type || 'success');
  t.textContent = message;
  wrap.appendChild(t);

  setTimeout(function () {
    t.classList.add('hide');
    setTimeout(function () { t.remove(); }, 300);
  }, 3500);
}

/* ---------- Confirm modal (replaces browser confirm) ---------- */

function confirmDialog(message, okLabel) {
  return new Promise(function (resolve) {
    var back = document.createElement('div');
    back.className = 'modal-backdrop';
    back.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true">' +
      '<h3>Are you sure?</h3><p></p>' +
      '<div class="modal-actions">' +
      '<button type="button" class="btn btn-outline" data-act="no">Cancel</button>' +
      '<button type="button" class="btn btn-primary" data-act="yes"></button>' +
      '</div></div>';
    back.querySelector('p').textContent = message;
    back.querySelector('[data-act="yes"]').textContent = okLabel || 'Delete';

    function close(result) {
      document.removeEventListener('keydown', onKey);
      back.remove();
      resolve(result);
    }
    function onKey(e) { if (e.key === 'Escape') close(false); }

    back.addEventListener('click', function (e) {
      var act = e.target.getAttribute('data-act');
      if (act === 'yes') close(true);
      else if (act === 'no' || e.target === back) close(false);
    });

    document.addEventListener('keydown', onKey);
    document.body.appendChild(back);
    back.querySelector('[data-act="no"]').focus();
  });
}

/* ---------- Animated number ---------- */

function setNumber(el, value) {
  var start = parseInt(el.textContent, 10) || 0;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (start === value || reduce) { el.textContent = value; return; }

  var t0 = null;
  var duration = 400;
  function step(ts) {
    if (!t0) t0 = ts;
    var p = Math.min((ts - t0) / duration, 1);
    el.textContent = Math.round(start + (value - start) * p);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------- Seed data (first run only) ---------- */

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

function seedActivity() { return []; }

/* ---------- Stock status rule ---------- */
// <= 5 units -> Critical, 6-20 -> Moderate, > 20 -> Healthy
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
  var groupGrid = document.getElementById('groupGrid');
  var banner = document.getElementById('alertBanner');
  var fSearch = document.getElementById('invSearch');
  var fGroup = document.getElementById('invGroup');
  var fStatus = document.getElementById('invStatus');
  var saveBtn = document.getElementById('saveBtn');
  var cancelBtn = document.getElementById('cancelEdit');
  var formTitle = document.getElementById('formTitle');

  var inventory = load(KEYS.inventory, seedInventory);
  var editingId = null;

  form.lastUpdated.value = todayISO();

  function groupTotals() {
    var totals = {};
    GROUPS.forEach(function (g) { totals[g] = 0; });
    inventory.forEach(function (r) { totals[r.group] = (totals[r.group] || 0) + r.units; });
    return totals;
  }

  function renderSummary() {
    var total = inventory.reduce(function (sum, r) { return sum + r.units; }, 0);
    var critical = inventory.filter(function (r) { return r.units <= 5; }).length;
    var hospitals = {};
    inventory.forEach(function (r) { hospitals[r.hospital.toLowerCase()] = true; });

    setNumber(document.getElementById('sumUnits'), total);
    setNumber(document.getElementById('sumCritical'), critical);
    setNumber(document.getElementById('sumHospitals'), Object.keys(hospitals).length);
  }

  function renderGroups() {
    var totals = groupTotals();
    groupGrid.innerHTML = GROUPS.map(function (g) {
      var s = stockStatus(totals[g]);
      var label = totals[g] === 0 ? 'No stock' : s.label;
      var active = fGroup.value === g ? ' active' : '';
      return '<button type="button" class="group-tile s-' + s.cls + active + '" data-group="' + g + '">' +
        '<span class="g">' + g + '</span>' +
        '<span class="n">' + totals[g] + '</span>' +
        '<span class="l">units · ' + label + '</span></button>';
    }).join('');

    var low = GROUPS.filter(function (g) { return totals[g] <= 5; });
    if (low.length) {
      banner.innerHTML = '<strong>Low stock alert:</strong> ' + low.map(function (g) {
        return esc(g) + ' (' + totals[g] + ' units)';
      }).join(', ') + '. Consider organising a drive or contacting donors.';
      banner.classList.add('show');
    } else {
      banner.classList.remove('show');
    }
  }

  function filteredRows() {
    var q = fSearch.value.trim().toLowerCase();
    return inventory.filter(function (r) {
      var textMatch = !q || r.hospital.toLowerCase().indexOf(q) !== -1 || r.city.toLowerCase().indexOf(q) !== -1;
      var groupMatch = !fGroup.value || r.group === fGroup.value;
      var statusMatch = !fStatus.value || stockStatus(r.units).label === fStatus.value;
      return textMatch && groupMatch && statusMatch;
    }).sort(function (a, b) {
      return a.hospital.localeCompare(b.hospital) || a.group.localeCompare(b.group);
    });
  }

  function render() {
    var rows = filteredRows();

    tbody.innerHTML = rows.map(function (r) {
      var s = stockStatus(r.units);
      return '<tr>' +
        '<td>' + esc(r.hospital) + '<div style="color:var(--muted);font-size:0.82rem">' + esc(r.city) + '</div></td>' +
        '<td><strong>' + esc(r.group) + '</strong></td>' +
        '<td>' + r.units + '</td>' +
        '<td><span class="stock-pill"><span class="stock-dot ' + s.cls + '"></span>' + s.label + '</span></td>' +
        '<td>' + fmtDate(r.updated) + '</td>' +
        '<td class="row-actions">' +
          '<button type="button" class="btn-link" data-act="edit" data-id="' + r.id + '">Edit</button>' +
          '<button type="button" class="btn-link-danger" data-act="delete" data-id="' + r.id + '">Delete</button>' +
        '</td></tr>';
    }).join('');

    var anyFilter = fSearch.value || fGroup.value || fStatus.value;
    emptyBox.textContent = anyFilter ? 'No entries match these filters.' : 'No stock entries yet. Add one using the form.';
    emptyBox.classList.toggle('show', rows.length === 0);

    renderSummary();
    renderGroups();
  }

  function exitEditMode() {
    editingId = null;
    form.reset();
    clearErrors(form);
    form.lastUpdated.value = todayISO();
    saveBtn.textContent = 'Save stock entry';
    formTitle.textContent = 'Add / update stock';
    cancelBtn.hidden = true;
  }

  function enterEditMode(record) {
    editingId = record.id;
    clearErrors(form);
    form.hospitalName.value = record.hospital;
    form.city.value = record.city;
    form.contact.value = record.contact;
    form.bloodGroup.value = record.group;
    form.units.value = record.units;
    form.lastUpdated.value = record.updated;
    saveBtn.textContent = 'Update entry';
    formTitle.textContent = 'Edit stock entry';
    cancelBtn.hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    form.hospitalName.focus();
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
      toast('Please fix the highlighted fields.', 'error');
      return;
    }

    var units = parseInt(unitsRaw, 10);
    var sameKey = function (r) {
      return r.hospital.toLowerCase() === hospital.toLowerCase() && r.group === group;
    };

    if (editingId) {
      var clash = inventory.filter(function (r) { return r.id !== editingId && sameKey(r); })[0];
      if (clash) {
        setError(form.bloodGroup, 'This hospital already has an entry for this blood group.');
        toast('Duplicate hospital and blood group.', 'error');
        return;
      }
      var rec = inventory.filter(function (r) { return r.id === editingId; })[0];
      rec.hospital = hospital; rec.city = city; rec.contact = contact;
      rec.group = group; rec.units = units; rec.updated = date;
      toast('Entry updated.', 'success');
      exitEditMode();
    } else {
      var existing = inventory.filter(sameKey)[0];
      if (existing) {
        existing.units = units;
        existing.city = city;
        existing.contact = contact;
        existing.updated = date;
        toast('Stock updated for ' + hospital + ' (' + group + ').', 'success');
      } else {
        inventory.push({ id: uid(), hospital: hospital, city: city, contact: contact, group: group, units: units, updated: date });
        toast('New stock entry added for ' + hospital + ' (' + group + ').', 'success');
      }
      form.bloodGroup.value = '';
      form.units.value = '';
      form.lastUpdated.value = todayISO();
    }

    save(KEYS.inventory, inventory);
    render();
  });

  cancelBtn.addEventListener('click', function () {
    exitEditMode();
    toast('Edit cancelled.', 'info');
  });

  tbody.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-act]');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var record = inventory.filter(function (r) { return r.id === id; })[0];
    if (!record) return;

    if (btn.getAttribute('data-act') === 'edit') {
      enterEditMode(record);
    } else {
      confirmDialog('Delete the ' + record.group + ' entry for ' + record.hospital + '?', 'Delete').then(function (yes) {
        if (!yes) return;
        inventory = inventory.filter(function (r) { return r.id !== id; });
        if (editingId === id) exitEditMode();
        save(KEYS.inventory, inventory);
        render();
        toast('Entry deleted.', 'info');
      });
    }
  });

  groupGrid.addEventListener('click', function (e) {
    var tile = e.target.closest('.group-tile');
    if (!tile) return;
    var g = tile.getAttribute('data-group');
    fGroup.value = fGroup.value === g ? '' : g;
    render();
  });

  [fSearch, fGroup, fStatus].forEach(function (el) {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  document.getElementById('exportCsv').addEventListener('click', function () {
    if (!inventory.length) { toast('Nothing to export yet.', 'info'); return; }
    var q = function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; };
    var lines = ['Hospital,City,Contact,Blood Group,Units,Status,Updated'];
    inventory.forEach(function (r) {
      lines.push([r.hospital, r.city, r.contact, r.group, r.units, stockStatus(r.units).label, r.updated].map(q).join(','));
    });
    var blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'raktsetu-inventory.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    toast('CSV downloaded.', 'success');
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
  var note = document.getElementById('matchNote');
  var inventory = load(KEYS.inventory, seedInventory);

  function runSearch() {
    var city = form.city.value.trim().toLowerCase();
    var group = form.searchGroup.value;
    var availableOnly = form.availableOnly.checked;
    var useCompat = form.includeCompat.checked;
    var sortBy = form.sortBy.value;

    var groups = null;
    if (group) groups = useCompat ? COMPAT[group] : [group];

    var results = inventory.filter(function (r) {
      var cityMatch = !city || r.city.toLowerCase().indexOf(city) !== -1;
      var groupMatch = !groups || groups.indexOf(r.group) !== -1;
      var stockMatch = !availableOnly || r.units > 0;
      return cityMatch && groupMatch && stockMatch;
    });

    results.sort(function (a, b) {
      if (group && useCompat) {
        var ea = a.group === group ? 0 : 1;
        var eb = b.group === group ? 0 : 1;
        if (ea !== eb) return ea - eb;
      }
      if (sortBy === 'name') return a.hospital.localeCompare(b.hospital);
      return b.units - a.units;
    });

    tbody.innerHTML = results.map(function (r) {
      var s = stockStatus(r.units);
      var tag = (group && useCompat && r.group !== group) ? '<span class="tag-compat">compatible</span>' : '';
      return '<tr>' +
        '<td>' + esc(r.hospital) + '</td>' +
        '<td>' + esc(r.city) + '</td>' +
        '<td><strong>' + esc(r.group) + '</strong>' + tag + '</td>' +
        '<td><span class="stock-pill"><span class="stock-dot ' + s.cls + '"></span>' + r.units + ' units</span></td>' +
        '<td>+91 ' + esc(r.contact) + '</td>' +
        '<td class="row-actions">' +
          '<a class="btn-link" href="tel:+91' + esc(r.contact) + '">Call</a>' +
          '<button type="button" class="btn-link" data-copy="' + esc(r.contact) + '">Copy</button>' +
        '</td></tr>';
    }).join('');

    countBox.textContent = results.length + (results.length === 1 ? ' result found' : ' results found');
    emptyBox.classList.toggle('show', results.length === 0);

    if (group && useCompat) {
      note.textContent = 'Showing ' + group + ' plus groups that can donate to ' + group + ': ' +
        COMPAT[group].join(', ') + '. The hospital confirms final compatibility.';
      note.classList.add('show');
    } else {
      note.classList.remove('show');
    }
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast('Number copied: ' + text, 'success');
      }).catch(function () {
        toast('Number: ' + text, 'info');
      });
    } else {
      toast('Number: ' + text, 'info');
    }
  }

  tbody.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-copy]');
    if (btn) copyText(btn.getAttribute('data-copy'));
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    runSearch();
  });

  form.city.addEventListener('input', runSearch);
  ['searchGroup', 'availableOnly', 'includeCompat', 'sortBy'].forEach(function (name) {
    form[name].addEventListener('change', runSearch);
  });

  document.getElementById('resetSearch').addEventListener('click', function () {
    form.reset();
    runSearch();
    toast('Search reset.', 'info');
  });

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
  var activityBox = document.getElementById('activityList');
  var activityEmpty = document.getElementById('activityEmpty');
  var searchBox = document.getElementById('volSearch');

  var volunteers = load(KEYS.volunteers, seedVolunteers);
  var activity = load(KEYS.activity, seedActivity);

  function initials(name) {
    return name.split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
  }

  function level(drives) {
    if (drives >= 5) return { cls: 'gold', label: 'Gold' };
    if (drives >= 3) return { cls: 'silver', label: 'Silver' };
    if (drives >= 1) return { cls: 'bronze', label: 'Bronze' };
    return { cls: 'new', label: 'New' };
  }

  function renderStats() {
    var drives = volunteers.reduce(function (s, v) { return s + v.drives; }, 0);
    var donors = volunteers.reduce(function (s, v) { return s + v.donors; }, 0);
    setNumber(document.getElementById('statVolunteers'), volunteers.length);
    setNumber(document.getElementById('statDrives'), drives);
    setNumber(document.getElementById('statDonors'), donors);
  }

  function renderDriveOptions() {
    var current = driveForm.driveVolunteer.value;
    driveForm.driveVolunteer.innerHTML = '<option value="">Select volunteer</option>' +
      volunteers.map(function (v) {
        return '<option value="' + v.id + '">' + esc(v.name) + ' (' + esc(v.city) + ')</option>';
      }).join('');
    driveForm.driveVolunteer.value = current;
  }

  function renderActivity() {
    var recent = activity.slice(-5).reverse();
    activityBox.innerHTML = recent.map(function (a) {
      return '<div class="activity-item">' +
        '<strong>' + esc(a.name) + '</strong> organised a drive and connected ' + a.donors +
        (a.donors === 1 ? ' donor' : ' donors') +
        '<div class="when">' + fmtDate(a.date) + '</div></div>';
    }).join('');
    activityEmpty.classList.toggle('show', recent.length === 0);
  }

  function renderList() {
    var q = searchBox.value.trim().toLowerCase();

    var sorted = volunteers.slice().sort(function (a, b) {
      return b.drives - a.drives || b.donors - a.donors;
    });
    var topId = sorted.length && sorted[0].drives > 0 ? sorted[0].id : null;

    var shown = sorted.filter(function (v) {
      return !q || v.name.toLowerCase().indexOf(q) !== -1 || v.city.toLowerCase().indexOf(q) !== -1;
    });

    listBox.innerHTML = shown.map(function (v) {
      var lv = level(v.drives);
      var top = v.id === topId ? '<span class="badge">Top volunteer</span>' : '';
      return '<div class="volunteer-row">' +
        '<div class="avatar">' + esc(initials(v.name)) + '</div>' +
        '<div>' +
          '<div class="volunteer-name">' + esc(v.name) + '</div>' +
          '<div class="volunteer-meta">' + esc(v.city) + ' · ' + v.drives + (v.drives === 1 ? ' drive' : ' drives') +
          ' · ' + v.donors + ' donors connected</div>' +
        '</div>' +
        '<div class="vol-badges">' + top + '<span class="badge ' + lv.cls + '">' + lv.label + '</span>' +
          '<button type="button" class="btn-link-danger" data-id="' + v.id + '">Remove</button></div>' +
        '</div>';
    }).join('');

    emptyBox.textContent = q ? 'No volunteers match your search.' : 'No volunteers yet. Be the first to sign up.';
    emptyBox.classList.toggle('show', shown.length === 0);

    renderStats();
    renderDriveOptions();
    renderActivity();
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
      toast('Please fix the highlighted fields.', 'error');
      return;
    }

    volunteers.push({ id: uid(), name: name, city: city, phone: phone, drives: 0, donors: 0 });
    save(KEYS.volunteers, volunteers);
    renderList();

    toast('Welcome, ' + name + '! You are now a registered volunteer.', 'success');
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
      toast('Please fix the highlighted fields.', 'error');
      return;
    }

    var vol = volunteers.filter(function (v) { return v.id === id; })[0];
    var donors = parseInt(donorsRaw, 10);
    vol.drives += 1;
    vol.donors += donors;
    activity.push({ id: uid(), name: vol.name, donors: donors, date: todayISO() });

    save(KEYS.volunteers, volunteers);
    save(KEYS.activity, activity);
    renderList();

    toast('Drive logged for ' + vol.name + '.', 'success');
    driveForm.reset();
  });

  // --- Remove volunteer ---
  listBox.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-id]');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var vol = volunteers.filter(function (v) { return v.id === id; })[0];
    if (!vol) return;

    confirmDialog('Remove ' + vol.name + ' from the volunteer list?', 'Remove').then(function (yes) {
      if (!yes) return;
      volunteers = volunteers.filter(function (v) { return v.id !== id; });
      save(KEYS.volunteers, volunteers);
      renderList();
      toast(vol.name + ' removed.', 'info');
    });
  });

  searchBox.addEventListener('input', renderList);

  renderList();
})();

/* ============================================
   PAGE: Healthcare Info (eligibility + chart)
   ============================================ */
(function initHealthcare() {
  var compatBody = document.getElementById('compatBody');
  if (compatBody) {
    compatBody.innerHTML = GROUPS.map(function (g) {
      return '<tr><td><strong>' + g + '</strong></td><td>' +
        COMPAT[g].map(function (d) { return '<span class="chip">' + d + '</span>'; }).join('') +
        '</td></tr>';
    }).join('');
  }

  var form = document.getElementById('eligForm');
  if (!form) return;
  var resultBox = document.getElementById('eligResult');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors(form);

    var ageRaw = form.age.value.trim();
    var weightRaw = form.weight.value.trim();
    var last = form.lastDonation.value;
    var ok = true;

    var age = parseInt(ageRaw, 10);
    var weight = parseFloat(weightRaw);

    if (!/^\d+$/.test(ageRaw) || age < 1 || age > 120) { setError(form.age, 'Enter a valid age (1-120).'); ok = false; }
    if (!weightRaw || isNaN(weight) || weight < 20 || weight > 300) { setError(form.weight, 'Enter a valid weight in kg (20-300).'); ok = false; }
    if (last && last > todayISO()) { setError(form.lastDonation, 'Date cannot be in the future.'); ok = false; }

    if (!ok) {
      toast('Please fix the highlighted fields.', 'error');
      return;
    }

    var reasons = [];
    if (age < 18 || age > 65) reasons.push('Donors are generally between 18 and 65 years old.');
    if (weight < 50) reasons.push('Donors should weigh at least 50 kg.');

    if (last) {
      var next = new Date(last + 'T00:00:00');
      next.setDate(next.getDate() + 90);
      if (next > new Date()) {
        reasons.push('Wait until ' + next.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
          ' (90 days after your last donation).');
      }
    }
    if (form.unwell.checked) reasons.push('Wait until you have fully recovered from illness or fever.');
    if (form.tattoo.checked) reasons.push('Wait about 6 months after a tattoo or piercing.');

    var fine = '<p class="fine">This is a general guide, not medical advice. The doctor at the donation centre makes the final decision.</p>';

    if (reasons.length === 0) {
      resultBox.innerHTML = '<div class="result-box ok"><h3>You look eligible to donate</h3>' +
        '<p>Based on your answers, nothing here stops you from donating blood. Eat well and drink water before you go.</p>' + fine + '</div>';
      toast('Eligibility check done.', 'success');
    } else {
      resultBox.innerHTML = '<div class="result-box no"><h3>Not eligible right now</h3><ul>' +
        reasons.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' + fine + '</div>';
      toast('Eligibility check done.', 'info');
    }
  });

  form.addEventListener('reset', function () {
    clearErrors(form);
    resultBox.innerHTML = '<div class="placeholder-box">Fill in the form to see your result here.</div>';
  });
})();

/* ============================================
   SHARED: FAQ accordion, active nav, mobile menu
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

(function mobileMenu() {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('nav.mainnav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();