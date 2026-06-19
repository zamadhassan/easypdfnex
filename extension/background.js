// EasyPDFNex Chrome Extension - Background Service Worker

const EASYPDFNEX_URL = 'https://easypdfnex.com/en';

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
    // Create main context menu item
    chrome.contextMenus.create({
        id: 'easypdfnex-open',
        title: 'Open with EasyPDFNex',
        contexts: ['link', 'page']
    });

    // Create submenu for specific tools
    chrome.contextMenus.create({
        id: 'easypdfnex-merge',
        parentId: 'easypdfnex-open',
        title: 'Merge PDFs',
        contexts: ['link', 'page']
    });

    chrome.contextMenus.create({
        id: 'easypdfnex-compress',
        parentId: 'easypdfnex-open',
        title: 'Compress PDF',
        contexts: ['link', 'page']
    });

    chrome.contextMenus.create({
        id: 'easypdfnex-convert',
        parentId: 'easypdfnex-open',
        title: 'Convert to PDF',
        contexts: ['link', 'page']
    });

    chrome.contextMenus.create({
        id: 'easypdfnex-all-tools',
        parentId: 'easypdfnex-open',
        title: 'All Tools →',
        contexts: ['link', 'page']
    });

    console.log('EasyPDFNex context menus created');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    let url = EASYPDFNEX_URL;

    switch (info.menuItemId) {
        case 'easypdfnex-merge':
            url = `${EASYPDFNEX_URL}/tools/merge-pdf`;
            break;
        case 'easypdfnex-compress':
            url = `${EASYPDFNEX_URL}/tools/compress-pdf`;
            break;
        case 'easypdfnex-convert':
            url = `${EASYPDFNEX_URL}/tools/jpg-to-pdf`;
            break;
        case 'easypdfnex-all-tools':
        case 'easypdfnex-open':
            url = EASYPDFNEX_URL;
            break;
        default:
            url = EASYPDFNEX_URL;
    }

    // Open EasyPDFNex in a new tab
    chrome.tabs.create({ url: url });
});

// Log when service worker starts
console.log('EasyPDFNex background service worker started');
