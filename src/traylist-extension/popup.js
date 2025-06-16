document.addEventListener('DOMContentLoaded', async () => {
    const titleInput = document.getElementById('title');
    const typeSelect = document.getElementById('type');
    const tagsInput = document.getElementById('tags');
    const notesInput = document.getElementById('notes');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const status = document.getElementById('status');
    const loginPrompt = document.getElementById('loginPrompt');
    const mainForm = document.getElementById('mainForm');
    const loginLink = document.getElementById('loginLink');
    
    const userAuth = await chrome.storage.sync.get(['userAuth']);
    console.log('Auth check:', userAuth);
    
    if (!userAuth.userAuth || !userAuth.userAuth.uid) {
        loginPrompt.style.display = 'block';
        mainForm.style.display = 'none';
        
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'https://traylist.vercel.app' });
            
            showStatus('After logging in, close and reopen this popup.', false);
        });
        
        const refreshBtn = document.createElement('button');
        refreshBtn.textContent = 'Refresh Auth Status';
        refreshBtn.className = 'login-link';
        refreshBtn.style.marginLeft = '10px';
        refreshBtn.addEventListener('click', () => {
            window.location.reload();
        });
        loginPrompt.appendChild(refreshBtn);
        
        return;
    }
    
    if (userAuth.userAuth.email) {
        const userInfo = document.createElement('div');
        userInfo.style.cssText = `
            font-size: 12px;
            color: #64748b;
            margin-bottom: 16px;
            padding: 8px;
            background: #f1f5f9;
            border-radius: 4px;
        `;
        userInfo.textContent = `Signed in as: ${userAuth.userAuth.email}`;
        document.querySelector('.header').after(userInfo);
    }
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    titleInput.value = tab.title || '';
    
    const url = tab.url;
    if (url.includes('youtube.com') || url.includes('vimeo.com')) {
        typeSelect.value = 'video';
    } else if (url.includes('medium.com') || url.includes('dev.to') || url.includes('blog')) {
        typeSelect.value = 'article';
    }
    
    function showStatus(message, isError = false) {
        status.textContent = message;
        status.className = `status ${isError ? 'error' : 'success'}`;
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
        }, 5000);
    }
    
    
    saveBtn.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        if (!title) {
            showStatus('Please enter a title', true);
            return;
        }
        
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
        
        try {
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'saveContent',
                data: {
                    title,
                    type: typeSelect.value,
                    tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean),
                    notes: notesInput.value.trim(),
                    url: tab.url,
                    userId: userAuth.userAuth.uid
                }
            });
            
            if (response && response.success) {
                showStatus('Content saved successfully!');
                setTimeout(() => window.close(), 2000);
            } else {
                throw new Error(response?.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error saving content:', error);
            showStatus('Error saving content. Please try again.', true);
        }
        
        saveBtn.textContent = 'Save to Traylist';
        saveBtn.disabled = false;
    });
    
    cancelBtn.addEventListener('click', () => {
        window.close();
        
    });
});