// SafeHer - Women's Safety App
// Complete Application Code

// App State
const state = {
  currentLink: "",
  currentPage: 'home',
  isDarkMode: false,
  emergencyContacts: [],
  userProfile: {
    name: 'User Name',
    bloodType: '',
    medicalInfo: ''
  },
  fakeCallActive: false,
  timerActive: false,
  timerEndsAt: null,
  timerNote: '',
  timerIntervalId: null,
  timerPreAlertId: null,
  sirenOn: false,
  shakeEnabled: false,
  pin: '',
  notificationsEnabled: false,
  incidentLog: [],
  media: {
    recorder: null,
    chunks: [],
    stream: null
  }
};

// DOM Elements
const elements = {
  location: document.getElementById('location'),
  themeToggle: document.getElementById('themeToggle'),
  emergencyBtn: document.getElementById('emergencyBtn'),
  pages: document.querySelectorAll('.page'),
  navItems: document.querySelectorAll('.nav-item'),
  contact1: document.getElementById('contact1'),
  phone1: document.getElementById('phone1'),
  contact2: document.getElementById('contact2'),
  phone2: document.getElementById('phone2'),
  profileName: document.getElementById('profileName'),
  bloodType: document.getElementById('bloodType'),
  medicalInfo: document.getElementById('medicalInfo'),
  displayBloodType: document.getElementById('displayBloodType'),
  displayMedicalInfo: document.getElementById('displayMedicalInfo'),
  fakeCallerName: document.getElementById('fakeCallerName'),
  callStatus: document.getElementById('callStatus'),
  answerCall: document.getElementById('answerCall'),
  declineCall: document.getElementById('declineCall'),
  callerName: document.getElementById('callerName'),
  timerMinutes: document.getElementById('timerMinutes'),
  timerNote: document.getElementById('timerNote'),
  startTimerBtn: document.getElementById('startTimerBtn'),
  cancelTimerBtn: document.getElementById('cancelTimerBtn'),
  timerDisplay: document.getElementById('timerDisplay'),
  toggleSirenBtn: document.getElementById('toggleSirenBtn'),
  installBtn: document.getElementById('installBtn'),
  shakeToggle: document.getElementById('shakeToggle'),
  startRecBtn: document.getElementById('startRecBtn'),
  stopRecBtn: document.getElementById('stopRecBtn'),
  saveRecLink: document.getElementById('saveRecLink'),
  pinInput: document.getElementById('pinInput'),
  notifToggle: document.getElementById('notifToggle'),
  incidentList: document.getElementById('incidentList'),
  pinModal: document.getElementById('pinModal'),
  pinEntry: document.getElementById('pinEntry'),
  pinSubmit: document.getElementById('pinSubmit'),
  pinCancel: document.getElementById('pinCancel')
};

// Initialize the app
function init() {
  loadState();
  setupEventListeners();
  updateLocation();
  setInterval(updateLocation, 10000); 
  updateUI();
  document.querySelector('.fake-call').style.display = 'none';
  if (elements.installBtn) elements.installBtn.addEventListener('click', installPWA);
  if (elements.startTimerBtn) elements.startTimerBtn.addEventListener('click', startSafetyTimer);
  if (elements.cancelTimerBtn) elements.cancelTimerBtn.addEventListener('click', cancelSafetyTimer);
  if (elements.toggleSirenBtn) elements.toggleSirenBtn.addEventListener('click', toggleSiren);
  if (elements.startRecBtn) elements.startRecBtn.addEventListener('click', startRecording);
  if (elements.stopRecBtn) elements.stopRecBtn.addEventListener('click', stopRecording);
  if (elements.pinSubmit) elements.pinSubmit.addEventListener('click', verifyPIN);
  if (elements.pinCancel) elements.pinCancel.addEventListener('click', () => hidePINModal());
  if (elements.shakeToggle) {
    const saved = localStorage.getItem('shakeEnabled');
    state.shakeEnabled = saved === 'true';
    elements.shakeToggle.checked = state.shakeEnabled;
    elements.shakeToggle.addEventListener('change', onShakeToggleChange);
  }
  if (elements.notifToggle) {
    elements.notifToggle.checked = state.notificationsEnabled;
    elements.notifToggle.addEventListener('change', onNotifToggleChange);
  }
  const title = document.querySelector('.app-title');
  if (title) setupLongPress(title, showPINModal);
  renderIncidentLog();
  setupShakeDetection();
}

// Load saved state from localStorage
function loadState() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
    state.isDarkMode = true;
    elements.themeToggle.innerHTML = '<i class="ti ti-moon"></i>';
  }

  const savedContacts = localStorage.getItem('emergencyContacts');
  if (savedContacts) {
    state.emergencyContacts = JSON.parse(savedContacts);
    if (state.emergencyContacts[0]) {
      elements.contact1.value = state.emergencyContacts[0].name || '';
      elements.phone1.value = state.emergencyContacts[0].phone || '';
    }
    if (state.emergencyContacts[1]) {
      elements.contact2.value = state.emergencyContacts[1].name || '';
      elements.phone2.value = state.emergencyContacts[1].phone || '';
    }
  }

  const savedProfile = localStorage.getItem('userProfile');
  if (savedProfile) {
    state.userProfile = JSON.parse(savedProfile);
    elements.profileName.value = state.userProfile.name;
    elements.bloodType.value = state.userProfile.bloodType;
    elements.medicalInfo.value = state.userProfile.medicalInfo;
    document.getElementById('userName').textContent = state.userProfile.name;
    elements.displayBloodType.textContent = state.userProfile.bloodType || '-';
    elements.displayMedicalInfo.textContent = state.userProfile.medicalInfo || '-';
  }

  const pin = localStorage.getItem('safeher_pin');
  if (pin) {
    state.pin = pin;
    if (elements.pinInput) elements.pinInput.value = '';
  }
  const notif = localStorage.getItem('safeher_notif');
  state.notificationsEnabled = notif === 'true';
  if (elements.notifToggle) elements.notifToggle.checked = state.notificationsEnabled;

  const savedLog = localStorage.getItem('safeher_incidents');
  if (savedLog) {
    try { state.incidentLog = JSON.parse(savedLog); } catch {}
  }
}

// Save state to localStorage
function saveState() {
  localStorage.setItem('darkMode', state.isDarkMode);
  localStorage.setItem('emergencyContacts', JSON.stringify(state.emergencyContacts));
  localStorage.setItem('userProfile', JSON.stringify(state.userProfile));
  localStorage.setItem('shakeEnabled', state.shakeEnabled);
  localStorage.setItem('safeher_pin', state.pin || '');
  localStorage.setItem('safeher_notif', state.notificationsEnabled ? 'true' : 'false');
  localStorage.setItem('safeher_incidents', JSON.stringify(state.incidentLog || []));
}

// Set up event listeners
function setupEventListeners() {
  elements.themeToggle.addEventListener('click', toggleTheme);
  
  elements.navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.getAttribute('data-page');
      navigateTo(page);
    });
  });

  elements.emergencyBtn.addEventListener('click', () => {
    if (state.emergencyContacts.length === 0) {
      navigateTo('emergency');
      alert('Please set up your emergency contacts first.');
    } else {
      sendEmergencyAlert();
    }
  });

  elements.answerCall.addEventListener('click', answerFakeCall);
  elements.declineCall.addEventListener('click', endFakeCall);
  elements.callerName.addEventListener('change', updateFakeCallerName);
}

// Toggle between light and dark theme
function toggleTheme() {
  state.isDarkMode = !state.isDarkMode;
  if (state.isDarkMode) {
    document.documentElement.classList.add('dark');
    elements.themeToggle.innerHTML = '<i class="ti ti-moon"></i>';
  } else {
    document.documentElement.classList.remove('dark');
    elements.themeToggle.innerHTML = '<i class="ti ti-sun"></i>';
  }
  saveState();
}

// Navigate between pages
function navigateTo(page) { 
  elements.pages.forEach(p => p.classList.remove('active'));
  document.getElementById(page).classList.add('active');
  
  elements.navItems.forEach(item => {
    if (item.getAttribute('data-page') === page) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  if (page === 'emergency') {
    updateLocation();
  }
  
  window.scrollTo(0, 0);
  state.currentPage = page;
}

// Update user's current location
function updateLocation() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(6);
      const lon = position.coords.longitude.toFixed(6);
      const timestamp = new Date().toLocaleTimeString();
      state.currentLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      
      if (elements.location) {
        elements.location.innerHTML = `
          <p><i class="ti ti-map-pin"></i> <b>Latitude:</b> ${lat}</p>
          <p><i class="ti ti-map-pin"></i> <b>Longitude:</b> ${lon}</p>
          <p><i class="ti ti-clock"></i> <b>Last Updated:</b> ${timestamp}</p>
          <a href="${state.currentLink}" target="_blank" class="btn btn-outline" style="margin-top: 0.75rem; display: inline-flex; align-items: center; gap: 0.5rem;">
            <i class="ti ti-map"></i> View on Google Maps
          </a>
        `;
      }
    },
    (error) => {
      let errorMessage = "❌ Location access denied. Please allow location.";
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = "❌ Location permission denied. Please enable it in your browser settings.";
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = "⚠️ GPS is turned off. Please enable your device's GPS to get your location.";
      }
      if (elements.location) {
        elements.location.innerHTML = `<p>${errorMessage}</p>`;
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

// Save emergency contacts
function saveContacts() {
  state.emergencyContacts = [];
  
  if (elements.contact1.value.trim() && elements.phone1.value.trim()) {
    state.emergencyContacts.push({
      name: elements.contact1.value.trim(),
      phone: elements.phone1.value.trim()
    });
  }
  
  if (elements.contact2.value.trim() && elements.phone2.value.trim()) {
    state.emergencyContacts.push({
      name: elements.contact2.value.trim(),
      phone: elements.phone2.value.trim()
    });
  }
  
  saveState();
  alert('Emergency contacts saved successfully!');
}

// Save user profile
function saveProfile() {
  state.userProfile = {
    name: elements.profileName.value.trim() || 'User Name',
    bloodType: elements.bloodType.value,
    medicalInfo: elements.medicalInfo.value.trim()
  };
  if (elements.pinInput && elements.pinInput.value.trim()) {
    const val = elements.pinInput.value.trim();
    if (/^\d{4}$/.test(val)) {
      state.pin = val;
    } else {
      alert('PIN must be 4 digits.');
      return;
    }
  }
  if (elements.notifToggle) {
    state.notificationsEnabled = !!elements.notifToggle.checked;
    if (state.notificationsEnabled && 'Notification' in window) {
      Notification.requestPermission().then(() => {});
    }
  }
  
  document.getElementById('userName').textContent = state.userProfile.name;
  elements.displayBloodType.textContent = state.userProfile.bloodType || '-';
  elements.displayMedicalInfo.textContent = state.userProfile.medicalInfo || '-';
  
  saveState();
  alert('Profile updated successfully!');
}

// Send emergency alert
function sendEmergencyAlert(silent = false) {
  if (state.emergencyContacts.length === 0) {
    alert('Please add at least one emergency contact first.');
    return;
  }
  
  if (!state.currentLink) {
    alert('Cannot determine your location. Please make sure location services are enabled.');
    return;
  }
  
  let message = `🚨 EMERGENCY ALERT!\n\n`;
  message += `${state.userProfile.name || 'User'} needs help NOW!\n\n`;
  message += `📍 Current Location: ${state.currentLink}\n`;
  if (state.timerNote) {
    message += `📝 Note: ${state.timerNote}\n`;
  }
  if (state.userProfile.bloodType) {
    message += `🩸 Blood Type: ${state.userProfile.bloodType}\n`;
  }
  if (state.userProfile.medicalInfo) {
    message += `💊 Medical Info: ${state.userProfile.medicalInfo}\n`;
  }
  message += `\nSent at: ${new Date().toLocaleString()}`;
  
  state.emergencyContacts.forEach(contact => {
    const whatsappLink = `https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
    
    const smsLink = `sms:${contact.phone.replace(/[^0-9+]/g, '')}?body=${encodeURIComponent(message)}`;
    window.open(smsLink, '_blank');
  });
  
  if (!silent) panicFeedback();
  logEvent('sos_sent', { contacts: state.emergencyContacts.length, link: state.currentLink });
  if (!silent) alert(`Emergency alert sent to ${state.emergencyContacts.length} contact(s)!`);
}

// Siren Functions
let sirenAudio; let webAudioCtx; let webGain; let webOsc1; let webOsc2; let webSirenTimer;

function toggleSiren() {
  if (state.pin && state.sirenOn) {
    showPINModal();
    return;
  }
  
  if (!state.sirenOn) {
    document.body.classList.add('flash');
    state.sirenOn = true;
    if (elements.toggleSirenBtn) elements.toggleSirenBtn.innerHTML = '<i class="ti ti-player-stop"></i> Stop Siren';
    ensureAudioReady().then(() => { startWebSiren(); }).catch(() => { startWebSiren(); });
    logEvent('siren_start');
  } else {
    stopSirenInternal();
  }
}

function stopSirenInternal() {
  try {
    state.sirenOn = false;
    document.body.classList.remove('flash');
    stopWebSiren();
  } finally {
    if (elements.toggleSirenBtn) elements.toggleSirenBtn.innerHTML = '<i class="ti ti-player-play"></i> Start Siren';
    logEvent('siren_stop');
  }
}

function ensureAudioReady() {
  try {
    if (!webAudioCtx) webAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {}
  if (!webAudioCtx) return Promise.resolve();
  const resumePromise = webAudioCtx.state === 'suspended' ? webAudioCtx.resume() : Promise.resolve();
  return resumePromise.then(() => {
    try {
      const buffer = webAudioCtx.createBuffer(1, 1, 22050);
      const src = webAudioCtx.createBufferSource();
      src.buffer = buffer;
      src.connect(webAudioCtx.destination);
      src.start(0);
    } catch (e) {}
  });
}

function startWebSiren() {
  try {
    if (!webAudioCtx) webAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (webAudioCtx.state === 'suspended') webAudioCtx.resume();

    webGain = webAudioCtx.createGain();
    webGain.gain.setValueAtTime(0.0001, webAudioCtx.currentTime);
    webGain.connect(webAudioCtx.destination);

    webOsc1 = webAudioCtx.createOscillator();
    webOsc2 = webAudioCtx.createOscillator();
    webOsc1.type = 'sawtooth';
    webOsc2.type = 'square';

    webOsc1.connect(webGain);
    webOsc2.connect(webGain);

    const lowFreq = 700;
    const highFreq = 1500;
    const segment = 0.4;

    webOsc1.frequency.setValueAtTime(lowFreq, webAudioCtx.currentTime);
    webOsc2.frequency.setValueAtTime(lowFreq + 5, webAudioCtx.currentTime);

    webOsc1.start();
    webOsc2.start();

    if (webSirenTimer) clearInterval(webSirenTimer);
    let up = true;
    webSirenTimer = setInterval(() => {
      const now = webAudioCtx.currentTime;
      const target = up ? highFreq : lowFreq;
      const target2 = up ? highFreq + 5 : lowFreq + 5;
      webOsc1.frequency.cancelScheduledValues(now);
      webOsc1.frequency.setValueAtTime(webOsc1.frequency.value, now);
      webOsc1.frequency.exponentialRampToValueAtTime(target, now + segment);

      webOsc2.frequency.cancelScheduledValues(now);
      webOsc2.frequency.setValueAtTime(webOsc2.frequency.value, now);
      webOsc2.frequency.exponentialRampToValueAtTime(target2, now + segment);

      webGain.gain.cancelScheduledValues(now);
      webGain.gain.setValueAtTime(0.001, now);
      webGain.gain.exponentialRampToValueAtTime(1.0, now + 0.06);
      webGain.gain.exponentialRampToValueAtTime(0.25, now + segment);

      up = !up;
    }, segment * 1000);
  } catch (e) {}
}

function stopWebSiren() {
  try {
    if (webSirenTimer) { clearInterval(webSirenTimer); webSirenTimer = null; }
    const now = webAudioCtx ? webAudioCtx.currentTime : 0;
    if (webGain && webAudioCtx) webGain.gain.setTargetAtTime(0.0001, now, 0.05);
    if (webOsc1) { webOsc1.stop(0); webOsc1.disconnect(); webOsc1 = null; }
    if (webOsc2) { webOsc2.stop(0); webOsc2.disconnect(); webOsc2 = null; }
    if (webGain) { webGain.disconnect(); webGain = null; }
  } catch (e) {}
}

// Shake Detection
function onShakeToggleChange(e) {
  const enabled = e.target.checked;
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission().then(response => {
      if (response === 'granted') {
        state.shakeEnabled = enabled;
        localStorage.setItem('shakeEnabled', state.shakeEnabled);
      } else {
        e.target.checked = false;
        state.shakeEnabled = false;
        localStorage.setItem('shakeEnabled', state.shakeEnabled);
        alert('Motion permission denied. Enable it in settings to use Shake-to-SOS.');
      }
    }).catch(() => {
      e.target.checked = false;
      state.shakeEnabled = false;
      localStorage.setItem('shakeEnabled', state.shakeEnabled);
    });
  } else {
    state.shakeEnabled = enabled;
    localStorage.setItem('shakeEnabled', state.shakeEnabled);
  }
}

let lastShakeTime = 0;
function setupShakeDetection() {
  if (!window || !('ondevicemotion' in window)) return;
  window.addEventListener('devicemotion', (event) => {
    if (!state.shakeEnabled) return;
    const a = event.accelerationIncludingGravity;
    if (!a) return;
    const g = Math.sqrt((a.x||0)*(a.x||0) + (a.y||0)*(a.y||0) + (a.z||0)*(a.z||0));
    const threshold = 22;
    const now = Date.now();
    if (g > threshold && (now - lastShakeTime) > 2000) {
      lastShakeTime = now;
      panicFeedback();
      sendEmergencyAlert();
    }
  });
}

// Set up fake call
function setupFakeCall() {
  const name = elements.callerName.value.trim() || 'Mom';
  elements.fakeCallerName.textContent = name;
  elements.callStatus.textContent = 'Incoming call...';
  
  document.querySelector('.fake-call').style.display = 'block';
  state.fakeCallActive = true;
  
  if ("vibrate" in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
  
  state.fakeCallTimeout = setTimeout(() => {
    if (state.fakeCallActive) {
      answerFakeCall();
    }
  }, 5000);
}

// New Feature Functions
function onNotifToggleChange(e) {
  state.notificationsEnabled = !!e.target.checked;
  saveState();
}

function setupLongPress(el, cb, ms = 800) {
  let t;
  const start = () => { t = setTimeout(cb, ms); };
  const clear = () => { if (t) clearTimeout(t); };
  el.addEventListener('mousedown', start);
  el.addEventListener('touchstart', start);
  el.addEventListener('mouseup', clear);
  el.addEventListener('mouseleave', clear);
  el.addEventListener('touchend', clear);
}

function showPINModal() {
  if (!elements.pinModal) { stopSirenInternal(); return; }
  elements.pinEntry.value = '';
  elements.pinModal.style.display = 'block';
}
function hidePINModal() {
  if (elements.pinModal) elements.pinModal.style.display = 'none';
}
function verifyPIN() {
  const val = elements.pinEntry ? elements.pinEntry.value.trim() : '';
  if (!state.pin || val === state.pin) {
    hidePINModal();
    stopSirenInternal();
    // Silent SOS on PIN verify
    if (state.emergencyContacts.length > 0) sendEmergencyAlert(true);
  } else {
    alert('Incorrect PIN');
  }
}

function logEvent(type, meta = {}) {
  const entry = { type, meta, at: new Date().toISOString(), loc: state.currentLink };
  state.incidentLog.unshift(entry);
  if (state.incidentLog.length > 200) state.incidentLog.pop();
  saveState();
  renderIncidentLog();
}

function renderIncidentLog() {
  if (!elements.incidentList) return;
  if (!state.incidentLog.length) { elements.incidentList.innerHTML = '<p>No incidents yet.</p>'; return; }
  elements.incidentList.innerHTML = state.incidentLog.map(e => `
    <div class="card" style="margin-bottom:.75rem;">
      <div><strong>${e.type}</strong> <small>${new Date(e.at).toLocaleString()}</small></div>
      ${e.loc ? `<div><a href="${e.loc}" target="_blank">Location</a></div>` : ''}
      ${e.meta && e.meta.note ? `<div>Note: ${e.meta.note}</div>`: ''}
    </div>
  `).join('');
}

async function startRecording() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Recording not supported on this device.');
      return;
    }
    elements.startRecBtn.disabled = true;
    elements.stopRecBtn.disabled = false;
    elements.saveRecLink.style.display = 'none';
    state.media.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.media.recorder = new MediaRecorder(state.media.stream);
    state.media.chunks = [];
    state.media.recorder.ondataavailable = e => { if (e.data.size > 0) state.media.chunks.push(e.data); };
    state.media.recorder.onstop = () => {
      const blob = new Blob(state.media.chunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      elements.saveRecLink.href = url;
      elements.saveRecLink.style.display = 'inline-block';
      elements.stopRecBtn.disabled = true;
      elements.startRecBtn.disabled = false;
      // stop tracks
      if (state.media.stream) state.media.stream.getTracks().forEach(t => t.stop());
    };
    state.media.recorder.start();
    logEvent('record_start');
  } catch (e) {
    alert('Mic permission denied.');
    elements.startRecBtn.disabled = false;
    elements.stopRecBtn.disabled = true;
  }
}

function stopRecording() {
  try {
    if (state.media.recorder && state.media.recorder.state !== 'inactive') {
      state.media.recorder.stop();
      logEvent('record_stop');
    }
  } catch (e) {}
}function startSafetyTimer() {
  clearTimeout(state.timerPreAlertId);
  const mins = parseFloat(elements.timerMinutes.value);
  if (!mins || mins < 0.5) return;
  state.timerNote = elements.timerNote.value.trim();
  const now = Date.now();
  state.timerEndsAt = now + mins * 60000;
  state.timerActive = true;
  if (elements.cancelTimerBtn) elements.cancelTimerBtn.disabled = false;
  if (elements.startTimerBtn) elements.startTimerBtn.disabled = true;
  if (state.timerIntervalId) clearInterval(state.timerIntervalId);
  // Pre-alert notification 10s before end
  if (state.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
    const preMs = Math.max(0, state.timerEndsAt - Date.now() - 10000);
    state.timerPreAlertId = setTimeout(() => {
      try { new Notification('SafeHer: Timer ending soon', { body: '10 seconds left to cancel.' }); } catch {}
    }, preMs);
  }
  state.timerIntervalId = setInterval(() => {
    if (!state.timerActive) return;
    const remaining = state.timerEndsAt - Date.now();
    if (remaining <= 0) {
      clearInterval(state.timerIntervalId);
      state.timerActive = false;
      if (elements.startTimerBtn) elements.startTimerBtn.disabled = false;
      if (elements.cancelTimerBtn) elements.cancelTimerBtn.disabled = true;
      if (elements.timerDisplay) elements.timerDisplay.textContent = 'Timer ended. Sending SOS...';
      sendEmergencyAlert();
      return;
    }
    updateTimerDisplay();
  }, 500);
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const remaining = Math.max(0, state.timerEndsAt - Date.now());
  const totalSeconds = Math.ceil(remaining / 1000);
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  if (elements.timerDisplay) elements.timerDisplay.textContent = `Time remaining: ${m}:${s}`;
}

function cancelSafetyTimer() {
  clearTimeout(state.timerPreAlertId);
  if (!state.timerActive) return;
  state.timerActive = false;
  clearInterval(state.timerIntervalId);
  if (elements.timerDisplay) elements.timerDisplay.textContent = `Timer canceled. Stay safe!`;
  if (elements.startTimerBtn) elements.startTimerBtn.disabled = false;
  if (elements.cancelTimerBtn) elements.cancelTimerBtn.disabled = true;
  elements.callStatus.textContent = 'Incoming call...';
  
  document.querySelector('.fake-call').style.display = 'block';
  state.fakeCallActive = true;
  
  if ("vibrate" in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
  
  state.fakeCallTimeout = setTimeout(() => {
    if (state.fakeCallActive) {
      answerFakeCall();
    }
  }, 5000);
}

// Answer fake call
function answerFakeCall() {
  if (!state.fakeCallActive) return;
  
  clearTimeout(state.fakeCallTimeout);
  elements.callStatus.textContent = 'Call in progress...';
  
  setTimeout(() => {
    elements.callStatus.innerHTML = 'Hello? Are you there?<br><small>2:34</small>';
  }, 1000);
  
  setTimeout(() => {
    endFakeCall();
  }, 30000);
}

// End fake call
function endFakeCall() {
  clearTimeout(state.fakeCallTimeout);
  state.fakeCallActive = false;
  elements.callStatus.textContent = 'Call ended';
  
  setTimeout(() => {
    document.querySelector('.fake-call').style.display = 'none';
  }, 2000);
}

// Update fake caller name
function updateFakeCallerName() {
  elements.fakeCallerName.textContent = this.value || 'Mom';
}

// Share app with friends
function shareApp() {
  const shareData = {
    title: 'SafeHer - Women Safety App',
    text: 'Check out this women safety app that can help in emergencies!',
    url: window.location.href
  };
  
  if (navigator.share) {
    navigator.share(shareData)
      .catch(error => console.log('Error sharing:', error));
  } else {
    const shareUrl = `whatsapp://send?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
    window.open(shareUrl, '_blank');
  }
}

// Provide haptic and audio feedback
function panicFeedback() {
  if ("vibrate" in navigator) {
    navigator.vibrate([200, 100, 200, 100, 200]);
  }
  
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
  audio.volume = 0.5;
  audio.play().catch(e => console.log('Audio play failed:', e));
}

// Update UI based on state
function updateUI() {
  elements.themeToggle.innerHTML = state.isDarkMode ? 
    '<i class="ti ti-moon"></i>' : 
    '<i class="ti ti-sun"></i>';
  if (elements.timerDisplay && state.timerActive) updateTimerDisplay();
  navigateTo(state.currentPage);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// Add to Home Screen prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallPromotion();
});

function showInstallPromotion() {
  if (elements.installBtn) elements.installBtn.style.display = 'block';
}

function installPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    deferredPrompt = null;
    if (elements.installBtn) elements.installBtn.style.display = 'none';
  });
}