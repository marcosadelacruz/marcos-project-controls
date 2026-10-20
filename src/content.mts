export interface ExperienceCase {company:string;period:string;title:string;role:string;description:string;items:string[]}
export interface Service {tag:string;title:string;description:string;deliverables:string[];inputs:string;mode:string;cta:string;brief:string;label:string}
export type CredentialCategory='planning'|'engineering'|'technology'|'other';
export interface Credential {id:string;issuer:string;title:string;category:CredentialCategory;logo:string;date:string;url?:string;note:string;pages?:number[];historical?:boolean}
export const CASES:ExperienceCase[]=[
  {company:'BARRICK GOLD CORPORATION',period:'JUN 2019 — SEP 2023',title:'Calidad que sostiene el avance.',role:'Project Engineer · Quality Engineer | Mine Expansion Project',description:'La expansión minera exigía coordinar el trabajo de construcción con los planos, las especificaciones y las verificaciones de calidad.',items:['Seguimiento del programa de calidad en las áreas de construcción asignadas.','Coordinación con contratistas e ingeniería de campo para resolver cambios de diseño.','Control documental de pruebas e inspecciones.','Formación a personal de campo en procedimientos y estándares de inspección.']},
  {company:'SISI ENGINEERING',period:'NOV 2023 — SEP 2024',title:'Ingeniería, suministro y montaje.',role:'Site Project Manager | Modular Distillation Train',description:'Dirección de proyectos de ingeniería y construcción, con seguimiento diario de la ejecución y coordinación de tanques y tuberías.',items:['Planificación y control de la ejecución con Microsoft Project.','Revisión de ingeniería de detalle y planos en AutoCAD.','Coordinación de contratistas, proveedores y disponibilidad de materiales.','Control del montaje y soldadura bajo referencias API 650, ASME B31.3 y ASME IX.']},
  {company:'BARRICK GOLD CORPORATION',period:'OCT 2024 — JUN 2025',title:'Planificar dentro de la operación.',role:'Mechanical Project Engineer | Mine Optimization Projects',description:'Ingeniería y planificación de proyectos mecánicos de optimización dentro de una operación minera.',items:['Planificación del diseño y la ejecución de proyectos mecánicos.','Supervisión directa de los trabajos y coordinación de contratistas.','Evaluación técnica y seguimiento de avances para ajustar recursos.','Informes de avance a gerencia y coordinación con equipos multidisciplinarios.']},
  {company:'ALSTOM',period:'JUN 2025 — ACTUALIDAD',title:'Una visión integrada del proyecto.',role:'Project Planning Engineer | Monorriel de Santiago de los Caballeros',description:'Planificación y seguimiento del proyecto ferroviario mediante cronogramas, medición de avance y análisis de desempeño.',items:['Desarrollo de WBS a partir del alcance y preparación de líneas base.','Cronogramas en Microsoft Project, análisis de ruta crítica y recursos.','Consolidación de avances de distintos equipos y reportes ejecutivos.','Curvas S de avance, mano de obra y costos, junto con seguimiento EVM y escenarios de riesgo.']}
];

export const SERVICES:Service[]=[
  {
    "tag": "REVISIÓN DE CRONOGRAMA",
    "title": "Comprueba tu plan.<br>Prioriza las correcciones.",
    "description": "Para contratistas y gerentes que ya tienen un cronograma y necesitan entender si su lógica, restricciones y ruta crítica sostienen la fecha de entrega.",
    "deliverables": [
      "Informe de hallazgos sobre dependencias, restricciones y ruta crítica",
      "Lista priorizada de correcciones y supuestos por validar",
      "Sesión de revisión de hallazgos y próximos pasos"
    ],
    "inputs": "Cronograma editable, alcance y fechas comprometidas. La revisión no incluye rehacer el plan completo.",
    "mode": "Encargo puntual · alcance y honorarios según tamaño y estado del archivo.",
    "cta": "Solicitar revisión de cronograma",
    "brief": "Revisión de cronograma",
    "label": "Quiero revisar mi cronograma"
  },
  {
    "tag": "ELABORACIÓN DE CRONOGRAMA",
    "title": "Un plan de trabajo<br>para coordinar la ejecución.",
    "description": "Para proyectos que necesitan organizar el alcance, conectar disciplinas y acordar una secuencia de trabajo con el equipo.",
    "deliverables": [
      "Cronograma editable en Microsoft Project con WBS y dependencias",
      "Hitos, ruta crítica y supuestos de duración y recursos",
      "Versión revisada con el equipo y propuesta de línea base para aprobación"
    ],
    "inputs": "Alcance, cantidades disponibles, calendario, restricciones y fechas objetivo. La aprobación de la línea base corresponde al cliente.",
    "mode": "Por entregable · revisiones y fecha de entrega acordadas en la propuesta.",
    "cta": "Solicitar elaboración de cronograma",
    "brief": "Planificación y cronograma",
    "label": "Necesito elaborar un cronograma"
  },
  {
    "tag": "SEGUIMIENTO PERIÓDICO",
    "title": "Del avance de campo<br>a las decisiones del proyecto.",
    "description": "Para equipos que necesitan consolidar información y saber qué se desvió, qué afecta la entrega y dónde actuar.",
    "deliverables": [
      "Cronograma actualizado con fecha de corte y previsión de entrega",
      "Curva de avance y registro de desviaciones según los datos disponibles",
      "Reporte ejecutivo con acciones, responsables y decisiones pendientes"
    ],
    "inputs": "Cronograma vigente, criterios de medición y avances validados por el equipo. El análisis depende de la calidad de esos datos.",
    "mode": "Seguimiento periódico · frecuencia y responsabilidades definidas antes de empezar.",
    "cta": "Solicitar apoyo de seguimiento",
    "brief": "Seguimiento y control de avance",
    "label": "Necesito seguimiento y reportes"
  },
  {
    "tag": "RECUPERACIÓN DE PLAZO",
    "title": "Compara opciones<br>antes de comprometer una fecha.",
    "description": "Para proyectos con una entrega en riesgo. Analizo las actividades que gobiernan el plazo y las alternativas de secuencia y recursos.",
    "deliverables": [
      "Diagnóstico de la ruta crítica y restricciones de entrega",
      "Comparación de escenarios con supuestos y recursos requeridos",
      "Plan de acciones y riesgos para revisión con el equipo"
    ],
    "inputs": "Cronograma actualizado, restricciones y disponibilidad de recursos. Cada escenario requiere validar productividad, costo y seguridad.",
    "mode": "Análisis puntual · los días recuperables se determinan tras revisar el proyecto.",
    "cta": "Solicitar análisis de recuperación",
    "brief": "Recuperación de plazo",
    "label": "Mi fecha de entrega está en riesgo"
  },
  {
    "tag": "AUTOMATIZACIÓN DE REPORTES",
    "title": "Reduce la consolidación.<br>Conserva la trazabilidad.",
    "description": "Para equipos que repiten cada semana el mismo trabajo de recopilar, ordenar y presentar información.",
    "deliverables": [
      "Mapa de fuentes y reglas del reporte",
      "Flujo automatizado con Excel o Python, según el entorno acordado",
      "Validación con datos de muestra e instrucciones de uso"
    ],
    "inputs": "Ejemplos de archivos de entrada, reporte esperado y herramientas disponibles. Integraciones y mantenimiento se cotizan según alcance.",
    "mode": "Por entregable · se define qué se automatiza y cómo se comprobará el resultado.",
    "cta": "Solicitar automatización de reportes",
    "brief": "Automatización de reportes",
    "label": "Quiero automatizar mis reportes"
  }
];

// Titles and document pages below come from the supplied CV. A document view is
// not represented as independent issuer verification. Only supplied URLs are used.
export const CERTIFICATES:Credential[]=[
  {
    "id": "msproject",
    "issuer": "LINKEDIN LEARNING",
    "title": "Advanced Microsoft Project",
    "category": "planning",
    "logo": "linkedin.webp",
    "date": "2026",
    "pages": [
      29
    ],
    "note": "Curso completado el 28 de febrero de 2026. Duración indicada: 2 horas y 12 minutos."
  },
  {
    "id": "p6",
    "issuer": "LINKEDIN LEARNING",
    "title": "Primavera P6 Essential Training",
    "category": "planning",
    "logo": "linkedin.webp",
    "date": "2026",
    "pages": [
      31
    ],
    "note": "Curso completado el 12 de mayo de 2026."
  },
  {
    "id": "evm",
    "issuer": "ALSTOM UNIVERSITY",
    "title": "Earned Value Management · Physical Progress Measurement",
    "category": "planning",
    "logo": "alstom.webp",
    "date": "2025",
    "pages": [
      21
    ],
    "note": "Certificado de finalización del curso de medición de avance físico y valor ganado."
  },
  {
    "id": "google",
    "issuer": "GOOGLE · COURSERA",
    "title": "Project Planning: Putting It All Together",
    "category": "planning",
    "logo": "google.webp",
    "date": "2026",
    "pages": [
      24
    ],
    "note": "Certificado de curso de planificación de proyectos. Fecha indicada: 21 de abril de 2026."
  },
  {
    "id": "lt",
    "issuer": "L&T EDUTECH · COURSERA",
    "title": "Project · Monitoring and Control",
    "category": "planning",
    "logo": "lt.webp",
    "date": "2026",
    "pages": [
      23
    ],
    "url": "https://coursera.org/verify/43Y6G9DLFRF4",
    "note": "Curso de seguimiento y control de proyectos. Fecha indicada: 28 de abril de 2026."
  },
  {
    "id": "kpi",
    "issuer": "QUALITY GB",
    "title": "Indicadores de Gestión · KPI",
    "category": "planning",
    "logo": "qualitygb.webp",
    "date": "2022",
    "pages": [
      28
    ],
    "note": "Certificado QGBV-221557, de fecha 20 de agosto de 2022."
  }
];
