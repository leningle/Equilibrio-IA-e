
import { Routine, RoutineType } from './types';

// Helper to generate IDs
const uid = () => Math.random().toString(36).substr(2, 9);

export const DEFAULT_ALARM_URL = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';

export const PRESET_ALARMS = [
  { id: 'beep', name: 'Cosmic Beep', url: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
  { id: 'bell', name: 'Zen Bell', url: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg' },
  { id: 'alert', name: 'Digital Alert', url: 'https://actions.google.com/sounds/v1/alarms/alarm_clock_short_beeps.ogg' },
  { id: 'pulse', name: 'Electronic Pulse', url: 'https://actions.google.com/sounds/v1/alarms/phone_operating_system_sounds.ogg' },
];

export const MOTIVATIONAL_QUOTES = [
  "Ese futuro brillante te está esperando. No lo hagas esperar.",
  "Estás a una decisión de cambiar tu historia. Levántate.",
  "Sé que duele, pero crecer duele. Sigue adelante.",
  "No te definen tus caídas, sino las veces que te levantas.",
  "Tu 'yo' del futuro te está mirando con orgullo. No te rindas.",
  "Este momento difícil es solo un capítulo, no el libro entero.",
  "Tienes una fuerza dentro que ni tú mismo conoces todavía.",
  "El mundo necesita la mejor versión de ti. Ve a buscarla.",
  "Descansa si es necesario, pero nunca renuncies a tu sueño.",
  "La disciplina es el puente entre quien eres y quien quieres ser.",
  "Respira profundo. Estás construyendo un imperio, ladrillo a ladrillo.",
  "No escuches al miedo. Escucha a tu potencial."
];

export const ROUTINES: Record<string, Routine> = {
  [RoutineType.MORNING_PRODUCTIVE]: {
    id: RoutineType.MORNING_PRODUCTIVE,
    name: "Mañana Productiva (Madrugador)",
    description: "Ideal para quienes tienen más energía al inicio del día.",
    blocks: [
      { id: uid(), time: '07:00', activity: 'Despertar y Cuidado Personal', type: 'personal', alarmEnabled: true },
      { id: uid(), time: '07:30', activity: 'Desayuno Familiar (Sin pantallas)', type: 'sacred', alarmEnabled: true, enforceLock: true },
      { id: uid(), time: '08:30', activity: 'MODO FOCO IA (Bloque 1/4)', type: 'work', alarmEnabled: true },
      { id: uid(), time: '10:00', activity: 'Micro-Descanso Activo', type: 'break', alarmEnabled: true },
      { id: uid(), time: '10:15', activity: 'MODO FOCO IA (Bloque 2/4)', type: 'work', alarmEnabled: true },
      { id: uid(), time: '12:00', activity: 'CIERRE DE MAÑANA', type: 'work', alarmEnabled: true },
      { id: uid(), time: '13:00', activity: 'Almuerzo y Relax', type: 'sacred', alarmEnabled: true, enforceLock: true },
      { id: uid(), time: '14:30', activity: 'MODO FOCO IA (Bloque 3/4)', type: 'work', alarmEnabled: true },
      { id: uid(), time: '17:00', activity: 'MODO FOCO IA (Bloque 4/4)', type: 'work', alarmEnabled: true },
      { id: uid(), time: '18:00', activity: 'CIERRE DE JORNADA', type: 'personal', alarmEnabled: true },
      { id: uid(), time: '20:30', activity: 'Noches Tranquilas', type: 'sacred', alarmEnabled: true },
    ]
  },
  [RoutineType.AFTERNOON_FOCUS]: {
    id: RoutineType.AFTERNOON_FOCUS,
    name: "Tarde de Foco (Noctámbulo)",
    description: "Para quienes prefieren mañanas lentas y tardes intensas.",
    blocks: [
      { id: uid(), time: '08:00', activity: 'Despertar y Tiempo Familiar', type: 'sacred', alarmEnabled: true, enforceLock: false },
      { id: uid(), time: '09:00', activity: 'Tareas del Hogar', type: 'personal', alarmEnabled: true },
      { id: uid(), time: '10:30', activity: 'Correos / Pendientes Ligeros', type: 'work', alarmEnabled: true },
      { id: uid(), time: '12:00', activity: 'Almuerzo Familiar', type: 'sacred', alarmEnabled: true, enforceLock: true },
      { id: uid(), time: '13:30', activity: 'Tiempo de Sombra / Siesta', type: 'personal', alarmEnabled: true },
      { id: uid(), time: '15:00', activity: 'MODO FOCO IA (Bloque 1/2)', type: 'work', alarmEnabled: true },
      { id: uid(), time: '17:30', activity: 'Micro-Descanso', type: 'break', alarmEnabled: true },
      { id: uid(), time: '18:00', activity: 'MODO FOCO IA (Bloque 2/2)', type: 'work', alarmEnabled: true },
      { id: uid(), time: '20:00', activity: 'Cierre y Cena', type: 'sacred', alarmEnabled: true, enforceLock: true },
    ]
  },
  [RoutineType.SPLIT_SHIFT]: {
    id: RoutineType.SPLIT_SHIFT,
    name: "Jornada Partida",
    description: "Equilibrio distribuido durante todo el día.",
    blocks: [
      { id: uid(), time: '07:00', activity: 'Despertar y Ejercicio', type: 'personal', alarmEnabled: true },
      { id: uid(), time: '08:30', activity: 'MODO FOCO IA (Bloque 1/2)', type: 'work', alarmEnabled: true },
      { id: uid(), time: '12:00', activity: 'Cierre y Almuerzo', type: 'personal', alarmEnabled: true },
      { id: uid(), time: '13:00', activity: 'BLOQUE SAGRADO FAMILIAR', type: 'sacred', alarmEnabled: true, enforceLock: true },
      { id: uid(), time: '16:00', activity: 'MODO FOCO IA (Bloque 3/4)', type: 'work', alarmEnabled: true },
      { id: uid(), time: '19:00', activity: 'Cierre de Jornada', type: 'personal', alarmEnabled: true },
      { id: uid(), time: '20:00', activity: 'Tiempo en Pareja', type: 'sacred', alarmEnabled: true, enforceLock: true },
    ]
  },
  [RoutineType.WEEKEND_RECHARGE]: {
    id: RoutineType.WEEKEND_RECHARGE,
    name: "Weekend Recharge",
    description: "Recupera tu energía con hobbies, descanso y conexión social.",
    blocks: [
      { id: uid(), time: '09:00', activity: 'Despertar Lento y Café Tranquilo', type: 'personal', alarmEnabled: true },
      { id: uid(), time: '10:30', activity: 'Pasatiempos / Hobbies Creativos', type: 'personal', alarmEnabled: false },
      { id: uid(), time: '13:00', activity: 'Almuerzo Social / Salida', type: 'sacred', alarmEnabled: true, enforceLock: true },
      { id: uid(), time: '15:30', activity: 'Caminata o Aire Libre', type: 'personal', alarmEnabled: false },
      { id: uid(), time: '18:00', activity: 'Lectura o Relax sin Pantallas', type: 'personal', alarmEnabled: true },
      { id: uid(), time: '20:30', activity: 'Cena Especial y Cine en Casa', type: 'sacred', alarmEnabled: true, enforceLock: true },
    ]
  },
  [RoutineType.PDF_IMPORTED]: {
    id: RoutineType.PDF_IMPORTED,
    name: "Agenda Personal (Importada PDF)",
    description: "Rutina importada de tus tareas: Enfoque, Meditación y Control Consciente.",
    blocks: [
      { id: uid(), time: '05:30', activity: 'Despertar y Ritual de Mañana - ¡Foco!', type: 'personal', alarmEnabled: true },
      { id: uid(), time: '07:30', activity: 'Meditación: Inducción y Diseño de Futuro', type: 'sacred', alarmEnabled: true, location: 'Espacio de Meditación', enforceLock: true },
      { id: uid(), time: '14:00', activity: 'Control Consciente: ¿Viejo yo o Nuevo yo? (Pausa 3 seg)', type: 'break', alarmEnabled: true },
      { id: uid(), time: '17:45', activity: 'Transición: Llegada a Casa / No Consumo. ¡Ducha!', type: 'personal', alarmEnabled: true },
      { id: uid(), time: '18:15', activity: 'Bloque de Estudio Personal/IA (1 Hora)', type: 'work', alarmEnabled: true },
      { id: uid(), time: '21:15', activity: 'Cierre de Pantallas / Prep. para Dormir', type: 'sacred', alarmEnabled: true, enforceLock: true },
      { id: uid(), time: '23:00', activity: 'Reflexión Nocturna', type: 'personal', alarmEnabled: true },
    ]
  },
  [RoutineType.EL_CAMBIO]: {
    id: RoutineType.EL_CAMBIO,
    name: "El Cambio",
    description: "Tu rutina de transformación personal y disciplina.",
    blocks: [
      { id: uid(), time: '05:30', activity: 'Despertar y Ritual de Mañana - ¡Foco!', type: 'personal', alarmEnabled: true },
      { id: uid(), time: '07:30', activity: 'Meditación: Inducción y Diseño de Futuro', type: 'sacred', alarmEnabled: true, location: 'Espacio de Meditación', enforceLock: true },
      { id: uid(), time: '14:00', activity: 'Control Consciente: ¿Viejo yo o Nuevo yo? (Pausa 3 seg)', type: 'break', alarmEnabled: true },
      { id: uid(), time: '17:45', activity: 'Transición: Llegada a Casa / No Consumo. ¡Ducha!', type: 'personal', alarmEnabled: true },
      { id: uid(), time: '18:15', activity: 'Bloque de Estudio Personal/IA (1 Hora)', type: 'work', alarmEnabled: true },
      { id: uid(), time: '21:15', activity: 'Cierre de Pantallas / Prep. para Dormir', type: 'sacred', alarmEnabled: true, enforceLock: true },
      { id: uid(), time: '23:00', activity: 'Reflexión Nocturna (Patrones y Nuevo Yo)', type: 'personal', alarmEnabled: true },
    ]
  }
};
