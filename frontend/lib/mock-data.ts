// ============================================
// MOCK DATA FOR SKILLERS CMS
// ============================================

export const kpiData = {
  totalUsers: { value: 24853, change: 12.5, label: "Total Users" },
  activeSpecialists: { value: 1247, change: 8.3, label: "Active Specialists" },

  revenueMonth: { value: 187420, change: 18.7, label: "Revenue (Month)" },
  pendingVerifications: { value: 89, change: 15.2, label: "Pending Verifications" },
  newSignups: { value: 156, change: 5.4, label: "New Signups Today" },
  avgRating: { value: 4.7, change: 0.2, label: "Avg. Rating" },
  activeChats: { value: 523, change: 3.1, label: "Active Chats" },
}

export const revenueByCategory = [
  { category: "Doctors", revenue: 45200 },
  { category: "IT Workers", revenue: 38700 },
  { category: "Teachers", revenue: 28500 },
  { category: "Translators", revenue: 24100 },
  { category: "Nurses", revenue: 21800 },
  { category: "Journalists", revenue: 15600 },
  { category: "Chefs", revenue: 13400 },
]

export const weeklyUsers = [
  { day: "Mon", users: 45, specialists: 12 },
  { day: "Tue", users: 52, specialists: 18 },
  { day: "Wed", users: 38, specialists: 9 },
  { day: "Thu", users: 61, specialists: 22 },
  { day: "Fri", users: 55, specialists: 15 },
  { day: "Sat", users: 32, specialists: 8 },
  { day: "Sun", users: 28, specialists: 6 },
]

export const topProfessions = [
  { name: "General Practitioners", orders: 482, trend: [30, 35, 40, 38, 45, 50, 48] },
  { name: "Phone Repair", orders: 356, trend: [20, 25, 30, 28, 35, 32, 38] },
  { name: "Nurse", orders: 310, trend: [25, 28, 30, 35, 32, 38, 40] },
  { name: "Translator", orders: 289, trend: [15, 20, 25, 28, 30, 35, 32] },
  { name: "Web Developer", orders: 267, trend: [18, 22, 25, 30, 28, 32, 35] },
  { name: "Photographer", orders: 234, trend: [12, 18, 20, 22, 25, 28, 30] },
]

export const recentActivity = [
  { id: 1, type: "signup", message: "New user Sara Nourd registered", time: "2 min ago", icon: "user-plus" },
  { id: 2, type: "order", message: "Order #4521 completed by Dr. Ahmed", time: "5 min ago", icon: "check-circle" },
  { id: 3, type: "verification", message: "Katia Bareta submitted verification docs", time: "12 min ago", icon: "shield" },
  { id: 4, type: "review", message: "5-star review for Mohammed Farhat", time: "18 min ago", icon: "star" },
  { id: 5, type: "order", message: "New order #4522 for Phone Repair", time: "25 min ago", icon: "briefcase" },
  { id: 6, type: "signup", message: "New specialist Rivaldo Costa joined", time: "32 min ago", icon: "user-plus" },
  { id: 7, type: "report", message: "User reported inappropriate content", time: "45 min ago", icon: "flag" },
  { id: 8, type: "order", message: "Order #4520 cancelled by client", time: "1 hr ago", icon: "x-circle" },
]

export type UserStatus = "active" | "suspended" | "banned"
export type UserRole = "client" | "specialist"
export type AccountType = "free" | "premium"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  location: string
  status: UserStatus
  joinDate: string
  lastActive: string
  accountType: AccountType
  avatar?: string
  category?: string
  profession?: string
  rating?: number
  ordersCount: number
}

export const users: User[] = [
  { id: "USR-001", name: "Sara Nourd", email: "sara@email.com", phone: "+961 71 234 567", role: "client", location: "Aabbasiyyeh", status: "active", joinDate: "2025-08-15", lastActive: "2 hours ago", accountType: "premium", ordersCount: 23 },
  { id: "USR-002", name: "Mohammed Farhat", email: "mohammed@email.com", phone: "+961 70 345 678", role: "specialist", location: "Beirut", status: "active", joinDate: "2025-06-20", lastActive: "Online", accountType: "premium", category: "Doctors", profession: "General Practitioner", rating: 4.9, ordersCount: 156 },
  { id: "USR-003", name: "Katia Bareta", email: "katia@email.com", phone: "+961 76 456 789", role: "specialist", location: "Arab Salim", status: "active", joinDate: "2025-09-10", lastActive: "1 day ago", accountType: "free", category: "Translators", profession: "Translator", rating: 4.5, ordersCount: 42 },
  { id: "USR-004", name: "Rivaldo Costa", email: "rivaldo@email.com", phone: "+961 78 567 890", role: "specialist", location: "Tripoli", status: "active", joinDate: "2025-10-05", lastActive: "3 hours ago", accountType: "premium", category: "IT Workers", profession: "Web Developer", rating: 4.8, ordersCount: 89 },
  { id: "USR-005", name: "Layla Hassan", email: "layla@email.com", phone: "+961 71 678 901", role: "client", location: "Sidon", status: "active", joinDate: "2025-07-22", lastActive: "5 min ago", accountType: "free", ordersCount: 8 },
  { id: "USR-006", name: "Ahmad Khalil", email: "ahmad@email.com", phone: "+961 70 789 012", role: "specialist", location: "Jounieh", status: "suspended", joinDate: "2025-05-18", lastActive: "2 weeks ago", accountType: "free", category: "Journalists", profession: "Reporter", rating: 3.2, ordersCount: 15 },
  { id: "USR-007", name: "Nour Alameddine", email: "nour@email.com", phone: "+961 76 890 123", role: "client", location: "Byblos", status: "active", joinDate: "2025-11-01", lastActive: "1 hour ago", accountType: "premium", ordersCount: 34 },
  { id: "USR-008", name: "Youssef Mansour", email: "youssef@email.com", phone: "+961 78 901 234", role: "specialist", location: "Baalbek", status: "active", joinDate: "2025-04-12", lastActive: "Online", accountType: "premium", category: "Teachers", profession: "Math Teacher", rating: 4.7, ordersCount: 210 },
  { id: "USR-009", name: "Rania Saad", email: "rania@email.com", phone: "+961 71 012 345", role: "specialist", location: "Zahle", status: "banned", joinDate: "2025-03-25", lastActive: "1 month ago", accountType: "free", category: "Nurses", profession: "Nurse", rating: 2.1, ordersCount: 5 },
  { id: "USR-010", name: "Omar Fayed", email: "omar@email.com", phone: "+961 70 123 456", role: "client", location: "Tyre", status: "active", joinDate: "2025-12-01", lastActive: "Just now", accountType: "free", ordersCount: 3 },
  { id: "USR-011", name: "Dina Khouri", email: "dina@email.com", phone: "+961 76 234 567", role: "specialist", location: "Beirut", status: "active", joinDate: "2025-08-30", lastActive: "4 hours ago", accountType: "premium", category: "Doctors", profession: "Pediatrician", rating: 4.6, ordersCount: 98 },
  { id: "USR-012", name: "Hassan Jaber", email: "hassan@email.com", phone: "+961 78 345 678", role: "specialist", location: "Nabatieh", status: "active", joinDate: "2025-07-14", lastActive: "Online", accountType: "free", category: "IT Workers", profession: "Phone Repair", rating: 4.4, ordersCount: 178 },
]

export interface Category {
  id: string
  name: string
  description: string
  professionCount: number
  specialistCount: number
  status: "active" | "inactive"
  icon: string
  order: number
}

export const categories: Category[] = [
  { id: "CAT-001", name: "Doctors", description: "Medical professionals and healthcare providers", professionCount: 12, specialistCount: 245, status: "active", icon: "stethoscope", order: 1 },
  { id: "CAT-002", name: "IT Workers", description: "Information technology professionals", professionCount: 8, specialistCount: 189, status: "active", icon: "monitor", order: 2 },
  { id: "CAT-003", name: "Teachers", description: "Education professionals and tutors", professionCount: 10, specialistCount: 156, status: "active", icon: "graduation-cap", order: 3 },
  { id: "CAT-004", name: "Translators", description: "Language and translation specialists", professionCount: 15, specialistCount: 134, status: "active", icon: "languages", order: 4 },
  { id: "CAT-005", name: "Journalists", description: "Media professionals and news reporters", professionCount: 6, specialistCount: 78, status: "active", icon: "newspaper", order: 5 },
  { id: "CAT-006", name: "Nurses", description: "Nursing and patient care professionals", professionCount: 5, specialistCount: 198, status: "active", icon: "heart-pulse", order: 6 },
  { id: "CAT-007", name: "Chefs", description: "Culinary professionals and food experts", professionCount: 4, specialistCount: 67, status: "active", icon: "chef-hat", order: 7 },
  { id: "CAT-008", name: "Photographers", description: "Photography and visual media experts", professionCount: 3, specialistCount: 45, status: "inactive", icon: "camera", order: 8 },
]

export interface Profession {
  id: string
  name: string
  categoryId: string
  categoryName: string
  specialistCount: number
  status: "active" | "inactive"
}

export const professions: Profession[] = [
  { id: "PRO-001", name: "General Practitioners", categoryId: "CAT-001", categoryName: "Doctors", specialistCount: 45, status: "active" },
  { id: "PRO-002", name: "Pediatricians", categoryId: "CAT-001", categoryName: "Doctors", specialistCount: 32, status: "active" },
  { id: "PRO-003", name: "Endocrinologists", categoryId: "CAT-001", categoryName: "Doctors", specialistCount: 18, status: "active" },
  { id: "PRO-004", name: "Gastroenterologists", categoryId: "CAT-001", categoryName: "Doctors", specialistCount: 15, status: "active" },
  { id: "PRO-005", name: "General Surgeons", categoryId: "CAT-001", categoryName: "Doctors", specialistCount: 22, status: "active" },
  { id: "PRO-006", name: "Anesthesiologists", categoryId: "CAT-001", categoryName: "Doctors", specialistCount: 12, status: "active" },
  { id: "PRO-007", name: "Oncologists", categoryId: "CAT-001", categoryName: "Doctors", specialistCount: 8, status: "active" },
  { id: "PRO-008", name: "Web Developer", categoryId: "CAT-002", categoryName: "IT Workers", specialistCount: 56, status: "active" },
  { id: "PRO-009", name: "Phone Repair", categoryId: "CAT-002", categoryName: "IT Workers", specialistCount: 78, status: "active" },
  { id: "PRO-010", name: "Translator", categoryId: "CAT-004", categoryName: "Translators", specialistCount: 42, status: "active" },
  { id: "PRO-011", name: "Interpreter", categoryId: "CAT-004", categoryName: "Translators", specialistCount: 28, status: "active" },
  { id: "PRO-012", name: "Editor", categoryId: "CAT-004", categoryName: "Translators", specialistCount: 19, status: "active" },
  { id: "PRO-013", name: "Math Teacher", categoryId: "CAT-003", categoryName: "Teachers", specialistCount: 34, status: "active" },
  { id: "PRO-014", name: "Language Teacher", categoryId: "CAT-003", categoryName: "Teachers", specialistCount: 41, status: "active" },
  { id: "PRO-015", name: "Reporter", categoryId: "CAT-005", categoryName: "Journalists", specialistCount: 25, status: "active" },
  { id: "PRO-016", name: "Nurse", categoryId: "CAT-006", categoryName: "Nurses", specialistCount: 98, status: "active" },
]

export interface ChatMessage {
  id: string
  participants: [string, string]
  lastMessage: string
  date: string
  status: "active" | "closed" | "flagged"
  unread: number
}

export const chats: ChatMessage[] = [
  { id: "CHT-001", participants: ["Sara Nourd", "Hassan Jaber"], lastMessage: "When can you come to fix my phone?", date: "2026-02-20 10:30", status: "active", unread: 2 },
  { id: "CHT-002", participants: ["Omar Fayed", "Mohammed Farhat"], lastMessage: "Thank you doctor, feeling much better!", date: "2026-02-20 09:15", status: "closed", unread: 0 },
  { id: "CHT-003", participants: ["Layla Hassan", "Katia Bareta"], lastMessage: "I need the document translated by Friday", date: "2026-02-19 16:45", status: "active", unread: 1 },
  { id: "CHT-004", participants: ["Nour Alameddine", "Rivaldo Costa"], lastMessage: "This is not what I asked for!", date: "2026-02-19 14:20", status: "flagged", unread: 5 },
  { id: "CHT-005", participants: ["Sara Nourd", "Dina Khouri"], lastMessage: "Appointment confirmed for tomorrow at 3pm", date: "2026-02-18 11:00", status: "active", unread: 0 },
  { id: "CHT-006", participants: ["Omar Fayed", "Youssef Mansour"], lastMessage: "Great lesson today, same time next week?", date: "2026-02-18 18:30", status: "closed", unread: 0 },
]

export interface Review {
  id: string
  reviewer: string
  specialist: string
  rating: number
  comment: string
  date: string
  status: "published" | "flagged" | "removed"
}

export const reviews: Review[] = [
  { id: "REV-001", reviewer: "Sara Nourd", specialist: "Mohammed Farhat", rating: 5, comment: "Excellent doctor, very professional and caring. Highly recommend!", date: "2026-02-20", status: "published" },
  { id: "REV-002", reviewer: "Omar Fayed", specialist: "Youssef Mansour", rating: 5, comment: "Best math teacher! My son's grades improved significantly.", date: "2026-02-18", status: "published" },
  { id: "REV-003", reviewer: "Layla Hassan", specialist: "Katia Bareta", rating: 4, comment: "Good translation quality, delivered on time.", date: "2026-02-19", status: "published" },
  { id: "REV-004", reviewer: "Nour Alameddine", specialist: "Rivaldo Costa", rating: 2, comment: "Website had several bugs, not satisfied with the quality.", date: "2026-02-19", status: "flagged" },
  { id: "REV-005", reviewer: "Sara Nourd", specialist: "Dina Khouri", rating: 5, comment: "Wonderful pediatrician, my kids love her!", date: "2026-02-18", status: "published" },
  { id: "REV-006", reviewer: "Omar Fayed", specialist: "Hassan Jaber", rating: 4, comment: "Fixed my phone quickly. Fair price.", date: "2026-02-17", status: "published" },
  { id: "REV-007", reviewer: "Anonymous", specialist: "Ahmad Khalil", rating: 1, comment: "Unprofessional behavior, very rude.", date: "2026-02-15", status: "flagged" },
  { id: "REV-008", reviewer: "Layla Hassan", specialist: "Mohammed Farhat", rating: 5, comment: "Dr. Farhat is amazing, always attentive and thorough.", date: "2026-02-14", status: "published" },
]

export type NotificationType = "info" | "warning" | "important"
export type NotificationSource = "admin" | "system"
export type NotificationStatus = "sent" | "scheduled" | "draft" | "canceled"
export type NotificationTarget = "all" | "clients" | "specialists" | "specific"

export interface Notification {
  id: string
  title: string
  body: string
  type: NotificationType
  source: NotificationSource
  target: NotificationTarget
  specificUsers?: string[]
  sentCount: number
  readCount: number
  openRate: number
  date: string
  scheduledDate?: string
  status: NotificationStatus
  actionLink?: string
  actionLabel?: string
  createdBy: string
  createdAt: string
}

export const notifications: Notification[] = [
  // Admin-sent notifications
  { id: "NOT-001", title: "Welcome to Skillers 2.0!", body: "We've updated our app with exciting new features. Check out the new appointment system, improved search, and faster messaging.", type: "info", source: "admin", target: "all", sentCount: 24853, readCount: 16900, openRate: 68, date: "2026-02-20", status: "sent", actionLink: "/updates", actionLabel: "View Updates", createdBy: "Admin", createdAt: "2026-02-20 08:00" },
  { id: "NOT-002", title: "New Year Special Offer", body: "Get 30% off on Premium plans this month! Upgrade now and unlock unlimited orders, priority support, and analytics dashboard.", type: "info", source: "admin", target: "clients", sentCount: 18420, readCount: 8289, openRate: 45, date: "2026-02-15", status: "sent", actionLink: "/subscriptions", actionLabel: "Upgrade Now", createdBy: "Admin", createdAt: "2026-02-15 10:00" },
  { id: "NOT-003", title: "Verify Your Profile", body: "Complete your verification to get a trust badge. Verified specialists receive 3x more bookings on average.", type: "important", source: "admin", target: "specialists", sentCount: 6433, readCount: 4632, openRate: 72, date: "2026-02-10", status: "sent", actionLink: "/verification", actionLabel: "Start Verification", createdBy: "Admin", createdAt: "2026-02-10 09:00" },
  { id: "NOT-004", title: "Scheduled Maintenance - Feb 25", body: "We will be performing system maintenance on February 25th from 2:00 AM to 5:00 AM. The platform may be temporarily unavailable.", type: "warning", source: "admin", target: "all", sentCount: 0, readCount: 0, openRate: 0, date: "", scheduledDate: "2026-02-24", status: "scheduled", createdBy: "Admin", createdAt: "2026-02-19 14:00" },
  { id: "NOT-005", title: "Spring Sale Coming Soon!", body: "Big discounts on all specialist services starting March 1st. Stay tuned for exclusive deals!", type: "info", source: "admin", target: "all", sentCount: 0, readCount: 0, openRate: 0, date: "", scheduledDate: "2026-03-01", status: "scheduled", actionLink: "/promotions", actionLabel: "Learn More", createdBy: "Admin", createdAt: "2026-02-18 11:00" },
  { id: "NOT-006", title: "Rate Your Experience", body: "Help us improve by rating your last order. Your feedback helps specialists grow!", type: "info", source: "admin", target: "clients", sentCount: 0, readCount: 0, openRate: 0, date: "", status: "draft", createdBy: "Admin", createdAt: "2026-02-17 16:00" },
  { id: "NOT-007", title: "New Pricing Policy Update", body: "Starting March 15th, commission rates will be updated. Please review the new pricing structure in your settings.", type: "important", source: "admin", target: "specialists", sentCount: 0, readCount: 0, openRate: 0, date: "", status: "draft", actionLink: "/settings", actionLabel: "View Policy", createdBy: "Admin", createdAt: "2026-02-16 13:00" },
  { id: "NOT-008", title: "Congratulations on 100 Orders!", body: "You've completed 100 orders on Skillers! Keep up the great work.", type: "info", source: "admin", target: "specific", specificUsers: ["Youssef Mansour", "Hassan Jaber"], sentCount: 2, readCount: 2, openRate: 100, date: "2026-02-18", status: "sent", createdBy: "Admin", createdAt: "2026-02-18 10:00" },
  // System-generated notifications
  { id: "NOT-SYS-001", title: "New User Registration", body: "Omar Fayed registered as a new client from Tyre.", type: "info", source: "system", target: "all", sentCount: 1, readCount: 1, openRate: 100, date: "2026-02-20", status: "sent", createdBy: "System", createdAt: "2026-02-20 09:30" },
  { id: "NOT-SYS-002", title: "Verification Submitted", body: "Katia Bareta submitted verification documents for review.", type: "info", source: "system", target: "all", sentCount: 1, readCount: 1, openRate: 100, date: "2026-02-20", status: "sent", actionLink: "/verification", actionLabel: "Review", createdBy: "System", createdAt: "2026-02-20 09:15" },
  { id: "NOT-SYS-003", title: "Flagged Review Detected", body: "A review for Ahmad Khalil has been flagged by the community for inappropriate content.", type: "warning", source: "system", target: "all", sentCount: 1, readCount: 0, openRate: 0, date: "2026-02-19", status: "sent", actionLink: "/reviews", actionLabel: "Review Flags", createdBy: "System", createdAt: "2026-02-19 14:20" },
  { id: "NOT-SYS-004", title: "High Cancellation Rate Alert", body: "Specialist Rivaldo Costa has a cancellation rate above 30% this month. Consider reaching out.", type: "warning", source: "system", target: "all", sentCount: 1, readCount: 0, openRate: 0, date: "2026-02-19", status: "sent", actionLink: "/users", actionLabel: "View Profile", createdBy: "System", createdAt: "2026-02-19 11:00" },
  { id: "NOT-SYS-005", title: "Payment Processing Error", body: "Payment for order #4521 failed. Client Sara Nourd was not charged.", type: "important", source: "system", target: "all", sentCount: 1, readCount: 1, openRate: 100, date: "2026-02-18", status: "sent", actionLink: "/orders", actionLabel: "View Order", createdBy: "System", createdAt: "2026-02-18 16:45" },
  { id: "NOT-SYS-006", title: "Specialist Suspended", body: "Ahmad Khalil was automatically suspended due to multiple policy violations.", type: "important", source: "system", target: "all", sentCount: 1, readCount: 1, openRate: 100, date: "2026-02-17", status: "sent", actionLink: "/users", actionLabel: "View User", createdBy: "System", createdAt: "2026-02-17 08:30" },
  { id: "NOT-009", title: "February Newsletter", body: "Check out what's new on Skillers this month: new categories, improved matching algorithm, and more!", type: "info", source: "admin", target: "all", sentCount: 0, readCount: 0, openRate: 0, date: "", scheduledDate: "2026-02-28", status: "canceled", createdBy: "Admin", createdAt: "2026-02-14 09:00" },
]

export const subscriptionPlans = [
  { id: "PLAN-001", name: "Free", price: 0, interval: "monthly", features: ["Basic profile", "5 orders/month", "Standard search ranking"], activeUsers: 18420, color: "#94a3b8" },
  { id: "PLAN-002", name: "Premium", price: 9.99, interval: "monthly", features: ["Verified badge", "Unlimited orders", "Priority search ranking", "Analytics dashboard", "Priority support"], activeUsers: 5234, color: "#3b82f6" },
  { id: "PLAN-003", name: "Enterprise", price: 29.99, interval: "monthly", features: ["All Premium features", "Team management", "API access", "Custom branding", "Dedicated account manager"], activeUsers: 1199, color: "#14b8a6" },
]

export const subscriptionOverview = {
  totalActive: 24853,
  plans: [
    { name: "Basic", count: 18420, color: "#94a3b8" },
    { name: "Pro", count: 5234, color: "#3b82f6" },
    { name: "Premium", count: 1199, color: "#14b8a6" },
  ],
}

export const monthlyClientsByPlan = [
  { month: "Sep", Basic: 14200, Pro: 3800, Premium: 820 },
  { month: "Oct", Basic: 15100, Pro: 4100, Premium: 910 },
  { month: "Nov", Basic: 16300, Pro: 4500, Premium: 980 },
  { month: "Dec", Basic: 17000, Pro: 4800, Premium: 1050 },
  { month: "Jan", Basic: 17800, Pro: 5000, Premium: 1120 },
  { month: "Feb", Basic: 18420, Pro: 5234, Premium: 1199 },
]

export const monthlyOrderTrend = [
  { month: "Sep", orders: 1820, completed: 1540 },
  { month: "Oct", orders: 2150, completed: 1870 },
  { month: "Nov", orders: 2480, completed: 2190 },
  { month: "Dec", orders: 2780, completed: 2410 },
  { month: "Jan", orders: 3120, completed: 2780 },
  { month: "Feb", orders: 3540, completed: 3180 },
]

// ============================================
// APPOINTMENTS DATA
// ============================================

export type AppointmentStatus = "completed" | "canceled" | "upcoming"
export type PackageType = "voice_call" | "video_call" | "home_visit" | "at_clinic"

export interface Appointment {
  id: string
  client: string
  specialist: string
  specialistId: string
  packageType: PackageType
  status: AppointmentStatus
  date: string
  time: string
  duration: number // in minutes
  amount: number
  location: string
  cancellationReason?: string
}

export const appointments: Appointment[] = [
  { id: "APT-001", client: "Sara Nourd", specialist: "Mohammed Farhat", specialistId: "USR-002", packageType: "at_clinic", status: "completed", date: "2026-02-20", time: "09:00", duration: 30, amount: 50, location: "Beirut" },
  { id: "APT-002", client: "Omar Fayed", specialist: "Dina Khouri", specialistId: "USR-011", packageType: "video_call", status: "completed", date: "2026-02-20", time: "10:30", duration: 20, amount: 35, location: "Online" },
  { id: "APT-003", client: "Nour Alameddine", specialist: "Hassan Jaber", specialistId: "USR-012", packageType: "home_visit", status: "upcoming", date: "2026-02-21", time: "14:00", duration: 60, amount: 80, location: "Byblos" },
  { id: "APT-004", client: "Layla Hassan", specialist: "Katia Bareta", specialistId: "USR-003", packageType: "voice_call", status: "completed", date: "2026-02-19", time: "11:00", duration: 15, amount: 20, location: "Online" },
  { id: "APT-005", client: "Sara Nourd", specialist: "Youssef Mansour", specialistId: "USR-008", packageType: "video_call", status: "canceled", date: "2026-02-19", time: "16:00", duration: 45, amount: 40, location: "Online", cancellationReason: "Client rescheduled at last minute" },
  { id: "APT-006", client: "Omar Fayed", specialist: "Mohammed Farhat", specialistId: "USR-002", packageType: "at_clinic", status: "completed", date: "2026-02-18", time: "09:30", duration: 30, amount: 50, location: "Beirut" },
  { id: "APT-007", client: "Nour Alameddine", specialist: "Rivaldo Costa", specialistId: "USR-004", packageType: "video_call", status: "canceled", date: "2026-02-18", time: "13:00", duration: 60, amount: 120, location: "Online", cancellationReason: "Specialist unavailable" },
  { id: "APT-008", client: "Layla Hassan", specialist: "Dina Khouri", specialistId: "USR-011", packageType: "at_clinic", status: "completed", date: "2026-02-17", time: "10:00", duration: 25, amount: 45, location: "Beirut" },
  { id: "APT-009", client: "Sara Nourd", specialist: "Hassan Jaber", specialistId: "USR-012", packageType: "home_visit", status: "completed", date: "2026-02-17", time: "15:00", duration: 45, amount: 70, location: "Aabbasiyyeh" },
  { id: "APT-010", client: "Omar Fayed", specialist: "Youssef Mansour", specialistId: "USR-008", packageType: "voice_call", status: "completed", date: "2026-02-16", time: "17:00", duration: 30, amount: 25, location: "Online" },
  { id: "APT-011", client: "Nour Alameddine", specialist: "Mohammed Farhat", specialistId: "USR-002", packageType: "at_clinic", status: "canceled", date: "2026-02-16", time: "11:00", duration: 30, amount: 50, location: "Beirut", cancellationReason: "Payment issue" },
  { id: "APT-012", client: "Layla Hassan", specialist: "Rivaldo Costa", specialistId: "USR-004", packageType: "video_call", status: "completed", date: "2026-02-15", time: "14:00", duration: 90, amount: 150, location: "Online" },
  { id: "APT-013", client: "Sara Nourd", specialist: "Dina Khouri", specialistId: "USR-011", packageType: "voice_call", status: "completed", date: "2026-02-15", time: "09:00", duration: 15, amount: 30, location: "Online" },
  { id: "APT-014", client: "Omar Fayed", specialist: "Katia Bareta", specialistId: "USR-003", packageType: "voice_call", status: "canceled", date: "2026-02-14", time: "10:00", duration: 20, amount: 20, location: "Online", cancellationReason: "Client no-show" },
  { id: "APT-015", client: "Nour Alameddine", specialist: "Youssef Mansour", specialistId: "USR-008", packageType: "video_call", status: "completed", date: "2026-02-14", time: "16:00", duration: 45, amount: 40, location: "Online" },
  { id: "APT-016", client: "Layla Hassan", specialist: "Mohammed Farhat", specialistId: "USR-002", packageType: "at_clinic", status: "completed", date: "2026-02-13", time: "09:00", duration: 30, amount: 50, location: "Beirut" },
  { id: "APT-017", client: "Sara Nourd", specialist: "Hassan Jaber", specialistId: "USR-012", packageType: "home_visit", status: "completed", date: "2026-02-13", time: "11:00", duration: 40, amount: 65, location: "Aabbasiyyeh" },
  { id: "APT-018", client: "Omar Fayed", specialist: "Dina Khouri", specialistId: "USR-011", packageType: "at_clinic", status: "upcoming", date: "2026-02-22", time: "10:00", duration: 30, amount: 45, location: "Beirut" },
  { id: "APT-019", client: "Nour Alameddine", specialist: "Katia Bareta", specialistId: "USR-003", packageType: "voice_call", status: "upcoming", date: "2026-02-22", time: "14:00", duration: 20, amount: 20, location: "Online" },
  { id: "APT-020", client: "Layla Hassan", specialist: "Youssef Mansour", specialistId: "USR-008", packageType: "video_call", status: "upcoming", date: "2026-02-23", time: "15:00", duration: 45, amount: 40, location: "Online" },
  { id: "APT-021", client: "Sara Nourd", specialist: "Mohammed Farhat", specialistId: "USR-002", packageType: "at_clinic", status: "canceled", date: "2026-02-12", time: "09:00", duration: 30, amount: 50, location: "Beirut", cancellationReason: "Client rescheduled at last minute" },
  { id: "APT-022", client: "Omar Fayed", specialist: "Rivaldo Costa", specialistId: "USR-004", packageType: "video_call", status: "completed", date: "2026-02-12", time: "13:00", duration: 60, amount: 100, location: "Online" },
  { id: "APT-023", client: "Nour Alameddine", specialist: "Dina Khouri", specialistId: "USR-011", packageType: "voice_call", status: "completed", date: "2026-02-11", time: "11:00", duration: 15, amount: 30, location: "Online" },
  { id: "APT-024", client: "Layla Hassan", specialist: "Hassan Jaber", specialistId: "USR-012", packageType: "home_visit", status: "completed", date: "2026-02-11", time: "16:00", duration: 50, amount: 75, location: "Sidon" },
  { id: "APT-025", client: "Sara Nourd", specialist: "Youssef Mansour", specialistId: "USR-008", packageType: "video_call", status: "canceled", date: "2026-02-10", time: "14:00", duration: 45, amount: 40, location: "Online", cancellationReason: "Specialist unavailable" },
]

export const cancellationReasons = [
  { reason: "Client rescheduled at last minute", count: 2 },
  { reason: "Specialist unavailable", count: 2 },
  { reason: "Payment issue", count: 1 },
  { reason: "Client no-show", count: 1 },
]

export const appointmentsOverTime = [
  { date: "Feb 10", completed: 0, canceled: 1 },
  { date: "Feb 11", completed: 2, canceled: 0 },
  { date: "Feb 12", completed: 1, canceled: 1 },
  { date: "Feb 13", completed: 2, canceled: 0 },
  { date: "Feb 14", completed: 1, canceled: 1 },
  { date: "Feb 15", completed: 2, canceled: 0 },
  { date: "Feb 16", completed: 1, canceled: 1 },
  { date: "Feb 17", completed: 2, canceled: 0 },
  { date: "Feb 18", completed: 1, canceled: 1 },
  { date: "Feb 19", completed: 1, canceled: 1 },
  { date: "Feb 20", completed: 2, canceled: 0 },
]

export const revenueOverTime = [
  { date: "Feb 10", revenue: 0 },
  { date: "Feb 11", revenue: 105 },
  { date: "Feb 12", revenue: 100 },
  { date: "Feb 13", revenue: 115 },
  { date: "Feb 14", revenue: 40 },
  { date: "Feb 15", revenue: 180 },
  { date: "Feb 16", revenue: 25 },
  { date: "Feb 17", revenue: 115 },
  { date: "Feb 18", revenue: 50 },
  { date: "Feb 19", revenue: 20 },
  { date: "Feb 20", revenue: 85 },
]

export const financialSummary = {
  totalRevenue: 1248650,
  monthlyRevenue: 187420,
  weeklyRevenue: 42350,
  dailyRevenue: 6870,
  mrr: 187420,
  arr: 2249040,
  churnRate: 3.2,
}

export const transactions = [
  { id: "TXN-001", user: "Nour Alameddine", amount: 9.99, type: "subscription", date: "2026-02-20", status: "completed" },
  { id: "TXN-002", user: "Sara Nourd", amount: 120, type: "service_fee", date: "2026-02-20", status: "completed" },
  { id: "TXN-003", user: "Rivaldo Costa", amount: 180, type: "payout", date: "2026-02-19", status: "pending" },
  { id: "TXN-004", user: "Omar Fayed", amount: 29.99, type: "subscription", date: "2026-02-19", status: "completed" },
  { id: "TXN-005", user: "Mohammed Farhat", amount: 450, type: "payout", date: "2026-02-18", status: "completed" },
]

export type VerificationType = "identity" | "license" | "certification"
export type VerificationPriority = "high" | "medium" | "low"

export interface VerificationDocument {
  name: string
  type: VerificationType
  quality: "clear" | "unreadable" | "blurry"
  fileType: "image" | "pdf"
  uploadedAt: string
  expiresAt?: string
}

export interface VerificationHistory {
  action: string
  actor: string
  date: string
  note?: string
}

export interface VerificationRequest {
  id: string
  specialist: string
  specialistEmail: string
  specialistPhone: string
  specialistLocation: string
  category: string
  profession: string
  submittedDate: string
  status: "pending" | "approved" | "rejected" | "more_info"
  verificationType: VerificationType
  priority: VerificationPriority
  documents: VerificationDocument[]
  reviewNotes: string[]
  history: VerificationHistory[]
  rejectionReason?: string
  avgReviewTime?: string
  flagged: boolean
  flagReason?: string
}

export const verificationRequests: VerificationRequest[] = [
  {
    id: "VER-001",
    specialist: "Katia Bareta",
    specialistEmail: "katia@email.com",
    specialistPhone: "+961 76 456 789",
    specialistLocation: "Arab Salim",
    category: "Translators",
    profession: "Translator",
    submittedDate: "2026-02-19",
    status: "pending",
    verificationType: "certification",
    priority: "high",
    documents: [
      { name: "National ID (Front)", type: "identity", quality: "clear", fileType: "image", uploadedAt: "2026-02-19 09:15" },
      { name: "National ID (Back)", type: "identity", quality: "clear", fileType: "image", uploadedAt: "2026-02-19 09:15" },
      { name: "Translation Certificate", type: "certification", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-19 09:20", expiresAt: "2028-06-30" },
    ],
    reviewNotes: [],
    history: [
      { action: "Submitted", actor: "Katia Bareta", date: "2026-02-19 09:15" },
    ],
    flagged: false,
  },
  {
    id: "VER-002",
    specialist: "Ahmad Mansour",
    specialistEmail: "ahmad.m@email.com",
    specialistPhone: "+961 70 567 890",
    specialistLocation: "Beirut",
    category: "Doctors",
    profession: "Cardiologist",
    submittedDate: "2026-02-18",
    status: "pending",
    verificationType: "license",
    priority: "high",
    documents: [
      { name: "National ID", type: "identity", quality: "clear", fileType: "image", uploadedAt: "2026-02-18 14:00" },
      { name: "Medical License", type: "license", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-18 14:05", expiresAt: "2027-12-31" },
      { name: "Board Certification", type: "certification", quality: "blurry", fileType: "image", uploadedAt: "2026-02-18 14:10" },
    ],
    reviewNotes: ["Board certification image quality needs attention"],
    history: [
      { action: "Submitted", actor: "Ahmad Mansour", date: "2026-02-18 14:00" },
    ],
    flagged: true,
    flagReason: "Blurry document detected",
  },
  {
    id: "VER-003",
    specialist: "Rami Haddad",
    specialistEmail: "rami.h@email.com",
    specialistPhone: "+961 78 678 901",
    specialistLocation: "Tripoli",
    category: "IT Workers",
    profession: "Network Engineer",
    submittedDate: "2026-02-17",
    status: "more_info",
    verificationType: "certification",
    priority: "medium",
    documents: [
      { name: "National ID", type: "identity", quality: "clear", fileType: "image", uploadedAt: "2026-02-17 11:30" },
    ],
    reviewNotes: ["Missing professional certification. Requested CCNA or equivalent."],
    history: [
      { action: "Submitted", actor: "Rami Haddad", date: "2026-02-17 11:30" },
      { action: "Requested More Info", actor: "Admin (Super)", date: "2026-02-17 16:00", note: "Please upload your CCNA or equivalent networking certification." },
    ],
    flagged: false,
  },
  {
    id: "VER-004",
    specialist: "Lina Khoury",
    specialistEmail: "lina.k@email.com",
    specialistPhone: "+961 71 789 012",
    specialistLocation: "Jounieh",
    category: "Teachers",
    profession: "Physics Teacher",
    submittedDate: "2026-02-16",
    status: "approved",
    verificationType: "license",
    priority: "low",
    documents: [
      { name: "National ID", type: "identity", quality: "clear", fileType: "image", uploadedAt: "2026-02-16 08:45" },
      { name: "Teaching License", type: "license", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-16 08:50", expiresAt: "2029-03-15" },
      { name: "University Degree", type: "certification", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-16 08:55" },
    ],
    reviewNotes: ["All documents verified. License valid until 2029."],
    history: [
      { action: "Submitted", actor: "Lina Khoury", date: "2026-02-16 08:45" },
      { action: "Approved", actor: "Admin (Super)", date: "2026-02-16 15:30", note: "All documents verified successfully." },
    ],
    avgReviewTime: "6h 45m",
    flagged: false,
  },
  {
    id: "VER-005",
    specialist: "Nadia Azar",
    specialistEmail: "nadia.a@email.com",
    specialistPhone: "+961 76 890 123",
    specialistLocation: "Zahle",
    category: "Nurses",
    profession: "ICU Nurse",
    submittedDate: "2026-02-15",
    status: "rejected",
    verificationType: "license",
    priority: "medium",
    documents: [
      { name: "National ID", type: "identity", quality: "clear", fileType: "image", uploadedAt: "2026-02-15 10:00" },
      { name: "Nursing License (Expired)", type: "license", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-15 10:05", expiresAt: "2025-06-30" },
    ],
    reviewNotes: ["Nursing license expired on 2025-06-30. Cannot approve until renewed."],
    history: [
      { action: "Submitted", actor: "Nadia Azar", date: "2026-02-15 10:00" },
      { action: "Rejected", actor: "Admin (Super)", date: "2026-02-15 17:20", note: "License expired. Please submit a valid, non-expired nursing license." },
    ],
    rejectionReason: "Expired nursing license. Please renew and resubmit.",
    avgReviewTime: "7h 20m",
    flagged: true,
    flagReason: "Expired license detected",
  },
  {
    id: "VER-006",
    specialist: "Omar Saab",
    specialistEmail: "omar.s@email.com",
    specialistPhone: "+961 70 901 234",
    specialistLocation: "Sidon",
    category: "Doctors",
    profession: "Dermatologist",
    submittedDate: "2026-02-20",
    status: "pending",
    verificationType: "license",
    priority: "high",
    documents: [
      { name: "Passport", type: "identity", quality: "clear", fileType: "image", uploadedAt: "2026-02-20 07:30" },
      { name: "Medical License", type: "license", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-20 07:35", expiresAt: "2028-09-15" },
      { name: "Dermatology Specialization Certificate", type: "certification", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-20 07:40" },
    ],
    reviewNotes: [],
    history: [
      { action: "Submitted", actor: "Omar Saab", date: "2026-02-20 07:30" },
    ],
    flagged: false,
  },
  {
    id: "VER-007",
    specialist: "Maya Tanios",
    specialistEmail: "maya.t@email.com",
    specialistPhone: "+961 71 012 345",
    specialistLocation: "Byblos",
    category: "Journalists",
    profession: "Investigative Reporter",
    submittedDate: "2026-02-14",
    status: "approved",
    verificationType: "identity",
    priority: "low",
    documents: [
      { name: "National ID", type: "identity", quality: "clear", fileType: "image", uploadedAt: "2026-02-14 13:00" },
      { name: "Press Card", type: "certification", quality: "clear", fileType: "image", uploadedAt: "2026-02-14 13:05", expiresAt: "2027-01-01" },
    ],
    reviewNotes: ["Identity confirmed. Press card valid."],
    history: [
      { action: "Submitted", actor: "Maya Tanios", date: "2026-02-14 13:00" },
      { action: "Approved", actor: "Moderator", date: "2026-02-14 18:15", note: "All clear." },
    ],
    avgReviewTime: "5h 15m",
    flagged: false,
  },
  {
    id: "VER-008",
    specialist: "Fadi Karam",
    specialistEmail: "fadi.k@email.com",
    specialistPhone: "+961 78 123 456",
    specialistLocation: "Baalbek",
    category: "Chefs",
    profession: "Executive Chef",
    submittedDate: "2026-02-13",
    status: "pending",
    verificationType: "certification",
    priority: "medium",
    documents: [
      { name: "National ID", type: "identity", quality: "clear", fileType: "image", uploadedAt: "2026-02-13 16:00" },
      { name: "National ID (Back)", type: "identity", quality: "unreadable", fileType: "image", uploadedAt: "2026-02-13 16:00" },
      { name: "Culinary Arts Diploma", type: "certification", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-13 16:10" },
      { name: "Food Safety Certificate", type: "certification", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-13 16:15", expiresAt: "2027-08-20" },
    ],
    reviewNotes: ["Back of ID is unreadable, might need re-upload"],
    history: [
      { action: "Submitted", actor: "Fadi Karam", date: "2026-02-13 16:00" },
    ],
    flagged: true,
    flagReason: "Unreadable document detected",
  },
  {
    id: "VER-009",
    specialist: "Hana Sfeir",
    specialistEmail: "hana.s@email.com",
    specialistPhone: "+961 76 234 567",
    specialistLocation: "Beirut",
    category: "Doctors",
    profession: "Pediatrician",
    submittedDate: "2026-02-12",
    status: "rejected",
    verificationType: "license",
    priority: "high",
    documents: [
      { name: "National ID", type: "identity", quality: "clear", fileType: "image", uploadedAt: "2026-02-12 09:00" },
      { name: "Medical License", type: "license", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-12 09:05", expiresAt: "2027-05-01" },
      { name: "National ID (Duplicate)", type: "identity", quality: "clear", fileType: "image", uploadedAt: "2026-02-12 09:10" },
    ],
    reviewNotes: ["Duplicate ID document uploaded. Possible duplicate submission from another account."],
    history: [
      { action: "Submitted", actor: "Hana Sfeir", date: "2026-02-12 09:00" },
      { action: "Rejected", actor: "Admin (Super)", date: "2026-02-12 14:45", note: "Duplicate document detected across accounts. Possible fraud." },
    ],
    rejectionReason: "Duplicate identity document detected. This ID was submitted under a different account.",
    avgReviewTime: "5h 45m",
    flagged: true,
    flagReason: "Duplicate document detected",
  },
  {
    id: "VER-010",
    specialist: "Sami Najjar",
    specialistEmail: "sami.n@email.com",
    specialistPhone: "+961 70 345 678",
    specialistLocation: "Tyre",
    category: "IT Workers",
    profession: "Cybersecurity Analyst",
    submittedDate: "2026-02-20",
    status: "pending",
    verificationType: "certification",
    priority: "medium",
    documents: [
      { name: "National ID", type: "identity", quality: "clear", fileType: "image", uploadedAt: "2026-02-20 11:00" },
      { name: "CISSP Certificate", type: "certification", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-20 11:05", expiresAt: "2028-12-31" },
      { name: "CompTIA Security+", type: "certification", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-20 11:10", expiresAt: "2029-03-15" },
    ],
    reviewNotes: [],
    history: [
      { action: "Submitted", actor: "Sami Najjar", date: "2026-02-20 11:00" },
    ],
    flagged: false,
  },
  {
    id: "VER-011",
    specialist: "Reem Baz",
    specialistEmail: "reem.b@email.com",
    specialistPhone: "+961 71 456 789",
    specialistLocation: "Nabatieh",
    category: "Nurses",
    profession: "Midwife",
    submittedDate: "2026-02-11",
    status: "approved",
    verificationType: "license",
    priority: "medium",
    documents: [
      { name: "National ID", type: "identity", quality: "clear", fileType: "image", uploadedAt: "2026-02-11 10:00" },
      { name: "Midwifery License", type: "license", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-11 10:05", expiresAt: "2028-04-30" },
      { name: "CPR Certification", type: "certification", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-11 10:10", expiresAt: "2027-02-28" },
    ],
    reviewNotes: ["All documents valid and verified."],
    history: [
      { action: "Submitted", actor: "Reem Baz", date: "2026-02-11 10:00" },
      { action: "Approved", actor: "Moderator", date: "2026-02-11 16:30", note: "Verified." },
    ],
    avgReviewTime: "6h 30m",
    flagged: false,
  },
  {
    id: "VER-012",
    specialist: "Jad Hanna",
    specialistEmail: "jad.h@email.com",
    specialistPhone: "+961 78 567 890",
    specialistLocation: "Jounieh",
    category: "Translators",
    profession: "Legal Translator",
    submittedDate: "2026-02-20",
    status: "pending",
    verificationType: "certification",
    priority: "low",
    documents: [
      { name: "National ID", type: "identity", quality: "clear", fileType: "image", uploadedAt: "2026-02-20 15:00" },
      { name: "Sworn Translator Certificate", type: "certification", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-20 15:05" },
      { name: "Ministry of Justice Accreditation", type: "license", quality: "clear", fileType: "pdf", uploadedAt: "2026-02-20 15:10", expiresAt: "2027-12-31" },
    ],
    reviewNotes: [],
    history: [
      { action: "Submitted", actor: "Jad Hanna", date: "2026-02-20 15:00" },
    ],
    flagged: false,
  },
]

export const verificationAuditLog = [
  { id: 1, actor: "Admin (Super)", action: "Approved verification VER-004", target: "Lina Khoury", date: "2026-02-16 15:30", ip: "192.168.1.10" },
  { id: 2, actor: "Admin (Super)", action: "Rejected verification VER-005", target: "Nadia Azar", date: "2026-02-15 17:20", ip: "192.168.1.10" },
  { id: 3, actor: "Moderator", action: "Approved verification VER-007", target: "Maya Tanios", date: "2026-02-14 18:15", ip: "192.168.1.22" },
  { id: 4, actor: "Admin (Super)", action: "Requested more info VER-003", target: "Rami Haddad", date: "2026-02-17 16:00", ip: "192.168.1.10" },
  { id: 5, actor: "Admin (Super)", action: "Rejected verification VER-009", target: "Hana Sfeir", date: "2026-02-12 14:45", ip: "192.168.1.10" },
  { id: 6, actor: "Moderator", action: "Approved verification VER-011", target: "Reem Baz", date: "2026-02-11 16:30", ip: "192.168.1.22" },
]

export type ReportStatus = "open" | "resolved" | "dismissed"
export type ReportEntityType = "user" | "specialist" | "post" | "review"
export type ReportReason = "spam" | "inappropriate" | "fraud" | "harassment" | "poor_quality" | "fake_profile" | "other"
export type ModerationAction = "remove_content" | "warn_user" | "suspend_account" | "escalate" | "no_action"

export interface ReportHistory {
  action: string
  actor: string
  date: string
  note?: string
}

export interface ReportEvidence {
  name: string
  type: "screenshot" | "link" | "text"
  description: string
}

export interface Report {
  id: string
  reporter: string
  reporterEmail?: string
  isAnonymous: boolean
  reportedEntity: string
  reportedEntityId?: string
  entityType: ReportEntityType
  reason: ReportReason
  reasonLabel: string
  description: string
  date: string
  status: ReportStatus
  contentPreview?: string
  evidence: ReportEvidence[]
  moderationNotes: string[]
  history: ReportHistory[]
  actionTaken?: ModerationAction
  resolution?: string
  previousReports: number
  priority: "high" | "medium" | "low"
}

export const reports: Report[] = [
  {
    id: "RPT-001",
    reporter: "Nour Alameddine",
    reporterEmail: "nour@email.com",
    isAnonymous: false,
    reportedEntity: "Rivaldo Costa",
    reportedEntityId: "USR-004",
    entityType: "specialist",
    reason: "poor_quality",
    reasonLabel: "Poor Quality Work",
    description: "Hired this web developer for an e-commerce project. The delivered website had multiple broken links, non-functional payment forms, and was not responsive on mobile devices despite being specifically requested.",
    date: "2026-02-19",
    status: "open",
    contentPreview: "Specialist profile: Rivaldo Costa - Web Developer, Tripoli. Rating: 4.8. Orders: 89.",
    evidence: [
      { name: "broken-site-screenshot.png", type: "screenshot", description: "Screenshot showing broken layout on mobile" },
      { name: "chat-conversation.pdf", type: "link", description: "Chat conversation about requirements" },
    ],
    moderationNotes: [],
    history: [
      { action: "Report Submitted", actor: "Nour Alameddine", date: "2026-02-19 14:20" },
    ],
    previousReports: 2,
    priority: "high",
  },
  {
    id: "RPT-002",
    reporter: "Anonymous",
    isAnonymous: true,
    reportedEntity: "Ahmad Khalil",
    reportedEntityId: "USR-006",
    entityType: "specialist",
    reason: "harassment",
    reasonLabel: "Harassment",
    description: "This specialist was extremely rude and aggressive during a phone consultation. Used unprofessional language and refused to provide the agreed service after payment was made.",
    date: "2026-02-15",
    status: "open",
    contentPreview: "Specialist profile: Ahmad Khalil - Reporter, Jounieh. Rating: 3.2. Status: Suspended.",
    evidence: [
      { name: "call-recording-summary.txt", type: "text", description: "Summary of phone call interaction" },
    ],
    moderationNotes: ["User already has 3 prior complaints. Currently suspended."],
    history: [
      { action: "Report Submitted", actor: "Anonymous", date: "2026-02-15 11:45" },
    ],
    previousReports: 3,
    priority: "high",
  },
  {
    id: "RPT-003",
    reporter: "Sara Nourd",
    reporterEmail: "sara@email.com",
    isAnonymous: false,
    reportedEntity: "Phone repair special: 20% off this week",
    reportedEntityId: "POST-012",
    entityType: "post",
    reason: "spam",
    reasonLabel: "Spam / Advertisement",
    description: "This post is purely promotional and seems to violate platform advertising guidelines. It offers discounts without going through the proper promotional channels.",
    date: "2026-02-14",
    status: "resolved",
    contentPreview: "Phone repair special: 20% off this week - Bringing in your phone for screen replacement or battery change? Get 20% off all repairs this week!",
    evidence: [],
    moderationNotes: ["Post reviewed. Content is promotional but from a verified specialist. Issued a warning about proper channels."],
    history: [
      { action: "Report Submitted", actor: "Sara Nourd", date: "2026-02-14 09:30" },
      { action: "Under Review", actor: "Moderator", date: "2026-02-14 11:00" },
      { action: "Resolved - Warning Issued", actor: "Moderator", date: "2026-02-14 14:15", note: "Specialist warned about advertising guidelines. Post allowed to remain with edits." },
    ],
    actionTaken: "warn_user",
    resolution: "Warning issued to specialist about advertising guidelines. Post modified to comply.",
    previousReports: 0,
    priority: "low",
  },
  {
    id: "RPT-004",
    reporter: "Layla Hassan",
    reporterEmail: "layla@email.com",
    isAnonymous: false,
    reportedEntity: "Review by Anonymous on Ahmad Khalil",
    reportedEntityId: "REV-007",
    entityType: "review",
    reason: "inappropriate",
    reasonLabel: "Inappropriate Language",
    description: "This review contains personal attacks and inappropriate language that goes beyond constructive criticism. It appears to be a targeted harassment rather than genuine feedback.",
    date: "2026-02-13",
    status: "dismissed",
    contentPreview: "Review (1 star): 'Unprofessional behavior, very rude.' - Anonymous",
    evidence: [],
    moderationNotes: ["Review content does not contain explicit inappropriate language. The criticism, while harsh, is within acceptable bounds."],
    history: [
      { action: "Report Submitted", actor: "Layla Hassan", date: "2026-02-13 16:00" },
      { action: "Under Review", actor: "Admin (Super)", date: "2026-02-13 17:30" },
      { action: "Dismissed", actor: "Admin (Super)", date: "2026-02-14 10:00", note: "Review content is within acceptable bounds. No violation found." },
    ],
    actionTaken: "no_action",
    resolution: "No violation found. Review remains published.",
    previousReports: 0,
    priority: "low",
  },
  {
    id: "RPT-005",
    reporter: "Omar Fayed",
    reporterEmail: "omar@email.com",
    isAnonymous: false,
    reportedEntity: "Fake Doctor Profile",
    reportedEntityId: "USR-EXT-001",
    entityType: "user",
    reason: "fake_profile",
    reasonLabel: "Fake Profile",
    description: "I noticed a user profile claiming to be a licensed cardiologist but their listed credentials appear fabricated. The university they claim to have attended does not offer the program listed.",
    date: "2026-02-18",
    status: "open",
    contentPreview: "User profile claiming to be Dr. Nabil Jabbour - Cardiologist, Beirut.",
    evidence: [
      { name: "university-search.png", type: "screenshot", description: "Screenshot from university website showing no such program exists" },
      { name: "profile-screenshot.png", type: "screenshot", description: "Screenshot of the suspect profile" },
    ],
    moderationNotes: ["Escalate to verification team for credential check"],
    history: [
      { action: "Report Submitted", actor: "Omar Fayed", date: "2026-02-18 08:15" },
    ],
    previousReports: 0,
    priority: "high",
  },
  {
    id: "RPT-006",
    reporter: "Mohammed Farhat",
    reporterEmail: "mohammed@email.com",
    isAnonymous: false,
    reportedEntity: "Looking for cheap meds online",
    reportedEntityId: "POST-EXT-001",
    entityType: "post",
    reason: "inappropriate",
    reasonLabel: "Inappropriate Content",
    description: "This post is seeking unauthorized pharmaceutical sales which is illegal and violates platform health and safety policies.",
    date: "2026-02-17",
    status: "resolved",
    contentPreview: "Post: 'Anyone know where to get cheap medicine without prescription? DM me...'",
    evidence: [],
    moderationNotes: ["Post clearly violates health & safety policies. Removed immediately."],
    history: [
      { action: "Report Submitted", actor: "Mohammed Farhat", date: "2026-02-17 12:00" },
      { action: "Under Review", actor: "Admin (Super)", date: "2026-02-17 12:15" },
      { action: "Content Removed", actor: "Admin (Super)", date: "2026-02-17 12:20", note: "Post removed for violating health & safety policies. User warned." },
    ],
    actionTaken: "remove_content",
    resolution: "Post removed. User issued first warning about health & safety policy violations.",
    previousReports: 1,
    priority: "medium",
  },
  {
    id: "RPT-007",
    reporter: "Anonymous",
    isAnonymous: true,
    reportedEntity: "Rania Saad",
    reportedEntityId: "USR-009",
    entityType: "specialist",
    reason: "fraud",
    reasonLabel: "Fraud / Scam",
    description: "This specialist accepted payment for multiple sessions but never showed up for any of them. Refuses to respond to messages and has blocked my number.",
    date: "2026-02-16",
    status: "resolved",
    contentPreview: "Specialist profile: Rania Saad - Nurse, Zahle. Rating: 2.1. Status: Banned.",
    evidence: [
      { name: "payment-receipts.pdf", type: "link", description: "Payment receipts for 3 sessions" },
      { name: "blocked-message-screenshot.png", type: "screenshot", description: "Screenshot showing blocked communication" },
    ],
    moderationNotes: ["Multiple fraud complaints against this specialist. Account has been banned.", "Refund process initiated for affected users."],
    history: [
      { action: "Report Submitted", actor: "Anonymous", date: "2026-02-16 09:00" },
      { action: "Under Review", actor: "Admin (Super)", date: "2026-02-16 09:45" },
      { action: "Account Suspended", actor: "Admin (Super)", date: "2026-02-16 11:00", note: "Temporary suspension pending investigation." },
      { action: "Account Banned", actor: "Admin (Super)", date: "2026-02-17 08:30", note: "Permanent ban after investigation confirmed fraud." },
    ],
    actionTaken: "suspend_account",
    resolution: "Account permanently banned. Refund process initiated for affected clients.",
    previousReports: 4,
    priority: "high",
  },
  {
    id: "RPT-008",
    reporter: "Dina Khouri",
    reporterEmail: "dina@email.com",
    isAnonymous: false,
    reportedEntity: "Fake 5-star review on Mohammed Farhat",
    reportedEntityId: "REV-EXT-001",
    entityType: "review",
    reason: "fraud",
    reasonLabel: "Fake Review",
    description: "I suspect this 5-star review is fake. The reviewer account was created the same day and has no other activity. The review language seems artificially generated.",
    date: "2026-02-20",
    status: "open",
    contentPreview: "Review (5 stars): 'Best doctor ever! Amazing experience from start to finish! 10/10 would recommend!' - NewUser2026",
    evidence: [
      { name: "user-profile-screenshot.png", type: "screenshot", description: "New account with no activity besides this review" },
    ],
    moderationNotes: [],
    history: [
      { action: "Report Submitted", actor: "Dina Khouri", date: "2026-02-20 16:00" },
    ],
    previousReports: 0,
    priority: "medium",
  },
  {
    id: "RPT-009",
    reporter: "Youssef Mansour",
    reporterEmail: "youssef@email.com",
    isAnonymous: false,
    reportedEntity: "Nour Alameddine",
    reportedEntityId: "USR-007",
    entityType: "user",
    reason: "harassment",
    reasonLabel: "Harassment",
    description: "This client has been sending repeated unsolicited messages after our appointment ended. Despite being asked to stop, they continue to contact me through different channels on the platform.",
    date: "2026-02-19",
    status: "open",
    contentPreview: "User profile: Nour Alameddine - Client, Byblos. Premium account.",
    evidence: [
      { name: "message-screenshots.pdf", type: "link", description: "Screenshots of repeated unwanted messages" },
    ],
    moderationNotes: [],
    history: [
      { action: "Report Submitted", actor: "Youssef Mansour", date: "2026-02-19 20:00" },
    ],
    previousReports: 0,
    priority: "medium",
  },
  {
    id: "RPT-010",
    reporter: "Sara Nourd",
    reporterEmail: "sara@email.com",
    isAnonymous: false,
    reportedEntity: "Misleading portfolio images",
    reportedEntityId: "POST-006",
    entityType: "post",
    reason: "fraud",
    reasonLabel: "Misleading Content",
    description: "The web projects shown in this portfolio post appear to be stock templates presented as original work. I recognized at least two of the designs from popular template marketplaces.",
    date: "2026-02-20",
    status: "open",
    contentPreview: "Post: 'Portfolio update: new web projects completed' - Rivaldo Costa",
    evidence: [
      { name: "template-comparison.png", type: "screenshot", description: "Side-by-side comparison showing templates vs posted work" },
    ],
    moderationNotes: [],
    history: [
      { action: "Report Submitted", actor: "Sara Nourd", date: "2026-02-20 11:30" },
    ],
    previousReports: 2,
    priority: "medium",
  },
  {
    id: "RPT-011",
    reporter: "Anonymous",
    isAnonymous: true,
    reportedEntity: "Review by Nour Alameddine on Rivaldo Costa",
    reportedEntityId: "REV-004",
    entityType: "review",
    reason: "inappropriate",
    reasonLabel: "Inappropriate Language",
    description: "This negative review seems to be part of a personal vendetta rather than genuine feedback. The reviewer has also filed a report and seems to be coordinating a harassment campaign.",
    date: "2026-02-20",
    status: "open",
    contentPreview: "Review (2 stars): 'Website had several bugs, not satisfied with the quality.' - Nour Alameddine",
    evidence: [],
    moderationNotes: [],
    history: [
      { action: "Report Submitted", actor: "Anonymous", date: "2026-02-20 13:00" },
    ],
    previousReports: 0,
    priority: "low",
  },
  {
    id: "RPT-012",
    reporter: "Layla Hassan",
    reporterEmail: "layla@email.com",
    isAnonymous: false,
    reportedEntity: "Hassan Jaber",
    reportedEntityId: "USR-012",
    entityType: "specialist",
    reason: "other",
    reasonLabel: "Other",
    description: "Specialist arrived 45 minutes late for a home visit without any prior notice or apology. When asked about the delay, he was dismissive.",
    date: "2026-02-11",
    status: "dismissed",
    contentPreview: "Specialist profile: Hassan Jaber - Phone Repair, Nabatieh. Rating: 4.4. Orders: 178.",
    evidence: [],
    moderationNotes: ["Single lateness incident. No pattern of behavior. Recommend leaving a review instead."],
    history: [
      { action: "Report Submitted", actor: "Layla Hassan", date: "2026-02-11 18:00" },
      { action: "Under Review", actor: "Moderator", date: "2026-02-12 09:00" },
      { action: "Dismissed", actor: "Moderator", date: "2026-02-12 11:30", note: "Isolated incident. Reporter advised to use review system for service quality feedback." },
    ],
    actionTaken: "no_action",
    resolution: "Dismissed as isolated incident. Reporter advised to leave a review.",
    previousReports: 0,
    priority: "low",
  },
]

export const moderationAuditLog = [
  { id: 1, actor: "Admin (Super)", action: "Banned user Rania Saad (RPT-007)", target: "Rania Saad", date: "2026-02-17 08:30", ip: "192.168.1.10" },
  { id: 2, actor: "Admin (Super)", action: "Removed post (RPT-006)", target: "Looking for cheap meds online", date: "2026-02-17 12:20", ip: "192.168.1.10" },
  { id: 3, actor: "Admin (Super)", action: "Suspended account (RPT-007)", target: "Rania Saad", date: "2026-02-16 11:00", ip: "192.168.1.10" },
  { id: 4, actor: "Moderator", action: "Warned user (RPT-003)", target: "Hassan Jaber", date: "2026-02-14 14:15", ip: "192.168.1.22" },
  { id: 5, actor: "Admin (Super)", action: "Dismissed report RPT-004", target: "Review by Anonymous", date: "2026-02-14 10:00", ip: "192.168.1.10" },
  { id: 6, actor: "Moderator", action: "Dismissed report RPT-012", target: "Hassan Jaber", date: "2026-02-12 11:30", ip: "192.168.1.22" },
]

export const systemHealth = {
  apiLatency: 45,
  uptime: 99.97,
  errorRate: 0.3,
  activeSessions: 1847,
  cpuUsage: 42,
  memoryUsage: 67,
  diskIO: 28,
  networkIn: 124,
  networkOut: 89,
  diskUsage: 54,
  requestsPerSec: 342,
  avgResponseTime: 120,
  services: [
    { name: "API Server", status: "healthy" as const, responseTime: 42, uptime: 99.99, lastDowntime: "2026-01-15 03:22", endpoints: 48, affectedEndpoints: 0, dependencies: ["Database", "Storage"] },
    { name: "Database", status: "healthy" as const, responseTime: 12, uptime: 99.98, lastDowntime: "2026-01-10 02:15", endpoints: 1, affectedEndpoints: 0, dependencies: ["Storage"] },
    { name: "Storage", status: "healthy" as const, responseTime: 35, uptime: 99.95, lastDowntime: "2026-02-01 04:45", endpoints: 8, affectedEndpoints: 0, dependencies: [] },
    { name: "Push Notifications", status: "degraded" as const, responseTime: 890, uptime: 97.20, lastDowntime: "2026-02-20 06:10", endpoints: 4, affectedEndpoints: 2, dependencies: ["API Server"] },
    { name: "Search Index", status: "healthy" as const, responseTime: 28, uptime: 99.96, lastDowntime: "2026-02-05 01:30", endpoints: 6, affectedEndpoints: 0, dependencies: ["Database"] },
    { name: "Auth Service", status: "healthy" as const, responseTime: 55, uptime: 99.99, lastDowntime: "2025-12-20 03:00", endpoints: 12, affectedEndpoints: 0, dependencies: ["Database", "API Server"] },
    { name: "Payment Gateway", status: "healthy" as const, responseTime: 180, uptime: 99.90, lastDowntime: "2026-02-12 14:20", endpoints: 6, affectedEndpoints: 0, dependencies: ["API Server", "Database"] },
    { name: "Email Service", status: "healthy" as const, responseTime: 220, uptime: 99.85, lastDowntime: "2026-02-18 09:00", endpoints: 3, affectedEndpoints: 0, dependencies: ["API Server"] },
  ],
}

// ============================================
// USER PROFILE DATA (Posts, Comments, Likes)
// ============================================

export interface UserPost {
  id: string
  userId: string
  title: string
  content: string
  likes: number
  comments: number
  createdAt: string
  image?: string
}

export interface UserComment {
  id: string
  userId: string
  postId: string
  postTitle: string
  content: string
  createdAt: string
}

export interface UserLike {
  id: string
  userId: string
  postId: string
  postTitle: string
  postAuthor: string
  likedAt: string
}

export const userPosts: UserPost[] = [
  { id: "POST-001", userId: "USR-001", title: "Looking for a reliable phone repair specialist in Aabbasiyyeh", content: "My screen cracked yesterday. Need someone who can fix it quickly and professionally. Any recommendations?", likes: 12, comments: 5, createdAt: "2026-02-18", image: "/images/posts/phone-repair.jpg" },
  { id: "POST-002", userId: "USR-001", title: "Great experience with Dr. Mohammed Farhat", content: "Had an appointment last week and the service was excellent. Very professional and caring doctor.", likes: 24, comments: 8, createdAt: "2026-02-14" },
  { id: "POST-003", userId: "USR-002", title: "Tips for staying healthy this winter", content: "Here are some important tips: stay hydrated, wash your hands frequently, get enough sleep, and don't skip your flu shot.", likes: 56, comments: 18, createdAt: "2026-02-10", image: "/images/posts/health-tips.jpg" },
  { id: "POST-004", userId: "USR-002", title: "Now accepting new patients in Beirut clinic", content: "Happy to announce that I am now available for appointments at my new Beirut clinic location. Book through the app!", likes: 89, comments: 32, createdAt: "2026-01-25", image: "/images/posts/clinic.jpg" },
  { id: "POST-005", userId: "USR-003", title: "Translation services available - Arabic, English, French", content: "Professional translation services for documents, websites, and more. Fast turnaround times guaranteed.", likes: 15, comments: 7, createdAt: "2026-02-12" },
  { id: "POST-006", userId: "USR-004", title: "Portfolio update: new web projects completed", content: "Check out my latest web development projects including e-commerce sites and custom dashboards.", likes: 34, comments: 11, createdAt: "2026-02-16", image: "/images/posts/web-projects.jpg" },
  { id: "POST-007", userId: "USR-005", title: "Need a math tutor for my daughter", content: "She is in grade 8 and needs help with algebra and geometry. Preferably in Sidon area.", likes: 8, comments: 14, createdAt: "2026-02-17" },
  { id: "POST-008", userId: "USR-007", title: "Best pediatrician in Byblos?", content: "Looking for a good pediatrician for my 3-year-old. We just moved to the area and need recommendations.", likes: 19, comments: 22, createdAt: "2026-02-15" },
  { id: "POST-009", userId: "USR-008", title: "Online math tutoring sessions available", content: "Offering one-on-one tutoring sessions via video call. All levels from middle school to university.", likes: 45, comments: 16, createdAt: "2026-02-08", image: "/images/posts/tutoring.jpg" },
  { id: "POST-010", userId: "USR-010", title: "First time using Skillers - great platform!", content: "Just signed up and already found a great specialist for my needs. The platform is very easy to use.", likes: 7, comments: 3, createdAt: "2026-02-19" },
  { id: "POST-011", userId: "USR-011", title: "Pediatric care tips for new parents", content: "As a pediatrician, I often get asked about basics. Here is a comprehensive guide for new parents.", likes: 67, comments: 25, createdAt: "2026-02-05" },
  { id: "POST-012", userId: "USR-012", title: "Phone repair special: 20% off this week", content: "Bringing in your phone for screen replacement or battery change? Get 20% off all repairs this week!", likes: 42, comments: 19, createdAt: "2026-02-13" },
  { id: "POST-013", userId: "USR-001", title: "Thank you Skillers community!", content: "I have found amazing professionals through this platform. Highly recommend it to everyone.", likes: 31, comments: 9, createdAt: "2026-02-01" },
  { id: "POST-014", userId: "USR-002", title: "Importance of regular health checkups", content: "Don't wait until you feel sick. Regular checkups can catch problems early and save lives.", likes: 78, comments: 21, createdAt: "2026-01-15" },
]

export const userComments: UserComment[] = [
  { id: "CMT-001", userId: "USR-001", postId: "POST-003", postTitle: "Tips for staying healthy this winter", content: "Very helpful tips, thank you Dr. Farhat!", createdAt: "2026-02-10" },
  { id: "CMT-002", userId: "USR-001", postId: "POST-009", postTitle: "Online math tutoring sessions available", content: "Do you also offer sessions on weekends?", createdAt: "2026-02-09" },
  { id: "CMT-003", userId: "USR-001", postId: "POST-012", postTitle: "Phone repair special: 20% off this week", content: "Great deal! Will definitely bring my old phone in.", createdAt: "2026-02-13" },
  { id: "CMT-004", userId: "USR-002", postId: "POST-001", postTitle: "Looking for a reliable phone repair specialist", content: "I recommend Hassan Jaber, he is very reliable!", createdAt: "2026-02-18" },
  { id: "CMT-005", userId: "USR-002", postId: "POST-008", postTitle: "Best pediatrician in Byblos?", content: "Dr. Dina Khouri is excellent with kids. Highly recommend her.", createdAt: "2026-02-15" },
  { id: "CMT-006", userId: "USR-005", postId: "POST-007", postTitle: "Need a math tutor for my daughter", content: "Youssef Mansour is a great math teacher. He helped my son a lot.", createdAt: "2026-02-17" },
  { id: "CMT-007", userId: "USR-007", postId: "POST-011", postTitle: "Pediatric care tips for new parents", content: "This is exactly what I needed. Thank you Dr. Khouri!", createdAt: "2026-02-06" },
  { id: "CMT-008", userId: "USR-010", postId: "POST-004", postTitle: "Now accepting new patients in Beirut clinic", content: "What are your working hours? I would like to book an appointment.", createdAt: "2026-02-19" },
  { id: "CMT-009", userId: "USR-003", postId: "POST-006", postTitle: "Portfolio update: new web projects completed", content: "Impressive work! Do you also build multilingual websites?", createdAt: "2026-02-16" },
  { id: "CMT-010", userId: "USR-004", postId: "POST-005", postTitle: "Translation services available", content: "Do you handle technical documentation as well?", createdAt: "2026-02-12" },
  { id: "CMT-011", userId: "USR-008", postId: "POST-007", postTitle: "Need a math tutor for my daughter", content: "I would be happy to help! Send me a message through the app.", createdAt: "2026-02-17" },
  { id: "CMT-012", userId: "USR-012", postId: "POST-001", postTitle: "Looking for a reliable phone repair specialist", content: "I can fix that for you! DM me for details.", createdAt: "2026-02-18" },
]

export const userLikes: UserLike[] = [
  { id: "LK-001", userId: "USR-001", postId: "POST-003", postTitle: "Tips for staying healthy this winter", postAuthor: "Mohammed Farhat", likedAt: "2026-02-10" },
  { id: "LK-002", userId: "USR-001", postId: "POST-009", postTitle: "Online math tutoring sessions available", postAuthor: "Youssef Mansour", likedAt: "2026-02-09" },
  { id: "LK-003", userId: "USR-001", postId: "POST-011", postTitle: "Pediatric care tips for new parents", postAuthor: "Dina Khouri", likedAt: "2026-02-06" },
  { id: "LK-004", userId: "USR-001", postId: "POST-012", postTitle: "Phone repair special: 20% off this week", postAuthor: "Hassan Jaber", likedAt: "2026-02-13" },
  { id: "LK-005", userId: "USR-002", postId: "POST-010", postTitle: "First time using Skillers", postAuthor: "Omar Fayed", likedAt: "2026-02-19" },
  { id: "LK-006", userId: "USR-002", postId: "POST-008", postTitle: "Best pediatrician in Byblos?", postAuthor: "Nour Alameddine", likedAt: "2026-02-15" },
  { id: "LK-007", userId: "USR-005", postId: "POST-003", postTitle: "Tips for staying healthy this winter", postAuthor: "Mohammed Farhat", likedAt: "2026-02-11" },
  { id: "LK-008", userId: "USR-005", postId: "POST-004", postTitle: "Now accepting new patients", postAuthor: "Mohammed Farhat", likedAt: "2026-01-26" },
  { id: "LK-009", userId: "USR-007", postId: "POST-011", postTitle: "Pediatric care tips for new parents", postAuthor: "Dina Khouri", likedAt: "2026-02-05" },
  { id: "LK-010", userId: "USR-010", postId: "POST-004", postTitle: "Now accepting new patients", postAuthor: "Mohammed Farhat", likedAt: "2026-02-19" },
]

// ============================================
// SUBSCRIPTIONS & REVENUE DATA
// ============================================

export const clientPlans = [
  { id: "CP-001", name: "Free", price: 0, interval: "monthly" as const, features: ["Basic search", "5 messages/month", "Standard listing"], activeClients: 12800, color: "#94a3b8", upgradeRate: 0 },
  { id: "CP-002", name: "Basic", price: 4.99, interval: "monthly" as const, features: ["Unlimited search", "20 messages/month", "Bookmark specialists", "Priority support"], activeClients: 4200, color: "#3b82f6", upgradeRate: 12 },
  { id: "CP-003", name: "Premium", price: 14.99, interval: "monthly" as const, features: ["Unlimited everything", "Video calls", "Appointment priority", "Dedicated support", "No ads"], activeClients: 1620, color: "#14b8a6", upgradeRate: 8 },
]

export const specialistPlans = [
  { id: "SP-001", name: "Starter", price: 0, interval: "monthly" as const, features: ["Basic profile", "5 orders/month", "Standard search ranking"], activeSpecialists: 3800, color: "#94a3b8", visibility: "Standard", badge: null },
  { id: "SP-002", name: "Professional", price: 9.99, interval: "monthly" as const, features: ["Verified badge", "Unlimited orders", "Priority search ranking", "Analytics dashboard", "Priority support"], activeSpecialists: 1890, color: "#3b82f6", visibility: "Priority ranking in search", badge: "Verified" },
  { id: "SP-003", name: "Top Recommended", price: 29.99, interval: "monthly" as const, features: ["All Professional features", "Top Recommended badge", "Featured placement", "Homepage spotlight", "Dedicated account manager"], activeSpecialists: 743, color: "#14b8a6", visibility: "Featured + Homepage spotlight", badge: "Top Recommended" },
]

export const subscriptionGrowthData = [
  { month: "Sep", newSubs: 820, activeSubs: 18200, canceled: 120, clientSubs: 14800, specialistSubs: 3400 },
  { month: "Oct", newSubs: 980, activeSubs: 19060, canceled: 140, clientSubs: 15500, specialistSubs: 3560 },
  { month: "Nov", newSubs: 1120, activeSubs: 20040, canceled: 160, clientSubs: 16300, specialistSubs: 3740 },
  { month: "Dec", newSubs: 1350, activeSubs: 21230, canceled: 180, clientSubs: 17200, specialistSubs: 4030 },
  { month: "Jan", newSubs: 1480, activeSubs: 22530, canceled: 200, clientSubs: 18100, specialistSubs: 4430 },
  { month: "Feb", newSubs: 1640, activeSubs: 24053, canceled: 170, clientSubs: 18620, specialistSubs: 5433 },
]

export const renewalData = {
  activeSubscriptions: 24053,
  upcomingRenewals: 3420,
  expiredThisMonth: 170,
  autoRenewal: 19240,
  manualRenewal: 4813,
  renewalSuccessRate: 94.2,
  expiringSoon: [
    { user: "Sara Nourd", plan: "Premium", expiresIn: "2 days", type: "client" as const },
    { user: "Mohammed Farhat", plan: "Top Recommended", expiresIn: "3 days", type: "specialist" as const },
    { user: "Rivaldo Costa", plan: "Professional", expiresIn: "5 days", type: "specialist" as const },
    { user: "Nour Alameddine", plan: "Basic", expiresIn: "7 days", type: "client" as const },
    { user: "Hassan Jaber", plan: "Professional", expiresIn: "8 days", type: "specialist" as const },
  ],
}

export const clientPlanAnalytics = [
  { plan: "Free", active: 12800, avgActivity: 2.1, topFeature: "Basic search", upgrades: 0, downgrades: 0 },
  { plan: "Basic", active: 4200, avgActivity: 5.8, topFeature: "Bookmark specialists", upgrades: 340, downgrades: 120 },
  { plan: "Premium", active: 1620, avgActivity: 9.4, topFeature: "Video calls", upgrades: 180, downgrades: 45 },
]

export const specialistPlanPerformance = [
  { plan: "Starter", active: 3800, avgBookings: 4.2, revenue: 0, avgRating: 4.1 },
  { plan: "Professional", active: 1890, avgBookings: 12.8, revenue: 18880, avgRating: 4.5 },
  { plan: "Top Recommended", active: 743, avgBookings: 24.6, revenue: 22277, avgRating: 4.8 },
]

export const monthlyRevenueBreakdown = [
  { month: "Sep", clientRev: 42500, specialistRev: 38200, total: 80700 },
  { month: "Oct", clientRev: 48300, specialistRev: 42800, total: 91100 },
  { month: "Nov", clientRev: 55200, specialistRev: 48600, total: 103800 },
  { month: "Dec", clientRev: 62400, specialistRev: 55100, total: 117500 },
  { month: "Jan", clientRev: 71800, specialistRev: 62400, total: 134200 },
  { month: "Feb", clientRev: 82200, specialistRev: 71600, total: 153800 },
]

export const revenueByPlanType = [
  { name: "Client Free", value: 0, color: "#e2e8f0" },
  { name: "Client Basic", value: 20958, color: "#60a5fa" },
  { name: "Client Premium", value: 24300, color: "#2dd4bf" },
  { name: "Specialist Starter", value: 0, color: "#cbd5e1" },
  { name: "Specialist Pro", value: 18880, color: "#3b82f6" },
  { name: "Specialist Top", value: 22277, color: "#14b8a6" },
]

export const auditLog = [
  { id: 1, actor: "Admin (Super)", action: "Suspended user Ahmad Khalil", module: "User Management", timestamp: "2026-02-20 09:30:00" },
  { id: 2, actor: "Admin (Super)", action: "Approved verification for Specialist C", module: "Verification", timestamp: "2026-02-20 09:15:00" },
  { id: 3, actor: "Moderator", action: "Flagged review REV-004", module: "Reviews", timestamp: "2026-02-19 16:45:00" },
  { id: 4, actor: "Admin (Super)", action: "Created new category: Photographers", module: "Categories", timestamp: "2026-02-19 14:20:00" },
  { id: 5, actor: "Support", action: "Resolved report RPT-003", module: "Moderation", timestamp: "2026-02-19 11:00:00" },
  { id: 6, actor: "Admin (Super)", action: "Updated subscription pricing", module: "Subscriptions", timestamp: "2026-02-18 10:30:00" },
]

// ============================================
// ANALYTICS & REPORTS DATA
// ============================================

export const analyticsKPIs = {
  totalUsers: { value: 24853, change: 12.5, prev: 22091 },
  newUsersToday: { value: 156, change: 5.4, prev: 148 },
  newUsersWeek: { value: 892, change: 8.1, prev: 825 },
  newUsersMonth: { value: 3240, change: 14.2, prev: 2837 },
  activeSubscriptions: { value: 24053, change: 9.8, prev: 21906 },
  clientSubscriptions: { value: 18620, change: 7.2, prev: 17370 },
  specialistSubscriptions: { value: 5433, change: 18.3, prev: 4592 },
  totalRevenue: { value: 1248650, change: 22.4, prev: 1020000 },
  monthlyRevenue: { value: 187420, change: 18.7, prev: 157900 },
  dailyRevenue: { value: 6870, change: 5.2, prev: 6530 },
  yearlyRevenue: { value: 2249040, change: 24.1, prev: 1813000 },
  completedAppointments: { value: 3180, change: 14.8, prev: 2770 },
  avgEngagement: { value: 7.3, change: 11.2, prev: 6.57 },
  totalPosts: { value: 14, change: 16.7, prev: 12 },
  totalComments: { value: 12, change: 20.0, prev: 10 },
  totalReviews: { value: 8, change: 14.3, prev: 7 },
}

export const userGrowthOverTime = [
  { month: "Sep", totalUsers: 18200, newUsers: 1420, activeUsers: 14560, clients: 14200, specialists: 4000 },
  { month: "Oct", totalUsers: 19600, newUsers: 1680, activeUsers: 15680, clients: 15300, specialists: 4300 },
  { month: "Nov", totalUsers: 21100, newUsers: 1840, activeUsers: 16880, clients: 16500, specialists: 4600 },
  { month: "Dec", totalUsers: 22200, newUsers: 1520, activeUsers: 17760, clients: 17400, specialists: 4800 },
  { month: "Jan", totalUsers: 23500, newUsers: 1920, activeUsers: 18800, clients: 18300, specialists: 5200 },
  { month: "Feb", totalUsers: 24853, newUsers: 2140, activeUsers: 19882, clients: 19420, specialists: 5433 },
]

export const engagementOverTime = [
  { month: "Sep", posts: 180, comments: 620, likes: 2400, reviews: 95 },
  { month: "Oct", posts: 210, comments: 740, likes: 2900, reviews: 112 },
  { month: "Nov", posts: 245, comments: 860, likes: 3400, reviews: 128 },
  { month: "Dec", posts: 220, comments: 780, likes: 3100, reviews: 118 },
  { month: "Jan", posts: 280, comments: 920, likes: 3800, reviews: 145 },
  { month: "Feb", posts: 310, comments: 1050, likes: 4200, reviews: 162 },
]

export const topActiveClients = [
  { name: "Sara Nourd", orders: 23, spent: 1850, rating: 4.9, location: "Aabbasiyyeh", plan: "Premium" },
  { name: "Nour Alameddine", orders: 34, spent: 2720, rating: 4.7, location: "Byblos", plan: "Premium" },
  { name: "Layla Hassan", orders: 8, spent: 640, rating: 4.5, location: "Sidon", plan: "Free" },
  { name: "Omar Fayed", orders: 3, spent: 240, rating: 4.8, location: "Tyre", plan: "Free" },
]

export const topActiveSpecialists = [
  { name: "Youssef Mansour", orders: 210, revenue: 8400, rating: 4.7, location: "Baalbek", profession: "Math Teacher", plan: "Top Recommended" },
  { name: "Hassan Jaber", orders: 178, revenue: 12460, rating: 4.4, location: "Nabatieh", profession: "Phone Repair", plan: "Professional" },
  { name: "Mohammed Farhat", orders: 156, revenue: 7800, rating: 4.9, location: "Beirut", profession: "General Practitioner", plan: "Top Recommended" },
  { name: "Dina Khouri", orders: 98, revenue: 4410, rating: 4.6, location: "Beirut", profession: "Pediatrician", plan: "Professional" },
  { name: "Rivaldo Costa", orders: 89, revenue: 10680, rating: 4.8, location: "Tripoli", profession: "Web Developer", plan: "Professional" },
  { name: "Katia Bareta", orders: 42, revenue: 2100, rating: 4.5, location: "Arab Salim", profession: "Translator", plan: "Starter" },
]

export const revenueGrowthOverTime = [
  { month: "Sep", total: 80700, clients: 42500, specialists: 38200, growth: 0 },
  { month: "Oct", total: 91100, clients: 48300, specialists: 42800, growth: 12.9 },
  { month: "Nov", total: 103800, clients: 55200, specialists: 48600, growth: 13.9 },
  { month: "Dec", total: 117500, clients: 62400, specialists: 55100, growth: 13.2 },
  { month: "Jan", total: 134200, clients: 71800, specialists: 62400, growth: 14.2 },
  { month: "Feb", total: 153800, clients: 82200, specialists: 71600, growth: 14.6 },
]

export const subscriptionsByPlanOverTime = [
  { month: "Sep", free: 14200, basic: 2600, premium: 820, starter: 2800, professional: 1400, topRec: 380 },
  { month: "Oct", free: 14800, basic: 3000, premium: 910, starter: 3000, professional: 1520, topRec: 440 },
  { month: "Nov", free: 15500, basic: 3400, premium: 980, starter: 3200, professional: 1640, topRec: 500 },
  { month: "Dec", free: 16200, basic: 3700, premium: 1050, starter: 3400, professional: 1720, topRec: 560 },
  { month: "Jan", free: 17000, basic: 4000, premium: 1120, starter: 3600, professional: 1800, topRec: 640 },
  { month: "Feb", free: 12800, basic: 4200, premium: 1620, starter: 3800, professional: 1890, topRec: 743 },
]

export const appointmentAnalytics = {
  completedTotal: 3180,
  canceledTotal: 360,
  upcomingTotal: 245,
  completionRate: 89.8,
  avgDuration: 35,
  avgRevPerAppointment: 52.4,
  byType: [
    { type: "Voice Call", count: 980, revenue: 19600, pct: 25.9 },
    { type: "Video Call", count: 1240, revenue: 62000, pct: 32.7 },
    { type: "Home Visit", count: 480, revenue: 38400, pct: 12.7 },
    { type: "At Clinic", count: 1085, revenue: 54250, pct: 28.7 },
  ],
  byMonth: [
    { month: "Sep", completed: 1540, canceled: 280, revenue: 80700 },
    { month: "Oct", completed: 1870, canceled: 280, revenue: 91100 },
    { month: "Nov", completed: 2190, canceled: 290, revenue: 103800 },
    { month: "Dec", completed: 2410, canceled: 370, revenue: 117500 },
    { month: "Jan", completed: 2780, canceled: 340, revenue: 134200 },
    { month: "Feb", completed: 3180, canceled: 360, revenue: 153800 },
  ],
}

export const topRevSpecialists = [
  { name: "Hassan Jaber", revenue: 12460, orders: 178, avgOrder: 70, profession: "Phone Repair" },
  { name: "Rivaldo Costa", revenue: 10680, orders: 89, avgOrder: 120, profession: "Web Developer" },
  { name: "Youssef Mansour", revenue: 8400, orders: 210, avgOrder: 40, profession: "Math Teacher" },
  { name: "Mohammed Farhat", revenue: 7800, orders: 156, avgOrder: 50, profession: "General Practitioner" },
  { name: "Dina Khouri", revenue: 4410, orders: 98, avgOrder: 45, profession: "Pediatrician" },
]

export const topRevClients = [
  { name: "Nour Alameddine", spent: 2720, orders: 34, avgOrder: 80, location: "Byblos" },
  { name: "Sara Nourd", spent: 1850, orders: 23, avgOrder: 80, location: "Aabbasiyyeh" },
  { name: "Layla Hassan", spent: 640, orders: 8, avgOrder: 80, location: "Sidon" },
  { name: "Omar Fayed", spent: 240, orders: 3, avgOrder: 80, location: "Tyre" },
]

export const usersByLocation = [
  { location: "Beirut", users: 6840, specialists: 1520, revenue: 42800, pct: 27.5 },
  { location: "Tripoli", users: 3420, specialists: 680, revenue: 18600, pct: 13.8 },
  { location: "Sidon", users: 2680, specialists: 540, revenue: 14200, pct: 10.8 },
  { location: "Byblos", users: 2150, specialists: 420, revenue: 12800, pct: 8.6 },
  { location: "Jounieh", users: 1980, specialists: 380, revenue: 11400, pct: 8.0 },
  { location: "Zahle", users: 1740, specialists: 310, revenue: 9800, pct: 7.0 },
  { location: "Baalbek", users: 1520, specialists: 260, revenue: 8200, pct: 6.1 },
  { location: "Tyre", users: 1380, specialists: 240, revenue: 7400, pct: 5.6 },
  { location: "Nabatieh", users: 1200, specialists: 210, revenue: 6200, pct: 4.8 },
  { location: "Other", users: 1943, specialists: 340, revenue: 5600, pct: 7.8 },
]

export const usersByRole = [
  { role: "Clients", count: 19420, pct: 78.1, color: "#3b82f6" },
  { role: "Specialists", count: 5433, pct: 21.9, color: "#14b8a6" },
]

export const contentModerationAnalytics = {
  totalReports: 12,
  resolvedReports: 4,
  openReports: 6,
  dismissedReports: 2,
  avgResolutionTime: "1.8 days",
  topReportedTypes: [
    { type: "Specialist", count: 4 },
    { type: "Post", count: 3 },
    { type: "Review", count: 3 },
    { type: "User", count: 2 },
  ],
  reportsByReason: [
    { reason: "Fraud / Scam", count: 3 },
    { reason: "Harassment", count: 2 },
    { reason: "Inappropriate", count: 3 },
    { reason: "Spam", count: 1 },
    { reason: "Fake Profile", count: 1 },
    { reason: "Poor Quality", count: 1 },
    { reason: "Other", count: 1 },
  ],
}

export const churnAnalytics = [
  { month: "Sep", churnRate: 4.2, reason: "Price", count: 50 },
  { month: "Oct", churnRate: 3.8, reason: "Price", count: 55 },
  { month: "Nov", churnRate: 3.5, reason: "Features", count: 48 },
  { month: "Dec", churnRate: 3.9, reason: "Service", count: 62 },
  { month: "Jan", churnRate: 3.4, reason: "Price", count: 58 },
  { month: "Feb", churnRate: 3.2, reason: "Features", count: 52 },
]

export const churnReasons = [
  { reason: "Too expensive", count: 68, pct: 40 },
  { reason: "Missing features", count: 42, pct: 24.7 },
  { reason: "Poor service quality", count: 28, pct: 16.5 },
  { reason: "Found alternative", count: 18, pct: 10.6 },
  { reason: "Other", count: 14, pct: 8.2 },
]

// ============================================
// SYSTEM MONITOR & AUDIT – ADVANCED DATA
// ============================================

export const metricsTimeline1h = Array.from({ length: 60 }, (_, i) => ({
  time: `${String(Math.floor(i / 60) + 9).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}`,
  minute: i,
  apiLatency: 30 + Math.floor(Math.random() * 40) + (i > 42 && i < 48 ? 60 : 0),
  errorRate: +(0.1 + Math.random() * 0.4 + (i > 42 && i < 48 ? 1.2 : 0)).toFixed(2),
  cpu: 30 + Math.floor(Math.random() * 25) + (i > 42 && i < 48 ? 25 : 0),
  memory: 58 + Math.floor(Math.random() * 15),
  sessions: 1600 + Math.floor(Math.random() * 500),
  requests: 280 + Math.floor(Math.random() * 120),
  networkIn: 100 + Math.floor(Math.random() * 60),
  networkOut: 70 + Math.floor(Math.random() * 40),
  diskIO: 20 + Math.floor(Math.random() * 20),
}))

export const metricsTimeline24h = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  apiLatency: 25 + Math.floor(Math.random() * 50) + (i >= 9 && i <= 11 ? 15 : 0),
  errorRate: +(0.1 + Math.random() * 0.5).toFixed(2),
  cpu: 20 + Math.floor(Math.random() * 35) + (i >= 9 && i <= 17 ? 15 : 0),
  memory: 55 + Math.floor(Math.random() * 20),
  sessions: 800 + Math.floor(Math.random() * 1200) + (i >= 9 && i <= 17 ? 600 : 0),
  requests: 150 + Math.floor(Math.random() * 250) + (i >= 9 && i <= 17 ? 100 : 0),
}))

export const metricsTimeline7d = [
  { day: "Mon", apiLatency: 48, errorRate: 0.32, cpu: 44, memory: 66, sessions: 1920, requests: 18400, incidents: 1 },
  { day: "Tue", apiLatency: 42, errorRate: 0.28, cpu: 40, memory: 64, sessions: 2100, requests: 20200, incidents: 0 },
  { day: "Wed", apiLatency: 55, errorRate: 0.45, cpu: 52, memory: 70, sessions: 2350, requests: 22800, incidents: 2 },
  { day: "Thu", apiLatency: 38, errorRate: 0.22, cpu: 38, memory: 62, sessions: 2180, requests: 21000, incidents: 0 },
  { day: "Fri", apiLatency: 45, errorRate: 0.30, cpu: 42, memory: 67, sessions: 1980, requests: 19100, incidents: 1 },
  { day: "Sat", apiLatency: 32, errorRate: 0.18, cpu: 28, memory: 58, sessions: 1240, requests: 12000, incidents: 0 },
  { day: "Sun", apiLatency: 30, errorRate: 0.15, cpu: 25, memory: 56, sessions: 1100, requests: 10600, incidents: 0 },
]

export const heatmapData = Array.from({ length: 7 }, (_, dayIdx) => {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  return Array.from({ length: 24 }, (_, hourIdx) => {
    const isWorkHour = hourIdx >= 8 && hourIdx <= 18
    const isWeekday = dayIdx < 5
    const base = isWorkHour && isWeekday ? 60 : isWorkHour ? 35 : isWeekday ? 25 : 10
    return {
      day: dayNames[dayIdx],
      hour: hourIdx,
      value: base + Math.floor(Math.random() * 30),
    }
  })
}).flat()

export const anomalies = [
  { id: "ANM-001", metric: "Error Rate", severity: "critical" as const, detected: "2026-02-20 09:43", value: "1.8%", baseline: "0.3%", message: "Error rate spiked 6x above normal baseline", status: "active" as const, affectedService: "Push Notifications" },
  { id: "ANM-002", metric: "API Latency", severity: "warning" as const, detected: "2026-02-20 09:44", value: "125ms", baseline: "45ms", message: "API latency increased significantly during push notification degradation", status: "active" as const, affectedService: "API Server" },
  { id: "ANM-003", metric: "CPU Usage", severity: "warning" as const, detected: "2026-02-20 09:45", value: "78%", baseline: "42%", message: "CPU usage correlated spike with error rate anomaly", status: "investigating" as const, affectedService: "API Server" },
  { id: "ANM-004", metric: "Memory Usage", severity: "info" as const, detected: "2026-02-19 14:20", value: "72%", baseline: "67%", message: "Slight memory increase during peak hours, within acceptable range", status: "resolved" as const, affectedService: "Database" },
  { id: "ANM-005", metric: "Error Rate", severity: "critical" as const, detected: "2026-02-18 11:30", value: "2.1%", baseline: "0.3%", message: "Payment gateway timeout caused cascading errors", status: "resolved" as const, affectedService: "Payment Gateway" },
]

export const predictions = [
  { id: "PRD-001", metric: "Server Load", forecast: "High load expected", detail: "Based on weekly patterns, expect 40% higher traffic between 9-11 AM tomorrow. Current capacity can handle the surge.", risk: "low" as const, confidence: 92, action: "No action needed - within capacity" },
  { id: "PRD-002", metric: "Memory Usage", forecast: "Approaching threshold", detail: "Memory usage trending upward. At current rate, it will reach 85% warning threshold in ~3 days.", risk: "medium" as const, confidence: 78, action: "Consider scaling memory or reviewing memory-intensive processes" },
  { id: "PRD-003", metric: "Disk Usage", forecast: "Stable", detail: "Disk usage growing at 1.2% per week. No action needed for the next 30 days.", risk: "low" as const, confidence: 95, action: "Schedule routine cleanup in 2 weeks" },
  { id: "PRD-004", metric: "Push Notifications", forecast: "Continued degradation likely", detail: "Push notification service has been degraded for 3+ hours. Pattern suggests a provider-side issue.", risk: "high" as const, confidence: 85, action: "Contact push provider, prepare fallback to email notifications" },
  { id: "PRD-005", metric: "Error Rate", forecast: "Elevated risk during maintenance", detail: "Scheduled maintenance on Feb 25 may cause brief error spikes during migration window.", risk: "medium" as const, confidence: 88, action: "Prepare rollback plan, notify users of potential brief disruptions" },
]

export const suggestedActions = [
  { id: "ACT-001", title: "Scale Push Notification Service", priority: "high" as const, reason: "Push Notifications service degraded with 890ms response time (threshold: 200ms)", action: "Restart service pods or switch to backup notification provider", relatedAnomaly: "ANM-001", status: "pending" as const },
  { id: "ACT-002", title: "Clear Application Cache", priority: "medium" as const, reason: "Memory usage trending toward 85% threshold over next 3 days", action: "Run cache invalidation for expired sessions and stale query results", relatedAnomaly: null, status: "pending" as const },
  { id: "ACT-003", title: "Review Error Logs", priority: "high" as const, reason: "6x spike in error rate detected at 09:43, correlated with push notification failures", action: "Check /var/log/api/errors.log for push notification timeout patterns", relatedAnomaly: "ANM-001", status: "pending" as const },
  { id: "ACT-004", title: "Schedule Database Index Rebuild", priority: "low" as const, reason: "Query performance slightly degraded over past week (avg +8ms)", action: "Run REINDEX on users and appointments tables during off-peak hours", relatedAnomaly: null, status: "completed" as const },
  { id: "ACT-005", title: "Update SSL Certificates", priority: "medium" as const, reason: "SSL certificate for payment gateway expires in 12 days", action: "Renew and deploy new certificate before Feb 28", relatedAnomaly: null, status: "pending" as const },
]

export const enhancedAuditLog = [
  { id: 1, actor: "Admin (Super)", action: "Suspended user Ahmad Khalil", module: "User Management", timestamp: "2026-02-20 09:30:00", severity: "critical" as const, ip: "192.168.1.45", location: "Beirut, LB", device: "Chrome / macOS", details: "User suspended for multiple policy violations. 3 reports received in past 7 days." },
  { id: 2, actor: "Admin (Super)", action: "Approved verification for Specialist C", module: "Verification", timestamp: "2026-02-20 09:15:00", severity: "high" as const, ip: "192.168.1.45", location: "Beirut, LB", device: "Chrome / macOS", details: "All documents verified. Identity, license, and address confirmed." },
  { id: 3, actor: "Moderator", action: "Flagged review REV-004", module: "Reviews", timestamp: "2026-02-19 16:45:00", severity: "medium" as const, ip: "10.0.0.22", location: "Tripoli, LB", device: "Firefox / Windows", details: "Review contains potential defamatory language. Sent for senior review." },
  { id: 4, actor: "Admin (Super)", action: "Created new category: Photographers", module: "Categories", timestamp: "2026-02-19 14:20:00", severity: "low" as const, ip: "192.168.1.45", location: "Beirut, LB", device: "Chrome / macOS", details: "New category added with 3 initial professions. Status set to inactive pending approval." },
  { id: 5, actor: "Support", action: "Resolved report RPT-003", module: "Moderation", timestamp: "2026-02-19 11:00:00", severity: "medium" as const, ip: "10.0.0.15", location: "Sidon, LB", device: "Safari / iOS", details: "Report resolved: content removed, user warned. First violation." },
  { id: 6, actor: "Admin (Super)", action: "Updated subscription pricing", module: "Subscriptions", timestamp: "2026-02-18 10:30:00", severity: "critical" as const, ip: "192.168.1.45", location: "Beirut, LB", device: "Chrome / macOS", details: "Professional plan increased from $7.99 to $9.99. Top Recommended unchanged. Effective March 1." },
  { id: 7, actor: "System", action: "Auto-scaled API server instances", module: "Infrastructure", timestamp: "2026-02-18 09:05:00", severity: "low" as const, ip: "internal", location: "AWS eu-west-1", device: "Automated", details: "Scaled from 3 to 5 instances due to morning traffic surge. Scaled back down at 12:30." },
  { id: 8, actor: "Admin (Super)", action: "Exported user data report", module: "Analytics", timestamp: "2026-02-17 15:45:00", severity: "medium" as const, ip: "192.168.1.45", location: "Beirut, LB", device: "Chrome / macOS", details: "Exported CSV with 24,853 user records. Report includes demographics and activity metrics." },
  { id: 9, actor: "System", action: "SSL certificate renewal initiated", module: "Security", timestamp: "2026-02-17 03:00:00", severity: "high" as const, ip: "internal", location: "AWS eu-west-1", device: "Automated", details: "Auto-renewal for *.skillers.app initiated. Certificate valid until Feb 2027." },
  { id: 10, actor: "Support", action: "Issued refund for order #4518", module: "Payments", timestamp: "2026-02-16 14:20:00", severity: "high" as const, ip: "10.0.0.15", location: "Sidon, LB", device: "Safari / iOS", details: "Full refund of $45.00 issued to Nour Alameddine. Reason: service not rendered." },
  { id: 11, actor: "Admin (Super)", action: "Banned user Rania Saad", module: "User Management", timestamp: "2026-02-15 11:00:00", severity: "critical" as const, ip: "192.168.1.45", location: "Beirut, LB", device: "Chrome / macOS", details: "Permanent ban for repeated fraud attempts. Account fully deactivated, active orders cancelled." },
  { id: 12, actor: "Moderator", action: "Bulk dismissed 8 spam reports", module: "Moderation", timestamp: "2026-02-15 09:30:00", severity: "low" as const, ip: "10.0.0.22", location: "Tripoli, LB", device: "Firefox / Windows", details: "8 reports identified as coordinated spam. Source IPs blocked." },
  { id: 13, actor: "System", action: "Database backup completed", module: "Infrastructure", timestamp: "2026-02-15 04:00:00", severity: "low" as const, ip: "internal", location: "AWS eu-west-1", device: "Automated", details: "Full daily backup completed. Size: 4.2 GB. Stored in S3 with 30-day retention." },
  { id: 14, actor: "Admin (Super)", action: "Updated platform Terms of Service", module: "Settings", timestamp: "2026-02-14 16:00:00", severity: "critical" as const, ip: "192.168.1.45", location: "Beirut, LB", device: "Chrome / macOS", details: "ToS v2.3 published. Key changes: updated refund policy, new data retention clause. All users notified." },
  { id: 15, actor: "Support", action: "Escalated chat CHT-004 to admin", module: "Chats", timestamp: "2026-02-14 10:15:00", severity: "medium" as const, ip: "10.0.0.15", location: "Sidon, LB", device: "Safari / iOS", details: "Flagged chat between Nour Alameddine and Rivaldo Costa escalated due to dispute." },
  { id: 16, actor: "System", action: "Push notification service degraded", module: "Infrastructure", timestamp: "2026-02-20 06:10:00", severity: "critical" as const, ip: "internal", location: "AWS eu-west-1", device: "Automated", details: "Response time increased to 890ms. 2 of 4 endpoints affected. Provider investigating." },
]

// ============================================
// SETTINGS DATA
// ============================================

export interface SettingsRole {
  id: string
  name: string
  description: string
  members: number
  permissions: string[]
  color: string
  createdAt: string
}

export const settingsRoles: SettingsRole[] = [
  { id: "ROLE-001", name: "Super Admin", description: "Full platform access with all permissions", members: 1, permissions: ["all"], color: "#ef4444", createdAt: "2025-01-01" },
  { id: "ROLE-002", name: "Admin", description: "Manage users, content, and platform settings", members: 3, permissions: ["users.read", "users.write", "content.read", "content.write", "settings.read", "settings.write", "verification.read", "verification.write", "moderation.read", "moderation.write"], color: "#3b82f6", createdAt: "2025-01-15" },
  { id: "ROLE-003", name: "Moderator", description: "Review and moderate content, handle reports", members: 5, permissions: ["content.read", "content.write", "moderation.read", "moderation.write", "reviews.read", "reviews.write"], color: "#14b8a6", createdAt: "2025-02-10" },
  { id: "ROLE-004", name: "Support", description: "Handle user inquiries and chat escalations", members: 8, permissions: ["users.read", "chats.read", "chats.write", "reviews.read"], color: "#f59e0b", createdAt: "2025-03-01" },
  { id: "ROLE-005", name: "Analyst", description: "View analytics and generate reports", members: 2, permissions: ["analytics.read", "users.read", "subscriptions.read"], color: "#8b5cf6", createdAt: "2025-04-20" },
]

export const settingsPermissionModules = [
  "users", "content", "settings", "verification", "moderation", "reviews", "chats", "analytics", "subscriptions", "notifications", "system",
]

export interface FeatureToggle {
  id: string
  name: string
  description: string
  enabled: boolean
  variant?: string
  rollout: number
  category: "experimental" | "beta" | "stable"
  lastModified: string
  modifiedBy: string
}

export const featureToggles: FeatureToggle[] = [
  { id: "FT-001", name: "AI-Powered Matching", description: "Use machine learning to match clients with the best specialist", enabled: true, rollout: 60, category: "beta", lastModified: "2026-02-18", modifiedBy: "Admin" },
  { id: "FT-002", name: "Video Consultations", description: "Enable real-time video calls between clients and specialists", enabled: true, rollout: 100, category: "stable", lastModified: "2026-01-10", modifiedBy: "Admin" },
  { id: "FT-003", name: "Smart Pricing", description: "Dynamic pricing based on demand and specialist availability", enabled: false, rollout: 0, category: "experimental", lastModified: "2026-02-15", modifiedBy: "Admin" },
  { id: "FT-004", name: "Group Bookings", description: "Allow multiple clients to book a single specialist session", enabled: true, rollout: 30, category: "experimental", lastModified: "2026-02-20", modifiedBy: "Admin" },
  { id: "FT-005", name: "In-App Wallet", description: "Digital wallet for faster payments and refunds", enabled: true, rollout: 85, category: "beta", lastModified: "2026-02-12", modifiedBy: "Admin" },
  { id: "FT-006", name: "Review Sentiment Analysis", description: "Automatically analyze review sentiment for flagging", enabled: false, rollout: 0, category: "experimental", lastModified: "2026-02-19", modifiedBy: "Admin" },
]

export interface NotificationRule {
  id: string
  event: string
  description: string
  email: boolean
  push: boolean
  sms: boolean
  digest: boolean
  priority: "high" | "medium" | "low"
}

export const notificationRules: NotificationRule[] = [
  { id: "NR-001", event: "New Verification Request", description: "A specialist submits documents for verification", email: true, push: true, sms: false, digest: false, priority: "high" },
  { id: "NR-002", event: "Flagged Content", description: "Content is flagged by users or the system", email: true, push: true, sms: true, digest: false, priority: "high" },
  { id: "NR-003", event: "New User Registration", description: "A new user creates an account", email: true, push: false, sms: false, digest: true, priority: "low" },
  { id: "NR-004", event: "Payment Failed", description: "A payment transaction fails", email: true, push: true, sms: true, digest: false, priority: "high" },
  { id: "NR-005", event: "System Error", description: "A system error or service degradation is detected", email: true, push: true, sms: true, digest: false, priority: "high" },
  { id: "NR-006", event: "Subscription Change", description: "A user upgrades, downgrades, or cancels", email: true, push: false, sms: false, digest: true, priority: "medium" },
  { id: "NR-007", event: "New Review", description: "A new review is posted on the platform", email: false, push: false, sms: false, digest: true, priority: "low" },
  { id: "NR-008", event: "Maintenance Scheduled", description: "A maintenance window is scheduled", email: true, push: true, sms: false, digest: false, priority: "medium" },
  { id: "NR-009", event: "Security Alert", description: "Suspicious login or unauthorized access attempt", email: true, push: true, sms: true, digest: false, priority: "high" },
]

export interface IPWhitelistEntry {
  id: string
  ip: string
  label: string
  addedBy: string
  addedAt: string
  lastUsed: string
}

export const ipWhitelist: IPWhitelistEntry[] = [
  { id: "IP-001", ip: "192.168.1.0/24", label: "Office Network - Beirut", addedBy: "Admin (Super)", addedAt: "2025-06-15", lastUsed: "2026-02-20" },
  { id: "IP-002", ip: "10.0.0.0/16", label: "Internal VPN", addedBy: "Admin (Super)", addedAt: "2025-06-15", lastUsed: "2026-02-20" },
  { id: "IP-003", ip: "203.0.113.50", label: "Remote Admin - Sara", addedBy: "Admin (Super)", addedAt: "2026-01-10", lastUsed: "2026-02-18" },
]

export interface BackupRecord {
  id: string
  date: string
  size: string
  type: "full" | "incremental"
  status: "completed" | "failed" | "in_progress"
  duration: string
  storagePath: string
}

export const backupHistory: BackupRecord[] = [
  { id: "BKP-001", date: "2026-02-20 03:00", size: "4.2 GB", type: "full", status: "completed", duration: "12m 34s", storagePath: "s3://skillers-backups/2026-02-20/" },
  { id: "BKP-002", date: "2026-02-19 03:00", size: "4.1 GB", type: "full", status: "completed", duration: "11m 58s", storagePath: "s3://skillers-backups/2026-02-19/" },
  { id: "BKP-003", date: "2026-02-18 03:00", size: "3.9 GB", type: "full", status: "completed", duration: "12m 12s", storagePath: "s3://skillers-backups/2026-02-18/" },
  { id: "BKP-004", date: "2026-02-17 03:00", size: "3.8 GB", type: "full", status: "failed", duration: "8m 45s", storagePath: "s3://skillers-backups/2026-02-17/" },
  { id: "BKP-005", date: "2026-02-16 03:00", size: "3.7 GB", type: "full", status: "completed", duration: "11m 30s", storagePath: "s3://skillers-backups/2026-02-16/" },
  { id: "BKP-006", date: "2026-02-15 03:00", size: "3.6 GB", type: "full", status: "completed", duration: "11m 15s", storagePath: "s3://skillers-backups/2026-02-15/" },
  { id: "BKP-007", date: "2026-02-20 15:00", size: "0.8 GB", type: "incremental", status: "completed", duration: "3m 22s", storagePath: "s3://skillers-backups/incr-2026-02-20/" },
]

export interface SettingsChangeLog {
  id: string
  setting: string
  oldValue: string
  newValue: string
  changedBy: string
  changedAt: string
  module: string
  canRollback: boolean
}

export const settingsChangeLog: SettingsChangeLog[] = [
  { id: "SCL-001", setting: "Maintenance Mode", oldValue: "Disabled", newValue: "Enabled", changedBy: "Admin (Super)", changedAt: "2026-02-20 14:00", module: "General", canRollback: true },
  { id: "SCL-002", setting: "Session Timeout", oldValue: "30 min", newValue: "60 min", changedBy: "Admin (Super)", changedAt: "2026-02-19 10:30", module: "Security", canRollback: true },
  { id: "SCL-003", setting: "Auto-Approve Verifications", oldValue: "Enabled", newValue: "Disabled", changedBy: "Admin", changedAt: "2026-02-18 16:00", module: "Security", canRollback: true },
  { id: "SCL-004", setting: "Default Language", oldValue: "Arabic", newValue: "English", changedBy: "Admin (Super)", changedAt: "2026-02-17 09:15", module: "General", canRollback: true },
  { id: "SCL-005", setting: "Push Notifications", oldValue: "Enabled", newValue: "Disabled", changedBy: "Admin", changedAt: "2026-02-16 11:45", module: "Notifications", canRollback: true },
  { id: "SCL-006", setting: "MFA Enforcement", oldValue: "Optional", newValue: "Required for Admins", changedBy: "Admin (Super)", changedAt: "2026-02-15 08:00", module: "Security", canRollback: false },
  { id: "SCL-007", setting: "Max Upload Size", oldValue: "5 MB", newValue: "10 MB", changedBy: "Admin (Super)", changedAt: "2026-02-14 14:20", module: "General", canRollback: true },
  { id: "SCL-008", setting: "Email Service Provider", oldValue: "SendGrid", newValue: "AWS SES", changedBy: "Admin (Super)", changedAt: "2026-02-12 10:00", module: "System", canRollback: false },
]

export const auditLogStats = {
  totalActions: 16,
  criticalActions: 5,
  byActor: [
    { actor: "Admin (Super)", count: 8, pct: 50 },
    { actor: "System", count: 4, pct: 25 },
    { actor: "Support", count: 2, pct: 12.5 },
    { actor: "Moderator", count: 2, pct: 12.5 },
  ],
  byModule: [
    { module: "User Management", count: 2 },
    { module: "Infrastructure", count: 3 },
    { module: "Moderation", count: 2 },
    { module: "Verification", count: 1 },
    { module: "Reviews", count: 1 },
    { module: "Categories", count: 1 },
    { module: "Subscriptions", count: 1 },
    { module: "Analytics", count: 1 },
    { module: "Security", count: 1 },
    { module: "Payments", count: 1 },
    { module: "Settings", count: 1 },
    { module: "Chats", count: 1 },
  ],
  bySeverity: [
    { severity: "critical", count: 5, color: "#ef4444" },
    { severity: "high", count: 3, color: "#f59e0b" },
    { severity: "medium", count: 4, color: "#3b82f6" },
    { severity: "low", count: 4, color: "#94a3b8" },
  ],
}
