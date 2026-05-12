import api from './api'
import Cookies from 'js-cookie'

// ── Auth helpers that proxy to FastAPI backend ──────────────────

export async function signUp(email: string, password: string, metadata?: any) {
  const res = await api.post('/api/v1/auth/signup', {
    email,
    password,
    company_name: metadata?.company_name,
    industry: metadata?.industry,
    company_size: metadata?.company_size,
  })
  return res.data
}

export async function signIn(email: string, password: string) {
  const res = await api.post('/api/v1/auth/login', { email, password })
  const { access_token, refresh_token, company_name } = res.data

  document.cookie = `access_token=${access_token}; path=/; max-age=86400`
  document.cookie = `refresh_token=${refresh_token}; path=/; max-age=86400`
  if (company_name) {
    document.cookie = `company_name=${company_name}; path=/; max-age=86400`
  }
  return res.data
}

export async function signOut() {
  try {
    const refreshToken = Cookies.get('refresh_token')
    if (refreshToken) {
      await api.post('/api/v1/auth/logout', { refresh_token: refreshToken })
    }
  } catch (_) {}
  Cookies.remove('access_token')
  Cookies.remove('refresh_token')
  Cookies.remove('company_name')
}

export async function getCurrentUser() {
  try {
    const res = await api.get('/api/v1/auth/me')
    return res.data
  } catch {
    return null
  }
}
