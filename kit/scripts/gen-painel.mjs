#!/usr/bin/env node
// gen-painel.mjs — gera docs/roadmap/PAINEL.html a partir de docs/roadmap/painel-data.json.
// Painel VIVO do roadmap (pronto x falta). DERIVADO dos dados — nunca editar o HTML à mão.
// Rodar: `node scripts/gen-painel.mjs` (idempotente, zero deps).
// Wired no execute-closure (step 8) + lembrete painel-sync-reminder.py no closure de cada task.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dataUrl = new URL('../docs/roadmap/painel-data.json', import.meta.url);
const outUrl = new URL('../docs/roadmap/PAINEL.html', import.meta.url);
const data = JSON.parse(readFileSync(dataUrl, 'utf8'));

const STATUS = {
  done: 's-done', 'fe-only': 's-fe', partial: 's-partial', missing: 's-missing', backend: 's-backend',
};
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const badge = (st) => `<span class="b ${STATUS[st] || 's-backend'}">${esc(st)}</span>`;

const allScreens = data.surfaces.flatMap((s) => s.epics.flatMap((e) => e.screens));
const n = (st) => allScreens.filter((x) => x.status === st).length;
const kpi = { done: n('done'), fe: n('fe-only'), partial: n('partial'), missing: n('missing'), backends: (data.backends || []).length, stale: (data.staleDocs || []).length };
const surfaceCount = (s) => {
  const scr = s.epics.flatMap((e) => e.screens);
  const miss = scr.filter((x) => x.status === 'missing').length;
  const part = scr.filter((x) => x.status === 'partial').length;
  return `${scr.length} telas${miss ? ` · ${miss} faltando` : ''}${part ? ` · ${part} parcial` : ''}`;
};

const surfaceBlock = (s) => `
  <section id="${esc(s.id)}"><h2>${esc(s.name)} <span class="muted" style="font-size:12px;font-weight:400">— ${surfaceCount(s)}</span></h2>
  ${s.epics.map((e) => `
    <h3>${esc(e.epic)} — ${esc(e.label)}</h3>
    <table><tr><th>Tela</th><th>Rota</th><th>Status</th><th>Evidência / nota</th></tr>
    ${e.screens.map((sc) => `<tr><td>${esc(sc.name)}</td><td><code>${esc(sc.route)}</code></td><td>${badge(sc.status)}</td><td>${esc(sc.evidence)}${sc.note ? ` · <span class="muted">${esc(sc.note)}</span>` : ''}</td></tr>`).join('\n    ')}
    </table>`).join('')}
  </section>`;

const backendsBlock = (data.backends || []).length ? `
  <section id="backends"><h2>Backends faltando <span class="muted" style="font-size:12px;font-weight:400">— não são telas</span></h2>
  <table><tr><th>Backend</th><th>Task</th><th>Status</th><th>Evidência / nota</th></tr>
  ${data.backends.map((b) => `<tr><td>${esc(b.title)}</td><td>${esc(b.task)}</td><td>${badge('backend')} ${esc(b.status)}</td><td>${esc(b.evidence)}${b.note ? ` · <span class="muted">${esc(b.note)}</span>` : ''}</td></tr>`).join('\n  ')}
  </table></section>` : '';

const prioBlock = (data.priorities || []).length ? `
  <section id="prioridades"><h2>Prioridades</h2><div class="cards">
  ${data.priorities.map((p) => `<div class="card"><span class="rank">${esc(p.rank)}</span><b>${esc(p.title)}</b> <span class="b s-missing">${esc(p.blocker)}</span><br/><span class="muted">${esc(p.why)}</span></div>`).join('\n  ')}
  </div></section>` : '';

const staleBlock = (data.staleDocs || []).length ? `
  <section id="stale"><h2>Docs stale (${data.staleDocs.length})</h2>
  <details><summary>abrir lista</summary>
  <table><tr><th>Doc</th><th>Diz</th><th>Realidade</th><th>Sev.</th></tr>
  ${data.staleDocs.map((d) => `<tr><td><code>${esc(d.doc)}</code></td><td>${esc(d.says)}</td><td>${esc(d.reality)}</td><td>${esc(d.severity)}</td></tr>`).join('\n  ')}
  </table></details></section>` : '';

const nav = ['<a href="#resumo">Resumo</a>', (data.priorities || []).length ? '<a href="#prioridades">Prioridades</a>' : '',
  ...data.surfaces.map((s) => `<a href="#${esc(s.id)}">${esc(s.name.split(' (')[0])}</a>`),
  (data.backends || []).length ? '<a href="#backends">Backends</a>' : '',
  (data.staleDocs || []).length ? '<a href="#stale">Docs stale</a>' : ''].filter(Boolean).join('');

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Painel do roadmap — ${esc(data.meta.project || 'Projeto')}</title>
<style>
  :root{--marsala:#7E1F22;--marsala-deep:#5C1518;--sage:#84AB45;--cream:#FAF7F2;--ink:#1A1A1F;--muted:#6B655B;--soft:#F4E5E1;--sage-soft:#EAF1D8;--border:rgba(26,26,31,.12);}
  *{box-sizing:border-box;} body{margin:0;font:15px/1.55 'Segoe UI',system-ui,sans-serif;background:var(--cream);color:var(--ink);}
  header{position:sticky;top:0;z-index:10;background:var(--marsala);color:#FFF8EF;padding:14px 28px;box-shadow:0 2px 10px rgba(92,21,24,.25);}
  header h1{margin:0;font-size:19px;} header .sub{opacity:.88;font-size:12.5px;margin-top:3px;}
  nav{position:sticky;top:56px;z-index:9;background:#FFF;border-bottom:1px solid var(--border);padding:8px 28px;display:flex;gap:6px;flex-wrap:wrap;}
  nav a{font-size:12px;font-weight:700;text-decoration:none;color:var(--marsala);background:var(--soft);padding:5px 11px;border-radius:999px;}
  main{max-width:1080px;margin:0 auto;padding:24px 28px 80px;}
  section{background:#FFF;border:1px solid var(--border);border-radius:14px;padding:18px 22px;margin-bottom:18px;box-shadow:0 1px 2px rgba(126,31,34,.05);}
  h2{margin:0 0 12px;font-size:16px;color:var(--marsala-deep);border-left:3px solid var(--sage);padding-left:10px;}
  h3{margin:18px 0 8px;font-size:13.5px;color:var(--marsala);}
  table{width:100%;border-collapse:collapse;font-size:13px;margin:6px 0 4px;}
  th,td{text-align:left;padding:7px 9px;border-bottom:1px solid var(--border);vertical-align:top;}
  th{background:var(--cream);font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);}
  code{background:var(--cream);border:1px solid var(--border);border-radius:5px;padding:1px 5px;font:12px ui-monospace,monospace;color:var(--marsala-deep);}
  .b{display:inline-block;font-size:11px;font-weight:800;padding:2px 7px;border-radius:6px;white-space:nowrap;}
  .s-done{background:#EAF1D8;color:#3f5417;} .s-fe{background:#E5EEF6;color:#1d3b5c;} .s-partial{background:#FBF0D8;color:#6b4e0e;} .s-missing{background:#F4E1DE;color:#7a1f1c;} .s-backend{background:#EDE7DF;color:#5a503f;}
  .muted{color:var(--muted);} .legend{font-size:12px;color:var(--muted);margin-top:8px;}
  .kpi{display:flex;gap:14px;flex-wrap:wrap;margin:4px 0 10px;}
  .kpi div{background:var(--cream);border:1px solid var(--border);border-radius:10px;padding:8px 14px;text-align:center;}
  .kpi b{font-size:22px;display:block;color:var(--marsala-deep);} .kpi span{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;}
  .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;}
  .card{border:1px solid var(--border);border-left:4px solid var(--marsala);border-radius:12px;padding:12px 14px;}
  .card .rank{display:inline-block;background:var(--marsala);color:#fff;font-weight:800;font-size:12px;border-radius:6px;padding:1px 8px;margin-right:6px;}
  details summary{cursor:pointer;font-weight:700;color:var(--marsala);font-size:13px;}
</style>
</head>
<body>
<header>
  <h1>Painel do roadmap — ${esc(data.meta.project || 'Projeto')}</h1>
  <div class="sub">Pronto × falta · gerado de <code style="color:#fff;background:rgba(255,255,255,.15);border:0">painel-data.json</code> em ${esc(data.meta.generatedAt)} · ⚠️ NÃO editar à mão — rode <code style="color:#fff;background:rgba(255,255,255,.15);border:0">node scripts/gen-painel.mjs</code></div>
</header>
<nav>${nav}</nav>
<main>
<section id="resumo"><h2>Resumo</h2>
  <div class="kpi">
    <div><b>${kpi.done}</b><span>done</span></div>
    <div><b>${kpi.fe}</b><span>fe-only</span></div>
    <div><b>${kpi.partial}</b><span>partial</span></div>
    <div><b>${kpi.missing}</b><span>faltando</span></div>
    <div><b>${kpi.backends}</b><span>backends</span></div>
    <div><b>${kpi.stale}</b><span>docs stale</span></div>
  </div>
  <p>${esc(data.summary?.headline || '')}</p>
  <p class="legend">Legenda: ${badge('done')} existe+completa · ${badge('fe-only')} tela ok, backend stub · ${badge('partial')} existe, incompleta · ${badge('missing')} não existe no código · ${badge('backend')} lógica de servidor (não é tela).</p>
</section>
${prioBlock}
${data.surfaces.map(surfaceBlock).join('')}
${backendsBlock}
${staleBlock}
<section><h2>Como este painel se mantém</h2>
  <p class="muted">Este HTML é <b>gerado</b> de <code>docs/roadmap/painel-data.json</code> por <code>scripts/gen-painel.mjs</code> — nunca editado à mão (anti-drift). No fechamento de cada task (skill <code>execute-closure</code>), atualiza-se o JSON e regenera-se o painel; o hook <code>painel-sync-reminder.py</code> lembra. Origem dos dados: auditoria <code>controle/2026-06-08-auditoria/</code>.</p>
</section>
</main>
</body>
</html>
`;

writeFileSync(outUrl, html, 'utf8');
console.log(`PAINEL.html gerado — ${allScreens.length} telas (done ${kpi.done} · fe-only ${kpi.fe} · partial ${kpi.partial} · missing ${kpi.missing}) · backends ${kpi.backends} · stale ${kpi.stale}`);
