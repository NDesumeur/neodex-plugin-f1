// lancé par le test « local » de NeoDex : un calendrier intégré (sans réseau), le tracé pixel art de chaque circuit, la voiture qui tourne, les textes lisibles, rien ne déborde
module.exports = async ({ pj, sleep }) => {
  await sleep(800);
  const races = { season: '2027', Races: [
    { round: '1', raceName: 'Italian Grand Prix', date: '2027-09-05', time: '13:00:00Z', Qualifying: { date: '2027-09-04', time: '14:00:00Z' }, Circuit: { circuitId: 'monza', circuitName: 'Autodromo Nazionale di Monza', Location: { locality: 'Monza', country: 'Italy' } } },
    { round: '2', raceName: 'Monaco Grand Prix', date: '2027-09-19', time: '13:00:00Z', Circuit: { circuitId: 'monaco', circuitName: 'Circuit de Monaco', Location: { locality: 'Monte-Carlo', country: 'Monaco' } } },
    { round: '3', raceName: 'Nouveau Grand Prix', date: '2027-10-03', time: '13:00:00Z', Sprint: { date: '2027-10-02', time: '13:00:00Z' }, Circuit: { circuitId: 'circuit_neuf', circuitName: 'Circuit neuf', Location: { locality: 'Ailleurs', country: 'France' } } } ] };
  await pj(`(() => { const v = document.querySelector('.appWrap').parentElement; v.__f1.setRaces(${JSON.stringify(races)}); v.__f1.setTab('cal'); v.__f1.render(); })(), 0`);
  await sleep(500);
  const r = await pj(`(() => {
    const cs = [...document.querySelectorAll('.f1Race canvas.trk')], big = document.querySelector('.f1Next canvas.trk');
    const lit = c => { const d = c.getContext('2d').getImageData(0, 0, 64, 40).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 200 && d[i + 2] > 200) n++; return n; };
    const pink = c => { const d = c.getContext('2d').getImageData(0, 0, 64, 40).data; for (let i = 0; i < d.length; i += 4) if (d[i] === 255 && d[i + 1] === 79) return (i / 4) % 64 + ',' + Math.floor(i / 256); return null; };
    const over = [...document.querySelectorAll('.appWrap *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).length;
    return { n: cs.length, lit: cs.map(lit), ids: cs.map(c => c.dataset.id), big: !!big && lit(big), car: big && pink(big), bigW: big && Math.round(big.getBoundingClientRect().width),
      rFont: parseFloat(getComputedStyle(document.querySelector('.f1Race .r')).fontSize), over };
  })()`);
  if (r.n !== 3 || r.lit.some(n => n < 40)) throw new Error('vignettes des circuits : ' + JSON.stringify(r));
  if (!r.big || !r.car) throw new Error('tracé du prochain GP ou voiture absents : ' + JSON.stringify(r));
  await sleep(400);
  const car2 = await pj(`(() => { const d = document.querySelector('.f1Next canvas.trk').getContext('2d').getImageData(0, 0, 64, 40).data; for (let i = 0; i < d.length; i += 4) if (d[i] === 255 && d[i + 1] === 79) return (i / 4) % 64 + ',' + Math.floor(i / 256); return null; })()`);
  if (car2 === r.car) throw new Error('la voiture ne bouge pas : ' + car2);
  if (r.rFont < 10) throw new Error('texte des manches trop petit : ' + r.rFont);
  if (r.over) throw new Error(r.over + ' élément(s) débordent à droite');
  return '3 circuits en pixel art (' + r.ids.join(', ') + '), tracé du prochain GP de ' + r.bigW + ' px avec la voiture qui tourne, manches en ' + r.rFont + ' px';
};
