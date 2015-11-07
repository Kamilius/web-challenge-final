class WeatherWidget {
  constructor(container) {
    this.$container = container ? document.querySelector(container) : null
    this._isLoading = true
    this._apiToken = 'e9fe3f5afd851cde0ed9e772511bc03a'
    this.city = {
      name: 'Krakow',
      coords: {
        lat: '',
        long: ''
      }
    }
    this.data = {}
    // this.data = JSON.parse(`"{"coord":{"lon":19.92,"lat":50.08},"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"base":"cmc stations","main":{"temp":284.296,"pressure":996.52,"humidity":94,"temp_min":284.296,"temp_max":284.296,"sea_level":1036.48,"grnd_level":996.52},"wind":{"speed":4.87,"deg":251.001},"rain":{"3h":0.355},"clouds":{"all":92},"dt":1446905830,"sys":{"message":0.0029,"country":"PL","sunrise":1446874822,"sunset":1446908817},"id":3094802,"name":"Krakow","cod":200}`)

    navigator.geolocation.getCurrentPosition(this._getPositionSuccess.bind(this),
                                             this._fetchWeatherData.bind(this))

    this.generateMarkup()
  }

  _getPositionSuccess(position) {
    this.city.coords.lat  = position.coords.latitude
    this.city.coords.long = position.coords.longitude

    this._fetchWeatherData()
  }

  _getFetchDataUrl() {
    if (this.city.name) {
      return `http://api.openweathermap.org/data/2.5/weather?q=${this.city.name}&APPID=${this._apiToken}`
    } else if (this.city.coords.lat && this.city.coords.long) {
      return `http://api.openweathermap.org/data/2.5/weather?lat=${this.city.coords.lat}&lon=${this.city.coords.long}&APPID=${this._apiToken}`
    } else {
      alert("please, enter a city name")
    }
  }

  _fetchWeatherData() {
    var xhr = new XMLHttpRequest()

    xhr.open('GET', this._getFetchDataUrl())

    this.renderDataPreloader()

    xhr.onreadystatechange = function () {
      var DONE = 4; // readyState 4 means the request is done.
      var OK = 200; // status 200 is a successful return.
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          this.data = JSON.parse(xhr.responseText)
          this.city.name = this.data.name

          this.renderWeatherData()
        } else {
          console.log('Error: ' + xhr.status); // An error occurred during the request.
        }
      }
    }.bind(this)

    xhr.send()
  }

  changeCity(event) {
    this.data.city = event.target.value

    this._fetchWeatherData()
  }

  renderDataPreloader() {
    document.querySelector('.ewc-weather-widget__weather-wrapper').innerHTML = `
<div class="ewc-weather-widget__preloader></div>"`
  }

  renderWeatherData() {
    document.querySelector('.ewc-weather-widget__weather-wrapper').innerHTML = `
<div class="ewc-weather-widget__temp-wrapper">
  <div class="ewc-weather-widget__temp">${this.data.main.temp}</div>
  <div class="ewc-weather-widget__temp-details">
    <span class="ewc-weather-widget__temp-details--min">${this.data.temp_min}/</span>
    <span class="ewc-weather-widget__temp-details--max">${this.data.temp_max}</span>
  </div>
  <div class="ewc-weather-widget__pressure">Pressure: ${this.data.main.pressure}</div>
  <div class="ewc-weather-widget__wind-speed">W.Speed: ${this.data.wind.speed}</div>
  <div class="ewc-weather-widget__wind-direction">W.Direction: ${this.data.wind.deg}</div>
</div>
<div class="ewc-weather-widget__visual-wrapper">
  <div class="ewc-weather-widget__icon"></div>
  <div class="ewc-weather-widget__verbal">${this.data.weather.description}</div>
</div>`
  }

  generateMarkup() {

    // if container query wasn't specified
    if (!this.$container) {
      // create new container element
      let fragment = document.createDocumentFragment(),
          calendarContainer = document.createElement('div');
      fragment.appendChild(calendarContainer);
      // append container to body
      document.body.appendChild(calendarContainer);
      // save new container reference
      this.$container = calendarContainer;
    }
    // add default class for container
    this.$container.classList.add('ewc-weather-widget');
    // form calendar markup
    this.$container.innerHTML = `
  <div class="ewc-weather-widget__description">
    <div class="ewc-weather-widget__header">
      ${this.city.name}
    </div>
    <div class="ewc-weather-widget__weather-wrapper"></div>
  </div>
  <div class="ewc-weather-widget__date-time-wrapper">
    <div class="ewc-weather-widget__date-wrapper">
      <div class="ewc-weather-widget__time">14:56</div>
      <div class="ewc-weather-widget__date">Sat, Nov 7</div>
    </div>
    <div class="ewc-weather-widget__updated"></div>
  </div>`
  }

  bootstrapEvents() {
    // change city input handler
    this.$container.querySelector('.ewc-weather-widget__city-input')
                .addEventListener('change', this.changeCity.bind(this))
  }
}
