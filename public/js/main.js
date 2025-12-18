// Use relative path for production (Netlify), absolute for local if needed
// On Netlify, this will hit the redirect rule in netlify.toml
const API_URL = '/api';

// State
const state = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null
};

// DOM Elements
const authLinks = document.getElementById('authLinks');
const userLinks = document.getElementById('userLinks');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const eventsGrid = document.getElementById('eventsGrid');
const searchBtn = document.getElementById('searchBtn');
const logoutBtn = document.getElementById('logoutBtn');
const createEventForm = document.getElementById('createEventForm');
const registrationsList = document.getElementById('registrationsList');
const myEventsList = document.getElementById('myEventsList');
const eventDetailsContainer = document.getElementById('eventDetailsContainer');

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateNav();

    if (loginForm) initLogin();
    if (registerForm) initRegister();
    if (eventsGrid) loadEvents();
    if (searchBtn) initSearch();
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (createEventForm) initCreateEvent();
    if (registrationsList) loadDashboard();
    if (eventDetailsContainer) loadEventDetails();
});

// Update Navigation based on Auth
function updateNav() {
    if (!authLinks || !userLinks) return;

    if (state.user) {
        authLinks.classList.add('hidden');
        userLinks.classList.remove('hidden');
        userLinks.style.display = 'flex'; // Ensure flex override
    } else {
        authLinks.classList.remove('hidden');
        userLinks.classList.add('hidden');
        authLinks.style.display = 'flex';
    }
}

// Login Logic
function initLogin() {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        const errorDiv = document.getElementById('loginError');

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'index.html';
            } else {
                errorDiv.innerText = data.message;
                errorDiv.style.display = 'block';
            }
        } catch (err) {
            console.error(err);
            errorDiv.innerText = 'Server Error';
            errorDiv.style.display = 'block';
        }
    });
}

// Register Logic
function initRegister() {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = registerForm.username.value;
        const email = registerForm.email.value;
        const password = registerForm.password.value;
        const errorDiv = document.getElementById('registerError');

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();

            if (res.ok) {
                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
            } else {
                errorDiv.innerText = data.message;
                errorDiv.style.display = 'block';
            }
        } catch (err) {
            console.error(err);
            errorDiv.innerText = 'Server Error';
            errorDiv.style.display = 'block';
        }
    });
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Load Events (Home Page)
async function loadEvents(filters = {}) {
    if (!eventsGrid) return;

    eventsGrid.innerHTML = '<div class="text-center" style="grid-column: 1/-1;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

    let query = new URLSearchParams(filters).toString();

    try {
        const res = await fetch(`${API_URL}/events?${query}`);
        const events = await res.json();

        if (events.length === 0) {
            eventsGrid.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No events found.</p>';
            return;
        }

        eventsGrid.innerHTML = events.map(event => `
            <div class="card">
                <div style="height: 150px; background: #ddd; margin: -1.5rem -1.5rem 1rem -1.5rem; background-image: url('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'); background-size: cover;"></div>
                <h3>${event.title}</h3>
                <p class="mb-1" style="color: var(--gray); font-size: 0.9rem;">
                    <i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()} &bull; 
                    <i class="fas fa-map-marker-alt"></i> ${event.location}
                </p>
                <p class="mb-1" style="font-weight: bold; color: var(--primary);">$${event.price}</p>
                <a href="event-details.html?id=${event.id}" class="btn btn-outline" style="width: 100%; text-align: center;">View Details</a>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        eventsGrid.innerHTML = '<p class="text-center" style="color: var(--danger);">Failed to load events.</p>';
    }
}

// Search Logic
function initSearch() {
    searchBtn.addEventListener('click', () => {
        const search = document.getElementById('searchInput').value;
        const location = document.getElementById('locationInput').value;
        loadEvents({ search, location });
    });
}

// Create Event Logic
function initCreateEvent() {
    // Redirect if not logged in
    if (!state.user) {
        window.location.href = 'login.html';
        return;
    }

    createEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(createEventForm);
        const data = Object.fromEntries(formData.entries());
        const errorDiv = document.getElementById('createError');

        try {
            const res = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.token}`
                },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (res.ok) {
                alert('Event created successfully!');
                window.location.href = 'dashboard.html';
            } else {
                errorDiv.innerText = result.message;
                errorDiv.style.display = 'block';
            }
        } catch (err) {
            console.error(err);
            errorDiv.innerText = 'Server Error';
            errorDiv.style.display = 'block';
        }
    });
}

// Dashboard Logic
async function loadDashboard() {
    if (!state.user) {
        window.location.href = 'login.html';
        return;
    }

    // Load My Registrations
    try {
        const res = await fetch(`${API_URL}/registrations/my-registrations`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const registrations = await res.json();

        if (registrations.length === 0) {
            registrationsList.innerHTML = '<p>You haven\'t registered for any events yet.</p>';
        } else {
            registrationsList.innerHTML = registrations.map(reg => `
                <div class="card">
                    <h3>${reg.title}</h3>
                    <p class="mb-1">${new Date(reg.date).toLocaleDateString()} at ${reg.location}</p>
                    <span style="background: var(--success); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">CONFIRMED</span>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error(err);
        registrationsList.innerHTML = '<p style="color:red">Failed to load registrations.</p>';
    }

    // Load My Created Events 
    try {
        const res = await fetch(`${API_URL}/events`); // Fetches all
        const allEvents = await res.json();
        const myEvents = allEvents.filter(e => e.organizer_id === state.user.id);

        if (myEvents.length === 0) {
            myEventsList.innerHTML = '<p>You haven\'t created any events.</p>';
        } else {
            myEventsList.innerHTML = myEvents.map(event => `
                <div class="card">
                    <h3>${event.title}</h3>
                    <p>${new Date(event.date).toLocaleDateString()}</p>
                    <div class="flex mt-1" style="gap: 0.5rem;">
                        <a href="event-details.html?id=${event.id}" class="btn btn-outline" style="font-size: 0.8rem;">View</a>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error(err);
    }
}

// Event Details Logic
async function loadEventDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        eventDetailsContainer.innerHTML = '<p class="text-center">Event not found.</p>';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/events/${id}`);
        if (!res.ok) throw new Error('Not found');
        const event = await res.json();

        // Check if I'm organizer
        const isOrganizer = state.user && state.user.id === event.organizer_id;

        eventDetailsContainer.innerHTML = `
            <div class="card" style="padding: 0; overflow: hidden;">
                <div style="height: 300px; background: #ddd; background-image: url('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'); background-size: cover;"></div>
                <div style="padding: 2rem;">
                    <div class="flex" style="justify-content: space-between; align-items: start;">
                        <div>
                            <h1 class="mb-1">${event.title}</h1>
                            <p class="mb-1" style="font-size: 1.1rem; color: var(--gray);">
                                <i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleString()} <br>
                                <i class="fas fa-map-marker-alt"></i> ${event.location} <br>
                                <i class="fas fa-user"></i> Organized by ${event.organizer}
                            </p>
                        </div>
                        <div class="text-center" style="background: var(--light-gray); padding: 1rem; border-radius: 0.5rem;">
                            <span style="display: block; font-size: 1.5rem; font-weight: bold; color: var(--primary);">$${event.price}</span>
                            <span style="font-size: 0.9rem; color: var(--gray);">Per Ticket</span>
                        </div>
                    </div>

                    <div class="mt-2">
                        <h3>About this Event</h3>
                        <p style="white-space: pre-wrap; margin-top: 1rem;">${event.description}</p>
                    </div>

                    <div class="mt-2 flex" style="gap: 1rem;">
                        ${state.user ? `
                            <button onclick="registerForEvent(${event.id})" class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2rem;">Register Now</button>
                        ` : `
                            <a href="login.html" class="btn btn-primary">Login to Register</a>
                        `}
                        ${isOrganizer ? `<button onclick="deleteEvent(${event.id})" class="btn btn-outline" style="border-color: var(--danger); color: var(--danger);">Delete Event</button>` : ''}
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        console.error(err);
        eventDetailsContainer.innerHTML = '<p class="text-center">Event not found.</p>';
    }
}

async function registerForEvent(eventId) {
    if (!confirm('Confirm registration for this event?')) return;

    try {
        const res = await fetch(`${API_URL}/registrations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ eventId })
        });
        const data = await res.json();

        if (res.ok) {
            alert('Registration Successful! Ticket confirmed.');
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Server Error');
    }
}

async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) return;

    try {
        const res = await fetch(`${API_URL}/events/${eventId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });

        if (res.ok) {
            alert('Event deleted.');
            window.location.href = 'dashboard.html';
        } else {
            alert('Failed to delete event');
        }
    } catch (err) {
        console.error(err);
    }
}
