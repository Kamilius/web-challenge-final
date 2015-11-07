'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var WeatherWidget = (function () {
  function WeatherWidget(container) {
    var city = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
    var units = arguments.length <= 2 || arguments[2] === undefined ? 'imperial' : arguments[2];

    _classCallCheck(this, WeatherWidget);

    this.$container = container ? document.querySelector(container) : null;

    this._apiToken = 'e9fe3f5afd851cde0ed9e772511bc03a';
    this.city = {
      name: city,
      coords: {
        lat: '',
        long: ''
      }
    };
    this.units = units;
    this.data = {};

    navigator.geolocation.getCurrentPosition(this._getPositionSuccess.bind(this), this._fetchWeatherData.bind(this));

    this._generateMarkup();
    this._bootstrapEvents();
  }

  _createClass(WeatherWidget, [{
    key: '_getPositionSuccess',
    value: function _getPositionSuccess(position) {
      this.city.coords.lat = position.coords.latitude;
      this.city.coords.long = position.coords.longitude;

      this._fetchWeatherData();
    }
  }, {
    key: '_showWarningMessage',
    value: function _showWarningMessage() {
      this.$container.querySelector('.js-ewc-loc-detection-warning').classList.add('ewc-weather-widget__loc-detection-warning--visible');
    }
  }, {
    key: '_hideLocationWarning',
    value: function _hideLocationWarning() {
      this.$container.querySelector('.js-ewc-loc-detection-warning').classList.remove('ewc-weather-widget__loc-detection-warning--visible');
    }
  }, {
    key: '_getFetchDataUrl',
    value: function _getFetchDataUrl() {
      if (this.city.name) {
        return 'http://api.openweathermap.org/data/2.5/weather?q=' + this.city.name + '&units=' + this.units + '&APPID=' + this._apiToken;
      } else if (this.city.coords.lat && this.city.coords.long) {
        return 'http://api.openweathermap.org/data/2.5/weather?lat=' + this.city.coords.lat + '&lon=' + this.city.coords.long + '&units=' + this.units + '&APPID=' + this._apiToken;
      } else {
        this._openSettings();

        this.$container.querySelector('.js-ewc-loc-detection-warning').classList.add('ewc-weather-widget__loc-detection-warning--visible');
      }
    }
  }, {
    key: '_fetchWeatherData',
    value: function _fetchWeatherData() {
      var xhr = new XMLHttpRequest();

      xhr.open('GET', this._getFetchDataUrl());

      this.renderDataPreloader();

      xhr.onreadystatechange = (function () {
        var DONE = 4; // readyState 4 means the request is done.
        var OK = 200; // status 200 is a successful return.
        if (xhr.readyState === DONE) {
          if (xhr.status === OK) {
            var data = JSON.parse(xhr.responseText);

            if (data.cod && data.cod === '404') {
              this._showWarningMessage();
              this._openSettings();
            } else {
              this.data = data;
              this.city.name = this.data.name;

              this._updateCity();
              this._renderWeatherData();
              this._closeSettings();
            }
          } else {
            console.log('Error: ' + xhr.status); // An error occurred during the request.
          }
        }
      }).bind(this);

      xhr.send();
    }
  }, {
    key: '_updateCity',
    value: function _updateCity() {
      this.$container.querySelector('.ewc-weather-widget__header').innerHTML = this.city.name;
    }
  }, {
    key: '_getWeatherIconURL',
    value: function _getWeatherIconURL() {
      return 'http://openweathermap.org/img/w/' + this.data.weather[0].icon + '.png';
    }
  }, {
    key: '_formatTemperature',
    value: function _formatTemperature(val) {
      return val + '°' + (this.units === 'imperial' ? 'F' : 'C');
    }
  }, {
    key: '_formatWindSpeed',
    value: function _formatWindSpeed(val) {
      return val + ' ' + (this.units === 'imperial' ? 'mph' : 'm/s');
    }
  }, {
    key: 'renderDataPreloader',
    value: function renderDataPreloader() {
      document.querySelector('.ewc-weather-widget__weather-wrapper').innerHTML = '\n<div class="ewc-weather-widget__preloader>Loading...</div>"';
    }
  }, {
    key: '_renderWeatherData',
    value: function _renderWeatherData() {
      document.querySelector('.ewc-weather-widget__weather-wrapper').innerHTML = '\n<div class="ewc-weather-widget__temp-wrapper">\n  <div class="ewc-weather-widget__temp">' + this._formatTemperature(this.data.main.temp) + '</div>\n  <div class="ewc-weather-widget__temp-details">\n    <span class="ewc-weather-widget__temp-details--min">' + this._formatTemperature(this.data.main.temp_min) + '/</span>\n    <span class="ewc-weather-widget__temp-details--max">' + this._formatTemperature(this.data.main.temp_max) + '</span>\n  </div>\n  <div class="ewc-weather-widget__pressure">Pressure: ' + this.data.main.pressure + ' hPa</div>\n  <div class="ewc-weather-widget__wind-speed">W.Speed: ' + this._formatWindSpeed(this.data.wind.speed) + '</div>\n  <div class="ewc-weather-widget__wind-direction">\n    W.Direction:\n    <span class="ewc-weather-widget__compass" style="transform: rotate(' + this.data.wind.deg + 'deg);">&uarr;</span>\n  </div>\n</div>\n<div class="ewc-weather-widget__visual-wrapper">\n  <img class="ewc-weather-widget__icon js-ewc-weather-icon"\n       src="' + this._getWeatherIconURL() + '"\n       alt="weather-icon"\n       title="' + this.data.weather[0].description + '"/>\n  <div class="ewc-weather-widget__verbal">' + this.data.weather[0].main + '</div>\n</div>';
    }
  }, {
    key: '_generateMarkup',
    value: function _generateMarkup() {
      // if container query wasn't specified
      if (!this.$container) {
        // create new container element
        var fragment = document.createDocumentFragment(),
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
      this.$container.innerHTML = '\n  <div class="ewc-weather-widget__btn ewc-weather-widget__btn--open-settings js-ewc-open-settings-btn"></div>\n  <div class="ewc-weather-widget__settings">\n    <div class="ewc-weather-widget__btn ewc-weather-widget__btn--close-settings js-ewc-close-settings-btn"></div>\n    <div class="ewc-weather-widget__loc-detection-warning js-ewc-loc-detection-warning">\n      Unable to detect your position automatically. Please type your city name.\n    </div>\n    <ul class="ewc-weather-widget__settings-list">\n      <li class="ewc-weather-widget__settings-item">\n        <label for="ewc-city-name">City: </label>\n        <input id="ewc-city-name"\n               type="text"\n               placeholder="Type city name here"\n               value=' + this.city.name + '/>\n      </li>\n      <li class="ewc-weather-widget__settings-item">\n        <label>Units: </label>\n        <label for="ewc-unit-imperial">\n          °F\n          <input name="ewc-units"\n                 id="ewc-unit-imperial"\n                 type="radio"\n                 value="imperial"\n                 checked="checked" />\n        </label>\n        <label for="ewc-unit-metric">\n          °C\n          <input name="ewc-units"\n                 id="ewc-unit-metric"\n                 type="radio"\n                 value="metric" />\n        </label>\n      </li>\n      <li class="ewc-weather-widget__settings-item">\n        <button class="ewc-weather-widget__save-btn js-ewc-save-settings-btn">Save</button>\n      </li>\n    </ul>\n  </div>\n  <div class="ewc-weather-widget__description">\n    <div class="ewc-weather-widget__header">\n      ' + this.city.name + '\n    </div>\n    <div class="ewc-weather-widget__weather-wrapper"></div>\n  </div>\n  <div class="ewc-weather-widget__date-time-wrapper">\n    <div class="ewc-weather-widget__date-wrapper">\n      <div class="ewc-weather-widget__time">14:56</div>\n      <div class="ewc-weather-widget__date">Sat, Nov 7</div>\n    </div>\n    <div class="ewc-weather-widget__updated"></div>\n  </div>';
    }
  }, {
    key: '_openSettings',
    value: function _openSettings(event) {
      this.$container.querySelector('.ewc-weather-widget__settings').classList.add('ewc-weather-widget__settings--active');
    }
  }, {
    key: '_closeSettings',
    value: function _closeSettings(event) {
      if (this.city.name) {
        this.$container.querySelector('.ewc-weather-widget__settings').classList.remove('ewc-weather-widget__settings--active');

        this._hideLocationWarning();
      }
    }
  }, {
    key: 'changeCity',
    value: function changeCity(event) {
      this.$container.querySelector('.ewc-weather-widget__settings').classList.add('ewc-weather-widget__settings--active');
    }
  }, {
    key: 'saveSettings',
    value: function saveSettings() {
      var city = this.$container.querySelector('#ewc-city-name').value,
          imperial = this.$container.querySelector('#ewc-unit-imperial').checked,
          metric = this.$container.querySelector('#ewc-unit-metric').checked;

      if (city !== this.city.name) {
        this.city.name = city;
      }
      if (imperial) {
        this.units = 'imperial';
      } else {
        this.units = 'metric';
      }

      this._fetchWeatherData();
      this._closeSettings();
    }
  }, {
    key: '_bootstrapEvents',
    value: function _bootstrapEvents() {
      // change city input handler
      // this.$container.querySelector('.ewc-weather-widget__city-input')
      //             .addEventListener('change', this.changeCity.bind(this))
      // open settings handler
      this.$container.querySelector('.js-ewc-open-settings-btn').addEventListener('click', this._openSettings.bind(this));
      // close settings handler
      this.$container.querySelector('.js-ewc-close-settings-btn').addEventListener('click', this._closeSettings.bind(this));
      // save settings handler
      this.$container.querySelector('.js-ewc-save-settings-btn').addEventListener('click', this.saveSettings.bind(this));
    }
  }]);

  return WeatherWidget;
})();