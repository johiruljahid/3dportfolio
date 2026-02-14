
import React, { useState } from 'react';
import { Section, Project, AppointmentService } from './types';
import { MENU_ITEMS, EXPERIENCES, PROJECTS, SERVICES } from './constants';
import SectionModal from './components/SectionModal';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.NONE);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedService, setSelectedService] = useState<AppointmentService | null>(null);
  
  // States for Contact Form
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // States for Appointment
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [apptState, setApptState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const closeSection = () => {
    setActiveSection(Section.NONE);
    setSelectedProject(null);
    setSelectedService(null);
    setFormState('idle');
    setApptState('idle');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('sending');
    try {
      await addDoc(collection(db, "messages"), {
        ...contactForm,
        timestamp: serverTimestamp()
      });
      setFormState('success');
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Error sending message:", error);
      setFormState('error');
    }
  };

  const handleAppointmentSubmit = async () => {
    if (!selectedService || !appointmentDate || !appointmentTime) return;
    setApptState('sending');
    try {
      await addDoc(collection(db, "appointments"), {
        service: selectedService.name,
        date: appointmentDate,
        time: appointmentTime,
        timestamp: serverTimestamp(),
        status: 'pending'
      });
      setApptState('success');
    } catch (error) {
      console.error("Error booking appointment:", error);
      setApptState('error');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden perspective-1000">
      <div className="star-background">
        <div className="stars"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[70vw] h-[70vw] bg-indigo-600/10 rounded-full blur-[160px] glow-overlay"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[160px] glow-overlay" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="z-10 text-center flex flex-col items-center animate-in fade-in zoom-in duration-1000">
        <div className="relative mb-10 group">
          <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500 via-indigo-500 to-rose-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-white/10 p-2 glass-panel transition-transform duration-700 group-hover:rotate-6 group-hover:scale-105 shadow-2xl">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/20">
              <img 
                src="https://picsum.photos/400/400?grayscale" 
                alt="Shamim Ahmed" 
                className="w-full h-full object-cover grayscale brightness-110 group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping opacity-20 pointer-events-none"></div>
          </div>
        </div>

        <h1 className="text-6xl sm:text-8xl font-black text-white tracking-widest mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          SHAMIM <span className="text-cyan-400">AHMED</span>
        </h1>
        
        <div className="relative py-2 px-10 rounded-full glass-panel border border-white/10 overflow-hidden mb-20">
          <span className="relative z-10 text-blue-300 font-bold tracking-[0.5em] text-xs sm:text-sm uppercase">Digital Architect / Growth Hacker</span>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent animate-pulse"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-14 items-center">
          {MENU_ITEMS.map((item) => (
            <div key={item.id} className="flex flex-col items-center gap-6 group perspective-1000">
              <button
                onClick={() => setActiveSection(item.id)}
                className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl glass-panel border-2 transition-3d hover-3d flex items-center justify-center p-4 ${item.color.split(' ')[0]} shadow-[0_15px_35px_rgba(0,0,0,0.4)] group-hover:shadow-[0_20px_45px_rgba(255,255,255,0.05)]`}
              >
                <img src={item.icon} alt={item.label} className="w-full h-full object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
                </div>
              </button>
              <span className={`text-[10px] font-black tracking-[0.3em] px-5 py-2 rounded-full glass-panel border border-white/5 group-hover:border-white/20 transition-all ${item.color.split(' ')[1]}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <SectionModal section={Section.ABOUT} isOpen={activeSection === Section.ABOUT} onClose={closeSection}>
        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
          <div className="relative group w-full lg:w-1/3 aspect-square max-w-[320px]">
            <div className="absolute -inset-4 bg-cyan-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative h-full glass-panel rounded-[2rem] border-2 border-cyan-500/30 p-2 transition-all duration-700 group-hover:rotate-2 shadow-2xl overflow-hidden">
               <img src="https://picsum.photos/600/600?grayscale&v=1" alt="Profile" className="w-full h-full object-cover rounded-2xl opacity-80 group-hover:opacity-100 transition-all" />
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight leading-tight uppercase">
              Designing Digital Ecosystems That <br/>Scale Beyond Boundaries.
            </h3>
            <div className="space-y-4 text-slate-300 font-light leading-relaxed">
              <p>I am Shamim Ahmed, a dedicated Digital Architect with a relentless passion for crafting high-performance growth engines. Over the last 7 years, I've transformed small startups into market-dominating brands using a combination of psychological marketing and data-driven architecture.</p>
              <p>My methodology focuses on "The Nexus" — where user experience meets business objectives. I don't just run ads; I build autonomous systems that attract, convert, and retain customers with surgical precision.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              {[
                { l: 'PROJECTS', v: '250+' },
                { l: 'ROAS', v: '6.5X' },
                { l: 'CLIENTS', v: '18+' },
                { l: 'ADS SPENT', v: '$4.2M' }
              ].map((stat, i) => (
                <div key={i} className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
                   <div className="text-xl font-black text-white">{stat.v}</div>
                   <div className="text-[8px] font-bold tracking-widest text-slate-500 uppercase">{stat.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionModal>

      <SectionModal section={Section.WORKING} isOpen={activeSection === Section.WORKING} onClose={closeSection}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {EXPERIENCES.map((exp) => (
            <div key={exp.id} className="relative group glass-panel p-8 rounded-[2rem] border border-white/5 hover:border-indigo-500/40 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all"></div>
              <div className="relative mb-8 flex justify-between items-start">
                <div className="w-14 h-14 rounded-xl glass-panel p-3 border border-white/10 bg-white/5">
                  <img src={exp.logo} alt={exp.company} className="w-full h-full object-contain filter invert" />
                </div>
                <div className="text-[10px] font-bold tracking-widest text-slate-500 glass-panel px-3 py-1 rounded-full border border-white/10">
                  {exp.period}
                </div>
              </div>
              <h4 className="text-xl font-black text-white mb-1 group-hover:text-indigo-400 transition-colors uppercase">{exp.company}</h4>
              <p className="text-indigo-300 text-[10px] font-black tracking-widest uppercase mb-6">{exp.role}</p>
              <ul className="space-y-3 mb-8">
                {exp.tasks.map((task, idx) => (
                  <li key={idx} className="flex gap-3 text-xs text-slate-400 leading-tight">
                    <span className="text-indigo-500/60">•</span>
                    {task}
                  </li>
                ))}
              </ul>
              <div className="pt-6 border-t border-white/5 flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
                 <span className="text-[8px] font-bold tracking-widest text-slate-500 uppercase">Verification Active</span>
                 <div className="flex gap-1">
                   {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-indigo-500 rounded-full"></div>)}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </SectionModal>

      <SectionModal section={Section.PORTFOLIO} isOpen={activeSection === Section.PORTFOLIO} onClose={closeSection}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROJECTS.map((project) => (
            <button 
              key={project.id} 
              onClick={() => setSelectedProject(project)}
              className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden group hover:border-blue-500/40 transition-all duration-500 text-left"
            >
              <div className="h-56 overflow-hidden relative">
                <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4 flex gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-[8px] font-black bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 text-white tracking-widest">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="p-8 space-y-3">
                <h4 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors uppercase leading-tight">{project.title}</h4>
                <p className="text-sm font-bold text-cyan-400 tracking-tight">{project.stats}</p>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{project.description}</p>
              </div>
            </button>
          ))}
        </div>
      </SectionModal>

      {selectedProject && (
        <SectionModal section={Section.PORTFOLIO} isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} isSubView>
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
             <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
               <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
               <div className="absolute bottom-8 left-8">
                  <h3 className="text-4xl font-black text-white uppercase mb-2 text-glow-indigo">{selectedProject.title}</h3>
                  <div className="flex gap-4">
                    {selectedProject.tags.map(t => <span key={t} className="text-[10px] font-black tracking-widest text-blue-400 uppercase">{t}</span>)}
                  </div>
               </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <div className="md:col-span-2 space-y-6">
                 <h4 className="text-xl font-black text-white uppercase tracking-wider border-b border-white/10 pb-4">Operational Summary</h4>
                 <p className="text-lg text-slate-300 leading-relaxed font-light">{selectedProject.longDescription}</p>
                 <div className="flex gap-4 pt-6">
                    <button className="px-8 py-3 rounded-full bg-blue-500 text-white font-black text-xs tracking-widest uppercase hover:bg-blue-600 transition-colors shadow-lg">View Live Channel</button>
                    <button className="px-8 py-3 rounded-full glass-panel border border-white/10 text-white font-black text-xs tracking-widest uppercase hover:bg-white/10 transition-all">Documentation</button>
                 </div>
               </div>
               <div className="space-y-6">
                  <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-white/5">
                    <h5 className="text-xs font-black text-blue-400 uppercase mb-4 tracking-widest">Key Metrics</h5>
                    <div className="space-y-4">
                       <div>
                         <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Impact Velocity</p>
                         <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                           <div className="w-[85%] h-full bg-blue-500"></div>
                         </div>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-white/5">
                         <span className="text-xs font-bold text-slate-300">Conversion Growth</span>
                         <span className="text-xs font-black text-emerald-400">+124%</span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-white/5">
                         <span className="text-xs font-bold text-slate-300">Customer LTV</span>
                         <span className="text-xs font-black text-blue-400">$2.4K</span>
                       </div>
                    </div>
                  </div>
               </div>
             </div>
          </div>
        </SectionModal>
      )}

      <SectionModal section={Section.APPOINTMENT} isOpen={activeSection === Section.APPOINTMENT} onClose={closeSection}>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/3">
             <div className="relative glass-panel p-8 rounded-[2.5rem] border border-white/10 flex flex-col h-full bg-gradient-to-br from-white/5 to-transparent">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-8 shadow-xl shadow-rose-500/10">
                  <span className="text-4xl animate-pulse">⚡</span>
                </div>
                <h4 className="text-3xl font-black text-white mb-4 leading-none uppercase">TEMPORAL <br/><span className="text-rose-400">SYNC</span></h4>
                <p className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase leading-relaxed mb-10">ALLOCATE OPERATIONAL CLOCK CYCLES FOR A DEEP DIVE INTO YOUR DIGITAL INFRASTRUCTURE.</p>
                <div className="mt-auto p-4 rounded-2xl glass-panel bg-white/5 border border-white/5 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                   </div>
                   <div>
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Global Status</p>
                     <p className="text-[10px] font-black text-white uppercase">Operational / Open</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex-1 space-y-12">
            {apptState === 'success' ? (
              <div className="py-20 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in">
                 <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center text-3xl">📅</div>
                 <h4 className="text-2xl font-black text-white uppercase">Synchronization Scheduled</h4>
                 <p className="text-slate-500 uppercase tracking-widest text-xs">Wait for confirmation in your neural network.</p>
                 <button onClick={() => setApptState('idle')} className="text-rose-400 underline uppercase text-[10px] font-black tracking-widest">Reschedule Slot</button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-[10px] font-black tracking-[0.4em] text-rose-400 uppercase mb-6 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> 01. SELECT CAPABILITY
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SERVICES.map((s) => (
                      <button 
                        key={s.id} 
                        onClick={() => setSelectedService(s)}
                        className={`glass-panel p-5 rounded-2xl border transition-all group flex justify-between items-center ${selectedService?.id === s.id ? 'border-rose-500 bg-rose-500/10' : 'border-white/5 hover:border-white/20'}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl group-hover:scale-110 transition-transform">{s.icon}</span>
                          <div>
                            <h5 className="text-xs font-black text-white uppercase">{s.name}</h5>
                            <span className="text-[9px] font-bold text-slate-500 tracking-wider">{s.duration} • {s.price}</span>
                          </div>
                        </div>
                        {selectedService?.id === s.id && <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
                           <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/></svg>
                        </div>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <p className="text-[10px] font-black tracking-[0.4em] text-rose-400 uppercase flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span> 02. TEMPORAL POINT
                    </p>
                    <div className="glass-panel p-2 rounded-2xl border border-white/10 overflow-hidden">
                      <input 
                        type="date" 
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="bg-transparent text-white w-full border-none focus:ring-0 uppercase tracking-widest text-sm font-black p-4 invert brightness-200" style={{colorScheme: 'dark'}} 
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <p className="text-[10px] font-black tracking-[0.4em] text-rose-400 uppercase flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span> 03. SYSTEM CLOCK
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {['09:00', '11:30', '13:00', '15:30', '17:00', '19:30'].map((time) => (
                        <button 
                          key={time} 
                          onClick={() => setAppointmentTime(time)}
                          className={`glass-panel py-3 rounded-xl border transition-all uppercase text-[10px] font-black ${appointmentTime === time ? 'bg-rose-500 border-rose-500 text-white' : 'border-white/5 text-slate-400 hover:text-white hover:bg-rose-500/20'}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleAppointmentSubmit}
                  disabled={!selectedService || !appointmentDate || !appointmentTime || apptState === 'sending'}
                  className={`w-full py-5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black tracking-[0.5em] uppercase text-xs shadow-2xl transition-all active:scale-[0.98] ${(!selectedService || !appointmentDate || !appointmentTime || apptState === 'sending') ? 'opacity-30 cursor-not-allowed' : 'hover:shadow-[0_0_40px_rgba(244,63,94,0.4)] hover:-translate-y-1'}`}>
                  {apptState === 'sending' ? 'SYNCHRONIZING...' : 'INITIATE SYNCHRONIZATION'}
                </button>
              </>
            )}
          </div>
        </div>
      </SectionModal>

      <SectionModal section={Section.CONTACT} isOpen={activeSection === Section.CONTACT} onClose={closeSection}>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/3 space-y-8">
            <h4 className="text-2xl font-black text-orange-400 tracking-widest uppercase">ENCRYPTED <br/>COMMS</h4>
            <div className="space-y-4">
              {[
                { label: 'NEURAL LINK', value: 'hello@shamimahmed.com', icon: '📧' },
                { label: 'OPERATIONAL NODE', value: 'linkedin.com/in/shamim', icon: '🔗' },
                { label: 'DIRECT FREQUENCY', value: 'whatsapp.secure', icon: '💬' }
              ].map((item, idx) => (
                <div key={idx} className="glass-panel p-6 rounded-[1.5rem] border border-white/5 hover:border-orange-500/30 transition-all cursor-pointer group flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl glass-panel flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{item.icon}</div>
                  <div>
                    <p className="text-[8px] font-black tracking-[0.4em] text-slate-500 uppercase mb-1">{item.label}</p>
                    <p className="text-sm font-black text-white group-hover:text-orange-400 transition-colors">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
             <div className="relative glass-panel p-10 rounded-[2.5rem] border border-white/10 overflow-hidden">
               {formState === 'success' ? (
                 <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-4xl shadow-2xl shadow-emerald-500/20">✅</div>
                    <div>
                      <h4 className="text-2xl font-black text-white uppercase mb-2">TRANSMISSION RECEIVED</h4>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed">The digital architect will decrypt your message shortly. Stand by for response.</p>
                    </div>
                    <button onClick={() => setFormState('idle')} className="text-[10px] font-black text-cyan-400 underline tracking-[0.4em] uppercase hover:text-white transition-colors">Resend Transmission</button>
                 </div>
               ) : (
                 <>
                   <h4 className="text-lg font-black text-white mb-10 tracking-[0.3em] uppercase border-l-4 border-orange-500 pl-4">SECURE MESSAGE PORTAL</h4>
                   <form onSubmit={handleContactSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-500 tracking-widest uppercase ml-4">Entity Identifier</label>
                         <input required value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} className="w-full glass-panel border border-white/10 rounded-2xl p-5 text-white text-sm focus:border-orange-500/50 outline-none transition-all placeholder:text-slate-700 font-bold bg-white/5" placeholder="Your Name" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-500 tracking-widest uppercase ml-4">Digital Routing</label>
                         <input required type="email" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} className="w-full glass-panel border border-white/10 rounded-2xl p-5 text-white text-sm focus:border-orange-500/50 outline-none transition-all placeholder:text-slate-700 font-bold bg-white/5" placeholder="you@agency.com" />
                       </div>
                     </div>
                     <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 tracking-widest uppercase ml-4">Operational Query</label>
                       <textarea required rows={5} value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} className="w-full glass-panel border border-white/10 rounded-2xl p-5 text-white text-sm focus:border-orange-500/50 outline-none transition-all placeholder:text-slate-700 font-bold resize-none bg-white/5" placeholder="Describe the mission parameters..." />
                     </div>
                     <button 
                        disabled={formState === 'sending'}
                        className="w-full py-6 rounded-2xl bg-gradient-to-r from-orange-600 via-rose-600 to-pink-600 text-white font-black tracking-[0.6em] uppercase text-[10px] hover:shadow-[0_0_50px_rgba(249,115,22,0.4)] transition-all active:scale-[0.98] disabled:opacity-50">
                       {formState === 'sending' ? 'UPLOADING DATA...' : 'LAUNCH TRANSMISSION'}
                     </button>
                   </form>
                 </>
               )}
             </div>
          </div>
        </div>
      </SectionModal>
    </div>
  );
};

export default App;
