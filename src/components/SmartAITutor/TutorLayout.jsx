import React from 'react';
import { ChatInterface } from './ChatInterface';

export const TutorLayout = ({ onOpenPersonalization, currentUser, ...rest }) => {
  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] max-w-5xl mx-auto p-2 sm:p-4 gap-3 font-sans text-slate-100">
      <main className="flex-1 min-h-0">
        <ChatInterface
          onOpenPersonalization={onOpenPersonalization}
          learningProfile={currentUser?.learningProfile}
        />
      </main>
    </div>
  );
};

export default TutorLayout;
