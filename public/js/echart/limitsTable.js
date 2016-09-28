var flipTable = function() {

};

var limitLoad_ = function() {
    // load the page
    // attach change event handlers to the dropdown controls
    console.log('[INFO] ORE Limit Table.init');

    // var pDates_ = chartManager.populateBusinessDates();
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
            _AttachEvent(e, 'change', flipTable);
        });

        return 'done';

    }).catch(function (error) {
        console.error(new Error(error));
    });
}

$(document).ready(function() {

    var handleDataTableButtons = function() {
        if ($("#datatable-buttons").length) {
            $("#datatable-buttons").DataTable({
                dom: "Bfrtip",
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
                    },
                ],
                responsive: true
            });
        }
    };

    TableManageButtons = function() {
        "use strict";
        return {
            init: function() {
                handleDataTableButtons();
            }
        };
    }();

    // $('a[data-toggle="tab"]').on( 'shown.bs.tab', function (e) {
    //     $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
    // } );

    $("a[data-toggle=\"tab\"]").on("shown.bs.tab", function (e) {
        var $newTab = $(e.target);

        if ($.inArray("sais-tab", $newTab.parent().get(0).classList) >= 0) {
            $(".sais-tab").addClass("active");
            $(".azed-tab").removeClass("active");

        } else {
            $(".azed-tab").addClass("active");
            $(".sais-tab").removeClass("active");
        }

        //$(".dt-responsive:visible").each(function (e) {
        //    $(this).DataTable().columns.adjust().responsive.recalc();
        //});$(".dt-responsive:visible").each(function (e) {
        //    $(this).DataTable().columns.adjust().responsive.recalc();
        //});
    });


    $('table.table').DataTable( {});
    $('#datatable-responsive2').DataTable({});

    // $('#datatable-responsive').DataTable({
    //     ajax: {url: "api/totalportfolio/ce", dataSrc: ''},
    //     "columns": [
    //         { title: "Credit Rating", data : "creditRating" },
    //         { title: "Counterparty", data : "counterParty"},
    //         { title: "Netting Set", data: "nettingSet" },
    //         { title: "Trade", data: "trade" },
    //         { title: "Metric", data: "metric" , render: function (data, type, row) {
    //             return data.toUpperCase();
    //         }},
    //         { title: "Limit Value", data: "limit"
    //             , render: $.fn.dataTable.render.number( ',', '.', 0, chartManager.getBaseCcy())
    //             // , render: function(data, type, row){
    //             // return numeral(data).format('(0.00a)');
    //         // }
    //         },
    //         { title: "Consumption Value", data: "consumptions.0.value"
    //             , render: $.fn.dataTable.render.number( ',', '.', 0, chartManager.getBaseCcy())
    //
    //             // , render: function(data, type, row){
    //             // return numeral(data).format('(0.00a)');
    //         // }
    //         },
    //         { title: "Date", data: "consumptions.0.date"
    //             , render: function ( data, type, row ) {
    //             // If display or filter data is requested, format the date
    //             if ( type === 'display' || type === 'filter' ) {
    //                 var rowvalue = row["Date"];
    //                     return (moment(data, 'YYYYMMDD').format('DD-MMM-YYYY'));
    //             }
    //             // Otherwise the data type requested (`type`) is type detection or
    //             // sorting data, for which we want to use the raw date value, so just return
    //             // that, unaltered
    //             return data;
    //         }
    //         },
    //         { title: " Cons %", data: "consumptions.0.consumption"
    //             , render: $.fn.dataTable.render.number( ',', '.', 2, '')
    //          // , render: function(data, type, row){
    //          //    return numeral(data).format('(0.00a)');
    //         // }
    //         }
    //     ],
    //     deferRender: true,
    //     scrollY: 380,
    //     scrollCollapse: true,
    //     scroller: true,
    //     dom: 'Bfrtip',
    //     buttons: [
    //         {
    //             extend: "copy",
    //             className: "btn-sm"
    //         },
    //         {
    //             extend: "csv",
    //             className: "btn-sm"
    //         },
    //         {
    //             extend: "excel",
    //             className: "btn-sm"
    //         },
    //         {
    //             extend: "pdfHtml5",
    //             className: "btn-sm"
    //         },
    //         {
    //             extend: "print",
    //             className: "btn-sm"
    //         },
    //     ],
    //
    // });

    var $datatable = $('#datatable-checkbox');

    $datatable.dataTable({
        'order': [[ 1, 'asc' ]],
        'columnDefs': [
            { orderable: false, targets: [0] }
        ]
    });
    $datatable.on('draw.dt', function() {
        $('input').iCheck({
            checkboxClass: 'icheckbox_flat-green'
        });
    });

    TableManageButtons.init();
});
