/**
 * Created by robnightingale on 23/07/2016.
 */
$(document).ready(function() {
    $(".sparkline_one").sparkline([2, 4, 3, 4, 5, 4, 5, 4, 3, 4, 5, 6, 4, 5, 6, 3, 5, 4, 5, 4, 5, 4, 3, 4, 5, 6, 7, 5, 4, 3, 5, 6], {
        type: 'bar',
        height: '125',
        barWidth: 13,
        colorMap: {
            '7': '#a1a1a1'
        },
        barSpacing: 2,
        barColor: '#26B99A'
    });

    $(".sparkline11").sparkline([2, 4, 3, 4, 5, 4, 5, 4, 3, 4, 6, 2, 4, 3, 4, 5, 4, 5, 4, 3], {
        type: 'bar',
        height: '40',
        barWidth: 8,
        colorMap: {
            '7': '#a1a1a1'
        },
        barSpacing: 2,
        barColor: '#26B99A'
    });

    $(".sparkline22").sparkline([2, 4, 3, 4, 7, 5, 4, 3, 5, 6, 2, 4, 3, 4, 5, 4, 5, 4, 3, 4, 6], {
        type: 'line',
        height: '40',
        width: '200',
        lineColor: '#26B99A',
        fillColor: '#ffffff',
        lineWidth: 3,
        spotColor: '#34495E',
        minSpotColor: '#34495E'
    });
})();
