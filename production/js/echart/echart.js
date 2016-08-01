/**
 * Created by Rob on 28/10/2015.
 */
var barCharts = (function () {
    "use strict";
    var instance;

    function setCustomOptions(common, custom){
        common.series = custom.series;
        common.title = custom.title;
        common.data = custom.yAxisLabels;
        common.legend.data = custom.yAxisLabels;
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
        yAxisLabels: ["CC", "CCC", "BB", "AA", "BBB"],
        title: {
            text: 'CE',
            subtext: '01-MAR-2016'
        },
        series: [{
            name: '2016-03-01',
            type: 'bar',
            data: [2.434153795E8, 2.031896731E8, 1.696079112E8, 5.808002756E7, 5.086273894E7]
        }]
    }
    var npv_chartData = {
        yAxisLabels: ["CCC", "BB", "CC", "AA", "C"],
        title: {
            text: 'NPV',
            subtext: '01-MAR-2016'
        },
        series: [{
            name: '2016-03-01',
            type: 'bar',
            data: [1.835835138E8, 1.070428432E8, 1.970644777E7, 1.592368559E7, -1.281875696E7]
        }]
    }
    var fca_chartData = {
        yAxisLabels: ["AAA", "NR", "CC", "B", "BBB"],
        title: {
            text: 'FCA',
            subtext: '01-MAR-2016'
        },
        series: [{
            name: '2016-03-01',
            type: 'bar',
            data: [1443943.9, 1421737.4, 1396364.0, 1376168.0, 1172954.6]
        }]
    }
    var fba_chartData = {
        yAxisLabels: ["B", "NR", "A", "AAA", "BB"],
        title: {
            text: 'FBA',
            subtext: '01-MAR-2016'
        },
        series: [{
            name: '2016-03-01',
            type: 'bar',
            data: [-17279.998, -40045.45, -48515.71269, -49429.49, -66222.23245]
        }]
    }
    var eepe_chartData = {
        yAxisLabels: ["CC", "CCC", "BB", "AA", "BBB"],
        title: {
            text: 'EEPE',
            subtext: '01-MAR-2016'
        },
        series: [{
            name: '2016-03-01',
            type: 'bar',
            data: [2.434153795E8, 2.031896731E8, 1.696079112E8, 5.808002756E7, 5.086273894E7]
        }]
    }
    var npv2_chartData = {
        yAxisLabels: ["CCC", "BB", "CC", "AA", "C"],
        title: {
            text: 'NPV2',
            subtext: '01-MAR-2016'
        },
        series: [{
            name: '2016-03-01',
            type: 'bar',
            data: [1.835835138E8, 1.070428432E8, 1.970644777E7, 1.592368559E7, -1.281875696E7]
        }]
    }

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
            data: ['Week1', 'Week2', 'Week3', 'Week4']
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
            data: [54, 260, 830, 710]
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
            data: [791, 390, 30, 10]
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
                        [0.2, 'lightgreen'],
                        [0.4, 'orange'],
                        [0.8, 'skyblue'],
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
