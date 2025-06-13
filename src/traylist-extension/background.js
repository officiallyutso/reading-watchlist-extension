chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'syncContent') {
        try {
            const stored = await chrome.storage.local.get(['pendingContent']);
            const pendingContent = stored.pendingContent || [];
            
            if (pendingContent.length > 0) {
                console.log('Syncing content:', pendingContent);
                
                await chrome.storage.local.set({ pendingContent: [] });
            }
        } catch (error) {
            console.error('Error syncing content:', error);
        }
    }
});


chrome.runtime.onInstalled.addListener(() => {
    console.log('Traylist extension installed');
});

chrome.action.onClicked.addListener((tab) => {
    chrome.action.openPopup();
});