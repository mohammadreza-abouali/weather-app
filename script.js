const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feelsLike");
const currentWeatherIcon = document.getElementById("currentWeatherIcon");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");

const hourlyForecast = document.getElementById("hourlyForecast");
const dailyForecast = document.getElementById("dailyForecast");


function getWeatherInfo(code) {
    if (code === 0) return { text: "Clear sky", icon: "☀️" };
    if (code === 1) return { text: "Mainly clear", icon: "🌤️" };
    if (code === 2) return { text: "Partly cloudy", icon: "⛅" };
    if (code === 3) return { text: "Overcast", icon: "☁️" };
    if (code <= 48) return { text: "Foggy", icon: "🌫️" };
    if (code <= 57) return { text: "Drizzle", icon: "🌦️" };
    if (code <= 67) return { text: "Rain", icon: "🌧️" };
    if (code <= 77) return { text: "Snow", icon: "❄️" };
    if (code <= 82) return { text: "Rain showers", icon: "🌦️" };
    if (code <= 86) return { text: "Snow showers", icon: "🌨️" };
    if (code <= 99) return { text: "Thunderstorm", icon: "⛈️" };

    return { text: "Unknown", icon: "🌡️" };
}


function getWindDirection(degrees) {
    const directions = [
        "N", "NE", "E", "SE",
        "S", "SW", "W", "NW"
    ];

    return directions[Math.round(degrees / 45) % 8];
}


function formatHour(time) {
    return time.slice(11, 16);
}


weatherForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        cityName.textContent = "Please enter a city!";
        return;
    }

    cityName.textContent = "Loading...";
    description.textContent = "Getting weather data...";

    try {
        
        const cityUrl =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const cityResponse = await fetch(cityUrl);

        if (!cityResponse.ok) {
            throw new Error("City search failed");
        }

        const cityData = await cityResponse.json();

        if (!cityData.results || cityData.results.length === 0) {
            throw new Error("City not found");
        }

        const location = cityData.results[0];
        const latitude = location.latitude;
        const longitude = location.longitude;

        
        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=5`;

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Weather request failed");
        }

        const data = await weatherResponse.json();

        const current = data.current;
        const info = getWeatherInfo(current.weather_code);

        
        cityName.textContent =
            `${location.name}, ${location.country || ""}`;

        temperature.textContent =
            `${current.temperature_2m}°C`;

        description.textContent = info.text;
        currentWeatherIcon.textContent = info.icon;

        feelsLike.textContent =
            `Feels like ${current.apparent_temperature}°C`;

        humidity.textContent =
            `${current.relative_humidity_2m}%`;

        windSpeed.textContent =
            `${current.wind_speed_10m} km/h ${getWindDirection(current.wind_direction_10m)}`;

        pressure.textContent =
            `${current.pressure_msl} hPa`;

        
        const currentHour = current.time.slice(0, 13);

        let hourIndex = data.hourly.time.findIndex(
            time => time.slice(0, 13) === currentHour
        );

        if (hourIndex === -1) {
            hourIndex = 0;
        }

        const visibilityKm =
            data.hourly.visibility[hourIndex] / 1000;

        visibility.textContent =
            `${visibilityKm.toFixed(1)} km`;

        
        hourlyForecast.innerHTML = "";

        for (let i = 0; i < 3; i++) {
            const index = hourIndex + i;

            if (index >= data.hourly.time.length) break;

            const hourInfo = getWeatherInfo(
                data.hourly.weather_code[index]
            );

            const timeLabel = i === 0
                ? "Now"
                : formatHour(data.hourly.time[index]);

            const card = document.createElement("article");
            card.className = "forecast-card";

            const time = document.createElement("p");
            time.textContent = timeLabel;

            const icon = document.createElement("span");
            icon.textContent = hourInfo.icon;

            const temp = document.createElement("p");
            temp.textContent =
                `${data.hourly.temperature_2m[index]}°C`;

            card.append(time, icon, temp);
            hourlyForecast.appendChild(card);
        }

        
        dailyForecast.innerHTML = "";

        for (let i = 0; i < data.daily.time.length; i++) {
            const dayInfo = getWeatherInfo(
                data.daily.weather_code[i]
            );

            const date = new Date(
                `${data.daily.time[i]}T12:00:00`
            );

            const dayName = date.toLocaleDateString("en", {
                weekday: "short"
            });

            const card = document.createElement("article");
            card.className = "forecast-card";

            const day = document.createElement("p");
            day.textContent = dayName;

            const icon = document.createElement("span");
            icon.textContent = dayInfo.icon;

            const temps = document.createElement("p");
            temps.textContent =
                `${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(data.daily.temperature_2m_min[i])}°`;

            const condition = document.createElement("p");
            condition.textContent = dayInfo.text;

            const sunrise = document.createElement("p");
            sunrise.textContent =
                `Sunrise: ${formatHour(data.daily.sunrise[i])}`;

            const sunset = document.createElement("p");
            sunset.textContent =
                `Sunset: ${formatHour(data.daily.sunset[i])}`;

            card.append(day, icon, temps, condition, sunrise, sunset);
            dailyForecast.appendChild(card);
        }

    } catch (error) {
        cityName.textContent =
            error.message === "City not found"
                ? "City not found!"
                : "Something went wrong!";

        description.textContent =
            "Please check your city name or internet connection.";

        console.error(error);
    }
});
