/*
 * jQuery plugin for localizing dates and times via
 * the datetime attribute of the HTML5 <time> element.
 *
 * https://github.com/davidchambers/jQuery.localize
 */

;(function ($) {
  var
  version = '0.7.0',
  extend = $.extend,
  re = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(?:[.](\d+))?)?(?:([-+]\d\d):(\d\d)|Z)$/,
  normalize = function (date, offsetHours, offsetMinutes) {
    if (offsetMinutes) {
      date.setHours(
        _.H(date) - offsetHours,
        _.M(date) + (offsetHours > 0 ? -offsetMinutes : +offsetMinutes)
      );
    }
    return date;
  },
  pad = function (num, chars) {
    return (num + 1000 + '').substr(4 - (chars || 2));
  },
  _ = {
    yy    : function (date) { return pad(_.yyyy(date) % 100); },
    yyyy  : function (date) { return date.getFullYear(); },
    m     : function (date) { return date.getMonth() + 1; },
    mm    : function (date) { return pad(_.m(date)); },
    mmm   : function (date) { return $localize.abbrMonths[_.m(date) - 1]; },
    mmmm  : function (date) { return $localize.fullMonths[_.m(date) - 1]; },
    d     : function (date) { return date.getDate(); },
    dd    : function (date) { return pad(_.d(date)); },
    ddd   : function (date) { return $localize.abbrDays[date.getDay()]; },
    dddd  : function (date) { return $localize.fullDays[date.getDay()]; },
    o     : function (date) { return $localize.ordinals(_.d(date)); },
    h     : function (date) { return _.H(date) % 12 || 12; },
    hh    : function (date) { return pad(_.h(date)); },
    H     : function (date) { return date.getHours(); },
    HH    : function (date) { return pad(_.H(date)); },
    M     : function (date) { return date.getMinutes(); },
    MM    : function (date) { return pad(_.M(date)); },
    s     : function (date) { return date.getSeconds(); },
    ss    : function (date) { return pad(_.s(date)); },
    S     : function (date) { return _.s(date) + '.' + pad(date % 1000, 3); },
    SS    : function (date) { return _.ss(date) + '.' + pad(date % 1000, 3); },
    a     : function (date) { return $localize.periods[+(_.H(date) > 11)]; },
    Z     : function (date) { var offset = -date.getTimezoneOffset(), mins = Math.abs(offset);
                              return (offset < 0 ? '-' : '+') + pad(mins / 60 >> 0) + ':' + pad(mins % 60); }
  },
  $localize = function (date, format) {
    if (!(date instanceof Date)) {
      format = date;
      date = new Date;
    }
    format = format || $localize.format;
    if (typeof format === 'function') {
      return format(date);
    }
    var
      chars = format.replace('~', '~T').replace('%%', '~P') + '%',
      chr, dir = '', idx = 0, len = chars.length, output = '', prev;

    while (idx < len) {
      chr = chars.charAt(idx++);
      if (dir) {
        if (chr === prev || dir === '%') {
          dir += chr;
        } else {
          dir = dir.substr(1);
          output +=
            _.hasOwnProperty(dir) ?
              $localize.escaped ?
                $('<b>').text(_[dir](date)).html() :
                _[dir](date) :
              dir;
        }
      }
      if (!/%/.test(dir)) {
        if (/%/.test(format)) {
          if (chr === '%') {
            dir = '%';
          } else {
            dir = '';
            output += chr;
          }
        } else {
          dir = '%' + chr;
        }
      }
      prev = chr;
    }
    return output.replace('~P', '%').replace('~T', '~');
  };

  // Defaults.
  extend($localize, {
    abbrDays: 'Sun,Mon,Tues,Wed,Thurs,Fri,Sat'.split(','),
    abbrMonths: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(','),
    format: 'd mmmm yyyy',
    fullDays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(','),
    fullMonths: 'January,February,March,April,May,June,July,August,September,October,November,December'.split(','),
    ordinals: function (n) {
      if (n < 11 || n > 13) {
        switch (n % 10) {
          case 1: return n + 'st';
          case 2: return n + 'nd';
          case 3: return n + 'rd';
        }
      } return n + 'th';
    },
    periods: ['AM', 'PM']
  });

  // Set `jQuery.localize`.
  $.localize = $localize;
  $.localize.version = version;

  // Set `jQuery.prototype.localize`.
  $.fn.localize = function (format) {
    var options = extend({}, $localize), custom, method;

    if (typeof format === 'object') {
      extend(options, format);
      format = options.format;
    }
    format = format || $localize.format;
    custom = typeof format === 'function';
    method = options.escaped ? 'html' : 'text';

    return this.each(function () {
      var $time = $(this), date, m;
      if (/^time$/i.test(this.nodeName)) {
        m = re.exec($time.attr('datetime') ||
                    $localize(new Date, 'yyyy-mm-ddTHH:MM:ssZ'));
      }
      if (!m) return;

      date = normalize(
        new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6] || 0,
                          +((m[7] || 0) + '00').substr(0, 3))),
        +m[8], m[9]
      );
      $time.attr('datetime', $localize(date,
        'yyyy-mm-ddTHH:MM' + (m[7] ? ':SS' : m[6] ? ':ss' : '') + 'Z'
      ))[method](custom ? format.call($time, date) : $localize(date, format));
    });
  };

}(jQuery));
