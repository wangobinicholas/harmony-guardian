import React, { useEffect, useState, useRef } from "react";
import { LogoIcon } from './Icons';

export default function WelcomeView({ onLogin }) {
  // --- Tool States ---
  const [stressLevel, setStressLevel] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isBreathing, setIsBreathing] = useState(false);
  const timerRef = useRef(null);
  const [checks, setChecks] = useState([false, false, false, false]);
  const [showRoutineTips, setShowRoutineTips] = useState(false);
  const [showSupportTips, setShowSupportTips] = useState(false);

  // Breathing timer logic
  useEffect(() => {
    if (isBreathing && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsBreathing(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [isBreathing, timeLeft]);

  const toggleBreathing = () => {
    if (isBreathing) {
      setIsBreathing(false);
      clearTimeout(timerRef.current);
    } else {
      if (timeLeft === 0) setTimeLeft(60);
      setIsBreathing(true);
    }
  };
  return (
    <>
{/* ========== WELCOME PAGE (Public – NDD info & health portal) ========== */}
  <div id="welcome-page">
    <div className="w-nav-top">
      <a href="#resources">Newsletter</a>
      <a href="#learn">Learn</a>
      <a href="#tools">Tools</a>
      <a href="#resources">Tools &amp; Resources</a>
    </div>
    <nav className="w-nav-main">
      <a href="#" className="w-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <LogoIcon size={32} />
        HARMONY GUARDIAN
      </a>
      <ul className="w-nav-links">
        <li><a href="#learn" className="active">Understanding NDDs</a></li>
        <li><a href="#for-caregivers">For Caregivers</a></li>
        <li><a href="#tools">Tools</a></li>
        <li><a href="#resources">Resources</a></li>
        <li><a href="#about">About Us</a></li>
      </ul>
      <button type="button" className="w-btn-signin" onClick={onLogin}>Sign In</button>
    </nav>
    <section className="w-hero">
      <h1>Supporting people with neurodevelopmental disorders — with real-time care and peace of mind.</h1>
      <p>Harmony Guardian helps families and caregivers monitor well-being, spot early signs of stress, and respond with confidence. Trusted by families worldwide.</p>
      <div className="w-hero-cta">
        <button type="button" className="primary" onClick={onLogin}>Sign In to Dashboard</button>
        <a href="#learn" className="secondary">Learn About NDDs</a>
      </div>
      <div className="w-quick-actions">
        <button type="button" className="w-quick-pill primary" onClick={onLogin}>Sign in</button>
        <a href="#tools" className="w-quick-pill">Try breathing tool</a>
        <a href="#learn" className="w-quick-pill">Understanding NDDs</a>
        <a href="#for-caregivers" className="w-quick-pill">For caregivers</a>
      </div>
      <div className="w-badges">
        <span className="w-badge"><span>🔒</span> Secure sign-in</span>
        <span className="w-badge"><span>✓</span> Expert-reviewed content</span>
        <span className="w-badge"><span><i data-lucide="smartphone"></i></span> Works on any device</span>
      </div>
    </section>

    <div className="w-trust-strip">
      <div className="w-trust-item">
        <div className="w-trust-num">1 in 6</div>
        <div className="w-trust-label">Children affected by NDDs globally</div>
      </div>
      <div className="w-trust-item">
        <div className="w-trust-num">24/7</div>
        <div className="w-trust-label">Monitoring &amp; alerts</div>
      </div>
      <div className="w-trust-item">
        <div className="w-trust-num">100%</div>
        <div className="w-trust-label">Expert-reviewed resources</div>
      </div>
      <div className="w-trust-item">
        <a href="#learn">See conditions →</a>
        <div className="w-trust-label">Understanding NDDs</div>
      </div>
    </div>

    <div className="w-divider"></div>

    <section className="w-section" id="learn">
      <div className="w-two-col">
        <div>
          <h2 className="w-section-title">Understanding Neurodevelopmental Disorders</h2>
          <p className="w-section-desc">Stay informed with expert-reviewed information on how NDDs affect individuals and families.</p>
          <span className="w-fact-badge">✓ Expert-Reviewed</span>
          <p style={{ fontSize: '14px', color: 'var(--w-text-muted)', lineHeight: '1.6' }}>
            Neurodevelopmental disorders (NDDs) — including autism spectrum disorder (ASD), ADHD, intellectual and communication disorders — affect about <strong>1 in 6 children</strong> globally. They shape how people learn, communicate, regulate emotions, and interact with the world. Understanding them is the first step toward better support.
          </p>
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--w-text)' }}>How NDDs affect people and families</h3>
          <div className="w-card-grid">
            <div className="w-card">
              <div className="w-card-img"><i data-lucide="brain-circuit"></i></div>
              <div className="w-card-body">
                <div className="w-card-tag">Self-awareness</div>
                <div className="w-card-title">Difficulty recognizing stress and emotions</div>
                <p className="w-card-text">Many individuals struggle to sense rising stress or anxiety until it reaches crisis level. Early signals (heart rate, breathing) often go unnoticed.</p>
              </div>
            </div>
            <div className="w-card">
              <div className="w-card-img">💬</div>
              <div className="w-card-body">
                <div className="w-card-tag">Communication</div>
                <div className="w-card-title">Barriers in expressing needs</div>
                <p className="w-card-text">Expressing discomfort or asking for help can be hard, especially during overwhelm. Non-verbal cues are easily missed by others.</p>
              </div>
            </div>
            <div className="w-card">
              <div className="w-card-img">⚖️</div>
              <div className="w-card-body">
                <div className="w-card-tag">Regulation</div>
                <div className="w-card-title">Rapid escalation without support</div>
                <p className="w-card-text">Without timely intervention, stress can escalate quickly. Sensory overload, routine changes, or unexpected events can trigger crisis.</p>
              </div>
            </div>
            <div className="w-card">
              <div className="w-card-img">👨‍👩‍👧</div>
              <div className="w-card-body">
                <div className="w-card-tag">Caregivers</div>
                <div className="w-card-title">24/7 vigilance and burnout risk</div>
                <p className="w-card-text">Families and caregivers often carry constant worry about safety and well-being. Harmony Guardian offers an extra layer of support.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* (ML dashboard moved into caregiver/admin dashboards) */}
    </section>

    <div className="w-divider"></div>

    <section className="w-section" id="for-caregivers">
      <h2 className="w-section-title">How Harmony Guardian Helps</h2>
      <p className="w-section-desc">Modern health technology designed for neurodevelopmental support — on wearables, phones, and tablets.</p>
      <div className="w-card-grid">
        <div className="w-card">
          <div className="w-card-img"><i data-lucide="bar-chart"></i></div>
          <div className="w-card-body">
            <div className="w-card-tag">Real-time monitoring</div>
            <div className="w-card-title">Vitals and stress indicators at a glance</div>
            <p className="w-card-text">Heart rate, SpO2, skin response (GSR), and motion data help caregivers spot early signs of stress or distress before they escalate.</p>
          </div>
        </div>
        <div className="w-card">
          <div className="w-card-img"><i data-lucide="bell"></i></div>
          <div className="w-card-body">
            <div className="w-card-tag">Alerts &amp; safety</div>
            <div className="w-card-title">Fall detection and SOS at the tap of a button</div>
            <p className="w-card-text">Instant alerts for falls and one-tap emergency help. Caregivers stay informed whether at home or away.</p>
          </div>
        </div>
        <div className="w-card">
          <div className="w-card-img"><i data-lucide="smartphone"></i></div>
          <div className="w-card-body">
            <div className="w-card-tag">Works everywhere</div>
            <div className="w-card-title">Dashboard on any device — install as an app</div>
            <p className="w-card-text">Use the web dashboard on phones, tablets, and desktops. Add to home screen for an app-like experience on any gadget.</p>
            <button type="button" className="w-app-badge" onClick={() => alert("Add to Home tip shown")}>📲 Add to Home Screen</button>
          </div>
        </div>
      </div>
    </section>

    <div className="w-divider"></div>

    <section className="w-section" id="conditions">
      <h2 className="w-section-title">Understanding Conditions</h2>
      <p className="w-section-desc">Find helpful content on neurodevelopmental conditions. <a href="#learn" style={{ color: 'var(--w-accent)', fontWeight: '600' }}>See all</a></p>
      <div className="w-conditions-bar">
        <a href="#learn">Autism Spectrum</a>
        <a href="#learn">ADHD</a>
        <a href="#learn">Intellectual Disability</a>
        <a href="#learn">Communication Disorders</a>
        <a href="#learn">Sensory Processing</a>
      </div>
    </section>

    <div className="w-divider"></div>

    <section className="w-section" id="tools">
      <h2 className="w-section-title">Don't Wait to Be in the Know</h2>
      <p className="w-tools-intro w-section-desc">
        Own your wellness with trusted tools built to support everyday life with NDD. From stress check-ins to crisis planning, these resources help you make informed decisions.
        When you sign in as a <strong>caregiver</strong> or <strong>admin</strong>, Harmony Guardian adds ML-powered monitoring and alerting on top of these tools.
      </p>
      <div className="w-tools-grid">
        <div className="w-tool-card">
          <div className="w-tool-icon"><i data-lucide="bar-chart"></i></div>
          <h4>Stress Checker</h4>
          <p>How are you (or your loved one) feeling right now? Tap a level to get clear, safety-focused suggestions.</p>
          <div className="w-stress-scale" id="stress-scale">
            {[1, 2, 3, 4, 5].map(level => (
              <button key={level} type="button" onClick={() => setStressLevel(level)} style={{ backgroundColor: stressLevel === level ? 'var(--w-brand)' : 'transparent', color: stressLevel === level ? 'white' : 'var(--w-text)' }}>{level}</button>
            ))}
          </div>
          <div className="w-stress-result" id="stress-result" style={{ marginTop: '1rem', fontWeight: 'bold', color: 'var(--w-brand)' }}>
            {stressLevel === 1 && "Looking good! Keep up the baseline routines."}
            {stressLevel === 2 && "Slight stress detected. A quick break might help."}
            {stressLevel === 3 && "Approaching overwhelm. Consider trying the 1-Minute Breathing tool."}
            {stressLevel === 4 && "Warning: High stress. Please consult your crisis plan."}
            {stressLevel === 5 && "Emergency: Immediate intervention required. Contact your primary support."}
          </div>
        </div>
        <div className="w-tool-card">
          <div className="w-tool-icon">🌬️</div>
          <h4>1-Minute Breathing</h4>
          <p>Quick calm-down: follow the circle. Breathe in as it grows, out as it shrinks. Great to pair with the Stress Checker at level 3–5.</p>
          <div className="w-breathing-box">
            <div className="w-breathing-circle" style={{ transform: isBreathing ? `scale(${1 + (timeLeft % 4 < 2 ? 0.2 : 0)})` : 'scale(1)', transition: 'transform 2s ease-in-out', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '1.5rem', fontWeight: 'bold' }}>
              0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </div>
            <div className="w-breathing-label" id="breathing-label">
              {isBreathing ? (timeLeft % 4 < 2 ? "Breathe In..." : "Breathe Out...") : "Tap Start to begin"}
            </div>
            <button type="button" className="w-app-badge" id="breathing-btn" style={{ marginTop: '0.5rem', cursor: 'pointer' }} onClick={toggleBreathing}>
              {isBreathing ? "Pause" : timeLeft === 0 ? "Restart" : "Start"}
            </button>
          </div>
        </div>
        <div className="w-tool-card">
          <div className="w-tool-icon">📋</div>
          <h4>Crisis Plan Checklist</h4>
          <p>When things escalate, use this list. Check off as you go.</p>
          <ul className="w-crisis-list">
            <li><input type="checkbox" id="c1" checked={checks[0]} onChange={(e) => setChecks([e.target.checked, checks[1], checks[2], checks[3]])} /> <label htmlFor="c1">Stay calm; reduce noise and stimulation</label></li>
            <li><input type="checkbox" id="c2" checked={checks[1]} onChange={(e) => setChecks([checks[0], e.target.checked, checks[2], checks[3]])} /> <label htmlFor="c2">Use familiar calming strategy (e.g. breathing, quiet space)</label></li>
            <li><input type="checkbox" id="c3" checked={checks[2]} onChange={(e) => setChecks([checks[0], checks[1], e.target.checked, checks[3]])} /> <label htmlFor="c3">Contact trusted caregiver or emergency contact</label></li>
            <li><input type="checkbox" id="c4" checked={checks[3]} onChange={(e) => setChecks([checks[0], checks[1], checks[2], e.target.checked])} /> <label htmlFor="c4">If unsafe, call emergency services (911)</label></li>
          </ul>
          <button type="button" className="w-app-badge" style={{cursor: 'pointer'}} onClick={() => setChecks([false, false, false, false])}>Reset checklist</button>
        </div>
        <div className="w-tool-card">
          <div className="w-tool-icon"><i data-lucide="calendar"></i></div>
          <h4>Routine Builder</h4>
          <p>Predictable routines can reduce anxiety. Plan morning and evening steps so everyone knows what comes next.</p>
          <button type="button" className="w-app-badge" style={{cursor: 'pointer'}} onClick={() => setShowRoutineTips(!showRoutineTips)}>{showRoutineTips ? "Hide tips" : "Get routine tips"}</button>
          {showRoutineTips && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--w-bg)', borderRadius: '8px', fontSize: '14px' }}>
              <strong>Tips:</strong> Keep wake-up and bedtime consistent. Use visual schedules if helpful. Build in dedicated calm-down time.
            </div>
          )}
        </div>
        <div className="w-tool-card">
          <div className="w-tool-icon"><i data-lucide="stethoscope"></i></div>
          <h4>Find Support</h4>
          <p>Connect with therapists, support groups, and crisis lines in your area. Share what you see in the tools above with your care team.</p>
          <button type="button" className="w-app-badge" style={{cursor: 'pointer'}} onClick={() => setShowSupportTips(!showSupportTips)}>{showSupportTips ? "Hide resources" : "Support resources"}</button>
          {showSupportTips && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--w-bg)', borderRadius: '8px', fontSize: '14px' }}>
              <strong>Tip:</strong> Ask your doctor or school for local NDD support groups and mental health resources. <strong>National crisis line: 988 (US).</strong>
            </div>
          )}
        </div>
        <div className="w-tool-card">
          <div className="w-tool-icon">🤖</div>
          <h4>ML Monitoring &amp; Alerts</h4>
          <p>For caregivers and admins: Harmony Guardian can use heart rate, GSR, and motion to flag possible stress/anomalies and raise alerts.</p>
          <button type="button" className="w-app-badge" onClick={onLogin}>Sign in to view ML dashboard</button>
        </div>
      </div>
    </section>

    <div className="w-divider"></div>

    <section className="w-section" id="community">
      <h2 className="w-section-title">Real People Sharing Real Experiences #IRL</h2>
      <p className="w-section-desc">The journey is easier when you don't walk it alone. Hear from caregivers and families.</p>
      <div className="w-community-grid">
        <div className="w-story-card">
          <p className="quote">"Harmony Guardian's alerts gave us peace of mind. We can see when our son is getting stressed before he hits meltdown — it changed how we support him."</p>
          <span className="author">— Parent, autism parent group</span>
        </div>
        <div className="w-story-card">
          <p className="quote">"Knowing I could get a fall alert and SOS on my phone made me finally consider going back to work. I'm not alone in caring anymore."</p>
          <span className="author">— Caregiver, ADHD &amp; intellectual disability</span>
        </div>
        <div className="w-story-card">
          <p className="quote">"The breathing tool on the site is something we use together. It helps both of us reset when the day gets overwhelming."</p>
          <span className="author">— Sibling &amp; caregiver</span>
        </div>
      </div>
    </section>

    <div className="w-divider"></div>

    <section className="w-section" id="resources">
      <div className="w-resources-head">
        <div>
          <h2 className="w-section-title">Resources You Can Use</h2>
          <p className="w-section-desc">Follow us for fact-checked tips, trends, and support for NDD families.</p>
        </div>
        <div className="w-social-line">
          <span style={{ display: 'block', fontWeight: '600', color: 'var(--w-text)' }}>Stay connected</span>
          <div className="w-social-icons">
            <span title="Facebook">f</span>
            <span title="Instagram">📷</span>
            <span title="Twitter">𝕏</span>
            <span title="YouTube">▶</span>
          </div>
        </div>
      </div>
      <div className="w-card-grid">
        <div className="w-card">
          <div className="w-card-body">
            <span className="w-fact-badge">✓ Fact-Checked</span>
            <div className="w-card-title">What caregivers wish others knew about NDDs</div>
            <p className="w-card-text">Practical insights from families and experts on supporting loved ones with autism, ADHD, and related conditions.</p>
          </div>
        </div>
        <div className="w-card">
          <div className="w-card-body">
            <span className="w-fact-badge">✓ Expert-Reviewed</span>
            <div className="w-card-title">When to seek professional help</div>
            <p className="w-card-text">Signs that indicate it’s time to reach out to clinicians, therapists, or crisis services — and how to prepare.</p>
          </div>
        </div>
        <div className="w-card">
          <div className="w-card-body">
            <div className="w-card-title">Newsletter</div>
            <p className="w-card-text">Get NDD support tips and product updates in your inbox.</p>
            <div className="w-newsletter">
              <input type="email" placeholder="Your email" id="newsletter-email" />
              <button type="button" onClick={() => alert("Subscribed!")}>Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div className="w-divider"></div>

    <section className="w-section" id="platform">
      <h2 className="w-section-title">Harmony Guardian Platform</h2>
      <p className="w-section-desc">A modern digital health stack designed for neurodevelopmental care — from home monitoring to clinical workflows.</p>
      <div className="w-card-grid">
        <div className="w-card">
          <div className="w-card-body">
            <div className="w-card-tag">Telemedicine</div>
            <div className="w-card-title">Remote consultations anywhere</div>
            <p className="w-card-text">Secure video, chat, and phone visits so patients and caregivers can meet clinicians without leaving home.</p>
          </div>
        </div>
        <div className="w-card">
          <div className="w-card-body">
            <div className="w-card-tag">AI Diagnostics</div>
            <div className="w-card-title">Intelligent decision support</div>
            <p className="w-card-text">AI‑powered insights highlight patterns in vitals, behavior, and history to support — not replace — clinical judgment.</p>
          </div>
        </div>
        <div className="w-card">
          <div className="w-card-body">
            <div className="w-card-tag">IoT &amp; Wearables</div>
            <div className="w-card-title">Real‑time data from devices</div>
            <p className="w-card-text">Stream heart rate, SpO₂, movement, and more from wearables and home devices into a single, unified view.</p>
          </div>
        </div>
        <div className="w-card">
          <div className="w-card-body">
            <div className="w-card-tag">Personalized Care</div>
            <div className="w-card-title">Tailored treatment plans</div>
            <p className="w-card-text">Use individual profiles and trends to recommend routines, interventions, and follow‑ups that fit each person.</p>
          </div>
        </div>
        <div className="w-card">
          <div className="w-card-body">
            <div className="w-card-tag">Blockchain Security</div>
            <div className="w-card-title">Tamper‑evident records</div>
            <p className="w-card-text">Protect the integrity of medical records and audit logs using blockchain‑backed verification.</p>
          </div>
        </div>
        <div className="w-card">
          <div className="w-card-body">
            <div className="w-card-tag">Patient Portals</div>
            <div className="w-card-title">Care in your hands</div>
            <p className="w-card-text">Patients and caregivers can review data, appointments, and care plans, and message providers securely.</p>
          </div>
        </div>
        <div className="w-card">
          <div className="w-card-body">
            <div className="w-card-tag">Doctor Portals</div>
            <div className="w-card-title">Clinician workspace</div>
            <p className="w-card-text">Providers manage panels, telehealth visits, documentation, and AI insights from one dashboard.</p>
          </div>
        </div>
        <div className="w-card">
          <div className="w-card-body">
            <div className="w-card-tag">Analytics</div>
            <div className="w-card-title">Health &amp; outcomes dashboards</div>
            <p className="w-card-text">Track individual and population‑level trends to improve care quality and resource planning.</p>
          </div>
        </div>
        <div className="w-card">
          <div className="w-card-body">
            <div className="w-card-tag">Appointments</div>
            <div className="w-card-title">Smart scheduling &amp; reminders</div>
            <p className="w-card-text">Book, reschedule, and send automated reminders to reduce no‑shows and keep care on track.</p>
          </div>
        </div>
        <div className="w-card">
          <div className="w-card-body">
            <div className="w-card-tag">Messaging &amp; Payments</div>
            <div className="w-card-title">Secure communication &amp; billing</div>
            <p className="w-card-text">Encrypted messaging between patients and providers plus integrated, secure online payments.</p>
          </div>
        </div>
        <div className="w-card">
          <div className="w-card-body">
            <div className="w-card-tag">Access Control</div>
            <div className="w-card-title">Role‑based permissions</div>
            <p className="w-card-text">Granular, HIPAA‑aligned access based on roles such as patient, caregiver, doctor, and admin.</p>
          </div>
        </div>
        <div className="w-card">
          <div className="w-card-body">
            <div className="w-card-tag">EHR &amp; FHIR</div>
            <div className="w-card-title">Connected health records</div>
            <p className="w-card-text">FHIR APIs connect Harmony Guardian to hospital EHRs so data stays accurate and up to date.</p>
          </div>
        </div>
      </div>
    </section>

    <footer className="w-footer" id="about">
      <div className="w-footer-inner">
        <div>
          <h4>Harmony Guardian</h4>
          <a href="#learn">Understanding NDDs</a>
          <a href="#for-caregivers">For Caregivers</a>
          <a href="#tools">Tools</a>
          <a href="#community">Community</a>
          <a href="#resources">Resources</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onLogin(); }}>Sign In</a>
        </div>
        <div>
          <h4>Get the app</h4>
          <p style={{ fontSize: '13px', marginBottom: '0.5rem' }}>Use on any device. Add this site to your home screen for an app-like experience.</p>
          <button type="button" className="w-app-badge" style={{ background: '#334155', color: '#f1f5f9', border: 'none' }} onClick={() => alert("Add to Home tip shown")}>📲 Add to Home Screen</button>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
          <a href="#">Contact Us</a>
        </div>
      </div>
      <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '12px' }}>© Harmony Guardian. Supporting neurodevelopmental wellness.</p>
    </footer>
  </div>

  
    </>
  );
}