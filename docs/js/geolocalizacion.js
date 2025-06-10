import { auth, rtdb } from "./firebaseConfig.js"
import { ref, child, get, set, onValue } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js"

const empresa_select = document.getElementById('empresa_select')
const especie_select = document.getElementById('especie_select')
const profundidades = document.getElementById('profundidades')

const fecha_input = document.getElementById('time_muestreo')
const tablaBody = document.getElementById('tablaBody')

var puntos = L.layerGroup([])

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

function loadData() {
    getSelectData(empresa_select)
    getSelectData(especie_select)
    loadMuestras()
}

window.addEventListener('load', loadData())



async function loadMuestras() {
    tablaBody.innerHTML = ''
    puntos.clearLayers()
    if (fecha_input.value != '' && especie_select.value != '' && empresa_select.value != '') {
        await get(child(ref(rtdb), 'Muestra/')).then((items) => {
            if (items.exists()) {
                items.forEach((child) => {
                    if (child.val()["Fecha_Analisis"] === undefined) {
                        console.log("FECHA ANALISIS UNDEFINED")
                    }
                    else {
                        if (child.val()["Fecha_Analisis"].split("T")[0] == fecha_input.value &&
                            child.val()['Empresa'] == empresa_select.value &&
                            child.val()['Especie'][especie_select.value] != undefined) {
                            tablaBody.innerHTML += `<tr>
                                <td>`+ child.val()['Empresa'] + `</td>
                                <td>`+ child.val()['Centro'] + `</td>
                                <td>`+ especie_select.value + `</td>
                                <td>`+ child.val()['Especie'][especie_select.value]['0m'] + `</td>
                                <td>`+ child.val()['Especie'][especie_select.value]['5m'] + `</td>
                                <td>`+ child.val()['Especie'][especie_select.value]['10m'] + `</td>
                                <td>`+ child.val()['Especie'][especie_select.value]['15m'] + `</td>
                                <td>`+ child.val()['Comportamiento'] + `</td>
                                </tr>`
                            colorPuntos(child.val()['Centro'], especie_select.value, child.val()['Especie'][especie_select.value][profundidades.value])

                        }
                    }
                })
            }
        })
        puntos.addTo(map)
    }
}

fecha_input.addEventListener('change', loadMuestras)
especie_select.addEventListener('change', loadMuestras)
empresa_select.addEventListener('change', loadMuestras)
profundidades.addEventListener('change', loadMuestras)

//este es el mapa
var map = L.map('map').setView([-42.1, -73.1], 8);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: "© Esri, Maxar, Earthstar Geographics"
}).addTo(map);

L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    opacity: 0.9
}).addTo(map);

async function addPuntos(muestraCentro, puntoColor, muestraEspecie) {
    const currentCentro = ref(rtdb, 'Centro/' + muestraCentro);
    await onValue(currentCentro, (snapshotCentro) => {
        const centro = snapshotCentro.val();
        var circle = L.circle([centro['Latitud'], centro['Longitud']], {
            color: puntoColor,
            radius: 10,
            fill: true,
            fillOpacity: 0.7,
        })
        circle.bindPopup("Centro: "+muestraCentro+"<br>Especie: "+muestraEspecie);
        circle.addTo(puntos)
    });
}

async function colorPuntos(muestraCentro, muestraEspecie, cantidadEspecie) {
    const currentEspecie = ref(rtdb, 'Especie/' + muestraEspecie);
    await onValue(currentEspecie, (snapshotEspecie) => {
        const especie = snapshotEspecie.val()
        if(cantidadEspecie <= especie['Valor_Normal']){
            addPuntos(muestraCentro, 'green', muestraEspecie)
        }
        else if(cantidadEspecie > especie['Valor_Alerta']){
            addPuntos(muestraCentro, 'red', muestraEspecie)
        }
        else{
            addPuntos(muestraCentro, 'yellow', muestraEspecie)
        }
    });
}