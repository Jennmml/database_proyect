from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def shade(cell, hex_color):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)

def make_table(doc, headers, rows, col_widths, header_color):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = 'Table Grid'
    for i, h in enumerate(headers):
        c = t.rows[0].cells[i]
        c.text = h
        shade(c, header_color)
        for p in c.paragraphs:
            for r in p.runs:
                r.bold = True; r.font.size = Pt(9)
            p.paragraph_format.space_after = Pt(0)
    for ri, row_vals in enumerate(rows):
        for ci, val in enumerate(row_vals):
            c = t.rows[ri + 1].cells[ci]
            c.text = val
            for p in c.paragraphs:
                for r in p.runs:
                    r.font.size = Pt(9)
                p.paragraph_format.space_after = Pt(0)
    for row in t.rows:
        for i, cell in enumerate(row.cells):
            if i < len(col_widths):
                cell.width = Cm(col_widths[i])
    return t

doc = Document()
for sec in doc.sections:
    sec.top_margin    = Cm(2.5)
    sec.bottom_margin = Cm(2.5)
    sec.left_margin   = Cm(3.0)
    sec.right_margin  = Cm(2.5)
doc.styles['Normal'].font.name = 'Calibri'
doc.styles['Normal'].font.size = Pt(10)

# ── TÍTULO ────────────────────────────────────────────────────────────────────
t = doc.add_paragraph()
t.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = t.add_run('División de Trabajo — Parte 2 y Parte 3')
r.bold = True; r.font.size = Pt(16)
r.font.color.rgb = RGBColor(0x17, 0x37, 0x5E)

s = doc.add_paragraph()
s.alignment = WD_ALIGN_PARAGRAPH.CENTER
s.add_run('Proyecto de Seguridad de Software — IC-8071 | Fecha límite: 2 de junio 2026').font.size = Pt(10)

doc.add_paragraph()

# ── CONTEXTO ──────────────────────────────────────────────────────────────────
p = doc.add_paragraph()
p.add_run('Contexto: ').bold = True
p.add_run(
    'La Parte 1 fue entregada y aprobada (100/100). Este documento divide el trabajo '
    'de la Parte 2 (Servidores, 15 %) y Parte 3 (Clientes, 15 %) entre 4 personas, '
    'basado únicamente en el documento de especificaciones. Fecha límite: 2 de junio 2026.'
).font.size = Pt(10)

doc.add_paragraph()

# ── TABLA 1: RESUMEN DE CORRECCIONES ─────────────────────────────────────────
h1 = doc.add_paragraph()
h1.add_run('Correcciones requeridas por el documento de especificaciones').bold = True

make_table(doc,
    headers=['Parte / Sección', 'Tipo de corrección', 'Cantidad requerida'],
    rows=[
        ['Parte 2 — Servidor',
         '2 correcciones de diferente naturaleza por persona:\n'
         '  • Punto de inyección (SQL, comandos o parámetros)\n'
         '  • Control de acceso / prevenir escalación de privilegios\n'
         '  • Defensa para explotación de la confianza',
         '8 en total\n(2 por persona)'],
        ['Parte 3 — Sección B\n(Cliente)',
         '1 corrección por persona:\n'
         '  • Vulnerabilidad con el cliente como objeto de ataque\n'
         '  • XSS o exposición de client scripts\n'
         '  • Saneamiento/escape de datos antes de renderizar',
         '4 en total\n(1 por persona)*'],
        ['Parte 3 — Sección C\n(Logging y Tests)',
         '2 correcciones en total para el equipo:\n'
         '  • Logging y tracing para rutas vulnerables\n'
         '  • Pruebas automatizadas que reproduzcan solicitudes de ataque\n'
         '  • Mecanismos anti-audit poisoning',
         '2 en total\n(equipo)'],
    ],
    col_widths=[3.5, 10.0, 3.0],
    header_color='BDD7EE'
)

doc.add_paragraph()

# ── TABLA 2: DIVISIÓN ESPECÍFICA ──────────────────────────────────────────────
h2 = doc.add_paragraph()
h2.add_run('División específica para 4 personas').bold = True
h2s = doc.add_paragraph()
h2s.add_run('Cada persona realiza 4 correcciones en total (2 de servidor + 2 de cliente), '
            'más su aporte a los entregables compartidos.').font.size = Pt(9)

make_table(doc,
    headers=['Bloque', 'Corrección', 'Parte', 'Tipo según el documento', 'Encargado'],
    rows=[
        # BLOQUE 1
        ['Bloque 1', '#1 de 4', 'Parte 2\n(Servidor)',
         '1 corrección de inyección en servidor\n(SQL, inyección de comandos o de parámetros)',
         '______________________'],
        ['', '#2 de 4', 'Parte 2\n(Servidor)',
         '1 corrección de control de acceso\n(validar roles, prevenir escalación de privilegios)',
         ''],
        ['', '#3 de 4', 'Parte 3\n(Cliente — Sec. B)',
         '1 corrección de vulnerabilidad con el cliente como objeto de ataque\n(manejo inseguro de datos o deserialización insegura)',
         ''],
        ['', '#4 de 4', 'Parte 3\n(Cliente — Sec. B)',
         '1 corrección de saneamiento/escape de datos\nen el cliente antes de renderizar o ejecutar',
         ''],
        ['', 'Entregables', 'Partes 2 y 3',
         'Pruebas antes/después por cada corrección · Sección en el informe técnico · Segmento de video · Sección en README',
         ''],

        # BLOQUE 2
        ['Bloque 2', '#1 de 4', 'Parte 2\n(Servidor)',
         '1 corrección de inyección en servidor\n(tipo diferente al de Bloque 1)',
         '______________________'],
        ['', '#2 de 4', 'Parte 2\n(Servidor)',
         '1 defensa para explotación de la confianza\n(no confiar en datos del cliente para decisiones críticas)',
         ''],
        ['', '#3 de 4', 'Parte 3\n(Cliente — Sec. B)',
         '1 corrección de XSS o exposición de client scripts\nque permitan ejecución de código malicioso',
         ''],
        ['', '#4 de 4', 'Parte 3\n(Cliente — Sec. C)',
         '1 corrección de logging y tracing\npara rutas vulnerables (sin loguear secretos en claro)',
         ''],
        ['', 'Entregables', 'Partes 2 y 3',
         'Pruebas antes/después por cada corrección · Sección en el informe técnico · Segmento de video · Sección en README',
         ''],

        # BLOQUE 3
        ['Bloque 3', '#1 de 4', 'Parte 2\n(Servidor)',
         '1 corrección de control de acceso\n(diferente endpoint o caso al de Bloque 1)',
         '______________________'],
        ['', '#2 de 4', 'Parte 2\n(Servidor)',
         '1 defensa para explotación de la confianza\n(diferente caso al de Bloque 2)',
         ''],
        ['', '#3 de 4', 'Parte 3\n(Cliente — Sec. B)',
         '1 corrección de vulnerabilidad con el cliente como objeto de ataque\n(diferente caso al de Bloque 1)',
         ''],
        ['', '#4 de 4', 'Parte 3\n(Cliente — Sec. C)',
         '1 corrección de pruebas automatizadas que reproduzcan solicitudes de ataque\n+ propuesta de mecanismos anti-audit poisoning',
         ''],
        ['', 'Entregables', 'Partes 2 y 3',
         'Pruebas antes/después por cada corrección · Sección en el informe técnico · Segmento de video · Sección en README · Compila README.md final',
         ''],

        # BLOQUE 4
        ['Bloque 4', '#1 de 4', 'Parte 2\n(Servidor)',
         '1 corrección de inyección en servidor\n(diferente ruta/caso a los Bloques 1 y 2)',
         '______________________'],
        ['', '#2 de 4', 'Parte 2\n(Servidor)',
         '1 corrección de control de acceso\n(diferente caso a los Bloques 1 y 3)',
         ''],
        ['', '#3 de 4', 'Parte 3\n(Cliente — Sec. B)',
         '1 corrección de XSS o exposición de client scripts\n(diferente caso al de Bloque 2)',
         ''],
        ['', '#4 de 4', 'Parte 3\n(Cliente — Sec. B)',
         '1 corrección de saneamiento/escape de datos\n(diferente caso al de Bloque 1)',
         ''],
        ['', 'Entregables', 'Partes 2 y 3',
         'Pruebas antes/después por cada corrección · Sección en el informe técnico · Segmento de video · Sección en README · Compila informe técnico final (portada, resumen, declaración de cumplimiento)',
         ''],
    ],
    col_widths=[1.8, 1.6, 2.5, 8.0, 3.5],
    header_color='E2EFDA'
)

# Colorear filas de "Entregables"
entregable_rows = [4, 9, 14, 19]
for idx in entregable_rows:
    for cell in doc.tables[-1].rows[idx + 1].cells:
        shade(cell, 'F2F2F2')
        for p in cell.paragraphs:
            for r in p.runs:
                r.font.italic = True

# Colorear filas de encabezado de bloque
bloque_rows = [0, 5, 10, 15]
for idx in bloque_rows:
    shade(doc.tables[-1].rows[idx + 1].cells[0], 'D9E1F2')
    for p in doc.tables[-1].rows[idx + 1].cells[0].paragraphs:
        for r in p.runs:
            r.bold = True

doc.add_paragraph()
pn = doc.add_paragraph()
pn.add_run(
    '* El documento indica "5 correcciones, 1 por miembro" en Sec. B para un equipo de 4 (inconsistencia no aclarada). '
    'Se aplica la regla de 2 correcciones por persona en Parte 3: Bloques 2 y 3 usan 1 corrección de Sec. B + 1 de Sec. C; '
    'Bloques 1 y 4 usan 2 correcciones de Sec. B.'
).font.size = Pt(8.5)
doc.paragraphs[-1].runs[-1].font.italic = True

doc.add_paragraph()

# ── TABLA 3: ENTREGABLES COMPARTIDOS ─────────────────────────────────────────
h3 = doc.add_paragraph()
h3.add_run('Entregables compartidos (todos los bloques contribuyen)').bold = True

make_table(doc,
    headers=['Entregable', 'Contenido según el documento', 'Responsable de compilar'],
    rows=[
        ['Informe técnico Word\n(máx. 20 páginas)',
         'Portada · Resumen ejecutivo · Vulnerabilidades (archivo/clase/función + CWE/OWASP) · '
         'Descripción de corrección · Evidencias antes/después · Recomendaciones de diseño · '
         'Declaración de cumplimiento firmada · Link al video',
         'Bloque 4\n(cada uno aporta su sección)'],
        ['Video demo\n(máx. 6 min total)',
         'Cada estudiante aparece con cámara encendida explicando su parte. '
         'Pueden ser videos separados editados en uno.',
         'Bloque 4\n(edición final)'],
        ['README.md\n(máx. 5 páginas)',
         'Cómo ejecutar la app vulnerable, ejecutar pruebas y verificar correcciones. '
         'Sección exclusiva por estudiante.',
         'Bloque 3\n(cada uno aporta su sección)'],
        ['Repositorio Git',
         'Branch por integrante (iniciales) · Commits descriptivos · '
         'PR antes de entrega final · Prohibido push directo a main · '
         'Carpeta tests/ con evidencias antes/después',
         'Cada integrante\nen su propio branch'],
    ],
    col_widths=[3.5, 9.5, 3.5],
    header_color='FCE4D6'
)

doc.add_paragraph()

# ── TABLA 4: ASIGNACIÓN FINAL ─────────────────────────────────────────────────
h4 = doc.add_paragraph()
h4.add_run('Asignación final del equipo').bold = True

make_table(doc,
    headers=['Persona', 'Bloque elegido', 'Firma o confirmación'],
    rows=[
        ['Persona 1: ______________________', '', ''],
        ['Persona 2: ______________________', '', ''],
        ['Persona 3: ______________________', '', ''],
        ['Persona 4: ______________________', '', ''],
    ],
    col_widths=[6.5, 6.5, 5.5],
    header_color='D9E1F2'
)
for row in doc.tables[-1].rows[1:]:
    for cell in row.cells[1:]:
        cell.paragraphs[0].paragraph_format.space_before = Pt(16)
        cell.paragraphs[0].paragraph_format.space_after  = Pt(16)

out = r'C:\Users\lmira\OneDrive\Documents\DataBaseProyect\division_trabajo_parte2_3.docx'
doc.save(out)
print('Guardado:', out)
