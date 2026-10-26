// Background Event Script for UET Downloader (by HBM - Dawn)
const browserApi = (typeof browser !== 'undefined' && browser.runtime) ? browser : chrome;

const trackedTabs = new Set();

// Lắng nghe sự kiện bắt đầu tải để tự động đóng tab đã mở
const dlApi = (typeof browser !== 'undefined' && browser.downloads) ? browser.downloads : chrome.downloads;
if (dlApi && dlApi.onCreated) {
  dlApi.onCreated.addListener(() => {
    // Đóng ngay các tab tải nền đang mở
    for (const tabId of trackedTabs) {
      try {
        browserApi.tabs.remove(tabId, () => {});
      } catch (e) {}
    }
    trackedTabs.clear();
  });
}

browserApi.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'downloadFile') {
    handleDownload(message).then(sendResponse);
    return true; // Giữ kết nối bất đồng bộ
  }
});

async function handleDownload({ url, filename }) {
  const tabsApi = (typeof browser !== 'undefined' && browser.tabs) ? browser.tabs : chrome.tabs;

  // 1. Tải trực tiếp qua Downloads API (Không mở tab, không bị popup blocker chặn)
  if (dlApi && dlApi.download) {
    try {
      const options = {
        url: url,
        conflictAction: 'uniquify',
        saveAs: false
      };

      // Chỉ gán tên file nếu đã có đuôi mở rộng hợp lệ (.pdf, .docx, v.v.)
      // Nếu không có đuôi, bỏ trống để trình duyệt tự lấy tên chuẩn từ server (Content-Disposition)
      if (filename && /\.[a-zA-Z0-9]{2,5}$/i.test(filename)) {
        options.filename = filename.replace(/[\\/:*?"<>|]/g, '_').trim();
      }

      const downloadId = await new Promise((resolve, reject) => {
        dlApi.download(options, (id) => {
          const lastErr = browserApi.runtime.lastError;
          if (lastErr) reject(new Error(lastErr.message));
          else resolve(id);
        });
      });

      return { success: true, method: 'downloads', downloadId };
    } catch (err) {
      console.warn('[UET Downloader] Downloads API warning, fallback sang tabs API:', err.message);
    }
  }

  // 2. Mở tab nền để tải và TỰ ĐỘNG ĐÓNG TAB NGAY SAU ĐÓ (tránh bừa ra)
  if (tabsApi && tabsApi.create) {
    try {
      const tab = await new Promise((resolve, reject) => {
        tabsApi.create({ url: url, active: false }, (t) => {
          const lastErr = browserApi.runtime.lastError;
          if (lastErr || !t) reject(new Error(lastErr ? lastErr.message : 'Tab error'));
          else resolve(t);
        });
      });

      trackedTabs.add(tab.id);

      // Tự động đóng tab sau 3.5 giây để hoàn tất tải và giữ trình duyệt sạch sẽ
      setTimeout(() => {
        try {
          trackedTabs.delete(tab.id);
          tabsApi.remove(tab.id, () => {});
        } catch (e) {}
      }, 3500);

      return { success: true, method: 'tab', tabId: tab.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  return { success: false, error: 'Không thể kích hoạt tải' };
}
