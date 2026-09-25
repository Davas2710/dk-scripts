(function () {
'use strict';

if (!location.href.includes('screen=place') ||
    !location.href.includes('mode=call')) return;

if (document.getElementById('dkSupportPlanner')) return;

const UNITS = [
    'spear','sword','axe','archer','spy','light',
    'marcher','heavy','ram','catapult','knight','snob'
];

function parseTime(t) {
    const m = String(t || '').match(/(\d+):(\d{2}):(\d{2})/);
    return m ? (+m[1] * 3600 + +m[2] * 60 + +m[3]) : 0;
}

function formatTime(sec) {
    sec = ((Math.round(sec) % 86400) + 86400) % 86400;
    return Math.floor(sec / 3600) + ':' +
        String(Math.floor((sec % 3600) / 60)).padStart(2, '0') + ':' +
        String(sec % 60).padStart(2, '0');
}

function selectedUnits() {
    return UNITS.filter(function (u) {
        const cb = document.getElementById('checkbox_' + u);
        return cb && cb.checked;
    });
}

function getTravel(row) {
    let max = 0;

    selectedUnits().forEach(function (u) {
        const td = row.querySelector('td[data-unit="' + u + '"]');
        if (!td) return;

        const input = td.querySelector('.call-unit-box');
        let amount = 0;

        if (input && !input.disabled && String(input.value).trim() !== '') {
            amount = parseInt(input.value, 10) || 0;
        } else {
            amount = parseInt(td.getAttribute('data-count'), 10) || 0;
        }

        if (amount <= 0) return;

        const title =
            td.getAttribute('data-title') ||
            td.getAttribute('title') || '';

        const travel = parseTime(title);

        if (travel > max) max = travel;
    });

    return max;
}

function getServerNow() {
    const selectors = [
        '#serverTime',
        '#server_time',
        '.server-time',
        '.server-time-container'
    ];

    for (const s of selectors) {
        const e = document.querySelector(s);
        if (e) {
            const m = e.textContent.match(/(\d{1,2}):(\d{2}):(\d{2})/);
            if (m)
                return +m[1] * 3600 + +m[2] * 60 + +m[3];
        }
    }

    const text = document.body.innerText || '';
    const matches = [...text.matchAll(/\b(\d{1,2}):(\d{2}):(\d{2})\b/g)];

    if (matches.length) {
        const m = matches[matches.length - 1];
        return +m[1] * 3600 + +m[2] * 60 + +m[3];
    }

    const d = new Date();
    return d.getHours() * 3600 +
           d.getMinutes() * 60 +
           d.getSeconds();
}

function getArrival() {
    const input = document.getElementById('dkArrivalTime');
    if (!input || !input.value) return null;

    const p = input.value.split(':').map(Number);

    let target =
        p[0] * 3600 +
        p[1] * 60 +
        (p[2] || 0);

    const now = getServerNow();

    if (target <= now) target += 86400;

    return {
        target: target,
        display: input.value
    };
}

function calculate() {
    const arrival = getArrival();
    if (!arrival) return;

    const now = getServerNow();

    document.querySelectorAll('tr.call-village').forEach(function (row) {
        let cell = row.querySelector('.dkPlannerCell');

        if (!cell) {
            cell = document.createElement('td');
            cell.className = 'dkPlannerCell';
            row.appendChild(cell);
        }

        const travel = getTravel(row);

        if (!travel) {
            cell.innerHTML =
                '<span style="color:#888">—</span>';
            row.dataset.dkReady = '0';
            return;
        }

        let departure = arrival.target - travel;

        while (departure < 0) departure += 86400;

        let compareDeparture = departure;

        if (arrival.target >= 86400 && departure < now)
            compareDeparture += 86400;

        const ready = compareDeparture >= now;

        cell.innerHTML =
            '<b>Odchod:</b> ' + formatTime(departure) +
            '<br><b>Príchod:</b> ' + arrival.display +
            '<br><span style="color:#777">Cesta: ' +
            formatTime(travel) + '</span>' +
            '<br><b style="color:' +
            (ready ? 'green' : 'red') + '">' +
            (ready ? 'STÍHA' : 'NESTÍHA') +
            '</b>';

        row.dataset.dkReady = ready ? '1' : '0';
    });
}

function build() {
    const first = document.querySelector('tr.call-village');
    if (!first) return;

    const table = first.closest('table');
    if (!table) return;

    const panel = document.createElement('div');
    panel.id = 'dkSupportPlanner';

    panel.style.cssText =
        'margin:8px 0;padding:8px;' +
        'border:1px solid #aaa;' +
        'background:#f5f5f5;' +
        'font-size:13px;line-height:28px;';

    panel.innerHTML =
        '<b>Plánovač podpory</b><br>' +
        'Požadovaný príchod: ' +
        '<input id="dkArrivalTime" type="time" ' +
        'step="1" value="20:00:00" ' +
        'style="width:110px;height:28px;"> ' +
        '<button id="dkCalculate" type="button" ' +
        'style="height:28px;">Vypočítať</button> ' +
        '<button id="dkMarkReady" type="button" ' +
        'style="height:28px;">' +
        'Označiť tie, ktoré stíhajú</button>';

    table.parentNode.insertBefore(panel, table);

    const head = table.querySelector('thead tr');

    if (head) {
        const th = document.createElement('th');
        th.textContent = 'Plánovač';
        head.appendChild(th);
    }

    document.getElementById('dkCalculate')
        .addEventListener('click', calculate);

    const arrivalInput =
        document.getElementById('dkArrivalTime');

    arrivalInput.addEventListener('change', calculate);
    arrivalInput.addEventListener('input', calculate);

    document.addEventListener('change', function (e) {
        if (!e.target) return;

        if (
            e.target.classList.contains('unit_checkbox') ||
            e.target.classList.contains('call-unit-box') ||
            e.target.classList.contains('troop-request-selector')
        ) {
            setTimeout(calculate, 50);
        }
    });

    document.getElementById('dkMarkReady')
        .addEventListener('click', function () {
            document.querySelectorAll(
                'tr.call-village'
            ).forEach(function (row) {

                const cb = row.querySelector(
                    '.troop-request-selector'
                );

                if (!cb) return;

                const ready =
                    row.dataset.dkReady === '1';

                if (cb.checked !== ready)
                    cb.click();
            });
        });

    calculate();
}

build();

})();
