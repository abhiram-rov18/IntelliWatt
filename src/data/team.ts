export interface TeamMember {
  id: string;
  name: string;
  role: string;
  secondaryRole?: string;
  badge: string;
  dept: string;
  bio?: string;
  image: string;
  poster: string;
  avatarFallback: string;
  skills?: string[];
  github?: string;
  linkedin: string;
  email?: string;
  phone?: string;
  portfolio?: string;
  isLead?: boolean;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'abhiram',
    name: 'Kankipati Abhiram',
    role: 'Project Lead',
    secondaryRole: 'IoT Systems Architect & Cloud Telemetry',
    badge: 'LEAD ARCHITECT',
    dept: 'Dept. of EEE, HITAM Hyderabad',
    bio: 'Leads IntelliWatt\'s architecture, embedded systems, cloud infrastructure, and software development.',
    image: '/images/team/abhiram.webp',
    poster: '/images/team/posters/abhiram-poster.jpg',
    avatarFallback: 'KA',
    skills: ['ESP32 Dual-Core', 'PZEM-004T', 'System Design', 'Firebase RTDB'],
    github: 'https://github.com',
    linkedin: 'https://www.linkedin.com/in/abhiramkankipati',
    email: 'kankipati18@gmail.com',
    phone: '+91 82475-27986',
    isLead: true,
  },
  {
    id: 'srujan',
    name: 'Killamsetty Srujan',
    role: 'Embedded Hardware & Sensor Specialist',
    badge: 'HARDWARE & PCB',
    dept: 'Dept. of EEE, HITAM Hyderabad',
    bio: 'Specialist in AC current transformer calibration, relay optocoupler isolation circuits, and transient voltage suppression.',
    image: '/images/team/srujan.webp',
    poster: '/images/team/posters/srujan-poster.jpg',
    avatarFallback: 'KS',
    skills: ['PCB Layout', 'Optoisolation', 'Sensor Calibration', 'Power Safety'],
    github: 'https://github.com',
    linkedin: 'https://www.linkedin.com/in/killamsetty-srujan',
    email: 'srujanpro1234@gmail.com',
    phone: '+91 93928-04447',
  },
  {
    id: 'rohit',
    name: 'Rohit Kumar',
    role: 'Research Analyst & Documentation Lead',
    badge: 'RESEARCH & DOCS',
    dept: 'Dept. of EEE, HITAM Hyderabad',
    bio: 'Directs analytical tariff modeling, telemetry accuracy documentation, reference bench metering validation, and technical research.',
    image: '/images/team/rohit.webp',
    poster: '/images/team/posters/rohit-poster.jpg',
    avatarFallback: 'RK',
    skills: ['Tariff Modeling', 'Load Analysis', 'QA Benchmarks', 'Grid Compliance'],
    github: 'https://github.com',
    linkedin: 'https://www.linkedin.com/in/rohit-kumar021107/',
    email: 'rohitkumar021107@gmail.com',
    phone: '+91 89497-24267',
  },
  {
    id: 'nandan',
    name: 'Amancha Nandan',
    role: 'Manager of Finance & Hardware Resources',
    badge: 'FINANCE & OPERATIONS',
    dept: 'Dept. of EEE, HITAM Hyderabad',
    bio: 'Oversees procurement, hardware component allocation, project budgeting, and lab resource operations for deployment.',
    image: '/images/team/nandan.webp',
    poster: '/images/team/posters/nandan-poster.jpg',
    avatarFallback: 'AN',
    skills: ['Resource Planning', 'Procurement', 'Budget Modeling', 'Lab Operations'],
    github: 'https://github.com',
    linkedin: 'https://www.linkedin.com/in/amancha-nandan',
    email: 'nandanamancha11@gmail.com',
    phone: '+91 70950-71077',
  },
];
