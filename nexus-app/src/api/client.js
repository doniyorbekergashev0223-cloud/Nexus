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
    attachmentUrl: r.attachment_url || null,
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
  async getProfile(userId) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error || !data) return null;
    return data;
  },
  async createProfile(profile) {
    const { error } = await supabase.from('profiles').insert({
      id: profile.id,
      full_name: profile.full_name || '',
      role: profile.role || 'student',
      region: profile.region || 'Toshkent',
      org_id: profile.org_id || null,
      org_name: profile.org_name || null,
      plan: profile.plan || 'free',
      school: profile.school || null,
      avatar_url: profile.avatar_url || null,
    });
    if (error) throw new Error(error.message);
    return profile;
  },
  async updateProfile(userId, updates) {
    const row = {};
    if (updates.full_name != null) row.full_name = updates.full_name;
    if (updates.avatar_url != null) row.avatar_url = updates.avatar_url;
    if (updates.region != null) row.region = updates.region;
    if (updates.school != null) row.school = updates.school;
    if (Object.keys(row).length === 0) return;
    const { error } = await supabase.from('profiles').update(row).eq('id', userId);
    if (error) throw new Error(error.message);
  },
  async uploadAvatar(userId, file) {
    const ext = (file.name || '').split('.').pop() || 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  },
  async uploadProjectFile(userId, file) {
    const safeName = (file.name || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${userId}/${Date.now()}_${safeName}`;
    const contentType = file.type || 'application/octet-stream';
    const { error } = await supabase.storage.from('project-files').upload(path, file, { upsert: false, contentType });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('project-files').getPublicUrl(path);
    return data.publicUrl;
  },
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
    if (body.attachmentUrl) row.attachment_url = body.attachmentUrl;
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
  async getGlobalStats() {
    const [projectsRes, orgsRes] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('organizations').select('id, region'),
    ]);
    const totalProjects = projectsRes.count ?? 0;
    const orgs = orgsRes.data || [];
    const totalOrganizations = orgs.length;
    const regions = new Set(orgs.map(o => o.region).filter(Boolean));
    const totalRegions = regions.size;
    const { data: authorsData } = await supabase.from('projects').select('author').limit(5000);
    const uniqueAuthors = new Set((authorsData || []).map(r => r.author).filter(Boolean)).size;
    return { totalProjects, totalOrganizations, totalRegions, uniqueAuthors };
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
  async getProfile() {
    return null;
  },
  async updateProfile() {
    return Promise.resolve();
  },
  async uploadAvatar() {
    throw new Error('Avatar yuklash faqat Supabase ulanganida ishlaydi');
  },
  async uploadProjectFile() {
    throw new Error('Fayl yuklash faqat Supabase ulanganida ishlaydi');
  },
  async getGlobalStats() {
    try {
      const [projects, orgs] = await Promise.all([
        request('/api/projects'),
        request('/api/organizations'),
      ]);
      const totalProjects = Array.isArray(projects) ? projects.length : 0;
      const totalOrganizations = Array.isArray(orgs) ? orgs.length : 0;
      const regions = new Set((orgs || []).map(o => o.region).filter(Boolean));
      const uniqueAuthors = Array.isArray(projects) ? new Set(projects.map(p => p.author).filter(Boolean)).size : 0;
      return { totalProjects, totalOrganizations, totalRegions: regions.size, uniqueAuthors };
    } catch {
      return { totalProjects: 0, totalOrganizations: 0, totalRegions: 0, uniqueAuthors: 0 };
    }
  },
};

const api = supabase ? apiSupabase : apiFetch;

export { apiSupabase, apiFetch };
export default api;
