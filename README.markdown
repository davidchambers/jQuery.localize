jQuery.localize
===============

jQuery plugin for localizing dates and times via the `datetime` attribute of
the HTML5 `<time>` element.


## Overview

Client-side JavaScript is capable of localizing dates and times on web pages
and in web applications. The [HTML5 `time` element][1] encapsulates date,
time, and time zone information in an accessible manner, and its `datetime`
attribute provides a useful hook for JavaScript localization.


## Requirements

Localization is not possible without sufficient data. In order for a `<time>`
element to be localized, it must contain a `datetime` attribute, and this
attribute's value must contain year, month, date, hours, minutes, and time
zone offset. Seconds are optional, and may include a fractional component.

```html
<time datetime="2010-11-12T13:14:15-00:00">12 November 2010</time>
```


## Usage

### $('time').localize()

Localize the elements in the provided `jQuery` object using the "default"
[settings](#settings).

### $('time').localize(options)

Localize the elements in the provided `jQuery` object, favouring settings
in the `options` object over the "default" [settings](#settings).

### $('time').localize(format)

When passed a string rather than an object, the argument represents `format`.
`$('time').localize('yyyy/mm/dd')` is shorthand for
`$('time').localize({ format: 'yyyy/mm/dd' })`.

### $().localize('load', options)

Sometimes applying the same formatting to all `<time>` elements is not
appropriate. Perhaps times are displayed alongside comment dates but not post
dates. In such situations it's possible to avoid repetition by overriding the
defaults for all future calls to `localize`.

```javascript
$().localize('load', {
    format: 'yyyy/mm/dd',
    periods: ['a.m.', 'p.m.']
});
```

Note that "load" can be called on an empty `jQuery` object (and should, for
the sake of clarity, since it doesn't act upon the elements provided).

### $().localize('load', format)

As with regular calls to `localize`, "load" accepts the format string
shorthand.

### $().localize('version')

Returns the plugin's version number.


## Settings

Settings can be specified by passing an `options` object to `localize`.

```javascript
$('time').localize({
    abbrDays: 'Sun Mon Tue Wed Thu Fri Sat'.split(' '),
    format: 'ddd o mmm yyyy'
});
```

In this case the options provided (`abbrDays` and `format`) will be used in
place of the corresponding defaults.

### abbrDays

Abbreviated day names.

Default: `'Sun Mon Tues Wed Thurs Fri Sat'.split(' ')`

### abbrMonths

Abbreviated month names.

Default: `'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')`

### format

Display format. See [directives](#directives) for more information.

Default: `'d mmmm yyyy'`

### fullDays

Full day names.

Default: `'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ')`

### fullMonths

Full month names.

Default: `'January February March April May June July
           August September October November December'.split(' ')`

### ordinals

Ordinal dates (1st, 2nd, 3rd, etc.).

Default: Function with returns `'1st'` given `1`, `'2nd'` given `2`, etc.

### periods

AM/PM.

Default: `['AM', 'PM']`


## Directives

```coffeescript
yy:   "Year in two digit form"
yyyy: "Year in full"
m:    "Month in numeric form"
mm:   "Month in numeric form, zero-padded"
mmm:  "Month name, abbreviated"
mmmm: "Month name"
d:    "Date"
dd:   "Date, zero-padded"
ddd:  "Day of the week, abbreviated"
dddd: "Day of the week"
o:    "Date in ordinal form (1st, 2nd, 3rd, etc.)"
h:    "Hours in 12-hour time"
hh:   "Hours in 12-hour time, zero-padded"
H:    "Hours in 24-hour time"
HH:   "Hours in 24-hour time, zero-padded"
M:    "Minutes"
MM:   "Minutes, zero-padded"
s:    "Seconds"
ss:   "Seconds, zero-padded"
S:    "Seconds with zero-padded milliseconds"
SS:   "Seconds, zero-padded, with zero-padded milliseconds"
a:    "Period (AM/PM)"
Z:    "Time zone offset (e.g. +10:00)"
```


## Implicit and explicit formatting

By default, all characters in a format string that can be matched to
directives are replaced by the appropriate values. This keeps format strings
short and readable.

Occasionally, one may wish to include literal characters which are normally
treated as directives. One might expect `.localize('o of mmmm')` to result in
"15th of March" or similar. Instead, it'll give "15th 15thf March".

Directives can be specified explicitly to disambiguate in such cases. All
characters in a **format string with one or more percent signs** are treated
as literals unless preceded by a percent sign. `'%%'` is output as "%".

`.localize('%o of %mmmm')` will produce the desired result.


## Internationalization

Sane defaults are provided for displaying dates and times in English, but
these aren't much help if a page's content is in Japanese or Icelandic.
Thankfully, non-English languages work equally well.

```javascript
$().localize('load', {
    format: '%d de %mmmm de %yyyy',
    fullDays: 'domingo lunes martes miércoles jueves viernes sábado'.split(' '),
    fullMonths: 'enero febrero marzo abril mayo junio julio ' +
                'agosto septiembre octubre noviembre diciembre'.split(' ')
});
```


## Custom functions

It's possible to provide a function which receives a date and returns the text
to be displayed. This is either passed to `localize` directly or "loaded" for
later use.

* `$('time').localize(fn)`
* `$().localize('load', fn)`

Within custom functions, `this` references the current `jQuery` instance.
Custom functions are passed one or more arguments, the first of which is a
`Date` object (the local equivalent of the element's `datetime` string).

### Relative dates and times

One can create a custom function which returns relative dates and times
("30 seconds ago", "3 weeks from now", etc.).

```javascript
$('time').localize(function () {
  var
    s = 1, m = 60 * s, h = 60 * m, d = 24 * h,
    units = [s, m, h, d, 7 * d, 30 * d, 365 * d],
    names = 'second minute hour day week month year'.split(' '),
    round = Math.round;

  return function (date) {
    var
      delta = round((date - new Date) / 1000) || -1,
      suffix = delta < 0 ? (delta = Math.abs(delta), 'ago') : 'from now',
      i = units.length, n, seconds;

    while (i--) {
      seconds = units[i];
      if (!i || delta > seconds) {
        n = round(delta / seconds);
        return [n, n === 1 ? names[i] : names[i] + 's', suffix].join(' ');
      }
    }
  };
}());
```


## Changelog

### 0.2.0

  * Added support for [custom functions](#custom-functions) (and by extension
    relative dates and times).

  * Added support for time zones other than UTC in `datetime` strings.

  * Liberalized regular expression to accommodate `datetime` strings which
    include fractional seconds.

  * Added directives for seconds with milliseconds (`S`) and zero-padded
    seconds with milliseconds (`SS`).

### 0.1.0

Initial release.


[1]: http://html5doctor.com/the-time-element/
