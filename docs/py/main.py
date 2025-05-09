import firebase_admin
from firebase_admin import credentials, db
from flask import Flask, render_template, request, redirect, url_for, session
import dash
from dash import dcc, html, callback, Output, Input, State, ALL
import dash_bootstrap_components as dbc
from datetime import datetime
import simplekml
import os
import io
import tkinter as tk
from tkinter import filedialog
import webbrowser
from threading import Timer
import sys
import zipfile 

app = Flask(__name__)
app.secret_key = 'ucgjb7aa'

# Obtener la ruta correcta para el archivo JSON
if getattr(sys, 'frozen', False):
    # El script está empaquetado como un ejecutable
    current_path = sys._MEIPASS
else:
    # El script se está ejecutando en modo normal
    current_path = os.path.dirname(os.path.abspath(__file__))

# Configuración de Firebase Admin SDK
# cred = credentials.Certificate(json_path)
cred = credentials.Certificate("C:/Users/fermindiazp/Desktop/fanview/firebaseKeys/testfirebasefanview-firebase-adminsdk-fbsvc-6dec80302c.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://testfirebasefanview-default-rtdb.firebaseio.com/"
})

# Recuperar datos de Firebase
ref_empresa = db.reference('/Empresa')
empresas = ref_empresa.get()

ref_centro = db.reference('/Centro')
centros = ref_centro.get()

ref_especie = db.reference('/Especie')
especies = ref_especie.get()

# Prepara las listas para los dropdowns y checklists
empresas_list = [{'label': v['Nombre_Empresa'], 'value': k} for k, v in empresas.items()]
especies_list = [{'label': v['Nombre_Especie'], 'value': k} for k, v in especies.items()]

# Inicializa la aplicación Dash con un layout básico
dash_app = dash.Dash(
    __name__, 
    server=app, 
    url_base_pathname='/FANView/',
    external_stylesheets=[dbc.themes.BOOTSTRAP],
    suppress_callback_exceptions=True
)

# Layout básico inicial para Dash
dash_app.layout = html.Div([html.H1("Seleccione una opción")])

# Configura el layout para Geolocalización
geolocalizacion_layout = dbc.Container([
    html.H1("Creación de KML", style={'text-align': 'center'}),
    html.Label("Seleccione una empresa:"),
    dcc.Dropdown(
        id='empresa-dropdown',
        options=empresas_list,
        placeholder="Empresa"
    ),
    html.Br(),
    html.Label("Seleccione tipo de monitoreo:"),
    dcc.Dropdown(
        id='monitoreo-dropdown',
        options=[
            {'label': 'CENTRO', 'value': 'CENTRO'},
            {'label': 'BARCO', 'value': 'BARCO'}
        ],
        placeholder="Tipo de monitoreo",
        disabled=True 
    ),
    html.Br(),
    html.Div(id='centro-selection-div', children=[]), 
    html.Br(),
    html.Label("Seleccione las especies:"),
    dcc.Checklist(
        id='especie-checklist',
        options=especies_list,
        value=[], 
        labelStyle={'display': 'block'}  
    ),
    html.Br(),
    html.Label("Seleccione las profundidades:"),
    dcc.Checklist(
        id='profundidad-checklist',
        options=[{'label': f'{i} metros', 'value': i} for i in range(0, 16, 5)], 
        value=[], 
        labelStyle={'display': 'block'}  
    ),
    html.Br(),
    html.Label("Seleccione Fecha:"),
    dcc.DatePickerSingle(
        id='fecha-picker',
        min_date_allowed=datetime(2020, 1, 1),
        max_date_allowed=datetime(2025, 12, 31),
        initial_visible_month=datetime.now(),
        date=datetime.now().date(),
        style={'margin-top': '10px'}
    ),
    html.Br(),
    html.Button('Generar KML', id='generate-kml-btn', style={'margin-top': '10px'}),
    dcc.Download(id="download-kml"),
    html.Br(),
    html.Br(),
])

# Configura el layout para Ingresar Muestra
ingresar_muestra_layout = dbc.Container([
    dbc.Row([
        dbc.Col(html.H1("Ingresar Muestra", className='text-center'), className='mb-5 mt-5')
    ]),
    dbc.Row([
        dbc.Col([
            dbc.Label("Seleccionar Empresa"),
            dcc.Dropdown(
                id='empresa-dropdown-muestra',
                options=empresas_list,
                placeholder="Empresa"
            ),
            html.Br(),
            dbc.Label("Seleccionar Centro"),
            dcc.Dropdown(
                id='centro-dropdown-muestra',
                placeholder="Centro"
            ),
            html.Br(),
            dbc.Label("Seleccionar Fecha y Hora de Muestreo"),
            dbc.Row([
                dbc.Col(
                    dcc.DatePickerSingle(
                        id='fecha-muestreo-picker',
                        display_format='DD-MM-YYYY',
                        placeholder='DD-MM-AAAA',
                        style={'width': '100%'}
                    ),
                    width=6
                ),
                dbc.Col(
                    dcc.Dropdown(
                        id='hora-muestreo-dropdown',
                        options=[{'label': f'{i:02d}', 'value': f'{i:02d}'} for i in range(24)],
                        placeholder='HH',
                        style={'width': '100%'}
                    ),
                    width=3
                ),
                dbc.Col(
                    dcc.Dropdown(
                        id='minuto-muestreo-dropdown',
                        options=[{'label': f'{i:02d}', 'value': f'{i:02d}'} for i in range(60)],
                        placeholder='MM',
                        style={'width': '100%'}
                    ),
                    width=3
                ),
            ], className='g-0'),
            html.Br(),
            dbc.Label("Seleccionar Fecha y Hora de Recepción"),
            dbc.Row([
                dbc.Col(
                    dcc.DatePickerSingle(
                        id='fecha-recepcion-picker',
                        display_format='DD-MM-YYYY',
                        placeholder='DD-MM-AAAA',
                        style={'width': '100%'}
                    ),
                    width=6
                ),
                dbc.Col(
                    dcc.Dropdown(
                        id='hora-recepcion-dropdown',
                        options=[{'label': f'{i:02d}', 'value': f'{i:02d}'} for i in range(24)],
                        placeholder='HH',
                        style={'width': '100%'}
                    ),
                    width=3
                ),
                dbc.Col(
                    dcc.Dropdown(
                        id='minuto-recepcion-dropdown',
                        options=[{'label': f'{i:02d}', 'value': f'{i:02d}'} for i in range(60)],
                        placeholder='MM',
                        style={'width': '100%'}
                    ),
                    width=3
                ),
            ], className='g-0'),
            html.Br(),
            dbc.Label("Seleccionar Fecha y Hora de Análisis"),
            dbc.Row([
                dbc.Col(
                    dcc.DatePickerSingle(
                        id='fecha-analisis-picker',
                        display_format='DD-MM-YYYY',
                        placeholder='DD-MM-AAAA',
                        style={'width': '100%'}
                    ),
                    width=6
                ),
                dbc.Col(
                    dcc.Dropdown(
                        id='hora-analisis-dropdown',
                        options=[{'label': f'{i:02d}', 'value': f'{i:02d}'} for i in range(24)],
                        placeholder='HH',
                        style={'width': '100%'}
                    ),
                    width=3
                ),
                dbc.Col(
                    dcc.Dropdown(
                        id='minuto-analisis-dropdown',
                        options=[{'label': f'{i:02d}', 'value': f'{i:02d}'} for i in range(60)],
                        placeholder='MM',
                        style={'width': '100%'}
                    ),
                    width=3
                ),
            ], className='g-0'),
            html.Br()
        ], width={"size": 6, "offset": 3})
    ]),
    dbc.Row([
        dbc.Col(html.H4("Variables Biofísicas", className='text-center'), className='mt-4 mb-4')
    ]),
    dbc.Row([
        dbc.Col([
            dbc.Row([
                dbc.Col(html.Label("Profundidad"), width=3),
                dbc.Col(html.Label("0m"), width=2),
                dbc.Col(html.Label("5m"), width=2),
                dbc.Col(html.Label("10m"), width=2),
                dbc.Col(html.Label("15m"), width=2),  # Nueva profundidad 15m
            ], className='mb-2'),
            dbc.Row([
                dbc.Col(dbc.Label("Temperatura (°C)"), width=3),
                dbc.Col(dbc.Input(id={'type': 'input-temp', 'depth': '0m'}, type='number', placeholder="°C"), width=2),
                dbc.Col(dbc.Input(id={'type': 'input-temp', 'depth': '5m'}, type='number', placeholder="°C"), width=2),
                dbc.Col(dbc.Input(id={'type': 'input-temp', 'depth': '10m'}, type='number', placeholder="°C"), width=2),
                dbc.Col(dbc.Input(id={'type': 'input-temp', 'depth': '15m'}, type='number', placeholder="°C"), width=2),  # Nuevo campo 15m
            ], className='mb-2'),
            dbc.Row([
                dbc.Col(dbc.Label("Salinidad (PSU)"), width=3),
                dbc.Col(dbc.Input(id={'type': 'input-sal', 'depth': '0m'}, type='number', placeholder="PSU"), width=2),
                dbc.Col(dbc.Input(id={'type': 'input-sal', 'depth': '5m'}, type='number', placeholder="PSU"), width=2),
                dbc.Col(dbc.Input(id={'type': 'input-sal', 'depth': '10m'}, type='number', placeholder="PSU"), width=2),
                dbc.Col(dbc.Input(id={'type': 'input-sal', 'depth': '15m'}, type='number', placeholder="PSU"), width=2),  # Nuevo campo 15m
            ], className='mb-2'),
            dbc.Row([
                dbc.Col(dbc.Label("Oxígeno (mg/L)"), width=3),
                dbc.Col(dbc.Input(id={'type': 'input-oxi', 'depth': '0m'}, type='number', placeholder="mg/L"), width=2),
                dbc.Col(dbc.Input(id={'type': 'input-oxi', 'depth': '5m'}, type='number', placeholder="mg/L"), width=2),
                dbc.Col(dbc.Input(id={'type': 'input-oxi', 'depth': '10m'}, type='number', placeholder="mg/L"), width=2),
                dbc.Col(dbc.Input(id={'type': 'input-oxi', 'depth': '15m'}, type='number', placeholder="mg/L"), width=2),  # Nuevo campo 15m
            ], className='mb-2'),
            dbc.Row([
                dbc.Col(dbc.Label("Disco Secchi (m)"), width=3),
                dbc.Col(dbc.Input(id='input-disco-secchi', type='number', placeholder="m"), width=2),
            ]),
        ], width={"size": 12, "offset": 0})
    ]),
    dbc.Row([
        dbc.Col(html.H4("Comportamiento de los Peces", className='text-center'), className='mt-4 mb-4')
    ]),
    dbc.Row([
        dbc.Col([
            dcc.Dropdown(
                id='comportamiento-dropdown',
                options=[
                    {'label': 'Normal', 'value': 'Normal'},
                    {'label': 'Inapetente', 'value': 'Inapetente'},
                    {'label': 'Irregular', 'value': 'Irregular'}
                ],
                placeholder="Seleccionar Comportamiento"
            )
        ], width={"size": 6, "offset": 3})
    ]),
    html.Br(),
    dbc.Row([
        dbc.Col(html.H4("Especie", className='text-center'), width=3),
        dbc.Col(html.H4("Profundidad", className='text-center'), width=9),
    ]),
    dbc.Row([
        dbc.Col([
            html.Div([
                dbc.Row([
                    dbc.Col(html.Label(especie['label']), width=3),
                    dbc.Col(dbc.Input(id={'type': 'input-depth', 'index': i, 'depth': '0m'}, type='number', placeholder="0m"), width=2),
                    dbc.Col(dbc.Input(id={'type': 'input-depth', 'index': i, 'depth': '5m'}, type='number', placeholder="5m"), width=2),
                    dbc.Col(dbc.Input(id={'type': 'input-depth', 'index': i, 'depth': '10m'}, type='number', placeholder="10m"), width=2),
                    dbc.Col(dbc.Input(id={'type': 'input-depth', 'index': i, 'depth': '15m'}, type='number', placeholder="15m"), width=2),  # Nuevo campo 15m
                ], className='mb-2')
                for i, especie in enumerate(especies_list)
            ])
        ], width={"size": 12, "offset": 0})
    ]),
    dbc.Row([
        dbc.Col(
            dbc.Button("Previsualizar", id="mostrar-resumen-btn", color="primary", className="mt-3"),
            width={"size": 2, "offset": 5},
            className="d-flex justify-content-center"
        ),
    ]),
    dbc.Row([
        dbc.Col(html.Div(id='output-message', className='mt-3'), width={"size": 6, "offset": 3})
    ]),
    dbc.Row([
        dbc.Col(html.Div(id='resumen', className='mt-3'), width={"size": 6, "offset": 3})
    ]),
    dcc.Download(id="download-link")
])

# Flask routes
@app.route('/')
def login():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def do_login():
    email = request.form['email']
    password = request.form['password']
    
    # Autenticación manual con la base de datos
    ref = db.reference("Monitor")
    monitors = ref.get()
    for key, monitor in monitors.items():
        if monitor['email'] == email and monitor['password'] == password:
            session['monitor_name'] = monitor['Nombre_Monitor']
            return redirect(url_for('dashboard'))
    
    return "Correo o contraseña incorrectos", 401

@app.route('/dashboard')
def dashboard():
    if 'monitor_name' not in session:
        return redirect(url_for('login'))

    # Recupera la información del monitor autenticado
    monitor_name = session['monitor_name']
    ref = db.reference("Monitor")
    monitors = ref.get()
    
    # Buscar el monitor por su nombre
    for key, monitor in monitors.items():
        if monitor['Nombre_Monitor'] == monitor_name:
            user_role = monitor['Rol']  # Verificar el rol

    # Verificar si el usuario es administrador o monitor
    if user_role == 'administrador':
        return render_template('dashboard.html', monitor_name=monitor_name, geolocalizacion_enabled=True)
    else:
        return render_template('dashboard.html', monitor_name=monitor_name, geolocalizacion_enabled=False)

@app.route('/FANView/geolocalizacion')
def geolocalizacion():
    dash_app.layout = geolocalizacion_layout
    return redirect('/FANView/')

@app.route('/FANView/ingresar_muestra')
def ingresar_muestra():
    dash_app.layout = ingresar_muestra_layout
    return redirect('/FANView/')

@app.route('/FANView/agregar_datos')
def agregar_datos():
    if 'monitor_name' not in session:
        return redirect(url_for('login'))

    # Recupera la información del monitor autenticado
    monitor_name = session['monitor_name']
    ref = db.reference("Monitor")
    monitors = ref.get()

    # Buscar el monitor por su nombre
    for key, monitor in monitors.items():
        if monitor['Nombre_Monitor'] == monitor_name:
            user_role = monitor['Rol']  # Verificar el rol

    # Si no es administrador, no puede acceder a esta página
    if user_role != 'administrador':
        return "Acceso denegado", 403

    # Renderizar la página de agregar datos
    return render_template('agregar_datos.html')
@app.route('/FANView/agregar_monitor', methods=['GET', 'POST'])
def agregar_monitor():
    if request.method == 'POST':
        # Obtener los datos del formulario
        nombre_monitor = request.form['nombre_monitor']
        ciudad = request.form['ciudad']
        direccion = request.form['direccion']
        email = request.form['email']
        password = request.form['password']
        rol = request.form['rol']

        # Crear nuevo monitor en Firebase
        monitor_data = {
            'Nombre_Monitor': nombre_monitor,
            'Ciudad': ciudad,
            'Direccion': direccion,
            'email': email,
            'password': password,
            'Rol': rol,
        }
        db.reference('/Monitor').child(nombre_monitor).set(monitor_data)
        return "Monitor agregado exitosamente"

    # Renderizar el formulario
    return render_template('agregar_monitor.html')

@app.route('/FANView/agregar_centro', methods=['GET', 'POST'])
def agregar_centro():
    if request.method == 'POST':
        # Obtener los datos del formulario
        nombre_centro = request.form['nombre_centro']
        empresa = request.form['empresa']
        latitud = request.form['latitud']
        longitud = request.form['longitud']

        # Crear nuevo centro en Firebase
        centro_data = {
            'Nombre_Centro': nombre_centro,
            'Empresa': empresa,
            'Latitud': latitud,
            'Longitud': longitud
        }
        db.reference('/Centro').child(nombre_centro).set(centro_data)
        return "Centro agregado exitosamente"

    return render_template('agregar_centro.html')

@app.route('/FANView/agregar_empresa', methods=['GET', 'POST'])
def agregar_empresa():
    if request.method == 'POST':
        # Obtener los datos del formulario
        nombre_empresa = request.form['nombre_empresa']
        direccion = request.form['direccion']
        nombre_contacto = request.form['nombre_contacto']
        telefono = request.form['telefono']

        # Crear nueva empresa en Firebase
        empresa_data = {
            'Nombre_Empresa': nombre_empresa,
            'Direccion': direccion,
            'Nombre_Contacto': nombre_contacto,
            'Tel_Contacto': telefono
        }
        db.reference('/Empresa').child(nombre_empresa).set(empresa_data)
        return "Empresa agregada exitosamente"

    return render_template('agregar_empresa.html')

@app.route('/FANView/agregar_especie', methods=['GET', 'POST'])
def agregar_especie():
    if request.method == 'POST':
        # Obtener los datos del formulario
        nombre_especie = request.form['nombre_especie']
        genero = request.form['genero']
        grupo = request.form['grupo']
        nocividad = request.form['nocividad']
        valor_normal = request.form['valor_normal']
        valor_alerta = request.form['valor_alerta']

        # Crear nueva especie en Firebase
        especie_data = {
            'Nombre_Especie': nombre_especie,
            'Genero': genero,
            'Grupo': grupo,
            'Nocividad': nocividad,
            'Valor_Normal': valor_normal,
            'Valor_Alerta': valor_alerta
        }
        db.reference('/Especie').child(nombre_especie).set(especie_data)
        return "Especie agregada exitosamente"

    return render_template('agregar_especie.html')


# Dash callbacks
@dash_app.callback(
    Output('monitoreo-dropdown', 'disabled'),
    Input('empresa-dropdown', 'value')
)
def enable_monitoreo_dropdown(selected_empresa):
    if selected_empresa:
        return False  
    return True  

@dash_app.callback(
    Output('centro-selection-div', 'children'),
    Input('empresa-dropdown', 'value'),
    Input('monitoreo-dropdown', 'value')
)
def update_centro_selection(selected_empresa, selected_monitoreo):
    if selected_empresa and selected_monitoreo:
        centros_filtrados = [{'label': v['Nombre_Centro'], 'value': k} for k, v in centros.items() if v['Empresa'] == selected_empresa]
        return [
            html.Label(f"Seleccione los centros para {selected_monitoreo.lower()}:"),
            dcc.Checklist(
                id='centro-checklist',
                options=centros_filtrados,
                value=[], 
                labelStyle={'display': 'block'}  
            )
        ]
    return []

@dash_app.callback(
    Output('centro-dropdown-muestra', 'options'),
    Input('empresa-dropdown-muestra', 'value')
)
def set_centros_options(selected_empresa):
    if selected_empresa is None:
        return []
    else:
        centros_list = [{'label': v['Nombre_Centro'], 'value': k} for k, v in centros.items() if v['Empresa'] == selected_empresa]
        return centros_list

def select_folder():
    root = tk.Tk()
    root.withdraw()
    folder_selected = filedialog.askdirectory()
    root.destroy()
    return folder_selected

@dash_app.callback(
    Output("download-kml", "data"),
    Input('generate-kml-btn', 'n_clicks'),
    State('empresa-dropdown', 'value'),
    State('monitoreo-dropdown', 'value'),
    State('centro-selection-div', 'children'),
    State('especie-checklist', 'value'),
    State('profundidad-checklist', 'value'),
    State('fecha-picker', 'date')
)
def generate_kml(n_clicks, selected_empresa, selected_monitoreo, centro_selection_div, selected_especies, selected_profundidades, selected_fecha):
    if n_clicks is None:
        return None

    if not all([selected_empresa, selected_monitoreo, centro_selection_div, selected_especies, selected_profundidades, selected_fecha]):
        return None

    centro_checklist = [child for child in centro_selection_div if child['props'].get('id') == 'centro-checklist']
    if centro_checklist:
        selected_centros = centro_checklist[0]['props']['value']
    else:
        return None

    folder_path = select_folder()  # Elige la carpeta donde se guardarán los archivos
    if not folder_path:
        return None

    fecha_formateada = datetime.strptime(selected_fecha, "%Y-%m-%d").strftime("%Y-%m-%d")

    for centro in selected_centros:
        for especie in selected_especies:
            for profundidad in selected_profundidades:
                # Crear archivo KML
                kml = simplekml.Kml()
                pnt = kml.newpoint(name=f"{especie} - {profundidad}m")
                
                # Obtener coordenadas reales desde la base de datos de Firebase
                latitud = centros[centro]['Latitud']
                longitud = centros[centro]['Longitud']
                pnt.coords = [(longitud, latitud)]

                # Obtener valores críticos y normales desde la base de datos de Firebase
                especie_info = especies[especie] 
                valor_normal = especie_info['Valor_Normal']
                valor_critico = especie_info['Valor_Alerta']

                cantidad = 75 # Cambiar a lo que se agrega a firebase!!! Esto es solo prueba para ver comparar algo en el kml

                # Determinar el color según los valores críticos y normales
                if cantidad < valor_normal:
                    color = simplekml.Color.green  # Color para valores normales (por debajo de lo crítico)
                elif valor_normal <= cantidad <= valor_critico:
                    color = simplekml.Color.yellow  # Color para valores de alerta
                else:
                    color = simplekml.Color.red  # Color para valores críticos

                # Configurar el estilo del punto en el KML
                pnt.style.iconstyle.icon.href = "http://maps.google.com/mapfiles/kml/shapes/shaded_dot.png"
                pnt.style.iconstyle.color = color
                pnt.style.iconstyle.scale = 2.5
                pnt.style.labelstyle.scale = 0

                # Guardar el archivo KML con el formato adecuado
                file_name = f"{centro}_{especie}_{selected_empresa}_{fecha_formateada}_{profundidad}m.kml"
                file_path = os.path.join(folder_path, file_name)
                kml.save(file_path)

    return None



@dash_app.callback(
    Output('resumen', 'children'),
    Input('mostrar-resumen-btn', 'n_clicks'),
    State('empresa-dropdown-muestra', 'value'),
    State('centro-dropdown-muestra', 'value'),
    State('fecha-muestreo-picker', 'date'),
    State('hora-muestreo-dropdown', 'value'),
    State('minuto-muestreo-dropdown', 'value'),
    State('fecha-recepcion-picker', 'date'),
    State('hora-recepcion-dropdown', 'value'),
    State('minuto-recepcion-dropdown', 'value'),
    State('fecha-analisis-picker', 'date'),
    State('hora-analisis-dropdown', 'value'),
    State('minuto-analisis-dropdown', 'value'),
    [State({'type': 'input-temp', 'depth': ALL}, 'value')],
    [State({'type': 'input-sal', 'depth': ALL}, 'value')],
    [State({'type': 'input-oxi', 'depth': ALL}, 'value')],
    State('input-disco-secchi', 'value'),
    State('comportamiento-dropdown', 'value'),
    [State({'type': 'input-depth', 'index': ALL, 'depth': ALL}, 'value')],
    prevent_initial_call=True
)
def mostrar_resumen(n_clicks, empresa, centro, fecha_muestreo, hora_muestreo, minuto_muestreo,
                     fecha_recepcion, hora_recepcion, minuto_recepcion,
                     fecha_analisis, hora_analisis, minuto_analisis,
                     temp_values, sal_values, oxi_values,
                     disco_secchi, comportamiento, depth_values):
    
    if (empresa is None or centro is None or fecha_muestreo is None or hora_muestreo is None or minuto_muestreo is None or
        fecha_recepcion is None or hora_recepcion is None or minuto_recepcion is None or
        fecha_analisis is None or hora_analisis is None or minuto_analisis is None or
        any(value is None for value in temp_values + sal_values + oxi_values) or disco_secchi is None or comportamiento is None):
        return "Por favor, ingrese todos los valores requeridos."
    
    # Formatear las horas
    hora_muestreo_completa = f'{hora_muestreo}:{minuto_muestreo}'
    hora_recepcion_completa = f'{hora_recepcion}:{minuto_recepcion}'
    hora_analisis_completa = f'{hora_analisis}:{minuto_analisis}'

    # Verificar formatos de horas
    try:
        datetime.strptime(hora_muestreo_completa, '%H:%M')
        datetime.strptime(hora_recepcion_completa, '%H:%M')
        datetime.strptime(hora_analisis_completa, '%H:%M')
    except ValueError:
        return "Por favor, ingrese las horas en el formato HH:MM."

    # Reestructurar depth_values en una lista de listas
    num_especies = len(especies_list)
    depth_values_restructured = [depth_values[i*4:(i+1)*4] for i in range(num_especies)] 

    # Crear resumen
    resumen = [
        html.H4("Resumen de Datos Ingresados"),
        html.P(f"Empresa: {empresa}"),
        html.P(f"Centro: {centro}"),
        html.P(f"Fecha y Hora de Muestreo: {fecha_muestreo} {hora_muestreo_completa}"),
        html.P(f"Fecha y Hora de Recepción: {fecha_recepcion} {hora_recepcion_completa}"),
        html.P(f"Fecha y Hora de Análisis: {fecha_analisis} {hora_analisis_completa}"),
        html.P(f"Temperatura a 0m: {temp_values[0]} °C, a 5m: {temp_values[1]} °C, a 10m: {temp_values[2]} °C, a 15m: {temp_values[3]} °C"),
        html.P(f"Salinidad a 0m: {sal_values[0]} PSU, a 5m: {sal_values[1]} PSU, a 10m: {sal_values[2]} PSU, a 15m: {sal_values[3]} PSU"),
        html.P(f"Oxígeno a 0m: {oxi_values[0]} mg/L, a 5m: {oxi_values[1]} mg/L, a 10m: {oxi_values[2]} mg/L, a 15m: {oxi_values[3]} mg/L"),
        html.P(f"Disco Secchi: {disco_secchi} m"),
        html.P(f"Comportamiento de los Peces: {comportamiento}")
    ]

    for i, especie in enumerate(especies_list):
        if any(value is not None for value in depth_values_restructured[i]):
            resumen.append(html.H5(especie['label']))
            for depth, value in zip(['0m', '5m', '10m', '15m'], depth_values_restructured[i]):
                if value is not None:
                    resumen.append(html.P(f"Profundidad {depth}: {value}"))

    resumen.append(
        dbc.Button("Ingresar Muestra", id="ingresar-btn", color="primary", className="mr-2")
    )

    return resumen

@dash_app.callback(
    Output('output-message', 'children'),
    Input('ingresar-btn', 'n_clicks'),
    State('empresa-dropdown-muestra', 'value'),
    State('centro-dropdown-muestra', 'value'),
    State('fecha-muestreo-picker', 'date'),
    State('hora-muestreo-dropdown', 'value'),
    State('minuto-muestreo-dropdown', 'value'),
    State('fecha-recepcion-picker', 'date'),
    State('hora-recepcion-dropdown', 'value'),
    State('minuto-recepcion-dropdown', 'value'),
    State('fecha-analisis-picker', 'date'),
    State('hora-analisis-dropdown', 'value'),
    State('minuto-analisis-dropdown', 'value'),
    [State({'type': 'input-temp', 'depth': ALL}, 'value')],
    [State({'type': 'input-sal', 'depth': ALL}, 'value')],
    [State({'type': 'input-oxi', 'depth': ALL}, 'value')],
    State('input-disco-secchi', 'value'),
    State('comportamiento-dropdown', 'value'),
    [State({'type': 'input-depth', 'index': ALL, 'depth': ALL}, 'value')],
    prevent_initial_call=True
)
def ingresar_muestra(n_clicks, empresa, centro, fecha_muestreo, hora_muestreo, minuto_muestreo,
                     fecha_recepcion, hora_recepcion, minuto_recepcion,
                     fecha_analisis, hora_analisis, minuto_analisis,
                     temp_values, sal_values, oxi_values,
                     disco_secchi, comportamiento, depth_values):
    
    if not n_clicks:
        return dash.no_update

    # Formatear las horas
    hora_muestreo_completa = f'{hora_muestreo}:{minuto_muestreo}'
    hora_recepcion_completa = f'{hora_recepcion}:{minuto_recepcion}'
    hora_analisis_completa = f'{hora_analisis}:{minuto_analisis}'

    # Reestructurar depth_values en una lista de listas
    num_especies = len(especies_list)
    depth_values_restructured = [depth_values[i*4:(i+1)*4] for i in range(num_especies)]  

    # Datos de la muestra
    muestras = []
    muestras_data = [] 
    reporte_data=[]
    for i, especie in enumerate(especies_list):
        if any(value is not None for value in depth_values_restructured[i]):
            muestra_data = {
                'Nombre_Monitor': 'Ernesto_Pedrero',
                'Centro': centro,
                'Empresa': empresa,
                'Fecha_Muestreo': f'{fecha_muestreo} {hora_muestreo_completa}',
                'Fecha_Recepcion': f'{fecha_recepcion} {hora_recepcion_completa}',
                'Fecha_Analisis': f'{fecha_analisis} {hora_analisis_completa}',
                'Especie': especie['value'],
                'Profundidad_0m': float(depth_values_restructured[i][0]) if depth_values_restructured[i][0] is not None else float('nan'),
                'Profundidad_5m': float(depth_values_restructured[i][1]) if depth_values_restructured[i][1] is not None else float('nan'),
                'Profundidad_10m': float(depth_values_restructured[i][2]) if depth_values_restructured[i][2] is not None else float('nan'),
                'Profundidad_15m': float(depth_values_restructured[i][3]) if depth_values_restructured[i][3] is not None else float('nan'), 
                'Temperatura_0m': temp_values[0],
                'Temperatura_5m': temp_values[1],
                'Temperatura_10m': temp_values[2],
                'Temperatura_15m': temp_values[3],  
                'Salinidad_0m': sal_values[0],
                'Salinidad_5m': sal_values[1],
                'Salinidad_10m': sal_values[2],
                'Salinidad_15m': sal_values[3], 
                'Oxígeno_0m': oxi_values[0],
                'Oxígeno_5m': oxi_values[1],
                'Oxígeno_10m': oxi_values[2],
                'Oxígeno_15m': oxi_values[3],  
                'Disco_Secchi': disco_secchi,
                'Comportamiento': comportamiento
            }
            # Crear ID de muestra único
            fecha_actual = datetime.now().strftime('%Y-%m-%d-%H:%M:%S')
            muestra_id = f'Muestra_{fecha_actual}_{centro}_{especie["value"]}'
            # Enviar datos a Firebase
            firebase_admin.db.reference('/Muestra').child(muestra_id).set(muestra_data)
            muestras.append(muestra_id)
            muestras_data.append(muestra_data)  # Almacena los datos para el DataFrame

    if not muestras:
        return "No se ingresaron muestras porque no se proporcionaron valores de profundidad."

    # Mostrar mensaje de éxito y agregar botón de "Descargar Reportes"
    return [
        html.P(f'Muestras añadidas con IDs: {", ".join(muestras)}'),
        dbc.Button("Descargar Reporte Resumen", id="descargar-reporte-azul-btn", color="primary", className="mt-3"),
        dcc.Download(id="download-reporte-azul"),
        html.Br(),
        dbc.Button("Descargar Reporte Semáforo", id="descargar-reporte-semaforo-btn", color="primary", className="mt-3"),
        dcc.Download(id="download-reporte-semaforo"),
        dcc.Store(id='muestras-data-store', data=muestras_data)
    ]

################################################## REPORTES #######################################################################

# Reporte Azul (Resumen)
@dash_app.callback(
    Output('download-reporte-azul', 'data'),
    Input('descargar-reporte-azul-btn', 'n_clicks'),
    State('muestras-data-store', 'data'),
    prevent_initial_call=True
)
def descargar_reporte_azul(n_clicks, muestras_data):
    if not n_clicks or not muestras_data:
        return dash.no_update

    # Generación del Reporte Microalgas (Azul)
    excel_data_azul = []
    fecha_muestra = muestras_data[0]['Fecha_Muestreo'].split(" ")[0]  # Definir fecha_muestra correctamente
    for muestra in muestras_data:
        especie_id = muestra['Especie']
        especie_info = especies[especie_id]
        hora_muestra = muestra['Fecha_Muestreo'].split(" ")[1]
        fecha_analisis = muestra['Fecha_Analisis'].split(" ")[0]
        hora_analisis = muestra['Fecha_Analisis'].split(" ")[1]

        profundidades = [0, 5, 10, 15]
        for profundidad in profundidades:
            row = {
                'Centro': muestra['Centro'],
                'Fecha_Muestra': fecha_muestra,
                'Hora_Muestra': hora_muestra,
                'Fecha_Analisis': fecha_analisis,
                'Hora_Analisis': hora_analisis,
                'Disco_Secchi': muestra['Disco_Secchi'],
                'Conducta_Peces': muestra['Comportamiento'],
                'Profundidad': f"{profundidad}m",
                'Grupo': especie_info['Grupo'],
                'Género': especie_info['Genero'],
                'Especie': especie_info['Nombre_Especie'],
                'Cantidad': muestra[f'Profundidad_{profundidad}m'],
                'Nocivo': especie_info['Nocividad'],
                'Temperatura': muestra[f'Temperatura_{profundidad}m'],
                'Salinidad': muestra[f'Salinidad_{profundidad}m'],
                'Oxígeno': muestra[f'Oxígeno_{profundidad}m']
            }
            excel_data_azul.append(row)

    df_azul = pd.DataFrame(excel_data_azul)
    excel_azul_output = io.BytesIO()
    with pd.ExcelWriter(excel_azul_output, engine='xlsxwriter') as writer:
        df_azul.to_excel(writer, sheet_name="Reporte", index=False)

    nombre_reporte_azul = f"Reporte_microalgas_{muestras_data[0]['Centro']}_{fecha_muestra}.xlsx"
    excel_azul_output.seek(0)
    
    return dcc.send_bytes(excel_azul_output.getvalue(), nombre_reporte_azul)


# Reporte Semáforo (Tradicional o Nocividad)
@dash_app.callback(
    Output('download-reporte-semaforo', 'data'),
    Input('descargar-reporte-semaforo-btn', 'n_clicks'),
    State('muestras-data-store', 'data'),
    prevent_initial_call=True
)
def descargar_reporte_semaforo(n_clicks, muestras_data):
    if not n_clicks or not muestras_data:
        return dash.no_update

    empresa = muestras_data[0]['Empresa']
    fecha_muestra = muestras_data[0]['Fecha_Muestreo'].split(" ")[0]  
    
    if empresa == 'Blumar':
        # Generar Reporte de Nocividad
        excel_data_tercer = []
        for muestra in muestras_data:
            especie_id = muestra['Especie']
            especie_info = especies[especie_id]
            valor_critico = especie_info['Valor_Alerta']

            valor_30 = 0.30 * valor_critico
            valor_50 = 0.50 * valor_critico
            valor_80 = 0.80 * valor_critico

            row = {
                'Especie': especie_info['Nombre_Especie'],
                '0m': muestra['Profundidad_0m'],
                '5m': muestra['Profundidad_5m'],
                '10m': muestra['Profundidad_10m'],
                '15m': muestra['Profundidad_15m'],
                'Normal': f"<{int(valor_30)}",
                '30-50% del valor crítico': f"{int(valor_30)} - {int(valor_50)}",
                '50-80% del valor crítico': f"{int(valor_50)} - {int(valor_80)}",
                '>80% del valor crítico': f">{int(valor_80)}",
                'Crítico': f">{int(valor_critico)}"
            }
            excel_data_tercer.append(row)

        df_tercer = pd.DataFrame(excel_data_tercer)
        excel_tercer_output = io.BytesIO()
        with pd.ExcelWriter(excel_tercer_output, engine='xlsxwriter') as writer:
            df_tercer.to_excel(writer, sheet_name="Reporte_Nocividad", index=False)
        
        nombre_reporte_tercer = f"Reporte_nocividad_{muestras_data[0]['Centro']}_{fecha_muestra}.xlsx"
        excel_tercer_output.seek(0)
        
        return dcc.send_bytes(excel_tercer_output.getvalue(), nombre_reporte_tercer)
    
    else:
        # Generar Reporte Semáforo Tradicional
        excel_data_semaforo = []
        for muestra in muestras_data:
            especie_id = muestra['Especie']
            especie_info = especies[especie_id]

            row = {
                'Especie': especie_info['Nombre_Especie'],
                '0m': muestra['Profundidad_0m'],
                '5m': muestra['Profundidad_5m'],
                '10m': muestra['Profundidad_10m'],
                '15m': muestra['Profundidad_15m'],
                'NORMAL': f"<{especie_info['Valor_Normal']}",
                'ALERTA': f"{especie_info['Valor_Normal']} - {especie_info['Valor_Alerta']}",
                'CRÍTICA': f">{especie_info['Valor_Alerta']}"
            }
            excel_data_semaforo.append(row)

        df_semaforo = pd.DataFrame(excel_data_semaforo)
        excel_semaforo_output = io.BytesIO()
        with pd.ExcelWriter(excel_semaforo_output, engine='xlsxwriter') as writer:
            df_semaforo.to_excel(writer, sheet_name="Reporte_Riesgo", index=False)

        nombre_reporte_semaforo = f"Reporte_semaforo_{muestras_data[0]['Centro']}_{fecha_muestra}.xlsx"
        excel_semaforo_output.seek(0)
        
        return dcc.send_bytes(excel_semaforo_output.getvalue(), nombre_reporte_semaforo)