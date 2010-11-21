/*
 * jQuery plugin for localizing dates and times via
 * the datetime attribute of the HTML5 <time> element.
 *
 * https://github.com/davidchambers/jQuery.localize
 */

(function ($) {

    var settings = {
        abbrDays: 'Sun Mon Tues Wed Thurs Fri Sat'.split(' '),
        abbrMonths: 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' '),
        format: 'd mmmm yyyy',
        fullDays: 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' '),
        fullMonths: 'January February March April May June July August September October November December'.split(' '),
        ordinals: function (n) {
            if (10 < n && n < 14) return n + 'th';
            switch (n % 10) {
                case 1: return n + 'st';
                case 2: return n + 'nd';
                case 3: return n + 'rd';
                default: return n + 'th';
            }
        },
        periods: ['AM', 'PM']
    };

    function load(options) {
        jQuery.extend(settings, typeof options == 'string' ? { format: options } : options);
        return this;
    }

    function localize(options) {

        options = jQuery.extend({}, settings, typeof options == 'string' ? { format: options } : options);

        var f = {

            yy: function (date) {
                var s = pad(date.getFullYear());
                return s.substr(s.length - 2);
            },

            yyyy: function (date) {
                return date.getFullYear();
            },

            m: function (date) {
                return date.getMonth() + 1;
            },

            mm: function (date) {
                return pad(date.getMonth() + 1);
            },

            mmm: function (date) {
                return options.abbrMonths[date.getMonth()];
            },

            mmmm: function (date) {
                return options.fullMonths[date.getMonth()];
            },

            d: function (date) {
                return date.getDate();
            },

            dd: function (date) {
                return pad(date.getDate());
            },

            ddd: function (date) {
                return options.abbrDays[date.getDay()];
            },

            dddd: function (date) {
                return options.fullDays[date.getDay()];
            },

            o: function (date) {
                return options.ordinals(date.getDate());
            },

            h: function (date) {
                return date.getHours() % 12 || 12;
            },

            hh: function (date) {
                return pad(date.getHours() % 12 || 12);
            },

            H: function (date) {
                return date.getHours();
            },

            HH: function (date) {
                return pad(date.getHours());
            },

            M: function (date) {
                return date.getMinutes();
            },

            MM: function (date) {
                return pad(date.getMinutes());
            },

            s: function (date) {
                return date.getSeconds();
            },

            ss: function (date) {
                return pad(date.getSeconds());
            },

            a: function (date) {
                return options.periods[date.getHours() < 12 ? 0 : 1];
            },

            Z: function (date) {
                var mins = -date.getTimezoneOffset(), sign = mins > 0 ? '+' : '-';
                mins >= 0 || (mins = -mins);
                return sign + pad(mins/60 >> 0) + ':' + pad(mins % 60);
            }
        },

        re = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d))?(?:[-+]00:00|Z)$/;

        return this.each(function () {
            var $this = $(this), date = $this.attr('datetime'), m;
            if (date && (m = date.match(re))) {
                date = new Date(Date.UTC(m[1]*1, m[2]*1 - 1, m[3]*1, m[4]*1, m[5]*1, m[6]*1 || 0));
                $this.attr('datetime', formatDate(date, 'yyyy-mm-ddTHH:MM' + (m[6] ? ':ss' : '') + 'Z'));
                $this.text(formatDate(date, options.format));
            }
        });

        function formatDate(date, format) {
            var count = 0, output = '', prev;
            jQuery.each((format + '☺').split(''), function (index, char) {
                ++count;
                if (char !== prev) {
                    if (prev) {
                        var fragment = (new Array(count)).join(prev);
                        output += f.hasOwnProperty(fragment) ? f[fragment](date) : fragment;
                    }
                    count = 1;
                    prev = char;
                }
            });
            return output;
        }

        function pad(s, n) {
            s += '';
            n || (n = 2);
            var delta = n - s.length;
            return delta > 0 ? (new Array(++delta)).join('0') + s : s;
        }
    }

    jQuery.fn.localize = function (method) {
        return (method == 'load' ?
                load.apply(this, Array.prototype.slice.call(arguments, 1)) :
                localize.apply(this, arguments));
    };

}(jQuery));
