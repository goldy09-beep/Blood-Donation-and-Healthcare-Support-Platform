
// ======================================
// RAKTSETU - AUTHENTICATION SYSTEM
// ======================================

// Get all registered users
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

// Get currently logged-in user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

// Save all registered users
function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}


// ======================================
// SIGNUP
// ======================================

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    const roleSelect = document.getElementById("userRole");
    const bloodGroupField = document.getElementById("bloodGroupField");
    const hospitalNameField = document.getElementById("hospitalNameField");
    const cityField = document.getElementById("cityField");

    // Show fields according to selected role
    function updateRoleFields() {

        const role = roleSelect.value;

        bloodGroupField.hidden =
            !(role === "Donor" || role === "Recipient");

        hospitalNameField.hidden = role !== "Hospital";

        cityField.hidden = role !== "Volunteer";

        document.getElementById("bloodGroup").required =
            role === "Donor" || role === "Recipient";

        document.getElementById("hospitalName").required =
            role === "Hospital";

        document.getElementById("city").required =
            role === "Volunteer";
    }

    roleSelect.addEventListener("change", updateRoleFields);

    // Read role from URL if available
    const params = new URLSearchParams(window.location.search);
    const selectedRole = params.get("role");

    if (selectedRole) {
        roleSelect.value = selectedRole;
        updateRoleFields();
    }

    // Password visibility
    document.querySelectorAll(".password-toggle").forEach(button => {

        button.addEventListener("click", function () {

            const target = document.getElementById(
                this.dataset.target
            );

            if (!target) return;

            const isPassword = target.type === "password";

            target.type = isPassword ? "text" : "password";

            this.textContent = isPassword ? "Hide" : "Show";

        });

    });


    signupForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const role = roleSelect.value;

        const bloodGroup = document.getElementById("bloodGroup").value;

        const hospitalName = document.getElementById("hospitalName").value.trim();

        const city = document.getElementById("city").value.trim();


        // Password validation
        if (password.length < 8) {
            alert("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Check existing email
        const users = getUsers();

        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {
            alert("This email is already registered.");
            return;
        }

        if (!role) {
            alert("Please select your role.");
            return;
        }

        // Create new account
        const newUser = {

            id: Date.now().toString(),

            name,
            email,
            password,
            role,

            phone: "",
            city: role === "Volunteer" ? city : "",
            bloodGroup: bloodGroup || "",

            hospitalName: role === "Hospital" ? hospitalName : "",

            available: true,

            createdAt: new Date().toISOString()

        };

        // Add user without deleting previous accounts
        users.push(newUser);

        saveUsers(users);

        alert("Account created successfully!");

        window.location.href = "login.html";

    });

}


// ======================================
// LOGIN
// ======================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();

        const password = document.getElementById("loginPassword").value;

        const users = getUsers();

        const matchedUser = users.find(user =>
            user.email === email && user.password === password
        );

        if (!matchedUser) {
            alert("Invalid email or password!");
            return;
        }

        // Save current session
        localStorage.setItem(
            "currentUser",
            JSON.stringify(matchedUser)
        );

        alert("Login successful!");

        // Redirect according to role
        if (matchedUser.role === "Donor") {

            window.location.href = "../profile/donor-profile.html";

        }

        else if (matchedUser.role === "Hospital") {

            window.location.href = "../profile/hospital-profile.html";

        }

        else {

            window.location.href = "../../index.html";

        }

    });

}


// ======================================
// PROFILE DISPLAY
// ======================================

const currentUser = getCurrentUser();

const profileName = document.getElementById("profileName");

if (profileName) {

    if (!currentUser) {

        window.location.href = "../auth/login.html";

    } else {

        const profileEmail = document.getElementById("profileEmail");
        const profileRole = document.getElementById("profileRole");
        const profilePhone = document.getElementById("profilePhone");
        const profileCity = document.getElementById("profileCity");
        const profileBlood = document.getElementById("profileBlood");

        profileName.textContent = currentUser.hospitalName || currentUser.name;

        if (profileEmail)
            profileEmail.textContent = currentUser.email;

        if (profileRole)
            profileRole.textContent = currentUser.role;

        if (profilePhone)
            profilePhone.textContent = currentUser.phone || "Not added";

        if (profileCity)
            profileCity.textContent = currentUser.city || "Not added";

        if (profileBlood)
            profileBlood.textContent = currentUser.bloodGroup || "Not added";
    }
}


// ======================================
// EDIT PROFILE
// ======================================

const editProfileForm = document.getElementById("editProfileForm");

if (editProfileForm) {

    if (!currentUser) {

        window.location.href = "../auth/login.html";

    } else {

        document.getElementById("name").value = currentUser.name || "";

        document.getElementById("email").value = currentUser.email || "";

        document.getElementById("phone").value = currentUser.phone || "";

        document.getElementById("city").value = currentUser.city || "";

        document.getElementById("bloodGroup").value = currentUser.bloodGroup || "";


        editProfileForm.addEventListener("submit", function(event) {

            event.preventDefault();

            const users = getUsers();

            const updatedEmail = document.getElementById("email").value.trim().toLowerCase();

            const emailExists = users.some(user =>
                user.email === updatedEmail &&
                user.id !== currentUser.id
            );

            if (emailExists) {
                alert("This email is already registered.");
                return;
            }

            currentUser.name = document.getElementById("name").value.trim();

            currentUser.email = updatedEmail;

            currentUser.phone = document.getElementById("phone").value.trim();

            currentUser.city = document.getElementById("city").value.trim();

            currentUser.bloodGroup = document.getElementById("bloodGroup").value;


            const index = users.findIndex(
                user => user.id === currentUser.id
            );

            if (index !== -1) {

                users[index] = currentUser;

                saveUsers(users);

                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(currentUser)
                );

                alert("Profile updated successfully!");

                if (currentUser.role === "Donor") {
                    window.location.href = "donor-profile.html";
                } else {
                    window.location.href = "hospital-profile.html";
                }
            }

        });

    }

}


// ======================================
// LOGOUT
// ======================================

function logout() {

    localStorage.removeItem("currentUser");

    alert("You have been logged out!");

    window.location.href = "../auth/login.html";

}
