/**
 * Copyright (C) 2016 Quaternion Risk Management Ltd
 * All rights reserved.
 */

"use strict";

var drilldownLevels = [
    {name: 'creditrating', level: 0, text: 'Credit Rating'}
    , {name: 'counterparty', level: 1, text: 'Counterparty'}
    , {name: 'nettingset', level:2, text:'Netting Set'}
    , {name: 'trade', level:3, text: 'Trade'}
]

var drillDownStack = [];
var drillDownItem = {
    date: '',
    hierarchy: '',
    item: ''
};


var chartCategory =
    [
        {metric: 'npv', category: 'CREDIT'},
        {metric: 'ce', category: 'CREDIT'},
        {metric: 'epe', category: 'CREDIT'},
        {metric: 'ene', category: 'CREDIT'},
        {metric: 'pfe', category: 'CREDIT'},
        {metric: 'eepe', category: 'CREDIT'},
        {metric: 'totalexposure', category: 'CREDIT'},
        {metric: 'cva', category: 'CREDIT'},
        {metric: 'dva', category: 'CREDIT'},
        {metric: 'saccr', category: 'CREDIT'},
        {metric: 'el', category: 'CREDIT'},
        {metric: 'uel', category: 'CREDIT'},
        {metric: 'var', category: 'MARKET'},
        {metric: 'es', category: 'MARKET'},
        {metric: 'fca', category: 'LIQUIDITY'},
        {metric: 'fba', category: 'LIQUIDITY'},
        {metric: 'fva', category: 'LIQUIDITY'},
        {metric: 'colva', category: 'LIQUIDITY'},
        {metric: 'mva', category: 'LIQUIDITY'},
        {metric: 'im', category: 'LIQUIDITY'},
        {metric: 'vm', category: 'LIQUIDITY'},
        {metric: 'snco', category: 'LIQUIDITY'},
        {metric: 'rsf', category: 'LIQUIDITY'}
    ]


var barGraphs = [
    {id: 'bar_1', name: 'bar1', metric: 'ce', text: ''},
    {id: 'bar_2', name: 'bar2', metric: 'npv', text: ''},
    {id: 'bar_3', name: 'bar3', metric: 'fca', text: ''},
    {id: 'bar_4', name: 'bar4', metric: 'fba', text: ''},
    {id: 'bar_5', name: 'bar5', metric: 'eepe', text: ''},
    {id: 'bar_6', name: 'bar6', metric: 'cva', text: ''}
];

// deep copy clone
var userBarGraphs = JSON.parse(JSON.stringify(barGraphs));

var xvaGraphs = [
    {id: 'donut_cva', name: 'donut_cva', metric: 'cva', text: 'CVA'},
    {id: 'donut_fva', name: 'donut_fva', metric: 'fva', text: 'FVA'},
    {id: 'donut_colva', name: 'donut_colva', metric: 'colva', text: 'ColVA'}
]

var chartManager = {

    initAllCharts: function(){
        LINECharts.getInstance().initAllCharts();
        BARCharts.getInstance().initAllCharts();
        DONUTCharts.getInstance().initAllCharts();
        RISKGauge.getInstance().initAllCharts();
    },
    initChart: function (chartTagName_, options, data_, fnLoadData_) {
        // once data is resolved, render it
        Promise.resolve(data_).then(function(res){
            var theChart_ = echarts.init(document.getElementById(chartTagName_), theme);
            theChart_.setOption(options);
            theChart_.on('click', chartManager.drilldownChartClick);
            fnLoadData_(theChart_, res);
        });
    },
    getChartInstanceFromDivId: function (chartTagName_) {
        return echarts.getInstanceByDom(document.getElementById(chartTagName_));
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

            ["CE",'EEPE','TOTALEXPOSURE','CVA','DVA','NPV','FCA','FBA','FVA','ColVA','IM', 'VAR'].forEach(function (dcc, index) {
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
        var graphId_ = filter(barGraphs, function(elem){return elem.name == target.name})[0].id;
        var metric_ = chartManager.getBarGraphMetric(target.name);

        var args = {
            date: chartManager.getBusinessDate(),
            hierarchy: chartManager.getHierarchy(),
            item: drillDownLevel_,
            level: chartManager.getDrillDownLevel()[0].level
        };
        // chartManager.drillDown(args);

        var p_ = chartManager.getGraphData(args, metric_,'bargraph');
        chartManager.initChart(graphId_, bgInstance.getDefaults, p_, bgInstance.setNewData);

        p_.then(function(res){
            // lookup the category in the chartCategories array
            var cat_ = filter(chartCategory, function(elem){return elem.metric == metric_;});
            document.getElementById(graphId_).parentNode.parentNode.getElementsByTagName('h2')[0].innerText = cat_[0].category;
        });

    },
    cloneDonutChart: function(sourceChart, targetChart){
        var oldChart_ = chartManager.getChartInstanceFromDivId(sourceChart);
        var defaults_ = DONUTCharts.getInstance().getDefaults();
        var oldOptions_ = oldChart_.getOption();

        var series= [{
            data: oldOptions_.series.data,
            name: oldOptions_.series.name
        }];
        var legend = {data: oldOptions_.legend.data};
        // var newChart_ = chartManager.initChart('donut_xva', defaults_, )
    },
    canDrillDown : function(args){
        if ((args.chartType == 'bargraph' || args.chartType == 'totalexposure') && args.level < 3) return true;
        if (args.level <2) return true;
        return false;
    },
    getGenericGraphData : function(args_){
        var key__;

        console.debug(args_);
        if (!isNullOrUndefined(args_.item)) {
            if (args_.item == 'Total') {
                // we arrived here from a menu click
                // if (args_.hierarchy == 'total')
                //     key__ = '/api/' + args_.chartType + '-tree/' + args_.date + '/' + args_.hierarchy + '/Total/' + args_.metric + '/';
                // else
                // this is from a menu dropdown at hierarchy level
                    key__ = '/api/' + args_.chartType + '/' + args_.date + '/' + args_.hierarchy + '/' + args_.metric + '/';
            } else {
                // user clicked on a data point
                if (args_.chartType =='totalexposure')
                    args_.date = '';

                if (chartManager.canDrillDown(args_))
                    key__ = '/api/' + args_.chartType + '-tree/' + args_.date + '/' + args_.hierarchy + '/' + args_.item + '/' + args_.metric + '/';
                // otherwise just show the total level for that hierarchy instead of a filter
                else
                    key__ = '/api/' + args_.chartType + '/' + args_.date + '/' + args_.hierarchy + '/' + args_.metric + '/';
                // key__ = '/api/' + args_.chartType + '-tree/' + args_.date + '/' + args_.hierarchy + '/' + args_.item + '/' + args_.metric + '/';
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
        var default_ = filter(barGraphs, function(elem){return elem.name == id_});
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
    , getGraphData : function(args, metric_, chartType_) {
        var localArgs = args;
        localArgs.metric = metric_;
        localArgs.chartType = chartType_;

        var url_ = chartManager.getGenericGraphData(localArgs);
        // returns a promise (future)
        return chartManager.getDataFromRestCall(url_);
    }
    , getSumOfGraphData : function(graphDivId_){
        var graph_ = chartManager.getChartInstanceFromDivId(graphDivId_);
        var array_ = graph_.getOption().series[0].data;
        return chartManager.getSumOfArrayValues(array_);
    }
    , refreshGraphs : function(args){

        // console.debug(args);

        var bgInstance = BARCharts.getInstance();
        var xvInstance = DONUTCharts.getInstance();
        var lineInstance = LINECharts.getInstance();

        barGraphs.forEach(function(elem){
            var metric_ = chartManager.getBarGraphMetric(elem.name);
            var p_ = chartManager.getGraphData(args, metric_,'bargraph');
            chartManager.initChart(elem.id, bgInstance.getDefaults, p_, bgInstance.setNewData);

            p_.then(function(res){
                // lookup the category in the chartCategories array
                var cat_ = filter(chartCategory, function(elem){return elem.metric == metric_;});
                document.getElementById(elem.id).parentNode.parentNode.getElementsByTagName('h2')[0].innerText = cat_[0].category;
            });

        });

        if (chartManager.getDrillDownLevel()[0].level < 3) {
            xvaGraphs.forEach(function(elem){
                var p_ = chartManager.getGraphData(args, elem.metric,'xva');
                chartManager.initChart(elem.name, xvInstance.getDefaults, p_, xvInstance.setNewData);

                p_.then(function(res){
                    document.getElementsByName(elem.name)[0].innerText = elem.text + ' : '+ numeral(chartManager.getSumOfArrayValues(res.data)).format('(0.00a)');
                });

            });
        }

        if (args.item != 'Total') {
            var p_ = chartManager.getGraphData(args, '', 'totalexposure');
            chartManager.initChart('line_total_exposure', lineInstance.getDefaultTotalOptions, p_, lineInstance.setNewData);
        } else {
            chartManager.initChart('line_total_exposure', LINECharts.getInstance().getDefaultTotalOptions, chartManager.getTotalExposureData(args), LINECharts.getInstance().setNewData);
        }
        chartManager.initChart('line_exposure_profile', LINECharts.getInstance().getDefaultExposureOpts, chartManager.getExposureProfileData(args), LINECharts.getInstance().setNewData);

        // chartManager.initChart('line_exposure_profile', LINECharts.getInstance().getDefaultExposureOpts, chartManager.getExposureProfileData(__level__), LINECharts.getInstance().setNewData);
        // chartManager.initChart('line_total_exposure', LINECharts.getInstance().getDefaultTotalOptions, chartManager.getTotalExposureData(__level__), LINECharts.getInstance().setNewData);
    }
    , getSumOfArrayValues : function(array_){
        var g = array_.map(function (elem) {
            return elem.value;
        }).reduce(function (prev, curr) {
            return prev + curr;
        });
        // console.debug(g);
        return g;
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
        var bus_ = businessDates.options[businessDates.selectedIndex].value ;
        sessionStorage.setItem('businessDate', bus_);
        sessionStorage.setItem('level', drilldownLevels[0].level);
        sessionStorage.setItem('hierarchyOrTree','Total');
        sessionStorage.setItem('hierarchy', chartManager.getDrillDownLevel()[0].name);

        chartManager.setBGMetricDefaults();
    }
    , setItem : function (evt){
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;
        sessionStorage.setItem(target.name, target.value);
        document.getElementById(target.name).value = target.value;

        if (target.name == 'businessDate') {
            var args = {
                date: chartManager.getBusinessDate(),
                hierarchy: chartManager.getHierarchy(),
                item: 'Total',
                level: chartManager.getDrillDownLevel()[0].level
            };
            chartManager.drillDown(args);

        }
    }
    , setBGMetric : function(evt){
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;
        sessionStorage.setItem(target.name, target.value);
        chartManager.flipChart(evt);
        // set the userBG item
        var default_ = filter(userBarGraphs, function(elem){return elem.name == target.name});
        default_[0].metric = target.value.toLowerCase();
    }
    , getDrillDownLevel : function() {
        return filter(drilldownLevels, function(elem) {
            return elem.level == +sessionStorage.getItem('level');
        });
    }
    , setDrillDownLevel : function(e) {
        sessionStorage.setItem('level', +e);
    }
    , setDrilldownMenu : function(level){
        var lvl = level || chartManager.getDrillDownLevel()[0].level;
        $('input:radio')[lvl].checked = true;
        $($('label[name^="option"]')[lvl]).button('toggle');
        sessionStorage.setItem('level', lvl);
        sessionStorage.setItem('hierarchy', chartManager.getDrillDownLevel()[0].name);
    }
    , drillDown : function (args){
        // the key value from the graph that was clicked - the data point
        Promise.resolve(chartManager.refreshGraphs(args)).then(function(res){
            if (args.item != 'Total'){
            // if a user clicked the graph, bring the menu into line
                var level = +chartManager.getDrillDownLevel()[0].level ;
                level++;
                chartManager.setDrilldownMenu(level);
            }
        });
    },
    drilldownMenuClick : function(evt){
        // user clicked on the menu
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;
        sessionStorage.setItem('level', target.children[0].value);
        sessionStorage.setItem('hierarchy', chartManager.getDrillDownLevel()[0].name);
        sessionStorage.setItem('hierarchyOrTree','Total');
        var args = {
            date: chartManager.getBusinessDate(),
            hierarchy: chartManager.getHierarchy(),
            item: 'Total',
            level: chartManager.getDrillDownLevel()[0].level
        };
        chartManager.drillDown(args);

    }
    , drilldownChartClick : function(evt){
        // user clicked on the chart
        if (isNullOrUndefined(evt))
            return;

        sessionStorage.setItem('hierarchyOrTree',evt.name);
        var level = +chartManager.getDrillDownLevel()[0].level ;

        var args = {
            date: chartManager.getBusinessDate(),
            hierarchy: chartManager.getHierarchy(),
            item: evt.name,
            level: level
        };
        chartManager.drillDown(args);
    }

}
