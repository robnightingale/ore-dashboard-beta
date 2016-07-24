/**
 * Created by robnightingale on 23/07/2016.
 */
$(document).ready(function() {
    var canvasDoughnut,
        options = {
            legend: false,
            responsive: false
        };

    new Chart(document.getElementById("canvas1i"), {
        type: 'doughnut',
        tooltipFillColor: "rgba(51, 51, 51, 0.55)",
        data: {
            labels: [
                "Symbian",
                "Blackberry",
                "Other",
                "Android",
                "IOS"
            ],
            datasets: [{
                data: [15, 20, 30, 10, 30],
                backgroundColor: [
                    "#BDC3C7",
                    "#9B59B6",
                    "#E74C3C",
                    "#26B99A",
                    "#3498DB"
                ],
                hoverBackgroundColor: [
                    "#CFD4D8",
                    "#B370CF",
                    "#E95E4F",
                    "#36CAAB",
                    "#49A9EA"
                ]

            }]
        },
        options: options
    });

    new Chart(document.getElementById("canvas1i2"), {
        type: 'doughnut',
        tooltipFillColor: "rgba(51, 51, 51, 0.55)",
        data: {
            labels: [
                "Symbian",
                "Blackberry",
                "Other",
                "Android",
                "IOS"
            ],
            datasets: [{
                data: [15, 20, 30, 10, 30],
                backgroundColor: [
                    "#BDC3C7",
                    "#9B59B6",
                    "#E74C3C",
                    "#26B99A",
                    "#3498DB"
                ],
                hoverBackgroundColor: [
                    "#CFD4D8",
                    "#B370CF",
                    "#E95E4F",
                    "#36CAAB",
                    "#49A9EA"
                ]

            }]
        },
        options: options
    });

    new Chart(document.getElementById("canvas1i3"), {
        type: 'doughnut',
        tooltipFillColor: "rgba(51, 51, 51, 0.55)",
        data: {
            labels: [
                "Symbian",
                "Blackberry",
                "Other",
                "Android",
                "IOS"
            ],
            datasets: [{
                data: [15, 20, 30, 10, 30],
                backgroundColor: [
                    "#BDC3C7",
                    "#9B59B6",
                    "#E74C3C",
                    "#26B99A",
                    "#3498DB"
                ],
                hoverBackgroundColor: [
                    "#CFD4D8",
                    "#B370CF",
                    "#E95E4F",
                    "#36CAAB",
                    "#49A9EA"
                ]

            }]
        },
        options: options
    });
});
