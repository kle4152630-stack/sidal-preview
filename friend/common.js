'use strict';
// Parts of the page that do not touch its layout: the number picker, the reading session and the answer text.
(function () {
  const core = window.TarotCore;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ANSWER_TIMEOUT_MS = 45000;   // a slow answer ends with a calm message instead of waiting forever
  const COUNTS = [3];   // every reading uses 3 cards for now (the card engine can do 1 or 5 again later)

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function storage() { try { return window.localStorage; } catch { return {getItem: () => null, setItem() {}}; } }
  function usageText() {
    const left = core.remainingReadings(storage());
    return left > 0 ? `오늘 남은 무료 이야기: ${left}번` : '오늘의 무료 이야기를 모두 썼어요. 내일 다시 만나요.';
  }
  const canStart = () => core.remainingReadings(storage()) > 0;

  // ---- one reading: question, which numbers, then the conversation ----
  function createSession() {
    const s = {question: '', count: 3, chosen: [], seed: '', picked: [], messages: [], followups: 0, busy: false, gen: 0};
    // Starting a new reading also cancels any answer still on its way for the old one (it is dropped when it arrives).
    s.begin = question => { s.gen += 1; s.busy = false; s.question = question; s.count = 3; s.chosen = []; s.seed = core.makeSeed(); s.picked = []; s.messages = []; s.followups = 0; };
    s.cancel = () => { s.gen += 1; s.busy = false; };
    s.setCount = count => { if (COUNTS.includes(count)) { s.count = count; s.chosen = []; } };
    s.toggle = number => { s.chosen = core.toggleNumber(s.chosen, number, s.count); };
    s.ready = () => s.chosen.length === s.count;
    s.followLeft = () => core.MAX_FOLLOWUPS - s.followups;
    // Sends the question (first call) or a follow-up. Resolves {reply, picked}; throws an Error with a calm message.
    s.send = async text => {
      const gen = s.gen;
      s.messages.push({role: 'user', content: text});
      const body = JSON.stringify({seed: s.seed, numbers: s.chosen.slice(), messages: s.messages.slice()});
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ANSWER_TIMEOUT_MS);
      try {
        const response = await fetch('/api/chat', {method: 'POST', headers: {'content-type': 'application/json'}, body, signal: controller.signal});
        const data = await response.json().catch(() => ({}));
        if (gen !== s.gen) { const stale = new Error('cancelled'); stale.cancelled = true; throw stale; }
        if (!response.ok || !data.reply) throw new Error(data.error || '답을 가져오지 못했어요.');
        s.messages.push({role: 'assistant', content: data.reply});
        if (data.picked && !s.picked.length) s.picked = data.picked;
        if (s.messages.length === 2) core.recordReading(storage());
        return data;
      } catch (error) {
        if (gen === s.gen) s.messages.pop();
        if (error && error.name === 'AbortError') throw new Error('답이 늦어지고 있어요. 잠시 뒤에 다시 시도해 주세요.');
        if (error && error.name === 'TypeError') throw new Error('인터넷 연결을 확인하고 다시 시도해 주세요.');
        throw error;
      } finally { clearTimeout(timer); }
    };
    return s;
  }

  // ---- the number picker: slots and the 1-78 grid, drawn into the given elements ----
  function mountPicker(session, {slotsHost, gridHost, confirm, onChange}) {
    const nums = [];
    gridHost.replaceChildren();
    for (let number = 1; number <= core.DECK_SIZE; number++) {
      const button = el('button', 'num', String(number));
      button.type = 'button';
      button.dataset.n = String(number);
      button.setAttribute('aria-label', number + '번');
      button.onclick = () => { session.toggle(number); render(); };
      gridHost.append(button);
      nums.push(button);
    }
    function render() {
      const labels = core.SPREADS[session.count];
      slotsHost.replaceChildren(...labels.map((label, index) => {
        const slot = el('li', session.chosen[index] ? 'slot filled' : 'slot');
        slot.append(el('span', 'slotlabel', `${index + 1}번째 · ${label}`), el('b', '', session.chosen[index] ? session.chosen[index] + '번' : '—'));
        return slot;
      }));
      nums.forEach(button => {
        const order = session.chosen.indexOf(Number(button.dataset.n));
        button.classList.toggle('picked', order >= 0);
        button.setAttribute('aria-pressed', String(order >= 0));
        button.dataset.order = order >= 0 ? String(order + 1) : '';
      });
      confirm.disabled = !session.ready();
      if (onChange) onChange();
    }
    render();
    return {render, reset() { session.chosen = []; render(); }, lock() { nums.forEach(button => { button.disabled = true; }); confirm.disabled = true; }};
  }

  // ---- showing the answer ----
  // Each 【heading】 with its sentences becomes one box. A heading with nothing under it (like the trial-answer notice) stays a small bold line.
  function paragraphs(host, text, {keep = false} = {}) {
    if (!keep) host.replaceChildren();
    core.toSections(text).forEach(section => {
      if (!section.title) { section.lines.forEach(line => host.append(el('p', '', line))); return; }
      if (section.title === '한 줄 요약' && section.lines.length) {
        const box = el('section', 'headline');
        box.append(el('p', 'headlabel', '한 줄 요약'), el('p', 'headtext', section.lines.join(' ')));
        host.append(box);
        return;
      }
      if (!section.lines.length) { host.append(el('p', 'heading', section.title)); return; }
      // The cards are already shown above with their pictures and meanings, so the card reading box is not drawn.
      if (section.title === '카드가 말하는 것') return;
      const box = el('section', 'secbox');
      box.append(el('h3', 'sectitle', section.title), ...section.lines.map(line => el('p', '', line)));
      host.append(box);
    });
  }
  function pickedBox(picked) {
    const box = el('div', 'picked');
    box.append(el('p', 'pickedhead', '고른 번호와 카드'));
    picked.forEach(item => {
      const card = el('div', 'pickedcard');
      if (item.image) {
        const img = document.createElement('img');
        img.className = 'cardimg';
        img.src = item.image;
        img.alt = item.name;
        img.loading = 'lazy';
        card.append(img);
      }
      const text = el('div', 'pickedtext');
      const row = el('p', 'pickedrow');
      row.append(el('span', '', `${item.position} · ${item.number}번`), el('b', '', item.name));
      text.append(row);
      if (item.meaning) text.append(el('p', 'pickedmeaning', item.meaning));
      if (item.keywords && item.keywords.length) text.append(el('p', 'pickedkeys', item.keywords.join(' · ')));
      card.append(text);
      box.append(card);
    });
    return box;
  }

  // Copies text to the clipboard; falls back to a hidden text box when the browser refuses. Resolves true when it worked.
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = el('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      area.remove();
      return ok;
    }
  }
  // The answer as plain text, for copying and sharing.
  function plainResult(picked, reply) {
    const lines = picked.map(item => `${item.position} · ${item.number}번 → ${item.name}`);
    return ['[타로 친구]', ...lines, '', ...core.toBlocks(reply).map(block => block.text), '', '※ 타로는 재미와 자기 성찰을 위한 상징 해석이에요.'].join('\n');
  }

  // The picked cards as one PNG: picture, position, name and meaning for each card. The question is not in the picture.
  function loadPicture(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  function wrapText(ctx, text, maxWidth, maxLines) {
    const lines = [];
    let line = '';
    for (const ch of text) {
      if (ctx.measureText(line + ch).width > maxWidth) { lines.push(line); line = ch; }
      else line += ch;
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + '…'; }
    return lines;
  }
  async function pickedPicture(picked) {
    const W = 720, pad = 36, cardW = 150, cardH = 250, rowH = 290, head = 100, foot = 90;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = head + picked.length * rowH + foot;
    const ctx = canvas.getContext('2d');
    const font = '"Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111418';
    ctx.font = `800 34px ${font}`;
    ctx.fillText('타로 친구 · 고른 카드', pad, pad + 30);
    const textX = pad + cardW + 28;
    const textW = W - textX - pad;
    for (let i = 0; i < picked.length; i++) {
      const item = picked[i];
      const y = head + i * rowH;
      if (item.image) {
        try { ctx.drawImage(await loadPicture(item.image), pad, y, cardW, cardH); } catch { /* the words still go in the picture */ }
      }
      ctx.fillStyle = '#5b6470';
      ctx.font = `400 22px ${font}`;
      ctx.fillText(`${item.position} · ${item.number}번`, textX, y + 30);
      ctx.fillStyle = '#111418';
      ctx.font = `800 36px ${font}`;
      ctx.fillText(item.name, textX, y + 78);
      ctx.fillStyle = '#5b6470';
      ctx.font = `400 22px ${font}`;
      wrapText(ctx, item.meaning || '', textW, 5).forEach((text, n) => ctx.fillText(text, textX, y + 124 + n * 32));
    }
    ctx.fillStyle = '#5b6470';
    ctx.font = `400 20px ${font}`;
    ctx.fillText('※ 타로는 재미와 자기 성찰을 위한 상징 해석이에요.', pad, canvas.height - 36);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  }

  window.TarotApp = {core, reduced, el, COUNTS, usageText, canStart, createSession, mountPicker, paragraphs, pickedBox, copyText, plainResult, pickedPicture};
})();
