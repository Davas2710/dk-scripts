(function(){
alert(
'DK TEST\n\n'+
'URL: '+location.href+
'\n\nRows: '+document.querySelectorAll('tr.call-village').length+
'\nTables: '+document.querySelectorAll('table').length+
'\nTime input: '+(document.getElementById('dkArrivalTime')?'ANO':'NIE')+
'\nUnit checkbox: '+(document.querySelector('.unit_checkbox')?'ANO':'NIE')
);
})();
