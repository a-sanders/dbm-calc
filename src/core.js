// Calculation core. No DOM access; the load resistance R is always a parameter.
export const R_DEFAULT = 50;

export const dbmToW = (dbm) => 10 ** (dbm / 10) / 1000;
export const wToDbm = (w) => (w > 0 ? 10 * Math.log10(w * 1000) : -Infinity);
export const wToV = (w, r = R_DEFAULT) => Math.sqrt(w * r);
export const vToW = (v, r = R_DEFAULT) => (v * v) / r;

/** kind: 'dbm' | 'w' | 'v'; x is in dBm, W or V. Returns { dbm, w, v }. */
export function solve(kind, x, r = R_DEFAULT) {
  const w = kind === 'dbm' ? dbmToW(x) : kind === 'w' ? x : vToW(x, r);
  return { dbm: kind === 'dbm' ? x : wToDbm(w), w, v: kind === 'v' ? x : wToV(w, r) };
}

// ---- units -----------------------------------------------------------------
export const P_UNITS = [['fW', 1e-15], ['pW', 1e-12], ['nW', 1e-9], ['µW', 1e-6], ['mW', 1e-3], ['W', 1], ['kW', 1e3], ['MW', 1e6]];
export const V_UNITS = [['nV', 1e-9], ['µV', 1e-6], ['mV', 1e-3], ['V', 1], ['kV', 1e3]];
export const P_INPUT = ['µW', 'mW', 'W'];
export const V_INPUT = ['nV', 'µV', 'mV', 'V', 'kV'];
const SCALE = Object.fromEntries([...P_UNITS, ...V_UNITS]);
export const toBase = (n, unit) => n * SCALE[unit];

/** Largest unit whose scale is <= |x| (boundary belongs to the larger unit); falls back to the smallest. */
export function pickUnit(x, units) {
  const a = Math.abs(x);
  for (let i = units.length - 1; i > 0; i--) if (a >= units[i][1] * (1 - 1e-12)) return units[i];
  return units[0];
}

// ---- formatting (FR-0: never scientific notation) -----------------------------
const trim = (s) => (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s);

function plain(s) {
  if (!/e/i.test(s)) return trim(s);
  let [m, e] = s.toLowerCase().split('e');
  const neg = m[0] === '-';
  if (neg) m = m.slice(1);
  const [i, f = ''] = m.split('.');
  const digits = i + f;
  const pos = i.length + Number(e);
  const out = pos <= 0 ? `0.${'0'.repeat(-pos)}${digits}`
    : pos >= digits.length ? digits + '0'.repeat(pos - digits.length)
    : `${digits.slice(0, pos)}.${digits.slice(pos)}`;
  return (neg ? '-' : '') + trim(out);
}

export function fmtNum(x, sig = 4) {
  if (x === 0) return '0';
  if (!Number.isFinite(x)) return x > 0 ? '∞' : '−∞';
  return plain(x.toPrecision(sig));
}
export function fmtDbm(d) {
  if (d === -Infinity) return '−∞';
  if (!Number.isFinite(d)) return '∞';
  const s = d.toFixed(2);
  return s === '-0.00' ? '0.00' : s;
}
export const fmtBase = (x, name) => `${fmtNum(x)} ${name}`;
export function fmtAuto(x, units) {
  if (x === 0) return `0 ${units.find((u) => u[1] === 1)[0]}`;
  if (!Number.isFinite(x)) return fmtNum(x);
  const [name, scale] = pickUnit(x, units);
  return `${fmtNum(x / scale)} ${name}`;
}

// ---- input parsing (FR-6) ---------------------------------------------------------
export function parseInput(text, { nonNegative = false } = {}) {
  const t = String(text).trim().replace(/,/g, '.');
  if (t === '') return { empty: true };
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(t)) return { error: 'Enter a number' };
  const value = Number(t);
  if (!Number.isFinite(value)) return { error: 'Number is too large' };
  if (nonNegative && value < 0) return { error: 'Value cannot be negative' };
  return { value };
}
