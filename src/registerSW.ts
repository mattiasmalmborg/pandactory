// Service Worker Registration for PWA support

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

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
                showUpdateNotification();
              }
            });
          }
        });
      } catch {
        // Service Worker registration failed - ignore
      }
    });

    // Handle controller change (when new SW takes over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
}

function showUpdateNotification() {
  // Create update notification using safe DOM methods
  const notification = document.createElement('div');
  notification.id = 'sw-update-notification';

  const container = document.createElement('div');
  container.style.cssText = `
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
  `;

  const message = document.createElement('span');
  message.textContent = 'New version available!';
  container.appendChild(message);

  const updateBtn = document.createElement('button');
  updateBtn.textContent = 'Update';
  updateBtn.style.cssText = `
    background: white;
    color: #2d5016;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
  `;
  updateBtn.addEventListener('click', () => window.location.reload());
  container.appendChild(updateBtn);

  const laterBtn = document.createElement('button');
  laterBtn.textContent = 'Later';
  laterBtn.style.cssText = `
    background: transparent;
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
  `;
  laterBtn.addEventListener('click', () => notification.remove());
  container.appendChild(laterBtn);

  notification.appendChild(container);
  document.body.appendChild(notification);
}

// Unregister service worker (useful for development)
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }
}
