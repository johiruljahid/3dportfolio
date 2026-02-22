
export enum Section {
  NONE = 'NONE',
  ABOUT = 'ABOUT',
  WORKING = 'WORKING',
  PORTFOLIO = 'PORTFOLIO',
  APPOINTMENT = 'APPOINTMENT',
  CONTACT = 'CONTACT'
}

export enum AdminSection {
  ABOUT = 'ABOUT_PROFILE',
  WORKING = 'EXPERIENCE_LAB',
  PORTFOLIO = 'PROJECT_VAULT',
  APPOINTMENT = 'SYNC_REQUESTS',
  MESSAGES = 'COMM_INBOX',
  CONTACT_EDIT = 'SITE_IDENTITY'
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  logo: string;
  tasks: string[];
}

export interface Project {
  id: string;
  title: string;
  stats: string;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  color: string;
  tags: string[];
}

export interface AppointmentService {
  id: string;
  name: string;
  duration: string;
  icon: string;
  price?: string;
}

export interface ContactInfo {
  email: string;
  linkedin: string;
  whatsapp: string;
  phone: string;
  facebook?: string;
  instagram?: string;
  website?: string;
}
