/**
 * Created by robnightingale on 24/09/2016.
 */
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

    $('#datatable-responsive').DataTable({
        ajax: {url: "api/totalportfolio/ce", dataSrc: ''},
        "columns": [
            { title: "Credit Rating", data : "creditRating" },
            { title: "Counterparty", data : "counterParty"},
            { title: "Netting Set", data: "nettingSet" },
            { title: "Trade", data: "trade" },
            { title: "Metric", data: "metric" },
            { title: "Limit Value", data: "limit"
                , render: $.fn.dataTable.render.number( ',', '.', 2, '$' )
                // , render: function(data, type, row){
                // return numeral(data).format('(0.00a)');
            // }
            },
            { title: "Consumption Value", data: "consumptions.0.value"
                , render: function(data, type, row){
                return numeral(data).format('(0.00a)');
            }
            },
            { title: "Date", data: "consumptions.0.date"
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
            { title: " Cons %", data: "consumptions.0.consumption"
             , render: function(data, type, row){
                return numeral(data).format('(0.00a)');
            }
            },
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
            },
        ],

    });

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
