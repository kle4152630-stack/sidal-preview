'use strict';
// Plain functions the page uses. They touch no screen elements, so tests can load this file on its own.
(function (root) {
  const DECK_SIZE = 78;
  const MAX_DAILY_READINGS = 3;   // free readings a day (a convenience limit kept in this browser, not a security measure)
  const MAX_FOLLOWUPS = 3;        // follow-up questions after the first answer
  const SPREADS = {               // must match chatbot-tarot/lib/engine.js (a test checks it)
    1: ['오늘의 핵심'],
    3: ['지금 상황', '걸림돌', '이번 주 한 걸음'],
    5: ['지금 상황', '걸림돌', '도움이 되는 것', '놓치고 있을 수 있는 것', '이번 주 한 걸음'],
  };

  // A random 32-character code that makes this reading's shuffle different from every other one.
  function makeSeed() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  function dayKey(date) {
    const d = date || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function readUsage(storage, date) {
    try {
      const saved = JSON.parse(storage.getItem('tt_usage') || 'null');
      if (saved && saved.day === dayKey(date) && Number.isInteger(saved.count) && saved.count >= 0) return saved.count;
    } catch { /* an unreadable value just counts as unused */ }
    return 0;
  }
  function remainingReadings(storage, date) { return Math.max(0, MAX_DAILY_READINGS - readUsage(storage, date)); }
  function recordReading(storage, date) {
    try { storage.setItem('tt_usage', JSON.stringify({day: dayKey(date), count: readUsage(storage, date) + 1})); } catch { /* the count is only a convenience */ }
  }

  // Adds or removes one number from the chosen list. Returns a new list; never more than `count` numbers, never a repeat.
  function toggleNumber(chosen, number, count) {
    if (!Number.isInteger(number) || number < 1 || number > DECK_SIZE) return chosen.slice();
    if (chosen.includes(number)) return chosen.filter(item => item !== number);
    return chosen.length >= count ? chosen.slice() : [...chosen, number];
  }

  // The answer text, cut into paragraphs. A line that is only 【…】 is a small heading.
  function toBlocks(text) {
    return String(text || '').split(/\n+/).map(line => line.trim()).filter(Boolean).map(line => ({heading: line.startsWith('【') && line.indexOf('】') === line.length - 1, text: line}));
  }

  // The answer grouped by its 【small headings】: [{title, lines}]. Lines before the first heading come back with an empty title.
  // A heading may also have its first sentence on the same line: 【카드가 말하는 것】 첫 문장...
  function toSections(text) {
    const sections = [];
    let current = null;
    String(text || '').split(/\n+/).map(line => line.trim()).filter(Boolean).forEach(line => {
      const match = line.match(/^【([^】]+)】\s*(.*)$/);
      if (match) { current = {title: match[1].trim(), lines: match[2] ? [match[2]] : []}; sections.push(current); }
      else {
        if (!current) { current = {title: '', lines: []}; sections.push(current); }
        current.lines.push(line);
      }
    });
    // The closing question to think about is not part of the last box: it stays under it as its own line.
    const last = sections[sections.length - 1];
    if (last && last.title && last.lines.length > 1 && /[?？]$/.test(last.lines[last.lines.length - 1])) {
      sections.push({title: '', lines: [last.lines.pop()]});
    }
    return sections;
  }

  function cleanInput(text, limit) { return String(text || '').replace(/\s+/g, ' ').trim().slice(0, limit); }

  const api = {DECK_SIZE, MAX_DAILY_READINGS, MAX_FOLLOWUPS, SPREADS, makeSeed, dayKey, readUsage, remainingReadings, recordReading, toggleNumber, toBlocks, toSections, cleanInput};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TarotCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
