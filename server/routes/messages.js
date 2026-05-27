const express = require("express");
const Message = require("../models/Message");
const auth = require("../middleware/auth");

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Public: create message
router.post("/", async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) return res.status(400).json({ error: "All fields are required" });
  if (String(name).trim().length < 2) return res.status(400).json({ error: "Name too short" });
  if (!isValidEmail(String(email))) return res.status(400).json({ error: "Invalid email" });
  if (String(message).trim().length < 5) return res.status(400).json({ error: "Message too short" });

  const saved = await Message.create({ name, email, message });
  res.status(201).json({ ok: true, id: saved._id });
});

// Admin: list messages
router.get("/", auth, async (req, res) => {
  const items = await Message.find().sort({ createdAt: -1 }).limit(200);
  res.json(items);
});

// Admin: delete message
router.delete("/:id", auth, async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;