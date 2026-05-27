const API_BASE = "https://shecan-foundation-app-jgbx.onrender.com/api";

const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const messageList = document.getElementById("messageList");

const loadBtn = document.getElementById("loadBtn");
const logoutBtn = document.getElementById("logoutBtn");

function setLoginStatus(msg, ok = true) {
  loginStatus.textContent = msg;
  loginStatus.className = "status " + (ok ? "ok" : "bad");
}

function getToken() {
  return localStorage.getItem("admin_token");
}

function setToken(t) {
  localStorage.setItem("admin_token", t);
}

function clearToken() {
  localStorage.removeItem("admin_token");
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;

  try {
    setLoginStatus("Logging in...", true);
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) return setLoginStatus(data.error || "Login failed", false);

    setToken(data.token);
    setLoginStatus("Login successful!", true);
  } catch {
    setLoginStatus("Server not reachable.", false);
  }
});

loadBtn.addEventListener("click", loadMessages);
logoutBtn.addEventListener("click", () => {
  clearToken();
  setLoginStatus("Logged out.", true);
  messageList.innerHTML = "";
});

async function loadMessages() {
  const token = getToken();
  if (!token) return setLoginStatus("Please login first.", false);

  const res = await fetch(`${API_BASE}/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  if (!res.ok) return setLoginStatus(data.error || "Failed to load messages", false);

  messageList.innerHTML = "";
  data.forEach((m) => {
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `
      <div>
        <strong>${escapeHtml(m.name)}</strong> — ${escapeHtml(m.email)}
        <div class="date">${new Date(m.createdAt).toLocaleString()}</div>
        <p>${escapeHtml(m.message)}</p>
      </div>
      <button class="danger">Delete</button>
    `;

    li.querySelector("button").addEventListener("click", async () => {
      const delRes = await fetch(`${API_BASE}/messages/${m._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (delRes.ok) li.remove();
    });

    messageList.appendChild(li);
  });

  setLoginStatus(`Loaded ${data.length} messages.`, true);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[ch]));
}