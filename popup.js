document.addEventListener('DOMContentLoaded', () => {
    const container = 'st-toggle-container';
    const storageName = 'ins-insider-logger';
    const storageGet = JSON.parse(localStorage.getItem(storageName) || '{}');
    const storageData = {
        'st-insider-logs': storageGet['st-insider-logs'] || false,
        'st-insider-background': storageGet['st-insider-background'] || '#4daf33',
        'st-insider-text': storageGet['st-insider-text'] || '#FFFFFF',
        'st-ga-logs': storageGet['st-ga-logs'] || false,
        'st-ga-background': storageGet['st-ga-background'] || '#f1f33f',
        'st-ga-text': storageGet['st-ga-text'] || '#FFFFFF',
        'st-srules-logs': storageGet['st-srules-logs'] || false,
        'st-srules-background': storageGet['st-srules-background'] || '#7f0bf3',
        'st-srules-text': storageGet['st-srules-text'] || '#FFFFFF'
    };
    const manualTrigger = {
        id: 'st-srules-trigger',
        checkbox: 'st-srules-logs'
    };

    const init = () => {
        setToggle();
        setEvents();
        sendStatus(storageData, storageName);
    };

    const setToggle = () => {
        Object.keys(storageData).forEach((current) => {
            if (typeof storageData[current] == 'boolean') {
                document.getElementById(current).checked = storageData[current];
            } else {
                document.getElementById(current).value = storageData[current];
            }
        });

        localStorage.setItem(storageName, JSON.stringify(storageData));
    };

    const setEvents = () => {
        document.getElementById(container).addEventListener('change', event => {
            storeToggle(event.target.id);
        });

        document.getElementById(manualTrigger.id).addEventListener('click', () => {
            document.getElementById(manualTrigger.checkbox).checked = true;
            storageData[manualTrigger.checkbox] = true;

            updateStatus()
            sendStatus(true, manualTrigger);
        })
    };

    const storeToggle = (element) => {
        if (storageData[element] !== undefined) {
            let currentElement = document.getElementById(element);

            storageData[element] = currentElement.type === 'checkbox' ?
                currentElement.checked : currentElement.value;

            updateStatus();
        }
    };

    const updateStatus = () => {
        localStorage.setItem(storageName, JSON.stringify(storageData));
        sendStatus(storageData, storageName);
    };

    const sendStatus = (status, name) => {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id, {
                    status: status,
                    name: name
                });
        });
    };

    init();
});