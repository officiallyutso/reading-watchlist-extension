chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'saveContent') {
        try {
            const { data } = request;
            const stored = await chrome.storage.local.get(['pendingContent']);
            const pendingContent = stored.pendingContent || [];
            
            pendingContent.push({
                ...data,
                addedDate: new Date().toISOString(),
                status: 'todo',
                progress: 0
            });
            
            await chrome.storage.local.set({ pendingContent });
            
            chrome.runtime.sendMessage({ action: 'syncContent' });
            
            sendResponse({ success: true });
        } catch (error) {
            console.error('Error in content script:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
});