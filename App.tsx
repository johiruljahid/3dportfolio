
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
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [apptState, setApptState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

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
    if (!selectedService || !appointmentDate || !appointmentTime) {
      alert("Selection Required: Please provide service, date, and time.");
      return;
    }
    setApptState('sending');
    try {
      await addDoc(collection(db, "appointments"), {
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

      {/* Popups */}
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

      <SectionModal section={Section.PORTFOLIO} isOpen={activeSection === Section.PORTFOLIO} onClose={closeSection}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
          {dynamicProjects.map((proj) => (
            <div key={proj.id} className="group bg-white/60 rounded-[2rem] overflow-hidden border border-white shadow-sm transition-all hover:shadow-xl flex flex-col">
              <div className="aspect-video w-full overflow-hidden relative">
                <img src={proj.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                  <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{proj.stats}</span>
                </div>
              </div>
              <div className="p-6 lg:p-10 text-left space-y-3 flex-1 flex flex-col">
                <h4 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">{proj.title}</h4>
                <p className="text-slate-500 text-xs lg:text-lg font-medium leading-relaxed line-clamp-2">{proj.description}</p>
                <div className="flex flex-wrap gap-2 pt-2 mt-auto">
                  {proj.tags?.map(tag => (
                    <span key={tag} className="text-[9px] font-bold bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionModal>

      <SectionModal section={Section.APPOINTMENT} isOpen={activeSection === Section.APPOINTMENT} onClose={closeSection}>
         <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            <div className="lg:w-1/3 text-center lg:text-left space-y-6">
               <div className="bg-rose-50/50 p-8 lg:p-12 rounded-3xl border border-rose-100">
                  <div className="text-6xl lg:text-8xl mb-6">📅</div>
                  <h4 className="text-3xl lg:text-6xl font-black text-slate-900 uppercase leading-none tracking-tighter">THE <span className="text-rose-500">AUDIT</span></h4>
                  <p className="text-[10px] lg:text-lg font-bold tracking-widest text-slate-400 mt-4 uppercase">Lock in your strategic growth synchronization slot.</p>
               </div>
            </div>
            <div className="flex-1 space-y-8">
               {apptState === 'success' ? (
                 <div className="py-16 text-center space-y-8 animate-modal">
                    <div className="text-7xl lg:text-9xl">✔️</div>
                    <h4 className="text-2xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter">Session Logged</h4>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Architect will contact you shortly.</p>
                    <button onClick={() => setApptState('idle')} className="px-8 py-3 bg-rose-500 text-white font-black uppercase text-xs tracking-widest rounded-xl">Refresh Portal</button>
                 </div>
               ) : (
                 <div className="space-y-8">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {dynamicServices.map(s => (
                        <button key={s.id} onClick={() => setSelectedService(s)} className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-5 text-left shadow-sm ${selectedService?.id === s.id ? 'border-rose-400 bg-rose-50/80 shadow-rose-100' : 'border-white bg-white hover:bg-slate-50'}`}>
                           <span className="text-3xl lg:text-4xl">{s.icon}</span>
                           <div>
                             <p className="text-sm lg:text-xl font-black text-slate-900 uppercase leading-tight">{s.name}</p>
                             <span className="text-[9px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">{s.duration} • {s.price}</span>
                           </div>
                        </button>
                      ))}
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase ml-1">DATE SELECTION</label>
                       <input type="date" className="w-full bg-white border border-slate-100 rounded-xl p-5 font-black text-slate-800 outline-none focus:border-rose-500 text-sm lg:text-xl" onChange={e => setAppointmentDate(e.target.value)} />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase ml-1">TIME SLOT</label>
                       <div className="grid grid-cols-3 gap-2">
                          {['09:00', '12:00', '15:00', '18:00', '21:00'].map(t => <button key={t} onClick={() => setAppointmentTime(t)} className={`py-4 rounded-xl border font-black text-[10px] lg:text-sm uppercase transition-all ${appointmentTime === t ? 'bg-rose-500 border-rose-500 text-white shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}>{t}</button>)}
                       </div>
                     </div>
                   </div>
                   <button onClick={handleAppointmentSubmit} className="w-full py-6 lg:py-10 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black tracking-[0.3em] lg:tracking-[0.6em] uppercase text-xs lg:text-2xl shadow-xl hover:-translate-y-1 transition-all">ESTABLISH CHANNEL</button>
                 </div>
               )}
            </div>
         </div>
      </SectionModal>

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
