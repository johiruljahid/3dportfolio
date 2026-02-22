
import React, { useState, useEffect, useRef } from 'react';
import { Section, AdminSection, Project, AppointmentService, Experience, ContactInfo } from './types';
import { MENU_ITEMS, EXPERIENCES, PROJECTS, SERVICES } from './constants';
import SectionModal from './components/SectionModal';
import { db, storage } from './firebase';
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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const App: React.FC = () => {
  // Navigation & UI State
  const [activeSection, setActiveSection] = useState<Section>(Section.NONE);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [selectedService, setSelectedService] = useState<AppointmentService | null>(null);
  
  // Admin Core State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<AdminSection>(AdminSection.ABOUT);
  const [showLogin, setShowLogin] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  
  // Global Site Data State
  const [userName, setUserName] = useState("SHAMIM AHMED");
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
  const [appointments, setAppointments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'hello@shamimahmed.com',
    linkedin: 'shamim.digital',
    whatsapp: '+880 1XXX-XXXXXX',
    phone: '+880 1XXX-XXXXXX',
    facebook: '',
    instagram: '',
    website: ''
  });

  // Form States
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [clientName, setClientName] = useState('');
  const [clientWhatsApp, setClientWhatsApp] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [apptState, setApptState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [availableDates, setAvailableDates] = useState<{date: string, day: string, num: string}[]>([]);

  // Admin Specific UI State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Sync UI Data
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

    // Firestore Listeners
    const unsubExp = onSnapshot(query(collection(db, "experiences"), orderBy("period", "desc")), (snap) => {
      setDynamicExperiences(snap.docs.length > 0 ? snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Experience)) : EXPERIENCES);
    });
    const unsubProj = onSnapshot(query(collection(db, "projects")), (snap) => {
      setDynamicProjects(snap.docs.length > 0 ? snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)) : PROJECTS);
    });
    const unsubAppts = onSnapshot(query(collection(db, "appointments"), orderBy("timestamp", "desc")), (snap) => {
      setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubMsgs = onSnapshot(query(collection(db, "messages"), orderBy("timestamp", "desc")), (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubConfig = onSnapshot(doc(db, "siteConfig", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.about) setDynamicAbout(data.about);
        if (data.contact) setContactInfo({ ...contactInfo, ...data.contact });
        if (data.profileImage) setProfileImage(data.profileImage);
        if (data.userName) setUserName(data.userName);
      }
    });

    return () => { unsubExp(); unsubProj(); unsubAppts(); unsubMsgs(); unsubConfig(); };
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

  // --- Image Upload Logic ---
  const uploadImage = async (file: File, folder: string): Promise<string> => {
    setIsUploading(true);
    console.log(`System: Initiating upload to vault -> ${folder}`);
    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      console.log(`System: Asset deployed successfully at -> ${url}`);
      return url;
    } catch (error) {
      console.error("System Core Error: Media transmission failed.", error);
      alert("Transmission Error: Media upload failed.");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImage(e.target.files[0], 'profiles');
        setProfileImage(url);
        // TARGETED RECORDING: Immediately save the specific field to Firestore
        await updateDoc(doc(db, "siteConfig", "global"), { profileImage: url });
        console.log("System: Profile identity record updated.");
      } catch (err) {
        console.error(err);
      }
    }
    // Reset file picker
    e.target.value = '';
  };

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingProject && e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImage(e.target.files[0], 'projects');
        const updated = { ...editingProject, image: url };
        setEditingProject(updated);
        // TARGETED RECORDING: If editing an existing project, save immediately
        if (editingProject.id) {
          await updateDoc(doc(db, "projects", editingProject.id), { image: url });
          console.log("System: Project module image synced.");
        }
      } catch (err) {
        console.error(err);
      }
    }
    e.target.value = '';
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingProject && e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImage(e.target.files[0], 'gallery');
        const newGallery = [...editingProject.gallery, url];
        const updated = { ...editingProject, gallery: newGallery };
        setEditingProject(updated);
        // TARGETED RECORDING: If editing an existing project, save immediately
        if (editingProject.id) {
          await updateDoc(doc(db, "projects", editingProject.id), { gallery: newGallery });
          console.log("System: Gallery vault item added.");
        }
      } catch (err) {
        console.error(err);
      }
    }
    e.target.value = '';
  };

  // --- Firestore CRUD Helpers ---
  const saveSiteConfig = async (newData: any, showAlert = true) => {
    try {
      await setDoc(doc(db, "siteConfig", "global"), newData, { merge: true });
      if (showAlert) alert("System Core Updated Successfully.");
    } catch (err) {
      console.error(err);
      alert("Transmission Error: Update Failed.");
    }
  };

  const addProject = async () => {
    const p: Partial<Project> = {
      title: 'NEW PROJECT MODULE',
      stats: '0% GROWTH',
      description: 'Brief project mission statement...',
      longDescription: 'Extended technical documentation of the project framework...',
      image: 'https://picsum.photos/800/600',
      gallery: ['https://picsum.photos/800/600'],
      color: 'text-blue-500',
      tags: ['NEW', 'MODULE']
    };
    const docRef = await addDoc(collection(db, "projects"), p);
    // Open editor immediately for new project
    setEditingProject({ id: docRef.id, ...p } as Project);
  };

  const deleteItem = async (col: string, id: string) => {
    if (window.confirm("CRITICAL WARNING: This action will permanently wipe this record from the central Firestore database. Proceed?")) {
      try {
        await deleteDoc(doc(db, col, id));
        if (editingProject && editingProject.id === id) setEditingProject(null);
        alert("Record Wiped Successfully.");
      } catch (err) {
        alert("Deletion Error: Persistence Layer Rejected Command.");
      }
    }
  };

  const saveProjectEdit = async () => {
    if (!editingProject) return;
    const { id, ...data } = editingProject;
    try {
      await updateDoc(doc(db, "projects", id), data);
      setEditingProject(null);
      alert("Project Vault Synced.");
    } catch (err) {
      alert("Sync Error: Failed to commit changes to database.");
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

  const renderHeroName = () => {
    const parts = userName.trim().split(' ');
    if (parts.length > 1) {
      const last = parts.pop();
      return (
        <>
          {parts.join(' ')} <span className="text-indigo-600">{last}</span>
        </>
      );
    }
    return userName;
  };

  // Helper to format WhatsApp Link
  const getWhatsAppLink = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    return `https://wa.me/${cleaned}`;
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start lg:justify-center p-4 sm:p-10 bg-[#fbfcfd] overflow-x-hidden">
      
      {/* Admin Command Access */}
      {!isAdminMode && (
        <button onClick={() => setShowLogin(true)} className="fixed top-8 right-8 w-12 h-12 rounded-full flex items-center justify-center z-[50] opacity-5 hover:opacity-100 transition-opacity">
          <div className="w-2.5 h-2.5 bg-slate-400 rounded-full"></div>
        </button>
      )}

      {/* Admin Login Portal */}
      {showLogin && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-2xl">
           <form onSubmit={handleAdminLogin} className="w-full max-w-md bg-white p-12 rounded-[3rem] border border-white shadow-2xl space-y-8 animate-modal text-left">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4">🔑</div>
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">NEXUS ACCESS</h3>
                <p className="text-[10px] text-slate-400 font-bold tracking-[0.4em] uppercase">Security Protocol Required</p>
              </div>
              <input autoFocus type="password" placeholder="ENTER MASTER TOKEN" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-center text-slate-900 text-3xl font-black outline-none focus:border-indigo-500" value={accessCode} onChange={e => setAccessCode(e.target.value)} />
              <button type="submit" className="w-full py-6 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-[0.3em] text-sm hover:bg-slate-800 transition-all">AUTHENTICATE</button>
              <button type="button" onClick={() => setShowLogin(false)} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 text-center">Close Link</button>
           </form>
        </div>
      )}

      {/* Admin Command Center */}
      {isAdminMode && (
        <div className="fixed inset-0 z-[1500] bg-white flex flex-col lg:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          
          {/* Project Editor Modal Inside Admin */}
          {editingProject && (
            <div className="fixed inset-0 z-[1600] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 lg:p-10">
              <div className="bg-white w-full max-w-5xl max-h-full overflow-y-auto rounded-[3rem] p-8 lg:p-14 space-y-10 shadow-2xl animate-modal relative">
                {isUploading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4 rounded-[3rem] text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">Uploading to Vault...</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-left">
                  <h4 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter text-left">Edit Project Framework</h4>
                  <button onClick={() => setEditingProject(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  <div className="space-y-6 text-left">
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Core Title</label>
                      <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-left" value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} />
                    </div>
                    
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Impact Metric (Stats)</label>
                      <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-left" value={editingProject.stats} onChange={e => setEditingProject({...editingProject, stats: e.target.value})} />
                    </div>
                    
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Main Preview Image</label>
                      <div className="flex gap-4 text-left">
                        <div className="w-24 h-16 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 text-center">
                          <img src={editingProject.image} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                        <div className="flex-1 space-y-2 text-left">
                          <input className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg font-medium text-[10px] text-left" value={editingProject.image} onChange={e => setEditingProject({...editingProject, image: e.target.value})} placeholder="Direct Image URL" />
                          <label className="block w-full text-center py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-indigo-100 transition-colors">
                            Upload from Device
                            <input type="file" className="hidden" accept="image/*" onChange={handleProjectImageUpload} />
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Tags (Comma Separated)</label>
                      <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-left" value={editingProject.tags.join(', ')} onChange={e => setEditingProject({...editingProject, tags: e.target.value.split(',').map(s => s.trim())})} />
                    </div>
                  </div>
                  
                  <div className="space-y-6 text-left">
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Narrative Description</label>
                      <textarea rows={3} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-medium text-left" value={editingProject.description} onChange={e => setEditingProject({...editingProject, description: e.target.value})} />
                    </div>
                    
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Technical Documentation (Long Desc)</label>
                      <textarea rows={6} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-medium text-left" value={editingProject.longDescription} onChange={e => setEditingProject({...editingProject, longDescription: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Gallery Manager */}
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center text-left">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Image Gallery Vault</p>
                    <label className="text-blue-500 font-black text-xs uppercase cursor-pointer hover:underline text-left">
                      + Direct Upload Image
                      <input type="file" className="hidden" accept="image/*" onChange={handleGalleryImageUpload} />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                    {editingProject.gallery.map((url, idx) => (
                      <div key={idx} className="relative bg-slate-50 p-4 rounded-2xl border border-slate-100 group text-left">
                        <input className="w-full bg-transparent border-none font-medium text-[9px] text-slate-400 focus:ring-0 mb-2 text-left" value={url} onChange={e => {
                          const newGallery = [...editingProject.gallery];
                          newGallery[idx] = e.target.value;
                          setEditingProject({...editingProject, gallery: newGallery});
                        }} />
                        <button onClick={() => {
                          const newGallery = editingProject.gallery.filter((_, i) => i !== idx);
                          setEditingProject({...editingProject, gallery: newGallery});
                        }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <img src={url} className="w-full h-32 object-cover rounded-xl border border-slate-200 text-center" alt="Preview" />
                      </div>
                    ))}
                    {/* Manual Link Slot */}
                    <button 
                      onClick={() => setEditingProject({...editingProject, gallery: [...editingProject.gallery, 'https://']})}
                      className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-300 hover:text-blue-500 hover:border-blue-500 transition-all group text-center"
                    >
                      <span className="text-2xl mb-2 text-center">🔗</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-center">Add Manual Link</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 text-left">
                  <button onClick={saveProjectEdit} className="flex-1 py-6 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-indigo-600 transition-all text-center">SYNC PROJECT MODULE</button>
                  <button onClick={() => deleteItem("projects", editingProject.id)} className="flex-1 py-6 bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 text-center">
                    <svg className="w-5 h-5 text-center" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    WIPE FROM DATABASE
                  </button>
                  <button onClick={() => setEditingProject(null)} className="px-10 py-6 bg-slate-100 text-slate-400 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-colors text-center">Abort</button>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar Navigation */}
          <div className="w-full lg:w-80 bg-slate-950 text-white flex flex-col border-r border-slate-800 text-left">
            <div className="p-8 border-b border-slate-900 text-left">
              <h2 className="text-xl font-black tracking-tighter text-indigo-400 uppercase leading-none text-left">Command <br/><span className="text-white">Center</span></h2>
              <p className="text-[9px] font-bold text-slate-500 tracking-[0.3em] uppercase mt-2 text-left">v5.0.4 ARCHITECT</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-2 text-left">
              {[
                { id: AdminSection.ABOUT, label: 'BIO-CORE', icon: '👤' },
                { id: AdminSection.WORKING, label: 'EXPERIENCE LAB', icon: '💼' },
                { id: AdminSection.PORTFOLIO, label: 'PROJECT VAULT', icon: '📁' },
                { id: AdminSection.APPOINTMENT, label: 'SYNC REQUESTS', icon: '📅' },
                { id: AdminSection.MESSAGES, label: 'COMM INBOX', icon: '✉️' },
                { id: AdminSection.CONTACT_EDIT, label: 'ID ENTITY', icon: '🌐' },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveAdminTab(tab.id)}
                  className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all uppercase font-black text-[11px] tracking-widest text-left ${activeAdminTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-900 text-slate-400'}`}
                >
                  <span className="text-xl text-left">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-slate-900 text-left">
               <button onClick={() => setIsAdminMode(false)} className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all text-center">TERMINATE SESSION</button>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-12 text-left">
            
            {/* Bio-Core (About) */}
            {activeAdminTab === AdminSection.ABOUT && (
              <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 relative text-left">
                {isUploading && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-[2.5rem] text-center">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin text-center"></div>
                  </div>
                )}
                <div className="flex justify-between items-end text-left">
                  <h3 className="text-4xl font-black tracking-tighter uppercase text-left">Bio-Core Management</h3>
                </div>
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-10 text-left">
                  <div className="flex flex-col md:flex-row gap-10 items-start text-left">
                    <div className="w-full md:w-1/3 space-y-4 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Profile Identity Media</label>
                      <div className="aspect-square w-full rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner group relative bg-slate-100 text-center">
                        <img src={profileImage} className="w-full h-full object-cover" alt="Profile" />
                        <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-center">
                          <span className="text-white font-black text-[10px] uppercase px-4 text-center">Upload from Device</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
                        </label>
                      </div>
                      <div className="space-y-2 text-left">
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-left">Manual Link Sync</p>
                        <input 
                          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-left" 
                          placeholder="PASTE IMAGE URL..."
                          value={profileImage}
                          onChange={e => setProfileImage(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex-1 space-y-6 text-left">
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Full Identity Name</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-lg text-left" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Full Name..." />
                      </div>
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Header Mission Title</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-lg text-left" value={dynamicAbout.title} onChange={e => setDynamicAbout({...dynamicAbout, title: e.target.value})} />
                      </div>
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Highlight Text Colorized</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-lg text-indigo-500 text-left" value={dynamicAbout.highlight} onChange={e => setDynamicAbout({...dynamicAbout, highlight: e.target.value})} />
                      </div>
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Detailed Narrative</label>
                        <textarea rows={4} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-medium text-left" value={dynamicAbout.description} onChange={e => setDynamicAbout({...dynamicAbout, description: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats Manager */}
                  <div className="space-y-6 pt-6 border-t border-slate-50 text-left">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Performance Metrics (Stats)</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                       {dynamicAbout.stats.map((stat, i) => (
                         <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-left">
                            <input className="w-full bg-transparent border-none p-0 text-[10px] font-black uppercase text-slate-400 tracking-widest text-left" value={stat.l} onChange={e => {
                              const newStats = [...dynamicAbout.stats];
                              newStats[i].l = e.target.value;
                              setDynamicAbout({...dynamicAbout, stats: newStats});
                            }} />
                            <input className="w-full bg-transparent border-none p-0 text-2xl font-black text-slate-900 text-left" value={stat.v} onChange={e => {
                              const newStats = [...dynamicAbout.stats];
                              newStats[i].v = e.target.value;
                              setDynamicAbout({...dynamicAbout, stats: newStats});
                            }} />
                         </div>
                       ))}
                    </div>
                  </div>

                  <button onClick={() => saveSiteConfig({about: dynamicAbout, profileImage, userName, contact: contactInfo})} className="w-full py-6 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest shadow-xl hover:scale-[1.01] transition-all text-center">SYNCHRONIZE CORE DATA</button>
                </div>
              </div>
            )}

            {/* Experience Lab */}
            {activeAdminTab === AdminSection.WORKING && (
              <div className="max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 text-left">
                <div className="flex justify-between items-center text-left">
                  <h3 className="text-4xl font-black tracking-tighter uppercase text-left">Experience Lab</h3>
                  <button onClick={async () => await addDoc(collection(db, "experiences"), {company: 'NEW AGENCY', role: 'ROLE', period: '20XX - 20XX', tasks: ['Task 1', 'Task 2'], logo: 'https://cdn-icons-png.flaticon.com/512/3242/3242257.png'})} className="px-8 py-4 bg-emerald-500 text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-lg hover:scale-105 active:scale-95 transition-all text-center">+ New Record</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  {dynamicExperiences.map(exp => (
                    <div key={exp.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6 text-left">
                       <div className="flex items-center gap-4 text-left">
                          <img src={exp.logo} className="w-12 h-12 rounded-xl border p-1 text-center" alt="Logo" />
                          <div className="flex-1 text-left">
                            <input className="font-black text-xl uppercase w-full bg-transparent outline-none focus:text-indigo-500 text-left" value={exp.company} onChange={e => updateDoc(doc(db, "experiences", exp.id), {company: e.target.value})} />
                            <input className="font-bold text-slate-400 uppercase w-full bg-transparent outline-none text-[10px] tracking-widest text-left" value={exp.role} onChange={e => updateDoc(doc(db, "experiences", exp.id), {role: e.target.value})} />
                          </div>
                       </div>
                       <input className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-black uppercase tracking-widest text-left" value={exp.period} onChange={e => updateDoc(doc(db, "experiences", exp.id), {period: e.target.value})} />
                       <button onClick={() => deleteItem("experiences", exp.id)} className="text-red-500 text-[9px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity text-left">Delete History</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Vault */}
            {activeAdminTab === AdminSection.PORTFOLIO && (
              <div className="max-w-6xl space-y-10 animate-in fade-in slide-in-from-bottom-4 text-left">
                <div className="flex justify-between items-center text-left">
                  <h3 className="text-4xl font-black tracking-tighter uppercase text-left">Project Vault</h3>
                  <button onClick={addProject} className="px-8 py-4 bg-blue-600 text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-lg hover:scale-105 transition-all text-center">+ Deploy New Project</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                  {dynamicProjects.map(proj => (
                    <div key={proj.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm flex flex-col relative text-left">
                       <div className="h-48 w-full overflow-hidden relative text-center">
                         <img src={proj.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 text-center" alt={proj.title} />
                         <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-center">
                            <button onClick={() => setEditingProject(proj)} className="bg-white text-slate-900 px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all text-center">Open Editor</button>
                         </div>
                       </div>
                       <div className="p-8 space-y-4 flex-1 flex flex-col text-left">
                          <h4 className="font-black text-xl uppercase leading-none text-left">{proj.title}</h4>
                          <p className="text-blue-500 font-black text-[10px] tracking-widest uppercase text-left">{proj.stats}</p>
                          <div className="pt-4 mt-auto border-t border-slate-50 flex justify-between items-center text-left">
                             <button onClick={() => setEditingProject(proj)} className="text-slate-400 hover:text-blue-500 font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-1 text-left">
                               Configure
                             </button>
                             <button onClick={() => deleteItem("projects", proj.id)} className="text-red-300 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-1 text-left">
                               Wipe Module
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAdminTab === AdminSection.APPOINTMENT && (
              <div className="max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 text-left">
                <h3 className="text-4xl font-black tracking-tighter uppercase text-left">Sync Requests</h3>
                <div className="space-y-4 text-left">
                   {appointments.map(appt => (
                     <div key={appt.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-8 text-left">
                        <div className="flex-1 space-y-2 text-left">
                          <h4 className="font-black text-2xl uppercase leading-none text-left">{appt.clientName}</h4>
                          <div className="flex gap-4 items-center text-left">
                            <span className="text-emerald-500 font-black text-xs tracking-widest text-left">WA: {appt.clientWhatsApp}</span>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest text-left">{appt.service}</span>
                          </div>
                        </div>
                        <button onClick={() => deleteItem("appointments", appt.id)} className="px-8 py-4 bg-red-50 text-red-500 font-black text-[10px] rounded-2xl uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all text-center">Clear Sync</button>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {activeAdminTab === AdminSection.MESSAGES && (
              <div className="max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 text-left">
                <h3 className="text-4xl font-black tracking-tighter uppercase text-left">Comm Inbox</h3>
                <div className="grid grid-cols-1 gap-8 text-left">
                  {messages.map(msg => (
                    <div key={msg.id} className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 text-left">
                       <div className="flex justify-between items-start text-left">
                         <div className="space-y-2 text-left">
                           <h4 className="font-black text-3xl uppercase leading-none text-left">{msg.name}</h4>
                           <p className="text-indigo-500 font-bold text-xs uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full inline-block text-left">{msg.email}</p>
                         </div>
                         <button onClick={() => deleteItem("messages", msg.id)} className="text-red-300 hover:text-red-500 font-black text-[10px] uppercase tracking-widest border border-red-100 px-4 py-2 rounded-xl transition-all text-center">Archive</button>
                       </div>
                       <p className="text-slate-600 font-medium text-xl leading-relaxed italic text-left">"{msg.message}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAdminTab === AdminSection.CONTACT_EDIT && (
              <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 text-left">
                <h3 className="text-4xl font-black tracking-tighter uppercase text-left">ID Entity Config</h3>
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-10 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="space-y-3 text-left">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Primary Email Channel</label>
                       <input className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-left" value={contactInfo.email} onChange={e => setContactInfo({...contactInfo, email: e.target.value})} />
                    </div>
                    <div className="space-y-3 text-left">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">WhatsApp Number (e.g. +880...)</label>
                       <input className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-left" value={contactInfo.whatsapp} onChange={e => setContactInfo({...contactInfo, whatsapp: e.target.value})} />
                    </div>
                    <div className="space-y-3 text-left">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">LinkedIn Profile URL</label>
                       <input className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-left" value={contactInfo.linkedin} onChange={e => setContactInfo({...contactInfo, linkedin: e.target.value})} />
                    </div>
                    <div className="space-y-3 text-left">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Facebook Profile URL</label>
                       <input className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-left" value={contactInfo.facebook} onChange={e => setContactInfo({...contactInfo, facebook: e.target.value})} />
                    </div>
                    <div className="space-y-3 text-left">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Instagram Profile URL</label>
                       <input className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-left" value={contactInfo.instagram} onChange={e => setContactInfo({...contactInfo, instagram: e.target.value})} />
                    </div>
                    <div className="space-y-3 text-left">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Direct Portfolio/Website URL</label>
                       <input className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-left" value={contactInfo.website} onChange={e => setContactInfo({...contactInfo, website: e.target.value})} />
                    </div>
                  </div>
                  <button onClick={() => saveSiteConfig({contact: contactInfo, about: dynamicAbout, profileImage, userName})} className="w-full py-6 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest shadow-xl text-center">Update Global Identity</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Hero Visual Backgrounds */}
      <div className="light-background">
        <div className="floating-blob w-[50vw] h-[50vw] bg-indigo-50/50 top-[-5%] left-[-5%]"></div>
        <div className="floating-blob w-[40vw] h-[40vw] bg-cyan-50/50 bottom-[-5%] right-[-5%]"></div>
      </div>

      <div className="z-10 text-center flex flex-col items-center animate-in fade-in duration-1000 w-full max-w-[1400px] pt-12 lg:pt-0 text-center">
        {/* Profile */}
        <div className="relative mb-8 lg:mb-12 group text-center">
          <div className="absolute -inset-6 bg-gradient-to-r from-cyan-100 to-indigo-100 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
          <div className="relative w-36 h-36 lg:w-72 lg:h-72 rounded-full border-4 lg:border-8 border-white p-1.5 glass-panel shadow-2xl overflow-hidden bg-white/40 text-center">
              <img src={profileImage} alt="Shamim" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>

        {/* Dynamic Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-[10rem] font-black text-slate-900 tracking-tighter mb-4 text-3d-bold uppercase leading-none px-4 text-center">
          {renderHeroName()}
        </h1>
        
        <div className="relative py-2 sm:py-5 lg:py-8 px-6 sm:px-12 lg:px-20 rounded-full glass-panel border sm:border-2 border-white mb-12 lg:mb-20 shadow-xl group hover:scale-105 transition-all bg-white/80 inline-block text-center">
          <span className="relative z-10 highlight-3d font-black tracking-[0.2em] lg:tracking-[0.6em] text-[10px] sm:text-xl lg:text-4xl uppercase whitespace-nowrap text-center">
            Digital Architect
          </span>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-10 sm:gap-y-16 gap-x-6 sm:gap-x-12 items-start w-full px-4 lg:px-20 text-center">
          {MENU_ITEMS.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveSection(item.id)} 
              className={`flex flex-col items-center gap-4 lg:gap-8 group transition-all duration-300 hover:scale-110 active:scale-95 text-center ${item.id === Section.CONTACT && 'col-span-2 md:col-span-1'}`}
            >
              <div className={`relative w-28 h-28 lg:w-56 lg:h-56 rounded-full glass-panel border-[3px] lg:border-[6px] flex items-center justify-center overflow-hidden transition-all shadow-xl text-center ${item.color.split(' ')[0]} ${item.color.split(' ')[2]}`}>
                <img src={item.icon} alt={item.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 text-center" />
              </div>
              
              <div className="w-full flex justify-center text-center">
                <span className={`inline-block text-center text-[10px] lg:text-xl font-black tracking-[0.2em] lg:tracking-[0.3em] px-4 lg:px-10 py-3 lg:py-5 rounded-full glass-panel border lg:border-2 border-white shadow-lg ${item.color.split(' ')[1]} uppercase text-3d-light bg-white/95 whitespace-nowrap text-center`}>
                  {item.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Popups */}
      <SectionModal section={Section.ABOUT} isOpen={activeSection === Section.ABOUT} onClose={closeSection}>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-center lg:items-start text-left">
          <div className="w-full lg:w-2/5 max-w-[360px] text-left">
             <img src={profileImage} className="w-full h-auto rounded-3xl border-4 border-white shadow-xl bg-white p-1 text-left" />
          </div>
          <div className="flex-1 space-y-6 lg:space-y-10 text-left">
            <h3 className="text-2xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-tight text-left">
               {dynamicAbout.title.replace(dynamicAbout.highlight, '')} <span className="text-cyan-500 text-left">{dynamicAbout.highlight}</span>
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed text-sm lg:text-2xl text-left">{dynamicAbout.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-left">
              {dynamicAbout.stats.map((s, i) => (
                <div key={i} className="bg-white/60 p-4 lg:p-8 rounded-2xl border border-white text-center shadow-sm text-left">
                   <div className="text-xl lg:text-4xl font-black text-slate-800 text-center">{s.v}</div>
                   <div className="text-[9px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-center">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionModal>

      <SectionModal section={Section.WORKING} isOpen={activeSection === Section.WORKING} onClose={closeSection}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 text-left">
          {dynamicExperiences.map((exp) => (
            <div key={exp.id} className="bg-white/60 p-6 lg:p-10 rounded-3xl border border-white shadow-sm flex flex-col sm:flex-row gap-6 text-left">
              <img src={exp.logo} className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white p-2 flex-shrink-0 shadow-sm border border-slate-50 text-left" />
              <div className="flex-1 text-left">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2 text-left">
                  <div className="text-left">
                    <h4 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase text-left">{exp.company}</h4>
                    <p className="text-indigo-500 text-[10px] lg:text-sm font-black tracking-widest uppercase text-left">{exp.role}</p>
                  </div>
                  <span className="inline-block text-[9px] lg:text-xs font-bold text-indigo-400 bg-indigo-50/50 px-3 py-1 rounded-full border border-indigo-100 uppercase self-start text-center">{exp.period}</span>
                </div>
                <ul className="space-y-2 lg:space-y-3 text-left">
                  {exp.tasks?.map((t, i) => <li key={i} className="flex gap-3 text-xs lg:text-lg text-slate-500 leading-snug text-left"><span className="text-indigo-400 text-left">⚡</span> {t}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </SectionModal>

      <SectionModal section={Section.PORTFOLIO} isOpen={activeSection === Section.PORTFOLIO} onClose={closeSection}>
        {selectedProject ? (
          <div className="animate-modal flex flex-col gap-10 text-left">
            <button onClick={() => { setSelectedProject(null); setActiveGalleryIndex(0); }} className="group flex items-center gap-3 self-start text-xs lg:text-lg font-black text-blue-500 uppercase tracking-widest text-left">
              <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full border border-blue-200 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm text-center">
                <svg className="w-4 h-4 lg:w-6 lg:h-6 text-center" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
              </div>
              BACK TO PORTFOLIO
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 text-left">
              <div className="space-y-6 text-left">
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-900 group text-center">
                  <img src={selectedProject.gallery[activeGalleryIndex]} className="w-full h-full object-cover transition-transform duration-700 text-center" alt={selectedProject.title} />
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none text-center">
                    <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="pointer-events-auto w-10 h-10 lg:w-14 lg:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/40 active:scale-90 transition-all shadow-lg text-center">
                      <svg className="w-6 h-6 lg:w-8 lg:h-8 text-center" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="pointer-events-auto w-10 h-10 lg:w-14 lg:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/40 active:scale-90 transition-all shadow-lg text-center">
                      <svg className="w-6 h-6 lg:w-8 lg:h-8 text-center" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                  <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2 text-center">
                    {selectedProject.gallery.map((_, i) => (
                      <div key={i} className={`h-1.5 lg:h-2 rounded-full transition-all duration-300 text-center ${activeGalleryIndex === i ? 'w-8 bg-blue-500' : 'w-2 bg-white/50'}`} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-left">
                  {selectedProject.gallery.map((img, i) => (
                    <button key={i} onClick={() => setActiveGalleryIndex(i)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all text-center ${activeGalleryIndex === i ? 'border-blue-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={img} className="w-full h-full object-cover text-center" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-left space-y-8">
                <div className="space-y-2 text-left">
                  <div className="flex flex-wrap gap-2 mb-4 text-left">
                    {selectedProject.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-black bg-blue-50 text-blue-500 border border-blue-100 px-4 py-1.5 rounded-full uppercase tracking-widest text-left">{tag}</span>
                    ))}
                  </div>
                  <h3 className="text-3xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none text-left">{selectedProject.title}</h3>
                </div>
                <div className="bg-slate-50 p-6 lg:p-10 rounded-[2rem] border border-slate-100 space-y-6 text-left">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-2xl text-white shadow-lg shadow-blue-200 text-center">📊</div>
                    <div className="text-left"><p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase text-left">Impact Metric</p><p className="text-xl lg:text-3xl font-black text-slate-900 text-left">{selectedProject.stats}</p></div>
                  </div>
                  <p className="text-sm lg:text-2xl font-medium text-slate-500 leading-relaxed italic text-left">"{selectedProject.description}"</p>
                </div>
                <div className="space-y-6 text-left">
                  <p className="text-[10px] lg:text-xs font-black text-slate-400 tracking-[0.4em] uppercase text-left">PROJECT OVERVIEW</p>
                  <p className="text-base lg:text-2xl font-medium text-slate-600 leading-relaxed text-left">{selectedProject.longDescription}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 text-left">
            {dynamicProjects.map((proj) => (
              <button key={proj.id} onClick={() => { setSelectedProject(proj); setActiveGalleryIndex(0); }} className="group bg-white/60 rounded-[2.5rem] overflow-hidden border border-white shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col text-left">
                <div className="aspect-[4/3] w-full overflow-hidden relative text-center">
                  <img src={proj.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 text-center" />
                  <div className="absolute top-5 left-5 text-left"><span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest text-center">{proj.stats}</span></div>
                </div>
                <div className="p-8 lg:p-10 space-y-4 flex-1 flex flex-col text-left">
                  <div className="flex flex-wrap gap-2 text-left">{proj.tags?.slice(0, 2).map(tag => (<span key={tag} className="text-[8px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase text-center">{tag}</span>))}</div>
                  <h4 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight group-hover:text-blue-500 transition-colors text-left">{proj.title}</h4>
                  <p className="text-slate-500 text-xs lg:text-lg font-medium leading-relaxed line-clamp-2 text-left">{proj.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </SectionModal>

      <SectionModal section={Section.APPOINTMENT} isOpen={activeSection === Section.APPOINTMENT} onClose={closeSection}>
         <div className="max-w-5xl mx-auto text-left">
            {apptState === 'success' ? (
              <div className="py-20 text-center space-y-10 animate-modal bg-emerald-50/40 rounded-[3rem] border border-emerald-100 text-center">
                 <div className="text-8xl lg:text-[10rem] animate-pulse text-center">🚀</div>
                 <h4 className="text-3xl lg:text-6xl font-black text-slate-900 uppercase tracking-tighter text-center">Transmission Confirmed</h4>
                 <button onClick={() => setApptState('idle')} className="px-12 py-5 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-full shadow-lg text-center">New Audit</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
                <div className="lg:col-span-4 space-y-8 text-left">
                   <div className="bg-rose-500 p-8 lg:p-10 rounded-[2.5rem] text-white shadow-xl space-y-4 text-left">
                      <h4 className="text-2xl font-black uppercase tracking-tighter leading-none text-left">Schedule Audit</h4>
                      {selectedService && <div className="pt-6 border-t border-white/20 text-left"><p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 text-left">TARGETED ACTION</p><p className="text-xl font-black uppercase leading-tight text-left">{selectedService.name}</p></div>}
                   </div>
                   <div className="space-y-4 text-left">
                      <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase ml-2 text-left">1. SELECT ACTION</p>
                      <div className="space-y-3 text-left">
                        {dynamicServices.map(s => (
                          <button key={s.id} onClick={() => setSelectedService(s)} className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${selectedService?.id === s.id ? 'border-rose-400 bg-rose-50/50 shadow-md' : 'border-slate-50 bg-white hover:border-rose-200'}`}>
                            <span className="text-2xl w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-50 text-center">{s.icon}</span>
                            <div className="flex-1 text-left"><p className="text-[11px] font-black text-slate-900 uppercase leading-none text-left">{s.name}</p></div>
                          </button>
                        ))}
                      </div>
                   </div>
                </div>
                <div className="lg:col-span-8 space-y-10 text-left">
                   <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 text-left">
                      <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase text-left">2. AUDIT IDENTITY</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-black text-sm focus:border-rose-400 outline-none text-left" placeholder="FULL NAME" value={clientName} onChange={e => setClientName(e.target.value)} />
                        <input required type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-black text-sm focus:border-rose-400 outline-none text-left" placeholder="WHATSAPP NUMBER" value={clientWhatsApp} onChange={e => setClientWhatsApp(e.target.value)} />
                      </div>
                   </div>
                   <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 text-left">
                      <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase text-left">3. CALENDAR HUB</p>
                      <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar scroll-smooth text-left">
                        {availableDates.map((d) => (
                          <button key={d.date} onClick={() => setAppointmentDate(d.date)} className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all text-center ${appointmentDate === d.date ? 'border-rose-500 bg-rose-500 text-white shadow-lg' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-rose-200'}`}>
                            <span className="text-[9px] font-black uppercase tracking-widest text-center">{d.day}</span><span className="text-xl font-black text-center">{d.num}</span>
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-4 border-t border-slate-50 text-left">
                        {['09:00', '12:00', '15:00', '18:00', '21:00'].map(t => (
                          <button key={t} onClick={() => setAppointmentTime(t)} className={`py-3 rounded-lg border-2 font-black text-[9px] uppercase transition-all text-center ${appointmentTime === t ? 'bg-rose-500 border-rose-500 text-white shadow-md' : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-rose-200 hover:text-rose-400'}`}>{t}</button>
                        ))}
                      </div>
                      <button disabled={!selectedService || !appointmentDate || !appointmentTime || !clientName || !clientWhatsApp} onClick={handleAppointmentSubmit} className={`w-full py-6 lg:py-8 rounded-2xl font-black tracking-[0.4em] uppercase text-xs transition-all shadow-xl text-center ${(!selectedService || !appointmentDate || !appointmentTime || !clientName || !clientWhatsApp) ? 'bg-slate-100 text-slate-300' : 'bg-rose-500 text-white hover:scale-[1.01] active:scale-95'}`}>{apptState === 'sending' ? 'TRANSMITTING...' : 'ESTABLISH ARCHITECTURAL SYNC'}</button>
                   </div>
                </div>
              </div>
            )}
         </div>
      </SectionModal>

      <SectionModal section={Section.CONTACT} isOpen={activeSection === Section.CONTACT} onClose={closeSection}>
         <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 text-left">
            <div className="lg:w-1/3 space-y-8 text-left">
               <div className="space-y-2 text-left">
                 <h4 className="text-3xl lg:text-6xl font-black text-orange-500 tracking-tighter uppercase leading-none text-left">THE <br/><span className="text-orange-300 text-left">HUB</span></h4>
                 <p className="text-[10px] lg:text-sm font-bold tracking-[0.4em] text-slate-400 uppercase text-left">Secure Communication Core</p>
               </div>
               <div className="grid grid-cols-1 gap-4 text-left">
                 {/* Email Link */}
                 <a href={`mailto:${contactInfo.email}`} className="bg-white/60 p-5 lg:p-8 rounded-2xl border border-white flex items-center gap-5 shadow-sm hover:scale-[1.02] transition-transform text-left">
                    <div className="text-3xl lg:text-4xl text-left">✉️</div>
                    <div className="text-left">
                      <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-0.5 text-left">MAIL</p>
                      <p className="text-xs lg:text-xl font-black text-slate-900 break-all leading-tight uppercase text-left">{contactInfo.email}</p>
                    </div>
                 </a>
                 {/* WhatsApp Link */}
                 {contactInfo.whatsapp && (
                    <a href={getWhatsAppLink(contactInfo.whatsapp)} target="_blank" rel="noreferrer" className="bg-emerald-50/60 p-5 lg:p-8 rounded-2xl border border-emerald-100 flex items-center gap-5 shadow-sm hover:scale-[1.02] transition-transform text-left">
                        <div className="text-3xl lg:text-4xl text-left">📱</div>
                        <div className="text-left">
                          <p className="text-[9px] font-black text-emerald-400 tracking-widest uppercase mb-0.5 text-left">WHATSAPP</p>
                          <p className="text-xs lg:text-xl font-black text-emerald-900 break-all leading-tight uppercase text-left">DIRECT SYNC</p>
                        </div>
                    </a>
                 )}
                 {/* LinkedIn */}
                 {contactInfo.linkedin && (
                    <a href={contactInfo.linkedin} target="_blank" rel="noreferrer" className="bg-blue-50/60 p-5 lg:p-8 rounded-2xl border border-blue-100 flex items-center gap-5 shadow-sm hover:scale-[1.02] transition-transform text-left">
                        <div className="text-3xl lg:text-4xl text-left">🌐</div>
                        <div className="text-left">
                          <p className="text-[9px] font-black text-blue-400 tracking-widest uppercase mb-0.5 text-left">LINKEDIN</p>
                          <p className="text-xs lg:text-xl font-black text-blue-900 break-all leading-tight uppercase text-left">NETWORKING</p>
                        </div>
                    </a>
                 )}
                 {/* Facebook */}
                 {contactInfo.facebook && (
                    <a href={contactInfo.facebook} target="_blank" rel="noreferrer" className="bg-indigo-50/60 p-5 lg:p-8 rounded-2xl border border-indigo-100 flex items-center gap-5 shadow-sm hover:scale-[1.02] transition-transform text-left">
                        <div className="text-3xl lg:text-4xl text-left">👥</div>
                        <div className="text-left">
                          <p className="text-[9px] font-black text-indigo-400 tracking-widest uppercase mb-0.5 text-left">FACEBOOK</p>
                          <p className="text-xs lg:text-xl font-black text-indigo-900 break-all leading-tight uppercase text-left">COMMUNITY</p>
                        </div>
                    </a>
                 )}
                 {/* Instagram */}
                 {contactInfo.instagram && (
                    <a href={contactInfo.instagram} target="_blank" rel="noreferrer" className="bg-pink-50/60 p-5 lg:p-8 rounded-2xl border border-pink-100 flex items-center gap-5 shadow-sm hover:scale-[1.02] transition-transform text-left">
                        <div className="text-3xl lg:text-4xl text-left">📸</div>
                        <div className="text-left">
                          <p className="text-[9px] font-black text-pink-400 tracking-widest uppercase mb-0.5 text-left">INSTAGRAM</p>
                          <p className="text-xs lg:text-xl font-black text-pink-900 break-all leading-tight uppercase text-left">VISUALS</p>
                        </div>
                    </a>
                 )}
                 {/* Website */}
                 {contactInfo.website && (
                    <a href={contactInfo.website} target="_blank" rel="noreferrer" className="bg-slate-900 p-5 lg:p-8 rounded-2xl border border-slate-700 flex items-center gap-5 shadow-sm hover:scale-[1.02] transition-transform text-left">
                        <div className="text-3xl lg:text-4xl text-left">🚀</div>
                        <div className="text-left">
                          <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-0.5 text-left">PORTFOLIO</p>
                          <p className="text-xs lg:text-xl font-black text-white break-all leading-tight uppercase text-left">MAIN HUB</p>
                        </div>
                    </a>
                 )}
               </div>
            </div>
            <div className="flex-1 text-left">
               <div className="bg-white/80 p-8 lg:p-14 rounded-[2rem] border border-white shadow-sm text-left">
                 {formState === 'success' ? (
                   <div className="py-20 text-center space-y-8 animate-modal text-center">
                      <div className="text-7xl lg:text-9xl text-center">✉️</div>
                      <h4 className="text-2xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter text-center">Transmission Sent</h4>
                      <button onClick={() => setFormState('idle')} className="text-xs lg:text-xl font-black text-indigo-500 underline uppercase tracking-widest text-center">New Transmission</button>
                   </div>
                 ) : (
                   <form onSubmit={handleContactSubmit} className="space-y-5 lg:space-y-8 text-left">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8 text-left">
                       <input required className="w-full bg-slate-50 border border-slate-100 rounded-xl p-5 text-slate-900 font-black text-sm focus:border-orange-400 outline-none text-left" placeholder="NAME" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} />
                       <input required type="email" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-5 text-slate-900 font-black text-sm focus:border-orange-400 outline-none text-left" placeholder="EMAIL" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
                     </div>
                     <textarea required rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 lg:p-10 text-slate-900 font-black text-sm focus:border-orange-400 resize-none outline-none text-left" placeholder="MESSAGE BODY..." value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} />
                     <button className="w-full py-6 lg:py-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black tracking-[0.4em] uppercase text-xs lg:text-2xl shadow-xl hover:-translate-y-1 transition-all text-center">EXECUTE SEND</button>
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
