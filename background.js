chrome.runtime.onInstalled.addListener(() => {
    console.log('Insider Logger extension running.');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const storageGet = JSON.parse(localStorage.getItem('ins-insider-logger') || '{}');

    if (message === 'ins-insider-logger') {
        sendResponse(storageGet);
    }
  });