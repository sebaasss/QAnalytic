import Usuario from '../Dominio/Usuario.js';

const encabezados = ["USUARIO", "FRANJA", "CANTIDAD", "TIEMPO"];
const nombresUsuarios = [];
const usuarios = [];
const totalRespuestas = [];

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('seccionElegirUsuario').hidden = true;
    document.getElementById('seccionTablasDatosUsuario').hidden = true;
    document.getElementById('seccionTablasDatosTotales').hidden = true;
});

document.getElementById('botonTotal').addEventListener('click', (event) => {
    document.getElementById('elegirUsuario').hidden = true;
    document.getElementById('ElegirArchivo').hidden = true;
    document.getElementById('tipoDeAnalisis').hidden = true;
    document.getElementById('seccionTablasDatosUsuario').hidden = true;
    document.getElementById('seccionTablasDatosTotales').hidden = false;
});

document.getElementById('volverAlAnalisis').addEventListener('click', function() {
    document.getElementById('ElegirArchivo').hidden = false;
    document.getElementById('tipoDeAnalisis').hidden = false;
    document.getElementById('elegirUsuario').hidden = true;
    document.getElementById('seccionTablasDatosUsuario').hidden = true;
    document.getElementById('seccionTablasDatosTotales').hidden = true;
    document.getElementById('month').value = "seleccionaUnMes";
    document.getElementById('elegirUsuario').value = "seleccionaUsuario";
});

var file;
var fileData;
//Agregamos todos los usuarios
document.getElementById('file').addEventListener('change', function(evt) {
    file = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        fileData = e.target.result;
        var lineas = fileData.split('\n');
        // Recorre cada línea
        for (var i = 0; i < lineas.length; i++) {
            agregarUsuario(lineas[i], nombresUsuarios, usuarios);
        }
        var userSelect = document.getElementById('elegirUsuario');
        for (var i = 0; i < usuarios.length; i++) {
            var userOption = document.createElement('option');
            userOption.value = i;
            userOption.text = usuarios[i].nombre;
            userSelect.appendChild(userOption);
        }
    };
    reader.readAsText(file);
});

// Obtén el select del mes por su id
var selectElement = document.getElementById('month');
var selectedMonth;
selectElement.addEventListener('change', function() {
    selectedMonth = selectElement.value;
    var userSelect = document.getElementById('elegirUsuario');
    document.getElementById('seccionElegirUsuario').hidden = false;
    document.getElementById('elegirUsuario').hidden = false;
    var seccionElegirUsuario = document.getElementById('seccionElegirUsuario');
    seccionElegirUsuario.appendChild(userSelect);
});
// Añade un evento 'change' al select de usuarios
var userSelect = document.getElementById('elegirUsuario');
userSelect.addEventListener('change', function() {
    // Obtén el usuario seleccionado
    var selectedIndex = userSelect.value;
    var originalUser = usuarios[selectedIndex];
    var selectedUser = JSON.parse(JSON.stringify(originalUser));
    //Vuelvo a leer el archivo desde la 1er linea para manejar los datos
        var contents = fileData;
        var lineas = contents.split('\n');
        // Recorre cada línea
        for (var i = 0; i < lineas.length; i++) {
            var segundosTiempoResp = 0;
            var datos = lineas[i].split("@");
            var fechaHoraPregunta = new Date(datos[0]);
            var horasPregunta = new Date();
            horasPregunta.setHours(fechaHoraPregunta.getHours(),fechaHoraPregunta.getMinutes(),fechaHoraPregunta.getSeconds());
            var diaDeLaSemana = fechaHoraPregunta.getDay();
            var meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
            var mesPregunta = meses[fechaHoraPregunta.getMonth()];
            if(datos[1] === "Respondida" && mesPregunta === selectedMonth && datos[7] === selectedUser.nombre){
                var tiempoResp = new Date();
                tiempoResp.setHours(datos[9].split(':')[0]);
                tiempoResp.setMinutes(datos[9].split(':')[1]);
                tiempoResp.setSeconds(datos[9].split(':')[2]);
                segundosTiempoResp += tiempoResp.getHours() * 3600 + tiempoResp.getMinutes() * 60 + tiempoResp.getSeconds();
                agregarPreguntaAlDiaCorrespondiente(selectedUser, diaDeLaSemana, segundosTiempoResp, horasPregunta);  
            }
        }
        imprimirResultados(selectedUser, encabezados);
});

// Obtén el botón total por su id
var botonTotal = document.getElementById('botonTotal');
// Obtén las tablas por su id
botonTotal.addEventListener('click', function() {

//Crear usuarios totales
const respondidaTotal = new Usuario("Respondida");
totalRespuestas.push(respondidaTotal);
const respondidaModerada = new Usuario("Moderada");
totalRespuestas.push(respondidaModerada);

document.getElementById('ElegirArchivo').hidden = true;
document.getElementById('tipoDeAnalisis').hidden = true;
document.getElementById('elegirUsuario').hidden = true;
//Vuelvo a leer el archivo desde la 1er linea para manejar los datos
var reader = new FileReader();

    var contents = fileData;
    var lineas = contents.split('\n');
    // Recorre cada línea
    for (var i = 0; i < lineas.length; i++) {
        var segundosTiempoResp = 0;
        var datos = lineas[i].split("@");
        var fechaHoraPregunta = new Date(datos[0]);
        var horasPregunta = new Date();
        horasPregunta.setHours(fechaHoraPregunta.getHours(),fechaHoraPregunta.getMinutes(),fechaHoraPregunta.getSeconds());
        var diaDeLaSemana = fechaHoraPregunta.getDay();
        if(datos[1] === "Respondida"){
            var tiempoResp = new Date();
            tiempoResp.setHours(datos[9].split(':')[0]);
            tiempoResp.setMinutes(datos[9].split(':')[1]);
            tiempoResp.setSeconds(datos[9].split(':')[2]);
            segundosTiempoResp += tiempoResp.getHours() * 3600 + tiempoResp.getMinutes() * 60 + tiempoResp.getSeconds();
            agregarPreguntaAlDiaCorrespondiente(respondidaTotal, diaDeLaSemana, segundosTiempoResp, horasPregunta);
        }else if(datos[1] === "Moderada"){
            agregarPreguntaAlDiaCorrespondiente(respondidaModerada, diaDeLaSemana, 0, horasPregunta);
        }
    }
    imprimirResultadosTotales(respondidaTotal, respondidaModerada, encabezados);

});

//Funciones
function agregarUsuario(linea, nombresUsuarios, usuarios){
    var datos = linea.split('@');
    if (datos[1] === 'Respondida') {
        var usuario = datos[7];
        // Comprobar si el usuario ya está en la lista
        if (!nombresUsuarios.includes(usuario)) {
            nombresUsuarios.push(usuario);
            usuarios.push(new Usuario(usuario));
        }
    }
}

function imprimirResultadosTotales(usuarioRespondidas, usuarioModeradas, encabezados){
    // Obtén las tablas totales por su id
    var tablaDatosLaVTotales = document.getElementById('tablaDatosLaVTotales');
    var tablaDatosSabadoTotales = document.getElementById('tablaDatosSabadoTotales');
    var tablaDatosDomingoTotales = document.getElementById('tablaDatosDomingoTotales');
    var tablaDatosModeradas = document.getElementById('tablaDatosModeradas');

    // Limpia las tablas totales
    while (tablaDatosLaVTotales.rows.length > 0) {
        tablaDatosLaVTotales.deleteRow(0);
    }
    while (tablaDatosSabadoTotales.rows.length > 0) {
        tablaDatosSabadoTotales.deleteRow(0);
    }
    while (tablaDatosDomingoTotales.rows.length > 0) {
        tablaDatosDomingoTotales.deleteRow(0);
    }
    while (tablaDatosModeradas.rows.length > 0) {
        tablaDatosModeradas.deleteRow(0);
    }
    
    // Crea el encabezado de la tabla de datos totales
    crearEncabezados(tablaDatosLaVTotales, encabezados);
    crearEncabezados(tablaDatosSabadoTotales, encabezados);
    crearEncabezados(tablaDatosDomingoTotales, encabezados);
    crearEncabezados(tablaDatosModeradas, encabezados);

    // Crea las filas de datos por franjas horarias
    crearFilaDatosUsuario(usuarioRespondidas, tablaDatosLaVTotales);
    crearFilaDatosUsuario(usuarioRespondidas, tablaDatosSabadoTotales);
    crearFilaDatosUsuario(usuarioRespondidas, tablaDatosDomingoTotales);
    crearFilaDatosUsuario(usuarioModeradas, tablaDatosModeradas);

    document.getElementById('seccionTablasDatosUsuario').hidden = true;
    document.getElementById('seccionTablasDatosTotales').hidden = false;

    //Ocultar todo y Visibilizar la tabla
    document.getElementById('ElegirArchivo').hidden = true;
    document.getElementById('tipoDeAnalisis').hidden = true;
    document.getElementById('elegirUsuario').hidden = true;
}

function imprimirResultados(usuario, encabezados) {
    // Obtén las tablas de usuario por su id
    var tablaDatosGenerasMes = document.getElementById('tablaDatosGenerasMes');
    var tablaDatosLaV = document.getElementById('tablaDatosLaV');
    var tablaDatosSabado = document.getElementById('tablaDatosSabado');
    var tablaDatosDomingo = document.getElementById('tablaDatosDomingo');
    
    // Limpia las tablas por usuario
    while (tablaDatosGenerasMes.rows.length > 0) {
        tablaDatosGenerasMes.deleteRow(0);
    }
    while (tablaDatosLaV.rows.length > 0) {
        tablaDatosLaV.deleteRow(0);
    }
    while (tablaDatosSabado.rows.length > 0) {
        tablaDatosSabado.deleteRow(0);
    }
    while (tablaDatosDomingo.rows.length > 0) {
        tablaDatosDomingo.deleteRow(0);
    }
    
    // Crea el encabezado de la tabla de datos por franjas horarias
    crearEncabezados(tablaDatosGenerasMes, encabezados);
    crearEncabezados(tablaDatosLaV, encabezados);
    crearEncabezados(tablaDatosSabado, encabezados);
    crearEncabezados(tablaDatosDomingo, encabezados);

    // Crea las filas de datos por franjas horarias
    crearFilaDatosUsuario(usuario, tablaDatosGenerasMes);
    crearFilaDatosUsuario(usuario, tablaDatosLaV);
    crearFilaDatosUsuario(usuario, tablaDatosSabado);
    crearFilaDatosUsuario(usuario, tablaDatosDomingo);

    document.getElementById('seccionTablasDatosTotales').hidden = true;
    document.getElementById('seccionTablasDatosUsuario').hidden = false;
   
    //Ocultar todo y Visibilizar la tabla
    document.getElementById('ElegirArchivo').hidden = true;
    document.getElementById('tipoDeAnalisis').hidden = true;
    document.getElementById('elegirUsuario').hidden = true;
}

function crearEncabezados(tablaDatos, encabezados){
    var encabezado = tablaDatos.createTHead();
    var filaEncabezado = encabezado.insertRow();
    for (var i = 0; i < encabezados.length; i++) {
        var celdaEncabezado = document.createElement('th');
        celdaEncabezado.textContent = encabezados[i];
        filaEncabezado.appendChild(celdaEncabezado);
    }
}

function crearFilaDatosUsuario(usuario, tablaDatos){
    if(tablaDatos == document.getElementById('tablaDatosGenerasMes') || tablaDatos == document.getElementById('tablaDatosDomingo') || tablaDatos == document.getElementById('tablaDatosDomingoTotales') || tablaDatos == document.getElementById('tablaDatosModeradas')){
        var filaDatos = tablaDatos.insertRow();
        var celdaNombre = filaDatos.insertCell();
        celdaNombre.textContent = usuario.nombre;
        var celdaFranja = filaDatos.insertCell();
        celdaFranja.textContent = "No Aplica";
        var celdaPreguntas = filaDatos.insertCell();
        var celdaTiempo = filaDatos.insertCell();
        var caption = tablaDatos.createCaption();
        if(tablaDatos == document.getElementById('tablaDatosGenerasMes') || tablaDatos == document.getElementById('tablaDatosModeradas')){
            celdaPreguntas.textContent = usuario.preguntasTotales[0].cantPreguntas.fst;
            celdaTiempo.textContent = segundosATiempo(promedio(usuario.preguntasTotales[0].cantPreguntas.snd, usuario.preguntasTotales[0].cantPreguntas.fst));
            caption.textContent = "Total: " + usuario.preguntasTotales[0].cantPreguntas.fst;
        }else if(tablaDatos == document.getElementById('tablaDatosDomingo') || tablaDatos == document.getElementById('tablaDatosDomingoTotales')){
            celdaPreguntas.textContent = usuario.preguntasTotales[3].cantPreguntas.fst;
            celdaTiempo.textContent = segundosATiempo(promedio(usuario.preguntasTotales[3].cantPreguntas.snd, usuario.preguntasTotales[3].cantPreguntas.fst));
            caption.textContent = "Total: " + usuario.preguntasTotales[3].cantPreguntas.fst;
        }
        
    }else{
        for(var i = 1; i<=3; i++){
            var filaDatos = tablaDatos.insertRow();
            var celdaNombre = filaDatos.insertCell();
            celdaNombre.textContent = usuario.nombre;
            var celdaFranja = filaDatos.insertCell();
            var celdaPreguntas = filaDatos.insertCell();
            var celdaTiempo = filaDatos.insertCell();
            var caption = tablaDatos.createCaption();
            if(tablaDatos == document.getElementById('tablaDatosLaV') || tablaDatos == document.getElementById('tablaDatosLaVTotales')){
                // Ver en que franja estoy
                if(i == 1){
                    celdaPreguntas.textContent = usuario.preguntasTotales[1].franja1.fst;
                    celdaTiempo.textContent = segundosATiempo(promedio(usuario.preguntasTotales[1].franja1.snd, usuario.preguntasTotales[1].franja1.fst));
                    celdaFranja.textContent = "00:00 - 09:00";
                }else if(i ==2){
                    celdaPreguntas.textContent = usuario.preguntasTotales[1].franja2.fst;
                    celdaTiempo.textContent = segundosATiempo(promedio(usuario.preguntasTotales[1].franja2.snd, usuario.preguntasTotales[1].franja2.fst));
                    celdaFranja.textContent = "09:01 - 18:00";
                }else if(i ==3){
                    celdaPreguntas.textContent = usuario.preguntasTotales[1].franja3.fst;
                    celdaTiempo.textContent = segundosATiempo(promedio(usuario.preguntasTotales[1].franja3.snd, usuario.preguntasTotales[1].franja3.fst));
                    celdaFranja.textContent = "18:01 - 23:59";
                }
                caption.textContent = "Total: " + usuario.preguntasTotales[1].cantPreguntas.fst;
            }else if(tablaDatos == document.getElementById('tablaDatosSabado') || tablaDatos == document.getElementById('tablaDatosSabadoTotales')){
                if(i == 1){
                    celdaPreguntas.textContent = usuario.preguntasTotales[2].franja1.fst;
                    celdaTiempo.textContent = segundosATiempo(promedio(usuario.preguntasTotales[2].franja1.snd, usuario.preguntasTotales[2].franja1.fst));
                    celdaFranja.textContent = "00:00 - 10:00";
                }else if(i ==2){
                    celdaPreguntas.textContent = usuario.preguntasTotales[2].franja2.fst;
                    celdaTiempo.textContent = segundosATiempo(promedio(usuario.preguntasTotales[2].franja2.snd, usuario.preguntasTotales[2].franja2.fst));
                    celdaFranja.textContent = "10:01 - 13:00";
                }else if(i ==3){
                    celdaPreguntas.textContent = usuario.preguntasTotales[2].franja3.fst;
                    celdaTiempo.textContent = segundosATiempo(promedio(usuario.preguntasTotales[2].franja3.snd, usuario.preguntasTotales[2].franja3.fst));
                    celdaFranja.textContent = "13:01 - 23:59";
                }
                caption.textContent = "Total: " + usuario.preguntasTotales[2].cantPreguntas.fst;
            }
        }
    }
}

function segundosATiempo(segundos) {
    // Calcula las horas, minutos y segundos
    var hrs = Math.floor(segundos / 3600);
    var mins = Math.floor((segundos % 3600) / 60);
    var secs = Math.floor(segundos % 60); 

    // Asegúrate de que cada componente tenga al menos dos dígitos
    var hrsDisplay = hrs < 10 ? '0' + hrs : hrs;
    var minsDisplay = mins < 10 ? '0' + mins : mins;
    var secsDisplay = secs < 10 ? '0' + secs : secs;

    // Devuelve el tiempo en formato HH:MM:SS
    return hrsDisplay + ':' + minsDisplay + ':' + secsDisplay;
}

function promedio(a, b){
    if(a == 0){
        return 0;
    }
    return a/b;
}

function agregarPreguntaAlDiaCorrespondiente(usuario1, day, segundosTiempoResp, horaPregunta){
    var inicioDia = new Date(horaPregunta.getTime());
    inicioDia.setHours(0, 0, 0);
    var finDia = new Date(horaPregunta.getTime());
    finDia.setHours(23, 59, 0);
    var inicioHorarioTrabajo = new Date(horaPregunta.getTime());
    inicioHorarioTrabajo.setHours(9, 0, 0);
    var finHorarioTrabajo = new Date(horaPregunta.getTime());
    finHorarioTrabajo.setHours(18, 0, 0);
    var inicioHorarioTrabajoSabado = new Date(horaPregunta.getTime());
    inicioHorarioTrabajoSabado.setHours(10, 0, 0);
    var finHorarioTrabajoSabado = new Date(horaPregunta.getTime());
    finHorarioTrabajoSabado.setHours(13, 0, 0);

    //Analisis general
    usuario1.preguntasTotales[0].cantPreguntas.fst ++;
    usuario1.preguntasTotales[0].cantPreguntas.snd += segundosTiempoResp;
    //L a V
    if(day !== 6 && day !== 0){
        usuario1.preguntasTotales[1].cantPreguntas.fst ++;
        usuario1.preguntasTotales[1].cantPreguntas.snd += segundosTiempoResp;
        //Franja 1 - 00:00 - 09:00
        if(horaPregunta > inicioDia && horaPregunta < inicioHorarioTrabajo){
            usuario1.preguntasTotales[1].franja1.fst ++;
            usuario1.preguntasTotales[1].franja1.snd += segundosTiempoResp;
        }
        //Franja 2 - 09:01 - 18:00
        if(horaPregunta > inicioHorarioTrabajo && horaPregunta < finHorarioTrabajo){
            usuario1.preguntasTotales[1].franja2.fst ++;
            usuario1.preguntasTotales[1].franja2.snd += segundosTiempoResp;
        }
        //Franja 3 - 18:01 - 23:59
        if(horaPregunta > finHorarioTrabajo && horaPregunta < finDia){
            usuario1.preguntasTotales[1].franja3.fst ++;
            usuario1.preguntasTotales[1].franja3.snd += segundosTiempoResp;
        }
    }
    //Sabado
    if(day === 6){
        usuario1.preguntasTotales[2].cantPreguntas.fst ++;
        usuario1.preguntasTotales[2].cantPreguntas.snd += segundosTiempoResp;
        //Franja 1 - 00:00 - 10:00
        if(horaPregunta > inicioDia && horaPregunta < inicioHorarioTrabajoSabado){
            usuario1.preguntasTotales[2].franja1.fst ++;
            usuario1.preguntasTotales[2].franja1.snd += segundosTiempoResp;
        }
        //Franja 2 - 10:01 - 13:00
        if(horaPregunta > inicioHorarioTrabajoSabado && horaPregunta < finHorarioTrabajoSabado){
            usuario1.preguntasTotales[2].franja2.fst ++;
            usuario1.preguntasTotales[2].franja2.snd += segundosTiempoResp;
        }
        //Franja 3 - 13:01 - 23:59
        if(horaPregunta > finHorarioTrabajoSabado && horaPregunta < finDia){
            usuario1.preguntasTotales[2].franja3.fst ++;
            usuario1.preguntasTotales[2].franja3.snd += segundosTiempoResp;
        }
    }  
    //Domingo 
    if(day === 0){
        usuario1.preguntasTotales[3].cantPreguntas.fst ++;
        usuario1.preguntasTotales[3].cantPreguntas.snd += segundosTiempoResp;
    }
}
