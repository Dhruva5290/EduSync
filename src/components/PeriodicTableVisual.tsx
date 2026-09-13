import React, { useState } from 'react';

interface ElementInfo {
  num: number;
  symbol: string;
  name: string;
  mass: string;
  category: 'alkali' | 'alkaline' | 'transition' | 'post-transition' | 'metalloid' | 'nonmetal' | 'halogen' | 'noble' | 'lanthanide' | 'actinide';
  row: number;
  col: number;
}

export const PeriodicTableVisual: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>({
    num: 17,
    symbol: 'Cl',
    name: 'Chlorine',
    mass: '35.45',
    category: 'halogen',
    row: 3,
    col: 17,
  });

  // Category Color Map (matching scientific textbook palette)
  const categoryColors: Record<ElementInfo['category'], string> = {
    alkali: 'bg-[#fecdd3] text-[#9f1239] border-[#fda4af]', // pinkish red
    alkaline: 'bg-[#fed7aa] text-[#9a3412] border-[#fdba74]', // orange
    transition: 'bg-[#bae6fd] text-[#0369a1] border-[#7dd3fc]', // light sky blue (d-block)
    'post-transition': 'bg-[#bbf7d0] text-[#166534] border-[#86efac]', // light green
    metalloid: 'bg-[#a7f3d0] text-[#065f46] border-[#6ee7b7]', // teal green
    nonmetal: 'bg-[#fef08a] text-[#854d0e] border-[#fde047]', // light yellow
    halogen: 'bg-[#fef9c3] text-[#a16207] border-[#fef08a]', // yellow
    noble: 'bg-[#e9d5ff] text-[#6b21a8] border-[#d8b4fe]', // light purple
    lanthanide: 'bg-[#ccfbf1] text-[#0f766e] border-[#99f6e4]', // mint
    actinide: 'bg-[#cffafe] text-[#155e75] border-[#a5f3fc]', // cyan
  };

  // Curated periodic table elements
  const elements: ElementInfo[] = [
    // Period 1
    { num: 1, symbol: 'H', name: 'Hydrogen', mass: '1.008', category: 'nonmetal', row: 1, col: 1 },
    { num: 2, symbol: 'He', name: 'Helium', mass: '4.003', category: 'noble', row: 1, col: 18 },

    // Period 2
    { num: 3, symbol: 'Li', name: 'Lithium', mass: '6.94', category: 'alkali', row: 2, col: 1 },
    { num: 4, symbol: 'Be', name: 'Beryllium', mass: '9.012', category: 'alkaline', row: 2, col: 2 },
    { num: 5, symbol: 'B', name: 'Boron', mass: '10.81', category: 'metalloid', row: 2, col: 13 },
    { num: 6, symbol: 'C', name: 'Carbon', mass: '12.011', category: 'nonmetal', row: 2, col: 14 },
    { num: 7, symbol: 'N', name: 'Nitrogen', mass: '14.007', category: 'nonmetal', row: 2, col: 15 },
    { num: 8, symbol: 'O', name: 'Oxygen', mass: '15.999', category: 'nonmetal', row: 2, col: 16 },
    { num: 9, symbol: 'F', name: 'Fluorine', mass: '18.998', category: 'halogen', row: 2, col: 17 },
    { num: 10, symbol: 'Ne', name: 'Neon', mass: '20.180', category: 'noble', row: 2, col: 18 },

    // Period 3
    { num: 11, symbol: 'Na', name: 'Sodium', mass: '22.990', category: 'alkali', row: 3, col: 1 },
    { num: 12, symbol: 'Mg', name: 'Magnesium', mass: '24.305', category: 'alkaline', row: 3, col: 2 },
    { num: 13, symbol: 'Al', name: 'Aluminium', mass: '26.982', category: 'post-transition', row: 3, col: 13 },
    { num: 14, symbol: 'Si', name: 'Silicon', mass: '28.085', category: 'metalloid', row: 3, col: 14 },
    { num: 15, symbol: 'P', name: 'Phosphorus', mass: '30.974', category: 'nonmetal', row: 3, col: 15 },
    { num: 16, symbol: 'S', name: 'Sulfur', mass: '32.06', category: 'nonmetal', row: 3, col: 16 },
    { num: 17, symbol: 'Cl', name: 'Chlorine', mass: '35.45', category: 'halogen', row: 3, col: 17 },
    { num: 18, symbol: 'Ar', name: 'Argon', mass: '39.948', category: 'noble', row: 3, col: 18 },

    // Period 4
    { num: 19, symbol: 'K', name: 'Potassium', mass: '39.098', category: 'alkali', row: 4, col: 1 },
    { num: 20, symbol: 'Ca', name: 'Calcium', mass: '40.078', category: 'alkaline', row: 4, col: 2 },
    { num: 21, symbol: 'Sc', name: 'Scandium', mass: '44.956', category: 'transition', row: 4, col: 3 },
    { num: 22, symbol: 'Ti', name: 'Titanium', mass: '47.867', category: 'transition', row: 4, col: 4 },
    { num: 23, symbol: 'V', name: 'Vanadium', mass: '50.942', category: 'transition', row: 4, col: 5 },
    { num: 24, symbol: 'Cr', name: 'Chromium', mass: '51.996', category: 'transition', row: 4, col: 6 },
    { num: 25, symbol: 'Mn', name: 'Manganese', mass: '54.938', category: 'transition', row: 4, col: 7 },
    { num: 26, symbol: 'Fe', name: 'Iron', mass: '55.845', category: 'transition', row: 4, col: 8 },
    { num: 27, symbol: 'Co', name: 'Cobalt', mass: '58.933', category: 'transition', row: 4, col: 9 },
    { num: 28, symbol: 'Ni', name: 'Nickel', mass: '58.693', category: 'transition', row: 4, col: 10 },
    { num: 29, symbol: 'Cu', name: 'Copper', mass: '63.546', category: 'transition', row: 4, col: 11 },
    { num: 30, symbol: 'Zn', name: 'Zinc', mass: '65.38', category: 'transition', row: 4, col: 12 },
    { num: 31, symbol: 'Ga', name: 'Gallium', mass: '69.723', category: 'post-transition', row: 4, col: 13 },
    { num: 32, symbol: 'Ge', name: 'Germanium', mass: '72.630', category: 'metalloid', row: 4, col: 14 },
    { num: 33, symbol: 'As', name: 'Arsenic', mass: '74.922', category: 'metalloid', row: 4, col: 15 },
    { num: 34, symbol: 'Se', name: 'Selenium', mass: '78.971', category: 'nonmetal', row: 4, col: 16 },
    { num: 35, symbol: 'Br', name: 'Bromine', mass: '79.904', category: 'halogen', row: 4, col: 17 },
    { num: 36, symbol: 'Kr', name: 'Krypton', mass: '83.798', category: 'noble', row: 4, col: 18 },

    // Period 5
    { num: 37, symbol: 'Rb', name: 'Rubidium', mass: '85.468', category: 'alkali', row: 5, col: 1 },
    { num: 38, symbol: 'Sr', name: 'Strontium', mass: '87.62', category: 'alkaline', row: 5, col: 2 },
    { num: 39, symbol: 'Y', name: 'Yttrium', mass: '88.906', category: 'transition', row: 5, col: 3 },
    { num: 40, symbol: 'Zr', name: 'Zirconium', mass: '91.224', category: 'transition', row: 5, col: 4 },
    { num: 41, symbol: 'Nb', name: 'Niobium', mass: '92.906', category: 'transition', row: 5, col: 5 },
    { num: 42, symbol: 'Mo', name: 'Molybdenum', mass: '95.95', category: 'transition', row: 5, col: 6 },
    { num: 43, symbol: 'Tc', name: 'Technetium', mass: '[98]', category: 'transition', row: 5, col: 7 },
    { num: 44, symbol: 'Ru', name: 'Ruthenium', mass: '101.07', category: 'transition', row: 5, col: 8 },
    { num: 45, symbol: 'Rh', name: 'Rhodium', mass: '102.91', category: 'transition', row: 5, col: 9 },
    { num: 46, symbol: 'Pd', name: 'Palladium', mass: '106.42', category: 'transition', row: 5, col: 10 },
    { num: 47, symbol: 'Ag', name: 'Silver', mass: '107.87', category: 'transition', row: 5, col: 11 },
    { num: 48, symbol: 'Cd', name: 'Cadmium', mass: '112.41', category: 'transition', row: 5, col: 12 },
    { num: 49, symbol: 'In', name: 'Indium', mass: '114.82', category: 'post-transition', row: 5, col: 13 },
    { num: 50, symbol: 'Sn', name: 'Tin', mass: '118.71', category: 'post-transition', row: 5, col: 14 },
    { num: 51, symbol: 'Sb', name: 'Antimony', mass: '121.76', category: 'metalloid', row: 5, col: 15 },
    { num: 52, symbol: 'Te', name: 'Tellurium', mass: '127.60', category: 'metalloid', row: 5, col: 16 },
    { num: 53, symbol: 'I', name: 'Iodine', mass: '126.90', category: 'halogen', row: 5, col: 17 },
    { num: 54, symbol: 'Xe', name: 'Xenon', mass: '131.29', category: 'noble', row: 5, col: 18 },

    // Period 6
    { num: 55, symbol: 'Cs', name: 'Caesium', mass: '132.91', category: 'alkali', row: 6, col: 1 },
    { num: 56, symbol: 'Ba', name: 'Barium', mass: '137.33', category: 'alkaline', row: 6, col: 2 },
    { num: 72, symbol: 'Hf', name: 'Hafnium', mass: '178.49', category: 'transition', row: 6, col: 4 },
    { num: 73, symbol: 'Ta', name: 'Tantalum', mass: '180.95', category: 'transition', row: 6, col: 5 },
    { num: 74, symbol: 'W', name: 'Tungsten', mass: '183.84', category: 'transition', row: 6, col: 6 },
    { num: 75, symbol: 'Re', name: 'Rhenium', mass: '186.21', category: 'transition', row: 6, col: 7 },
    { num: 76, symbol: 'Os', name: 'Osmium', mass: '190.23', category: 'transition', row: 6, col: 8 },
    { num: 77, symbol: 'Ir', name: 'Iridium', mass: '192.22', category: 'transition', row: 6, col: 9 },
    { num: 78, symbol: 'Pt', name: 'Platinum', mass: '195.08', category: 'transition', row: 6, col: 10 },
    { num: 79, symbol: 'Au', name: 'Gold', mass: '196.97', category: 'transition', row: 6, col: 11 },
    { num: 80, symbol: 'Hg', name: 'Mercury', mass: '200.59', category: 'transition', row: 6, col: 12 },
    { num: 81, symbol: 'Tl', name: 'Thallium', mass: '204.38', category: 'post-transition', row: 6, col: 13 },
    { num: 82, symbol: 'Pb', name: 'Lead', mass: '207.2', category: 'post-transition', row: 6, col: 14 },
    { num: 83, symbol: 'Bi', name: 'Bismuth', mass: '208.98', category: 'post-transition', row: 6, col: 15 },
    { num: 84, symbol: 'Po', name: 'Polonium', mass: '[209]', category: 'post-transition', row: 6, col: 16 },
    { num: 85, symbol: 'At', name: 'Astatine', mass: '[210]', category: 'halogen', row: 6, col: 17 },
    { num: 86, symbol: 'Rn', name: 'Radon', mass: '[222]', category: 'noble', row: 6, col: 18 },

    // Period 7
    { num: 87, symbol: 'Fr', name: 'Francium', mass: '[223]', category: 'alkali', row: 7, col: 1 },
    { num: 88, symbol: 'Ra', name: 'Radium', mass: '[226]', category: 'alkaline', row: 7, col: 2 },
    { num: 104, symbol: 'Rf', name: 'Rutherfordium', mass: '[267]', category: 'transition', row: 7, col: 4 },
    { num: 105, symbol: 'Db', name: 'Dubnium', mass: '[268]', category: 'transition', row: 7, col: 5 },
    { num: 106, symbol: 'Sg', name: 'Seaborgium', mass: '[269]', category: 'transition', row: 7, col: 6 },
    { num: 107, symbol: 'Bh', name: 'Bohrium', mass: '[270]', category: 'transition', row: 7, col: 7 },
    { num: 108, symbol: 'Hs', name: 'Hassium', mass: '[269]', category: 'transition', row: 7, col: 8 },
    { num: 109, symbol: 'Mt', name: 'Meitnerium', mass: '[278]', category: 'transition', row: 7, col: 9 },
    { num: 110, symbol: 'Ds', name: 'Darmstadtium', mass: '[281]', category: 'transition', row: 7, col: 10 },
    { num: 111, symbol: 'Rg', name: 'Roentgenium', mass: '[282]', category: 'transition', row: 7, col: 11 },
    { num: 112, symbol: 'Cn', name: 'Copernicium', mass: '[285]', category: 'transition', row: 7, col: 12 },
    { num: 113, symbol: 'Nh', name: 'Nihonium', mass: '[286]', category: 'post-transition', row: 7, col: 13 },
    { num: 114, symbol: 'Fl', name: 'Flerovium', mass: '[289]', category: 'post-transition', row: 7, col: 14 },
    { num: 115, symbol: 'Mc', name: 'Moscovium', mass: '[290]', category: 'post-transition', row: 7, col: 15 },
    { num: 116, symbol: 'Lv', name: 'Livermorium', mass: '[293]', category: 'post-transition', row: 7, col: 16 },
    { num: 117, symbol: 'Ts', name: 'Tennessine', mass: '[294]', category: 'halogen', row: 7, col: 17 },
    { num: 118, symbol: 'Og', name: 'Oganesson', mass: '[294]', category: 'noble', row: 7, col: 18 },
  ];

  return (
    <div className="flex flex-col gap-3 my-2 max-w-full overflow-hidden">
      {/* Visual Header / Zoomed-in Callout Box (Matches exact screenshot yellow box for Cl) */}
      <div className="flex items-center justify-center sm:justify-start gap-4 mb-1">
        <div className="relative border-2 border-yellow-400 bg-yellow-100/90 text-[#0b1c30] p-2.5 rounded-lg shadow-xs flex flex-col items-center justify-center min-w-[90px] text-center">
          <span className="text-[10px] font-bold text-gray-500 self-start -mt-1">{selectedElement?.num || 17}</span>
          <span className="text-xl font-black text-[#0b1c30] leading-none my-0.5">{selectedElement?.symbol || 'Cl'}</span>
          <span className="text-[10px] font-semibold text-gray-800">{selectedElement?.name || 'Chlorine'}</span>
          <span className="text-[9px] font-mono text-gray-600">{selectedElement?.mass || '35.45'}</span>
          <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-yellow-400" />
        </div>

        <div className="flex flex-col text-xs text-[#5a4138]">
          <span className="font-bold text-[#0b1c30] text-xs sm:text-sm">
            Interactive Periodic Table of Elements
          </span>
          <span className="text-[11px] text-gray-500">
            Selected: <strong className="text-[#0051d5]">{selectedElement?.name} ({selectedElement?.symbol})</strong> • Group {selectedElement?.col} • {selectedElement?.category}
          </span>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[10px]">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#bae6fd] border border-[#7dd3fc]" />
              <strong className="text-[#0369a1]">D-Block (Transition)</strong>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#fef9c3] border border-[#fef08a]" />
              <strong className="text-[#a16207]">Halogens (Cl, F, Br)</strong>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#fecdd3] border border-[#fda4af]" />
              <strong className="text-[#9f1239]">Alkali Metals</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Responsive Horizontal Scroll Container for the Elements Grid */}
      <div className="w-full overflow-x-auto pb-3 pt-1 scrollbar-thin">
        <div className="min-w-[700px] max-w-full grid grid-cols-18 gap-[3px] p-2 bg-white rounded-xl border border-gray-200 shadow-2xs">
          {Array.from({ length: 7 * 18 }).map((_, idx) => {
            const row = Math.floor(idx / 18) + 1;
            const col = (idx % 18) + 1;
            const elem = elements.find((e) => e.row === row && e.col === col);

            if (!elem) {
              return (
                <div
                  key={`empty-${row}-${col}`}
                  className="w-full h-8 sm:h-9 bg-transparent"
                />
              );
            }

            const isCl = elem.symbol === 'Cl';
            const isSelected = selectedElement?.symbol === elem.symbol;

            return (
              <button
                key={elem.symbol}
                type="button"
                onClick={() => setSelectedElement(elem)}
                title={`${elem.name} (${elem.symbol}) - ${elem.category}`}
                className={`w-full h-8 sm:h-9 rounded-xs p-0.5 border text-left flex flex-col justify-between transition-transform cursor-pointer relative ${
                  categoryColors[elem.category]
                } ${
                  isCl
                    ? 'ring-2 ring-yellow-500 ring-offset-1 font-bold shadow-xs scale-105 z-10'
                    : ''
                } ${isSelected ? 'scale-110 shadow-md z-20 brightness-95' : 'hover:scale-105'}`}
              >
                <div className="flex items-center justify-between text-[7px] leading-none opacity-80">
                  <span>{elem.num}</span>
                </div>
                <div className="text-center font-bold text-[10px] sm:text-xs leading-none">
                  {elem.symbol}
                </div>
                <div className="text-[6px] truncate leading-none text-center opacity-70">
                  {elem.mass}
                </div>
              </button>
            );
          })}
        </div>

        {/* F-Block rows indicator at bottom */}
        <div className="mt-1.5 flex flex-col gap-1 min-w-[700px]">
          <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
            <span className="font-semibold text-gray-600 w-16 text-right">Lanthanides:</span>
            <div className="flex-1 flex gap-1">
              {['La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu'].map((sym, i) => (
                <span key={sym} className="px-1.5 py-0.5 rounded-xs bg-[#ccfbf1] text-[#0f766e] border border-[#99f6e4] text-[8px] font-bold">
                  {sym}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
            <span className="font-semibold text-gray-600 w-16 text-right">Actinides:</span>
            <div className="flex-1 flex gap-1">
              {['Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr'].map((sym, i) => (
                <span key={sym} className="px-1.5 py-0.5 rounded-xs bg-[#cffafe] text-[#155e75] border border-[#a5f3fc] text-[8px] font-bold">
                  {sym}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
