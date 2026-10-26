/**
 * ==========================================================================
 * UET Downloader Pro
 * by HBM - Dawn
 * Tự động tải nhiều bài giảng (Google Drive), tài liệu và file trên portal UET
 * ==========================================================================
 */

(() => {
  const api = globalThis.browser || globalThis.chrome;
  const CLS = 'uetdl-cb';
  const MOD_CLS = 'uetdl-module-cb';
  const BAR_ID = 'uetdl-bar';
  const TOAST_ID = 'uetdl-toast';

  let observer = null;
  let timer = null;
  let currentCourseId = null;
  const courseModulesCache = new Map();

  // -------------------------------------------------------------
  // 1. URL & ID Helpers
  // -------------------------------------------------------------
  function getCourseId() {
    const m = location.pathname.match(/\/courses\/(\d+)/);
    return m ? m[1] : null;
  }

  function fileIdFromHref(href) {
    if (!href) return null;
    const m = href.match(/\/files\/(\d+)/) || href.match(/[?&]preview=(\d+)/);
    return m ? m[1] : null;
  }

  function moduleItemIdFromHref(href) {
    if (!href) return null;
    const m = href.match(/\/modules\/items\/(\d+)/);
    return m ? m[1] : null;
  }

  function canvasFileDownloadUrl(id) {
    return `${location.origin}/files/${id}/download?download_frd=1`;
  }

  // Chuyển đổi link Google Drive, Docs, Sheets, Slides sang link tải trực tiếp
  function convertToDirectDownloadUrl(rawUrl) {
    if (!rawUrl) return null;
    const url = rawUrl.trim();

    // 1. Google Drive thông thường (PDF, DOCX, PPTX, ZIP, v.v.)
    const gdriveFile = url.match(/(?:drive|docs)\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*?id=)([a-zA-Z0-9_-]+)/i)
      || url.match(/drive\.usercontent\.google\.com\/download\?.*?id=([a-zA-Z0-9_-]+)/i);

    if (gdriveFile) {
      const fileId = gdriveFile[1];
      // confirm=t tự động bỏ qua trang cảnh báo virus cho file dung lượng lớn
      return `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
    }

    // 2. Google Docs
    const gDoc = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/i);
    if (gDoc) {
      return `https://docs.google.com/document/d/${gDoc[1]}/export?format=pdf`;
    }

    // 3. Google Slides
    const gSlide = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/i);
    if (gSlide) {
      return `https://docs.google.com/presentation/d/${gSlide[1]}/export/pdf`;
    }

    // 4. Google Sheets
    const gSheet = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/i);
    if (gSheet) {
      return `https://docs.google.com/spreadsheets/d/${gSheet[1]}/export?format=pdf`;
    }

    // 5. Canvas File URL dạng /files/12345
    const cFile = url.match(/\/files\/(\d+)/);
    if (cFile && !url.includes('/download')) {
      return canvasFileDownloadUrl(cFile[1]);
    }

    return url;
  }

  function cleanFilename(name, fallbackExt = '') {
    if (!name) return `tai_lieu_${Date.now()}${fallbackExt}`;
    let clean = name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim();
    if (fallbackExt && !/\.[a-zA-Z0-9]{2,5}$/i.test(clean)) {
      clean += fallbackExt;
    }
    return clean;
  }

  // Loại trừ các nút điều hướng chuyển trang như: Trước, Tiếp theo, Breadcrumbs, Menu
  function isNavigationOrUiLink(a) {
    if (!a) return true;
    if (a.closest('.module_sequence_footer, [class*="sequence_footer"], #breadcrumbs, .breadcrumb, #section-tabs, #left-side, #header, .al-dropdown, .header-bar')) {
      return true;
    }
    const text = a.textContent.trim().toLowerCase();
    if (/^(trước|tiếp theo|previous|next|quay lại|trở về|hủy|cancel)$/.test(text)) {
      return true;
    }
    if (a.matches('.module_sequence_footer_button--prev, .module_sequence_footer_button--next, .al-trigger, .publish-icon, .delete-item')) {
      return true;
    }
    return false;
  }

  // Trích xuất tất cả các link tải khả dụng từ nội dung HTML của một trang
  function extractDownloadableLinksFromDoc(doc, baseUrl = location.origin) {
    const results = [];
    const contentArea = doc.querySelector('.user_content, #assignment_show, .description, #wiki_page_show, .show-content, #content') || doc.body;
    if (!contentArea) return results;

    const candidateLinks = contentArea.querySelectorAll('a[href], iframe[src], embed[src]');

    for (const el of candidateLinks) {
      const rawHref = el.getAttribute('href') || el.getAttribute('src');
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) continue;
      if (isNavigationOrUiLink(el)) continue;

      const text = el.textContent.trim().replace(/\s+/g, ' ');

      // 1. Google Drive / Docs / Sheets / Slides
      if (/(?:drive|docs)\.google\.com/i.test(rawHref)) {
        const direct = convertToDirectDownloadUrl(rawHref);
        if (direct) {
          results.push({
            url: direct,
            filename: cleanFilename(text, direct.includes('drive.usercontent.google.com') ? '.pdf' : '')
          });
        }
        continue;
      }

      // 2. Canvas Files (/files/\d+)
      const fileMatch = rawHref.match(/\/files\/(\d+)/);
      if (fileMatch) {
        results.push({
          url: canvasFileDownloadUrl(fileMatch[1]),
          filename: cleanFilename(text)
        });
        continue;
      }

      // 3. File tài liệu (.pdf, .docx, .pptx, .xlsx, .zip, .rar, v.v.)
      if (/\.(pdf|docx?|pptx?|xlsx?|zip|rar|7z|txt|csv|tar|gz)($|\?)/i.test(rawHref)) {
        try {
          const fullUrl = new URL(rawHref, baseUrl).href;
          results.push({
            url: fullUrl,
            filename: cleanFilename(text)
          });
        } catch (e) {}
        continue;
      }

      // 4. Nút download của Canvas
      if (el.matches('.instructure_file_link, [download], .file_download_btn, .view_file_link') || /\/download($|\?)/i.test(rawHref)) {
        try {
          const fullUrl = new URL(rawHref, baseUrl).href;
          results.push({
            url: fullUrl,
            filename: cleanFilename(text)
          });
        } catch (e) {}
        continue;
      }
    }

    return results;
  }

  // -------------------------------------------------------------
  // 2. Prefetch API Modules để tăng tốc phân giải link
  // -------------------------------------------------------------
  async function prefetchModulesIfNeeded() {
    const courseId = getCourseId();
    if (!courseId || currentCourseId === courseId) return;
    currentCourseId = courseId;
    courseModulesCache.clear();

    try {
      const res = await fetch(`/api/v1/courses/${courseId}/modules?include[]=items&per_page=100`, {
        credentials: 'include'
      });
      if (!res.ok) return;
      const modules = await res.json();
      if (!Array.isArray(modules)) return;

      for (const mod of modules) {
        if (!Array.isArray(mod.items)) continue;
        for (const item of mod.items) {
          let direct = null;
          if (item.type === 'ExternalUrl' && item.external_url) {
            direct = convertToDirectDownloadUrl(item.external_url);
          } else if (item.type === 'File' && item.content_id) {
            direct = canvasFileDownloadUrl(item.content_id);
          }
          courseModulesCache.set(String(item.id), {
            id: item.id,
            title: item.title,
            type: item.type,
            externalUrl: item.external_url || null,
            directUrl: direct
          });
        }
      }
    } catch (e) {}
  }

  // -------------------------------------------------------------
  // 3. Phân giải Link tải thực tế cho Module Item / Bài tập
  // -------------------------------------------------------------
  async function resolveDownloadInfo(cb) {
    const direct = cb.dataset.url;
    const itemUrl = cb.dataset.itemUrl;
    const name = cb.dataset.name || 'Tài liệu';

    // 1. Đã có sẵn link trực tiếp
    if (direct && !direct.includes('/modules/items/') && !direct.includes('/assignments/')) {
      const converted = convertToDirectDownloadUrl(direct);
      return {
        url: converted,
        filename: cleanFilename(name, converted.includes('drive.usercontent.google.com') ? '.pdf' : '')
      };
    }

    // 2. Kiểm tra cache từ API modules
    const itemId = cb.dataset.id;
    if (itemId && courseModulesCache.has(String(itemId))) {
      const cached = courseModulesCache.get(String(itemId));
      if (cached && cached.directUrl) {
        return {
          url: cached.directUrl,
          filename: cleanFilename(cached.title || name, cached.externalUrl?.includes('drive.google.com') ? '.pdf' : '')
        };
      }
    }

    // 3. Fetch trang item / trang bài tập để trích xuất link tải
    const targetUrl = itemUrl || direct;
    if (targetUrl) {
      try {
        const res = await fetch(targetUrl, {
          credentials: 'include',
          headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml' }
        });

        // Nếu server redirect trực tiếp ra URL tải
        if (res.url && !res.url.includes('/modules/items/') && !res.url.includes('/assignments/')) {
          const directUrl = convertToDirectDownloadUrl(res.url);
          if (directUrl) {
            return {
              url: directUrl,
              filename: cleanFilename(name, directUrl.includes('drive.usercontent.google.com') ? '.pdf' : '')
            };
          }
        }

        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        // Trích xuất bằng hàm đa tầng nhận diện mọi loại nút / link
        const extracted = extractDownloadableLinksFromDoc(doc, targetUrl);
        if (extracted.length > 0) {
          return extracted[0];
        }

        // Ưu tiên regex Google Drive nếu thẻ a bị render qua JS
        const gdriveMatch = html.match(/https?:\/\/(?:drive|docs)\.google\.com\/[^\s"'>\\]+/i);
        if (gdriveMatch) {
          const cleanUrl = gdriveMatch[0].replace(/\\u0026/g, '&').replace(/&amp;/g, '&');
          const directUrl = convertToDirectDownloadUrl(cleanUrl);
          return { url: directUrl, filename: cleanFilename(name, '.pdf') };
        }

        const envMatch = html.match(/"EXTERNAL_URL"\s*:\s*"([^"]+)"/i) || html.match(/"external_url"\s*:\s*"([^"]+)"/i);
        if (envMatch) {
          const cleanUrl = envMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
          const directUrl = convertToDirectDownloadUrl(cleanUrl);
          return { url: directUrl, filename: cleanFilename(name, '.pdf') };
        }
      } catch (err) {
        console.warn('[UET Downloader] Lỗi phân giải item:', targetUrl, err);
      }
    }

    return null;
  }

  // -------------------------------------------------------------
  // 4. Kích hoạt tải (Qua Background Script & Tự động đóng tab)
  // -------------------------------------------------------------
  async function triggerDownload(url, filename) {
    if (!url) return false;

    // Gửi yêu cầu sang background.js để tải qua Downloads API hoặc mở tab tự đóng
    try {
      const res = await new Promise((resolve) => {
        api.runtime.sendMessage({ action: 'downloadFile', url, filename }, (response) => {
          if (api.runtime.lastError || !response || !response.success) {
            resolve(null);
          } else {
            resolve(response);
          }
        });
      });
      if (res && res.success) return true;
    } catch (e) {}

    // Fallback nếu không kết nối được background: mở tab và tự động đóng sau 3.5s
    try {
      const win = window.open(url, '_blank');
      if (win) {
        setTimeout(() => {
          try { if (!win.closed) win.close(); } catch (err) {}
        }, 3500);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // -------------------------------------------------------------
  // 5. Quản lý UI & Checkboxes
  // -------------------------------------------------------------
  function selected() {
    return [...document.querySelectorAll(`input.${CLS}:checked`)];
  }

  function updateBar() {
    const bar = document.getElementById(BAR_ID);
    if (!bar) return;
    const count = selected().length;
    const badge = bar.querySelector('.uetdl-badge');
    if (badge) {
      badge.textContent = count;
    }
  }

  function showToast(text, duration = 3000) {
    let toast = document.getElementById(TOAST_ID);
    if (toast) toast.remove();
    toast = document.createElement('div');
    toast.id = TOAST_ID;
    toast.className = 'uetdl-toast';
    toast.innerHTML = text;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast && toast.parentNode) toast.remove();
    }, duration);
  }

  function createCheckbox(name) {
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = CLS;
    cb.style.cssText =
      'width: 17px !important; height: 17px !important; margin: 0 10px 0 2px !important;' +
      'vertical-align: middle !important; cursor: pointer !important; accent-color: #0969da !important;' +
      'flex-shrink: 0 !important; display: inline-block !important; position: relative !important; z-index: 10 !important;';
    cb.title = `Chọn để tải: ${name}`;
    cb.addEventListener('click', e => e.stopPropagation());
    cb.addEventListener('change', updateBar);
    return cb;
  }

  function findTitleLink(row) {
    let a = row.querySelector('a.ig-title, a.title');
    if (a && a.textContent.trim()) return a;

    a = row.querySelector('a[href*="/modules/items/"], a[href*="/files/"], a[href*="drive.google.com"], a[href*="docs.google.com"], a[href*="/assignments/"], a[href*="/pages/"]');
    if (a && a.textContent.trim()) return a;

    const allLinks = row.querySelectorAll('a[href]');
    for (const link of allLinks) {
      if (isNavigationOrUiLink(link)) continue;
      const text = link.textContent.trim();
      if (text) return link;
    }
    return null;
  }

  function addCheckboxes() {
    prefetchModulesIfNeeded();

    // -------------------------------------------------------------
    // Bước 1: Quét tất cả hàng bài học trong Modules / Trang chủ
    // -------------------------------------------------------------
    const moduleRowSelectors = [
      'li[id^="context_module_item_"]',
      'li.context_module_item',
      'li.ig-row',
      'div.ig-row',
      '.context_module .ig-list > li',
      '.context_module ul > li',
      '#context_modules .ig-list > li',
      '#context_modules ul > li',
      '.item-group-condensed .ig-list > li',
      '.item-group-condensed ul > li'
    ];

    const moduleRows = document.querySelectorAll(moduleRowSelectors.join(', '));
    moduleRows.forEach(row => {
      if (row.querySelector(`.${CLS}`)) return;

      const titleLink = findTitleLink(row);
      if (!titleLink || isNavigationOrUiLink(titleLink)) return;

      const name = titleLink.textContent.trim();
      if (!name) return;

      const href = titleLink.getAttribute('href') || '';
      const itemId = moduleItemIdFromHref(href) || (row.id ? (row.id.match(/context_module_item_(\d+)/) || [])[1] : null);
      const fileId = fileIdFromHref(href);

      titleLink.dataset.uetdl = '1';
      const cb = createCheckbox(name);
      cb.dataset.name = name;

      if (itemId) {
        cb.dataset.type = 'module-item';
        cb.dataset.id = itemId;
        cb.dataset.itemUrl = titleLink.href;
      } else if (fileId) {
        cb.dataset.type = 'file';
        cb.dataset.id = fileId;
        cb.dataset.url = canvasFileDownloadUrl(fileId);
      } else {
        cb.dataset.type = 'link';
        cb.dataset.url = titleLink.href;
      }

      const icon = row.querySelector('.ig-type-icon, .type_icon, .module_item_icons, i[class*="icon-"], svg');
      if (icon && (icon.compareDocumentPosition(titleLink) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        icon.parentNode.insertBefore(cb, icon);
      } else {
        titleLink.parentNode.insertBefore(cb, titleLink);
      }
    });

    // -------------------------------------------------------------
    // Bước 2: Quét các link trong nội dung Bài tập, Trang tài liệu, Tab Tập tin
    // -------------------------------------------------------------
    const allLinks = document.querySelectorAll(
      '.user_content a[href], #assignment_show a[href], .description a[href], ' +
      '#content a[href*="/files/"], #content a[href*="drive.google.com"], #content a[href*="docs.google.com"], ' +
      '#content a.instructure_file_link, #content a[download]'
    );

    allLinks.forEach(a => {
      if (a.dataset.uetdl) return;
      if (a.closest(`#${BAR_ID}`)) return;
      if (isNavigationOrUiLink(a)) return;

      const href = a.getAttribute('href') || '';
      const fileId = fileIdFromHref(href);
      const itemId = moduleItemIdFromHref(href);
      const isDrive = /drive\.google\.com|docs\.google\.com/i.test(href);
      const isDoc = /\.(pdf|docx?|pptx?|xlsx?|zip|rar|7z|txt)($|\?)/i.test(href);
      const isFileLink = a.matches('.instructure_file_link, [download], .file_download_btn');

      if (!fileId && !itemId && !isDrive && !isDoc && !isFileLink) return;

      const name = a.textContent.trim();
      if (!name) return;

      if (a.parentElement && a.parentElement.querySelector(`.${CLS}`)) return;

      const uniqueId = itemId ? `m_${itemId}` : (fileId ? `f_${fileId}` : `d_${href}`);
      if (document.querySelector(`.${CLS}[data-uid="${uniqueId}"]`)) return;

      a.dataset.uetdl = '1';
      const cb = createCheckbox(name);
      cb.dataset.uid = uniqueId;
      cb.dataset.name = name;

      if (itemId) {
        cb.dataset.type = 'module-item';
        cb.dataset.id = itemId;
        cb.dataset.itemUrl = a.href;
      } else if (fileId) {
        cb.dataset.type = 'file';
        cb.dataset.id = fileId;
        cb.dataset.url = /\/download/.test(a.href) ? a.href : canvasFileDownloadUrl(fileId);
      } else {
        cb.dataset.type = isDrive ? 'drive' : 'direct';
        cb.dataset.url = a.href;
      }

      a.parentNode.insertBefore(cb, a);
    });

    // -------------------------------------------------------------
    // Bước 3: Thêm checkbox ở tiêu đề từng Chương / Module
    // -------------------------------------------------------------
    const moduleHeaders = document.querySelectorAll(
      '.context_module .ig-header, .context_module .header, ' +
      '.item-group-condensed .ig-header, .context_module div[class*="header"]'
    );
    moduleHeaders.forEach(header => {
      if (header.querySelector(`.${MOD_CLS}`)) return;
      const modContainer = header.closest('.context_module') || header.closest('.item-group-condensed') || header.parentElement;
      if (!modContainer) return;

      const modCb = document.createElement('input');
      modCb.type = 'checkbox';
      modCb.className = MOD_CLS;
      modCb.title = 'Chọn / Bỏ chọn toàn bộ bài học trong chương này';
      modCb.style.cssText =
        'width: 18px !important; height: 18px !important; margin: 0 10px 0 2px !important;' +
        'vertical-align: middle !important; cursor: pointer !important; accent-color: #0969da !important;' +
        'display: inline-block !important; position: relative !important; z-index: 10 !important;';

      modCb.addEventListener('click', e => e.stopPropagation());
      modCb.addEventListener('change', () => {
        const itemCbs = modContainer.querySelectorAll(`input.${CLS}`);
        itemCbs.forEach(c => (c.checked = modCb.checked));
        updateBar();
      });

      const titleEl = header.querySelector('.name, .title, .ig-header-title, h2, h3, span');
      if (titleEl) {
        titleEl.parentNode.insertBefore(modCb, titleEl);
      } else {
        header.insertBefore(modCb, header.firstChild);
      }
    });

    updateBar();
  }

  // -------------------------------------------------------------
  // 6. Thanh điều khiển nổi thiết kế mới - by HBM - Dawn
  // -------------------------------------------------------------
  function buildBar() {
    const oldBar = document.getElementById(BAR_ID);
    if (oldBar) oldBar.remove();

    const bar = document.createElement('div');
    bar.id = BAR_ID;
    bar.innerHTML =
      '<span class="uetdl-count">Đã chọn: <span class="uetdl-badge">0</span></span>' +
      '<button id="uetdl-btn-all" type="button" title="Chọn tất cả các mục trên trang">Chọn tất cả</button>' +
      '<button id="uetdl-btn-none" type="button" title="Bỏ chọn tất cả">Bỏ chọn</button>' +
      '<button id="uetdl-btn-dl" type="button" class="uetdl-btn-primary" title="Bắt đầu tải các mục đã chọn">Tải đã chọn</button>' +
      '<span class="uetdl-credit">by HBM - Dawn</span>';

    const btnAll = bar.querySelector('#uetdl-btn-all');
    const btnNone = bar.querySelector('#uetdl-btn-none');
    const btnDl = bar.querySelector('#uetdl-btn-dl');

    btnAll.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const allCbs = document.querySelectorAll(`input.${CLS}`);
      allCbs.forEach(c => (c.checked = true));
      document.querySelectorAll(`input.${MOD_CLS}`).forEach(c => (c.checked = true));
      updateBar();
    });

    btnNone.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const allCbs = document.querySelectorAll(`input.${CLS}`);
      allCbs.forEach(c => (c.checked = false));
      document.querySelectorAll(`input.${MOD_CLS}`).forEach(c => (c.checked = false));
      updateBar();
    });

    btnDl.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await downloadSelected(btnDl);
    });

    document.body.appendChild(bar);
    updateBar();

    // Kiểm tra và hiển thị nút cập nhật nếu có phiên bản mới trên GitHub
    api.storage.local.get('updateInfo', (data) => {
      if (data && data.updateInfo && data.updateInfo.hasUpdate) {
        showUpdateBadge(data.updateInfo);
      }
    });
  }

  function showUpdateBadge(info) {
    const bar = document.getElementById(BAR_ID);
    if (!bar || bar.querySelector('#uetdl-btn-update')) return;

    const btnUpdate = document.createElement('button');
    btnUpdate.id = 'uetdl-btn-update';
    btnUpdate.type = 'button';
    btnUpdate.className = 'uetdl-btn-update';
    btnUpdate.innerHTML = `🚀 Có bản v${info.newVersion}`;
    btnUpdate.title = `Đã có phiên bản mới v${info.newVersion} trên GitHub! Bấm để cập nhật.`;

    btnUpdate.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(info.repoUrl || 'https://github.com/hbminh2508-design/uet-downloader-pro', '_blank');
      showToast(`🚀 Hãy chạy file <b>cap-nhat.bat</b> trong thư mục extension để tự động cập nhật lên v${info.newVersion}!`, 5000);
    });

    const credit = bar.querySelector('.uetdl-credit');
    if (credit) {
      bar.insertBefore(btnUpdate, credit);
    } else {
      bar.appendChild(btnUpdate);
    }
  }

  // -------------------------------------------------------------
  // 7. Quy trình Tải nhiều File liên tiếp
  // -------------------------------------------------------------
  async function downloadSelected(btn) {
    const items = selected();
    if (!items.length) {
      showToast('⚠️ Bạn chưa chọn file hoặc bài giảng nào.');
      return;
    }

    btn.disabled = true;
    const originalText = btn.innerHTML;
    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const displayName = item.dataset.name || `Tài liệu ${i + 1}`;
      btn.textContent = `⏳ Đang lấy link ${i + 1}/${items.length}...`;

      try {
        const info = await resolveDownloadInfo(item);

        if (!info || !info.url) {
          console.warn('[UET Downloader] Không tìm thấy link tải cho:', displayName);
          skipCount++;
          showToast(`⏭️ Bỏ qua: "${displayName}" (không tìm thấy file)`, 2500);
          continue;
        }

        btn.textContent = `⬇ Đang tải ${i + 1}/${items.length}...`;

        // Kích hoạt tải qua background (với cơ chế tự đóng tab)
        await triggerDownload(info.url, info.filename);
        successCount++;

        // Giãn cách 1.2s để trình duyệt hoàn tất xử lý từng file
        await new Promise(r => setTimeout(r, 1200));
      } catch (err) {
        console.error('[UET Downloader] Lỗi khi tải:', displayName, err);
        skipCount++;
      }
    }

    btn.innerHTML = originalText;
    btn.disabled = false;

    if (successCount > 0) {
      showToast(`🎉 Đã tải hoàn tất <b>${successCount}/${items.length}</b> tài liệu!`);
    } else {
      showToast('⚠️ Không tải được tài liệu nào trong các mục đã chọn.');
    }
  }

  // -------------------------------------------------------------
  // 8. Bật / Tắt & Khởi tạo
  // -------------------------------------------------------------
  function enable() {
    buildBar();
    addCheckboxes();

    setTimeout(addCheckboxes, 300);
    setTimeout(addCheckboxes, 800);
    setTimeout(addCheckboxes, 1800);

    if (!observer) {
      observer = new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(addCheckboxes, 150);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    window.addEventListener('popstate', addCheckboxes);
    window.addEventListener('hashchange', addCheckboxes);
  }

  function disable() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    window.removeEventListener('popstate', addCheckboxes);
    window.removeEventListener('hashchange', addCheckboxes);

    document.querySelectorAll(`input.${CLS}`).forEach(c => c.remove());
    document.querySelectorAll(`input.${MOD_CLS}`).forEach(c => c.remove());
    document.querySelectorAll('a[data-uetdl]').forEach(a => delete a.dataset.uetdl);
    const bar = document.getElementById(BAR_ID);
    if (bar) bar.remove();
    const toast = document.getElementById(TOAST_ID);
    if (toast) toast.remove();
  }

  function apply(on) {
    on ? enable() : disable();
  }

  function init() {
    const storageGet = api.storage.local.get('enabled');
    if (storageGet && storageGet.then) {
      storageGet.then(r => {
        apply(r.enabled !== false);
      });
    } else {
      api.storage.local.get('enabled', r => {
        apply(r.enabled !== false);
      });
    }

    api.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.enabled !== undefined) {
          apply(changes.enabled.newValue !== false);
        }
        if (changes.updateInfo !== undefined && changes.updateInfo.newValue) {
          showUpdateBadge(changes.updateInfo.newValue);
        }
      }
    });
  }

  init();
})();
