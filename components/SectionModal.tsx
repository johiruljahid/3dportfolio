
import React from 'react';
import { Section } from '../types';

interface SectionModalProps {
  section: Section;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  isSubView?: boolean;
}

const SectionModal: React.FC<SectionModalProps> = ({ section, isOpen, onClose, children, isSubView = false }) => {
  if (!isOpen) return null;

  const getHeaderColor = () => {
    switch (section) {
      case Section.ABOUT: return 'text-cyan-400 shadow-cyan-400/50 text-glow-cyan';
      case Section.WORKING: return 'text-indigo-400 shadow-indigo-400/50 text-glow-indigo';
      case Section.PORTFOLIO: return 'text-blue-400 shadow-blue-400/50 text-glow-blue';
      case Section.APPOINTMENT: return 'text-rose-400 shadow-rose-400/50 text-glow-rose';
      case Section.CONTACT: return 'text-orange-400 shadow-orange-400/50 text-glow-orange';
      default: return 'text-white';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`relative w-full ${isSubView ? 'max-w-4xl' : 'max-w-6xl'} glass-panel rounded-[2rem] p-6 sm:p-10 shadow-2xl animate-modal border border-white/10`}>
        {/* 3D Stylized Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 group z-10 p-2"
        >
          <div className="relative w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl group-hover:bg-red-500/20 group-hover:border-red-500/50 transition-all duration-300 transform group-hover:rotate-90 group-hover:scale-110 shadow-lg">
             <svg className="w-5 h-5 text-white/50 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
             </svg>
          </div>
        </button>

        {!isSubView && (
          <div className="mb-10 flex items-center gap-6">
            <div className={`w-3 h-14 rounded-full bg-gradient-to-b from-current to-transparent opacity-50 ${getHeaderColor()}`} />
            <div>
              <h2 className={`text-3xl sm:text-5xl font-black tracking-tighter uppercase leading-none ${getHeaderColor()}`}>
                {section}
              </h2>
              <p className="text-[10px] font-bold tracking-[0.4em] text-slate-500 mt-2 uppercase opacity-60">System Module v4.2</p>
            </div>
          </div>
        )}

        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SectionModal;
