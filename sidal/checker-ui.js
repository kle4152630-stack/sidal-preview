'use strict';
// Screen for the "보내기 전 30초 점검" dialog. Needs checker.js and fortune-ui.js (fEl).

function renderChecker() {
  const out = $('checkerResult');
  const result = checkMessage($('checkerInput').value);
  if (result.empty) { out.replaceChildren(fEl('p', 'fortune-error', result.summary)); return false; }
  const nodes = [fEl('h3', 'checker-summary', result.summary)];
  if (result.trimmed) nodes.push(fEl('p', 'fortune-note', '앞의 ' + CHECK_MAX + '자만 점검했어요.'));
  for (const [lens, title] of [['T', '사실과 분명함을 먼저 보는 사람에게는'], ['F', '말투와 마음을 먼저 보는 사람에게는']]) {
    const box = fEl('div', 'fortune-block');
    box.append(fEl('h3', '', title));
    result.items.filter(item => item.lens === lens).forEach(item => {
      const row = fEl('div', item.ok ? 'check-row ok' : 'check-row watch');
      row.append(fEl('b', '', item.ok ? '좋아요' : '살펴보세요'), fEl('p', '', item.text));
      if (item.fix) row.append(fEl('small', '', item.fix));
      box.append(row);
    });
    nodes.push(box);
  }
  const save = fEl('button', 'secondary', '결과 요약 이미지 저장 (문장은 담기지 않아요)');
  save.onclick = () => saveCheckSummary(result);
  nodes.push(save);
  nodes.push(fEl('p', 'fortune-note', CHECK_NOTE));
  out.replaceChildren(...nodes);
  return true;
}

(function initChecker() {
  const open = () => { $('checkerModal').showModal(); $('checkerInput').focus(); };
  $('checkerHero').onclick = open;
  $('checkerGo').onclick = renderChecker;
  $('checkerClear').onclick = () => { $('checkerInput').value = ''; $('checkerResult').replaceChildren(); $('checkerInput').focus(); };
  $('checkerClose').onclick = () => $('checkerModal').close();
})();
