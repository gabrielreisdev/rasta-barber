export type UserRole = 'client' | 'barber'
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone: string | null
  created_at: string
  updated_at: string
}

export interface BarberStatus {
  id: number
  barber_id: string | null
  is_online: boolean
  status_mode?: 'immediate' | 'scheduled' | 'offline'
  scheduled_date?: string | null
  scheduled_time?: string | null
  custom_message?: string | null
  last_updated: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration_minutes: number
  is_active: boolean
  created_at?: string
}

export interface WorkingHours {
  id: string
  day_of_week: number
  is_working: boolean
  start_time: string
  end_time: string
  lunch_start: string | null
  lunch_end: string | null
}

export interface BlockedDate {
  date: string // "YYYY-MM-DD"
  reason?: string
  created_at?: string
}

export interface AppointmentService {
  appointment_id: string
  service_id: string
  price_at_booking: number
  service?: Service
}

export interface Appointment {
  id: string
  client_name: string
  client_phone: string
  client_id?: string | null
  appointment_date: string // "YYYY-MM-DD"
  start_time: string // "HH:mm"
  end_time: string // "HH:mm"
  status: AppointmentStatus
  total_price: number
  created_at: string
  services?: Service[]
}

export interface TimeSlot {
  time: string
  available: boolean
  reason?: 'past' | 'booked' | 'lunch' | 'closed' | 'exceeds_closing'
}
