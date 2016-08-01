var theme = {
    color: [
        '#26B99A', '#34495E', '#BDC3C7', '#3498DB',
        '#9B59B6', '#8abb6f', '#759c6a', '#bfd3b7'
    ],

    title: {
        itemGap: 8,
        textStyle: {
            fontWeight: 'normal',
            color: '#408829'
        }
    },

    dataRange: {
        color: ['#1f610a', '#97b58d']
    },

    toolbox: {
        color: ['#408829', '#408829', '#408829', '#408829']
    },

    tooltip: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        axisPointer: {
            type: 'line',
            lineStyle: {
                color: '#408829',
                type: 'dashed'
            },
            crossStyle: {
                color: '#408829'
            },
            shadowStyle: {
                color: 'rgba(200,200,200,0.3)'
            }
        }
    },

    dataZoom: {
        dataBackgroundColor: '#eee',
        fillerColor: 'rgba(64,136,41,0.2)',
        handleColor: '#408829'
    },
    grid: {
        borderWidth: 0
    },

    categoryAxis: {
        axisLine: {
            lineStyle: {
                color: '#408829'
            }
        },
        splitLine: {
            lineStyle: {
                color: ['#eee']
            }
        }
    },

    valueAxis: {
        axisLine: {
            lineStyle: {
                color: '#408829'
            }
        },
        splitArea: {
            show: true,
            areaStyle: {
                color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.1)']
            }
        },
        splitLine: {
            lineStyle: {
                color: ['#eee']
            }
        }
    },
    timeline: {
        lineStyle: {
            color: '#408829'
        },
        controlStyle: {
            normal: {color: '#408829'},
            emphasis: {color: '#408829'}
        }
    },

    k: {
        itemStyle: {
            normal: {
                color: '#68a54a',
                color0: '#a9cba2',
                lineStyle: {
                    width: 1,
                    color: '#408829',
                    color0: '#86b379'
                }
            }
        }
    },
    map: {
        itemStyle: {
            normal: {
                areaStyle: {
                    color: '#ddd'
                },
                label: {
                    textStyle: {
                        color: '#c12e34'
                    }
                }
            },
            emphasis: {
                areaStyle: {
                    color: '#99d2dd'
                },
                label: {
                    textStyle: {
                        color: '#c12e34'
                    }
                }
            }
        }
    },
    force: {
        itemStyle: {
            normal: {
                linkStyle: {
                    strokeColor: '#408829'
                }
            }
        }
    },
    chord: {
        padding: 4,
        itemStyle: {
            normal: {
                lineStyle: {
                    width: 1,
                    color: 'rgba(128, 128, 128, 0.5)'
                },
                chordStyle: {
                    lineStyle: {
                        width: 1,
                        color: 'rgba(128, 128, 128, 0.5)'
                    }
                }
            },
            emphasis: {
                lineStyle: {
                    width: 1,
                    color: 'rgba(128, 128, 128, 0.5)'
                },
                chordStyle: {
                    lineStyle: {
                        width: 1,
                        color: 'rgba(128, 128, 128, 0.5)'
                    }
                }
            }
        }
    },
    gauge: {
        startAngle: 225,
        endAngle: -45,
        axisLine: {
            show: true,
            lineStyle: {
                color: [[0.2, '#86b379'], [0.8, '#68a54a'], [1, '#408829']],
                width: 8
            }
        },
        axisTick: {
            splitNumber: 10,
            length: 12,
            lineStyle: {
                color: 'auto'
            }
        },
        axisLabel: {
            textStyle: {
                color: 'auto'
            }
        },
        splitLine: {
            length: 18,
            lineStyle: {
                color: 'auto'
            }
        },
        pointer: {
            length: '90%',
            color: 'auto'
        },
        title: {
            textStyle: {
                color: '#333'
            }
        },
        detail: {
            textStyle: {
                color: 'auto'
            }
        }
    },
    textStyle: {
        fontFamily: 'Arial, Verdana, sans-serif'
    }
};

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

var echartBar = echarts.init(document.getElementById('echart_bar_ce'), theme);
echartBar.setOption({
    title: {
        text: 'CE',
        subtext: '01-MAR-2016'
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        x: 100,
        data: [ "CC", "CCC", "BB", "AA", "BBB"]
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
    clickable : true,
    xAxis: [{
        type: 'value',
        boundaryGap: [0, 0.01]
    }],
    yAxis: [{
        type: 'category',
        data: ["CC", "CCC", "BB", "AA", "BBB"]
    }],
    series: [{
        name: '2016-03-01',
        type: 'bar',
        data: [2.434153795E8, 2.031896731E8, 1.696079112E8, 5.808002756E7, 5.086273894E7]
    }]
});
var echartBar2 = echarts.init(document.getElementById('echart_bar_npv'), theme);
echartBar2.setOption({
    title: {
        text: 'NPV',
        subtext: '01-MAR-2016'
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        x: 100,
        data : [ "CCC", "BB", "CC", "AA", "C" ]
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
    xAxis: [{
        type: 'value',
        boundaryGap: [0, 0.01]
    }],
    yAxis: [{
        type: 'category',
        data : [ "CCC", "BB", "CC", "AA", "C" ]
    }],
    series: [{
        name: '2016-03-01',
        type: 'bar',
        data : [ 1.835835138E8, 1.070428432E8, 1.970644777E7, 1.592368559E7, -1.281875696E7 ]
    }]
});
var echartBar3 = echarts.init(document.getElementById('echart_bar_fca'), theme);
echartBar3.setOption({
    title: {
        text: 'FCA',
        subtext: '01-MAR-2016'
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        x: 100,
        data: ["AAA", "NR", "CC", "B", "BBB"]
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
    xAxis: [{
        type: 'value',
        boundaryGap: [0, 0.01]
    }],
    yAxis: [{
        type: 'category',
        data: ["AAA", "NR", "CC", "B", "BBB"]
    }],
    series: [{
        name: '2016-03-01',
        type: 'bar',
        data : [ 1443943.9, 1421737.4, 1396364.0, 1376168.0, 1172954.6 ]
    }]
});
var echartBar4 = echarts.init(document.getElementById('echart_bar_eepe'), theme);
echartBar4.setOption({
    title: {
        text: 'EEPE',
        subtext: '01-MAR-2016'
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        x: 100,
        data: [ "CC", "CCC", "BB", "AA", "BBB" ]
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
    xAxis: [{
        type: 'value',
        boundaryGap: [0, 0.01]
    }],
    yAxis: [{
        type: 'category',
        data: [ "CC", "CCC", "BB", "AA", "BBB" ]
    }],
    series: [{
        name: '2016-03-01',
        type: 'bar',
        data: [ 2.434153795E8, 2.031896731E8, 1.696079112E8, 5.808002756E7, 5.086273894E7 ]
    }]
});
var echartBar5 = echarts.init(document.getElementById('echart_bar_npv2'), theme);
echartBar5.setOption({
    title: {
        text: 'NPV',
        subtext: '01-MAR-2016'
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        x: 100,
        data : [ "CCC", "BB", "CC", "AA", "C" ]
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
    xAxis: [{
        type: 'value',
        boundaryGap: [0, 0.01]
    }],
    yAxis: [{
        type: 'category',
        data : [ "CCC", "BB", "CC", "AA", "C" ]
    }],
    series: [{
        name: '2016-03-01',
        type: 'bar',
        data : [ 1.835835138E8, 1.070428432E8, 1.970644777E7, 1.592368559E7, -1.281875696E7 ]
    }]
});
var echartBar6 = echarts.init(document.getElementById('echart_bar_fba'), theme);
echartBar6.setOption({
    title: {
        text: 'FBA',
        subtext: '01-MAR-2016'
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        x: 100,
        data: [ "B", "NR", "A", "AAA", "BB" ]
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
    xAxis: [{
        type: 'value',
        boundaryGap: [0, 0.01]
    }],
    yAxis: [{
        type: 'category',
        data: [ "B", "NR", "A", "AAA", "BB" ]
    }],
    series: [{
        name: '2016-03-01',
        type: 'bar',
        data: [ -17279.998, -40045.45, -48515.71269, -49429.49, -66222.23245 ]
    }]
});

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

// attach clickevents to pick up drill down
echartLine.on('click',eConsole);
echartLine2.on('click',eConsole);
echartBar.on('click',eConsole);
echartBar2.on('click',eConsole);
echartBar3.on('click',eConsole);
echartBar4.on('click',eConsole);
echartBar5.on('click',eConsole);
echartBar6.on('click',eConsole);
echartDonut.on('click',eConsole);
echartDonut2.on('click',eConsole);
echartDonut3.on('click',eConsole);
