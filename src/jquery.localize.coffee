### ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##

  jQuery.localize

  jQuery plugin for localizing dates and times via
  the datetime attribute of the HTML5 <time> element.

  https://github.com/davidchambers/jQuery.localize

## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ###

version = '0.9.0'

re = ///
  ^
  (\d{4})-(\d\d)-(\d\d)     # year-month-date
  T
  (\d\d):(\d\d)             # hours:minutes
  (?::(\d\d)(?:[.](\d+))?)? # seconds with optional decimal component
  (?:([-+]\d\d):(\d\d)|Z)   # time zone offset
  $
///

normalize = (date, offsetHours = 0, offsetMinutes = 0) ->
  date.setHours(
    _.H(date) - offsetHours
    _.M(date) + if +offsetHours > 0 then -offsetMinutes else +offsetMinutes
  )
  date

get = (option) ->
  options[option] or $localize[option]

pad = (num, chars = 2) ->
  (num + 1000 + '').substr 4 - chars

_ =
  yy:   (date) -> pad _.yyyy(date) % 100
  yyyy: (date) -> date.getFullYear()
  m:    (date) -> date.getMonth() + 1
  mm:   (date) -> pad _.m date
  mmm:  (date) -> get('abbrMonths')[_.m(date) - 1]
  mmmm: (date) -> get('fullMonths')[_.m(date) - 1]
  d:    (date) -> date.getDate()
  dd:   (date) -> pad _.d date
  ddd:  (date) -> get('abbrDays')[date.getDay()]
  dddd: (date) -> get('fullDays')[date.getDay()]
  o:    (date) -> get('ordinals') _.d date
  h:    (date) -> _.H(date) % 12 or 12
  hh:   (date) -> pad _.h date
  H:    (date) -> date.getHours()
  HH:   (date) -> pad _.H date
  M:    (date) -> date.getMinutes()
  MM:   (date) -> pad _.M date
  s:    (date) -> date.getSeconds()
  ss:   (date) -> pad _.s date
  S:    (date) -> "#{_.s date}.#{pad date % 1000, 3}"
  SS:   (date) -> "#{_.ss date}.#{pad date % 1000, 3}"
  a:    (date) -> get('periods')[+(_.H(date) > 11)]
  Z:    (date) ->
          m = Math.abs offset = -date.getTimezoneOffset()
          "#{if offset < 0 then '-' else '+'}#{pad m / 60 >> 0}:#{pad m % 60}"

$localize = (date, format) ->
  if typeof date is 'number'
    date = new Date date
  unless date instanceof Date
    format = date
    date = new Date
  format or= $localize.format
  return format date if typeof format is 'function'

  prev = null
  dir = out = ''
  for chr in "#{format.replace(/~/g, '~T').replace(/%%/g, '~P')}%".split ''
    if dir
      if chr is prev or dir is '%'
        dir += chr
      else
        dir = dir.substr 1
        out += if _.hasOwnProperty dir then _[dir] date else dir
    unless /%/.test dir
      dir =
        if /%/.test format
          if chr is '%' then '%'
          else out += chr; ''
        else '%' + chr
    prev = chr

  out.replace(/~P/g, '%').replace(/~T/g, '~')

$localize.fullDays = [
  'Sunday'
  'Monday'
  'Tuesday'
  'Wednesday'
  'Thursday'
  'Friday'
  'Saturday'
]
$localize.fullMonths = [
  'January'
  'February'
  'March'
  'April'
  'May'
  'June'
  'July'
  'August'
  'September'
  'October'
  'November'
  'December'
]
abbreviate = (text) -> text.substr 0, 3
$localize.abbrDays = jQuery.map $localize.fullDays, abbreviate
$localize.abbrMonths = jQuery.map $localize.fullMonths, abbreviate
$localize.format = 'd mmmm yyyy'
$localize.periods = ['AM', 'PM']
$localize.ordinals = (n) ->
  # See [http://jsperf.com/ordinals-in-140-bytes].
  n + ['th', 'st', 'nd', 'rd'][if 10 < n < 14 or (n %= 10) > 3 then 0 else n]
$localize.handler = (dateString) -> @text dateString

$localize.version = version
jQuery.localize = $localize

# Store options provided to `jQuery::localize` in outer scope,
# so they're accessible to `get`.
options = {}

jQuery.fn.localize = (format) ->
  if typeof format is 'object'
    jQuery.extend options, format
    {format, handler} = options
  format or= $localize.format
  handler or= $localize.handler

  @each ->
    $time = jQuery this
    if @nodeName.toLowerCase() is 'time'
      m = re.exec $time.attr('datetime') or $localize 'yyyy-mm-ddTHH:MM:ssZ'
    return unless m

    date = normalize(
      new Date Date.UTC +m[1], m[2] - 1, +m[3], +m[4], +m[5],
                        +m[6] or 0, +"#{m[7] or 0}00".substr 0, 3
      m[8], m[9]
    )
    $time.attr 'datetime', $localize date,
      "yyyy-mm-ddTHH:MM#{if m[7] then ':SS' else if m[6] then ':ss' else ''}Z"

    handler.call $time,
      if typeof format is 'function' then format.call $time, date
      else $localize date, format

  options = {}
  this
