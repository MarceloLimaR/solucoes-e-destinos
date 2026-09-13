/* =======================================================================
   widgets.js - Painel ao Vivo do site Solucoes & Destinos
   -----------------------------------------------------------------------
   Fornece 3 blocos automaticos (basta existir a div com o id na pagina):

     <div id="painelRelogios"></div>  -> 5 relogios digitais (estilo aeroporto)
     <div id="painelCambio"></div>    -> cotacoes em reais com grafico
     <div id="radarMundo"></div>      -> noticias em tempo real por pais

   Nenhum dado fica preso no codigo: tudo e buscado ao vivo de fontes
   publicas e gratuitas no momento em que o visitante abre a pagina.
   ======================================================================= */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1) UTILIDADES
     ------------------------------------------------------------------ */
  var LS_CLOCK = 'sd.relogios';
  var LS_MOEDAS = 'sd.moedas';
  var LS_NEWS = 'sd.noticias.';

  function el(id) { return document.getElementById(id); }

  function lsGet(k, def) {
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; }
    catch (e) { return def; }
  }
  function lsSet(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtMoeda(v, dec) {
    if (v == null || !isFinite(v)) return '-';
    return 'R$ ' + Number(v).toLocaleString('pt-BR', {
      minimumFractionDigits: dec == null ? 2 : dec,
      maximumFractionDigits: dec == null ? 2 : dec
    });
  }
  function fmtDataHora(d) {
    try {
      return d.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return ''; }
  }
  function iso(d) { return d.toISOString().slice(0, 10); }

  /* Bandeiras reais (imagens) - funcionam em qualquer aparelho e ajudam
     o visitante a reconhecer visualmente cada pais. Se a imagem nao
     carregar, cai automaticamente para o emoji da bandeira. */
  function bandeira(iso, emoji, classe, alt) {
    cls = arguments[2] || '';
    if (!iso) return '<span class="sd-band-emoji ' + cls + '">' + (emoji || '') + '</span>';
    return '<img class="sd-band ' + cls + '" src="https://flagcdn.com/w80/' + iso + '.png" alt="' + esc(alt || '') + '" loading="lazy">' +
           '<span class="sd-band-emoji ' + cls + '" hidden>' + (emoji || '') + '</span>';
  }
  function marcaDagua(iso) {
    if (!iso) return '';
    return '<img class="sd-wm" src="https://flagcdn.com/w160/' + iso + '.png" alt="" aria-hidden="true" onerror="this.remove()">';
  }
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && t.classList && t.classList.contains('sd-band')) {
      t.style.display = 'none';
      var f = t.nextElementSibling;
      if (f && f.classList && f.classList.contains('sd-band-emoji')) f.hidden = false;
    }
  }, true);
  function duas(n) { return (n < 10 ? '0' : '') + n; }

  /* ------------------------------------------------------------------
     2) ESTILO (injetado automaticamente - nao precisa editar o HTML)
     ------------------------------------------------------------------ */
  var CSS = [
    '.sd-box{max-width:1100px;margin:34px auto;padding:0 20px}',
    '.sd-painel{background:#fff;border:1px solid #f0e6d8;border-radius:16px;padding:20px 20px 22px;box-shadow:0 6px 22px rgba(61,43,31,.08)}',
    '.sd-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:16px}',
    '.sd-top h2{font-family:Georgia,serif;color:#2c1d11;font-size:1.35em;margin:0 0 4px;border-left:6px solid #d97706;padding-left:12px;line-height:1.25}',
    '.sd-sub{color:#6b5240;font-size:.9em;margin:0 0 0 18px;line-height:1.5}',
    '.sd-acoes{display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
    '.sd-btn{min-height:40px;background:#fff;border:2px solid #e7d5bd;color:#5c3a21;border-radius:22px;padding:8px 14px;font-weight:700;font-size:.85em;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:.25s;font-family:inherit}',
    '.sd-btn:hover{border-color:#d97706;color:#b45309;transform:translateY(-1px)}',
    '.sd-btn.round{width:40px;padding:0;justify-content:center;border-radius:50%}',
    '.sd-live{display:inline-flex;align-items:center;gap:6px;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;border-radius:20px;padding:3px 10px;font-size:.72em;font-weight:800;letter-spacing:.6px;text-transform:uppercase}',
    '.sd-live i{width:7px;height:7px;border-radius:50%;background:#10b981;display:inline-block;animation:sd-pisca 1.6s infinite}',
    '@keyframes sd-pisca{0%,100%{opacity:1}50%{opacity:.25}}',
    '.sd-band{width:1.9em;height:auto;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.20);display:inline-block;vertical-align:middle}',
    '.sd-band-emoji{font-size:1.9em;line-height:1;vertical-align:middle}',
    '.sd-band.menor{width:1.15em}.sd-band-emoji.menor{font-size:1.15em}',
    '.sd-band.grande{width:2.3em}.sd-band-emoji.grande{font-size:2.3em}',
    '.sd-wm{position:absolute;right:-16px;bottom:-20px;width:96px;opacity:.12;pointer-events:none;z-index:0;border-radius:6px}',
    '.sd-moeda .sd-wm{width:88px;opacity:.10;right:-14px;bottom:6px}',
    '.sd-pais-band{display:flex;align-items:center;gap:8px;margin:0 0 12px;padding-left:20px;font-weight:800;color:#2c1d11;font-size:1em}',
    '.sd-pais-band small{font-weight:600;color:#8a7561;font-size:.8em}',
    '.sd-n-band{display:inline-flex;align-items:center;gap:5px;background:#f6f1e8;border-radius:8px;padding:2px 7px;font-weight:700;color:#5c3a21}',
    '.sd-clocks{display:grid;grid-template-columns:repeat(auto-fit,minmax(158px,1fr));gap:12px}',
    '.sd-clock{position:relative;overflow:hidden;background:linear-gradient(160deg,#243348,#131c2b);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:14px 10px 12px;text-align:center;color:#e2e8f0}',
    '.sd-clock::after{content:"";position:absolute;inset:0;background:radial-gradient(120% 65% at 50% 0%,rgba(245,158,11,.18),transparent 70%);pointer-events:none}',
    '.sd-clock>*{position:relative;z-index:1}',
    '.sd-flag{font-size:1.35em;line-height:1}',
    '.sd-city{display:block;margin-top:5px;font-size:.7em;letter-spacing:1.4px;text-transform:uppercase;font-weight:800;color:#9fb0c6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.sd-hora{font-family:"Courier New",ui-monospace,monospace;font-size:2em;font-weight:700;color:#fbbf24;letter-spacing:1px;line-height:1.2;margin-top:6px;font-variant-numeric:tabular-nums;text-shadow:0 0 16px rgba(251,191,36,.35)}',
    '.sd-data{font-size:.74em;color:#a9b6c8}',
    '.sd-diff{display:inline-block;margin-top:8px;font-size:.68em;font-weight:800;padding:3px 9px;border-radius:10px;background:rgba(251,191,36,.14);color:#fbbf24;border:1px solid rgba(251,191,36,.32)}',
    '.sd-pais{font-size:.68em;color:#8494a8;margin-top:6px}',
    '.sd-nota{margin:14px 0 0;font-size:.78em;color:#8a7561;line-height:1.5}',
    '.sd-moedas{display:grid;grid-template-columns:repeat(auto-fit,minmax(232px,1fr));gap:14px}',
    '.sd-moeda{position:relative;overflow:hidden;background:linear-gradient(160deg,#fffdf9,#fff5e6);border:1px solid #f3e3cd;border-radius:14px;padding:15px 16px 8px;cursor:pointer;transition:.25s}',
    '.sd-moeda:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(180,83,9,.14);border-color:#d97706}',
    '.sd-moeda-top{display:flex;align-items:center;gap:7px;flex-wrap:wrap}',
    '.sd-mflag{font-size:1.25em;line-height:1}',
    '.sd-mcod{font-weight:800;color:#2c1d11;letter-spacing:.6px;font-size:.95em}',
    '.sd-mnome{font-size:.78em;color:#6b5240}',
    '.sd-mvalor{font-size:1.75em;font-weight:800;color:#b45309;font-variant-numeric:tabular-nums;margin:6px 0 0;line-height:1.15}',
    '.sd-mun{font-size:.72em;color:#9a8266;font-weight:600}',
    '.sd-mvar{font-size:.82em;font-weight:800;margin-top:4px}',
    '.sd-mvar.up{color:#15803d}',
    '.sd-mvar.down{color:#b91c1c}',
    '.sd-mvar.flat{color:#6b5240}',
    '.sd-spark{margin-top:6px;height:46px}',
    '.sd-spark svg{width:100%;height:46px;display:block}',
    '.sd-hint{font-size:.7em;color:#a8927a;text-align:right;margin:2px 0 6px}',
    '.sd-tabs{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 10px;scrollbar-width:thin}',
    '.sd-tab{white-space:nowrap;background:#fff;border:2px solid #e7d5bd;color:#5c3a21;border-radius:22px;padding:8px 15px;font-weight:700;font-size:.87em;cursor:pointer;transition:.2s;font-family:inherit;display:inline-flex;align-items:center;gap:6px}',
    '.sd-tab:hover{border-color:#d97706}',
    '.sd-tab.ativo{background:#2c1d11;color:#f59e0b;border-color:#d97706}',
    '.sd-lista{display:flex;flex-direction:column;gap:9px;min-height:120px}',
    '.sd-noticia{display:block;text-decoration:none;background:#fffdf9;border:1px solid #f0e6d8;border-left:4px solid #d97706;border-radius:10px;padding:12px 14px;transition:.2s}',
    '.sd-noticia:hover{background:#fff5e6;border-left-color:#b45309;transform:translateX(3px)}',
    '.sd-n-titulo{display:block;color:#2c1d11;font-weight:600;font-size:.96em;line-height:1.45}',
    '.sd-n-meta{margin-top:6px;font-size:.75em;color:#8a7561;display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
    '.sd-n-fonte{background:#fef3c7;color:#92400e;border-radius:8px;padding:1px 7px;font-weight:700;font-size:.95em}',
    '.sd-novidade{background:#dcfce7;color:#166534;border-radius:8px;padding:1px 7px;font-weight:800;font-size:.9em}',
    '.sd-skeleton{background:linear-gradient(90deg,#f5ece0,#fdf7ef,#f5ece0);background-size:200% 100%;animation:sd-load 1.3s infinite;border-radius:10px;height:56px}',
    '@keyframes sd-load{0%{background-position:200% 0}100%{background-position:-200% 0}}',
    '.sd-vazio{color:#8a7561;font-size:.9em;padding:10px 0;line-height:1.6}',
    '.sd-rodape{margin-top:16px;padding-top:14px;border-top:1px dashed #e7d5bd;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:.78em;color:#8a7561}',
    '.sd-link{color:#b45309;font-weight:700;text-decoration:none}',
    '.sd-link:hover{text-decoration:underline}',
    '.sd-overlay{position:fixed;inset:0;background:rgba(28,18,10,.62);z-index:5000;display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto}',
    '.sd-modal{background:#fffaf3;border-radius:16px;max-width:620px;width:100%;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.35);border:1px solid #f0e6d8}',
    '.sd-modal-top{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:18px 20px 12px;border-bottom:1px solid #f0e6d8}',
    '.sd-modal-top h3{font-family:Georgia,serif;color:#2c1d11;font-size:1.15em;margin:0}',
    '.sd-x{background:none;border:none;font-size:1.4em;color:#8a7561;cursor:pointer;line-height:1}',
    '.sd-x:hover{color:#b45309}',
    '.sd-modal-body{padding:16px 20px 20px;overflow:auto}',
    '.sd-modal-body p{color:#6b5240;font-size:.9em;line-height:1.6;margin:0 0 12px}',
    '.sd-chips{display:flex;flex-wrap:wrap;gap:8px}',
    '.sd-chip{background:#fff;border:2px solid #e7d5bd;color:#5c3a21;border-radius:20px;padding:8px 13px;font-size:.86em;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:inherit;transition:.2s}',
    '.sd-chip:hover{border-color:#d97706}',
    '.sd-chip.ativo{background:#2c1d11;color:#f59e0b;border-color:#d97706}',
    '.sd-busca{width:100%;padding:11px 14px;border:2px solid #e7d5bd;border-radius:10px;font-size:.95em;margin-bottom:12px;font-family:inherit;color:#2c1d11}',
    '.sd-busca:focus{outline:none;border-color:#d97706}',
    '.sd-lista-moedas{max-height:46vh;overflow:auto;border:1px solid #f0e6d8;border-radius:10px}',
    '.sd-linha{display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid #f7efe3;font-size:.9em}',
    '.sd-linha:last-child{border-bottom:none}',
    '.sd-linha .sd-lc{font-weight:800;color:#2c1d11;width:52px;flex:0 0 52px}',
    '.sd-linha .sd-ln{flex:1;color:#6b5240;font-size:.9em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.sd-linha .sd-lv{font-weight:800;color:#b45309;font-variant-numeric:tabular-nums}',
    '.sd-slot{background:#fff;border:1px solid #e7d5bd;color:#5c3a21;border-radius:6px;width:26px;height:26px;font-size:.75em;font-weight:800;cursor:pointer;flex:0 0 26px}',
    '.sd-slot:hover{background:#2c1d11;color:#f59e0b;border-color:#d97706}',
    '.sd-grafico{width:100%;height:190px;display:block}',
    '.sd-stats{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}',
    '.sd-stat{flex:1;min-width:110px;background:#fff6e8;border:1px solid #f3e3cd;border-radius:10px;padding:10px 12px}',
    '.sd-stat span{display:block;font-size:.72em;color:#8a7561;text-transform:uppercase;letter-spacing:.5px;font-weight:700}',
    '.sd-stat b{font-size:1.05em;color:#2c1d11;font-variant-numeric:tabular-nums}',
    '.sd-seg{display:flex;gap:6px;margin:10px 0}',
    '.sd-seg button{flex:1;border:2px solid #e7d5bd;background:#fff;color:#5c3a21;border-radius:10px;padding:7px;font-weight:700;font-size:.82em;cursor:pointer;font-family:inherit}',
    '.sd-seg button.ativo{background:#2c1d11;color:#f59e0b;border-color:#d97706}',
    '@media (max-width:600px){.sd-hora{font-size:1.7em}.sd-painel{padding:16px 14px 18px}.sd-top h2{font-size:1.15em}}'
  ].join('\n');

  var tag = document.createElement('style');
  tag.setAttribute('data-widgets', 'solucoes-e-destinos');
  tag.textContent = CSS;
  document.head.appendChild(tag);

  /* ------------------------------------------------------------------
     3) MODAL GENERICO
     ------------------------------------------------------------------ */
  function abrirModal(titulo, html) {
    var ov = document.createElement('div');
    ov.className = 'sd-overlay';
    ov.innerHTML =
      '<div class="sd-modal" role="dialog" aria-modal="true" aria-label="' + esc(titulo) + '">' +
        '<div class="sd-modal-top"><h3>' + titulo + '</h3>' +
        '<button class="sd-x" aria-label="Fechar">&#10005;</button></div>' +
        '<div class="sd-modal-body">' + html + '</div>' +
      '</div>';
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    function fechar() {
      ov.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', escKey);
    }
    function escKey(e) { if (e.key === 'Escape') fechar(); }
    ov.addEventListener('click', function (e) {
      if (e.target === ov || (e.target.closest && e.target.closest('.sd-x'))) fechar();
    });
    document.addEventListener('keydown', escKey);
    return { box: ov, corpo: ov.querySelector('.sd-modal-body'), fechar: fechar };
  }

  /* ==================================================================
     BLOCO 1 - RELOGIOS MUNDIAIS (estilo painel de aeroporto)
     ================================================================== */
  var CIDADES = [
    { id: 'sao', n: 'São Paulo', p: 'Brasil', tz: 'America/Sao_Paulo', f: '\uD83C\uDDE7\uD83C\uDDF7' , iso: 'br' },
    { id: 'nyc', n: 'Nova York', p: 'Estados Unidos', tz: 'America/New_York', f: '\uD83C\uDDFA\uD83C\uDDF8' , iso: 'us' },
    { id: 'lon', n: 'Londres', p: 'Reino Unido', tz: 'Europe/London', f: '\uD83C\uDDEC\uD83C\uDDE7' , iso: 'gb' },
    { id: 'par', n: 'Paris', p: 'França', tz: 'Europe/Paris', f: '\uD83C\uDDEB\uD83C\uDDF7' , iso: 'fr' },
    { id: 'tok', n: 'Tóquio', p: 'Japão', tz: 'Asia/Tokyo', f: '\uD83C\uDDEF\uD83C\uDDF5' , iso: 'jp' },
    { id: 'lis', n: 'Lisboa', p: 'Portugal', tz: 'Europe/Lisbon', f: '\uD83C\uDDF5\uD83C\uDDF9' , iso: 'pt' },
    { id: 'mad', n: 'Madri', p: 'Espanha', tz: 'Europe/Madrid', f: '\uD83C\uDDEA\uD83C\uDDF8' , iso: 'es' },
    { id: 'rom', n: 'Roma', p: 'Itália', tz: 'Europe/Rome', f: '\uD83C\uDDEE\uD83C\uDDF9' , iso: 'it' },
    { id: 'ber', n: 'Berlim', p: 'Alemanha', tz: 'Europe/Berlin', f: '\uD83C\uDDE9\uD83C\uDDEA' , iso: 'de' },
    { id: 'ams', n: 'Amsterdã', p: 'Holanda', tz: 'Europe/Amsterdam', f: '\uD83C\uDDF3\uD83C\uDDF1' , iso: 'nl' },
    { id: 'zur', n: 'Zurique', p: 'Suíça', tz: 'Europe/Zurich', f: '\uD83C\uDDE8\uD83C\uDDED' , iso: 'ch' },
    { id: 'vie', n: 'Viena', p: 'Áustria', tz: 'Europe/Vienna', f: '\uD83C\uDDE6\uD83C\uDDF9' , iso: 'at' },
    { id: 'pra', n: 'Praga', p: 'Rep. Tcheca', tz: 'Europe/Prague', f: '\uD83C\uDDE8\uD83C\uDDFF' , iso: 'cz' },
    { id: 'bud', n: 'Budapeste', p: 'Hungria', tz: 'Europe/Budapest', f: '\uD83C\uDDED\uD83C\uDDFA' , iso: 'hu' },
    { id: 'ath', n: 'Atenas', p: 'Grécia', tz: 'Europe/Athens', f: '\uD83C\uDDEC\uD83C\uDDF7' , iso: 'gr' },
    { id: 'ist', n: 'Istambul', p: 'Turquia', tz: 'Europe/Istanbul', f: '\uD83C\uDDF9\uD83C\uDDF7' , iso: 'tr' },
    { id: 'mow', n: 'Moscou', p: 'Rússia', tz: 'Europe/Moscow', f: '\uD83C\uDDF7\uD83C\uDDFA' , iso: 'ru' },
    { id: 'osl', n: 'Oslo', p: 'Noruega', tz: 'Europe/Oslo', f: '\uD83C\uDDF3\uD83C\uDDF4' , iso: 'no' },
    { id: 'sto', n: 'Estocolmo', p: 'Suécia', tz: 'Europe/Stockholm', f: '\uD83C\uDDF8\uD83C\uDDEA' , iso: 'se' },
    { id: 'cph', n: 'Copenhague', p: 'Dinamarca', tz: 'Europe/Copenhagen', f: '\uD83C\uDDE9\uD83C\uDDF0' , iso: 'dk' },
    { id: 'dub', n: 'Dublin', p: 'Irlanda', tz: 'Europe/Dublin', f: '\uD83C\uDDEE\uD83C\uDDEA' , iso: 'ie' },
    { id: 'rey', n: 'Reykjavik', p: 'Islândia', tz: 'Atlantic/Reykjavik', f: '\uD83C\uDDEE\uD83C\uDDF8' , iso: 'is' },
    { id: 'ljb', n: 'Liubliana', p: 'Eslovênia', tz: 'Europe/Ljubljana', f: '\uD83C\uDDF8\uD83C\uDDEE' , iso: 'si' },
    { id: 'zag', n: 'Zagreb', p: 'Croácia', tz: 'Europe/Zagreb', f: '\uD83C\uDDED\uD83C\uDDF7' , iso: 'hr' },
    { id: 'kot', n: 'Kotor', p: 'Montenegro', tz: 'Europe/Podgorica', f: '\uD83C\uDDF2\uD83C\uDDEA' , iso: 'me' },
    { id: 'tlv', n: 'Tel Aviv', p: 'Israel', tz: 'Asia/Jerusalem', f: '\uD83C\uDDEE\uD83C\uDDF1' , iso: 'il' },
    { id: 'dxb', n: 'Dubai', p: 'Emirados Arabes', tz: 'Asia/Dubai', f: '\uD83C\uDDE6\uD83C\uDDEA' , iso: 'ae' },
    { id: 'doh', n: 'Doha', p: 'Catar', tz: 'Asia/Qatar', f: '\uD83C\uDDF6\uD83C\uDDE6' , iso: 'qa' },
    { id: 'ruh', n: 'Riade', p: 'Arábia Saudita', tz: 'Asia/Riyadh', f: '\uD83C\uDDF8\uD83C\uDDE6' , iso: 'sa' },
    { id: 'cai', n: 'Cairo', p: 'Egito', tz: 'Africa/Cairo', f: '\uD83C\uDDEA\uD83C\uDDEC' , iso: 'eg' },
    { id: 'cas', n: 'Casablanca', p: 'Marrocos', tz: 'Africa/Casablanca', f: '\uD83C\uDDF2\uD83C\uDDE6' , iso: 'ma' },
    { id: 'jnb', n: 'Joanesburgo', p: 'África do Sul', tz: 'Africa/Johannesburg', f: '\uD83C\uDDFF\uD83C\uDDE6' , iso: 'za' },
    { id: 'pek', n: 'Pequim', p: 'China', tz: 'Asia/Shanghai', f: '\uD83C\uDDE8\uD83C\uDDF3' , iso: 'cn' },
    { id: 'hkg', n: 'Hong Kong', p: 'China', tz: 'Asia/Hong_Kong', f: '\uD83C\uDDED\uD83C\uDDF0' , iso: 'hk' },
    { id: 'sin', n: 'Singapura', p: 'Singapura', tz: 'Asia/Singapore', f: '\uD83C\uDDF8\uD83C\uDDEC' , iso: 'sg' },
    { id: 'bkk', n: 'Bangkok', p: 'Tailândia', tz: 'Asia/Bangkok', f: '\uD83C\uDDF9\uD83C\uDDED' , iso: 'th' },
    { id: 'sel', n: 'Seul', p: 'Coreia do Sul', tz: 'Asia/Seoul', f: '\uD83C\uDDF0\uD83C\uDDF7' , iso: 'kr' },
    { id: 'del', n: 'Nova Déli', p: 'Índia', tz: 'Asia/Kolkata', f: '\uD83C\uDDEE\uD83C\uDDF3' , iso: 'in' },
    { id: 'syd', n: 'Sydney', p: 'Austrália', tz: 'Australia/Sydney', f: '\uD83C\uDDE6\uD83C\uDDFA' , iso: 'au' },
    { id: 'akl', n: 'Auckland', p: 'Nova Zelândia', tz: 'Pacific/Auckland', f: '\uD83C\uDDF3\uD83C\uDDFF' , iso: 'nz' },
    { id: 'lax', n: 'Los Angeles', p: 'Estados Unidos', tz: 'America/Los_Angeles', f: '\uD83C\uDDFA\uD83C\uDDF8' , iso: 'us' },
    { id: 'chi', n: 'Chicago', p: 'Estados Unidos', tz: 'America/Chicago', f: '\uD83C\uDDFA\uD83C\uDDF8' , iso: 'us' },
    { id: 'mia', n: 'Miami', p: 'Estados Unidos', tz: 'America/New_York', f: '\uD83C\uDDFA\uD83C\uDDF8' , iso: 'us' },
    { id: 'tor', n: 'Toronto', p: 'Canadá', tz: 'America/Toronto', f: '\uD83C\uDDE8\uD83C\uDDE6' , iso: 'ca' },
    { id: 'mex', n: 'Cidade do México', p: 'México', tz: 'America/Mexico_City', f: '\uD83C\uDDF2\uD83C\uDDFD' , iso: 'mx' },
    { id: 'bog', n: 'Bogotá', p: 'Colômbia', tz: 'America/Bogota', f: '\uD83C\uDDE8\uD83C\uDDF4' , iso: 'co' },
    { id: 'lim', n: 'Lima', p: 'Peru', tz: 'America/Lima', f: '\uD83C\uDDF5\uD83C\uDDEA' , iso: 'pe' },
    { id: 'eze', n: 'Buenos Aires', p: 'Argentina', tz: 'America/Argentina/Buenos_Aires', f: '\uD83C\uDDE6\uD83C\uDDF7' , iso: 'ar' },
    { id: 'scl', n: 'Santiago', p: 'Chile', tz: 'America/Santiago', f: '\uD83C\uDDE8\uD83C\uDDF1' , iso: 'cl' },
    { id: 'mvd', n: 'Montevideu', p: 'Uruguai', tz: 'America/Montevideo', f: '\uD83C\uDDFA\uD83C\uDDFE' , iso: 'uy' },
    { id: 'asr', n: 'Assunção', p: 'Paraguai', tz: 'America/Asuncion', f: '\uD83C\uDDF5\uD83C\uDDFE' , iso: 'py' },
    { id: 'bhi', n: 'Bariloche', p: 'Argentina', tz: 'America/Argentina/Salta', f: '\uD83C\uDFD4\uFE0F' , iso: 'ar' },
    { id: 'hon', n: 'Honolulu', p: 'Havaí (EUA)', tz: 'Pacific/Honolulu', f: '\uD83C\uDF3A' , iso: 'us' }
  ];
  var PADRAO_CLOCK = ['sao', 'nyc', 'lon', 'par', 'tok'];

  function cidadePorId(id) {
    for (var i = 0; i < CIDADES.length; i++) if (CIDADES[i].id === id) return CIDADES[i];
    return null;
  }
  function tzPartes(tz, data) {
    var dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false, year: 'numeric', month: '2-digit',
      day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    var p = {};
    dtf.formatToParts(data).forEach(function (o) { p[o.type] = o.value; });
    var h = parseInt(p.hour, 10); if (h === 24) h = 0;
    return { y: +p.year, m: +p.month, d: +p.day, hh: h, mm: +p.minute, ss: +p.second };
  }
  function tzOffsetMin(tz, data) {
    var p = tzPartes(tz, data);
    var utc = Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mm, p.ss);
    return Math.round((utc - (data.getTime() - data.getMilliseconds())) / 60000);
  }

  function montarRelogios(box) {
    var salvo = lsGet(LS_CLOCK, PADRAO_CLOCK) || [];
    var ativos = [];
    salvo.forEach(function (id) { var c = cidadePorId(id); if (c) ativos.push(c); });
    if (ativos.length < 5) ativos = PADRAO_CLOCK.map(cidadePorId);

    box.className = 'sd-box';
    box.innerHTML =
      '<div class="sd-painel">' +
        '<div class="sd-top">' +
          '<div>' +
            '<h2>&#128339; Hora Certa no Mundo</h2>' +
            '<p class="sd-sub">Painel igual ao dos aeroportos: veja que horas são agora nos lugares que você quer conhecer.</p>' +
          '</div>' +
          '<div class="sd-acoes">' +
            '<span class="sd-live"><i></i>ao vivo</span>' +
            '<button class="sd-btn round" id="sdCfgClock" title="Escolher as cidades" aria-label="Escolher as cidades">&#9881;&#65039;</button>' +
          '</div>' +
        '</div>' +
        '<div class="sd-clocks" id="sdClocks"></div>' +
        '<p class="sd-nota">&#9201;&#65039; Horas exatas calculadas no seu navegador e atualizadas a cada segundo. ' +
        'Toque na engrenagem para trocar as cidades - a sua escolha fica salva neste navegador.</p>' +
      '</div>';

    var grade = el('sdClocks');

    function pintar() {
      var agora = new Date();
      var offBrasilia = tzOffsetMin('America/Sao_Paulo', agora);
      grade.innerHTML = ativos.map(function (c) {
        var p = tzPartes(c.tz, agora);
        var diff = Math.round((tzOffsetMin(c.tz, agora) - offBrasilia) / 60);
        var sinal = diff > 0 ? '+' + diff + 'h' : (diff === 0 ? 'hora de Brasília' : diff + 'h');
        var d = new Date(Date.UTC(p.y, p.m - 1, p.d, 12));
        var txtData = '';
        try {
          txtData = d.toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'short', day: '2-digit', month: '2-digit' }).replace(/\./g, '');
        } catch (e) { txtData = duas(p.d) + '/' + duas(p.m); }
        return '<div class="sd-clock">' + marcaDagua(c.iso) +
          '<div class="sd-flag">' + bandeira(c.iso, c.f, 'grande', 'Bandeira de ' + c.p) + '</div>' +
          '<span class="sd-city">' + esc(c.n) + '</span>' +
          '<div class="sd-hora">' + duas(p.hh) + ':' + duas(p.mm) + ':' + duas(p.ss) + '</div>' +
          '<div class="sd-data">' + esc(txtData) + '</div>' +
          '<span class="sd-diff">' + sinal + ' vs Brasília</span>' +
          '<div class="sd-pais">' + esc(c.p) + '</div>' +
        '</div>';
      }).join('');
    }
    pintar();
    setInterval(pintar, 1000);

    el('sdCfgClock').addEventListener('click', function () {
      var m = abrirModal('&#9881;&#65039; Escolher 5 cidades',
        '<p>Toque para marcar ou desmarcar. Máximo de <b>5 relógios</b> — do jeito dos painéis de aeroporto. ' +
        'A escolha fica salva e aparece igual quando você voltar.</p>' +
        '<div class="sd-chips" id="sdChipsCities">' +
          CIDADES.map(function (c) {
            var on = false;
            ativos.forEach(function (a) { if (a.id === c.id) on = true; });
            return '<button class="sd-chip' + (on ? ' ativo' : '') + '" data-cid="' + c.id + '">' +
              bandeira(c.iso, c.f, 'menor', 'Bandeira de ' + c.p) + ' ' + esc(c.n) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="sd-seg" style="margin-top:16px">' +
          '<button id="sdClockPadrao">Restaurar cidades mais usadas</button>' +
        '</div>');

      m.corpo.querySelector('#sdChipsCities').addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.sd-chip') : null;
        if (!b) return;
        var id = b.getAttribute('data-cid');
        var ja = false;
        ativos.forEach(function (a) { if (a.id === id) ja = true; });
        if (ja) {
          if (ativos.length <= 1) return;
          ativos = ativos.filter(function (a) { return a.id !== id; });
        } else {
          if (ativos.length >= 5) { alert('Máximo de 5 relógios. Desmarque uma cidade para incluir outra.'); return; }
          ativos.push(cidadePorId(id));
        }
        lsSet(LS_CLOCK, ativos.map(function (a) { return a.id; }));
        b.classList.toggle('ativo');
        pintar();
      });

      m.corpo.querySelector('#sdClockPadrao').addEventListener('click', function () {
        ativos = PADRAO_CLOCK.map(cidadePorId);
        lsSet(LS_CLOCK, PADRAO_CLOCK);
        var chips = m.corpo.querySelectorAll('.sd-chip');
        for (var i = 0; i < chips.length; i++) {
          var idc = chips[i].getAttribute('data-cid');
          if (PADRAO_CLOCK.indexOf(idc) >= 0) chips[i].classList.add('ativo');
          else chips[i].classList.remove('ativo');
        }
        pintar();
      });
    });
  }

  /* ==================================================================
     BLOCO 2 - COTACAO DAS MOEDAS (em reais) COM GRAFICO
     ================================================================== */
  var NOMES_MOEDAS = {
    USD: ['Dólar Americano', '\uD83C\uDDFA\uD83C\uDDF8', 'us'], EUR: ['Euro', '\uD83C\uDDEA\uD83C\uDDFA', 'eu'],
    CHF: ['Franco Suíço', '\uD83C\uDDE8\uD83C\uDDED', 'ch'], GBP: ['Libra Esterlina', '\uD83C\uDDEC\uD83C\uDDE7', 'gb'],
    ARS: ['Peso Argentino', '\uD83C\uDDE6\uD83C\uDDF7', 'ar'], CLP: ['Peso Chileno', '\uD83C\uDDE8\uD83C\uDDF1', 'cl'],
    UYU: ['Peso Uruguaio', '\uD83C\uDDFA\uD83C\uDDFE', 'uy'], PYG: ['Guarani Paraguaio', '\uD83C\uDDF5\uD83C\uDDFE', 'py'],
    BOB: ['Boliviano', '\uD83C\uDDE7\uD83C\uDDF4', 'bo'], COP: ['Peso Colombiano', '\uD83C\uDDE8\uD83C\uDDF4', 'co'],
    PEN: ['Sol Peruano', '\uD83C\uDDF5\uD83C\uDDEA', 'pe'], MXN: ['Peso Mexicano', '\uD83C\uDDF2\uD83C\uDDFD', 'mx'],
    CAD: ['Dólar Canadense', '\uD83C\uDDE8\uD83C\uDDE6', 'ca'], JPY: ['Iene Japonês', '\uD83C\uDDEF\uD83C\uDDF5', 'jp'],
    CNY: ['Yuan Chinês', '\uD83C\uDDE8\uD83C\uDDF3', 'cn'], ILS: ['Novo Shekel (Israel)', '\uD83C\uDDEE\uD83C\uDDF1', 'il'],
    RUB: ['Rublo Russo', '\uD83C\uDDF7\uD83C\uDDFA', 'ru'], TRY: ['Lira Turca', '\uD83C\uDDF9\uD83C\uDDF7', 'tr'],
    AUD: ['Dólar Australiano', '\uD83C\uDDE6\uD83C\uDDFA', 'au'], NZD: ['Dólar Neozelandês', '\uD83C\uDDF3\uD83C\uDDFF', 'nz'],
    SEK: ['Coroa Sueca', '\uD83C\uDDF8\uD83C\uDDEA', 'se'], NOK: ['Coroa Norueguesa', '\uD83C\uDDF3\uD83C\uDDF4', 'no'],
    DKK: ['Coroa Dinamarquesa', '\uD83C\uDDE9\uD83C\uDDF0', 'dk'], ISK: ['Coroa Islandesa', '\uD83C\uDDEE\uD83C\uDDF8', 'is'],
    PLN: ['Zloti Polonês', '\uD83C\uDDF5\uD83C\uDDF1', 'pl'], CZK: ['Coroa Tcheca', '\uD83C\uDDE8\uD83C\uDDFF', 'cz'],
    HUF: ['Florim Húngaro', '\uD83C\uDDED\uD83C\uDDFA', 'hu'], RON: ['Leu Romeno', '\uD83C\uDDF7\uD83C\uDDF4', 'ro'],
    BGN: ['Lev Búlgaro', '\uD83C\uDDE7\uD83C\uDDEC', 'bg'], UAH: ['Hryvnia Ucraniana', '\uD83C\uDDFA\uD83C\uDDE6', 'ua'],
    INR: ['Rupia Indiana', '\uD83C\uDDEE\uD83C\uDDF3', 'in'], KRW: ['Won Sul-Coreano', '\uD83C\uDDF0\uD83C\uDDF7', 'kr'],
    SGD: ['Dólar de Singapura', '\uD83C\uDDF8\uD83C\uDDEC', 'sg'], HKD: ['Dólar de Hong Kong', '\uD83C\uDDED\uD83C\uDDF0', 'hk'],
    THB: ['Baht Tailandês', '\uD83C\uDDF9\uD83C\uDDED', 'th'], MYR: ['Ringgit Malaio', '\uD83C\uDDF2\uD83C\uDDFE', 'my'],
    IDR: ['Rupia Indonésia', '\uD83C\uDDEE\uD83C\uDDE9', 'id'], PHP: ['Peso Filipino', '\uD83C\uDDF5\uD83C\uDDED', 'ph'],
    VND: ['Dong Vietnamita', '\uD83C\uDDFB\uD83C\uDDF3', 'vn'], ZAR: ['Rand Sul-Africano', '\uD83C\uDDFF\uD83C\uDDE6', 'za'],
    EGP: ['Libra Egípcia', '\uD83C\uDDEA\uD83C\uDDEC', 'eg'], MAD: ['Dirham Marroquino', '\uD83C\uDDF2\uD83C\uDDE6', 'ma'],
    AED: ['Dirham dos Emirados', '\uD83C\uDDE6\uD83C\uDDEA', 'ae'], SAR: ['Rial Saudita', '\uD83C\uDDF8\uD83C\uDDE6', 'sa'],
    QAR: ['Rial Catariano', '\uD83C\uDDF6\uD83C\uDDE6', 'qa'], JOD: ['Dinar Jordaniano', '\uD83C\uDDEF\uD83C\uDDF4', 'jo'],
    LBP: ['Libra Libanesa', '\uD83C\uDDF1\uD83C\uDDE7', 'lb'], NGN: ['Naira Nigeriana', '\uD83C\uDDF3\uD83C\uDDEC', 'ng'],
    KES: ['Xelim Queniano', '\uD83C\uDDF0\uD83C\uDDEA', 'ke'], PKR: ['Rupia Paquistanesa', '\uD83C\uDDF5\uD83C\uDDF0', 'pk'],
    BRL: ['Real Brasileiro', '\uD83C\uDDE7\uD83C\uDDF7', 'br'], BTC: ['Bitcoin', '₿', ''],
    XAU: ['Ouro (onça)', '\uD83E\uDD47', ''], XAG: ['Prata (onça)', '\uD83E\uDD48', ''],
    XPF: ['Franco CFP', '\uD83C\uDDEB\uD83C\uDDF5', 'pf'], RSD: ['Dinar Sérvio', '\uD83C\uDDF7\uD83C\uDDF8', 'rs'],
    ALL: ['Lek Albanês', '\uD83C\uDDE6\uD83C\uDDF1', 'al'], MKD: ['Denar Macédonio', '\uD83C\uDDF2\uD83C\uDDF0', 'mk'],
    BAM: ['Marco Bósnio', '\uD83C\uDDE7\uD83C\uDDE6', 'ba'], GEL: ['Lari Georgiano', '\uD83C\uDDEC\uD83C\uDDEA', 'ge'],
    AMD: ['Dram Armênio', '\uD83C\uDDE6\uD83C\uDDF2', 'am'], AZN: ['Manat Azeri', '\uD83C\uDDE6\uD83C\uDDFF', 'az'],
    KZT: ['Tengue Cazaque', '\uD83C\uDDF0\uD83C\uDDFF', 'kz'], TWD: ['Dólar Taiwanês', '\uD83C\uDDF9\uD83C\uDDFC', 'tw'],
    CRC: ['Colón Costarriquenho', '\uD83C\uDDE8\uD83C\uDDF7', 'cr'], DOP: ['Peso Dominicano', '\uD83C\uDDE9\uD83C\uDDF4', 'do'],
    GTQ: ['Quetzal Guatemalteco', '\uD83C\uDDEC\uD83C\uDDF9', 'gt'], CUP: ['Peso Cubano', '\uD83C\uDDE8\uD83C\uDDFA', 'cu']
  };
  var PADRAO_MOEDAS = ['USD', 'EUR', 'CHF'];
  var FRANKFURTER_OK = ['AUD', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD',
    'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN',
    'RON', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR'];

  function infoMoeda(c) {
    var i = NOMES_MOEDAS[c];
    return { nome: i ? i[0] : c, flag: i ? i[1] : '\uD83D\uDCB1', iso: i ? i[2] : '' };
  }

  /* Todas as cotacoes de uma vez (fonte publica, atualizada diariamente) */
  function buscarCotacoes() {
    return fetch('https://open.er-api.com/v6/latest/BRL')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || d.result !== 'success' || !d.rates) throw new Error('cotacoes indisponiveis');
        var out = {};
        Object.keys(d.rates).forEach(function (c) {
          if (d.rates[c] > 0) out[c] = 1 / d.rates[c];
        });
        return { valores: out, data: new Date((d.time_last_update_unix || 0) * 1000) };
      });
  }

  /* Serie historica em reais (fonte: Banco Central Europeu via Frankfurter) */
  function buscarSerie(cod, dias) {
    if (FRANKFURTER_OK.indexOf(cod) < 0) return Promise.reject(new Error('sem historico'));
    var fim = new Date();
    var ini = new Date(Date.now() - dias * 86400000);
    var url = 'https://api.frankfurter.dev/v1/' + iso(ini) + '..' + iso(fim) + '?base=BRL&symbols=' + cod;
    return fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      var pts = [];
      var chaves = Object.keys(d.rates || {}).sort();
      chaves.forEach(function (k) {
        var v = d.rates[k] && d.rates[k][cod];
        if (v > 0) pts.push({ d: k, v: 1 / v });
      });
      if (pts.length < 2) throw new Error('sem historico');
      return pts;
    });
  }

  /* Desenha o grafico em SVG (linha + area + ultimo ponto) */
  var seqGrafico = 0;
  function graficoSVG(pts, altura, cor) {
    if (!pts || pts.length < 2) return '';
    seqGrafico++;
    var W = 300, H = altura || 46, pad = 4;
    var vs = pts.map(function (p) { return p.v; });
    var min = Math.min.apply(null, vs), max = Math.max.apply(null, vs);
    var span = (max - min) || (max || 1) * 0.01;
    var corLinha = cor || '#d97706';
    var idG = 'sdg' + seqGrafico;
    var coords = pts.map(function (p, i) {
      var x = pad + (i / (pts.length - 1)) * (W - pad * 2);
      var y = H - pad - ((p.v - min) / span) * (H - pad * 2);
      return [x, y];
    });
    var linha = coords.map(function (c) { return c[0].toFixed(1) + ',' + c[1].toFixed(1); }).join(' ');
    var area = 'M' + coords[0][0].toFixed(1) + ',' + (H - 1) +
      coords.map(function (c) { return 'L' + c[0].toFixed(1) + ',' + c[1].toFixed(1); }).join('') +
      'L' + coords[coords.length - 1][0].toFixed(1) + ',' + (H - 1) + 'Z';
    var ult = coords[coords.length - 1];
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" style="width:100%;height:' + H + 'px;display:block" aria-hidden="true">' +
      '<defs><linearGradient id="' + idG + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + corLinha + '" stop-opacity=".35"/>' +
      '<stop offset="100%" stop-color="' + corLinha + '" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#' + idG + ')"/>' +
      '<polyline points="' + linha + '" fill="none" stroke="' + corLinha + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="' + ult[0].toFixed(1) + '" cy="' + ult[1].toFixed(1) + '" r="3" fill="' + corLinha + '"/>' +
    '</svg>';
  }

  function variacao(pts) {
    if (!pts || pts.length < 2) return null;
    var a = pts[0].v, b = pts[pts.length - 1].v;
    if (!a) return null;
    return ((b - a) / a) * 100;
  }
  function classeVar(pct) {
    if (pct == null || Math.abs(pct) < 0.05) return 'flat';
    return pct > 0 ? 'up' : 'down';
  }
  function setaVar(pct) {
    if (pct == null || Math.abs(pct) < 0.05) return '=';
    return pct > 0 ? '\u25B2' : '\u25BC';
  }

  function montarCambio(box) {
    var ativos = lsGet(LS_MOEDAS, PADRAO_MOEDAS) || [];
    if (!ativos.length) ativos = PADRAO_MOEDAS.slice();
    var dados = null;
    var series = {};

    box.className = 'sd-box';
    box.innerHTML =
      '<div class="sd-painel">' +
        '<div class="sd-top">' +
          '<div>' +
            '<h2>&#128176; Câmbio em Reais</h2>' +
            '<p class="sd-sub">Cotação de cada moeda em reais, com gráfico igual ao das bolsas de valores.</p>' +
          '</div>' +
          '<div class="sd-acoes">' +
            '<span class="sd-live"><i></i>ao vivo</span>' +
            '<button class="sd-btn" id="sdTodasMoedas">&#127760; Todas as moedas</button>' +
            '<button class="sd-btn round" id="sdCfgMoeda" title="Escolher as moedas" aria-label="Escolher as moedas">&#9881;&#65039;</button>' +
          '</div>' +
        '</div>' +
        '<div class="sd-moedas" id="sdMoedas">' +
          ativos.map(function () { return '<div class="sd-skeleton" style="height:126px"></div>'; }).join('') +
        '</div>' +
        '<p class="sd-nota">Clique em um cartão para abrir o gráfico completo (30, 60 ou 90 dias). ' +
        'Na engrenagem você escolhe as 3 moedas principais e no botão <b>Todas as moedas</b> você vê todas as demais do mundo.</p>' +
        '<p class="sd-nota" id="sdFonteCambio"></p>' +
      '</div>';

    var grade = el('sdMoedas');

    function desenhar() {
      var html = ativos.map(function (cod) {
        var info = infoMoeda(cod);
        var valor = dados ? dados.valores[cod] : null;
        var dec = valor != null && valor < 1 ? 4 : 2;
        var pct = series[cod] ? variacao(series[cod]) : null;
        return '<div class="sd-moeda" data-cod="' + cod + '">' + marcaDagua(info.iso) +
          '<div class="sd-moeda-top">' +
            '<span class="sd-mflag">' + bandeira(info.iso, info.flag, '', info.nome) + '</span>' +
            '<span class="sd-mcod">' + esc(cod) + '</span>' +
            '<span class="sd-mnome">' + esc(info.nome) + '</span>' +
          '</div>' +
          '<div class="sd-mvalor">' + (valor != null ? fmtMoeda(valor, dec) : '-') + '</div>' +
          '<div class="sd-mun">1 ' + esc(cod) + ' em reais</div>' +
          '<div class="sd-mvar ' + classeVar(pct) + '">' +
            (pct != null ? setaVar(pct) + ' ' + Math.abs(pct).toFixed(2).replace('.', ',') + '% <span style="font-weight:600;color:#8a7561">em 30 dias</span>' : 'carregando gráfico...') +
          '</div>' +
          '<div class="sd-spark" data-spark="' + cod + '">' + graficoSVG(series[cod], 46) + '</div>' +
          '<div class="sd-hint">toque para ampliar &#8599;</div>' +
        '</div>';
      }).join('');
      grade.innerHTML = html;
    }

    function carregar() {
      buscarCotacoes().then(function (d) {
        dados = d;
        var txt = 'Fonte: exchangerate-api.com (cotações oficiais de mercado)';
        if (d.data) txt += ' - atualizada em ' + fmtDataHora(d.data);
        txt += '. Gráfico: Banco Central Europeu.';
        el('sdFonteCambio').innerHTML = txt;
        desenhar();
      }).catch(function () {
        grade.innerHTML = '<p class="sd-vazio">Não foi possível carregar as cotações agora. ' +
          'Toque em <b>Todas as moedas</b> para tentar novamente ou consulte o site do Banco Central.</p>';
      }).then(function () {
        ativos.forEach(function (cod) {
          buscarSerie(cod, 30).then(function (pts) {
            series[cod] = pts;
            var sp = grade.querySelector('[data-spark="' + cod + '"]');
            if (sp) sp.innerHTML = graficoSVG(pts, 46);
            var card = grade.querySelector('.sd-moeda[data-cod="' + cod + '"]');
            if (card) {
              var v = card.querySelector('.sd-mvar');
              var pct = variacao(pts);
              v.className = 'sd-mvar ' + classeVar(pct);
              v.innerHTML = setaVar(pct) + ' ' + Math.abs(pct).toFixed(2).replace('.', ',') + '% <span style="font-weight:600;color:#8a7561">em 30 dias</span>';
            }
          }).catch(function () {});
        });
      });
    }
    carregar();

    grade.addEventListener('click', function (e) {
      var card = e.target.closest ? e.target.closest('.sd-moeda') : null;
      if (card) abrirGrafico(card.getAttribute('data-cod'));
    });

    /* ---- grafico grande ---- */
    function abrirGrafico(cod) {
      var info = infoMoeda(cod);
      var m = abrirModal(info.flag + ' ' + esc(cod) + ' - ' + esc(info.nome),
        '<p>Evolução da cotação em reais. Escolha o período:</p>' +
        '<div class="sd-seg" id="sdSeg">' +
          '<button data-d="30">30 dias</button><button data-d="60">60 dias</button><button data-d="90">90 dias</button>' +
        '</div>' +
        '<div id="sdGrafGrande"><div class="sd-skeleton" style="height:190px"></div></div>' +
        '<div class="sd-stats" id="sdStats"></div>' +
        '<p style="margin-top:14px">Valores oficiais de mercado divulgados pelo Banco Central Europeu. ' +
        'Cotações de cartão e casas de câmbio incluem IOF e taxa de serviço.</p>');

      function mostra(dias) {
        var segs = m.corpo.querySelectorAll('#sdSeg button');
        for (var i = 0; i < segs.length; i++) {
          if (segs[i].getAttribute('data-d') === String(dias)) segs[i].classList.add('ativo');
          else segs[i].classList.remove('ativo');
        }
        m.corpo.querySelector('#sdGrafGrande').innerHTML = '<div class="sd-skeleton" style="height:190px"></div>';
        m.corpo.querySelector('#sdStats').innerHTML = '';
        buscarSerie(cod, dias).then(function (pts) {
          var vs = pts.map(function (p) { return p.v; });
          var min = Math.min.apply(null, vs), max = Math.max.apply(null, vs);
          var soma = vs.reduce(function (a, b) { return a + b; }, 0);
          var pct = variacao(pts);
          m.corpo.querySelector('#sdGrafGrande').innerHTML = graficoSVG(pts, 190);
          m.corpo.querySelector('#sdStats').innerHTML =
            '<div class="sd-stat"><span>hoje</span><b>' + fmtMoeda(vs[vs.length - 1], vs[vs.length - 1] < 1 ? 4 : 2) + '</b></div>' +
            '<div class="sd-stat"><span>mínima</span><b>' + fmtMoeda(min, min < 1 ? 4 : 2) + '</b></div>' +
            '<div class="sd-stat"><span>máxima</span><b>' + fmtMoeda(max, max < 1 ? 4 : 2) + '</b></div>' +
            '<div class="sd-stat"><span>média</span><b>' + fmtMoeda(soma / vs.length, (soma / vs.length) < 1 ? 4 : 2) + '</b></div>' +
            '<div class="sd-stat"><span>variação</span><b style="color:' + (pct >= 0 ? '#15803d' : '#b91c1c') + '">' +
              setaVar(pct) + ' ' + Math.abs(pct).toFixed(2).replace('.', ',') + '%</b></div>';
        }).catch(function () {
          m.corpo.querySelector('#sdGrafGrande').innerHTML =
            '<p class="sd-vazio">Histórico indisponível para esta moeda. As cotações continuam aparecendo acima.</p>';
        });
      }
      m.corpo.querySelector('#sdSeg').addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('button') : null;
        if (b) mostra(parseInt(b.getAttribute('data-d'), 10));
      });
      mostra(30);
    }

    /* ---- escolher as 3 principais ---- */
    el('sdCfgMoeda').addEventListener('click', function () {
      var lista = Object.keys(NOMES_MOEDAS);
      var m = abrirModal('&#9881;&#65039; Escolher 3 moedas principais',
        '<p>Marque exatamente <b>3 moedas</b> para ficarem em destaque no painel. A escolha fica salva neste navegador.</p>' +
        '<div class="sd-chips" id="sdChipsMoedas">' +
          lista.map(function (c) {
            var i = infoMoeda(c);
            var on = ativos.indexOf(c) >= 0;
            return '<button class="sd-chip' + (on ? ' ativo' : '') + '" data-cod="' + c + '">' +
              bandeira(i.iso, i.flag, 'menor', i.nome) + ' ' + esc(c) + ' - ' + esc(i.nome) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="sd-seg" style="margin-top:16px"><button id="sdMoedaPadrao">Restaurar Dólar, Euro e Franco Suíço</button></div>');

      m.corpo.querySelector('#sdChipsMoedas').addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.sd-chip') : null;
        if (!b) return;
        var cod = b.getAttribute('data-cod');
        var pos = ativos.indexOf(cod);
        if (pos >= 0) {
          if (ativos.length <= 1) return;
          ativos.splice(pos, 1);
        } else {
          if (ativos.length >= 3) { alert('Máximo de 3 moedas em destaque. Desmarque uma para incluir outra.'); return; }
          ativos.push(cod);
        }
        lsSet(LS_MOEDAS, ativos);
        b.classList.toggle('ativo');
        desenhar();
        ativos.forEach(function (c) {
          if (!series[c]) {
            buscarSerie(c, 30).then(function (pts) {
              series[c] = pts;
              var sp = grade.querySelector('[data-spark="' + c + '"]');
              if (sp) sp.innerHTML = graficoSVG(pts, 46);
            }).catch(function () {});
          }
        });
      });

      m.corpo.querySelector('#sdMoedaPadrao').addEventListener('click', function () {
        ativos = PADRAO_MOEDAS.slice();
        lsSet(LS_MOEDAS, ativos);
        var chips = m.corpo.querySelectorAll('.sd-chip');
        for (var i = 0; i < chips.length; i++) {
          if (PADRAO_MOEDAS.indexOf(chips[i].getAttribute('data-cod')) >= 0) chips[i].classList.add('ativo');
          else chips[i].classList.remove('ativo');
        }
        desenhar();
        carregar();
      });
    });

    /* ---- todas as moedas do mundo ---- */
    el('sdTodasMoedas').addEventListener('click', function () {
      var m = abrirModal('&#127760; Todas as moedas do mundo',
        '<p>Digite para filtrar. Use os botões <b>1, 2 e 3</b> para colocar uma moeda no painel principal do site.</p>' +
        '<input class="sd-busca" id="sdBuscaMoeda" type="search" placeholder="Ex.: dolar, euro, iene, shekel...">' +
        '<div class="sd-lista-moedas" id="sdListaMoedas"><div class="sd-skeleton"></div></div>');

      function linhas(filtro) {
        if (!dados) return '<p class="sd-vazio">Carregando cotações...</p>';
        var f = (filtro || '').toLowerCase().trim();
        var cods = Object.keys(dados.valores).filter(function (c) { return c !== 'BRL'; });
        cods.sort(function (a, b) {
          var pa = NOMES_MOEDAS[a] ? 0 : 1, pb = NOMES_MOEDAS[b] ? 0 : 1;
          if (pa !== pb) return pa - pb;
          return a.localeCompare(b);
        });
        var out = [];
        cods.forEach(function (c) {
          var i = infoMoeda(c);
          var alvo = (c + ' ' + i.nome).toLowerCase();
          if (f && alvo.indexOf(f) < 0) return;
          var v = dados.valores[c];
          out.push('<div class="sd-linha">' +
            '<span class="sd-lc">' + bandeira(i.iso, i.flag, 'menor', i.nome) + ' ' + esc(c) + '</span>' +
            '<span class="sd-ln">' + esc(i.nome) + '</span>' +
            '<span class="sd-lv">' + fmtMoeda(v, v < 1 ? 4 : 2) + '</span>' +
            '<button class="sd-slot" data-cod="' + c + '" data-slot="1" title="Fixar no 1º lugar">1</button>' +
            '<button class="sd-slot" data-cod="' + c + '" data-slot="2" title="Fixar no 2º lugar">2</button>' +
            '<button class="sd-slot" data-cod="' + c + '" data-slot="3" title="Fixar no 3º lugar">3</button>' +
          '</div>');
        });
        return out.length ? out.join('') : '<p class="sd-vazio">Nenhuma moeda encontrada com esse nome.</p>';
      }

      var busca = m.corpo.querySelector('#sdBuscaMoeda');
      var lista = m.corpo.querySelector('#sdListaMoedas');
      lista.innerHTML = linhas('');
      busca.addEventListener('input', function () { lista.innerHTML = linhas(busca.value); });

      lista.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.sd-slot') : null;
        if (!b) return;
        var cod = b.getAttribute('data-cod');
        var slot = parseInt(b.getAttribute('data-slot'), 10) - 1;
        if (ativos.indexOf(cod) >= 0 && ativos.indexOf(cod) !== slot) {
          ativos.splice(ativos.indexOf(cod), 1);
        }
        ativos[slot] = cod;
        lsSet(LS_MOEDAS, ativos);
        desenhar();
        carregar();
        m.fechar();
      });

      if (!dados) {
        buscarCotacoes().then(function (d) {
          dados = d;
          lista.innerHTML = linhas('');
        }).catch(function () {
          lista.innerHTML = '<p class="sd-vazio">Não foi possível carregar agora. Tente novamente em alguns instantes.</p>';
        });
      }
    });
  }

  /* ==================================================================
     BLOCO 3 - RADAR MUNDIAL (noticias em tempo real por pais)
     ================================================================== */
  var PAISES = [
    { id: 'israel', nome: 'Israel', flag: '\uD83C\uDDEE\uD83C\uDDF1', q: 'Israel', g: 'Israel' , iso: 'il' },
    { id: 'eua', nome: 'Estados Unidos', flag: '\uD83C\uDDFA\uD83C\uDDF8', q: 'Estados+Unidos', g: 'Estados Unidos' , iso: 'us' },
    { id: 'russia', nome: 'Rússia', flag: '\uD83C\uDDF7\uD83C\uDDFA', q: 'R%C3%BAssia', g: 'Russia' , iso: 'ru' },
    { id: 'china', nome: 'China', flag: '\uD83C\uDDE8\uD83C\uDDF3', q: 'China', g: 'China' , iso: 'cn' },
    { id: 'europa', nome: 'Europa', flag: '\uD83C\uDDEA\uD83C\uDDFA', q: 'Europa', g: 'Europa' , iso: 'eu' },
    { id: 'oriente', nome: 'Oriente Médio', flag: '\uD83D\uDD4C', q: 'Oriente+M%C3%A9dio', g: 'Oriente Medio' , iso: '' },
    { id: 'onu', nome: 'ONU & Mundo', flag: '\uD83C\uDF0D', q: 'ONU', g: 'ONU' , iso: '' },
    { id: 'brasil', nome: 'Brasil', flag: '\uD83C\uDDE7\uD83C\uDDF7', q: 'Brasil+viagem', g: 'Brasil' , iso: 'br' }
  ];

  function dataRss(s) {
    if (!s) return null;
    var d = new Date(String(s).replace(' ', 'T') + 'Z');
    return isNaN(d.getTime()) ? null : d;
  }
  function dataGdelt(s) {
    if (!s) return null;
    var m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(s);
    if (!m) return null;
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
  }
  function separarFonte(titulo) {
    var t = String(titulo || '').trim();
    var fonte = '';
    var m = /^(.*\S)\s+-\s+([^-]{2,40})$/.exec(t);
    if (m) { t = m[1]; fonte = m[2]; }
    return { titulo: t, fonte: fonte };
  }

  /* Fonte 1: Google Noticias em portugues */
  function viaGoogle(p) {
    var gn = 'https://news.google.com/rss/search?q=' + p.q + '&hl=pt-BR&gl=BR&ceid=BR:pt-419';
    var url = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(gn);
    return fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || d.status !== 'ok' || !d.items || !d.items.length) throw new Error('google vazio');
      return d.items.slice(0, 8).map(function (it) {
        var s = separarFonte(it.title);
        return { titulo: s.titulo, link: it.link, data: dataRss(it.pubDate), fonte: s.fonte };
      });
    });
  }

  /* Fonte 2: GDELT (monitor global de noticias) */
  function viaGdelt(p) {
    var q = encodeURIComponent(p.g + ' sourcelang:portuguese');
    var url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=' + q +
      '&mode=artlist&maxrecords=8&format=json&sort=datedesc';
    return fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.articles || !d.articles.length) throw new Error('gdelt vazio');
      return d.articles.slice(0, 8).map(function (a) {
        var s = separarFonte(a.title);
        return { titulo: s.titulo, link: a.url, data: dataGdelt(a.seendate), fonte: s.fonte || a.domain };
      });
    });
  }

  function noticias(p, forcar) {
    var chave = LS_NEWS + p.id;
    var cache = lsGet(chave, null);
    var fresco = cache && cache.itens && cache.itens.length && (Date.now() - cache.ts < 10 * 60 * 1000);
    if (fresco && !forcar) return Promise.resolve({ itens: cache.itens, ts: cache.ts, fonte: cache.fonte || 'Google Noticias' });

    return viaGoogle(p).then(function (itens) {
      lsSet(chave, { ts: Date.now(), itens: itens, fonte: 'Google Noticias' });
      return { itens: itens, ts: Date.now(), fonte: 'Google Noticias' };
    }).catch(function () {
      return viaGdelt(p).then(function (itens) {
        lsSet(chave, { ts: Date.now(), itens: itens, fonte: 'GDELT' });
        return { itens: itens, ts: Date.now(), fonte: 'GDELT' };
      });
    }).catch(function () {
      if (cache && cache.itens && cache.itens.length) {
        return { itens: cache.itens, ts: cache.ts, fonte: (cache.fonte || 'Google Noticias'), antigo: true };
      }
      throw new Error('sem noticias');
    });
  }

  function montarRadar(box) {
    var max = parseInt(box.getAttribute('data-max') || '5', 10);
    var atual = PAISES[0];

    box.className = 'sd-box';
    box.innerHTML =
      '<div class="sd-painel">' +
        '<div class="sd-top">' +
          '<div>' +
            '<h2>\uD83C\uDF10 Radar Mundial</h2>' +
            '<p class="sd-sub">As notícias mais recentes de Israel e dos principais países do mundo, em tempo real.</p>' +
          '</div>' +
          '<div class="sd-acoes">' +
            '<span class="sd-live"><i></i>ao vivo</span>' +
            '<button class="sd-btn" id="sdAtualizar">&#128260; Atualizar</button>' +
          '</div>' +
        '</div>' +
        '<div class="sd-pais-band" id="sdPaisBand"></div>' +
        '<div class="sd-tabs" id="sdTabs">' +
          PAISES.map(function (p, i) {
            return '<button class="sd-tab' + (i === 0 ? ' ativo' : '') + '" data-pid="' + p.id + '">' +
              bandeira(p.iso, p.flag, 'menor', 'Bandeira de ' + p.nome) + ' ' + esc(p.nome) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="sd-lista" id="sdLista"></div>' +
        '<div class="sd-rodape">' +
          '<span id="sdRodapeInfo">Carregando...</span>' +
          '<a class="sd-link" id="sdLinkGoogle" href="#" target="_blank" rel="noopener">Ver tudo no Google Notícias &#8599;</a>' +
        '</div>' +
      '</div>';

    var lista = el('sdLista');
    var info = el('sdRodapeInfo');
    var linkG = el('sdLinkGoogle');

    function carregando() {
      lista.innerHTML = '<div class="sd-skeleton"></div><div class="sd-skeleton"></div>' +
        '<div class="sd-skeleton"></div><div class="sd-skeleton"></div>';
    }

    function pintar(res) {
      var itens = res.itens.slice(0, max);
      lista.innerHTML = itens.map(function (it) {
        var novo = it.data && (Date.now() - it.data.getTime() < 6 * 3600 * 1000);
        return '<a class="sd-noticia" href="' + esc(it.link) + '" target="_blank" rel="noopener">' +
          '<span class="sd-n-titulo">' + esc(it.titulo) + '</span>' +
          '<span class="sd-n-meta">' +
            '<span class="sd-n-band">' + bandeira(atual.iso, atual.flag, 'menor', 'Bandeira de ' + atual.nome) + esc(atual.nome) + '</span>' +
            (it.fonte ? '<span class="sd-n-fonte">' + esc(it.fonte) + '</span>' : '') +
            (it.data ? '<span>' + esc(fmtDataHora(it.data)) + '</span>' : '') +
            (novo ? '<span class="sd-novidade">NOVO</span>' : '') +
          '</span>' +
        '</a>';
      }).join('');
      var cab = el('sdPaisBand');
      if (cab) {
        cab.innerHTML = bandeira(atual.iso, atual.flag, 'grande', 'Bandeira de ' + atual.nome) +
          '<span>' + esc(atual.nome) + ' <small>manchetes em português</small></span>';
      }
      info.innerHTML = 'Fonte: ' + esc(res.fonte) + ' - atualizado em ' + esc(fmtDataHora(new Date(res.ts))) +
        (res.antigo ? ' (sem conexão no momento: últimas notícias salvas)' : '');
      linkG.href = 'https://news.google.com/search?q=' + atual.q + '&hl=pt-BR&gl=BR&ceid=BR:pt-419';
    }

    function mostrar(p) {
      atual = p;
      carregando();
      info.textContent = 'Buscando notícias de ' + p.nome + '...';
      noticias(p).then(pintar).catch(function () {
        lista.innerHTML = '<p class="sd-vazio">Não foi possível carregar as notícias agora. ' +
          'Tente o botao <b>Atualizar</b> ou abra o link do Google Notícias abaixo.</p>';
        info.textContent = 'Sem conexão com as fontes de notícias neste momento.';
        linkG.href = 'https://news.google.com/search?q=' + atual.q + '&hl=pt-BR&gl=BR&ceid=BR:pt-419';
      });
    }

    el('sdTabs').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.sd-tab') : null;
      if (!b) return;
      var botoes = el('sdTabs').querySelectorAll('.sd-tab');
      for (var i = 0; i < botoes.length; i++) botoes[i].classList.remove('ativo');
      b.classList.add('ativo');
      var pid = b.getAttribute('data-pid');
      for (var j = 0; j < PAISES.length; j++) if (PAISES[j].id === pid) mostrar(PAISES[j]);
    });

    el('sdAtualizar').addEventListener('click', function () { noticias(atual, true).then(pintar).catch(function () { mostrar(atual); }); });

    mostrar(atual);
  }


  /* ==================================================================
     BLOCO 4 - RECADOS DA COMUNIDADE (comentarios publicos)
     ------------------------------------------------------------------
     Como funciona:
     1) O visitante escreve nome, escolhe a bandeira (opcional) e o
        recado. Nenhum e-mail ou contato e pedido.
     2) O recado aparece na hora para ele (salvo no navegador) e e
        enviado ao painel da Netlify para moderacao.
     3) Depois de aprovado pelo dono do site, ele entra no arquivo
        comentarios.json e passa a valer para todos os visitantes.
     ================================================================== */
  var LS_RECADOS = 'sd.recados';

  var PAISES_RECADO = (function () {
    var vistos = {}, out = [];
    CIDADES.forEach(function (c) {
      if (!vistos[c.p]) { vistos[c.p] = 1; out.push({ nome: c.p, iso: c.iso, f: c.f }); }
    });
    out.push({ nome: 'Israel', iso: 'il', f: '\uD83C\uDDEE\uD83C\uDDF1' });
    out.sort(function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); });
    return out;
  })();

  (function estiloRecados() {
    var t = document.createElement('style');
    t.setAttribute('data-widgets', 'recados');
    t.textContent = [
      '.sd-rec-form{background:#fffdf8;border:1px solid #f0e6d8;border-radius:14px;padding:16px 18px;margin-bottom:18px}',
      '.sd-campo{display:block;font-weight:700;color:#2c1d11;font-size:.88em;margin:0 0 6px}',
      '.sd-input,.sd-textarea{width:100%;padding:11px 13px;border:2px solid #e7d5bd;border-radius:10px;font-size:.95em;font-family:inherit;color:#2c1d11;margin-bottom:12px}',
      '.sd-input:focus,.sd-textarea:focus{outline:none;border-color:#d97706}',
      '.sd-textarea{min-height:92px;resize:vertical;line-height:1.5}',
      '.sd-contador{float:right;font-size:.75em;color:#a8927a;font-weight:600}',
      '.sd-chips-pais{max-height:132px;overflow:auto;padding:2px;margin-bottom:12px}',
      '.sd-chips-pais .sd-chip{font-size:.8em;padding:6px 10px}',
      '.sd-recado{background:#fffdf8;border:1px solid #f0e6d8;border-left:4px solid #d97706;border-radius:12px;padding:14px 16px;display:flex;gap:12px}',
      '.sd-recado.pendente{border-left-color:#f59e0b;background:#fffbf0;border-style:dashed}',
      '.sd-avatar{flex:0 0 42px;width:42px;height:42px;border-radius:50%;background:linear-gradient(140deg,#2c1d11,#5c3a21);color:#f59e0b;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.1em}',
      '.sd-rec-corpo{flex:1;min-width:0}',
      '.sd-rec-nome{font-weight:800;color:#2c1d11;font-size:.95em}',
      '.sd-rec-meta{font-size:.75em;color:#8a7561;margin:2px 0 6px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
      '.sd-rec-texto{color:#5c3a21;font-size:.93em;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}',
      '.sd-rec-pendente-tag{background:#fef3c7;color:#92400e;border-radius:8px;padding:2px 8px;font-weight:800;font-size:.72em;text-transform:uppercase;letter-spacing:.4px}',
      '.sd-rec-ok{display:none;background:#ecfdf5;border:1px solid #a7f3d0;color:#047857;border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:.88em;font-weight:700}',
      '@media (max-width:600px){.sd-recado{padding:12px}.sd-avatar{flex:0 0 36px;width:36px;height:36px}}'
    ].join('\n');
    document.head.appendChild(t);
  })();

  function montarComentarios(box) {
    var publicos = [];
    var meus = lsGet(LS_RECADOS, []) || [];
    var paisEscolhido = null;

    box.className = 'sd-box';
    box.id = 'comunidade';
    box.innerHTML =
      '<div class="sd-painel">' +
        '<div class="sd-top">' +
          '<div>' +
            '<h2>\uD83D\uDCAC Recados da Comunidade</h2>' +
            '<p class="sd-sub">Um mural aberto: deixe sua dica, seu relato ou aquela impressao de viagem. ' +
            'Sem cadastro, sem e-mail e sem contato — só o recado.</p>' +
          '</div>' +
          '<div class="sd-acoes"><span class="sd-live" id="sdContaRecados">carregando...</span></div>' +
        '</div>' +

        '<div class="sd-rec-form">' +
          '<div class="sd-rec-ok" id="sdRecOk"></div>' +
          '<label class="sd-campo" for="sdRecNome">Seu nome ou apelido</label>' +
          '<input class="sd-input" id="sdRecNome" type="text" maxlength="40" placeholder="Ex.: Marcos, Ana, Viajante Curioso" autocomplete="name">' +
          '<label class="sd-campo" for="sdRecTexto">Seu recado <span class="sd-contador"><span id="sdRecConta">0</span>/300</span></label>' +
          '<textarea class="sd-textarea" id="sdRecTexto" maxlength="300" placeholder="Conte uma dica, um lugar que amou, um alerta útil..."></textarea>' +
          '<label class="sd-campo">Sua bandeira (opcional — aparece ao lado do seu nome)</label>' +
          '<div class="sd-chips sd-chips-pais" id="sdRecPaises">' +
            PAISES_RECADO.map(function (p) {
              return '<button type="button" class="sd-chip" data-pais="' + esc(p.nome) + '" data-iso="' + (p.iso || '') + '" data-f="' + p.f + '">' +
                bandeira(p.iso, p.f, 'menor', 'Bandeira de ' + p.nome) + ' ' + esc(p.nome) + '</button>';
            }).join('') +
          '</div>' +
          '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">' +
            '<button class="sd-btn" id="sdRecEnviar" style="background:#2c1d11;color:#f59e0b;border-color:#d97706">Publicar recado</button>' +
            '<span style="font-size:.78em;color:#8a7561">Os recados passam por moderação antes de ficarem visíveis para todos.</span>' +
          '</div>' +
        '</div>' +

        '<div class="sd-lista" id="sdRecados"></div>' +
        '<p class="sd-nota">O recado que você escrever aparece na hora para você e é enviado para aprovação. ' +
        'Depois de aprovado, ele entra no mural e fica no site para todo mundo ler. Nada de e-mail, telefone ou contato.</p>' +
      '</div>';

    var lista = el('sdRecados');
    var conta = el('sdContaRecados');

    function pintar() {
      var todos = meus.map(function (r) { r.pendente = true; return r; })
        .concat(publicos.map(function (r) { r.pendente = false; return r; }));
      todos.sort(function (a, b) { return new Date(b.data || 0) - new Date(a.data || 0); });

      conta.textContent = publicos.length + (publicos.length === 1 ? ' recado publicado' : ' recados publicados');

      if (!todos.length) {
        lista.innerHTML = '<p class="sd-vazio">Ainda não há recados no mural. Escreva o primeiro ali em cima! \uD83D\uDC4D</p>';
        return;
      }
      lista.innerHTML = todos.map(function (r) {
        var inicial = String(r.nome || '?').trim().charAt(0).toUpperCase();
        var quando = r.data ? fmtDataHora(new Date(r.data)) : '';
        return '<div class="sd-recado' + (r.pendente ? ' pendente' : '') + '">' +
          '<div class="sd-avatar">' + esc(inicial) + '</div>' +
          '<div class="sd-rec-corpo">' +
            '<div class="sd-rec-nome">' + esc(r.nome) + '</div>' +
            '<div class="sd-rec-meta">' +
              (r.iso || r.f ? '<span class="sd-n-band">' + bandeira(r.iso, r.f, 'menor', r.pais) + esc(r.pais || '') + '</span>' : '') +
              (quando ? '<span>' + esc(quando) + '</span>' : '') +
              (r.pendente ? '<span class="sd-rec-pendente-tag">aguardando moderação (só você vê)</span>' : '') +
            '</div>' +
            '<div class="sd-rec-texto">' + esc(r.texto) + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function enviarNetlify(rec) {
      try {
        var corpo = 'form-name=comunidade&nome=' + encodeURIComponent(rec.nome) +
          '&cidade=' + encodeURIComponent(rec.pais || '') +
          '&texto=' + encodeURIComponent(rec.texto) + '&bot-field=';
        fetch('', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: corpo
        }).catch(function () {});
      } catch (e) {}
    }

    el('sdRecPaises').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.sd-chip') : null;
      if (!b) return;
      var nome = b.getAttribute('data-pais');
      if (paisEscolhido && paisEscolhido.nome === nome) {
        paisEscolhido = null;
        b.classList.remove('ativo');
        return;
      }
      var chips = el('sdRecPaises').querySelectorAll('.sd-chip');
      for (var i = 0; i < chips.length; i++) chips[i].classList.remove('ativo');
      b.classList.add('ativo');
      paisEscolhido = { nome: nome, iso: b.getAttribute('data-iso'), f: b.getAttribute('data-f') };
    });

    el('sdRecTexto').addEventListener('input', function () {
      el('sdRecConta').textContent = this.value.length;
    });

    el('sdRecEnviar').addEventListener('click', function () {
      var nome = el('sdRecNome').value.trim();
      var texto = el('sdRecTexto').value.trim();
      if (nome.length < 2) { alert('Escreva seu nome ou apelido (pelo menos 2 letras).'); return; }
      if (texto.length < 10) { alert('Escreva um recado um pouco maior (pelo menos 10 letras).'); return; }
      if (/https?:\/\/|www\./i.test(texto)) { alert('Por segurança, recados não podem conter links.'); return; }
      var ultimo = lsGet('sd.recado.ultimo', 0);
      if (Date.now() - ultimo < 60000) { alert('Aguarde um minutinho antes de enviar outro recado.'); return; }

      var rec = {
        id: 'r' + Date.now(),
        nome: nome,
        pais: paisEscolhido ? paisEscolhido.nome : '',
        iso: paisEscolhido ? paisEscolhido.iso : '',
        f: paisEscolhido ? paisEscolhido.f : '',
        texto: texto,
        data: new Date().toISOString()
      };
      meus.unshift(rec);
      lsSet(LS_RECADOS, meus.slice(0, 20));
      lsSet('sd.recado.ultimo', Date.now());
      enviarNetlify(rec);

      el('sdRecNome').value = '';
      el('sdRecTexto').value = '';
      el('sdRecConta').textContent = '0';
      paisEscolhido = null;
      var chips = el('sdRecPaises').querySelectorAll('.sd-chip');
      for (var i = 0; i < chips.length; i++) chips[i].classList.remove('ativo');

      var ok = el('sdRecOk');
      ok.style.display = 'block';
      ok.innerHTML = '\u2705 Recado enviado! Ele já aparece aqui para você e foi para a moderação. ' +
        'Assim que for aprovado, fica visível para todos os visitantes.';
      pintar();
      setTimeout(function () { ok.style.display = 'none'; }, 9000);
    });

    pintar();
    fetch('comentarios.json', { cache: 'no-store' }).then(function (r) { return r.json(); })
      .then(function (d) {
        publicos = (d && d.comentarios) ? d.comentarios : [];
        pintar();
      }).catch(function () { publicos = []; pintar(); });
  }

  /* ==================================================================
     INICIALIZACAO
     ================================================================== */
  function init() {
    var r = el('painelRelogios'); if (r) montarRelogios(r);
    var c = el('painelCambio'); if (c) montarCambio(c);
    var n = el('radarMundo'); if (n) montarRadar(n);
    var cm = el('comunidade'); if (cm) montarComentarios(cm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
