/*
 *  Copyright (C) 2016 Quaternion Risk Management Ltd
 *  All rights reserved
 *
 */
var drilldownLevels = [
    {name: 'creditrating', level: 0, text: 'Credit Rating'}
    , {name: 'counterparty', level: 1, text: 'Counterparty'}
    , {name: 'nettingset', level:2, text:'Netting Set'}
    , {name: 'trade', level:3, text: 'Trade'}
]

var drillDownItem = {
    date: '',
    hierarchy: '',
    item: ''
};

var currencyMap = [
    {ccy: 'BRL', symbol: 'R$'}
    ,{ccy: 'CNY', symbol: '¥'}
    ,{ccy: 'CZK', symbol: 'Kč'}
    ,{ccy: 'DKK', symbol: 'kr'}
    ,{ccy: 'EUR', symbol: '€'}
    ,{ccy: 'HUF', symbol: 'Ft'}
    ,{ccy: 'ISK', symbol: 'kr'}
    ,{ccy: 'IDR', symbol: 'Rp'}
    ,{ccy: 'JPY', symbol: '¥'}
    ,{ccy: 'KRW', symbol: '₩'}
    ,{ccy: 'NOK', symbol: 'kr'}
    ,{ccy: 'RUB', symbol: 'руб'}
    ,{ccy: 'SEK', symbol: 'kr'}
    ,{ccy: 'CHF', symbol: 'CHF'}
    ,{ccy: 'GBP', symbol: '£'}
    ,{ccy: 'USD', symbol: '$'}
]

var chartCategory =
    [
        {metric: 'npv', category: 'MARKET'},
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
];

var chartManager;

/** @constructor */
var ChartManager = function() {};

(function() {
    'use strict';

    ChartManager.prototype = {

        initAllCharts: function(){
            // LINECharts.getInstance().initAllCharts();
            // BARCharts.getInstance().initAllCharts();
            // DONUTCharts.getInstance().initAllCharts();
            // RISKGauge.getInstance().initAllCharts();
            var bars = new BarChart(opts_, null);
            bars.initialiseAllCharts();
        },
        getChartInstanceFromDivId: function (chartTagName_) {
            return echarts.getInstanceByDom(document.getElementById(chartTagName_));
        },
        getDataFromRestCall: function (url_) {

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
            console.log(theUrl_);

            return fetch(
                theUrl_, req_)
                .then(processStatus)
                .then(parseJson)
                .then(function (response) {
                    // console.debug(response);
                    return response;
                })
                .catch(function (ex) {

                    StackTrace.fromError(ex)
                        .then(console.error);
                    return Promise.reject(ex);
                })
        },
        populateBusinessDates: function () {
            try {
                var sel = document.getElementById('businessDates');
                // zero out the existing options
                sel.options.length = 0;

                var fragment = document.createDocumentFragment();
                return this.getDataFromRestCall('/api/dates')
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

                        sessionStorage.setItem('businessDate', businessDates.options[0].value );

                    }).catch(function (e) {
                        return Promise.reject(new Error(e));
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

                ["CE",'EEPE','TOTALEXPOSURE','CVA','DVA','NPV','FCA','FBA','FVA','ColVA','IM'].forEach(function (dcc, index) {
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
            var metric_ = this.getBarGraphMetric(target.name);

            var args = {
                date: this.getBusinessDate(),
                hierarchy: this.getHierarchy(),
                item: drillDownLevel_,
                level: this.getDrillDownLevel()[0].level
            };

            var p_ = this.getGraphData(args, metric_,'bargraph');
            p_.then(function(res){
                this.initChart(graphId_, bgInstance.getDefaults, p_, bgInstance.setNewData);
                // lookup the category in the chartCategories array
                var cat_ = filter(chartCategory, function(elem){return elem.metric == metric_;});
                document.getElementById(graphId_).parentNode.parentNode.getElementsByTagName('h2')[0].innerText = cat_[0].category;
            }).catch(function(err){
                // FIXME if the chart flip returns no data or an error, revert the change
                // with a popup?
                console.error(new Error(err));
            });

        },
        canDrillDown : function(args){
            if ((args.chartType == 'bargraph' || args.chartType == 'totalexposure') && args.level < 3) return true;
            if (args.level <2) return true;
            return false;
        },
        getGenericGraphData : function(args_){
            var key__;
            // clone args with a deep (non reference) copy
            var localArgs_ = JSON.parse(JSON.stringify(args_));

            console.debug(localArgs_);

            if (!isNullOrUndefined(localArgs_.item)) {
                //total exposure chart doesnt regard dates
                if (localArgs_.chartType =='totalexposure' || localArgs_.chartType=='exposure') {
                    if (localArgs_.chartType == 'totalexposure')
                        localArgs_.date = '';
                    if (localArgs_.item == 'Total') {
                        localArgs_.hierarchy = 'total';
                        // we arrived here from a menu click
                        // FIXME hierarchy must be 'total' when item = Total for line graphs
                        key__ = '/api/' + localArgs_.chartType + '-tree/' + localArgs_.date + '/' + localArgs_.hierarchy + '/' + localArgs_.item;
                    } else {

                        var key__ = '/api/' + localArgs_.chartType + '-tree/' + localArgs_.date + '/' + localArgs_.hierarchy + '/' + localArgs_.item;
                    }
                    return key__;
                }

                if (localArgs_.item == 'Total') {
                    // we arrived here from a menu click
                    key__ = '/api/' + localArgs_.chartType + '/' + localArgs_.date + '/' + localArgs_.hierarchy + '/' + localArgs_.metric;
                } else {
                    // user clicked on a data point
                    if (this.canDrillDown(localArgs_))
                        key__ = '/api/' + localArgs_.chartType + '-tree/' + localArgs_.date + '/' + localArgs_.hierarchy + '/' + localArgs_.item + '/' + localArgs_.metric ;
                    // otherwise just show the total level for that hierarchy instead of a filter
                    else
                        key__ = '/api/' + localArgs_.chartType + '/' + localArgs_.date + '/' + localArgs_.hierarchy + '/' + localArgs_.metric ;
                    // key__ = '/api/' + localArgs_.chartType + '-tree/' + localArgs_.date + '/' + localArgs_.hierarchy + '/' + localArgs_.item + '/' + localArgs_.metric + '/';
                }
            } else {
                // shouldn't normally arrive here, so just send back a top level
                // /api/bargraph/:date/:hierarchy/:metric/
                key__ = '/api/' + localArgs_.chartType + '-tree/' + localArgs_.date + '/' + localArgs_.hierarchy + '/Total/' + localArgs_.metric ;
            }
            return key__;

        }
        , getBusinessDate : function(){
            return sessionStorage.getItem('businessDate') || businessDate.value;
        }
        , getHierarchy : function (){
            return (sessionStorage.getItem('hierarchy') || hierarchy.value).toLowerCase();
        }
        , getItem : function (){
            return (sessionStorage.getItem('hierarchyOrTree'));
        }
        , getBarGraphMetric : function(id_) {
            var default_ = filter(barGraphs, function(elem){return elem.name == id_});
            return (sessionStorage.getItem(id_) || default_[0].metric).toLowerCase();
        }
        , getGraphData : function(args, metric_, chartType_) {
            var localArgs = args;
            localArgs.metric = metric_;
            localArgs.chartType = chartType_;

            var url_ = this.getGenericGraphData(localArgs);
            // returns a promise (future)
            return this.getDataFromRestCall(url_);
        }
        , getSumOfGraphData : function(graphDivId_){
            var graph_ = this.getChartInstanceFromDivId(graphDivId_);
            var array_ = graph_.getOption().series[0].data;
            return this.getSumOfArrayValues(array_);
        }
        , refreshGraphs : function(args){
            // console.debug(args);
            var bgInstance = BARCharts.getInstance();
            var xvInstance = DONUTCharts.getInstance();
            var lineInstance = LINECharts.getInstance();

            barGraphs.forEach(function(elem){
                var metric_ = this.getBarGraphMetric(elem.name);
                var p_ = this.getGraphData(args, metric_,'bargraph');

                p_.then(function(res){
                    this.initChart(elem.id, bgInstance.getDefaults, p_, bgInstance.setNewData);
                    // lookup the category in the chartCategories array
                    var cat_ = filter(chartCategory, function(elem){return elem.metric == metric_;});
                    document.getElementById(elem.id).parentNode.parentNode.getElementsByTagName('h2')[0].innerText = cat_[0].category;
                });

            });

            if (this.getDrillDownLevel()[0].level < 3) {
                xvaGraphs.forEach(function(elem){
                    var p_ = this.getGraphData(args, elem.metric,'xva');
                    p_.then(function(res){
                        this.initChart(elem.name, xvInstance.getDefaults, p_, xvInstance.setNewData);
                        document.getElementsByName(elem.name)[0].innerText = elem.text + ' : '+ numeral(this.getSumOfArrayValues(res.data)).format('(0.00a)');
                    });
                });
            }

            var totexp_ = this.getGraphData(args, '', 'totalexposure');
            var exp_ = this.getGraphData(args, '', 'exposure');

            return Promise.all([totexp_, exp_]).then(function (values) {
                this.initChart('line_total_exposure',lineInstance.getDefaultTotalOptions, totexp_, lineInstance.setNewData);
                this.initChart('line_exposure_profile',lineInstance.getDefaultExposureOpts, exp_, lineInstance.setNewData);
                return 'done';
            }).catch(function(error){
                console.error(new Error(error));
            })
        }
        , getSumOfArrayValues : function(array_){
            var g = array_.map(function (elem) {
                return elem.value;
            }).reduce(function (prev, curr) {
                return prev + curr;
            });
            return g;
        }
        , setBGMetricDefaults : function(){
            var nodes = document.getElementsByClassName('selectpicker-bg');
            // set initial values
            barGraphs.forEach(function(elem){
                sessionStorage.setItem(elem.name, elem.metric.toUpperCase());
                filter(nodes,function(e){return e.name == elem.name})[0].value = elem.metric.toUpperCase();
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
            sessionStorage.setItem('hierarchy', this.getDrillDownLevel()[0].name);

            this.setBGMetricDefaults();
        }
        , setItem : function (evt){
            if (isNullOrUndefined(evt))
                return;

            evt = evt || window.event;
            var target = evt.target || evt.srcElement;
            sessionStorage.setItem(target.name, target.value);
            document.getElementById(target.name).value = target.value;

            if (target.name == 'businessDate') {
                // reset graphs to top level Totals
                // sessionStorage.setItem('level', drilldownLevels[0].level);
                // sessionStorage.setItem('hierarchyOrTree','Total');
                // sessionStorage.setItem('hierarchy', this.getDrillDownLevel()[0].name);

                var args = {
                    date: this.getBusinessDate(),
                    hierarchy: this.getHierarchy(),
                    item: 'Total',
                    level: this.getDrillDownLevel()[0].level
                };
                this.drillDown(args);
            }
        }
        , setBGMetric : function(evt){
            if (isNullOrUndefined(evt))
                return;

            evt = evt || window.event;
            var target = evt.target || evt.srcElement;
            sessionStorage.setItem(target.name, target.value);
            this.flipChart(evt);
            // set the userBG item
            var default_ = filter(userBarGraphs, function(elem){return elem.name == target.name});
            default_[0].metric = target.value.toLowerCase();
        }
        , getDrillDownLevel : function() {
            return filter(drilldownLevels, function(elem) {
                return elem.level == +sessionStorage.getItem('level');
            });
        }
        , getDrillDownLevelAsInteger : function(){
            return this.getDrillDownLevel()[0].level;
        }
        , setDrillDownLevel : function(e) {
            sessionStorage.setItem('level', +e);
        }
        , setDrilldownMenu : function(level){
            var lvl = level || this.getDrillDownLevel()[0].level;
            $('input:radio')[lvl].checked = true;
            $($('label[name^="option"]')[lvl]).button('toggle');
            this.setDrillDownLevel(lvl);
            sessionStorage.setItem('hierarchy', this.getDrillDownLevel()[0].name);
        }
        , drillDown : function (args){
            // the key value from the graph that was clicked - the data point
            Promise.resolve(this.refreshGraphs(args)).then(function(res){
                if (args.item != 'Total'){
                    // if a user clicked the graph, bring the menu into line
                    var level = +this.getDrillDownLevel()[0].level ;
                    level++;
                    this.setDrilldownMenu(level);
                }
            });
        }
        , updateBreadcrumb : function(args){
            // get the parent tree JSON
            var url_ = '/api/periscope/' + args.hierarchy  + '/' + args.item;
            var parentTree = this.getDataFromRestCall(url_);
            parentTree.then(function(res){
                // draw the bread crumb items
                this.setCrumbs(res);
            }).catch(function(e){

            });
        },
        resetCrumbs : function(){
            var bcList = document.getElementById('periscope');
            while (bcList.firstChild) {
                bcList.removeChild(bcList.firstChild);
            }
            var listItem = document.createElement('li');
            listItem.className="breadcrumb-item";
            var a = document.createElement('a');
            a.href="#";
            a.id = "crumb";
            a.setAttribute('data-hierarchy', 'total');
            a.setAttribute('data-item', 'Total');
            a.setAttribute('data-level', '0');
            var i = document.createElement('i');
            i.className="fa fa-home";
            a.appendChild(i);
            listItem.appendChild(a);
            bcList.appendChild(listItem);

        },
        setCrumbs : function(breadcrumbStack_){
            // set the breadcrumbs according to the response from the JSON message
            // in periscope rest endpoint
            this.resetCrumbs();
            var bcList = document.getElementById('periscope');

            [].forEach.call(breadcrumbStack_, function (e) {
                var listItem = document.createElement('li');
                listItem.className="breadcrumb-item";
                var a = document.createElement('a');
                a.href="#";
                a.id = "crumb" +e.level;
                a.setAttribute('data-hierarchy', e.hierarchy);
                a.setAttribute('data-item', e.item);
                a.setAttribute('data-level', e.level);
                a.innerText = e.item;
                listItem.appendChild(a);
                bcList.appendChild(listItem);
            });

        },
        breadcrumbClick : function(evt){
            // user clicked on the menu
            if (isNullOrUndefined(evt))
                return;

            evt = evt || window.event;
            var target = evt.target || evt.srcElement;

            var hierarchy_ = target.getAttribute('data-hierarchy');
            var item_ = target.getAttribute('data-item');
            var level_ = target.getAttribute('data-level');
            sessionStorage.setItem('level', level_);
            sessionStorage.setItem('hierarchy', hierarchy_);
            sessionStorage.setItem('hierarchyOrTree',item_);

            var args = {
                date: this.getBusinessDate(),
                hierarchy: hierarchy_,
                item: item_,
                level: level_
            };
            this.updateBreadcrumb(args);
            this.drillDown(args);
        },
        drilldownMenuClick : function(evt){
            // user clicked on the menu
            if (isNullOrUndefined(evt))
                return;

            evt = evt || window.event;
            var target = evt.target || evt.srcElement;

            this.setDrillDownLevel(target.children[0].value);
            sessionStorage.setItem('hierarchy', this.getDrillDownLevel()[0].name);
            sessionStorage.setItem('hierarchyOrTree','Total');

            var args = {
                date: this.getBusinessDate(),
                hierarchy: this.getHierarchy(),
                item: 'Total',
                level: this.getDrillDownLevel()[0].level
            };
            this.resetCrumbs();
            this.drillDown(args);

        }
        , drilldownChartClick : function(evt){
            // user clicked on the chart
            if (isNullOrUndefined(evt))
                return;

            evt = evt || window.event;
            var target = evt.target || evt.srcElement;

            sessionStorage.setItem('hierarchyOrTree',evt.name);
            var level = +this.getDrillDownLevel()[0].level ;

            var args = {
                date: this.getBusinessDate(),
                hierarchy: this.getHierarchy(),
                item: evt.name,
                level: this.getDrillDownLevel()[0].level
            };
            this.updateBreadcrumb(args);
            this.drillDown(args);
        }


    };

    /**
     * Checks condition, displays error message if expectation fails.
     * @param {*} condition The condition to check for truthiness.
     * @param {string} message The message to display if the check fails.
     */
    function expect(condition, message) {
        if (!condition) {
            console.error('Unexpected condition on ' + document.location.href + ': ' +
                message);
        }
    }

    /**
     * Checks that the given value has the given type.
     * @param {string} id The id of the value (only used for error message).
     * @param {*} value The value to check the type on.
     * @param {string} type The type we expect |value| to be.
     */
    function expectIsType(id, value, type) {
        expect(typeof value == type, '[' + value + '] (' + id +
            ') is not a ' + type);
    }

    expect(!chartManager, 'should only include this file once');
    chartManager = new ChartManager;

})();

var load_ = function () {
    console.log('[INFO] ORE Dashboard.init');

    chartManager = new ChartManager();

    // load the page
    // build business date list
    // initialise all the charts
    // attach change event handlers to the dropdown controls

    Promise.resolve(chartManager.populateBusinessDates())
        .then(function (res) {
            chartManager.resetPageDefaults()
        }).then(function (res) {

        chartManager.initAllCharts();
        // add a change event handler to all the dropdown controls
        var nodes = document.getElementsByClassName('selectpicker');
        [].forEach.call(nodes, function (e) {
            _AttachEvent(e, 'change', chartManager.setItem);
        });

        [].forEach.call(document.getElementsByClassName('selectpicker-bg'), function (e) {
            // for each bar graph selector, populate the choices list
            chartManager.populateBarGraphMetricList(e);
            // and add a change event handler
            _AttachEvent(e, 'change', chartManager.setBGMetric);
        });
        chartManager.setBGMetricDefaults();

        // add a click event handler to the radio buttons for credit rating/counterparty etc
        [].forEach.call($('label[name^="option"]'), function (e) {
            _AttachEvent(e, 'click', chartManager.drilldownMenuClick);
        });

        // add a click event handler to the breadcrumb for credit rating/counterparty etc
        [].forEach.call($('ol[id^="periscope"]'), function (e) {
            _AttachEvent(e, 'click', chartManager.breadcrumbClick);
        })

        $('#xva-zoom').on('shown.bs.modal', function(e){
            var graphId = $(e.relatedTarget).data('id');
            var args = {
                date: chartManager.getBusinessDate(),
                hierarchy: chartManager.getHierarchy(),
                item: chartManager.getItem(),
                level: chartManager.getDrillDownLevel()[0].level
            };

            var p_ = chartManager.getGraphData(args, graphId,'xva');
            chartManager.initChart('donut_xva', DONUTCharts.getInstance().getDefaults, p_, DONUTCharts.getInstance().setNewData);
        });

    });

    console.log('[INFO] ORE Dashboard init completed');
}

// StackTrace.instrument(chartManager.drillDown, StackTraceCallback, StackTraceErrback);

var StackTraceCallback = function(stackframes) {
    var stringifiedStack = stackframes.map(function(sf) {
        return sf.toString();
    }).join('\n');
    console.log(stringifiedStack);
};

var StackTraceErrback = function(err) { console.log(err.message); };
