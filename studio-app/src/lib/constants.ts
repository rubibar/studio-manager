export const ALLOWED_EMAILS = [
  'rubi@replica.works',
  'gilad@replica.works',
  'dana@replica.works',
] as const

export const EMAIL_TO_TEAM: Record<string, string> = {
  'rubi@replica.works': 'rubi',
  'gilad@replica.works': 'gilad',
  'dana@replica.works': 'dana',
}

export const ADMIN_EMAILS = ['rubi@replica.works', 'gilad@replica.works'] as const

export interface TeamMember {
  id: string
  name: string
  role: string
  color: string
}

export const TEAM: TeamMember[] = [
  { id: 'rubi', name: 'רובי', role: 'מייסד', color: '#059669' },
  { id: 'gilad', name: 'גלעד', role: 'מייסד', color: '#2563eb' },
  { id: 'dana', name: 'דנה', role: 'מעצבת', color: '#db2777' },
]

export interface CategorySub {
  id: string
  emoji: string
  name: string
  color: string
  subs: string[]
}

export const CATEGORIES: CategorySub[] = [
  { id: 'studio', emoji: '\u{1F3E2}', name: 'ניהול הסטודיו', color: '#059669',
    subs: ['ניהול של דנה', 'ניקיון, סדר, השקיה', 'תחזוקה', 'תשתיות', 'ספקים', 'רכש', 'משפטי', 'אדמיניסטרציה'] },
  { id: 'clients', emoji: '\u{1F465}', name: 'ניהול לקוחות', color: '#2563eb',
    subs: ['CRM', 'לידים', 'חוזים', 'אונבורדינג', 'גבייה', 'משוב', 'שימור', 'פרויקטים', 'תקשורת'] },
  { id: 'social', emoji: '\u{1F4F1}', name: 'סושיאל', color: '#dc2626',
    subs: ['אסטרטגיה', 'קריאייטיב', 'קופי (כתיבה)', 'תזמון', 'קהילה', 'אנליטיקה'] },
  { id: 'product', emoji: '\u{1F6E0}\u{FE0F}', name: 'יצירת מוצר', color: '#0891b2',
    subs: ['מחקר', 'אפיון', 'פיתוח', 'בדיקות (QA)', 'השקה', 'תמחור'] },
  { id: 'design', emoji: '\u{1F3A8}', name: 'ניהול עיצוב', color: '#db2777',
    subs: ['מיתוג', 'ארכיון', 'טרנדים', 'ביקורת (Review)', 'כלים', 'נכסים (Assets)'] },
  { id: 'strategy', emoji: '\u{1F4C8}', name: 'אסטרטגיה וצמיחה', color: '#d97706',
    subs: ['חזון', 'יעדים', 'חדשנות', 'צמיחה (Scaling)', 'פיתוח (R&D)'] },
  { id: 'marketing', emoji: '\u{1F5BC}\u{FE0F}', name: 'נכסי שיווק', color: '#0891b2',
    subs: ['אתר', 'תיק עבודות (Portfolio)', 'פרסים', 'יח"צ', 'המלצות (Testimonials)'] },
  { id: 'finance', emoji: '\u{1F4B0}', name: 'פיננסים', color: '#7c3aed',
    subs: ['רווחיות', 'תזרים', 'מיסוי', 'תקציב', 'השקעות'] },
  { id: 'knowledge', emoji: '\u{1F9E0}', name: 'ידע ותוכן', color: '#0d9488',
    subs: ['מתודולוגיה', 'תבניות (Templates)', 'הדרכות', 'אוטומציה', 'בינה מלאכותית (AI)'] },
  { id: 'networking', emoji: '\u{1F310}', name: 'נטוורקינג', color: '#ea580c',
    subs: ['Outreach', 'פגישות', 'סדנאות', 'אירועים', 'הרצאות'] },
]

export const PROJECT_COLORS = ['#059669', '#2563eb', '#db2777', '#d97706', '#0891b2', '#7c3aed', '#ea580c', '#dc2626', '#4f46e5', '#0d9488']

export const PROJECT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  proposal: { label: 'Proposal', color: '#C4841D' },
  active: { label: 'Active', color: '#3A7D5C' },
  completed: { label: 'Completed', color: '#2B5DAA' },
  'on-hold': { label: 'On Hold', color: '#8A847B' },
}

export const TAG_COLORS = ['#6c5ce7', '#00b894', '#fd79a8', '#fdcb6e', '#74b9ff', '#e17055', '#81ecec', '#a29bfe', '#55efc4', '#fab1a0']
export const TAG_PRESETS = ['דחוף', 'חשוב', 'לקוח', 'עיצוב', 'פיתוח', 'שיווק', 'תוכן', 'פיננסי', 'ישיבה', 'מעקב']

// Scoring engine constants
export const WORK_START = 10
export const WORK_END = 18

export const TYPE_WEIGHTS: Record<string, number> = { client: 30, internal: 15, admin: 5 }
export const EISENHOWER_WEIGHTS: Record<string, number> = { 'urgent-important': 40, important: 25, urgent: 15, neither: 5 }

export const TYPE_LABELS: Record<string, string> = { client: 'Client', internal: 'Internal', admin: 'Admin' }
export const EISENHOWER_LABELS: Record<string, string> = {
  'urgent-important': 'Urgent & Important',
  important: 'Important',
  urgent: 'Urgent',
  neither: 'Neither',
}

// Google Calendar
export const GCAL_CLIENT_ID = '906097921484-0evtil5r0q1ol3hf8q54nsj8li4fik55.apps.googleusercontent.com'
export const GCAL_SCOPES = 'https://www.googleapis.com/auth/calendar'

// View titles
export const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  bank: 'Task Bank',
  tasks: 'Tasks',
  gantt: 'Gantt Chart',
  calendar: 'Calendar',
  categories: 'Categories',
  workload: 'Workload',
  weekview: 'Week View',
  kanban: 'Kanban',
  burndown: 'Burndown',
  activitylog: 'Activity Log',
  reports: 'Reports',
  velocity: 'Velocity',
  dependencies: 'Dependencies',
  timeline: 'Timeline',
  pricing: 'Hours & Pricing',
  projects: 'Projects',
  clients: 'Clients',
  okr: 'OKR',
  admin: 'Admin',
}
