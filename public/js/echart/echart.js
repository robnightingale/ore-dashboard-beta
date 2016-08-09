$(window).load(function () {
    console.log('[INFO] ORE Dashboard.init');
    chartManager.initAllCharts();
    chartManager.populateBusinessDates();
    console.log('[INFO] ORE Dashboard init completed');
});

/**
 * Created by Rob on 28/10/2015.
 */
var BARCharts = (function () {
    "use strict";
    var instance;

    function init() {

        function setNewData(chart_, data_) {
            chart_.setOption({
                series: [{
                    type: data_.seriesType,
                    data: data_.yaxisValues,
                    name: data_.seriesName
                }],
                title: [{text: data_.title, subtext: data_.subTitleText}],
                legend: [{data: data_.yaxisLabels}],
                yAxis: [{data: data_.yaxisLabels}]
            });
        }

        var options = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                x: 10000,
                data: null
            },
            toolbox: {
                show: false,
                feature: {
                    saveAsImage: {
                        show: true,
                        title: "Save Image"
                    }
                }
            },
            calculable: true,
            clickable: true,
            xAxis: [{
                type: 'value',
                boundaryGap: [0, 0.01]
            }],
            yAxis: [{
                type: 'category',
                data: []
            }],
            series: null
        };

        // TODO make these into REST calls
        var ce_chartData = {
            "titleText": "CE",
            "subTitleText": "01-MAR-2016",
            "seriesName": "2016-03-01",
            "seriesType": "bar",
            "yaxisLabels": ["CC", "CCC", "BB", "AA", "BBB"],
            "yaxisValues": [2.434153795E8, 2.031896731E8, 1.696079112E8, 5.808002756E7, 5.086273894E7]
        }
        var npv_chartData = {
            "titleText": "NPV",
            "subTitleText": "01-MAR-2016",
            "seriesName": "2016-03-01",
            "seriesType": "bar",
            "yaxisLabels": ["CCC", "BB", "CC", "AA", "C"],
            "yaxisValues": [1.835835138E8, 1.070428432E8, 1.970644777E7, 1.592368559E7, -1.281875696E7]
        }
        var fca_chartData = {
            "titleText": "CE",
            "subTitleText": "01-MAR-2016",
            "seriesName": "2016-03-01",
            "seriesType": "bar",
            "yaxisLabels": ["CC", "CCC", "BB", "AA", "BBB"],
            "yaxisValues": [2.434153795E8, 2.031896731E8, 1.696079112E8, 5.808002756E7, 5.086273894E7]
        }
        var fba_chartData = {
            "titleText": "CE",
            "subTitleText": "01-MAR-2016",
            "seriesName": "2016-03-01",
            "seriesType": "bar",
            "yaxisLabels": ["CC", "CCC", "BB", "AA", "BBB"],
            "yaxisValues": [2.434153795E8, 2.031896731E8, 1.696079112E8, 5.808002756E7, 5.086273894E7]
        }
        var eepe_chartData = {
            "titleText": "CE",
            "subTitleText": "01-MAR-2016",
            "seriesName": "2016-03-01",
            "seriesType": "bar",
            "yaxisLabels": ["CC", "CCC", "BB", "AA", "BBB"],
            "yaxisValues": [2.434153795E8, 2.031896731E8, 1.696079112E8, 5.808002756E7, 5.086273894E7]
        }
        var npv2_chartData = {
            "titleText": "CE",
            "subTitleText": "01-MAR-2016",
            "seriesName": "2016-03-01",
            "seriesType": "bar",
            "yaxisLabels": ["CC", "CCC", "BB", "AA", "BBB"],
            "yaxisValues": [2.434153795E8, 2.031896731E8, 1.696079112E8, 5.808002756E7, 5.086273894E7]
        }

        function initialiseAllCharts() {
            chartManager.initChart('bar_1', options, ce_chartData, setNewData);
            chartManager.initChart('bar_2', options, npv_chartData, setNewData);
            chartManager.initChart('bar_3', options, fca_chartData, setNewData);
            chartManager.initChart('bar_4', options, eepe_chartData, setNewData);
            chartManager.initChart('bar_5', options, npv2_chartData, setNewData);
            chartManager.initChart('bar_6', options, fba_chartData, setNewData);
        }

        function loadData(chart_, data_) {
            setNewData(chart_, data_);
        }

// expose a few methods and properties
        return {
            initAllCharts: initialiseAllCharts,
            setNewData: setNewData,
            loadData: loadData
        };
    }

    return {
        // Get the Singleton instance if one exists
        // or create one if it doesn't
        getInstance: function () {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    };

})();
var LINECharts = (function () {

    'use strict';
    var instance;

    function init() {

        var line_total_exposure, line_exposure_profile;

        var total_Data = {
            legend: ['NPV', 'CE', 'EEPE', 'Total Exp'],
            xAxisData: ['Week1', 'Week2', 'Week3', 'Week4'],
            series: [{
                name: 'NPV',
                type: 'line',
                smooth: true,
                itemStyle: {
                    normal: {
                        areaStyle: {
                            type: 'default'
                        }
                    }
                },
                data: [-668637914.7, -668637914.7 / 2, -668637714.7 / 2.5, -668637614.7 / 3]
            }, {
                name: 'CE',
                type: 'line',
                smooth: true,
                itemStyle: {
                    normal: {
                        areaStyle: {
                            type: 'default'
                        }
                    }
                },
                data: [763327844.8, 763327844.8 / 2, 763327844.8 / 2.5, 763327844.8 / 3]
            }, {
                name: 'EEPE',
                type: 'line',
                smooth: true,
                itemStyle: {
                    normal: {
                        areaStyle: {
                            type: 'default'
                        }
                    }
                },
                data: [763327844.8, 763327844.8 / 2, 763327844.8 / 2.5, 763327844.8 / 3]
            }, {
                name: 'Total Exp',
                type: 'line',
                smooth: true,
                itemStyle: {
                    normal: {
                        areaStyle: {
                            type: 'default'
                        }
                    }
                },
                data: [763327844.8 * 2, 763327844.8 * 2 / 1.2, 763327844.8 * 2 / 1.3, 763327844.8 * 2 / 1.4]
            }
            ]

        };
        var profile_Data = {
            xAxisData: ['3/1/2016', '6/1/2016', '9/1/2016', '12/1/2016', '3/1/2017',
                '6/1/2017', '9/1/2017', '12/1/2017', '3/1/2018', '6/1/2018', '9/4/2018',
                '12/3/2018', '3/1/2019', '6/3/2019', '9/3/2019', '12/2/2019', '3/2/2020',
                '6/2/2020', '9/1/2020', '12/1/2020', '3/1/2021', '6/1/2021', '9/1/2021',
                '12/1/2021', '3/1/2022', '6/1/2022', '9/1/2022', '12/1/2022', '3/1/2023',
                '6/1/2023', '9/1/2023', '12/1/2023', '3/1/2024', '6/3/2024', '9/3/2024',
                '12/2/2024', '3/3/2025', '6/2/2025', '9/2/2025', '12/1/2025', '3/2/2026',
                '6/1/2026', '9/1/2026', '12/1/2026', '3/1/2027', '6/1/2027', '9/1/2027',
                '12/1/2027', '3/1/2028', '6/1/2028', '9/1/2028', '12/1/2028', '3/1/2029',
                '6/1/2029', '9/4/2029', '12/3/2029', '3/1/2030', '6/3/2030', '9/3/2030',
                '12/2/2030', '3/3/2031', '6/3/2031', '9/2/2031', '12/1/2031', '3/1/2032',
                '6/1/2032', '9/1/2032', '12/1/2032', '3/1/2033', '6/1/2033', '9/1/2033',
                '12/1/2033', '3/1/2034', '6/1/2034', '9/1/2034', '12/1/2034', '3/1/2035',
                '6/1/2035', '9/4/2035', '12/3/2035', '3/3/2036', '6/3/2036', '9/2/2036',
                '12/1/2036', '3/2/2037', '6/1/2037', '9/1/2037', '12/1/2037', '3/1/2038',
                '6/1/2038', '9/1/2038', '12/1/2038', '3/1/2039', '6/1/2039', '9/1/2039',
                '12/1/2039', '3/1/2040', '6/1/2040', '9/4/2040', '12/3/2040', '3/1/2041',
                '6/3/2041', '9/3/2041', '12/2/2041', '3/3/2042', '6/2/2042', '9/2/2042',
                '12/1/2042', '3/2/2043', '6/1/2043', '9/1/2043', '12/1/2043', '3/1/2044',
                '6/1/2044', '9/1/2044', '12/1/2044', '3/1/2045', '6/1/2045', '9/1/2045',
                '12/1/2045', '3/1/2046'],
            series: [{
                name: 'EPE',
                data: ['0', '0', '1900', '28100', '29900', '95200', '108000', '331000',
                    '301000', '521000', '557000', '906000', '834000', '1140000', '1110000',
                    '1580000', '1430000', '1810000', '1820000', '2320000', '2080000', '2480000',
                    '2500000', '2780000', '2600000', '2900000', '2870000', '3020000', '2740000',
                    '3120000', '3140000', '3320000', '3150000', '3280000', '3400000', '3260000',
                    '3210000', '3470000', '3460000', '3370000', '3370000', '3540000', '3620000',
                    '3480000', '3330000', '3550000', '3610000', '3400000', '3250000', '3480000',
                    '3560000', '3370000', '3180000', '3320000', '3410000', '3150000', '3000000',
                    '3190000', '3250000', '3120000', '2910000', '3060000', '3120000', '2920000',
                    '2640000', '2830000', '2900000', '2750000', '2390000', '2550000', '2520000',
                    '2380000', '2380000', '2530000', '2550000', '2440000', '2470000', '2570000',
                    '2630000', '2490000', '2470000', '2580000', '2630000', '2550000', '2520000',
                    '2540000', '2570000', '2600000', '2590000', '2630000', '2630000', '2660000',
                    '2640000', '2630000', '2610000', '2620000', '2610000', '2640000', '2610000',
                    '2620000', '2590000', '2580000', '2540000', '2570000', '2510000', '2490000',
                    '2480000', '2430000', '2430000', '2380000', '2290000', '2270000', '2220000',
                    '2200000', '2140000', '2090000', '2030000', '1980000', '1920000', '1870000',
                    '1780000']

            }, {
                name: 'PFE',
                data: ['-160000000', '-23400000', '-22900000', '-21300000', '-21600000',
                    '-20600000', '-20500000', '-19000000', '-19500000', '-18400000', '-18600000',
                    '-16500000', '-16100000', '-14500000', '-13000000', '-9610000', '-7870000',
                    '-6060000', '-5740000', '-3730000', '-3680000', '152000', '487000', '3410000',
                    '3440000', '6460000', '6700000', '7430000', '8010000', '10700000', '11600000',
                    '12300000', '12800000', '12700000', '13000000', '12400000', '14200000',
                    '15400000', '14600000', '14200000', '15100000', '16200000', '16300000',
                    '15500000', '15700000', '16700000', '16600000', '15300000', '15000000',
                    '16000000', '16200000', '15600000', '14100000', '14900000', '15200000',
                    '14100000', '13600000', '13800000', '13600000', '13300000', '12600000',
                    '12900000', '12700000', '12300000', '10600000', '11200000', '11300000',
                    '11400000', '10500000', '10500000', '9580000', '9690000', '9560000', '10000000',
                    '9650000', '9930000', '9920000', '10200000', '10600000', '10500000', '10300000',
                    '10500000', '10600000', '10400000', '10100000', '10400000', '10200000', '10200000',
                    '10300000', '10400000', '10000000', '9850000', '9700000', '9490000', '9350000',
                    '8890000', '8640000', '8780000', '8980000', '9200000', '8800000', '8800000',
                    '8980000', '8670000', '8800000', '8530000', '8400000', '8270000', '8490000',
                    '8210000', '7810000', '7780000', '7510000', '7430000', '7130000', '7000000',
                    '6700000', '6400000', '6070000', '6040000', '5800000']
            }],
            legend: ['EPE', 'PFE']
        };

        var total_exposure_options = {

            title: {
                text: 'Total ¡Exposure',
                subtext: 'Subtitle'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                x: 140,
                y: 40,
                data: []
            },
            toolbox: {
                show: true,
                feature: {
                    dataView: {
                        show: false, title: 'view data', lang: ['Data', 'ok', 'refresh']
                    },
                    magicType: {
                        show: true,
                        title: {
                            line: 'Line',
                            bar: 'Bar',
                            stack: 'Stack',
                            tiled: 'Tiled'
                        },
                        type: ['line', 'bar', 'stack', 'tiled']
                    },
                    restore: {
                        show: true,
                        title: "Restore"
                    },
                    saveAsImage: {
                        show: true,
                        title: "Save Image"
                    }
                }
            },
            calculable: true,
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: []
            }],
            yAxis: [{
                type: 'value'
            }],
            series: []
        };
        var profile_marklines = {
            data: [
                // Vertical axis, default
                {type: 'max', name: 'max', itemStyle: {normal: {color: '#dc143c'}}},
                {type: 'min', name: 'min', itemStyle: {normal: {color: '#dc143c'}}},
                {type: 'average', name: 'avg', itemStyle: {normal: {color: '#dc143c'}}},
                // Horizontal axis
                {type: 'max', name: 'max', valueIndex: 0, itemStyle: {normal: {color: '#1e90ff'}}},
                {type: 'min', name: 'min', valueIndex: 0, itemStyle: {normal: {color: '#1e90ff'}}},
                {type: 'average', name: 'avg', valueIndex: 0, itemStyle: {normal: {color: '#1e90ff'}}}
            ]
        };

        var exposure_profile_options = {
            title: {
                text: 'Exposure Profile',
                subtext: 'Simulated EPE & PFE'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                x: 220,
                y: 40,
                data: []
            },
            toolbox: {
                show: true,
                feature: {
                    magicType: {
                        show: true,
                        title: {
                            line: 'Line',
                            bar: 'Bar',
                            stack: 'Stack',
                            tiled: 'Tiled'
                        },
                        type: ['line', 'bar', 'stack', 'tiled']
                    },
                    restore: {
                        show: true,
                        title: "Restore"
                    },
                    saveAsImage: {
                        show: true,
                        title: "Save Image"
                    }
                }
            },
            dataZoom: {
                show: true,
                realtime: true,
                start: 0,
                end: 100
            },
            calculable: true,
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: []
            }],
            yAxis: [{
                type: 'value'
            }],
            series: [],
            // markPoint : {
            //     data : [
            //         // Vertical axis, default
            //         {type : 'max', name: 'max',symbol: 'emptyCircle', itemStyle:{normal:{color:'#dc143c',label:{position:'top'}}}},
            //         {type : 'min', name: 'min',symbol: 'emptyCircle', itemStyle:{normal:{color:'#dc143c',label:{position:'bottom'}}}},
            //         // Horizontal axis
            //         {type : 'max', name: 'max', valueIndex: 0, symbol: 'emptyCircle', itemStyle:{normal:{color:'#1e90ff',label:{position:'right'}}}},
            //         {type : 'min', name: 'min', valueIndex: 0, symbol: 'emptyCircle', itemStyle:{normal:{color:'#1e90ff',label:{position:'left'}}}}
            //     ]
            // },
        };

        function setNewData(chart_, data_) {
            data_.series.forEach(function (elem) {
                // only add marklines for exposure profile graph
                if (chart_.getOption().title[0].text == 'Exposure Profile')
                    elem.markLine = profile_marklines;
                elem.type = 'line';
                elem.smooth = true;
                elem.itemStyle = {
                    normal: {
                        areaStyle: {
                            type: 'default'
                        }
                    }
                };
            });

            chart_.setOption({
                legend: [{data: data_.legend}],
                xAxis: [{data: data_.xAxisData}],
                series: data_.series
            });
        }

        function initialiseAllCharts() {
            chartManager.initChart('line_total_exposure', total_exposure_options, total_Data, setNewData);
            chartManager.initChart('line_exposure_profile', exposure_profile_options, profile_Data, setNewData);
        }

        function loadData(chart_, data_) {
            setNewData(chart_, data_);
        }

        // expose a few methods and properties
        return {
            getTotalExposure: line_total_exposure,
            getProjection: line_exposure_profile,
            initAllCharts: initialiseAllCharts,
            setNewData: setNewData,
            loadData: loadData
        };
    }

    return {
        // Get the Singleton instance if one exists
        // or create one if it doesn't
        getInstance: function () {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    };

})();
var DONUTCharts = (function () {

    'use strict';
    var instance;


    function init() {

        var donut_cva, donut_fva, donut_colva, echartGauge;
        var options = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} <br/>({d}%)"
            },
            calculable: true,
            legend: {
                show: false,
                x: 'center',
                y: 'bottom',
                data: []
            },
            toolbox: {
                show: false,
                feature: {
                    magicType: {
                        show: true,
                        type: ['pie', 'funnel'],
                        option: {
                            funnel: {
                                x: '25%',
                                width: '50%',
                                funnelAlign: 'center',
                                max: 1548
                            }
                        }
                    },
                    restore: {
                        show: true,
                        title: "Restore"
                    },
                    saveAsImage: {
                        show: true,
                        title: "Save Image"
                    }
                }
            },
            series: [{
                name: '',
                type: 'pie',
                radius: ['35%', '55%'],
                itemStyle: {
                    normal: {
                        label: {
                            show: true
                        },
                        labelLine: {
                            show: true
                        }
                    },
                    emphasis: {
                        label: {
                            show: true,
                            position: 'center',
                            textStyle: {
                                fontSize: '14',
                                fontWeight: 'normal'
                            }
                        }
                    }
                },
                data: []
            }]
        };

        var cva_chartData = {
            title: 'CVA Risk measure by credit rating',
            yaxisLabels: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', 'NR'],
            yaxisValues: [{
                value: 378922.2,
                name: 'AAA'
            }, {
                value: 744821.705,
                name: 'AA'
            }, {
                value: 324822.6539,
                name: 'A'
            }, {
                value: 703462.2286,
                name: 'BBB'
            }, {
                value: 433799.9102,
                name: 'BB'
            }, {
                value: 128340.57,
                name: 'B'
            }, {
                value: 583971.5645,
                name: 'CCC'
            }, {
                value: 908487,
                name: 'CC'
            }, {
                value: 441333.439,
                name: 'C'
            }, {
                value: 309688.8,
                name: 'NR'
            }]
        };
        var fva_chartData = {
            title: 'FVA Risk measure by credit rating',
            yaxisLabels: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', 'NR'],
            yaxisValues: [{
                value: 378922.2,
                name: 'AAA'
            }, {
                value: 744821.705,
                name: 'AA'
            }, {
                value: 324822.6539,
                name: 'A'
            }, {
                value: 703462.2286,
                name: 'BBB'
            }, {
                value: 433799.9102,
                name: 'BB'
            }, {
                value: 128340.57,
                name: 'B'
            }, {
                value: 583971.5645,
                name: 'CCC'
            }, {
                value: 908487,
                name: 'CC'
            }, {
                value: 441333.439,
                name: 'C'
            }, {
                value: 309688.8,
                name: 'NR'
            }]
        };
        var colva_chartData = {
            title: 'ColVA Risk measure by credit rating',
            yaxisLabels: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', 'NR'],
            yaxisValues: [{
                value: 378922.2,
                name: 'AAA'
            }, {
                value: 744821.705,
                name: 'AA'
            }, {
                value: 324822.6539,
                name: 'A'
            }, {
                value: 703462.2286,
                name: 'BBB'
            }, {
                value: 433799.9102,
                name: 'BB'
            }, {
                value: 128340.57,
                name: 'B'
            }, {
                value: 583971.5645,
                name: 'CCC'
            }, {
                value: 908487,
                name: 'CC'
            }, {
                value: 441333.439,
                name: 'C'
            }, {
                value: 309688.8,
                name: 'NR'
            }]
        };

        function setNewData(chart_, data_) {
            chart_.setOption({
                series: [{
                    data: data_.yaxisValues,
                    name: data_.title
                }],
                legend: {data: data_.yaxisLabels}
            });

        }

        function initialiseAllCharts() {
            chartManager.initChart('donut_cva', options, cva_chartData, setNewData);
            chartManager.initChart('donut_fva', options, fva_chartData, setNewData);
            chartManager.initChart('donut_colva', options, colva_chartData, setNewData);
        }

        function loadData(chart_, data_) {
            setNewData(chart_, data_);
        }

// expose a few methods and properties
        return {
            initAllCharts: initialiseAllCharts,
            setNewData: setNewData,
            loadData: loadData
        };

    }

    return {
        // Get the Singleton instance if one exists
        // or create one if it doesn't
        getInstance: function () {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    };

})();
var RISKGauge = (function () {

    'use strict';
    var instance;


    function init() {
        var echartGauge;

        var options = {
            tooltip: {
                formatter: "{a} <br/>{b} : {c}%"
            },
            toolbox: {
                show: false,
                feature: {
                    restore: {
                        show: true,
                        title: "Restore"
                    },
                    saveAsImage: {
                        show: true,
                        title: "Save Image"
                    }
                }
            },
            series: [{
                name: 'Risk Gauge',
                type: 'gauge',
                center: ['50%', '50%'],
                startAngle: 240,
                endAngle: -60,
                min: 0,
                max: 100,
                precision: 0,
                splitNumber: 10,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: [
                            [0.3, 'lightgreen'],
                            [0.8, 'orange'],
                            // [0.8, 'skyblue'],
                            [1, '#ff4500']
                        ],
                        width: 30
                    }
                },
                axisTick: {
                    show: true,
                    splitNumber: 5,
                    length: 8,
                    lineStyle: {
                        color: '#eee',
                        width: 1,
                        type: 'solid'
                    }
                },
                axisLabel: {
                    show: true,
                    formatter: function (v) {
                        switch (v + '') {
                            case '10':
                                return 'a';
                            case '30':
                                return 'b';
                            case '60':
                                return 'c';
                            case '90':
                                return 'd';
                            default:
                                return '';
                        }
                    },
                    textStyle: {
                        color: '#333'
                    }
                },
                splitLine: {
                    show: true,
                    length: 30,
                    lineStyle: {
                        color: '#eee',
                        width: 2,
                        type: 'solid'
                    }
                },
                pointer: {
                    length: '80%',
                    width: 8,
                    color: 'auto'
                },
                title: {
                    show: true,
                    offsetCenter: ['0%', -140],
                    textStyle: {
                        color: '#333',
                        fontSize: 15
                    }
                },
                detail: {
                    show: true,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderWidth: 0,
                    borderColor: '#ccc',
                    width: 100,
                    height: 40,
                    offsetCenter: ['-60%', 110],
                    formatter: '{value}%',
                    textStyle: {
                        color: 'auto',
                        fontSize: 30
                    }
                },
                data: [{
                    value: 43
                }]
            }]
        };

        function setNewData(chart_, data_) {
            chart_.setOption({
                series: [{
                    data: data_.yaxisValues,
                    name: data_.title
                }],
                legend: {data: data_.yaxisLabels}
            });

        }

        function initialiseAllCharts() {
            chartManager.initChart('echart_guage', options, [], setNewData);
        }

        function loadData(chart_, data_) {
            setNewData(chart_, data_);
        }

// expose a few methods and properties
        return {
            initAllCharts: initialiseAllCharts,
            setNewData: setNewData,
            loadData: loadData
        };

    }

    return {
        // Get the Singleton instance if one exists
        // or create one if it doesn't
        getInstance: function () {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    };

})();

var chartManager = {

    initAllCharts: function(){
        LINECharts.getInstance().initAllCharts();
        BARCharts.getInstance().initAllCharts();
        DONUTCharts.getInstance().initAllCharts();
        RISKGauge.getInstance().initAllCharts();
    },
    initChart: function (chartTagName_, options, data_, fnLoadData_) {
        var theChart_ = echarts.init(document.getElementById(chartTagName_), theme);
        theChart_.setOption(options);
        fnLoadData_(theChart_, data_);
        theChart_.on('click', this.eConsole);
    },
    getChartInstanceByDivId: function (chartTagName_) {
        var theChart_ = echarts.getInstanceByDom(document.getElementById(chartTagName_));
        return theChart_;
    },
    eConsole: function (param) {
        var mes = 'Drill down request - 【' + param.type + '】';
        if (typeof param.seriesIndex != 'undefined') {
            mes += '  seriesIndex : ' + param.seriesIndex;
            mes += '  dataIndex : ' + param.dataIndex;
        }
        if (param.type == 'hover') {
            document.getElementById('hover-console').innerHTML = 'Event Console : ' + mes;
        }
        else {
            // document.getElementById('console').innerHTML = mes;
            console.log(mes);
            alert(mes);
        }
        console.log(param);
    },
    getDataFromRestCall: function (url_) {

        var req_ = new Request();
        req_.headers = {
            'Cache-Control': 'no-cache',
            'If-Modified-Since': '0',
            'Accept': 'application/json'
        };
        req_.method = 'GET';
        req_.mode = 'cors';
        req_.credentials = 'same-origin';

        var theUrl_ = window.location.protocol + '//' + window.location.host + url_;

        console.debug(req_);

        return fetch(
            theUrl_, req_)
            .then(processStatus)
            .then(parseJson)
            .then(function (response) {
                // massage data
                console.debug(response);
                // response.forEach(function(elem) {
                //     console.debug(elem);
                // })
                return response;
            })
            .catch(function (ex) {
                console.error(new Error("Request failed : " + ex));
            })
    },
    loadDataIntoGraph: function(chartTagName_, data_){

    },
    load_graph_panel: function (graph_) {
        var trade_type = document.getElementById('tradeContainer.trade.trade_type');
        var current_trade_type = (tradeType || trade_type.options[trade_type.options.selectedIndex].value);
        var loadUrl_ = './' + current_trade_type + '.html';

        //var e = new Error('dummy');
        //var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
        //    .replace(/^\s+at\s+/gm, '')
        //    .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
        //    .split('\n');
        //console.debug(stack);

        return new Promise(function (resolve, reject) {
            try {
                $('#trade').load(loadUrl_, function () {
                    if (current_trade_type === 'VNS')
                        vnsFormManager.getInstance().initTable();
                    if (current_trade_type === 'INF') {
                        $("#roll_convention_label").hide();
                        $("#roll_convention").hide();
                    }
                    else {
                        $("#roll_convention_label").show();
                        $("#roll_convention").show();
                    }

                    return resolve(tradeType);
                });
            }
            catch (e) {
                return reject(new Error(e));
            }
        });
    },
    populateBusinessDates: function (evt) {
        // TODO hook up eventHandler
        // if (isNullOrUndefined(evt))
        //     return;
        //
        // evt = evt || window.event;
        // var target = evt.target || evt.srcElement;

        try {
            // var sel = document.getElementById(target.id);
            var sel = document.getElementById('businessDates');
            // zero out the existing options
            sel.options.length = 0;

            var fragment = document.createDocumentFragment();
            var busDateList_ = chartManager.getDataFromRestCall('/api/businessdates/');
            return busDateList_.then(function (response) {
                response.forEach(function (dcc, index) {
                    var opt = document.createElement('option');
                    // opt.innerHTML = dcc;
                    opt.innerHTML = moment(dcc,'YYYYMMDD').format('DD-MMM-YYYY');
                    opt.value = dcc;
                    fragment.appendChild(opt);
                });
                sel.appendChild(fragment);
            }).catch(function (e) {
                return new Error(e);
            })
        } catch (e) {
            console.error(new Error(e));
        }
    },
    setNewBusDate: function(evt){
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;
        // console.debug(target);
        // set the hidden field
        selectedBusdate.value = target.value;
    }
}
