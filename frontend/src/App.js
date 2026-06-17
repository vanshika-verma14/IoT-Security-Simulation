// frontend/src/App.js
import React, { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [devices, setDevices] = useState([]);
  const [attacks, setAttacks] = useState([]);
  const [security, setSecurity] = useState({});
  const [selectedAttack, setSelectedAttack] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [log, setLog] = useState([]);

  useEffect(() => {
    fetchDevices();
    fetchAttacks();
    fetchSecurity();
  }, []);

  const fetchDevices = async () => {
    const res = await fetch(`${API}/devices`);
    setDevices(await res.json());
  };

  const fetchAttacks = async () => {
    const res = await fetch(`${API}/attacks`);
    setAttacks(await res.json());
  };

  const fetchSecurity = async () => {
    const res = await fetch(`${API}/security`);
    setSecurity(await res.json());
  };

  const handleAttack = async () => {
    if (!selectedAttack || !selectedDevice) return;
    const res = await fetch(`${API}/attack`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attack: selectedAttack, target_id: Number(selectedDevice) }),
    });
    const result = await res.json();
    setLog((l) => [...l, result]);
    fetchDevices();
    fetchSecurity();
  };

  const toggleSecurity = async (key) => {
    const res = await fetch(`${API}/security/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: !security[key] }),
    });
    setSecurity(await res.json());
  };

  const getDeviceIcon = (type) => {
    const icons = {
      Camera: "📹",
      Thermostat: "🌡️",
      "Door Lock": "🔒",
      Light: "💡"
    };
    return icons[type] || "📱";
  };

  const getAttackIcon = (attack) => {
    const icons = {
      DDoS: "⚡",
      Spoofing: "🎭",
      Replay: "🔄"
    };
    return icons[attack] || "⚠️";
  };

  return (
    <div className="app">
      <div className="header">
        <h1>🛡️ IoT Security Simulation</h1>
        <p>Simulate and monitor security threats in your IoT network</p>
      </div>

      <div className="main-content">
        <div className="dashboard-grid">
          {/* Devices Section */}
          <div className="card devices-card">
            <div className="card-header">
              <h2>🏠 IoT Devices</h2>
              <div className="device-count">{devices.length} Devices</div>
            </div>
            <div className="devices-grid">
              {devices.map((d) => (
                <div key={d.id} className={`device-item ${d.status === "compromised" ? "compromised" : "online"}`}>
                  <div className="device-icon">{getDeviceIcon(d.type)}</div>
                  <div className="device-info">
                    <div className="device-name">{d.type}</div>
                    <div className="device-id">ID: {d.id}</div>
                    <div className={`device-status ${d.status}`}>
                      {d.status === "compromised" ? "🚨 Compromised" : "✅ Online"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Controls Section */}
          <div className="card security-card">
            <div className="card-header">
              <h2>🔐 Security Controls</h2>
              <div className="security-status">
                {security.firewall_enabled && security.anomaly_detection ? "🟢 All Systems Active" : "🟡 Partial Protection"}
              </div>
            </div>
            <div className="security-controls">
              <div className="control-item">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={security.firewall_enabled} 
                    onChange={() => toggleSecurity("firewall_enabled")} 
                  />
                  <span className="slider"></span>
                </label>
                <div className="control-info">
                  <div className="control-name">🛡️ Firewall</div>
                  <div className="control-desc">Blocks DDoS attacks</div>
                </div>
              </div>
              
              <div className="control-item">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={security.anomaly_detection} 
                    onChange={() => toggleSecurity("anomaly_detection")} 
                  />
                  <span className="slider"></span>
                </label>
                <div className="control-info">
                  <div className="control-name">🔍 Anomaly Detection</div>
                  <div className="control-desc">Detects suspicious behavior</div>
                </div>
              </div>
            </div>
          </div>

          {/* Attack Simulation Section */}
          <div className="card attack-card">
            <div className="card-header">
              <h2>⚔️ Attack Simulation</h2>
              <div className="attack-count">{attacks.length} Attack Types</div>
            </div>
            <div className="attack-controls">
              <div className="select-group">
                <label>Attack Type:</label>
                <select 
                  value={selectedAttack} 
                  onChange={e => setSelectedAttack(e.target.value)}
                  className="attack-select"
                >
                  <option value="">Select Attack</option>
                  {attacks.map(a => (
                    <option key={a.name} value={a.name}>
                      {getAttackIcon(a.name)} {a.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="select-group">
                <label>Target Device:</label>
                <select 
                  value={selectedDevice} 
                  onChange={e => setSelectedDevice(e.target.value)}
                  className="device-select"
                >
                  <option value="">Select Device</option>
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>
                      {getDeviceIcon(d.type)} {d.type} (ID: {d.id})
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={handleAttack} 
                className="attack-button"
                disabled={!selectedAttack || !selectedDevice}
              >
                🚀 Launch Attack
              </button>
            </div>
          </div>

          {/* Attack Log Section */}
          <div className="card log-card">
            <div className="card-header">
              <h2>📋 Attack Log</h2>
              <div className="log-count">{log.length} Events</div>
            </div>
            <div className="attack-log">
              {log.length === 0 ? (
                <div className="empty-log">No attacks launched yet</div>
              ) : (
                log.map((entry, i) => (
                  <div key={i} className={`log-entry ${entry.blocked ? 'blocked' : entry.detected ? 'detected' : 'succeeded'}`}>
                    <div className="log-icon">
                      {entry.blocked ? "🛡️" : entry.detected ? "⚠️" : "💥"}
                    </div>
                    <div className="log-content">
                      <div className="log-attack">
                        {getAttackIcon(entry.attack)} {entry.attack} on Device {entry.target_id}
                      </div>
                      <div className="log-status">
                        {entry.blocked ? "Blocked by Firewall" : entry.detected ? "Detected by Anomaly Detection" : "Attack Succeeded"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
