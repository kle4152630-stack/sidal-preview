'use strict';
// "3분 쉼표" as a calendar entry (.ics). The file is made here in the browser and handed to the phone's own calendar app,
// so no server, account or push service is involved and nothing leaves this device.

const PAUSE_CLOCK = {lunch: [13, 0], evening: [19, 0], night: [22, 30]};   // local time of day for each choice; "now" means five minutes from now
const ICS_TITLE = '사이달 3분 쉼표';

function icsEscape(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}
function utf8Length(char) {
  const code = char.codePointAt(0);
  return code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
}
// Lines longer than 75 bytes are folded (continuation lines start with one space); characters are never cut in half.
function icsFold(line) {
  const parts = [];
  let current = '', size = 0, limit = 74;
  for (const char of line) {
    const length = utf8Length(char);
    if (size + length > limit) { parts.push(current); current = ' '; size = 1; limit = 74; }
    current += char; size += length;
  }
  parts.push(current);
  return parts.join('\r\n');
}
function icsLocal(date) {
  return date.getFullYear() + pad2(date.getMonth() + 1) + pad2(date.getDate()) + 'T' + pad2(date.getHours()) + pad2(date.getMinutes()) + '00';
}
function icsUtc(date) {
  return date.getUTCFullYear() + pad2(date.getUTCMonth() + 1) + pad2(date.getUTCDate()) + 'T' + pad2(date.getUTCHours()) + pad2(date.getUTCMinutes()) + pad2(date.getUTCSeconds()) + 'Z';
}
// The next time this slot comes around: today if it is still ahead, otherwise tomorrow.
function pauseStart(slot, now = new Date()) {
  if (slot === 'now') {
    const soon = new Date(now.getTime() + 5 * 60000);
    soon.setSeconds(0, 0);
    return soon;
  }
  const clock = PAUSE_CLOCK[slot];
  if (!clock) return null;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), clock[0], clock[1], 0);
  if (start.getTime() <= now.getTime()) start.setDate(start.getDate() + 1);
  return start;
}

// Returns the text of the .ics file, or '' for an unknown slot.
function buildIcs({slot, mission = '', now = new Date(), minutes = 3, uid = ''}) {
  const start = pauseStart(slot, now);
  if (!start) return '';
  const end = new Date(start.getTime() + minutes * 60000);
  const id = String(uid || 'sidal-' + icsLocal(start) + '-' + Math.random().toString(36).slice(2, 10)).replace(/[^A-Za-z0-9_-]/g, '');
  const description = '오늘의 3분 미션: ' + mission + '\n끝나면 한 줄만 적어 보세요. 못 해도 괜찮아요.';
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sidal//3 minute pause//KO', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', 'UID:' + id + '@sidal', 'DTSTAMP:' + icsUtc(now),
    'DTSTART:' + icsLocal(start), 'DTEND:' + icsLocal(end),
    'SUMMARY:' + icsEscape(ICS_TITLE), 'DESCRIPTION:' + icsEscape(description),
    'BEGIN:VALARM', 'TRIGGER:PT0S', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEscape(ICS_TITLE), 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'
  ];
  return lines.map(icsFold).join('\r\n') + '\r\n';
}

function downloadIcs(text) {
  const blob = new Blob([text], {type: 'text/calendar;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'sidal-3min-pause.ics';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// Called by the "캘린더에 저장" button. Returns true when a file was handed to the browser.
function savePauseToCalendar(slot, mission) {
  const text = buildIcs({slot, mission});
  if (!text) { toast('먼저 편한 시간대를 골라 주세요.'); return false; }
  downloadIcs(text);
  toast('일정 파일을 만들었어요. 열면 캘린더 앱에 추가할 수 있어요.');
  return true;
}
