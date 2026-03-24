




    // Use same origin when served from backend (e.g. localhost:4000), else explicit API URL
    const API_BASE = (window.location.port === "4000" || window.location.hostname === "localhost")
      ? "/api"
      : "http://localhost:4000/api";

    // Token & auth (RBAC)
    function getHgToken() {
      try { return window.hgToken || localStorage.getItem('hgToken'); } catch (e) { return window.hgToken; }
    }
    function setHgToken(t) {
      window.hgToken = t;
      try { if (t) localStorage.setItem('hgToken', t); else localStorage.removeItem('hgToken'); } catch (e) {}
    }
    function apiHeaders() {
      var h = { 'Content-Type': 'application/json' };
      var t = getHgToken();
      if (t) h['Authorization'] = 'Bearer ' + t;
      return h;
    }
    (function restoreToken() { try { var t = localStorage.getItem('hgToken'); if (t) window.hgToken = t; } catch (e) {} })();

    // Simulated data generator (used when backend is not providing live streams)
    let hrData = [];
    let spo2Data = [];
    let currentHR = 78;
    let currentSpO2 = 97;
    let currentGSR = 485;
    let currentMotion = 2.3;
    let systemState = 0; // 0=Normal, 1=Warning, 2=Emergency

    // Initialize charts
    function initChart(canvasId, color) {
      const canvas = document.getElementById(canvasId);
      const ctx = canvas.getContext("2d");
      return {
        canvas, ctx, data: [], maxPoints: 50,
        addPoint: function (value) {
          this.data.push(value);
          if (this.data.length > this.maxPoints) this.data.shift();
          this.draw();
        },
        draw: function () {
          const width = this.canvas.width = this.canvas.offsetWidth;
          const height = this.canvas.height = this.canvas.offsetHeight;
          const ctx = this.ctx;
          ctx.clearRect(0, 0, width, height);
          if (this.data.length < 2) return;
          const max = Math.max(...this.data) * 1.1 || 100;
          const min = Math.min(...this.data) * 0.9 || 0;
          const range = max - min || 1;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          this.data.forEach((val, i) => {
            const x = (i / (this.data.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
          ctx.fillStyle = color + "20";
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();
          ctx.fill();
        }
      };
    }

    function initPieChart(canvasId) {
      const canvas = document.getElementById(canvasId);
      const ctx = canvas.getContext("2d");
      return {
        canvas, ctx,
        data: { normal: 75, warning: 20, emergency: 5 },
        update: function (normal, warning, emergency) {
          this.data = { normal, warning, emergency };
          this.draw();
        },
        draw: function () {
          const width = this.canvas.width = this.canvas.offsetWidth;
          const height = this.canvas.height = this.canvas.offsetHeight;
          const ctx = this.ctx;
          const centerX = width / 2;
          const centerY = height / 2;
          const radius = Math.min(width, height) / 2 - 10;
          ctx.clearRect(0, 0, width, height);
          const total = this.data.normal + this.data.warning + this.data.emergency;
          if (total === 0) return;
          let startAngle = -Math.PI / 2;
          const normalAngle = (this.data.normal / total) * 2 * Math.PI;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + normalAngle);
          ctx.closePath();
          ctx.fillStyle = "#10b981";
          ctx.fill();
          startAngle += normalAngle;
          const warningAngle = (this.data.warning / total) * 2 * Math.PI;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + warningAngle);
          ctx.closePath();
          ctx.fillStyle = "#f59e0b";
          ctx.fill();
          startAngle += warningAngle;
          const emergencyAngle = (this.data.emergency / total) * 2 * Math.PI;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + emergencyAngle);
          ctx.closePath();
          ctx.fillStyle = "#ef4444";
          ctx.fill();
        }
      };
    }

    const hrChart = initChart("hrChart", "#f59e0b");
    const spo2Chart = initChart("spo2Chart", "#0ea5e9");
    const alertChart = initPieChart("alertChart");

    var lastMlStressFetch = 0;
    async function fetchMlStress() {
      if (Date.now() - lastMlStressFetch < 10000) return;
      lastMlStressFetch = Date.now();
      try {
        var resp = await fetch(API_BASE + '/ml/stress-prediction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ heartRate: Math.round(currentHR), gsr: Math.round(currentGSR), motion: currentMotion })
        });
        if (!resp.ok) return;
        var data = await resp.json();
        var stressEl = document.getElementById('stressLevelText');
        var trendEl = document.getElementById('stressTrend');
        if (stressEl && data.level) stressEl.textContent = data.level.charAt(0).toUpperCase() + data.level.slice(1);
        if (trendEl && data.score != null) trendEl.textContent = 'ML score ' + (data.score * 100).toFixed(0) + '%';
      } catch (e) {}
    }

    // Generate realistic simulated data
    function generateSimulatedDataValues() {
      // Heart rate: 72-85 BPM with small variations
      currentHR += (Math.random() - 0.5) * 2;
      currentHR = Math.max(72, Math.min(85, currentHR));

      // SpO2: 96-98% with small variations
      currentSpO2 += (Math.random() - 0.5) * 0.5;
      currentSpO2 = Math.max(96, Math.min(98, currentSpO2));

      // GSR: 400-600 with variations
      currentGSR += (Math.random() - 0.5) * 20;
      currentGSR = Math.max(400, Math.min(600, currentGSR));

      // Motion: 1.0-5.0 m/s²
      currentMotion += (Math.random() - 0.5) * 0.3;
      currentMotion = Math.max(1.0, Math.min(5.0, currentMotion));
    }

    function updateUIFromData() {
      // Update displays
      if (document.getElementById("hrValue")) document.getElementById("hrValue").textContent = Math.round(currentHR);
      if (document.getElementById("spo2Value")) document.getElementById("spo2Value").textContent = Math.round(currentSpO2);
      var motionEl = document.getElementById("motionValue");
      if (motionEl) motionEl.textContent = currentMotion.toFixed(1);
      var motionLiveEl = document.getElementById("motionValueLive");
      if (motionLiveEl) motionLiveEl.textContent = currentMotion.toFixed(1);
      if (document.getElementById("patientTime")) document.getElementById("patientTime").textContent = new Date().toLocaleTimeString();
      
      var deviceStatusEl = document.getElementById("deviceStatus");
      if (deviceStatusEl) deviceStatusEl.textContent = "Good";
      var deviceTrendText = document.getElementById("deviceTrendText");
      if (deviceTrendText) deviceTrendText.textContent = "Device online";
      var hrTrend = document.getElementById("hrTrend");
      if (hrTrend) hrTrend.textContent = "Stable";
      
      if (document.getElementById("ml-currentHR")) document.getElementById("ml-currentHR").textContent = Math.round(currentHR);

      if (typeof fetchMlStress === 'function') fetchMlStress();

      // Update charts
      hrChart.addPoint(currentHR);
      spo2Chart.addPoint(currentSpO2);

      // Update system state badge and hero card colors
      updateSystemState();
    }

    window.hgSensorHistory = JSON.parse(localStorage.getItem('hg_sensor_history') || '[]');

    function recordSensorData() {
       const record = { timestamp: new Date().toISOString(), heartRate: Math.round(currentHR), spo2: Math.round(currentSpO2), motion: parseFloat(currentMotion.toFixed(2)) };
       window.hgSensorHistory.push(record);
       if (window.hgSensorHistory.length > 2000) window.hgSensorHistory.shift();
       localStorage.setItem('hg_sensor_history', JSON.stringify(window.hgSensorHistory));
    }
    
    window.exportSensorDataCSV = function() {
       if (!window.hgSensorHistory || window.hgSensorHistory.length === 0) { showNotification("No data to export", "warning"); return; }
       let csv = "Timestamp,HeartRate,SpO2,Motion\n";
       window.hgSensorHistory.forEach(r => { csv += `${r.timestamp},${r.heartRate},${r.spo2},${r.motion}\n`; });
       const blob = new Blob([csv], { type: 'text/csv' });
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.setAttribute('href', url);
       a.setAttribute('download', 'harmony_guardian_sensor_data.csv');
       document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    function updateSimulatedData() {
      generateSimulatedDataValues();
      updateUIFromData();
      recordSensorData();
    }

    function updateSystemState() {
      const systemStatus = document.getElementById("systemStatus");
      const vitalStatus = document.getElementById("vitalStatus");

      // Determine state based on values
      if (currentHR > 100 || currentSpO2 < 95 || currentGSR > 700) {
        systemState = 2; // Emergency
        systemStatus.textContent = "Emergency";
        systemStatus.className = "status-badge emergency";
        if (vitalStatus) { vitalStatus.textContent = "Emergency"; vitalStatus.style.background = "rgba(239, 68, 68, 0.15)"; vitalStatus.style.color = "#ef4444"; }
        setHeroCardColors('red');
      } else if (currentHR > 90 || currentSpO2 < 96 || currentGSR > 600) {
        systemState = 1; // Warning
        systemStatus.textContent = "Warning";
        systemStatus.className = "status-badge warning";
        if (vitalStatus) { vitalStatus.textContent = "Warning"; vitalStatus.style.background = "rgba(245, 158, 11, 0.15)"; vitalStatus.style.color = "#f59e0b"; }
        setHeroCardColors('yellow');
      } else {
        systemState = 0; // Normal
        systemStatus.textContent = "Normal";
        systemStatus.className = "status-badge normal";
        if (vitalStatus) { vitalStatus.textContent = "Normal"; vitalStatus.style.background = "rgba(16, 185, 129, 0.15)"; vitalStatus.style.color = "#10b981"; }
        setHeroCardColors('green');
      }
    }
    function setHeroCardColors(state) {
      ['hero-heart','hero-motion','hero-connectivity'].forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('hero-green','hero-yellow','hero-red');
        el.classList.add(state === 'red' ? 'hero-red' : state === 'yellow' ? 'hero-yellow' : 'hero-green');
      });
    }

    // Control buttons (only for device control groups: LED, Buzzer, Vibration)
    document.querySelectorAll(".control-group .control-btn").forEach(btn => {
      btn.addEventListener("click", async function () {
        const group = this.closest(".control-group");
        if (!group) return;
        group.querySelectorAll(".control-btn").forEach(b => { b.classList.remove("active"); });
        this.classList.add("active");
        const target = this.dataset.control || 'unknown';
        const value = this.dataset.value || this.textContent.trim().toLowerCase();
        try {
          await fetch(`${API_BASE}/control`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: `control:${target}`, value })
          });
        } catch (e) {
          console.warn('Control API failed, continuing in demo mode.');
        }
        showNotification(`${this.textContent} activated`);
      });
    });

    // Emergency buttons
    document.getElementById("emergencyBtn").addEventListener("click", async () => {
      try {
        await fetch(`${API_BASE}/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'emergency:help' })
        });
      } catch (e) {
        console.warn('Emergency API failed, demo mode only.');
      }
      showNotification("Emergency help activated!", "emergency");
      systemState = 2;
      updateSystemState();
    });

    document.getElementById("sosBtn").addEventListener("click", async () => {
      try {
        await fetch(`${API_BASE}/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'emergency:sos' })
        });
      } catch (e) {
        console.warn('SOS API failed, demo mode only.');
      }
      showNotification("SOS triggered!", "emergency");
      addAlert("SOS Activated", "Emergency button pressed", "emergency");
      systemState = 2;
      updateSystemState();
    });

    document.getElementById("fallBtn").addEventListener("click", async () => {
      try {
        await fetch(`${API_BASE}/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'emergency:fall' })
        });
      } catch (e) {
        console.warn('Fall API failed, demo mode only.');
      }
      showNotification("Fall detection triggered!", "emergency");
      addAlert("Fall Detected", "Motion threshold exceeded", "emergency");
      systemState = 2;
      updateSystemState();
    });

    document.getElementById("clearBtn").addEventListener("click", async () => {
      try {
        await fetch(`${API_BASE}/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'emergency:clear' })
        });
      } catch (e) {
        console.warn('Clear API failed, demo mode only.');
      }
      showNotification("Alert cleared", "success");
      systemState = 0;
      updateSystemState();
      document.getElementById("alertList").innerHTML = `
        <div class="alert-item">
          <div class="alert-time">${new Date().toLocaleTimeString()}</div>
          <div class="alert-message">All alerts cleared</div>
        </div>
      `;
    });

    window.hgAlerts = window.hgAlerts || [];
    function addAlert(type, message, severity) {
      var t = new Date().toLocaleTimeString();
      window.hgAlerts.unshift({ type: type, message: message, severity: severity || 'info', time: t });
      if (window.hgAlerts.length > 50) window.hgAlerts.pop();
      const alertList = document.getElementById("alertList");
      if (alertList) {
        const alert = document.createElement("div");
alert.className = "alert-item";
      alert.setAttribute('data-severity', severity || 'info');
      if (severity === "emergency") alert.style.borderLeft = "4px solid #ef4444";
      else if (severity === "warning") alert.style.borderLeft = "4px solid #f59e0b";
alert.innerHTML = '<div><div class="alert-time">' + t + '</div><div class="alert-message"><strong>' + type + ':</strong> ' + message + '</div><div class="alert-item-expand">' + (message || '') + '</div></div><button class="alert-action" onclick="event.stopPropagation()">View</button>';
      alert.onclick = function() { this.classList.toggle('expanded'); };
      alertList.insertBefore(alert, alertList.firstChild);
        if (alertList.children.length > 5) alertList.removeChild(alertList.lastChild);
      }
      var nd = document.getElementById('caregiver-notify-list');
      if (nd) renderNotifyList(nd);
      updateCaregiverAlertBadge();
    }
    function updateCaregiverAlertBadge() {
      var list = window.hgAlerts || [];
      var count = list.filter(function(a) { return a.severity === 'emergency' || a.severity === 'warning'; }).length;
      var badge = document.getElementById('caregiver-alert-badge-count');
      if (badge) {
        badge.textContent = count;
        badge.classList.toggle('zero', count === 0);
      }
    }
    function handleChildSelect(value) {
      var names = { child1: 'Alex (Primary)', child2: 'Jordan', child3: 'Sam' };
      showNotification('Now viewing: ' + (names[value] || value));
    }
    async function loadCaregiverSettings() {
      var token = getHgToken();
      if (!token) return;
      try {
        var resp = await fetch(API_BASE + '/users/me/settings', { headers: apiHeaders() });
        if (resp.ok) {
          var data = await resp.json();
          var el = document.getElementById('caregiver-display-name');
          if (el) el.value = data.displayName || '';
          el = document.getElementById('caregiver-email-readonly');
          if (el) el.textContent = data.email || '';
          el = document.getElementById('caregiver-email-alerts');
          if (el) el.checked = data.emailAlerts !== false;
          el = document.getElementById('caregiver-push-notifications');
          if (el) el.checked = data.pushNotifications !== false;
          el = document.getElementById('caregiver-threshold-warning');
          if (el) el.value = data.notificationThresholdWarning != null ? data.notificationThresholdWarning : 70;
          el = document.getElementById('caregiver-threshold-emergency');
          if (el) el.value = data.notificationThresholdEmergency != null ? data.notificationThresholdEmergency : 90;
          el = document.getElementById('caregiver-mfa-enabled');
          if (el) el.checked = data.mfaEnabled === true;
          el = document.getElementById('caregiver-data-consent');
          if (el) el.checked = data.dataSharingConsent !== false;
        }
        var devResp = await fetch(API_BASE + '/devices', { headers: apiHeaders() });
        var listEl = document.getElementById('caregiver-devices-list');
        if (listEl) {
          if (!devResp.ok) { listEl.innerHTML = '<li class="text-secondary">Unable to load devices.</li>'; }
          else {
            var devData = await devResp.json();
            var devices = devData.devices || [];
            listEl.innerHTML = devices.length ? devices.map(function(d) {
              return '<li><span>' + (d.name || d.id) + '</span><span class="text-secondary">' + (d.batteryLevel != null ? d.batteryLevel + '%' : '') + '</span><button type="button" class="control-btn outline" onclick="confirmDisconnectDevice(\'' + d.id + '\', \'caregiver\')">Disconnect</button></li>';
            }).join('') : '<li class="text-secondary">No linked devices.</li>';
          }
        }
        var sessResp = await fetch(API_BASE + '/users/me/sessions', { headers: apiHeaders() });
        var sessEl = document.getElementById('caregiver-sessions-list');
        if (sessEl) {
          if (sessResp.ok) {
            var sessData = await sessResp.json();
            var sessions = sessData.sessions || [];
            sessEl.innerHTML = sessions.length ? sessions.slice(0, 10).map(function(s) {
              return '<li>' + (s.createdAt ? new Date(s.createdAt).toLocaleString() : '') + '</li>';
            }).join('') : '<li class="text-secondary">No session history.</li>';
          } else sessEl.innerHTML = '<li class="text-secondary">Unable to load sessions.</li>';
        }
      } catch (e) {}
    }
    async function saveCaregiverSettings(e) {
      e.preventDefault();
      var msgEl = document.getElementById('caregiver-settings-msg');
      var token = getHgToken();
      if (!token) { if (msgEl) msgEl.textContent = 'Sign in to save settings.'; return false; }
      var payload = {
        displayName: (document.getElementById('caregiver-display-name') && document.getElementById('caregiver-display-name').value) ? document.getElementById('caregiver-display-name').value.trim() : '',
        emailAlerts: document.getElementById('caregiver-email-alerts') ? document.getElementById('caregiver-email-alerts').checked : true,
        pushNotifications: document.getElementById('caregiver-push-notifications') ? document.getElementById('caregiver-push-notifications').checked : true,
        notificationThresholdWarning: document.getElementById('caregiver-threshold-warning') ? parseInt(document.getElementById('caregiver-threshold-warning').value, 10) : 70,
        notificationThresholdEmergency: document.getElementById('caregiver-threshold-emergency') ? parseInt(document.getElementById('caregiver-threshold-emergency').value, 10) : 90,
        mfaEnabled: document.getElementById('caregiver-mfa-enabled') ? document.getElementById('caregiver-mfa-enabled').checked : false,
        dataSharingConsent: document.getElementById('caregiver-data-consent') ? document.getElementById('caregiver-data-consent').checked : true
      };
      try {
        var resp = await fetch(API_BASE + '/users/me/settings', { method: 'PUT', headers: apiHeaders(), body: JSON.stringify(payload) });
        if (msgEl) msgEl.textContent = resp.ok ? 'Saved.' : 'Save failed.';
        if (resp.ok) showNotification('Settings saved.');
      } catch (err) { if (msgEl) msgEl.textContent = 'Network error.'; }
      return false;
    }
    function confirmDisconnectDevice(deviceId, role) {
      if (!confirm('Disconnect this device? You can pair it again later.')) return;
      disconnectDevice(deviceId, role);
    }
    async function disconnectDevice(deviceId, role) {
      var token = getHgToken();
      if (!token) return;
      try {
        var resp = await fetch(API_BASE + '/devices/' + encodeURIComponent(deviceId) + '/disconnect', { method: 'POST', headers: apiHeaders() });
        if (resp.ok) {
          showNotification('Device disconnected.');
          if (role === 'caregiver') loadCaregiverSettings(); else loadUserSettings();
        } else showNotification('Failed to disconnect device.', 'warning');
      } catch (e) { showNotification('Network error.', 'warning'); }
    }
    async function changePassword(role) {
      var prefix = role === 'caregiver' ? 'caregiver' : 'user';
      var current = document.getElementById(prefix + '-current-password') ? document.getElementById(prefix + '-current-password').value : '';
      var newP = document.getElementById(prefix + '-new-password') ? document.getElementById(prefix + '-new-password').value : '';
      var newP2 = document.getElementById(prefix + '-new-password2') ? document.getElementById(prefix + '-new-password2').value : '';
      var msgEl = document.getElementById(prefix + '-password-msg');
      if (!current || !newP || !newP2) { if (msgEl) msgEl.textContent = 'Fill all password fields.'; return; }
      if (newP.length < 6) { if (msgEl) msgEl.textContent = 'New password must be at least 6 characters.'; return; }
      if (newP !== newP2) { if (msgEl) msgEl.textContent = 'New passwords do not match.'; return; }
      if (msgEl) msgEl.textContent = '';
      try {
        var resp = await fetch(API_BASE + '/users/me/change-password', { method: 'POST', headers: apiHeaders(), body: JSON.stringify({ currentPassword: current, newPassword: newP }) });
        var data = await resp.json().catch(function() { return {}; });
        if (resp.ok) { if (msgEl) msgEl.textContent = 'Password updated.'; document.getElementById(prefix + '-current-password').value = ''; document.getElementById(prefix + '-new-password').value = ''; document.getElementById(prefix + '-new-password2').value = ''; showNotification('Password updated.'); }
        else { if (msgEl) msgEl.textContent = data.error || 'Failed to change password.'; }
      } catch (e) { if (msgEl) msgEl.textContent = 'Network error.'; }
    }
    async function loadUserSettings() {
      var token = getHgToken();
      if (!token) return;
      try {
        var resp = await fetch(API_BASE + '/users/me/settings', { headers: apiHeaders() });
        if (resp.ok) {
          var data = await resp.json();
          var el = document.getElementById('user-display-name');
          if (el) el.value = data.displayName || '';
          el = document.getElementById('user-email-readonly');
          if (el) el.textContent = data.email || '';
          el = document.getElementById('user-email-alerts');
          if (el) el.checked = data.emailAlerts !== false;
          el = document.getElementById('user-push-notifications');
          if (el) el.checked = data.pushNotifications !== false;
          el = document.getElementById('user-threshold-warning');
          if (el) el.value = data.notificationThresholdWarning != null ? data.notificationThresholdWarning : 70;
          el = document.getElementById('user-threshold-emergency');
          if (el) el.value = data.notificationThresholdEmergency != null ? data.notificationThresholdEmergency : 90;
          el = document.getElementById('user-mfa-enabled');
          if (el) el.checked = data.mfaEnabled === true;
          el = document.getElementById('user-data-consent');
          if (el) el.checked = data.dataSharingConsent !== false;
        }
        var devResp = await fetch(API_BASE + '/devices', { headers: apiHeaders() });
        var listEl = document.getElementById('user-devices-list');
        if (listEl) {
          if (!devResp.ok) listEl.innerHTML = '<li class="text-secondary">Unable to load devices.</li>';
          else {
            var devData = await devResp.json();
            var devices = devData.devices || [];
            listEl.innerHTML = devices.length ? devices.map(function(d) {
              return '<li><span>' + (d.name || d.id) + '</span><button type="button" class="control-btn outline" onclick="confirmDisconnectDevice(\'' + d.id + '\', \'user\')">Disconnect</button></li>';
            }).join('') : '<li class="text-secondary">No linked devices.</li>';
          }
        }
        var sessResp = await fetch(API_BASE + '/users/me/sessions', { headers: apiHeaders() });
        var sessEl = document.getElementById('user-sessions-list');
        if (sessEl) {
          if (sessResp.ok) {
            var sessData = await sessResp.json();
            var sessions = sessData.sessions || [];
            sessEl.innerHTML = sessions.length ? sessions.slice(0, 10).map(function(s) {
              return '<li>' + (s.createdAt ? new Date(s.createdAt).toLocaleString() : '') + '</li>';
            }).join('') : '<li class="text-secondary">No session history.</li>';
          } else sessEl.innerHTML = '<li class="text-secondary">Unable to load sessions.</li>';
        }
      } catch (e) {}
    }
    async function saveUserSettings(e) {
      e.preventDefault();
      var msgEl = document.getElementById('user-settings-msg');
      var token = getHgToken();
      if (!token) { if (msgEl) msgEl.textContent = 'Sign in to save settings.'; return false; }
      var payload = {
        displayName: (document.getElementById('user-display-name') && document.getElementById('user-display-name').value) ? document.getElementById('user-display-name').value.trim() : '',
        emailAlerts: document.getElementById('user-email-alerts') ? document.getElementById('user-email-alerts').checked : true,
        pushNotifications: document.getElementById('user-push-notifications') ? document.getElementById('user-push-notifications').checked : true,
        notificationThresholdWarning: document.getElementById('user-threshold-warning') ? parseInt(document.getElementById('user-threshold-warning').value, 10) : 70,
        notificationThresholdEmergency: document.getElementById('user-threshold-emergency') ? parseInt(document.getElementById('user-threshold-emergency').value, 10) : 90,
        mfaEnabled: document.getElementById('user-mfa-enabled') ? document.getElementById('user-mfa-enabled').checked : false,
        dataSharingConsent: document.getElementById('user-data-consent') ? document.getElementById('user-data-consent').checked : true
      };
      try {
        var resp = await fetch(API_BASE + '/users/me/settings', { method: 'PUT', headers: apiHeaders(), body: JSON.stringify(payload) });
        if (msgEl) msgEl.textContent = resp.ok ? 'Saved.' : 'Save failed.';
        if (resp.ok) showNotification('Settings saved.');
      } catch (err) { if (msgEl) msgEl.textContent = 'Network error.'; }
      return false;
    }
    var adminChartsInited = false;
    function initAdminCharts() {
      if (adminChartsInited || typeof Chart === 'undefined') return;
      adminChartsInited = true;
      fetch(API_BASE + '/charts/activity-trend', { headers: apiHeaders() }).then(function(r) { return r.json(); }).then(function(data) {
        var canvas = document.getElementById('admin-chart-activity');
        if (!canvas || !data.series) return;
        new Chart(canvas.getContext('2d'), {
          type: 'bar',
          data: {
            labels: data.series.map(function(d) { return d.label; }),
            datasets: [{ label: 'Activity', data: data.series.map(function(d) { return d.value; }), backgroundColor: 'rgba(59, 130, 246, 0.6)' }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
      }).catch(function() {});
      fetch(API_BASE + '/charts/alert-distribution', { headers: apiHeaders() }).then(function(r) { return r.json(); }).then(function(data) {
        var canvas = document.getElementById('admin-chart-alerts');
        if (!canvas) return;
        new Chart(canvas.getContext('2d'), {
          type: 'doughnut',
          data: {
            labels: ['Normal', 'Warning', 'Emergency'],
            datasets: [{ data: [data.normal || 0, data.warning || 0, data.emergency || 0], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }).catch(function() {});
      var deviceCtx = document.getElementById('admin-chart-device');
      if (deviceCtx) {
        new Chart(deviceCtx.getContext('2d'), {
          type: 'bar',
          data: {
            labels: ['Device 1', 'Device 2', 'Device 3'],
            datasets: [{ label: 'Battery %', data: [85, 72, 90], backgroundColor: 'rgba(16, 185, 129, 0.6)' }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }
        });
      }
      var timeCtx = document.getElementById('admin-chart-time');
      if (timeCtx) {
        new Chart(timeCtx.getContext('2d'), {
          type: 'line',
          data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{ label: 'Alerts', data: [2, 1, 3, 5, 2, 4], borderColor: '#3b82f6', fill: false }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
      }
    }
    var userChartInited = false;
    function initUserChart() {
      if (userChartInited || typeof Chart === 'undefined') return;
      userChartInited = true;
      fetch(API_BASE + '/charts/stress-trend', { headers: apiHeaders() }).then(function(r) { return r.json(); }).then(function(data) {
        var canvas = document.getElementById('user-chart-trend');
        if (!canvas || !data.series) return;
        new Chart(canvas.getContext('2d'), {
          type: 'line',
          data: {
            labels: data.series.map(function(_, i) { return i; }),
            datasets: [{ label: 'Stress index', data: data.series.map(function(d) { return d.value; }), borderColor: '#14b8a6', fill: true, backgroundColor: 'rgba(20, 184, 166, 0.1)' }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
      }).catch(function() {});
    }
    function renderNotifyList(container) {
      if (!container) return;
      var list = window.hgAlerts || [];
      if (list.length === 0) {
        container.innerHTML = '<div class="notify-empty">No recent notifications</div>';
        return;
      }
      container.innerHTML = list.slice(0, 10).map(function(a) {
        return '<div class="notify-item"><div class="notify-time">' + a.time + '</div><div>' + (a.type + ': ' + a.message) + '</div></div>';
      }).join('');
    }
    function switchPanel(dashboardType, panelId, navEl) {
      var view = document.getElementById(dashboardType + '-dashboard');
      if (!view) return;
      view.querySelectorAll('.content-panel').forEach(function(p) { p.classList.remove('active'); });
      view.querySelectorAll('.sidebar .nav-item').forEach(function(n) { n.classList.remove('active'); });
      var panel = document.getElementById(panelId);
      if (panel) panel.classList.add('active');
      if (navEl) navEl.classList.add('active');
      else if (panelId && view) {
        var navMatch = view.querySelector('.nav-item[data-panel="' + panelId + '"]');
        if (navMatch) navMatch.classList.add('active');
      }
      if (panelId === 'caregiver-panel-alerts') {
        var fullList = document.getElementById('caregiver-full-alert-list');
        if (fullList) {
          var alerts = window.hgAlerts || [];
          if (alerts.length === 0) fullList.innerHTML = '<div class="notify-empty">No alerts yet</div>';
          else fullList.innerHTML = alerts.map(function(a) {
            var border = a.severity === 'emergency' ? '4px solid #ef4444' : a.severity === 'warning' ? '4px solid #f59e0b' : '';
            return '<div class="alert-item" style="border-left:' + border + '"><div class="alert-time">' + a.time + '</div><div class="alert-message"><strong>' + a.type + ':</strong> ' + a.message + '</div><button class="alert-action">View</button></div>';
          }).join('');
        }
      }
      if (panelId === 'admin-panel-settings') {
        var urlEl = document.getElementById('admin-dash-url');
        if (urlEl) urlEl.textContent = window.location.origin + '/';
      }
      if (panelId === 'caregiver-panel-settings') {
        loadCaregiverSettings();
      }
      if (panelId === 'user-panel-settings') {
        loadUserSettings();
      }
      if (panelId === 'admin-panel-overview') {
        if (typeof initAdminCharts === 'function') initAdminCharts();
      }
      if (panelId === 'user-panel-vitals') {
        if (typeof initUserChart === 'function') initUserChart();
      }
      if (panelId === 'user-panel-alerts') {
        var userList = document.getElementById('user-panel-alert-list');
        if (userList) {
          var uAlerts = window.hgAlerts || [];
          if (uAlerts.length === 0) userList.innerHTML = '<div class="alert-item"><div class="alert-time">—</div><div class="alert-message">No alerts</div></div>';
          else userList.innerHTML = uAlerts.map(function(a) {
            return '<div class="alert-item"><div class="alert-time">' + a.time + '</div><div class="alert-message">' + a.type + ': ' + a.message + '</div></div>';
          }).join('');
        }
      }
    }
    function handleCaregiverSearch(q) {
      q = (q || '').trim().toLowerCase();
      var panel = document.getElementById('caregiver-panel-dashboard');
      if (!panel) return;
      ['hero-status-row','live-alerts-split','trends-insights-row','quick-actions-bar'].forEach(function(className) {
        var section = panel.querySelector('.' + className);
        if (section) {
          var text = (section.textContent || '').toLowerCase();
          section.style.display = q === '' || text.indexOf(q) !== -1 ? '' : 'none';
        }
      });
    }
    function handleAdminSearch(q) {
      q = (q || '').trim().toLowerCase();
      var view = document.getElementById('admin-dashboard');
      if (!view) return;
      view.querySelectorAll('.admin-card, .user-row').forEach(function(el) {
        var text = (el.textContent || '').toLowerCase();
        el.style.display = q === '' || text.indexOf(q) !== -1 ? '' : 'none';
      });
      var tbody = document.getElementById('admin-children-table-body');
      if (tbody) tbody.querySelectorAll('tr').forEach(function(row) {
        var text = (row.textContent || '').toLowerCase();
        var search = (row.getAttribute('data-search') || '').toLowerCase();
        row.style.display = q === '' || text.indexOf(q) !== -1 || search.indexOf(q) !== -1 ? '' : 'none';
      });
    }
    var notifyDropdownOpen = null;
    function toggleNotifyDropdown(which) {
      var id = which + '-notify-dropdown';
      var dd = document.getElementById(id);
      if (!dd) return;
      if (notifyDropdownOpen === id) { dd.classList.remove('visible'); notifyDropdownOpen = null; return; }
      document.querySelectorAll('.notify-dropdown').forEach(function(d) { d.classList.remove('visible'); });
      renderNotifyList(dd.querySelector('[id$="-notify-list"]') || dd);
      dd.classList.add('visible');
      notifyDropdownOpen = id;
    }
    document.addEventListener('click', function(e) {
      if (notifyDropdownOpen && !e.target.closest('.header-notify-wrap')) {
        document.querySelectorAll('.notify-dropdown').forEach(function(d) { d.classList.remove('visible'); });
        notifyDropdownOpen = null;
      }
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeForgotPassword();
        document.querySelectorAll('.notify-dropdown').forEach(function(d) { d.classList.remove('visible'); });
        notifyDropdownOpen = null;
      }
    });
    function filterMainAlertList(filter, btn) {
      document.querySelectorAll('#alertList').forEach(function(list) {
        if (!list) return;
        list.querySelectorAll('.alert-item').forEach(function(item) {
          var sev = item.getAttribute('data-severity') || 'info';
          var show = filter === 'all' || filter === 'history' || (filter === 'active' && (sev === 'emergency' || sev === 'warning'));
          item.style.display = show ? '' : 'none';
        });
      });
      document.querySelectorAll('#caregiver-panel-dashboard .alert-tabs .tab-btn').forEach(function(b) { b.classList.remove('active'); });
      if (btn) btn.classList.add('active');
    }
    var caregiverAlertFilter = 'all';
    function filterCaregiverAlerts(filter, btn) {
      caregiverAlertFilter = filter;
      document.querySelectorAll('#caregiver-panel-alerts .tab-btn').forEach(function(b) { b.classList.remove('active'); });
      if (btn) btn.classList.add('active');
      var fullList = document.getElementById('caregiver-full-alert-list');
      if (!fullList) return;
      var alerts = window.hgAlerts || [];
      var list = filter === 'active' ? alerts.filter(function(a) { return a.severity === 'emergency' || a.severity === 'warning'; }) : filter === 'history' ? alerts : alerts;
      if (list.length === 0) fullList.innerHTML = '<div class="notify-empty">No alerts</div>';
      else fullList.innerHTML = list.map(function(a) {
        var border = a.severity === 'emergency' ? '4px solid #ef4444' : a.severity === 'warning' ? '4px solid #f59e0b' : '';
        return '<div class="alert-item" style="border-left:' + border + '"><div class="alert-time">' + a.time + '</div><div class="alert-message"><strong>' + a.type + ':</strong> ' + a.message + '</div><button class="alert-action">View</button></div>';
      }).join('');
    }

    function showNotification(message, type = "success") {
      const notification = document.createElement("div");
      notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === "emergency" ? "#ef4444" : type === "warning" ? "#f59e0b" : "#10b981"};
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
      `;
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }

    // Tab switching
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    let dataInterval = null;

    window.connectToDeviceIP = async function() {
      const ip = document.getElementById("device-ip-input").value.trim();
      if (!ip) {
        showNotification("Please enter a valid IP address or 'demo'", "warning");
        return;
      }
      showNotification("Connecting to " + ip + "...");
      const btn = document.getElementById("ip-connect-btn");
      if (btn) btn.textContent = "Connecting...";

      if (dataInterval) clearInterval(dataInterval);

      // Check if user entered "demo" to use the simulator
      if (ip.toLowerCase() === "demo") {
        setTimeout(() => {
          showNotification("Connected to simulator", "success");
          if (btn) btn.textContent = "Connected";
          // Initialize with some data points
          for (let i = 0; i < 20; i++) {
            hrChart.addPoint(75 + Math.random() * 5);
            spo2Chart.addPoint(96 + Math.random() * 2);
          }
          dataInterval = setInterval(updateSimulatedData, 1000);
          updateSimulatedData();
        }, 1000);
        return;
      }

      // Fetch from actual IP
      const url = ip.startsWith("http") ? ip : "http://" + ip;
      dataInterval = setInterval(async () => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.heartRate) currentHR = data.heartRate;
            if (data.spo2) currentSpO2 = data.spo2;
            if (data.motion) currentMotion = data.motion;
            
            updateUIFromData();
            recordSensorData();
            if (btn && btn.textContent !== "Connected") {
                showNotification("Connected successfully", "success");
                btn.textContent = "Connected";
            }
          }
        } catch (e) {
          console.error("Device fetch error", e);
          if (btn && btn.textContent !== "Error") {
              showNotification("Connection failed", "error");
              btn.textContent = "Error";
          }
        }
      }, 1000);
    };

    // Add CSS animations
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // --- Authentication: Login Dashboard → Caregiver / Admin / User ---
    let selectedRole = 'caregiver';

    function selectRole(element, role) {
      document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
      if (element) element.classList.add('active');
      selectedRole = role;
    }

    function setLoginError(msg) {
      var el = document.getElementById('login-error');
      if (!el) return;
      el.textContent = msg || '';
      el.classList.toggle('visible', !!msg);
      document.getElementById('login-email').classList.toggle('error', !!msg);
      document.getElementById('login-password').classList.toggle('error', !!msg);
    }

    function toggleLoginPassword() {
      var pw = document.getElementById('login-password');
      var btn = document.querySelector('.login-toggle-pw');
      if (!pw || !btn) return;
      if (pw.type === 'password') {
        pw.type = 'text';
        btn.setAttribute('aria-label', 'Hide password');
        btn.title = 'Hide password';
        btn.textContent = '🙈';
      } else {
        pw.type = 'password';
        btn.setAttribute('aria-label', 'Show password');
        btn.title = 'Show password';
        btn.textContent = '👁';
      }
    }

    function handleForgotPassword(e) {
      e.preventDefault();
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('forgot-password-modal').classList.add('visible');
      document.getElementById('forgot-password-error').textContent = '';
      document.getElementById('forgot-success-msg').style.display = 'none';
      document.getElementById('forgot-email').value = document.getElementById('login-email').value || '';
      setTimeout(function() { document.getElementById('forgot-email').focus(); }, 100);
    }
    function closeForgotPassword() {
      document.getElementById('forgot-password-modal').classList.remove('visible');
      document.getElementById('login-screen').style.display = 'flex';
    }
    function submitForgotPassword(e) {
      e.preventDefault();
      var emailEl = document.getElementById('forgot-email');
      var email = emailEl && emailEl.value ? emailEl.value.trim() : '';
      var errEl = document.getElementById('forgot-password-error');
      var successEl = document.getElementById('forgot-success-msg');
      var btn = document.getElementById('forgot-submit-btn');
      errEl.textContent = '';
      if (!email) {
        errEl.textContent = 'Please enter your email address.';
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errEl.textContent = 'Please enter a valid email address.';
        return false;
      }
      btn.disabled = true;
      btn.textContent = 'Sending...';
      setTimeout(function() {
        btn.disabled = false;
        btn.textContent = 'Send reset link';
        successEl.style.display = 'block';
        errEl.textContent = '';
        try { fetch(API_BASE + '/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }).catch(function() {}); } catch (x) {}
        setTimeout(closeForgotPassword, 2000);
      }, 800);
      return false;
    }
    var registerPendingEmail = '';
    var registerPendingCode = '';
    function showRegisterModal() {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('register-modal').classList.add('visible');
      document.getElementById('register-error').textContent = '';
      registerSetStep(1);
    }
    function closeRegisterModal() {
      document.getElementById('register-modal').classList.remove('visible');
      document.getElementById('login-screen').style.display = 'flex';
      registerPendingEmail = '';
      registerPendingCode = '';
    }
    function registerSetStep(step) {
      var s1 = document.getElementById('register-step-1');
      var s2 = document.getElementById('register-step-2');
      var s3 = document.getElementById('register-step-3');
      var d1 = document.getElementById('reg-step-dot-1');
      var d2 = document.getElementById('reg-step-dot-2');
      var d3 = document.getElementById('reg-step-dot-3');
      if (!s1 || !s2 || !s3) return;
      s1.style.display = step === 1 ? 'block' : 'none';
      s2.style.display = step === 2 ? 'block' : 'none';
      s3.style.display = step === 3 ? 'block' : 'none';
      d1.classList.toggle('active', step === 1); d1.classList.toggle('done', step > 1);
      d2.classList.toggle('active', step === 2); d2.classList.toggle('done', step > 2);
      d3.classList.toggle('active', step === 3); d3.classList.toggle('done', step > 2);
      document.getElementById('register-title').textContent = step === 1 ? 'Create account' : (step === 2 ? 'Verify your email' : 'All set');
      if (step === 2) {
        document.getElementById('register-verify-email').textContent = registerPendingEmail;
        var msg = document.getElementById('register-demo-code-msg');
        if (msg && registerPendingCode) msg.textContent = 'For demo, use this code: ' + registerPendingCode;
        document.getElementById('reg-code').value = '';
        document.getElementById('register-verify-error').textContent = '';
      }
    }
    async function performRegister(e) {
      e.preventDefault();
      var name = (document.getElementById('reg-name') && document.getElementById('reg-name').value) ? document.getElementById('reg-name').value.trim() : '';
      var email = (document.getElementById('reg-email') && document.getElementById('reg-email').value) ? document.getElementById('reg-email').value.trim() : '';
      var password = document.getElementById('reg-password') ? document.getElementById('reg-password').value : '';
      var password2 = document.getElementById('reg-password2') ? document.getElementById('reg-password2').value : '';
      var errEl = document.getElementById('register-error');
      var btn = document.getElementById('register-submit-btn');
      errEl.textContent = '';
      if (!email) { errEl.textContent = 'Email is required.'; return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEl.textContent = 'Please enter a valid email.'; return false; }
      if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return false; }
      if (password !== password2) { errEl.textContent = 'Passwords do not match.'; return false; }
      if (btn) btn.disabled = true;
      try {
        var resp = await fetch(API_BASE + '/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: name || undefined, role: selectedRole })
        });
        var data = await resp.json().catch(function() { return {}; });
        if (!resp.ok) { errEl.textContent = data.error || 'Registration failed.'; return; }
        if (data.verificationRequired && data.userId) {
          registerPendingEmail = data.email || email;
          registerPendingCode = data._demoCode || '';
          registerSetStep(2);
        } else {
          showNotification('Account created. You can sign in now.');
          closeRegisterModal();
          if (document.getElementById('login-email')) document.getElementById('login-email').value = email;
        }
      } catch (err) {
        console.warn('Registration via API failed, falling back to demo mode:', err.message);
        showNotification('Backend not available, using demo registration.', 'warning');
        registerPendingEmail = email;
        registerPendingCode = '123456';
        registerSetStep(2);
      } finally {
        if (btn) btn.disabled = false;
      }
    }
    async function performVerifyEmail(e) {
      e.preventDefault();
      var code = (document.getElementById('reg-code') && document.getElementById('reg-code').value) ? document.getElementById('reg-code').value.trim() : '';
      var errEl = document.getElementById('register-verify-error');
      var btn = document.getElementById('register-verify-btn');
      errEl.textContent = '';
      if (!code) { errEl.textContent = 'Enter the 6-digit code.'; return false; }
      if (btn) btn.disabled = true;
      try {
        var resp = await fetch(API_BASE + '/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: registerPendingEmail, code: code })
        });
        var data = await resp.json().catch(function() { return {}; });
        if (!resp.ok) { errEl.textContent = data.error || 'Invalid or expired code.'; return false; }
        registerSetStep(3);
        if (document.getElementById('login-email')) document.getElementById('login-email').value = registerPendingEmail;
      } catch (err) {
        console.warn('Verification via API failed, falling back to demo mode:', err.message);
        if (code !== '123456' && code !== registerPendingCode) {
          errEl.textContent = 'Invalid demo verification code.';
          return false;
        }
        registerSetStep(3);
        if (document.getElementById('login-email')) document.getElementById('login-email').value = registerPendingEmail;
      } finally {
        if (btn) btn.disabled = false;
      }
      return false;
    }

    async function performLogin(e) {
      if (e && e.preventDefault) e.preventDefault();
      var emailEl = document.getElementById('login-email');
      var passwordEl = document.getElementById('login-password');
      var submitBtn = document.getElementById('login-submit-btn');
      var email = (emailEl && emailEl.value) ? emailEl.value.trim() : '';
      var password = passwordEl ? passwordEl.value : '';

      setLoginError('');
      if (!email) {
        setLoginError('Please enter your email address.');
        if (emailEl) emailEl.focus();
        return false;
      }
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setLoginError('Please enter a valid email address.');
        if (emailEl) emailEl.focus();
        return false;
      }
      if (!password) {
        setLoginError('Please enter your password.');
        if (passwordEl) passwordEl.focus();
        return false;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
      }
      var remember = document.getElementById('login-remember');
      if (remember && remember.checked) {
        try { sessionStorage.setItem('hg_remember', '1'); localStorage.setItem('hg_remember_email', email); } catch (err) {}
      } else {
        try { localStorage.removeItem('hg_remember_email'); } catch (err) {}
      }

      var loginScreen = document.getElementById('login-screen');
      var caregiverView = document.getElementById('caregiver-dashboard');
      var adminView = document.getElementById('admin-dashboard');
      var userView = document.getElementById('user-dashboard');

      let apiRole = selectedRole;
      var loginSuccess = false;
      try {
        const resp = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role: selectedRole })
        });
        const data = await resp.json().catch(() => ({}));
        if (resp.status === 403) {
          if (data.code === 'EMAIL_NOT_VERIFIED') {
            setLoginError('Please verify your email before signing in. Open "Create account" and complete the verification step, or check your inbox for the code.');
          } else {
            setLoginError(data.error || 'This account cannot sign in with the selected role.');
          }
          if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove('loading'); }
          return false;
        }
        if (resp.status === 401) {
          setLoginError(data.error || 'Invalid email or password.');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove('loading'); }
          return false;
        }
        if (!resp.ok) {
          throw new Error(data.error || 'Login failed on server.');
        }
        setHgToken(data.token);
        window.hgUser = data.user || null;
        apiRole = data.user && data.user.role ? data.user.role : selectedRole;
        loginSuccess = true;
      } catch (err) {
        console.warn('Login via API failed, falling back to demo mode:', err.message);
        showNotification('Backend not available, using demo login.', 'warning');
        window.hgUser = null;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
        }
      }

      var displayName = (window.hgUser && window.hgUser.name) ? window.hgUser.name : (apiRole === 'admin' ? 'Administrator' : apiRole === 'caregiver' ? 'Caregiver' : 'Patient');
      if (apiRole !== 'admin' && apiRole !== 'caregiver' && apiRole !== 'user') apiRole = 'caregiver';

      loginScreen.style.display = 'none';
      caregiverView.style.display = 'none';
      adminView.style.display = 'none';
      userView.style.display = 'none';

      if (apiRole === 'admin') {
        adminView.style.display = 'block';
        adminView.style.opacity = '1';
        var adminNameEl = document.getElementById('admin-name');
        if (adminNameEl) adminNameEl.textContent = displayName;
        var dashUrlEl = document.getElementById('admin-dash-url');
        if (dashUrlEl) dashUrlEl.textContent = window.location.origin + '/';
        loadAdminStats();
        showNotification('Welcome back, ' + displayName);
      } else if (apiRole === 'caregiver') {
        caregiverView.style.display = 'block';
        caregiverView.style.opacity = '1';
        var caregiverNameEl = document.getElementById('caregiver-name');
        if (caregiverNameEl) caregiverNameEl.textContent = displayName;
        if (document.getElementById('caregiver-avatar')) document.getElementById('caregiver-avatar').textContent = '\uD83E\uDDD1\u200D\u2695\uFE0F';
        if (window.hgAlerts.length === 0) window.hgAlerts.push({ type: 'System', message: 'Initialized – all sensors operational', severity: 'info', time: new Date().toLocaleTimeString() });
        updateCaregiverAlertBadge();
        showNotification('Caregiver dashboard loaded');
      } else {
        userView.style.display = 'block';
        userView.style.opacity = '1';
        var userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = displayName;
        var welcomeName = document.getElementById('user-welcome-name');
        if (welcomeName) welcomeName.textContent = displayName;
        startUserDashboardSimulation();
        showNotification('Welcome, ' + displayName);
      }
      return false;
    }

    function loadAdminStats() {
      fetch(API_BASE + '/analytics/overview').then(function(r) { return r.ok ? r.json() : null; }).then(function(data) {
        if (!data) return;
        var el = document.getElementById('admin-devices');
        if (el) el.textContent = (data.activeDevices !== undefined ? data.activeDevices : 3);
        el = document.getElementById('admin-caregivers');
        if (el) el.textContent = (data.activeCaregivers !== undefined ? data.activeCaregivers : 12);
        el = document.getElementById('admin-patients');
        if (el) el.textContent = (data.activePatients !== undefined ? data.activePatients : 8);
        el = document.getElementById('admin-alerts');
        if (el) el.textContent = (data.alertsLast24h !== undefined ? data.alertsLast24h : 4);
        el = document.getElementById('admin-kpi-children');
        if (el) el.textContent = (data.activePatients !== undefined ? data.activePatients : 8);
      }).catch(function() {});
    }

    (function initLoginClearError() {
      var form = document.getElementById('login-form');
      if (!form) return;
      form.addEventListener('input', function() { setLoginError(''); });
    })();

    function logout() {
      if (typeof userSimInterval !== 'undefined' && userSimInterval) clearInterval(userSimInterval);
      setHgToken(null);
      window.hgUser = null;
      document.getElementById('welcome-page').style.display = 'block';
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('caregiver-dashboard').style.display = 'none';
      document.getElementById('admin-dashboard').style.display = 'none';
      document.getElementById('user-dashboard').style.display = 'none';
      showNotification('You have been signed out');
    }

    function showLoginFromWelcome() {
      document.getElementById('welcome-page').style.display = 'none';
      document.getElementById('login-screen').style.display = 'flex';
      document.getElementById('login-screen').style.opacity = '1';
      setLoginError('');
      try {
        var saved = localStorage.getItem('hg_remember_email');
        if (saved) { document.getElementById('login-email').value = saved; document.getElementById('login-remember').checked = true; }
      } catch (e) {}
      var pw = document.getElementById('login-password');
      if (pw && pw.type !== 'password') {
        pw.type = 'password';
        var btn = document.querySelector('.login-toggle-pw');
        if (btn) { btn.setAttribute('aria-label', 'Show password'); btn.title = 'Show password'; btn.textContent = '👁'; }
      }
    }

    function showWelcomeFromLogin() {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('welcome-page').style.display = 'block';
    }

    function showAddToHomeTip() {
      var msg = 'To install: open the browser menu (⋮) and choose "Add to Home screen" or "Install app".';
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) msg = 'To install: tap the Share button, then "Add to Home Screen".';
      showNotification(msg, 'success');
    }

    function subscribeNewsletter() {
      var el = document.getElementById('newsletter-email');
      var email = el && el.value ? el.value.trim() : '';
      if (!email) { showNotification('Please enter your email address.'); return; }
      showNotification('Thanks for subscribing! We\'ll send tips and updates to ' + email, 'success');
      if (el) el.value = '';
    }

    function resetCrisisChecklist() {
      [ 'c1', 'c2', 'c3', 'c4' ].forEach(function(id) {
        var c = document.getElementById(id);
        if (c) c.checked = false;
      });
      showNotification('Checklist reset.');
    }

    var stressMessages = {
      1: 'You\'re doing well. Keep a consistent routine and gentle movement if helpful.',
      2: 'Mild stress. Consider a short break, a drink of water, or a few minutes in a quiet space.',
      3: 'Moderate stress. Try the 1-Minute Breathing tool above, reduce stimulation, and reach out to someone you trust.',
      4: 'High stress. Pause if you can. Use breathing, a safe quiet space, and tell a caregiver or contact if needed.',
      5: 'Overwhelmed. Focus on safety first. Reduce stimulation, use one calming strategy, and contact a caregiver or crisis line (e.g. 988) if you need help.'
    };

    (function initWelcomeTools() {
      var scale = document.getElementById('stress-scale');
      if (scale) {
        scale.addEventListener('click', function(e) {
          var btn = e.target.closest('button[data-level]');
          if (!btn) return;
          scale.querySelectorAll('button').forEach(function(b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          var level = parseInt(btn.getAttribute('data-level'), 10);
          var result = document.getElementById('stress-result');
          if (result) {
            result.textContent = stressMessages[level] || '';
            result.classList.add('visible');
          }
        });
      }

      var breathingBtn = document.getElementById('breathing-btn');
      var breathingCircle = document.getElementById('breathing-circle');
      var breathingLabel = document.getElementById('breathing-label');
      if (breathingBtn && breathingCircle && breathingLabel) {
        var breathingTimer = null;
        breathingBtn.addEventListener('click', function() {
          if (breathingTimer) {
            clearInterval(breathingTimer);
            breathingTimer = null;
            breathingBtn.textContent = 'Start';
            breathingCircle.textContent = '1:00';
            breathingCircle.classList.remove('inhale', 'exhale');
            breathingLabel.textContent = 'Tap Start to begin';
            return;
          }
          var secs = 60;
          breathingBtn.textContent = 'Stop';
          function tick() {
            if (secs > 0) {
              var m = Math.floor(secs / 60);
              var s = secs % 60;
              breathingCircle.textContent = m + ':' + (s < 10 ? '0' : '') + s;
              var phase = Math.floor((60 - secs) / 4) % 2 === 0 ? 'in' : 'out';
              breathingCircle.classList.remove('inhale', 'exhale');
              if (phase === 'in') {
                breathingCircle.classList.add('inhale');
                breathingLabel.textContent = 'Breathe in...';
              } else {
                breathingCircle.classList.add('exhale');
                breathingLabel.textContent = 'Breathe out...';
              }
              secs--;
            } else {
              clearInterval(breathingTimer);
              breathingTimer = null;
              breathingBtn.textContent = 'Start';
              breathingCircle.textContent = '1:00';
              breathingCircle.classList.remove('inhale', 'exhale');
              breathingLabel.textContent = 'Well done. Take your time.';
            }
          }
          tick();
          breathingTimer = setInterval(tick, 1000);
        });
      }
    })();

    async function userTriggerSOS() {
      showNotification('Emergency help activated!', 'emergency');
      const list = document.getElementById('user-alert-list');
      try {
        await fetch(`${API_BASE}/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'patient:sos' })
        });
      } catch (e) {
        console.warn('User SOS API failed, demo mode only.');
      }
      if (list) {
        const item = document.createElement('div');
        item.className = 'alert-item';
        item.style.borderLeft = '4px solid #ef4444';
        item.innerHTML = '<div class="alert-time">' + new Date().toLocaleTimeString() + '</div><div class="alert-message"><strong>SOS:</strong> Emergency button pressed</div>';
        list.insertBefore(item, list.firstChild);
      }
    }

    let userSimInterval;
    function startUserDashboardSimulation() {
      if (userSimInterval) clearInterval(userSimInterval);
      let uHr = 78, uSpO2 = 97, uGsr = 485;
      function tick() {
        uHr += (Math.random() - 0.5) * 2;
        uHr = Math.max(70, Math.min(90, uHr));
        uSpO2 += (Math.random() - 0.5) * 0.5;
        uSpO2 = Math.max(95, Math.min(99, uSpO2));
        uGsr += (Math.random() - 0.5) * 15;
        uGsr = Math.max(400, Math.min(600, uGsr));
        const hrEl = document.getElementById('user-hr');
        const spo2El = document.getElementById('user-spo2');
        const gsrEl = document.getElementById('user-gsr');
        const badge = document.getElementById('user-status-badge');
        const vitalBadge = document.getElementById('user-vital-badge');
        if (hrEl) hrEl.textContent = Math.round(uHr);
        if (spo2El) spo2El.textContent = Math.round(uSpO2);
        if (gsrEl) gsrEl.textContent = Math.round(uGsr);
        if (badge && vitalBadge) {
          if (uHr > 100 || uSpO2 < 94) {
            badge.textContent = vitalBadge.textContent = 'Alert';
            badge.className = vitalBadge.className = 'status-badge emergency';
          } else if (uHr > 90 || uSpO2 < 96) {
            badge.textContent = vitalBadge.textContent = 'Warning';
            badge.className = vitalBadge.className = 'status-badge warning';
          } else {
            badge.textContent = vitalBadge.textContent = 'Normal';
            badge.className = vitalBadge.className = 'status-badge normal';
          }
        }
        var stressStat = document.getElementById('user-stat-stress');
        if (stressStat) stressStat.textContent = uGsr > 550 ? 'High' : uGsr > 480 ? 'Medium' : 'Low';
        var lastAct = document.getElementById('user-stat-last-activity');
        if (lastAct) lastAct.textContent = 'Just now';
        var actTime = document.getElementById('user-activity-time');
        if (actTime) actTime.textContent = new Date().toLocaleTimeString();
      }
      tick();
      userSimInterval = setInterval(tick, 1500);
    }

    // ML Dashboard Functions – use same origin when served from backend (localhost:4000)
    let mlApiBase = (window.location.port === '4000' || window.location.hostname === 'localhost') ? '' : (window.location.origin || 'http://localhost:4000');
    let mlPredictionHistory = [];
    let mlChartData = [];
    let mlChartCanvas, mlChartCtx;
    let mlPredictionCount = 0;

    function mlUpdateApiBase() {
      const input = document.getElementById('ml-apiBase');
      if (input) {
        var val = input.value.trim();
        mlApiBase = val || ((window.location.port === '4000' || window.location.hostname === 'localhost') ? '' : (window.location.origin || 'http://localhost:4000'));
        const statusEl = document.getElementById('ml-apiStatus');
        if (statusEl) statusEl.textContent = 'Updated';
        setTimeout(() => {
          mlCheckApiStatus();
          mlFetchMLPrediction();
        }, 500);
      }
    }

    async function mlCheckApiStatus() {
      try {
        const url = mlApiBase ? (mlApiBase + '/api/ping') : '/api/ping';
        const response = await fetch(url);
        const statusEl = document.getElementById('ml-apiStatus');
        if (statusEl) {
          if (response.ok) {
            statusEl.textContent = 'Connected';
            statusEl.style.color = '#10b981';
          } else {
            throw new Error('API not responding');
          }
        }
      } catch (e) {
        const statusEl = document.getElementById('ml-apiStatus');
        if (statusEl) {
          statusEl.textContent = 'Disconnected';
          statusEl.style.color = '#ef4444';
        }
      }
    }

    async function mlFetchLatestMeasurements() {
      try {
        const url = mlApiBase ? (mlApiBase + '/api/measurements/latest') : '/api/measurements/latest';
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const hrEl = document.getElementById('ml-currentHR');
          const gsrEl = document.getElementById('ml-currentGSR');
          const motionEl = document.getElementById('ml-currentMotion');
          const stepsEl = document.getElementById('ml-steps');
          const oxyEl = document.getElementById('ml-oxygenState');
          const panicEl = document.getElementById('ml-panic');
          const fallEl = document.getElementById('ml-fall');
          if (hrEl) hrEl.textContent = (data.heartRate || '--') + ' BPM';
          if (gsrEl) gsrEl.textContent = (data.gsr || '--');
          if (motionEl) motionEl.textContent = (data.motion || '--') + ' m/s²';
          if (stepsEl) stepsEl.textContent = (data.steps != null ? data.steps : '--');
          if (oxyEl) {
            const state = (data.oxygenState || '').toString().toLowerCase();
            let label = '--';
            if (state === 'normal') label = 'Normal';
            else if (state === 'low') label = 'Low';
            else if (state === 'critical') label = 'Critical';
            oxyEl.textContent = label + (data.spo2 ? ` (${data.spo2}%)` : '');
          }
          if (panicEl) panicEl.textContent = data.panic ? 'YES' : 'NO';
          if (fallEl) fallEl.textContent = data.fall ? 'YES' : 'NO';
          return data;
        }
      } catch (e) {
        console.error('Failed to fetch measurements:', e);
      }
      return null;
    }

    async function mlFetchMLPrediction() {
      try {
        const measurements = await mlFetchLatestMeasurements();
        if (!measurements) return;

        const url = mlApiBase ? (mlApiBase + '/api/ml/stress-prediction') : '/api/ml/stress-prediction';
        var headers = { 'Content-Type': 'application/json' };
        try {
          if (typeof getHgToken === 'function') {
            var t = getHgToken();
            if (t) headers['Authorization'] = 'Bearer ' + t;
          }
        } catch (e) {}
        const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            heartRate: measurements.heartRate || 75,
            gsr: measurements.gsr || 500,
            motion: measurements.motion || 2
          })
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            var apiStatusEl = document.getElementById('ml-apiStatus');
            if (apiStatusEl) {
              apiStatusEl.textContent = 'Sign in as caregiver/admin to use ML';
              apiStatusEl.style.color = '#f59e0b';
            }
            return;
          }
          throw new Error('Prediction failed');
        }

        const data = await response.json();
        mlPredictionCount++;
        
        const score = Math.round((data.score || 0) * 100);
        const level = data.level || 'low';
        const modelTypeEl = document.getElementById('ml-modelType');
        if (modelTypeEl) {
          const m = (data.model || '').toString().toLowerCase();
          modelTypeEl.textContent = m.includes('lstm') ? 'LSTM (trained)' : 'Rule-based (fallback)';
        }

        const scoreEl = document.getElementById('ml-stressScore');
        const progressEl = document.getElementById('ml-stressProgress');
        const levelEl = document.getElementById('ml-stressLevel');
        const countEl = document.getElementById('ml-predictionCount');
        const updateEl = document.getElementById('ml-lastUpdate');

        if (scoreEl) scoreEl.textContent = score + '%';
        if (progressEl) progressEl.style.width = score + '%';
        
        if (levelEl) {
          levelEl.textContent = level.toUpperCase();
          levelEl.className = 'ml-status-badge ml-level-' + level;
        }

        if (countEl) countEl.textContent = mlPredictionCount;
        if (updateEl) updateEl.textContent = new Date().toLocaleTimeString();

        const historyItem = {
          time: new Date(),
          score: score,
          level: level,
          features: data.features || {}
        };

        mlPredictionHistory.unshift(historyItem);
        if (mlPredictionHistory.length > 20) mlPredictionHistory.pop();

        mlChartData.push({ time: Date.now(), score: score });
        if (mlChartData.length > 60) mlChartData.shift();

        mlUpdateHistoryDisplay();
        mlUpdateChart();
      } catch (e) {
        console.error('ML prediction error:', e);
        const statusEl = document.getElementById('ml-apiStatus');
        if (statusEl) {
          statusEl.textContent = 'Error';
          statusEl.style.color = '#ef4444';
        }
      }
    }

    function mlUpdateHistoryDisplay() {
      const container = document.getElementById('ml-predictionHistory');
      if (!container) return;
      
      if (mlPredictionHistory.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No predictions yet</div>';
        return;
      }

      container.innerHTML = mlPredictionHistory.map(item => `
        <div class="ml-history-item">
          <div>
            <div class="ml-history-time">${item.time.toLocaleTimeString()}</div>
            <div class="ml-history-score">${item.score}%</div>
          </div>
          <span class="ml-history-level ml-level-${item.level}">${item.level.toUpperCase()}</span>
        </div>
      `).join('');
    }

    function mlUpdateChart() {
      if (!mlChartCtx) {
        mlChartCanvas = document.getElementById('ml-stressChart');
        if (!mlChartCanvas) return;
        mlChartCtx = mlChartCanvas.getContext('2d');
        mlChartCanvas.width = mlChartCanvas.offsetWidth;
        mlChartCanvas.height = mlChartCanvas.offsetHeight;
      }

      const ctx = mlChartCtx;
      const width = mlChartCanvas.width;
      const height = mlChartCanvas.height;
      const padding = 40;

      ctx.clearRect(0, 0, width, height);

      if (mlChartData.length < 2) return;

      const maxScore = 100;
      const minScore = 0;
      const range = maxScore - minScore;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;

      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.beginPath();

      mlChartData.forEach((point, index) => {
        const x = padding + (index / (mlChartData.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((point.score - minScore) / range) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
      ctx.beginPath();
      ctx.moveTo(padding, padding + chartHeight);
      mlChartData.forEach((point, index) => {
        const x = padding + (index / (mlChartData.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((point.score - minScore) / range) * chartHeight;
        ctx.lineTo(x, y);
      });
      ctx.lineTo(padding + chartWidth, padding + chartHeight);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Time', width / 2, height - 10);
      
      ctx.save();
      ctx.translate(15, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Stress Score (%)', 0, 0);
      ctx.restore();
    }

    function mlInitChart() {
      mlChartCanvas = document.getElementById('ml-stressChart');
      if (!mlChartCanvas) return;
      mlChartCtx = mlChartCanvas.getContext('2d');
      mlChartCanvas.width = mlChartCanvas.offsetWidth;
      mlChartCanvas.height = mlChartCanvas.offsetHeight;
      
      window.addEventListener('resize', () => {
        if (mlChartCanvas) {
          mlChartCanvas.width = mlChartCanvas.offsetWidth;
          mlChartCanvas.height = mlChartCanvas.offsetHeight;
          mlUpdateChart();
        }
      });
    }

    // Initialize ML Dashboard when #learn section is visible
    (function initMLDashboard() {
      function checkAndInit() {
        if (window.location.hash === '#learn' || document.getElementById('ml-stressChart')) {
          setTimeout(() => {
            mlCheckApiStatus();
            mlInitChart();
            setInterval(() => {
              mlFetchMLPrediction();
            }, 5000);
            mlFetchMLPrediction();
          }, 1000);
        }
      }
      checkAndInit();
      window.addEventListener('hashchange', checkAndInit);
    })();
  


    if(window.lucide) {
      lucide.createIcons();
    } else {
      setTimeout(() => window.lucide && lucide.createIcons(), 500);
    }
  

