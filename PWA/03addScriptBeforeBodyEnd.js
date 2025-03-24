// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
}





/////further functions:
// Add this to your existing script
function updateOnlineStatus() {
    const statusDisplay = document.createElement('div');
    statusDisplay.id = 'online-status';
    statusDisplay.style.position = 'fixed';
    statusDisplay.style.bottom = '10px';
    statusDisplay.style.right = '10px';
    statusDisplay.style.padding = '8px 12px';
    statusDisplay.style.borderRadius = '4px';
    statusDisplay.style.transition = 'opacity 0.3s';
    
    if (navigator.onLine) {
        statusDisplay.textContent = 'Online';
        statusDisplay.style.backgroundColor = '#4CAF50';
        statusDisplay.style.color = 'white';
        
        // Fade out after 3 seconds if online
        setTimeout(() => {
            statusDisplay.style.opacity = '0';
            setTimeout(() => {
                if (statusDisplay.parentNode) {
                    statusDisplay.parentNode.removeChild(statusDisplay);
                }
            }, 300);
        }, 3000);
    } else {
        statusDisplay.textContent = 'Offline - Using Cached Data';
        statusDisplay.style.backgroundColor = '#FF9800';
        statusDisplay.style.color = 'white';
    }
    
    // Remove existing status display if any
    const existingStatus = document.getElementById('online-status');
    if (existingStatus) {
        existingStatus.parentNode.removeChild(existingStatus);
    }
    
    document.body.appendChild(statusDisplay);
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial check
document.addEventListener('DOMContentLoaded', () => {
    updateOnlineStatus();
});



///install button
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Update UI to notify the user they can install the PWA
    const installButton = document.getElementById('installButton');
    installButton.style.display = 'inline-block';
    
    installButton.addEventListener('click', async () => {
        // Hide the app provided install promotion
        installButton.style.display = 'none';
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, discard it
        deferredPrompt = null;
    });
});

window.addEventListener('appinstalled', (evt) => {
    // Log install to analytics
    console.log('Task Manager was installed.');
});