import { calendar } from '../config/calendar.js';
import { validateTimeSlot } from '../utils/validation.js';

export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Se requiere una fecha' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const bookedSlots = response.data.items.map(event => {
      const startTime = new Date(event.start.dateTime);
      return `${startTime.getHours().toString().padStart(2, '0')}:00`;
    });

    const allSlots = ['09:00', '10:00', '11:00', '12:00'];
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({ availableSlots });
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    res.status(500).json({ error: 'Error al obtener horarios disponibles' });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { date, time, name, email } = req.body;

    if (!validateTimeSlot(time)) {
      return res.status(400).json({ error: 'Horario no válido' });
    }

    const [hours, minutes] = time.split(':');
    const startDateTime = new Date(date);
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(startDateTime.getHours() + 1);

    const event = {
      summary: `Consulta con ${name}`,
      description: `Cita agendada por ${email}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Mexico_City',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Mexico_City',
      },
      attendees: [{ email }],
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all',
    });

    res.json({
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
    });
  } catch (error) {
    console.error('Error al crear la cita:', error);
    res.status(500).json({ error: 'Error al crear la cita' });
  }
};