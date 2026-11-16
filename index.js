// F1 : calendrier de la saison avec les horaires de chaque séance, résultats (course, qualifications, sprint) et classements pilotes et écuries (données Jolpica, la suite d'Ergast).
// Il tourne dans le bac à sable de NeoDex, avec ses outils d'interface (ctx.host) et seulement les autorisations de son plugin.json.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Formule 1</span><span id="f1Season" class="f1Season"></span>
    <div class="agNav" id="f1Tabs"><button class="btn px" data-v="cal">CALENDRIER</button><button class="btn px" data-v="res">RÉSULTATS</button><button class="btn px" data-v="drv">PILOTES</button><button class="btn px" data-v="team">ÉCURIES</button></div></div>
  <label class="f1Cal"><input type="checkbox" id="f1Agenda"> Ajouter les qualifications et les courses à mon emploi du temps</label>
  <div id="f1Main"></div>
  <div class="hint">Données Jolpica (la suite d'Ergast), heures de Paris. L'étoile d'un pilote en fait ton pilote : il est mis en avant partout.</div>
</div>`;
const CSS = `#f1Tabs{margin-left:auto}#f1Tabs .btn.on{--c:var(--magenta);color:#fff}.f1Season{font-size:19px;color:#fff;margin-left:12px}
.f1Cal{display:flex;gap:8px;align-items:center;margin:6px 0 12px;color:var(--shell);font-size:15px}
.f1Next{flex-direction:row!important;gap:22px;align-items:center}.f1Next canvas{width:clamp(80px,6vw,110px);height:auto;image-rendering:pixelated;flex:none}.f1Next canvas.trk{width:clamp(200px,17vw,340px);margin-left:auto}
.f1Big{font:clamp(18px,1.5vw,26px) var(--title);color:#fff;margin-bottom:6px}.f1Count{font:clamp(22px,1.8vw,32px) var(--title);color:var(--pink);margin:8px 0}
.f1Sess{display:grid;grid-template-columns:clamp(150px,10vw,200px) 1fr;gap:4px 14px;font-size:clamp(14px,.95vw,17px);color:var(--lilac)}.f1Sess b{color:#fff;font-weight:500}
.f1Grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(clamp(260px,18vw,340px),1fr));gap:14px;margin-top:18px}
.f1Race{position:relative;gap:4px;cursor:var(--cp,pointer)}.f1Race:hover{--c:var(--violet)}.f1Race.done{opacity:.72}.f1Race.next{--c:var(--magenta)}
.f1Race .trk{position:absolute;right:10px;top:10px;width:clamp(64px,5vw,92px);image-rendering:pixelated}.f1Race .r,.f1Race .n,.f1Race .d{padding-right:clamp(70px,5.4vw,100px)}
.f1Race .r{font:clamp(10px,.7vw,12px)/1.6 var(--title);color:var(--muted);letter-spacing:1px}.f1Race .n{color:#fff;font-size:clamp(15px,1.05vw,19px)}.f1Race .d{font-size:clamp(13px,.9vw,16px);color:var(--lilac)}.f1Race .w{font-size:clamp(13px,.9vw,16px);color:#ffd07a}
.f1Row{display:grid;grid-template-columns:36px 6px 1fr 1fr clamp(80px,7vw,120px) clamp(60px,5vw,90px) 28px;gap:8px;align-items:center;font-size:clamp(14px,.95vw,17px);color:var(--lilac);padding:4px 0;border-top:1px solid rgba(255,255,255,.05)}
.f1Row.head{font:clamp(9px,.65vw,11px) var(--title);letter-spacing:1px;color:var(--muted);border:0}.f1Row b{color:#fff;font-weight:600}.f1Row i{height:18px}.f1Row.fav{background:rgba(var(--mgr),.14)}
.f1Row .t{text-align:right}.f1Pts{display:flex;align-items:center;gap:6px}.f1Pts span{height:8px;background:var(--c,#888)}
.f1Star{all:unset;cursor:var(--cp,pointer);color:var(--muted);font-size:18px;text-align:center}.f1Star:hover,.f1Star.on{color:#ffd07a}
.f1Pick{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;align-items:center}.f1Pick select{background:var(--bg2,#14102a);color:#fff;border:2px solid var(--line2,#3a2f6a);font:15px var(--body,inherit);padding:5px 8px}
.f1Pick .btn.on{--c:var(--magenta);color:#fff}
#f1Main .sysCard{align-self:stretch}`;
// couleurs des écuries (identifiant Ergast) ; une écurie inconnue reçoit une couleur tirée de son nom
const TEAM_COL = {red_bull: '#3671c6', ferrari: '#e8002d', mercedes: '#27f4d2', mclaren: '#ff8000', aston_martin: '#229971', alpine: '#00a1e8', williams: '#64c4ff', rb: '#6692ff', racing_bulls: '#6692ff', sauber: '#52e252', audi: '#bb0a30', haas: '#b6babd', cadillac: '#c8a85a'};
const teamCol = id => TEAM_COL[id] || '#' + [...String(id)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(16).padEnd(6, '8').slice(0, 6);
// tracés simplifiés des circuits (identifiant Ergast), points sur une grille de 20 × 20 ; le premier point est la ligne de départ
const TRACKS = {albert_park: '4,14 9,17 14,16 17,12 16,7 12,3 7,3 4,6 3,10', shanghai: '4,6 7,3 10,4 9,7 6,8 8,11 14,11 18,9 17,14 10,16 4,15', suzuka: '3,14 8,16 12,12 15,8 18,6 17,3 13,4 10,8 7,12 4,10 6,6 3,7',
  bahrain: '4,16 15,16 17,13 13,11 14,7 17,5 14,2 10,4 8,8 5,7 3,10 5,13', jeddah: '8,1 11,2 11,8 12,13 11,19 9,19 8,14 9,9 7,5', miami: '3,10 6,7 13,7 17,5 18,9 14,12 9,13 5,14', imola: '3,12 6,15 12,16 17,13 18,9 15,8 13,4 9,3 7,6 4,7',
  monaco: '2,12 6,13 9,11 12,12 15,10 18,9 17,6 14,7 11,5 8,7 5,6 3,8', catalunya: '3,15 16,15 18,12 15,10 16,6 13,4 9,5 7,8 4,7 3,11', villeneuve: '2,10 5,7 9,8 13,7 17,6 18,9 15,11 10,12 6,12', red_bull_ring: '3,14 6,5 15,3 17,6 12,8 15,12 10,15',
  silverstone: '5,15 9,17 13,15 16,16 18,12 15,9 16,5 12,3 9,6 6,4 3,8 4,12', spa: '3,4 5,2 7,5 12,9 17,10 18,14 15,16 11,14 8,16 5,13 4,9', hungaroring: '4,15 10,16 14,13 17,10 15,6 11,7 9,4 6,5 5,9 3,11', zandvoort: '5,14 9,17 14,15 16,11 15,6 11,3 7,5 9,9 6,10',
  monza: '3,16 17,16 18,14 15,13 16,8 14,3 11,2 9,5 6,6 4,9 3,13', madring: '4,13 9,15 15,14 17,10 13,8 10,4 6,5 4,9', baku: '3,15 16,15 17,12 14,11 14,6 10,6 8,4 5,5 6,9 3,10', marina_bay: '3,13 10,15 16,14 17,10 13,9 13,5 9,4 7,7 4,8',
  americas: '3,16 5,10 8,8 9,4 12,6 15,4 18,7 16,11 12,12 10,15', rodriguez: '3,6 17,6 18,10 14,11 12,15 8,14 6,11 3,10', interlagos: '5,4 12,3 17,6 16,11 12,10 10,13 13,16 7,17 4,12 6,8', vegas: '2,8 7,6 17,6 18,13 9,13 6,11 3,12',
  losail: '4,14 15,15 18,11 15,8 16,5 11,3 7,5 5,8 3,11', yas_marina: '3,14 8,15 12,13 17,14 18,10 14,8 15,4 10,3 7,7 4,9'};
// un circuit inconnu reçoit une boucle irrégulière tirée de son nom
const trackPts = id => TRACKS[id] ? TRACKS[id].split(' ').map(s => s.split(',').map(Number)) : Array.from({length: 9}, (_, i, a, h = [...String(id)].reduce((s, c) => (s * 31 + c.charCodeAt(0) + i * 7) >>> 0, 11)) => { const q = i / 9 * 2 * Math.PI, r = 6 + h % 4; return [10 + Math.cos(q) * (r + 2), 10 + Math.sin(q) * r]; });
// le tracé en pixels sur une petite toile (64 × 40 points) : bordure sombre, piste claire, damier de départ ; renvoie le chemin point par point pour la voiture
function drawTrack(c, id, car) {
  const g = c.getContext('2d'), W = c.width, H = c.height, P = trackPts(id), xs = P.map(p => p[0]), ys = P.map(p => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys), k = Math.min((W - 8) / (Math.max(...xs) - x0 || 1), (H - 8) / (Math.max(...ys) - y0 || 1));
  const ox = (W - (Math.max(...xs) - x0) * k) / 2, oy = (H - (Math.max(...ys) - y0) * k) / 2, S = P.map(([x, y]) => [Math.round(ox + (x - x0) * k), Math.round(oy + (y - y0) * k)]), path = [];
  for (let i = 0; i < S.length; i++) { const [a, b2] = [S[i], S[(i + 1) % S.length]], n = Math.max(Math.abs(b2[0] - a[0]), Math.abs(b2[1] - a[1]), 1); for (let s = 0; s < n; s++) path.push([Math.round(a[0] + (b2[0] - a[0]) * s / n), Math.round(a[1] + (b2[1] - a[1]) * s / n)]); }
  g.clearRect(0, 0, W, H);
  g.fillStyle = '#2a2148'; for (const [x, y] of path) g.fillRect(x - 2, y - 2, 4, 4);
  g.fillStyle = '#e8e0ff'; for (const [x, y] of path) g.fillRect(x - 1, y - 1, 2, 2);
  const [sx, sy] = path[0]; for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#05010b' : '#ffffff'; g.fillRect(sx - 1 + i % 2, sy - 2 + (i >> 1) * 2, 1, 2); }
  if (car != null) { const [cx, cy] = path[car % path.length]; g.fillStyle = '#ff4fb0'; g.fillRect(cx - 1, cy - 1, 2, 2); }
  return path;
}
const SESS = [['FirstPractice', 'Essais libres 1'], ['SecondPractice', 'Essais libres 2'], ['ThirdPractice', 'Essais libres 3'], ['SprintQualifying', 'Qualif. sprint'], ['SprintShootout', 'Qualif. sprint'], ['Sprint', 'Sprint'], ['Qualifying', 'Qualifications'], ['', 'Course']];
const COUNTRY = {Australia: 'Australie', China: 'Chine', Japan: 'Japon', Bahrain: 'Bahreïn', 'Saudi Arabia': 'Arabie saoudite', USA: 'États-Unis', 'United States': 'États-Unis', Italy: 'Italie', Monaco: 'Monaco', Spain: 'Espagne', Canada: 'Canada', Austria: 'Autriche', UK: 'Royaume-Uni', Belgium: 'Belgique', Hungary: 'Hongrie', Netherlands: 'Pays-Bas', Azerbaijan: 'Azerbaïdjan', Singapore: 'Singapour', Mexico: 'Mexique', Brazil: 'Brésil', Qatar: 'Qatar', UAE: 'Émirats arabes unis', 'Abu Dhabi': 'Abou Dabi', France: 'France', Portugal: 'Portugal', Germany: 'Allemagne', Madrid: 'Espagne'};
export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const { el, toast } = ctx.host, folder = ctx.folder;
  ctx.host.addStyle(CSS);
  view.innerHTML = HTML;
  const $ = id => view.querySelector('#' + id);
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  let prefs = (await doc('prefs')) || {};
  const save = async s => { Object.assign(prefs, s); await folder.write('prefs', prefs).catch(() => {}); };
  const cache = new Map();  // une même page n'est demandée qu'une fois toutes les 10 minutes
  const get = p => { const c = cache.get(p); if (c && Date.now() - c.t < 6e5) return c.p; const pull = (n = 0) => fetch('https://api.jolpi.ca/ergast/f1/' + p).then(r => r.status === 429 && n < 3 ? new Promise(ok => setTimeout(ok, 1500 * (n + 1))).then(() => pull(n + 1)) : r);  // le serveur limite les rafales : on attend un peu et on redemande
    const pr = pull().then(r => { if (!r.ok) throw new Error(r.status === 429 ? 'trop de demandes d’un coup, réessaie dans une minute' : 'Jolpica ' + r.status); return r.json ? r.json() : r; }).then(j => j.MRData); pr.catch(() => cache.delete(p)); cache.set(p, {t: Date.now(), p: pr}); return pr; };
  const when = (d, t) => new Date(d + 'T' + (t || '12:00:00Z'));
  const fmt = (dt, o) => dt.toLocaleString('fr-FR', o);
  const name = d => d.givenName + ' ' + d.familyName, isFav = id => prefs.driver === id;
  const star = d => { const b = el('button', 'f1Star' + (isFav(d.driverId) ? ' on' : ''), isFav(d.driverId) ? '★' : '☆'); b.title = isFav(d.driverId) ? "Ce n'est plus mon pilote" : 'Mon pilote'; b.onclick = async e => { e.stopPropagation(); await save({driver: isFav(d.driverId) ? null : d.driverId}); render(); }; return b; };
  let tab = 'cal', round = null, kind = 'results', races = null, timer = null;
  const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  function flag() {  // un drapeau à damier en pixels, qui ondule
    const c = el('canvas'); c.width = c.height = 24; const g = c.getContext('2d'); let t = 0;
    const draw = () => { if (!c.isConnected) return; g.clearRect(0, 0, 24, 24); g.fillStyle = '#c8c0d8'; g.fillRect(3, 2, 2, 21);
      for (let x = 0; x < 16; x++) for (let y = 0; y < 12; y++) { const yy = 3 + y + Math.round(Math.sin(x / 3 + t) * 1.2); g.fillStyle = (Math.floor(x / 3) + Math.floor(y / 3)) % 2 ? '#05010b' : '#ffffff'; g.fillRect(5 + x, yy, 1, 1); }
      t += .25; setTimeout(draw, 120); };
    setTimeout(draw); return c;  // dessiné une fois dans la page (avant, le drapeau ne s'affichait jamais)
  }
  const loadRaces = async () => races ??= (await get('current.json')).RaceTable;
  async function render() {
    clearTimeout(timer); if (!view.classList.contains('on')) return;
    view.querySelectorAll('#f1Tabs .btn').forEach(b => b.classList.toggle('on', b.dataset.v === tab));
    const main = $('f1Main');
    try {
      const rt = await loadRaces(); $('f1Season').textContent = 'Saison ' + rt.season;
      if (tab === 'cal') return calendar(main, rt.Races);
      if (tab === 'res') return results(main, rt.Races);
      if (tab === 'drv') return drivers(main);
      return teams(main);
    } catch (e) { races = null; main.replaceChildren(el('div', 'hint', 'Données indisponibles : ' + e.message + '. Vérifie ta connexion.')); }
  }
  const raceEnd = r => when(r.date, r.time).getTime() + 2.5 * 3600e3;
  function calendar(main, list) {
    const now = Date.now(), next = list.find(r => raceEnd(r) > now), nodes = [];
    if (next) {
      const box = el('div', 'sysCard px f1Next'), info = el('div'), start = when(next.date, next.time), cd = el('div', 'f1Count');
      const tick = () => { const s = Math.max(0, Math.floor((start - Date.now()) / 1000)); cd.textContent = s ? `J-${Math.floor(s / 86400)} · ${String(Math.floor(s % 86400 / 3600)).padStart(2, '0')} h ${String(Math.floor(s % 3600 / 60)).padStart(2, '0')} min` : 'EN COURS'; if (cd.isConnected) timer = setTimeout(tick, 30000); };
      info.append(el('div', 'hint', 'Prochain Grand Prix · manche ' + next.round), el('div', 'f1Big', next.raceName.replace('Grand Prix', 'GP')), el('div', 'hint', next.Circuit.circuitName + ', ' + next.Circuit.Location.locality + ' (' + (COUNTRY[next.Circuit.Location.country] || next.Circuit.Location.country) + ')'), cd);
      const ss = el('div', 'f1Sess');
      for (const [k, n] of SESS) { const s = k ? next[k] : {date: next.date, time: next.time}; if (!s?.date) continue; const d = when(s.date, s.time); ss.append(el('span', '', n), el('b', '', fmt(d, {weekday: 'long', day: 'numeric', month: 'short'}) + (s.time ? ' · ' + fmt(d, {hour: '2-digit', minute: '2-digit'}) : ''))); }
      const trk = el('canvas', 'trk'); trk.width = 64; trk.height = 40; trk.title = next.Circuit.circuitName; trk.dataset.id = next.Circuit.circuitId; let lap = 0;
      const run = () => { if (!trk.isConnected && lap) return; drawTrack(trk, next.Circuit.circuitId, lap++); setTimeout(run, 90); };  // la voiture fait le tour du circuit
      info.append(ss); box.append(flag(), info, trk); nodes.push(box); setTimeout(tick); run();
    }
    const grid = el('div', 'f1Grid'), winners = get('current/results/1.json?limit=100').then(j => new Map(j.RaceTable.Races.map(r => [r.round, r.Results[0]]))).catch(() => new Map());  // tous les vainqueurs en une demande
    for (const r of list) {
      const done = raceEnd(r) < now, c = el('div', 'sysCard px f1Race' + (done ? ' done' : '') + (r === next ? ' next' : ''));
      c.append(el('span', 'r', 'MANCHE ' + r.round + (r.Sprint ? ' · SPRINT' : '')), el('span', 'n', r.raceName.replace('Grand Prix', 'GP')), el('span', 'd', fmt(when(r.date, r.time), {day: 'numeric', month: 'long'}) + ' · ' + r.Circuit.Location.locality));
      const tc = el('canvas', 'trk'); tc.width = 64; tc.height = 40; tc.dataset.id = r.Circuit.circuitId; drawTrack(tc, r.Circuit.circuitId); c.append(tc);
      if (done) { const w = el('span', 'w', '…'); c.append(w); winners.then(m => { const x = m.get(r.round); w.textContent = x ? '🏆 ' + name(x.Driver) + ' (' + x.Constructor.name + ')' : 'Résultats à venir'; }); }
      c.title = done ? 'Voir les résultats' : 'Voir les horaires'; c.onclick = () => { round = r.round; tab = 'res'; render(); };
      grid.append(c);
    }
    main.replaceChildren(...nodes, grid);
  }
  async function results(main, list) {
    const past = list.filter(r => when(r.date, r.time).getTime() < Date.now() + 3 * 86400e3);
    round ??= [...list].reverse().find(r => raceEnd(r) < Date.now())?.round || list[0]?.round;
    const pick = el('div', 'f1Pick'), sel = el('select');
    sel.append(...list.map(r => { const o = el('option', '', r.round + '. ' + r.raceName.replace('Grand Prix', 'GP')); o.value = r.round; return o; })); sel.value = round; sel.onchange = () => { round = sel.value; render(); };
    const race = list.find(r => r.round == round), kinds = [['results', 'COURSE'], ['qualifying', 'QUALIFICATIONS']].concat(race?.Sprint ? [['sprint', 'SPRINT']] : []);
    if (!kinds.some(k => k[0] === kind)) kind = 'results';
    pick.append(sel, ...kinds.map(([k, n]) => { const b = el('button', 'btn px' + (k === kind ? ' on' : ''), n); b.onclick = () => { kind = k; render(); }; return b; }));
    main.replaceChildren(pick, el('div', 'hint', 'Chargement…'));
    const j = await get('current/' + round + '/' + kind + '.json'), R = j.RaceTable.Races[0], rows = R?.Results || R?.QualifyingResults || R?.SprintResults || [];
    const box = el('div', 'sysCard px'); box.append(el('span', 'label', (race?.raceName || '') + ' · ' + {results: 'course', qualifying: 'qualifications', sprint: 'sprint'}[kind]));
    if (!rows.length) { box.append(el('div', 'hint', race && when(race.date, race.time) > Date.now() ? 'Pas encore couru. ' + 'Départ le ' + fmt(when(race.date, race.time), {weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'}) + '.' : 'Résultats pas encore publiés.')); main.replaceChildren(pick, box); return; }
    const head = el('div', 'f1Row head'); head.append(...['POS', '', 'PILOTE', 'ÉCURIE', kind === 'qualifying' ? 'MEILLEUR TOUR' : 'TEMPS', kind === 'qualifying' ? 'Q1' : 'POINTS', ''].map(t => el('span', '', t))); box.append(head);
    for (const x of rows) {
      const r = el('div', 'f1Row' + (isFav(x.Driver.driverId) ? ' fav' : '')), bar = el('i'); bar.style.background = teamCol(x.Constructor.constructorId);
      const time = kind === 'qualifying' ? (x.Q3 || x.Q2 || x.Q1 || '') : (x.Time?.time || ({Finished: '', Lapped: '+1 tour'}[x.status] ?? (/\+\d+ Laps?/.test(x.status) ? x.status.replace(/Laps?/, 'tours') : 'Abandon')));
      const nm = el('span'); nm.append(el('b', '', name(x.Driver)), x.FastestLap?.rank === '1' ? ' ⏱' : '');
      r.append(el('span', '', x.positionText === 'R' ? 'AB' : x.position), bar, nm, el('span', '', x.Constructor.name), el('span', 't', time), el('span', 't', kind === 'qualifying' ? (x.Q1 || '') : x.points), star(x.Driver));
      r.title = 'Grille : ' + (x.grid ?? '-') + (x.FastestLap?.rank === '1' ? ' · meilleur tour en course' : ''); box.append(r);
    }
    box.append(el('div', 'hint', '⏱ : meilleur tour en course · AB : abandon'));
    main.replaceChildren(pick, box);
  }
  async function drivers(main) {
    const j = await get('current/driverStandings.json'), L = j.StandingsTable.StandingsLists[0], rows = L?.DriverStandings || [], max = +rows[0]?.points || 1;
    const box = el('div', 'sysCard px'); box.append(el('span', 'label', 'Classement des pilotes' + (L ? ' · après la manche ' + L.round : '')));
    const head = el('div', 'f1Row head'); head.append(...['POS', '', 'PILOTE', 'ÉCURIE', 'POINTS', 'VICT.', ''].map(t => el('span', '', t))); box.append(head);
    for (const x of rows) {
      const c = x.Constructors?.at(-1) || {}, r = el('div', 'f1Row' + (isFav(x.Driver.driverId) ? ' fav' : '')), bar = el('i'), pts = el('span', 'f1Pts'), sw = el('span');
      bar.style.background = teamCol(c.constructorId); sw.style.cssText = `--c:${teamCol(c.constructorId)};width:${Math.round(+x.points / max * 60)}px`; pts.append(sw, el('b', '', x.points));
      r.append(el('span', '', x.positionText || x.position), bar, el('b', '', name(x.Driver)), el('span', '', c.name || ''), pts, el('span', 't', x.wins), star(x.Driver)); box.append(r);
    }
    if (!rows.length) box.append(el('div', 'hint', 'La saison n\'a pas encore commencé.'));
    main.replaceChildren(box);
  }
  async function teams(main) {
    const j = await get('current/constructorStandings.json'), L = j.StandingsTable.StandingsLists[0], rows = L?.ConstructorStandings || [], max = +rows[0]?.points || 1;
    const box = el('div', 'sysCard px'); box.append(el('span', 'label', 'Classement des écuries' + (L ? ' · après la manche ' + L.round : '')));
    const head = el('div', 'f1Row head'); head.append(...['POS', '', 'ÉCURIE', '', 'POINTS', 'VICT.', ''].map(t => el('span', '', t))); box.append(head);
    for (const x of rows) {
      const r = el('div', 'f1Row'), bar = el('i'), pts = el('span', 'f1Pts'), sw = el('span'), col = teamCol(x.Constructor.constructorId);
      bar.style.background = col; sw.style.cssText = `--c:${col};width:${Math.round(+x.points / max * 60)}px`; pts.append(sw, el('b', '', x.points));
      r.append(el('span', '', x.positionText || x.position), bar, el('b', '', x.Constructor.name), el('span', '', COUNTRY[x.Constructor.nationality] || ''), pts, el('span', 't', x.wins), el('span')); box.append(r);
    }
    if (!rows.length) box.append(el('div', 'hint', 'La saison n\'a pas encore commencé.'));
    main.replaceChildren(box);
  }
  // ---- les qualifications et les courses dans l'emploi du temps ----
  const hm = d => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  async function syncAgenda() {
    const evs = [];
    if (prefs.agenda) try {
      for (const r of (await loadRaces()).Races) for (const [k, n] of [['Qualifying', 'Qualifications'], ['Sprint', 'Sprint'], ['', 'Course']]) {
        const s = k ? r[k] : {date: r.date, time: r.time}; if (!s?.date || !s.time) continue; const d = when(s.date, s.time); if (d < Date.now() - 36e5) continue;
        evs.push({id: 'f1:' + r.round + ':' + (k || 'race'), kind: 'event', title: '🏁 F1 · ' + n + ' · ' + r.raceName.replace('Grand Prix', 'GP'), date: ymd(d), start: hm(d), end: hm(new Date(Math.min(d.getTime() + (k ? 3600e3 : 2 * 3600e3), new Date(ymd(d) + 'T23:59').getTime()))), allDay: false, color: '#e8002d', place: r.Circuit.circuitName});
      }
    } catch {}
    ctx.host.agenda?.sync('f1', evs);
  }
  $('f1Agenda').checked = !!prefs.agenda;
  $('f1Agenda').onchange = async () => { await save({agenda: $('f1Agenda').checked}); syncAgenda(); toast(prefs.agenda ? 'Les qualifications et les courses sont dans ton emploi du temps' : 'Les courses ne sont plus dans ton emploi du temps'); };
  $('f1Tabs').onclick = e => { const v = e.target.dataset.v; if (v) { tab = v; render(); } };
  console.assert(Object.keys(TRACKS).every(id => trackPts(id).length >= 6 && trackPts(id).flat().every(v => v >= 0 && v <= 20)) && trackPts('circuit_neuf').length === 9, 'f1 tracés');
  view.__f1 = {setRaces: r => { races = r; }, render, drawTrack, setTab: t => { tab = t; }};  // pour l'auto-test
  console.assert(teamCol('ferrari') === '#e8002d' && /^#[0-9a-f]{6}$/.test(teamCol('nouvelle_ecurie')), 'f1 teamCol');
  syncAgenda(); const agTimer = setInterval(syncAgenda, 6 * 3600e3);
  ctx.onOpen(() => render());
  ctx.onClose(() => { clearTimeout(timer); clearInterval(agTimer); });
}
