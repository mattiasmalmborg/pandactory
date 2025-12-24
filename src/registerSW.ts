// Service Worker Registration for PWA support

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[App] Service Worker registered:', registration.scope);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('[App] New version available!');
                showUpdateNotification();
              }
            });
          }
        });
      } catch (error) {
        console.error('[App] Service Worker registration failed:', error);
      }
    });

    // Handle controller change (when new SW takes over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[App] Controller changed, reloading...');
      window.location.reload();
    });
  }
}

function showUpdateNotification() {
  // Create a simple update notification
  const notification = document.createElement('div');
  notification.id = 'sw-update-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #4a0e4e, #2d5016);
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      max-width: 90vw;
    ">
      <span>New version available!</span>
      <button onclick="window.location.reload()" style="
        background: white;
        color: #2d5016;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
      ">Update</button>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: transparent;
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
      ">Later</button>
    </div>
  `;
  document.body.appendChild(notification);
}

// Unregister service worker (useful for development)
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('[App] Service Workers unregistered');
  }
}
