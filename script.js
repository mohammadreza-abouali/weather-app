const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");


cityInput.addEventListener("input", function(){
    cityName.textContent = "City Name";
    temperature.textContent = "Temperature: --℃";
    description.textContent = "Weather: --";
})


searchBtn.addEventListener("click", async function () {

    try {
        const city = cityInput.value.trim();

        if (city === "") {
            cityName.textContent = "Please enter a city!";
            return;
        }


        const cityUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const cityResponse = await fetch(cityUrl);

        if (!cityResponse.ok) {
            throw new Error("City request failed");
        }

        const cityData = await cityResponse.json();

        if (!cityData.results || cityData.results.length === 0) {
            cityName.textContent = "City not found!";
            temperature.textContent = "Temperature: -- °C";
            description.textContent = "Weather: --";
            return;
        }

        const latitude = cityData.results[0].latitude;
        const longitude = cityData.results[0].longitude;


        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Weather request failed");
        }

        const weatherData = await weatherResponse.json();


        cityName.textContent = cityData.results[0].name;
        temperature.textContent =
            "Temperature: " + weatherData.current.temperature_2m + " °C";


        const weatherCode = weatherData.current.weather_code;

        if (weatherCode === 0) {
            description.textContent = "Sunny";
        } else if (weatherCode <= 3) {
            description.textContent = "Cloudy";
        } else if (weatherCode <= 48) {
            description.textContent = "Foggy";
        } else if (weatherCode <= 67) {
            description.textContent = "Rainy";
        } else if (weatherCode <= 77) {
            description.textContent = "Snowy";
        } else if (weatherCode <= 82) {
            description.textContent = "Rain showers";
        } else if (weatherCode <= 99) {
            description.textContent = "Thunderstorm";
        } else {
            description.textContent = "Unknown weather";
        }

    } catch (error) {
        cityName.textContent = "Something went wrong!";
        temperature.textContent = "Temperature: -- °C";
        description.textContent = "Please check your internet.";
        console.log(error);
    }

});
