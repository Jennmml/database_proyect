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
                r.bold = True
                r.font.size = Pt(9)
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

style = doc.styles['Normal']
style.font.name = 'Calibri'
style.font.size = Pt(10)

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
h1 = doc.add_paragraph()
h1.add_run('Contexto').bold = True

doc.add_paragraph(
    'La Parte 1 fue entregada y aprobada (100/100). Este documento divide el trabajo de '
    'la Parte 2 (Explotación de Servidores, 15 %) y la Parte 3 (Explotación de Clientes, 15 %) '
    'entre 4 personas, basándose únicamente en el documento de especificaciones.'
)

doc.add_paragraph()

# ── TABLA 1: TAREAS POR PARTE ─────────────────────────────────────────────────
h2 = doc.add_paragraph()
h2.add_run('Tareas según el documento de especificaciones').bold = True

make_table(doc,
    headers=['Parte', 'Qué se debe hacer', 'Cantidad', 'Entregable asociado'],
    rows=[
        ['Parte 2\n(Servidor)',
         '2 correcciones de diferente naturaleza por persona:\n'
         '• Punto de inyección (SQL, comandos, parámetros)\n'
         '• Control de acceso / escalación de privilegios\n'
         '• Defensa para explotación de la confianza',
         '8 correcciones\ntotales\n(2 por persona)',
         'Correcciones en el código del servidor + pruebas antes/después'],

        ['Parte 3 – Sec. B\n(Cliente)',
         '1 corrección por persona:\n'
         '• Vulnerabilidad cliente como objeto de ataque\n'
         '• XSS o exposición de client scripts\n'
         '• Saneamiento/escape de datos antes de renderizar',
         '4 correcciones\ntotales\n(1 por persona)*',
         'Correcciones en el código del cliente + pruebas antes/después'],

        ['Parte 3 – Sec. C\n(Logging/Tests)',
         '2 correcciones en total para el equipo:\n'
         '• Logging y tracing para rutas vulnerables (sin loguear secretos)\n'
         '• Pruebas automatizadas que reproduzcan solicitudes de ataque\n'
         '• Mecanismos anti-audit poisoning (logs append-only, hashing, colector)',
         '2 correcciones\ntotales\n(equipo completo)',
         'Logging implementado + pruebas automatizadas + documentación'],

        ['Partes 2 y 3\n(Compartido)',
         '• Informe técnico Word (máx. 20 pág.): vulnerabilidades, correcciones, evidencias, '
         'recomendaciones, declaración de cumplimiento firmada, link al video\n'
         '• Video demo (máx. 6 min total, cámara encendida por cada estudiante)\n'
         '• README.md (máx. 5 pág., sección exclusiva por estudiante)\n'
         '• Repositorio Git: branch por integrante, commits descriptivos, PRs (sin push directo a main)',
         'Un conjunto\npor equipo',
         'Informe Word + Video + README.md + Repositorio con branches y PRs'],
    ],
    col_widths=[2.5, 8.0, 2.5, 5.0],
    header_color='BDD7EE'
)

doc.add_paragraph()
pn = doc.add_paragraph()
rn = pn.add_run(
    '* El documento indica "5 correcciones, 1 por miembro" en Sec. B para un equipo de 4 personas '
    '(inconsistencia no aclarada en el documento). Se aplica la regla general de 2 correcciones por '
    'persona: 1 de Sec. B + 1 de Sec. C para 2 personas; 2 de Sec. B para las otras 2.')
rn.font.size = Pt(8.5); rn.font.italic = True

doc.add_paragraph()

# ── TABLA 2: DIVISIÓN PARA 4 PERSONAS ─────────────────────────────────────────
h3 = doc.add_paragraph()
h3.add_run('División equitativa para 4 personas').bold = True

make_table(doc,
    headers=['Bloque', 'Correcciones de Parte 2\n(Servidor — 2 por persona)',
             'Correcciones de Parte 3\n(Cliente — 2 por persona)',
             'Aporte al informe y entregables compartidos',
             'Encargado', 'T. estimado*'],
    rows=[
        ['Bloque 1',
         '1. Punto de inyección\n(ej. SQL injection)\n\n'
         '2. Segunda corrección\nde naturaleza diferente',
         '1. Vulnerabilidad cliente\ncomo objeto de ataque\n(ej. deserialización)\n\n'
         '2. Saneamiento/escape\nde datos (Sec. B)',
         '• Su sección en el informe\n• Su segmento del video\n• Su sección en README',
         '______________________',
         '~30–35 h'],

        ['Bloque 2',
         '1. Control de acceso /\nescalación de privilegios\n\n'
         '2. Segunda corrección\nde naturaleza diferente',
         '1. XSS o exposición\nde client scripts (Sec. B)\n\n'
         '2. Logging y tracing\npara rutas vulnerables\n(Sec. C — 1 de 2 totales)',
         '• Su sección en el informe\n• Su segmento del video\n• Su sección en README',
         '______________________',
         '~30–35 h'],

        ['Bloque 3',
         '1. Defensa para\nexplotación de la\nconfianza\n\n'
         '2. Segunda corrección\nde naturaleza diferente',
         '1. Vulnerabilidad cliente\n(naturaleza diferente\na Bloque 1) (Sec. B)\n\n'
         '2. Pruebas automatizadas\n+ anti-audit poisoning\n(Sec. C — 2 de 2 totales)',
         '• Su sección en el informe\n• Su segmento del video\n• Su sección en README\n• Compila README.md final',
         '______________________',
         '~32–37 h'],

        ['Bloque 4',
         '1. Corrección servidor\n(diferente a Bloques 1–3)\n\n'
         '2. Segunda corrección\nde naturaleza diferente',
         '1. Corrección cliente\n(diferente a Bloques 1–3)\n(Sec. B)\n\n'
         '2. Segunda corrección\ncliente (Sec. B)',
         '• Su sección en el informe\n• Portada, resumen ejecutivo\ny declaración de\ncumplimiento del informe\n• Su segmento del video\n• Su sección en README\n• Compila informe final',
         '______________________',
         '~33–38 h'],
    ],
    col_widths=[1.8, 4.0, 4.5, 4.5, 3.0, 1.7],
    header_color='E2EFDA'
)

doc.add_paragraph()
pt = doc.add_paragraph()
pt.add_run('* Tiempo estimado aproximado. No especificado en el documento fuente.').font.size = Pt(8.5)

doc.add_paragraph()

# ── ORDEN DE TRABAJO ──────────────────────────────────────────────────────────
h4 = doc.add_paragraph()
h4.add_run('Orden de trabajo recomendado').bold = True

make_table(doc,
    headers=['Fase', 'Actividad', 'Quién', 'Puede iniciar'],
    rows=[
        ['1', 'Clonar repositorio y crear branch personal (iniciales)', 'Todos', 'Día 1'],
        ['2', 'Correcciones de Parte 2 (servidor) con pruebas antes/después', 'Todos en paralelo', 'Día 1'],
        ['3', 'Correcciones de Parte 3 Sec. B (cliente) con pruebas', 'Todos en paralelo', 'Día 1'],
        ['4', 'Logging, pruebas automatizadas y anti-audit poisoning (Sec. C)', 'Bloques 2 y 3', 'Cuando P2 y Sec. B estén avanzadas'],
        ['5', 'Redactar secciones del informe, README y grabar video', 'Todos en paralelo', 'Al completar sus correcciones'],
        ['6', 'Compilar informe final (Bloque 4) y README final (Bloque 3)', 'Bloques 3 y 4', 'Cuando todos entreguen sus secciones'],
        ['7', 'Crear Pull Requests y verificar todos los entregables', 'Todos', 'Días previos al 2 de junio'],
    ],
    col_widths=[0.8, 8.5, 3.5, 5.5],
    header_color='FCE4D6'
)

doc.add_paragraph()

# ── ASIGNACIÓN FINAL ──────────────────────────────────────────────────────────
h5 = doc.add_paragraph()
h5.add_run('Asignación final del equipo').bold = True

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
        cell.paragraphs[0].paragraph_format.space_before = Pt(18)
        cell.paragraphs[0].paragraph_format.space_after  = Pt(18)

# ── GUARDAR ───────────────────────────────────────────────────────────────────
out = r'C:\Users\lmira\OneDrive\Documents\DataBaseProyect\division_trabajo_parte2_3.docx'
doc.save(out)
print('Guardado:', out)
