const injectScript = (type, event) => {
    const script = document.createElement('script');

    if (type) {
        const value = JSON.stringify(event.status);

        script.innerHTML = `localStorage.setItem("${event.name}", JSON.stringify(${value}))`;
    } else {
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', chrome.extension.getURL('system-rules.js'));
    }

    document.head.appendChild(script);
};

const logData = (type, event) => {
    const storageGet = JSON.parse(localStorage.getItem('ins-insider-logger') || '{}');
    const storageData = {
        'st-insider-logs': storageGet['st-insider-logs'] || false,
        'st-insider-background': storageGet['st-insider-background'] || '#4daf33',
        'st-insider-text': storageGet['st-insider-text'] || '#FFFFFF',
        'st-ga-logs': storageGet['st-ga-logs'] || false,
        'st-ga-background': storageGet['st-ga-background'] || '#f1f33f',
        'st-ga-text': storageGet['st-ga-text'] || '#FFFFFF'
    };
    const log = {
        prefix: {
            insider: '%cInsider Logs',
            ga: '%cInsider GA Logs'
        },
        style: 'font-weight: 500; padding: 0 5px 0 5px; font-size: 1.5em;'
    };
    let currentStyle = '';
    let currentContent = '';

    if (type === 'Insider' && storageData['st-insider-logs']) {
        const { campId, campaignId, varId, goalId, storyId, type, salesType, logType, goalType } = event.detail;

        currentStyle += log.style + 'background: ' + storageData['st-insider-background'] +
            '; color:' + storageData['st-insider-text'] + ';';

        if (!campId && !campaignId && !varId) {
            console.group(log.prefix.insider, currentStyle);
            console.table(event.detail);
            console.groupEnd();
    
            return;
        }

        currentContent += log.prefix.insider + ' - campaign-';

        if (varId) {
            currentContent += varId + ' ' + goalId + '-' + goalType;
        } else {
            currentContent += (campId || campaignId);
            currentContent += (storyId ? ' story-id-' + storyId : '');
            currentContent += ' ' + (type || salesType || logType);
        }

        console.log(currentContent, currentStyle);
    }

    if (type === 'GA' && storageData['st-ga-logs']) {
        if (!event.detail) {
            return false;
        }

        currentStyle += log.style + 'background: ' + storageData['st-ga-background'] +
            '; color:' + storageData['st-ga-text'] + ';';
    
        console.group(log.prefix.ga, currentStyle);
        console.table(event.detail);
        console.groupEnd();
    }
};

window.addEventListener('DOMContentLoaded', () => {
    injectScript(false, {});
});

window.addEventListener('log:sent', event => {
    logData('Insider', event);   
});

window.addEventListener('ga:log:before:sent', event => {
    logData('GA', event);
});

chrome.runtime.onMessage.addListener((event, sender, sendResponse) => {
    injectScript(true, event);
});

chrome.runtime.sendMessage('ins-insider-logger', (response) => {
    let currentData = {
        status: response,
        name: 'ins-insider-logger'
    };

    injectScript(true, currentData);
});