import React, { useState } from 'react';
import {
  X,
  Link2,
  FileText,
  Bookmark,
  Table as TableIcon,
  Filter,
  ArrowUpDown,
  Search,
  MoreHorizontal,
  Plus,
  Bot,
  Sparkles,
  HelpCircle,
  Send,
  Dice5,
  Check,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Download,
  Info,
  Maximize2,
  Minimize2,
  Trash2,
} from 'lucide-react';
import { ClassScheduleItem, LectureArchiveItem } from '../types';
import { PeriodicTableVisual } from './PeriodicTableVisual';

interface LectureNotesModalProps {
  item: ClassScheduleItem | LectureArchiveItem | null;
  onClose: () => void;
  onAskTutor: (topic: string) => void;
  onStartQuiz: () => void;
}

interface ComparisonRow {
  id: string;
  property: string;
  ionic: string;
  covalent: string;
}

interface RandomQuestion {
  id: string;
  question: string;
  topic: string;
  hint: string;
  answer: string;
}

export const LectureNotesModal: React.FC<LectureNotesModalProps> = ({
  item,
  onClose,
  onAskTutor,
  onStartQuiz,
}) => {
  // Selected subject/topic in notes (defaulting to Chemistry - Bonds to match screenshot)
  const [selectedTopic, setSelectedTopic] = useState<'chemistry' | 'physics' | 'math'>(
    item?.title?.toLowerCase().includes('chem') ? 'chemistry' : 'chemistry'
  );

  // Table state (matching exact screenshot: Material, Bond type, Hardness)
  const [tableRows, setTableRows] = useState<ComparisonRow[]>([
    { id: '1', property: 'Material', ionic: 'Metal, Non-metal', covalent: 'Non-metal' },
    { id: '2', property: 'Bond type', ionic: 'Strong bonds', covalent: 'Weak bonds' },
    { id: '3', property: 'Hardness', ionic: 'Hard/brittle', covalent: 'Relatively soft' },
  ]);

  const [tableFilter, setTableFilter] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isSortedAsc, setIsSortedAsc] = useState<boolean | null>(null);
  const [newRowProperty, setNewRowProperty] = useState('');
  const [newRowIonic, setNewRowIonic] = useState('');
  const [newRowCovalent, setNewRowCovalent] = useState('');
  const [isAddingRow, setIsAddingRow] = useState(false);

  // Concept definitions popup / tooltip state
  const [activeTooltip, setActiveTooltip] = useState<{
    word: string;
    def: string;
  } | null>(null);

  // Tiny AI Assistant Bot state
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botChat, setBotChat] = useState<
    Array<{ sender: 'bot' | 'user'; text: string; hint?: string; answer?: string; revealed?: boolean }>
  >([
    {
      sender: 'bot',
      text: "👋 Hi! I'm your tiny AI note assistant. Hit 'Ask Random Question' anytime to test your knowledge on these lecture notes!",
    },
  ]);
  const [userBotInput, setUserBotInput] = useState('');
  const [currentRandomQuestion, setCurrentRandomQuestion] = useState<RandomQuestion | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  if (!item) return null;

  // Curated random questions from these exact notes
  const randomQuestions: RandomQuestion[] = [
    {
      id: 'q1',
      topic: 'Bond Classification',
      question: 'Why does Sodium (Na) form an ionic bond with Chlorine (Cl), but two Chlorine atoms form a covalent bond (Cl₂)?',
      hint: 'Think about electronegativity differences and whether electrons are transferred or shared.',
      answer:
        'Between Na and Cl, the large electronegativity difference (>2.0) causes Na to lose an electron completely to Cl, creating Na⁺ and Cl⁻ ions (Ionic). Between two Cl atoms, the electronegativities are identical, so electrons must be shared in pairs (Covalent).',
    },
    {
      id: 'q2',
      topic: 'Comparison Table: Hardness',
      question: 'Why are ionic compounds characterized as "hard/brittle" while covalent materials are often "relatively soft"?',
      hint: 'Look at the comparison table and consider crystal lattices vs molecular forces.',
      answer:
        'Ionic compounds exist as rigid three-dimensional crystal lattices of alternating positive and negative ions. A mechanical shear force aligns like charges (repelling and shattering the crystal — brittle). Covalent molecular substances are held by weaker intermolecular forces, making them softer.',
    },
    {
      id: 'q3',
      topic: 'Periodic Table: Chlorine Highlight',
      question: 'In the Periodic Table above, why is Chlorine (Cl, Atomic #17) placed in Group 17 (Halogens)?',
      hint: 'Check its valence shell electrons (outer shell).',
      answer:
        'Chlorine has an electron configuration of [Ne] 3s² 3p⁵ with 7 valence electrons. It needs exactly 1 more electron to complete a stable octet, making it a highly reactive halogen that eagerly accepts an electron to form Cl⁻.',
    },
    {
      id: 'q4',
      topic: 'D-Block in Biology',
      question: 'What is meant by the note: "D Block elements are generally useful for doing powerful things, but need to clean up afterwards"?',
      hint: 'Consider transition metals like Iron (Fe) in hemoglobin or Copper (Cu) in enzymes.',
      answer:
        'Transition metals (d-block) have variable oxidation states and d-orbital flexibility, making them powerful catalytic centers in biological enzymes (e.g., Fe in hemoglobin and catalase). However, free transition ions can produce destructive reactive oxygen species (ROS / Fenton reaction), so cells must tightly sequester and "clean up" with antioxidant mechanisms!',
    },
    {
      id: 'q5',
      topic: 'Covalent Electron Sharing',
      question: 'Can covalent bonds involve more than 2 shared electrons?',
      hint: 'Look at the note: "Number of Electrons involved → Generally 2, although sometime 1 or 3".',
      answer:
        'A single covalent bond shares a pair (2 electrons). A double bond shares 4 electrons (2 pairs, like in O₂), and a triple bond shares 6 electrons (3 pairs, like in N₂). In odd-electron free radicals (like NO), a 3-electron bond or single unpaired electron interaction can also occur!',
    },
    {
      id: 'q6',
      topic: 'D-Orbital Nomenclature',
      question: 'Why is the D-block named the "d-block"?',
      hint: 'Look at the sub-bullet: "~Source of Name ↔ Their Valence Electrons are in the D-Orbital".',
      answer:
        'The name "d" historically originates from atomic spectroscopy terminology: "diffuse" series of lines. Chemically, it designates elements whose outermost or highest-energy valence electrons fill the d-subshell.',
    },
  ];

  // Concept dictionary for blue hyperlinks
  const glossary: Record<string, string> = {
    Electrons: 'Subatomic particles with a negative elementary electric charge that orbit the atomic nucleus.',
    'Chemical Bond': 'An attractive force between atoms or ions that leads to the formation of chemical compounds.',
    Atom: 'The fundamental constituent unit of ordinary matter that possesses the chemical properties of an element.',
    Electron: 'A stable subatomic particle with a charge of negative electricity, found in all atoms.',
    Ions: 'An atom or molecule with a net electric charge due to the loss or gain of one or more electrons.',
    'Valence Electrons': 'Electrons located in the outermost electron shell of an atom that participate in chemical bond formation.',
    'D-Orbital': 'Atomic orbitals with azimuthal quantum number l=2 capable of accommodating up to 10 electrons in transition metals.',
    Biology: 'Life systems where metal ions (Fe, Cu, Zn, Mn) act as catalytic cofactors in enzymes and transport proteins.',
  };

  const handleAskRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * randomQuestions.length);
    const q = randomQuestions[randomIndex];
    setCurrentRandomQuestion(q);

    setBotChat((prev) => [
      ...prev,
      {
        sender: 'bot',
        text: `🎲 **Random Concept Question** (${q.topic}):\n\n"${q.question}"`,
        hint: q.hint,
        answer: q.answer,
        revealed: false,
      },
    ]);
  };

  const handleSendBotMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userBotInput.trim()) return;

    const userText = userBotInput.trim();
    setUserBotInput('');

    // Add user's message
    setBotChat((prev) => [...prev, { sender: 'user', text: userText }]);

    // Match smart answer from note context
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply = '';
      if (lower.includes('chlorine') || lower.includes('cl')) {
        reply = "Chlorine (atomic number 17) has 7 valence electrons [Ne] 3s² 3p⁵. It's a halogen that forms strong ionic bonds with alkali metals (like NaCl) and covalent bonds when sharing with non-metals!";
      } else if (lower.includes('ionic') || lower.includes('covalent')) {
        reply = "Key distinction from our notes:\n• Covalent: Pairs of electrons are shared between non-metals.\n• Ionic: Complete electron transfer from metal to non-metal, creating opposing ions that attract electrostatically!";
      } else if (lower.includes('d block') || lower.includes('d-orbital') || lower.includes('biology')) {
        reply = "D-Block elements have valence electrons entering d-orbitals. Their multiple oxidation states make them indispensable for catalytic life processes (e.g. Iron in hemoglobin), but they must be carefully regulated to prevent reactive oxidative stress!";
      } else if (lower.includes('table') || lower.includes('hardness')) {
        reply = "From the Comparison Table:\n• Material: Ionic = Metal+Non-metal; Covalent = Non-metal only.\n• Bond type: Ionic = Strong electrostatic lattice; Covalent = Shared orbital bonds.\n• Hardness: Ionic = Hard/brittle; Covalent = Relatively soft.";
      } else {
        reply = `That's a thoughtful question regarding "${userText}"! In these lecture notes, remember that chemical bonding is governed by electron sharing versus electron loss/gain to achieve stable valence configurations. Try hitting 'Ask Random Question' to test another concept!`;
      }

      setBotChat((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 450);
  };

  const handleRevealAnswer = (index: number) => {
    setBotChat((prev) =>
      prev.map((msg, i) => (i === index ? { ...msg, revealed: true } : msg))
    );
  };

  const handleAddTableRow = () => {
    if (!newRowProperty.trim()) return;
    const newRow: ComparisonRow = {
      id: Date.now().toString(),
      property: newRowProperty.trim(),
      ionic: newRowIonic.trim() || 'N/A',
      covalent: newRowCovalent.trim() || 'N/A',
    };
    setTableRows((prev) => [...prev, newRow]);
    setNewRowProperty('');
    setNewRowIonic('');
    setNewRowCovalent('');
    setIsAddingRow(false);
  };

  const handleSortTable = () => {
    const nextSort = isSortedAsc === null ? true : !isSortedAsc;
    setIsSortedAsc(nextSort);
    setTableRows((prev) =>
      [...prev].sort((a, b) =>
        nextSort
          ? a.property.localeCompare(b.property)
          : b.property.localeCompare(a.property)
      )
    );
  };

  const filteredRows = tableRows.filter((r) =>
    r.property.toLowerCase().includes(tableFilter.toLowerCase()) ||
    r.ionic.toLowerCase().includes(tableFilter.toLowerCase()) ||
    r.covalent.toLowerCase().includes(tableFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 relative">
        {/* Top Control Bar (Clean Document Actions) */}
        <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 bg-[#fafafa]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span className="text-xs font-semibold text-gray-500 font-mono">
              EduSync Text Notes Reader
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCopiedToast(true);
                setTimeout(() => setCopiedToast(false), 2000);
              }}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-white text-gray-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share or copy notes"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              <span>{copiedToast ? 'Copied Link!' : 'Share'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close notes modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Body (Replicating exact image layout, spacing, and typography) */}
        <div className="p-6 sm:p-10 lg:p-12 overflow-y-auto flex-1 font-sans text-[#111827] bg-white selection:bg-blue-100 relative">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            {/* Note Title Header (Matches "Chemistry - Bonds") */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
                Chemistry - Bonds
              </h1>

              {/* Three Header Badges (Exact match to screenshot) */}
              <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                {/* Badge 1: 2 links */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 text-xs font-medium text-gray-700 bg-white shadow-2xs hover:bg-gray-50 cursor-pointer">
                  <Link2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>2 links</span>
                </div>

                {/* Badge 2: 4 PDFs */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 text-xs font-medium text-gray-700 bg-white shadow-2xs hover:bg-gray-50 cursor-pointer">
                  <FileText className="w-3.5 h-3.5 text-red-500" />
                  <span>4 PDFs</span>
                </div>

                {/* Badge 3: ClassNotes */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 text-xs font-medium text-gray-700 bg-white shadow-2xs hover:bg-gray-50 cursor-pointer">
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>ClassNotes</span>
                </div>
              </div>
            </div>

            {/* Note Section 1: Ionic & Covalent Bonds */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-gray-800">•</span>
                <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30]">
                  Ionic & Covalent Bonds
                </h2>
              </div>

              {/* Nested Bullet 1: Covalent Chemical Bond */}
              <div className="pl-5 flex flex-col gap-1.5 text-sm sm:text-[15px] text-gray-800 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-bold text-gray-600 mt-0.5">•</span>
                  <p>
                    <strong className="font-semibold text-gray-900">Covalent Chemical Bond</strong>{' '}
                    <span className="text-gray-500 mx-1">↔</span> A{' '}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTooltip({
                          word: 'Chemical Bond',
                          def: glossary['Chemical Bond'],
                        })
                      }
                      className="text-blue-600 font-medium hover:underline cursor-pointer inline"
                    >
                      Chemical Bond
                    </button>{' '}
                    where a pair of{' '}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTooltip({
                          word: 'Electrons',
                          def: glossary['Electrons'],
                        })
                      }
                      className="text-blue-600 font-medium hover:underline cursor-pointer inline"
                    >
                      Electrons
                    </button>{' '}
                    are shared
                  </p>
                </div>

                {/* Sub-nested bullet: Number of Electrons */}
                <div className="pl-6 flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-xs font-bold text-gray-500 mt-1">•</span>
                  <p>
                    <span className="italic text-gray-600">Number of </span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTooltip({
                          word: 'Electrons',
                          def: glossary['Electrons'],
                        })
                      }
                      className="text-blue-600 font-medium hover:underline cursor-pointer inline"
                    >
                      Electrons
                    </button>{' '}
                    <span className="italic text-gray-600">involved</span>{' '}
                    <span className="text-gray-500 font-bold mx-1">→</span> Generally 2,
                    although sometime 1 or 3
                  </p>
                </div>
              </div>

              {/* Nested Bullet 2: Ionic Chemical Bond */}
              <div className="pl-5 flex flex-col gap-1 text-sm sm:text-[15px] text-gray-800 leading-relaxed mt-1">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-bold text-gray-600 mt-0.5">•</span>
                  <p>
                    <strong className="font-semibold text-gray-900">Ionic Chemical Bond</strong>{' '}
                    <span className="text-gray-500 mx-1">↔</span>{' '}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTooltip({
                          word: 'Chemical Bond',
                          def: glossary['Chemical Bond'],
                        })
                      }
                      className="text-blue-600 font-medium hover:underline cursor-pointer inline"
                    >
                      Chemical Bond
                    </button>{' '}
                    formed when one{' '}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTooltip({
                          word: 'Atom',
                          def: glossary['Atom'],
                        })
                      }
                      className="text-blue-600 font-medium hover:underline cursor-pointer inline"
                    >
                      Atom
                    </button>{' '}
                    loses an{' '}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTooltip({
                          word: 'Electron',
                          def: glossary['Electron'],
                        })
                      }
                      className="text-blue-600 font-medium hover:underline cursor-pointer inline"
                    >
                      Electron
                    </button>{' '}
                    to another{' '}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTooltip({
                          word: 'Atom',
                          def: glossary['Atom'],
                        })
                      }
                      className="text-blue-600 font-medium hover:underline cursor-pointer inline"
                    >
                      Atom
                    </button>
                    , resulting in two{' '}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTooltip({
                          word: 'Ions',
                          def: glossary['Ions'],
                        })
                      }
                      className="text-blue-600 font-medium hover:underline cursor-pointer inline"
                    >
                      Ions
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Note Section 2: Comparison Table (Exact Match) */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-800">•</span>
                  <div className="flex items-center gap-1.5">
                    <TableIcon className="w-4 h-4 text-gray-700" />
                    <h3 className="text-base sm:text-lg font-bold text-[#0b1c30]">
                      Comparison Table
                    </h3>
                    <button
                      onClick={() => setIsAddingRow(!isAddingRow)}
                      className="w-5 h-5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                      title="Add new comparison row"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Table Control Buttons (Filter, Sort, Search, ...) */}
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium self-end sm:self-auto">
                  <button
                    onClick={() => setShowSearchInput(!showSearchInput)}
                    className="hover:text-gray-900 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Filter className="w-3 h-3" />
                    <span>Filter</span>
                  </button>

                  <button
                    onClick={handleSortTable}
                    className="hover:text-gray-900 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    <span>Sort</span>
                  </button>

                  <button
                    onClick={() => setShowSearchInput(!showSearchInput)}
                    className="hover:text-gray-900 transition-colors cursor-pointer"
                    title="Search table"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>

                  <button
                    className="hover:text-gray-900 transition-colors cursor-pointer"
                    title="More table options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Optional Search Filter Bar */}
              {showSearchInput && (
                <div className="my-1">
                  <input
                    type="text"
                    placeholder="Search properties or values..."
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/50"
                  />
                </div>
              )}

              {/* Clean Notion-style Table Grid */}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/60 text-gray-600 font-medium">
                      <th className="py-2.5 px-4 font-semibold text-gray-700 border-r border-gray-100 w-1/3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 font-mono">≡</span>
                          <span>Property</span>
                        </div>
                      </th>
                      <th className="py-2.5 px-4 font-semibold text-gray-700 border-r border-gray-100 w-1/3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 font-mono">≡</span>
                          <span>Ionic</span>
                        </div>
                      </th>
                      <th className="py-2.5 px-4 font-semibold text-gray-700 border-r border-gray-100 w-1/3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 font-mono">≡</span>
                          <span>Covalent</span>
                        </div>
                      </th>
                      <th className="py-2.5 px-3 text-center w-8 text-gray-400">
                        <button
                          onClick={() => setIsAddingRow(true)}
                          className="hover:text-gray-700 cursor-pointer"
                        >
                          +
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, idx) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="py-2.5 px-4 text-gray-900 font-medium border-r border-gray-100">
                          {row.property}
                        </td>
                        <td className="py-2.5 px-4 text-gray-700 border-r border-gray-100">
                          {row.ionic}
                        </td>
                        <td className="py-2.5 px-4 text-gray-700 border-r border-gray-100">
                          {row.covalent}
                        </td>
                        <td className="py-2.5 px-2 text-center text-gray-300 group-hover:text-gray-500">
                          <button
                            onClick={() =>
                              setTableRows((prev) => prev.filter((r) => r.id !== row.id))
                            }
                            className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                            title="Delete row"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* New Row Input Form */}
                    {isAddingRow && (
                      <tr className="bg-blue-50/40 border-b border-blue-100">
                        <td className="py-2 px-3 border-r border-blue-100">
                          <input
                            type="text"
                            placeholder="Property (e.g. Melting point)"
                            value={newRowProperty}
                            onChange={(e) => setNewRowProperty(e.target.value)}
                            className="w-full text-xs px-2 py-1 rounded-sm border border-blue-200 focus:outline-none"
                            autoFocus
                          />
                        </td>
                        <td className="py-2 px-3 border-r border-blue-100">
                          <input
                            type="text"
                            placeholder="Ionic value"
                            value={newRowIonic}
                            onChange={(e) => setNewRowIonic(e.target.value)}
                            className="w-full text-xs px-2 py-1 rounded-sm border border-blue-200 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-3 border-r border-blue-100">
                          <input
                            type="text"
                            placeholder="Covalent value"
                            value={newRowCovalent}
                            onChange={(e) => setNewRowCovalent(e.target.value)}
                            className="w-full text-xs px-2 py-1 rounded-sm border border-blue-200 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={handleAddTableRow}
                            className="px-2 py-1 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 cursor-pointer"
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    )}

                    {/* Bottom '+' Row Button */}
                    {!isAddingRow && (
                      <tr>
                        <td colSpan={4} className="py-2 px-4">
                          <button
                            onClick={() => setIsAddingRow(true)}
                            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New comparison property</span>
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note Section 3: Periodic Table (Matches image section) */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-gray-800">•</span>
                <h3 className="text-base sm:text-lg font-bold text-[#0b1c30]">
                  Periodic Table
                </h3>
              </div>

              {/* Embedded Rendered Interactive Periodic Table with Cl Callout */}
              <PeriodicTableVisual />
            </div>

            {/* Note Section 4: D Block Elements (Exact Match) */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-start gap-2">
                <span className="text-base font-bold text-gray-800 mt-0.5">•</span>
                <h3 className="text-base sm:text-lg font-bold text-[#0b1c30]">
                  D Block <span className="text-gray-500 font-normal">↔</span> Elements in the middle of the periodic table
                </h3>
              </div>

              {/* Sub-bullet 1: ~Source of Name */}
              <div className="pl-6 flex flex-col gap-1.5 text-sm sm:text-[15px] text-gray-800 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-bold text-gray-600 mt-0.5">•</span>
                  <p>
                    <span className="italic text-gray-600">~Source of Name</span>{' '}
                    <span className="text-gray-500 mx-1">↔</span> Their{' '}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTooltip({
                          word: 'Valence Electrons',
                          def: glossary['Valence Electrons'],
                        })
                      }
                      className="text-blue-600 font-medium hover:underline cursor-pointer inline"
                    >
                      Valence Electrons
                    </button>{' '}
                    are in the{' '}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTooltip({
                          word: 'D-Orbital',
                          def: glossary['D-Orbital'],
                        })
                      }
                      className="text-blue-600 font-medium hover:underline cursor-pointer inline"
                    >
                      D-Orbital
                    </button>
                  </p>
                </div>

                {/* Sub-bullet 2: Role in Biology */}
                <div className="flex items-start gap-2">
                  <span className="text-sm font-bold text-gray-600 mt-0.5">•</span>
                  <p>
                    <span className="italic text-gray-600">Role in</span>{' '}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTooltip({
                          word: 'Biology',
                          def: glossary['Biology'],
                        })
                      }
                      className="text-blue-600 font-medium hover:underline cursor-pointer inline"
                    >
                      Biology
                    </button>{' '}
                    <span className="text-gray-500 font-bold mx-1">→</span> Generally are
                    useful for doing powerful things, but need to clean up afterwards
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Concept Definition Popover Modal */}
        {activeTooltip && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/20 backdrop-blur-2xs">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-gray-200 flex flex-col gap-2.5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Chemistry Concept
                </span>
                <button
                  onClick={() => setActiveTooltip(null)}
                  className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="font-bold text-base text-[#0b1c30]">
                {activeTooltip.word}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {activeTooltip.def}
              </p>
              <button
                onClick={() => {
                  const term = activeTooltip.word;
                  setActiveTooltip(null);
                  setIsBotOpen(true);
                  setUserBotInput(`Explain more about "${term}" in chemical bonds`);
                }}
                className="mt-2 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Bot about {activeTooltip.word}</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Tiny AI Assistant Bot (Bottom Right matching user image circular button) */}
        <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-40">
          {!isBotOpen ? (
            /* Closed Floating Action Button (Exact placement from user's image) */
            <button
              onClick={() => setIsBotOpen(true)}
              className="w-13 h-13 rounded-full bg-[#1e293b] hover:bg-[#0f172a] text-white shadow-xl flex items-center justify-center transition-all hover:scale-108 cursor-pointer relative group border-2 border-white"
              title="Open Tiny AI Assistant Bot"
            >
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#10b981] border-2 border-white animate-pulse" />
              <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              {/* Tooltip prompt badge */}
              <span className="absolute right-14 bg-[#0f172a] text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
                Tiny AI Assistant Bot 🎲
              </span>
            </button>
          ) : (
            /* Open Tiny AI Assistant Bot Drawer / Card */
            <div className="bg-white rounded-3xl w-[320px] sm:w-[360px] shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
              {/* Bot Header */}
              <div className="p-3.5 bg-[#0b1c30] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/30 flex items-center justify-center text-blue-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs">EduBot • Note Assistant</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active on Chemistry Notes
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsBotOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Big Action: "🎲 Ask Random Question" Button */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex flex-col gap-1.5">
                <button
                  onClick={handleAskRandomQuestion}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <Dice5 className="w-4 h-4 animate-bounce" />
                  <span>Ask Random Question</span>
                </button>
                <span className="text-[10px] text-center text-gray-500 font-medium">
                  Generates an interactive conceptual pop question from this note
                </span>
              </div>

              {/* Chat Conversation Scroll Area */}
              <div className="p-3.5 max-h-[260px] overflow-y-auto flex flex-col gap-3 text-xs bg-gray-50/50">
                {botChat.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col gap-1.5 ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs shadow-2xs whitespace-pre-line'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Reveal Answer Button for Random Questions */}
                    {msg.sender === 'bot' && msg.answer && (
                      <div className="pl-1 max-w-[90%] w-full">
                        {!msg.revealed ? (
                          <button
                            onClick={() => handleRevealAnswer(idx)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer w-full justify-center"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>💡 Reveal Answer & Explanation</span>
                          </button>
                        ) : (
                          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed animate-in fade-in">
                            <strong className="block font-bold text-emerald-800 mb-0.5">
                              ✓ Conceptual Explanation:
                            </strong>
                            {msg.answer}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Topic Chips */}
              <div className="px-3 pt-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-gray-100 bg-white">
                <button
                  onClick={handleAskRandomQuestion}
                  className="px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-[10px] font-semibold text-gray-700 whitespace-nowrap cursor-pointer flex items-center gap-1"
                >
                  <span>🎲 Random</span>
                </button>
                <button
                  onClick={() => {
                    setUserBotInput('Why is chlorine highlighted in the table?');
                  }}
                  className="px-2 py-1 rounded-full bg-yellow-100 hover:bg-yellow-200 text-[10px] font-semibold text-yellow-800 whitespace-nowrap cursor-pointer"
                >
                  🧪 Chlorine
                </button>
                <button
                  onClick={() => {
                    setUserBotInput('What is D-block role in biology?');
                  }}
                  className="px-2 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-[10px] font-semibold text-blue-800 whitespace-nowrap cursor-pointer"
                >
                  🧬 D-Block Biology
                </button>
                <button
                  onClick={() => {
                    setUserBotInput('Explain Ionic vs Covalent hardness');
                  }}
                  className="px-2 py-1 rounded-full bg-purple-100 hover:bg-purple-200 text-[10px] font-semibold text-purple-800 whitespace-nowrap cursor-pointer"
                >
                  ⚡ Hardness
                </button>
              </div>

              {/* Bot Input Form */}
              <form
                onSubmit={handleSendBotMessage}
                className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask any random question..."
                  value={userBotInput}
                  onChange={(e) => setUserBotInput(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/70"
                />
                <button
                  type="submit"
                  disabled={!userBotInput.trim()}
                  className="w-8 h-8 rounded-xl bg-[#0b1c30] hover:bg-blue-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
