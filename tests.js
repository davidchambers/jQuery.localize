window.$ = null; // jQuery alias should not be relied upon

(function ($) {
  var
    expected,
    failures = 0,
    n = 0,
    d1 = new Date(Date.UTC(2008, 6-1, 4, 2)),
    d2 = new Date(Date.UTC(2010, 11-1, 12, 13, 14, 15)),
    $1 = $('#t1').clone(),
    $2 = $('#t2').clone(),
    $3 = $('#t3').clone(),
    $4 = $('#t4').clone(),
    $5 = $('#t5').clone(),
    $6 = $('#t6').clone(),
    _ = function (arg) {
      return typeof arg === 'string'? '"' + arg + '"': arg;
    },
    assert = {
      equal: function (a, b) {
        n += 1;
        if (a !== b) {
          failures += 1;
          console.error('test ' + n + ' failed: expected', _(b), 'not', _(a));
        }
      },
      instanceOf: function (instance, constructor) {
        this.equal(instance instanceof constructor, true);
      },
      match: function (text, re) {
        this.equal(re.test(text), true);
      }
    };

  // Ordinal tests

  assert.equal($.localize.ordinals(1), '1st')
  assert.equal($.localize.ordinals(2), '2nd')
  assert.equal($.localize.ordinals(3), '3rd')
  assert.equal($.localize.ordinals(4), '4th')
  assert.equal($.localize.ordinals(10), '10th')
  assert.equal($.localize.ordinals(11), '11th')
  assert.equal($.localize.ordinals(12), '12th')
  assert.equal($.localize.ordinals(13), '13th')
  assert.equal($.localize.ordinals(14), '14th')
  assert.equal($.localize.ordinals(20), '20th')
  assert.equal($.localize.ordinals(21), '21st')
  assert.equal($.localize.ordinals(22), '22nd')
  assert.equal($.localize.ordinals(23), '23rd')
  assert.equal($.localize.ordinals(24), '24th')
  assert.equal($.localize.ordinals(30), '30th')
  assert.equal($.localize.ordinals(31), '31st')

  // Rudimentary directive tests

  assert.equal($1.localize('yy').text(), '08');
  assert.equal($1.localize('yyyy').text(), '2008');

  assert.equal($1.localize('m').text(), '6');
  assert.equal($1.localize('mm').text(), '06');
  assert.equal($1.localize('mmm').text(), 'Jun');
  assert.equal($1.localize('mmmm').text(), 'June');

  assert.equal($2.localize('m').text(), '11');
  assert.equal($2.localize('mm').text(), '11');

  assert.equal($1.localize('d').text(), d1.getDate() + '');
  assert.equal($2.localize('d').text(), d2.getDate() + '');

  assert.equal($1.localize('dd').text().length, 2);
  assert.equal($2.localize('dd').text().length, 2);

  expected = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/;
  assert.match($1.localize('ddd').text(), expected);
  assert.match($2.localize('ddd').text(), expected);

  expected = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/;
  assert.match($1.localize('dddd').text(), expected);
  assert.match($2.localize('dddd').text(), expected);

  expected = /^([23]?1st|2?2nd|2?3rd|(2?[4-9]|1\d|[23]0)th)$/;
  assert.match($1.localize('o').text(), expected);
  assert.match($2.localize('o').text(), expected);

  assert.equal($1.localize('h').text(), (d1.getHours() % 12 || 12) + '');
  assert.equal($2.localize('h').text(), (d2.getHours() % 12 || 12) + '');

  assert.equal($1.localize('hh').text().length, 2);
  assert.equal($2.localize('hh').text().length, 2);

  assert.equal($1.localize('H').text(), d1.getHours() + '');
  assert.equal($2.localize('H').text(), d2.getHours() + '');

  assert.equal($1.localize('HH').text().length, 2);
  assert.equal($2.localize('HH').text().length, 2);

  assert.equal($1.localize('M').text(), d1.getMinutes() + '');
  assert.equal($2.localize('M').text(), d2.getMinutes() + '');

  assert.equal($1.localize('MM').text().length, 2);
  assert.equal($2.localize('MM').text().length, 2);

  assert.equal($1.localize('s').text(), '0');
  assert.equal($2.localize('s').text(), '15');

  assert.equal($1.localize('ss').text(), '00');
  assert.equal($2.localize('ss').text(), '15');

  assert.equal($4.localize('S').text(), '15.161');
  assert.equal($5.localize('S').text(), '5.430');

  assert.equal($4.localize('SS').text(), '15.161');
  assert.equal($5.localize('SS').text(), '05.430');

  assert.equal($1.localize('a').text(), d1.getHours() < 12 ? 'AM' : 'PM');
  assert.equal($2.localize('a').text(), d2.getHours() < 12 ? 'AM' : 'PM');

  expected = /[-+]\d\d:\d\d$/;
  assert.match($1.localize('Z').text(), expected);
  assert.match($2.localize('Z').text(), expected);

  // Fractional second tests

  assert.equal(
    $2.localize().text(),
    $4.localize().text());

  // Non-UTC time zone offset tests

  assert.equal(
    $1.localize().attr('datetime'),
    $3.localize().attr('datetime'));

  assert.equal(
    $1.localize().text(),
    $3.localize().text());

  assert.equal(
    $1.localize().attr('datetime'),
    $1.localize().localize().attr('datetime'));

  // No `datetime` attribute

  assert.match(
    $('<time>').localize().attr('datetime'),
    /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d[-+]\d\d:\d\d/);

  // Confirm graceful failure

  try {
    assert.equal($6.localize().text(), 'Initial release');
  } catch (error) {
    failures += 1;
  }

  try {
    assert.equal($('<b>jQuery</b>').localize().text(), 'jQuery');
  } catch (error) {
    failures += 1;
  }

  // Internal escape character in format string

  assert.equal($1.localize('~').text(), '~');
  assert.equal($1.localize('~T').text(), '~T');

  // HTML handling

  assert.equal(
    $1.localize('<span>80%% complete</span>').text(),
    '<span>80% complete</span>');

  assert.equal(
    $1.localize({escaped: true, format: '<span>80%% complete</span>'}).text(),
    '80% complete');

  // API tests

  assert.match($1.localize().text(), /^[34] June 2008$/);
  assert.match($2.localize().text(), /^1[23] November 2010$/);

  assert.equal($1.localize({format: 'yyyy'}).text(), '2008');
  assert.match($1.localize().text(), /^[34] June 2008$/);

  // overriding defaults
  var x = function (num) { return Array(num + 1).join('x').split('') };
  var xx = function () { return 'xx' };
  assert.equal($1.localize({format: 'mmm', abbrMonths: x(12)}).text(), 'x');
  assert.equal($1.localize({format: 'mmmm', fullMonths: x(12)}).text(), 'x');
  assert.equal($1.localize({format: 'ddd', abbrDays: x(7)}).text(), 'x');
  assert.equal($1.localize({format: 'dddd', fullDays: x(7)}).text(), 'x');
  assert.equal($1.localize({format: 'o', ordinals: xx}).text(), 'xx');
  assert.equal($1.localize({format: 'a', periods: x(2)}).text(), 'x');

  $.localize.format = 'd mmmm yyyy';
  $.localize.fullDays = 'dimanche lundi mardi mercredi jeudi vendredi samedi'.split(' ');
  $.localize.fullMonths = 'janvier février mars avril mai juin juillet août septembre octobre novembre décembre'.split(' ');

  assert.match($1.localize().text(), / juin /);
  assert.match($1.localize('dddd').text(), /^(mardi|mercredi)$/);
  assert.equal($1.localize({format: 'yyyy'}).text(), '2008');
  assert.match($1.localize().text(), / juin /);

  $.localize.format = '%d de %mmmm de %yyyy';
  $.localize.fullMonths = 'enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre'.split(' ');

  // "%d" should be interpreted as a directive but "d" should not
  assert.match($1.localize().text(), /^[34] de junio de 2008$/);

  // "%%" should be converted to "%"
  assert.equal($1.localize('80%% complete').text(), '80% complete');
  assert.equal($1.localize('%%%%').text(), '%%');
  assert.equal($1.localize('~~P').text(), '~~P');

  // direct custom function usage
  $1.localize(function (date) {
    assert.instanceOf(this, jQuery);
    assert.instanceOf(date, Date);
    return 'jQuery.localize';
  });
  assert.equal($1.text(), 'jQuery.localize');

  // custom function as default format
  $.localize.format = function (date) {
    assert.instanceOf(this, jQuery);
    assert.instanceOf(date, Date);
    return 'jQuery.localize';
  };
  assert.equal($1.localize().text(), 'jQuery.localize');

  // $.localize(date, format)
  assert.equal($.localize(new Date('26 April 1984'), 'yy'), '84');

  // $.localize(date)
  $.localize.format = 'yyyy-mm-dd';
  assert.equal($.localize(new Date('26 April 1984')), '1984-04-26');

  // $.localize(format)
  assert.match($.localize('d/m/yyyy'), /^[123]?\d\/1?\d\/20\d\d$/);

  // $.localize()
  $.localize.format = function (date) {
    return date.getFullYear();
  };
  assert.match($.localize(), /^20\d\d$/);

  // version property
  assert.equal(typeof $.localize.version, 'string');

  console.log(n - failures + ' of ' + n + ' tests succeeded for jQuery ' + $().jquery);

}(jQuery));
