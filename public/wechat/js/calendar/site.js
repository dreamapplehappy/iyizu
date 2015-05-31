// call this from the developer console and you can control both instances
var calendars = {};

$(document).ready( function() {

  // assuming you've got the appropriate language files,
  // clndr will respect whatever moment's language is set to.
  // moment.locale('ru');

  // here's some magic to make sure the dates are happening this month.
  var thisMonth = moment().format('YYYY-MM');
  var data = ["2015-5-29","2015-5-30"];
  var eventArray = [];
  for(var i = 0; i < data.length; i++){
    var obj = {
      "date": data[i],
      "title": "sign"
    }
    eventArray.push(obj);
  }
  console.log(eventArray);

  // the order of the click handlers is predictable.
  // direct click action callbacks come first: click, nextMonth, previousMonth, nextYear, previousYear, or today.
  // then onMonthChange (if the month changed).
  // finally onYearChange (if the year changed).

  calendars.clndr1 = $('.cal1').clndr({
    // constraints: {
    //   startDate: moment().format('YYYY-MM-') + '04'
    // },
    // events: eventArray,
    // constraints: {
    //   startDate: '2013-11-01',
    //   endDate: '2013-11-15'
    // },
    /*clickEvents: {
      click: function(target) {
        console.log(target);
        // if you turn the `constraints` option on, try this out:
        // if($(target.element).hasClass('inactive')) {
        //   console.log('not a valid datepicker date.');
        // } else {
        //   console.log('VALID datepicker date.');
        // }
      },
      nextMonth: function() {
        console.log('next month.');
      },
      previousMonth: function() {
        console.log('previous month.');
      },
      onMonthChange: function() {
        console.log('month changed.');
      },
      nextYear: function() {
        console.log('next year.');
      },
      previousYear: function() {
        console.log('previous year.');
      },
      onYearChange: function() {
        console.log('year changed.');
      }
    },*/
    // multiDayEvents: {
    //   startDate: 'startDate',
    //   endDate: 'endDate',
    //   singleDay: 'date'
    // },
    ready: function(){
         
    },
    showAdjacentMonths: true,
    adjacentDaysChangeMonth: false
  });

  

  calendars.clndr2 = $('.cal2').clndr({
    template: $('#template-calendar').html(),
    events: eventArray,
    daysOfTheWeek: ['日', '一', '二', '三','四','五','六'],
    multiDayEvents: {
      startDate: 'startDate',
      endDate: 'endDate',
      singleDay: 'date'
    },
    // startWithMonth: moment().add(1, 'month'),
    clickEvents: {
      click: function(target) {
        console.log(target);
      }
    },
    forceSixRows: true
  });

  // bind both clndrs to the left and right arrow keys
  $(document).keydown( function(e) {
    if(e.keyCode == 37) {
      // left arrow
      // calendars.clndr1.back();
      calendars.clndr2.back();
    }
    if(e.keyCode == 39) {
      // right arrow
      // calendars.clndr1.forward();
      calendars.clndr2.forward();
    }
  });

});