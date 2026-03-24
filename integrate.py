import re
import os

filepath = 'C:/Users/HP/Documents/auto_zim/frontend/src/components/CaregiverDashboard.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
if 'import { useState, useEffect }' not in content:
    content = content.replace('import React from "react";', 'import React, { useState, useEffect } from "react";')

# Inject state and hooks inside the component
hook_code = """
  const [vitals, setVitals] = useState({ heartRate: '--', spo2: '--', motion: '--', gsr: '--', status: 'Loading...' });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/vitals');
        const data = await res.json();
        setVitals(data);
      } catch (err) {
        console.error('Failed to fetch vitals');
      }
    };
    
    const fetchAlerts = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/alerts');
        const data = await res.json();
        setAlerts(data);
      } catch (err) {
        console.error('Failed to fetch alerts');
      }
    };

    fetchVitals();
    fetchAlerts();
    const interval = setInterval(fetchVitals, 2000);
    return () => clearInterval(interval);
  }, []);
"""

# Find the component definition
content = re.sub(r'(export default function CaregiverDashboard\(\{.*?\}\) \{)', r'\1\n' + hook_code, content)

# Replace static values with state
content = re.sub(r'<span id="hrValue">--</span>', r'<span id="hrValue">{vitals.heartRate}</span>', content)
content = re.sub(r'<span id="motionValue">--</span>', r'<span id="motionValue">{vitals.motion}</span>', content)
content = re.sub(r'<strong id="motionValueLive">--</strong>', r'<strong id="motionValueLive">{vitals.motion}</strong>', content)
content = re.sub(r'<strong id="spo2Value">--</strong>', r'<strong id="spo2Value">{vitals.spo2}</strong>', content)
content = re.sub(r'<div class(?:Name)?="status-badge normal" id="systemStatus">Normal</div>', r'<div className="status-badge normal" id="systemStatus">{vitals.status}</div>', content)
content = re.sub(r'<span class(?:Name)?="card-badge" id="vitalStatus">Normal</span>', r'<span className="card-badge" id="vitalStatus">{vitals.status}</span>', content)

# Replace alert list with mapped alerts (simplification for the mock data)
alert_map_code = """
<div className="alert-list" id="alertList">
  {alerts.map(alert => (
    <div key={alert.id} className="alert-item" data-severity={alert.severity}>
      <div>
        <div className="alert-time">{alert.time}</div>
        <div className="alert-message">{alert.message}</div>
      </div>
      <button className="alert-action">View</button>
    </div>
  ))}
</div>
"""
content = re.sub(r'<div class(?:Name)?="alert-list" id="alertList">.*?</div>\s*</div>', alert_map_code + '\n        </div>', content, flags=re.DOTALL)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Integration complete.")
