// Popup logic for UET Downloader (by HBM - Dawn)
const api = globalThis.browser || globalThis.chrome;
const toggle = document.getElementById('toggle');
const badge = document.getElementById('badge');
const updateBanner = document.getElementById('update-banner');
const newVersionText = document.getElementById('new-version-text');
const appVersion = document.getElementById('app-version');

// Hiển thị phiên bản hiện tại từ manifest
try {
  const currentVer = api.runtime.getManifest().version;
  if (currentVer && appVersion) {
    appVersion.textContent = `Phiên bản ${currentVer}`;
  }
} catch (e) {}

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

// Lấy trạng thái Bật/Tắt từ storage
api.storage.local.get('enabled', (r) => {
  render(r.enabled !== false);
});

toggle.addEventListener('change', () => {
  api.storage.local.set({ enabled: toggle.checked });
  render(toggle.checked);
});

// Kiểm tra thông báo cập nhật mới từ GitHub
api.storage.local.get('updateInfo', (r) => {
  if (r && r.updateInfo && r.updateInfo.hasUpdate) {
    if (newVersionText) newVersionText.textContent = `v${r.updateInfo.newVersion}`;
    if (updateBanner) updateBanner.style.display = 'block';
  }
});

// Gửi tín hiệu check update trực tiếp
try {
  api.runtime.sendMessage({ action: 'checkForUpdate' }, (resp) => {
    if (resp && resp.hasUpdate) {
      if (newVersionText) newVersionText.textContent = `v${resp.newVersion}`;
      if (updateBanner) updateBanner.style.display = 'block';
    }
  });
} catch (e) {}
