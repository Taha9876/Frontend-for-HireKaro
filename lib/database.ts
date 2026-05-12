import api from './api'

// ── Database operations proxied to FastAPI backend ──────────────────

// User operations
export async function createUser(userData: {
  email: string
  full_name?: string
  company?: string
  phone?: string
  role?: string
}) {
  const res = await api.post('/api/v1/users', userData)
  return res.data
}

export async function getUserByEmail(email: string) {
  const res = await api.get(`/api/v1/users?email=${email}`)
  return res.data
}

export async function updateUserProfile(userId: string, updates: any) {
  const res = await api.patch(`/api/v1/users/${userId}`, updates)
  return res.data
}

// Application operations
export async function createApplication(applicationData: {
  user_id: string
  job_title: string
  company: string
  resume_url?: string
}) {
  const res = await api.post('/api/v1/applications', applicationData)
  return res.data
}

export async function getUserApplications(userId: string) {
  const res = await api.get(`/api/v1/applications?user_id=${userId}`)
  return res.data
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  const res = await api.patch(`/api/v1/applications/${applicationId}`, { status })
  return res.data
}

// Contact operations
export async function createContactSubmission(submissionData: {
  name: string
  email: string
  company?: string
  phone?: string
  subject: string
  message: string
}) {
  const res = await api.post('/api/v1/contact', submissionData)
  return res.data
}

export async function getContactSubmissions() {
  const res = await api.get('/api/v1/contact')
  return res.data
}
