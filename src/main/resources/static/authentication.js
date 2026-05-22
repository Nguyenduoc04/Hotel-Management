document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".container");
    const registerBtn = document.querySelector(".register-btn");
    const loginBtn = document.querySelector(".login-btn");

    if (registerBtn && loginBtn && container) {
        registerBtn.addEventListener("click", () => {
            container.classList.add("active");
        });

        loginBtn.addEventListener("click", () => {
            container.classList.remove("active");
        });
    }

    // Login logic
    const loginForm = document.querySelector(".form-box.login form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const usernameInput = loginForm.querySelector('input[name="username"]');
            const passwordInput = loginForm.querySelector('input[name="password"]');

            const payload = {
                username: usernameInput.value,
                password: passwordInput.value
            };

            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("username", data.username);
                    localStorage.setItem("role", data.role);
                    if (data.accountId) localStorage.setItem("accountId", data.accountId);
                    if (data.guestId) localStorage.setItem("guestId", data.guestId);
                    if (data.employeeId) localStorage.setItem("employeeId", data.employeeId);

                    alert("Login successful!");
                    window.location.href = "/home";
                } else {
                    alert("Invalid username or password.");
                }
            } catch (err) {
                console.error("Login error:", err);
                alert("An error occurred during login. Please try again.");
            }
        });
    }

    // Register logic
    const registerForm = document.querySelector(".form-box.register form");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const usernameInput = registerForm.querySelector('input[name="username"]');
            const emailInput = registerForm.querySelector('input[name="email"]');
            const passwordInput = registerForm.querySelector('input[name="password"]');

            const payload = {
                username: usernameInput.value,
                email: emailInput.value,
                password: passwordInput.value
            };

            try {
                const response = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("username", data.username);
                    localStorage.setItem("role", data.role);
                    if (data.accountId) localStorage.setItem("accountId", data.accountId);
                    if (data.guestId) localStorage.setItem("guestId", data.guestId);

                    alert("Registration successful!");
                    window.location.href = "/home";
                } else {
                    alert("Registration failed. Username or email might be taken.");
                }
            } catch (err) {
                console.error("Registration error:", err);
                alert("An error occurred during registration. Please try again.");
            }
        });
    }
});
