console.log('Auth sync script loaded on Traylist website');

function checkAndSyncAuth() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const authData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            accessToken: await user.getIdToken()
          };
          
          await chrome.storage.sync.set({ userAuth: authData });
          console.log('✅ Auth synced with extension:', authData);
          
          showNotification('Extension connected! You can now save content.');
        } else {
          await chrome.storage.sync.remove(['userAuth']);
          console.log('🚪 Auth cleared from extension');
        }
      } catch (error) {
        console.error('Error syncing auth:', error);
      }
    });
  } else {
    setTimeout(checkAndSyncAuth, 1000);
  }
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: system-ui;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    transition: all 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

checkAndSyncAuth();

window.addEventListener('message', (event) => {
  if (event.data.type === 'TRAYLIST_AUTH_SYNC') {
    checkAndSyncAuth();
  }
});