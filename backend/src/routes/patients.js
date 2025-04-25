const express = require('express');
const router = express.Router();

// Mock data - would be replaced with database calls in a real app
const patients = [
  { id: '1', name: 'John Doe', age: 45, gender: 'Male' },
  { id: '2', name: 'Jane Smith', age: 32, gender: 'Female' }
];

// GET all patients
router.get('/', (req, res) => {
  res.json({ patients });
});

// GET patient by ID
router.get('/:id', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }
  res.json({ patient });
});

// POST create new patient
router.post('/', (req, res) => {
  const { name, age, gender } = req.body;
  
  if (!name || !age || !gender) {
    return res.status(400).json({ message: 'Please provide name, age and gender' });
  }
  
  const newPatient = {
    id: Date.now().toString(),
    name,
    age,
    gender
  };
  
  patients.push(newPatient);
  res.status(201).json({ patient: newPatient });
});

// PUT update patient
router.put('/:id', (req, res) => {
  const { name, age, gender } = req.body;
  const index = patients.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Patient not found' });
  }
  
  patients[index] = {
    ...patients[index],
    ...(name && { name }),
    ...(age && { age }),
    ...(gender && { gender })
  };
  
  res.json({ patient: patients[index] });
});

// DELETE patient
router.delete('/:id', (req, res) => {
  const index = patients.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Patient not found' });
  }
  
  const deletedPatient = patients.splice(index, 1)[0];
  res.json({ message: 'Patient deleted', patient: deletedPatient });
});

module.exports = router; 