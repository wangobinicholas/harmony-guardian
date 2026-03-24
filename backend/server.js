const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-auto-zim';

// Auth Middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
}

// Ensure database is seeded
async function initDb() {
  const adminCount = await prisma.user.count({ where: { role: 'admin' } });
  if (adminCount === 0) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: { email: 'admin@harmony.local', password: hashedPassword, name: 'System Admin', role: 'admin' }
    });
    
    const cgPassword = await bcrypt.hash('caregiver123', 10);
    const cg = await prisma.user.create({
      data: { email: 'caregiver@harmony.local', password: cgPassword, name: 'Primary Caregiver', role: 'caregiver' }
    });

    const usrPassword = await bcrypt.hash('user123', 10);
    const usr = await prisma.user.create({
      data: { email: 'user@harmony.local', password: usrPassword, name: 'Patient User', role: 'user' }
    });

    const patient = await prisma.patient.create({
      data: { name: 'Alex', age: 8, diagnosis: 'Autism Spectrum Disorder', baselineHeartRate: 78, sensitivityLevel: 4, primaryCaregiverId: cg.id, avatar: '🧑‍🦱' }
    });

    await prisma.vital.create({
      data: { patientId: patient.id, heartRate: 85, spo2: 98, motion: 0.2, gsr: 450, stressLevel: 15, status: 'Normal' }
    });

    await prisma.alert.create({
      data: { patientId: patient.id, type: 'system', severity: 'info', message: 'Database Initialized and Seeded', timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    });
  }
}
initDb();

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'User already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: role || 'caregiver' }
    });
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Users Endpoint (Admin only)
app.get('/api/users', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } });
  res.json(users);
});

// Protected Data Routes
app.get('/api/patient', requireAuth, async (req, res) => {
  const patient = await prisma.patient.findFirst();
  res.json(patient || { error: 'No patient found' });
});

// IoT Data Ingestion Webhook (ESP32 Endpoint)
app.post('/api/sensor/data', async (req, res) => {
  // In industry, this would use API keys, but we'll accept raw payload for ESP32 simplicity
  const { device_id, heart_rate, spo2, motion, gsr, timestamp } = req.body;
  if (!device_id) return res.status(400).json({ error: 'device_id required' });

  try {
    // 1. Upsert Device & Get Patient
    let patient;
    const device = await prisma.device.findUnique({ where: { deviceId: device_id }, include: { patient: true } });
    
    if (device) {
      patient = device.patient;
      await prisma.device.update({ where: { id: device.id }, data: { lastSeen: new Date(), status: 'active' }});
    } else {
      // For demo, if device doesn't exist, attached to first patient
      patient = await prisma.patient.findFirst();
      if (!patient) return res.status(404).json({ error: 'No patient found to map to device' });
      await prisma.device.create({
        data: { deviceId: device_id, patientId: patient.id, status: 'active' }
      });
    }

    // 2. Call ML fastAPI
    let newStress = 15;
    let newStatus = 'Normal';
    try {
      const mlApiUrl = process.env.ML_API_URL || 'http://127.0.0.1:8000';
      const mlRes = await fetch(`${mlApiUrl}/predict_stress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          heartRate: heart_rate, 
          spo2, 
          motion: motion || 0, 
          gsr: gsr || 400,
          baseline_heart_rate: patient.baselineHeartRate,
          sensitivity_level: patient.sensitivityLevel
        })
      });
      if (mlRes.ok) {
        const mlData = await mlRes.json();
        newStress = mlData.stressScore;
        newStatus = mlData.status;

        // Auto-generate Event/Alert if Emergency
        if (newStatus === 'Emergency' || newStatus === 'Warning') {
          await prisma.alert.create({
            data: {
              patientId: patient.id,
              type: 'system',
              severity: newStatus === 'Emergency' ? 'emergency' : 'warning',
              message: `Anomaly Detected: ${newStatus} State Recorded.`,
              timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          });
        }
      }
    } catch (err) {
      console.error("ML Service unavailable", err.message);
    }

    // 3. Save to Vital table
    const storedVital = await prisma.vital.create({
      data: {
        patientId: patient.id,
        heartRate: heart_rate,
        spo2,
        motion: motion || 0,
        gsr: gsr || 400,
        stressLevel: newStress,
        status: newStatus,
        recordedAt: timestamp ? new Date(timestamp) : new Date()
      }
    });

    res.json({ success: true, processed: storedVital });
  } catch (e) {
    console.error("Ingestion Error:", e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Pure API Route - Read Only!
app.get('/api/vitals', requireAuth, async (req, res) => {
  const patient = await prisma.patient.findFirst();
  if (!patient) return res.status(404).json({ error: 'No patient found' });
  
  const latestVital = await prisma.vital.findFirst({
    where: { patientId: patient.id },
    orderBy: { recordedAt: 'desc' }
  });
  res.json(latestVital || {});
});

app.get('/api/history', requireAuth, async (req, res) => {
  const patient = await prisma.patient.findFirst();
  if (!patient) return res.status(404).json({ error: 'No patient found' });
  const vitals = await prisma.vital.findMany({
    where: { patientId: patient.id },
    orderBy: { recordedAt: 'desc' },
    take: 30
  });
  // Return in chronological order for charts
  res.json(vitals.reverse());
});

app.get('/api/alerts', requireAuth, async (req, res) => {
  const alerts = await prisma.alert.findMany({ orderBy: { recordedAt: 'desc' }, take: 20 });
  res.json(alerts);
});

app.post('/api/action', requireAuth, async (req, res) => {
  const { action, description } = req.body;
  const patient = await prisma.patient.findFirst();
  
  if (patient) {
    const newAlert = await prisma.alert.create({
      data: {
        patientId: patient.id,
        type: 'action',
        severity: 'warning',
        message: description || `Action triggered: ${action}`,
        timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });
    res.json({ success: true, alert: newAlert });
  } else {
    res.status(404).json({ error: 'Patient not found' });
  }
});

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Since node server.js is crashing recursively trying to kill and restart on Windows port locks, 
// let's explicitly kill any listener on 3001 if possible or just use server.listen
const server = app.listen(PORT, () => {
  console.log(`Harmony Guardian Fully Connected API running on http://localhost:${PORT}`);
});
