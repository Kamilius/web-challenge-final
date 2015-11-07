class WeatherWidget {
  constructor(container) {
    this.$container = container ? document.querySelector(container) : null
    this._isLoading = true
    this._apiToken = 'e9fe3f5afd851cde0ed9e772511bc03a'
    this.city = {
      name: '',
      coords: {
        lat: '',
        long: ''
      }
    }
    this.data = {}

    navigator.geolocation.getCurrentPosition(this._getPositionSuccess.bind(this),
                                             this._getPositionFailure.bind(this))
    this.generateMarkup()
  }

  _getPositionSuccess(position) {
    this.city.coords.lat  = position.coords.latitude
    this.city.coords.long = position.coords.longitude

    this._fetchWeatherData()
  }

  _getPositionFailure() {
    console.warn('Failed to get coordinates. Fetching by city name')
    this._fetchWeatherData()
  }

  _getFetchDataUrl() {
    if (this.city.name) {
      return `http://api.openweathermap.org/data/2.5/weather?lat=${this.city.coords.lat}&lon=${this.city.coords.long}&APPID=${this._apiToken}`
    } else if (this.city.coords.lat && this.city.coords.long) {
      return `http://api.openweathermap.org/data/2.5/weather?q=${this.city.name}&APPID=${this._apiToken}`
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
    document.querySelector('.ewc-weather-widget__body').innerHTML = `
<div class="ewc-weather-widget__preloader></div>"`
  }

  renderWeatherData() {
    document.querySelector('.ewc-weather-widget__body').innerHTML = `
<ul class="ewc-weather-widget__data-list">
  <li class="ewc-weather-widget__data-item">${this.data.main.temp}</li>
  <li class="ewc-weather-widget__data-item">${this.data.main.pressure}</li>
  <li class="ewc-weather-widget__data-item">${this.data.wind.speed}</li>
  <li class="ewc-weather-widget__data-item">${this.data.wind.deg}</li>
</ul>`
    }
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
<div class="ewc-weather-widget">
  <div class="ewc-weather-widget__header">
    ${this.city.name}
    <input class="ewc-weather-widget__city-input"></div>
  </div>
  <div class="ewc-weather-widget__body"></div>
</div>
`
  }

  bootstrapEvents() {
    // change city input handler
    this.$container.querySelector('.ewc-weather-widget__city-input')
                .addEventListener('change', this.changeCity.bind(this))
  }
}
