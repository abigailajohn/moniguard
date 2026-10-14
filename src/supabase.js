import { createClient } from '@supabase/supabase-js'

// Both values are public by design. Row level security in supabase/schema.sql
// makes sure each user can only read and change their own rows.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null
export const cloud = !!supabase

export async function accessToken() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token || null
}

// Turn Supabase auth errors into keys from i18n.js
export function authErrorKey(error) {
  if (!error) return null
  const m = String(error.message || '').toLowerCase()
  const code = error.code || ''
  if (code === 'invalid_credentials' || m.includes('invalid login')) return 'err.invalid'
  if (code === 'email_not_confirmed' || m.includes('not confirmed')) return 'err.notConfirmed'
  if (code === 'user_already_exists' || m.includes('already registered')) return 'err.exists'
  if (code === 'weak_password' || m.includes('weak') || m.includes('password should')) return 'err.weakPw'
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || error.status === 429 || m.includes('rate limit')) return 'err.rate'
  if (code === 'email_address_invalid' || m.includes('invalid email') || m.includes('email address') && m.includes('invalid')) return 'err.email'
  if (m.includes('error sending') || m.includes('not authorized')) return 'err.emailSend'
  if (m.includes('fetch') || m.includes('network')) return 'err.network'
  return 'err.generic'
}
