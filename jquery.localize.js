/*
 * jQuery plugin for localizing dates and times via
 * the datetime attribute of the HTML5 <time> element.
 *
 * https://github.com/davidchambers/jQuery.localize
 */

;(function ($) {
  var
    version = '0.5.0',
    split = 'split',
    settings = {
      abbrDays: 'Sun0Mon0Tues0Wed0Thurs0Fri0Sat'[split](0),
      abbrMonths: 'Jan0Feb0Mar0Apr0May0Jun0Jul0Aug0Sep0Oct0Nov0Dec'[split](0),
      format: 'd mmmm yyyy',
      fullDays: 'Sunday0Monday0Tuesday0Wednesday0Thursday0Friday0Saturday'[split](0),
      fullMonths: 'January0February0March0April0May0June0July0August0September0October0November0December'[split](0),
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
    },
    extend = $.extend,
    slice = [].slice;

  function load(arg) {
    if (arg) {
      if (typeof arg === 'object') {
        extend(settings, arg);
      } else {
        settings.format = arg;
      }
    }
    return this;
  }

  function localize(arg) {
    var
      _ = {
        yy    : function (date) { return pad(_.yyyy(date) % 100); },
        yyyy  : function (date) { return date.getFullYear(); },
        m     : function (date) { return date.getMonth() + 1; },
        mm    : function (date) { return pad(_.m(date)); },
        mmm   : function (date) { return options.abbrMonths[_.m(date) - 1]; },
        mmmm  : function (date) { return options.fullMonths[_.m(date) - 1]; },
        d     : function (date) { return date.getDate(); },
        dd    : function (date) { return pad(_.d(date)); },
        ddd   : function (date) { return options.abbrDays[date.getDay()]; },
        dddd  : function (date) { return options.fullDays[date.getDay()]; },
        o     : function (date) { return options.ordinals(_.d(date)); },
        h     : function (date) { return _.H(date) % 12 || 12; },
        hh    : function (date) { return pad(_.h(date)); },
        H     : function (date) { return date.getHours(); },
        HH    : function (date) { return pad(_.H(date)); },
        M     : function (date) { return date.getMinutes(); },
        MM    : function (date) { return pad(_.M(date)); },
        s     : function (date) { return date.getSeconds(); },
        ss    : function (date) { return pad(_.s(date)); },
        S     : function (date) { return _.s(date) + '.' + pad(date % 1e3, 3); },
        SS    : function (date) { return pad(_.S(date), 6); },
        a     : function (date) { return options.periods[+(_.H(date) > 11)]; },
        Z     : function (date) { var offset = -date.getTimezoneOffset(), mins = Math.abs(offset);
                                  return (offset < 0 ? '-' : '+') + pad(mins / 60 >> 0) + ':' + pad(mins % 60); }
      },
      args = arguments, custom, format, method,

      re = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(?:[.](\d+))?)?(?:([-+]\d\d):(\d\d)|Z)$/,

      options = extend({}, settings);

      // if `arg` is truthy...
      // merge it into `options` if it's an options
      // hash else assign it to `options.format`
      if (arg) {
        if (typeof arg === 'object') {
          extend(options, arg);
        } else {
          options.format = arg;
        }
      }

      format = options.format;
      custom = typeof format === 'function';
      method = options.escaped ? 'html' : 'text';

      return this.each(function () {
        var $this = $(this), date, delta, m, ms;
        if (/^time$/i.test(this.nodeName)) {
          m = re.exec($this.attr('datetime') || formatDate(new Date, 'yyyy-mm-ddTHH:MM:ssZ'));
        }
        if (m) {
          ms = m[7] || '000';
          delta = 4 - ms.length;
          if (delta > 1) {
            ms += new Array(delta).join(0);
          } else {
            ms = ms.substr(0, 3);
          }
          date = (
            normalize(
              new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6] || 0, +ms)),
              +m[8], m[9]
            )
          );
          $this.attr(
            'datetime',
            formatDate(date, 'yyyy-mm-ddTHH:MM' + (m[7] ? ':SS' : m[6] ? ':ss' : '') + 'Z')
          )[method](
            custom?
              format.apply($this, [date].concat(slice.call(args, 1))):
              formatDate(date, format)
          );
        }
      });

      function formatDate(date, format) {
        var dir = '', output = '', prev;
        $.each(
          (format.replace('~', '~T').replace('%%', '~P') + '%').split(''),
          function (index, chr) {
            if (dir) {
              if (chr === prev || dir === '%') {
                dir += chr;
              } else {
                dir = dir.substr(1);
                output +=
                  _.hasOwnProperty(dir)?
                    options.escaped?
                      $('<b>').text(_[dir](date)).html():
                      _[dir](date):
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
        );
        return output.replace('~P', '%').replace('~T', '~');
      }

      function normalize(date, offsetHours, offsetMinutes) {
        if (offsetMinutes) {
          date.setHours(
            _.H(date) - offsetHours,
            _.M(date) + (offsetHours > 0 ? -offsetMinutes : +offsetMinutes)
          );
        }
        return date;
      }

      function pad(s, n) {
        s += '';
        var delta = (n || 2) - s.length;
        return delta > 0 ? new Array(++delta).join(0) + s : s;
      }
    }

    $.fn.localize = function (method) {
      switch (method) {
        case 'version':
          return version;
        case 'load':
          return load.apply(this, slice.call(arguments, 1));
      }
      return localize.apply(this, arguments);
    };

}(jQuery));
