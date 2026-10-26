'use strict';
// Two square (1:1) share images that carry no personal content:
//  - the "1줄 포토카드": only three things - the card illustration, one short mission line, and the Sidal logo;
//  - the "점검 요약": only "오늘의 대화 점검 완료 (T형/F형 체크 N건)", never the message that was checked.
// Nothing about the person (situation title, note, birthdate, MBTI, pasted text) is ever drawn. The image is made here and saved or shared by the phone.

const PHOTO_SIZE = {width: 1080, height: 1080};
const SUMMARY_SIZE = {width: 1080, height: 1080};
const LOGO_TEXT = '☾ 사이달  SIDAL';
const PHOTO_LINE_MAX = 60;

// One line only: the first sentence, kept short.
function photoLine(text) {
  const one = String(text || '').replace(/\s+/g, ' ').trim();
  const sentence = (one.match(/^.*?[.!?。](?=\s|$)/) || [one])[0];
  return sentence.length > PHOTO_LINE_MAX ? sentence.slice(0, PHOTO_LINE_MAX - 1).replace(/\s+\S*$/, '') + '…' : sentence;
}

// Draws onto any 2D context (a real canvas, or a recording one in tests). Returns the texts that were drawn: the logo and the line, nothing else.
function drawPhotoCard(context, {image, line}) {
  const drawn = [], W = PHOTO_SIZE.width, H = PHOTO_SIZE.height;
  const text = (value, x, y) => { drawn.push(value); context.fillText(value, x, y); };
  const gradient = context.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, '#2b2239'); gradient.addColorStop(0.55, '#171424'); gradient.addColorStop(1, '#0c0b15');
  context.fillStyle = gradient; context.fillRect(0, 0, W, H);
  context.strokeStyle = '#786244'; context.lineWidth = 2; context.strokeRect(36, 36, W - 72, H - 72);
  context.textAlign = 'center';
  context.fillStyle = '#d5ba86'; context.font = `600 34px ${FONT}`;
  text(LOGO_TEXT, W / 2, 112);
  context.drawImage(image, (W - 384) / 2, 150, 384, 640);
  context.fillStyle = '#eadfc9'; context.font = `600 44px ${FONT}`;
  let y = 872;
  for (const part of wrapLines(context, photoLine(line), 860, 2)) { text(part, W / 2, y); y += 64; }
  return drawn;
}

// The count is how many of the 8 checks said "살펴보세요" - a number only.
function drawCheckSummary(context, {count}) {
  const drawn = [], W = SUMMARY_SIZE.width, H = SUMMARY_SIZE.height;
  const text = (value, x, y) => { drawn.push(value); context.fillText(value, x, y); };
  const gradient = context.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, '#2b2239'); gradient.addColorStop(1, '#0c0b15');
  context.fillStyle = gradient; context.fillRect(0, 0, W, H);
  context.strokeStyle = '#786244'; context.lineWidth = 2; context.strokeRect(36, 36, W - 72, H - 72);
  context.textAlign = 'center';
  context.fillStyle = '#d5ba86'; context.font = `600 34px ${FONT}`;
  text(LOGO_TEXT, W / 2, 112);
  context.fillStyle = '#f4ead8'; context.font = `600 72px ${FONT}`;
  text('오늘의 대화 점검 완료', W / 2, 520);
  context.fillStyle = '#d5ba86'; context.font = `600 52px ${FONT}`;
  text('(T형/F형 체크 ' + count + '건)', W / 2, 620);
  return drawn;
}

async function canvasBlob(size, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = size.width; canvas.height = size.height;
  paint(canvas.getContext('2d'));
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('blob');
  return blob;
}

async function deliverImage(blob, filename, doneText) {
  const file = new File([blob], filename, {type: 'image/png'});
  if (navigator.canShare && navigator.canShare({files: [file]})) {
    try { await navigator.share({files: [file], title: '사이달'}); toast('이미지를 공유했어요.'); return true; }
    catch (error) { if (error && error.name === 'AbortError') return false; }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  toast(doneText);
  return true;
}

async function savePhotoCard(card, line) {
  try {
    const image = await loadImage(card.image);
    const blob = await canvasBlob(PHOTO_SIZE, context => drawPhotoCard(context, {image, line}));
    return await deliverImage(blob, 'sidal-photocard-' + card.id + '.png', '포토카드 저장을 시작했어요.');
  } catch {
    toast('이미지를 만들지 못했어요. 잠시 후 다시 시도해주세요.');
    return false;
  }
}

function checkSummaryNumbers(result) { return {count: result.items.filter(item => !item.ok).length}; }
async function saveCheckSummary(result) {
  if (!result || result.empty) { toast('먼저 문장을 점검해 주세요.'); return false; }
  try {
    const blob = await canvasBlob(SUMMARY_SIZE, context => drawCheckSummary(context, checkSummaryNumbers(result)));
    return await deliverImage(blob, 'sidal-check-summary.png', '요약 이미지 저장을 시작했어요.');
  } catch {
    toast('이미지를 만들지 못했어요. 잠시 후 다시 시도해주세요.');
    return false;
  }
}

(function initPhotoCard() {
  const button = $('todayPhoto');
  if (!button) return;
  button.onclick = () => {
    const card = todayStored();
    if (!card) { toast('먼저 오늘의 한 장을 뒤집어 주세요.'); return; }
    savePhotoCard(card, todaySummary(card)[1].replace(/^[^:]*:\s*/, ''));
  };
})();
