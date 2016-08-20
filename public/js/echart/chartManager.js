/**
 * Created by robnightingale on 20/08/2016.
 */

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
    flipChart : function(evt){
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;
    }
}

function getGenericGraphData(args_){
    var key__;

    console.debug(args_);
    if (!isNullOrUndefined(args_.drillDownKey)) {
        if (args_.drillDownKey == 'Total') {
            // we arrived here from a menu click
            if (args_.hierarchy == 'total')
                key__ = '/api/' + args_.chartType + '-tree/' + args_.date + '/' + args_.hierarchy + '/Total/' + args_.metric + '/';
            else
            // this is from a menu dropdown at hierarchy level
                key__ = '/api/' + args_.chartType + '/' + args_.date + '/' + args_.hierarchy + '/' + args_.metric + '/';
        } else {
            // user clicked on a data point
            console.debug('user click');
            key__ = '/api/' + args_.chartType + '-tree/' + args_.date + '/' + args_.hierarchy + '/' + args_.drillDownKey + '/' + args_.metric + '/';
        }
    } else {
        // shouldn't normally arrive here, so just send back a top level
        // /api/bargraph/:date/:hierarchy/:metric/
        key__ = '/api/' + args_.chartType + '-tree/' + args_.date + '/' + args_.hierarchy + '/Total/' + args_.metric + '/';
    }
    return key__;

}


// function getExposureGraphData(__level__, date, hierarchy, metric){
//     var key__;
//
//     if (hierarchy == 'total'){
//         key__ = '/api/xva-tree/' + date +'/' + hierarchy + '/Total/' + metric + '/';
//     } else {
//         // /api/bargraph/:date/:hierarchy/:metric/
//         key__ = '/api/xva/' + date +'/' + hierarchy + '/' + metric + '/';
//     }
//     return key__;
// }

// function getExposureProfileGraphData(__level__, date, hierarchy, metric){
//     var key__;
//
//     if (hierarchy == 'total'){
//         key__ = '/api/xva-tree/' + date +'/' + hierarchy + '/Total/' + metric + '/';
//     } else {
//         // /api/bargraph/:date/:hierarchy/:metric/
//         key__ = '/api/xva/' + date +'/' + hierarchy + '/' + metric + '/';
//     }
//     return key__;
// }

function getBusinessDate(){
    return sessionStorage.getItem('businessDate') || businessDate.value;
}

function getHierarchy(){
    return (sessionStorage.getItem('hierarchy') || hierarchy.value).toLowerCase();
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

function getBar1Data(drilldownKey_){
    var args = {
        date: getBusinessDate(),
        hierarchy: getHierarchy(),
        metric: 'ce',
        drillDownKey: drilldownKey_,
        chartType: 'bargraph'
    };

    var url_ = getGenericGraphData(args);
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}

function getBar2Data(drilldownKey_){
    var args = {
        date: getBusinessDate(),
        hierarchy: getHierarchy(),
        metric: 'npv',
        drillDownKey: drilldownKey_,
        chartType: 'bargraph'
    };

    var url_ = getGenericGraphData(args);

    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}

function getBar3Data(drilldownKey_){
    var args = {
        date: getBusinessDate(),
        hierarchy: getHierarchy(),
        metric: 'fca',
        drillDownKey: drilldownKey_,
        chartType: 'bargraph'
    };

    var url_ = getGenericGraphData(args);
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}

function getBar4Data(drilldownKey_){
    var args = {
        date: getBusinessDate(),
        hierarchy: getHierarchy(),
        metric: 'fba',
        drillDownKey: drilldownKey_,
        chartType: 'bargraph'
    };

    var url_ = getGenericGraphData(args);
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}

function getBar5Data(drilldownKey_){
    var args = {
        date: getBusinessDate(),
        hierarchy: getHierarchy(),
        metric: 'eepe',
        drillDownKey: drilldownKey_,
        chartType: 'bargraph'
    };

    var url_ = getGenericGraphData(args);
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}

function getBar6Data(drilldownKey_){
    var args = {
        date: getBusinessDate(),
        hierarchy: getHierarchy(),
        metric: 'cva',
        drillDownKey: drilldownKey_,
        chartType: 'bargraph'
    };
    var url_ = getGenericGraphData(args);
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}

function flipChart(chartId_, chartType_){
// TODO this is to be hooked to the chart type changer for bar graphs
}


function getCVAData(drilldownKey_){
    var args = {
        date: getBusinessDate(),
        hierarchy: getHierarchy(),
        metric: 'cva',
        drillDownKey: drilldownKey_,
        chartType: 'xva'
    };
    var url_ = getGenericGraphData(args);
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}
function getFVAData(drilldownKey_){
    var args = {
        date: getBusinessDate(),
        hierarchy: getHierarchy(),
        metric: 'fva',
        drillDownKey: drilldownKey_,
        chartType: 'xva'
    };
    var url_ = getGenericGraphData(args);
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}
function getColVAData(drilldownKey_){
    var args = {
        date: getBusinessDate(),
        hierarchy: getHierarchy(),
        metric: 'colva',
        drillDownKey: drilldownKey_,
        chartType: 'xva'
    };
    var url_ = getGenericGraphData(args);
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


function refreshGraphsOnDrilldown(drilldownKey_){
    chartManager.initChart('bar_1', BARCharts.getInstance().getDefaults, getBar1Data(drilldownKey_), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_2', BARCharts.getInstance().getDefaults, getBar2Data(drilldownKey_), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_3', BARCharts.getInstance().getDefaults, getBar3Data(drilldownKey_), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_4', BARCharts.getInstance().getDefaults, getBar4Data(drilldownKey_), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_5', BARCharts.getInstance().getDefaults, getBar5Data(drilldownKey_), BARCharts.getInstance().setNewData);
    chartManager.initChart('bar_6', BARCharts.getInstance().getDefaults, getBar6Data(drilldownKey_), BARCharts.getInstance().setNewData);
    if (getHierarchy() != 'trade') {
        // console.debug('above trade lvel');
        chartManager.initChart('donut_cva', DONUTCharts.getInstance().getDefaults, getCVAData(drilldownKey_), DONUTCharts.getInstance().setNewData);
        chartManager.initChart('donut_fva', DONUTCharts.getInstance().getDefaults, getFVAData(drilldownKey_), DONUTCharts.getInstance().setNewData);
        chartManager.initChart('donut_colva', DONUTCharts.getInstance().getDefaults, getColVAData(drilldownKey_), DONUTCharts.getInstance().setNewData);
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
    // the key value from the graph that was clicked - the data point
    Promise.resolve(refreshGraphsOnDrilldown(drilldownKey_)).then(function(res){
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

function resetPageDefaults(){
    var nodes = document.getElementsByClassName('selectpicker');
    for (var node in nodes){
        node.selectedIndex=0;
    }

    // set initial values
    businessDate.value = businessDates.options[businessDates.selectedIndex].value ; //sessionStorage.getItem('businessDate') || '20150630';
    hierarchy.value = hierarchies.options[hierarchies.selectedIndex].value ; // sessionStorage.getItem('hierarchy') || 'Total';
    sessionStorage.setItem('businessDate', businessDate.value);
    sessionStorage.setItem('hierarchy', hierarchy.value);

}

function setItem(evt){
    if (isNullOrUndefined(evt))
        return;

    evt = evt || window.event;
    var target = evt.target || evt.srcElement;
    sessionStorage.setItem(target.name, target.value);
    document.getElementById(target.name).value = target.value;

    if (target.name == 'hierarchy')
    // we have been triggered by a menu click so
    // it is always a 'total'
        drillDown('Total');

    if (target.name == 'businessDate')
        refreshGraphsOnDataChange();
}
