// Función para cargar el archivo JSON
async function cargarCoordenadas() {
    try {
        const respuesta = await fetch('assets/json/coordenadas.json');
        const data = await respuesta.json();

        const select = document.getElementById('capitales');

        // Iterar sobre las entradas del JSON y crear opciones
        for (const [ciudad, coordenadas] of Object.entries(data)) {
            const option = document.createElement('option');
            option.value = coordenadas;
            option.textContent = ciudad;
            select.appendChild(option);
        }
    } catch (error) {
        console.error('Error al cargar el JSON:', error);
    }
}

/* API que tiene CORS =(
async function enviarDatos(coordenadas) {
    const url = 'https://weather.com/api/v1/p/redux-dal';
    const body = [
        {
            "name": "getSunWeatherAlertHeadlinesUrlConfig",
            "params": {
                "geocode": coordenadas,
                "units": "m"
            }
        }
    ];

    try {
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const resultado = await respuesta.json();
        console.log('Respuesta de la API:', resultado);
    } catch (error) {
        console.error('Error al enviar los datos:', error);
    }
}
*/

// Función para realizar la solicitud a la API de Open-Meteo
async function obtenerClima(coordenadas) {
    const [latitude, longitude] = coordenadas.split(',');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&forecast_days=1`;

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        // Mostrar los datos obtenidos
        const resultadoDiv = document.getElementById('resultado');
        const current_weather = datos.current_weather;
        const hourly = datos.hourly;

        console.log("datos:::",datos)
        console.log("current:::",current_weather)
        console.log("hourly:::",hourly)

        resultadoDiv.innerHTML = `
            <h3>Clima actual para (${latitude}, ${longitude}):</h3>
            <p>Temperatura actual: ${current_weather.temperature} °C</p>
            <p>Velocidad del viento: ${current_weather.wind_speed} km/h</p>
            <h4>Pronóstico para las próximas horas:</h4>
            <ul>
                ${hourly.time.map((time, index) => {
                    const localTime = new Date(time).toLocaleString(); // Conversión a formato local
                    return `
                        <li>
                            ${localTime}: ${hourly.temperature_2m[index]} °C, 
                            Humedad: ${hourly.relative_humidity_2m[index]}%, 
                            Viento: ${hourly.wind_speed_10m[index]} km/h
                        </li>`;
                }).join('')}
            </ul>
        `;
    } catch (error) {
        console.error('Error al obtener los datos del clima:', error);
    }
}

async function obtenerClimaTabulator(coordenadas) {
    const { DateTime } = luxon;
    const [latitude, longitude] = coordenadas.split(',');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&forecast_days=1`;

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        // Transformar datos para Tabulator
        const tabledata = datos.hourly.time.map((time, index) => {
            const localTime = DateTime.fromISO(time).toLocaleString(DateTime.TIME_SIMPLE); // Formatear tiempo usando Luxon
            return {
                time: localTime,
                temperature: datos.hourly.temperature_2m[index],
                humidity: datos.hourly.relative_humidity_2m[index],
                windSpeed: datos.hourly.wind_speed_10m[index]
            };
        });

        // Configurar Tabulator
        const table = new Tabulator("#example-table", {
            data: tabledata,
            //layout: "fitColumns",
            layout: "fitDataTable",
            //responsiveLayout: "collapse",
            //resizableColumnFit:false,
            //rowHeader:{formatter:"responsiveCollapse", width:30, minWidth:30, hozAlign:"center", resizable:false, headerSort:false},
            //pagination: "local",
            //paginationSize: 7,
            //paginationCounter: "rows",
            movableColumns: false,
            initialSort: [{ column: "time", dir: "asc" }],
            columnDefaults: {
                tooltip: true,
            },
            columns: [
                { title: "Hora", field: "time", sorter: "date", hozAlign: "center", frozen:true, resizable:false },
                { title: "Temp. (°C)", field: "temperature", hozAlign: "center", frozen:true, resizable:false },
                { title: "Hum. (%)", field: "humidity", hozAlign: "center", frozen:true, resizable:false },
                //{ title: "Viento (km/h)", field: "windSpeed", hozAlign: "center", frozen:true, resizable:false }
            ],
        });

    } catch (error) {
        console.error('Error al obtener los datos del clima:', error);
    }
}

// Escuchar cambios en el selector
document.getElementById('capitales').addEventListener('change', function () {
    const coordenadas = this.value;
    //enviarDatos(coordenadas); API con CORS
    //obtenerClima(coordenadas);
    obtenerClimaTabulator(coordenadas);
});


// Cargar las coordenadas al cargar la página
document.addEventListener('DOMContentLoaded', cargarCoordenadas);