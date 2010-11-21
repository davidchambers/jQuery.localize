(function ($) {

    var fails = 0, passes = 0,
        d1 = new Date(Date.UTC(2008, 6-1, 4, 2)),
        d2 = new Date(Date.UTC(2010, 11-1, 12, 13, 14, 15)),
        t1 = '<time datetime="2008-06-04T02:00-00:00"></time>',
        t2 = '<time datetime="2010-11-12T13:14:15Z"></time>',
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

    assert.match($(t1).localize('ddd').text(), /^(Mon|Tues|Wed|Thurs|Fri|Sat|Sun)$/);
    assert.match($(t2).localize('ddd').text(), /^(Mon|Tues|Wed|Thurs|Fri|Sat|Sun)$/);

    assert.match($(t1).localize('dddd').text(), /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/);
    assert.match($(t2).localize('dddd').text(), /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/);

    assert.match($(t1).localize('o').text(), /^([23]?1st|2?2nd|2?3rd|(2?[4-9]|1\d|[23]0)th)$/);
    assert.match($(t2).localize('o').text(), /^([23]?1st|2?2nd|2?3rd|(2?[4-9]|1\d|[23]0)th)$/);

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

    assert.equal($(t1).localize('s').text(), d1.getSeconds() + '');
    assert.equal($(t2).localize('s').text(), d2.getSeconds() + '');

    assert.equal($(t1).localize('ss').text().length, 2);
    assert.equal($(t2).localize('ss').text().length, 2);

    assert.equal($(t1).localize('a').text(), d1.getHours() < 12 ? 'AM' : 'PM');
    assert.equal($(t2).localize('a').text(), d2.getHours() < 12 ? 'AM' : 'PM');

    assert.match($(t1).localize('Z').text(), /[-+]\d\d:\d\d$/);
    assert.match($(t2).localize('Z').text(), /[-+]\d\d:\d\d$/);

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

    // API tests – implicit

    assert.match($(t1).localize().text(), /^[34] June 2008$/);
    assert.match($(t2).localize().text(), /^1[23] November 2010$/);

    assert.match($(t1).localize({ format: 'yyyy' }).text(), /^\d{4}$/);
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

    window.alert([passes, 'of', passes + fails, 'tests succeeded'].join(' '));

}(jQuery));
