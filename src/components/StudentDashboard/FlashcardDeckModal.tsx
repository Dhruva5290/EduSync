import React, { useState } from 'react';
import { Flashcard } from '../../types';
import {
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  CheckCircle,
  Eye,
  Shuffle
} from 'lucide-react';

interface FlashcardDeckModalProps {
  flashcards: Flashcard[];
  noteTitle: string;
  onClose: () => void;
}

export const FlashcardDeckModal: React.FC<FlashcardDeckModalProps> = ({
  flashcards,
  noteTitle,
  onClose
}) => {
  const [cards, setCards] = useState<Flashcard[]>(flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  const currentCard = cards[currentIndex] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const toggleMastered = () => {
    setMasteredIds(prev => {
      const next = new Set(prev);
      if (next.has(currentCard.id)) {
        next.delete(currentCard.id);
      } else {
        next.add(currentCard.id);
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-md max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-800 animate-in fade-in zoom-in-95 text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                AI Flashcard Deck
              </h3>
              <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                {noteTitle} · {cards.length} Cards
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {/* Progress & Controls Bar */}
        <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-sm text-[11px] text-slate-300">
              Card {currentIndex + 1} / {cards.length}
            </span>
            {currentCard.topic && (
              <span className="text-[11px] font-semibold text-blue-300 bg-blue-950 border border-blue-800 px-2 py-0.5 rounded-sm">
                {currentCard.topic}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              className="p-1 rounded-sm border border-slate-800 hover:bg-slate-800 text-slate-400"
              title="Shuffle Deck"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-emerald-300 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-sm font-bold">
              {masteredIds.size} Mastered
            </span>
          </div>
        </div>

        {/* 3D Flip Card Container */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full h-64 cursor-pointer perspective-1000 group select-none"
        >
          <div
            className={`w-full h-full rounded-md p-6 transition-all duration-500 flex flex-col justify-between border shadow-sm relative ${
              isFlipped
                ? 'bg-slate-950 text-white border-blue-900/60 shadow-blue-950/20'
                : 'bg-slate-950 text-slate-100 border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Front / Back Label */}
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider font-mono">
              <span className={isFlipped ? 'text-blue-400' : 'text-blue-400'}>
                {isFlipped ? 'Answer & Concept' : 'Question (Click to Flip)'}
              </span>
              <span className="text-slate-500">
                Flip ↺
              </span>
            </div>

            {/* Main Card Content */}
            <div className="my-auto text-center px-4">
              <p className={`text-base font-bold leading-relaxed ${isFlipped ? 'text-blue-200' : 'text-white'}`}>
                {isFlipped ? currentCard.answer : currentCard.question}
              </p>
            </div>

            {/* Card Footer: Hint */}
            <div className="text-center text-[11px]">
              {!isFlipped && currentCard.hint && (
                <div>
                  {showHint ? (
                    <p className="text-amber-300 bg-amber-950/80 py-1 px-2 rounded-sm font-medium inline-block border border-amber-800 font-mono text-[10px]">
                      💡 Hint: {currentCard.hint}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 text-xs"
                    >
                      Need a hint?
                    </button>
                  )}
                </div>
              )}
              {isFlipped && (
                <span className="text-slate-500 text-[10px] font-mono">
                  Click again to review question
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={toggleMastered}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold border transition-colors ${
              masteredIds.has(currentCard.id)
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{masteredIds.has(currentCard.id) ? 'Mastered!' : 'Mark Mastered'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-sm border border-slate-800 hover:bg-slate-800 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow-xs"
            >
              <span>Next Card</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
