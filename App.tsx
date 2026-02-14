
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
      {/* Redesigned Light Background */}
      <div className="light-background">
        <div className="floating-blob w-[50vw] h-[50vw] bg-indigo-100 top-[-10%] left-[-10%]"></div>
        <div className="floating-blob w-[40vw] h-[40vw] bg-cyan-50 bottom-[10%] right-[-5%]"></div>
        <div className="floating-blob w-[30vw] h-[30vw] bg-rose-50 top-[20%] right-[10%]" style={{animationDelay: '-5s'}}></div>
      </div>

      <div className="z-10 text-center flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-1000">
        {/* Profile Circle with Light Glow */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-6 bg-gradient-to-tr from-cyan-100 via-indigo-100 to-rose-100 rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full border border-white/80 p-1 glass-panel transition-transform duration-700 group-hover:rotate-3 group-hover:scale-105 shadow-xl">
            <div className="w-full h-full rounded-full overflow-hidden border border-slate-100">
              <img 
                src="https://picsum.photos/400/400?seed=shamim" 
                alt="Shamim Ahmed" 
                className="w-full h-full object-cover transition-all duration-700"
              />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-indigo-200/50 animate-pulse pointer-events-none"></div>
          </div>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight mb-3">
          SHAMIM <span className="text-indigo-600">AHMED</span>
        </h1>
        
        <div className="relative py-1.5 px-8 rounded-full glass-panel border border-white/60 mb-16 shadow-sm">
          <span className="relative z-10 text-slate-500 font-bold tracking-[0.4em] text-[10px] sm:text-xs uppercase">Digital Architect / Growth Hacker</span>
        </div>

        {/* Navigation Grid - White Glassmorphism Style */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-10 items-center">
          {MENU_ITEMS.map((item) => (
            <div key={item.id} className="flex flex-col items-center gap-4 group perspective-1000">
              <button
                onClick={() => setActiveSection(item.id)}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl glass-panel border-2 transition-3d hover-3d flex items-center justify-center p-4 ${item.color.split(' ')[0]} shadow-md group-hover:shadow-xl group-hover:bg-white/60`}
              >
                <img src={item.icon} alt={item.label} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-sm" />
              </button>
              <span className={`text-[9px] font-black tracking-[0.2em] px-4 py-1.5 rounded-full glass-panel border border-white/40 shadow-sm transition-all ${item.color.split(' ')[1]} uppercase`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <SectionModal section={Section.ABOUT} isOpen={activeSection === Section.ABOUT} onClose={closeSection}>
        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
          <div className="relative group w-full lg:w-1/3 aspect-square max-w-[320px]">
            <div className="absolute -inset-4 bg-cyan-100 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative h-full glass-panel rounded-[2rem] border-2 border-white/80 p-2 transition-all duration-700 shadow-xl overflow-hidden">
               <img src="https://picsum.photos/600/600?seed=profile" alt="Profile" className="w-full h-full object-cover rounded-2xl" />
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">
              Designing Digital Ecosystems That <br/><span className="text-cyan-600">Scale Beyond Boundaries.</span>
            </h3>
            <div className="space-y-4 text-slate-500 font-medium leading-relaxed text-sm">
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
                <div key={i} className="glass-panel p-4 rounded-2xl border border-white/80 text-center shadow-sm">
                   <div className="text-xl font-black text-slate-800">{stat.v}</div>
                   <div className="text-[8px] font-bold tracking-widest text-slate-400 uppercase">{stat.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionModal>

      {/* Working Section */}
      <SectionModal section={Section.WORKING} isOpen={activeSection === Section.WORKING} onClose={closeSection}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {EXPERIENCES.map((exp) => (
            <div key={exp.id} className="relative group glass-panel p-8 rounded-[2rem] border border-white/80 hover:border-indigo-200 transition-all duration-500 shadow-sm hover:shadow-lg">
              <div className="relative mb-8 flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl glass-panel p-3 border border-indigo-50 bg-white/40 shadow-sm">
                  <img src={exp.logo} alt={exp.company} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <div className="text-[9px] font-black tracking-widest text-indigo-500 glass-panel px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50/20">
                  {exp.period}
                </div>
              </div>
              <h4 className="text-lg font-black text-slate-800 mb-1 uppercase group-hover:text-indigo-600 transition-colors">{exp.company}</h4>
              <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-6">{exp.role}</p>
              <ul className="space-y-3 mb-8">
                {exp.tasks.map((task, idx) => (
                  <li key={idx} className="flex gap-3 text-xs text-slate-500 leading-tight">
                    <span className="text-indigo-400 font-bold">•</span>
                    {task}
                  </li>
                ))}
              </ul>
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
                 <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">Verification Active</span>
                 <div className="flex gap-1">
                   {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-indigo-200 rounded-full"></div>)}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </SectionModal>

      {/* Portfolio Section */}
      <SectionModal section={Section.PORTFOLIO} isOpen={activeSection === Section.PORTFOLIO} onClose={closeSection}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROJECTS.map((project) => (
            <button 
              key={project.id} 
              onClick={() => setSelectedProject(project)}
              className="glass-panel rounded-[2rem] border border-white/80 overflow-hidden group hover:border-blue-200 transition-all duration-500 text-left shadow-sm hover:shadow-xl"
            >
              <div className="h-56 overflow-hidden relative">
                <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-4 right-4 flex gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-[8px] font-black bg-white/80 backdrop-blur-md px-2 py-1 rounded-md border border-slate-100 text-slate-800 tracking-widest">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="p-8 space-y-3">
                <h4 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase leading-tight">{project.title}</h4>
                <p className="text-sm font-bold text-blue-500 tracking-tight">{project.stats}</p>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{project.description}</p>
              </div>
            </button>
          ))}
        </div>
      </SectionModal>

      {/* Sub-view Detail for Project */}
      {selectedProject && (
        <SectionModal section={Section.PORTFOLIO} isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} isSubView>
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
             <div className="relative h-64 sm:h-96 rounded-[2.5rem] overflow-hidden border border-white/80 shadow-lg">
               <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
               <div className="absolute bottom-8 left-8">
                  <h3 className="text-3xl font-black text-slate-900 uppercase mb-2">{selectedProject.title}</h3>
                  <div className="flex gap-4">
                    {selectedProject.tags.map(t => <span key={t} className="text-[10px] font-black tracking-widest text-blue-600 uppercase bg-white/50 px-3 py-1 rounded-full">{t}</span>)}
                  </div>
               </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <div className="md:col-span-2 space-y-6">
                 <h4 className="text-xl font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-4">Project Parameters</h4>
                 <p className="text-lg text-slate-500 leading-relaxed font-light">{selectedProject.longDescription}</p>
                 <div className="flex gap-4 pt-6">
                    <button className="px-8 py-3 rounded-full bg-blue-600 text-white font-black text-xs tracking-widest uppercase hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">View Channel</button>
                    <button className="px-8 py-3 rounded-full glass-panel border border-slate-200 text-slate-700 font-black text-xs tracking-widest uppercase hover:bg-slate-50 transition-all">Documentation</button>
                 </div>
               </div>
               <div className="space-y-6">
                  <div className="glass-panel p-6 rounded-3xl border border-white/80 bg-white/60 shadow-sm">
                    <h5 className="text-[10px] font-black text-blue-600 uppercase mb-4 tracking-widest">Growth Metrics</h5>
                    <div className="space-y-4">
                       <div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Impact Rating</p>
                         <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div className="w-[85%] h-full bg-blue-500"></div>
                         </div>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-slate-50">
                         <span className="text-xs font-bold text-slate-500">Sync Growth</span>
                         <span className="text-xs font-black text-emerald-600">+124%</span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-slate-50">
                         <span className="text-xs font-bold text-slate-500">Retention</span>
                         <span className="text-xs font-black text-blue-600">92%</span>
                       </div>
                    </div>
                  </div>
               </div>
             </div>
          </div>
        </SectionModal>
      )}

      {/* Appointment Section */}
      <SectionModal section={Section.APPOINTMENT} isOpen={activeSection === Section.APPOINTMENT} onClose={closeSection}>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/3">
             <div className="relative glass-panel p-8 rounded-[2.5rem] border border-white/80 flex flex-col h-full bg-white/60">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-8 shadow-sm">
                  <span className="text-4xl">⏰</span>
                </div>
                <h4 className="text-3xl font-black text-slate-900 mb-4 leading-none uppercase">TIME <br/><span className="text-rose-600">PORTAL</span></h4>
                <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase leading-relaxed mb-10">ALLOCATE OPERATIONAL CLOCK CYCLES FOR A DEEP DIVE INTO YOUR DIGITAL INFRASTRUCTURE.</p>
                <div className="mt-auto p-4 rounded-2xl glass-panel bg-rose-50/30 border border-rose-100 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                   </div>
                   <div>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Node Status</p>
                     <p className="text-[10px] font-black text-slate-800 uppercase">Available / Open</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex-1 space-y-12">
            {apptState === 'success' ? (
              <div className="py-20 flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                 <div className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-100 flex items-center justify-center text-3xl shadow-sm">🗓️</div>
                 <h4 className="text-2xl font-black text-slate-900 uppercase">Sync Point Set</h4>
                 <p className="text-slate-400 uppercase tracking-widest text-xs">Calendar event created. Check your inbox.</p>
                 <button onClick={() => setApptState('idle')} className="text-rose-600 font-black uppercase text-[10px] tracking-widest hover:underline">Reschedule</button>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <p className="text-[10px] font-black tracking-[0.4em] text-rose-500 uppercase flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> SELECT SERVICE
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SERVICES.map((s) => (
                      <button 
                        key={s.id} 
                        onClick={() => setSelectedService(s)}
                        className={`glass-panel p-5 rounded-2xl border transition-all group flex justify-between items-center ${selectedService?.id === s.id ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-rose-200'}`}
                      >
                        <div className="flex items-center gap-4 text-left">
                          <span className="text-2xl group-hover:scale-110 transition-transform">{s.icon}</span>
                          <div>
                            <h5 className="text-xs font-black text-slate-800 uppercase">{s.name}</h5>
                            <span className="text-[9px] font-bold text-slate-400 tracking-wider">{s.duration} • {s.price}</span>
                          </div>
                        </div>
                        {selectedService?.id === s.id && <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shadow-lg">
                           <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/></svg>
                        </div>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <p className="text-[10px] font-black tracking-[0.4em] text-rose-500 uppercase flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span> SELECT DATE
                    </p>
                    <div className="glass-panel p-1 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                      <input 
                        type="date" 
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="bg-transparent text-slate-800 w-full border-none focus:ring-0 uppercase tracking-widest text-sm font-black p-4"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <p className="text-[10px] font-black tracking-[0.4em] text-rose-500 uppercase flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span> SELECT TIME
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {['09:00', '11:30', '13:00', '15:30', '17:00', '19:30'].map((time) => (
                        <button 
                          key={time} 
                          onClick={() => setAppointmentTime(time)}
                          className={`glass-panel py-3 rounded-xl border transition-all uppercase text-[10px] font-black shadow-sm ${appointmentTime === time ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
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
                  className={`w-full py-5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-500 text-white font-black tracking-[0.5em] uppercase text-[11px] shadow-lg shadow-rose-200 transition-all active:scale-[0.98] ${(!selectedService || !appointmentDate || !appointmentTime || apptState === 'sending') ? 'opacity-30 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-xl'}`}>
                  {apptState === 'sending' ? 'SCHEDULING...' : 'CONFIRM APPOINTMENT'}
                </button>
              </>
            )}
          </div>
        </div>
      </SectionModal>

      {/* Contact Section */}
      <SectionModal section={Section.CONTACT} isOpen={activeSection === Section.CONTACT} onClose={closeSection}>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/3 space-y-8">
            <h4 className="text-2xl font-black text-orange-600 tracking-tight uppercase">DIRECT <br/><span className="text-orange-400">CONNECT</span></h4>
            <div className="space-y-4">
              {[
                { label: 'EMAIL', value: 'hello@shamimahmed.com', icon: '📩' },
                { label: 'LINKEDIN', value: 'shamim.digital', icon: '🌐' },
                { label: 'WHATSAPP', value: '+880 1XXX-XXXXXX', icon: '📱' }
              ].map((item, idx) => (
                <div key={idx} className="glass-panel p-6 rounded-[1.5rem] border border-slate-100 hover:border-orange-200 transition-all cursor-pointer group flex items-center gap-5 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[8px] font-black tracking-[0.4em] text-slate-400 uppercase mb-1">{item.label}</p>
                    <p className="text-sm font-black text-slate-800 group-hover:text-orange-600 transition-colors">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
             <div className="relative glass-panel p-10 rounded-[2.5rem] border border-white/80 shadow-sm bg-white/60">
               {formState === 'success' ? (
                 <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center text-4xl shadow-sm">✉️</div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 uppercase mb-2">Message Sent</h4>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">I have received your transmission. expect a reply within 24 operational hours.</p>
                    </div>
                    <button onClick={() => setFormState('idle')} className="text-[10px] font-black text-indigo-600 underline tracking-[0.4em] uppercase hover:text-indigo-800 transition-colors">Send Another</button>
                 </div>
               ) : (
                 <>
                   <h4 className="text-lg font-black text-slate-800 mb-10 tracking-[0.2em] uppercase border-l-4 border-orange-500 pl-4">SECURE MESSAGE PORTAL</h4>
                   <form onSubmit={handleContactSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase ml-4">Full Identity</label>
                         <input required value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} className="w-full glass-panel border border-slate-200 rounded-2xl p-5 text-slate-800 text-sm focus:border-orange-500 outline-none transition-all placeholder:text-slate-300 font-bold bg-white/20" placeholder="John Doe" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase ml-4">Digital Mail</label>
                         <input required type="email" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} className="w-full glass-panel border border-slate-200 rounded-2xl p-5 text-slate-800 text-sm focus:border-orange-500 outline-none transition-all placeholder:text-slate-300 font-bold bg-white/20" placeholder="john@example.com" />
                       </div>
                     </div>
                     <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase ml-4">Communication Body</label>
                       <textarea required rows={5} value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} className="w-full glass-panel border border-slate-200 rounded-2xl p-5 text-slate-800 text-sm focus:border-orange-500 outline-none transition-all placeholder:text-slate-300 font-bold resize-none bg-white/20" placeholder="Hello Shamim, I'd like to talk about..." />
                     </div>
                     <button 
                        disabled={formState === 'sending'}
                        className="w-full py-6 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black tracking-[0.6em] uppercase text-[10px] shadow-lg shadow-orange-100 hover:-translate-y-1 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50">
                       {formState === 'sending' ? 'TRANSMITTING...' : 'SEND MESSAGE'}
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
