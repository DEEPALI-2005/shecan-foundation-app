const API_BASE = "http://localhost:5000/api";

const form = document.getElementById("contactForm");
const statusEl = document.getElementById("status");

function setStatus(msg, ok = true) {
  statusEl.textContent = msg;
  statusEl.className = "status " + (ok ? "ok" : "bad");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  // Client validation
  if (name.length < 2) return setStatus("Name must be at least 2 characters.", false);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStatus("Please enter a valid email.", false);
  if (message.length < 5) return setStatus("Message must be at least 5 characters.", false);

  try {
    setStatus("Submitting...", true);

    const res = await fetch(`${API_BASE}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message })
    });

    const data = await res.json();
    if (!res.ok) return setStatus(data.error || "Something went wrong.", false);

    form.reset();
    setStatus("Form Submitted Successfully", true);
  } catch (err) {
    setStatus("Server not reachable. Start backend first.", false);
  }
});