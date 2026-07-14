// ===== DATA =====
let DB = { clients: [], procedures: [] };
let currentTab = 'clients';
let galleryFilter = 'all';

const GRADIENTS = [
  'linear-gradient(135deg,#fbcfe8,#f9a8d4)',
  'linear-gradient(135deg,#ddd6fe,#c4b5fd)',
  'linear-gradient(135deg,#fde68a,#fcd34d)',
  'linear-gradient(135deg,#99f6e4,#5eead4)',
  'linear-gradient(135deg,#bbf7d0,#86efac)',
  'linear-gradient(135deg,#fecaca,#fca5a5)'
];
const COLORS = ['#ec4899','#a855f7','#f59e0b','#14b8a6','#22c55e','#ef4444'];

function seed() {
  DB.clients = [
    { id:'c1', name:'Анна Козлова', phone:'+7 (999) 123-45-67', birthday:'1995-03-15', allergies:'', preferences:['D-изгиб','Гипоаллергенный клей'], created:'2026-01-10' },
    { id:'c2', name:'Марина Петрова', phone:'+7 (999) 987-65-43', birthday:'1990-07-22', allergies:'Чувствительность к латексу', preferences:['C-изгиб','Короткая длина'], created:'2026-02-05' },
    { id:'c3', name:'Елена Сидорова', phone:'+7 (999) 456-78-90', birthday:'1988-11-08', allergies:'', preferences:['D-изгиб','Длинная длина'], created:'2026-03-12' },
    { id:'c4', name:'Ольга Новикова', phone:'+7 (999) 234-56-78', birthday:'1992-05-30', allergies:'Сухие глаза', preferences:['C-изгиб','Гипоаллергенный клей'], created:'2026-04-01' },
    { id:'c5', name:'Ирина Морозова', phone:'+7 (999) 876-54-32', birthday:'1997-09-18', allergies:'', preferences:['L-изгиб'], created:'2026-05-20' }
  ];
  DB.procedures = [
    { id:'p1', clientId:'c1', tech:'2D', curve:'D', length:'10-12', thickness:'0.07', glue:'Stacy Lash', date:'2026-07-12', duration:120, price:3500, notes:'Хорошая фиксация', fav:true },
    { id:'p2', clientId:'c1', tech:'Пучки', curve:'D', length:'11-13', thickness:'0.10', glue:'i-Beauty', date:'2026-06-28', duration:150, price:4000, notes:'Лисий эффект', fav:true },
    { id:'p3', clientId:'c1', tech:'3D', curve:'D', length:'9-11', thickness:'0.07', glue:'Stacy Lash', date:'2026-06-15', duration:120, price:3800, notes:'', fav:false },
    { id:'p4', clientId:'c2', tech:'Классика', curve:'C', length:'8-10', thickness:'0.15', glue:'Barbara', date:'2026-07-08', duration:90, price:2500, notes:'Натуральный', fav:false },
    { id:'p5', clientId:'c2', tech:'Классика', curve:'C', length:'8-10', thickness:'0.15', glue:'Barbara', date:'2026-06-20', duration:90, price:2500, notes:'Коррекция', fav:false },
    { id:'p6', clientId:'c3', tech:'3D', curve:'D', length:'10-12', thickness:'0.07', glue:'Stacy Lash', date:'2026-07-01', duration:130, price:3800, notes:'', fav:false },
    { id:'p7', clientId:'c3', tech:'2D', curve:'D', length:'10-11', thickness:'0.07', glue:'Stacy Lash', date:'2026-06-10', duration:110, price:3200, notes:'', fav:true },
    { id:'p8', clientId:'c4', tech:'Классика', curve:'C', length:'9-10', thickness:'0.15', glue:'Barbara', date:'2026-07-05', duration:90, price:2500, notes:'Первый раз', fav:false },
    { id:'p9', clientId:'c5', tech:'Пучки', curve:'L', length:'12-14', thickness:'0.10', glue:'i-Beauty', date:'2026-07-10', duration:140, price:4200, notes:'Кукольный', fav:true },
    { id:'p10', clientId:'c5', tech:'2D', curve:'L', length:'11-13', thickness:'0.07', glue:'Stacy Lash', date:'2026-06-25', duration:120, price:3500, notes:'', fav:false }
  ];
}

function init() {
  try {
    const s = localStorage.getItem('lashcraft_data');
    if (s) { const d = JSON.parse(s); DB.clients = d.clients || []; DB.procedures = d.procedures || []; }
    else seed();
  } catch(e) { seed(); }
  renderClients();
}

function save() {
  try { localStorage.setItem('lashcraft_data', JSON.stringify(DB)); } catch(e) {}
}

function today() { return new Date().toISOString().split('T')[0]; }
function esc(t) { const d = document.createElement('div'); d.textContent = t || ''; return d.innerHTML; }
function initials(n) { return n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2); }
function fmtDate(s) { const d = new Date(s + 'T00:00:00'); return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }); }
function fmtFull(s) { const d = new Date(s + 'T00:00:00'); return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); }
function daysAgo(s) { return Math.floor((new Date() - new Date(s + 'T00:00:00')) / 86400000); }

// ===== NAVIGATION =====
function showTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.remove('active');
    b.style.color = '#9ca3af'; b.style.fontWeight = '500';
  });
  const active = document.getElementById('nav-' + tab);
  active.classList.add('active');
  active.style.color = '#ec4899'; active.style.fontWeight = '600';
  if (tab === 'clients') renderClients();
  else if (tab === 'gallery') renderGallery();
  else if (tab === 'stats') renderStats();
}

// ===== CLIENTS =====
function renderClients() {
  const el = document.getElementById('main-content');
  let html = '<div class="search-bar">';
  html += '<input type="text" class="search-input" id="cs" placeholder="Поиск по имени или телефону..." oninput="filterClients()">';
  html += '<button class="btn-icon" onclick="openClientForm()">+</button></div>';
  html += '<div id="cl"></div>';
  el.innerHTML = html;
  filterClients();
}

function filterClients() {
  const q = (document.getElementById('cs')?.value || '').toLowerCase();
  const list = document.getElementById('cl');
  let clients = DB.clients.filter(c => c.name.toLowerCase().includes(q) || (c.phone || '').includes(q));
  clients.sort((a, b) => a.name.localeCompare(b.name));

  if (!clients.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">👤</div><div class="empty-text">Клиентов не найдено</div></div>';
    return;
  }

  list.innerHTML = clients.map((c, i) => {
    const procs = DB.procedures.filter(p => p.clientId === c.id).sort((a, b) => b.date.localeCompare(a.date));
    const last = procs[0];
    const days = last ? daysAgo(last.date) : 999;
    let status = '';
    if (days > 21) status = '<span class="card-status tag-red">Просрочено ' + (days - 21) + ' дн.</span>';
    else if (days > 14) status = '<span class="card-status tag-orange">Коррекция</span>';
    else status = '<span class="card-status tag-green">Через ' + (21 - days) + ' дн.</span>';

    const colors = ['pink', 'purple', 'amber', 'teal'];
    return `<div class="card" onclick="openClient('${c.id}')">
      <div class="card-row">
        <div class="avatar ${colors[i % colors.length]}">${initials(c.name)}</div>
        <div class="card-info">
          <div class="card-name">${esc(c.name)}</div>
          <div class="card-phone">${esc(c.phone) || '—'}</div>
          <div class="card-tags">
            <span class="tag tag-pink">${last ? last.tech : '—'}</span>
            <span class="tag tag-gray">${last ? fmtDate(last.date) : 'Нет процедур'}</span>
          </div>
        </div>
        ${last ? status : ''}
      </div>
    </div>`;
  }).join('');
}

// ===== CLIENT DETAIL =====
function openClient(id) {
  const c = DB.clients.find(x => x.id === id);
  if (!c) return;
  const procs = DB.procedures.filter(p => p.clientId === id).sort((a, b) => b.date.localeCompare(a.date));

  let html = '';
  html += `<div class="section"><div class="section-title">Контакты</div>
    <div style="font-size:14px;color:#374151;line-height:1.8;">
      ${c.phone ? `<div>📞 ${esc(c.phone)}</div>` : ''}
      ${c.birthday ? `<div>🎂 ${fmtFull(c.birthday)}</div>` : ''}
    </div></div>`;

  if (c.preferences?.length) {
    html += `<div class="section"><div class="section-title">Предпочтения</div>
      <div class="card-tags">${c.preferences.map(p => `<span class="tag tag-pink">${esc(p)}</span>`).join('')}</div></div>`;
  }

  if (c.allergies) {
    html += `<div class="section"><div class="section-title">⚠️ Аллергии / особенности</div>
      <div style="font-size:14px;color:#ef4444;background:#fef2f2;padding:10px 12px;border-radius:12px;">${esc(c.allergies)}</div></div>`;
  }

  html += `<div class="section"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <div class="section-title">История процедур</div>
    <button onclick="openProcForm('${id}')" style="background:#ec4899;color:white;border:none;padding:7px 14px;border-radius:12px;font-size:13px;font-weight:500;cursor:pointer;">+ Добавить</button>
  </div>`;

  if (!procs.length) {
    html += '<div class="empty-state" style="padding:30px;"><div class="empty-icon">📋</div><div class="empty-text">Пока нет процедур</div></div>';
  } else {
    html += procs.map(p => {
      const em = p.fav ? '⭐' : '💗';
      return `<div class="history-item">
        <div class="history-thumb" style="background:${GRADIENTS[Math.abs(p.tech.length + p.date.length) % GRADIENTS.length]};">${em}</div>
        <div class="history-info">
          <div class="history-title">${p.tech}${p.curve ? ', ' + p.curve + '-изгиб' : ''}</div>
          <div class="history-meta">${fmtFull(p.date)} • ${p.duration || '—'} мин • ${p.price || '—'} ₽</div>
          <div class="history-detail">${p.glue ? 'Клей: ' + esc(p.glue) : ''}${p.length ? ' • Длина: ' + esc(p.length) + ' мм' : ''}</div>
          ${p.notes ? `<div style="font-size:12px;color:#6b7280;margin-top:3px;font-style:italic;">${esc(p.notes)}</div>` : ''}
        </div>
      </div>`;
    }).join('');
  }
  html += '</div>';
  html += `<button onclick="editClient('${id}')" class="btn-primary" style="background:white;color:#ec4899;border:2px solid #ec4899;margin-bottom:14px;">✏️ Редактировать клиента</button>`;

  showOverlay(c.name, html);
}

// ===== OVERLAYS =====
function showOverlay(title, body) {
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('overlay-body').innerHTML = body;
  document.getElementById('overlay').classList.add('active');
}

function closeOverlay() {
  document.getElementById('overlay').classList.remove('active');
  if (currentTab === 'clients') renderClients();
  else if (currentTab === 'gallery') renderGallery();
  else if (currentTab === 'stats') renderStats();
}

// ===== CLIENT FORM =====
function openClientForm(editId) {
  const c = editId ? DB.clients.find(x => x.id === editId) : null;
  let html = `<form onsubmit="saveClient(event,'${editId || ''}')">`;
  html += `<div class="form-group"><label class="form-label">Имя и фамилия *</label><input type="text" class="form-input" id="f_name" required value="${esc(c?.name || '')}" placeholder="Например: Анна Козлова"></div>`;
  html += `<div class="form-group"><label class="form-label">Телефон</label><input type="tel" class="form-input" id="f_phone" value="${esc(c?.phone || '')}" placeholder="+7 (999) 123-45-67"></div>`;
  html += `<div class="form-group"><label class="form-label">Дата рождения</label><input type="date" class="form-input" id="f_bday" value="${esc(c?.birthday || '')}"></div>`;
  html += `<div class="form-group"><label class="form-label">Аллергии / особенности</label><textarea class="form-textarea" id="f_all" rows="3" placeholder="Например: чувствительность к латексу, сухие глаза...">${esc(c?.allergies || '')}</textarea></div>`;
  html += `<div class="form-group"><label class="form-label">Предпочтения</label><div class="checkbox-group">`;
  const prefs = ['C-изгиб', 'D-изгиб', 'L-изгиб', 'Гипоаллергенный клей', 'Короткая длина', 'Длинная длина'];
  prefs.forEach(p => {
    const checked = c?.preferences?.includes(p) ? 'checked' : '';
    html += `<label class="checkbox-label"><input type="checkbox" class="fpref" value="${p}" ${checked}> ${p}</label>`;
  });
  html += '</div></div>';
  html += `<button type="submit" class="btn-primary">Сохранить</button>`;
  if (editId) html += `<button type="button" class="btn-danger" onclick="delClient('${editId}')" style="margin-top:10px;">Удалить клиента</button>`;
  html += '</form>';
  showOverlay(c ? 'Редактировать клиента' : 'Новый клиент', html);
}

function saveClient(e, id) {
  e.preventDefault();
  const data = {
    id: id || 'c' + Date.now(),
    name: document.getElementById('f_name').value.trim(),
    phone: document.getElementById('f_phone').value.trim(),
    birthday: document.getElementById('f_bday').value,
    allergies: document.getElementById('f_all').value.trim(),
    preferences: Array.from(document.querySelectorAll('.fpref:checked')).map(cb => cb.value),
    created: id ? (DB.clients.find(c => c.id === id)?.created || today()) : today()
  };
  if (id) { const i = DB.clients.findIndex(c => c.id === id); DB.clients[i] = data; }
  else DB.clients.push(data);
  save(); closeOverlay();
}

function delClient(id) {
  if (!confirm('Удалить клиента и все его процедуры?')) return;
  DB.clients = DB.clients.filter(c => c.id !== id);
  DB.procedures = DB.procedures.filter(p => p.clientId !== id);
  save(); closeOverlay();
}

function editClient(id) { closeOverlay(); setTimeout(() => openClientForm(id), 50); }

// ===== PROCEDURE FORM =====
function openProcForm(clientId) {
  closeOverlay();
  setTimeout(() => {
    const techs = ['Классика', '2D', '3D', '4D', '5D+', 'Пучки', 'Голливуд', 'Лисий эффект', 'Кукольный эффект', 'Натуральный'];
    const curves = ['J', 'B', 'C', 'CC', 'D', 'DD', 'L', 'L+', 'M'];
    let html = `<form onsubmit="saveProc(event,'${clientId}')">`;
    html += `<div class="form-group"><label class="form-label">Техника *</label><select class="form-select" id="p_tech" required><option value="">Выберите</option>${techs.map(t => `<option>${t}</option>`).join('')}</select></div>`;
    html += `<div class="form-group"><label class="form-label">Изгиб</label><select class="form-select" id="p_curve"><option value="">—</option>${curves.map(c => `<option>${c}</option>`).join('')}</select></div>`;
    html += `<div class="form-group"><label class="form-label">Длина (мм)</label><input type="text" class="form-input" id="p_len" placeholder="10-12"></div>`;
    html += `<div class="form-group"><label class="form-label">Толщина</label><input type="text" class="form-input" id="p_thick" placeholder="0.07"></div>`;
    html += `<div class="form-group"><label class="form-label">Клей</label><input type="text" class="form-input" id="p_glue" placeholder="Stacy Lash"></div>`;
    html += `<div class="form-group"><label class="form-label">Дата *</label><input type="date" class="form-input" id="p_date" required value="${today()}"></div>`;
    html += `<div class="form-group"><label class="form-label">Длительность (мин)</label><input type="number" class="form-input" id="p_dur" placeholder="120"></div>`;
    html += `<div class="form-group"><label class="form-label">Стоимость (₽)</label><input type="number" class="form-input" id="p_price" placeholder="3500"></div>`;
    html += `<div class="form-group"><label class="form-label">Комментарий</label><textarea class="form-textarea" id="p_notes" rows="3" placeholder="Особенности работы, реакция клиента..."></textarea></div>`;
    html += `<button type="submit" class="btn-primary">Сохранить процедуру</button></form>`;
    showOverlay('Новая процедура', html);
  }, 50);
}

function saveProc(e, clientId) {
  e.preventDefault();
  DB.procedures.push({
    id: 'p' + Date.now(), clientId: clientId,
    tech: document.getElementById('p_tech').value,
    curve: document.getElementById('p_curve').value,
    length: document.getElementById('p_len').value.trim(),
    thickness: document.getElementById('p_thick').value.trim(),
    glue: document.getElementById('p_glue').value.trim(),
    date: document.getElementById('p_date').value,
    duration: parseInt(document.getElementById('p_dur').value) || 0,
    price: parseInt(document.getElementById('p_price').value) || 0,
    notes: document.getElementById('p_notes').value.trim(),
    fav: false
  });
  save(); closeOverlay();
}

// ===== GALLERY =====
function renderGallery() {
  const el = document.getElementById('main-content');
  let html = '<div class="filter-bar">';
  const filters = [['all', 'Все'], ['Классика', 'Классика'], ['2D', '2D'], ['3D', '3D'], ['Пучки', 'Пучки'], ['fav', '⭐ Избранное']];
  filters.forEach(f => {
    const active = galleryFilter === f[0] ? 'active' : '';
    html += `<button class="filter-btn ${active}" onclick="setFilter('${f[0]}')">${f[1]}</button>`;
  });
  html += '</div><div class="gallery-grid" id="gl"></div>';
  el.innerHTML = html;
  renderGalleryGrid();
}

function setFilter(f) {
  galleryFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderGalleryGrid();
}

function renderGalleryGrid() {
  const grid = document.getElementById('gl');
  let procs = DB.procedures.slice().sort((a, b) => b.date.localeCompare(a.date));
  if (galleryFilter === 'fav') procs = procs.filter(p => p.fav);
  else if (galleryFilter !== 'all') procs = procs.filter(p => p.tech === galleryFilter);

  if (!procs.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">📸</div><div class="empty-text">Фото не найдены</div></div>';
    return;
  }

  grid.innerHTML = procs.map(p => {
    const c = DB.clients.find(x => x.id === p.clientId);
    const name = c ? c.name.split(' ')[0] : '—';
    const grad = GRADIENTS[Math.abs(p.tech.length + p.date.length) % GRADIENTS.length];
    return `<div class="gallery-card">
      <div class="gallery-img" style="background:${grad};display:flex;align-items:center;justify-content:center;font-size:36px;">💗</div>
      <div class="gallery-info">
        <div class="gallery-title">${p.tech}${p.curve ? ', ' + p.curve : ''}</div>
        <div class="gallery-meta">${fmtDate(p.date)} • ${name}</div>
        <div class="gallery-footer">
          <span style="font-size:12px;color:#9ca3af;">${p.price ? p.price + ' ₽' : ''}</span>
          <span class="gallery-star ${p.fav ? 'active' : ''}" onclick="toggleFav('${p.id}',event)">${p.fav ? '★' : '☆'}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleFav(pid, e) {
  e.stopPropagation();
  const p = DB.procedures.find(x => x.id === pid);
  if (p) { p.fav = !p.fav; save(); renderGalleryGrid(); }
}

// ===== STATS =====
function renderStats() {
  const el = document.getElementById('main-content');
  const now = new Date();
  const monthProcs = DB.procedures.filter(p => {
    const d = new Date(p.date + 'T00:00:00');
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const revenue = monthProcs.reduce((s, p) => s + (p.price || 0), 0);
  const newClients = DB.clients.filter(c => {
    const d = new Date(c.created + 'T00:00:00');
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const corrections = monthProcs.filter(p => p.notes && p.notes.toLowerCase().includes('коррекц')).length;

  let html = '<div class="stats-grid">';
  html += `<div class="stat-box"><div class="stat-value stat-pink">${monthProcs.length}</div><div class="stat-label">Процедур</div></div>`;
  html += `<div class="stat-box"><div class="stat-value stat-green">${revenue.toLocaleString()} ₽</div><div class="stat-label">Выручка</div></div>`;
  html += `<div class="stat-box"><div class="stat-value stat-purple">${newClients}</div><div class="stat-label">Новых клиентов</div></div>`;
  html += `<div class="stat-box"><div class="stat-value stat-amber">${corrections}</div><div class="stat-label">Коррекций</div></div>`;
  html += '</div>';

  // Tech stats
  const tc = {};
  DB.procedures.forEach(p => tc[p.tech] = (tc[p.tech] || 0) + 1);
  const total = DB.procedures.length;
  const techs = Object.entries(tc).sort((a, b) => b[1] - a[1]);
  html += `<div class="section"><div class="section-title">Популярные техники</div>`;
  html += techs.map((t, i) => {
    const pct = Math.round((t[1] / total) * 100);
    return `<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:3px;"><span style="color:#374151;font-weight:500;">${t[0]}</span><span style="color:#6b7280;">${t[1]} (${pct}%)</span></div><div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${COLORS[i % COLORS.length]};"></div></div></div>`;
  }).join('');
  html += '</div>';

  // Monthly income
  const monthly = {};
  DB.procedures.forEach(p => {
    const d = new Date(p.date + 'T00:00:00');
    const k = d.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
    monthly[k] = (monthly[k] || 0) + (p.price || 0);
  });
  const months = Object.entries(monthly).sort((a, b) => {
    const ma = a[0].split(' '); const mb = b[0].split(' ');
    const mo = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return new Date(ma[1], mo.indexOf(ma[0])) - new Date(mb[1], mo.indexOf(mb[0]));
  });
  html += `<div class="section"><div class="section-title">Доход по месяцам</div>`;
  html += months.map(m => `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#374151;">${m[0]}</span><span style="font-size:15px;font-weight:600;color:#1f2937;">${m[1].toLocaleString()} ₽</span></div>`).join('');
  html += '</div>';

  el.innerHTML = html;
}

// ===== START =====
document.addEventListener('DOMContentLoaded', init);
