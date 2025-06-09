import { auth, rtdb } from "./firebaseConfig.js"
import { ref, child, get, set } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js"

const empresa_select = document.getElementById('empresa_select')
const especie_select = document.getElementById('especie_select')

const fecha_input = document.getElementById('time_muestreo')
const tablaGeo = document.getElementById('tablaGeo')

function getSelectData(element){
    // console.log(element.dataset.db+'/')
    get(child(ref(rtdb), element.dataset.db+'/')).then((items)=>{
        if(items.exists()){
            // console.log(items.key,items.val())
            items.forEach((child)=>{
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

function loadData(){
    getSelectData(empresa_select)
    getSelectData(especie_select)
}

window.addEventListener('load', loadData())

function loadMuestras(){
    console.log(fecha_input.value)
    get(child(ref(rtdb), 'Muestra/')).then((items)=>{
        if(items.exists()){
            items.forEach((child)=>{
                if(child.val()["Fecha_Analisis"] === undefined){
                    console.log("FECHA ANALISIS UNDEFINED")
                }
                else{
                    console.log(child.val())
                    if(child.val()["Fecha_Analisis"].split("T")[0] == fecha_input.value){
                        console.log(child.val())
                        child.forEach((especie)=>{
                            tablaGeo.innerHTML +=`<tr>
                            <td>`+child.val()['Empresa']+`</td>
                            <td>`+child.val()['Centro']+`</td>
                            <td>`+especie.val()['Especie']+`</td>
                            <td>`+especie.val()['Profundidad_0m']+`</td>
                            <td>`+especie.val()['Profundidad_5m']+`</td>
                            <td>`+especie.val()['Profundidad_10m']+`</td>
                            <td>`+especie.val()['Profundidad_15m']+`</td>
                            <td>`+especie.val()['Comportamiento']+`</td>
                            </tr>`
                        })
                        
                    }
                }
            })
            // element.disabled = false;
        }
    })
}

fecha_input.addEventListener('change', loadMuestras)

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