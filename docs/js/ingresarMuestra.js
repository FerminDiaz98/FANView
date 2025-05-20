import { auth, rtdb } from "./firebaseConfig.js"
import { ref, child, get, set } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js"

const empresa_select = document.getElementById('empresa_select')
const centro_select = document.getElementById('centro_select')
const especies_select = document.getElementById('especies_select')

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

function loopSpeciesSelect(){
    get(child(ref(rtdb), 'Especie/')).then((items)=>{
        if(items.exists()){
            items.forEach((child)=>{
                especies_select.innerHTML += 
                `<div class="mb-2 row">
                    <div class="col-3"><label>`+child.key+`</label></div>
                    <div class="col-2"><input id="0m`+child.key+`" type="number" class="form-control" placeholder="0m" required></div>
                    <div class="col-2"><input id="5m`+child.key+`" type="number" class="form-control" placeholder="5m" required></div>
                    <div class="col-2"><input id="10m`+child.key+`" type="number" class="form-control" placeholder="10m" required></div>
                    <div class="col-2"><input id="15m`+child.key+`" type="number" class="form-control" placeholder="15m" required></div>
                </div>`;
            })
        }
    })
}

function loadData(){
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

const subirDatos = document.getElementById("ingresar_datos");

mostrarResumenBtn.addEventListener('click', function(){
    if(submitForm.checkValidity()){
        mostrarResumen();
        window.scrollTo(0, document.body.scrollHeight);
    }
    else{
        alert("Uno o mas campos están incompletos.");
    }
})

function mostrarResumen(){
    muestra_data = {
        'Empresa': document.getElementById('empresa_select').value,
        'Centro': document.getElementById('centro_select').value,
        'Time_Muestreo': document.getElementById('time_muestreo').value,
        'Time_Recepcion': document.getElementById('time_recepcion').value,
        'Time_Analisis': document.getElementById('time_analisis').value,
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

    resumenHTML.innerHTML = 
        `<div><h4>Resumen de datos ingresados</h4>
            <p>Empresa: `+muestra_data.Empresa+`</p>
            <p>Centro: `+muestra_data.Centro+`</p>
            <p>Fecha y Hora de Muestreo: `+muestra_data.Time_Muestreo+`</p>
            <p>Fecha y Hora de Recepción: `+muestra_data.Time_Recepcion+`</p>
            <p>Fecha y Hora de Análisis: `+muestra_data.Time_Analisis+`</p>
            <p>Temperatura: 0m = `+tem_data["0m"]+`°C, 5m = `+tem_data["5m"]+`°C, 10m = `+tem_data["10m"]+`°C, 15m = `+tem_data["15m"]+`°C</p>
            <p>Salinidad: 0m = `+sal_data["0m"]+`PSU, 5m = `+sal_data["5m"]+`PSU, 10m = `+sal_data["10m"]+`PSU, 15m = `+sal_data["15m"]+`PSU</p>
            <p>Oxígeno: 0m = `+oxi_data["0m"]+`mg/L, 5m = `+oxi_data["5m"]+`mg/L, 10m = `+oxi_data["10m"]+`mg/L, 15m = `+oxi_data["15m"]+`mg/L</p>
            <p>Disco Secchi: `+muestra_data.Disco_Secchi+`m</p></div>`;

    get(child(ref(rtdb), 'Especie/')).then((items)=>{
        if(items.exists()){
            items.forEach((child)=>{
                resumenHTML.innerHTML +=  
                `<p>`+child.key+`:
                ` +document.getElementById('0m'+child.key).value+`,
                ` +document.getElementById('5m'+child.key).value+`,
                ` +document.getElementById('10m'+child.key).value+`,
                ` +document.getElementById('15m'+child.key).value+`</p>`;
            })
        }
    })
    subirDatos.style.display = "block"
}

subirDatos.addEventListener('click', function(){
    if(true){
        subirDatosMuestra();
    }
    else{
        alert("Testalert");
    }
})

function subirDatosMuestra(){
    console.log("subir datos muestra button")
    //Muestra_EMPRESA_CENTRO_(TODAY)
    let today = new Date()
    set(ref(rtdb, 'Muestra/'+ muestra_data.Empresa+'_'+muestra_data.Centro+'_'+today), muestra_data)
    set(ref(rtdb, 'Muestra/'+ muestra_data.Empresa+'_'+muestra_data.Centro+'_'+today+'/Temperatura/'), tem_data)
    set(ref(rtdb, 'Muestra/'+ muestra_data.Empresa+'_'+muestra_data.Centro+'_'+today+'/Salinidad/'), sal_data)
    set(ref(rtdb, 'Muestra/'+ muestra_data.Empresa+'_'+muestra_data.Centro+'_'+today+'/Oxígeno/'), oxi_data)
    
    get(child(ref(rtdb), 'Especie/')).then((items)=>{
        if(items.exists()){
            items.forEach((child)=>{
                console.log(document.getElementById('0m'+child.key).value)
                let especie_data = {
                    '0m': document.getElementById('0m'+child.key).value,
                    '5m': document.getElementById('5m'+child.key).value,
                    '10m': document.getElementById('10m'+child.key).value,
                    '15m': document.getElementById('15m'+child.key).value,
                }
                set(ref(rtdb, 'Muestra/'+ muestra_data.Empresa+'_'+muestra_data.Centro+'_'+today+'/Especie/'+child.key+'/'), especie_data)
            })
        }
    })
    // submitForm.reset() note to self, fix this later (alert is enough?)
}