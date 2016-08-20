/**
 * Created by robnightingale on 20/08/2016.
 */

var userBarGraphs = [
    {id: 'bar_1', name: 'bar1', metric: 'ce'},
    {id: 'bar_2', name: 'bar2', metric: 'npv'},
    {id: 'bar_3', name: 'bar3', metric: 'fca'},
    {id: 'bar_4', name: 'bar4', metric: 'fba'},
    {id: 'bar_5', name: 'bar5', metric: 'eepe'},
    {id: 'bar_6', name: 'bar6', metric: 'cva'}
];


var barGraphs = [
    {id: 'bar_1', name: 'bar1', metric: 'ce'},
    {id: 'bar_2', name: 'bar2', metric: 'npv'},
    {id: 'bar_3', name: 'bar3', metric: 'fca'},
    {id: 'bar_4', name: 'bar4', metric: 'fba'},
    {id: 'bar_5', name: 'bar5', metric: 'eepe'},
    {id: 'bar_6', name: 'bar6', metric: 'cva'}
];

var xvaGraphs = [
    {id: 'donut_cva', name: 'donut_cva', metric: 'cva'},
    {id: 'donut_fva', name: 'donut_fva', metric: 'fva'},
    {id: 'donut_colva', name: 'donut_colva', metric: 'colva'}
]

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
        // if user clicks a graph
        // console.log(param);
        sessionStorage.setItem('hierarchyOrTree',param.name);
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
    populateBarGraphMetricList : function (element){
        try {
            // var sel = document.getElementById('businessDates');
            var sel = element;
            // zero out the existing options
            sel.options.length = 0;
            var fragment = document.createDocumentFragment();

            ['EEPE','TOTALEXPOSURE','CVA','DVA','NPV','FCA','FBA','FVA','ColVA','IM'].forEach(function (dcc, index) {
                        var opt = document.createElement('option');
                        // nice format for the user to see
                        opt.innerHTML = dcc;
                        // nice format for the computer to see
                        opt.value = dcc;
                        fragment.appendChild(opt);
                    });
                    sel.appendChild(fragment);
        } catch (e) {
            console.error(new Error(e));
        }
    },
    flipChart : function(evt){
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;

        // refresh the single chart with the right metric
        // redraw the barGraph with a new metric
        var bgInstance = BARCharts.getInstance();
        var drillDownLevel_ = sessionStorage.getItem('hierarchyOrTree') || 'Total';
        var graphId_ = barGraphs.filter(function(elem){return elem.name == target.name})[0].id;
        chartManager.initChart(graphId_, bgInstance.getDefaults, getGraphData(drillDownLevel_, getBarGraphMetric(target.name),'bargraph'), bgInstance.setNewData);
    },
    getGenericGraphData : function(args_){
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
}

function getBusinessDate(){
    return sessionStorage.getItem('businessDate') || businessDate.value;
}

function getHierarchy(){
    return (sessionStorage.getItem('hierarchy') || hierarchy.value).toLowerCase();
}

function getBarGraphMetric(id_){
    var default_ = barGraphs.filter(function(elem){
        try {
        return (elem.id == id_).metric;
        } catch(itemNotFound){
            return {};
        }
    });

    return (sessionStorage.getItem(id_) || default_).toLowerCase();
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

function getGraphData(drillDownKey_, metric_, chartType_){
    var args = {
        date: getBusinessDate(),
        hierarchy: getHierarchy(),
        metric: metric_,
        drillDownKey: drillDownKey_,
        chartType: chartType_
    };

    var url_ = chartManager.getGenericGraphData(args);
    // returns a promise (future)
    return chartManager.getDataFromRestCall(url_);
}

function getSumOfGraphData(key__) {
    var args = {
        date: getBusinessDate(),
        hierarchy: getHierarchy(),
        metric: 'colva',
        drillDownKey: drilldownKey_,
        chartType: 'xva'
    };
    var url_ = chartManager.getGenericGraphData(args);
    // returns a promise (future)
    chartManager.getDataFromRestCall(url_).then(
        function(res){
            return getSumOfArrayValues(res.data);
        }
    )
}


function refreshGraphs(__level__){
    var bgInstance = BARCharts.getInstance();
    var xvInstance = DONUTCharts.getInstance();

    barGraphs.forEach(function(elem){
        chartManager.initChart(elem.id, bgInstance.getDefaults, getGraphData(__level__, getBarGraphMetric(elem.name),'bargraph'), bgInstance.setNewData);
    });

    if (__level__ != 'trade') {
        xvaGraphs.forEach(function(elem){
            chartManager.initChart(elem.name, xvInstance.getDefaults, getGraphData(__level__, elem.metric,'xva'), xvInstance.setNewData);
        });
    }

    chartManager.initChart('line_exposure_profile', LINECharts.getInstance().getDefaultExposureOpts, getExposureProfileData(__level__), LINECharts.getInstance().setNewData);
    chartManager.initChart('line_total_exposure', LINECharts.getInstance().getDefaultTotalOptions, getTotalExposureData(__level__), LINECharts.getInstance().setNewData);

}

function refreshGraphsOnDataChange(__level__){
    refreshGraphs('Total');
}

function refreshGraphsOnDrilldown(drilldownKey_){
    refreshGraphs(drilldownKey_);
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

function setBGMetricDefaults(){
    var nodes = document.getElementsByClassName('selectpicker-bg');
    for (var node in nodes){
        node.selectedIndex=0;
    }

    // set initial values
    barGraphs.forEach(function(elem){
        sessionStorage.setItem(elem.name, elem.metric.toUpperCase());
    });
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
    sessionStorage.setItem('hierarchyOrTree','Total');

    setBGMetricDefaults();

}

function setItem(evt){
    if (isNullOrUndefined(evt))
        return;

    evt = evt || window.event;
    var target = evt.target || evt.srcElement;
    sessionStorage.setItem(target.name, target.value);
    document.getElementById(target.name).value = target.value;
    sessionStorage.setItem('hierarchyOrTree','Total');

    if (target.name == 'hierarchy')
    // we have been triggered by a menu click so
    // it is always a 'total'
        drillDown('Total');

    if (target.name == 'businessDate')
        refreshGraphsOnDataChange();
}

function setBGMetric(evt){
    if (isNullOrUndefined(evt))
        return;

    evt = evt || window.event;
    var target = evt.target || evt.srcElement;
    sessionStorage.setItem(target.name, target.value);
    chartManager.flipChart(evt);
    // set the userBG item
    userBarGraphs.filter(function(elem){return elem.name == target.name})[0].metric = target.value.toLowerCase();

}
