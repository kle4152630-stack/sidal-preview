'use strict';
// Reading aloud (the browser's own speech voice, nothing is sent anywhere) and larger / higher-contrast display.
// The choices are remembered in this browser only, as a convenience.

const A11Y_KEY = 'sidal_a11y';
let speaking = false, speechRun = 0;

function a11yLoad() {
  try {
    const saved = JSON.parse(localStorage.getItem(A11Y_KEY) || '{}');
    return {large: saved.large === true, contrast: saved.contrast === true};
  } catch { return {large: false, contrast: false}; }
}
function a11ySave(settings) { try { localStorage.setItem(A11Y_KEY, JSON.stringify(settings)); } catch { /* the choice just is not remembered */ } }
function a11yApply(settings) {
  const root = document.documentElement;
  root.classList.toggle('a11y-large', settings.large);
  root.classList.toggle('a11y-contrast', settings.contrast);
  $('a11yLarge').setAttribute('aria-pressed', String(settings.large));
  $('a11yContrast').setAttribute('aria-pressed', String(settings.contrast));
}

// Short pieces, one sentence or less than about 140 characters each (some browsers stop reading very long text).
function speechChunks(text) {
  const sentences = String(text || '').replace(/[ \t]+/g, ' ').split(/\n+/).flatMap(line => line.match(/[^.!?。]+[.!?。]?/g) || []).map(part => part.trim()).filter(Boolean);
  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    if (current && (current + ' ' + sentence).length > 140) { chunks.push(current); current = sentence; }
    else current = current ? current + ' ' + sentence : sentence;
  }
  if (current) chunks.push(current);
  return chunks.flatMap(chunk => chunk.length <= 200 ? [chunk] : chunk.match(/.{1,180}/g)).map(piece => piece.trim()).filter(Boolean);
}

// The result that is on screen right now, as plain text (buttons, inputs and the like are not read).
function readTarget() {
  const shown = id => $(id) && !$(id).hidden;
  if (shown('result')) return $('result');
  if (shown('fortune')) {
    for (const id of ['birthResult', 'mbtiResult', 'chemResult']) if (shown('panel-' + id.replace('Result', '')) && $(id).textContent.trim()) return $(id);
    return null;
  }
  if (shown('home') && shown('todayResult')) return $('todayResult');
  return null;
}
function readableText(root) {
  if (!root) return '';
  return root.querySelectorAll('h1,h2,h3,p,li').map(node => node.textContent.trim()).filter(Boolean).join('\n');
}

function speechSupported() { return typeof window !== 'undefined' && Boolean(window.speechSynthesis) && typeof SpeechSynthesisUtterance === 'function'; }
function setSpeakingUi(on) {
  speaking = on;
  $('a11yRead').hidden = on;
  $('a11yPause').hidden = !on;
  $('a11yStop').hidden = !on;
  $('a11yPause').textContent = '일시정지';
}
function stopSpeech() {
  speechRun++;
  if (speechSupported()) window.speechSynthesis.cancel();
  setSpeakingUi(false);
}
function startSpeech() {
  if (!speechSupported()) { toast('이 브라우저는 읽어주기를 지원하지 않아요.'); return false; }
  const chunks = speechChunks(readableText(readTarget()));
  if (!chunks.length) { toast('읽어 드릴 결과가 아직 없어요. 카드를 먼저 열어 주세요.'); return false; }
  window.speechSynthesis.cancel();
  const run = ++speechRun;
  const voice = (window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : []).find(item => /^ko/i.test(item.lang));
  chunks.forEach((chunk, index) => {
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = 'ko-KR'; utterance.rate = 0.95;
    if (voice) utterance.voice = voice;
    utterance.onend = () => { if (run === speechRun && index === chunks.length - 1) setSpeakingUi(false); };
    utterance.onerror = () => { if (run === speechRun) setSpeakingUi(false); };
    window.speechSynthesis.speak(utterance);
  });
  setSpeakingUi(true);
  return true;
}
function togglePauseSpeech() {
  if (!speechSupported()) return;
  const synth = window.speechSynthesis;
  if (synth.paused) { synth.resume(); $('a11yPause').textContent = '일시정지'; }
  else { synth.pause(); $('a11yPause').textContent = '이어서 읽기'; }
}

(function initAccessibility() {
  let settings = a11yLoad();
  a11yApply(settings);
  if (!speechSupported()) $('a11yRead').hidden = true;   // nothing to offer when the browser has no speech voice
  $('a11yRead').onclick = startSpeech;
  $('a11yPause').onclick = togglePauseSpeech;
  $('a11yStop').onclick = stopSpeech;
  $('a11yLarge').onclick = () => { settings = {...settings, large: !settings.large}; a11ySave(settings); a11yApply(settings); };
  $('a11yContrast').onclick = () => { settings = {...settings, contrast: !settings.contrast}; a11ySave(settings); a11yApply(settings); };
  window.addEventListener('pagehide', stopSpeech);
})();
