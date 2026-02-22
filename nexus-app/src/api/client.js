/**
 * NEXUS API — Supabase (deploy) yoki Node API (lokal).
 * VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY bo'lsa Supabase ishlatiladi, aks holda VITE_API_URL.
 */

import { supabase } from '../lib/supabase';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

function projectFromRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    orgId: r.org_id,
    targetOrgId: r.target_org_id,
    title: r.title,
    problem: r.problem,
    solution: r.solution,
    author: r.author,
    phone: r.phone,
    school: r.school,
    status: r.status,
    aiScore: r.ai_score ?? 0,
    badges: Array.isArray(r.badges) ? r.badges : (r.badges ? JSON.parse(r.badges) : []),
    feedback: r.feedback || '',
    date: r.created_at ? r.created_at.slice(0, 10) : '',
    ipProtected: !!r.ip_protected,
  };
}

function notifFromRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    orgId: r.org_id,
    type: r.type,
    text: r.text,
    unread: !!r.unread,
    time: r.created_at,
  };
}

function memberFromRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    orgId: r.org_id,
    name: r.name,
    role: r.role,
    company: r.company,
    avatar: r.avatar,
    rating: r.rating ?? 5,
    tags: typeof r.tags === 'string' ? (r.tags ? JSON.parse(r.tags) : []) : (r.tags || []),
  };
}

const apiSupabase = {
  async getProjects({ role, orgId } = {}) {
    let q = supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (role === 'organization' && orgId) q = q.eq('target_org_id', orgId);
    else if (role === 'student' && orgId) q = q.eq('org_id', orgId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data || []).map(projectFromRow);
  },
  async createProject(body) {
    const row = {
      org_id: body.orgId,
      target_org_id: body.targetOrgId || 'ORG-ITP-001',
      title: body.title,
      problem: body.problem,
      solution: body.solution,
      author: body.author,
      phone: body.phone,
      school: body.school,
      ai_score: body.aiScore ?? Math.round(50 + Math.random() * 50),
      badges: JSON.stringify(body.badges || []),
      feedback: body.feedback || '',
      ip_protected: !!body.ipProtected,
    };
    const { data, error } = await supabase.from('projects').insert(row).select().single();
    if (error) throw new Error(error.message);
    return projectFromRow(data);
  },
  async updateProject(id, body) {
    const row = {};
    if (body.status != null) row.status = body.status;
    if (body.feedback != null) row.feedback = body.feedback;
    const { data, error } = await supabase.from('projects').update(row).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return projectFromRow(data);
  },
  async getNotifications(orgId) {
    let q = supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (orgId) q = q.or(`org_id.eq.${orgId},org_id.eq.ALL`);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data || []).map(notifFromRow);
  },
  async createNotification(body) {
    const { data, error } = await supabase.from('notifications').insert({
      org_id: body.orgId,
      type: body.type || 'info',
      text: body.text,
      unread: true,
    }).select().single();
    if (error) throw new Error(error.message);
    return notifFromRow(data);
  },
  async getTeam(orgId) {
    let q = supabase.from('team').select('*').order('id');
    if (orgId) q = q.or(`org_id.eq.${orgId},org_id.eq.ALL`);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data || []).map(memberFromRow);
  },
  async addMentor(body) {
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const avatar = body.avatar || (body.name ? body.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?');
    const { data, error } = await supabase.from('team').insert({
      org_id: body.orgId,
      name: body.name,
      role: body.role || '',
      company: body.company || '',
      avatar,
      rating: 5,
      tags: JSON.stringify(tags),
    }).select().single();
    if (error) throw new Error(error.message);
    return memberFromRow(data);
  },
  async updateMentor(id, body) {
    const row = {};
    if (body.name != null) row.name = body.name;
    if (body.role != null) row.role = body.role;
    if (body.company != null) row.company = body.company;
    if (body.avatar != null) row.avatar = body.avatar;
    if (body.tags != null) row.tags = typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags || []);
    const { data, error } = await supabase.from('team').update(row).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return memberFromRow(data);
  },
  async deleteMentor(id, _orgId) {
    const { error } = await supabase.from('team').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { ok: true };
  },
  async getOrganizations() {
    const { data, error } = await supabase.from('organizations').select('id, name, region').order('name');
    if (error) throw new Error(error.message);
    return (data || []).map(r => ({ id: r.id, name: r.name, region: r.region || '' }));
  },
};

const apiFetch = {
  getProjects(params = {}) {
    const q = new URLSearchParams(params).toString();
    return request(`/api/projects${q ? `?${q}` : ''}`);
  },
  createProject(body) {
    return request('/api/projects', { method: 'POST', body: JSON.stringify(body) });
  },
  updateProject(id, body) {
    return request(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
  },
  getNotifications(orgId) {
    return request(`/api/notifications${orgId ? `?orgId=${encodeURIComponent(orgId)}` : ''}`);
  },
  createNotification(body) {
    return request('/api/notifications', { method: 'POST', body: JSON.stringify(body) });
  },
  getTeam(orgId) {
    return request(`/api/team${orgId ? `?orgId=${encodeURIComponent(orgId)}` : ''}`);
  },
  addMentor(body) {
    return request('/api/team', { method: 'POST', body: JSON.stringify(body) });
  },
  updateMentor(id, body) {
    return request(`/api/team/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
  },
  deleteMentor(id, orgId) {
    return request(`/api/team/${id}`, { method: 'DELETE', body: JSON.stringify({ orgId }) });
  },
  getOrganizations() {
    return request('/api/organizations');
  },
};

const api = supabase ? apiSupabase : apiFetch;

export { apiSupabase, apiFetch };
export default api;
