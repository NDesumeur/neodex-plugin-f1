// F1 : calendrier de la saison avec les horaires de chaque séance, résultats (course, qualifications, sprint) et classements pilotes et écuries (données Jolpica, la suite d'Ergast).
// Il tourne dans le bac à sable de NeoDex, avec ses outils d'interface (ctx.host) et seulement les autorisations de son plugin.json.
const HTML = `<div class="appWrap">
  <div class="agHead"><span class="label">Formule 1</span><span id="f1Season" class="f1Season"></span>
    <div class="agNav" id="f1Tabs"><button class="btn px" data-v="cal">CALENDRIER</button><button class="btn px" data-v="res">RÉSULTATS</button><button class="btn px" data-v="drv">PILOTES</button><button class="btn px" data-v="team">ÉCURIES</button></div></div>
  <label class="f1Cal"><input type="checkbox" id="f1Agenda"> Ajouter les qualifications et les courses à mon emploi du temps</label>
  <div id="f1Main"></div>
  <div class="hint">Données Jolpica (la suite d'Ergast), heures de Paris. L'étoile d'un pilote en fait ton pilote : il est mis en avant partout.</div>
</div>`;
const CSS = `#f1Tabs{margin-left:auto}#f1Tabs .btn.on{--c:var(--magenta);color:#fff}.f1Season{font-size:17px;color:#fff;margin-left:12px}
.f1Cal{display:flex;gap:8px;align-items:center;margin:6px 0 12px;color:var(--shell);font-size:14px}
.f1Next{flex-direction:row!important;gap:22px;align-items:center}.f1Next canvas{width:96px;height:96px;image-rendering:pixelated;flex:none}
.f1Big{font:18px var(--title);color:#fff;margin-bottom:6px}.f1Count{font:22px var(--title);color:var(--pink);margin:8px 0}
.f1Sess{display:grid;grid-template-columns:150px 1fr;gap:3px 14px;font-size:14px;color:var(--lilac)}.f1Sess b{color:#fff;font-weight:500}
.f1Grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;margin-top:18px}
.f1Race{gap:4px;cursor:var(--cp,pointer)}.f1Race:hover{--c:var(--violet)}.f1Race.done{opacity:.72}.f1Race.next{--c:var(--magenta)}
.f1Race .r{font:8px var(--title);color:var(--muted);letter-spacing:1px}.f1Race .n{color:#fff;font-size:15px}.f1Race .d{font-size:13px;color:var(--lilac)}.f1Race .w{font-size:13px;color:#ffd07a}
.f1Row{display:grid;grid-template-columns:30px 6px 1fr 1fr 70px 60px 26px;gap:8px;align-items:center;font-size:14px;color:var(--lilac);padding:4px 0;border-top:1px solid rgba(255,255,255,.05)}
.f1Row.head{font:7px var(--title);letter-spacing:1px;color:var(--muted);border:0}.f1Row b{color:#fff;font-weight:600}.f1Row i{height:18px}.f1Row.fav{background:rgba(var(--mgr),.14)}
.f1Row .t{text-align:right}.f1Pts{display:flex;align-items:center;gap:6px}.f1Pts span{height:8px;background:var(--c,#888)}
.f1Star{all:unset;cursor:var(--cp,pointer);color:var(--muted);font-size:15px;text-align:center}.f1Star:hover,.f1Star.on{color:#ffd07a}
.f1Pick{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;align-items:center}.f1Pick select{background:var(--bg2,#14102a);color:#fff;border:2px solid var(--line2,#3a2f6a);font:13px var(--body,inherit);padding:4px 6px}
.f1Pick .btn.on{--c:var(--magenta);color:#fff}
#f1Main .sysCard{align-self:stretch}`;
// couleurs des écuries (identifiant Ergast) ; une écurie inconnue reçoit une couleur tirée de son nom
const TEAM_COL = {red_bull: '#3671c6', ferrari: '#e8002d', mercedes: '#27f4d2', mclaren: '#ff8000', aston_martin: '#229971', alpine: '#00a1e8', williams: '#64c4ff', rb: '#6692ff', racing_bulls: '#6692ff', sauber: '#52e252', audi: '#bb0a30', haas: '#b6babd', cadillac: '#c8a85a'};
const teamCol = id => TEAM_COL[id] || '#' + [...String(id)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(16).padEnd(6, '8').slice(0, 6);
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
    draw(); return c;
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
      info.append(ss); box.append(flag(), info); nodes.push(box); setTimeout(tick);
    }
    const grid = el('div', 'f1Grid'), winners = get('current/results/1.json?limit=100').then(j => new Map(j.RaceTable.Races.map(r => [r.round, r.Results[0]]))).catch(() => new Map());  // tous les vainqueurs en une demande
    for (const r of list) {
      const done = raceEnd(r) < now, c = el('div', 'sysCard px f1Race' + (done ? ' done' : '') + (r === next ? ' next' : ''));
      c.append(el('span', 'r', 'MANCHE ' + r.round + (r.Sprint ? ' · SPRINT' : '')), el('span', 'n', r.raceName.replace('Grand Prix', 'GP')), el('span', 'd', fmt(when(r.date, r.time), {day: 'numeric', month: 'long'}) + ' · ' + r.Circuit.Location.locality));
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
  console.assert(teamCol('ferrari') === '#e8002d' && /^#[0-9a-f]{6}$/.test(teamCol('nouvelle_ecurie')), 'f1 teamCol');
  syncAgenda(); const agTimer = setInterval(syncAgenda, 6 * 3600e3);
  ctx.onOpen(() => render());
  ctx.onClose(() => { clearTimeout(timer); clearInterval(agTimer); });
}
