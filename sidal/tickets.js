'use strict';
// Ticket balance and unlocked readings, kept in THIS browser only (localStorage).
// This is a convenience, not protection: anyone can edit their own browser storage. Enforcing paid access needs a server
// that records purchases (see docs/PAYMENTS.md). Nothing here runs unless payments are switched on (see payment.js).

const TICKET_KEY = 'sidal_tickets';
const UNLOCK_KEY = 'sidal_unlocked';
const MAX_TICKETS = 999;
const MAX_UNLOCKED = 300;
const FREE_TRIAL_TICKETS = 1;
const ticketMemory = {};
const MISSING = Symbol('missing');

function readStore(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return MISSING;
    try { return JSON.parse(raw); } catch { return undefined; }
  } catch {
    return key in ticketMemory ? ticketMemory[key] : MISSING;   // storage blocked (private mode): keep it for this visit
  }
}
function writeStore(key, value) {
  ticketMemory[key] = value;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* blocked: the in-memory copy still works for this visit */ }
}
function cleanCount(value) { return Number.isInteger(value) && value > 0 ? Math.min(value, MAX_TICKETS) : 0; }

// First visit (nothing stored yet): one free trial ticket, once. A damaged value counts as "already granted", with no tickets.
function ticketState() {
  const saved = readStore(TICKET_KEY);
  if (saved === MISSING) {
    const fresh = {balance: FREE_TRIAL_TICKETS, granted: true};
    writeStore(TICKET_KEY, fresh);
    return fresh;
  }
  return {balance: saved && typeof saved === 'object' ? cleanCount(saved.balance) : 0, granted: true};
}
function ticketBalance() { return ticketState().balance; }
function addTickets(count) {
  const next = Math.min(MAX_TICKETS, ticketBalance() + cleanCount(count));
  writeStore(TICKET_KEY, {balance: next, granted: true});
  return next;
}
function spendTicket(count = 1) {
  const balance = ticketBalance();
  if (!Number.isInteger(count) || count < 1 || balance < count) return false;
  writeStore(TICKET_KEY, {balance: balance - count, granted: true});
  return true;
}

// Payment numbers already turned into tickets on this device, so the same payment cannot be credited twice here.
const CREDITED_KEY = 'sidal_credited';
function creditedList() { const saved = readStore(CREDITED_KEY); return Array.isArray(saved) ? saved.filter(item => typeof item === 'string').slice(-100) : []; }
function wasCredited(id) { return Boolean(id) && creditedList().includes(String(id)); }
function markCredited(id) { if (id) writeStore(CREDITED_KEY, [...creditedList(), String(id).slice(0, 64)].slice(-100)); }

// A random id for this browser, sent with payment checks so a retry from this device is accepted while another device cannot reuse the payment.
function deviceId() {
  const saved = readStore('sidal_device');
  if (typeof saved === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(saved)) return saved;
  const random = typeof crypto !== 'undefined' && crypto.getRandomValues ? Array.from(crypto.getRandomValues(new Uint32Array(4)), n => n.toString(36)).join('') : Math.random().toString(36).slice(2) + Date.now().toString(36);
  const id = random.slice(0, 48).padEnd(8, '0');
  writeStore('sidal_device', id);
  return id;
}

function readingKey() { return selected && currentCard ? selected.id + ':' + currentCard.id : ''; }
function unlockedList() {
  const saved = readStore(UNLOCK_KEY);
  return Array.isArray(saved) ? saved.filter(item => typeof item === 'string').slice(-MAX_UNLOCKED) : [];
}
// Opens the current reading for one ticket. A ticket is only taken when the reading can really be opened.
function openReadingWithTicket() {
  const key = readingKey();
  if (!validReadingKey(key) || ticketBalance() < 1) return false;
  if (!unlockReading(key)) return false;
  return spendTicket(1);
}
function isReadingUnlocked(key) { return Boolean(key) && unlockedList().includes(key); }
// Card ids include hyphens (for example cups-13), so the check only insists on a situation number and a short card id.
function validReadingKey(key) { return typeof key === 'string' && /^[0-9]+-[0-9]+:[a-z0-9-]{2,16}$/i.test(key); }
function unlockReading(key) {
  if (!validReadingKey(key)) return false;
  const list = unlockedList().filter(item => item !== key);
  list.push(key);
  writeStore(UNLOCK_KEY, list.slice(-MAX_UNLOCKED));
  return true;
}
