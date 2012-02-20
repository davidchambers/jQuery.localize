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
<time datetime="2010-11-12T13:14:15+00:00">12 November 2010</time>
```

If passed a `<time>` element _without_ a `datetime` attribute, the current
time is used.


## Usage

### $('time').localize()

Localize the elements in the provided `jQuery` object using the "default"
[settings](#settings).

### $('time').localize(options)

Localize the elements in the provided `jQuery` object, favouring settings
in the `options` hash over the "default" [settings](#settings).

### $('time').localize(format)

When passed a string (or function), the argument represents `format`.
`$('time').localize('yyyy/mm/dd')` is shorthand for
`$('time').localize({format: 'yyyy/mm/dd'})`.

### $.localize(date, format)

Return `date` in the specified `format`.

### $.localize(date)

Return `date` in the format specified by `$.localize.format`.

### $.localize(format)

Return the current date in the specified `format`.

### $.localize()

Return the current date in the format specified by `$.localize.format`.

### $.localize.version

The plugin's version number.


## Settings

Settings can be specified by passing an `options` hash to `$.fn.localize`.

```javascript
$('time').localize({
  abbrDays: 'Sun,Mon,Tues,Wed,Thurs,Fri,Sat'.split(','),
  format: 'ddd o mmm yyyy'
});
```

In this case the provided options (`abbrDays` and `format`) will be used in
place of the corresponding defaults.

The defaults (which are properties of `$.localize`) can be changed to avoid
repetition.

```javascript
$.localize.abbrDays = 'Sun,Mon,Tues,Wed,Thurs,Fri,Sat'.split(',');
$.localize.format = 'ddd o mmm yyyy';
$.localize.periods = ['am', 'pm'];

$('.article-metadata time').localize();
$('.comment-metadata time').localize('h:MMa ddd o mmm yyyy');
```

### $.localize.abbrDays

Abbreviated day names.

Default: `'Sun Mon Tue Wed Thu Fri Sat'.split(' ')`

### $.localize.abbrMonths

Abbreviated month names.

Default: `'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')`

### $.localize.escaped

Determines the jQuery method -- [`text`][2] or [`html`][3] -- to which the
generated string is passed. Set to `true` if the format string contains HTML.

Default: `false`

### $.localize.format

Display format. See [directives](#directives) for more information.

Default: `'d mmmm yyyy'`

### $.localize.fullDays

Full day names.

Default: `'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ')`

### $.localize.fullMonths

Full month names.

Default: `'January February March April May June July
           August September October November December'.split(' ')`

### $.localize.ordinals

Ordinal dates (1st, 2nd, 3rd, etc.).

Default: Function with returns `'1st'` given `1`, `'2nd'` given `2`, etc.

### $.localize.periods

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
$.localize.format = '%d de %mmmm de %yyyy';
$.localize.fullDays = 'domingo,lunes,martes,miércoles,jueves,viernes,sábado'.split(',');
$.localize.fullMonths = ['enero', 'febrero', 'marzo', 'abril', 'mayo',
                         'junio', 'julio', 'agosto', 'septiembre',
                         'octubre', 'noviembre', 'diciembre'];
```


## Custom functions

While `format` is typically a string containing [directives](#directives), it
may instead be a function that takes a `Date` object (the local equivalent of
the element's `datetime` string) and returns the text to be displayed.

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

### 0.8.0

  * Translated source to CoffeeScript, considerably improving its readability.
    When minified and gzipped, the resulting JavaScript file is only slightly
    larger than its hand-optimized predecessor.

  * Fixed a bug which caused `jQuery.fn.localize` to ignore certain options
    passed to it. [`aec2f34`][aec2f34]

  * Fixed a bug affecting format strings with more than one escaped percent
    sign. [`65ac913`][65ac913]

[aec2f34]: https://github.com/davidchambers/jQuery.localize/commit/aec2f34959aa
[65ac913]: https://github.com/davidchambers/jQuery.localize/commit/65ac9135b11c

### 0.7.2

  * Optimized `jQuery.localize.ordinals`.

### 0.7.1

  * Changed the initial value of `jQuery.localize.abbrDays` for consistency
    with JavaScript's abbreviations.
    
    ```javascript
    new Date('18 October 2011') // Tue Oct 18 2011 00:00:00 GMT-0700 (PDT)
    ```
    
    Tuesday and Thursday are now abbreviated as "Tue" and "Thu", respectively.

### 0.7.0

  * Exposed formatting function (formerly `formatDate`) as `jQuery.localize`.

  * Changed the API for updating settings. Settings are now properties of
    `jQuery.localize` and can thus be updated via assignment.
    
    ```javascript
    // 0.6.0
    $.fn.localize('o mmm')

    // 0.7.0
    $.localize.format = 'o mmm'
    ```

  * Changed the way in which the version number is accessed.
    
    ```javascript
    // 0.6.0
    $.fn.localize.version

    // 0.7.0
    $.localize.version
    ```

### 0.6.0

  * Changed the API for updating settings. `jQuery.fn.localize` must now be
    invoked directly, rather than via `$().localize`. As a result, it's clear
    whether an invocation updates settings or acts upon a `jQuery` object.
    
    ```javascript
    // 0.5.1
    $().localize('load', 'o mmm')

    // 0.6.0
    $.fn.localize('o mmm')
    ```

  * Changed the way in which the version number is accessed.
    
    ```javascript
    // 0.5.1
    $().localize('version')

    // 0.6.0
    $.fn.localize.version
    ```

### 0.5.1

  * Optimized internal `pad` function.

### 0.5.0

  * Updated the test suite to have it run against as many versions of jQuery
    as is feasible.

  * Reduced the size of the minified code by more than 10%.

### 0.4.0

  * Improved the source code's readability.

  * Minor internal optimizations.

### 0.3.5

  * Changed the way in which the test suite creates `time` elements to have it
    run in Internet Explorer.

### 0.3.4

  * Enabled the use of "☺" in format strings!

### 0.3.3

  * Renamed `char` variable `chr` to appease Closure Compiler.

### 0.3.2

  * Only `<time>` elements are now localized. Previously, any element with a
    `datetime` attribute would be localized.

  * An element is no longer required to have a `datetime` attribute in
    order to be localized. If passed a `<time>` element without a `datetime`
    attribute, the current time is used.

    ```javascript
    // 0.3.1
    $('<time>').localize().attr('datetime') === undefined

    // 0.3.2
    $('<time>').localize().attr('datetime') !== undefined
    ```

### 0.3.1

  * Added `escaped` setting to allow format strings to contain HTML.

### 0.3.0

  * Streamlined API by mapping [custom functions](#custom-functions) to
    `format` rather than `custom`, removing the need for special treatment.
    
    ```javascript
    // 0.2.0
    $('time').localize('custom');

    // 0.3.0
    $('time').localize();
    ```

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
[2]: http://api.jquery.com/text/
[3]: http://api.jquery.com/html/
