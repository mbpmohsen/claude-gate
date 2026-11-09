const title = document.querySelector('#title');
const description = document.querySelector('#description');
const eyebrow = document.querySelector('#eyebrow');
const action = document.querySelector('#action');
const progress = document.querySelector('#progress');
const invoke = window.__TAURI__.core.invoke;

async function check() {
  action.hidden = true;
  progress.hidden = false;
  eyebrow.textContent = 'در حال بررسی اتصال';
  title.textContent = 'یک لحظه صبر کنید…';
  description.textContent = 'موقعیت IP عمومی شما بررسی می‌شود تا Claude در زمان مناسب باز شود.';
  try {
    const location = await invoke('check_location');
    progress.hidden = true;
    if (location === 'iran') {
      eyebrow.textContent = 'موقعیت شناسایی شد';
      title.textContent = 'لوکیشن شما ایران است';
      description.textContent = 'لطفاً VPN را روشن کنید، سپس دوباره بررسی کنید.';
      action.textContent = 'بررسی دوباره';
      action.hidden = false;
      return;
    }
    eyebrow.textContent = 'اتصال آماده است';
    title.textContent = 'در حال باز کردن Claude';
    description.textContent = 'تا چند لحظه دیگر اپلیکیشن نصب‌شدهٔ Claude باز می‌شود.';
    await invoke('open_claude');
    eyebrow.textContent = 'انجام شد';
    title.textContent = 'Claude باز شد';
    description.textContent = 'اپلیکیشن Claude Desktop اجرا شد.';
  } catch (error) {
    progress.hidden = true;
    eyebrow.textContent = 'بررسی ناموفق بود';
    title.textContent = 'اتصال را بررسی کنید';
    description.textContent = String(error);
    action.textContent = 'تلاش دوباره';
    action.hidden = false;
  }
}
action.addEventListener('click', check);
const settings = document.querySelector('#settings');
const webEnabled = document.querySelector('#web-enabled');
webEnabled.checked = localStorage.getItem('web-preference') === 'true';
webEnabled.addEventListener('change', () => localStorage.setItem('web-preference', String(webEnabled.checked)));
document.querySelector('#settings-open').addEventListener('click', () => settings.hidden = false);
document.querySelector('#settings-close').addEventListener('click', () => settings.hidden = true);
check();
