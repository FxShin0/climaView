const apiKey = "a7648d6c4b6266cc09ab08a400a2a83f";
const body = document.querySelector("body");
const climaCard = document.querySelector(".clima-card");
const searchBtn = document.querySelector(".search-btn");
const searchText = document.querySelector("#search");
let hours;
let minutes;
let esDia;
const setearHora = () => {
  const date = new Date();
  hours = date.getHours();
  minutes = date.getMinutes();
  esDia = hours >= 6 && hours < 18;
  if (hours < 10) hours = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;
};
setearHora();
const mostrarError = (error) => {
  switch (error.code) {
    case 1:
      alert(
        "Porfavor, permite el acceso a la ubicacion para poder reportar el clima en tu zona."
      );
      break;
    case 2:
      alert("La posicion actual del dispositivo no se encuentra disponible.");
      break;
    case 3:
      alert("La solicitud de posicion tardo demasiado tiempo en completarse");
      break;
    default:
      alert(
        "Ha ocurrido un error desconocido cuando se intento obtener la posicion"
      );
      break;
  }
};
const obtenerClima = async (posicion) => {
  //obtiene el clima, devuelve el objeto obtenido
  const lat = posicion.coords.latitude;
  const lon = posicion.coords.longitude;
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=es&units=metric`
    );
    const climaGen = await res.json();
    return climaGen;
  } catch (error) {
    alert("Error al intentar obtener datos del clima, intente mas tarde");
  }
};
const obtenerDireccion = async (posicion) => {
  const lat = posicion.coords.latitude;
  const lon = posicion.coords.longitude;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
    );
    const dir = await res.json();
    return dir;
  } catch (error) {
    alert("Error al intentar obtener la direccion, intente mas tarde");
  }
};
const primeraLetraAMayus = (string) => {
  let primera = string.charAt(0).toUpperCase();
  let resto = string.slice(1);
  return primera + resto;
};
const setBackground = (clima) => {
  if (clima >= 200 && clima < 300) {
    body.className = "thunderstorm coverCenterNRP";
  } else if (clima >= 300 && clima < 400) {
    body.className = "drizzle coverCenterNRP";
  } else if (clima >= 500 && clima < 600) {
    body.className = "rainy coverCenterNRP";
  } else if (clima >= 600 && clima < 700) {
    body.className = "snowy coverCenterNRP";
  } else if (clima >= 700 && clima < 800) {
    body.className = "misty coverCenterNRP";
  } else if (clima == 800) {
    body.className = "clear coverCenterNRP";
  } else {
    body.className = "cloudy coverCenterNRP";
  }
};
const determinarMeridiano = (horas) => {
  if (horas >= 0 && horas < 12) return "AM";
  else return "PM";
};
const isValidState = (state) => {
  if (state !== undefined) return state + ", ";
  return "";
};
const renderClimaCard = async (posicion) => {
  //obtencion de clima y de direccion
  const clima = await obtenerClima(posicion);
  const direccion = await obtenerDireccion(posicion);
  //desestructuracion de datos
  const { temp, temp_max, temp_min, feels_like } = clima.main;
  const descripcion = primeraLetraAMayus(clima.weather[0].description);
  const icon = clima.weather[0].icon;
  const idClima = clima.weather[0].id;
  let { state_district, suburb, city, country, state } = direccion.address;
  setearHora();
  const meridiano = determinarMeridiano(hours);
  setBackground(idClima);
  climaCard.innerHTML = `
  <div class="clima-info-container-gen">
        <div class="clima-info-container">
          <img
            id="weatherIcon"
            src="https://openweathermap.org/img/w/${icon}.png"
            alt="icono de clima"
          />
          <h2 id="temp" class="thunderstormTextColor">${temp}°C</h2>
        </div>
        <h2 id="descripcion" class="thunderstormTextColor">
          ${descripcion}
        </h2>
      </div>
      <div class="temperatura-info-container">
        <h3 class="thunderstormTextColor">Min: ${temp_min}°C</h3>
        <h3 class="thunderstormTextColor">Max: ${temp_max}°C</h3>
        <h3 class="thunderstormTextColor">ST: ${feels_like}°C</h3>
      </div>
      <div class="hora-info-container">
        <p class="hora thunderstormTextColor"> ${hours}:${minutes} ${meridiano}</p>
      </div>
      <div class="ciudad-info-container">
        <p class="ciudad thunderstormTextColor">${isValidState(
          state
        )}${country}</p>
      </div>
  `;
};
const obtenerUbicacion = async () => {
  //obtiene longitud y latitud de la posicion actual usando geolocalizacion del navegador, llama a las funciones correspondientes
  if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(renderClimaCard, mostrarError);
  else alert("El navegador no admite geolocalizacion");
};
const buscarDireccion = async () => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    searchText.value
  )}&format=json&addressdetails=1`;
  searchText.value = "";
  try {
    const res = await fetch(url);
    const ubicacion = await res.json();

    const { lat, lon } = ubicacion[0];
    const pseudoPosicion = {
      coords: {
        latitude: lat,
        longitude: lon,
      },
    };
    await renderClimaCard(pseudoPosicion);
  } catch (error) {
    alert("Error al buscar la direccion");
  }
};
const init = () => {
  obtenerUbicacion();
  searchBtn.addEventListener("click", buscarDireccion);
  setearHora();
};
init();
