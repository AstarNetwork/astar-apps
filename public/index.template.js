const SPLASH_MESSAGES = [
  'Go Decentralized',
  'Finding a Bootnode',
  'Establishing WSS Connection',
  'Redirect to a Full Node',
  'Syncing to the Relay Chain',
  'Syncing to the Parachain',
];

const TEXT_CHANGE_INTERVAL_MS = 5000;

function initSplashText() {
  let currentIndex = 0;
  const textContainer = document.getElementById('splash-text');
  if (textContainer) {
    textContainer.innerHTML = SPLASH_MESSAGES[currentIndex];
  }

  if (!isLightClientConenction()) {
    document.getElementById('splash')?.remove();
    return;
  } else {
    document.getElementById('overlay')?.remove();
  }

  const intervalId = setInterval(() => {
    currentIndex = ++currentIndex % SPLASH_MESSAGES.length;
    const container = document.getElementById('splash-text');

    if (container) {
      container.innerHTML = SPLASH_MESSAGES[currentIndex];
    } else {
      // The container is removed by the portal app.
      clearInterval(intervalId);
    }
  }, TEXT_CHANGE_INTERVAL_MS);
}

function isLightClientConenction() {
  const endpoint = localStorage.getItem('selectedEndpoint');

  if (endpoint) {
    return endpoint.toString().includes('light://');
  }

  return false;
}
function handleResetConnection() {
  localStorage.removeItem('selectedEndpoint');
  window.location.reload();
}
