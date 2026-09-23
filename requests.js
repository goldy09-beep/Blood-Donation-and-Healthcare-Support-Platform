/* =====================================================
   RAKTSETU
   MEMBER 3 - EMERGENCY REQUEST & MATCHING
   Frontend-only prototype using localStorage
===================================================== */


/* =====================================================
   DEMO DATA
===================================================== */

const demoDonors = [

    {
        id: "D001",
        name: "Aarav Sharma",
        bloodGroup: "O+",
        city: "Mathura",
        available: true,
        reliability: 92
    },

    {
        id: "D002",
        name: "Priya Singh",
        bloodGroup: "O+",
        city: "Mathura",
        available: true,
        reliability: 87
    },

    {
        id: "D003",
        name: "Rohan Verma",
        bloodGroup: "A+",
        city: "Mathura",
        available: true,
        reliability: 90
    },

    {
        id: "D004",
        name: "Ananya Gupta",
        bloodGroup: "B+",
        city: "Agra",
        available: true,
        reliability: 85
    },

    {
        id: "D005",
        name: "Karan Yadav",
        bloodGroup: "O+",
        city: "Agra",
        available: false,
        reliability: 72
    },

    {
        id: "D006",
        name: "Neha Sharma",
        bloodGroup: "AB+",
        city: "Mathura",
        available: true,
        reliability: 95
    }

];


/* =====================================================
   DEMO HOSPITAL INVENTORY
===================================================== */

const hospitalInventory = [

    {
        hospital: "City Care Hospital",
        city: "Mathura",
        bloodGroup: "O+",
        units: 2
    },

    {
        hospital: "District Hospital",
        city: "Mathura",
        bloodGroup: "A+",
        units: 5
    },

    {
        hospital: "Shanti Hospital",
        city: "Mathura",
        bloodGroup: "B+",
        units: 1
    },

    {
        hospital: "Apex Hospital",
        city: "Agra",
        bloodGroup: "O+",
        units: 6
    }

];


/* =====================================================
   LOCAL STORAGE
===================================================== */

let requests =
    JSON.parse(localStorage.getItem("raktsetuRequests")) || [];


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    initializeData();

    renderRequests();

    renderIncomingRequests();

    updateStats();

    setupStockPreview();

});


/* =====================================================
   INITIAL DEMO REQUEST
===================================================== */

function initializeData() {

    /*
       We create one demo request only if
       localStorage is completely empty.
    */

    if (requests.length === 0) {

        requests = [

            {
                id: "REQ1001",

                bloodGroup: "O+",

                units: 2,

                city: "Mathura",

                hospital: "City Care Hospital",

                urgency: "Urgent",

                neededBy: "2026-09-22T20:00",

                status: "Open",

                createdAt: new Date().toISOString(),

                requester: "Goldy",

                matches: [

                    {
                        donorId: "D001",
                        name: "Aarav Sharma",
                        status: "Notified"
                    },

                    {
                        donorId: "D002",
                        name: "Priya Singh",
                        status: "Notified"
                    }

                ]

            }

        ];

        saveRequests();

    }

}


/* =====================================================
   SAVE REQUESTS
===================================================== */

function saveRequests() {

    localStorage.setItem(
        "raktsetuRequests",
        JSON.stringify(requests)
    );

}


/* =====================================================
   OPEN / CLOSE FORM
===================================================== */

function openRequestForm() {

    document.getElementById("requestSection").style.display = "block";

    document
        .getElementById("requestSection")
        .scrollIntoView({
            behavior: "smooth"
        });

}


function closeRequestForm() {

    document.getElementById("requestSection").style.display = "none";

}


/* =====================================================
   CREATE REQUEST
===================================================== */

document
    .getElementById("requestForm")
    .addEventListener("submit", function (event) {

        event.preventDefault();

        const bloodGroup =
            document.getElementById("bloodGroup").value;

        const units =
            Number(document.getElementById("units").value);

        const city =
            document.getElementById("city").value.trim();

        const hospital =
            document.getElementById("hospital").value.trim();

        const neededBy =
            document.getElementById("neededBy").value;

        const urgency =
            document.querySelector(
                'input[name="urgency"]:checked'
            ).value;


        /* ================= VALIDATION ================= */

        if (!bloodGroup) {

            showToast("Please select a blood group.");

            return;

        }


        if (!units || units < 1) {

            showToast("Units must be at least 1.");

            return;

        }


        if (!city) {

            showToast("Please enter your city.");

            return;

        }


        if (!neededBy) {

            showToast("Please select when blood is needed.");

            return;

        }


        const requestDate =
            new Date(neededBy);

        const now =
            new Date();

        if (requestDate <= now) {

            showToast(
                "Required-by time must be in the future."
            );

            return;

        }


        /* ================= MATCH DONORS ================= */

        const matches =
            findMatchingDonors(
                bloodGroup,
                city
            );


        /* ================= CREATE REQUEST ================= */

        const newRequest = {

            id:
                "REQ" +
                Date.now()
                    .toString()
                    .slice(-6),

            bloodGroup,

            units,

            city,

            hospital,

            urgency,

            neededBy,

            status:
                matches.length > 0
                    ? "Open"
                    : "Open",

            createdAt:
                new Date().toISOString(),

            requester: "Goldy",

            matches:
                matches.map(donor => ({

                    donorId: donor.id,

                    name: donor.name,

                    status: "Notified"

                }))

        };


        requests.unshift(newRequest);

        saveRequests();

        updateStats();

        renderRequests();

        renderIncomingRequests();


        /* ================= SUCCESS ================= */

        showToast(
            matches.length > 0
                ? `${matches.length} compatible donor(s) found.`
                : "Request created. No available donors found yet."
        );


        document
            .getElementById("requestForm")
            .reset();


        showRequestDetails(newRequest.id);

    });


/* =====================================================
   FIND MATCHING DONORS
===================================================== */

function findMatchingDonors(
    bloodGroup,
    city
) {

    return demoDonors

        .filter(donor => {

            return (
                donor.bloodGroup === bloodGroup &&
                donor.city.toLowerCase() ===
                city.toLowerCase()
            );

        })

        .sort((a, b) => {

            /*
               Available donors first.
               If both have same availability,
               reliability decides order.
            */

            if (a.available !== b.available) {

                return a.available ? -1 : 1;

            }

            return b.reliability - a.reliability;

        });

}


/* =====================================================
   STOCK PREVIEW
===================================================== */

function setupStockPreview() {

    const bloodGroup =
        document.getElementById("bloodGroup");

    const city =
        document.getElementById("city");


    bloodGroup.addEventListener(
        "change",
        updateStockPreview
    );

    city.addEventListener(
        "input",
        updateStockPreview
    );

}


function updateStockPreview() {

    const bloodGroup =
        document.getElementById("bloodGroup").value;

    const city =
        document
            .getElementById("city")
            .value
            .trim();

    const result =
        document.getElementById("stockResult");


    if (!bloodGroup || !city) {

        result.innerHTML =
            "Select blood group and city to check nearby stock.";

        return;

    }


    const stocks =
        hospitalInventory.filter(stock =>

            stock.bloodGroup === bloodGroup &&
            stock.city.toLowerCase() ===
            city.toLowerCase()

        );


    if (stocks.length === 0) {

        result.innerHTML = `
            <p>
                No registered hospital stock found for
                <strong>${bloodGroup}</strong>
                in ${city}.
                Donor matching will be used.
            </p>
        `;

        return;

    }


    result.innerHTML = stocks
        .map(stock => `

            <div class="stock-row">

                <span>
                    ${stock.hospital}
                </span>

                <span class="
                    ${stock.units > 2
                        ? "stock-positive"
                        : "stock-low"}
                ">

                    ${stock.units} unit(s) available

                </span>

            </div>

        `)
        .join("");

}


/* =====================================================
   RENDER MY REQUESTS
===================================================== */

function renderRequests() {

    const container =
        document.getElementById(
            "requestsContainer"
        );

    const filter =
        document.getElementById(
            "statusFilter"
        ).value;


    let filteredRequests =
        requests;


    if (filter !== "all") {

        filteredRequests =
            requests.filter(
                request =>
                    request.status === filter
            );

    }


    if (filteredRequests.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    🩸
                </div>

                <h3>
                    No requests found
                </h3>

                <p>
                    Create a blood request when help is needed.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        filteredRequests
            .map(request =>
                createRequestCard(request)
            )
            .join("");

}


/* =====================================================
   REQUEST CARD
===================================================== */

function createRequestCard(request) {

    const statusClass =
        request.status
            .toLowerCase();


    const matchCount =
        request.matches
            ? request.matches.length
            : 0;


    return `

        <div class="request-card">

            <div class="request-top">

                <div class="request-main">

                    <div class="blood-badge">
                        ${request.bloodGroup}
                    </div>

                    <div>

                        <h3>
                            ${request.bloodGroup}
                            Blood Request
                        </h3>

                        <p>
                            Request ID:
                            ${request.id}
                        </p>

                    </div>

                </div>


                <span class="
                    status-badge
                    status-${statusClass}
                ">

                    ${request.status}

                </span>

            </div>


            <div class="request-details">

                <span>
                    🩸 ${request.units} unit(s)
                </span>

                <span>
                    📍 ${request.city}
                </span>

                <span>
                    🏥 ${request.hospital || "Hospital not specified"}
                </span>

                <span>
                    ⚡ ${request.urgency}
                </span>

                <span>
                    👥 ${matchCount} donor match(es)
                </span>

            </div>


            <div class="request-actions">

                <button
                    class="view-btn"
                    onclick="showRequestDetails('${request.id}')"
                >
                    Track Request
                </button>


                ${
                    request.status !== "Fulfilled" &&
                    request.status !== "Cancelled"

                    ? `

                    <button
                        class="cancel-request-btn"
                        onclick="cancelRequest('${request.id}')"
                    >
                        Cancel Request
                    </button>

                    `

                    : ""

                }

            </div>

        </div>

    `;

}


/* =====================================================
   REQUEST DETAILS
===================================================== */

function showRequestDetails(requestId) {

    const request =
        requests.find(
            item => item.id === requestId
        );


    if (!request) return;


    const modal =
        document.getElementById(
            "requestModal"
        );


    const body =
        document.getElementById(
            "modalBody"
        );


    body.innerHTML = `

        <p class="small-heading">
            REQUEST TRACKING
        </p>

        <h2>
            ${request.bloodGroup}
            Blood Request
        </h2>

        <p style="color:#667085;margin-top:6px;">
            ${request.id} ·
            ${request.city}
        </p>


        ${createTracker(request.status)}


        <div class="request-details">

            <span>
                🩸 ${request.units} units
            </span>

            <span>
                ⚡ ${request.urgency}
            </span>

            <span>
                🏥 ${request.hospital || "Hospital not specified"}
            </span>

        </div>


        <h3 style="margin:25px 0 15px;">
            Matched Donors
        </h3>


        ${
            request.matches &&
            request.matches.length > 0

            ? request.matches
                .map(match =>
                    createDonorMatch(
                        match,
                        request.id
                    )
                )
                .join("")

            : `

                <div class="empty-state">

                    <p>
                        No compatible donors found yet.
                    </p>

                </div>

            `
        }

    `;


    modal.classList.add("show");

}


/* =====================================================
   TRACKER
===================================================== */

function createTracker(status) {

    const matched =
        status === "Matched" ||
        status === "Fulfilled";

    const fulfilled =
        status === "Fulfilled";


    return `

        <div class="tracker">

            <div class="
                track-step
                completed
            ">

                <div class="track-circle">
                    ✓
                </div>

                <span>
                    Open
                </span>

            </div>


            <div class="track-line"></div>


            <div class="
                track-step
                ${matched ? "completed" : ""}
            ">

                <div class="track-circle">

                    ${matched ? "✓" : "2"}

                </div>

                <span>
                    Matched
                </span>

            </div>


            <div class="track-line"></div>


            <div class="
                track-step
                ${fulfilled ? "completed" : ""}
            ">

                <div class="track-circle">

                    ${fulfilled ? "✓" : "3"}

                </div>

                <span>
                    Fulfilled
                </span>

            </div>

        </div>

    `;

}


/* =====================================================
   DONOR MATCH CARD
===================================================== */

function createDonorMatch(
    match,
    requestId
) {

    const donor =
        demoDonors.find(
            d => d.id === match.donorId
        );


    if (!donor) {

        return "";

    }


    let statusText =
        match.status;


    return `

        <div class="donor-match">

            <div class="donor-info">

                <div class="donor-avatar">
                    ${donor.name.charAt(0)}
                </div>

                <div>

                    <strong>
                        ${donor.name}
                    </strong>

                    <p style="font-size:12px;color:#667085;">
                        ${donor.bloodGroup}
                        · ${donor.city}
                        · Reliability ${donor.reliability}%
                    </p>

                </div>

            </div>


            <span class="
                status-badge
                ${
                    match.status === "Accepted"
                        ? "status-fulfilled"
                        : match.status === "Declined"
                        ? "status-cancelled"
                        : "status-open"
                }
            ">

                ${statusText}

            </span>

        </div>

    `;

}


/* =====================================================
   INCOMING REQUESTS
===================================================== */

function renderIncomingRequests() {

    const container =
        document.getElementById(
            "incomingRequests"
        );


    /*
       For demo:
       show requests where a demo donor
       is matched.
    */

    const incoming =
        requests.filter(
            request =>
                request.matches &&
                request.matches.length > 0
        );


    if (incoming.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    ✓
                </div>

                <p>
                    No incoming blood requests.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        incoming
            .map(request => {

                return `

                    <div class="incoming-card">

                        <div class="incoming-header">

                            <div>

                                <strong>
                                    ${request.bloodGroup}
                                    Blood Required
                                </strong>

                                <p style="
                                    color:#667085;
                                    font-size:13px;
                                    margin-top:5px;
                                ">

                                    ${request.city}

                                    ·
                                    ${request.units}
                                    unit(s)

                                </p>

                            </div>


                            <span class="
                                status-badge
                                status-open
                            ">

                                ${request.urgency}

                            </span>

                        </div>


                        <div class="incoming-info">

                            <span>
                                🏥
                                ${request.hospital ||
                                "Hospital not specified"}
                            </span>

                            <span>
                                🆔
                                ${request.id}
                            </span>

                        </div>


                        <div class="incoming-actions">

                            <button
                                class="accept-btn"
                                onclick="
                                    respondToRequest(
                                        '${request.id}',
                                        'Accepted'
                                    )
                                "
                            >
                                Accept
                            </button>


                            <button
                                class="decline-btn"
                                onclick="
                                    respondToRequest(
                                        '${request.id}',
                                        'Declined'
                                    )
                                "
                            >
                                Decline
                            </button>

                        </div>

                    </div>

                `;

            })
            .join("");

}


/* =====================================================
   DONOR ACCEPT / DECLINE
===================================================== */

function respondToRequest(
    requestId,
    response
) {

    const request =
        requests.find(
            item => item.id === requestId
        );


    if (!request) return;


    /*
       Demo donor:
       We use the first matched donor.
       In the backend version this will be
       the logged-in donor's ID.
    */

    if (
        !request.matches ||
        request.matches.length === 0
    ) {

        showToast(
            "No donor match available."
        );

        return;

    }


    request.matches[0].status =
        response;


    if (response === "Accepted") {

        request.status =
            "Matched";

        showToast(
            "Request accepted successfully."
        );

    }

    else {

        showToast(
            "Request declined."
        );

    }


    saveRequests();

    updateStats();

    renderRequests();

    renderIncomingRequests();

    closeModal();

}


/* =====================================================
   CANCEL REQUEST
===================================================== */

function cancelRequest(requestId) {

    const request =
        requests.find(
            item => item.id === requestId
        );


    if (!request) return;


    const confirmCancel =
        confirm(
            "Are you sure you want to cancel this request?"
        );


    if (!confirmCancel) return;


    request.status =
        "Cancelled";


    saveRequests();

    renderRequests();

    updateStats();

    showToast(
        "Blood request cancelled."
    );

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {

    document
        .getElementById("requestModal")
        .classList
        .remove("show");

}


/* =====================================================
   UPDATE STATISTICS
===================================================== */

function updateStats() {

    const total =
        requests.length;


    const open =
        requests.filter(
            r => r.status === "Open"
        ).length;


    const matched =
        requests.filter(
            r => r.status === "Matched"
        ).length;


    const fulfilled =
        requests.filter(
            r => r.status === "Fulfilled"
        ).length;


    document.getElementById(
        "totalRequests"
    ).textContent = total;


    document.getElementById(
        "openRequests"
    ).textContent = open;


    document.getElementById(
        "matchedRequests"
    ).textContent = matched;


    document.getElementById(
        "fulfilledRequests"
    ).textContent = fulfilled;

}


/* =====================================================
   TOAST NOTIFICATION
===================================================== */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    const messageBox =
        document.getElementById(
            "toastMessage"
        );


    messageBox.textContent =
        message;


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    localStorage.removeItem(
        "raktsetuCurrentUser"
    );

    showToast(
        "Logged out successfully."
    );

}