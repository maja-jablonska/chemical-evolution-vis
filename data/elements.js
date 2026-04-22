// Periodic table data — Z, symbol, name, grid row/col, dominant process(es), and
// process fractions (BBN, CNO, alpha, FePeak_CCSN, SNIa, s-process, r-process).
// Fractions are *representative schematic* values distilled from Burbidge^2 Fowler Hoyle,
// Arnett, Nomoto+, Thielemann+, Sneden+, Karakas & Lattanzio, Kobayashi+, etc.
// They are for intuition, not for papers. Ordered so they sum to ~1.0.

// Process keys
window.PROCESSES = [
  { key: 'bbn',   label: 'Big Bang (BBN)',              color: '#9ab5ff', short: 'BBN'  },
  { key: 'cno',   label: 'CNO / H-burning',             color: '#6ad0c2', short: 'CNO'  },
  { key: 'alpha', label: 'α-capture (CCSN, hydrostatic)', color: '#e8c46a', short: 'α'    },
  { key: 'fepk',  label: 'Fe-peak from CCSN',           color: '#e89a5a', short: 'CCSN' },
  { key: 'snia',  label: 'Type Ia supernova',           color: '#e87a7a', short: 'SN Ia'},
  { key: 's',     label: 's-process (AGB)',             color: '#b67ae8', short: 's'    },
  { key: 'r',     label: 'r-process (NSM / rare CCSN)', color: '#e87ac8', short: 'r'    },
];

// Helper to build an element row
function E(Z, sym, name, row, col, frac, note = '') {
  return { Z, sym, name, row, col, frac, note };
}

// frac order: [bbn, cno, alpha, fepk, snia, s, r]
// Missing entries -> 0.
function F(o) {
  const k = ['bbn','cno','alpha','fepk','snia','s','r'];
  const out = {};
  for (const key of k) out[key] = o[key] || 0;
  // normalize tiny rounding
  const s = Object.values(out).reduce((a,b)=>a+b,0);
  if (s > 0) for (const key of k) out[key] /= s;
  return out;
}

window.ELEMENTS = [
  // Row 1
  E(1,  'H',  'Hydrogen',  1, 1,  F({bbn: 0.92, cno: 0.08})),
  E(2,  'He', 'Helium',    1, 18, F({bbn: 0.75, cno: 0.25}), 'BBN + H-burning in stars'),

  // Row 2
  E(3,  'Li', 'Lithium',   2, 1,  F({bbn: 0.7, s: 0.2, cno: 0.1}), 'Mostly BBN; also AGB & novae'),
  E(4,  'Be', 'Beryllium', 2, 2,  F({alpha: 0.05, cno: 0.95}), 'Cosmic-ray spallation (mapped to CNO bin here)'),
  E(5,  'B',  'Boron',     2, 13, F({alpha: 0.05, cno: 0.95}), 'Cosmic-ray spallation'),
  E(6,  'C',  'Carbon',    2, 14, F({cno: 0.5, alpha: 0.3, s: 0.2}), 'He-burning + AGB dredge-up'),
  E(7,  'N',  'Nitrogen',  2, 15, F({cno: 0.85, s: 0.15}), 'CNO cycle + AGB HBB'),
  E(8,  'O',  'Oxygen',    2, 16, F({alpha: 0.9, cno: 0.1}), 'Hydrostatic He/Ne burning → CCSN'),
  E(9,  'F',  'Fluorine',  2, 17, F({s: 0.6, alpha: 0.2, cno: 0.2}), 'AGB + ν-process'),
  E(10, 'Ne', 'Neon',      2, 18, F({alpha: 0.95, cno: 0.05})),

  // Row 3
  E(11, 'Na', 'Sodium',    3, 1,  F({cno: 0.4, alpha: 0.5, s: 0.1}), 'NeNa cycle + C-burning'),
  E(12, 'Mg', 'Magnesium', 3, 2,  F({alpha: 0.95, fepk: 0.05}), 'Classic α-element, CCSN'),
  E(13, 'Al', 'Aluminum',  3, 13, F({cno: 0.3, alpha: 0.6, s: 0.1}), 'MgAl cycle + C/Ne burning'),
  E(14, 'Si', 'Silicon',   3, 14, F({alpha: 0.7, snia: 0.3}), 'α-element, incomplete Si-burning'),
  E(15, 'P',  'Phosphorus',3, 15, F({alpha: 0.6, fepk: 0.2, s: 0.2})),
  E(16, 'S',  'Sulfur',    3, 16, F({alpha: 0.7, snia: 0.3}), 'α-element'),
  E(17, 'Cl', 'Chlorine',  3, 17, F({alpha: 0.6, snia: 0.3, s: 0.1})),
  E(18, 'Ar', 'Argon',     3, 18, F({alpha: 0.6, snia: 0.4}), 'α-element'),

  // Row 4
  E(19, 'K',  'Potassium', 4, 1,  F({alpha: 0.7, fepk: 0.3})),
  E(20, 'Ca', 'Calcium',   4, 2,  F({alpha: 0.6, snia: 0.4}), 'α-element'),
  E(21, 'Sc', 'Scandium',  4, 3,  F({fepk: 0.7, alpha: 0.3}), 'Sub-iron-peak'),
  E(22, 'Ti', 'Titanium',  4, 4,  F({alpha: 0.5, fepk: 0.3, snia: 0.2}), 'Often tracked as α'),
  E(23, 'V',  'Vanadium',  4, 5,  F({fepk: 0.6, snia: 0.4})),
  E(24, 'Cr', 'Chromium',  4, 6,  F({fepk: 0.3, snia: 0.7})),
  E(25, 'Mn', 'Manganese', 4, 7,  F({fepk: 0.2, snia: 0.8}), 'SN Ia tracer'),
  E(26, 'Fe', 'Iron',      4, 8,  F({fepk: 0.35, snia: 0.65}), 'Metallicity anchor'),
  E(27, 'Co', 'Cobalt',    4, 9,  F({fepk: 0.6, snia: 0.4})),
  E(28, 'Ni', 'Nickel',    4, 10, F({fepk: 0.3, snia: 0.7})),
  E(29, 'Cu', 'Copper',    4, 11, F({fepk: 0.3, s: 0.5, snia: 0.2}), 'Weak s in massive stars'),
  E(30, 'Zn', 'Zinc',      4, 12, F({fepk: 0.5, s: 0.3, snia: 0.2}), 'α-rich freezeout tracer'),
  E(31, 'Ga', 'Gallium',   4, 13, F({s: 0.6, fepk: 0.2, r: 0.2})),
  E(32, 'Ge', 'Germanium', 4, 14, F({s: 0.5, fepk: 0.2, r: 0.3})),
  E(33, 'As', 'Arsenic',   4, 15, F({s: 0.4, r: 0.6})),
  E(34, 'Se', 'Selenium',  4, 16, F({s: 0.3, r: 0.7})),
  E(35, 'Br', 'Bromine',   4, 17, F({s: 0.3, r: 0.7})),
  E(36, 'Kr', 'Krypton',   4, 18, F({s: 0.5, r: 0.5})),

  // Row 5
  E(37, 'Rb', 'Rubidium',  5, 1,  F({s: 0.5, r: 0.5})),
  E(38, 'Sr', 'Strontium', 5, 2,  F({s: 0.85, r: 0.15}), '1st s-peak (light s)'),
  E(39, 'Y',  'Yttrium',   5, 3,  F({s: 0.75, r: 0.25}), 'Light s'),
  E(40, 'Zr', 'Zirconium', 5, 4,  F({s: 0.8, r: 0.2}),   'Light s'),
  E(41, 'Nb', 'Niobium',   5, 5,  F({s: 0.5, r: 0.5})),
  E(42, 'Mo', 'Molybdenum',5, 6,  F({s: 0.5, r: 0.5})),
  E(43, 'Tc', 'Technetium',5, 7,  F({s: 1.0}), 'Radioactive — direct AGB s-process proof'),
  E(44, 'Ru', 'Ruthenium', 5, 8,  F({s: 0.3, r: 0.7})),
  E(45, 'Rh', 'Rhodium',   5, 9,  F({s: 0.1, r: 0.9})),
  E(46, 'Pd', 'Palladium', 5, 10, F({s: 0.4, r: 0.6})),
  E(47, 'Ag', 'Silver',    5, 11, F({s: 0.2, r: 0.8})),
  E(48, 'Cd', 'Cadmium',   5, 12, F({s: 0.5, r: 0.5})),
  E(49, 'In', 'Indium',    5, 13, F({s: 0.3, r: 0.7})),
  E(50, 'Sn', 'Tin',       5, 14, F({s: 0.7, r: 0.3})),
  E(51, 'Sb', 'Antimony',  5, 15, F({s: 0.4, r: 0.6})),
  E(52, 'Te', 'Tellurium', 5, 16, F({s: 0.2, r: 0.8})),
  E(53, 'I',  'Iodine',    5, 17, F({s: 0.1, r: 0.9})),
  E(54, 'Xe', 'Xenon',     5, 18, F({s: 0.4, r: 0.6})),

  // Row 6 — lanthanides sit in separate strip
  E(55, 'Cs', 'Cesium',    6, 1,  F({s: 0.2, r: 0.8})),
  E(56, 'Ba', 'Barium',    6, 2,  F({s: 0.85, r: 0.15}), '2nd s-peak'),
  E(57, 'La', 'Lanthanum', 6, 3,  F({s: 0.7, r: 0.3})),
  E(58, 'Ce', 'Cerium',    9, 4,  F({s: 0.8, r: 0.2})),
  E(59, 'Pr', 'Praseodymium', 9, 5, F({s: 0.5, r: 0.5})),
  E(60, 'Nd', 'Neodymium', 9, 6,  F({s: 0.55, r: 0.45})),
  E(61, 'Pm', 'Promethium',9, 7,  F({r: 1.0}), 'Extinct — no stable isotope'),
  E(62, 'Sm', 'Samarium',  9, 8,  F({s: 0.3, r: 0.7})),
  E(63, 'Eu', 'Europium',  9, 9,  F({s: 0.05, r: 0.95}), 'Classic r-process tracer'),
  E(64, 'Gd', 'Gadolinium',9, 10, F({s: 0.15, r: 0.85})),
  E(65, 'Tb', 'Terbium',   9, 11, F({s: 0.1, r: 0.9})),
  E(66, 'Dy', 'Dysprosium',9, 12, F({s: 0.15, r: 0.85})),
  E(67, 'Ho', 'Holmium',   9, 13, F({s: 0.05, r: 0.95})),
  E(68, 'Er', 'Erbium',    9, 14, F({s: 0.2, r: 0.8})),
  E(69, 'Tm', 'Thulium',   9, 15, F({s: 0.05, r: 0.95})),
  E(70, 'Yb', 'Ytterbium', 9, 16, F({s: 0.3, r: 0.7})),
  E(71, 'Lu', 'Lutetium',  9, 17, F({s: 0.2, r: 0.8})),
  E(72, 'Hf', 'Hafnium',   6, 4,  F({s: 0.5, r: 0.5})),
  E(73, 'Ta', 'Tantalum',  6, 5,  F({s: 0.3, r: 0.7})),
  E(74, 'W',  'Tungsten',  6, 6,  F({s: 0.6, r: 0.4})),
  E(75, 'Re', 'Rhenium',   6, 7,  F({s: 0.1, r: 0.9})),
  E(76, 'Os', 'Osmium',    6, 8,  F({s: 0.1, r: 0.9})),
  E(77, 'Ir', 'Iridium',   6, 9,  F({s: 0.02, r: 0.98})),
  E(78, 'Pt', 'Platinum',  6, 10, F({s: 0.05, r: 0.95}), '3rd r-process peak'),
  E(79, 'Au', 'Gold',      6, 11, F({s: 0.1, r: 0.9})),
  E(80, 'Hg', 'Mercury',   6, 12, F({s: 0.7, r: 0.3})),
  E(81, 'Tl', 'Thallium',  6, 13, F({s: 0.8, r: 0.2})),
  E(82, 'Pb', 'Lead',      6, 14, F({s: 0.85, r: 0.15}), '3rd s-peak, end of s-process'),
  E(83, 'Bi', 'Bismuth',   6, 15, F({s: 0.3, r: 0.7})),

  // Row 7 — actinides strip (cosmo-chronometers)
  E(90, 'Th', 'Thorium',   10, 10, F({r: 1.0}), 'Cosmochronometer'),
  E(92, 'U',  'Uranium',   10, 12, F({r: 1.0}), 'Cosmochronometer'),
];

// Atomic number ranges
window.ATOMIC_RANGE = { min: 1, max: 92 };
