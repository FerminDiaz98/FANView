import { auth, rtdb } from "./firebaseConfig.js"
import { ref, set } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js"
// import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js"; //firestore db

const submitButton = document.getElementById('submitdb')
const submitForm = document.getElementById('form')

submitButton.addEventListener('click', function(){
    if(submitForm.checkValidity()){
        submitdb(submitButton.dataset.db)
    }
    else{
        alert("Uno o mas campos están incompletos.")
    }
})

function submitdb(section){
    auth.onAuthStateChanged(function(user){
        if (user) {
            switch(section) {
                case 'centro':
                    submitcentro()
                    break;
                case 'empresa':
                    submitempresa()
                    break;
                case 'especie':
                    submitespecie()
                    break
                default:
                    alert('Error inesperado: Se intenta subir datos a db '+ section + ', que no existe.');
                    console.log('Error: '+ section+ ' no existe, revisar submitdb.js');
                    window.location.href="./index.html";
              } 
        }
        else {
            console.log('Error: No hay usuario')
            window.location.href="./index.html";
        }
    })
}

function submitcentro(){
    // console.log('Subiendo datos a db centro');
    const centro_nombre = document.getElementById('nombre').value
    const centro_data = {
        'Empresa': document.getElementById('empresa').value,
        'Latitud': document.getElementById('latitud').value,
        'Longitud': document.getElementById('longitud').value
    }
    // console.log(centro_nombre)
    // console.log(centro_data)
    set(ref(rtdb, 'Centro/'+ centro_nombre), centro_data) //realtime
    // addDoc(collection(fsdb,'Centro/'+ centro_nombre), centro_data) //firestore
    alert('Añadido Centro '+centro_nombre+
        '\nEmpresa: '+centro_data.Empresa+
        '\nLatitud: '+centro_data.Latitud+
        '\nLongitud: '+centro_data.Longitud)
    submitForm.reset()
    
}

function submitempresa(){
    // console.log('Subiendo datos a db empresa');
    const empresa_nombre = document.getElementById('nombre').value
    const empresa_data = {
        'Direccion': document.getElementById('direccion').value,
        'Nombre_Contacto': document.getElementById('contacto').value,
        'Telefono_Contacto': document.getElementById('telefono').value
    }
    // console.log(empresa_nombre)
    // console.log(empresa_data)
    set(ref(rtdb, 'Empresa/'+ empresa_nombre), empresa_data) //realtime
    // addDoc(collection(fsdb,'Empresa/'+ empresa_nombre), empresa_data) //firestore
    alert('Añadido Empresa '+empresa_nombre+
        '\nDirección: '+empresa_data.Direccion+
        '\nNombre Contacto: '+empresa_data.Nombre_Contacto+
        '\nTelefono Contacto: '+empresa_data.Telefono_Contacto)
    submitForm.reset()
    
}

function submitespecie(){
    // console.log('Subiendo datos a db especie');
    const especie_nombre = document.getElementById('nombre').value
    const especie_data = {
        'Genero': document.getElementById('genero').value,
        'Grupo': document.getElementById('grupo').value,
        'Nocividad': document.getElementById('nocividad').value,
        'Valor_Normal': document.getElementById('valor_normal').value,
        'Valor_Alerta': document.getElementById('valor_alerta').value
    }
    // console.log(especie_nombre)
    // console.log(especie_data)
    set(ref(rtdb, 'Especie/'+ especie_nombre), especie_data) //realtime
    // addDoc(collection(fsdb,'especie/'+ especie_nombre), especie_data) //firestore
    alert('Añadido Especie '+especie_nombre+
        '\nGenero: '+especie_data.Genero+
        '\nGrupo: '+especie_data.Grupo+
        '\nNocividad: '+especie_data.Nocividad+
        '\nValor Normal: '+especie_data.Valor_Normal+
        '\nValor Alerta: '+especie_data.Valor_Alerta)
    submitForm.reset()
}