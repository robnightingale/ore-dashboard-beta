/*
 *  Copyright (C) 2016 Quaternion Risk Management Ltd
 *  All rights reserved
 *
 */

"use strict";

var load_ = function() {
    // load the page
    // build business date list
    // initialise all the charts
    // attach change event handlers to the dropdown controls
    console.log('[INFO] ORE Dashboard.init');

    var pDates_ = chartManager.populateBusinessDates();
    var pCcy_ = chartManager.setBaseCcy();

    return Promise.all([pDates_, pCcy_]).then(function(values) {
        console.log('[INFO] bus date calls and base ccy complete');
        // when the bus date and base ccy rest calls have resolved
        // reset the page defaults and init the charts
        chartManager.resetPageDefaults();
        console.debug(sessionStorage);
        return chartManager.initAllCharts();
        // return 'done';
    }).then(function(res) {
        console.log('[INFO] init charts complete');
        // add a change event handler to the business date dropdown
        var nodes = document.getElementsByClassName('selectpicker');
        [].forEach.call(nodes, function(e) {
            _AttachEvent(e, 'change', chartManager.changeDate);
        });

        // for each bar graph selector, populate the choices listz
        // and add a change event handler
        [].forEach.call(document.getElementsByClassName('selectpicker-bg'), function(e) {
            chartManager.populateBarGraphMetricList(e);
            _AttachEvent(e, 'change', chartManager.setBGMetric);
        });

        // add a click event handler to the radio buttons for credit rating/counterparty etc
        [].forEach.call($('label[name^="option"]'), function(e) {
            _AttachEvent(e, 'click', chartManager.drilldownMenuClick);
        });

        // add a click event handler to the breadcrumb for credit rating/counterparty etc
        [].forEach.call($('ol[id^="periscope"]'), function(e) {
            _AttachEvent(e, 'click', chartManager.breadcrumbClick);
        });

        // function to zoom a xva graph
        $('#xva-zoom').on('shown.bs.modal', function(e) {
            var graphId = $(e.relatedTarget).data('id');

            if (1 == chartManager.getMode())
                // if we are in hierarchy view then use the selected hierarchy.
                var hierarchy = chartManager.getHierarchy();
            else
                // if we are in tree view then use the hierarchy above
                // (that of the parent node whose children the dashboard is displaying).
                var hierarchy = drilldownLevels[chartManager.getDrillDownLevel()-1].name;

            var args = {
                mode: chartManager.getMode(),
                hierarchy: hierarchy,
                node: chartManager.getNode()
            };

            var p_ = chartManager.getGraphData(args, graphId, 'xva');
            chartManager.initChart('donut_xva', DONUTCharts.getInstance().getDefaults, p_, DONUTCharts.getInstance().setNewData, false);
        });
        return 'done';

    }).then(function(res) {
        chartManager.setBGMetricDefaults();
        console.log('[INFO] ORE Dashboard init completed');
        return 'done';
    }).catch(function(error) {
            console.error(new Error(error));
    });
}

var drilldownLevels = [
    {name: 'creditrating', level: 0, text: 'Credit Rating'},
    {name: 'counterparty', level: 1, text: 'Counterparty'},
    {name: 'nettingset', level:2, text:'Netting Set'},
    {name: 'trade', level:3, text: 'Trade'}
];

var currencyMap = [
    {ccy: 'BRL', symbol: 'R$'},
    {ccy: 'CNY', symbol: '¥'},
    {ccy: 'CZK', symbol: 'Kč'},
    {ccy: 'DKK', symbol: 'kr'},
    {ccy: 'EUR', symbol: '€'},
    {ccy: 'HUF', symbol: 'Ft'},
    {ccy: 'ISK', symbol: 'kr'},
    {ccy: 'IDR', symbol: 'Rp'},
    {ccy: 'JPY', symbol: '¥'},
    {ccy: 'KRW', symbol: '₩'},
    {ccy: 'NOK', symbol: 'kr'},
    {ccy: 'RUB', symbol: 'руб'},
    {ccy: 'SEK', symbol: 'kr'},
    {ccy: 'CHF', symbol: 'CHF'},
    {ccy: 'GBP', symbol: '£'},
    {ccy: 'USD', symbol: '$'}
];

var chartCategory = [
    {metric: 'npv', category: 'MARKET'},
    {metric: 'ce', category: 'CREDIT'},
    {metric: 'epe', category: 'CREDIT'},
    {metric: 'ene', category: 'CREDIT'},
    {metric: 'pfe', category: 'CREDIT'},
    {metric: 'eepe', category: 'CREDIT'},
    //{metric: 'totalexposure', category: 'CREDIT'},
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
    //{metric: 'im', category: 'LIQUIDITY'},
    {metric: 'vm', category: 'LIQUIDITY'},
    {metric: 'snco', category: 'LIQUIDITY'},
    {metric: 'rsf', category: 'LIQUIDITY'}
];

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

var chartManager = {

    initAllCharts: function() {
        LINECharts.getInstance().initAllCharts();
        BARCharts.getInstance().initAllCharts();
        DONUTCharts.getInstance().initAllCharts();
        RISKGauge.getInstance().initAllCharts();
        return Promise.resolve('done');
    }
    , initChart: function(chartTagName_, options, data_, fnLoadData_, clickable) {
        // once data is resolved, render it
        return Promise.resolve(data_).then(function(res){
            // console.debug( chartTagName_, data_ );

            var theChart_ = echarts.init(document.getElementById(chartTagName_), theme);
            theChart_.setOption(options);
            if (clickable)
                theChart_.on('click', chartManager.drilldownChartClick);
            fnLoadData_(theChart_, res);
            return ['done', 'initChart', chartTagName_];
        });
    }
   , getDataFromRestCall: function(url_) {

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
            .then(function(response) {
                // console.debug(response);
                return response;
            })
            .catch(function(ex) {
                StackTrace.fromError(ex)
                    .then(console.error);
                return Promise.reject(ex);
            })
    }
    , setBaseCcy: function() {
        return chartManager.getDataFromRestCall('/api/baseccy')
            .then(function(response) {
                sessionStorage.setItem('baseccy', response || 'USD');
                return response;
            })
    }
    , getBaseCcy: function() {
        var ccy_ = sessionStorage.getItem('baseccy');
        if (isNullOrUndefined(ccy_)){
            ccy_ = Promise.resolve(chartManager.setBaseCcy());
        }
        var symbol_ = filter(currencyMap, function(elem){return elem.ccy === ccy_;})[0].symbol;
        return symbol_;
    }
    , populateBusinessDates: function() {
        try {
            var sel = document.getElementById('businessDates');
            // zero out the existing options
            sel.options.length = 0;

            var fragment = document.createDocumentFragment();
            return chartManager.getDataFromRestCall('/api/dates')
                .then(function(response) {
                    response.forEach(function(dcc, index) {
                        var opt = document.createElement('option');
                        // nice format for the user to see
                        opt.innerHTML = moment(dcc, 'YYYYMMDD').format('DD-MMM-YYYY');
                        // nice format for the computer to see
                        opt.value = dcc;
                        fragment.appendChild(opt);
                    });
                    sel.appendChild(fragment);

                    sessionStorage.setItem('businessDate', businessDates.options[0].value );
                    return 'done';
                }).catch(function(e) {
                    return Promise.reject(new Error(e));
                })
        } catch (e) {
            console.error(new Error(e));
        }
    }
    , populateBarGraphMetricList : function(element) {
        try {
            // var sel = document.getElementById('businessDates');
            var sel = element;
            // zero out the existing options
            sel.options.length = 0;
            var fragment = document.createDocumentFragment();

            ["CE",'EEPE','CVA','DVA','NPV','FCA','FBA','FVA','ColVA'].forEach(function(dcc, index) {
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
    }
    , flipChart : function(evt) {
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;

        // refresh the single chart with the right metric
        // redraw the barGraph with a new metric
        var bgInstance = BARCharts.getInstance();
        var graphId_ = filter(barGraphs, function(elem){return elem.name == target.name})[0].id;
        var metric_ = chartManager.getBarGraphMetric(target.name);

        if (1 == chartManager.getMode())
            var hierarchy = chartManager.getHierarchy();
        else
            var hierarchy = drilldownLevels[chartManager.getDrillDownLevel()-1].name;

        var args = {
            mode: chartManager.getMode(),
            hierarchy: hierarchy,
            node: chartManager.getNode()
        };

        var p_ = chartManager.getGraphData(args, metric_, 'bargraph');
        p_.then(function(res) {
            var clickable = chartManager.getDrillDownLevel() < 3;
            chartManager.initChart(graphId_, bgInstance.getDefaults, p_, bgInstance.setNewData, clickable);
            // lookup the category in the chartCategories array
            var cat_ = filter(chartCategory, function(elem){return elem.metric == metric_;});
            document.getElementById(graphId_).parentNode.parentNode.getElementsByTagName('h2')[0].innerText = cat_[0].category;
        }).catch(function(err) {
            // FIXME if the chart flip returns no data or an error, revert the change
            // with a popup?
            console.error(new Error(err));
        });
    }
    , getGenericGraphData : function(args_) {
        console.debug(args_);
        if (1 == args_.mode) {
            // display all of the nodes in the chosen hierarchy
            if ('bargraph' === args_.chartType) {
                return '/api/bargraph/' + args_.date + '/' + args_.hierarchy + '/' + args_.metric;
            } else if ('xva' === args_.chartType) {
                return '/api/xva/' + args_.date + '/' + args_.hierarchy + '/' + args_.metric;
            } else if ('exposure' === args_.chartType) {
                // exposure does not support hierarchy view, just display the root node.
                return '/api/exposure-tree/' + args_.date + '/total/Total';
            } else if ('totalexposure' === args_.chartType) {
                // totalexposure does not support hierarchy view, just display the root node.
                return '/api/totalexposure-tree/total/Total';
            } else {
                throw "Invalid chart type : " + args_.chartType;
            }
        } else if (2 == args_.mode) {
            // display all of the children of the selected node
            if ('bargraph' === args_.chartType) {
                return '/api/bargraph-tree/' + args_.date + '/' + args_.hierarchy + '/' + args_.node + "/" + args_.metric;
            } else if ('xva' === args_.chartType) {
                return '/api/xva-tree/' + args_.date + '/' + args_.hierarchy + '/' + args_.node + "/" + args_.metric;
            } else if ('exposure' === args_.chartType) {
                return '/api/exposure-tree/' + args_.date + '/' + args_.hierarchy + '/' + args_.node;
            } else if ('totalexposure' === args_.chartType) {
                return '/api/totalexposure-tree/' + args_.hierarchy + '/' + args_.node;
            } else {
                throw "Invalid chart type : " + args_.chartType;
            }
        } else {
            throw "Invalid mode : " + args_.mode;
        }
    }
    , getBusinessDate : function() {
        return sessionStorage.getItem('businessDate')/* || businessDate.value*/;
    }
    , getHierarchy : function() {
        return drilldownLevels[chartManager.getDrillDownLevel()].name;
    }
    , setNode : function(i) {
        sessionStorage.setItem('node', i);
    }
    , getNode : function() {
        return sessionStorage.getItem('node');
    }
    , getBarGraphMetric : function(id_) {
        var default_ = filter(barGraphs, function(elem){return elem.name == id_});
        return (sessionStorage.getItem(id_) || default_[0].metric).toLowerCase();
    }
    , getGraphData : function(args, metric_, chartType_) {
        // deep copy
        //var localArgs = JSON.parse(JSON.stringify(args));
        var localArgs = args;
        localArgs.metric = metric_;
        localArgs.chartType = chartType_;
        localArgs.date = chartManager.getBusinessDate();

        var url_ = chartManager.getGenericGraphData(localArgs);
        // returns a promise (future)
        return chartManager.getDataFromRestCall(url_);
    }
    , refreshGraphs : function(args) {
        // console.debug(args);
        var bgInstance = BARCharts.getInstance();
        var xvInstance = DONUTCharts.getInstance();
        var lineInstance = LINECharts.getInstance();

        barGraphs.forEach(function(elem) {
            var metric_ = chartManager.getBarGraphMetric(elem.name);
            var p_ = chartManager.getGraphData(args, metric_, 'bargraph');

            p_.then(function(res) {
                var clickable = chartManager.getDrillDownLevel() < 3;
                chartManager.initChart(elem.id, bgInstance.getDefaults, p_, bgInstance.setNewData, clickable);
                // lookup the category in the chartCategories array
                var cat_ = filter(chartCategory, function(elem){return elem.metric == metric_;});
                document.getElementById(elem.id).parentNode.parentNode.getElementsByTagName('h2')[0].innerText = cat_[0].category;
            });
        });

        // Only rerender donut graphs if a) hierarchy mode, nettingset or above or b) tree mode, counterparty or above
        if ((1 == args.mode && chartManager.getDrillDownLevel() < 3) || (2 == args.mode && chartManager.getDrillDownLevel() < 2)) {
            xvaGraphs.forEach(function(elem) {
                var p_ = chartManager.getGraphData(args, elem.metric, 'xva');
                p_.then(function(res) {
                    chartManager.initChart(elem.name, xvInstance.getDefaults, p_, xvInstance.setNewData, true);
                    var titleText_ = elem.text + " : " + chartManager.getBaseCcy() + ' ' + numeral(res.sum).format('(0.00a)');
                    document.getElementsByName(elem.name)[0].innerText = titleText_;
                });
            });
        }

        var totexp_ = chartManager.getGraphData(args, '', 'totalexposure');
        totexp_.then(function(res) {
            chartManager.initChart('line_total_exposure', lineInstance.getDefaultTotalOptions, totexp_, lineInstance.setNewData, false);
        });

        var exp_ = chartManager.getGraphData(args, '', 'exposure');
        exp_.then(function(res) {
            chartManager.initChart('line_exposure_profile', lineInstance.getDefaultExposureOpts, exp_, lineInstance.setNewData, false);
        });

        return 'done';

    }
    , setBGMetricDefaults : function() {
        var nodes = document.getElementsByClassName('selectpicker-bg');
        // set initial values
        barGraphs.forEach(function(elem) {
            sessionStorage.setItem(elem.name, elem.metric.toUpperCase());
            filter(nodes,function(e){return e.name == elem.name})[0].value = elem.metric.toUpperCase();
        });
    }
    , resetPageDefaults : function() {
        // set the business date dropdown to item 0
        var nodes = document.getElementsByClassName('selectpicker');
        [].forEach.call(nodes,function(e) {
            e.selectedIndex = 0;
        });

        // set initial values
        chartManager.setMode(1);
        var bus_ = businessDates.options[businessDates.selectedIndex].value ;
        sessionStorage.setItem('businessDate', bus_);
        chartManager.setDrillDownLevel(0);
        chartManager.setNode('');

        chartManager.setBGMetricDefaults();
    }
    // change of business date
    , changeDate : function(evt) {
        if (isNullOrUndefined(evt))
            return;

        // save the value selected in the dropdown.
        // at present the value in question is always the business date.
        evt = evt || window.event;
        var target = evt.target || evt.srcElement;
        sessionStorage.setItem(target.name, target.value);
        document.getElementById(target.name).value = target.value;

        // At present the test below is always true because this
        // function is only called for the business date dropdown.
        if (target.name == 'businessDate') {

            // rerender the dashboard with the new date
            // without changing the selected hierarchy.

            if (1 == chartManager.getMode())
                // if we are in hierarchy view then use the selected hierarchy.
                var hierarchy = chartManager.getHierarchy();
            else
                // if we are in tree view then use the hierarchy above
                // (that of the parent node whose children the dashboard is displaying).
                var hierarchy = drilldownLevels[chartManager.getDrillDownLevel()-1].name;

            var args = {
                mode: chartManager.getMode(),
                hierarchy: hierarchy,
                node: chartManager.getNode(),
                drillDown : false
            };
            // Reload the page with the new business date.
            chartManager.drillDown(args);
        }
    }
    , setBGMetric : function(evt) {
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
    , setMode : function(m) {
        sessionStorage.setItem('mode', +m);
    }
    , getMode : function() {
        return +sessionStorage.getItem('mode');
    }
    , setDrillDownLevel : function(e) {
        sessionStorage.setItem('level', +e);
    }
    , getDrillDownLevel : function() {
        return +sessionStorage.getItem('level');
    }
    , setDrilldownMenu : function(level) {
        $('input:radio')[level].checked = true;
        $($('label[name^="option"]')[level]).button('toggle');
        chartManager.setDrillDownLevel(level);
    }
// Function drillDown: Rerender the dashboard, then maybe drill down on the selected node after.
//
//  var args = {
//      mode: xxx,          1=hierarchy (view all nodes in selected level) 2=tree (view children of selected node)
//      hierarchy: xxx,     if mode=1, this is the selected hierarchy, if mode=2 this is the hierarchy of the parent node
//      node: xxx,          if mode=1, this value is ignored and should be set to '', if node=2 this is the selected node
//      drillDown : xxx     if mode=2 you can set this to true to drill down on the selected node after the rerender
//  };
    , drillDown : function(args) {
        // the key value from the graph that was clicked - the data point
        Promise.resolve(chartManager.refreshGraphs(args)).then(function(res) {
            if (args.drillDown) {
                // if a user clicked the graph, bring the menu into line
                var level = +chartManager.getDrillDownLevel();
                level++;
                chartManager.setDrilldownMenu(level);
            }
        });
    }
    , updateBreadcrumb : function(args) {
        // get the parent tree JSON
        var url_ = '/api/periscope/' + args.hierarchy  + '/' + args.node;
        var parentTree = chartManager.getDataFromRestCall(url_);
        parentTree.then(function(res) {
            // draw the bread crumb items
            chartManager.setCrumbs(res);
        });
    }
    , resetCrumbs : function() {
        var bcList = document.getElementById('periscope');
        while (bcList.firstChild) {
            bcList.removeChild(bcList.firstChild);
        }
        var listItem = document.createElement('li');
        listItem.className="breadcrumb-item";
        var a = document.createElement('a');
        a.href="index.html";
        a.id = "crumb";
        a.setAttribute('data-hierarchy', 'total');
        a.setAttribute('data-item', 'Total');
        a.setAttribute('data-level', '0');
        var i = document.createElement('i');
        i.className="fa fa-home";
        a.appendChild(i);
        listItem.appendChild(a);
        bcList.appendChild(listItem);
    }
    , setCrumbs : function(breadcrumbStack_) {
        // set the breadcrumbs according to the response from the JSON message
        // in periscope rest endpoint
        chartManager.resetCrumbs();
        var bcList = document.getElementById('periscope');

        [].forEach.call(breadcrumbStack_, function(e) {
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
    }
    , breadcrumbClick : function(evt) {
        // user clicked on the menu
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;

        var mode = 2;
        var node = target.getAttribute('data-item');
        var level = target.getAttribute('data-level');
        //var hierarchy = target.getAttribute('data-hierarchy');

        chartManager.setMode(mode);
        chartManager.setNode(node);
        chartManager.setDrillDownLevel(level);

        var args = {
            mode: mode,
            hierarchy: chartManager.getHierarchy(),
            node: node,
            drillDown : true
        };
        chartManager.updateBreadcrumb(args);
        chartManager.drillDown(args);
    }
    , drilldownMenuClick : function(evt) {
        // user clicked on the menu
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;

        var mode = 1;
        var level = target.children[0].value;
        var node = '';

        chartManager.setMode(mode);
        chartManager.setDrillDownLevel(level);
        chartManager.setNode(node);

        var args = {
            mode: mode,
            hierarchy: chartManager.getHierarchy(),
            node: node,
            drillDown : false
        };
        chartManager.resetCrumbs();
        chartManager.drillDown(args);
    }
    , drilldownChartClick : function(evt) {
        // user clicked on the chart
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;

        var mode = 2;
        var node = evt.name;

        if (3 == chartManager.getDrillDownLevel()) {
            // We are already at the lowest hierarchy (trade).
            // The user has selected a netting set from the donut graph.
            // Display the children of the selected netting set,
            // without drilling down further.
            var hierarchy = drilldownLevels[2].name;    // nettingset
            var drillDown = false;
        } else {
            // We are not yet at the bottom of the tree,
            // so drill down on the selected node.
            var hierarchy = chartManager.getHierarchy();
            var drillDown = true;
        }

        chartManager.setMode(mode);
        chartManager.setNode(node);

        var args = {
            mode: mode,
            hierarchy: hierarchy,
            node: node,
            drillDown : drillDown
        };
        chartManager.updateBreadcrumb(args);
        chartManager.drillDown(args);
    }
}

// StackTrace.instrument(chartManager.drillDown, StackTraceCallback, StackTraceErrback);

var StackTraceCallback = function(stackframes) {
    var stringifiedStack = stackframes.map(function(sf) {
        return sf.toString();
    }).join('\n');
    console.log(stringifiedStack);
};

var StackTraceErrback = function(err) { console.log(err.message); };

