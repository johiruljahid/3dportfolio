
import React, { useEffect, useRef } from 'react';
import { Section } from '../types';

interface SectionModalProps {
  section: Section;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  isSubView?: boolean;
}

const SectionModal: React.FC<SectionModalProps> = ({ section, isOpen, onClose, children, isSubView = false }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, section]);

  if (!isOpen) return null;

  const getHeaderColor = () => {
    switch (section) {
      case Section.ABOUT: return 'text-cyan-500';
      case Section.WORKING: return 'text-indigo-500';
      case Section.PORTFOLIO: return 'text-blue-500';
      case Section.APPOINTMENT: return 'text-rose-500';
      case Section.CONTACT: return 'text-orange-500';
      default: return 'text-slate-800';
    }
  };

  const getIcon = () => {
    switch (section) {
      case Section.ABOUT: return '👤';
      case Section.WORKING: return '💼';
      case Section.PORTFOLIO: return '📁';
      case Section.APPOINTMENT: return '📅';
      case Section.CONTACT: return '📩';
      default: return '⚡';
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-md p-0 sm:p-6 transition-all duration-300">
      <div 
        className={`relative w-full ${isSubView ? 'max-w-2xl' : 'max-w-5xl'} h-[90vh] sm:h-auto sm:max-h-[85vh] bg-white/90 backdrop-blur-3xl rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border-t sm:border border-white/50 flex flex-col overflow-hidden animate-modal`}
      >
        {/* Sleek Mobile Indicator */}
        <div className="sm:hidden w-10 h-1 bg-slate-200 rounded-full mx-auto my-3 flex-shrink-0" />

        {/* Header Section */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 sm:px-10 py-4 sm:py-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl sm:text-2xl border border-slate-50`}>
              {getIcon()}
            </div>
            <div>
              <h2 className={`text-xl sm:text-3xl font-black tracking-tight uppercase leading-none ${getHeaderColor()}`}>
                {section}
              </h2>
              <p className="text-[9px] sm:text-[11px] font-bold tracking-[0.2em] text-slate-400 mt-0.5 uppercase">Digital Protocol v4.0</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="group active:scale-90 transition-all p-1"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl group-hover:bg-red-50 group-hover:border-red-500 transition-all">
               <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </div>
          </button>
        </div>

        {/* Content Container */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto smooth-scroll-container p-6 sm:p-10 overscroll-contain bg-white/30"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default SectionModal;
