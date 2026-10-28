// =========================
// SIGNUP
// =========================

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    // Get role from URL
    const params = new URLSearchParams(window.location.search);
    const selectedRole = params.get("role");

    if (selectedRole) {
        document.getElementById("userRole").value = selectedRole;
    }


    signupForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const role = document.getElementById("userRole").value;


        // Password validation
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }


        // Create user
        const user = {

            name: name,
            email: email,
            password: password,
            role: role,

            phone: "",
            city: "",
            bloodGroup: ""
        };


        // Save user
        localStorage.setItem("user", JSON.stringify(user));


        alert("Account created successfully!");


        // Go to login
        window.location.href = "login.html";

    });
}



// =========================
// LOGIN
// =========================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();


        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;


        const user =
            JSON.parse(localStorage.getItem("user"));


        if (!user) {

            alert("No account found. Please sign up first.");

            return;
        }


        if (user.email === email && user.password === password) {

            localStorage.setItem("loggedIn", "true");


            alert("Login successful!");


            if (user.role === "Donor") {

                window.location.href =
                    "../profiles/donor-profile.html";

            }

            else if (user.role === "Hospital") {

                window.location.href =
                    "../profiles/hospital-profile.html";

            }

            else {

                window.location.href =
                    "../../index.html";
            }

        }

        else {

            alert("Invalid email or password!");

        }

    });
}



// =========================
// PROFILE DATA
// =========================

const user =
    JSON.parse(localStorage.getItem("user"));


if (user) {

    const profileName =
        document.getElementById("profileName");

    const profileEmail =
        document.getElementById("profileEmail");

    const profileRole =
        document.getElementById("profileRole");

    const profilePhone =
        document.getElementById("profilePhone");

    const profileCity =
        document.getElementById("profileCity");

    const profileBlood =
        document.getElementById("profileBlood");


    if (profileName)
        profileName.textContent = user.name;


    if (profileEmail)
        profileEmail.textContent = user.email;


    if (profileRole)
        profileRole.textContent = user.role;


    if (profilePhone)
        profilePhone.textContent =
            user.phone || "Not added";


    if (profileCity)
        profileCity.textContent =
            user.city || "Not added";


    if (profileBlood)
        profileBlood.textContent =
            user.bloodGroup || "Not added";
}



// =========================
// EDIT PROFILE
// =========================

const editProfileForm =
    document.getElementById("editProfileForm");


if (editProfileForm && user) {

    document.getElementById("name").value =
        user.name || "";

    document.getElementById("email").value =
        user.email || "";

    document.getElementById("phone").value =
        user.phone || "";

    document.getElementById("city").value =
        user.city || "";

    document.getElementById("bloodGroup").value =
        user.bloodGroup || "";


    editProfileForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            user.name =
                document.getElementById("name").value;

            user.email =
                document.getElementById("email").value;

            user.phone =
                document.getElementById("phone").value;

            user.city =
                document.getElementById("city").value;

            user.bloodGroup =
                document.getElementById("bloodGroup").value;


            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );


            alert("Profile updated successfully!");


            if (user.role === "Donor") {

                window.location.href =
                    "donor-profile.html";

            }

            else {

                window.location.href =
                    "hospital-profile.html";

            }

        }
    );
}



// =========================
// LOGOUT
// =========================

function logout() {

    localStorage.removeItem("loggedIn");

    alert("You have been logged out!");

    window.location.href =
        "../auth/login.html";
}