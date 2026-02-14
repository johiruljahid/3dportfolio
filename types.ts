
export enum Section {
  NONE = 'NONE',
  ABOUT = 'ABOUT',
  WORKING = 'WORKING',
  PORTFOLIO = 'PORTFOLIO',
  APPOINTMENT = 'APPOINTMENT',
  CONTACT = 'CONTACT'
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
