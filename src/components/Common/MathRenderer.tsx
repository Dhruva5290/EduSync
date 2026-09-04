import React, { useMemo } from 'react';

declare global {
  interface Window {
    katex?: {
      renderToString: (tex: string, options?: any) => string;
      render: (tex: string, element: HTMLElement, options?: any) => void;
    };
    renderMathInElement?: (element: HTMLElement, options?: any) => void;
  }
}

interface MathRendererProps {
  content: string;
  className?: string;
  isBlock?: boolean;
}

// In-memory cache for rendered math expressions to eliminate redundant computation
const mathCache = new Map<string, string>();

/**
 * Transforms LaTeX math expressions into clean, legible HTML typography.
 * If KaTeX is loaded, renders via KaTeX vector math.
 * Otherwise, converts LaTeX symbols, Greek characters, subscripts, and superscripts into clean typography.
 * Fully guarded against infinite loops and unescaped symbols.
 */
export function renderMathExpression(tex: string, displayMode: boolean = false): string {
  if (!tex) return '';
  const cacheKey = `${displayMode ? 'B:' : 'I:'}${tex}`;
  if (mathCache.has(cacheKey)) {
    return mathCache.get(cacheKey)!;
  }

  const cleanTex = tex.trim();

  // 1. If KaTeX is available, use official KaTeX renderer
  if (typeof window !== 'undefined' && window.katex && typeof window.katex.renderToString === 'function') {
    try {
      const rendered = window.katex.renderToString(cleanTex, {
        displayMode,
        throwOnError: false
      });
      mathCache.set(cacheKey, rendered);
      return rendered;
    } catch {
      // Fall through to typography engine
    }
  }

  // 2. High-Fidelity Typography Engine for Math & Physics (Loop-Safe)
  let formatted = cleanTex;

  // Fractions: safe iteration with hard limit of 4 passes to prevent any infinite loop
  let fracPass = 0;
  while (formatted.includes('\\frac') && fracPass < 4) {
    const prev = formatted;
    formatted = formatted.replace(
      /\\frac\{([^{}]*)\}\{([^{}]*)\}/g,
      '<span class="inline-flex items-center mx-1"><span class="border-b border-cyan-400/80 px-1 text-center font-serif text-[0.95em]">$1</span><span class="px-1 text-center font-serif text-[0.95em]">$2</span></span>'
    );
    if (formatted === prev) {
      formatted = formatted.replace(/\\frac/g, '');
      break;
    }
    fracPass++;
  }

  // Vectors: \vec{F} -> F⃗ or bold F
  formatted = formatted.replace(/\\vec\{([a-zA-Z])\}/g, '<strong class="font-serif italic text-cyan-300">$1&#x20D7;</strong>');

  // Text inside math: \text{...}, \mathrm{...}
  formatted = formatted.replace(/\\(?:text|mathrm|mathbf|mathit)\{([^{}]+)\}/g, '<span class="font-sans not-italic text-slate-300">$1</span>');

  // Limits & Sums: \lim_{x \to 0}, \sum_{i=1}^n
  formatted = formatted.replace(/\\lim_\{([^}]+)\}/g, 'lim<sub>$1</sub>');
  formatted = formatted.replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, '∑<sub>$1</sub><sup>$2</sup>');
  formatted = formatted.replace(/\\sum/g, '∑');

  // Common physics & math Greek symbols
  const greek: Record<string, string> = {
    '\\theta': 'θ',
    '\\Theta': 'Θ',
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\Gamma': 'Γ',
    '\\delta': 'δ',
    '\\Delta': 'Δ',
    '\\epsilon': 'ε',
    '\\varepsilon': 'ε',
    '\\lambda': 'λ',
    '\\Lambda': 'Λ',
    '\\mu': 'μ',
    '\\pi': 'π',
    '\\Pi': 'Π',
    '\\rho': 'ρ',
    '\\sigma': 'σ',
    '\\Sigma': 'Σ',
    '\\tau': 'τ',
    '\\phi': 'φ',
    '\\Phi': 'Φ',
    '\\omega': 'ω',
    '\\Omega': 'Ω',
    '\\eta': 'η'
  };
  for (const [key, sym] of Object.entries(greek)) {
    formatted = formatted.replaceAll(key, sym);
  }

  // Mathematical Operators & Arrows
  const ops: Record<string, string> = {
    '\\le': '≤',
    '\\leq': '≤',
    '\\ge': '≥',
    '\\geq': '≥',
    '\\neq': '≠',
    '\\approx': '≈',
    '\\equiv': '≡',
    '\\pm': '±',
    '\\times': '×',
    '\\cdot': '·',
    '\\div': '÷',
    '\\to': '→',
    '\\rightarrow': '→',
    '\\leftarrow': '←',
    '\\iff': '⟺',
    '\\implies': '⟹',
    '\\in': '∈',
    '\\notin': '∉',
    '\\infty': '∞',
    '\\partial': '∂',
    '\\cos': 'cos',
    '\\sin': 'sin',
    '\\tan': 'tan',
    '\\ln': 'ln',
    '\\log': 'log',
    '\\quad': '&nbsp;&nbsp;',
    '\\qquad': '&nbsp;&nbsp;&nbsp;&nbsp;'
  };
  for (const [key, op] of Object.entries(ops)) {
    formatted = formatted.replaceAll(key, op);
  }

  // Multi-char Subscripts: _{net}, _{ext}, _{total} -> <sub>net</sub>
  formatted = formatted.replace(/_\{([^{}]+)\}/g, '<sub class="text-[0.75em] text-cyan-400 font-sans">$1</sub>');
  // Single char Subscripts: _k, _s, _0, _1 -> <sub>k</sub>
  formatted = formatted.replace(/_([0-9a-zA-Z])/g, '<sub class="text-[0.75em] text-cyan-400 font-sans">$1</sub>');

  // Multi-char Superscripts: ^{2}, ^{n-1} -> <sup>2</sup>
  formatted = formatted.replace(/\^\{([^{}]+)\}/g, '<sup class="text-[0.75em] text-amber-300 font-sans">$1</sup>');
  // Single char Superscripts: ^2, ^3 -> <sup>2</sup>
  formatted = formatted.replace(/\^([0-9a-zA-Z+-])/g, '<sup class="text-[0.75em] text-amber-300 font-sans">$1</sup>');

  // Strip dangling unescaped '$' or '$_' artifacts
  formatted = formatted.replace(/\$_/g, '_').replace(/\$/g, '');

  let result = '';
  if (displayMode) {
    result = `<div class="my-4 py-3 px-5 rounded-xl bg-slate-950/90 border border-slate-800 text-center font-serif text-base sm:text-lg text-cyan-300 tracking-wide shadow-inner overflow-x-auto select-all">${formatted}</div>`;
  } else {
    result = `<span class="font-serif italic text-cyan-200 px-1 py-0.5 rounded bg-slate-950/40 border border-slate-800/60 inline-block font-medium">${formatted}</span>`;
  }

  mathCache.set(cacheKey, result);
  return result;
}

/**
 * Transforms Markdown text containing headings, lists, bold, italics,
 * and embedded LaTeX formulas ($...$ or $$...$$) into pristine academic study material.
 */
export function formatAcademicNotes(text: string): string {
  if (!text) return '';

  let html = text;

  // 1. Render Block Math: $$ ... $$
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    return renderMathExpression(math, true);
  });

  // 2. Render Inline Math: $ ... $
  html = html.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    return renderMathExpression(math, false);
  });

  // 3. Process line-by-line Markdown for clean academic hierarchy
  const lines = html.split('\n');
  const output: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // End unordered list if active
    if (inList && !trimmed.startsWith('- ') && !trimmed.startsWith('* ') && !/^\d+\.\s/.test(trimmed)) {
      output.push('</ul>');
      inList = false;
    }

    // Document Title: # Title
    if (trimmed.startsWith('# ')) {
      output.push(
        `<h1 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-2 mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
          <span class="w-1.5 h-6 rounded-full bg-blue-500 inline-block"></span>
          <span>${formatInlineSpans(trimmed.slice(2))}</span>
        </h1>`
      );
      continue;
    }

    // Chapter / Topic Heading: ## Heading (Timestamp)
    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.slice(3);
      output.push(
        `<h2 class="text-base sm:text-lg font-bold text-blue-200 mt-6 mb-3 pt-3 border-t border-slate-800/80 flex items-center gap-2.5">
          <span class="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
          <span>${formatInlineSpans(headingText)}</span>
        </h2>`
      );
      continue;
    }

    // Sub-heading: ### Subheading
    if (trimmed.startsWith('### ')) {
      output.push(
        `<h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 mt-4 mb-2 flex items-center gap-2 font-mono">
          <span class="text-cyan-400">§</span>
          <span>${formatInlineSpans(trimmed.slice(4))}</span>
        </h3>`
      );
      continue;
    }

    // Callout / Blockquote: > Quote
    if (trimmed.startsWith('> ')) {
      output.push(
        `<div class="my-3 p-3.5 rounded-xl bg-slate-950/80 border-l-4 border-indigo-500 text-slate-300 text-xs sm:text-sm italic leading-relaxed">
          ${formatInlineSpans(trimmed.slice(2))}
        </div>`
      );
      continue;
    }

    // Horizontal Rule: ---
    if (trimmed === '---' || trimmed === '***') {
      output.push('<hr class="my-6 border-slate-800" />');
      continue;
    }

    // Unordered List Items: - Item or * Item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        output.push('<ul class="space-y-2 my-3 pl-2">');
        inList = true;
      }
      output.push(
        `<li class="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5 leading-relaxed">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-2"></span>
          <span class="flex-1">${formatInlineSpans(trimmed.slice(2))}</span>
        </li>`
      );
      continue;
    }

    // Numbered List Items: 1. Item
    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (!inList) {
        output.push('<ul class="space-y-2 my-3 pl-2">');
        inList = true;
      }
      output.push(
        `<li class="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5 leading-relaxed">
          <span class="text-[11px] font-mono font-bold text-cyan-400 shrink-0 mt-0.5">${match ? match[1] + '.' : '•'}</span>
          <span class="flex-1">${formatInlineSpans(match ? match[2] : trimmed)}</span>
        </li>`
      );
      continue;
    }

    // Blank line
    if (trimmed === '') {
      output.push('<div class="h-2"></div>');
      continue;
    }

    // Standard Paragraph
    output.push(
      `<p class="text-xs sm:text-sm leading-relaxed text-slate-300 my-2">
        ${formatInlineSpans(rawLine)}
      </p>`
    );
  }

  if (inList) {
    output.push('</ul>');
  }

  return output.join('\n');
}

/**
 * Handles inline Markdown formatting: bold, italics, code snippets, and cleans dangling $_ artifacts.
 */
function formatInlineSpans(line: string): string {
  if (!line) return '';
  return line
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-950 text-cyan-300 font-mono text-xs rounded border border-slate-800">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic text-slate-200">$1</em>')
    .replace(/\$_/g, ''); // Clean dangling '$_' artifacts
}

export const MathRenderer: React.FC<MathRendererProps> = React.memo(({
  content,
  className = '',
  isBlock = false
}) => {
  const renderedHtml = useMemo(() => {
    const trimmed = (content || '').trim();

    // Check if content is pure math formula (e.g. "$$N = mg\cos\theta$$")
    const isPureBlock = trimmed.startsWith('$$') && trimmed.endsWith('$$');
    const isPureInline = trimmed.startsWith('$') && trimmed.endsWith('$');

    if (isPureBlock || isPureInline) {
      const rawFormula = isPureBlock ? trimmed.slice(2, -2).trim() : trimmed.slice(1, -1).trim();
      return renderMathExpression(rawFormula, isBlock || isPureBlock);
    }

    // Otherwise render full academic structured notes
    return formatAcademicNotes(content);
  }, [content, isBlock]);

  return (
    <div
      className={`academic-math-content ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
});

export default MathRenderer;
