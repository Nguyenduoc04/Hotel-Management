document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. Security Check & Navigation
    // ----------------------------------------------------
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");
    const currentPath = window.location.pathname;

    // Public paths
    const isLoginPage = currentPath.startsWith("/login");
    const isPublicLanding = currentPath === "/" || currentPath === "/home";

    if (!token) {
        if (!isLoginPage && !isPublicLanding) {
            window.location.href = "/login";
            return;
        }
    } else {
        if (role !== "ADMIN" && role !== "EMPLOYEE") {
            if (!isLoginPage && !isPublicLanding) {
                window.location.href = "/home";
                return;
            }
        }

        // Hide setting link from navigation if not ADMIN
        if (role !== "ADMIN") {
            document.querySelectorAll(".nav__links-item").forEach(item => {
                const link = item.querySelector("a");
                if (link && link.getAttribute("href") === "/setting") {
                    item.remove();
                }
            });
        }

        // Block non-ADMIN from accessing /setting
        if (currentPath === "/setting" && role !== "ADMIN") {
            window.location.href = "/dashboard";
            return;
        }
    }

    // Set active nav link highlighting
    const navItems = document.querySelectorAll(".nav__links-item");
    navItems.forEach(item => {
        const link = item.querySelector("a");
        if (link && (link.getAttribute("href") === currentPath || (link.getAttribute("href") === "/dashboard" && currentPath === "/dashboard"))) {
            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        }
    });

    // Handle logout
    const logoutBtn = document.querySelector(".logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "/login";
        });
    }

    // Forward calendar icon clicks to the sibling date input
    document.querySelectorAll(".input-layout i.material-icons").forEach(icon => {
        if (icon.textContent.trim() === "calendar_month") {
            icon.style.cursor = "pointer";
            icon.addEventListener("click", () => {
                const dateInput = icon.closest(".input-layout").querySelector("input[type='date']");
                if (dateInput) {
                    dateInput.focus();
                    dateInput.showPicker && dateInput.showPicker();
                }
            });
        }
    });

    // User Widget Management (run on any page that has these elements, like guest.html)
    const userMenuBtn = document.getElementById("userMenuBtn");
    const userMenuDropdown = document.getElementById("userMenuDropdown");
    const userMenuText = document.getElementById("userMenuText");
    const dropdownArrow = document.querySelector(".dropdown-arrow");
    const dropdownUsername = document.getElementById("dropdownUsername");
    const dropdownRole = document.getElementById("dropdownRole");
    const dashboardLink = document.getElementById("dashboardLink");
    const logoutWidgetBtn = document.getElementById("logoutBtn");

    if (userMenuBtn) {
        if (!token) {
            // Not logged in
            if (userMenuText) userMenuText.textContent = "Sign In";
            if (dropdownArrow) dropdownArrow.style.display = "none";
            
            userMenuBtn.addEventListener("click", () => {
                window.location.href = "/login";
            });
        } else {
            // Logged in
            if (userMenuText) userMenuText.textContent = `${username} (${role})`;
            if (dropdownArrow) dropdownArrow.style.display = "inline-block";
            if (dropdownUsername) dropdownUsername.textContent = username;
            if (dropdownRole) {
                dropdownRole.textContent = role;
                dropdownRole.className = `role-badge ${role.toLowerCase()}`;
            }

            // Show dashboard link only for ADMIN and EMPLOYEE roles
            if (dashboardLink) {
                if (role === "ADMIN" || role === "EMPLOYEE") {
                    dashboardLink.style.display = "flex";
                } else {
                    dashboardLink.style.display = "none";
                }
            }

            if (logoutWidgetBtn) {
                logoutWidgetBtn.style.display = "flex";
                logoutWidgetBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    localStorage.clear();
                    window.location.href = "/home";
                });
            }

            // Click button to toggle dropdown
            userMenuBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (userMenuDropdown) {
                    userMenuDropdown.classList.toggle("active");
                }
            });

            // Click outside to close dropdown
            document.addEventListener("click", (e) => {
                if (userMenuDropdown && !userMenuBtn.contains(e.target) && !userMenuDropdown.contains(e.target)) {
                    userMenuDropdown.classList.remove("active");
                }
            });

            // Profile modal logic
            const profileBtn = document.getElementById("profileBtn");
            const profileModal = document.getElementById("profileModal");
            const profileUsernameInput = document.getElementById("profileUsername");
            const profileEmailInput = document.getElementById("profileEmail");
            const profilePasswordInput = document.getElementById("profilePassword");
            const profileRoleInput = document.getElementById("profileRole");
            const saveProfileBtn = document.getElementById("saveProfileBtn");

            if (profileBtn && profileModal) {
                profileBtn.addEventListener("click", async (e) => {
                    e.preventDefault();
                    if (userMenuDropdown) {
                        userMenuDropdown.classList.remove("active");
                    }
                    const accountId = localStorage.getItem("accountId");
                    if (!accountId) {
                        alert("Account ID not found. Please log in again.");
                        return;
                    }

                    // Fetch current user details
                    const res = await apiFetch(`/api/accounts/${accountId}`);
                    if (res && res.ok) {
                        const accountData = await res.json();
                        if (profileUsernameInput) profileUsernameInput.value = accountData.username || "";
                        if (profileEmailInput) profileEmailInput.value = accountData.email || "";
                        if (profileRoleInput) profileRoleInput.value = accountData.role || "";
                        if (profilePasswordInput) profilePasswordInput.value = ""; // clear old entries
                        
                        profileModal.classList.add("active");
                    } else {
                        alert("Failed to load account information.");
                    }
                });
            }

            if (saveProfileBtn && profileModal) {
                saveProfileBtn.addEventListener("click", async () => {
                    const accountId = localStorage.getItem("accountId");
                    if (!accountId) {
                        alert("Account ID not found. Please log in again.");
                        return;
                    }

                    const newUsername = profileUsernameInput ? profileUsernameInput.value.trim() : "";
                    const newEmail = profileEmailInput ? profileEmailInput.value.trim() : "";
                    const newPassword = profilePasswordInput ? profilePasswordInput.value : "";
                    const currentRole = profileRoleInput ? profileRoleInput.value : "";

                    if (!newUsername || !newEmail) {
                        alert("Username and Email are required.");
                        return;
                    }

                    const payload = {
                        username: newUsername,
                        email: newEmail,
                        role: currentRole,
                        active: true
                    };
                    if (newPassword && newPassword.trim() !== "") {
                        payload.password = newPassword;
                    }

                    const res = await apiFetch(`/api/accounts/${accountId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    });

                    if (res && res.ok) {
                        const updatedAccount = await res.json();
                        // Update local storage
                        localStorage.setItem("username", updatedAccount.username);
                        // Update UI
                        if (userMenuText) userMenuText.textContent = `${updatedAccount.username} (${updatedAccount.role})`;
                        if (dropdownUsername) dropdownUsername.textContent = updatedAccount.username;
                        
                        alert("Account details updated successfully!");
                        profileModal.classList.remove("active");
                    } else {
                        alert("Failed to update account details. Username or email might already be taken.");
                    }
                });
            }
        }
    }

    // Auth fetch wrapper
    async function apiFetch(url, options = {}) {
        const token = localStorage.getItem("token");
        if (token) {
            options.headers = {
                ...options.headers,
                "Authorization": `Bearer ${token}`
            };
        }
        try {
            const response = await fetch(url, options);
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = "/login";
                return null;
            }
            return response;
        } catch (err) {
            console.error("Fetch error on " + url + ":", err);
            return null;
        }
    }

    // ----------------------------------------------------
    // 2. Global Modal Management
    // ----------------------------------------------------
    // Open modal
    document.addEventListener("click", (e) => {
        const openBtn = e.target.closest(".openModal");
        if (openBtn) {
            e.preventDefault();
            const targetSelector = openBtn.getAttribute("data-target");
            const modal = document.querySelector(targetSelector);
            if (modal) {
                modal.classList.add("active");
                // Trigger any dropdown updates or logic needed when opening modal
                if (targetSelector === "#addReservationModal" || targetSelector === "#updateReservationModal") {
                    loadReservationDropdowns(targetSelector);
                }
            }
        }
    });

    // Close modal
    document.addEventListener("click", (e) => {
        if (e.target.closest(".closeModal") || e.target.classList.contains("modal__overlay")) {
            const openModals = document.querySelectorAll(".modal.active");
            openModals.forEach(modal => modal.classList.remove("active"));
        }
    });

    // Helper for Custom Dropdowns/Select menus
    function setupCustomDropdown(containerId, optionsList, onSelect) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const selectBtn = container.querySelector(".input-layout.select-menu");
        const listContainer = container.querySelector(".options");
        const textSpan = container.querySelector(".text");

        // Clear existing options
        listContainer.innerHTML = "";

        // Populate options
        optionsList.forEach(opt => {
            const li = document.createElement("li");
            li.className = "option";
            li.setAttribute("data-value", opt.value);
            li.innerHTML = `<span class="option-text">${opt.text}</span>`;
            listContainer.appendChild(li);
        });

        // Toggle list visibility
        const toggleDropdown = (e) => {
            e.stopPropagation();
            // Close other open dropdowns first
            document.querySelectorAll(".input-container.select-menu").forEach(el => {
                if (el.id !== containerId) el.classList.remove("active");
            });
            container.classList.toggle("active");
        };

        selectBtn.removeEventListener("click", toggleDropdown);
        selectBtn.addEventListener("click", toggleDropdown);

        // Click option
        listContainer.addEventListener("click", (e) => {
            const optionLi = e.target.closest(".option");
            if (optionLi) {
                const val = optionLi.getAttribute("data-value");
                const text = optionLi.querySelector(".option-text").textContent;
                textSpan.textContent = text;
                container.setAttribute("data-selected-value", val);
                container.classList.remove("active");
                if (onSelect) onSelect(val, text);
            }
        });
    }

    // Close dropdowns on body click
    document.addEventListener("click", () => {
        document.querySelectorAll(".input-container.select-menu").forEach(el => {
            el.classList.remove("active");
        });
    });

    // ----------------------------------------------------
    // 3. DASHBOARD PAGE (index.html)
    // ----------------------------------------------------
    const recentTable = document.getElementById("recentTableBody");
    if (recentTable) {
        loadDashboardData();
    }

    async function loadDashboardData() {
        // Fetch stats & reservations
        const guestsRes = await apiFetch("/api/guests");
        const reservationsRes = await apiFetch("/api/reservations");

        if (guestsRes && reservationsRes) {
            const guests = await guestsRes.json();
            const reservations = await reservationsRes.json();

            // Total guest count
            const guestCountEl = document.querySelector(".customer + h3 + h1");
            if (guestCountEl) guestCountEl.textContent = guests.length.toLocaleString();

            // Total booking count
            const bookingCountEl = document.querySelector(".booking + h3 + h1");
            if (bookingCountEl) bookingCountEl.textContent = reservations.length.toLocaleString();

            // Total revenue amount
            const totalAmountEl = document.querySelector(".amount + h3 + h1");
            const totalRevenue = reservations.reduce((sum, res) => sum + res.totalAmount, 0);
            if (totalAmountEl) totalAmountEl.textContent = "$" + totalRevenue.toLocaleString();

            // Render recent reservations table
            recentTable.innerHTML = "";
            const recentReservations = reservations.slice(-5).reverse(); // last 5 reservations
            recentReservations.forEach(res => {
                const tr = document.createElement("tr");
                const roomNumbers = res.rooms.map(r => r.roomNumber).join(", ");
                tr.innerHTML = `
                    <td>${res.guestName}</td>
                    <td>Room ${roomNumbers || "N/A"}</td>
                    <td>${res.hotelName}</td>
                    <td>${res.checkIn}</td>
                    <td>${res.checkOut}</td>
                    <td>$${res.totalAmount.toLocaleString()}</td>
                    <td><span class="status-badge ${res.status.toLowerCase()}">${res.status}</span></td>
                `;
                recentTable.appendChild(tr);
            });
        }
    }

    // ----------------------------------------------------
    // 4. GUEST MANAGEMENT PAGE (client.html)
    // ----------------------------------------------------
    const guestTable = document.getElementById("guestTableBody");
    if (guestTable) {
        loadGuests();

        // Add guest submit
        const confirmAddGuestBtn = document.getElementById("confirmAddGuestBtn");
        if (confirmAddGuestBtn) {
            confirmAddGuestBtn.addEventListener("click", async () => {
                const fname = document.getElementById("guestFirstName").value;
                const lname = document.getElementById("guestLastName").value;
                const phone = document.getElementById("guestPhone").value;
                const email = document.getElementById("guestEmail").value;
                const usernameInput = document.getElementById("guestUsername").value;
                const passwordInput = document.getElementById("guestPassword").value;
                const address = document.getElementById("guestAddress").value;
                const origin = document.getElementById("guestOrigin").value;
                const dob = document.getElementById("dob").value;
                const idNumber = document.getElementById("idNumber").value;

                if (!usernameInput || !email || !passwordInput) {
                    alert("Username, Email, and Password are required.");
                    return;
                }

                const payload = {
                    username: usernameInput,
                    password: passwordInput,
                    email: email,
                    firstName: fname,
                    lastName: lname,
                    phone: phone,
                    idNumber: idNumber,
                    address: address,
                    origin: origin,
                    dob: dob
                };

                const res = await apiFetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res && res.ok) {
                    alert("Guest added successfully!");
                    document.getElementById("addGuestModal").classList.remove("active");
                    // Clear inputs
                    document.querySelectorAll("#addGuestModal input").forEach(i => i.value = "");
                    loadGuests();
                } else {
                    alert("Failed to add guest. Username or Email might be taken.");
                }
            });
        }

        // Update guest submit
        const confirmUpdateGuestBtn = document.getElementById("confirmUpdateGuestBtn");
        if (confirmUpdateGuestBtn) {
            confirmUpdateGuestBtn.addEventListener("click", async () => {
                const id = document.getElementById("updateGuestId").value;
                const fname = document.getElementById("updateFirstName").value;
                const lname = document.getElementById("updateLastName").value;
                const phone = document.getElementById("updatePhone").value;
                const email = document.getElementById("updateEmail").value;
                const address = document.getElementById("updateAddress").value;
                const origin = document.getElementById("updateOrigin").value;
                const dob = document.getElementById("updateDob").value;
                const idNumber = document.getElementById("updateIdNumber").value;

                const payload = {
                    firstName: fname,
                    lastName: lname,
                    phone: phone,
                    email: email,
                    address: address,
                    origin: origin,
                    dob: dob,
                    idNumber: idNumber
                };

                const res = await apiFetch(`/api/guests/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res && res.ok) {
                    alert("Guest details updated successfully!");
                    document.getElementById("updateGuestModal").classList.remove("active");
                    loadGuests();
                } else {
                    alert("Failed to update guest details.");
                }
            });
        }
    }

    async function loadGuests() {
        const response = await apiFetch("/api/guests");
        if (response) {
            const guests = await response.json();
            guestTable.innerHTML = "";
            guests.forEach(g => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${g.firstName} ${g.lastName}</td>
                    <td>${g.dob || "N/A"}</td>
                    <td>${g.email || "N/A"}</td>
                    <td>${g.phone || "N/A"}</td>
                    <td>${g.address || "N/A"}</td>
                    <td>${g.idNumber || "N/A"}</td>
                    <td>${g.origin || "N/A"}</td>
                    <td>
                        <button class="edit-btn open-edit-guest" data-id="${g.id}"><i class="material-icons">edit</i></button>
                        <button class="delete-btn delete-guest" data-id="${g.id}"><i class="material-icons">delete</i></button>
                    </td>
                `;
                guestTable.appendChild(tr);
            });

            // Bind edit guest
            document.querySelectorAll(".open-edit-guest").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.getAttribute("data-id");
                    const gRes = await apiFetch(`/api/guests/${id}`);
                    if (gRes) {
                        const g = await gRes.json();
                        document.getElementById("updateGuestId").value = g.id;
                        document.getElementById("updateFirstName").value = g.firstName;
                        document.getElementById("updateLastName").value = g.lastName;
                        document.getElementById("updatePhone").value = g.phone;
                        document.getElementById("updateEmail").value = g.email || "";
                        document.getElementById("updateAddress").value = g.address || "";
                        document.getElementById("updateOrigin").value = g.origin || "";
                        document.getElementById("updateDob").value = g.dob || "";
                        document.getElementById("updateIdNumber").value = g.idNumber || "";

                        document.getElementById("updateGuestModal").classList.add("active");
                    }
                });
            });

            // Bind delete guest
            document.querySelectorAll(".delete-guest").forEach(btn => {
                btn.addEventListener("click", async () => {
                    if (confirm("Are you sure you want to delete this guest?")) {
                        const id = btn.getAttribute("data-id");
                        const dRes = await apiFetch(`/api/guests/${id}`, { method: "DELETE" });
                        if (dRes && dRes.ok) {
                            alert("Guest deleted successfully!");
                            loadGuests();
                        } else {
                            alert("Cannot delete guest. It might be referenced by reservations.");
                        }
                    }
                });
            });
        }
    }

    // ----------------------------------------------------
    // 5. HOTEL MANAGEMENT PAGE (hotels.html)
    // ----------------------------------------------------
    const hotelTable = document.getElementById("hotelTableBody");
    if (hotelTable) {
        loadHotels();

        // Add hotel
        const confirmAddHotelBtn = document.getElementById("confirmAddHotelBtn");
        if (confirmAddHotelBtn) {
            confirmAddHotelBtn.addEventListener("click", async () => {
                const name = document.getElementById("addHotelName").value;
                const address = document.getElementById("addHotelAddress").value;
                const phone = document.getElementById("addHotelPhone").value;
                const email = document.getElementById("addHotelEmail").value;
                const rating = parseFloat(document.getElementById("addHotelRating").value) || 5.0;

                if (!name || !address) {
                    alert("Hotel name and address are required.");
                    return;
                }

                const payload = { name, address, phone, email, rating };
                const res = await apiFetch("/api/hotels", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res && res.ok) {
                    alert("Hotel added successfully!");
                    document.getElementById("addHotelModal").classList.remove("active");
                    document.querySelectorAll("#addHotelModal input").forEach(i => i.value = "");
                    loadHotels();
                } else {
                    alert("Failed to add hotel.");
                }
            });
        }

        // Update hotel
        const confirmUpdateHotelBtn = document.getElementById("confirmUpdateHotelBtn");
        if (confirmUpdateHotelBtn) {
            confirmUpdateHotelBtn.addEventListener("click", async () => {
                const id = document.getElementById("updateHotelId").value;
                const name = document.getElementById("updateHotelName").value;
                const rating = parseFloat(document.getElementById("updateHotelRating").value) || 5.0;
                const phone = document.getElementById("updateHotelPhone").value;
                const email = document.getElementById("updateHotelEmail").value;
                const address = document.getElementById("updateHotelAddress").value;

                if (!name || !address) {
                    alert("Hotel name and address are required.");
                    return;
                }

                const payload = { name, rating, phone, email, address };
                const res = await apiFetch(`/api/hotels/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res && res.ok) {
                    alert("Hotel updated successfully!");
                    document.getElementById("updateHotelModal").classList.remove("active");
                    loadHotels();
                } else {
                    alert("Failed to update hotel.");
                }
            });
        }
    }

    async function loadHotels() {
        const response = await apiFetch("/api/hotels");
        if (response) {
            const hotels = await response.json();
            hotelTable.innerHTML = "";
            hotels.forEach(h => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${h.name}</td>
                    <td>${h.address}</td>
                    <td>${h.phone || "N/A"}</td>
                    <td>${h.email || "N/A"}</td>
                    <td>${h.rating} ⭐</td>
                    <td>
                        <button class="edit-btn view-rooms-btn" data-id="${h.id}"><i class="material-icons">meeting_room</i> Rooms</button>
                        <button class="edit-btn open-edit-hotel" data-id="${h.id}"><i class="material-icons">edit</i></button>
                        <button class="delete-btn delete-hotel" data-id="${h.id}"><i class="material-icons">delete</i></button>
                    </td>
                `;
                hotelTable.appendChild(tr);
            });

            // Bind view rooms
            document.querySelectorAll(".view-rooms-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-id");
                    window.location.href = `/room?hotelId=${id}`;
                });
            });

            // Bind edit hotel
            document.querySelectorAll(".open-edit-hotel").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.getAttribute("data-id");
                    const hRes = await apiFetch(`/api/hotels/${id}`);
                    if (hRes) {
                        const h = await hRes.json();
                        document.getElementById("updateHotelId").value = h.id;
                        document.getElementById("updateHotelName").value = h.name;
                        document.getElementById("updateHotelRating").value = h.rating;
                        document.getElementById("updateHotelPhone").value = h.phone || "";
                        document.getElementById("updateHotelEmail").value = h.email || "";
                        document.getElementById("updateHotelAddress").value = h.address;

                        document.getElementById("updateHotelModal").classList.add("active");
                    }
                });
            });

            // Bind delete hotel
            document.querySelectorAll(".delete-hotel").forEach(btn => {
                btn.addEventListener("click", async () => {
                    if (confirm("Are you sure you want to delete this hotel?")) {
                        const id = btn.getAttribute("data-id");
                        const dRes = await apiFetch(`/api/hotels/${id}`, { method: "DELETE" });
                        if (dRes && dRes.ok) {
                            alert("Hotel deleted successfully!");
                            loadHotels();
                        } else {
                            alert("Cannot delete hotel. It might contain active rooms or bookings.");
                        }
                    }
                });
            });
        }
    }

    // ----------------------------------------------------
    // 6. ROOM MANAGEMENT PAGE (room.html)
    // ----------------------------------------------------
    const roomTable = document.getElementById("roomTableBody");
    if (roomTable) {
        const hotelIdMeta = document.querySelector('meta[name="hotel-id"]');
        const hotelId = hotelIdMeta ? hotelIdMeta.getAttribute("content") : 1;

        loadRooms(hotelId);
        loadRoomTypes();

        // Add Room
        const confirmAddRoomBtn = document.getElementById("confirmAddRoomBtn");
        if (confirmAddRoomBtn) {
            confirmAddRoomBtn.addEventListener("click", async () => {
                const roomNum = document.getElementById("addRoomNumber").value;
                const floor = parseInt(document.getElementById("addRoomFloor").value) || 1;
                const roomTypeContainer = document.getElementById("addRoomTypeSelect");
                const roomTypeId = roomTypeContainer ? roomTypeContainer.getAttribute("data-selected-value") : null;

                if (!roomNum || !roomTypeId) {
                    alert("Room number and Room Type are required.");
                    return;
                }

                const payload = {
                    roomNumber: roomNum,
                    floor: floor,
                    status: "AVAILABLE",
                    roomTypeId: parseInt(roomTypeId),
                    hotelId: parseInt(hotelId)
                };

                const res = await apiFetch("/api/rooms", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res && res.ok) {
                    alert("Room added successfully!");
                    document.getElementById("addRoomModal").classList.remove("active");
                    document.getElementById("addRoomNumber").value = "";
                    document.getElementById("addRoomFloor").value = "";
                    document.getElementById("addRoomTypeText").textContent = "Select Room Type";
                    loadRooms(hotelId);
                } else {
                    alert("Failed to add room.");
                }
            });
        }

        // Add Room Type
        const confirmAddRoomType = document.getElementById("confirmAddRoomType");
        if (confirmAddRoomType) {
            confirmAddRoomType.addEventListener("click", async () => {
                const name = document.getElementById("newRoomTypeName").value;
                const price = parseFloat(document.getElementById("newRoomTypeBasePrice").value) || 0.0;
                const capacity = parseInt(document.getElementById("newRoomTypeCapacity").value) || 1;
                const desc = document.getElementById("newRoomTypeDescription").value;

                if (!name || price <= 0) {
                    alert("Name and positive price are required.");
                    return;
                }

                const payload = { name, basePrice: price, capacity, description: desc };
                const res = await apiFetch("/api/room-types", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res && res.ok) {
                    alert("Room Type created successfully!");
                    document.getElementById("addRoomTypeModal").classList.remove("active");
                    document.querySelectorAll("#addRoomTypeModal input").forEach(i => i.value = "");
                    loadRoomTypes();
                } else {
                    alert("Failed to add Room Type.");
                }
            });
        }

        // Update Room
        const confirmUpdateRoomBtn = document.getElementById("confirmUpdateRoomBtn");
        if (confirmUpdateRoomBtn) {
            confirmUpdateRoomBtn.addEventListener("click", async () => {
                const id = document.getElementById("updateRoomId").value;
                const roomNum = document.getElementById("updateRoomNumber").value;
                const floor = parseInt(document.getElementById("updateRoomFloor").value) || 1;
                const statusContainer = document.getElementById("updateRoomStatusSelect");
                const status = statusContainer ? statusContainer.getAttribute("data-selected-value") : "AVAILABLE";
                const typeContainer = document.getElementById("updateRoomTypeSelect");
                const roomTypeId = typeContainer ? typeContainer.getAttribute("data-selected-value") : null;

                if (!roomNum || !roomTypeId) {
                    alert("Room number and Room Type are required.");
                    return;
                }

                const payload = {
                    roomNumber: roomNum,
                    floor: floor,
                    status: status,
                    roomTypeId: parseInt(roomTypeId),
                    hotelId: parseInt(hotelId)
                };

                const res = await apiFetch(`/api/rooms/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res && res.ok) {
                    alert("Room updated successfully!");
                    document.getElementById("updateRoomModal").classList.remove("active");
                    loadRooms(hotelId);
                } else {
                    alert("Failed to update room.");
                }
            });
        }

        // Update Room Type
        const confirmUpdateRoomType = document.getElementById("confirmUpdateRoomType");
        if (confirmUpdateRoomType) {
            confirmUpdateRoomType.addEventListener("click", async () => {
                const id = document.getElementById("updateRoomTypeId").value;
                const name = document.getElementById("updateRoomTypeName").value;
                const price = parseFloat(document.getElementById("updateRoomTypeBasePrice").value) || 0.0;
                const capacity = parseInt(document.getElementById("updateRoomTypeCapacity").value) || 1;
                const desc = document.getElementById("updateRoomTypeDescription").value;

                if (!name || price <= 0) {
                    alert("Name and positive price are required.");
                    return;
                }

                const payload = { name, basePrice: price, capacity, description: desc };
                const res = await apiFetch(`/api/room-types/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res && res.ok) {
                    alert("Room Type updated successfully!");
                    document.getElementById("updateRoomTypeModal").classList.remove("active");
                    loadRoomTypes();
                    loadRooms(hotelId);
                } else {
                    alert("Failed to update Room Type.");
                }
            });
        }
    }

    async function loadRooms(hotelId) {
        const response = await apiFetch(`/api/rooms/hotel/${hotelId}`);
        if (response) {
            const rooms = await response.json();
            roomTable.innerHTML = "";
            rooms.forEach(r => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>Room ${r.roomNumber}</td>
                    <td>${r.hotelName}</td>
                    <td>${r.roomTypeName}</td>
                    <td>Floor ${r.floor}</td>
                    <td><span class="status-badge ${r.status.toLowerCase()}">${r.status}</span></td>
                    <td>
                        <button class="edit-btn open-edit-room" data-id="${r.id}"><i class="material-icons">edit</i></button>
                        <button class="delete-btn delete-room" data-id="${r.id}"><i class="material-icons">delete</i></button>
                    </td>
                `;
                roomTable.appendChild(tr);
            });

            // Bind edit room
            document.querySelectorAll(".open-edit-room").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.getAttribute("data-id");
                    const rRes = await apiFetch(`/api/rooms/${id}`);
                    if (rRes) {
                        const r = await rRes.json();
                        document.getElementById("updateRoomId").value = r.id;
                        document.getElementById("updateRoomNumber").value = r.roomNumber;
                        document.getElementById("updateRoomFloor").value = r.floor;

                        // Setup Room Status Custom Dropdown
                        const statuses = [
                            { value: "AVAILABLE", text: "Available" },
                            { value: "OCCUPIED", text: "Occupied" },
                            { value: "CLEANING", text: "Cleaning" },
                            { value: "MAINTENANCE", text: "Maintenance" }
                        ];
                        setupCustomDropdown("updateRoomStatusSelect", statuses);
                        const statusContainer = document.getElementById("updateRoomStatusSelect");
                        statusContainer.setAttribute("data-selected-value", r.status);
                        document.getElementById("updateRoomStatusText").textContent = r.status;

                        // Setup Room Type dropdown
                        const rtResponse = await apiFetch("/api/room-types");
                        if (rtResponse) {
                            const types = await rtResponse.json();
                            const typeList = types.map(t => ({ value: t.id, text: t.name }));
                            setupCustomDropdown("updateRoomTypeSelect", typeList);

                            const typeContainer = document.getElementById("updateRoomTypeSelect");
                            typeContainer.setAttribute("data-selected-value", r.roomTypeId);
                            document.getElementById("updateRoomTypeText").textContent = r.roomTypeName;
                        }

                        document.getElementById("updateRoomModal").classList.add("active");
                    }
                });
            });

            // Bind delete room
            document.querySelectorAll(".delete-room").forEach(btn => {
                btn.addEventListener("click", async () => {
                    if (confirm("Are you sure you want to delete this room?")) {
                        const id = btn.getAttribute("data-id");
                        const dRes = await apiFetch(`/api/rooms/${id}`, { method: "DELETE" });
                        if (dRes && dRes.ok) {
                            alert("Room deleted successfully!");
                            loadRooms(hotelId);
                        } else {
                            alert("Cannot delete room. It might be occupied or booked.");
                        }
                    }
                });
            });
        }
    }

    async function loadRoomTypes() {
        const response = await apiFetch("/api/room-types");
        if (response) {
            const types = await response.json();

            // Populate room type table
            const rtTable = document.getElementById("roomTypeTableBody");
            if (rtTable) {
                rtTable.innerHTML = "";
                types.forEach(t => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${t.name}</td>
                        <td>$${t.basePrice} / night</td>
                        <td>${t.capacity} guests</td>
                        <td>
                            <button class="edit-btn open-edit-roomtype" data-id="${t.id}"><i class="material-icons">edit</i></button>
                            <button class="delete-btn delete-roomtype" data-id="${t.id}"><i class="material-icons">delete</i></button>
                        </td>
                    `;
                    rtTable.appendChild(tr);
                });

                // Bind Edit Room Type
                document.querySelectorAll(".open-edit-roomtype").forEach(btn => {
                    btn.addEventListener("click", async () => {
                        const id = btn.getAttribute("data-id");
                        const tRes = await apiFetch(`/api/room-types/${id}`);
                        if (tRes) {
                            const t = await tRes.json();
                            document.getElementById("updateRoomTypeId").value = t.id;
                            document.getElementById("updateRoomTypeName").value = t.name;
                            document.getElementById("updateRoomTypeBasePrice").value = t.basePrice;
                            document.getElementById("updateRoomTypeCapacity").value = t.capacity;
                            document.getElementById("updateRoomTypeDescription").value = t.description || "";

                            document.getElementById("updateRoomTypeModal").classList.add("active");
                        }
                    });
                });

                // Bind Delete Room Type
                document.querySelectorAll(".delete-roomtype").forEach(btn => {
                    btn.addEventListener("click", async () => {
                        if (confirm("Are you sure you want to delete this Room Type?")) {
                            const id = btn.getAttribute("data-id");
                            const dRes = await apiFetch(`/api/room-types/${id}`, { method: "DELETE" });
                            if (dRes && dRes.ok) {
                                alert("Room Type deleted successfully!");
                                loadRoomTypes();
                            } else {
                                alert("Cannot delete Room Type. Rooms of this type might exist.");
                            }
                        }
                    });
                });
            }

            // Populate Add Room Type options
            const typeOpts = types.map(t => ({ value: t.id, text: t.name }));
            setupCustomDropdown("addRoomTypeSelect", typeOpts);
        }
    }

    // ----------------------------------------------------
    // 7. RESERVATION MANAGEMENT PAGE (reservation.html)
    // ----------------------------------------------------
    const reservationTable = document.getElementById("reservationTableBody");
    let editingReservationId = null;
    if (reservationTable) {
        loadReservations();

        // Confirm update reservation
        const confirmUpdateReservation = document.getElementById("confirmUpdateReservation");
        if (confirmUpdateReservation) {
            confirmUpdateReservation.addEventListener("click", async () => {
                if (!editingReservationId) return;
                const checkIn = document.getElementById("updateCheckin").value;
                const checkOut = document.getElementById("updateCheckout").value;
                const statusContainer = document.getElementById("updateStatusSelect");
                const status = statusContainer ? statusContainer.getAttribute("data-selected-value") : null;

                if (!checkIn || !checkOut || !status) {
                    alert("Please fill in all required fields.");
                    return;
                }

                const payload = { checkIn, checkOut, status };
                const res = await apiFetch(`/api/reservations/${editingReservationId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res && res.ok) {
                    alert("Reservation updated successfully!");
                    document.getElementById("updateReservationModal").classList.remove("active");
                    editingReservationId = null;
                    loadReservations();
                } else {
                    alert("Failed to update reservation.");
                }
            });
        }


        // Create reservation button inside Add Modal
        const confirmAddReservation = document.getElementById("confirmAddReservation");
        if (confirmAddReservation) {
            confirmAddReservation.addEventListener("click", async () => {
                const guestContainer = document.getElementById("addGuestSelect");
                const guestId = guestContainer ? guestContainer.getAttribute("data-selected-value") : null;
                const hotelContainer = document.getElementById("addHotelSelect");
                const hotelId = hotelContainer ? hotelContainer.getAttribute("data-selected-value") : null;
                const roomContainer = document.getElementById("addRoomSelect");
                const roomId = roomContainer ? roomContainer.getAttribute("data-selected-value") : null;
                const checkIn = document.getElementById("addCheckin").value;
                const checkOut = document.getElementById("addCheckout").value;
                const statusContainer = document.getElementById("addStatusSelect");
                const status = statusContainer ? statusContainer.getAttribute("data-selected-value") : "BOOKED";

                if (!guestId || !hotelId || !roomId || !checkIn || !checkOut) {
                    alert("Please fill all required booking options.");
                    return;
                }

                const payload = {
                    guestId: parseInt(guestId),
                    hotelId: parseInt(hotelId),
                    checkIn: checkIn,
                    checkOut: checkOut,
                    status: status,
                    rooms: [
                        { roomId: parseInt(roomId) }
                    ]
                };

                const res = await apiFetch("/api/reservations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res && res.ok) {
                    alert("Reservation created successfully!");
                    document.getElementById("addReservationModal").classList.remove("active");
                    loadReservations();
                } else {
                    alert("Failed to create reservation.");
                }
            });
        }
    }

    async function loadReservations() {
        const response = await apiFetch("/api/reservations");
        if (response) {
            const reservations = await response.json();
            reservationTable.innerHTML = "";
            reservations.forEach(r => {
                const tr = document.createElement("tr");
                const roomNumbers = r.rooms.map(rm => rm.roomNumber).join(", ");
                tr.innerHTML = `
                    <td>${r.guestName}</td>
                    <td>Room ${roomNumbers || "N/A"}</td>
                    <td>${r.hotelName}</td>
                    <td>${r.inChargeEmployeeName || "N/A"}</td>
                    <td>${r.checkIn}</td>
                    <td>${r.checkOut}</td>
                    <td>$${r.totalAmount.toLocaleString()}</td>
                    <td><span class="status-badge ${r.status.toLowerCase()}">${r.status}</span></td>
                    <td>
                        <button class="edit-btn add-payment-btn" data-id="${r.id}"><i class="material-icons">payment</i> Pay</button>
                        <button class="edit-btn open-edit-res" data-id="${r.id}"><i class="material-icons">edit</i></button>
                        <button class="delete-btn delete-res" data-id="${r.id}"><i class="material-icons">delete</i></button>
                    </td>
                `;
                reservationTable.appendChild(tr);
            });

            // Bind add payment click
            document.querySelectorAll(".add-payment-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-id");
                    window.location.href = `/payment?reservationId=${id}`;
                });
            });

            // Bind delete reservation
            document.querySelectorAll(".delete-res").forEach(btn => {
                btn.addEventListener("click", async () => {
                    if (confirm("Are you sure you want to delete this reservation?")) {
                        const id = btn.getAttribute("data-id");
                        const dRes = await apiFetch(`/api/reservations/${id}`, { method: "DELETE" });
                        if (dRes && dRes.ok) {
                            alert("Reservation deleted!");
                            loadReservations();
                        } else {
                            alert("Failed to delete reservation.");
                        }
                    }
                });
            });

            // Bind edit reservation
            document.querySelectorAll(".open-edit-res").forEach(btn => {
                btn.addEventListener("click", async () => {
                    editingReservationId = btn.getAttribute("data-id");
                    await loadReservationDropdowns("#updateReservationModal");
                    const res = await apiFetch(`/api/reservations/${editingReservationId}`);
                    if (res && res.ok) {
                        const r = await res.json();
                        const updateCheckin = document.getElementById("updateCheckin");
                        const updateCheckout = document.getElementById("updateCheckout");
                        if (updateCheckin) updateCheckin.value = r.checkIn;
                        if (updateCheckout) updateCheckout.value = r.checkOut;
                    }
                    const modal = document.getElementById("updateReservationModal");
                    if (modal) modal.classList.add("active");
                });
            });
        }
    }

    async function loadReservationDropdowns(modalId) {
        // Fetch hotels
        const hotelsRes = await apiFetch("/api/hotels");
        if (hotelsRes) {
            const hotels = await hotelsRes.json();
            const hotelList = hotels.map(h => ({ value: h.id, text: h.name }));
            
            const hotelSelectId = modalId === "#addReservationModal" ? "addHotelSelect" : "updateHotelSelect";
            const roomSelectId = modalId === "#addReservationModal" ? "addRoomSelect" : "updateRoomSelect";

            setupCustomDropdown(hotelSelectId, hotelList, async (hotelId) => {
                // Fetch rooms for this hotel
                const roomsRes = await apiFetch(`/api/rooms/hotel/${hotelId}`);
                if (roomsRes) {
                    const rooms = await roomsRes.json();
                    const availableRooms = rooms.filter(r => r.status === "AVAILABLE");
                    const roomList = availableRooms.map(r => ({ value: r.id, text: `Room ${r.roomNumber} (${r.roomTypeName})` }));
                    setupCustomDropdown(roomSelectId, roomList);
                }
            });
        }

        // Fetch guests
        const guestsRes = await apiFetch("/api/guests");
        if (guestsRes) {
            const guests = await guestsRes.json();
            const guestList = guests.map(g => ({ value: g.id, text: `${g.firstName} ${g.lastName}` }));
            const guestSelectId = modalId === "#addReservationModal" ? "addGuestSelect" : "updateGuestSelect";
            setupCustomDropdown(guestSelectId, guestList);
        }

        // Bind standard status options for reservation
        const statusSelectId = modalId === "#addReservationModal" ? "addStatusSelect" : "updateStatusSelect";
        const statuses = [
            { value: "BOOKED", text: "Booked" },
            { value: "CHECKED_IN", text: "Checked In" },
            { value: "COMPLETED", text: "Checked Out" },
            { value: "CANCELLED", text: "Cancelled" },
            { value: "NO_SHOW", text: "No Show" }
        ];
        setupCustomDropdown(statusSelectId, statuses);
    }

    // ----------------------------------------------------
    // 8. PAYMENT MANAGEMENT PAGE (payment.html)
    // ----------------------------------------------------
    const paymentTable = document.getElementById("paymentTableBody");
    if (paymentTable) {
        const resIdMeta = document.querySelector('meta[name="reservation-id"]');
        const reservationId = resIdMeta ? resIdMeta.getAttribute("content") : null;

        loadPayments(reservationId);

        // Populate Add Payment Modal triggering
        const openPayBtn = document.querySelector('.booking__status table + button'); // if button is there
        // Or if the page has openModal buttons, they trigger `#addPaymentModal`

        // Add payment confirmation
        const confirmAddPayment = document.getElementById("confirmAddPayment");
        if (confirmAddPayment) {
            confirmAddPayment.addEventListener("click", async () => {
                const methodContainer = document.getElementById("addMethodSelect");
                const method = methodContainer ? methodContainer.getAttribute("data-selected-value") : "CASH";
                const amount = parseFloat(document.getElementById("newAmount").value) || 0.0;
                const paidDate = document.getElementById("newPayDate").value;

                if (!reservationId || amount <= 0) {
                    alert("Must be linked to a valid reservation and have positive amount.");
                    return;
                }

                const payload = {
                    reservationId: parseInt(reservationId),
                    amount: amount,
                    paymentDate: paidDate ? paidDate : null,
                    method: method,
                    status: "PAID"
                };

                const res = await apiFetch("/api/payments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res && res.ok) {
                    alert("Payment recorded!");
                    document.getElementById("addPaymentModal").classList.remove("active");
                    loadPayments(reservationId);
                } else {
                    alert("Failed to create payment.");
                }
            });
        }
    }

    async function loadPayments(reservationId) {
        let url = "/api/payments";
        if (reservationId) {
            url = `/api/payments/reservation/${reservationId}`;
        }
        const response = await apiFetch(url);
        if (response) {
            const payments = await response.json();
            paymentTable.innerHTML = "";
            payments.forEach(p => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${p.guestName}</td>
                    <td>Reservation #${p.reservationId}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>$${p.amount.toLocaleString()}</td>
                    <td>${p.paymentDate ? p.paymentDate.replace("T", " ") : "N/A"}</td>
                    <td>${p.method}</td>
                    <td>
                        <button class="delete-btn delete-payment" data-id="${p.id}"><i class="material-icons">delete</i></button>
                    </td>
                    <td></td>
                `;
                paymentTable.appendChild(tr);
            });

            // Bind delete payment
            document.querySelectorAll(".delete-payment").forEach(btn => {
                btn.addEventListener("click", async () => {
                    if (confirm("Are you sure you want to delete this payment?")) {
                        const id = btn.getAttribute("data-id");
                        const dRes = await apiFetch(`/api/payments/${id}`, { method: "DELETE" });
                        if (dRes && dRes.ok) {
                            alert("Payment deleted!");
                            loadPayments(reservationId);
                        } else {
                            alert("Failed to delete payment.");
                        }
                    }
                });
            });

            // Also, dynamically append an "Add Payment" floating action button if reservationId is specified
            if (reservationId && !document.getElementById("triggerAddPaymentBtn")) {
                const containerSection = document.querySelector(".middle__section");
                const btn = document.createElement("button");
                btn.className = "add-client__button openModal";
                btn.id = "triggerAddPaymentBtn";
                btn.style.marginTop = "20px";
                btn.setAttribute("data-target", "#addPaymentModal");
                btn.innerHTML = `New Payment <i class="material-icons">add_2</i>`;
                containerSection.appendChild(btn);

                // Setup Method Custom Dropdown options
                const methods = [
                    { value: "CASH", text: "Cash" },
                    { value: "BANKING", text: "Banking" },
                    { value: "PAYPAL", text: "Paypal" },
                    { value: "CREDIT_CARD", text: "Credit Card" },
                    { value: "DEBIT_CARD", text: "Debit Card" }
                ];
                setupCustomDropdown("addMethodSelect", methods);
            }
        }
    }

    // ----------------------------------------------------
    // 9. SETTING & EMPLOYEE MANAGEMENT PAGE (setting.html)
    // ----------------------------------------------------
    const employeeTable = document.getElementById("employeeTableBody");
    if (employeeTable) {
        loadEmployees();

        // Create new employee accounts and profiles
        const confirmBtn = document.querySelector("#thisModal .auth__button.register");
        if (confirmBtn) {
            // Load hotels for dropdown
            loadSettingsDropdowns();

            confirmBtn.addEventListener("click", async () => {
                const fname = document.querySelector('#thisModal input[name="fname"]').value;
                const lname = document.querySelector('#thisModal input[name="lname"]').value;
                const usernameInput = document.querySelector('#thisModal input[name="username"]').value;
                const email = document.querySelector('#thisModal input[name="email"]').value;
                const passwordInput = document.querySelector('#thisModal input[name="password"]').value;
                const hotelContainer = document.getElementById("hotel-dropdown");
                const hotelId = hotelContainer ? hotelContainer.getAttribute("data-selected-value") : null;

                if (!usernameInput || !email || !passwordInput || !hotelId) {
                    alert("Please fill in username, email, password, and select a hotel.");
                    return;
                }

                // 1. Create Account
                const accPayload = {
                    username: usernameInput,
                    password: passwordInput,
                    email: email,
                    role: "EMPLOYEE",
                    active: true
                };

                const accRes = await apiFetch("/api/accounts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(accPayload)
                });

                if (accRes && accRes.ok) {
                    const acc = await accRes.json();
                    
                    // 2. Create Employee Profile
                    const empPayload = {
                        firstName: fname,
                        lastName: lname,
                        position: "Staff",
                        salary: 5000000,
                        hotelId: parseInt(hotelId),
                        accountId: acc.id
                    };

                    const empRes = await apiFetch("/api/employees", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(empPayload)
                    });

                    if (empRes && empRes.ok) {
                        alert("Employee account and profile created successfully!");
                        document.getElementById("thisModal").classList.remove("active");
                        document.querySelectorAll("#thisModal input").forEach(i => i.value = "");
                        loadEmployees();
                    } else {
                        alert("Account created, but failed to create employee profile.");
                    }
                } else {
                    alert("Failed to create account. Username or email might be taken.");
                }
            });
        }

        // Update employee details
        const confirmUpdateBtn = document.getElementById("updateEmployeeBtn");
        if (confirmUpdateBtn) {
            confirmUpdateBtn.addEventListener("click", async () => {
                const empId = document.getElementById("editEmployeeId").value;
                const accId = document.getElementById("editAccountId").value;
                const fname = document.getElementById("editFname").value;
                const lname = document.getElementById("editLname").value;
                const position = document.getElementById("editPosition").value;
                const phone = document.getElementById("editPhone").value;
                const hireDate = document.getElementById("editHireDate").value;
                const salary = parseFloat(document.getElementById("editSalary").value) || 0.0;
                const usernameInput = document.getElementById("editUsername").value;
                const email = document.getElementById("editEmail").value;
                const dob = document.getElementById("editDob").value;
                const idNumber = document.getElementById("editIdNumber").value;
                const passwordInput = document.getElementById("editPassword").value;

                const hotelContainer = document.getElementById("edit-hotel-dropdown");
                const hotelId = hotelContainer ? hotelContainer.getAttribute("data-selected-value") : null;

                // 1. Update Account
                const accPayload = {
                    username: usernameInput,
                    email: email,
                    role: "EMPLOYEE",
                    active: true
                };
                if (passwordInput) accPayload.password = passwordInput;

                const accRes = await apiFetch(`/api/accounts/${accId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(accPayload)
                });

                if (accRes && accRes.ok) {
                    // 2. Update Employee
                    const empPayload = {
                        firstName: fname,
                        lastName: lname,
                        position: position,
                        phone: phone,
                        salary: salary,
                        hireDate: hireDate ? hireDate : null,
                        dob: dob ? dob : null,
                        idNumber: idNumber,
                        hotelId: parseInt(hotelId),
                        accountId: parseInt(accId)
                    };

                    const empRes = await apiFetch(`/api/employees/${empId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(empPayload)
                    });

                    if (empRes && empRes.ok) {
                        alert("Employee updated successfully!");
                        document.getElementById("editEmployeeModal").classList.remove("active");
                        loadEmployees();
                    } else {
                        alert("Account updated, but failed to update employee details.");
                    }
                } else {
                    alert("Failed to update account credentials.");
                }
            });
        }
    }

    async function loadEmployees() {
        const response = await apiFetch("/api/employees");
        if (response) {
            const employees = await response.json();
            employeeTable.innerHTML = "";
            employees.forEach(e => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${e.firstName} ${e.lastName}</td>
                    <td>${e.hotelName}</td>
                    <td>${e.position}</td>
                    <td>${e.username || "N/A"}</td>
                    <td>Employee</td>
                    <td>$${e.salary.toLocaleString()}</td>
                    <td>
                        <button class="edit-btn open-edit-emp" data-id="${e.id}"><i class="material-icons">edit</i></button>
                        <button class="delete-btn delete-emp" data-id="${e.id}"><i class="material-icons">delete</i></button>
                    </td>
                `;
                employeeTable.appendChild(tr);
            });

            // Bind edit employee modal triggers
            document.querySelectorAll(".open-edit-emp").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.getAttribute("data-id");
                    const eRes = await apiFetch(`/api/employees/${id}`);
                    if (eRes) {
                        const emp = await eRes.json();
                        
                        document.getElementById("editEmployeeId").value = emp.id;
                        document.getElementById("editAccountId").value = emp.accountId;
                        document.getElementById("editFname").value = emp.firstName;
                        document.getElementById("editLname").value = emp.lastName;
                        document.getElementById("editPosition").value = emp.position;
                        document.getElementById("editPhone").value = emp.phone || "";
                        document.getElementById("editHireDate").value = emp.hireDate || "";
                        document.getElementById("editSalary").value = emp.salary;
                        document.getElementById("editUsername").value = emp.username || "";
                        document.getElementById("editDob").value = emp.dob || "";
                        document.getElementById("editIdNumber").value = emp.idNumber || "";
                        document.getElementById("editPassword").value = "";

                        // Setup Hotels select for Edit
                        const hotelsRes = await apiFetch("/api/hotels");
                        if (hotelsRes) {
                            const hotels = await hotelsRes.json();
                            const hotelOpts = hotels.map(h => ({ value: h.id, text: h.name }));
                            setupCustomDropdown("edit-hotel-dropdown", hotelOpts);

                            const hotelContainer = document.getElementById("edit-hotel-dropdown");
                            hotelContainer.setAttribute("data-selected-value", emp.hotelId);
                            document.getElementById("editHotelText").textContent = emp.hotelName;
                        }

                        document.getElementById("editEmployeeModal").classList.add("active");
                    }
                });
            });

            // Bind delete employee
            document.querySelectorAll(".delete-emp").forEach(btn => {
                btn.addEventListener("click", async () => {
                    if (confirm("Are you sure you want to delete this employee?")) {
                        const id = btn.getAttribute("data-id");
                        const dRes = await apiFetch(`/api/employees/${id}`, { method: "DELETE" });
                        if (dRes && dRes.ok) {
                            alert("Employee deleted!");
                            loadEmployees();
                        } else {
                            alert("Failed to delete employee.");
                        }
                    }
                });
            });
        }
    }

    async function loadSettingsDropdowns() {
        const response = await apiFetch("/api/hotels");
        if (response) {
            const hotels = await response.json();
            const hotelOpts = hotels.map(h => ({ value: h.id, text: h.name }));
            setupCustomDropdown("hotel-dropdown", hotelOpts);
        }
    }

    // ----------------------------------------------------
    // 10. GUEST BOOKING PAGE (guest.html)
    // ----------------------------------------------------
    const popularGrid = document.querySelector(".popular__grid");
    if (popularGrid) {
        setupGuestLandingPage();
    }

    async function setupGuestLandingPage() {
        // Clear hardcoded cards and load hotels dynamically!
        const res = await fetch("/api/hotels");
        if (res) {
            const hotels = await res.json();
            popularGrid.innerHTML = "";

            // Seed some local pictures or general images for presentation
            const images = [
                "/assets/img/hotel-1.jpg",
                "/assets/img/hotel-2.jpg",
                "/assets/img/hotel-3.jpg",
                "/assets/img/hotel-4.jpg",
                "/assets/img/hotel-5.jpg",
                "/assets/img/hotel-6.jpg"
            ];

            hotels.forEach((h, index) => {
                const imgUrl = images[index % images.length];
                const card = document.createElement("div");
                card.className = "popular__card openModal";
                card.setAttribute("data-target", "#thisModal");
                card.setAttribute("data-hotel-id", h.id);
                card.setAttribute("data-hotel-name", h.name);
                card.innerHTML = `
                    <img src="${imgUrl}" alt="${h.name}" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'" />
                    <div class="popular__content">
                        <div class="popular__card__header">
                            <h4>${h.name}</h4>
                            <h4>${h.rating} ⭐</h4>
                        </div>
                        <p>${h.address}</p>
                    </div>
                `;
                popularGrid.appendChild(card);
            });

            // Bind click to populate modal name and record selected hotelId
            popularGrid.addEventListener("click", async (e) => {
                const card = e.target.closest(".popular__card");
                if (card) {
                    const hotelId = card.getAttribute("data-hotel-id");
                    const hotelName = card.getAttribute("data-hotel-name");
                    document.getElementById("modalName").textContent = hotelName;
                    document.getElementById("modalName").setAttribute("data-hotel-id", hotelId);

                    // Pre-fill fields if user is logged in
                    const customerNameInput = document.querySelector('#thisModal input[placeholder="Enter name"]');
                    if (customerNameInput) {
                        customerNameInput.value = localStorage.getItem("username") || "";
                    }

                    // Load available Room Types for dropdown
                    const rtRes = await fetch("/api/room-types");
                    if (rtRes) {
                        const types = await rtRes.json();
                        const optionsList = types.map(t => ({ value: t.id, text: `${t.name} ($${t.basePrice}/night)` }));
                        setupGuestDropdown("thisModal", optionsList);
                    }
                }
            });

            // Handle Confirm Booking click
            const confirmBookingBtn = document.querySelector('#thisModal button.auth__button.add-client');
            if (confirmBookingBtn) {
                confirmBookingBtn.addEventListener("click", async () => {
                    const guestId = localStorage.getItem("guestId");
                    if (!guestId) {
                        alert("Please login first to reserve a room.");
                        window.location.href = "/login";
                        return;
                    }

                    const checkInInput = document.querySelectorAll('#thisModal input[type="date"]')[0].value;
                    const checkOutInput = document.querySelectorAll('#thisModal input[type="date"]')[1].value;
                    const hotelId = document.getElementById("modalName").getAttribute("data-hotel-id");
                    const roomTypeSelect = document.querySelector('#thisModal .input-container.select-menu');
                    const roomTypeId = roomTypeSelect ? roomTypeSelect.getAttribute("data-selected-value") : null;

                    if (!checkInInput || !checkOutInput || !roomTypeId) {
                        alert("Please enter check-in/out dates and select a room type.");
                        return;
                    }

                    // Find an available room of this type in this hotel
                    const roomRes = await apiFetch(`/api/rooms/hotel/${hotelId}`);
                    if (!roomRes) {
                        alert("Error connecting to server. Please try again.");
                        return;
                    }

                    const rooms = await roomRes.json();
                    const availableRoom = rooms.find(r => r.roomTypeId === parseInt(roomTypeId) && r.status === "AVAILABLE");

                    if (!availableRoom) {
                        alert("No available rooms of this type for this hotel right now.");
                        return;
                    }

                    const payload = {
                        guestId: parseInt(guestId),
                        hotelId: parseInt(hotelId),
                        checkIn: checkInInput,
                        checkOut: checkOutInput,
                        status: "BOOKED",
                        rooms: [
                            { roomId: availableRoom.id }
                        ]
                    };

                    const bookingRes = await apiFetch("/api/reservations", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });

                    if (bookingRes && bookingRes.ok) {
                        alert("Booking reservation created successfully!");
                        document.getElementById("thisModal").classList.remove("active");
                    } else {
                        alert("Failed to book room.");
                    }
                });
            }
        }
    }

    function setupGuestDropdown(modalId, optionsList) {
        const container = document.querySelector(`#${modalId} .input-container.select-menu`);
        if (!container) return;

        const selectBtn = container.querySelector(".input-layout.guest.select-menu");
        const listContainer = container.querySelector(".options");
        const textSpan = container.querySelector(".text");

        // Clear existing options
        listContainer.innerHTML = "";

        // Populate options
        optionsList.forEach(opt => {
            const li = document.createElement("li");
            li.className = "option";
            li.setAttribute("data-value", opt.value);
            li.innerHTML = `<span class="option-text">${opt.text}</span>`;
            listContainer.appendChild(li);
        });

        const toggleDropdown = (e) => {
            e.stopPropagation();
            container.classList.toggle("active");
        };

        selectBtn.removeEventListener("click", toggleDropdown);
        selectBtn.addEventListener("click", toggleDropdown);

        // Click option
        listContainer.addEventListener("click", (e) => {
            const optionLi = e.target.closest(".option");
            if (optionLi) {
                const val = optionLi.getAttribute("data-value");
                const text = optionLi.querySelector(".option-text").textContent;
                textSpan.textContent = text;
                container.setAttribute("data-selected-value", val);
                container.classList.remove("active");
            }
        });
    }
});
