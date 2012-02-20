
/* ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##

  jQuery.localize

  jQuery plugin for localizing dates and times via
  the datetime attribute of the HTML5 <time> element.

  https://github.com/davidchambers/jQuery.localize

## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
*/

(function() {
  var $localize, get, normalize, options, pad, re, version, _;

  version = '0.8.0';

  re = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(?:[.](\d+))?)?(?:([-+]\d\d):(\d\d)|Z)$/;

  normalize = function(date, offsetHours, offsetMinutes) {
    if (offsetHours == null) offsetHours = 0;
    if (offsetMinutes == null) offsetMinutes = 0;
    date.setHours(_.H(date) - offsetHours, _.M(date) + (+offsetHours > 0 ? -offsetMinutes : +offsetMinutes));
    return date;
  };

  get = function(option) {
    return options[option] || $localize[option];
  };

  pad = function(num, chars) {
    if (chars == null) chars = 2;
    return (num + 1000 + '').substr(4 - chars);
  };

  _ = {
    yy: function(date) {
      return pad(_.yyyy(date) % 100);
    },
    yyyy: function(date) {
      return date.getFullYear();
    },
    m: function(date) {
      return date.getMonth() + 1;
    },
    mm: function(date) {
      return pad(_.m(date));
    },
    mmm: function(date) {
      return get('abbrMonths')[_.m(date) - 1];
    },
    mmmm: function(date) {
      return get('fullMonths')[_.m(date) - 1];
    },
    d: function(date) {
      return date.getDate();
    },
    dd: function(date) {
      return pad(_.d(date));
    },
    ddd: function(date) {
      return get('abbrDays')[date.getDay()];
    },
    dddd: function(date) {
      return get('fullDays')[date.getDay()];
    },
    o: function(date) {
      return get('ordinals')(_.d(date));
    },
    h: function(date) {
      return _.H(date) % 12 || 12;
    },
    hh: function(date) {
      return pad(_.h(date));
    },
    H: function(date) {
      return date.getHours();
    },
    HH: function(date) {
      return pad(_.H(date));
    },
    M: function(date) {
      return date.getMinutes();
    },
    MM: function(date) {
      return pad(_.M(date));
    },
    s: function(date) {
      return date.getSeconds();
    },
    ss: function(date) {
      return pad(_.s(date));
    },
    S: function(date) {
      return "" + (_.s(date)) + "." + (pad(date % 1000, 3));
    },
    SS: function(date) {
      return "" + (_.ss(date)) + "." + (pad(date % 1000, 3));
    },
    a: function(date) {
      return get('periods')[+(_.H(date) > 11)];
    },
    Z: function(date) {
      var m, offset;
      m = Math.abs(offset = -date.getTimezoneOffset());
      return "" + (offset < 0 ? '-' : '+') + (pad(m / 60 >> 0)) + ":" + (pad(m % 60));
    }
  };

  $localize = function(date, format) {
    var chr, dir, out, prev, _i, _len, _ref;
    if (!(date instanceof Date)) {
      format = date;
      date = new Date;
    }
    format || (format = $localize.format);
    if (typeof format === 'function') return format(date);
    prev = null;
    dir = out = '';
    _ref = ("" + (format.replace(/~/g, '~T').replace(/%%/g, '~P')) + "%").split('');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      chr = _ref[_i];
      if (dir) {
        if (chr === prev || dir === '%') {
          dir += chr;
        } else {
          dir = dir.substr(1);
          out += _.hasOwnProperty(dir) ? $localize.escaped ? jQuery('<b>').text(_[dir](date)).html() : _[dir](date) : dir;
        }
      }
      if (!/%/.test(dir)) {
        dir = /%/.test(format) ? chr === '%' ? '%' : (out += chr, '') : '%' + chr;
      }
      prev = chr;
    }
    return out.replace(/~P/g, '%').replace(/~T/g, '~');
  };

  $localize.abbrDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  $localize.abbrMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  $localize.fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  $localize.fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  $localize.format = 'd mmmm yyyy';

  $localize.periods = ['AM', 'PM'];

  $localize.ordinals = function(n) {
    return n + ['th', 'st', 'nd', 'rd'][(10 < n && n < 14) || (n %= 10) > 3 ? 0 : n];
  };

  $localize.version = version;

  jQuery.localize = $localize;

  options = {};

  jQuery.fn.localize = function(format) {
    var method;
    if (typeof format === 'object') {
      jQuery.extend(options, format);
      format = options.format;
    }
    format || (format = $localize.format);
    method = options.escaped ? 'html' : 'text';
    this.each(function() {
      var $time, date, m;
      $time = jQuery(this);
      if (this.nodeName.toLowerCase() === 'time') {
        m = re.exec($time.attr('datetime') || $localize('yyyy-mm-ddTHH:MM:ssZ'));
      }
      if (!m) return;
      date = normalize(new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6] || 0, +("" + (m[7] || 0) + "00").substr(0, 3))), m[8], m[9]);
      $time.attr('datetime', $localize(date, "yyyy-mm-ddTHH:MM" + (m[7] ? ':SS' : m[6] ? ':ss' : '') + "Z"));
      return $time[method](typeof format === 'function' ? format.call($time, date) : $localize(date, format));
    });
    options = {};
    return this;
  };

}).call(this);
