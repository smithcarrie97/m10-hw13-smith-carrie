// capture references to important DOM elements
const weatherContainer = document.getElementById('weather');
const formEl = document.querySelector('form');
const inputEl = document.querySelector('input');


formEl.onsubmit = function(e) {
  // prevent the page from refreshing
  e.preventDefault();

  // capture user's input from form field
  let userInput = inputEl.value.trim()
  // abort API call if user entered no value
  if (!userInput) return
  // call the API and then update the page
  getWeather(userInput)
    .then(displayWeatherInfo)
    .catch(displayLocNotFound)

  // reset form field to a blank state
  inputEl.value = ""
}

// calls the OpenWeather API and returns an object of weather info
async function getWeather(query) {
  // default search to USA
  if (!query.includes(",")) query += ',us'
  // return the fetch call which returns a promise
  // allows us to call .then on this function
  const res = await fetch(
    'https://api.openweathermap.org/data/2.5/weather?q=' +
    query +
    '&units=imperial&appid=6efff70fe1477748e31c17d1c504635f'
  )
  const data = await res.json()
  // location not found, throw error/reject promise
  if (data.cod === "404") throw new Error('location not found')
  // create weather icon URL
  let iconUrl = 'https://openweathermap.org/img/wn/' +
    data.weather[0].icon +
    '@2x.png'
  const description = data.weather[0].description
  const actualTemp = data.main.temp
  const feelsLikeTemp = data.main.feels_like
  const place = data.name + ", " + data.sys.country
  // create JS date object from Unix timestamp
  let updatedAt = new Date(data.dt * 1000)
  // this object is used by displayWeatherInfo to update the HTML
  return {
    coords: data.coord.lat + ',' + data.coord.lon,
    description: description,
    iconUrl: iconUrl,
    actualTemp: actualTemp,
    feelsLikeTemp: feelsLikeTemp,
    place: place,
    updatedAt: updatedAt
      }
    
}

// show error message when location isn't found
const displayLocNotFound = () => {
  // clears any previous weather info
  weatherContainer.innerHTML = "";
  // create h2, add error msg, and add to page
  const errMsg = document.createElement('h2')
  errMsg.textContent = "Location not found"
  weatherContainer.appendChild(errMsg)
}

  // updates HTML to display weather info
  const displayWeatherInfo = (weatherObj) => { weatherContainer.innerHTML = "";

  // inserts a linebreak <br> to weather section tag
  const addBreak = () => {weatherContainer.appendChild(document.createElement('br'))}

  // weather location element
  let placeName = document.createElement('h2')
  placeName.textContent = weatherObj.place
  weatherContainer.appendChild(placeName)

  // map link element based on lat/long
  let whereLink = document.createElement('a')
  whereLink.textContent = "Click to view map"
  whereLink.href = "https://www.google.com/maps/search/?api=1&query=" + weatherObj.coords
  whereLink.target = "__BLANK"
  weatherContainer.appendChild(whereLink)

  // weather icon img
  let icon = document.createElement('img')
  icon.src = weatherObj.iconUrl
  weatherContainer.appendChild(icon)

  // weather description
  let description = document.createElement('p')
  description.textContent = weatherObj.description
  description.style.textTransform = 'capitalize'
  weatherContainer.appendChild(description)

  addBreak()

  // current temperature
  let temp = document.createElement('p')
  temp.textContent = `Current: ${weatherObj.actualTemp}° F`
  weatherContainer.appendChild(temp)

  // "feels like" temperature
  let feelsLikeTemp = document.createElement('p')
  feelsLikeTemp.textContent = "Feels like: " +
    weatherObj.feelsLikeTemp +
    "° F"
  weatherContainer.appendChild(feelsLikeTemp)

  addBreak()

  // time weather was last updated
  let updatedAt = document.createElement('p')
  updatedAt.textContent = "Last updated: " +
    weatherObj.updatedAt.toLocaleTimeString(
      'en-US',
      {
        hour: 'numeric',
        minute: '2-digit'
      }
    )
  weatherContainer.appendChild(updatedAt)
}