// script by sabda_plays
// ── Server API ────────────────────────────────────────
async function api(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

function $(id) { return document.getElementById(id); }

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(name + '-screen').classList.add('active');
}

function toast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ── Admin Logic ─────────────────────────────────────────
$('admin-login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const pwd = $('admin-password').value;
  const res = await api('/api/admin/login', 'POST', { password: pwd });
  if (res.ok) {
    sessionStorage.setItem('admin_token', res.json.token);
    $('admin-password').value = '';
    showScreen('admin-dashboard');
    loadAdminTokens();
  } else {
    toast('Password salah!', 'error');
  }
});

$('btn-admin-logout').addEventListener('click', () => {
  sessionStorage.removeItem('admin_token');
  showScreen('admin-login');
});

$('btn-admin-add-token').addEventListener('click', async () => {
  const token = $('admin-new-token').value.trim();
  if (!token) return;
  const res = await api('/api/admin/tokens', 'POST', { token });
  if (res.ok) {
    $('admin-new-token').value = '';
    toast('Token berhasil divalidasi!', 'success');
    loadAdminTokens();
  } else {
    toast('Gagal menambahkan token.', 'error');
  }
});

async function loadAdminTokens() {
  const res = await api('/api/admin/tokens', 'GET');
  if (res.ok) {
    const list = $('admin-token-list');
    list.innerHTML = '';
    if (res.json.length === 0) {
      list.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-dim);">Belum ada token tervalidasi.</div>';
    }
    res.json.forEach(t => {
      const div = document.createElement('div');
      div.className = 'token-item';
      const masked = t.token.substring(0, 20) + '...';
      div.innerHTML = `
        <span class="token-text" title="${t.token}">${masked}</span>
        <button class="btn-danger-sm" onclick="removeAdminToken('${t.token}')">Unvalidasi</button>
      `;
      list.appendChild(div);
    });
  }
}

async function removeAdminToken(token) {
  if (!confirm('Cabut validasi token ini?')) return;
  const res = await api('/api/admin/tokens', 'DELETE', { token });
  if (res.ok) {
    toast('Token di-unvalidasi!', 'success');
    loadAdminTokens();
  }
}

// Auto-check if already logged in (simple check)
if (sessionStorage.getItem('admin_token')) {
  showScreen('admin-dashboard');
  loadAdminTokens();
} else {
  showScreen('admin-login');
}
