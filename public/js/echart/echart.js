$(window).load(function () {
    console.log('[INFO] ORE Dashboard.init');
    chartManager.populateBusinessDates();
    chartManager.initAllCharts();
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

        function initialiseAllCharts() {
            chartManager.initChart('bar_1', options, getBar1Data('Total'), setNewData);
            chartManager.initChart('bar_2', options, getBar2Data('Total'), setNewData);
            chartManager.initChart('bar_3', options, getBar3Data('Total'), setNewData);
            chartManager.initChart('bar_4', options, getBar4Data('Total'), setNewData);
            chartManager.initChart('bar_5', options, getBar5Data('Total'), setNewData);
            chartManager.initChart('bar_6', options, getBar6Data('Total'), setNewData);
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

        var total_exposure_options = {

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
                boundaryGap: true,
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
            if (chart_.getOption().title[0].text == 'Exposure Profile'){
                // yuk
                var xAxisData_ = data_.dates;
                var series_0 = {
                    name: "EPE",
                    data: data_.epes
                }
                var series_1 = {
                    name: "PFE",
                    data: data_.pfes
                }
                var series_ = []
                series_.push(series_0);
                series_.push((series_1));

                series_.forEach(function (elem) {
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
                // chart_.setOption({
                //     legend: [{data: data_.name}],
                //     xAxis: [{data: xAxisData_}],
                //     series: series_
                // });
                var localOptions_ = exposure_profile_options;
                localOptions_.legend.data = data_.name;
                localOptions_.xAxis[0].data = xAxisData_;
                localOptions_.series = series_;
                chart_.setOption(localOptions_, true);

            } else {
                // yuk
                var xAxisData_ = data_.dates;

                var series_0 = {
                    name: "NPV",
                    data: data_.npvs
                }
                var series_1 = {
                    name: "CE",
                    data: data_.ces
                }
                var series_2 = {
                    name: "EEPE",
                    data: data_.eepes
                }
                var series_3 = {
                    name: "Total",
                    data: data_.tes
                }
                var series_ = []
                series_.push(series_0);
                series_.push((series_1));
                series_.push((series_2));
                series_.push((series_3));

                series_.forEach(function (elem) {
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

                // chart_.setOption({
                //     legend: [{data: data_.name}],
                //     xAxis: [{data: xAxisData_}],
                //     series: series_
                // });
                var localOptions_ = total_exposure_options;
                localOptions_.legend.data = data_.name;
                localOptions_.xAxis[0].data = xAxisData_;
                localOptions_.series = series_;
                chart_.setOption(localOptions_, true);
            }
        }

        function initialiseAllCharts() {
            chartManager.initChart('line_total_exposure', total_exposure_options, getTotalExposureData('Total'), setNewData);
            chartManager.initChart('line_exposure_profile', exposure_profile_options, getExposureProfileData('Total'), setNewData);
        }

        function loadData(chart_, data_) {
            setNewData(chart_, data_);
        }

        // expose a few methods and properties
        return {
            // getTotalExposure: line_total_exposure,
            // getProjection: line_exposure_profile,
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
            chartManager.initChart('donut_cva', options, getCVAData('Total'), setNewData);
            chartManager.initChart('donut_fva', options, getFVAData('Total'), setNewData);
            chartManager.initChart('donut_colva', options, getColVAData('Total'), setNewData);
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
        theChart_.on('click', this.eConsole);
        // once data is resolved, render it
        Promise.resolve(data_).then(function(res){
        fnLoadData_(theChart_, res);
        });
    },
    getChartInstanceFromDivId: function (chartTagName_) {
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

        var req_ = new Request({
                headers: {
                    'Cache-Control': 'no-cache',
                    'If-Modified-Since': '0',
                    'Accept': 'application/json'
                }
            }
        );
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
                console.debug(response);
                // response.forEach(function(elem) {
                //     console.debug(elem);
                // })
                return response;
            })
            .catch(function (ex) {
                console.error(new Error("Request failed : " + ex));
                return {};
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
    populateBusinessDates: function () {
        try {
            var sel = document.getElementById('businessDates');
            // zero out the existing options
            sel.options.length = 0;

            var fragment = document.createDocumentFragment();
            return chartManager.getDataFromRestCall('/api/dates/')
                .then(function (response) {
                    response.forEach(function (dcc, index) {
                        var opt = document.createElement('option');
                        // nice format for the user to see
                        opt.innerHTML = moment(dcc, 'YYYYMMDD').format('DD-MMM-YYYY');
                        // nice format for the computer to see
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
        // set the hidden field
        selectedBusdate.value = target.value;
        refreshGraphsOnDateChange();
    },
    setNewCounterparty: function(evt){
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;
        // set the hidden field
        selectedCounterparty.value = target.value;
    }

}

function getTotalExposureData(key_){
    level_ = key_;
    var key__ = '/api/totalexposure-tree/total/' + level_ + '/';
    // returns a promise (future)
    return chartManager.getDataFromRestCall(key__);
}

function getExposureProfileData(key_){
    level_ = key_;
    var busDate_ = selectedBusdate.value;
    var key__ = '/api/exposure-tree/' + busDate_ +'/total/' + level_ + '/';
    // returns a promise (future)
    return chartManager.getDataFromRestCall(key__);
}

function getBar1Data(key_){
    level_ = key_;
    var busDate_ = selectedBusdate.value;
    var key__ = '/api/bargraph-tree/' + busDate_ +'/total/' + level_ + '/ce/';
    // returns a promise (future)
    return chartManager.getDataFromRestCall(key__);
}

function getBar2Data(key_){
    level_ = key_;
    var busDate_ = selectedBusdate.value;
    var key__ = '/api/bargraph-tree/' + busDate_ +'/total/' + level_ + '/npv/';
    // returns a promise (future)
    return chartManager.getDataFromRestCall(key__);
}

function getBar3Data(key_){
    level_ = key_;
    var busDate_ = selectedBusdate.value;
    var key__ = '/api/bargraph-tree/' + busDate_ +'/total/' + level_ + '/fca/';

    // returns a promise (future)
    return chartManager.getDataFromRestCall(key__);
}

function getBar4Data(key_){
    level_ = key_;
    var busDate_ = selectedBusdate.value;
    var key__ = '/api/bargraph-tree/' + busDate_ +'/total/' + level_ + '/fba/';
    // returns a promise (future)
    return chartManager.getDataFromRestCall(key__);

}


function getBar5Data(key_){
    level_ = key_;
    var busDate_ = selectedBusdate.value;
    var key__ = '/api/bargraph-tree/' + busDate_ +'/total/' + level_ + '/eepe/';

    // returns a promise (future)
    return chartManager.getDataFromRestCall(key__);


}
function getBar6Data(key_){
    level_ = key_;
    var busDate_ = selectedBusdate.value;
    var key__ = '/api/bargraph-tree/' + busDate_ +'/total/' + level_ + '/cva/';
    // returns a promise (future)
    return chartManager.getDataFromRestCall(key__);
}

function flipChart(chartId_, chartType_){
    var chart_ = chartManager.getChartInstanceFromDivId(chartId_);
    var data_ = chartManager.getDataFromRestCall(chartType_);
    chart_.setNewData(chart_, data_);

}


function getCVAData(key_){
    level_ = key_;
    var busDate_ = selectedBusdate.value;
    var key__ = '/api/xva-tree/' + busDate_ +'/total/' + level_ + '/cva/';
    // returns a promise (future)
    return chartManager.getDataFromRestCall(key__);
}
function getFVAData(key_){
    level_ = key_;
    var busDate_ = selectedBusdate.value;
    var key__ = '/api/xva-tree/' + busDate_ +'/total/' + level_ + '/fva/';
    // returns a promise (future)
    return chartManager.getDataFromRestCall(key__);
}
function getColVAData(key_){
    level_ = key_;
    var busDate_ = selectedBusdate.value;
    var key__ = '/api/xva-tree/' + busDate_ +'/total/' + level_ + '/colva/';
    // returns a promise (future)
    return chartManager.getDataFromRestCall(key__);
}

function refreshGraphsOnDateChange(){
    var __level__ = selectedHierarchy.value;

    chartManager.initChart('bar_1', BARCharts.getInstance().getDefaults, getBar1Data(__level__), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_2', BARCharts.getInstance().getDefaults, getBar2Data(__level__), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_3', BARCharts.getInstance().getDefaults, getBar3Data(__level__), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_4', BARCharts.getInstance().getDefaults, getBar4Data(__level__), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_5', BARCharts.getInstance().getDefaults, getBar5Data(__level__), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_6', BARCharts.getInstance().getDefaults, getBar6Data(__level__), BARCharts.getInstance().setNewData);
    chartManager.initChart('donut_cva', DONUTCharts.getInstance().getDefaults, getCVAData(__level__), DONUTCharts.getInstance().setNewData);
    chartManager.initChart('donut_fva', DONUTCharts.getInstance().getDefaults, getFVAData(__level__), DONUTCharts.getInstance().setNewData);
    chartManager.initChart('donut_colva', DONUTCharts.getInstance().getDefaults, getColVAData(__level__), DONUTCharts.getInstance().setNewData);

    chartManager.initChart('line_exposure_profile', LINECharts.getInstance().getDefaultExposureOpts, getExposureProfileData(__level__), LINECharts.getInstance().setNewData);
    chartManager.initChart('line_total_exposure', LINECharts.getInstance().getDefaultTotalOptions, getTotalExposureData(__level__), LINECharts.getInstance().setNewData);
}

function getTreeAsMenu() {
    var fragment = document.createDocumentFragment();
    var elements = {};
    var busDateList_ = chartManager.getDataFromRestCall('/api/tree2/');
    busDateList_.then(function (res) {
        res.forEach(function (elem) {
                var cur = elements;
                elem.split("/").slice(1).forEach(function (elem_) {
                    cur[elem_] = cur[elem_] || {};
                    cur = cur[elem_];
                });
            }
        )
    });

}
