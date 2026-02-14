
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
      case Section.ABOUT: return 'text-cyan-600 text-glow-cyan';
      case Section.WORKING: return 'text-indigo-600 text-glow-indigo';
      case Section.PORTFOLIO: return 'text-blue-600 text-glow-blue';
      case Section.APPOINTMENT: return 'text-rose-600 text-glow-rose';
      case Section.CONTACT: return 'text-orange-600 text-glow-orange';
      default: return 'text-slate-900';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-500/10 backdrop-blur-md overflow-y-auto transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`relative w-full ${isSubView ? 'max-w-4xl' : 'max-w-6xl'} glass-panel rounded-[2.5rem] p-6 sm:p-10 shadow-2xl animate-modal border border-white/50`}>
        {/* 3D Stylized Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 group z-10 p-2"
        >
          <div className="relative w-10 h-10 flex items-center justify-center bg-white/20 border border-black/5 rounded-xl group-hover:bg-red-500/10 group-hover:border-red-500/30 transition-all duration-300 transform group-hover:rotate-90 group-hover:scale-110 shadow-sm">
             <svg className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
             </svg>
          </div>
        </button>

        {!isSubView && (
          <div className="mb-10 flex items-center gap-6">
            <div className={`w-3 h-14 rounded-full bg-gradient-to-b from-current to-transparent opacity-30 ${getHeaderColor()}`} />
            <div>
              <h2 className={`text-3xl sm:text-5xl font-black tracking-tighter uppercase leading-none ${getHeaderColor()}`}>
                {section}
              </h2>
              <p className="text-[10px] font-bold tracking-[0.4em] text-slate-400 mt-2 uppercase opacity-80">White Module v5.0</p>
            </div>
          </div>
        )}

        <div className="relative text-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SectionModal;
