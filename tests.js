(function ($) {

    var custom, expected, fails = 0, passes = 0,
        d1 = new Date(Date.UTC(2008, 6-1, 4, 2)),
        d2 = new Date(Date.UTC(2010, 11-1, 12, 13, 14, 15)),
        t1 = '<time datetime="2008-06-04T02:00-00:00"></time>',
        t2 = '<time datetime="2010-11-12T13:14:15Z"></time>',
        t3 = '<time datetime="2008-06-04T07:45+05:45"></time>',
        t4 = '<time datetime="2010-11-12T13:14:15.161718Z"></time>',
        t5 = '<time datetime="2010-09-08T07:06:05.43Z"></time>',
        assert = {
            equal: function (a, b) {
                a === b ? ++passes : ++fails;
            },
            match: function (text, re) {
                this.equal(text.match(re) ? true : false, true);
            }
        };

    // Rudimentary directive tests

    assert.equal($(t1).localize('yy').text(), '08');
    assert.equal($(t1).localize('yyyy').text(), '2008');

    assert.equal($(t1).localize('m').text(), '6');
    assert.equal($(t1).localize('mm').text(), '06');
    assert.equal($(t1).localize('mmm').text(), 'Jun');
    assert.equal($(t1).localize('mmmm').text(), 'June');

    assert.equal($(t2).localize('m').text(), '11');
    assert.equal($(t2).localize('mm').text(), '11');

    assert.equal($(t1).localize('d').text(), d1.getDate() + '');
    assert.equal($(t2).localize('d').text(), d2.getDate() + '');

    assert.equal($(t1).localize('dd').text().length, 2);
    assert.equal($(t2).localize('dd').text().length, 2);

    expected = /^(Mon|Tues|Wed|Thurs|Fri|Sat|Sun)$/;
    assert.match($(t1).localize('ddd').text(), expected);
    assert.match($(t2).localize('ddd').text(), expected);

    expected = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/;
    assert.match($(t1).localize('dddd').text(), expected);
    assert.match($(t2).localize('dddd').text(), expected);

    expected = /^([23]?1st|2?2nd|2?3rd|(2?[4-9]|1\d|[23]0)th)$/;
    assert.match($(t1).localize('o').text(), expected);
    assert.match($(t2).localize('o').text(), expected);

    assert.equal($(t1).localize('h').text(), (d1.getHours() % 12 || 12) + '');
    assert.equal($(t2).localize('h').text(), (d2.getHours() % 12 || 12) + '');

    assert.equal($(t1).localize('hh').text().length, 2);
    assert.equal($(t2).localize('hh').text().length, 2);

    assert.equal($(t1).localize('H').text(), d1.getHours() + '');
    assert.equal($(t2).localize('H').text(), d2.getHours() + '');

    assert.equal($(t1).localize('HH').text().length, 2);
    assert.equal($(t2).localize('HH').text().length, 2);

    assert.equal($(t1).localize('M').text(), d1.getMinutes() + '');
    assert.equal($(t2).localize('M').text(), d2.getMinutes() + '');

    assert.equal($(t1).localize('MM').text().length, 2);
    assert.equal($(t2).localize('MM').text().length, 2);

    assert.equal($(t1).localize('s').text(), '0');
    assert.equal($(t2).localize('s').text(), '15');

    assert.equal($(t1).localize('ss').text(), '00');
    assert.equal($(t2).localize('ss').text(), '15');

    assert.equal($(t4).localize('S').text(), '15.161');
    assert.equal($(t5).localize('S').text(), '5.430');

    assert.equal($(t4).localize('SS').text(), '15.161');
    assert.equal($(t5).localize('SS').text(), '05.430');

    assert.equal($(t1).localize('a').text(), d1.getHours() < 12 ? 'AM' : 'PM');
    assert.equal($(t2).localize('a').text(), d2.getHours() < 12 ? 'AM' : 'PM');

    expected = /[-+]\d\d:\d\d$/;
    assert.match($(t1).localize('Z').text(), expected);
    assert.match($(t2).localize('Z').text(), expected);

    // Fractional second tests

    assert.equal(
        $(t2).localize().text(),
        $(t4).localize().text());

    // Non-UTC time zone offset tests

    assert.equal(
        $(t1).localize().attr('datetime'),
        $(t3).localize().attr('datetime'));

    assert.equal(
        $(t1).localize().text(),
        $(t3).localize().text());

    assert.equal(
        $(t1).localize().attr('datetime'),
        $(t1).localize().localize().attr('datetime'));

    // No `datetime` attribute

    assert.match(
        $('<time>').localize().attr('datetime'),
        /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d[-+]\d\d:\d\d/);

    // Confirm graceful failure

    try {
        assert.equal($('<time datetime="2010-11-20">Initial release</time>').localize().text(), 'Initial release');
    } catch (e) {
        ++fails;
    }

    try {
        assert.equal($('<b>jQuery</b>').localize().text(), 'jQuery');
    } catch (e) {
        ++fails;
    }

    // Internal escape character in format string

    assert.equal($(t1).localize('~').text(), '~');
    assert.equal($(t1).localize('~T').text(), '~T');

    // HTML handling

    assert.equal(
        $(t1).localize('<span>80%% complete</span>').text(),
        '<span>80% complete</span>');

    assert.equal(
        $(t1).localize({ escaped: true, format: '<span>80%% complete</span>' }).text(),
        '80% complete');

    // API tests – implicit

    assert.match($(t1).localize().text(), /^[34] June 2008$/);
    assert.match($(t2).localize().text(), /^1[23] November 2010$/);

    assert.equal($(t1).localize({ format: 'yyyy' }).text(), '2008');
    assert.match($(t1).localize().text(), /^[34] June 2008$/);

    $().localize('load', {
        format: 'd mmmm yyyy',
        fullDays: 'dimanche lundi mardi mercredi jeudi vendredi samedi'.split(' '),
        fullMonths: 'janvier février mars avril mai juin juillet août septembre octobre novembre décembre'.split(' ')
    });

    assert.match($(t1).localize().text(), / juin /);
    assert.match($(t1).localize('dddd').text(), /^(mardi|mercredi)$/);
    assert.equal($(t1).localize({ format: 'yyyy' }).text(), '2008');
    assert.match($(t1).localize().text(), / juin /);

    // API tests – explicit

    $().localize('load', {
        format: '%d de %mmmm de %yyyy',
        fullMonths: 'enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre'.split(' ')
    });

    // "%d" should be interpreted as a directive but "d" should not
    assert.match($(t1).localize().text(), /^[34] de junio de 2008$/);

    // "%%" should be converted to "%"
    assert.equal($(t1).localize('80%% complete').text(), '80% complete');

    // Custom function tests

    // `this` should reference the jQuery instance
    custom = function (date) {
        assert.equal(this instanceof jQuery, true);
    };

    // direct usage
    $(t1).localize(custom);

    // calling loaded custom function
    $().localize('load', custom);
    $(t1).localize();

    // $('time').localize(fn, x, y) -> fn(date, x, y)
    expected = 'jQuery.localize';
    custom = function (date, name) {
        assert.equal(name, expected);
    };

    // direct usage
    $(t1).localize(custom, expected);

    // calling loaded custom function
    $().localize('load', custom);
    $(t1).localize(null, expected);

    // custom functions can also be loaded via the options hash
    $().localize('load', { format: function (date) { return '☺'; } });
    assert.equal($(t1).localize().text(), '☺');

    window.alert([passes, 'of', passes + fails, 'tests succeeded'].join(' '));

}(jQuery));
