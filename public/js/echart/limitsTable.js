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
            { title: "Limit Value", data: "limit" },
            { title: "Consumption Value", data: "consumptions.0.value" },
            { title: "Date", data: "consumptions.0.date" },
            { title: " Cons %", data: "consumptions.0.consumption" },
        ],
        deferRender: true,
        scrollY: 380,
        scrollCollapse: true,
        scroller: true
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
