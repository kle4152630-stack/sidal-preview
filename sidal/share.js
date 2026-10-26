'use strict';
// Result sharing: copy a link, send it through KakaoTalk, save a story-size image, and open a shared card.
// Nothing here runs or loads until the person taps a button (the Kakao SDK is only fetched on that tap), and no memo is ever included.

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const KAKAO_SDK = {
  url: 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js',
  integrity: 'sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nka'
};
const FONT = "'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif";
let kakaoLoading = null;

function siteBase() {
  const canonical = document.querySelector('link[rel="canonical"]');
  const href = canonical && canonical.getAttribute('href');
  if (href && /^https?:\/\//.test(href) && !href.includes('__SITE_URL__')) return href.replace(/\/+$/, '');
  return new URL('./', location.href).href.replace(/\/+$/, '');
}
function shareLink(card) { return siteBase() + '/?c=' + encodeURIComponent(card.id); }
function includeTitle() { const box = $('shareTitle'); return Boolean(box && box.checked); }
function firstSentence(text) { const value = String(text); const match = value.match(/^.*?[.!?。](?=\s|$)/); return match ? match[0] : value; }

// What a friend sees in the message. The situation title is private, so it is only added when the person ticks the box.
function sharePayload() {
  const card = currentCard;
  const withTitle = includeTitle();
  const title = withTitle && selected ? `「${selected.title}」 — 내 카드는 ${card.name}` : `내 카드는 ${card.name}이에요`;
  const summary = `${card.keywords.join(' · ')} — ${firstSentence(card.meaning)}`;
  const extra = withTitle && selected ? ` 오늘의 작은 한 걸음: ${selected.action}` : '';
  const text = summary + extra;
  const link = shareLink(card);
  return {title, text, link, imageUrl: siteBase() + '/' + card.image, withTitle};
}

async function copyShareLink() {
  const {link} = sharePayload();
  try {
    await navigator.clipboard.writeText(link);
  } catch {
    const field = document.createElement('textarea');
    field.value = link;
    field.style.cssText = 'position:fixed;opacity:0';
    document.body.append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch {}
    field.remove();
    if (!copied) {
      // In-app browsers (such as KakaoTalk's) can refuse clipboard access: show the link so it can be copied by hand.
      const shown = $('shareLinkField');
      if (shown) { shown.value = link; shown.hidden = false; shown.focus(); shown.select(); }
      toast('아래 링크를 길게 눌러 복사해주세요.');
      return false;
    }
  }
  toast('링크가 복사되었습니다!');
  return true;
}

function kakaoKey() {
  const meta = document.querySelector('meta[name="sidal:kakao-key"]');
  const value = meta ? meta.getAttribute('content') : '';
  return /^[0-9a-f]{32}$/.test(value || '') ? value : '';
}

function loadKakao() {
  if (window.Kakao) return Promise.resolve(window.Kakao);
  if (!kakaoLoading) {
    kakaoLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = KAKAO_SDK.url;
      script.integrity = KAKAO_SDK.integrity;
      script.crossOrigin = 'anonymous';
      script.onload = () => window.Kakao ? resolve(window.Kakao) : reject(new Error('kakao'));
      script.onerror = () => { kakaoLoading = null; reject(new Error('kakao')); };
      document.head.append(script);
    });
  }
  return kakaoLoading;
}

async function shareNative(payload) {
  if (typeof navigator.share !== 'function') return false;
  try { await navigator.share({title: payload.title, text: payload.text, url: payload.link}); return true; }
  catch (error) { return error && error.name === 'AbortError'; }
}

async function shareKakao() {
  if (!currentCard) return false;
  const payload = sharePayload();
  const key = kakaoKey();
  if (key) {
    try {
      const Kakao = await loadKakao();
      if (!Kakao.isInitialized()) Kakao.init(key);
      const link = {mobileWebUrl: payload.link, webUrl: payload.link};
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {title: payload.title, description: payload.text, imageUrl: payload.imageUrl, imageWidth: 480, imageHeight: 800, link},
        buttons: [{title: '나도 카드 뽑아보기', link}]
      });
      return true;
    } catch { /* fall through to the phone's own share sheet */ }
  }
  if (await shareNative(payload)) return true;
  await copyShareLink();
  toast(key ? '카카오톡을 열지 못해 링크를 복사했어요.' : '링크를 복사했어요. 카카오톡에 붙여넣어 보내보세요.');
  return false;
}

// Greedy wrap by character (Korean has no spaces to rely on); the last line ends with an ellipsis when text is cut.
function wrapLines(context, text, maxWidth, maxLines) {
  const lines = [];
  let line = '';
  for (const char of String(text)) {
    if (char === '\n' || context.measureText(line + char).width > maxWidth) {
      lines.push(line);
      line = char === '\n' ? '' : char;
    } else line += char;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/.$/, '') + '…';
    return kept;
  }
  return lines;
}

async function buildStoryImage() {
  const card = currentCard, reading = currentReading, item = selected, category = item.category;
  const withTitle = includeTitle();
  const image = await loadImage(card.image);
  const canvas = document.createElement('canvas');
  canvas.width = STORY_WIDTH; canvas.height = STORY_HEIGHT;
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, STORY_WIDTH, STORY_HEIGHT);
  gradient.addColorStop(0, '#2b2239'); gradient.addColorStop(0.55, '#171424'); gradient.addColorStop(1, '#0c0b15');
  context.fillStyle = gradient; context.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);
  context.strokeStyle = '#786244'; context.lineWidth = 2; context.strokeRect(36, 36, STORY_WIDTH - 72, STORY_HEIGHT - 72);
  context.textAlign = 'center';
  context.fillStyle = '#d5ba86'; context.font = `600 34px ${FONT}`;
  context.fillText('☾ 사이달  SIDAL', STORY_WIDTH / 2, 150);
  context.drawImage(image, (STORY_WIDTH - 408) / 2, 200, 408, 680);
  context.fillStyle = '#f4ead8'; context.font = `600 52px ${FONT}`;
  context.fillText(card.name, STORY_WIDTH / 2, 975);
  context.fillStyle = '#d5ba86'; context.font = `28px ${FONT}`;
  context.fillText(card.keywords.join(' · '), STORY_WIDTH / 2, 1028);
  let y = 1100;
  if (withTitle) {
    context.fillStyle = '#c8b9d5'; context.font = `30px ${FONT}`;
    for (const line of wrapLines(context, `「${item.title}」`, 860, 2)) { context.fillText(line, STORY_WIDTH / 2, y); y += 44; }
    y += 14;
  }
  const tiers = [
    ['카드의 이야기', firstSentence(card.meaning)],
    ['오행의 비유', `${category.element} · ${category.flow}`],
    ['확인되는 것과 아닌 것', `${item.fact} ${item.uncertain}`],
    ['오늘의 작은 한 걸음', item.action]
  ].filter(([label]) => !(label.startsWith('확인되는') && typeof lockedForExport === 'function' && lockedForExport()));
  for (const [label, text] of tiers) {
    context.fillStyle = '#9b8aa8'; context.font = `24px ${FONT}`;
    context.fillText(label, STORY_WIDTH / 2, y); y += 40;
    context.fillStyle = '#eadfc9'; context.font = `30px ${FONT}`;
    for (const line of wrapLines(context, text, 860, 3)) { context.fillText(line, STORY_WIDTH / 2, y); y += 44; }
    y += 26;
  }
  context.fillStyle = '#dcbf91'; context.font = `500 32px ${FONT}`;
  for (const line of wrapLines(context, reading.reflection, 860, 2)) { context.fillText(line, STORY_WIDTH / 2, Math.min(y + 14, 1720)); y += 46; }
  context.fillStyle = '#9b8aa8'; context.font = `22px ${FONT}`;
  context.fillText('직접 고른 카드 · 정방향 상징 리딩 · 미래를 예측하지 않아요', STORY_WIDTH / 2, 1818);
  context.fillText('Art: P. C. Smith / RWS 1909 · Public domain', STORY_WIDTH / 2, 1856);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('blob');
  return blob;
}

async function saveStoryImage() {
  const card = currentCard;
  if (!card) return false;
  const button = $('download');
  button.disabled = true;
  try {
    const blob = await buildStoryImage();
    const file = new File([blob], 'sidal-' + card.id + '.png', {type: 'image/png'});
    if (navigator.canShare && navigator.canShare({files: [file]})) {
      try { await navigator.share({files: [file], title: '사이달'}); toast('이미지를 공유했어요.'); return true; }
      catch (error) { if (error && error.name === 'AbortError') return false; }
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = file.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast('스토리용 이미지 저장을 시작했어요.');
    return true;
  } catch {
    toast('이미지를 만들지 못했어요. 잠시 후 다시 시도해주세요.');
    return false;
  } finally { button.disabled = false; }
}

// A friend's link (?c=m09) opens that card's page. Only ids that exist in the deck are accepted.
function openSharedCard() {
  const id = new URLSearchParams(location.search).get('c');
  const card = id && /^[a-z0-9]{2,8}$/i.test(id) ? deckById.get(id) : null;
  if (!card) return false;
  renderDeck();
  $('deckModal').showModal();
  showCardDetail(card);
  toast('친구가 보낸 카드예요. 마음에 드는 고민을 골라 나도 한 장 뽑아보세요.');
  return true;
}

$('shareKakao').onclick = shareKakao;
$('copyLink').onclick = copyShareLink;
$('download').onclick = saveStoryImage;
openSharedCard();
