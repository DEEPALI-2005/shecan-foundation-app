require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const connectDB = require("./db");
const Admin = require("./models/Admin");

const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
app.get("/", (req, res) => {
  res.send("SheCan backend is running");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

async function seedAdminIfNeeded() {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) return;

  const existing = await Admin.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.create({ email, passwordHash });
  console.log("Admin seeded:", email);
}

(async () => {
  await connectDB(process.env.MONGO_URI);
  await seedAdminIfNeeded();

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log("Server running on port", port));
})();