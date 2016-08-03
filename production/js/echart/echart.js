/**
 * Created by Rob on 28/10/2015.
 */
var barCharts = (function () {
    "use strict";
    var instance;

    function setCustomOptions(common, custom){
        var series_ = [{
            type: custom.seriesType,
            data : custom.yaxisValues,
            name : custom.seriesName
        }];
        var title_ = [{
            text: custom.title,
            subtext: custom.subTitleText
        }]

        common.series = series_;
        common.title = title_;
        common.legend.data = custom.yAxisLabels;
        common.data = custom.yAxisLabels;
    }

    var options = {
        tooltip:{
            trigger: 'axis'
        },
        legend: {
            x: 10000,
            data: null
        },
        toolbox: {
            show: true,
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

    var ce_chart = options;
    var npv_chart = options;
    var fca_chart = options;
    var eepe_chart = options;
    var npv2_chart = options;
    var fba_chart = options;

    var ce_chartData = {
        "titleText" : "CE",
        "subTitleText" : "01-MAR-2016",
        "seriesName" : "2016-03-01",
        "seriesType" : "bar",
        "yaxisLabels" : [ "CC", "CCC", "BB", "AA", "BBB" ],
        "yaxisValues" : [ 2.434153795E8, 2.031896731E8, 1.696079112E8, 5.808002756E7, 5.086273894E7 ]
    }
    var npv_chartData = {
        "titleText" : "NPV",
        "subTitleText" : "01-MAR-2016",
        "seriesName" : "2016-03-01",
        "seriesType" : "bar",
        "yaxisLabels" : ["CCC", "BB", "CC", "AA", "C"],
        "yaxisValues" : [1.835835138E8, 1.070428432E8, 1.970644777E7, 1.592368559E7, -1.281875696E7]
    }
    var fca_chartData = {
        "titleText" : "CE",
        "subTitleText" : "01-MAR-2016",
        "seriesName" : "2016-03-01",
        "seriesType" : "bar",
        "yaxisLabels" : [ "CC", "CCC", "BB", "AA", "BBB" ],
        "yaxisValues" : [ 2.434153795E8, 2.031896731E8, 1.696079112E8, 5.808002756E7, 5.086273894E7 ]
    }
    var fba_chartData = {
        "titleText" : "CE",
        "subTitleText" : "01-MAR-2016",
        "seriesName" : "2016-03-01",
        "seriesType" : "bar",
        "yaxisLabels" : [ "CC", "CCC", "BB", "AA", "BBB" ],
        "yaxisValues" : [ 2.434153795E8, 2.031896731E8, 1.696079112E8, 5.808002756E7, 5.086273894E7 ]
    }
    var eepe_chartData = {
        "titleText" : "CE",
        "subTitleText" : "01-MAR-2016",
        "seriesName" : "2016-03-01",
        "seriesType" : "bar",
        "yaxisLabels" : [ "CC", "CCC", "BB", "AA", "BBB" ],
        "yaxisValues" : [ 2.434153795E8, 2.031896731E8, 1.696079112E8, 5.808002756E7, 5.086273894E7 ]
    }
    var npv2_chartData = {
        "titleText" : "CE",
        "subTitleText" : "01-MAR-2016",
        "seriesName" : "2016-03-01",
        "seriesType" : "bar",
        "yaxisLabels" : [ "CC", "CCC", "BB", "AA", "BBB" ],
        "yaxisValues" : [ 2.434153795E8, 2.031896731E8, 1.696079112E8, 5.808002756E7, 5.086273894E7 ]
    }

    // var npv_chartData = {
    //     yAxisLabels: ["CCC", "BB", "CC", "AA", "C"],
    //     title: {
    //         text: 'NPV',
    //         subtext: '01-MAR-2016'
    //     },
    //     series: [{
    //         name: '2016-03-01',
    //         type: 'bar',
    //         data: [1.835835138E8, 1.070428432E8, 1.970644777E7, 1.592368559E7, -1.281875696E7]
    //     }]
    // }
    // var fca_chartData = {
    //     yAxisLabels: ["AAA", "NR", "CC", "B", "BBB"],
    //     title: {
    //         text: 'FCA',
    //         subtext: '01-MAR-2016'
    //     },
    //     series: [{
    //         name: '2016-03-01',
    //         type: 'bar',
    //         data: [1443943.9, 1421737.4, 1396364.0, 1376168.0, 1172954.6]
    //     }]
    // }
    // var fba_chartData = {
    //     yAxisLabels: ["B", "NR", "A", "AAA", "BB"],
    //     title: {
    //         text: 'FBA',
    //         subtext: '01-MAR-2016'
    //     },
    //     series: [{
    //         name: '2016-03-01',
    //         type: 'bar',
    //         data: [-17279.998, -40045.45, -48515.71269, -49429.49, -66222.23245]
    //     }]
    // }
    // var eepe_chartData = {
    //     yAxisLabels: ["CC", "CCC", "BB", "AA", "BBB"],
    //     title: {
    //         text: 'EEPE',
    //         subtext: '01-MAR-2016'
    //     },
    //     series: [{
    //         name: '2016-03-01',
    //         type: 'bar',
    //         data: [2.434153795E8, 2.031896731E8, 1.696079112E8, 5.808002756E7, 5.086273894E7]
    //     }]
    // }
    // var npv2_chartData = {
    //     yAxisLabels: ["CCC", "BB", "CC", "AA", "C"],
    //     title: {
    //         text: 'NPV2',
    //         subtext: '01-MAR-2016'
    //     },
    //     series: [{
    //         name: '2016-03-01',
    //         type: 'bar',
    //         data: [1.835835138E8, 1.070428432E8, 1.970644777E7, 1.592368559E7, -1.281875696E7]
    //     }]
    // }

    var echartBar = echarts.init(document.getElementById('echart_bar_ce'), theme);
    var echartBar2 = echarts.init(document.getElementById('echart_bar_npv'), theme);
    var echartBar3 = echarts.init(document.getElementById('echart_bar_fca'), theme);
    var echartBar4 = echarts.init(document.getElementById('echart_bar_eepe'), theme);
    var echartBar5 = echarts.init(document.getElementById('echart_bar_npv2'), theme);
    var echartBar6 = echarts.init(document.getElementById('echart_bar_fba'), theme);

    setCustomOptions(ce_chart, ce_chartData);
    echartBar.setOption(ce_chart);
    setCustomOptions(npv_chart, npv_chartData);
    echartBar2.setOption(npv_chart);
    setCustomOptions(fca_chart, fca_chartData);
    echartBar3.setOption(fca_chart);
    setCustomOptions(eepe_chart, eepe_chartData);
    echartBar4.setOption(eepe_chart);
    setCustomOptions(npv2_chart, npv2_chartData);
    echartBar5.setOption(npv2_chart);
    setCustomOptions(fba_chart, fba_chartData);
    echartBar6.setOption(fba_chart);

    // _AttachEvent(document.getElementById('echart_bar_ce'), "click", function () {
    //     eConsole;
    // });

    // attach clickevents to pick up drill down
// echartLine.on('click',eConsole);
// echartLine2.on('click',eConsole);
    echartBar.on('click',eConsole);
// echartBar2.on('click',eConsole);
// echartBar3.on('click',eConsole);
// echartBar4.on('click',eConsole);
// echartBar5.on('click',eConsole);
// echartBar6.on('click',eConsole);
// echartDonut.on('click',eConsole);
// echartDonut2.on('click',eConsole);
// echartDonut3.on('click',eConsole);



    function init() {
// expose a few methods and properties
        return {
            getCEChart : echartBar,
            getNPVChart : echartBar2,
            getFCAChart: echartBar3,
            getEEPEChart: echartBar4,
            getNPV2Chart: echartBar5,
            getFBAChart: echartBar6
        };

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

    }
})
();


var lineCharts = (function(){

    'use strict';
    var instance;

    var echartLine = echarts.init(document.getElementById('echart_line_total_exposure'), theme);
    echartLine.setOption({
        title: {
            text: 'Total Exposure',
            subtext: 'Subtitle'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            x: 140,
            y: 40,
            data: ['NPV', 'CE', 'EEPE', 'Total Exp']
        },
        toolbox: {
            show: true,
            feature: {
                dataView: {show:true, title : 'view data',  lang: ['Data','ok','refresh']
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
            data: ['Week1', 'Week2', 'Week3', 'Week4']
        }],
        yAxis: [{
            type: 'value'
        }],
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
            data: [-668637914.7, -668637914.7/2, -668637714.7/2.5, -668637614.7/3]
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
            data: [763327844.8, 763327844.8/2, 763327844.8/2.5, 763327844.8/3]
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
            data: [763327844.8, 763327844.8/2, 763327844.8/2.5, 763327844.8/3]
        },{
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
            data: [763327844.8*2, 763327844.8*2/1.2, 763327844.8*2/1.3, 763327844.8*2/1.4]
        }
        ]
    });

    var echartLine2 = echarts.init(document.getElementById('echart_line2'), theme);
    echartLine2.setOption({
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
            data: ['EPE', 'PFE']
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
        calculable: true,
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            data: [ '3/1/2016', '6/1/2016', '9/1/2016', '12/1/2016', '3/1/2017',
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
                '12/1/2045', '3/1/2046' ]
        }],
        yAxis: [{
            type: 'value'
        }],
        series: [{
            name: 'EPE',
            type: 'line',
            smooth: true,
            // clickable: true,
            itemStyle: {
                normal: {
                    areaStyle: {
                        type: 'default'
                    }
                }
            },
            data: [ '0', '0', '1900', '28100', '29900', '95200', '108000', '331000',
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
                '1780000' ]

        }, {
            name: 'PFE',
            type: 'line',
            smooth: true,
            itemStyle: {
                normal: {
                    areaStyle: {
                        type: 'default'
                    }
                }
            },
            data: [ '-160000000', '-23400000', '-22900000', '-21300000', '-21600000',
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
                '6700000', '6400000', '6070000', '6040000', '5800000' ]
        }]
    });


    function init() {
// expose a few methods and properties
        return {
            getTotalExposure : echartLine,
            getProjection : echartLine2
        };

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

    }


})();

var donutCharts = (function(){

    'use strict';
    var instance;

    var echartDonut = echarts.init(document.getElementById('echart_donut'), theme);
    echartDonut.setOption({
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        calculable: true,
        legend: {
            show: false,
            x: 'center',
            y: 'bottom',
            data: ['AAA', 'AA', 'A', 'BBB', 'BB','B','CCC','CC','C','NR']
        },
        toolbox: {
            show: true,
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
            name: 'CVA Risk measure by credit rating',
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
            data: [{
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
            },{
                value: 128340.57,
                name: 'B'
            },{
                value:583971.5645,
                name: 'CCC'
            },{
                value: 908487,
                name: 'CC'
            },{
                value: 441333.439,
                name: 'C'
            },{
                value: 309688.8,
                name: 'NR'
            }]
        }]
    });

    var echartDonut2 = echarts.init(document.getElementById('echart_donut2'), theme);
    echartDonut2.setOption({
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        calculable: true,
        legend: {
            show: false,
            x: 'center',
            y: 'bottom',
            data: ['AAA', 'AA', 'A', 'BBB', 'BB','B','CCC','CC','C','NR']
        },
        toolbox: {
            show: true,
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
            name: 'FVA Risk measure by credit rating',
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
            data: [{
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
            },{
                value: 128340.57,
                name: 'B'
            },{
                value:583971.5645,
                name: 'CCC'
            },{
                value: 908487,
                name: 'CC'
            },{
                value: 441333.439,
                name: 'C'
            },{
                value: 309688.8,
                name: 'NR'
            }]
        }]
    });

    var echartDonut3 = echarts.init(document.getElementById('echart_donut3'), theme);
    echartDonut3.setOption({
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        calculable: true,
        legend: {
            show: false,
            x: 'center',
            y: 'bottom',
            data: ['AAA', 'AA', 'A', 'BBB', 'BB','B','CCC','CC','C','NR']
        },
        toolbox: {
            show: true,
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
            name: 'ColVA Risk measure by credit rating',
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
            data: [{
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
            },{
                value: 128340.57,
                name: 'B'
            },{
                value:583971.5645,
                name: 'CCC'
            },{
                value: 908487,
                name: 'CC'
            },{
                value: 441333.439,
                name: 'C'
            },{
                value: 309688.8,
                name: 'NR'
            }]
        }]
    });

    var echartGauge = echarts.init(document.getElementById('echart_guage'), theme);
    echartGauge.setOption({
        tooltip: {
            formatter: "{a} <br/>{b} : {c}%"
        },
        toolbox: {
            show: true,
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
                formatter: function(v) {
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
                value: 43,
                name: 'Risk Performance\n(VaR vs worst 10 days in 2008)'
            }]
        }]
    });


    function init() {
// expose a few methods and properties
        return {
            getCVA : echartDonut,
            getFVA : echartDonut2,
            getColVA : echartDonut3,
            getGuage : echartGauge
        };

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

    }


})();

function eConsole(param) {
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
}

/**
 * Used to attach events to an element or object in a browser independent way
 * @param element
 * @param event
 * @param callbackFunction
 */
function _AttachEvent(element, type, handler) {
    if (element.addEventListener) element.addEventListener(type, handler, false);
    else element.attachEvent("on" + type, handler);
}
