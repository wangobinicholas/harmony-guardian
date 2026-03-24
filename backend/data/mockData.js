module.exports = {
  patient: {
    id: "child1",
    name: "Alex",
    age: 8,
    diagnosis: ["Autism Spectrum Disorder", "Sensory Processing Disorder"],
    primaryCaregiver: "Sarah (Mother)",
    avatar: "🧑‍🦱"
  },
  vitals: {
    heartRate: 85,
    spo2: 98,
    motion: 0.2,
    gsr: 450,
    stressLevel: 15, // 0-100 score
    status: "Normal"
  },
  alerts: [
    {
      id: 1,
      time: "10:30 AM",
      type: "system",
      severity: "info",
      message: "System initialized - All sensors operational"
    },
    {
      id: 2,
      time: "11:45 AM",
      type: "vital",
      severity: "warning",
      message: "Elevated heart rate detected (110 BPM)"
    },
    {
      id: 3,
      time: "12:15 PM",
      type: "routine",
      severity: "info",
      message: "Lunch time routine started"
    }
  ]
};
