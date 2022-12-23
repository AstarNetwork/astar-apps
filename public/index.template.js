const SPLASH_MESSAGES = [
  "Go Decentralized",
  "Finding a Bootnode",
  "Establishing WSS Connection",
  "Redirect to a Full Node",
  "Syncing to the Relay Chain",
  "Syncing to the Parachain"
];

const TEXT_CHANGE_INTERVAL_MS = 5000;

function initSplashText() {
  let currentIndex = 0;
  document.getElementById('splash-text').innerHTML = SPLASH_MESSAGES[currentIndex];

  const intervalId = setInterval(() => {
    currentIndex = ++currentIndex % SPLASH_MESSAGES.length;
    const container = document.getElementById('splash-text')
    
    if (container) {
      container.innerHTML = SPLASH_MESSAGES[currentIndex];
    } else {
      clearInterval(intervalId);
    }
    
  }, TEXT_CHANGE_INTERVAL_MS);
}