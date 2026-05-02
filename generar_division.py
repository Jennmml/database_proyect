from docx import Document
from docx.shared import Pt, Inches, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.enum.section import WD_ORIENT

def shade_cell(cell, hex_color):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)

def header_row(table, headers, color):
    row = table.rows[0]
    for i, h in enumerate(headers):
        cell = row.cells[i]
        cell.text = h
        shade_cell(cell, color)
        for para in cell.paragraphs:
            para.paragraph_format.space_after = Pt(0)
            for run in para.runs:
                run.bold = True
                run.font.size = Pt(9)

def data_row(table, values, small=True):
    row = table.add_row()
    for i, val in enumerate(values):
        cell = row.cells[i]
        cell.text = val
        for para in cell.paragraphs:
            para.paragraph_format.space_after = Pt(0)
            for run in para.runs:
                run.font.size = Pt(8.5) if small else Pt(9)
    return row

def set_col_widths(table, widths_cm):
    for row in table.rows:
        for i, cell in enumerate(row.cells):
            if i < len(widths_cm):
                cell.width = Cm(widths_cm[i])

def add_section_heading(doc, number, title, level=1):
    h = doc.add_heading('', level=level)
    h.clear()
    run = h.add_run(f'{number}. {title}')
    run.bold = True
    if level == 1:
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(0x17, 0x37, 0x5E)
    else:
        run.font.size = Pt(11)
        run.font.color.rgb = RGBColor(0x2E, 0x54, 0x82)
    return h

def add_body(doc, text):
    p = doc.add_paragraph(text)
    p.paragraph_format.space_after = Pt(4)
    for run in p.runs:
        run.font.size = Pt(10)
    return p

def add_bullet(doc, text):
    p = doc.add_paragraph(style='List Bullet')
    run = p.add_run(text)
    run.font.size = Pt(10)
    p.paragraph_format.space_after = Pt(2)
    return p

# ─── DOCUMENT ────────────────────────────────────────────────────────────────
doc = Document()

# Margins
for sec in doc.sections:
    sec.top_margin    = Cm(2.5)
    sec.bottom_margin = Cm(2.5)
    sec.left_margin   = Cm(2.5)
    sec.right_margin  = Cm(2.0)

# Default paragraph style
style = doc.styles['Normal']
style.font.name = 'Calibri'
style.font.size = Pt(10)

# ─── PORTADA ─────────────────────────────────────────────────────────────────
doc.add_paragraph()
title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = title.add_run('División de Trabajo')
r.bold = True; r.font.size = Pt(22)
r.font.color.rgb = RGBColor(0x17, 0x37, 0x5E)

sub1 = doc.add_paragraph()
sub1.alignment = WD_ALIGN_PARAGRAPH.CENTER
r2 = sub1.add_run('Parte 2 y Parte 3 del Proyecto de Seguridad de Software')
r2.bold = True; r2.font.size = Pt(16)
r2.font.color.rgb = RGBColor(0x2E, 0x54, 0x82)

doc.add_paragraph()
info = doc.add_paragraph()
info.alignment = WD_ALIGN_PARAGRAPH.CENTER
info.add_run('Curso IC-8071 Seguridad del Software\n').font.size = Pt(11)
r3 = info.add_run('Instituto Tecnológico de Costa Rica\n')
r3.font.size = Pt(11)
info.add_run('Fecha de generación: 1 de mayo de 2026\n').font.size = Pt(10)
info.add_run('Fecha límite de entrega: 2 de junio de 2026').font.size = Pt(10)

doc.add_page_break()

# ─── SECCIÓN 1 ───────────────────────────────────────────────────────────────
add_section_heading(doc, '1', 'Contexto del Proyecto')
add_body(doc,
    'La Parte 1 del proyecto (Requerimientos de Seguridad y Threat Modeling) fue completada y entregada '
    'el 24 de marzo de 2026. Obtuvo una calificación de 100/100. Esa entrega incluyó: descripción del '
    'sistema FastFitness, identificación de activos, diagrama de flujo de datos, 12 amenazas (Threat '
    'Modeling con metodología STRIDE/CAPEC), mitigaciones propuestas, 12 requerimientos de seguridad y '
    'reflexión final. La Parte 1 no debe modificarse ni rehacerse.')
add_body(doc,
    'El presente documento se enfoca exclusivamente en la Parte 2 (Explotación de Software de Servidores, '
    'valor 15 %) y la Parte 3 (Explotación de Software en Clientes, valor 15 %), cuya fecha límite de '
    'entrega es el martes 2 de junio de 2026 antes de las 11:55 pm.')

# ─── SECCIÓN 2 ───────────────────────────────────────────────────────────────
add_section_heading(doc, '2', 'Fuente Utilizada')
add_body(doc,
    'Toda la información de este documento proviene exclusivamente del archivo oficial '
    '"Proyectos_Tarea_Programada_Seguridad_del_Software_PARTE_2_y_3.pdf". No se ha añadido ningún '
    'requisito, tarea, herramienta, criterio ni responsabilidad que no esté explícitamente indicado '
    'en dicho documento. Las estimaciones de tiempo no están especificadas en el documento fuente y '
    'se presentan como aproximadas.')
p_note = doc.add_paragraph()
p_note.paragraph_format.space_after = Pt(4)
rn = p_note.add_run('Nota sobre inconsistencia en el documento fuente: ')
rn.bold = True; rn.font.size = Pt(10)
rn2 = p_note.add_run(
    'El documento indica para la Parte 3, Sección B: "5 correcciones de diferente naturaleza, '
    '1 por cada miembro del equipo". El equipo tiene 4 integrantes, por lo que la cifra "5" es '
    'inconsistente. Esto no se aclara en el documento. La presente división aplica la regla general '
    '"2 correcciones de diferente naturaleza por persona del equipo" como criterio rector, distribuyendo '
    'las 2 correcciones totales de la Sección C entre 2 personas (1 cada una) y asignando correcciones '
    'adicionales de tipo Sección B a los otros 2 integrantes para completar su cuota de 2.')
rn2.font.size = Pt(10); rn2.font.italic = True

# ─── SECCIÓN 3 ───────────────────────────────────────────────────────────────
add_section_heading(doc, '3', 'Análisis de Dependencias')
add_body(doc,
    'El trabajo tiene estructura mixta: gran parte puede ejecutarse en paralelo, pero hay tareas '
    'que deben respetar un orden secuencial.')

p_h2 = doc.add_paragraph()
rh = p_h2.add_run('Trabajo en cascada (secuencial obligatorio):')
rh.bold = True; rh.font.size = Pt(10)

cascade = [
    'Las correcciones de código (P2 y P3) deben realizarse antes de redactar las secciones del informe técnico.',
    'Las pruebas automatizadas (Sec. C) dependen de que existan correcciones implementadas para demostrar el comportamiento antes/después.',
    'El logging y tracing (Sec. C) requiere identificar primero las rutas vulnerables, lo que ocurre durante las correcciones de P2 y P3-B.',
    'El video demo depende de tener correcciones funcionales y pruebas ejecutables.',
    'La compilación final del informe técnico depende de que todos los integrantes entreguen sus secciones.',
    'Los Pull Requests deben crearse antes de la entrega final; ningún integrante puede hacer push directo al main branch.',
]
for item in cascade:
    add_bullet(doc, item)

doc.add_paragraph()
p_h2b = doc.add_paragraph()
rhb = p_h2b.add_run('Trabajo en paralelo (puede realizarse simultáneamente):')
rhb.bold = True; rhb.font.size = Pt(10)

parallel = [
    'Cada integrante trabaja en su branch de Git de forma independiente desde el primer día.',
    'Las correcciones de Parte 2 (servidor) y Parte 3 Sección B (cliente) pueden avanzar en paralelo entre los 4 integrantes.',
    'Cada integrante redacta su sección del informe técnico y del README.md en paralelo.',
    'Los segmentos del video pueden grabarse en paralelo y editarse al final.',
    'La configuración inicial del repositorio (clonación y creación de branches) puede realizarse el primer día por todos simultáneamente.',
]
for item in parallel:
    add_bullet(doc, item)

doc.add_paragraph()
p_h2c = doc.add_paragraph()
rhc = p_h2c.add_run('Dependencia crítica:')
rhc.bold = True; rhc.font.size = Pt(10)
add_body(doc,
    'Las correcciones de la Sección C (logging, pruebas automatizadas, audit poisoning) deben iniciarse '
    'una vez que las correcciones de Parte 2 y Parte 3 Sección B estén suficientemente avanzadas, ya que '
    'deben cubrir las rutas que antes eran vulnerables. Se recomienda iniciar la Sección C en la segunda '
    'semana de trabajo.')

# ─── SECCIÓN 4 ───────────────────────────────────────────────────────────────
doc.add_page_break()
add_section_heading(doc, '4', 'Tabla General de Tareas Identificadas')
add_body(doc, 'Todas las tareas provienen directamente del documento de especificaciones.')

t4_headers = [
    'Parte del\nproyecto',
    'Tarea o entregable',
    'Descripción según el documento',
    'Dependencias',
    'Tiempo\nestimado*',
    'Observaciones',
]

t4_data = [
    ['Parte 2\n(Sec. A)',
     '8 correcciones de servidor\n(2 por persona)',
     'Identificar y corregir: (1) puntos de inyección (SQL, comandos, parámetros), (2) controles de acceso para prevenir escalación de privilegios, (3) defensa para explotación de la confianza (no confiar en datos del cliente para decisiones críticas). Deben ser de diferente naturaleza.',
     'Ninguna.\nPuede iniciar desde el principio.',
     '~3–5 días\npor persona',
     'Los tipos listados son ejemplos del documento, no una lista cerrada.'],

    ['Parte 2\n(Sec. A)',
     'Pruebas asociadas a cada corrección de servidor',
     'Tests que fallen en la versión vulnerable y pasen con la versión corregida. Puede ser capturas con descripción o casos de prueba individuales (unit/integration).',
     'Depende de las correcciones de Parte 2.',
     '~1–2 días\npor persona',
     'Obligatorio por cada corrección. Evaluado en criterio "Corrección funcional y pruebas" (25 pts).'],

    ['Parte 3\n(Sec. B)',
     'Correcciones del lado cliente\n("5 correcciones, 1 por miembro"\nsegún doc. — inconsistente con equipo de 4)',
     'Localizar y arreglar: (1) vulnerabilidad con el cliente como objeto de ataque (manejo inseguro de datos, deserialización insegura), (2) XSS o exposición de client scripts que permitan ejecución de código malicioso, (3) asegurar que el cliente sanea/escapa datos antes de renderizar o ejecutar.',
     'Puede iniciarse en paralelo con Parte 2.',
     '~2–3 días\npor persona',
     'Ver nota de inconsistencia en Sección 2 de este documento. El doc. dice "5" para equipo de 4.'],

    ['Parte 3\n(Sec. C)',
     'Logging y tracing para rutas vulnerables\n(1 de las 2 correcciones totales de Sec. C)',
     'Añadir o mejorar trazas (tracing) y logging relevante para las rutas vulnerables. Con atención a no loguear secretos en claro.',
     'Requiere conocer las rutas vulnerables (P2 y P3-B avanzadas).',
     '~1–2 días\n(distribuido entre\n2 personas)',
     'El documento especifica 2 correcciones TOTALES para toda la Sección C. No 1 por persona.'],

    ['Parte 3\n(Sec. C)',
     'Pruebas automatizadas + mecanismos anti-audit poisoning\n(2ª de las 2 correcciones totales de Sec. C)',
     '(a) Implementar pruebas automatizadas que reproduzcan solicitudes que antes explotaban la vulnerabilidad (unit/integration tests). (b) Proponer y documentar mecanismos para reducir riesgo de audit poisoning (logs append-only, firma o hashing de logs, envío a colector remoto).',
     'Depende de correcciones de P2 y P3-B; depende también del logging (Sec. C item anterior).',
     '~1–2 días\n(distribuido entre\n2 personas)',
     'Son 2 actividades dentro de la misma corrección total de Sec. C. El documento las agrupa bajo Sec. C.'],

    ['Partes 2 y 3\n(entregable\ncompartido)',
     'Informe técnico Word\n(máx. 20 páginas)',
     'Portada, resumen ejecutivo, vulnerabilidades identificadas (archivo/clase/función + CWE/OWASP), descripción de corrección aplicada (qué y por qué), evidencias de pruebas (logs, capturas antes/después), recomendaciones de diseño, declaración de cumplimiento firmada por cada miembro, link al video.',
     'Depende de correcciones y pruebas completadas.',
     '~3–4 días\nen total\n(coordinado)',
     'Máx. 20 páginas con portada. Formato Word editable. Sección de cada integrante + compilación final.'],

    ['Partes 2 y 3\n(entregable\ncompartido)',
     'Video demo\n(máx. 6 minutos total)',
     'Cada estudiante aparece con cámara encendida explicando su parte: prueba que fallaba en versión vulnerable y cómo pasa con la corrección. Pueden ser videos separados editados manualmente.',
     'Depende de correcciones funcionales y pruebas ejecutables.',
     '~1–2 días\n(~1.5 h\npor persona)',
     'No exceder 6 minutos en total. El doc. dice "4–10 min" pero también "no debe exceder los 6 minutos en total".'],

    ['Partes 2 y 3\n(entregable\ncompartido)',
     'README.md con pasos de reproducción\n(máx. 5 páginas)',
     'Cómo ejecutar la app vulnerable, ejecutar las pruebas y comprobar las correcciones. Cada estudiante debe tener una sección exclusiva describiendo su aporte.',
     'Depende de correcciones implementadas.',
     '~1 día\nen total\n(~0.5 h\npor persona)',
     'Máx. 5 páginas. Sección individual obligatoria por estudiante.'],

    ['Partes 2 y 3\n(entregable\ncompartido)',
     'Repositorio Git\n(branches, commits, PRs)',
     'Branch local por integrante (iniciales del nombre). Commits descriptivos; conservar historial para evaluación. PR antes de la entrega final con descripción de cambios y riesgos. Prohibido push directo al main branch.',
     'Puede configurarse desde el primer día.',
     'Continuo durante\ntodo el proyecto',
     'Evaluado como "Workflow y buenas prácticas Git/PR/tests" (10 pts). Scripts curl/Postman en carpeta tests/ si aplica.'],
]

t4 = doc.add_table(rows=1, cols=len(t4_headers))
t4.style = 'Table Grid'
header_row(t4, t4_headers, 'BDD7EE')
for row_vals in t4_data:
    data_row(t4, row_vals)

set_col_widths(t4, [2.0, 3.5, 5.5, 3.2, 2.0, 3.5])

doc.add_paragraph()
pn4 = doc.add_paragraph()
rn4 = pn4.add_run('* Tiempo estimado aproximado. No especificado en el documento de especificaciones.')
rn4.font.size = Pt(9); rn4.font.italic = True

# ─── SECCIÓN 5 ───────────────────────────────────────────────────────────────
doc.add_page_break()
add_section_heading(doc, '5', 'División Equitativa para 4 Personas')
add_body(doc,
    'Cada bloque corresponde a 1 integrante del equipo. Los 4 bloques tienen carga equivalente en '
    'número de correcciones (4 cada uno: 2 de servidor + 2 de cliente/logging), pruebas, documentación '
    'y participación en el video. Los bloques 3 y 4 incluyen tareas adicionales de coordinación de '
    'entregables compartidos.')

t5_headers = [
    'Bloque de\ntrabajo',
    'Parte del\nproyecto',
    'Tareas incluidas',
    'Encargado',
    'Tiempo estimado\ndel bloque',
    'Dependencias',
    'Entregable esperado',
    'Observaciones',
]

t5_data = [
    [
        'Bloque 1\n\nInyecciones\nen Servidor\n+\nVulnerabilidades\nde Cliente',
        'Parte 2 (Sec. A)\nParte 3 (Sec. B)',
        (
            '[P2-1] Corrección de punto de inyección en servidor '
            '(ej. SQL injection, inyección de comandos o parámetros).\n'
            '[P2-2] Segunda corrección servidor, naturaleza diferente.\n'
            '[P3-B-1] Corrección vulnerabilidad cliente como objeto de ataque '
            '(ej. manejo inseguro de datos recibidos, deserialización insegura).\n'
            '[P3-B-2] Segunda corrección tipo Sec. B, naturaleza diferente '
            '(ej. saneamiento/escape de datos antes de renderizar).\n'
            'Tests (antes/después) para cada corrección.\n'
            'Sección individual en el informe técnico.\n'
            'Segmento de video (~1–1.5 min, cámara encendida).\n'
            'Sección exclusiva en README.md.\n'
            'Branch Git (iniciales) + PR antes de entrega.'
        ),
        '______________________',
        '~30–35 h\n(≈2–3 semanas\na tiempo parcial)',
        'Ninguna.\nPuede iniciar\ndesde el día 1.',
        '4 correcciones con tests\nSecciones del informe\nSegmento de video\nSección en README\nBranch y PR en Git',
        'Las correcciones P3-B pueden avanzar en paralelo con P2. No hay dependencia entre bloques.'
    ],
    [
        'Bloque 2\n\nControl de\nAcceso\n+\nXSS\n+\nLogging',
        'Parte 2 (Sec. A)\nParte 3 (Sec. B)\nParte 3 (Sec. C)',
        (
            '[P2-1] Corrección de control de acceso para prevenir escalación '
            'de privilegios (ej. validar roles, chequear objetos por propietario).\n'
            '[P2-2] Segunda corrección servidor, naturaleza diferente.\n'
            '[P3-B-1] Corrección de XSS o exposición de client scripts que '
            'permitan ejecución de código malicioso en el cliente.\n'
            '[P3-C-1] Logging y tracing relevante para las rutas vulnerables '
            '(1ª de las 2 correcciones totales de Sec. C; no loguear secretos).\n'
            'Tests (antes/después) para cada corrección.\n'
            'Sección individual en el informe técnico.\n'
            'Segmento de video (~1–1.5 min, cámara encendida).\n'
            'Sección exclusiva en README.md.\n'
            'Branch Git (iniciales) + PR antes de entrega.'
        ),
        '______________________',
        '~30–35 h\n(≈2–3 semanas\na tiempo parcial)',
        'P3-C-1 (logging)\ndepende de tener\nidentificadas las\nrutas vulnerables\n(P2 y P3-B\navanzadas).',
        '4 correcciones con tests\nSecciones del informe\nSegmento de video\nSección en README\nBranch y PR en Git',
        'Coordinar con Bloque 3 para no duplicar rutas de logging. P2 y P3-B inician en paralelo con los demás bloques.'
    ],
    [
        'Bloque 3\n\nDefensa de\nConfianza\n+\nPruebas Auto.\n+\nCoordina\nREADME',
        'Parte 2 (Sec. A)\nParte 3 (Sec. B)\nParte 3 (Sec. C)',
        (
            '[P2-1] Defensa para la explotación de la confianza (ej. no confiar '
            'en datos del cliente para decisiones críticas, validar en servidor).\n'
            '[P2-2] Segunda corrección servidor, naturaleza diferente.\n'
            '[P3-B-1] Corrección de vulnerabilidad cliente, naturaleza diferente '
            'a los Bloques 1 y 2.\n'
            '[P3-C-2] Pruebas automatizadas (unit/integration) que reproduzcan '
            'solicitudes que antes explotaban la vulnerabilidad + propuesta y '
            'documentación de mecanismos anti-audit poisoning (2ª corrección total Sec. C).\n'
            'Tests (antes/después) para cada corrección.\n'
            'Sección individual en el informe técnico.\n'
            'Segmento de video (~1–1.5 min, cámara encendida).\n'
            'Sección exclusiva en README.md.\n'
            'Compilación y entrega del README.md final (integrar secciones de los 4).\n'
            'Branch Git (iniciales) + PR antes de entrega.'
        ),
        '______________________',
        '~32–38 h\n(≈2–3 semanas\na tiempo parcial)\n+~2 h por\ncompilación README',
        'P3-C-2 depende\nde P2 y P3-B\navanzadas y de\nP3-C-1 (Bloque 2).\nREADME final\ndepende de todos.',
        '4 correcciones con tests\nSecciones del informe\nSegmento de video\nREADME.md final compilado\nBranch y PR en Git',
        'Responsable de integrar el README.md final con las secciones de los 4 integrantes. P3-C-2 coordinar con Bloque 2.'
    ],
    [
        'Bloque 4\n\nCorrecciones\nMixtas\n+\nCompilación\nInforme\nTécnico',
        'Parte 2 (Sec. A)\nParte 3 (Sec. B)',
        (
            '[P2-1] Corrección de servidor, naturaleza diferente a Bloques 1–3.\n'
            '[P2-2] Segunda corrección servidor, naturaleza diferente.\n'
            '[P3-B-1] Corrección cliente, naturaleza diferente a Bloques 1–3.\n'
            '[P3-B-2] Segunda corrección tipo Sec. B, naturaleza diferente.\n'
            'Tests (antes/después) para cada corrección.\n'
            'Portada, resumen ejecutivo, recomendaciones de diseño y declaración '
            'de cumplimiento (informe técnico — secciones compartidas).\n'
            'Sección individual en el informe técnico.\n'
            'Compilación y entrega del informe técnico Word final.\n'
            'Segmento de video (~1–1.5 min, cámara encendida).\n'
            'Sección exclusiva en README.md.\n'
            'Branch Git (iniciales) + PR antes de entrega.'
        ),
        '______________________',
        '~33–40 h\n(≈2–3 semanas\na tiempo parcial)\n+~3 h por\ncompilación informe',
        'Compilación del\ninforme técnico\ndepende de que\ntodos entreguen\nsus secciones.',
        '4 correcciones con tests\nInforme técnico Word final\nDeclaración de cumplimiento\nSegmento de video\nSección en README\nBranch y PR en Git',
        'Responsable de compilar el informe técnico final. Coordinar recepción de secciones. Debe incluir declaración de cumplimiento firmada por todos.'
    ],
]

t5 = doc.add_table(rows=1, cols=len(t5_headers))
t5.style = 'Table Grid'
header_row(t5, t5_headers, 'E2EFDA')
for row_vals in t5_data:
    data_row(t5, row_vals)

set_col_widths(t5, [2.2, 2.0, 5.5, 2.5, 2.3, 2.5, 3.2, 3.0])

doc.add_paragraph()
pn5 = doc.add_paragraph()
rn5 = pn5.add_run('* Los tiempos son estimaciones aproximadas no especificadas en el documento fuente.')
rn5.font.size = Pt(9); rn5.font.italic = True

# ─── SECCIÓN 6 ───────────────────────────────────────────────────────────────
doc.add_page_break()
add_section_heading(doc, '6', 'Resumen de Tiempos')

t6_headers = [
    'Bloque de trabajo',
    'Tiempo estimado*',
    'Puede iniciarse\ndesde el principio',
    'Depende de',
    'Riesgo de retraso',
]
t6_data = [
    ['Bloque 1\n(Inyecciones + Vulnerabilidades Cliente)',
     '~30–35 h\n(≈2–3 sem. parcial)',
     'Sí',
     'Ninguna',
     'Bajo'],
    ['Bloque 2\n(Control de Acceso + XSS + Logging)',
     '~30–35 h\n(≈2–3 sem. parcial)',
     'Parcialmente.\nP3-C-1 inicia cuando\nP2 y P3-B estén avanzadas.',
     'P3-C-1 depende de P2\ny P3-B (Bloque 2 mismo).',
     'Medio\n(por P3-C-1)'],
    ['Bloque 3\n(Defensa de Confianza + Pruebas Auto. + README)',
     '~32–38 h\n(≈2–3 sem. parcial)',
     'Parcialmente.\nP3-C-2 y README al final.',
     'P3-C-2 depende de P2,\nP3-B y P3-C-1 (Bloque 2).\nREADME depende de todos.',
     'Medio–Alto\n(por P3-C-2 y coordinación)'],
    ['Bloque 4\n(Correcciones Mixtas + Informe final)',
     '~33–40 h\n(≈2–3 sem. parcial)',
     'Parcialmente.\nCompilación del informe\nal final del proyecto.',
     'Compilación depende\nde todos los bloques\nentregar sus secciones.',
     'Alto\n(cuello de botella:\ninforme final)'],
    ['Entregables compartidos\n(video, informe, README)',
     '~5–8 h por persona\n(adicional a correcciones)',
     'No',
     'Correcciones completadas',
     'Medio'],
    ['TOTAL por persona (estimado)',
     '~30–40 h activas',
     'N/A', 'N/A', 'N/A'],
]

t6 = doc.add_table(rows=1, cols=len(t6_headers))
t6.style = 'Table Grid'
header_row(t6, t6_headers, 'FCE4D6')
for row_vals in t6_data:
    data_row(t6, row_vals)

set_col_widths(t6, [4.5, 3.0, 3.5, 4.0, 2.5])

doc.add_paragraph()
pn6 = doc.add_paragraph()
rn6 = pn6.add_run('* Tiempos estimados aproximados. No especificados en el documento fuente. '
                   'Considerar disponibilidad real de cada integrante antes de la fecha límite del 2 de junio de 2026.')
rn6.font.size = Pt(9); rn6.font.italic = True

# ─── SECCIÓN 7 ───────────────────────────────────────────────────────────────
add_section_heading(doc, '7', 'Recomendación de Orden de Trabajo')
add_body(doc,
    'El orden recomendado se basa en las dependencias reales identificadas en el documento de especificaciones.')

fases = [
    ('Fase 1 — Configuración inicial\n(Día 1 — todos en paralelo)',
     'Todos los integrantes: clonar el repositorio original, crear el branch personal identificado con '
     'las iniciales del nombre. Leer el documento de especificaciones y acordar la asignación de tipos '
     'de correcciones para evitar duplicados entre bloques.'),

    ('Fase 2 — Correcciones de Parte 2 y Parte 3 Sección B\n(Semanas 1–3 — todos en paralelo)',
     'Cada integrante trabaja de forma independiente en sus 2 correcciones de servidor (Parte 2) y '
     'sus correcciones de cliente tipo Sección B (Parte 3). Commits descriptivos por cada corrección. '
     'Se incluyen las pruebas (tests) que demuestran el comportamiento antes/después. Esta fase '
     'puede y debe avanzar simultáneamente para los 4 bloques.'),

    ('Fase 3 — Correcciones de Parte 3 Sección C\n(Semana 2–3 — Bloques 2 y 3, con coordinación)',
     'Una vez identificadas las rutas vulnerables, los responsables de Sección C '
     '(Bloques 2 y 3) implementan: el logging/tracing (Bloque 2) y las pruebas automatizadas + '
     'mecanismos anti-audit poisoning (Bloque 3). Ambos deben coordinarse para cubrir rutas '
     'diferentes y no duplicar trabajo.'),

    ('Fase 4 — Documentación y entregables\n(Semana 3–4 — todos en paralelo)',
     'Cada integrante redacta su sección del informe técnico (vulnerabilidades, correcciones, '
     'evidencias) y su sección del README.md. Se graban los segmentos individuales del video. '
     'El responsable del Bloque 3 compila el README.md final. El responsable del Bloque 4 '
     'integra el informe técnico completo (portada, resumen ejecutivo, recomendaciones de diseño, '
     'declaración de cumplimiento firmada por todos) y edita el video final.'),

    ('Fase 5 — Pull Requests, revisión y entrega\n(Días finales antes del 2 de junio)',
     'Cada integrante crea su Pull Request con todas las correcciones y pruebas. El equipo revisa '
     'los PRs. Se verifica que estén presentes todos los entregables: repositorio con ramas/commits/PRs, '
     'informe técnico Word, video ≤ 6 min, README.md. Recordar: prohibido hacer push directo al '
     'main branch; todo debe pasar por un PR.'),
]

for fase_titulo, fase_desc in fases:
    p_ft = doc.add_paragraph()
    p_ft.paragraph_format.space_after = Pt(2)
    rft = p_ft.add_run(fase_titulo)
    rft.bold = True; rft.font.size = Pt(10)
    add_body(doc, fase_desc)
    doc.add_paragraph()

# ─── SECCIÓN 8 ───────────────────────────────────────────────────────────────
add_section_heading(doc, '8', 'Espacio para Asignación Final del Equipo')
add_body(doc,
    'Una vez que el equipo acuerde la distribución, completar la siguiente tabla. '
    'Los nombres de los encargados quedan en blanco para que el equipo los asigne.')

t8_headers = ['Persona', 'Bloque elegido', 'Firma o confirmación']
t8_data = [
    ['Persona 1: ______________________', '', ''],
    ['Persona 2: ______________________', '', ''],
    ['Persona 3: ______________________', '', ''],
    ['Persona 4: ______________________', '', ''],
]

t8 = doc.add_table(rows=1, cols=len(t8_headers))
t8.style = 'Table Grid'
header_row(t8, t8_headers, 'D9E1F2')

for rd in t8_data:
    row = t8.add_row()
    for i, val in enumerate(rd):
        row.cells[i].text = val
        for para in row.cells[i].paragraphs:
            para.paragraph_format.space_after = Pt(0)
            for run in para.runs:
                run.font.size = Pt(10)
                if i == 0:
                    run.bold = True
        if i == 1:
            row.cells[i].paragraphs[0].paragraph_format.space_before = Pt(20)
            row.cells[i].paragraphs[0].paragraph_format.space_after = Pt(20)
        if i == 2:
            row.cells[i].paragraphs[0].paragraph_format.space_before = Pt(20)
            row.cells[i].paragraphs[0].paragraph_format.space_after = Pt(20)

set_col_widths(t8, [6.0, 7.0, 6.0])

# Nota final
doc.add_paragraph()
pnf = doc.add_paragraph()
rnf1 = pnf.add_run('Nota final: ')
rnf1.bold = True; rnf1.font.size = Pt(10)
rnf2 = pnf.add_run(
    'Este documento fue generado con base exclusiva en el documento oficial de especificaciones. '
    'Los tiempos indicados son estimaciones aproximadas y no forman parte del documento fuente. '
    'El equipo debe adaptar los tiempos según su disponibilidad real antes de la fecha límite del '
    '2 de junio de 2026. Ningún nombre de encargado ha sido completado; la asignación final es '
    'responsabilidad del equipo.')
rnf2.font.size = Pt(10)

# ─── GUARDAR ─────────────────────────────────────────────────────────────────
out_path = r'C:\Users\lmira\OneDrive\Documents\DataBaseProyect\division_trabajo_parte2_3.docx'
doc.save(out_path)
print(f'Documento guardado en: {out_path}')
