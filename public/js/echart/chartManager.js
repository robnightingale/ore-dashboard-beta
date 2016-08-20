/**
 * Created by robnightingale on 20/08/2016.
 */

"use strict";

var barGraphs = [
    {id: 'bar_1', name: 'bar1', metric: 'ce'},
    {id: 'bar_2', name: 'bar2', metric: 'npv'},
    {id: 'bar_3', name: 'bar3', metric: 'fca'},
    {id: 'bar_4', name: 'bar4', metric: 'fba'},
    {id: 'bar_5', name: 'bar5', metric: 'eepe'},
    {id: 'bar_6', name: 'bar6', metric: 'cva'}
];

// deep copy clone
var userBarGraphs = JSON.parse(JSON.stringify(barGraphs));

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
        theChart_.on('click', chartManager.eConsole);
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
        chartManager.drillDown(param.name);
    },
    getDataFromRestCall: function (url_) {
        console.debug(url_);

        var req_ = new Request({
                headers: {
                    'Cache-Control': 'no-cache',
                    'If-Modified-Since': '0',
                    'Accept': 'application/json'
                },
                method: 'GET',
                mode: 'cors',
                credentials: 'same-origin'
            }
        );

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
        chartManager.initChart(graphId_, bgInstance.getDefaults, chartManager.getGraphData(drillDownLevel_, chartManager.getBarGraphMetric(target.name),'bargraph'), bgInstance.setNewData);
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
    , getBusinessDate : function(){
        return sessionStorage.getItem('businessDate') || businessDate.value;
    }
    , getHierarchy : function (){
        return (sessionStorage.getItem('hierarchy') || hierarchy.value).toLowerCase();
    }
    , getBarGraphMetric : function(id_) {
        var default_ = barGraphs.filter(function(elem){
                return elem.name == id_;
        });
        return (sessionStorage.getItem(id_) || default_[0].metric).toLowerCase();
    }
    , getTotalExposureData: function (key_) {
        var key__ = '/api/totalexposure-tree/total/Total/';
        // var key__ = '/api/totalexposure-tree/' + getHierarchy() + '/Total/';
        // returns a promise (future)
        return chartManager.getDataFromRestCall(key__);
    }
    , getExposureProfileData : function(key_){
        // var key__ = '/api/exposure-tree/' + getBusinessDate() +'/' + getHierarchy() + '/Total/';
        var key__ = '/api/exposure-tree/' + chartManager.getBusinessDate() +'/total/Total/';
        // returns a promise (future)
        return chartManager.getDataFromRestCall(key__);
    }
    , getGraphData : function(drillDownKey_, metric_, chartType_) {
        var args = {
            date: chartManager.getBusinessDate(),
            hierarchy: chartManager.getHierarchy(),
            metric: metric_,
            drillDownKey: drillDownKey_,
            chartType: chartType_
        };

        var url_ = chartManager.getGenericGraphData(args);
        // returns a promise (future)
        return chartManager.getDataFromRestCall(url_);
    }
    , getSumOfGraphData : function(graphDivId_){
        return chartManager.getSumOfArrayValues(graphDivId_);
    }
    , refreshGraphs : function(__level__){
        var bgInstance = BARCharts.getInstance();
        var xvInstance = DONUTCharts.getInstance();

        barGraphs.forEach(function(elem){
            chartManager.initChart(elem.id, bgInstance.getDefaults, chartManager.getGraphData(__level__, chartManager.getBarGraphMetric(elem.name),'bargraph'), bgInstance.setNewData);
        });

        if (__level__ != 'trade') {
            xvaGraphs.forEach(function(elem){
                chartManager.initChart(elem.name, xvInstance.getDefaults, chartManager.getGraphData(__level__, elem.metric,'xva'), xvInstance.setNewData);
                console.debug(chartManager.getSumOfGraphData(elem.id));
            });
        }

        chartManager.initChart('line_exposure_profile', LINECharts.getInstance().getDefaultExposureOpts, chartManager.getExposureProfileData(__level__), LINECharts.getInstance().setNewData);
        chartManager.initChart('line_total_exposure', LINECharts.getInstance().getDefaultTotalOptions, chartManager.getTotalExposureData(__level__), LINECharts.getInstance().setNewData);
    }
    , refreshGraphsOnDataChange : function(__level__){
        chartManager.refreshGraphs('Total');
    }
    , refreshGraphsOnDrilldown : function(drilldownKey_){
        chartManager.refreshGraphs(drilldownKey_);
    }
    , getSumOfArrayValues : function(graphDivId_){
        var graph_ = chartManager.getChartInstanceFromDivId(graphDivId_);

        var array_ = graph_.getOption().series[0].data;
        var g = array_.map(function (elem) {
            return elem.value;
        }).reduce(function (prev, curr) {
            return prev + curr;
        });
        // console.debug(g);
        return g;
    }
    , drillDown : function (drilldownKey_){
        // the key value from the graph that was clicked - the data point
        Promise.resolve(chartManager.refreshGraphsOnDrilldown(drilldownKey_)).then(function(res){
            chartManager.downALevel();
        });
    }
    , downALevel : function(){
        if (hierarchies.selectedIndex < hierarchies.options.length-1)
        {
            hierarchies.selectedIndex++;
        }
    }
    , upALevel : function(){
        if (hierarchies.selectedIndex >0)
        {
            hierarchies.selectedIndex--;
        }
    }
    , setBGMetricDefaults : function(){
        var nodes = document.getElementsByClassName('selectpicker-bg');
        [].forEach.call(nodes,function(e){
            e.selectedIndex = 0;
        });

        // set initial values
        barGraphs.forEach(function(elem){
            sessionStorage.setItem(elem.name, elem.metric.toUpperCase());
        });
    }
    , resetPageDefaults : function(){
        var nodes = document.getElementsByClassName('selectpicker');
        [].forEach.call(nodes,function(e){
            e.selectedIndex = 0;
        });

        // set initial values
        businessDate.value = businessDates.options[businessDates.selectedIndex].value ; //sessionStorage.getItem('businessDate') || '20150630';
        hierarchy.value = hierarchies.options[hierarchies.selectedIndex].value ; // sessionStorage.getItem('hierarchy') || 'Total';
        sessionStorage.setItem('businessDate', businessDate.value);
        sessionStorage.setItem('hierarchy', hierarchy.value);
        sessionStorage.setItem('hierarchyOrTree','Total');

        chartManager.setBGMetricDefaults();
    }
    , setItem : function (evt){
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
            chartManager.drillDown('Total');

        if (target.name == 'businessDate')
            chartManager.refreshGraphsOnDataChange();
    }
    , setBGMetric : function(evt){
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;
        sessionStorage.setItem(target.name, target.value);
        chartManager.flipChart(evt);
        // set the userBG item
        userBarGraphs.filter(function(elem){return elem.name == target.name})[0].metric = target.value.toLowerCase();
    }

}
