// Get the HTML elements
const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const currentWeatherContainer = document.querySelector('#current-weather');
const forecastContainer = document.querySelector('#forecast');
const recentSearchButtonsContainer = document.querySelector('#recent-searches');
const cityButtons = document.querySelectorAll('.city-button');

function createRecentSearchesHeading() {
  // Check if the "Recent Searches" heading already exists
  if (!recentSearchButtonsContainer.querySelector('h2')) {
    const h2Element = document.createElement('h2');
    h2Element.textContent = 'Recent Cities/Countries Searches';
    h2Element.style.marginBottom = '14px';
    h2Element.style.fontSize = '30px';
    h2Element.style.textAlign = 'center';
    h2Element.style.color = 'violet';

    // Check if the container is empty and insert the heading accordingly
    if (recentSearchButtonsContainer.childElementCount === 0) {
      recentSearchButtonsContainer.appendChild(h2Element);
    } else {
      recentSearchButtonsContainer.insertAdjacentElement('afterbegin', h2Element);
    }
  }
}


// OpenWeatherMap API credentials
const apiKey = 'dd1398e6a9aeedb102ddacc2bb703169';

// Function to fetch weather data from the OpenWeatherMap API
function getWeatherData(city) {
  // API URL for fetching weather data
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

  // Fetch API data
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // Handle the received weather data
      handleWeatherData(data);

      // Save the city to recent searches in local storage
      saveToRecentSearches(city);
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
    });
}

// Event listener for city buttons
cityButtons.forEach(button => {
  button.addEventListener('click', function() {
    const cityName = button.textContent;
    if (cityName !== '') {
      // Set the city in the search input
      cityInput.value = cityName;
      // Fetch weather data for the city
      getWeatherData(cityName);
    }
  });
});

// Event listener for form submission
searchForm.addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent form submission
  const cityName = cityInput.value.trim();
  if (cityName !== '') {
    // Fetch weather data for the city
    getWeatherData(cityName);
  }
});

// Function to handle the received weather data
function handleWeatherData(data) {
  // Clear previous weather data
  currentWeatherContainer.innerHTML = '';
  currentWeatherContainer.style.display = 'block';
  // Extract necessary information
  const city = data.city.name;
  const date = new Date(data.list[0].dt_txt).toLocaleDateString();
  const icon = data.list[0].weather[0].icon;
  const temperature = Math.round((data.list[0].main.temp - 273.15) * 9 / 5 + 32); // Convert temperature from Kelvin to Fahrenheit
  const humidity = data.list[0].main.humidity;
  const windSpeed = data.list[0].wind.speed;

  // Create HTML elements to display the current weather information
  const cityElement = document.createElement('h2');
  cityElement.textContent = city;

  const dateElement = document.createElement('p');
  dateElement.textContent = `Date: ${date}`;

  const iconElement = document.createElement('img');
  iconElement.src = `https://openweathermap.org/img/w/${icon}.png`;

  const temperatureElement = document.createElement('p');
  temperatureElement.textContent = `Temperature: ${temperature}°F`;

  const humidityElement = document.createElement('p');
  humidityElement.textContent = `Humidity: ${humidity}%`;

  const windSpeedElement = document.createElement('p');
  windSpeedElement.textContent = `Wind Speed: ${windSpeed} m/s`;

  // Append the elements to the container
  currentWeatherContainer.append(cityElement, dateElement, iconElement, temperatureElement, humidityElement, windSpeedElement);

  // Check if the "Recent Searches" heading exists, and if not, create and append it
  if (!recentSearchButtonsContainer.querySelector('h2')) {
    createRecentSearchesHeading();
  }

  // Display weather forecast for the next 5 days
  displayForecast(data);
}

// Display weather forecast for the next 5 days
function displayForecast(data) {
  // Clear previous forecast data
  forecastContainer.innerHTML = '';

  // Loop through the forecast data for the next 5 days
  for (let i = 0; i < 5; i++) {
    const forecastItem = data.list[i * 8]; // Get the weather data for every 24 hours (8 * 3-hour intervals)

    // Extract necessary information
    const date = new Date(forecastItem.dt_txt).toLocaleDateString();
    const icon = forecastItem.weather[0].icon;
    const temperature = Math.round((forecastItem.main.temp - 273.15) * 9 / 5 + 32); // Convert temperature from Kelvin to Fahrenheit
    const humidity = forecastItem.main.humidity;
    const windSpeed = forecastItem.wind.speed;

    // Create HTML elements to display the forecast information
    const forecastElement = document.createElement('div');
    forecastElement.classList.add('forecast-item');

    const dateElement = document.createElement('p');
    dateElement.textContent = date;

    const iconElement = document.createElement('img');
    iconElement.src = `https://openweathermap.org/img/w/${icon}.png`;

    const temperatureElement = document.createElement('p');
    temperatureElement.textContent = `Temperature: ${temperature}°F`;

    const humidityElement = document.createElement('p');
    humidityElement.textContent = `Humidity: ${humidity}%`;

    const windSpeedElement = document.createElement('p');
    windSpeedElement.textContent = `Wind Speed: ${windSpeed} m/s`;

    // Append the elements to the container
    forecastElement.append(dateElement, iconElement, temperatureElement, humidityElement, windSpeedElement);
    forecastContainer.appendChild(forecastElement);
  }
}

// Function to save the city to recent searches in local storage
function saveToRecentSearches(city) {
  let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

  // Check if the city is already in recent searches
  const index = recentSearches.indexOf(city);
  if (index !== -1) {
    // If the city is already in recent searches, remove it from the current position
    recentSearches.splice(index, 1);
  }

  // Add the city to the beginning of recent searches
  recentSearches.unshift(city);

  // Limit the number of recent searches to 8
  if (recentSearches.length > 8) {
    recentSearches = recentSearches.slice(0, 8);
  }

  // Save the updated recent searches to local storage
  localStorage.setItem('recentSearches', JSON.stringify(recentSearches));

  // Update the recent search buttons
  handleRecentSearchButtons();
  createRecentSearchesHeading(); // Call this function to create the heading once when the page loads
  
}

// Function to handle the recent search buttons
function handleRecentSearchButtons() {
  const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
  recentSearchButtonsContainer.innerHTML = '';

  recentSearches.forEach(city => {
    const button = document.createElement('button');
    button.classList.add('recent-search-button');
    button.textContent = city;
    button.addEventListener('click', () => {
      cityInput.value = city;
      getWeatherData(city);
    });

    recentSearchButtonsContainer.appendChild(button);
  });
}

// Load recent search buttons and the heading when the page loads
createRecentSearchesHeading(); // Call this function to create the heading once when the page loads
handleRecentSearchButtons(); // Call this function to handle the recent search buttons