// Popup logic for UET Downloader (By HBM - Dawn)
const api = globalThis.browser || globalThis.chrome;
const toggle = document.getElementById('toggle');
const badge = document.getElementById('badge');

function render(on) {
  toggle.checked = !!on;
  if (on) {
    badge.textContent = 'BẬT';
    badge.className = 'badge badge-on';
  } else {
    badge.textContent = 'TẮT';
    badge.className = 'badge badge-off';
  }
}

// Lấy trạng thái từ storage, mặc định là BẬT nếu chưa từng tắt
const getStorage = api.storage.local.get('enabled');
if (getStorage && getStorage.then) {
  getStorage.then(r => render(r.enabled !== false));
} else {
  api.storage.local.get('enabled', r => render(r.enabled !== false));
}

toggle.addEventListener('change', () => {
  api.storage.local.set({ enabled: toggle.checked });
  render(toggle.checked);
});
