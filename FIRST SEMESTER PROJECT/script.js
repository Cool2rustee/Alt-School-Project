/* ============================================
   ELEMENT REFERENCES
   Grabbing all the HTML elements we need to
   read from or write to, once, at the top.
   ============================================ */
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const errorMessage = document.getElementById("errorMessage");
const loadingMessage = document.getElementById("loadingMessage");

const weatherHero = document.getElementById("weatherHero");
const weatherIcon = document.getElementById("weatherIcon");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");

const statsRow = document.getElementById("statsRow");
const humidityValue = document.getElementById("humidityValue");
const windValue = document.getElementById("windValue");
const uvValue = document.getElementById("uvValue");

const forecastSection = document.getElementById("forecastSection");
const forecastList = document.getElementById("forecastList");

/* ============================================
   WMO WEATHER CODE LOOKUP TABLE
   Maps the numeric weather_code from the API
   to a human-readable description + emoji icon.
   ============================================ */
const weatherCodeMap = {
  0: { description: "Clear sky", icon: "☀️" },
  1: { description: "Partly cloudy", icon: "⛅" },
  2: { description: "Partly cloudy", icon: "⛅" },
  3: { description: "Partly cloudy", icon: "⛅" },
  45: { description: "Foggy", icon: "🌫️" },
  48: { description: "Foggy", icon: "🌫️" },
  51: { description: "Drizzle", icon: "🌦️" },
  53: { description: "Drizzle", icon: "🌦️" },
  55: { description: "Drizzle", icon: "🌦️" },
  61: { description: "Rain", icon: "🌧️" },
  63: { description: "Rain", icon: "🌧️" },
  65: { description: "Rain", icon: "🌧️" },
  71: { description: "Snow", icon: "❄️" },
  73: { description: "Snow", icon: "❄️" },
  75: { description: "Snow", icon: "❄️" },
  80: { description: "Rain showers", icon: "🌦️" },
  81: { description: "Rain showers", icon: "🌦️" },
  82: { description: "Rain showers", icon: "🌦️" },
  95: { description: "Thunderstorm", icon: "⛈️" },
};

// Fallback used if the API ever returns a code that isn't in our table above.
function getWeatherInfo(code) {
  return weatherCodeMap[code] || { description: "Unknown", icon: "❔" };
}

/* ============================================
   FUNCTION: getCoordinates(city)
   Calls the Open-Meteo Geocoding API to turn a
   city name (e.g. "Lagos") into latitude/longitude
   plus the official city and country name.
   ============================================ */
async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  const response = await fetch(url);
  const data = await response.json();
 
  // If no results array, or it's empty, the city wasn't found.
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Please check the spelling and try again.");
  }

  const place = data.results[0];

  return {
    name: place.name,
    country: place.country,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

/* ============================================
   FUNCTION: getWeatherData(latitude, longitude)
   Calls the Open-Meteo Forecast API using
   coordinates to get the current weather plus
   the next 5 days of high/low temperatures.
   ============================================ */
async function getWeatherData(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not fetch weather data. Please try again.");
  }

  return await response.json();
}

/* ============================================
   FUNCTION: formatDayName(dateString, index)
   Converts a date string like "2026-06-22" into
   a weekday name like "Monday". The first day
   (index 0) is always labelled "Today".
   ============================================ */
function formatDayName(dateString, index) {
  if (index === 0) return "Today";

  const date = new Date(dateString);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return dayNames[date.getDay()];
}

/* ============================================
   FUNCTION: displayCurrentWeather(place, weatherData)
   Takes the city info and weather data and writes
   it into the hero section + stats row on the page.
   ============================================ */
function displayCurrentWeather(place, weatherData) {
  const current = weatherData.current;
  const weatherInfo = getWeatherInfo(current.weather_code);

  // UV index for "today" comes from the daily forecast array.
  const uvIndexToday = weatherData.daily.uv_index_max[0];
  const uvLabel = uvIndexToday >= 6 ? "High" : uvIndexToday >= 3 ? "Moderate" : "Low";

  cityName.textContent = `${place.name}, ${place.country}`;
  temperature.textContent = `${Math.round(current.temperature_2m)}°C`;
  weatherIcon.textContent = weatherInfo.icon;
  description.textContent = `${weatherInfo.description} · Feels like ${Math.round(current.temperature_2m)}°C`;

  humidityValue.textContent = `${current.relative_humidity_2m}%`;
  windValue.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  uvValue.textContent = uvLabel;

  weatherHero.classList.remove("hidden");
  statsRow.classList.remove("hidden");
}

/* ============================================
   FUNCTION: displayForecast(weatherData)
   Builds the 5-day forecast list by looping over
   the daily arrays returned by the API, and
   inserts one row per day into the page.
   ============================================ */
function displayForecast(weatherData) {
  const daily = weatherData.daily;

  // Clear out any forecast rows from a previous search.
  forecastList.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const dayName = formatDayName(daily.time[i], i);
    const weatherInfo = getWeatherInfo(daily.weather_code[i]);
    const high = Math.round(daily.temperature_2m_max[i]);
    const low = Math.round(daily.temperature_2m_min[i]);

    // Build one forecast row and add it to the list.
    const row = document.createElement("div");
    row.className = "forecast-row";
    row.innerHTML = `
      <span class="forecast-day">${dayName}</span>
      <span class="forecast-icon">${weatherInfo.icon}</span>
      <span class="forecast-temps">
        <span class="forecast-high">${high}°</span>
        <span class="forecast-low">${low}°</span>
      </span>
    `;
    forecastList.appendChild(row);
  }

  forecastSection.classList.remove("hidden");
}

/* ============================================
   FUNCTION: showError(message)
   Displays an error message and hides the
   weather sections, since we have no data to show.
   ============================================ */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");

  weatherHero.classList.add("hidden");
  statsRow.classList.add("hidden");
  forecastSection.classList.add("hidden");
}

/* ============================================
   FUNCTION: setLoading(isLoading)
   Toggles the "Loading..." message and clears
   any old error message when a new search starts.
   ============================================ */
function setLoading(isLoading) {
  loadingMessage.classList.toggle("hidden", !isLoading);
  if (isLoading) {
    errorMessage.classList.add("hidden");
  }
}

/* ============================================
   FUNCTION: searchWeather()
   The main controller function. Runs when the
   user clicks Search (or presses Enter). Fetches
   coordinates, then weather data, then updates
   the page — using async/await throughout.
   ============================================ */
async function searchWeather() {
  const city = cityInput.value.trim();

  if (city === "") {
    showError("Please enter a city name.");
    return;
  }

  setLoading(true);

  try {
    // Step 1: turn the city name into coordinates.
    const place = await getCoordinates(city);

    // Step 2: use those coordinates to get the weather.
    const weatherData = await getWeatherData(place.latitude, place.longitude);

    // Step 3: render everything on the page.
    displayCurrentWeather(place, weatherData);
    displayForecast(weatherData);
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
}

/* ============================================
   EVENT LISTENERS
   Trigger a search on button click, or when the
   user presses Enter inside the search input.
   ============================================ */
searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchWeather();
  }
});

/* ============================================
   INITIAL LOAD
   Show Lagos by default so the app isn't empty
   the moment the page opens.
   ============================================ */
cityInput.value = "Lagos";
searchWeather();