const vastUrlInput = document.getElementById('vastUrl');
const vastXmlInput = document.getElementById('vastXml');
const corsProxyCheckbox = document.getElementById('corsProxy');
const proxyInput = document.getElementById('proxyUrl');
const loadUrlBtn = document.getElementById('loadUrlBtn');
const previewBtn = document.getElementById('previewBtn');
const adVideo = document.getElementById('adVideo');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const clearLogsBtn = document.getElementById('clearLogsBtn');
const adDetails = document.getElementById('adDetails');
const eventsList = document.getElementById('eventsList');
const consoleLogs = document.getElementById('consoleLogs');
const adStatus = document.getElementById('adStatus');
const duration = document.getElementById('duration');
const statusIndicator = document.getElementById('statusIndicator');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

let currentVastData = null;

function log(message, type = 'info') {
  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  const timestamp = new Date().toLocaleTimeString();
  entry.textContent = `[${timestamp}] ${message}`;
  consoleLogs.insertBefore(entry, consoleLogs.firstChild);
  if (consoleLogs.children.length > 100) consoleLogs.removeChild(consoleLogs.lastChild);
}

function addDetailItem(label, value) {
  const item = document.createElement('div');
  item.className = 'detail-item';
  item.innerHTML = `<div class="detail-label">${label}</div><div class="detail-value">${value || 'N/A'}</div>`;
  adDetails.appendChild(item);
}

function clearDetails() {
  adDetails.innerHTML = '';
}

function addEvent(event) {
  const entry = document.createElement('div');
  entry.className = 'log-entry log-success';
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${event}`;
  eventsList.insertBefore(entry, eventsList.firstChild);
  if (eventsList.children.length > 50) eventsList.removeChild(eventsList.lastChild);
}

function parseVAST(xmlString) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Invalid XML format');
    }

    clearDetails();
    eventsList.innerHTML = '';
    
    addDetailItem('VAST Version', xmlDoc.documentElement.getAttribute('version'));
    
    const ads = xmlDoc.getElementsByTagName('Ad');
    if (ads.length === 0) throw new Error('No Ad elements found');
    
    addDetailItem('Number of Ads', ads.length);
    
    const inlineAd = xmlDoc.querySelector('InLine');
    if (inlineAd) {
      const title = inlineAd.querySelector('AdTitle');
      const desc = inlineAd.querySelector('Description');
      const duration = inlineAd.querySelector('Duration');
      
      if (title) addDetailItem('Ad Title', title.textContent);
      if (desc) addDetailItem('Description', desc.textContent);
      if (duration) addDetailItem('Duration', duration.textContent);
    }
    
    const mediaFiles = xmlDoc.querySelectorAll('MediaFile');
    addDetailItem('Media Files', mediaFiles.length);
    mediaFiles.forEach((mf, idx) => {
      addDetailItem(`Media File ${idx + 1}`, mf.textContent.substring(0, 50) + '...');
    });

    const trackingEvents = xmlDoc.querySelectorAll('Tracking');
    addDetailItem('Tracking Events', trackingEvents.length);
    
    trackingEvents.forEach(event => {
      const eventType = event.getAttribute('event');
      addEvent(`Tracking: ${eventType}`);
    });

    const clickThrough = xmlDoc.querySelector('ClickThrough');
    if (clickThrough) {
      addDetailItem('Click Through URL', clickThrough.textContent);
    }

    statusIndicator.classList.add('active');
    adStatus.textContent = 'Ad loaded successfully';
    log('VAST parsed successfully', 'success');
    
    return xmlDoc;
  } catch (error) {
    log(`Parse error: ${error.message}`, 'error');
    adStatus.textContent = 'Error loading ad';
    statusIndicator.classList.remove('active');
    throw error;
  }
}

async function loadFromUrl() {
  const url = vastUrlInput.value.trim();
  if (!url) {
    log('Please enter a VAST URL', 'warning');
    return;
  }

  log(`Loading VAST from: ${url}`, 'info');
  
  try {
    let fetchUrl = url;
    if (corsProxyCheckbox.checked && proxyInput.value) {
      fetchUrl = proxyInput.value + encodeURIComponent(url);
      log(`Using proxy: ${proxyInput.value}`, 'info');
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const xmlText = await response.text();
    vastXmlInput.value = xmlText;
    parseVAST(xmlText);
  } catch (error) {
    log(`Fetch error: ${error.message}`, 'error');
  }
}

function loadPreview() {
  const xml = vastXmlInput.value.trim();
  if (!xml) {
    log('Please paste VAST XML or load from URL', 'warning');
    return;
  }

  try {
    currentVastData = parseVAST(xml);
    
    const mediaFiles = currentVastData.querySelectorAll('MediaFile');
    if (mediaFiles.length > 0) {
      const videoUrl = mediaFiles[0].textContent;
      if (videoUrl) {
        adVideo.src = videoUrl;
        addEvent('Video loaded and ready to play');
        log(`Video source set: ${videoUrl.substring(0, 50)}...`, 'success');
      }
    }
  } catch (error) {
    log(`Preview error: ${error.message}`, 'error');
  }
}

loadUrlBtn.addEventListener('click', loadFromUrl);
previewBtn.addEventListener('click', loadPreview);

playBtn.addEventListener('click', () => {
  if (adVideo.src) {
    adVideo.play();
    addEvent('Play triggered');
    log('Video playing', 'info');
  } else {
    log('No video loaded', 'warning');
  }
});

pauseBtn.addEventListener('click', () => {
  adVideo.pause();
  addEvent('Pause triggered');
  log('Video paused', 'info');
});

stopBtn.addEventListener('click', () => {
  adVideo.pause();
  adVideo.currentTime = 0;
  addEvent('Stop triggered');
  log('Video stopped', 'info');
});

clearBtn.addEventListener('click', () => {
  adVideo.src = '';
  adVideo.currentTime = 0;
  adStatus.textContent = 'No ad loaded';
  statusIndicator.classList.remove('active');
  clearDetails();
  vastXmlInput.value = '';
  adDetails.innerHTML = '<p class="placeholder">No ad loaded yet</p>';
  log('Preview cleared', 'info');
});

clearLogsBtn.addEventListener('click', () => {
  consoleLogs.innerHTML = '<p class="log-entry log-info">Console cleared</p>';
  eventsList.innerHTML = '<p class="placeholder">Events will appear here</p>';
  log('Logs cleared', 'info');
});

adVideo.addEventListener('loadedmetadata', () => {
  const minutes = Math.floor(adVideo.duration / 60);
  const seconds = Math.floor(adVideo.duration % 60);
  duration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

corsProxyCheckbox.addEventListener('change', () => {
  proxyInput.classList.toggle('hidden', !corsProxyCheckbox.checked);
});

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');
    
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

vastUrlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loadFromUrl();
});

log('VAST Preview Studio initialized', 'success');
log('Enter a VAST URL or paste XML to get started', 'info');
