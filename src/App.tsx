import { useState, useEffect, useCallback } from 'react'
import './styles.css'

interface NotificationSettings {
  enabled: boolean
  startHour: number
  endHour: number
  frequency: number // notifications per hour
}

function App() {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('dreamcheck-settings')
    return saved ? JSON.parse(saved) : {
      enabled: false,
      startHour: 9,
      endHour: 22,
      frequency: 2
    }
  })
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [lastNotification, setLastNotification] = useState<Date | null>(null)
  const [floatingOrbs, setFloatingOrbs] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([])
  const [showDemo, setShowDemo] = useState(false)

  // Generate floating orbs
  useEffect(() => {
    const orbs = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 20 + Math.random() * 60,
      delay: Math.random() * 5
    }))
    setFloatingOrbs(orbs)
  }, [])

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted')
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('dreamcheck-settings', JSON.stringify(settings))
  }, [settings])

  const sendNotification = useCallback(() => {
    const messages = [
      "Is this a dream?",
      "Are you dreaming right now?",
      "Reality check: Is it a dream?",
      "Look around... is this real?",
      "Count your fingers. Is it a dream?",
      "Try to read something twice. Is it a dream?",
      "Check the time. Is it a dream?"
    ]
    const message = messages[Math.floor(Math.random() * messages.length)]

    if (Notification.permission === 'granted') {
      new Notification("💭 Dream Check", {
        body: message,
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌙</text></svg>",
        tag: 'dream-check',
        requireInteraction: false
      })
      setLastNotification(new Date())
    }
  }, [])

  // Schedule notifications
  useEffect(() => {
    if (!settings.enabled || !permissionGranted) return

    const checkAndNotify = () => {
      const now = new Date()
      const currentHour = now.getHours()

      if (currentHour >= settings.startHour && currentHour < settings.endHour) {
        sendNotification()
      }
    }

    // Calculate interval in milliseconds
    const intervalMinutes = 60 / settings.frequency
    const intervalMs = intervalMinutes * 60 * 1000

    const interval = setInterval(checkAndNotify, intervalMs)

    // Send initial notification if within active hours
    const now = new Date()
    const currentHour = now.getHours()
    if (currentHour >= settings.startHour && currentHour < settings.endHour) {
      const randomDelay = Math.random() * 60000 // Random delay up to 1 minute
      setTimeout(checkAndNotify, randomDelay)
    }

    return () => clearInterval(interval)
  }, [settings.enabled, settings.startHour, settings.endHour, settings.frequency, permissionGranted, sendNotification])

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setPermissionGranted(permission === 'granted')
      if (permission === 'granted') {
        setSettings(s => ({ ...s, enabled: true }))
      }
    }
  }

  const triggerDemo = () => {
    setShowDemo(true)
    sendNotification()
    setTimeout(() => setShowDemo(false), 3000)
  }

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h = hour % 12 || 12
    return `${h}:00 ${ampm}`
  }

  return (
    <div className="app">
      {/* Floating background orbs */}
      <div className="orbs-container">
        {floatingOrbs.map(orb => (
          <div
            key={orb.id}
            className="floating-orb"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: orb.size,
              height: orb.size,
              animationDelay: `${orb.delay}s`
            }}
          />
        ))}
      </div>

      {/* Aurora gradient overlay */}
      <div className="aurora" />

      {/* Main content */}
      <main className="main-content">
        <header className="header">
          <div className="moon-icon">🌙</div>
          <h1 className="title">
            <span className="title-line">Is it</span>
            <span className="title-line title-accent">a dream?</span>
          </h1>
          <p className="subtitle">
            Train your mind to question reality. Become lucid.
          </p>
        </header>

        <div className="card glass-card">
          <div className="card-inner">
            {!permissionGranted ? (
              <div className="permission-section">
                <div className="icon-container">
                  <span className="bell-icon">🔔</span>
                </div>
                <h2>Enable Reality Checks</h2>
                <p>Allow notifications to receive gentle reminders throughout your day asking if you&apos;re dreaming.</p>
                <button className="primary-button" onClick={requestPermission}>
                  <span className="button-glow" />
                  <span className="button-text">Awaken Me</span>
                </button>
              </div>
            ) : (
              <div className="settings-section">
                <div className="toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-icon">{settings.enabled ? '✨' : '💤'}</span>
                    <div>
                      <h3>Reality Checks</h3>
                      <p>{settings.enabled ? 'Active - questioning reality' : 'Paused - sleeping mode'}</p>
                    </div>
                  </div>
                  <button
                    className={`toggle-button ${settings.enabled ? 'active' : ''}`}
                    onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>

                <div className="settings-grid">
                  <div className="setting-item">
                    <label>Wake Hour</label>
                    <div className="time-selector">
                      <button
                        className="time-btn"
                        onClick={() => setSettings(s => ({ ...s, startHour: Math.max(0, s.startHour - 1) }))}
                      >−</button>
                      <span className="time-display">{formatHour(settings.startHour)}</span>
                      <button
                        className="time-btn"
                        onClick={() => setSettings(s => ({ ...s, startHour: Math.min(23, s.startHour + 1) }))}
                      >+</button>
                    </div>
                  </div>

                  <div className="setting-item">
                    <label>Sleep Hour</label>
                    <div className="time-selector">
                      <button
                        className="time-btn"
                        onClick={() => setSettings(s => ({ ...s, endHour: Math.max(1, s.endHour - 1) }))}
                      >−</button>
                      <span className="time-display">{formatHour(settings.endHour)}</span>
                      <button
                        className="time-btn"
                        onClick={() => setSettings(s => ({ ...s, endHour: Math.min(24, s.endHour + 1) }))}
                      >+</button>
                    </div>
                  </div>

                  <div className="setting-item full-width">
                    <label>Frequency</label>
                    <div className="frequency-options">
                      {[1, 2, 3, 4].map(freq => (
                        <button
                          key={freq}
                          className={`freq-btn ${settings.frequency === freq ? 'active' : ''}`}
                          onClick={() => setSettings(s => ({ ...s, frequency: freq }))}
                        >
                          {freq}x / hr
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="demo-button" onClick={triggerDemo}>
                  <span className="demo-icon">👁️</span>
                  Test a Reality Check
                </button>

                {lastNotification && (
                  <p className="last-check">
                    Last check: {lastNotification.toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <section className="info-section">
          <h2>How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Receive prompts</h3>
                <p>Random notifications throughout your day asking if you&apos;re dreaming</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Reality check</h3>
                <p>Look at your hands, try to push a finger through your palm, read text twice</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Become lucid</h3>
                <p>The habit carries into your dreams, triggering lucid awareness</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Demo notification popup */}
      {showDemo && (
        <div className="demo-notification">
          <div className="demo-notification-inner">
            <span className="demo-emoji">💭</span>
            <div>
              <strong>Dream Check</strong>
              <p>Is this a dream?</p>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        Requested by <a href="https://twitter.com/mantoalt" target="_blank" rel="noopener noreferrer">@mantoalt</a> · Built by <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer">@clonkbot</a>
      </footer>
    </div>
  )
}

export default App
