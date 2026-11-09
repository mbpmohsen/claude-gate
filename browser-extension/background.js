const redirectRule = {
  id: 1, priority: 1,
  action: { type: 'redirect', redirect: { extensionPath: '/gate.html' } },
  condition: { regexFilter: '^https?://(www\\.)?claude\\.ai(/.*)?$', resourceTypes: ['main_frame'] }
};

async function setEnabled(enabled) {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1], addRules: enabled ? [redirectRule] : []
  });
  await chrome.storage.local.set({ enabled });
}

chrome.runtime.onInstalled.addListener(async () => {
  const { enabled = false } = await chrome.storage.local.get('enabled');
  await setEnabled(enabled);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'set-enabled') {
    setEnabled(Boolean(message.enabled)).then(() => sendResponse({ ok: true })).catch(e => sendResponse({ error: String(e) }));
    return true;
  }
  if (message.type === 'continue' && sender.tab?.id !== undefined) {
    const tabId = sender.tab.id;
    const ruleId = 100000 + tabId;
    chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [ruleId],
      addRules: [{ id: ruleId, priority: 2, action: { type: 'allow' }, condition: { tabIds: [tabId], regexFilter: '^https?://(www\\.)?claude\\.ai(/.*)?$', resourceTypes: ['main_frame'] } }]
    }).then(() => sendResponse({ ok: true })).catch(e => sendResponse({ error: String(e) }));
    return true;
  }
});

chrome.tabs.onRemoved.addListener(tabId => {
  chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [100000 + tabId] }).catch(() => {});
});
