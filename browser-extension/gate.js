const eyebrow = document.querySelector('#eyebrow');
const title = document.querySelector('#title');
const description = document.querySelector('#description');
const retry = document.querySelector('#retry');

async function country(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
    const data = await response.json();
    return typeof data.country_code === 'string' && data.country_code.length === 2 ? data.country_code.toUpperCase() : null;
  } catch { return null; }
  finally { clearTimeout(timer); }
}

async function check() {
  retry.hidden = true;
  eyebrow.textContent = 'بررسی موقعیت';
  title.textContent = 'یک لحظه صبر کنید…';
  description.textContent = 'IP عمومی شما پیش از باز شدن Claude بررسی می‌شود.';
  const results = await Promise.all([country('https://ipapi.co/json/'), country('https://ipwho.is/')]);
  if (results.includes('IR')) {
    eyebrow.textContent = 'موقعیت شناسایی شد';
    title.textContent = 'لوکیشن شما ایران است';
    description.textContent = 'لطفاً VPN را روشن کنید و دوباره بررسی کنید.';
    retry.hidden = false;
  } else if (results.some(Boolean)) {
    eyebrow.textContent = 'اتصال آماده است';
    title.textContent = 'در حال باز کردن Claude';
    const reply = await chrome.runtime.sendMessage({ type: 'continue' });
    if (reply?.ok) location.replace('https://claude.ai/');
    else showError();
  } else showError();
}
function showError() {
  eyebrow.textContent = 'بررسی ناموفق بود';
  title.textContent = 'اتصال را بررسی کنید';
  description.textContent = 'موقعیت IP مشخص نشد. دوباره تلاش کنید.';
  retry.hidden = false;
}
retry.addEventListener('click', check);
check();
