import { auth, rtdb } from "./firebaseConfig.js"
import { ref, child, get, set } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js"

const empresa_select = document.getElementById('empresa_select')
const centro_select = document.getElementById('centro_select')
const especies_select = document.getElementById('especies_select')

function getSelectData(element) {
    // console.log(element.dataset.db+'/')
    get(child(ref(rtdb), element.dataset.db + '/')).then((items) => {
        if (items.exists()) {
            // console.log(items.key,items.val())
            items.forEach((child) => {
                // console.log(child.key,child.val())
                let opt = document.createElement('option');
                opt.value = child.key;
                opt.innerText = child.key;
                element.append(opt);
            })
            element.disabled = false;
        }
    })
}

function loopSpeciesSelect() {
    get(child(ref(rtdb), 'Especie/')).then((items) => {
        if (items.exists()) {
            items.forEach((child) => {
                especies_select.innerHTML +=
                    `<div class="mb-2 row">
                    <div class="col-3"><label>`+ child.key + `</label></div>
                    <div class="col-2"><input id="0m`+ child.key + `" type="number" class="form-control" placeholder="0m"></div>
                    <div class="col-2"><input id="5m`+ child.key + `" type="number" class="form-control" placeholder="5m"></div>
                    <div class="col-2"><input id="10m`+ child.key + `" type="number" class="form-control" placeholder="10m"></div>
                    <div class="col-2"><input id="15m`+ child.key + `" type="number" class="form-control" placeholder="15m"></div>
                </div>`;
            })
        }
    })
}

function loadData() {
    getSelectData(empresa_select)
    getSelectData(centro_select)
    loopSpeciesSelect()
}

window.addEventListener('load', loadData())

const mostrarResumenBtn = document.getElementById('mostrar_resumen');
const submitForm = document.getElementById('form');
const resumenHTML = document.getElementById('resumen');

let muestra_data = {}
let tem_data = {}
let sal_data = {}
let oxi_data = {}
let especie_data = {}
let especie_meta = {}

const subirDatos = document.getElementById("ingresar_datos");
const descargarInforme = document.getElementById('descargar_informe');

mostrarResumenBtn.addEventListener('click', function () {
    if (submitForm.checkValidity()) {
        mostrarResumen();
        window.scrollTo(0, document.body.scrollHeight);
    }
    else {
        alert("Uno o mas campos están incompletos.");
    }
})

async function mostrarResumen() {
    muestra_data = {
        'Empresa': document.getElementById('empresa_select').value,
        'Centro': document.getElementById('centro_select').value,
        'Fecha_Muestreo': document.getElementById('fecha_muestreo').value,
        'Fecha_Recepcion': document.getElementById('fecha_recepcion').value,
        'Fecha_Analisis': document.getElementById('fecha_analisis').value,
        'Disco_Secchi': document.getElementById('disco_secchi').value,
        'Comportamiento': document.getElementById('comportamiento').value
    }

    tem_data = {
        '0m': document.getElementById('0mtem').value,
        '5m': document.getElementById('5mtem').value,
        '10m': document.getElementById('10mtem').value,
        '15m': document.getElementById('15mtem').value,
    }

    sal_data = {
        '0m': document.getElementById('0msal').value,
        '5m': document.getElementById('5msal').value,
        '10m': document.getElementById('10msal').value,
        '15m': document.getElementById('15msal').value,
    }

    oxi_data = {
        '0m': document.getElementById('0moxi').value,
        '5m': document.getElementById('5moxi').value,
        '10m': document.getElementById('10moxi').value,
        '15m': document.getElementById('15moxi').value,
    }

    especie_data = {}
    especie_meta = {}

    muestra_data = Object.assign({ Temperatura: tem_data }, muestra_data)
    muestra_data = Object.assign({ Salinidad: sal_data }, muestra_data)
    muestra_data = Object.assign({ Oxígeno: oxi_data }, muestra_data)

    resumenHTML.innerHTML =
        `<div><h4>Resumen de datos ingresados</h4>
            <p>Empresa: `+ muestra_data.Empresa + `</p>
            <p>Centro: `+ muestra_data.Centro + `</p>
            <p>Fecha y Hora de Muestreo: `+ muestra_data.Fecha_Muestreo + `</p>
            <p>Fecha y Hora de Recepción: `+ muestra_data.Fecha_Recepcion + `</p>
            <p>Fecha y Hora de Análisis: `+ muestra_data.Fecha_Analisis + `</p>
            <p>Temperatura: 0m = `+ muestra_data.Temperatura["0m"] + `°C, 5m = ` + muestra_data.Temperatura["5m"] + `°C, 10m = ` + muestra_data.Temperatura["10m"] + `°C, 15m = ` + muestra_data.Temperatura["15m"] + `°C</p>
            <p>Salinidad: 0m = `+ muestra_data.Salinidad["0m"] + `PSU, 5m = ` + muestra_data.Salinidad["5m"] + `PSU, 10m = ` + muestra_data.Salinidad["10m"] + `PSU, 15m = ` + muestra_data.Salinidad["15m"] + `PSU</p>
            <p>Oxígeno: 0m = `+ muestra_data.Oxígeno["0m"] + `mg/L, 5m = ` + muestra_data.Oxígeno["5m"] + `mg/L, 10m = ` + muestra_data.Oxígeno["10m"] + `mg/L, 15m = ` + muestra_data.Oxígeno["15m"] + `mg/L</p>
            <p>Disco Secchi: `+ muestra_data.Disco_Secchi + `m</p></div>`;

    await get(child(ref(rtdb), 'Especie/')).then((items) => {
        if (items.exists()) {
            items.forEach((child) => {
                if (document.getElementById('0m' + child.key).value == document.getElementById('5m' + child.key).value &&
                    document.getElementById('5m' + child.key).value == document.getElementById('10m' + child.key).value &&
                    document.getElementById('10m' + child.key).value == document.getElementById('15m' + child.key).value &&
                    document.getElementById('15m' + child.key).value == '') {
                    // console.log("Especie ignorada")
                }
                else {
                    let especie = {
                        '0m': document.getElementById('0m' + child.key).value,
                        '5m': document.getElementById('5m' + child.key).value,
                        '10m': document.getElementById('10m' + child.key).value,
                        '15m': document.getElementById('15m' + child.key).value,
                    }
                    let especie_values = {
                        'Grupo': child.val()['Grupo'],
                        'Genero': child.val()['Genero'],
                        'Nocividad': child.val()['Nocividad']
                    }
                    resumenHTML.innerHTML +=
                        `<p>` + child.key + `:
                    ` + especie["0m"] + `,
                    ` + especie["5m"] + `,
                    ` + especie["10m"] + `,
                    ` + especie["15m"] + `</p>`;

                    especie_data = Object.assign({ [child.key]: especie }, especie_data)
                    especie_meta = Object.assign({ [child.key]: especie_values }, especie_meta)
                }
            })
        }
    })

    muestra_data = Object.assign(muestra_data, { Especie: especie_data })
    // console.log(muestra_data)
    subirDatos.style.display = "block"
    descargarInforme.style.display = "block"
}

subirDatos.addEventListener('click', function () {
    if (true) {
        subirDatosMuestra();
    }
    else {
        alert("Testalert");
    }
})

function subirDatosMuestra() {
    //Muestra_EMPRESA_CENTRO_(TODAY)
    let today = new Date()
    set(ref(rtdb, 'Muestra/' + muestra_data.Empresa + '_' + muestra_data.Centro + '_' + today), muestra_data)
    // submitForm.reset() note to self, fix this later (alert is enough?)
}

descargarInforme.addEventListener('click', function () {
    if (true) {
        descargarExcel()
    }
    else {
        alert("Testalert");
    }
})

function descargarExcel() {
    var planilla = []
    Object.keys(especie_data).forEach(especie => {
        Object.keys(especie_data[especie]).forEach(profundidad => {
            // console.log(especie, profundidad, especie_data[especie][profundidad])
            if (especie_data[especie][profundidad] != '') {
                planilla.push({
                    ['Empresa']: muestra_data.Empresa,
                    ['Centro']: muestra_data.Centro,
                    ['Fecha Muestra']: muestra_data.Fecha_Muestreo.split("T")[0],
                    ['Hora Muestra']: muestra_data.Fecha_Muestreo.split("T")[1],
                    ['Fecha Analisis']: muestra_data.Fecha_Analisis.split("T")[0],
                    ['Hora Analisis']: muestra_data.Fecha_Analisis.split("T")[1],
                    ['Disco Secchi']: muestra_data.Disco_Secchi,
                    ['Conducta Peces']: muestra_data.Comportamiento,
                    ['Profundidad']: profundidad,
                    ['Grupo']: especie_meta[especie]['Grupo'],
                    ['Genero']: especie_meta[especie]['Genero'],
                    ['Especie']: especie,
                    ['Cantidad']: especie_data[especie][profundidad],
                    ['Nocivo']: especie_meta[especie]['Nocividad'],
                    ['Temperatura']: tem_data[profundidad],
                    ['Salinidad']: sal_data[profundidad],
                    ['Oxígeno']: oxi_data[profundidad]
                })
            }
        })
    })

    // console.log(planilla)
    // planilla['A1'].s = {
    //     font: {
    //         bold: true,
    //         color: "#F2F2F2"
    //     },
    // }
    // var data2 = [{ a: 1, b: 2, c: 3 }, { b: 3 }]
    let today = new Date()
    var opts = [{ sheetid: 'Planilla', header: true }];//,[sheetid: data2, header:true];
    var res = alasql('SELECT * INTO XLSX("Informe_'+today+'.xlsx",?) FROM ?',
        [opts, [planilla]]);
}