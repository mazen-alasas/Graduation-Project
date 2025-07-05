


const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchBtn");
const currentLocationButton = document.querySelector("#currentLocationBtn");
const weatherIcon = document.querySelector(".weather-icon");
const windSpeed = document.querySelector(".wind");
const humidity = document.querySelector(".humidity");
const temperature = document.querySelector(".temp");
const cityName = document.querySelector(".city");


const API_KEY = "c7377c7305e6798286b1883817b0075e";

function setWeatherDetails(data) {
    cityName.innerHTML = data.name;
    temperature.innerHTML = Math.round(data.main.temp - 273.15) + "°c";
    humidity.innerHTML = data.main.humidity + "%";
    windSpeed.innerHTML = data.wind.speed + " km/h";

    updateWeatherIcon(data.weather[0].main);
    localStorage.setItem('lastWeatherCity', data.name);

    showWeatherNotification('تم تحديث بيانات الطقس بنجاح', 'success');
}

function updateWeatherIcon(weatherCondition) {
    switch (weatherCondition) {
        case "Clouds":
            weatherIcon.src = "assets/images/Weather/clouds.png";
            break;
        case "Clear":
            weatherIcon.src = "assets/images/Weather/clear.png";
            break;
        case "Rain":
            weatherIcon.src = "assets/images/Weather/rainy.png";
            break;
        case "Mist":
            weatherIcon.src = "assets/images/Weather/mist.png";
            break;
        case "Snow":
            weatherIcon.src = "assets/images/Weather/snow.png";
            break;
        case "Haze":
            weatherIcon.src = "assets/images/Weather/haze.png";
            break;
        case "Drizzle":
            weatherIcon.src = "assets/images/Weather/rainy.png";
            break;
        case "Fog":
            weatherIcon.src = "assets/images/Weather/mist.png";
            break;
        case "Thunderstorm":
            weatherIcon.src = "assets/images/Weather/storm.png";
            break;
        default:
            weatherIcon.src = "assets/images/Weather/clouds.png";
    }
}


function getWeatherByCity(city) {
    showLoading();

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`)
        .then(response => {
            hideLoading();

            if (!response.ok) {
                showWeatherNotification('City not found. Check the name and try again.', 'error');
                throw new Error(`Request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            setWeatherDetails(data);
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            showWeatherNotification('An error occurred while fetching weather data', 'error');
        });
}


function getWeatherByCoordinates(lat, lon) {
    showLoading();

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        .then(response => {
            hideLoading();

            if (!response.ok) {
                showWeatherNotification('Unable to fetch weather data for your current location', 'error');
                throw new Error(`Request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            setWeatherDetails(data);
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            showWeatherNotification('An error occurred while fetching weather data', 'error');
        });
}


function getWeatherByLocation() {
    if (navigator.geolocation) {

        showLoading();

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoordinates(lat, lon);

                localStorage.setItem('lastLat', lat);
                localStorage.setItem('lastLon', lon);
            },
            (error) => {

                hideLoading();

                console.error("Geolocation error:", error);
                showWeatherNotification('Unable to determine your location. Please allow location access.', 'error');

                const lastCity = localStorage.getItem('lastWeatherCity');
                if (lastCity) {
                    getWeatherByCity(lastCity);
                }
            },
            { timeout: 10000 }
        );
    } else {
        showWeatherNotification('Your browser does not support location detection', 'error');
    }
}

function showLoading() {
    weatherIcon.style.opacity = "0.5";
}

function hideLoading() {
    weatherIcon.style.opacity = "1";
}

function showWeatherNotification(message, type = 'info') {
    if (window.showNotification) {
        window.showNotification(message, type);
    } else {
        console.log(`${type}: ${message}`);
    }
}


function initWeatherSystem() {
    searchButton.addEventListener("click", () => {
        if (searchInput.value.trim() === "") {
            showWeatherNotification('يرجى إدخال اسم المدينة', 'error');
        } else {
            getWeatherByCity(searchInput.value.trim());
        }
    });

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            searchButton.click();
        }
    });

    currentLocationButton.addEventListener("click", () => {
        getWeatherByLocation();
    });

    getWeatherByLocation();
}

document.addEventListener('DOMContentLoaded', initWeatherSystem);
