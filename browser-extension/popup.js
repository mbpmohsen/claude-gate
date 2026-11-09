const checkbox = document.querySelector('#enabled');
chrome.storage.local.get('enabled').then(({ enabled }) => checkbox.checked = Boolean(enabled));
checkbox.addEventListener('change', async () => {
  const reply = await chrome.runtime.sendMessage({ type: 'set-enabled', enabled: checkbox.checked });
  if (!reply?.ok) checkbox.checked = !checkbox.checked;
});
