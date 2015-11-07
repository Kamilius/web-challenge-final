class WeatherWidget {
  constructor(container, city = '', units = 'imperial') {
    this.$container = container ? document.querySelector(container) : null

    this._apiToken = 'e9fe3f5afd851cde0ed9e772511bc03a'
    this.city = {
      name: city,
      coords: {
        lat: '',
        long: ''
      }
    }
    this.units = units
    this.data = {}

    navigator.geolocation.getCurrentPosition(this._getPositionSuccess.bind(this),
                                             this._fetchWeatherData.bind(this))

    this._generateMarkup()
    this._bootstrapEvents()
  }

  _getPositionSuccess(position) {
    this.city.coords.lat = position.coords.latitude
    this.city.coords.long = position.coords.longitude

    this._fetchWeatherData()
  }

  _showWarningMessage() {
    this.$container.querySelector('.js-ewc-loc-detection-warning')
                   .classList
                   .add('ewc-weather-widget__loc-detection-warning--visible')
  }

  _hideLocationWarning() {
    this.$container.querySelector('.js-ewc-loc-detection-warning')
                   .classList
                   .remove('ewc-weather-widget__loc-detection-warning--visible')
  }

  _getFetchDataUrl() {
    if (this.city.name) {
      return `http://api.openweathermap.org/data/2.5/weather?q=${this.city.name}&units=${this.units}&APPID=${this._apiToken}`
    } else if (this.city.coords.lat && this.city.coords.long) {
      return `http://api.openweathermap.org/data/2.5/weather?lat=${this.city.coords.lat}&lon=${this.city.coords.long}&units=${this.units}&APPID=${this._apiToken}`
    } else {
      this._openSettings()

      this.$container.querySelector('.js-ewc-loc-detection-warning')
                     .classList
                     .add('ewc-weather-widget__loc-detection-warning--visible')
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
          let data = JSON.parse(xhr.responseText)

          if (data.cod && data.cod === '404' ) {
            this._showWarningMessage()
            this._openSettings()
          } else {
            this.data = data
            this.city.name = this.data.name

            this._updateCity()
            this._renderWeatherData()
            this._closeSettings()
          }
        } else {
          console.log('Error: ' + xhr.status); // An error occurred during the request.
        }
      }
    }.bind(this)

    xhr.send()
  }

  _updateCity() {
    this.$container.querySelector('.ewc-weather-widget__header').innerHTML = this.city.name
  }

  _getWeatherIconURL() {
    return `http://openweathermap.org/img/w/${this.data.weather[0].icon}.png`
  }

  _formatTemperature(val) {
    return `${val}°${this.units === 'imperial' ? 'F' : 'C'}`
  }

  _formatWindSpeed(val) {
    return `${val} ${this.units === 'imperial' ? 'mph' : 'm/s'}`
  }

  renderDataPreloader() {
    document.querySelector('.ewc-weather-widget__weather-wrapper').innerHTML = `
<div class="ewc-weather-widget__preloader>Loading...</div>"`
  }

  _renderWeatherData() {
    document.querySelector('.ewc-weather-widget__weather-wrapper').innerHTML = `
<div class="ewc-weather-widget__temp-wrapper">
  <div class="ewc-weather-widget__temp">${this._formatTemperature(this.data.main.temp)}</div>
  <div class="ewc-weather-widget__temp-details">
    <span class="ewc-weather-widget__temp-details--min">${this._formatTemperature(this.data.main.temp_min)}/</span>
    <span class="ewc-weather-widget__temp-details--max">${this._formatTemperature(this.data.main.temp_max)}</span>
  </div>
  <div class="ewc-weather-widget__pressure">Pressure: ${this.data.main.pressure} hPa</div>
  <div class="ewc-weather-widget__wind-speed">W.Speed: ${this._formatWindSpeed(this.data.wind.speed)}</div>
  <div class="ewc-weather-widget__wind-direction">
    W.Direction:
    <span class="ewc-weather-widget__compass" style="transform: rotate(${this.data.wind.deg}deg);">&uarr;</span>
  </div>
</div>
<div class="ewc-weather-widget__visual-wrapper">
  <img class="ewc-weather-widget__icon js-ewc-weather-icon"
       src="${this._getWeatherIconURL()}"
       alt="weather-icon"
       title="${this.data.weather[0].description}"/>
  <div class="ewc-weather-widget__verbal">${this.data.weather[0].main}</div>
</div>`
  }

  _generateMarkup() {
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
  <div class="ewc-weather-widget__btn ewc-weather-widget__btn--open-settings js-ewc-open-settings-btn"></div>
  <div class="ewc-weather-widget__settings">
    <div class="ewc-weather-widget__btn ewc-weather-widget__btn--close-settings js-ewc-close-settings-btn"></div>
    <div class="ewc-weather-widget__loc-detection-warning js-ewc-loc-detection-warning">
      Unable to detect your position automatically. Please type your city name.
    </div>
    <ul class="ewc-weather-widget__settings-list">
      <li class="ewc-weather-widget__settings-item">
        <label for="ewc-city-name">City: </label>
        <input id="ewc-city-name"
               type="text"
               placeholder="Type city name here"
               value=${this.city.name}/>
      </li>
      <li class="ewc-weather-widget__settings-item">
        <label>Units: </label>
        <label for="ewc-unit-imperial">
          °F
          <input name="ewc-units"
                 id="ewc-unit-imperial"
                 type="radio"
                 value="imperial"
                 checked="checked" />
        </label>
        <label for="ewc-unit-metric">
          °C
          <input name="ewc-units"
                 id="ewc-unit-metric"
                 type="radio"
                 value="metric" />
        </label>
      </li>
      <li class="ewc-weather-widget__settings-item">
        <button class="ewc-weather-widget__save-btn js-ewc-save-settings-btn">Save</button>
      </li>
    </ul>
  </div>
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

  _openSettings(event) {
    this.$container.querySelector('.ewc-weather-widget__settings')
                .classList.add('ewc-weather-widget__settings--active')
  }

  _closeSettings(event) {
    if (this.city.name) {
      this.$container.querySelector('.ewc-weather-widget__settings')
                  .classList.remove('ewc-weather-widget__settings--active')

      this._hideLocationWarning()
    }
  }

  changeCity(event) {
    this.$container.querySelector('.ewc-weather-widget__settings')
                .classList.add('ewc-weather-widget__settings--active')
  }

  saveSettings() {
    var city = this.$container.querySelector('#ewc-city-name').value,
        imperial = this.$container.querySelector('#ewc-unit-imperial').checked,
        metric = this.$container.querySelector('#ewc-unit-metric').checked

    if (city !== this.city.name) {
      this.city.name = city
    }
    if (imperial) {
      this.units = 'imperial'
    } else {
      this.units = 'metric'
    }

    this._fetchWeatherData()
    this._closeSettings()
  }

  _bootstrapEvents() {
    // change city input handler
    // this.$container.querySelector('.ewc-weather-widget__city-input')
    //             .addEventListener('change', this.changeCity.bind(this))
    // open settings handler
    this.$container.querySelector('.js-ewc-open-settings-btn')
                .addEventListener('click', this._openSettings.bind(this))
    // close settings handler
    this.$container.querySelector('.js-ewc-close-settings-btn')
                .addEventListener('click', this._closeSettings.bind(this))
    // save settings handler
    this.$container.querySelector('.js-ewc-save-settings-btn')
                .addEventListener('click', this.saveSettings.bind(this))
  }
}
