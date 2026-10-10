import { R_DEFAULT as R, P_UNITS, V_UNITS, P_INPUT, V_INPUT, parseInput, solve, toBase, pickUnit, fmtNum, fmtDbm, fmtAuto, fmtBase } from './core.js';

const $ = (id) => document.getElementById(id);
const F = {
  dbm: { input: $('dbm') },
  w: { input: $('w'), unit: $('w-unit'), units: P_UNITS, allowed: P_INPUT, nonNeg: true },
  v: { input: $('v'), unit: $('v-unit'), units: V_UNITS, allowed: V_INPUT, nonNeg: true },
};
const fill = (sel, names, def) => { for (const n of names) sel.add(new Option(n, n)); sel.value = def; };
fill(F.w.unit, P_INPUT, 'mW');
fill(F.v.unit, V_INPUT, 'V');

const setError = (k, msg = '') => {
  F[k].input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  $(`${k}-err`).textContent = msg;
};
const out = (id, text) => { $(id).textContent = text; };
const clearResults = () => ['r-dbm', 'r-w-auto', 'r-w-base', 'r-v-auto', 'r-v-base'].forEach((id) => out(id, '—'));

// Writes a computed value into a non-source field, in the best unit that field allows.
function write(k, x) {
  const f = F[k];
  if (x === 0) { f.input.value = '0'; f.unit.value = f.units.find((u) => u[1] === 1)[0]; return; }
  const [name, scale] = pickUnit(x, f.units.filter((u) => f.allowed.includes(u[0])));
  f.unit.value = name;
  f.input.value = fmtNum(x / scale);
}

function show(src, s) {
  for (const k of Object.keys(F)) if (k !== src) setError(k);
  if (src !== 'dbm') F.dbm.input.value = fmtDbm(s.dbm);
  if (src !== 'w') write('w', s.w);
  if (src !== 'v') write('v', s.v);
  out('r-dbm', `${fmtDbm(s.dbm)} dBm`);
  out('r-w-auto', fmtAuto(s.w, P_UNITS));
  out('r-w-base', fmtBase(s.w, 'W'));
  out('r-v-auto', fmtAuto(s.v, V_UNITS));
  out('r-v-base', fmtBase(s.v, 'V'));
}

function update(k) {
  const f = F[k];
  const p = parseInput(f.input.value, { nonNegative: !!f.nonNeg });
  setError(k, p.error);
  if (p.error) return;
  if (p.empty) {
    for (const o of Object.keys(F)) if (o !== k) { F[o].input.value = ''; setError(o); }
    clearResults();
    return;
  }
  show(k, solve(k, k === 'dbm' ? p.value : toBase(p.value, f.unit.value), R));
}

for (const k of Object.keys(F)) {
  F[k].input.addEventListener('input', () => update(k));
  F[k].unit?.addEventListener('change', () => update(k));
}

clearResults();
