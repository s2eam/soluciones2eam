// Textos y reglas del asistente. Edita aquí para cambiar lo que dice el bot.
// Regla de oro: el bot no da precios ni opiniones técnicas; solo información aprobada.

export const SERVICES = [
  { key: "soldadura-estructuras", label: "Soldadura y estructuras", words: ["soldad", "estructur", "metalic", "reja", "techo"] },
  { key: "pintura", label: "Pintura", words: ["pintur", "pintar"] },
  { key: "electricidad", label: "Electricidad residencial", words: ["electric", "cableado", "tomacorriente", "breaker"] },
  { key: "madera", label: "Acabados en madera", words: ["madera", "carpinter"] },
  { key: "mejoras", label: "Mejoras y remodelaciones", words: ["remodel", "mejora", "reparacion", "construc", "ampliacion"] },
  { key: "cctv", label: "Cámaras (CCTV)", words: ["camara", "cctv", "vigilancia"] },
  { key: "alarmas", label: "Alarmas", words: ["alarma"] },
  { key: "portones", label: "Portones eléctricos", words: ["porton", "garaje"] },
  { key: "otro", label: "Otro", words: [] },
];

export const MENU = [
  { label: "Pedir una cotización", value: "cotizar" },
  { label: "Servicios", value: "servicios" },
  { label: "Zona de servicio", value: "zona" },
  { label: "Garantía", value: "garantia" },
  { label: "Visita técnica", value: "visita" },
  { label: "Hablar con una persona", value: "persona" },
];

export const AFTER_ANSWER = [
  { label: "Pedir una cotización", value: "cotizar" },
  { label: "Otras dudas", value: "menu" },
  { label: "Hablar con una persona", value: "persona" },
];

// Respuestas a preguntas frecuentes (mismo contenido que la sección del sitio).
export const ANSWERS = {
  servicios:
    "Hacemos mejoras constructivas (soldadura y estructuras metálicas, pintura, electricidad residencial, acabados en madera, mejoras y remodelaciones) y seguridad electrónica (venta e instalación de cámaras, alarmas y portones eléctricos).",
  zona: "Atendemos en Cóbano, Puntarenas. Si tu propiedad está cerca y no estás seguro, dime la zona al pedir tu cotización y lo revisamos.",
  garantia: "Cada trabajo se entrega con garantía por escrito. El plazo y las condiciones se detallan en la cotización.",
  visita:
    "Muchas veces podemos empezar con fotos y una descripción. En trabajos más complejos hacemos una visita técnica antes de cotizar.",
  tiempos:
    "Al enviar tu solicitud recibes una confirmación con tu número de solicitud y te contactamos lo antes posible. Si es urgente, escríbenos por WhatsApp con el botón de arriba.",
  precios:
    "No doy precios por aquí porque cada trabajo es distinto. Te enviamos una cotización por escrito con alcance, materiales y tiempo estimado. ¿Quieres pedirla ahora?",
  datos: "Usamos tus datos solo para responder tu solicitud. Puedes leer los detalles en la [política de privacidad](privacidad/).",
};

// Intenciones por palabras clave (texto sin tildes y en minúsculas). El orden importa.
export const INTENTS = [
  { key: "precios", test: /\b(precio|costo|cuesta|cuanto (cobran|sale|vale)|tarifa)/ },
  { key: "garantia", test: /\bgarantia/ },
  { key: "visita", test: /\b(visita|visitar|ir a ver)/ },
  { key: "tiempos", test: /\b(tarda|tardan|tiempo|demora|rapido|cuando (responden|contactan))/ },
  { key: "zona", test: /\b(zona|donde|ubicacion|ubicados|cobertura|cobano|atienden|puntarenas)/ },
  { key: "datos", test: /\b(datos|privacidad|informacion personal)/ },
  { key: "servicios", test: /\b(servicios?|que hacen|que ofrecen|ofrecen|hacen)\b/ },
  { key: "cotizar", test: /\b(cotiz|presupuesto|solicitar|necesito|quiero|me interesa|instalar|reparar)/ },
];

export const WANTS_PERSON = /\b(persona|humano|asesor|agente|whatsapp|llamar|alguien)\b/;
export const GREETING = /^(hola|buenas|buenos|hey|saludos|buen dia)/;
export const THANKS = /\bgracias\b/;

export const TEXT = {
  greeting: [
    "¡Hola! Soy el asistente automatizado de S2EAM. Puedo ayudarte a pedir una cotización o resolver dudas sobre nuestros servicios en Cóbano, Puntarenas.",
    "Si prefieres hablar con una persona, usa el botón de arriba en cualquier momento. ¿Qué necesitas?",
  ],
  backToMenu: "Claro. ¿En qué más puedo ayudarte?",
  cancelled: "Listo, cancelé la solicitud. ¿En qué más puedo ayudarte?",
  thanks: "¡Con gusto! ¿Algo más en lo que pueda ayudarte?",
  notUnderstood:
    "No estoy seguro de haber entendido. Puedes elegir una opción o escribir, por ejemplo, cotizar, zona o garantía.",
  offerPerson:
    "Parece que no logro ayudarte por aquí. Te recomiendo escribirle a una persona del equipo, que podrá atenderte mejor.",
  person: "Te dejo un enlace para escribirnos por WhatsApp, con un mensaje ya preparado. También puedes escribir al 6095-6381.",
  askService: "Con gusto. ¿Qué servicio necesitas?",
  askZone: "¿En qué zona o dirección sería el trabajo? Atendemos en Cóbano, Puntarenas.",
  askMessage: "Cuéntame brevemente qué necesitas. Si tienes fotos, podrás enviarlas después por WhatsApp.",
  askName: "¿Cómo te llamas?",
  askPhone: "¿A qué teléfono o WhatsApp te contactamos? Por ejemplo, 6095 6381.",
  askEmail: "¿Quieres dejar un correo? Es opcional.",
  badZone: "Escribe una zona o dirección, aunque sea aproximada.",
  badMessage: "Cuéntame un poco más (al menos unas palabras) para poder preparar tu cotización.",
  badName: "Escribe tu nombre, por favor.",
  badPhone: "Ese teléfono no parece válido. Usa solo números, por ejemplo 6095 6381.",
  badEmail: "Ese correo no parece válido. Escríbelo de nuevo u omítelo.",
  confirmIntro: "Revisa tu solicitud:",
  consent: "Al enviarla autorizas que usemos tus datos para responderte. Lee la [política de privacidad](privacidad/).",
  confirmAsk: "¿La envío?",
  wait: "Un momento, estoy enviando tu solicitud.",
  sendFailed: "No pude enviar tu solicitud en este momento. Puedes reintentar o enviarla por WhatsApp.",
};

// Centro de ayuda por temas (interfaz sin caja de texto). Las respuestas reutilizan ANSWERS.
// Tipos de acción: "chat" (cotizar conversando), "form" (ir al formulario), "wa" (WhatsApp), "link" (ancla o página).
export const HELP_TOPICS = [
  { key: "cotizar", label: "Cotizar" },
  { key: "servicios", label: "Servicios" },
  { key: "zona", label: "Zona" },
  { key: "garantia", label: "Garantía" },
  { key: "visita", label: "Visita técnica" },
  { key: "tiempos", label: "Tiempos" },
  { key: "datos", label: "Privacidad" },
];

export const HELP_QA = [
  {
    id: "cotizar-como",
    topic: "cotizar",
    q: "¿Cómo pido una cotización?",
    a: "Cuéntanos qué servicio necesitas, en qué zona y cómo contactarte. Te enviamos una cotización por escrito con alcance, materiales y tiempo estimado.",
    actions: [
      { type: "form", label: "Ir al formulario", primary: true },
      { type: "chat", label: "Cotizar por aquí" },
    ],
  },
  { id: "cotizar-precio", topic: "cotizar", q: "¿Cuánto cuesta un trabajo?", a: ANSWERS.precios.replace(" ¿Quieres pedirla ahora?", ""), actions: [{ type: "form", label: "Pedir cotización", primary: true }, { type: "chat", label: "Cotizar por aquí" }] },
  {
    id: "cotizar-fotos",
    topic: "cotizar",
    q: "¿Puedo enviar fotos del trabajo?",
    a: "Sí. Después de enviar tu solicitud puedes mandarnos las fotos por WhatsApp. En muchos casos nos permiten cotizar sin visita.",
    actions: [{ type: "wa", label: "Escribir por WhatsApp", primary: true }],
  },
  { id: "servicios-cuales", topic: "servicios", q: "¿Qué servicios ofrecen?", a: ANSWERS.servicios, actions: [{ type: "link", label: "Ver construcción", href: "#construccion", primary: true }, { type: "link", label: "Ver seguridad", href: "#seguridad" }] },
  {
    id: "servicios-seguridad",
    topic: "servicios",
    q: "¿Venden e instalan cámaras, alarmas o portones?",
    a: "Sí, vendemos e instalamos cámaras, alarmas y portones eléctricos. Cuéntanos el tipo de propiedad y qué quieres proteger.",
    actions: [{ type: "form", label: "Pedir cotización", primary: true }, { type: "link", label: "Ver seguridad", href: "#seguridad" }],
  },
  {
    id: "zona-fuera",
    topic: "zona",
    q: "¿Trabajan fuera de Cóbano?",
    a: "Atendemos en Cóbano, Puntarenas. Si tu propiedad está en otra zona, indícala al pedir la cotización y lo revisamos. La distancia se toma en cuenta en la cotización.",
    actions: [{ type: "form", label: "Pedir cotización", primary: true }, { type: "wa", label: "Preguntar por WhatsApp" }],
  },
  { id: "garantia-tiene", topic: "garantia", q: "¿Los trabajos tienen garantía?", a: ANSWERS.garantia, actions: [{ type: "link", label: "Ver garantías", href: "#garantias", primary: true }] },
  { id: "visita-antes", topic: "visita", q: "¿Necesitan visitar antes de cotizar?", a: ANSWERS.visita, actions: [{ type: "form", label: "Pedir cotización", primary: true }] },
  { id: "tiempos-respuesta", topic: "tiempos", q: "¿Cuándo me responden?", a: ANSWERS.tiempos.replace(" con el botón de arriba", ""), actions: [{ type: "wa", label: "Escribir por WhatsApp", primary: true }] },
  { id: "datos-uso", topic: "datos", q: "¿Qué hacen con mis datos?", a: "Usamos tus datos solo para responder tu solicitud. Los detalles están en la política de privacidad.", actions: [{ type: "link", label: "Leer la política", href: "privacidad/", primary: true }] },
];

// Preguntas que aparecen como burbujas al tocar «Ayuda».
export const HELP_FEATURED = ["cotizar-como", "zona-fuera", "garantia-tiene"];
