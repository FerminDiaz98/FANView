import { auth, rtdb } from "./firebaseConfig.js"
import { ref, child, get, set } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js"

const empresa_select = document.getElementById('empresa_select')
const especie_select = document.getElementById('especie_select')


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

var map = L.map('map').setView([-42.1, -73.1], 8);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

