
import React from 'react';
import { Section, Experience, Project, AppointmentService } from './types';

export const MENU_ITEMS = [
  {
    id: Section.ABOUT,
    label: 'ABOUT',
    icon: 'https://img.freepik.com/premium-photo/profile-icon-3d-rendered-icon-user-icon_444773-57.jpg?w=360',
    color: 'border-cyan-400 text-cyan-600 shadow-cyan-300/60 bg-cyan-50/30'
  },
  {
    id: Section.WORKING,
    label: 'WORKING',
    icon: 'https://cdn3d.iconscout.com/3d/premium/thumb/rush-time-3d-icon-png-download-11246496.png',
    color: 'border-indigo-400 text-indigo-600 shadow-indigo-300/60 bg-indigo-50/30'
  },
  {
    id: Section.PORTFOLIO,
    label: 'PORTFOLIO',
    icon: 'https://img.freepik.com/premium-vector/3d-folder-paper-management-multimedia-file-document-efficient-work-project-plan-concept-image-video-document-minimal-folder-icon-3d-vector-picture-render-isolated-blue-background_412828-1362.jpg?semt=ais_hybrid&w=740&q=80',
    color: 'border-blue-400 text-blue-600 shadow-blue-300/60 bg-blue-50/30'
  },
  {
    id: Section.APPOINTMENT,
    label: 'APPOINTMENT',
    icon: 'https://img.freepik.com/premium-vector/3d-calendar-marked-date-time-reminder-day-background-calendar-with-clock-schedule-appointment-event-day-holiday-planning-concept-3d-alarm-clock-icon-vector-render-illustration_412828-2327.jpg?semt=ais_user_personalization&w=740&q=80',
    color: 'border-pink-400 text-pink-600 shadow-pink-300/60 bg-pink-50/30'
  },
  {
    id: Section.CONTACT,
    label: 'CONTACT',
    icon: 'https://cdn3d.iconscout.com/3d/premium/thumb/contacts-3d-icon-png-download-12842219.png',
    color: 'border-orange-400 text-orange-600 shadow-orange-300/60 bg-orange-50/30'
  }
];

export const EXPERIENCES: Experience[] = [
  {
    id: '1',
    company: 'PIXEL PERFECT AGENCY',
    role: 'SENIOR MARKETING LEAD',
    period: '2021 - Present',
    logo: 'https://cdn-icons-png.flaticon.com/512/3242/3242257.png',
    tasks: ['Orchestrating multi-channel digital campaigns', 'Managing $50k+ monthly ad budgets', 'Scaling e-commerce brands by 300% YoY']
  },
  {
    id: '2',
    company: 'GROWTHX SYSTEMS',
    role: 'DIGITAL STRATEGIST',
    period: '2019 - 2021',
    logo: 'https://cdn-icons-png.flaticon.com/512/1006/1006544.png',
    tasks: ['Built automated lead nurturing systems', 'Reduced CAC by 45% through optimization', 'Conducted data-driven UX audits']
  },
  {
    id: '3',
    company: 'CREATIVE ORBIT',
    role: 'CONTENT COORDINATOR',
    period: '2017 - 2019',
    logo: 'https://cdn-icons-png.flaticon.com/512/1155/1155106.png',
    tasks: ['Produced viral social media content', 'Managed community engagement of 500k+', 'Spearheaded brand redesign project']
  }
];

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'E-COMMERCE DOMINATION',
    stats: '$120K REVENUE / MO',
    description: 'A complete overhaul of an electronics brand.',
    longDescription: 'Leveraging AI-driven targeting and high-converting funnel design, we transformed a struggling electronics retailer into a market leader. The campaign focused on cross-channel synchronization and retention marketing.',
    image: 'https://picsum.photos/800/600?random=11',
    gallery: [
      'https://picsum.photos/800/600?random=11',
      'https://picsum.photos/800/600?random=111',
      'https://picsum.photos/800/600?random=112',
      'https://picsum.photos/800/600?random=113'
    ],
    color: 'text-cyan-600',
    tags: ['E-COM', 'FB ADS', 'SEO']
  },
  {
    id: '2',
    title: 'THE LEAD MACHINE',
    stats: '3500+ HIGH INTENT LEADS',
    description: 'B2B Real Estate lead generation ecosystem.',
    longDescription: 'Developed a custom CRM-integrated lead capture system for luxury real estate firms. We utilized predictive analytics to identify high-intent buyers before they hit the general market.',
    image: 'https://picsum.photos/800/600?random=22',
    gallery: [
      'https://picsum.photos/800/600?random=22',
      'https://picsum.photos/800/600?random=221',
      'https://picsum.photos/800/600?random=222'
    ],
    color: 'text-indigo-600',
    tags: ['B2B', 'LINKEDIN', 'CRM']
  },
  {
    id: '3',
    title: 'ORBITAL BRANDING',
    stats: '12M GLOBAL REACH',
    description: 'International brand launch for a tech startup.',
    longDescription: 'Created a futuristic visual identity and digital presence for an aerospace startup. The launch campaign trended globally on LinkedIn and X for three consecutive days.',
    image: 'https://picsum.photos/800/600?random=33',
    gallery: [
      'https://picsum.photos/800/600?random=33',
      'https://picsum.photos/800/600?random=331',
      'https://picsum.photos/800/600?random=332',
      'https://picsum.photos/800/600?random=333'
    ],
    color: 'text-emerald-600',
    tags: ['BRANDING', 'VIRAL', 'UX']
  }
];

export const SERVICES: AppointmentService[] = [
  { id: '1', name: 'DIGITAL STRATEGY AUDIT', duration: '45 MIN', icon: '📊', price: '$149' },
  { id: '2', name: 'ADS CAMPAIGN SETUP', duration: '60 MIN', icon: '🚀', price: '$299' },
  { id: '3', name: 'SOCIAL MEDIA STRATEGY', duration: '30 MIN', icon: '📱', price: '$99' },
  { id: '4', name: 'CONVERSION OPTIMIZATION', duration: '60 MIN', icon: '🎯', price: '$199' }
];
