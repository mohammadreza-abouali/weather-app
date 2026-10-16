const API_BASE = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const AIR_QUALITY_API = "https://air-quality-api.open-meteo.com/v1/air-quality";

const elements = {
    cityName: document.getElementById("cityName"),
    currentDate: document.getElementById("currentDate"),
    citySearch: document.getElementById("citySearch"),
    searchForm: document.getElementById("searchForm"),
    searchResults: document.getElementById("searchResults"),
    locationButton: document.getElementById("locationButton"),
    favoritesButton: document.getElementById("favoritesButton"),
    celsiusButton: document.getElementById("celsiusButton"),
    fahrenheitButton: document.getElementById("fahrenheitButton"),
    currentTemperature: document.getElementById("currentTemperature"),
    feelsLike: document.getElementById("feelsLike"),
    todayHigh: document.getElementById("todayHigh"),
    todayLow: document.getElementById("todayLow"),
    weatherDescription: document.getElementById("weatherDescription"),
    currentWeatherIcon: document.getElementById("currentWeatherIcon"),
    sunrise: document.getElementById("sunrise"),
    sunset: document.getElementById("sunset"),
    favoriteCurrentButton: document.getElementById("favoriteCurrentButton"),
    humidityValue: document.getElementById("humidityValue"),
    humidityDescription: document.getElementById("humidityDescription"),
    windValue: document.getElementById("windValue"),
    windDirection: document.getElementById("windDirection"),
    pressureValue: document.getElementById("pressureValue"),
    visibilityValue: document.getElementById("visibilityValue"),
    uvValue: document.getElementById("uvValue"),
    uvDescription: document.getElementById("uvDescription"),
    precipitationValue: document.getElementById("precipitationValue"),
    precipitationDescription: document.getElementById("precipitationDescription"),
    rainChanceValue: document.getElementById("rainChanceValue"),
    windGustValue: document.getElementById("windGustValue"),
    hourlyForecast: document.getElementById("hourlyForecast"),
    hourlySummary: document.getElementById("hourlySummary"),
    weeklyForecast: document.getElementById("weeklyForecast"),
    temperatureChart: document.getElementById("temperatureChart"),
    chartTemperatureRange: document.getElementById("chartTemperatureRange"),
    aqiValue: document.getElementById("aqiValue"),
    aqiStatus: document.getElementById("aqiStatus"),
    aqiDescription: document.getElementById("aqiDescription"),
    airStatusDot: document.getElementById("airStatusDot"),
    pm25Value: document.getElementById("pm25Value"),
    pm10Value: document.getElementById("pm10Value"),
    ozoneValue: document.getElementById("ozoneValue"),
    uvLevel: document.getElementById("uvLevel"),
    uvAdvice: document.getElementById("uvAdvice"),
    dustValue: document.getElementById("dustValue"),
    dustDescription: document.getElementById("dustDescription"),
    pollenValue: document.getElementById("pollenValue"),
    pollenDescription: document.getElementById("pollenDescription"),
    alertsSection: document.getElementById("alertsSection"),
    alertsList: document.getElementById("alertsList"),
    alertCount: document.getElementById("alertCount"),
    favoritesList: document.getElementById("favoritesList"),
    themeToggle: document.getElementById("themeToggle"),
    themeIcon: document.getElementById("themeIcon"),
    themeLabel: document.getElementById("themeLabel"),
    lastUpdated: document.getElementById("lastUpdated"),
    toastContainer: document.getElementById("toastContainer")
};

const state = {
    city: {
        name: "Toronto",
        country: "Canada",
        admin1: "Ontario",
        latitude: 43.6532,
        longitude: -79.3832
    },
    weather: null,
    airQuality: null,
    unit: "celsius",
    favorites: [],
    chart: null,
    searchTimer: null,
    searchRequest: 0,
    weatherRequest: 0,
    theme: "dark"
};

const weatherCodes = {
    0: { description: "Clear Sky", icon: "☀", night: "☾" },
    1: { description: "Mainly Clear", icon: "🌤", night: "☾" },
    2: { description: "Partly Cloudy", icon: "⛅", night: "☁" },
    3: { description: "Overcast", icon: "☁", night: "☁" },
    45: { description: "Foggy", icon: "🌫", night: "🌫" },
    48: { description: "Depositing Rime Fog", icon: "🌫", night: "🌫" },
    51: { description: "Light Drizzle", icon: "🌦", night: "🌧" },
    53: { description: "Moderate Drizzle", icon: "🌦", night: "🌧" },
    55: { description: "Dense Drizzle", icon: "🌧", night: "🌧" },
    56: { description: "Light Freezing Drizzle", icon: "🌧", night: "🌧" },
    57: { description: "Dense Freezing Drizzle", icon: "🌧", night: "🌧" },
    61: { description: "Slight Rain", icon: "🌦", night: "🌧" },
    63: { description: "Moderate Rain", icon: "🌧", night: "🌧" },
    65: { description: "Heavy Rain", icon: "🌧", night: "🌧" },
    66: { description: "Light Freezing Rain", icon: "🌧", night: "🌧" },
    67: { description: "Heavy Freezing Rain", icon: "🌧", night: "🌧" },
    71: { description: "Slight Snowfall", icon: "🌨", night: "🌨" },
    73: { description: "Moderate Snowfall", icon: "❄", night: "❄" },
    75: { description: "Heavy Snowfall", icon: "❄", night: "❄" },
    77: { description: "Snow Grains", icon: "🌨", night: "🌨" },
    80: { description: "Slight Rain Showers", icon: "🌦", night: "🌧" },
    81: { description: "Moderate Rain Showers", icon: "🌧", night: "🌧" },
    82: { description: "Violent Rain Showers", icon: "🌧", night: "🌧" },
    85: { description: "Slight Snow Showers", icon: "🌨", night: "🌨" },
    86: { description: "Heavy Snow Showers", icon: "❄", night: "❄" },
    95: { description: "Thunderstorm", icon: "⛈", night: "⛈" },
    96: { description: "Thunderstorm with Hail", icon: "⛈", night: "⛈" },
    99: { description: "Severe Thunderstorm with Hail", icon: "⛈", night: "⛈" }
};

function getWeatherInfo(code, isDay = true) {
    const weather = weatherCodes[code] || {
        description: "Weather Unavailable",
        icon: "🌡",
        night: "🌡"
    };

    return {
        description: weather.description,
        icon: isDay ? weather.icon : weather.night
    };
}

function formatTemperature(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
        return "--°";
    }

    const temperature = Number(value);
    const converted = state.unit === "fahrenheit"
        ? temperature * 9 / 5 + 32
        : temperature;

    return `${Math.round(converted)}°`;
}

function formatWind(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
        return "-- km/h";
    }

    const speed = state.unit === "fahrenheit"
        ? Number(value) * 0.621371
        : Number(value);

    const unit = state.unit === "fahrenheit" ? "mph" : "km/h";

    return `${Math.round(speed)} ${unit}`;
}

function formatVisibility(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
        return "-- km";
    }

    return `${(Number(value) / 1000).toFixed(1)} km`;
}

function formatNumber(value, decimals = 0) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
        return "--";
    }

    return Number(value).toFixed(decimals);
}

function formatTime(timeString) {
    if (!timeString) {
        return "--:--";
    }

    const time = timeString.split("T")[1];

    if (!time) {
        return "--:--";
    }

    const [hours, minutes] = time.split(":");
    const date = new Date(2000, 0, 1, Number(hours), Number(minutes));

    return date.toLocaleTimeString("en-CA", {
        hour: "numeric",
        minute: "2-digit"
    });
}

function formatDay(dateString, options = {}) {
    if (!dateString) {
        return "--";
    }

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-CA", options);
}

function formatLocalDate(dateString, timeZone) {
    const date = dateString ? new Date(dateString) : new Date();

    if (Number.isNaN(date.getTime())) {
        return "Local weather conditions";
    }

    try {
        return new Intl.DateTimeFormat("en-CA", {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZone: timeZone || undefined
        }).format(date);
    } catch {
        return date.toLocaleString("en-CA");
    }
}

function getWindDirection(degrees) {
    if (degrees === null || degrees === undefined || !Number.isFinite(Number(degrees))) {
        return "Direction: --";
    }

    const directions = [
        "N", "NNE", "NE", "ENE",
        "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW",
        "W", "WNW", "NW", "NNW"
    ];

    const index = Math.round(Number(degrees) / 22.5) % 16;

    return `Direction: ${directions[index]} (${Math.round(Number(degrees))}°)`;
}

function getUvDescription(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
        return "UV information unavailable";
    }

    const uv = Number(value);

    if (uv < 3) return "Low";
    if (uv < 6) return "Moderate";
    if (uv < 8) return "High";
    if (uv < 11) return "Very High";

    return "Extreme";
}

function getUvAdvice(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
        return "UV information is currently unavailable.";
    }

    const uv = Number(value);

    if (uv < 3) return "Low exposure. Sun protection is generally minimal.";
    if (uv < 6) return "Moderate exposure. Consider sunscreen and sunglasses.";
    if (uv < 8) return "High exposure. Use sunscreen, a hat and shade.";
    if (uv < 11) return "Very high exposure. Limit direct midday sun.";

    return "Extreme exposure. Avoid prolonged direct sunlight.";
}

function getAqiInfo(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
        return {
            label: "Unavailable",
            description: "Air quality data is unavailable.",
            color: "var(--muted)"
        };
    }

    const aqi = Number(value);

    if (aqi <= 50) {
        return {
            label: "Good",
            description: "Air quality is satisfactory.",
            color: "#45d6a1"
        };
    }

    if (aqi <= 100) {
        return {
            label: "Moderate",
            description: "Sensitive individuals may need extra care.",
            color: "#f3d45f"
        };
    }

    if (aqi <= 150) {
        return {
            label: "Unhealthy for Sensitive Groups",
            description: "Sensitive groups may experience health effects.",
            color: "#f6a65b"
        };
    }

    if (aqi <= 200) {
        return {
            label: "Unhealthy",
            description: "Health effects may occur for some people.",
            color: "#ef747b"
        };
    }

    if (aqi <= 300) {
        return {
            label: "Very Unhealthy",
            description: "Health alert: reduce outdoor exposure.",
            color: "#b18cff"
        };
    }

    return {
        label: "Hazardous",
        description: "Health warning: avoid prolonged outdoor activity.",
        color: "#9b526f"
    };
}

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3500);
}

async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
}

function buildWeatherUrl(city) {
    const params = new URLSearchParams({
        latitude: city.latitude,
        longitude: city.longitude,
        current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "is_day",
            "precipitation",
            "rain",
            "showers",
            "snowfall",
            "weather_code",
            "pressure_msl",
            "surface_pressure",
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m"
        ].join(","),
        hourly: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation_probability",
            "precipitation",
            "rain",
            "showers",
            "weather_code",
            "visibility",
            "uv_index"
        ].join(","),
        daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "sunrise",
            "sunset",
            "uv_index_max",
            "precipitation_sum",
            "precipitation_probability_max",
            "wind_speed_10m_max"
        ].join(","),
        temperature_unit: "celsius",
        wind_speed_unit: "kmh",
        precipitation_unit: "mm",
        timezone: "auto",
        forecast_days: "7"
    });

    return `${API_BASE}?${params.toString()}`;
}

function buildAirQualityUrl(city) {
    const params = new URLSearchParams({
        latitude: city.latitude,
        longitude: city.longitude,
        current: [
            "european_aqi",
            "us_aqi",
            "pm10",
            "pm2_5",
            "ozone",
            "dust",
            "uv_index",
            "alder_pollen",
            "birch_pollen",
            "grass_pollen",
            "mugwort_pollen",
            "olive_pollen",
            "ragweed_pollen"
        ].join(","),
        hourly: [
            "european_aqi",
            "us_aqi",
            "pm10",
            "pm2_5",
            "ozone",
            "dust",
            "alder_pollen",
            "birch_pollen",
            "grass_pollen",
            "mugwort_pollen",
            "olive_pollen",
            "ragweed_pollen"
        ].join(","),
        timezone: "auto",
        forecast_days: "2"
    });

    return `${AIR_QUALITY_API}?${params.toString()}`;
}

async function loadCity(city, options = {}) {
    const requestId = ++state.weatherRequest;

    state.city = {
        ...city,
        name: city.name || "Selected Location",
        country: city.country || "",
        admin1: city.admin1 || ""
    };

    elements.cityName.textContent = getFullCityName(state.city);
    elements.currentDate.textContent = "Loading local weather...";
    elements.hourlyForecast.innerHTML = '<div class="loading-state">Loading hourly forecast...</div>';
    elements.weeklyForecast.innerHTML = '<div class="loading-state">Loading 7-day forecast...</div>';

    if (options.closeSearch !== false) {
        hideSearchResults();
    }

    updateFavoriteButton();

    try {
        const weatherPromise = fetchJson(buildWeatherUrl(state.city));
        const airPromise = fetchJson(buildAirQualityUrl(state.city)).catch(() => null);

        const [weather, airQuality] = await Promise.all([
            weatherPromise,
            airPromise
        ]);

        if (requestId !== state.weatherRequest) {
            return;
        }

        state.weather = weather;
        state.airQuality = airQuality;

        renderWeather();
        renderAirQuality();
        renderAlerts();
        renderFavorites();

        elements.lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString("en-CA", {
            hour: "numeric",
            minute: "2-digit"
        })}`;

        if (options.message) {
            showToast(options.message);
        }
    } catch (error) {
        if (requestId !== state.weatherRequest) {
            return;
        }

        console.error("Unable to load weather data:", error);
        elements.currentDate.textContent = "Weather data could not be loaded.";
        showToast("Unable to load weather data. Please try again.", "error");
    }
}

function getFullCityName(city) {
    const parts = [city.name, city.admin1, city.country].filter(Boolean);
    return [...new Set(parts)].join(", ");
}

function renderWeather() {
    if (!state.weather || !state.weather.current) {
        return;
    }

    const { current, hourly, daily } = state.weather;
    const weatherInfo = getWeatherInfo(current.weather_code, current.is_day === 1);

    elements.cityName.textContent = getFullCityName(state.city);
    elements.currentDate.textContent = formatLocalDate(
        new Date(),
        state.weather.timezone
    );

    elements.currentTemperature.textContent = formatTemperature(current.temperature_2m);
    elements.feelsLike.textContent = formatTemperature(current.apparent_temperature);
    elements.weatherDescription.textContent = weatherInfo.description;
    elements.currentWeatherIcon.textContent = weatherInfo.icon;

    elements.todayHigh.textContent = formatTemperature(daily.temperature_2m_max[0]);
    elements.todayLow.textContent = formatTemperature(daily.temperature_2m_min[0]);

    elements.sunrise.textContent = formatTime(daily.sunrise[0]);
    elements.sunset.textContent = formatTime(daily.sunset[0]);

    elements.humidityValue.textContent = `${formatNumber(current.relative_humidity_2m)}%`;

    if (current.relative_humidity_2m >= 70) {
        elements.humidityDescription.textContent = "High humidity";
    } else if (current.relative_humidity_2m <= 30) {
        elements.humidityDescription.textContent = "Low humidity";
    } else {
        elements.humidityDescription.textContent = "Relative humidity";
    }

    elements.windValue.textContent = formatWind(current.wind_speed_10m);
    elements.windDirection.textContent = getWindDirection(current.wind_direction_10m);
    elements.pressureValue.textContent = `${formatNumber(current.pressure_msl)} hPa`;

    const hourlyIndex = findClosestHourlyIndex(hourly.time, current.time);
    const visibility = hourly.visibility?.[hourlyIndex];

    elements.visibilityValue.textContent = formatVisibility(visibility);
    elements.uvValue.textContent = formatNumber(hourly.uv_index?.[hourlyIndex], 1);
    elements.uvDescription.textContent = getUvDescription(hourly.uv_index?.[hourlyIndex]);

    elements.precipitationValue.textContent = `${formatNumber(daily.precipitation_sum[0], 1)} mm`;
    elements.precipitationDescription.textContent =
        `${formatNumber(daily.precipitation_probability_max[0])}% chance today`;

    elements.rainChanceValue.textContent =
        `${formatNumber(hourly.precipitation_probability?.[hourlyIndex])}%`;

    elements.windGustValue.textContent = formatWind(current.wind_gusts_10m);

    renderHourlyForecast();
    renderWeeklyForecast();
    renderTemperatureChart();
    updateFavoriteButton();
}

function findClosestHourlyIndex(times, currentTime) {
    if (!Array.isArray(times) || times.length === 0) {
        return 0;
    }

    const currentTimestamp = new Date(currentTime).getTime();

    if (!Number.isFinite(currentTimestamp)) {
        return 0;
    }

    let closestIndex = 0;
    let smallestDifference = Infinity;

    times.forEach((time, index) => {
        const timestamp = new Date(time).getTime();

        if (!Number.isFinite(timestamp)) {
            return;
        }

        const difference = Math.abs(timestamp - currentTimestamp);

        if (difference < smallestDifference) {
            smallestDifference = difference;
            closestIndex = index;
        }
    });

    return closestIndex;
}

function renderHourlyForecast() {
    const { hourly, current } = state.weather;
    const startIndex = findClosestHourlyIndex(hourly.time, current.time);
    const hours = 24;
    const items = [];

    for (let offset = 0; offset < hours; offset++) {
        const index = startIndex + offset;

        if (index >= hourly.time.length) {
            break;
        }

        const isNow = offset === 0;
        const timeLabel = isNow ? "Now" : formatTime(hourly.time[index]);
        const weatherInfo = getWeatherInfo(hourly.weather_code[index], true);
        const temperature = formatTemperature(hourly.temperature_2m[index]);
        const precipitation = hourly.precipitation_probability?.[index];

        items.push(`
            <div class="hourly-item">
                <span class="hourly-time">${timeLabel}</span>
                <span class="hourly-icon" aria-label="${weatherInfo.description}">${weatherInfo.icon}</span>
                <strong class="hourly-temperature">${temperature}</strong>
                <span class="hourly-precipitation">${precipitation == null ? "--" : `${Math.round(precipitation)}%`}</span>
            </div>
        `);
    }

    elements.hourlyForecast.innerHTML = items.join("");
    elements.hourlySummary.textContent = "Temperature and precipitation chance";
}

function renderWeeklyForecast() {
    const { daily } = state.weather;
    const maximumTemperatures = daily.temperature_2m_max;
    const minimumTemperatures = daily.temperature_2m_min;

    const overallMin = Math.min(...minimumTemperatures);
    const overallMax = Math.max(...maximumTemperatures);
    const temperatureRange = Math.max(1, overallMax - overallMin);

    const items = daily.time.map((date, index) => {
        const weatherInfo = getWeatherInfo(daily.weather_code[index], true);
        const dayLabel = index === 0
            ? "Today"
            : formatDay(date, { weekday: "short" });

        const high = maximumTemperatures[index];
        const low = minimumTemperatures[index];
        const precipitationChance = daily.precipitation_probability_max[index];

        const left = ((low - overallMin) / temperatureRange) * 100;
        const width = Math.max(8, ((high - low) / temperatureRange) * 100);

        return `
            <div class="weekly-item">
                <span class="weekly-day">${dayLabel}</span>
                <div class="weekly-weather">
                    <span class="weekly-weather-icon">${weatherInfo.icon}</span>
                    <span>${weatherInfo.description}</span>
                </div>
                <span class="weekly-precipitation">${precipitationChance == null ? "--" : `${Math.round(precipitationChance)}%`}</span>
                <div class="weekly-temperatures">
                    <span>${formatTemperature(high)}</span>
                    <div class="temperature-bar">
                        <div class="temperature-bar-fill" style="margin-left:${left}%;width:${width}%"></div>
                    </div>
                    <span class="low">${formatTemperature(low)}</span>
                </div>
            </div>
        `;
    });

    elements.weeklyForecast.innerHTML = items.join("");
}

function renderTemperatureChart() {
    if (!window.Chart || !state.weather) {
        elements.chartTemperatureRange.textContent = "Chart unavailable";
        return;
    }

    const { hourly, current } = state.weather;
    const startIndex = findClosestHourlyIndex(hourly.time, current.time);
    const times = [];
    const temperatures = [];

    for (let offset = 0; offset < 24; offset++) {
        const index = startIndex + offset;

        if (index >= hourly.time.length) {
            break;
        }

        times.push(offset === 0 ? "Now" : formatTime(hourly.time[index]));
        temperatures.push(Number(hourly.temperature_2m[index]));
    }

    if (temperatures.length === 0) {
        return;
    }

    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);

    elements.chartTemperatureRange.textContent =
        `${formatTemperature(minTemp)} to ${formatTemperature(maxTemp)}`;

    const context = elements.temperatureChart.getContext("2d");
    const styles = getComputedStyle(document.body);
    const accent = styles.getPropertyValue("--accent").trim() || "#6c8cff";
    const muted = styles.getPropertyValue("--muted").trim() || "#8795ac";
    const border = styles.getPropertyValue("--panel-border").trim() || "rgba(148, 163, 184, 0.12)";

    if (state.chart) {
        state.chart.destroy();
    }

    state.chart = new Chart(context, {
        type: "line",
        data: {
            labels: times,
            datasets: [{
                label: "Temperature",
                data: temperatures.map(value =>
                    state.unit === "fahrenheit" ? value * 9 / 5 + 32 : value
                ),
                borderColor: accent,
                backgroundColor: "rgba(108, 140, 255, 0.12)",
                borderWidth: 2.5,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: accent,
                pointHoverBorderColor: styles.getPropertyValue("--panel").trim(),
                fill: true,
                tension: 0.38
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: "index"
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    displayColors: false,
                    backgroundColor: styles.getPropertyValue("--panel").trim(),
                    titleColor: styles.getPropertyValue("--text").trim(),
                    bodyColor: styles.getPropertyValue("--text").trim(),
                    borderColor: border,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label(context) {
                            return `Temperature: ${Math.round(context.parsed.y)}°`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    border: {
                        display: false
                    },
                    ticks: {
                        color: muted,
                        maxTicksLimit: 8,
                        maxRotation: 0,
                        autoSkip: true,
                        font: {
                            family: "Inter",
                            size: 10
                        }
                    }
                },
                y: {
                    border: {
                        display: false
                    },
                    grid: {
                        color: border,
                        drawTicks: false
                    },
                    ticks: {
                        color: muted,
                        padding: 10,
                        font: {
                            family: "Inter",
                            size: 10
                        },
                        callback(value) {
                            return `${value}°`;
                        }
                    }
                }
            }
        }
    });
}

function renderAirQuality() {
    const air = state.airQuality?.current;

    if (!air) {
        elements.aqiValue.textContent = "--";
        elements.aqiStatus.textContent = "Unavailable";
        elements.aqiDescription.textContent = "Air quality data is unavailable.";
        elements.airStatusDot.style.background = "var(--muted)";
        elements.pm25Value.textContent = "--";
        elements.pm10Value.textContent = "--";
        elements.ozoneValue.textContent = "--";
        elements.dustValue.textContent = "-- µg/m³";
        elements.dustDescription.textContent = "Dust data is unavailable.";
        elements.pollenValue.textContent = "Unavailable";
        elements.pollenDescription.textContent = "Pollen data is unavailable for this location.";
        return;
    }

    const aqi = air.us_aqi ?? air.european_aqi;
    const aqiInfo = getAqiInfo(aqi);

    elements.aqiValue.textContent = aqi == null ? "--" : Math.round(aqi);
    elements.aqiStatus.textContent = aqiInfo.label;
    elements.aqiDescription.textContent = aqiInfo.description;
    elements.aqiStatus.style.background = aqiInfo.color;
    elements.aqiStatus.style.color = "#101827";
    elements.airStatusDot.style.background = aqiInfo.color;
    elements.airStatusDot.style.boxShadow = `0 0 12px ${aqiInfo.color}`;

    elements.pm25Value.textContent = formatNumber(air.pm2_5, 1);
    elements.pm10Value.textContent = formatNumber(air.pm10, 1);
    elements.ozoneValue.textContent = formatNumber(air.ozone, 1);

    if (air.dust !== null && air.dust !== undefined) {
        elements.dustValue.textContent = `${formatNumber(air.dust, 1)} µg/m³`;
        elements.dustDescription.textContent = "Estimated atmospheric dust concentration.";
    } else {
        elements.dustValue.textContent = "Unavailable";
        elements.dustDescription.textContent = "Dust measurements are unavailable for this location.";
    }

    const pollenNames = [
        ["alder_pollen", "Alder"],
        ["birch_pollen", "Birch"],
        ["grass_pollen", "Grass"],
        ["mugwort_pollen", "Mugwort"],
        ["olive_pollen", "Olive"],
        ["ragweed_pollen", "Ragweed"]
    ];

    const availablePollen = pollenNames
        .filter(([key]) => air[key] !== null && air[key] !== undefined)
        .map(([key, name]) => ({ name, value: Number(air[key]) }));

    if (availablePollen.length > 0) {
        const highestPollen = availablePollen.reduce((highest, item) =>
            item.value > highest.value ? item : highest
        );

        elements.pollenValue.textContent =
            `${highestPollen.name}: ${formatNumber(highestPollen.value, 1)}`;

        elements.pollenDescription.textContent =
            "Highest reported pollen concentration in the available data.";
    } else {
        elements.pollenValue.textContent = "Unavailable";
        elements.pollenDescription.textContent =
            "Pollen forecasts are not available for this location.";
    }

    const uv = air.uv_index;

    if (uv !== null && uv !== undefined) {
        elements.uvLevel.textContent = `${formatNumber(uv, 1)} · ${getUvDescription(uv)}`;
        elements.uvAdvice.textContent = getUvAdvice(uv);
    } else {
        elements.uvLevel.textContent = "Unavailable";
        elements.uvAdvice.textContent = "UV information is currently unavailable.";
    }
}

function renderAlerts() {
    if (!state.weather) {
        elements.alertsSection.hidden = true;
        return;
    }

    const { current, hourly, daily } = state.weather;
    const alerts = [];
    const currentTemperature = Number(current.temperature_2m);
    const currentCode = Number(current.weather_code);
    const currentWindGust = Number(current.wind_gusts_10m);

    const startIndex = findClosestHourlyIndex(hourly.time, current.time);
    const upcomingHours = hourly.time.slice(startIndex, startIndex + 6).map((_, offset) => {
        const index = startIndex + offset;

        return {
            code: Number(hourly.weather_code[index]),
            rain: Number(hourly.precipitation?.[index] ?? 0),
            probability: Number(hourly.precipitation_probability?.[index] ?? 0)
        };
    });

    const thunderstormExpected = upcomingHours.some(hour =>
        hour.code >= 95 && hour.code <= 99
    );

    const heavyRainExpected = upcomingHours.some(hour =>
        hour.rain >= 7.5 || (hour.probability >= 80 && hour.rain >= 2.5)
    );

    const heavySnowExpected = upcomingHours.some(hour =>
        hour.code === 75 || hour.code === 86
    );

    if (thunderstormExpected) {
        alerts.push({
            type: "danger",
            icon: "⛈",
            title: "Thunderstorm Conditions Possible",
            message: "The forecast indicates possible thunderstorms in the next several hours. Check local official weather advisories."
        });
    }

    if (heavyRainExpected || currentCode === 65 || currentCode === 82) {
        alerts.push({
            type: "warning",
            icon: "🌧",
            title: "Heavy Rain Possible",
            message: "Forecast precipitation suggests a risk of heavy rain. Consider checking local road and weather conditions."
        });
    }

    if (heavySnowExpected) {
        alerts.push({
            type: "warning",
            icon: "❄",
            title: "Heavy Snow Possible",
            message: "The forecast indicates potentially heavy snowfall. Allow extra time for travel."
        });
    }

    if (currentTemperature >= 35) {
        alerts.push({
            type: "danger",
            icon: "☀",
            title: "High Temperature",
            message: "Current temperatures are elevated. Stay hydrated and limit strenuous activity during the hottest part of the day."
        });
    } else if (currentTemperature <= -20) {
        alerts.push({
            type: "warning",
            icon: "❄",
            title: "Very Cold Conditions",
            message: "Very low temperatures can increase the risk of cold-related illness. Dress appropriately for outdoor exposure."
        });
    }

    if (currentWindGust >= 60) {
        alerts.push({
            type: "warning",
            icon: "🌬",
            title: "Strong Wind Gusts",
            message: `Wind gusts are approximately ${Math.round(currentWindGust)} km/h. Use caution around exposed areas and loose outdoor objects.`
        });
    }

    const hotDays = daily.temperature_2m_max
        .slice(0, 3)
        .filter(value => Number(value) >= 32).length;

    if (hotDays >= 2 && currentTemperature < 35) {
        alerts.push({
            type: "warning",
            icon: "🌡",
            title: "Extended Hot Weather",
            message: "High temperatures are forecast over several days. Plan ahead for heat exposure and hydration."
        });
    }

    elements.alertsList.innerHTML = alerts.map(alert => `
        <article class="alert-item ${alert.type === "danger" ? "danger" : ""}">
            <span class="alert-icon">${alert.icon}</span>
            <div>
                <h3>${alert.title}</h3>
                <p>${alert.message}</p>
            </div>
        </article>
    `).join("");

    elements.alertCount.textContent = `${alerts.length} ${alerts.length === 1 ? "alert" : "alerts"}`;
    elements.alertsSection.hidden = alerts.length === 0;
}

async function searchCities(query) {
    const requestId = ++state.searchRequest;

    if (query.trim().length < 2) {
        hideSearchResults();
        return;
    }

    elements.searchResults.innerHTML =
        '<div class="loading-state">Searching cities...</div>';

    elements.searchResults.classList.add("show");

    try {
        const params = new URLSearchParams({
            name: query.trim(),
            count: "7",
            language: "en",
            format: "json"
        });

        const data = await fetchJson(`${GEOCODING_API}?${params.toString()}`);

        if (requestId !== state.searchRequest) {
            return;
        }

        const cities = data.results || [];

        if (cities.length === 0) {
            elements.searchResults.innerHTML =
                '<div class="loading-state">No matching cities found.</div>';
            return;
        }

        elements.searchResults.innerHTML = cities.map((city, index) => {
            const details = [city.admin1, city.country].filter(Boolean).join(", ");

            return `
                <button
                    type="button"
                    class="search-result-item"
                    data-city-index="${index}"
                >
                    <span>⌖</span>
                    <span>
                        <strong>${escapeHtml(city.name)}</strong>
                        <span class="result-location">${escapeHtml(details)}</span>
                    </span>
                </button>
            `;
        }).join("");

        elements.searchResults.querySelectorAll("[data-city-index]").forEach(button => {
            button.addEventListener("click", () => {
                const city = cities[Number(button.dataset.cityIndex)];

                if (city) {
                    selectCity(city);
                }
            });
        });
    } catch (error) {
        if (requestId !== state.searchRequest) {
            return;
        }

        console.error("City search failed:", error);

        elements.searchResults.innerHTML =
            '<div class="loading-state">Search failed. Please try again.</div>';
    }
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function hideSearchResults() {
    elements.searchResults.classList.remove("show");
    elements.searchResults.innerHTML = "";
}

function selectCity(city) {
    const selectedCity = {
        name: city.name,
        country: city.country || "",
        admin1: city.admin1 || "",
        latitude: Number(city.latitude),
        longitude: Number(city.longitude)
    };

    elements.citySearch.value = "";

    loadCity(selectedCity, {
        message: `Weather loaded for ${selectedCity.name}.`
    });
}

function getCityKey(city) {
    return `${Number(city.latitude).toFixed(3)},${Number(city.longitude).toFixed(3)}`;
}

function isFavorite(city) {
    const key = getCityKey(city);

    return state.favorites.some(favorite => getCityKey(favorite) === key);
}

function updateFavoriteButton() {
    const favorite = isFavorite(state.city);

    elements.favoriteCurrentButton.classList.toggle("is-favorite", favorite);
    elements.favoriteCurrentButton.textContent = favorite ? "♥" : "♡";
    elements.favoriteCurrentButton.setAttribute(
        "aria-label",
        favorite ? "Remove current city from favorites" : "Add current city to favorites"
    );
}

function toggleCurrentFavorite() {
    const key = getCityKey(state.city);
    const existingIndex = state.favorites.findIndex(
        favorite => getCityKey(favorite) === key
    );

    if (existingIndex >= 0) {
        state.favorites.splice(existingIndex, 1);
        showToast("City removed from favorites.");
    } else {
        state.favorites.push({ ...state.city });
        showToast("City added to favorites.");
    }

    saveFavorites();
    updateFavoriteButton();
    renderFavorites();
}

function saveFavorites() {
    try {
        localStorage.setItem("weatherly-favorites", JSON.stringify(state.favorites));
    } catch {
        showToast("Unable to save favorites on this device.", "error");
    }
}

function loadFavorites() {
    try {
        const saved = JSON.parse(localStorage.getItem("weatherly-favorites") || "[]");

        if (Array.isArray(saved)) {
            state.favorites = saved.filter(city =>
                city &&
                typeof city.name === "string" &&
                Number.isFinite(Number(city.latitude)) &&
                Number.isFinite(Number(city.longitude))
            );
        }
    } catch {
        state.favorites = [];
    }
}

async function renderFavorites() {
    if (state.favorites.length === 0) {
        elements.favoritesList.innerHTML = `
            <div class="empty-state panel">
                <span class="empty-icon">♡</span>
                <h3>No favorite cities yet</h3>
                <p>Save a city to check its weather more easily.</p>
            </div>
        `;
        return;
    }

    elements.favoritesList.innerHTML = state.favorites.map((city, index) => {
        const active = getCityKey(city) === getCityKey(state.city);

        return `
            <article class="favorite-city-card">
                <div>
                    <h3>${escapeHtml(city.name)}${active ? " · Current" : ""}</h3>
                    <p>${escapeHtml([city.admin1, city.country].filter(Boolean).join(", "))}</p>
                    <p class="favorite-city-weather" data-favorite-weather="${index}">Loading weather...</p>
                </div>
                <div class="favorite-city-actions">
                    <button type="button" data-open-favorite="${index}" aria-label="Open ${escapeHtml(city.name)}">↗</button>
                    <button type="button" data-remove-favorite="${index}" aria-label="Remove ${escapeHtml(city.name)} from favorites">×</button>
                </div>
            </article>
        `;
    }).join("");

    elements.favoritesList.querySelectorAll("[data-open-favorite]").forEach(button => {
        button.addEventListener("click", () => {
            const city = state.favorites[Number(button.dataset.openFavorite)];

            if (city) {
                loadCity(city, {
                    message: `Weather loaded for ${city.name}.`
                });

                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    });

    elements.favoritesList.querySelectorAll("[data-remove-favorite]").forEach(button => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.removeFavorite);
            const city = state.favorites[index];

            if (!city) {
                return;
            }

            state.favorites.splice(index, 1);
            saveFavorites();
            updateFavoriteButton();
            renderFavorites();
            showToast(`${city.name} removed from favorites.`);
        });
    });

    const favoriteElements = elements.favoritesList.querySelectorAll("[data-favorite-weather]");

    await Promise.all(state.favorites.map(async (city, index) => {
        const target = favoriteElements[index];

        if (!target) {
            return;
        }

        if (getCityKey(city) === getCityKey(state.city) && state.weather) {
            const current = state.weather.current;
            const weatherInfo = getWeatherInfo(current.weather_code, current.is_day === 1);

            target.textContent =
                `${weatherInfo.icon} ${formatTemperature(current.temperature_2m)} · ${weatherInfo.description}`;

            return;
        }

        try {
            const params = new URLSearchParams({
                latitude: city.latitude,
                longitude: city.longitude,
                current: "temperature_2m,weather_code,is_day",
                temperature_unit: "celsius",
                timezone: "auto"
            });

            const data = await fetchJson(`${API_BASE}?${params.toString()}`);

            if (!target.isConnected) {
                return;
            }

            const current = data.current;
            const weatherInfo = getWeatherInfo(current.weather_code, current.is_day === 1);

            target.textContent =
                `${weatherInfo.icon} ${formatTemperature(current.temperature_2m)} · ${weatherInfo.description}`;
        } catch {
            if (target.isConnected) {
                target.textContent = "Weather unavailable";
            }
        }
    }));
}

function setTemperatureUnit(unit) {
    if (unit !== "celsius" && unit !== "fahrenheit") {
        return;
    }

    state.unit = unit;

    elements.celsiusButton.classList.toggle("active", unit === "celsius");
    elements.fahrenheitButton.classList.toggle("active", unit === "fahrenheit");

    elements.celsiusButton.setAttribute("aria-pressed", String(unit === "celsius"));
    elements.fahrenheitButton.setAttribute("aria-pressed", String(unit === "fahrenheit"));

    try {
        localStorage.setItem("weatherly-unit", unit);
    } catch {
        console.warn("Unable to save temperature preference.");
    }

    if (state.weather) {
        renderWeather();
        renderFavorites();
    }
}

function loadTemperatureUnit() {
    try {
        const saved = localStorage.getItem("weatherly-unit");

        if (saved === "celsius" || saved === "fahrenheit") {
            state.unit = saved;
        }
    } catch {
        state.unit = "celsius";
    }

    setTemperatureUnit(state.unit);
}

function setTheme(theme) {
    state.theme = theme === "light" ? "light" : "dark";

    document.body.classList.toggle("light-theme", state.theme === "light");

    elements.themeIcon.textContent = state.theme === "light" ? "☀" : "☾";
    elements.themeLabel.textContent = state.theme === "light" ? "Light Mode" : "Dark Mode";

    try {
        localStorage.setItem("weatherly-theme", state.theme);
    } catch {
        console.warn("Unable to save theme preference.");
    }

    if (state.weather) {
        renderTemperatureChart();
    }
}

function loadTheme() {
    try {
        const saved = localStorage.getItem("weatherly-theme");

        if (saved === "light" || saved === "dark") {
            setTheme(saved);
            return;
        }
    } catch {
        console.warn("Unable to load theme preference.");
    }

    setTheme("dark");
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        showToast("Geolocation is not supported by this browser.", "error");
        return;
    }

    elements.locationButton.disabled = true;
    elements.locationButton.textContent = "…";

    navigator.geolocation.getCurrentPosition(
        position => {
            const city = {
                name: "My Location",
                country: "",
                admin1: "",
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            elements.locationButton.disabled = false;
            elements.locationButton.textContent = "◎";

            loadCity(city, {
                message: "Weather loaded for your current location."
            });
        },
        error => {
            elements.locationButton.disabled = false;
            elements.locationButton.textContent = "◎";

            const messages = {
                1: "Location permission was denied. Please enable location access.",
                2: "Your location could not be determined.",
                3: "Location request timed out."
            };

            showToast(messages[error.code] || "Unable to access your location.", "error");
        },
        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

function handleSearchInput() {
    clearTimeout(state.searchTimer);

    const query = elements.citySearch.value.trim();

    if (query.length < 2) {
        hideSearchResults();
        return;
    }

    state.searchTimer = setTimeout(() => {
        searchCities(query);
    }, 350);
}

function handleSearchSubmit(event) {
    event.preventDefault();

    const query = elements.citySearch.value.trim();

    if (!query) {
        showToast("Enter a city name to search.", "error");
        return;
    }

    clearTimeout(state.searchTimer);
    searchCities(query);
}

function setupNavigation() {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            document.querySelectorAll(".nav-link").forEach(item => {
                item.classList.remove("active");
            });

            link.classList.add("active");
        });
    });
}

function setupEventListeners() {
    elements.searchForm.addEventListener("submit", handleSearchSubmit);
    elements.citySearch.addEventListener("input", handleSearchInput);

    elements.citySearch.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            hideSearchResults();
        }
    });

    document.addEventListener("click", event => {
        if (!elements.searchForm.contains(event.target)) {
            hideSearchResults();
        }
    });

    elements.locationButton.addEventListener("click", getCurrentLocation);
    elements.favoriteCurrentButton.addEventListener("click", toggleCurrentFavorite);

    elements.favoritesButton.addEventListener("click", () => {
        document.getElementById("favorites-section").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    elements.celsiusButton.addEventListener("click", () => {
        setTemperatureUnit("celsius");
    });

    elements.fahrenheitButton.addEventListener("click", () => {
        setTemperatureUnit("fahrenheit");
    });

    elements.themeToggle.addEventListener("click", () => {
        setTheme(state.theme === "dark" ? "light" : "dark");
    });

    setupNavigation();
}

function initializeApp() {
    loadFavorites();
    loadTheme();
    loadTemperatureUnit();
    setupEventListeners();
    loadCity(state.city);
}

initializeApp();
