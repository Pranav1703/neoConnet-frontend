export type UserRole = 'staff' | 'secretariat' | 'case_manager' | 'admin' | 'management';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  isAnonymous: boolean;
  createdAt: string;
}

export type CaseStatus = 'New' | 'Assigned' | 'In Progress' | 'Pending' | 'Resolved' | 'Escalated';
export type CaseCategory = 'Safety' | 'Policy' | 'Facilities' | 'HR' | 'Other';
export type CaseSeverity = 'Low' | 'Medium' | 'High';

export interface Case {
  _id: string;
  neoId: string;
  title: string;
  description: string;
  category: CaseCategory;
  severity: CaseSeverity;
  status: CaseStatus;
  department: string;
  location: string;
  submitter: User;
  isAnonymous: boolean;
  assignedTo?: User;
  attachments: string[];
  notes: CaseNote[];
  createdAt: string;
  updatedAt: string;
  lastResponseAt?: string;
}

export interface CaseNote {
  content: string;
  author: User;
  createdAt: string;
}

export interface Poll {
  _id: string;
  title: string;
  description: string;
  options: PollOption[];
  createdBy: User;
  endsAt: string;
  isActive: boolean;
  allowMultiple: boolean;
  createdAt: string;
}

export interface PollOption {
  text: string;
  votes: string[];
}

export interface Digest {
  _id: string;
  title: string;
  content: string;
  quarter: string;
  year: number;
  author: User;
  publishedAt: string;
  createdAt: string;
}

export interface ImpactRecord {
  _id: string;
  title: string;
  description: string;
  quarter: string;
  year: number;
  casesResolved: number;
  satisfactionScore: number;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}