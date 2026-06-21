export type UserRole = 'admin' | 'leader' | 'agent'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  team_id: string | null
  created_at: string
}

export interface Team {
  id: string
  name: string
  leader_id: string
  created_at: string
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified'

export interface Lead {
  id: string
  full_name: string
  email: string
  phone: string | null
  company: string | null
  status: LeadStatus
  source: string | null
  notes: string | null
  assigned_to: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type DealStage =
  | 'prospecting'
  | 'qualification'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost'

export interface Deal {
  id: string
  title: string
  value: number
  stage: DealStage
  contact_id: string | null
  lead_id: string | null
  assigned_to: string
  expected_close_date: string | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  full_name: string
  email: string
  phone: string | null
  company: string | null
  position: string | null
  notes: string | null
  assigned_to: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'deal_stage_change'
  description: string
  entity_type: 'lead' | 'deal' | 'contact'
  entity_id: string
  performed_by: string
  created_at: string
}

export interface DashboardStats {
  total_leads: number
  leads_this_month: number
  total_deals: number
  deals_won_this_month: number
  revenue_this_month: number
  revenue_total: number
  conversion_rate: number
}
