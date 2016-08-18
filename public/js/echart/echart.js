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
                trigger: 'axis',
                formatter: null
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
                    return numeral(value).format('(0.00a)');
                }},

            }],
            yAxis: [{
                type: 'category',
                boundaryGap: true,
                axisLabel:{interval: 'auto', formatter: function(value){
                    return value;
                }},
                data: []
            }],
            series: null
        };

        function initialiseAllCharts() {
            // set the initial entry point to 'Total' level
            var __level__ = 'Total';
            chartManager.initChart('bar_1', options, getBar1Data(__level__), setNewData);
            chartManager.initChart('bar_2', options, getBar2Data(__level__), setNewData);
            chartManager.initChart('bar_3', options, getBar3Data(__level__), setNewData);
            chartManager.initChart('bar_4', options, getBar4Data(__level__), setNewData);
            chartManager.initChart('bar_5', options, getBar5Data(__level__), setNewData);
            chartManager.initChart('bar_6', options, getBar6Data(__level__), setNewData);
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
                trigger: 'axis',

                formatter: function (params,ticket,callback) {
                    console.debug(params);
                    // console.log(params)
                    // var res = 'Function formatter : <br/>' + params[0].name;
                    var tot_ = parseFloat(params[2].value) + parseFloat(params[1].value);
                    var res = 'Total : ' + tot_;
                    for (var i = 0, l = params.length; i < l; i++) {
                        res += '<br/>' + params[i].seriesName + ' : ' + params[i].value;
                    }
                    return res;
                    // setTimeout(function (){
                    //     callback(ticket, res);
                    // }, 1000)
                    // return 'loading';
                }
                //formatter: "Template formatter: <br/>{b}<br/>{a}:{c}<br/>{a1}:{c1}"
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
                axisLabel:{interval: 'auto', formatter: function(value){
                    return moment(value,'YYYYMMDD').format('DD-MM-YYYY');
                }},

                // boundaryGap: false,
                data: []
            }],
            yAxis: [{
                type: 'value',
                axisLabel:{interval: 'auto', formatter: function(value){
                    return numeral(value).format('(0.00a)');
                }},
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
                trigger: 'axis',
                formatter: null
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
                axisLabel:{interval: 'auto', formatter: function(value){
                    return moment(value,'DD/MM/YYYY').format('DD-MM-YYYY');
                }},
                data: []
            }],
            yAxis: [{
                type: 'value',
                axisLabel:{interval: 'auto', formatter: function(value){
                    return numeral(value).format('(0.00a)');
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
                var series_ = []
                series_.push(series_0);
                series_.push((series_1));
                series_.push((series_2));

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

                var localOptions_ = total_exposure_options;
                localOptions_.legend.data = data_.name;
                localOptions_.xAxis[0].data = xAxisData_;
                localOptions_.series = series_;
                chart_.setOption(localOptions_, true);
            }
        }

        function initialiseAllCharts() {
            var __level__ = 'Total';
            chartManager.initChart('line_total_exposure', total_exposure_options, getTotalExposureData(__level__), setNewData);
            chartManager.initChart('line_exposure_profile', exposure_profile_options, getExposureProfileData(__level__), setNewData);
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
                formatter: "{a} <br/>{b} : {c} ({d}%)"
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
            var __level__ = 'Total';
            chartManager.initChart('donut_cva', options, getCVAData(__level__), setNewData);
            chartManager.initChart('donut_fva', options, getFVAData(__level__), setNewData);
            chartManager.initChart('donut_colva', options, getColVAData(__level__), setNewData);
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
        console.log(param);
        drillDown(param.name);
    },
    getDataFromRestCall: function (url_) {
        console.debug(url_);

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
                var e = new Error('dummy');
                var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
                   .replace(/^\s+at\s+/gm, '')
                   .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
                   .split('\n');

                console.error(new Error("Request failed : " + url_ + '\n' + stack));
                return {};
            })
    },
    load_graph_panel: function (graph_) {
        var trade_type = document.getElementById('tradeContainer.trade.trade_type');
        var current_trade_type = (tradeType || trade_type.options[trade_type.options.selectedIndex].value);
        var loadUrl_ = './' + current_trade_type + '.html';

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
        sessionStorage.setItem('selectedBusinessDate', target.value);

        refreshGraphsOnDataChange();
    },
    setNewHierarchy: function(evt){
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;
        // set the hidden field
        selectedHierarchy.value = target.value;
        sessionStorage.setItem('selectedHierarchy', target.value);
        refreshGraphsOnDataChange(target.value);
    }

}

function getBarGraphData(__level__, date, hierarchy, metric, drilldownKey_) {
    var key__;

    if (!isNullOrUndefined(drilldownKey_)){
        key__ = '/api/bargraph-tree/' + date + '/' + hierarchy + '/' + drilldownKey_ + '/' + metric + '/';
    } else {
        if (hierarchy == 'total') {
            key__ = '/api/bargraph-tree/' + date + '/' + hierarchy + '/Total/' + metric + '/';
        } else {
            // /api/bargraph/:date/:hierarchy/:metric/
            key__ = '/api/bargraph/' + date + '/' + hierarchy + '/' + metric + '/';
        }
    }
    return key__;
}

function getXVAGraphData(__level__, date, hierarchy, metric, drilldownKey_){
    var key__;

    if (!isNullOrUndefined(drilldownKey_)){
        key__ = '/api/xva-tree/' + date +'/' + hierarchy + '/' + drilldownKey_ +'/' + metric + '/';
    } else {
        if (hierarchy == 'total'){
            key__ = '/api/xva-tree/' + date +'/' + hierarchy + '/Total/' + metric + '/';
        } else {
            // /api/bargraph/:date/:hierarchy/:metric/
            key__ = '/api/xva/' + date +'/' + hierarchy + '/' + metric + '/';
        }
    }

    return key__;
}

function getExposureGraphData(__level__, date, hierarchy, metric){
    var key__;

    if (hierarchy == 'total'){
        key__ = '/api/xva-tree/' + date +'/' + hierarchy + '/Total/' + metric + '/';
    } else {
        // /api/bargraph/:date/:hierarchy/:metric/
        key__ = '/api/xva/' + date +'/' + hierarchy + '/' + metric + '/';
    }
    return key__;
}

function getExposureProfileGraphData(__level__, date, hierarchy, metric){
    var key__;

    if (hierarchy == 'total'){
        key__ = '/api/xva-tree/' + date +'/' + hierarchy + '/Total/' + metric + '/';
    } else {
        // /api/bargraph/:date/:hierarchy/:metric/
        key__ = '/api/xva/' + date +'/' + hierarchy + '/' + metric + '/';
    }
    return key__;
}

function getBusinessDate(){
    return sessionStorage.getItem('selectedBusinessDate') || selectedBusdate.value;
}

function getHierarchy(){
    return (sessionStorage.getItem('selectedHierarchy') || selectedHierarchy.value).toLowerCase();
}


function getTotalExposureData(key_){
    var key__ = '/api/totalexposure-tree/total/Total/';
    // var key__ = '/api/totalexposure-tree/' + getHierarchy() + '/Total/';
    // returns a promise (future)
    return chartManager.getDataFromRestCall(key__);
}

function getExposureProfileData(key_){
    // var key__ = '/api/exposure-tree/' + getBusinessDate() +'/' + getHierarchy() + '/Total/';
    var key__ = '/api/exposure-tree/' + getBusinessDate() +'/total/Total/';
    // returns a promise (future)
    return chartManager.getDataFromRestCall(key__);
}

function getBar1Data(key_, drilldownKey_){
    var url_ = getBarGraphData(key_, getBusinessDate(), getHierarchy(), 'ce', drilldownKey_);
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}

function getBar2Data(key_, drilldownKey_){
    var url_ = getBarGraphData(key_, getBusinessDate(), getHierarchy(), 'npv', drilldownKey_);
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}

function getBar3Data(key_, drilldownKey_){
    var url_ = getBarGraphData(key_, getBusinessDate(), getHierarchy(), 'fca', drilldownKey_);
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}

function getBar4Data(key_, drilldownKey_){
    var url_ = getBarGraphData(key_, getBusinessDate(), getHierarchy(), 'fba', drilldownKey_);
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}

function getBar5Data(key_, drilldownKey_){
    var url_ = getBarGraphData(key_, getBusinessDate(), getHierarchy(), 'eepe', drilldownKey_);
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}

function getBar6Data(key_, drilldownKey_){
    var url_ = getBarGraphData(key_, getBusinessDate(), getHierarchy(), 'cva', drilldownKey_);
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}

function flipChart(chartId_, chartType_){
// TODO this is to be hooked to the chart type changer for bar graphs
}


function getCVAData(key_, drilldownKey_){
    var url_ = getXVAGraphData(key_, getBusinessDate(), getHierarchy(), 'cva', drilldownKey_);
    // var key__ = '/api/xva-tree/' + getBusinessDate() +'/' + getHierarchy() + '/Total/cva/';
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}
function getFVAData(key_, drilldownKey_){
    var url_ = getXVAGraphData(key_, getBusinessDate(), getHierarchy(), 'fva', drilldownKey_);
    // var key__ = '/api/xva-tree/' + getBusinessDate() +'/' + getHierarchy() + '/Total/fva/';
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}
function getColVAData(key_, drilldownKey_){
    var url_ = getXVAGraphData(key_, getBusinessDate(), getHierarchy(), 'colva', drilldownKey_);
    // var key__ = '/api/xva-tree/' + getBusinessDate() +'/' + getHierarchy() + '/Total/colva/';
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}

function getSumOfColVA(key__) {
    Promise.resolve(getColVAData(key__).then(function (res) {
        return getSumOfArrayValues(res.data);
    }));
}

function refreshGraphsOnDataChange(__level__){
    chartManager.initChart('bar_1', BARCharts.getInstance().getDefaults, getBar1Data(__level__), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_2', BARCharts.getInstance().getDefaults, getBar2Data(__level__), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_3', BARCharts.getInstance().getDefaults, getBar3Data(__level__), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_4', BARCharts.getInstance().getDefaults, getBar4Data(__level__), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_5', BARCharts.getInstance().getDefaults, getBar5Data(__level__), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_6', BARCharts.getInstance().getDefaults, getBar6Data(__level__), BARCharts.getInstance().setNewData);
    if (__level__ != 'trade') {
        // console.debug('above trade lvel');
        chartManager.initChart('donut_cva', DONUTCharts.getInstance().getDefaults, getCVAData(__level__), DONUTCharts.getInstance().setNewData);
        chartManager.initChart('donut_fva', DONUTCharts.getInstance().getDefaults, getFVAData(__level__), DONUTCharts.getInstance().setNewData);
        chartManager.initChart('donut_colva', DONUTCharts.getInstance().getDefaults, getColVAData(__level__), DONUTCharts.getInstance().setNewData);
    }

    chartManager.initChart('line_exposure_profile', LINECharts.getInstance().getDefaultExposureOpts, getExposureProfileData(__level__), LINECharts.getInstance().setNewData);
    chartManager.initChart('line_total_exposure', LINECharts.getInstance().getDefaultTotalOptions, getTotalExposureData(__level__), LINECharts.getInstance().setNewData);
}


function refreshGraphsOnDrilldown(__level__, drilldownKey_){
    chartManager.initChart('bar_1', BARCharts.getInstance().getDefaults, getBar1Data(__level__,drilldownKey_), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_2', BARCharts.getInstance().getDefaults, getBar2Data(__level__,drilldownKey_), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_3', BARCharts.getInstance().getDefaults, getBar3Data(__level__,drilldownKey_), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_4', BARCharts.getInstance().getDefaults, getBar4Data(__level__,drilldownKey_), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_5', BARCharts.getInstance().getDefaults, getBar5Data(__level__,drilldownKey_), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_6', BARCharts.getInstance().getDefaults, getBar6Data(__level__,drilldownKey_), BARCharts.getInstance().setNewData);
    if (__level__ != 'trade') {
        // console.debug('above trade lvel');
        chartManager.initChart('donut_cva', DONUTCharts.getInstance().getDefaults, getCVAData(__level__,drilldownKey_), DONUTCharts.getInstance().setNewData);
        chartManager.initChart('donut_fva', DONUTCharts.getInstance().getDefaults, getFVAData(__level__,drilldownKey_), DONUTCharts.getInstance().setNewData);
        chartManager.initChart('donut_colva', DONUTCharts.getInstance().getDefaults, getColVAData(__level__,drilldownKey_), DONUTCharts.getInstance().setNewData);
    }

    // chartManager.initChart('line_exposure_profile', LINECharts.getInstance().getDefaultExposureOpts, getExposureProfileData(__level__), LINECharts.getInstance().setNewData);
    // chartManager.initChart('line_total_exposure', LINECharts.getInstance().getDefaultTotalOptions, getTotalExposureData(__level__), LINECharts.getInstance().setNewData);
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


// send in the data array from a graph
function getSumOfArrayValues(array_) {
    var g = array_.map(function (elem) {
        return elem.value;
    }).reduce(function (prev, curr) {
        return prev + curr;
    });
    console.debug(g);
    return g;
}

function drillDown(drilldownKey_) {
    var __level__ = getHierarchy();
    Promise.resolve(refreshGraphsOnDrilldown(__level__, drilldownKey_)).then(function(res){
        console.log(res);
        downALevel();
    });
}

function downALevel(){
    if (hierarchy.selectedIndex < hierarchy.options.length-1)
    {
        hierarchy.selectedIndex++;
    }
}

function upALevel(){
    if (hierarchy.selectedIndex >0)
    {
        hierarchy.selectedIndex--;
    }
}
