
import React, { useState, useEffect, useRef } from 'react';
import { Section, AdminSection, Project, AppointmentService, Experience, ContactInfo } from './types';
import { MENU_ITEMS, EXPERIENCES, PROJECTS, SERVICES } from './constants';
import SectionModal from './components/SectionModal';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  setDoc,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.NONE);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [selectedService, setSelectedService] = useState<AppointmentService | null>(null);
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  
  const [profileImage, setProfileImage] = useState("https://picsum.photos/600/600?seed=shamim");
  const [dynamicAbout, setDynamicAbout] = useState({
    title: "Designing Digital Ecosystems That Scale Beyond Boundaries.",
    highlight: "Scale Beyond Boundaries.",
    description: "I am Shamim Ahmed, a dedicated Digital Architect with a relentless passion for crafting high-performance growth engines and future-proof architectures.",
    stats: [
      { l: 'PROJECTS', v: '250+' },
      { l: 'ROAS', v: '6.5X' },
      { l: 'CLIENTS', v: '18+' },
      { l: 'ADS SPENT', v: '$4.2M' }
    ]
  });
  
  const [dynamicExperiences, setDynamicExperiences] = useState<Experience[]>([]);
  const [dynamicProjects, setDynamicProjects] = useState<Project[]>([]);
  const [dynamicServices, setDynamicServices] = useState<AppointmentService[]>(SERVICES);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'hello@shamimahmed.com',
    linkedin: 'shamim.digital',
    whatsapp: '+880 1XXX-XXXXXX',
    phone: '+880 1XXX-XXXXXX'
  });

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  
  const [clientName, setClientName] = useState('');
  const [clientWhatsApp, setClientWhatsApp] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [apptState, setApptState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const [availableDates, setAvailableDates] = useState<{date: string, day: string, num: string}[]>([]);

  useEffect(() => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const next = new Date(today);
      next.setDate(today.getDate() + i);
      dates.push({
        date: next.toISOString().split('T')[0],
        day: next.toLocaleDateString('en-US', { weekday: 'short' }),
        num: next.getDate().toString()
      });
    }
    setAvailableDates(dates);
  }, []);

  useEffect(() => {
    const unsubExp = onSnapshot(query(collection(db, "experiences"), orderBy("period", "desc")), (snap) => {
      setDynamicExperiences(snap.docs.length > 0 ? snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Experience)) : EXPERIENCES);
    });

    const unsubProj = onSnapshot(query(collection(db, "projects")), (snap) => {
      setDynamicProjects(snap.docs.length > 0 ? snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)) : PROJECTS);
    });

    const unsubConfig = onSnapshot(doc(db, "siteConfig", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.about) setDynamicAbout(data.about);
        if (data.contact) setContactInfo(data.contact);
        if (data.profileImage) setProfileImage(data.profileImage);
      }
    });

    return () => { unsubExp(); unsubProj(); unsubConfig(); };
  }, []);

  const closeSection = () => {
    setActiveSection(Section.NONE);
    setSelectedProject(null);
    setSelectedService(null);
    setFormState('idle');
    setApptState('idle');
    setAppointmentDate('');
    setAppointmentTime('');
    setClientName('');
    setClientWhatsApp('');
    setActiveGalleryIndex(0);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === 'Jahid') {
      setIsAdminMode(true);
      setShowLogin(false);
      setAccessCode('');
    } else {
      alert('Security Breach: Token Invalid');
    }
  };

  const handleAppointmentSubmit = async () => {
    if (!selectedService || !appointmentDate || !appointmentTime || !clientName || !clientWhatsApp) {
      alert("Missing Parameters: Please provide your name, WhatsApp, service, date, and time.");
      return;
    }
    setApptState('sending');
    try {
      await addDoc(collection(db, "appointments"), {
        clientName,
        clientWhatsApp,
        service: selectedService.name,
        date: appointmentDate,
        time: appointmentTime,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      setApptState('success');
    } catch (error) {
      setApptState('error');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('sending');
    try {
      await addDoc(collection(db, "messages"), {
        ...contactForm,
        status: 'unread',
        timestamp: serverTimestamp()
      });
      setFormState('success');
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      setFormState('error');
    }
  };

  const nextImage = () => {
    if (selectedProject) {
      setActiveGalleryIndex((prev) => (prev + 1) % selectedProject.gallery.length);
    }
  };

  const prevImage = () => {
    if (selectedProject) {
      setActiveGalleryIndex((prev) => (prev - 1 + selectedProject.gallery.length) % selectedProject.gallery.length);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start lg:justify-center p-4 sm:p-10 bg-[#fbfcfd] overflow-x-hidden">
      {/* Admin Trigger */}
      <button onClick={() => setShowLogin(true)} className="fixed top-8 right-8 w-12 h-12 rounded-full flex items-center justify-center z-[50] opacity-10 hover:opacity-100 transition-opacity">
        <div className="w-2.5 h-2.5 bg-slate-400 rounded-full"></div>
      </button>

      {showLogin && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
           <form onSubmit={handleAdminLogin} className="w-full max-w-md bg-white p-10 lg:p-12 rounded-[2rem] border border-white shadow-2xl space-y-8 animate-modal">
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Command Key</h3>
                <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Identity Verification Required</p>
              </div>
              <input autoFocus type="password" placeholder="TOKEN" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-5 text-center text-slate-900 text-2xl font-black outline-none focus:border-indigo-500" value={accessCode} onChange={e => setAccessCode(e.target.value)} />
              <button type="submit" className="w-full py-5 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-colors">AUTHORIZE</button>
              <button type="button" onClick={() => setShowLogin(false)} className="w-full text-slate-400 font-bold text-xs uppercase hover:text-slate-600">Secure Exit</button>
           </form>
        </div>
      )}

      {isAdminMode && (
        <div className="fixed inset-0 z-[1100] bg-white flex flex-col p-6 sm:p-10">
          <div className="max-w-6xl mx-auto w-full flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black tracking-tighter">NEXUS_ADMIN_CORE</h2>
            <button onClick={() => setIsAdminMode(false)} className="px-6 py-2 bg-red-500 text-white text-xs font-black rounded-lg uppercase">Terminate</button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
             <div className="text-8xl mb-4">⚙️</div>
             <p className="font-black tracking-[0.3em] uppercase">Control System Online</p>
          </div>
        </div>
      )}

      <div className="light-background">
        <div className="floating-blob w-[50vw] h-[50vw] bg-indigo-50/50 top-[-5%] left-[-5%]"></div>
        <div className="floating-blob w-[40vw] h-[40vw] bg-cyan-50/50 bottom-[-5%] right-[-5%]"></div>
      </div>

      <div className="z-10 text-center flex flex-col items-center animate-in fade-in duration-1000 w-full max-w-[1400px] pt-12 lg:pt-0">
        {/* Profile */}
        <div className="relative mb-8 lg:mb-12 group">
          <div className="absolute -inset-6 bg-gradient-to-r from-cyan-100 to-indigo-100 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
          <div className="relative w-36 h-36 lg:w-72 lg:h-72 rounded-full border-4 lg:border-8 border-white p-1.5 glass-panel shadow-2xl overflow-hidden bg-white/40">
              <img src={profileImage} alt="Shamim" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-[10rem] font-black text-slate-900 tracking-tighter mb-4 text-3d-bold uppercase leading-none px-4">
          SHAMIM <span className="text-indigo-600">AHMED</span>
        </h1>
        
        <div className="relative py-2 sm:py-5 lg:py-8 px-6 sm:px-12 lg:px-20 rounded-full glass-panel border sm:border-2 border-white mb-12 lg:mb-20 shadow-xl group hover:scale-105 transition-all bg-white/80 inline-block">
          <span className="relative z-10 highlight-3d font-black tracking-[0.2em] lg:tracking-[0.6em] text-[10px] sm:text-xl lg:text-4xl uppercase whitespace-nowrap">
            Digital Architect
          </span>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-10 sm:gap-y-16 gap-x-6 sm:gap-x-12 items-start w-full px-4 lg:px-20">
          {MENU_ITEMS.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveSection(item.id)} 
              className={`flex flex-col items-center gap-4 lg:gap-8 group transition-all duration-300 hover:scale-110 active:scale-95 ${item.id === Section.CONTACT && 'col-span-2 md:col-span-1'}`}
            >
              <div className={`relative w-28 h-28 lg:w-56 lg:h-56 rounded-full glass-panel border-[3px] lg:border-[6px] flex items-center justify-center overflow-hidden transition-all shadow-xl ${item.color.split(' ')[0]} ${item.color.split(' ')[2]}`}>
                <img src={item.icon} alt={item.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              
              <div className="w-full flex justify-center">
                <span className={`inline-block text-center text-[10px] lg:text-xl font-black tracking-[0.2em] lg:tracking-[0.3em] px-4 lg:px-10 py-3 lg:py-5 rounded-full glass-panel border lg:border-2 border-white shadow-lg ${item.color.split(' ')[1]} uppercase text-3d-light bg-white/95 whitespace-nowrap`}>
                  {item.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* About Popup */}
      <SectionModal section={Section.ABOUT} isOpen={activeSection === Section.ABOUT} onClose={closeSection}>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-center lg:items-start">
          <div className="w-full lg:w-2/5 max-w-[360px]">
             <img src={profileImage} className="w-full h-auto rounded-3xl border-4 border-white shadow-xl bg-white p-1" />
          </div>
          <div className="flex-1 text-left space-y-6 lg:space-y-10">
            <h3 className="text-2xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
               {dynamicAbout.title.replace(dynamicAbout.highlight, '')} <span className="text-cyan-500">{dynamicAbout.highlight}</span>
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed text-sm lg:text-2xl">{dynamicAbout.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {dynamicAbout.stats.map((s, i) => (
                <div key={i} className="bg-white/60 p-4 lg:p-8 rounded-2xl border border-white text-center shadow-sm">
                   <div className="text-xl lg:text-4xl font-black text-slate-800">{s.v}</div>
                   <div className="text-[9px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionModal>

      {/* Working Popup */}
      <SectionModal section={Section.WORKING} isOpen={activeSection === Section.WORKING} onClose={closeSection}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {dynamicExperiences.map((exp) => (
            <div key={exp.id} className="bg-white/60 p-6 lg:p-10 rounded-3xl border border-white shadow-sm text-left flex flex-col sm:flex-row gap-6">
              <img src={exp.logo} className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white p-2 flex-shrink-0 shadow-sm border border-slate-50" />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                  <div>
                    <h4 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase">{exp.company}</h4>
                    <p className="text-indigo-500 text-[10px] lg:text-sm font-black tracking-widest uppercase">{exp.role}</p>
                  </div>
                  <span className="inline-block text-[9px] lg:text-xs font-bold text-indigo-400 bg-indigo-50/50 px-3 py-1 rounded-full border border-indigo-100 uppercase self-start">{exp.period}</span>
                </div>
                <ul className="space-y-2 lg:space-y-3">
                  {exp.tasks?.map((t, i) => <li key={i} className="flex gap-3 text-xs lg:text-lg text-slate-500 leading-snug"><span className="text-indigo-400">⚡</span> {t}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </SectionModal>

      {/* Enhanced Portfolio Popup with Detail View */}
      <SectionModal section={Section.PORTFOLIO} isOpen={activeSection === Section.PORTFOLIO} onClose={closeSection}>
        {selectedProject ? (
          // Detail View
          <div className="animate-modal flex flex-col gap-10">
            {/* Back Button */}
            <button 
              onClick={() => { setSelectedProject(null); setActiveGalleryIndex(0); }}
              className="group flex items-center gap-3 self-start text-xs lg:text-lg font-black text-blue-500 uppercase tracking-widest"
            >
              <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full border border-blue-200 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              BACK TO PORTFOLIO
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
              {/* Image Gallery Column */}
              <div className="space-y-6">
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-900 group">
                  <img 
                    src={selectedProject.gallery[activeGalleryIndex]} 
                    className="w-full h-full object-cover transition-transform duration-700" 
                    alt={selectedProject.title}
                  />
                  
                  {/* Navigation Arrows */}
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button 
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="pointer-events-auto w-10 h-10 lg:w-14 lg:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/40 active:scale-90 transition-all shadow-lg"
                    >
                      <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="pointer-events-auto w-10 h-10 lg:w-14 lg:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/40 active:scale-90 transition-all shadow-lg"
                    >
                      <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Indicators */}
                  <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2">
                    {selectedProject.gallery.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1.5 lg:h-2 rounded-full transition-all duration-300 ${activeGalleryIndex === i ? 'w-8 bg-blue-500' : 'w-2 bg-white/50'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-4 gap-3">
                  {selectedProject.gallery.map((img, i) => (
                    <button 
                      key={i}
                      onClick={() => setActiveGalleryIndex(i)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeGalleryIndex === i ? 'border-blue-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Information Column */}
              <div className="text-left space-y-8">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedProject.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-black bg-blue-50 text-blue-500 border border-blue-100 px-4 py-1.5 rounded-full uppercase tracking-widest">{tag}</span>
                    ))}
                  </div>
                  <h3 className="text-3xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">{selectedProject.title}</h3>
                  <div className="h-1.5 w-24 bg-blue-500 rounded-full mt-4" />
                </div>

                <div className="bg-slate-50 p-6 lg:p-10 rounded-[2rem] border border-slate-100 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-2xl text-white shadow-lg shadow-blue-200">📊</div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Impact Metric</p>
                      <p className="text-xl lg:text-3xl font-black text-slate-900">{selectedProject.stats}</p>
                    </div>
                  </div>
                  <p className="text-sm lg:text-2xl font-medium text-slate-500 leading-relaxed italic">"{selectedProject.description}"</p>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] lg:text-xs font-black text-slate-400 tracking-[0.4em] uppercase">PROJECT OVERVIEW</p>
                  <p className="text-base lg:text-2xl font-medium text-slate-600 leading-relaxed">
                    {selectedProject.longDescription}
                  </p>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => setActiveSection(Section.CONTACT)}
                    className="w-full py-6 lg:py-10 rounded-2xl bg-slate-900 text-white font-black tracking-[0.3em] uppercase text-xs lg:text-2xl hover:bg-blue-600 transition-all shadow-xl hover:-translate-y-1"
                  >
                    INQUIRE ABOUT THIS FRAMEWORK
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
            {dynamicProjects.map((proj) => (
              <button 
                key={proj.id} 
                onClick={() => { setSelectedProject(proj); setActiveGalleryIndex(0); }}
                className="group bg-white/60 rounded-[2.5rem] overflow-hidden border border-white shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col text-left"
              >
                <div className="aspect-[4/3] w-full overflow-hidden relative">
                  <img src={proj.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-5 left-5">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest">{proj.stats}</span>
                  </div>
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/20 transition-all duration-500 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white text-blue-500 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-500 shadow-xl">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-8 lg:p-10 space-y-4 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2">
                    {proj.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[8px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase">{tag}</span>
                    ))}
                  </div>
                  <h4 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight group-hover:text-blue-500 transition-colors">{proj.title}</h4>
                  <p className="text-slate-500 text-xs lg:text-lg font-medium leading-relaxed line-clamp-2">{proj.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </SectionModal>

      {/* Smart Appointment Popup */}
      <SectionModal section={Section.APPOINTMENT} isOpen={activeSection === Section.APPOINTMENT} onClose={closeSection}>
         <div className="max-w-5xl mx-auto">
            {apptState === 'success' ? (
              <div className="py-20 text-center space-y-10 animate-modal bg-emerald-50/40 rounded-[3rem] border border-emerald-100">
                 <div className="text-8xl lg:text-[10rem] animate-pulse">🚀</div>
                 <div className="space-y-4">
                   <h4 className="text-3xl lg:text-6xl font-black text-slate-900 uppercase tracking-tighter">Transmission Confirmed</h4>
                   <p className="text-slate-500 text-sm lg:text-xl font-medium max-w-md mx-auto px-6">The architectural handshake has been logged. Stand by for WhatsApp confirmation.</p>
                 </div>
                 <button onClick={() => setApptState('idle')} className="px-12 py-5 bg-emerald-500 text-white font-black uppercase text-xs lg:text-lg tracking-widest rounded-full shadow-lg hover:bg-emerald-600 transition-all">Start New Audit</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Protocol Selection (Step 1) */}
                <div className="lg:col-span-4 space-y-8">
                   <div className="bg-rose-500 p-8 lg:p-10 rounded-[2.5rem] text-white shadow-xl space-y-4">
                      <h4 className="text-2xl font-black uppercase tracking-tighter leading-none">Schedule <br/>Audit</h4>
                      <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Protocol Sync Engine v5.2</p>
                      
                      {selectedService && (
                        <div className="pt-6 border-t border-white/20">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">TARGETED ACTION</p>
                          <p className="text-xl font-black uppercase leading-tight">{selectedService.name}</p>
                        </div>
                      )}
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase ml-2">1. SELECT ACTION</p>
                      <div className="space-y-3">
                        {dynamicServices.map(s => (
                          <button 
                            key={s.id} 
                            onClick={() => setSelectedService(s)} 
                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${selectedService?.id === s.id ? 'border-rose-400 bg-rose-50/50 shadow-md' : 'border-slate-50 bg-white hover:border-rose-200'}`}
                          >
                            <span className="text-2xl w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-50">{s.icon}</span>
                            <div className="flex-1">
                              <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{s.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{s.duration} • {s.price}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

                {/* Identity & Calendar (Steps 2 & 3) */}
                <div className="lg:col-span-8 space-y-10">
                   
                   {/* Step 2: Identity Inputs */}
                   <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                      <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase">2. AUDIT IDENTITY</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase ml-1">YOUR NAME</label>
                          <input 
                            required
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-black text-sm lg:text-lg focus:border-rose-400 outline-none transition-all"
                            placeholder="FULL NAME"
                            value={clientName}
                            onChange={e => setClientName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase ml-1">WHATSAPP NUMBER</label>
                          <input 
                            required
                            type="tel" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-black text-sm lg:text-lg focus:border-rose-400 outline-none transition-all"
                            placeholder="+880 1XXX-XXXXXX"
                            value={clientWhatsApp}
                            onChange={e => setClientWhatsApp(e.target.value)}
                          />
                        </div>
                      </div>
                   </div>

                   {/* Step 3: Smart Calendar Grid */}
                   <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase">3. CALENDAR HUB</p>
                        {appointmentDate && <span className="text-[9px] font-black text-rose-500 uppercase">Selected: {appointmentDate}</span>}
                      </div>

                      <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar scroll-smooth">
                        {availableDates.map((d) => (
                          <button
                            key={d.date}
                            onClick={() => setAppointmentDate(d.date)}
                            className={`flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${appointmentDate === d.date ? 'border-rose-500 bg-rose-500 text-white shadow-lg scale-105' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-rose-200 hover:text-rose-500'}`}
                          >
                            <span className={`text-[9px] font-black uppercase tracking-widest ${appointmentDate === d.date ? 'text-white' : 'text-slate-400'}`}>{d.day}</span>
                            <span className="text-xl sm:text-3xl font-black">{d.num}</span>
                            {appointmentDate === d.date && <div className="w-1 h-1 bg-white rounded-full mt-1 animate-pulse" />}
                          </button>
                        ))}
                      </div>

                      {/* Time Slots */}
                      <div className="space-y-6 pt-4 border-t border-slate-50">
                         <div className="flex justify-between items-center px-1">
                           <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase">4. SYNC WINDOW</p>
                           {appointmentTime && <span className="text-[9px] font-black text-rose-500 uppercase">SLOT: {appointmentTime}</span>}
                         </div>
                         <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                            {['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00', '22:30'].map(t => (
                              <button 
                                key={t} 
                                onClick={() => setAppointmentTime(t)} 
                                className={`py-3 rounded-lg border-2 font-black text-[9px] sm:text-xs uppercase transition-all ${appointmentTime === t ? 'bg-rose-500 border-rose-500 text-white shadow-md' : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-rose-200 hover:text-rose-400'}`}
                              >
                                {t}
                              </button>
                            ))}
                         </div>
                      </div>

                      {/* Action */}
                      <div className="pt-8">
                         <button 
                           disabled={!selectedService || !appointmentDate || !appointmentTime || !clientName || !clientWhatsApp}
                           onClick={handleAppointmentSubmit}
                           className={`w-full py-6 lg:py-8 rounded-2xl font-black tracking-[0.4em] uppercase text-xs lg:text-xl transition-all shadow-xl flex items-center justify-center gap-4 ${(!selectedService || !appointmentDate || !appointmentTime || !clientName || !clientWhatsApp) ? 'bg-slate-100 text-slate-300' : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:scale-[1.01] active:scale-95'}`}
                         >
                           {apptState === 'sending' ? 'TRANSMITTING...' : 'ESTABLISH ARCHITECTURAL SYNC'}
                         </button>
                         <p className="text-[8px] font-bold text-slate-300 text-center mt-6 uppercase tracking-[0.2em]">handshake verified by secure cloud architecture</p>
                      </div>
                   </div>
                </div>
              </div>
            )}
         </div>
      </SectionModal>

      {/* Contact Popup */}
      <SectionModal section={Section.CONTACT} isOpen={activeSection === Section.CONTACT} onClose={closeSection}>
         <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
            <div className="lg:w-1/3 text-left space-y-8">
               <div className="space-y-2">
                 <h4 className="text-3xl lg:text-6xl font-black text-orange-500 tracking-tighter uppercase leading-none">THE <br/><span className="text-orange-300">HUB</span></h4>
                 <p className="text-[10px] lg:text-sm font-bold tracking-[0.4em] text-slate-400 uppercase">Secure Communication Core</p>
               </div>
               <div className="space-y-4">
                 {[{ label: 'MAIL', v: contactInfo.email, i: '✉️' }, { label: 'SOCIAL', v: contactInfo.linkedin, i: '🌐' }, { label: 'TEXT', v: contactInfo.whatsapp, i: '📱' }].map(item => (
                   <div key={item.label} className="bg-white/60 p-5 lg:p-8 rounded-2xl border border-white flex items-center gap-5 shadow-sm hover:scale-[1.02] transition-transform">
                      <div className="text-3xl lg:text-4xl">{item.i}</div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-0.5">{item.label}</p>
                        <p className="text-xs lg:text-xl font-black text-slate-900 break-all leading-tight uppercase">{item.v}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
            <div className="flex-1">
               <div className="bg-white/80 p-8 lg:p-14 rounded-[2rem] border border-white shadow-sm">
                 {formState === 'success' ? (
                   <div className="py-20 text-center space-y-8 animate-modal">
                      <div className="text-7xl lg:text-9xl">✉️</div>
                      <h4 className="text-2xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter">Transmission Sent</h4>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Encryption Successful.</p>
                      <button onClick={() => setFormState('idle')} className="text-xs lg:text-xl font-black text-indigo-500 underline uppercase tracking-widest">New Transmission</button>
                   </div>
                 ) : (
                   <form onSubmit={handleContactSubmit} className="space-y-5 lg:space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
                       <div className="space-y-1.5">
                         <label className="text-[9px] font-black text-slate-400 tracking-[0.3em] uppercase ml-1">IDENTITY</label>
                         <input required className="w-full bg-slate-50 border border-slate-100 rounded-xl p-5 text-slate-900 font-black text-sm lg:text-2xl focus:border-orange-400 shadow-sm outline-none" placeholder="NAME" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-[9px] font-black text-slate-400 tracking-[0.3em] uppercase ml-1">SECURE MAIL</label>
                         <input required type="email" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-5 text-slate-900 font-black text-sm lg:text-2xl focus:border-orange-400 shadow-sm outline-none" placeholder="EMAIL" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
                       </div>
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 tracking-[0.3em] uppercase ml-1">ENCRYPTED MESSAGE</label>
                       <textarea required rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 lg:p-10 text-slate-900 font-black text-sm lg:text-2xl focus:border-orange-400 shadow-sm resize-none outline-none" placeholder="MESSAGE BODY..." value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} />
                     </div>
                     <button className="w-full py-6 lg:py-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black tracking-[0.4em] lg:tracking-[0.8em] uppercase text-xs lg:text-2xl shadow-xl hover:-translate-y-1 transition-all">EXECUTE SEND</button>
                   </form>
                 )}
               </div>
            </div>
         </div>
      </SectionModal>
    </div>
  );
};

export default App;
