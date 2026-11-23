/* ==========================================================
   RaktSetu - Emergency Request and Matching Module
   100% final frontend demonstration
   HTML + CSS + Vanilla JavaScript
   Demo data is stored in localStorage, not a backend.
========================================================== */

"use strict";

const STORAGE_KEYS = {
  requests: "raktsetuRequests60",
  inventory: "raktsetuInventory60"
};

const demoDonors = [
  { id: "D001", name: "Aarav Sharma", bloodGroup: "O+", city: "Mathura", available: true, reliability: 92 },
  { id: "D002", name: "Priya Singh", bloodGroup: "O+", city: "Mathura", available: true, reliability: 87 },
  { id: "D003", name: "Rohan Verma", bloodGroup: "A+", city: "Mathura", available: true, reliability: 90 },
  { id: "D004", name: "Ananya Gupta", bloodGroup: "B+", city: "Agra", available: true, reliability: 85 },
  { id: "D005", name: "Karan Yadav", bloodGroup: "O+", city: "Agra", available: false, reliability: 72 },
  { id: "D006", name: "Neha Sharma", bloodGroup: "AB+", city: "Mathura", available: true, reliability: 95 },
  { id: "D007", name: "Meera Patel", bloodGroup: "A-", city: "Mathura", available: true, reliability: 82 },
  { id: "D008", name: "Kabir Singh", bloodGroup: "O-", city: "Mathura", available: true, reliability: 89 },
  { id: "D009", name: "Ishita Kapoor", bloodGroup: "B+", city: "Mathura", available: true, reliability: 78 },
  { id: "D010", name: "Arjun Verma", bloodGroup: "AB-", city: "Agra", available: true, reliability: 81 }
];

const initialInventory = [
  { id: "H001", hospital: "City Care Hospital", city: "Mathura", bloodGroup: "O+", units: 2 },
  { id: "H002", hospital: "District Hospital", city: "Mathura", bloodGroup: "A+", units: 5 },
  { id: "H003", hospital: "Shanti Hospital", city: "Mathura", bloodGroup: "B+", units: 1 },
  { id: "H004", hospital: "Apex Hospital", city: "Agra", bloodGroup: "O+", units: 6 },
  { id: "H005", hospital: "City Care Hospital", city: "Mathura", bloodGroup: "O-", units: 1 },
  { id: "H006", hospital: "Green Valley Hospital", city: "Agra", bloodGroup: "AB+", units: 3 }
];

let requests = loadJSON(STORAGE_KEYS.requests, []);
let inventory = loadJSON(STORAGE_KEYS.inventory, initialInventory);
let toastTimer;

/* Start the application after the HTML has loaded. */
document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
  if (!localStorage.getItem(STORAGE_KEYS.requests)) {
    requests = [{
      id: "REQ1001",
      bloodGroup: "O+",
      units: 2,
      city: "Mathura",
      hospital: "City Care Hospital",
      urgency: "Urgent",
      neededBy: futureDateTime(5),
      status: "Open",
      createdAt: new Date().toISOString(),
      requester: "Goldy",
      inventoryAllocation: null,
      matches: [
        { donorId: "D001", status: "Pending" },
        { donorId: "D002", status: "Pending" }
      ],
      note: "Demo request"
    }];

    saveRequests();
  }

  bindEvents();
  setMinimumDateTime();
  renderAll();
}

function bindEvents() {
  document.getElementById("openRequestBtn")
    .addEventListener("click", openRequestForm);

  document.getElementById("closeRequestBtn")
    .addEventListener("click", closeRequestForm);

  document.getElementById("cancelFormBtn")
    .addEventListener("click", closeRequestForm);

  document.getElementById("closeModalBtn")
    .addEventListener("click", closeModal);

  document.getElementById("requestForm")
    .addEventListener("submit", handleCreateRequest);

  document.getElementById("statusFilter")
    .addEventListener("change", renderRequests);

  document.getElementById("requestSearch")
    .addEventListener("input", renderRequests);

  document.getElementById("bloodGroup")
    .addEventListener("change", updateStockPreview);

  document.getElementById("city")
    .addEventListener("input", updateStockPreview);

  document.getElementById("requestModal")
    .addEventListener("click", event => {
      if (event.target.id === "requestModal") {
        closeModal();
      }
    });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
  });

  document.querySelectorAll('input[name="urgency"]')
    .forEach(radio => {
      radio.addEventListener("change", updateUrgencyStyles);
    });
}

/* Storage helpers */

function loadJSON(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : structuredCloneSafe(fallback);
  } catch (error) {
    console.warn("Could not read saved demo data:", error);
    return structuredCloneSafe(fallback);
  }
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function saveRequests() {
  localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(requests));
}

function saveInventory() {
  localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inventory));
}

function futureDateTime(hoursAhead) {
  const date = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function setMinimumDateTime() {
  const input = document.getElementById("neededBy");
  const now = new Date();

  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  input.min = now.toISOString().slice(0, 16);
  input.value = futureDateTime(3);
}

/* Request form controls */

function openRequestForm() {
  const section = document.getElementById("requestSection");
  section.hidden = false;

  section.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  document.getElementById("bloodGroup")
    .focus({ preventScroll: true });
}

function closeRequestForm() {
  document.getElementById("requestSection").hidden = true;
}

function handleCreateRequest(event) {
  event.preventDefault();

  const bloodGroup = document.getElementById("bloodGroup").value;
  const units = Number(document.getElementById("units").value);
  const city = document.getElementById("city").value.trim();
  const hospital = document.getElementById("hospital").value.trim();
  const neededBy = document.getElementById("neededBy").value;
  const urgencyInput = document.querySelector(
    'input[name="urgency"]:checked'
  );
  const urgency = urgencyInput ? urgencyInput.value : "Urgent";

  if (!bloodGroup) {
    return showToast("Please select a blood group.");
  }

  if (!Number.isInteger(units) || units < 1 || units > 20) {
    return showToast("Enter a whole number of units from 1 to 20.");
  }

  if (city.length < 2 || !/^[\p{L} .-]+$/u.test(city)) {
    return showToast("Please enter a valid city.");
  }

  if (!neededBy || new Date(neededBy) <= new Date()) {
    return showToast("Required-by time must be in the future.");
  }

  /*
    Hospital-first workflow:
    Check inventory before searching for donors.
  */
  const stockMatches = findHospitalStock(city, bloodGroup);
  const totalStock = stockMatches.reduce(
    (sum, stock) => sum + stock.units,
    0
  );

  let allocation = null;
  let matches = [];
  let note = "";

  if (totalStock >= units) {
    allocation = allocateHospitalStock(stockMatches, units);
    note = "Hospital stock covers this request. Donor matching was not started.";
  } else {
    const shortage = Math.max(0, units - totalStock);

    if (totalStock > 0) {
      allocation = allocateHospitalStock(stockMatches, totalStock);
      note = `${totalStock} unit(s) found in hospital stock; ${shortage} unit(s) still require donor support.`;
    } else {
      note = "No matching hospital stock found; compatible donor search started.";
    }

    matches = findMatchingDonors(bloodGroup, city)
      .slice(0, Math.max(3, shortage));
  }

  const request = {
    id: "REQ" + Date.now().toString().slice(-7) + Math.floor(Math.random() * 90 + 10),
    bloodGroup,
    units,
    city,
    hospital: hospital ||
      (allocation && allocation.hospitalNames.join(", ")) ||
      "Hospital not specified",
    urgency,
    neededBy,
    status: allocation && allocation.unitsAllocated >= units
      ? "Matched"
      : "Open",
    createdAt: new Date().toISOString(),
    requester: "Goldy",
    inventoryAllocation: allocation,
    matches: matches.map(donor => ({
      donorId: donor.id,
      status: "Pending"
    })),
    note
  };

  requests.unshift(request);

  saveRequests();
  saveInventory();
  renderAll();

  document.getElementById("requestForm").reset();

  setMinimumDateTime();
  updateUrgencyStyles();
  updateStockPreview();
  closeRequestForm();

  showToast(
    request.status === "Matched"
      ? "Hospital stock covers the request. Request marked as matched."
      : `${matches.length} compatible donor(s) found. Request saved.`
  );

  showRequestDetails(request.id);
}

/* Hospital inventory */

function findHospitalStock(city, bloodGroup) {
  return inventory.filter(stock =>
    stock.units > 0 &&
    stock.bloodGroup === bloodGroup &&
    stock.city.toLowerCase() === city.toLowerCase()
  );
}

function allocateHospitalStock(stocks, unitsNeeded) {
  let remaining = unitsNeeded;
  let unitsAllocated = 0;
  const hospitalNames = [];
  const allocations = [];

  stocks.forEach(stock => {
    if (remaining <= 0) return;

    const take = Math.min(stock.units, remaining);

    if (take > 0) {
      stock.units -= take;
      allocations.push({ stockId: stock.id, units: take });
      remaining -= take;
      unitsAllocated += take;

      if (!hospitalNames.includes(stock.hospital)) {
        hospitalNames.push(stock.hospital);
      }
    }
  });

  return {
    unitsAllocated,
    hospitalNames,
    allocations
  };
}

/*
  Simplified educational compatibility rules.
  Actual transfusion compatibility must be verified by qualified
  hospital staff before any real-world medical decision.
*/
const donorCompatibility = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
};

function findMatchingDonors(requestedGroup, city) {
  const compatibleGroups = donorCompatibility[requestedGroup] || [
    requestedGroup
  ];

  return demoDonors
    .filter(donor =>
      donor.available &&
      !requests.some(request =>
        !["Cancelled", "Fulfilled"].includes(request.status) &&
        (request.matches || []).some(match =>
          match.donorId === donor.id && match.status === "Accepted"
        )
      ) &&
      compatibleGroups.includes(donor.bloodGroup) &&
      donor.city.toLowerCase() === city.toLowerCase()
    )
    .map(donor => ({
      ...donor,
      sameCity: donor.city.toLowerCase() === city.toLowerCase()
    }))
    .sort((a, b) =>
      Number(b.sameCity) - Number(a.sameCity) ||
      b.reliability - a.reliability
    );
}

function updateStockPreview() {
  const bloodGroup = document.getElementById("bloodGroup").value;
  const city = document.getElementById("city").value.trim();
  const result = document.getElementById("stockResult");

  if (!bloodGroup || city.length < 2) {
    result.textContent =
      "Select a blood group and enter a city to check registered hospital stock.";
    return;
  }

  const stocks = findHospitalStock(city, bloodGroup);
  const total = stocks.reduce((sum, stock) => sum + stock.units, 0);

  if (!stocks.length) {
    result.innerHTML =
      "<strong>No registered stock found.</strong> " +
      "Compatible donor matching will be checked when you submit the request.";
    return;
  }

  result.innerHTML =
    `<div class="stock-row">
      <strong>${escapeHTML(bloodGroup)} stock in ${escapeHTML(city)}</strong>
      <strong>${total} unit(s) total</strong>
    </div>` +
    stocks.map(stock => `
      <div class="stock-row">
        <span>${escapeHTML(stock.hospital)}</span>
        <span class="${stock.units > 2 ? "stock-positive" : "stock-low"}">
          ${stock.units} unit(s) available
        </span>
      </div>
    `).join("");
}

function updateUrgencyStyles() {
  document.querySelectorAll(".urgency-option").forEach(label => {
    const radio = label.querySelector("input");
    label.classList.toggle("selected", radio.checked);
  });
}

/* Main rendering */

function renderAll() {
  renderRequests();
  renderIncomingRequests();
  renderStats();
  renderInventory();
  updateStockPreview();
}

function renderRequests() {
  const container = document.getElementById("requestsContainer");
  const filter = document.getElementById("statusFilter").value;
  const search = document.getElementById("requestSearch")
    .value.trim().toLowerCase();

  // Search and status filtering are applied together.
  const filtered = requests.filter(request => {
    const matchesStatus =
      filter === "all" || request.status === filter;

    const searchableText = [
      request.id,
      request.bloodGroup,
      request.city,
      request.hospital,
      request.urgency,
      request.status
    ].join(" ").toLowerCase();

    return matchesStatus && searchableText.includes(search);
  });

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No matching requests</strong>
        Try another search term or status filter.
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(request => `
    <article class="request-card">
      <div class="request-top">
        <div class="request-main">
          <div class="blood-badge">${escapeHTML(request.bloodGroup)}</div>
          <div>
            <h3>${escapeHTML(request.bloodGroup)} Blood Request</h3>
            <p class="request-id">
              Request ID: ${escapeHTML(request.id)}
            </p>
          </div>
        </div>

        <span class="status-badge status-${statusClass(request.status)}">
          ${escapeHTML(request.status)}
        </span>
      </div>

      <div class="request-details">
        <span>🩸 ${Number(request.units)} unit(s)</span>
        <span>📍 ${escapeHTML(request.city)}</span>
        <span>🏥 ${escapeHTML(request.hospital || "Hospital not specified")}</span>
        <span>⚡ ${escapeHTML(request.urgency)}</span>
        <span>👥 ${(request.matches || []).length} donor match(es)</span>
        <span>🗓 ${formatDate(request.neededBy)}</span>
        <span class="deadline-label deadline-${deadlineClass(request)}">
          ${escapeHTML(getDeadlineLabel(request))}
        </span>
      </div>

      ${request.note ? `
        <p class="request-id" style="margin-top:10px">
          ${escapeHTML(request.note)}
        </p>` : ""}

      <div class="request-actions">
        <button class="small-button" type="button"
          data-action="track" data-id="${escapeHTML(request.id)}">
          Track request
        </button>

        ${request.status !== "Fulfilled" &&
          request.status !== "Cancelled" ? `
          <button class="small-button danger" type="button"
            data-action="cancel" data-id="${escapeHTML(request.id)}">
            Cancel request
          </button>` : ""}

        ${request.status === "Matched" ? `
          <button class="small-button success" type="button"
            data-action="fulfill" data-id="${escapeHTML(request.id)}">
            Mark fulfilled
          </button>` : ""}
      </div>
    </article>
  `).join("");

  container.querySelectorAll("button[data-action]").forEach(button => {
    button.addEventListener("click", () => {
      const { action, id } = button.dataset;

      if (action === "track") showRequestDetails(id);
      if (action === "cancel") cancelRequest(id);
      if (action === "fulfill") fulfillRequest(id);
    });
  });
}

/* Request deadline display */

function getDeadlineLabel(request) {
  if (request.status === "Fulfilled") return "✓ Completed";
  if (request.status === "Cancelled") return "Cancelled";

  const deadline = new Date(request.neededBy).getTime();

  if (!Number.isFinite(deadline)) return "Deadline unavailable";

  const remaining = deadline - Date.now();

  if (remaining <= 0) return "Deadline passed";

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor(
    (remaining % (1000 * 60 * 60)) / (1000 * 60)
  );

  if (hours < 1) return `Due in ${minutes} minute(s)`;
  if (hours < 24) return `Due in ${hours}h ${minutes}m`;

  return `Due in ${Math.ceil(hours / 24)} day(s)`;
}

function deadlineClass(request) {
  if (request.status === "Fulfilled") return "completed";
  if (request.status === "Cancelled") return "cancelled";

  const deadline = new Date(request.neededBy).getTime();

  if (!Number.isFinite(deadline) || deadline <= Date.now()) {
    return "overdue";
  }

  if (deadline - Date.now() < 60 * 60 * 1000) {
    return "soon";
  }

  return "upcoming";
}

/* Donor response panel */

function renderIncomingRequests() {
  const container = document.getElementById("incomingRequests");

  const incoming = requests.filter(request =>
    request.status === "Open" &&
    request.matches &&
    request.matches.length
  );

  if (!incoming.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No incoming donor requests</strong>
        Requests needing donor support will appear here.
      </div>`;
    return;
  }

  container.innerHTML = incoming.map(request => {
    const pendingMatches = request.matches.filter(
      match => match.status === "Pending"
    );

    return `
      <article class="incoming-card">
        <div class="incoming-header">
          <div>
            <h3>${escapeHTML(request.bloodGroup)} Blood Required</h3>
            <p>
              ${escapeHTML(request.city)} · ${Number(request.units)}
              unit(s) · ${escapeHTML(request.id)}
            </p>
          </div>
          <span class="status-badge status-open">
            ${escapeHTML(request.urgency)}
          </span>
        </div>

        <div class="incoming-info">
          <span>🏥 ${escapeHTML(request.hospital || "Hospital not specified")}</span>
          <span>${pendingMatches.length} pending response(s)</span>
        </div>

        <div class="match-list">
          ${request.matches.map(match => {
            const donor = demoDonors.find(
              item => item.id === match.donorId
            );

            if (!donor) return "";

            return `
              <div class="match-row">
                <div>
                  <strong>${escapeHTML(donor.name)}</strong>
                  <p>
                    ${escapeHTML(donor.bloodGroup)} ·
                    ${escapeHTML(donor.city)} ·
                    Reliability ${donor.reliability}%
                  </p>
                </div>
                <span class="status-badge status-${statusClass(match.status)}">
                  ${escapeHTML(match.status)}
                </span>
              </div>`;
          }).join("")}
        </div>

        <div class="incoming-actions">
          ${request.matches.map(match => {
            const donor = demoDonors.find(
              item => item.id === match.donorId
            );

            if (!donor || match.status !== "Pending") return "";

            return `
              <button class="small-button success" type="button"
                data-response="Accepted"
                data-request="${escapeHTML(request.id)}"
                data-donor="${escapeHTML(match.donorId)}">
                Accept · ${escapeHTML(donor.name.split(" ")[0])}
              </button>

              <button class="small-button danger" type="button"
                data-response="Declined"
                data-request="${escapeHTML(request.id)}"
                data-donor="${escapeHTML(match.donorId)}">
                Decline · ${escapeHTML(donor.name.split(" ")[0])}
              </button>`;
          }).join("")}
        </div>
      </article>`;
  }).join("");

  container.querySelectorAll("button[data-response]").forEach(button => {
    button.addEventListener("click", () => {
      respondToRequest(
        button.dataset.request,
        button.dataset.donor,
        button.dataset.response
      );
    });
  });
}

/* Inventory rendering */

function renderInventory() {
  const container = document.getElementById("inventoryContainer");

  container.innerHTML = inventory.map(stock => `
    <article class="inventory-card">
      <div>
        <strong>${escapeHTML(stock.hospital)}</strong>
        <p>
          ${escapeHTML(stock.city)} · ${escapeHTML(stock.bloodGroup)}
        </p>
      </div>
      <div class="inventory-units">
        ${stock.units} unit(s)
        <p>available</p>
      </div>
    </article>
  `).join("");
}

/* Statistics */

function renderStats() {
  document.getElementById("totalRequests").textContent =
    requests.length;

  document.getElementById("openRequests").textContent =
    requests.filter(item => item.status === "Open").length;

  document.getElementById("matchedRequests").textContent =
    requests.filter(item => item.status === "Matched").length;

  document.getElementById("fulfilledRequests").textContent =
    requests.filter(item => item.status === "Fulfilled").length;
}

/* Request tracking modal */

function showRequestDetails(requestId) {
  const request = requests.find(item => item.id === requestId);

  if (!request) return;

  const matched =
    request.status === "Matched" ||
    request.status === "Fulfilled";

  const fulfilled = request.status === "Fulfilled";
  const body = document.getElementById("modalBody");

  body.innerHTML = `
    <p class="request-id">
      ${escapeHTML(request.id)} · ${escapeHTML(request.city)} ·
      Created ${formatDate(request.createdAt)}
    </p>

    <div class="tracker">
      <div class="track-step completed">
        <div class="track-circle">✓</div>
        <span>Open</span>
      </div>
      <div class="track-line"></div>

      <div class="track-step ${matched ? "completed" : ""}">
        <div class="track-circle">${matched ? "✓" : "2"}</div>
        <span>Matched</span>
      </div>
      <div class="track-line"></div>

      <div class="track-step ${fulfilled ? "completed" : ""}">
        <div class="track-circle">${fulfilled ? "✓" : "3"}</div>
        <span>Fulfilled</span>
      </div>
    </div>

    <div class="request-details">
      <span>🩸 ${Number(request.units)} unit(s)</span>
      <span>⚡ ${escapeHTML(request.urgency)}</span>
      <span>🏥 ${escapeHTML(request.hospital || "Hospital not specified")}</span>
      <span>🗓 ${formatDate(request.neededBy)}</span>
    </div>

    ${request.inventoryAllocation ? `
      <p class="stock-preview">
        Hospital stock allocated:
        <strong>${request.inventoryAllocation.unitsAllocated} unit(s)</strong>
        from ${escapeHTML(request.inventoryAllocation.hospitalNames.join(", "))}.
      </p>` : ""}

    <h3 class="modal-section-title">Matched donors</h3>

    ${(request.matches && request.matches.length) ? `
      <div class="match-list">
        ${request.matches.map(match => {
          const donor = demoDonors.find(
            item => item.id === match.donorId
          );

          if (!donor) return "";

          return `
            <div class="match-row">
              <div>
                <strong>${escapeHTML(donor.name)}</strong>
                <p>
                  ${escapeHTML(donor.bloodGroup)} ·
                  ${escapeHTML(donor.city)} ·
                  Reliability ${donor.reliability}%
                </p>
              </div>
              <span class="status-badge status-${statusClass(match.status)}">
                ${escapeHTML(match.status)}
              </span>
            </div>`;
        }).join("")}
      </div>` : `
      <div class="empty-state">
        No donor matching was needed or no compatible donors were found.
      </div>`}

    ${request.status === "Matched" ? `
      <div class="form-actions">
        <button class="button button-primary"
          type="button" id="modalFulfillBtn">
          Mark fulfilled
        </button>
      </div>` : ""}
  `;

  document.getElementById("requestModal").hidden = false;
  document.body.style.overflow = "hidden";

  const fulfillButton = document.getElementById("modalFulfillBtn");

  if (fulfillButton) {
    fulfillButton.addEventListener("click", () => {
      fulfillRequest(request.id);
    });
  }
}

/* Accept or decline a donor response */

function respondToRequest(requestId, donorId, response) {
  const request = requests.find(item => item.id === requestId);

  if (!request || request.status !== "Open") {
    return showToast("This request is no longer open.");
  }

  const match = request.matches.find(
    item => item.donorId === donorId
  );

  if (!match || match.status !== "Pending") {
    return showToast("This donor has already responded.");
  }

  match.status = response;

  const acceptedCount = request.matches.filter(
    item => item.status === "Accepted"
  ).length;

  const allocatedUnits = Number(request.inventoryAllocation?.unitsAllocated || 0);
  if (allocatedUnits + acceptedCount >= Number(request.units)) {
    request.status = "Matched";
    request.note =
      "Enough demo donor commitments and hospital units are available to cover the requested quantity. Hospital confirmation is still required.";
  } else if (
    request.matches.every(item => item.status === "Declined")
  ) {
    request.note =
      "All suggested donors declined. More donor outreach is required.";
  }

  saveRequests();
  renderAll();

  showToast(
    response === "Accepted"
      ? request.status === "Matched"
         ? "Required units covered by demo commitments. Request matched."
         : "Donor accepted; more units are still required."
      : "Donor declined. Other pending donors can still respond."
  );
}

/* Cancel a request */

function cancelRequest(requestId) {
  const request = requests.find(item => item.id === requestId);

  if (!request || ["Fulfilled", "Cancelled"].includes(request.status)) {
    return;
  }

  if (!window.confirm("Are you sure you want to cancel this request?")) {
    return;
  }

  request.status = "Cancelled";
  request.note = "Cancelled by requester.";
  // Release only stock reserved by this request. Older saved records
  // may not contain item-level allocations and cannot be safely reversed.
  const allocations = request.inventoryAllocation?.allocations || [];
  allocations.forEach(entry => {
    const stock = inventory.find(item => item.id === entry.stockId);
    if (stock) stock.units += Number(entry.units) || 0;
  });
  if (allocations.length) {
    request.inventoryAllocation = null;
    saveInventory();
  }

  saveRequests();
  closeModal();
  renderAll();
  showToast("Blood request cancelled.");
}

/* Mark a matched request as fulfilled */

function fulfillRequest(requestId) {
  const request = requests.find(item => item.id === requestId);

  if (!request || request.status !== "Matched") {
    return showToast("Only matched requests can be marked fulfilled.");
  }

  if (!window.confirm("Confirm that the blood request has been fulfilled?")) {
    return;
  }

  request.status = "Fulfilled";
  request.note =
    "Marked fulfilled in the student demo. Verify actual fulfillment separately.";

  saveRequests();
  closeModal();
  renderAll();
  showToast("Request marked fulfilled in this browser demo.");
}

/* General helpers */

function closeModal() {
  document.getElementById("requestModal").hidden = true;
  document.body.style.overflow = "";
}

function statusClass(status) {
  return String(status || "Open")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function formatDate(value) {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

/* Escape HTML before inserting user-entered values into HTML. */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

/* Toast notification */

function showToast(message) {
  const toast = document.getElementById("toast");

  document.getElementById("toastMessage").textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}