"use strict";

var dtLimits, dtBreaches;

var getUrl = function(e){
    console.debug(e);
    // return the right suffic fr the metric
    var baseUrl = 'api/totalportfolio/';

    // find out the selected metric from the dropdown / sessionStorage
    // add it to the baseUrl
    var metric = sessionStorage.getItem('limitMetric_') || 'CE';
    return baseUrl + metric.toLowerCase();
};

var flipTable = function(evt) {
    // update the metric and redraw the limits table
    if (isNullOrUndefined(evt))
        return;

    evt = evt || window.event;
    var target = evt.target || evt.srcElement;
    sessionStorage.setItem(target.name, target.value);
    // set the user selected item
    // default_[0].metric = target.value.toLowerCase();
    dtLimits.ajax.url(getUrl()).load();
};

var limitLoad_ = function() {
    // load the page
    // attach change event handlers to the dropdown controls
    console.log('[INFO] ORE Limit Table.init');

    var pCcy_ = chartManager.setBaseCcy();

    return Promise.all([pCcy_]).then(function (values) {
        console.log('[INFO] bus date calls and base ccy complete');
        // when the bus date and base ccy rest calls have resolved
        // reset the page defaults and init the charts
        console.debug(sessionStorage);
        return 'done';
    }).then(function (res) {
        console.log('[INFO] init limits table complete');

        // for each bar graph selector, populate the choices listz
        // and add a change event handler
        [].forEach.call(document.getElementsByClassName('selectpicker-bg'), function (e) {
            chartManager.populateBarGraphMetricList(e);
            sessionStorage.setItem('limitMetric_','CE');
            _AttachEvent(e, 'change', flipTable);
        });

        return 'done';

    }).catch(function (error) {
        console.error(new Error(error));
    });
}

$(document).ready(function() {

    $("a[data-toggle=\"tab\"]").on("shown.bs.tab", function (e) {
        var $newTab = $(e.target);

        if ($.inArray("sais-tab", $newTab.parent().get(0).classList) >= 0) {
            $(".sais-tab").addClass("active");
            $(".azed-tab").removeClass("active");

        } else {
            $(".azed-tab").addClass("active");
            $(".sais-tab").removeClass("active");
        }

        $(".dt-responsive:visible").each(function (e) {
           $(this).DataTable().columns.adjust().responsive.recalc();
        });
    });

    var massageJson = function(json){
        var ret_ = [];
        [].forEach.call(json, function(e){
            var row_ = {};
            row_.creditRating = e.creditRating;
            row_.counterParty = e.counterParty;
            row_.nettingSet = e.nettingSet;
            row_.trade = e.trade;
            row_.metric = e.metric;
            row_.limit = e.limit;
            var cons = e.consumptions;
            [].forEach.call(cons, function(el){
                var new_row = JSON.parse(JSON.stringify(row_));
                new_row.value = el.value;
                new_row.date = el.date;
                new_row.consumption = el.consumption;
                ret_.push(new_row);
            })
        })
        return ret_;
    };

    // table definition common to both tables
    var tableDef = {
        "createdRow": function( row, data, dataIndex ) {
            if ( data.consumption > 75 ) {
                $(row).addClass( 'warning' );
            }
            if ( data.consumption > 100 ) {
                $(row).addClass( 'danger' );
            }
        },
        "columnDefs" : [{
            "className" : "text-right", "targets" : [5,6,8]
        }],
        "columns": [
            { title: "Credit Rating", data : "creditRating" },
            { title: "Counterparty", data : "counterParty"},
            { title: "Netting Set", data: "nettingSet" },
            { title: "Trade", data: "trade" },
            { title: "Metric", data: "metric" , render: function (data, type, row) {
                return data.toUpperCase();
            }},
            { title: "Limit Value", data: "limit"
                , render: $.fn.dataTable.render.number( ',', '.', 0, chartManager.getBaseCcy())
            },
            { title: "Consumption Value", data: "value"
                , render: $.fn.dataTable.render.number( ',', '.', 0, chartManager.getBaseCcy())
            },
            { title: "Date", data: "date"
                , render: function ( data, type, row ) {
                // If display or filter data is requested, format the date
                if ( type === 'display' || type === 'filter' ) {
                    var rowvalue = row["Date"];
                    return (moment(data, 'YYYYMMDD').format('DD-MMM-YYYY'));
                }
                // Otherwise the data type requested (`type`) is type detection or
                // sorting data, for which we want to use the raw date value, so just return
                // that, unaltered
                return data;
            }
            },
            { title: " Cons %", data: "consumption"
                , render: $.fn.dataTable.render.number( ',', '.', 2, '','%')
            }
        ],
        deferRender: true,
        scrollY: 380,
        scrollCollapse: true,
        scroller: true,
        dom: 'Bfrtip',
        buttons: [
            {
                extend: "copy",
                className: "btn-sm"
            },
            {
                extend: "csv",
                className: "btn-sm"
            },
            {
                extend: "excel",
                className: "btn-sm"
            },
            {
                extend: "pdfHtml5",
                className: "btn-sm"
            },
            {
                extend: "print",
                className: "btn-sm"
            }
        ]
    };

    // all records - find the right metric
    dtLimits = $('#datatable-responsive').DataTable(
        tableDef,
        tableDef.ajax = {url: getUrl(this), dataSrc: massageJson}
    );

    // limitBreach table
    dtBreaches = $('#datatable-responsive2').DataTable(
        tableDef,
        tableDef.ajax = {url: "api/limitbreaches", dataSrc: massageJson}
    );
});
