const cityInput = document.querySelector('.city-input')
const searchBtn = document.querySelector('.search-btn')

const weatherInfoSection = document.querySelector('.weather-info')
const notFoundSection = document.querySelector('.not-found')
const searchCitySection = document.querySelector('.search-city')

const countryTxt = document.querySelector('.country-txt')
const temptTxt = document.querySelector('.temp-txt')
const conditionTxt = document.querySelector('.condition-txt')
const humidityValueTxt = document.querySelector('.humidity-value-txt')
const windValueTxt = document.querySelector('.wind-value-txt')
const weatherSummaryImg = document.querySelector('.weather-summary-img')
const currentDateTxt = document.querySelector('.current-date-txt')

const forecastItemsContainer = document.querySelector('.forecast-items-container')

const apiKey = '7debdc44e6bde639c5de887ce8cb429d'

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() != ''){
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
})

cityInput.addEventListener('keydown', (e) => {
    if (e.key == 'Enter' && (cityInput.value.trim() != '')) {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur() // remove focus on search box(?) -----------------------------
    }
})

async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`
    const response = await fetch(apiUrl)
    return response.json() // get values from api --------------------------------
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city)
    
    if(weatherData.cod != 200) {//cod to check if record exists ------------------------------
        showDisplaySection(notFoundSection)
        return
    }
    const { // TAKE OBJECT VALUES FROM JSON -------------------------------------
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }], 
        wind: { speed }
    } = weatherData
    
    countryTxt.textContent = country
    temptTxt.textContent = temp + ' °C'
    conditionTxt.textContent = main
    humidityValueTxt.textContent = humidity
    windValueTxt.textContent = speed + ' M/s'

    currentDateTxt.textContent = getCurrentDate()
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`

    await updateForecastsInfo(city)
    showDisplaySection(weatherInfoSection)
}

async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city)

    const timeTaken = '12:00:00'
    const todayDate = new Date().toISOString().split('T')[0]

    forecastItemsContainer.innerHTML = '' // clear print/display(para mawala yung dupes then malagay lang yung mga tinawag na deets for next days)
    forecastsData.list.forEach(forecastWeather => {
        if(forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) {
            console.log(forecastWeather)
            updateForecastsItems(forecastWeather)
        }
    })
}

function updateForecastsItems(weatherData) { // starts from next day ----------------------------------------------------
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData;

    const dateTaken = new Date(date);
    const dateOption = {
        day: '2-digit',
        month: 'short',
    };
    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption); 

    // it tells the system what part of a string i want to change(just telling, not changing)
    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}" alt="" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>`;

    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem); // this part is when system will change the string
}


function getCurrentDate() {
    const currentData = new Date()

    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    }

    return currentData.toLocaleDateString('en-US', options).split(',  ')
}

function getWeatherIcon(id) {
    if (id <= 232 && id >= 200) return 'thunderstorm.svg'
    if (id <= 321 && id >= 300) return 'drizzle.svg'
    if (id <= 531 && id >= 500) return 'rain.svg'
    if (id <= 622 && id >= 600) return 'snow.svg'
    if (id <= 781 && id >= 701) return 'atmosphere.svg'
    if (id == 800) return 'clear.svg'
    if (id <= 804 && id >= 800) return 'clouds.svg'
}

function showDisplaySection(callSection) {
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(section => section.style.display = 'none')

        callSection.style.display = 'flex'
}