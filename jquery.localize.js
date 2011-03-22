/*
 * jQuery plugin for localizing dates and times via
 * the datetime attribute of the HTML5 <time> element.
 *
 * https://github.com/davidchambers/jQuery.localize
 */

(function ($) {

    var settings, slice = Array.prototype.slice, version = '0.3.4';

    settings = {
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

    function load(arg) {
        if (arg) typeof arg == 'object' ? jQuery.extend(settings, arg) : settings.format = arg;
        return this;
    }

    function localize(arg) {

        var args = arguments, custom, format, method,

        f = {

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

            S: function (date) {
                return date.getSeconds() + '.' + pad(date.getMilliseconds(), 3);
            },

            SS: function (date) {
                return pad(date.getSeconds()) + '.' + pad(date.getMilliseconds(), 3);
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

        re = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(?:[.](\d+))?)?([-+]\d\d:\d\d|Z)$/,

        options = jQuery.extend({}, settings);

        // if `arg` is truthy...
        // merge it into `options` if it's an options hash else assign it to `options.format`
        if (arg) typeof arg == 'object' ? jQuery.extend(options, arg) : options.format = arg;

        format = options.format;
        custom = typeof format == 'function';
        method = options.escaped ? 'html' : 'text';

        return this.each(function () {
            var $this = $(this), date, delta, m, ms;
            date = this.nodeName.toLowerCase() == 'time' && ($this.attr('datetime') || formatDate(new Date(), 'yyyy-mm-ddTHH:MM:ssZ'));
            if (date && (m = date.match(re))) {
                ms = ((delta = 4 - (ms = m[7] || '000').length) > 1 ? ms + (new Array(delta)).join('0') : ms.substr(0, 3))*1;
                date = normalize(new Date(Date.UTC(m[1]*1, m[2]*1 - 1, m[3]*1, m[4]*1, m[5]*1, m[6]*1 || 0, ms)), m[8]);
                $this.attr('datetime', formatDate(date, 'yyyy-mm-ddTHH:MM' + (m[7] ? ':SS' : m[6] ? ':ss' : '') + 'Z'));
                $this[method](custom ? format.apply($this, [date].concat(slice.call(args, 1))) : formatDate(date, format));
            }
        });

        function formatDate(date, format) {
            var dir = '', explicit = format.indexOf('%') >= 0, output = '', prev, safe = options.escaped;
            jQuery.each(
                (format.replace('~', '~T').replace('%%', '~P') + '%').split(''),
                function (index, chr) {
                    if (dir) {
                        if (chr === prev || dir == '%') dir += chr;
                        else output += f.hasOwnProperty(dir = dir.substr(1)) ? safe ?
                                f[dir](date)+''.replace('<', '&lt;').replace('>', '&gt;').replace('&', '&amp;') : f[dir](date) : dir;
                    }
                    if (dir.indexOf('%') < 0) dir = explicit ? chr == '%' ? '%' : (output += chr, '') : '%' + chr;
                    prev = chr;
                }
            );
            return output.replace('~P', '%').replace('~T', '~');
        }

        function normalize(date, utcOffset) {
            var add, hours = 0, minutes = 0;
            if (utcOffset != 'Z') {
                add = utcOffset.substr(0, 1) == '-';
                hours = utcOffset.substr(1, 2)*1;
                minutes = utcOffset.substr(4)*1;
            }
            add ?
                date.setHours(date.getHours() + hours, date.getMinutes() + minutes) :
                date.setHours(date.getHours() - hours, date.getMinutes() - minutes);
            return date;
        }

        function pad(s, n) {
            s += '';
            n || (n = 2);
            var delta = n - s.length;
            return delta > 0 ? (new Array(++delta)).join('0') + s : s;
        }
    }

    jQuery.fn.localize = function (method) {
        return (method == 'version' ? version :
                method == 'load' ? load.apply(this, slice.call(arguments, 1)) :
                localize.apply(this, arguments));
    };

}(jQuery));
