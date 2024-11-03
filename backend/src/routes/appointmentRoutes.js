import express from 'express';
import { createAppointment, getAvailableSlots } from '../controllers/appointmentController.js';

const router = express.Router();

// Obtener horarios disponibles
router.get('/available-slots', getAvailableSlots);

// Crear una cita
router.post('/appointments', createAppointment);

export default router;