const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Self seeding on startup for testing
async function seedDatabase() {
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    const user = await prisma.user.create({
      data: { email: 'admin@harmony.local', password: 'hashedpassword', name: 'System Admin', role: 'admin' }
    });
    const patient = await prisma.patient.create({
      data: {
        name: 'Alex', age: 8, diagnosis: 'Autism Spectrum Disorder', primaryCaregiverId: user.id, avatar: '🧑‍🦱'
      }
    });
    await prisma.vital.create({
      data: {
        patientId: patient.id, heartRate: 85, spo2: 98, motion: 0.2, gsr: 450, stressLevel: 15, status: 'Normal'
      }
    });
    await prisma.alert.create({
      data: {
        patientId: patient.id, type: 'system', severity: 'info', message: 'System initialized and connected to database', timeStr: '10:30 AM'
      }
    });
    console.log('Database seeded with initial test data.');
  }
}
seedDatabase();

app.get('/api/patient', async (req, res) => {
  const patient = await prisma.patient.findFirst();
  res.json(patient || { error: 'No patient found' });
});

app.get('/api/vitals', async (req, res) => {
  const patient = await prisma.patient.findFirst();
  if (!patient) return res.json({ error: 'No patient found' });
  
  let latestVital = await prisma.vital.findFirst({
    where: { patientId: patient.id },
    orderBy: { recordedAt: 'desc' }
  });
  
  if (latestVital) {
     const newHR = latestVital.heartRate + Math.floor(Math.random() * 5) - 2;
     const newSpo2 = Math.min(100, latestVital.spo2 + Math.floor(Math.random() * 3) - 1);
     
     let newStress = latestVital.stressLevel;
     let newStatus = latestVital.status;
     try {
       const mlRes = await fetch('http://127.0.0.1:8000/predict_stress', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ heartRate: newHR, spo2: newSpo2, motion: latestVital.motion, gsr: latestVital.gsr })
       });
       const mlData = await mlRes.json();
       newStress = mlData.stressScore;
       newStatus = mlData.status;
     } catch (err) {
       console.error("ML Service unavailable", err.message);
     }
     
     latestVital = await prisma.vital.create({
       data: {
         patientId: patient.id,
         heartRate: newHR,
         spo2: newSpo2,
         motion: latestVital.motion,
         gsr: latestVital.gsr,
         stressLevel: newStress,
         status: newStatus
       }
     });
  }
  
  res.json(latestVital || {});
});

app.get('/api/alerts', async (req, res) => {
  const alerts = await prisma.alert.findMany({ orderBy: { recordedAt: 'desc' }, take: 10 });
  res.json(alerts);
});

app.post('/api/action', async (req, res) => {
  const { action, description } = req.body;
  const patient = await prisma.patient.findFirst();
  
  if (patient) {
    const newAlert = await prisma.alert.create({
      data: {
        patientId: patient.id,
        type: 'action',
        severity: 'info',
        message: description || `Action: ${action} triggered`,
        timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });
    res.json({ success: true, message: 'Action processed and stored', alert: newAlert });
  } else {
    res.json({ success: false, message: 'No patient found to log action' });
  }
});

app.listen(PORT, () => {
  console.log(`Harmony Guardian Database API running on http://localhost:${PORT}`);
});
