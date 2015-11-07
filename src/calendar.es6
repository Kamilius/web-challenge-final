/**
 * Creates a new 'Calendar' class instance
 * @class Calendar
 */
class Calendar {
  /**
   * @constructor
   * @param {string} container - represents calendar container DOM query
   * @param {string} activeDateClass - represents custom class for selected date
   * @param {Date} initialDate - represents initially selected calendar date
   */
  constructor({ container = '',
                activeDateClass = '',
                initialDate = new Date() } = {}) {
    this.$container = container ? document.querySelector(container) : null;
    this.activeDateClass = activeDateClass;

    this.selectedDate = initialDate;
    this.currentMonth = initialDate;
    this.currentMonthDays = [];

    // Months human readable names, to be used inside
    // getFormattedDate() function
    this.monthsNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    // initizlize markup and bootstrap application events
    this.generateMarkup();
    this.bootstrapEvents();
  }

  /**
   * Generate selected month visible dates
   * @function buildCurrentMonthDays
   */
  buildCurrentMonthDays() {
    var curYear = this.currentMonth.getFullYear(),
        curMonth = this.currentMonth.getMonth(),
        firstMonthDay = new Date(curYear, curMonth, 1),
        lastMonthDay = new Date(curYear, curMonth + 1, 0);

    // clear previously selected month generated days
    this.currentMonthDays = [];

    // push visible previous month days
    for (let i = -firstMonthDay.getUTCDay(); i < 0; i++) {
      this.currentMonthDays.push(new Date(curYear, curMonth, i));
    }

    // push current month days
    for (let i = 1, lastDay = lastMonthDay.getDate(); i <= lastDay; i++) {
      this.currentMonthDays.push(new Date(curYear, curMonth, i));
    }

    // push visible next month days
    for (let i = 1, daysAppend = 7 - lastMonthDay.getUTCDay(); i < daysAppend; i++) {
      this.currentMonthDays.push(new Date(curYear, curMonth + 1, i));
    }
  }

  /**
   * Generate 'days-list__item' element class
   * @function getDayClass
   * @return {string} - represents element class string
   */
  getDayClass(date) {
    var classes = ['wc-calendar__days-list__item'],
        curYear = this.currentMonth.getFullYear(),
        curMonth = this.currentMonth.getMonth(),
        firstMonthDay = new Date(curYear, curMonth, 1),
        lastMonthDay = new Date(curYear, curMonth + 1, 0);

    // if date is selectedDate
    if (date.toDateString() === this.selectedDate.toDateString()) {
      // add default and custom active classes
      classes = classes.concat(['wc-calendar__days-list__item--active', this.activeDateClass]);
    }
    // if date is from previous year
    if (date.getMonth() === 11 && this.currentMonth.getMonth() === 0) {
      // mark as previous month date
      classes.push('wc-calendar__days-list__item--prev-month');
    // if date is from next year
    } else if (date.getMonth() === 0 && this.currentMonth.getMonth() === 11) {
      // mark as next month date
      classes.push('wc-calendar__days-list__item--next-month');
    // if date is from previous month
    } else if (date.getMonth() < this.currentMonth.getMonth()) {
      classes.push('wc-calendar__days-list__item--prev-month');
    // if date is from next month
    } else if(date.getMonth() > this.currentMonth.getMonth()) {
      classes.push('wc-calendar__days-list__item--next-month');
    }

    // return element class string
    return classes.join(' ');
  }
  /**
   * Utility function for showing formatted date of type 'MonthName YYYY'
   * @function gerFormattedDate
   * @param {Date} date - represents date object which shall be formatted
   * @return {string} - represents formatted date
   */
  getFormattedDate(date) {
    return `${date.getFullYear()} ${this.monthsNames[date.getMonth()]}`;
  }
  /**
   * Generate HTML string markup for visible calendar dates
   * @function generateDaysMarkup
   * @return {string} - represents HTML markup for currently selected month days
   */
  generateDaysMarkup() {
    var days = [];
    // build month days list
    this.buildCurrentMonthDays();
    // generate markup for each month day
    this.currentMonthDays.forEach(function(day) {
      days.push(`<li data-date="${day.toLocaleDateString()}" class="${this.getDayClass(day)}">${day.getDate()}</li>`);
    }.bind(this));

    return days.join('');
  }
  /**
   * Refresh calendar view
   * @function refreshCalendar
   */
  refreshCalendar() {
    // refresh days-list
    this.$container.querySelector('.wc-calendar__days-list').innerHTML = this.generateDaysMarkup();
    // refresh calendar header date
    this.$container.querySelector('.wc-calendar__header__date').innerHTML = this.getFormattedDate(this.currentMonth);
  }
  /**
   * Switch calendar to previous month
   * @function prevMonth
   */
  prevMonth() {
    var curYear = this.currentMonth.getFullYear(),
        curMonth = this.currentMonth.getMonth();
    // set currentMonth to month before
    this.currentMonth = new Date(curYear, curMonth - 1, 1);
    // refresh calendar view
    this.refreshCalendar();
  }
  /**
   * Switch calendar to next month
   * @function nextMonth
   */
  nextMonth() {
    var curYear = this.currentMonth.getFullYear(),
        curMonth = this.currentMonth.getMonth();
    // set currentMonth to month after
    this.currentMonth = new Date(curYear, curMonth + 1, 1);
    // refresh calendar view
    this.refreshCalendar();
  }
  /**
   * Update calendar options
   * @function update
   * @param {string} [option='selectedDate'|'activeDateClass'] - name of option to be updated
   * @param {string} value - value of option to be updated
   */
  update(option, value) {
    if (option === 'selectedDate') {
      let date = new Date(value)

      if (!isNaN(date.getTime())) {
        this.selectedDate = new Date(value)
        this.currentMonth = this.selectedDate
      } else {
        throw new Error('Invalid date format')
      }
    } else if (option === 'activeDateClass') {
      this.activeDateClass = value
    }

    this.refreshCalendar()
  }
  /**
   * Select day. Used as event handler for day-list__item 'click'
   * @function selectDay
   * @prop {Object} event - represents 'click' event object
   */
  selectDay(event) {
    var $target = event.target;
    // Act only if 'day-list__item' was clicked
    if ($target.classList.contains('wc-calendar__days-list__item')) {
      let isPrevMonth = $target.classList.contains('wc-calendar__days-list__item--prev-month'),
          isNextMonth = $target.classList.contains('wc-calendar__days-list__item--next-month');

      this.selectedDate = new Date($target.dataset.date);

      // if element represents date from either previous or next month
      if (isPrevMonth || isNextMonth) {
        // if previous month
        if (isPrevMonth) {
          // switch calendar to month before
          this.prevMonth();
        // if next
        } else {
          // switch calendar to month after
          this.nextMonth();
        }
        // select date element from currently rendered month
        $target = this.$container.querySelector(`[data-date="${this.selectedDate.toLocaleDateString()}"]`);
      // if element represents currently rendered month
      } else {
        let $activeItem = this.$container.querySelector('.wc-calendar__days-list__item--active');
        // if there already is element with active class
        if ($activeItem) {
          // remove active class from element
          $activeItem.classList.remove('wc-calendar__days-list__item--active');
          // if custom active class was specified - remove this class
          this.activeDateClass && $activeItem.classList.remove(this.activeDateClass);
        }
      }
      // add default and custom active classes to selected date element
      $target.classList.add('wc-calendar__days-list__item--active');
      this.activeDateClass && $target.classList.add(this.activeDateClass);
    }
  }
  /**
   * Generate initial calendar markup
   * @function generateMarkup
   */
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
    this.$container.classList.add('wc-calendar');
    // form calendar markup
    this.$container.innerHTML = `
<div class="wc-calendar__header">
  <button class="wc-calendar__btn wc-calendar__btn--prev">Prev</button>
  <div class="wc-calendar__header__date">${this.getFormattedDate(this.currentMonth)}</div>
  <button class="wc-calendar__btn wc-calendar__btn--next">Next</button>
</div>
<div class="wc-calendar__body">
  <ul class="wc-calendar__days-names">
    <li class="wc-calendar__days-names__item">Mon</li>
    <li class="wc-calendar__days-names__item">Tue</li>
    <li class="wc-calendar__days-names__item">Wed</li>
    <li class="wc-calendar__days-names__item">Thu</li>
    <li class="wc-calendar__days-names__item">Fri</li>
    <li class="wc-calendar__days-names__item">Sat</li>
    <li class="wc-calendar__days-names__item">Sun</li>
  </ul>
  <ul class="wc-calendar__days-list">
    ${this.generateDaysMarkup()}
  </ul>
</div>
`;
  }
  /**
   * Bootstrap calendar specific events
   * @function bootstrapEvents
   */
  bootstrapEvents() {
    // prev month button event handler
    this.$container.querySelector('.wc-calendar__btn--prev')
                .addEventListener('click', this.prevMonth.bind(this));
    // next month button event handler
    this.$container.querySelector('.wc-calendar__btn--next')
                .addEventListener('click', this.nextMonth.bind(this));
    // select day item delegated to days-list event handler
    this.$container.querySelector('.wc-calendar__days-list')
                .addEventListener('click', this.selectDay.bind(this));
  }
}

// Testing part. Contains calendar initialization and calendar testing form
// handler
var calendar = new Calendar({
  container: '.calendar'
});

function changeCalendarOptions(event) {
  event.preventDefault();

  var classValue = document.getElementById('class-input').value;
  var dateValue = document.getElementById('date-input').value;

  classValue.trim() && calendar.update('activeDateClass', classValue);
  dateValue.trim() && calendar.update('selectedDate', dateValue);
}

document.querySelector('.calendar-form')
        .addEventListener('submit', changeCalendarOptions);
