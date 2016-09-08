/*
 *  Copyright (C) 2016 Quaternion Risk Management Ltd
 *  All rights reserved
 *
 */

var BARCharts = (function () {
    "use strict";
    var instance;

    function init() {

        function setNewData(chart_, data_) {
            var localOptions_ = options;

            localOptions_.series = [{
                    type: data_.seriesType,
                    data: data_.yaxisValues,
                    name: data_.seriesName
                }];
            localOptions_.title = [{text: data_.title, subtext: data_.subTitleText}];
            localOptions_.legend.data = data_.yaxisLabels;
            localOptions_.yAxis[0].data = data_.yaxisLabels;

            chart_.setOption(localOptions_, true);
        }

        var options = {
            tooltip: {
                trigger: 'axis',
                formatter: barChartTooltipFormatter
            },
            legend: {
                // x: 10000,
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
                boundaryGap: false,
                axisLabel:{interval: 'auto', formatter: function(value){
                    return numeral(value).format('(0a)');
                }},

            }],
            yAxis: [{
                type: 'category',
                boundaryGap: true,
                axisLabel: {
                    interval: 'auto'
                    // , formatter: function (value) {
                    //     return value;
                    // }
                },
                data: []
            }],
            series: null
        };

        function initialiseAllCharts() {
            // set the initial entry point to 'Total' level
            var args = {
                date: chartManager.getBusinessDate(),
                hierarchy: chartManager.getHierarchy(),
                item: 'Total',
                level: chartManager.getDrillDownLevel()[0].level
            };

            barGraphs.forEach(function(elem){
                var p_ = chartManager.getGraphData(args, elem.metric,'bargraph');
                chartManager.initChart(elem.id, options, p_, setNewData);

                p_.then(function(res){
                    // lookup the category in the chartCategories array
                    var cat_ = filter(chartCategory, function(e){return e.metric == elem.metric;});
                    document.getElementById(elem.id).parentNode.parentNode.getElementsByTagName('h2')[0].innerText = cat_[0].category;
                });

            });


        }

        function loadData(chart_, data_) {
            setNewData(chart_, data_);
        }

// expose a few methods and properties
        return {
            initAllCharts: initialiseAllCharts,
            setNewData: setNewData,
            loadData: loadData,
            getDefaults: options
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
        var baseccy_ = chartManager.getBaseCcy();

        var total_exposure_options = {

            title: {
                text: 'Total Exposure  ' + baseccy_,
                subtext: 'Historical Credit Exposure Trends: NPV, CE, EEPE'
            },
            tooltip: {
                trigger: 'axis',
                // formatter: lineChartTooltipFormatter
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
            dataZoom: {
                show: true,
                realtime: true,
                start: 0,
                end: 100
            },
            calculable: true,
            xAxis: [{
                type: 'time',
                axisLabel:{interval: 'auto', formatter: function(value){
                    return moment(value).format('DD-MM-YYYY');
                }},

                // boundaryGap: false,
                data: []
            }],
            yAxis: [{
                type: 'value',
                axisLabel:{interval: 'auto', formatter: function(value){
                    return numeral(value).format('(0.0a)');
                }},
            }],
            series: []
        };
        var profile_marklines = {};
            // data: [
            //     Vertical axis, default
            //     {type: 'max', name: 'max', itemStyle: {normal: {color: '#dc143c'}}},
            //     {type: 'min', name: 'min', itemStyle: {normal: {color: '#dc143c'}}},
            //     {type: 'average', name: 'avg', itemStyle: {normal: {color: '#dc143c'}}},
            //     Horizontal axis
            //     {type: 'max', name: 'max', valueIndex: 0, itemStyle: {normal: {color: '#1e90ff'}}},
            //     {type: 'min', name: 'min', valueIndex: 0, itemStyle: {normal: {color: '#1e90ff'}}},
            //     {type: 'average', name: 'avg', valueIndex: 0, itemStyle: {normal: {color: '#1e90ff'}}}
            // ]};

        var exposure_profile_options = {
            title: {
                text: 'Exposure Profile  '  + baseccy_,
                subtext: 'Simulated EPE, ENE & PFE'
            },
            tooltip: {
                trigger: 'axis',
                // formatter: lineChartTooltipFormatter
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
                type: 'time',
                boundaryGap: true,
                axisLabel:{interval: 'auto', formatter: function(value){
                    return moment(value).format('DD-MM-YYYY');
                }},
                data: []
            }],
            yAxis: [{
                type: 'value',
                axisLabel:{interval: 'auto', formatter: function(value){
                    return numeral(value).format('(0a)');
                }},

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
            if (chart_.getOption().title[0].text.startsWith('Exposure')){
                // yuk
                var xAxisData_ = data_.dates;

                var data_epes = [];
                var data_pfes = [];
                var data_enes = [];

                // merge in the dates with the data for x axis labels
                for (var j = 0;j< xAxisData_.length;j++){
                    xAxisData_[j] = moment(xAxisData_[j], 'YYYYMMDD').toDate();
                    data_epes.push([xAxisData_[j], data_.epes[j]]);
                    data_pfes.push([xAxisData_[j], data_.pfes[j]]);
                    data_enes.push([xAxisData_[j], data_.enes[j]]);
                }

                var series_0 = {
                    name: "EPE",
                    data: data_epes
                }
                var series_1 = {
                    name: "PFE",
                    data: data_pfes
                }
                var series_2 = {
                    name: "ENE",
                    data: data_enes
                }
                var series_ = [];
                series_.push(series_0);
                series_.push((series_1));
                series_.push((series_2));

                series_.forEach(function (elem) {
                    // only add marklines for exposure profile graph
                    // if (chart_.getOption().title[0].text == 'Exposure Profile')
                    //     elem.markLine = profile_marklines;
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
                var localOptions_ = exposure_profile_options;
                localOptions_.legend.data = data_.name;
                // localOptions_.xAxis[0].data = xAxisData_;
                localOptions_.series = series_;
                chart_.setOption(localOptions_, true);

            } else {
                var xAxisData_ = data_.dates;


                var data_npvs = [];
                var data_ces = [];
                var data_eepes = [];
                var data_tes = [];

                // merge in the dates with the data for x axis labels
                for (var j = 0;j< xAxisData_.length;j++){
                    xAxisData_[j] = moment(xAxisData_[j], 'YYYYMMDD').toDate();
                    data_npvs.push([xAxisData_[j], data_.npvs[j]]);
                    data_ces.push([xAxisData_[j], data_.ces[j]]);
                    data_eepes.push([xAxisData_[j], data_.eepes[j]]);
                    data_tes.push([xAxisData_[j], data_.tes[j]]);
                }

                var series_0 = {
                    name: "NPV",
                    data: data_npvs
                }
                var series_1 = {
                    name: "CE",
                    data: data_ces
                }
                var series_2 = {
                    name: "EEPE",
                    data: data_eepes
                }
                var series_3 = {
                    name: "Total",
                    data: data_tes
                }

                var series_ = []
                // series_.push({name: 'dates', data: xAxisData_});
                series_.push(series_0);
                series_.push((series_1));
                series_.push((series_2));
                series_.push((series_3));

                series_.forEach(function (elem) {
                    // only add marklines for exposure profile graph
                    // if (chart_.getOption().title[0].text == 'Exposure Profile')
                    //     elem.markLine = profile_marklines;
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

                var localOptions_ = total_exposure_options;
                localOptions_.legend.data = data_.name;
                // localOptions_.xAxis[0].data = xAxisData_;
                localOptions_.series = series_;
                chart_.setOption(localOptions_, true);
            }
        }

        function initialiseAllCharts() {
            StackTrace.get().then(StackTraceCallback).catch(StackTraceErrback);
            var args = {
                date: chartManager.getBusinessDate(),
                hierarchy: 'total',
                item: 'Total',
                level: chartManager.getDrillDownLevel()[0].level
            };
            var totexp_ = chartManager.getGraphData(args, '', 'totalexposure');
            var exp_ = chartManager.getGraphData(args, '', 'exposure');

            return Promise.all([totexp_, exp_]).then(function (values) {
                chartManager.initChart('line_total_exposure', total_exposure_options, totexp_, setNewData);
                chartManager.initChart('line_exposure_profile', exposure_profile_options, exp_, setNewData);
                return 'done';
            }).catch(function(error){
                console.error(new Error(error));
            })

        }

        function loadData(chart_, data_) {
            setNewData(chart_, data_);
        }

        // expose a few methods and properties
        return {
            initAllCharts: initialiseAllCharts,
            setNewData: setNewData,
            loadData: loadData,
            getDefaultExposureOpts : exposure_profile_options,
            getDefaultTotalOptions: total_exposure_options
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
                // formatter: "{a} <br/>{b} : {c} ({d}%)"
                formatter: donutChartTooltipFormatter
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

        function setNewData(chart_, data_) {
            chart_.setOption({
                series: [{
                    data: data_.data,
                    name: data_.name
                }],
                legend: {data: data_.labels}
            });
        }

        function initialiseAllCharts() {
            var args = {
                date: chartManager.getBusinessDate(),
                hierarchy: chartManager.getHierarchy(),
                item: 'Total',
                level: chartManager.getDrillDownLevel()[0].level
            };

            xvaGraphs.forEach(function(elem){
                var p_ = chartManager.getGraphData(args, elem.metric,'xva');
                chartManager.initChart(elem.name, options, p_, setNewData);
                p_.then(function(res){
                    var titleText_ = elem.text + " : " + chartManager.getBaseCcy() + ' ' + numeral(chartManager.getSumOfArrayValues(res.data)).format('(0.00a)');
                    document.getElementsByName(elem.name)[0].innerText = titleText_;
                    // document.getElementsByName(elem.name)[0].innerText = elem.text + ' : '+ numeral(chartManager.getSumOfArrayValues(res.data)).format('(0.00a)');
                });

            });
        }

        function loadData(chart_, data_) {
            setNewData(chart_, data_);
        }

// expose a few methods and properties
        return {
            initAllCharts: initialiseAllCharts,
            setNewData: setNewData,
            loadData: loadData,
            getDefaults: options
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
            loadData: loadData,
            getDefaults: options
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
