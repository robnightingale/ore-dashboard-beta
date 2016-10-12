/**
 * Created by robnightingale on 03/09/2016.
 */
// **A few simple helper methods to help you do object-oriented javascript**
//
// *Author*: Arjan van der Gaag
// *URL*: [http://avdgaag.github.com/oo](http://avdgaag.github.com/oo)
// *License*: MIT license
// *Version*: 0.1.0
//
// ---
//
// ## Installation
//
// Simple include the script on your page:
//
//     <script src="oo.js"></script>
//
// ...or `require` it in your node.js project:
//
//     var OO = require('oo.js');
//
// This library is not yet published as an NPM package, but you can download it
// manually and install it yourself if you want to using `npm install`. Once I
// can think of a better name, I might release it as a package.
//
// ## Usage example
//
//     var Parent = (function() {
//         function Parent(foo) {
//             this.foo = foo;
//             this.getFoo = OO.bind(this, this.getFoo);
//         }
//         Parent.prototype.getFoo = function() {
//             return this.foo;
//         };
//         return Parent;
//     })();
//
//     var Module = {
//         getBar: function() {
//             return this.bar;
//         }
//     };
//
//     var Child = (function() {
//         OO.inherits(Child, Parent);
//         OO.include(Child, Module);
//         function Child(foo, bar) {
//             Child.__super__.constructor.call(this, foo);
//             this.bar = bar;
//         }
//         Child.prototype.getFoo = function() {
//             return Child.__super__.getFoo.call(this) + '!';
//         };
//     })();
//
// Use properties like normal, even those that are set using the
// parent's constructor function:
//
//     var c = new Child('a', 'b');
//     c.foo; // => 'a'
//     c.bar; // => 'b'
//
// Note how the child object decorates the parent object:
//
//     c.getFoo(); // => 'a!'
//
// Also note that a method can be bound to an object:
//
//     c.getFoo.call({ foo: 'c' }); // => 'a!'
//
// Finally, we have mixed in a module, so its properties become available:
//
//     c.getBar(); // => 'b'
//

// ---
(function() {
    var OO = {

        // ### Generics

        // Publish the current version of the library, should you ever
        // need it at runtime.
        version: '0.1.0',

        // ### OO helper methods

        // Extend one object with the properties of another.
        //
        // This essentially mixes in all properties of `guest` into `host`,
        // which is not only great for merging hashes but also allowing objects
        // to include modules.
        extend: function(host, guest) {
            for(var key in guest) {
                if(guest.hasOwnProperty(key)) {
                    host[key] = guest[key];
                }
            }
        },

        // Include a module into this class
        //
        // This is a variety of extend that works on an objects `prototype`
        // property rather than the object itself. The following are
        // equivalent:
        //
        //     extend(Host.prototype, Module);
        //     include(Host, Module);
        //
        include: function(host, guest) {
            this.extend(host.prototype, guest);
        },

        // Simulate inheritence of one object (`child`) from another (`parent`).
        //
        // This creates a _ghost-class_ that shares its prototype with the
        // parent, and an instanceof which acts as prototype for the child.
        // This allows the child to share the prototype properties of the
        // parent, without being able to modify them directly (we don't want
        // them to be _the same_ properties).
        //
        // Furthermore, this extends the child constructor itself with any
        // properties of the parent constructor, and it sets a `__super__`
        // property that allows access to the parent functions, enabling the
        // child to decorate its parent's functions.
        inherits: function(child, parent) {
            this.extend(child, parent);
            function Ghost() { this.constructor = child; }
            Ghost.prototype = parent.prototype;
            child.prototype = new Ghost;
            child.__super__ = parent.prototype;
        },

        // Bind a function to a particular context.
        //
        // Being able to dynamically set the execution context of a function
        // using `call` or `apply` is really handy, but when your functions are
        // assumed to be method objects, they really need to maintain access to
        // their object's state. Using `bind` you can force a context on a
        // function.
        //
        // Example:
        //
        //     var obj = {
        //       foo: 'bar',
        //       speak: function() { return this.foo; }
        //     };
        //     obj.speak(); // => 'bar'
        //     obj.speak.call({ foo: 'qux' }) // => 'qux'
        //     obj.speak = bind(obj, obj.speak);
        //     obj.speak.call({ foo: 'qux' }) // => 'bar'
        //
        bind: function(context, fn) {
            return function() {
                return fn.apply(context, arguments);
            };
        },

        // ### Observable
        //
        // Observable is a really simple mixin implementing the observer pattern,
        // allowing arbitrary observers to attach themselves to an object and
        // be notified of events that occur in that object.
        //
        // You can include the Observable behaviour in your own objects by mixing
        // it in:
        //
        //     var obj = {};
        //     OO.extend(obj, OO.Observable);
        //
        // Or, when using the class pattern, include it in every instance:
        //
        //     var Obj = (function() {
        //       OO.include(Obj, OO.Observable);
        //
        //       function Obj() {
        //       }
        //
        //       return Obj;
        //     });
        //
        // Once mixed in, your object can use the `trigger` function to notify all
        // observers of a particular event -- passing along any extra arguments.
        // Observers can register callback functions for named events using `on` or
        // remove callback functions using `off`.
        //
        // The internal list of callback functions is stored in the `_callbacks` property.
        Observable: {

            // Bind a callback function to a given event on this object
            //
            // Example:
            //
            //     var my_callback = function() {
            //       console.log('The object has been initialized');
            //     };
            //     my_object.on('initialize', my_callback);
            //
            on: function(event, callback) {
                var callbacks = this._callbacks  || (this._callbacks = {}),
                    list      = callbacks[event] || (callbacks[event] = []);
                list.push(callback);
                return this;
            },

            // Remove a callback function from the list of event handlers of
            // this object.
            //
            // When not given a particular event name, all observers will be
            // removed. When not given a particular callback function, all
            // callback functions will be removed.
            //
            // Example:
            //
            //     my_object.off('initialize', my_callback);
            //
            off: function(event, callback) {
                var callbacks;
                if(!event) {
                    delete this._callbacks;
                } else if (callbacks = this._callbacks) {
                    if(callback) {
                        delete callbacks[event];
                    } else {
                        callbacks[event].splice(callbacks[event].indexOf(callback), 1);
                    }
                }
                return this;
            },

            // Invoke all observers of this object for the given event name
            //
            // Any extra arguments passed to `trigger` will be passed on to the
            // callback function.
            //
            // Example:
            //
            //     var obj = {
            //       change: function() {
            //         this.trigger('change', 'Hello, world!');
            //       }
            //     };
            //     obj.on('change', function(msg) {
            //       alert(msg);
            //     };
            //
            trigger: function(event) {
                var callbacks, list, args;
                if((callbacks = this._callbacks) && (list = callbacks[event])) {
                    args = Array.prototype.slice.call(arguments, 1);
                    for(var i = 0, l = list.length; i < l; list[i++].apply(this, args));
                }
                return this;
            }
        }
    };

    // ### Exporting to gobal object

    // Make the OO object available on the window object -- the global
    // object when running inside a browser -- or as an export, so you
    // can use it as a CommonJS module.
    if(typeof module === 'undefined' || !module.exports) {
        window.OO = OO;
    } else {
        module.exports = OO;
    }
})();

/*
 *  Copyright (C) 2016 Quaternion Risk Management Ltd
 *  All rights reserved
 *
 */

/**
 * Created by robnightingale on 01/08/2016.
 */
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

/*
 *  Copyright (C) 2016 Quaternion Risk Management Ltd
 *  All rights reserved
 *
 */

"use strict";

var donutZoom = function(graphId, xvaHierarchy, xvaNode) {

    var args = {
        mode: chartManager.getMode(),
        xvaHierarchy: xvaHierarchy,
        xvaNode: xvaNode
    };

    var p_ = chartManager.getGraphData(args, graphId, 'xva');
    chartManager.initChart('donut_xva', DONUTCharts.getInstance().getDefaults, p_, DONUTCharts.getInstance().setNewData, false);

    var parentHeader = document.getElementsByName('donut_' + graphId)[0];
    document.getElementById('myModalLabel2').innerText = parentHeader.innerText;
}

var load_ = function() {
    // load the page
    // build business date list
    // initialise all the charts
    // attach change event handlers to the dropdown controls
    console.log('[INFO] ORE Dashboard.init');

    // turn the limit toggle into a switch control
    var elem = document.getElementById('limitToggle');
    var init = new Switchery(elem, {size: 'small', color:'#73879C'});
    // add a click event handler for the button to show/hide limits.
    _AttachEvent(elem, 'change', chartManager.toggleLimitsClick);

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

        var e = document.getElementById('gauge1_');
        chartManager.populateRiskGaugeMetricListImpl(e);
        _AttachEvent(e, 'change', chartManager.setRiskGaugeMetric);

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

            // Determine what parameters to pass to donutZoom().
            if (1 == chartManager.getMode()) {
                // HIERARCHY MODE: if the chosen hierarchy is trade then use nettingset instead.
                var level = Math.min(chartManager.getLevel(), 2);
                var xvaHierarchy = drilldownLevels[level].name;
                donutZoom(graphId, xvaHierarchy, '');
            } else {
                // TREE MODE: retrieve the stack, if we are below counterparty then use the (grand)parent counterparty.
                // NB: This copies some logic that is also implemented in fuction drillDown() - maybe consolidate?
                var url_ = '/api/periscope/' + chartManager.getHierarchy()  + '/' + chartManager.getNode();
                chartManager.getDataFromRestCall(url_).then(function(res) {
                    // Donut graphs don't go below nettingset level (i.e. displaying the children of a counterparty).
                    if (res.length > 1) {
                        // Set the donut graph hierarchy to "counterparty":
                        var xvaHierarchy = res[1].hierarchy;
                        // Set the donut graph node to whichever counterparty is the (grand)parent of the selected node:
                        var xvaNode = res[1].item;
                    } else {
                        // We are at nettingset level or above, so the donut graphs just display the selected node:
                        var xvaHierarchy = chartManager.getHierarchy();
                        var xvaNode = chartManager.getNode();
                    }
                    donutZoom(graphId, xvaHierarchy, xvaNode);
                });
            }
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
    {metric: 'npv', category: 'MARKET', tradeLevel:true},
    {metric: 'ce', category: 'CREDIT', tradeLevel:true},
    {metric: 'epe', category: 'CREDIT', tradeLevel:true},
    {metric: 'ene', category: 'CREDIT', tradeLevel:true},
    {metric: 'pfe', category: 'CREDIT', tradeLevel:true},
    {metric: 'eepe', category: 'CREDIT', tradeLevel:true},
    //{metric: 'totalexposure', category: 'CREDIT', tradeLevel:true},
    {metric: 'cva', category: 'CREDIT', tradeLevel:false},
    {metric: 'dva', category: 'CREDIT', tradeLevel:false},
    {metric: 'saccr', category: 'CREDIT', tradeLevel:true},
    {metric: 'el', category: 'CREDIT', tradeLevel:true},
    {metric: 'uel', category: 'CREDIT', tradeLevel:true},
    {metric: 'var', category: 'MARKET', tradeLevel:true},
    {metric: 'es', category: 'MARKET', tradeLevel:true},
    {metric: 'fca', category: 'LIQUIDITY', tradeLevel:false},
    {metric: 'fba', category: 'LIQUIDITY', tradeLevel:false},
    {metric: 'fva', category: 'LIQUIDITY', tradeLevel:false},
    {metric: 'colva', category: 'LIQUIDITY', tradeLevel:false},
    {metric: 'mva', category: 'LIQUIDITY', tradeLevel:false},
    //{metric: 'im', category: 'LIQUIDITY', tradeLevel:true},
    {metric: 'vm', category: 'LIQUIDITY', tradeLevel:true},
    {metric: 'snco', category: 'LIQUIDITY', tradeLevel:true},
    {metric: 'rsf', category: 'LIQUIDITY', tradeLevel:true}
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
            var theChart_ = echarts.init(document.getElementById(chartTagName_), theme);
            theChart_.setOption(options);
            if (clickable)
                theChart_.on('click', chartManager.drilldownChartClick);
            fnLoadData_(theChart_, res);
            return ['done', 'initChart', chartTagName_];
        });
    },
    getChartInstanceFromDivId: function (chartTagName_) {
        return echarts.getInstanceByDom(document.getElementById(chartTagName_));
    },
    getDataFromRestCall: function(url_) {

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
                return Promise.reject(ex);
            })
    }
    , toggleLimitsClick : function(evt) {

        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;

        // flip the hide/show limits flag.
        var onOrOff = target.checked ? 1:0;
        chartManager.toggleLimits(onOrOff);

        // rerender the dashboard with the new limits flag
        // without changing anything else.
        var args = {
            mode: chartManager.getMode(),
            level: chartManager.getLevel(),
            node: chartManager.getNode()
        };
        chartManager.drillDown(args);
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
                    var opt = new Option();
                    opt.innerHTML = '- Date -';
                    opt.value = '19700101';
                    fragment.appendChild(opt);

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
            var sel = element;
            // zero out the existing options
            sel.options.length = 0;
            var fragment = document.createDocumentFragment();

            ['CE','EEPE','CVA','DVA','NPV','FCA','FBA','FVA','ColVA'].forEach(function(dcc, index) {
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
    , populateRiskGaugeMetricList : function() {
        var e = document.getElementById('gauge1_');
        chartManager.populateRiskGaugeMetricListImpl(e);
    }
    , populateRiskGaugeMetricListImpl : function(element) {
        try {
            // zero out the existing options
            element.options.length = 0;
            var fragment = document.createDocumentFragment();

            // Restrict the Risk Gauge drop down to the list of options for which
            // both Metric and Limit are available given the selected mode / level.
            if (2==chartManager.getMode() && 3==chartManager.getLevel())
                // If we are in tree view, and looking at a trade, then only CE and EEPE are available:
                var choiceList = ['CE','EEPE'/*,'CVA','DVA','NPV','FCA','FBA','FVA','ColVA'*/];
            else
                // In all other cases (hierarchy view, or other tree views) we can see everything except NPV and ColVA:
                var choiceList = ['CE','EEPE','CVA','DVA'/*,'NPV'*/,'FCA','FBA','FVA'/*,'ColVA'*/];

            // If possible, preserve the currently selected metric.
            var previouslySelectedMetric = chartManager.getRiskGaugeMetric().toUpperCase();
            var metricReused = false;

            choiceList.forEach(function(dcc, index) {
                var opt = document.createElement('option');
                // nice format for the user to see
                opt.innerHTML = dcc;
                // nice format for the computer to see
                opt.value = dcc;

                // If the current item matches the previously selected one then select it.
                if (!metricReused && dcc === previouslySelectedMetric) {
                    opt.selected = true;
                    metricReused = true;
                }

                fragment.appendChild(opt);
            });
            element.appendChild(fragment);

            // If the previous selection could not be kept then reset to CE.
            if (!metricReused)
                sessionStorage.setItem('gauge_metric', 'ce');
        } catch (e) {
            console.error(new Error(e));
        }
    }
    , flipGauge : function(evt) {
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;

        // refresh the single chart with the right metric
        // redraw the gauge with a new metric
        var gaugeInstance = RISKGauge.getInstance();
        var metric_ = chartManager.getRiskGaugeMetric();

        var args = {
            mode: chartManager.getMode(),
            hierarchy: chartManager.getHierarchy(),
            node: chartManager.getNode()
        };

        var p_ = chartManager.getGraphData(args, metric_, 'gauge');
        p_.then(function(res) {
            chartManager.initChart('risk_gauge', gaugeInstance.getDefaults, p_, gaugeInstance.setNewData, false);
        }).catch(function(err) {
            console.error(new Error(err));
        });
    },
    setBarGraphTitle : function(graphId_, cat_){
        var instance_ = chartManager.getChartInstanceFromDivId(graphId_);
        var titleText_ = '';
        if (chartManager.getLevel() ==3 && cat_[0].tradeLevel == false)
            titleText_ = 'Not Applicable at Trade Level';

        instance_.setOption({title: [{text: titleText_}]});
    }, flipChart : function(evt) {
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;

        // refresh the single chart with the right metric
        // redraw the barGraph with a new metric
        var bgInstance = BARCharts.getInstance();
        var graphId_ = filter(barGraphs, function(elem){return elem.name == target.name})[0].id;
        var metric_ = chartManager.getBarGraphMetric(target.name);

        var args = {
            mode: chartManager.getMode(),
            hierarchy: chartManager.getHierarchy(),
            node: chartManager.getNode()
        };

        var p_ = chartManager.getGraphData(args, metric_, 'bargraph');
        p_.then(function(res) {
            chartManager.initChart(graphId_, bgInstance.getDefaults, p_, bgInstance.setNewData, chartManager.barGraphIsClickable());
            return 'done';
        }).then(function(res){
            // lookup the category in the chartCategories array
            var cat_ = filter(chartCategory, function (elem) {
                return elem.metric == metric_;
            });
            document.getElementById(graphId_).parentNode.parentNode.getElementsByTagName('h2')[0].innerText = cat_[0].category;
            chartManager.setBarGraphTitle(graphId_, cat_);
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
                return '/api/xva/' + args_.date + '/' + args_.xvaHierarchy + '/' + args_.metric;
            } else if ('exposure' === args_.chartType) {
                // exposure does not support hierarchy view, just display the root node.
                return '/api/exposure-tree/' + args_.date + '/total/Total';
            } else if ('totalexposure' === args_.chartType) {
                // totalexposure does not support hierarchy view, just display the root node.
                return '/api/totalexposure-tree/total/Total';
            } else if ('gauge' === args_.chartType) {
                // gauge does not support hierarchy view, just display the root node.
                return '/api/gauge-tree/' + args_.date + '/total/Total/' + args_.metric;
            } else {
                throw "Invalid chart type : " + args_.chartType;
            }
        } else if (2 == args_.mode) {
            // display all of the children of the selected node
            if ('bargraph' === args_.chartType) {
                return '/api/bargraph-tree/' + args_.date + '/' + args_.hierarchy + '/' + args_.node + "/" + args_.metric;
            } else if ('xva' === args_.chartType) {
                return '/api/xva-tree/' + args_.date + '/' + args_.xvaHierarchy + '/' + args_.xvaNode + "/" + args_.metric;
            } else if ('exposure' === args_.chartType) {
                return '/api/exposure-tree/' + args_.date + '/' + args_.hierarchy + '/' + args_.node;
            } else if ('totalexposure' === args_.chartType) {
                return '/api/totalexposure-tree/' + args_.hierarchy + '/' + args_.node;
            } else if ('gauge' === args_.chartType) {
                return '/api/gauge-tree/' + args_.date + '/' + args_.hierarchy + '/' + args_.node + "/" + args_.metric;
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
        return drilldownLevels[chartManager.getLevel()].name;
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
    , getRiskGaugeMetric : function() {
        return sessionStorage.getItem('gauge_metric');
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
        var gaugeInstance = RISKGauge.getInstance();

        barGraphs.forEach(function(elem) {
            var metric_ = chartManager.getBarGraphMetric(elem.name);
            var p_ = chartManager.getGraphData(args, metric_, 'bargraph');

            p_.then(function(res) {
                chartManager.initChart(elem.id, bgInstance.getDefaults, p_, bgInstance.setNewData, chartManager.barGraphIsClickable());
                return 'done';
            }).then(function(res){
                // lookup the category in the chartCategories array
                var cat_ = filter(chartCategory, function(elem){return elem.metric == metric_;});
                document.getElementById(elem.id).parentNode.parentNode.getElementsByTagName('h2')[0].innerText = cat_[0].category;
                chartManager.setBarGraphTitle(elem.id,cat_);
            });
        });

        xvaGraphs.forEach(function(elem) {
            var p_ = chartManager.getGraphData(args, elem.metric, 'xva');
            p_.then(function(res) {
                chartManager.initChart(elem.name, xvInstance.getDefaults, p_, xvInstance.setNewData, true);
                var titleText_ = elem.text + " : " + chartManager.getBaseCcy() + ' ' + numeral(res.sum).format('(0.00a)');
                document.getElementsByName(elem.name)[0].innerText = titleText_;
            });
        });

        var totexp_ = chartManager.getGraphData(args, '', 'totalexposure');
        totexp_.then(function(res) {
            chartManager.initChart('line_total_exposure', lineInstance.getDefaultTotalOptions, totexp_, lineInstance.setNewData, false);
        });

        var exp_ = chartManager.getGraphData(args, '', 'exposure');
        exp_.then(function(res) {
            chartManager.initChart('line_exposure_profile', lineInstance.getDefaultExposureOpts, exp_, lineInstance.setNewData, false);
        });

        var metric_ = chartManager.getRiskGaugeMetric();
        var gauge_ = chartManager.getGraphData(args, metric_, 'gauge');
        gauge_.then(function(res) {
            chartManager.initChart('risk_gauge', gaugeInstance.getDefaults, gauge_, gaugeInstance.setNewData, false);
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
        // set the business date dropdown to item 1
        var nodes = document.getElementsByClassName('selectpicker');
        [].forEach.call(nodes,function(e) {
            e.selectedIndex = 1;
        });

        // set initial values
        chartManager.setMode(1);
        var bus_ = businessDates.options[businessDates.selectedIndex].value ;
        sessionStorage.setItem('businessDate', bus_);
        chartManager.setLevel(0);
        chartManager.setNode('');

        chartManager.setBGMetricDefaults();
        sessionStorage.setItem('gauge_metric', 'ce');
        sessionStorage.setItem('limits', 1);
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

            var args = {
                mode: chartManager.getMode(),
                level: chartManager.getLevel(),
                node: chartManager.getNode()
            };
            // Reload the page with the new business date.
            chartManager.drillDown(args);
        }
    }
    // Should the bar graphs be clickable?
    // If mode=1 (hierarchy) then the bar graphs are always clickable.
    // If mode=2 (tree) then the bar graphs are clickable as long as we are above trade level.
    , barGraphIsClickable : function() {
        return 1 == chartManager.getMode() || chartManager.getLevel() < 3;
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
    , setRiskGaugeMetric : function(evt) {
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;
        sessionStorage.setItem('gauge_metric', target.value.toLowerCase());
        chartManager.flipGauge(evt);
        //var default_ = filter(userRiskGauges, function(elem){return elem.name == target.name});
        //default_[0].metric = target.value.toLowerCase();
    }
    , setMode : function(m) {
        sessionStorage.setItem('mode', +m);
    }
    , getMode : function() {
        return +sessionStorage.getItem('mode');
    }
    , setLevel : function(e) {
        sessionStorage.setItem('level', +e);
    }
    , getLevel : function() {
        return +sessionStorage.getItem('level');
    }
    , setDrilldownMenu : function(level) {
        $('input:radio')[level].checked = true;
        $($('label[name^="option"]')[level]).button('toggle');
    }
    , toggleLimits : function(onOrOff) {
            sessionStorage.setItem('limits', onOrOff);
    }
    , getLimits : function() {
        return sessionStorage.getItem('limits');
    }
// Function drillDown:  Rerender the dashboard.
//                      Whether or not this actually drills down depends on whether the caller incremented the level.
//
//  var args = {
//      mode: xxx,          1=hierarchy (view all nodes in selected level) 2=tree (view children of selected node)
//      level: xxx,         The level of the hierarchy to be displayed.
//      node: xxx,          if mode=1, this value is ignored and should be set to '', if node=2 this is the selected node
//  };
    , drillDown : function(args) {

        // Save the new state.
        chartManager.setMode(args.mode);
        chartManager.setLevel(args.level);
        chartManager.setNode(args.node);

        // Repopulate the dropdown for the risk gauge.
        chartManager.populateRiskGaugeMetricList();

        if (1 == args.mode) {
            // Hierarchy view - display all nodes in selected level.
            args.hierarchy = chartManager.getHierarchy();
            // Donut graphs don't go below nettingset level.
            args.xvaHierarchy = 'trade' == args.hierarchy ? 'nettingset' : args.hierarchy;
            // Delete the breadcrumbs.
            chartManager.resetCrumbs();
            // Rerender the page.
            chartManager.refreshGraphs(args);
        } else {
            // Tree view - display all children of selected node.
            args.hierarchy = chartManager.getHierarchy();
            // Mark the corresponding radio button as pressed (hierarchy view).
            chartManager.setDrilldownMenu(args.level);
            // Retrieve the stack leading to the selected node.
            var url_ = '/api/periscope/' + args.hierarchy  + '/' + args.node;
            chartManager.getDataFromRestCall(url_).then(function(res) {
                // Donut graphs don't go below nettingset level.
                if (res.length > 1) {
                    // Set the donut graph hierarchy to "counterparty":
                    args.xvaHierarchy = res[1].hierarchy;
                    // Set the donut graph node to whichever counterparty is the parent of the selected node:
                    args.xvaNode = res[1].item;
                } else {
                    // We are at nettingset level or above, so the donut graphs just display the selected node:
                    args.xvaHierarchy = args.hierarchy;
                    args.xvaNode = args.node;
                }
                // Update the breadcrumbs.
                chartManager.setCrumbs(res);
                // Rerender the page.
                chartManager.refreshGraphs(args);
            });
        };
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
        var level = Math.min(+target.getAttribute('data-level'), 3);
        //var hierarchy = target.getAttribute('data-hierarchy');

        var args = {
            mode: mode,
            level: level,
            node: node
        };
        chartManager.drillDown(args);
    }
    , drilldownMenuClick : function(evt) {
        // user clicked on the menu
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        var target = evt.target || evt.srcElement;

        var args = {
            mode: 1,
            level: target.children[0].value,
            node: ''
        };
        chartManager.drillDown(args);
    }
    , drilldownChartClick : function(evt) {
        // user clicked on the chart
        if (isNullOrUndefined(evt))
            return;

        evt = evt || window.event;
        console.log(evt);

        // Determine the level for the new render.
        if (1 == chartManager.getMode())
            // Changing from hierarchy to tree.  Don't drill down.
            var level = chartManager.getLevel();
        else
            // Already in tree, drill down to next level.
            var level = chartManager.getLevel() + 1;
        // If the graph that got clicked on was a donut then don't go below nettingset level.
        if (evt.seriesType === 'pie')
            level = Math.min(level, 2);

        var args = {
            mode: 2,
            level: level,
            node: evt.name
        };
        chartManager.drillDown(args);
    }
}

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

            var dataStyle = {
                normal: {
                    label : {
                        show : true,
                        position: 'insideLeft',
                        formatter: function(params) {
                            // console.debug(params);
                            return params.seriesName == 'limits' ? '' : params.name;
                        }, //'{b}',
                        textStyle : {
                            color: 'black'
                        }
                    },
                    color: function(params) {
                        // red '#C1232B'
                        // salmon '#FE8463'
                        var colorList = [
                            'rgba(120,178,88,0.5)', 'rgba(255, 69, 0, 0.5)'
                        ];
                        return colorList[params.seriesIndex]
                    }
                }
            };

            if (1 == chartManager.getLimits()) {
                localOptions_.series = [
                    {
                        itemStyle: dataStyle,
                        type: data_.seriesType,
                        data: data_.yaxisValues,
                        name: 'bar data'
                    },
                    {
                        itemStyle: dataStyle,
                        type: data_.seriesType,
                        data: data_.yaxisLimits,
                        name: 'limits'
                    }
                ];
                localOptions_.legend.data = ['limits'];
            } else {
                localOptions_.series = [
                    {
                        itemStyle: dataStyle,
                        type: data_.seriesType,
                        data: data_.yaxisValues,
                        name: 'bar data'
                    }
                ];
            }
            localOptions_.title = [{text: data_.title, subtext: data_.subTitleText}];
            localOptions_.yAxis[0].data = data_.yaxisLabels;
            localOptions_.yAxis[0].axisLabel = {show:false};

            chart_.setOption(localOptions_, true);
        }

        var options = {
            tooltip: {
                trigger: 'axis',
                formatter: barChartTooltipFormatter
            },
            legend: {
                data: null
            },
            toolbox: {
                show: false,
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
                        type: ['stack','tiled']
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
            clickable: true,
            xAxis: [{
                type: 'value',
                boundaryGap: false,
                axisLabel:{interval: 'auto', formatter: function(value){
                    return numeral(value).format('(0.0a)');
                }},
            }],
            yAxis: [{
                type: 'category',
                boundaryGap: true,
                axisLabel: {
                    interval: 'auto'
                    , formatter: function (value) {
                        return value;
                    }
                },
                data: []
            }],
            series: null
        };

        function initialiseAllCharts() {
            // set the initial entry point to 'Total' level
            var args = {
                mode: chartManager.getMode(),
                hierarchy: chartManager.getHierarchy(),
                node: chartManager.getNode(),
                xvaHierarchy: chartManager.getHierarchy(),
                xvaNode: chartManager.getNode()
            };

            barGraphs.forEach(function(elem){
                var p_ = chartManager.getGraphData(args, elem.metric, 'bargraph');
                chartManager.initChart(elem.id, options, p_, setNewData, chartManager.barGraphIsClickable());

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
                formatter: lineChartTooltipFormatter
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
                        type: ['line', 'bar']
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

        var exposure_profile_options = {
            title: {
                text: 'Exposure Profile  '  + baseccy_,
                subtext: 'Simulated EPE, ENE & PFE'
            },
            tooltip: {
                trigger: 'axis',
                formatter: lineChartTooltipFormatter
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
                        type: ['line', 'bar']
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
                    return numeral(value).format('(0.0a)');
                }},

            }],
            series: []
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
                series_.push(series_1);
                series_.push(series_2);

                series_.forEach(function (elem) {
                    elem.type = 'line';
                    elem.smooth = true;
                    elem.symbolSize = 1;
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
                var xAxisData_ = data_.dates;

                var data_npvs = [];
                var data_ces = [];
                var data_eepes = [];
                //var data_tes = [];

                // merge in the dates with the data for x axis labels
                for (var j = 0;j< xAxisData_.length;j++){
                    xAxisData_[j] = moment(xAxisData_[j], 'YYYYMMDD').toDate();
                    data_npvs.push([xAxisData_[j], data_.npvs[j]]);
                    data_ces.push([xAxisData_[j], data_.ces[j]]);
                    data_eepes.push([xAxisData_[j], data_.eepes[j]]);
                    //data_tes.push([xAxisData_[j], data_.tes[j]]);
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
                //var series_3 = {
                //    name: "Total",
                //    data: data_tes
                //}

                var series_ = []
                series_.push(series_0);
                series_.push(series_1);
                series_.push(series_2);
                // series_.push((series_3));

                series_.forEach(function (elem) {
                    if (1 == chartManager.getLimits()) {
                        switch (elem.name) {
                            case 'CE' :
                                elem.markLine = {
                                    symbol: ['none','none'],
                                    data: [
                                        {yAxis: +data_.limitCE, name: 'limit', itemStyle: {normal: {color: '#dc143c',
                                            label: {
                                                show: false
                                            },
                                            labelLine: {
                                                show: false
                                            }
                                        }}}
                                    ]};
                                break;
                            case 'EEPE':
                                elem.markLine = {
                                    symbol: ['none','none'],
                                    data: [
                                        {yAxis: +data_.limitEEPE, name: 'limit', itemStyle: {normal: {color: '#dc143c'
                                            ,label: {
                                                show: false
                                            },
                                            labelLine: {
                                                show: false
                                            }
                                    }}}
                                    ]};
                                break;
                            default:
                                break;
                        }
                    }

                    elem.type = 'line';
                    elem.smooth = true;
                    // elem.showAllSymbol= false;
                    elem.symbolSize = 1;
                    elem.itemStyle = {
                        normal: {
                            areaStyle: {
                                type: 'default'
                            }
                        }
                    };
                });

                var localOptions_ = total_exposure_options;
                series_.forEach(function(elem){
                    localOptions_.legend.data.push(elem.name);
                });

                localOptions_.series = series_;
                chart_.setOption(localOptions_, true);
            }
        }

        function initialiseAllCharts() {
            var args = {
                mode: chartManager.getMode(),
                hierarchy: chartManager.getHierarchy(),
                node: chartManager.getNode(),
                xvaHierarchy: chartManager.getHierarchy(),
                xvaNode: chartManager.getNode()
            };
            var totexp_ = chartManager.getGraphData(args, '', 'totalexposure');
            var exp_ = chartManager.getGraphData(args, '', 'exposure');

            return Promise.all([totexp_, exp_]).then(function (values) {
                chartManager.initChart('line_total_exposure', total_exposure_options, totexp_, setNewData, false);
                chartManager.initChart('line_exposure_profile', exposure_profile_options, exp_, setNewData, false);
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

        var donut_cva, donut_fva, donut_colva;
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
                radius: ['40%', '60%'],
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
                mode: chartManager.getMode(),
                hierarchy: chartManager.getHierarchy(),
                node: chartManager.getNode(),
                xvaHierarchy: chartManager.getHierarchy(),
                xvaNode: chartManager.getNode()
            };

            xvaGraphs.forEach(function(elem){
                var p_ = chartManager.getGraphData(args, elem.metric,'xva');
                chartManager.initChart(elem.name, options, p_, setNewData, true);
                p_.then(function(res){
                    var titleText_ = elem.text + " : " + chartManager.getBaseCcy() + ' ' + numeral(res.sum).format('(0.00a)');
                    document.getElementsByName(elem.name)[0].innerText = titleText_;
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

        var options = {
            tooltip: {
                // Function setNewData() (see below) already derived the tooltip, just return it:
                formatter: function(params, ticket, callback) {
                    return params.data.tooltip;
                },
                // The tooltip's default position is to the left of the cursor, which sends it off the screen.
                // So render it a little bit to the right of its default position:
                position : function(p) {
                    return [p[0] + 10, p[1] - 10];
                }
            },
            series: [
                {
                    pointer : {
                        width : 8,
                        length: '85%',
                        color: 'black'
                    },
                    name: 'Risky',
                    type: 'gauge',
                    splitNumber: 10,
                    axisLine: {
                        lineStyle: {
                            // rgba green value matches the olive green of the other charts
                            color: [[0.3, 'rgba(120,178,88,0.5)'], [0.8, 'rgba(255, 150, 0, 0.5)'], [1, 'rgba(255, 69, 0, 0.5)']],
                            width: 200
                        }
                    },
                    axisTick: {
                        splitNumber: 2,
                        length: 10,
                        lineStyle: {
                            color: 'black'
                        }
                    },
                    axisLabel: {
                        formatter: function (v) {
                            switch (v + '') {
                                case '10':
                                    return 'ok';
                                case '50':
                                    return 'warn';
                                case '90':
                                    return 'limit';
                                default:
                                    return '';
                            }
                        },
                        textStyle: {color: 'black'}
                    },
                    splitLine: {
                        show: true,
                        length: 20,
                        lineStyle: {
                            color: 'black'
                        }
                    },
                    title: {
                        show: true,
                        offsetCenter: [0, '-40%'],
                        textStyle: {
                            fontWeight: 'bolder'
                        }
                    },
                    detail: {
                        offsetCenter: ['-5%', 95],
                        formatter: function(value) {

                            // If the server returned a consumption value of NaN,
                            // then echarts does not render a needle.
                            // Set the legend text to 'NaN', echarts renders this in red.
                            if (Number.isNaN(value))
                                return 'NaN';

                            // If the consumption exceeds 100%, set the legend text to a warning message.
                            // Echarts renders this in red.
                            if (value > 100)
                                return 'LIMIT BREACH';

                            // Otherwise return the consumption value formatted as a percentage.
                            return numeral(value).format('(0.00)') + '%';
                        },
                        textStyle: {
                            color: 'auto',
                            fontWeight: 'bolder',
                            fontSize: 20
                        }
                    },
                    // Default the gauge to zero with no "name" (caption).
                    // This should immediately get overwritten by the data returned from the rest call.
                    data: 0
                }
            ]
        };

        function getToolTip(metricName, metricValue, limit, consumption) {
            var symbol_ = chartManager.getBaseCcy();
            metricName = metricName.toUpperCase();
            metricValue = numeral(metricValue).format('(0,0.00)');
            limit = numeral(limit).format('(0,0.00)');
            consumption = numeral(consumption).format('(0,0.00)');
            return metricName + ': ' + symbol_ + ' ' + metricValue + '<br/>Limit: ' + symbol_ + ' '+ limit + '<br/>Consumption: ' + consumption + '%';
        }

        function setNewData(chart_, data_) {

            chart_.setOption({

                series: [{

                    // Here is the normal way to pass in the data:
                    //
                    //  data: xxx
                    //
                    // Alternatively, echarts lets you pass in a list of objects.
                    // This allows you to attach additional properties to the data,
                    // where they can be retrieved later by the tooltip formatter event.
                    // We are going to use an array of size one:

                    data: [ {
                        // This is the data that echarts will render, it must be called 'value':
                        value : data_.consumption,
                        // The string to display on the center of the gauge - must be called 'name':
                        name : data_.name,
                        // Derive the tooltip for use in the tooltip formatter event:
                        tooltip : getToolTip(data_.metric, data_.value, data_.limit, data_.consumption)
                    } ],
                }],
            });
        }

        function initialiseAllCharts() {

            var args = {
                mode: chartManager.getMode(),
                hierarchy: chartManager.getHierarchy(),
                node: chartManager.getNode(),
                xvaHierarchy: chartManager.getHierarchy(),
                xvaNode: chartManager.getNode()
            };

            var p_ = chartManager.getGraphData(args, 'ce', 'gauge');
            chartManager.initChart('risk_gauge', options, p_, setNewData, false);
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


(function(self) {
    'use strict';

    if (self.fetch) {
        return
    }

    var support = {
        searchParams: 'URLSearchParams' in self,
        iterable: 'Symbol' in self && 'iterator' in Symbol,
        blob: 'FileReader' in self && 'Blob' in self && (function() {
            try {
                new Blob()
                return true
            } catch(e) {
                return false
            }
        })(),
        formData: 'FormData' in self,
        arrayBuffer: 'ArrayBuffer' in self
    }

    function normalizeName(name) {
        if (typeof name !== 'string') {
            name = String(name)
        }
        if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
            throw new TypeError('Invalid character in header field name')
        }
        return name.toLowerCase()
    }

    function normalizeValue(value) {
        if (typeof value !== 'string') {
            value = String(value)
        }
        return value
    }

    // Build a destructive iterator for the value list
    function iteratorFor(items) {
        var iterator = {
            next: function() {
                var value = items.shift()
                return {done: value === undefined, value: value}
            }
        }

        if (support.iterable) {
            iterator[Symbol.iterator] = function() {
                return iterator
            }
        }

        return iterator
    }

    function Headers(headers) {
        this.map = {}

        if (headers instanceof Headers) {
            headers.forEach(function(value, name) {
                this.append(name, value)
            }, this)

        } else if (headers) {
            Object.getOwnPropertyNames(headers).forEach(function(name) {
                this.append(name, headers[name])
            }, this)
        }
    }

    Headers.prototype.append = function(name, value) {
        name = normalizeName(name)
        value = normalizeValue(value)
        var list = this.map[name]
        if (!list) {
            list = []
            this.map[name] = list
        }
        list.push(value)
    }

    Headers.prototype['delete'] = function(name) {
        delete this.map[normalizeName(name)]
    }

    Headers.prototype.get = function(name) {
        var values = this.map[normalizeName(name)]
        return values ? values[0] : null
    }

    Headers.prototype.getAll = function(name) {
        return this.map[normalizeName(name)] || []
    }

    Headers.prototype.has = function(name) {
        return this.map.hasOwnProperty(normalizeName(name))
    }

    Headers.prototype.set = function(name, value) {
        this.map[normalizeName(name)] = [normalizeValue(value)]
    }

    Headers.prototype.forEach = function(callback, thisArg) {
        Object.getOwnPropertyNames(this.map).forEach(function(name) {
            this.map[name].forEach(function(value) {
                callback.call(thisArg, value, name, this)
            }, this)
        }, this)
    }

    Headers.prototype.keys = function() {
        var items = []
        this.forEach(function(value, name) { items.push(name) })
        return iteratorFor(items)
    }

    Headers.prototype.values = function() {
        var items = []
        this.forEach(function(value) { items.push(value) })
        return iteratorFor(items)
    }

    Headers.prototype.entries = function() {
        var items = []
        this.forEach(function(value, name) { items.push([name, value]) })
        return iteratorFor(items)
    }

    if (support.iterable) {
        Headers.prototype[Symbol.iterator] = Headers.prototype.entries
    }

    function consumed(body) {
        if (body.bodyUsed) {
            return Promise.reject(new TypeError('Already read'))
        }
        body.bodyUsed = true
    }

    function fileReaderReady(reader) {
        return new Promise(function(resolve, reject) {
            reader.onload = function() {
                resolve(reader.result)
            }
            reader.onerror = function() {
                reject(reader.error)
            }
        })
    }

    function readBlobAsArrayBuffer(blob) {
        var reader = new FileReader()
        reader.readAsArrayBuffer(blob)
        return fileReaderReady(reader)
    }

    function readBlobAsText(blob) {
        var reader = new FileReader()
        reader.readAsText(blob)
        return fileReaderReady(reader)
    }

    function Body() {
        this.bodyUsed = false

        this._initBody = function(body) {
            this._bodyInit = body
            if (typeof body === 'string') {
                this._bodyText = body
            } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
                this._bodyBlob = body
            } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
                this._bodyFormData = body
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                this._bodyText = body.toString()
            } else if (!body) {
                this._bodyText = ''
            } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
                // Only support ArrayBuffers for POST method.
                // Receiving ArrayBuffers happens via Blobs, instead.
            } else {
                throw new Error('unsupported BodyInit type')
            }

            if (!this.headers.get('content-type')) {
                if (typeof body === 'string') {
                    this.headers.set('content-type', 'text/plain;charset=UTF-8')
                } else if (this._bodyBlob && this._bodyBlob.type) {
                    this.headers.set('content-type', this._bodyBlob.type)
                } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                    this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
                }
            }
        }

        if (support.blob) {
            this.blob = function() {
                var rejected = consumed(this)
                if (rejected) {
                    return rejected
                }

                if (this._bodyBlob) {
                    return Promise.resolve(this._bodyBlob)
                } else if (this._bodyFormData) {
                    throw new Error('could not read FormData body as blob')
                } else {
                    return Promise.resolve(new Blob([this._bodyText]))
                }
            }

            this.arrayBuffer = function() {
                return this.blob().then(readBlobAsArrayBuffer)
            }

            this.text = function() {
                var rejected = consumed(this)
                if (rejected) {
                    return rejected
                }

                if (this._bodyBlob) {
                    return readBlobAsText(this._bodyBlob)
                } else if (this._bodyFormData) {
                    throw new Error('could not read FormData body as text')
                } else {
                    return Promise.resolve(this._bodyText)
                }
            }
        } else {
            this.text = function() {
                var rejected = consumed(this)
                return rejected ? rejected : Promise.resolve(this._bodyText)
            }
        }

        if (support.formData) {
            this.formData = function() {
                return this.text().then(decode)
            }
        }

        this.json = function() {
            return this.text().then(JSON.parse)
        }

        return this
    }

    // HTTP methods whose capitalization should be normalized
    var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

    function normalizeMethod(method) {
        var upcased = method.toUpperCase()
        return (methods.indexOf(upcased) > -1) ? upcased : method
    }

    function Request(input, options) {
        options = options || {}
        var body = options.body
        if (Request.prototype.isPrototypeOf(input)) {
            if (input.bodyUsed) {
                throw new TypeError('Already read')
            }
            this.url = input.url
            this.credentials = input.credentials
            if (!options.headers) {
                this.headers = new Headers(input.headers)
            }
            this.method = input.method
            this.mode = input.mode
            if (!body) {
                body = input._bodyInit
                input.bodyUsed = true
            }
        } else {
            this.url = input
        }

        this.credentials = options.credentials || this.credentials || 'omit'
        if (options.headers || !this.headers) {
            this.headers = new Headers(options.headers)
        }
        this.method = normalizeMethod(options.method || this.method || 'GET')
        this.mode = options.mode || this.mode || null
        this.referrer = null

        if ((this.method === 'GET' || this.method === 'HEAD') && body) {
            throw new TypeError('Body not allowed for GET or HEAD requests')
        }
        this._initBody(body)
    }

    Request.prototype.clone = function() {
        return new Request(this)
    }

    function decode(body) {
        var form = new FormData()
        body.trim().split('&').forEach(function(bytes) {
            if (bytes) {
                var split = bytes.split('=')
                var name = split.shift().replace(/\+/g, ' ')
                var value = split.join('=').replace(/\+/g, ' ')
                form.append(decodeURIComponent(name), decodeURIComponent(value))
            }
        })
        return form
    }

    function headers(xhr) {
        var head = new Headers()
        var pairs = (xhr.getAllResponseHeaders() || '').trim().split('\n')
        pairs.forEach(function(header) {
            var split = header.trim().split(':')
            var key = split.shift().trim()
            var value = split.join(':').trim()
            head.append(key, value)
        })
        return head
    }

    Body.call(Request.prototype)

    function Response(bodyInit, options) {
        if (!options) {
            options = {}
        }

        this.type = 'default'
        this.status = options.status
        this.ok = this.status >= 200 && this.status < 300
        this.statusText = options.statusText
        this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
        this.url = options.url || ''
        this._initBody(bodyInit)
    }

    Body.call(Response.prototype)

    Response.prototype.clone = function() {
        return new Response(this._bodyInit, {
            status: this.status,
            statusText: this.statusText,
            headers: new Headers(this.headers),
            url: this.url
        })
    }

    Response.error = function() {
        var response = new Response(null, {status: 0, statusText: ''})
        response.type = 'error'
        return response
    }

    var redirectStatuses = [301, 302, 303, 307, 308]

    Response.redirect = function(url, status) {
        if (redirectStatuses.indexOf(status) === -1) {
            throw new RangeError('Invalid status code')
        }

        return new Response(null, {status: status, headers: {location: url}})
    }

    self.Headers = Headers
    self.Request = Request
    self.Response = Response

    self.fetch = function(input, init) {
        return new Promise(function(resolve, reject) {
            var request
            if (Request.prototype.isPrototypeOf(input) && !init) {
                request = input
            } else {
                request = new Request(input, init)
            }

            var xhr = new XMLHttpRequest()

            function responseURL() {
                if ('responseURL' in xhr) {
                    return xhr.responseURL
                }

                // Avoid security warnings on getResponseHeader when not allowed by CORS
                if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
                    return xhr.getResponseHeader('X-Request-URL')
                }

                return
            }

            xhr.onload = function() {
                var options = {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers: headers(xhr),
                    url: responseURL()
                }
                var body = 'response' in xhr ? xhr.response : xhr.responseText
                resolve(new Response(body, options))
            }

            xhr.onerror = function() {
                reject(new TypeError('Network request failed'))
            }

            xhr.ontimeout = function() {
                reject(new TypeError('Network request failed'))
            }

            xhr.open(request.method, request.url, true)

            if (request.credentials === 'include') {
                xhr.withCredentials = true
            }

            if ('responseType' in xhr && support.blob) {
                xhr.responseType = 'blob'
            }

            request.headers.forEach(function(value, name) {
                xhr.setRequestHeader(name, value)
            })

            xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
        })
    }
    self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

"use strict";

var dtLimits, dtBreaches;

var getUrl = function(e){
    console.debug(e);
    // return the right suffic fr the metric
    var baseUrl = 'api/totalportfolio/';

    // find out the selected metric from the dropdown / sessionStorage
    // add it to the baseUrl
    var metric = sessionStorage.getItem('limitMetric_') || 'CE';
    return baseUrl + metric.toLowerCase();
};

var flipTable = function(evt) {
    if (isNullOrUndefined(evt))
        return;

    evt = evt || window.event;
    var target = evt.target || evt.srcElement;
    // update the metric and redraw the limits table
    sessionStorage.setItem(target.name, target.value);
    dtLimits.ajax.url(getUrl()).load();
};

var filterOnDate = function(evt){
    if (isNullOrUndefined(evt))
        return;

    evt = evt || window.event;
    var target = evt.target || evt.srcElement;
    sessionStorage.setItem(target.name, target.value);
    // dtLimits.draw();
    $(".dt-responsive:visible").each(function (e) {
        $(this).DataTable().draw();
    });

};

var limitLoad_ = function() {
    // load the page
    // attach change event handlers to the dropdown controls
    console.log('[INFO] ORE Limit Table.init');

    var pCcy_ = chartManager.setBaseCcy();
    var pDates_ = chartManager.populateBusinessDates();

    return Promise.all([pCcy_, pDates_]).then(function (values) {
        console.log('[INFO] bus date calls and base ccy complete');
        // when the bus date and base ccy rest calls have resolved
        // reset the page defaults and init the charts
        document.getElementById('businessDates').options[0].text = '- All Dates -';
        console.debug(sessionStorage);
        return 'done';
    }).then(function (res) {
        console.log('[INFO] init limits table complete');

        // for each selector, populate the choices list
        // and add a change event handler
        [].forEach.call(document.getElementsByClassName('selectpicker-bg'), function (e) {
            chartManager.populateBarGraphMetricList(e);
            sessionStorage.setItem('limitMetric_','CE');
            _AttachEvent(e, 'change', flipTable);
        });

        [].forEach.call(document.getElementsByClassName('selectpicker'), function (e) {
            _AttachEvent(e, 'change', filterOnDate);
        });

        return 'done';

    }).catch(function (error) {
        console.error(new Error(error));
    });
}

var doLimitTableLoaded = function() {

    $("a[data-toggle=\"tab\"]").on("shown.bs.tab", function (e) {
        var $newTab = $(e.target);

        if ($.inArray("limits-tab", $newTab.parent().get(0).classList) >= 0) {
            $(".limits-tab").addClass("active");
            $(".breaches-tab").removeClass("active");
            document.getElementById('limitMetric_').disabled = false;
            document.getElementById('limitMetric_').value = sessionStorage.getItem('limitMetric_');
        } else {
            $(".breaches-tab").addClass("active");
            $(".limits-tab").removeClass("active");
            document.getElementById('limitMetric_').disabled = true;
            document.getElementById('limitMetric_').value = '--';
        }

        $(".dt-responsive:visible").each(function (e) {
            $(this).DataTable().scroller.measure();
            $(this).DataTable().columns.adjust().responsive.recalc();
        });
    });

    var massageJson = function(json){
        var ret_ = [];
        [].forEach.call(json, function(e){
            var row_ = {};
            row_.creditRating = e.creditRating;
            row_.counterParty = e.counterParty;
            row_.nettingSet = e.nettingSet;
            row_.trade = e.trade;
            row_.metric = e.metric;
            row_.limit = e.limit;
            var cons = e.consumptions;
            [].forEach.call(cons, function(el){
                var new_row = JSON.parse(JSON.stringify(row_));
                new_row.value = el.value;
                new_row.date = el.date;
                new_row.consumption = el.consumption;
                ret_.push(new_row);
            })
        })
        return ret_;
    };

    // table definition common to both tables
    var tableDef = {
        "createdRow": function( row, data, dataIndex ) {
            if ( data.consumption > 75 ) {
                $(row).addClass( 'warning' );
            }
            if ( data.consumption > 100 ) {
                $(row).addClass( 'danger' );
            }
        },
        "columnDefs" : [{
            "className" : "text-right", "targets" : [5,6,8]
        }],
        "columns": [
            { title: "Credit Rating", data : "creditRating" },
            { title: "Counterparty", data : "counterParty"},
            { title: "Netting Set", data: "nettingSet" },
            { title: "Trade", data: "trade" },
            { title: "Metric", data: "metric" , render: function (data, type, row) {
                return data.toUpperCase();
            }},
            { title: "Limit Value", data: "limit"
                // , render: $.fn.dataTable.render.number( ',', '.', 0, chartManager.getBaseCcy())
            },
            { title: "Consumption Value", data: "value"
                , render: $.fn.dataTable.render.number( ',', '.', 0, chartManager.getBaseCcy())
            },
            { title: "Date", data: "date"
                , render: function ( data, type, row ) {
                return (moment(data, 'YYYYMMDD').format('DD-MMM-YYYY'));
            }
            },
            { title: " Cons %", data: "consumption"
                , render: $.fn.dataTable.render.number( ',', '.', 2, '','%')
            }
        ],
        deferRender: true,
        scrollY: 380,
        scrollCollapse: true,
        scroller: true,
        dom: 'Bfrtip',
        buttons: [
            {
                extend: "copy",
                className: "btn-sm"
            },
            {
                extend: "csv",
                className: "btn-sm"
            },
            {
                extend: "excel",
                className: "btn-sm"
            },
            {
                extend: "pdfHtml5",
                className: "btn-sm"
            },
            {
                extend: "print",
                className: "btn-sm"
            }
        ]
    };

    // all records - find the right metric
    dtLimits = $('#datatable-responsive').DataTable(
        tableDef,
        tableDef.ajax = {url: getUrl(this), dataSrc: massageJson}
    );

    // limitBreach table
    dtBreaches = $('#datatable-responsive2').DataTable(
        tableDef,
        tableDef.ajax = {url: "api/limitbreaches", dataSrc: massageJson}
    );

    $.fn.dataTable.ext.search.push(
        function( settings, data, dataIndex ) {
            var val_  = document.getElementById('businessDates').value;
            if (val_ == '19700101') return true;
            return data[7] == moment(val_,'YYYYMMDD').format('DD-MMM-YYYY');
        }
    );

};

//! moment.js
//! version : 2.9.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
(function(a){function b(a,b,c){switch(arguments.length){case 2:return null!=a?a:b;case 3:return null!=a?a:null!=b?b:c;default:throw new Error("Implement me")}}function c(a,b){return Bb.call(a,b)}function d(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1}}function e(a){vb.suppressDeprecationWarnings===!1&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+a)}function f(a,b){var c=!0;return o(function(){return c&&(e(a),c=!1),b.apply(this,arguments)},b)}function g(a,b){sc[a]||(e(b),sc[a]=!0)}function h(a,b){return function(c){return r(a.call(this,c),b)}}function i(a,b){return function(c){return this.localeData().ordinal(a.call(this,c),b)}}function j(a,b){var c,d,e=12*(b.year()-a.year())+(b.month()-a.month()),f=a.clone().add(e,"months");return 0>b-f?(c=a.clone().add(e-1,"months"),d=(b-f)/(f-c)):(c=a.clone().add(e+1,"months"),d=(b-f)/(c-f)),-(e+d)}function k(a,b,c){var d;return null==c?b:null!=a.meridiemHour?a.meridiemHour(b,c):null!=a.isPM?(d=a.isPM(c),d&&12>b&&(b+=12),d||12!==b||(b=0),b):b}function l(){}function m(a,b){b!==!1&&H(a),p(this,a),this._d=new Date(+a._d),uc===!1&&(uc=!0,vb.updateOffset(this),uc=!1)}function n(a){var b=A(a),c=b.year||0,d=b.quarter||0,e=b.month||0,f=b.week||0,g=b.day||0,h=b.hour||0,i=b.minute||0,j=b.second||0,k=b.millisecond||0;this._milliseconds=+k+1e3*j+6e4*i+36e5*h,this._days=+g+7*f,this._months=+e+3*d+12*c,this._data={},this._locale=vb.localeData(),this._bubble()}function o(a,b){for(var d in b)c(b,d)&&(a[d]=b[d]);return c(b,"toString")&&(a.toString=b.toString),c(b,"valueOf")&&(a.valueOf=b.valueOf),a}function p(a,b){var c,d,e;if("undefined"!=typeof b._isAMomentObject&&(a._isAMomentObject=b._isAMomentObject),"undefined"!=typeof b._i&&(a._i=b._i),"undefined"!=typeof b._f&&(a._f=b._f),"undefined"!=typeof b._l&&(a._l=b._l),"undefined"!=typeof b._strict&&(a._strict=b._strict),"undefined"!=typeof b._tzm&&(a._tzm=b._tzm),"undefined"!=typeof b._isUTC&&(a._isUTC=b._isUTC),"undefined"!=typeof b._offset&&(a._offset=b._offset),"undefined"!=typeof b._pf&&(a._pf=b._pf),"undefined"!=typeof b._locale&&(a._locale=b._locale),Kb.length>0)for(c in Kb)d=Kb[c],e=b[d],"undefined"!=typeof e&&(a[d]=e);return a}function q(a){return 0>a?Math.ceil(a):Math.floor(a)}function r(a,b,c){for(var d=""+Math.abs(a),e=a>=0;d.length<b;)d="0"+d;return(e?c?"+":"":"-")+d}function s(a,b){var c={milliseconds:0,months:0};return c.months=b.month()-a.month()+12*(b.year()-a.year()),a.clone().add(c.months,"M").isAfter(b)&&--c.months,c.milliseconds=+b-+a.clone().add(c.months,"M"),c}function t(a,b){var c;return b=M(b,a),a.isBefore(b)?c=s(a,b):(c=s(b,a),c.milliseconds=-c.milliseconds,c.months=-c.months),c}function u(a,b){return function(c,d){var e,f;return null===d||isNaN(+d)||(g(b,"moment()."+b+"(period, number) is deprecated. Please use moment()."+b+"(number, period)."),f=c,c=d,d=f),c="string"==typeof c?+c:c,e=vb.duration(c,d),v(this,e,a),this}}function v(a,b,c,d){var e=b._milliseconds,f=b._days,g=b._months;d=null==d?!0:d,e&&a._d.setTime(+a._d+e*c),f&&pb(a,"Date",ob(a,"Date")+f*c),g&&nb(a,ob(a,"Month")+g*c),d&&vb.updateOffset(a,f||g)}function w(a){return"[object Array]"===Object.prototype.toString.call(a)}function x(a){return"[object Date]"===Object.prototype.toString.call(a)||a instanceof Date}function y(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;e>d;d++)(c&&a[d]!==b[d]||!c&&C(a[d])!==C(b[d]))&&g++;return g+f}function z(a){if(a){var b=a.toLowerCase().replace(/(.)s$/,"$1");a=lc[a]||mc[b]||b}return a}function A(a){var b,d,e={};for(d in a)c(a,d)&&(b=z(d),b&&(e[b]=a[d]));return e}function B(b){var c,d;if(0===b.indexOf("week"))c=7,d="day";else{if(0!==b.indexOf("month"))return;c=12,d="month"}vb[b]=function(e,f){var g,h,i=vb._locale[b],j=[];if("number"==typeof e&&(f=e,e=a),h=function(a){var b=vb().utc().set(d,a);return i.call(vb._locale,b,e||"")},null!=f)return h(f);for(g=0;c>g;g++)j.push(h(g));return j}}function C(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=b>=0?Math.floor(b):Math.ceil(b)),c}function D(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function E(a,b,c){return jb(vb([a,11,31+b-c]),b,c).week}function F(a){return G(a)?366:365}function G(a){return a%4===0&&a%100!==0||a%400===0}function H(a){var b;a._a&&-2===a._pf.overflow&&(b=a._a[Db]<0||a._a[Db]>11?Db:a._a[Eb]<1||a._a[Eb]>D(a._a[Cb],a._a[Db])?Eb:a._a[Fb]<0||a._a[Fb]>24||24===a._a[Fb]&&(0!==a._a[Gb]||0!==a._a[Hb]||0!==a._a[Ib])?Fb:a._a[Gb]<0||a._a[Gb]>59?Gb:a._a[Hb]<0||a._a[Hb]>59?Hb:a._a[Ib]<0||a._a[Ib]>999?Ib:-1,a._pf._overflowDayOfYear&&(Cb>b||b>Eb)&&(b=Eb),a._pf.overflow=b)}function I(b){return null==b._isValid&&(b._isValid=!isNaN(b._d.getTime())&&b._pf.overflow<0&&!b._pf.empty&&!b._pf.invalidMonth&&!b._pf.nullInput&&!b._pf.invalidFormat&&!b._pf.userInvalidated,b._strict&&(b._isValid=b._isValid&&0===b._pf.charsLeftOver&&0===b._pf.unusedTokens.length&&b._pf.bigHour===a)),b._isValid}function J(a){return a?a.toLowerCase().replace("_","-"):a}function K(a){for(var b,c,d,e,f=0;f<a.length;){for(e=J(a[f]).split("-"),b=e.length,c=J(a[f+1]),c=c?c.split("-"):null;b>0;){if(d=L(e.slice(0,b).join("-")))return d;if(c&&c.length>=b&&y(e,c,!0)>=b-1)break;b--}f++}return null}function L(a){var b=null;if(!Jb[a]&&Lb)try{b=vb.locale(),require("./locale/"+a),vb.locale(b)}catch(c){}return Jb[a]}function M(a,b){var c,d;return b._isUTC?(c=b.clone(),d=(vb.isMoment(a)||x(a)?+a:+vb(a))-+c,c._d.setTime(+c._d+d),vb.updateOffset(c,!1),c):vb(a).local()}function N(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function O(a){var b,c,d=a.match(Pb);for(b=0,c=d.length;c>b;b++)d[b]=rc[d[b]]?rc[d[b]]:N(d[b]);return function(e){var f="";for(b=0;c>b;b++)f+=d[b]instanceof Function?d[b].call(e,a):d[b];return f}}function P(a,b){return a.isValid()?(b=Q(b,a.localeData()),nc[b]||(nc[b]=O(b)),nc[b](a)):a.localeData().invalidDate()}function Q(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(Qb.lastIndex=0;d>=0&&Qb.test(a);)a=a.replace(Qb,c),Qb.lastIndex=0,d-=1;return a}function R(a,b){var c,d=b._strict;switch(a){case"Q":return _b;case"DDDD":return bc;case"YYYY":case"GGGG":case"gggg":return d?cc:Tb;case"Y":case"G":case"g":return ec;case"YYYYYY":case"YYYYY":case"GGGGG":case"ggggg":return d?dc:Ub;case"S":if(d)return _b;case"SS":if(d)return ac;case"SSS":if(d)return bc;case"DDD":return Sb;case"MMM":case"MMMM":case"dd":case"ddd":case"dddd":return Wb;case"a":case"A":return b._locale._meridiemParse;case"x":return Zb;case"X":return $b;case"Z":case"ZZ":return Xb;case"T":return Yb;case"SSSS":return Vb;case"MM":case"DD":case"YY":case"GG":case"gg":case"HH":case"hh":case"mm":case"ss":case"ww":case"WW":return d?ac:Rb;case"M":case"D":case"d":case"H":case"h":case"m":case"s":case"w":case"W":case"e":case"E":return Rb;case"Do":return d?b._locale._ordinalParse:b._locale._ordinalParseLenient;default:return c=new RegExp($(Z(a.replace("\\","")),"i"))}}function S(a){a=a||"";var b=a.match(Xb)||[],c=b[b.length-1]||[],d=(c+"").match(jc)||["-",0,0],e=+(60*d[1])+C(d[2]);return"+"===d[0]?e:-e}function T(a,b,c){var d,e=c._a;switch(a){case"Q":null!=b&&(e[Db]=3*(C(b)-1));break;case"M":case"MM":null!=b&&(e[Db]=C(b)-1);break;case"MMM":case"MMMM":d=c._locale.monthsParse(b,a,c._strict),null!=d?e[Db]=d:c._pf.invalidMonth=b;break;case"D":case"DD":null!=b&&(e[Eb]=C(b));break;case"Do":null!=b&&(e[Eb]=C(parseInt(b.match(/\d{1,2}/)[0],10)));break;case"DDD":case"DDDD":null!=b&&(c._dayOfYear=C(b));break;case"YY":e[Cb]=vb.parseTwoDigitYear(b);break;case"YYYY":case"YYYYY":case"YYYYYY":e[Cb]=C(b);break;case"a":case"A":c._meridiem=b;break;case"h":case"hh":c._pf.bigHour=!0;case"H":case"HH":e[Fb]=C(b);break;case"m":case"mm":e[Gb]=C(b);break;case"s":case"ss":e[Hb]=C(b);break;case"S":case"SS":case"SSS":case"SSSS":e[Ib]=C(1e3*("0."+b));break;case"x":c._d=new Date(C(b));break;case"X":c._d=new Date(1e3*parseFloat(b));break;case"Z":case"ZZ":c._useUTC=!0,c._tzm=S(b);break;case"dd":case"ddd":case"dddd":d=c._locale.weekdaysParse(b),null!=d?(c._w=c._w||{},c._w.d=d):c._pf.invalidWeekday=b;break;case"w":case"ww":case"W":case"WW":case"d":case"e":case"E":a=a.substr(0,1);case"gggg":case"GGGG":case"GGGGG":a=a.substr(0,2),b&&(c._w=c._w||{},c._w[a]=C(b));break;case"gg":case"GG":c._w=c._w||{},c._w[a]=vb.parseTwoDigitYear(b)}}function U(a){var c,d,e,f,g,h,i;c=a._w,null!=c.GG||null!=c.W||null!=c.E?(g=1,h=4,d=b(c.GG,a._a[Cb],jb(vb(),1,4).year),e=b(c.W,1),f=b(c.E,1)):(g=a._locale._week.dow,h=a._locale._week.doy,d=b(c.gg,a._a[Cb],jb(vb(),g,h).year),e=b(c.w,1),null!=c.d?(f=c.d,g>f&&++e):f=null!=c.e?c.e+g:g),i=kb(d,e,f,h,g),a._a[Cb]=i.year,a._dayOfYear=i.dayOfYear}function V(a){var c,d,e,f,g=[];if(!a._d){for(e=X(a),a._w&&null==a._a[Eb]&&null==a._a[Db]&&U(a),a._dayOfYear&&(f=b(a._a[Cb],e[Cb]),a._dayOfYear>F(f)&&(a._pf._overflowDayOfYear=!0),d=fb(f,0,a._dayOfYear),a._a[Db]=d.getUTCMonth(),a._a[Eb]=d.getUTCDate()),c=0;3>c&&null==a._a[c];++c)a._a[c]=g[c]=e[c];for(;7>c;c++)a._a[c]=g[c]=null==a._a[c]?2===c?1:0:a._a[c];24===a._a[Fb]&&0===a._a[Gb]&&0===a._a[Hb]&&0===a._a[Ib]&&(a._nextDay=!0,a._a[Fb]=0),a._d=(a._useUTC?fb:eb).apply(null,g),null!=a._tzm&&a._d.setUTCMinutes(a._d.getUTCMinutes()-a._tzm),a._nextDay&&(a._a[Fb]=24)}}function W(a){var b;a._d||(b=A(a._i),a._a=[b.year,b.month,b.day||b.date,b.hour,b.minute,b.second,b.millisecond],V(a))}function X(a){var b=new Date;return a._useUTC?[b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate()]:[b.getFullYear(),b.getMonth(),b.getDate()]}function Y(b){if(b._f===vb.ISO_8601)return void ab(b);b._a=[],b._pf.empty=!0;var c,d,e,f,g,h=""+b._i,i=h.length,j=0;for(e=Q(b._f,b._locale).match(Pb)||[],c=0;c<e.length;c++)f=e[c],d=(h.match(R(f,b))||[])[0],d&&(g=h.substr(0,h.indexOf(d)),g.length>0&&b._pf.unusedInput.push(g),h=h.slice(h.indexOf(d)+d.length),j+=d.length),rc[f]?(d?b._pf.empty=!1:b._pf.unusedTokens.push(f),T(f,d,b)):b._strict&&!d&&b._pf.unusedTokens.push(f);b._pf.charsLeftOver=i-j,h.length>0&&b._pf.unusedInput.push(h),b._pf.bigHour===!0&&b._a[Fb]<=12&&(b._pf.bigHour=a),b._a[Fb]=k(b._locale,b._a[Fb],b._meridiem),V(b),H(b)}function Z(a){return a.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e})}function $(a){return a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function _(a){var b,c,e,f,g;if(0===a._f.length)return a._pf.invalidFormat=!0,void(a._d=new Date(0/0));for(f=0;f<a._f.length;f++)g=0,b=p({},a),null!=a._useUTC&&(b._useUTC=a._useUTC),b._pf=d(),b._f=a._f[f],Y(b),I(b)&&(g+=b._pf.charsLeftOver,g+=10*b._pf.unusedTokens.length,b._pf.score=g,(null==e||e>g)&&(e=g,c=b));o(a,c||b)}function ab(a){var b,c,d=a._i,e=fc.exec(d);if(e){for(a._pf.iso=!0,b=0,c=hc.length;c>b;b++)if(hc[b][1].exec(d)){a._f=hc[b][0]+(e[6]||" ");break}for(b=0,c=ic.length;c>b;b++)if(ic[b][1].exec(d)){a._f+=ic[b][0];break}d.match(Xb)&&(a._f+="Z"),Y(a)}else a._isValid=!1}function bb(a){ab(a),a._isValid===!1&&(delete a._isValid,vb.createFromInputFallback(a))}function cb(a,b){var c,d=[];for(c=0;c<a.length;++c)d.push(b(a[c],c));return d}function db(b){var c,d=b._i;d===a?b._d=new Date:x(d)?b._d=new Date(+d):null!==(c=Mb.exec(d))?b._d=new Date(+c[1]):"string"==typeof d?bb(b):w(d)?(b._a=cb(d.slice(0),function(a){return parseInt(a,10)}),V(b)):"object"==typeof d?W(b):"number"==typeof d?b._d=new Date(d):vb.createFromInputFallback(b)}function eb(a,b,c,d,e,f,g){var h=new Date(a,b,c,d,e,f,g);return 1970>a&&h.setFullYear(a),h}function fb(a){var b=new Date(Date.UTC.apply(null,arguments));return 1970>a&&b.setUTCFullYear(a),b}function gb(a,b){if("string"==typeof a)if(isNaN(a)){if(a=b.weekdaysParse(a),"number"!=typeof a)return null}else a=parseInt(a,10);return a}function hb(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function ib(a,b,c){var d=vb.duration(a).abs(),e=Ab(d.as("s")),f=Ab(d.as("m")),g=Ab(d.as("h")),h=Ab(d.as("d")),i=Ab(d.as("M")),j=Ab(d.as("y")),k=e<oc.s&&["s",e]||1===f&&["m"]||f<oc.m&&["mm",f]||1===g&&["h"]||g<oc.h&&["hh",g]||1===h&&["d"]||h<oc.d&&["dd",h]||1===i&&["M"]||i<oc.M&&["MM",i]||1===j&&["y"]||["yy",j];return k[2]=b,k[3]=+a>0,k[4]=c,hb.apply({},k)}function jb(a,b,c){var d,e=c-b,f=c-a.day();return f>e&&(f-=7),e-7>f&&(f+=7),d=vb(a).add(f,"d"),{week:Math.ceil(d.dayOfYear()/7),year:d.year()}}function kb(a,b,c,d,e){var f,g,h=fb(a,0,1).getUTCDay();return h=0===h?7:h,c=null!=c?c:e,f=e-h+(h>d?7:0)-(e>h?7:0),g=7*(b-1)+(c-e)+f+1,{year:g>0?a:a-1,dayOfYear:g>0?g:F(a-1)+g}}function lb(b){var c,d=b._i,e=b._f;return b._locale=b._locale||vb.localeData(b._l),null===d||e===a&&""===d?vb.invalid({nullInput:!0}):("string"==typeof d&&(b._i=d=b._locale.preparse(d)),vb.isMoment(d)?new m(d,!0):(e?w(e)?_(b):Y(b):db(b),c=new m(b),c._nextDay&&(c.add(1,"d"),c._nextDay=a),c))}function mb(a,b){var c,d;if(1===b.length&&w(b[0])&&(b=b[0]),!b.length)return vb();for(c=b[0],d=1;d<b.length;++d)b[d][a](c)&&(c=b[d]);return c}function nb(a,b){var c;return"string"==typeof b&&(b=a.localeData().monthsParse(b),"number"!=typeof b)?a:(c=Math.min(a.date(),D(a.year(),b)),a._d["set"+(a._isUTC?"UTC":"")+"Month"](b,c),a)}function ob(a,b){return a._d["get"+(a._isUTC?"UTC":"")+b]()}function pb(a,b,c){return"Month"===b?nb(a,c):a._d["set"+(a._isUTC?"UTC":"")+b](c)}function qb(a,b){return function(c){return null!=c?(pb(this,a,c),vb.updateOffset(this,b),this):ob(this,a)}}function rb(a){return 400*a/146097}function sb(a){return 146097*a/400}function tb(a){vb.duration.fn[a]=function(){return this._data[a]}}function ub(a){"undefined"==typeof ender&&(wb=zb.moment,zb.moment=a?f("Accessing Moment through the global scope is deprecated, and will be removed in an upcoming release.",vb):vb)}for(var vb,wb,xb,yb="2.9.0",zb="undefined"==typeof global||"undefined"!=typeof window&&window!==global.window?this:global,Ab=Math.round,Bb=Object.prototype.hasOwnProperty,Cb=0,Db=1,Eb=2,Fb=3,Gb=4,Hb=5,Ib=6,Jb={},Kb=[],Lb="undefined"!=typeof module&&module&&module.exports,Mb=/^\/?Date\((\-?\d+)/i,Nb=/(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,Ob=/^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,Pb=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g,Qb=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,Rb=/\d\d?/,Sb=/\d{1,3}/,Tb=/\d{1,4}/,Ub=/[+\-]?\d{1,6}/,Vb=/\d+/,Wb=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,Xb=/Z|[\+\-]\d\d:?\d\d/gi,Yb=/T/i,Zb=/[\+\-]?\d+/,$b=/[\+\-]?\d+(\.\d{1,3})?/,_b=/\d/,ac=/\d\d/,bc=/\d{3}/,cc=/\d{4}/,dc=/[+-]?\d{6}/,ec=/[+-]?\d+/,fc=/^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,gc="YYYY-MM-DDTHH:mm:ssZ",hc=[["YYYYYY-MM-DD",/[+-]\d{6}-\d{2}-\d{2}/],["YYYY-MM-DD",/\d{4}-\d{2}-\d{2}/],["GGGG-[W]WW-E",/\d{4}-W\d{2}-\d/],["GGGG-[W]WW",/\d{4}-W\d{2}/],["YYYY-DDD",/\d{4}-\d{3}/]],ic=[["HH:mm:ss.SSSS",/(T| )\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss",/(T| )\d\d:\d\d:\d\d/],["HH:mm",/(T| )\d\d:\d\d/],["HH",/(T| )\d\d/]],jc=/([\+\-]|\d\d)/gi,kc=("Date|Hours|Minutes|Seconds|Milliseconds".split("|"),{Milliseconds:1,Seconds:1e3,Minutes:6e4,Hours:36e5,Days:864e5,Months:2592e6,Years:31536e6}),lc={ms:"millisecond",s:"second",m:"minute",h:"hour",d:"day",D:"date",w:"week",W:"isoWeek",M:"month",Q:"quarter",y:"year",DDD:"dayOfYear",e:"weekday",E:"isoWeekday",gg:"weekYear",GG:"isoWeekYear"},mc={dayofyear:"dayOfYear",isoweekday:"isoWeekday",isoweek:"isoWeek",weekyear:"weekYear",isoweekyear:"isoWeekYear"},nc={},oc={s:45,m:45,h:22,d:26,M:11},pc="DDD w W M D d".split(" "),qc="M D H h m s w W".split(" "),rc={M:function(){return this.month()+1},MMM:function(a){return this.localeData().monthsShort(this,a)},MMMM:function(a){return this.localeData().months(this,a)},D:function(){return this.date()},DDD:function(){return this.dayOfYear()},d:function(){return this.day()},dd:function(a){return this.localeData().weekdaysMin(this,a)},ddd:function(a){return this.localeData().weekdaysShort(this,a)},dddd:function(a){return this.localeData().weekdays(this,a)},w:function(){return this.week()},W:function(){return this.isoWeek()},YY:function(){return r(this.year()%100,2)},YYYY:function(){return r(this.year(),4)},YYYYY:function(){return r(this.year(),5)},YYYYYY:function(){var a=this.year(),b=a>=0?"+":"-";return b+r(Math.abs(a),6)},gg:function(){return r(this.weekYear()%100,2)},gggg:function(){return r(this.weekYear(),4)},ggggg:function(){return r(this.weekYear(),5)},GG:function(){return r(this.isoWeekYear()%100,2)},GGGG:function(){return r(this.isoWeekYear(),4)},GGGGG:function(){return r(this.isoWeekYear(),5)},e:function(){return this.weekday()},E:function(){return this.isoWeekday()},a:function(){return this.localeData().meridiem(this.hours(),this.minutes(),!0)},A:function(){return this.localeData().meridiem(this.hours(),this.minutes(),!1)},H:function(){return this.hours()},h:function(){return this.hours()%12||12},m:function(){return this.minutes()},s:function(){return this.seconds()},S:function(){return C(this.milliseconds()/100)},SS:function(){return r(C(this.milliseconds()/10),2)},SSS:function(){return r(this.milliseconds(),3)},SSSS:function(){return r(this.milliseconds(),3)},Z:function(){var a=this.utcOffset(),b="+";return 0>a&&(a=-a,b="-"),b+r(C(a/60),2)+":"+r(C(a)%60,2)},ZZ:function(){var a=this.utcOffset(),b="+";return 0>a&&(a=-a,b="-"),b+r(C(a/60),2)+r(C(a)%60,2)},z:function(){return this.zoneAbbr()},zz:function(){return this.zoneName()},x:function(){return this.valueOf()},X:function(){return this.unix()},Q:function(){return this.quarter()}},sc={},tc=["months","monthsShort","weekdays","weekdaysShort","weekdaysMin"],uc=!1;pc.length;)xb=pc.pop(),rc[xb+"o"]=i(rc[xb],xb);for(;qc.length;)xb=qc.pop(),rc[xb+xb]=h(rc[xb],2);rc.DDDD=h(rc.DDD,3),o(l.prototype,{set:function(a){var b,c;for(c in a)b=a[c],"function"==typeof b?this[c]=b:this["_"+c]=b;this._ordinalParseLenient=new RegExp(this._ordinalParse.source+"|"+/\d{1,2}/.source)},_months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),months:function(a){return this._months[a.month()]},_monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),monthsShort:function(a){return this._monthsShort[a.month()]},monthsParse:function(a,b,c){var d,e,f;for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),d=0;12>d;d++){if(e=vb.utc([2e3,d]),c&&!this._longMonthsParse[d]&&(this._longMonthsParse[d]=new RegExp("^"+this.months(e,"").replace(".","")+"$","i"),this._shortMonthsParse[d]=new RegExp("^"+this.monthsShort(e,"").replace(".","")+"$","i")),c||this._monthsParse[d]||(f="^"+this.months(e,"")+"|^"+this.monthsShort(e,""),this._monthsParse[d]=new RegExp(f.replace(".",""),"i")),c&&"MMMM"===b&&this._longMonthsParse[d].test(a))return d;if(c&&"MMM"===b&&this._shortMonthsParse[d].test(a))return d;if(!c&&this._monthsParse[d].test(a))return d}},_weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdays:function(a){return this._weekdays[a.day()]},_weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysShort:function(a){return this._weekdaysShort[a.day()]},_weekdaysMin:"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),weekdaysMin:function(a){return this._weekdaysMin[a.day()]},weekdaysParse:function(a){var b,c,d;for(this._weekdaysParse||(this._weekdaysParse=[]),b=0;7>b;b++)if(this._weekdaysParse[b]||(c=vb([2e3,1]).day(b),d="^"+this.weekdays(c,"")+"|^"+this.weekdaysShort(c,"")+"|^"+this.weekdaysMin(c,""),this._weekdaysParse[b]=new RegExp(d.replace(".",""),"i")),this._weekdaysParse[b].test(a))return b},_longDateFormat:{LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY LT",LLLL:"dddd, MMMM D, YYYY LT"},longDateFormat:function(a){var b=this._longDateFormat[a];return!b&&this._longDateFormat[a.toUpperCase()]&&(b=this._longDateFormat[a.toUpperCase()].replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a]=b),b},isPM:function(a){return"p"===(a+"").toLowerCase().charAt(0)},_meridiemParse:/[ap]\.?m?\.?/i,meridiem:function(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"},_calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},calendar:function(a,b,c){var d=this._calendar[a];return"function"==typeof d?d.apply(b,[c]):d},_relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},relativeTime:function(a,b,c,d){var e=this._relativeTime[c];return"function"==typeof e?e(a,b,c,d):e.replace(/%d/i,a)},pastFuture:function(a,b){var c=this._relativeTime[a>0?"future":"past"];return"function"==typeof c?c(b):c.replace(/%s/i,b)},ordinal:function(a){return this._ordinal.replace("%d",a)},_ordinal:"%d",_ordinalParse:/\d{1,2}/,preparse:function(a){return a},postformat:function(a){return a},week:function(a){return jb(a,this._week.dow,this._week.doy).week},_week:{dow:0,doy:6},firstDayOfWeek:function(){return this._week.dow},firstDayOfYear:function(){return this._week.doy},_invalidDate:"Invalid date",invalidDate:function(){return this._invalidDate}}),vb=function(b,c,e,f){var g;return"boolean"==typeof e&&(f=e,e=a),g={},g._isAMomentObject=!0,g._i=b,g._f=c,g._l=e,g._strict=f,g._isUTC=!1,g._pf=d(),lb(g)},vb.suppressDeprecationWarnings=!1,vb.createFromInputFallback=f("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.",function(a){a._d=new Date(a._i+(a._useUTC?" UTC":""))}),vb.min=function(){var a=[].slice.call(arguments,0);return mb("isBefore",a)},vb.max=function(){var a=[].slice.call(arguments,0);return mb("isAfter",a)},vb.utc=function(b,c,e,f){var g;return"boolean"==typeof e&&(f=e,e=a),g={},g._isAMomentObject=!0,g._useUTC=!0,g._isUTC=!0,g._l=e,g._i=b,g._f=c,g._strict=f,g._pf=d(),lb(g).utc()},vb.unix=function(a){return vb(1e3*a)},vb.duration=function(a,b){var d,e,f,g,h=a,i=null;return vb.isDuration(a)?h={ms:a._milliseconds,d:a._days,M:a._months}:"number"==typeof a?(h={},b?h[b]=a:h.milliseconds=a):(i=Nb.exec(a))?(d="-"===i[1]?-1:1,h={y:0,d:C(i[Eb])*d,h:C(i[Fb])*d,m:C(i[Gb])*d,s:C(i[Hb])*d,ms:C(i[Ib])*d}):(i=Ob.exec(a))?(d="-"===i[1]?-1:1,f=function(a){var b=a&&parseFloat(a.replace(",","."));return(isNaN(b)?0:b)*d},h={y:f(i[2]),M:f(i[3]),d:f(i[4]),h:f(i[5]),m:f(i[6]),s:f(i[7]),w:f(i[8])}):null==h?h={}:"object"==typeof h&&("from"in h||"to"in h)&&(g=t(vb(h.from),vb(h.to)),h={},h.ms=g.milliseconds,h.M=g.months),e=new n(h),vb.isDuration(a)&&c(a,"_locale")&&(e._locale=a._locale),e},vb.version=yb,vb.defaultFormat=gc,vb.ISO_8601=function(){},vb.momentProperties=Kb,vb.updateOffset=function(){},vb.relativeTimeThreshold=function(b,c){return oc[b]===a?!1:c===a?oc[b]:(oc[b]=c,!0)},vb.lang=f("moment.lang is deprecated. Use moment.locale instead.",function(a,b){return vb.locale(a,b)}),vb.locale=function(a,b){var c;return a&&(c="undefined"!=typeof b?vb.defineLocale(a,b):vb.localeData(a),c&&(vb.duration._locale=vb._locale=c)),vb._locale._abbr},vb.defineLocale=function(a,b){return null!==b?(b.abbr=a,Jb[a]||(Jb[a]=new l),Jb[a].set(b),vb.locale(a),Jb[a]):(delete Jb[a],null)},vb.langData=f("moment.langData is deprecated. Use moment.localeData instead.",function(a){return vb.localeData(a)}),vb.localeData=function(a){var b;if(a&&a._locale&&a._locale._abbr&&(a=a._locale._abbr),!a)return vb._locale;if(!w(a)){if(b=L(a))return b;a=[a]}return K(a)},vb.isMoment=function(a){return a instanceof m||null!=a&&c(a,"_isAMomentObject")},vb.isDuration=function(a){return a instanceof n};for(xb=tc.length-1;xb>=0;--xb)B(tc[xb]);vb.normalizeUnits=function(a){return z(a)},vb.invalid=function(a){var b=vb.utc(0/0);return null!=a?o(b._pf,a):b._pf.userInvalidated=!0,b},vb.parseZone=function(){return vb.apply(null,arguments).parseZone()},vb.parseTwoDigitYear=function(a){return C(a)+(C(a)>68?1900:2e3)},vb.isDate=x,o(vb.fn=m.prototype,{clone:function(){return vb(this)},valueOf:function(){return+this._d-6e4*(this._offset||0)},unix:function(){return Math.floor(+this/1e3)},toString:function(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")},toDate:function(){return this._offset?new Date(+this):this._d},toISOString:function(){var a=vb(this).utc();return 0<a.year()&&a.year()<=9999?"function"==typeof Date.prototype.toISOString?this.toDate().toISOString():P(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):P(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")},toArray:function(){var a=this;return[a.year(),a.month(),a.date(),a.hours(),a.minutes(),a.seconds(),a.milliseconds()]},isValid:function(){return I(this)},isDSTShifted:function(){return this._a?this.isValid()&&y(this._a,(this._isUTC?vb.utc(this._a):vb(this._a)).toArray())>0:!1},parsingFlags:function(){return o({},this._pf)},invalidAt:function(){return this._pf.overflow},utc:function(a){return this.utcOffset(0,a)},local:function(a){return this._isUTC&&(this.utcOffset(0,a),this._isUTC=!1,a&&this.subtract(this._dateUtcOffset(),"m")),this},format:function(a){var b=P(this,a||vb.defaultFormat);return this.localeData().postformat(b)},add:u(1,"add"),subtract:u(-1,"subtract"),diff:function(a,b,c){var d,e,f=M(a,this),g=6e4*(f.utcOffset()-this.utcOffset());return b=z(b),"year"===b||"month"===b||"quarter"===b?(e=j(this,f),"quarter"===b?e/=3:"year"===b&&(e/=12)):(d=this-f,e="second"===b?d/1e3:"minute"===b?d/6e4:"hour"===b?d/36e5:"day"===b?(d-g)/864e5:"week"===b?(d-g)/6048e5:d),c?e:q(e)},from:function(a,b){return vb.duration({to:this,from:a}).locale(this.locale()).humanize(!b)},fromNow:function(a){return this.from(vb(),a)},calendar:function(a){var b=a||vb(),c=M(b,this).startOf("day"),d=this.diff(c,"days",!0),e=-6>d?"sameElse":-1>d?"lastWeek":0>d?"lastDay":1>d?"sameDay":2>d?"nextDay":7>d?"nextWeek":"sameElse";return this.format(this.localeData().calendar(e,this,vb(b)))},isLeapYear:function(){return G(this.year())},isDST:function(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()},day:function(a){var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=gb(a,this.localeData()),this.add(a-b,"d")):b},month:qb("Month",!0),startOf:function(a){switch(a=z(a)){case"year":this.month(0);case"quarter":case"month":this.date(1);case"week":case"isoWeek":case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===a?this.weekday(0):"isoWeek"===a&&this.isoWeekday(1),"quarter"===a&&this.month(3*Math.floor(this.month()/3)),this},endOf:function(b){return b=z(b),b===a||"millisecond"===b?this:this.startOf(b).add(1,"isoWeek"===b?"week":b).subtract(1,"ms")},isAfter:function(a,b){var c;return b=z("undefined"!=typeof b?b:"millisecond"),"millisecond"===b?(a=vb.isMoment(a)?a:vb(a),+this>+a):(c=vb.isMoment(a)?+a:+vb(a),c<+this.clone().startOf(b))},isBefore:function(a,b){var c;return b=z("undefined"!=typeof b?b:"millisecond"),"millisecond"===b?(a=vb.isMoment(a)?a:vb(a),+a>+this):(c=vb.isMoment(a)?+a:+vb(a),+this.clone().endOf(b)<c)},isBetween:function(a,b,c){return this.isAfter(a,c)&&this.isBefore(b,c)},isSame:function(a,b){var c;return b=z(b||"millisecond"),"millisecond"===b?(a=vb.isMoment(a)?a:vb(a),+this===+a):(c=+vb(a),+this.clone().startOf(b)<=c&&c<=+this.clone().endOf(b))},min:f("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548",function(a){return a=vb.apply(null,arguments),this>a?this:a}),max:f("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548",function(a){return a=vb.apply(null,arguments),a>this?this:a}),zone:f("moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779",function(a,b){return null!=a?("string"!=typeof a&&(a=-a),this.utcOffset(a,b),this):-this.utcOffset()}),utcOffset:function(a,b){var c,d=this._offset||0;return null!=a?("string"==typeof a&&(a=S(a)),Math.abs(a)<16&&(a=60*a),!this._isUTC&&b&&(c=this._dateUtcOffset()),this._offset=a,this._isUTC=!0,null!=c&&this.add(c,"m"),d!==a&&(!b||this._changeInProgress?v(this,vb.duration(a-d,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,vb.updateOffset(this,!0),this._changeInProgress=null)),this):this._isUTC?d:this._dateUtcOffset()},isLocal:function(){return!this._isUTC},isUtcOffset:function(){return this._isUTC},isUtc:function(){return this._isUTC&&0===this._offset},zoneAbbr:function(){return this._isUTC?"UTC":""},zoneName:function(){return this._isUTC?"Coordinated Universal Time":""},parseZone:function(){return this._tzm?this.utcOffset(this._tzm):"string"==typeof this._i&&this.utcOffset(S(this._i)),this},hasAlignedHourOffset:function(a){return a=a?vb(a).utcOffset():0,(this.utcOffset()-a)%60===0},daysInMonth:function(){return D(this.year(),this.month())},dayOfYear:function(a){var b=Ab((vb(this).startOf("day")-vb(this).startOf("year"))/864e5)+1;return null==a?b:this.add(a-b,"d")},quarter:function(a){return null==a?Math.ceil((this.month()+1)/3):this.month(3*(a-1)+this.month()%3)},weekYear:function(a){var b=jb(this,this.localeData()._week.dow,this.localeData()._week.doy).year;return null==a?b:this.add(a-b,"y")},isoWeekYear:function(a){var b=jb(this,1,4).year;return null==a?b:this.add(a-b,"y")},week:function(a){var b=this.localeData().week(this);return null==a?b:this.add(7*(a-b),"d")},isoWeek:function(a){var b=jb(this,1,4).week;return null==a?b:this.add(7*(a-b),"d")},weekday:function(a){var b=(this.day()+7-this.localeData()._week.dow)%7;return null==a?b:this.add(a-b,"d")},isoWeekday:function(a){return null==a?this.day()||7:this.day(this.day()%7?a:a-7)},isoWeeksInYear:function(){return E(this.year(),1,4)},weeksInYear:function(){var a=this.localeData()._week;return E(this.year(),a.dow,a.doy)},get:function(a){return a=z(a),this[a]()},set:function(a,b){var c;if("object"==typeof a)for(c in a)this.set(c,a[c]);else a=z(a),"function"==typeof this[a]&&this[a](b);return this},locale:function(b){var c;return b===a?this._locale._abbr:(c=vb.localeData(b),null!=c&&(this._locale=c),this)},lang:f("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(b){return b===a?this.localeData():this.locale(b)}),localeData:function(){return this._locale},_dateUtcOffset:function(){return 15*-Math.round(this._d.getTimezoneOffset()/15)}}),vb.fn.millisecond=vb.fn.milliseconds=qb("Milliseconds",!1),vb.fn.second=vb.fn.seconds=qb("Seconds",!1),vb.fn.minute=vb.fn.minutes=qb("Minutes",!1),vb.fn.hour=vb.fn.hours=qb("Hours",!0),vb.fn.date=qb("Date",!0),vb.fn.dates=f("dates accessor is deprecated. Use date instead.",qb("Date",!0)),vb.fn.year=qb("FullYear",!0),vb.fn.years=f("years accessor is deprecated. Use year instead.",qb("FullYear",!0)),vb.fn.days=vb.fn.day,vb.fn.months=vb.fn.month,vb.fn.weeks=vb.fn.week,vb.fn.isoWeeks=vb.fn.isoWeek,vb.fn.quarters=vb.fn.quarter,vb.fn.toJSON=vb.fn.toISOString,vb.fn.isUTC=vb.fn.isUtc,o(vb.duration.fn=n.prototype,{_bubble:function(){var a,b,c,d=this._milliseconds,e=this._days,f=this._months,g=this._data,h=0;g.milliseconds=d%1e3,a=q(d/1e3),g.seconds=a%60,b=q(a/60),g.minutes=b%60,c=q(b/60),g.hours=c%24,e+=q(c/24),h=q(rb(e)),e-=q(sb(h)),f+=q(e/30),e%=30,h+=q(f/12),f%=12,g.days=e,g.months=f,g.years=h},abs:function(){return this._milliseconds=Math.abs(this._milliseconds),this._days=Math.abs(this._days),this._months=Math.abs(this._months),this._data.milliseconds=Math.abs(this._data.milliseconds),this._data.seconds=Math.abs(this._data.seconds),this._data.minutes=Math.abs(this._data.minutes),this._data.hours=Math.abs(this._data.hours),this._data.months=Math.abs(this._data.months),this._data.years=Math.abs(this._data.years),this},weeks:function(){return q(this.days()/7)},valueOf:function(){return this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*C(this._months/12)
},humanize:function(a){var b=ib(this,!a,this.localeData());return a&&(b=this.localeData().pastFuture(+this,b)),this.localeData().postformat(b)},add:function(a,b){var c=vb.duration(a,b);return this._milliseconds+=c._milliseconds,this._days+=c._days,this._months+=c._months,this._bubble(),this},subtract:function(a,b){var c=vb.duration(a,b);return this._milliseconds-=c._milliseconds,this._days-=c._days,this._months-=c._months,this._bubble(),this},get:function(a){return a=z(a),this[a.toLowerCase()+"s"]()},as:function(a){var b,c;if(a=z(a),"month"===a||"year"===a)return b=this._days+this._milliseconds/864e5,c=this._months+12*rb(b),"month"===a?c:c/12;switch(b=this._days+Math.round(sb(this._months/12)),a){case"week":return b/7+this._milliseconds/6048e5;case"day":return b+this._milliseconds/864e5;case"hour":return 24*b+this._milliseconds/36e5;case"minute":return 24*b*60+this._milliseconds/6e4;case"second":return 24*b*60*60+this._milliseconds/1e3;case"millisecond":return Math.floor(24*b*60*60*1e3)+this._milliseconds;default:throw new Error("Unknown unit "+a)}},lang:vb.fn.lang,locale:vb.fn.locale,toIsoString:f("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",function(){return this.toISOString()}),toISOString:function(){var a=Math.abs(this.years()),b=Math.abs(this.months()),c=Math.abs(this.days()),d=Math.abs(this.hours()),e=Math.abs(this.minutes()),f=Math.abs(this.seconds()+this.milliseconds()/1e3);return this.asSeconds()?(this.asSeconds()<0?"-":"")+"P"+(a?a+"Y":"")+(b?b+"M":"")+(c?c+"D":"")+(d||e||f?"T":"")+(d?d+"H":"")+(e?e+"M":"")+(f?f+"S":""):"P0D"},localeData:function(){return this._locale},toJSON:function(){return this.toISOString()}}),vb.duration.fn.toString=vb.duration.fn.toISOString;for(xb in kc)c(kc,xb)&&tb(xb.toLowerCase());vb.duration.fn.asMilliseconds=function(){return this.as("ms")},vb.duration.fn.asSeconds=function(){return this.as("s")},vb.duration.fn.asMinutes=function(){return this.as("m")},vb.duration.fn.asHours=function(){return this.as("h")},vb.duration.fn.asDays=function(){return this.as("d")},vb.duration.fn.asWeeks=function(){return this.as("weeks")},vb.duration.fn.asMonths=function(){return this.as("M")},vb.duration.fn.asYears=function(){return this.as("y")},vb.locale("en",{ordinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(a){var b=a%10,c=1===C(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),Lb?module.exports=vb:"function"==typeof define&&define.amd?(define(function(a,b,c){return c.config&&c.config()&&c.config().noGlobal===!0&&(zb.moment=wb),vb}),ub(!0)):ub()}).call(this);
/*!
 * numeral.js
 * version : 1.5.3
 * author : Adam Draper
 * license : MIT
 * http://adamwdraper.github.com/Numeral-js/
 */
(function(){function a(a){this._value=a}function b(a,b,c,d){var e,f,g=Math.pow(10,b);return f=(c(a*g)/g).toFixed(b),d&&(e=new RegExp("0{1,"+d+"}$"),f=f.replace(e,"")),f}function c(a,b,c){var d;return d=b.indexOf("$")>-1?e(a,b,c):b.indexOf("%")>-1?f(a,b,c):b.indexOf(":")>-1?g(a,b):i(a._value,b,c)}function d(a,b){var c,d,e,f,g,i=b,j=["KB","MB","GB","TB","PB","EB","ZB","YB"],k=!1;if(b.indexOf(":")>-1)a._value=h(b);else if(b===q)a._value=0;else{for("."!==o[p].delimiters.decimal&&(b=b.replace(/\./g,"").replace(o[p].delimiters.decimal,".")),c=new RegExp("[^a-zA-Z]"+o[p].abbreviations.thousand+"(?:\\)|(\\"+o[p].currency.symbol+")?(?:\\))?)?$"),d=new RegExp("[^a-zA-Z]"+o[p].abbreviations.million+"(?:\\)|(\\"+o[p].currency.symbol+")?(?:\\))?)?$"),e=new RegExp("[^a-zA-Z]"+o[p].abbreviations.billion+"(?:\\)|(\\"+o[p].currency.symbol+")?(?:\\))?)?$"),f=new RegExp("[^a-zA-Z]"+o[p].abbreviations.trillion+"(?:\\)|(\\"+o[p].currency.symbol+")?(?:\\))?)?$"),g=0;g<=j.length&&!(k=b.indexOf(j[g])>-1?Math.pow(1024,g+1):!1);g++);a._value=(k?k:1)*(i.match(c)?Math.pow(10,3):1)*(i.match(d)?Math.pow(10,6):1)*(i.match(e)?Math.pow(10,9):1)*(i.match(f)?Math.pow(10,12):1)*(b.indexOf("%")>-1?.01:1)*((b.split("-").length+Math.min(b.split("(").length-1,b.split(")").length-1))%2?1:-1)*Number(b.replace(/[^0-9\.]+/g,"")),a._value=k?Math.ceil(a._value):a._value}return a._value}function e(a,b,c){var d,e,f=b.indexOf("$"),g=b.indexOf("("),h=b.indexOf("-"),j="";return b.indexOf(" $")>-1?(j=" ",b=b.replace(" $","")):b.indexOf("$ ")>-1?(j=" ",b=b.replace("$ ","")):b=b.replace("$",""),e=i(a._value,b,c),1>=f?e.indexOf("(")>-1||e.indexOf("-")>-1?(e=e.split(""),d=1,(g>f||h>f)&&(d=0),e.splice(d,0,o[p].currency.symbol+j),e=e.join("")):e=o[p].currency.symbol+j+e:e.indexOf(")")>-1?(e=e.split(""),e.splice(-1,0,j+o[p].currency.symbol),e=e.join("")):e=e+j+o[p].currency.symbol,e}function f(a,b,c){var d,e="",f=100*a._value;return b.indexOf(" %")>-1?(e=" ",b=b.replace(" %","")):b=b.replace("%",""),d=i(f,b,c),d.indexOf(")")>-1?(d=d.split(""),d.splice(-1,0,e+"%"),d=d.join("")):d=d+e+"%",d}function g(a){var b=Math.floor(a._value/60/60),c=Math.floor((a._value-60*b*60)/60),d=Math.round(a._value-60*b*60-60*c);return b+":"+(10>c?"0"+c:c)+":"+(10>d?"0"+d:d)}function h(a){var b=a.split(":"),c=0;return 3===b.length?(c+=60*Number(b[0])*60,c+=60*Number(b[1]),c+=Number(b[2])):2===b.length&&(c+=60*Number(b[0]),c+=Number(b[1])),Number(c)}function i(a,c,d){var e,f,g,h,i,j,k=!1,l=!1,m=!1,n="",r=!1,s=!1,t=!1,u=!1,v=!1,w="",x="",y=Math.abs(a),z=["B","KB","MB","GB","TB","PB","EB","ZB","YB"],A="",B=!1;if(0===a&&null!==q)return q;if(c.indexOf("(")>-1?(k=!0,c=c.slice(1,-1)):c.indexOf("+")>-1&&(l=!0,c=c.replace(/\+/g,"")),c.indexOf("a")>-1&&(r=c.indexOf("aK")>=0,s=c.indexOf("aM")>=0,t=c.indexOf("aB")>=0,u=c.indexOf("aT")>=0,v=r||s||t||u,c.indexOf(" a")>-1?(n=" ",c=c.replace(" a","")):c=c.replace("a",""),y>=Math.pow(10,12)&&!v||u?(n+=o[p].abbreviations.trillion,a/=Math.pow(10,12)):y<Math.pow(10,12)&&y>=Math.pow(10,9)&&!v||t?(n+=o[p].abbreviations.billion,a/=Math.pow(10,9)):y<Math.pow(10,9)&&y>=Math.pow(10,6)&&!v||s?(n+=o[p].abbreviations.million,a/=Math.pow(10,6)):(y<Math.pow(10,6)&&y>=Math.pow(10,3)&&!v||r)&&(n+=o[p].abbreviations.thousand,a/=Math.pow(10,3))),c.indexOf("b")>-1)for(c.indexOf(" b")>-1?(w=" ",c=c.replace(" b","")):c=c.replace("b",""),g=0;g<=z.length;g++)if(e=Math.pow(1024,g),f=Math.pow(1024,g+1),a>=e&&f>a){w+=z[g],e>0&&(a/=e);break}return c.indexOf("o")>-1&&(c.indexOf(" o")>-1?(x=" ",c=c.replace(" o","")):c=c.replace("o",""),x+=o[p].ordinal(a)),c.indexOf("[.]")>-1&&(m=!0,c=c.replace("[.]",".")),h=a.toString().split(".")[0],i=c.split(".")[1],j=c.indexOf(","),i?(i.indexOf("[")>-1?(i=i.replace("]",""),i=i.split("["),A=b(a,i[0].length+i[1].length,d,i[1].length)):A=b(a,i.length,d),h=A.split(".")[0],A=A.split(".")[1].length?o[p].delimiters.decimal+A.split(".")[1]:"",m&&0===Number(A.slice(1))&&(A="")):h=b(a,null,d),h.indexOf("-")>-1&&(h=h.slice(1),B=!0),j>-1&&(h=h.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,"$1"+o[p].delimiters.thousands)),0===c.indexOf(".")&&(h=""),(k&&B?"(":"")+(!k&&B?"-":"")+(!B&&l?"+":"")+h+A+(x?x:"")+(n?n:"")+(w?w:"")+(k&&B?")":"")}function j(a,b){o[a]=b}function k(a){var b=a.toString().split(".");return b.length<2?1:Math.pow(10,b[1].length)}function l(){var a=Array.prototype.slice.call(arguments);return a.reduce(function(a,b){var c=k(a),d=k(b);return c>d?c:d},-1/0)}var m,n="1.5.3",o={},p="en",q=null,r="0,0",s="undefined"!=typeof module&&module.exports;m=function(b){return m.isNumeral(b)?b=b.value():0===b||"undefined"==typeof b?b=0:Number(b)||(b=m.fn.unformat(b)),new a(Number(b))},m.version=n,m.isNumeral=function(b){return b instanceof a},m.language=function(a,b){if(!a)return p;if(a&&!b){if(!o[a])throw new Error("Unknown language : "+a);p=a}return(b||!o[a])&&j(a,b),m},m.languageData=function(a){if(!a)return o[p];if(!o[a])throw new Error("Unknown language : "+a);return o[a]},m.language("en",{delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(a){var b=a%10;return 1===~~(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th"},currency:{symbol:"$"}}),m.zeroFormat=function(a){q="string"==typeof a?a:null},m.defaultFormat=function(a){r="string"==typeof a?a:"0.0"},"function"!=typeof Array.prototype.reduce&&(Array.prototype.reduce=function(a,b){"use strict";if(null===this||"undefined"==typeof this)throw new TypeError("Array.prototype.reduce called on null or undefined");if("function"!=typeof a)throw new TypeError(a+" is not a function");var c,d,e=this.length>>>0,f=!1;for(1<arguments.length&&(d=b,f=!0),c=0;e>c;++c)this.hasOwnProperty(c)&&(f?d=a(d,this[c],c,this):(d=this[c],f=!0));if(!f)throw new TypeError("Reduce of empty array with no initial value");return d}),m.fn=a.prototype={clone:function(){return m(this)},format:function(a,b){return c(this,a?a:r,void 0!==b?b:Math.round)},unformat:function(a){return"[object Number]"===Object.prototype.toString.call(a)?a:d(this,a?a:r)},value:function(){return this._value},valueOf:function(){return this._value},set:function(a){return this._value=Number(a),this},add:function(a){function b(a,b){return a+c*b}var c=l.call(null,this._value,a);return this._value=[this._value,a].reduce(b,0)/c,this},subtract:function(a){function b(a,b){return a-c*b}var c=l.call(null,this._value,a);return this._value=[a].reduce(b,this._value*c)/c,this},multiply:function(a){function b(a,b){var c=l(a,b);return a*c*b*c/(c*c)}return this._value=[this._value,a].reduce(b,1),this},divide:function(a){function b(a,b){var c=l(a,b);return a*c/(b*c)}return this._value=[this._value,a].reduce(b),this},difference:function(a){return Math.abs(m(this._value).subtract(a).value())}},s&&(module.exports=m),"undefined"==typeof ender&&(this.numeral=m),"function"==typeof define&&define.amd&&define([],function(){return m})}).call(this);
!function n(t,e,r){function o(u,f){if(!e[u]){if(!t[u]){var c="function"==typeof require&&require;if(!f&&c)return c(u,!0);if(i)return i(u,!0);var s=new Error("Cannot find module '"+u+"'");throw s.code="MODULE_NOT_FOUND",s}var l=e[u]={exports:{}};t[u][0].call(l.exports,function(n){var e=t[u][1][n];return o(e?e:n)},l,l.exports,n,t,e,r)}return e[u].exports}for(var i="function"==typeof require&&require,u=0;u<r.length;u++)o(r[u]);return o}({1:[function(n,t,e){"use strict";function r(){}function o(n){try{return n.then}catch(t){return d=t,w}}function i(n,t){try{return n(t)}catch(e){return d=e,w}}function u(n,t,e){try{n(t,e)}catch(r){return d=r,w}}function f(n){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof n)throw new TypeError("not a function");this._37=0,this._12=null,this._59=[],n!==r&&v(n,this)}function c(n,t,e){return new n.constructor(function(o,i){var u=new f(r);u.then(o,i),s(n,new p(t,e,u))})}function s(n,t){for(;3===n._37;)n=n._12;return 0===n._37?void n._59.push(t):void y(function(){var e=1===n._37?t.onFulfilled:t.onRejected;if(null===e)return void(1===n._37?l(t.promise,n._12):a(t.promise,n._12));var r=i(e,n._12);r===w?a(t.promise,d):l(t.promise,r)})}function l(n,t){if(t===n)return a(n,new TypeError("A promise cannot be resolved with itself."));if(t&&("object"==typeof t||"function"==typeof t)){var e=o(t);if(e===w)return a(n,d);if(e===n.then&&t instanceof f)return n._37=3,n._12=t,void h(n);if("function"==typeof e)return void v(e.bind(t),n)}n._37=1,n._12=t,h(n)}function a(n,t){n._37=2,n._12=t,h(n)}function h(n){for(var t=0;t<n._59.length;t++)s(n,n._59[t]);n._59=null}function p(n,t,e){this.onFulfilled="function"==typeof n?n:null,this.onRejected="function"==typeof t?t:null,this.promise=e}function v(n,t){var e=!1,r=u(n,function(n){e||(e=!0,l(t,n))},function(n){e||(e=!0,a(t,n))});e||r!==w||(e=!0,a(t,d))}var y=n("asap/raw"),d=null,w={};t.exports=f,f._99=r,f.prototype.then=function(n,t){if(this.constructor!==f)return c(this,n,t);var e=new f(r);return s(this,new p(n,t,e)),e}},{"asap/raw":4}],2:[function(n,t,e){"use strict";function r(n){var t=new o(o._99);return t._37=1,t._12=n,t}var o=n("./core.js");t.exports=o;var i=r(!0),u=r(!1),f=r(null),c=r(void 0),s=r(0),l=r("");o.resolve=function(n){if(n instanceof o)return n;if(null===n)return f;if(void 0===n)return c;if(n===!0)return i;if(n===!1)return u;if(0===n)return s;if(""===n)return l;if("object"==typeof n||"function"==typeof n)try{var t=n.then;if("function"==typeof t)return new o(t.bind(n))}catch(e){return new o(function(n,t){t(e)})}return r(n)},o.all=function(n){var t=Array.prototype.slice.call(n);return new o(function(n,e){function r(u,f){if(f&&("object"==typeof f||"function"==typeof f)){if(f instanceof o&&f.then===o.prototype.then){for(;3===f._37;)f=f._12;return 1===f._37?r(u,f._12):(2===f._37&&e(f._12),void f.then(function(n){r(u,n)},e))}var c=f.then;if("function"==typeof c){var s=new o(c.bind(f));return void s.then(function(n){r(u,n)},e)}}t[u]=f,0===--i&&n(t)}if(0===t.length)return n([]);for(var i=t.length,u=0;u<t.length;u++)r(u,t[u])})},o.reject=function(n){return new o(function(t,e){e(n)})},o.race=function(n){return new o(function(t,e){n.forEach(function(n){o.resolve(n).then(t,e)})})},o.prototype["catch"]=function(n){return this.then(null,n)}},{"./core.js":1}],3:[function(n,t,e){"use strict";function r(){if(c.length)throw c.shift()}function o(n){var t;t=f.length?f.pop():new i,t.task=n,u(t)}function i(){this.task=null}var u=n("./raw"),f=[],c=[],s=u.makeRequestCallFromTimer(r);t.exports=o,i.prototype.call=function(){try{this.task.call()}catch(n){o.onerror?o.onerror(n):(c.push(n),s())}finally{this.task=null,f[f.length]=this}}},{"./raw":4}],4:[function(n,t,e){(function(n){"use strict";function e(n){f.length||(u(),c=!0),f[f.length]=n}function r(){for(;s<f.length;){var n=s;if(s+=1,f[n].call(),s>l){for(var t=0,e=f.length-s;e>t;t++)f[t]=f[t+s];f.length-=s,s=0}}f.length=0,s=0,c=!1}function o(n){var t=1,e=new a(n),r=document.createTextNode("");return e.observe(r,{characterData:!0}),function(){t=-t,r.data=t}}function i(n){return function(){function t(){clearTimeout(e),clearInterval(r),n()}var e=setTimeout(t,0),r=setInterval(t,50)}}t.exports=e;var u,f=[],c=!1,s=0,l=1024,a=n.MutationObserver||n.WebKitMutationObserver;u="function"==typeof a?o(r):i(r),e.requestFlush=u,e.makeRequestCallFromTimer=i}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],5:[function(n,t,e){"function"!=typeof Promise.prototype.done&&(Promise.prototype.done=function(n,t){var e=arguments.length?this.then.apply(this,arguments):this;e.then(null,function(n){setTimeout(function(){throw n},0)})})},{}],6:[function(n,t,e){n("asap");"undefined"==typeof Promise&&(Promise=n("./lib/core.js"),n("./lib/es6-extensions.js")),n("./polyfill-done.js")},{"./lib/core.js":1,"./lib/es6-extensions.js":2,"./polyfill-done.js":5,asap:3}]},{},[6]);
//# sourceMappingURL=/polyfills/promise-7.0.4.min.js.map

/**
 * Resize function without multiple trigger
 * 
 * Usage:
 * $(window).smartresize(function(){  
 *     // code here
 * });
 */
(function($,sr){
    // debouncing function from John Hann
    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
    var debounce = function (func, threshold, execAsap) {
      var timeout;

        return function debounced () {
            var obj = this, args = arguments;
            function delayed () {
                if (!execAsap)
                    func.apply(obj, args); 
                timeout = null; 
            }

            if (timeout)
                clearTimeout(timeout);
            else if (execAsap)
                func.apply(obj, args);

            timeout = setTimeout(delayed, threshold || 100); 
        };
    };

    // smartresize 
    jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'smartresize');
/*
 *  Copyright (C) 2016 Quaternion Risk Management Ltd
 *  All rights reserved
 *
 */


var CURRENT_URL = window.location.href.split('?')[0],
    $BODY = $('body'),
    $MENU_TOGGLE = $('#menu_toggle'),
    $SIDEBAR_MENU = $('#sidebar-menu'),
    $SIDEBAR_FOOTER = $('.sidebar-footer'),
    $LEFT_COL = $('.left_col'),
    $RIGHT_COL = $('.right_col'),
    $NAV_MENU = $('.nav_menu'),
    $FOOTER = $('footer');

// Sidebar
$(document).ready(function() {
    // TODO: This is some kind of easy fix, maybe we can improve this
    var setContentHeight = function () {
        // reset height
        $RIGHT_COL.css('min-height', $(window).height());

        var bodyHeight = $BODY.outerHeight(),
            footerHeight = $BODY.hasClass('footer_fixed') ? -10 : $FOOTER.height(),
            leftColHeight = $LEFT_COL.eq(1).height() + $SIDEBAR_FOOTER.height(),
            contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;

        // normalize content
        contentHeight -= $NAV_MENU.height() + footerHeight;

        $RIGHT_COL.css('min-height', contentHeight);
    };

    $SIDEBAR_MENU.find('a').on('click', function(ev) {
        var $li = $(this).parent();

        if ($li.is('.active')) {
            $li.removeClass('active active-sm');
            $('ul:first', $li).slideUp(function() {
                setContentHeight();
            });
        } else {
            // prevent closing menu if we are on child menu
            if (!$li.parent().is('.child_menu')) {
                $SIDEBAR_MENU.find('li').removeClass('active active-sm');
                $SIDEBAR_MENU.find('li ul').slideUp();
            }
            
            $li.addClass('active');

            $('ul:first', $li).slideDown(function() {
                setContentHeight();
            });
        }
    });

    // toggle small or large menu
    $MENU_TOGGLE.on('click', function() {
        if ($BODY.hasClass('nav-md')) {
            $SIDEBAR_MENU.find('li.active ul').hide();
            $SIDEBAR_MENU.find('li.active').addClass('active-sm').removeClass('active');
        } else {
            $SIDEBAR_MENU.find('li.active-sm ul').show();
            $SIDEBAR_MENU.find('li.active-sm').addClass('active').removeClass('active-sm');
        }

        $BODY.toggleClass('nav-md nav-sm');

        setContentHeight();
    });

    // check active menu
    $SIDEBAR_MENU.find('a[href="' + CURRENT_URL + '"]').parent('li').addClass('current-page');

    $SIDEBAR_MENU.find('a').filter(function () {
        return this.href == CURRENT_URL;
    }).parent('li').addClass('current-page').parents('ul').slideDown(function() {
        setContentHeight();
    }).parent().addClass('active');

    // recompute content when resizing
    $(window).smartresize(function(){  
        setContentHeight();
    });

    setContentHeight();

    // fixed sidebar
    if ($.fn.mCustomScrollbar) {
        $('.menu_fixed').mCustomScrollbar({
            autoHideScrollbar: true,
            theme: 'minimal',
            mouseWheel:{ preventDefault: true }
        });
    }
});
// /Sidebar

// Panel toolbox
$(document).ready(function() {
    $('.collapse-link').on('click', function() {
        var $BOX_PANEL = $(this).closest('.x_panel'),
            $ICON = $(this).find('i'),
            $BOX_CONTENT = $BOX_PANEL.find('.x_content');
        
        // fix for some div with hardcoded fix class
        if ($BOX_PANEL.attr('style')) {
            $BOX_CONTENT.slideToggle(200, function(){
                $BOX_PANEL.removeAttr('style');
            });
        } else {
            $BOX_CONTENT.slideToggle(200); 
            $BOX_PANEL.css('height', 'auto');  
        }

        $ICON.toggleClass('fa-chevron-up fa-chevron-down');
    });

    $('.close-link').click(function () {
        var $BOX_PANEL = $(this).closest('.x_panel');

        $BOX_PANEL.remove();
    });
});
// /Panel toolbox

// Tooltip
$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip({
        container: 'body'
    });
});
// /Tooltip

// Progressbar
if ($(".progress .progress-bar")[0]) {
    $('.progress .progress-bar').progressbar();
}
// /Progressbar

// Switchery
$(document).ready(function() {
    if ($(".js-switch")[0]) {
        var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
        elems.forEach(function (html) {
            var switchery = new Switchery(html, {
                color: '#26B99A'
            });
        });
    }
});
// /Switchery

// iCheck
$(document).ready(function() {
    if ($("input.flat")[0]) {
        $(document).ready(function () {
            $('input.flat').iCheck({
                checkboxClass: 'icheckbox_flat-green',
                radioClass: 'iradio_flat-green'
            });
        });
    }
});
// /iCheck

// Table
$('table input').on('ifChecked', function () {
    checkState = '';
    $(this).parent().parent().parent().addClass('selected');
    countChecked();
});
$('table input').on('ifUnchecked', function () {
    checkState = '';
    $(this).parent().parent().parent().removeClass('selected');
    countChecked();
});

var checkState = '';

$('.bulk_action input').on('ifChecked', function () {
    checkState = '';
    $(this).parent().parent().parent().addClass('selected');
    countChecked();
});
$('.bulk_action input').on('ifUnchecked', function () {
    checkState = '';
    $(this).parent().parent().parent().removeClass('selected');
    countChecked();
});
$('.bulk_action input#check-all').on('ifChecked', function () {
    checkState = 'all';
    countChecked();
});
$('.bulk_action input#check-all').on('ifUnchecked', function () {
    checkState = 'none';
    countChecked();
});

function countChecked() {
    if (checkState === 'all') {
        $(".bulk_action input[name='table_records']").iCheck('check');
    }
    if (checkState === 'none') {
        $(".bulk_action input[name='table_records']").iCheck('uncheck');
    }

    var checkCount = $(".bulk_action input[name='table_records']:checked").length;

    if (checkCount) {
        $('.column-title').hide();
        $('.bulk-actions').show();
        $('.action-cnt').html(checkCount + ' Records Selected');
    } else {
        $('.column-title').show();
        $('.bulk-actions').hide();
    }
}

// Accordion
$(document).ready(function() {
    $(".expand").on("click", function () {
        $(this).next().slideToggle(200);
        $expand = $(this).find(">:first-child");

        if ($expand.text() == "+") {
            $expand.text("-");
        } else {
            $expand.text("+");
        }
    });
});

// NProgress
if (typeof NProgress != 'undefined') {
    $(document).ready(function () {
        NProgress.start();
    });

    $(window).load(function () {
        NProgress.done();
    });
}


function pdfMe(){

html2canvas(document.getElementById('export_me_'), {
    onrendered: function (canvas) {
        var data = canvas.toDataURL();
        var docDefinition = {
            content: [{
                image: data,
                width: 500,
            }]
        };
        pdfMake.createPdf(docDefinition).download("ORE_Demo.pdf");
    }
});
}


/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */
function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }

    return _p8() + _p8(true) + _p8(true) + _p8();
}

var processStatus = function (response) {
    // status "0" to handle local files fetching (e.g. Cordova/Phonegap etc.)
    if ((response.status >= 200 && response.status < 300 ) || response.status === 0) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.statusText))
    }
};
var parseJson = function (response) {
    // console.debug(response);
    return response.json();
}
var parseTextResponse = function (response) {
    // console.debug(response);
    return response.text();
}

/**
 * Used to attach events to an element or object in a browser independent way
 * @param element
 * @param event
 * @param callbackFunction
 */
function _AttachEvent(element, type, handler) {
    if (element.addEventListener) element.addEventListener(type, handler, false);
    else element.attachEvent("on" + type, handler);
}

// check JSON object for child nodes
function checkNestedFast(obj /*, level1, level2, ... levelN*/) {
    // eg checkNestedFast(data, 'swap', 'pay_leg', 'has_compounding')
    for (var i = 1; i < arguments.length; i++) {
        if (!obj.hasOwnProperty(arguments[i])) {
            return false;
        }
        obj = obj[arguments[i]];
    }
    return true;
}

function isNullOrUndefined(a) {
    var rc = false;

    if (typeof (a) === "undefined" || a === null) {
        rc = true;
    }

    return rc;
}

function getJSessionId() {
    var jsId = document.cookie.match(/JSESSIONID=[^;]+/);
    if (jsId != null) {
        if (jsId instanceof Array)
            jsId = jsId[0].substring(11);
        else
            jsId = jsId.substring(11);
    }
    return jsId;
}

/**
 * returns the current context path, ex: http://localhost:8080/MyApp/Controller
 * returns /MyApp/ ex: http://localhost:8080/MyApp returns /MyApp/ ex:
 * https://www.example.co.za/ returns /
 */
function getContextPath() {
    var ctx = window.location.pathname, path = '/' !== ctx ? ctx.substring(0,
        ctx.indexOf('/', 1) + 1) : ctx;
    return path + (/\/$/.test(path) ? '' : '/');
}

/**
 * Native JS way to filter an array
 * @param array
 * @param fn
 * @returns {Array}
 *
 * Usage:
 * var list = [1,2,3,...,500];
 * var predicate = function(n){ ... };
 * var matching = filter(list, predicate);
 */
function filter(array, fn) {
    var results = [];
    var item;
    for (var i = 0, len = array.length; i < len; i++) {
        item = array[i];
        if (fn(item)) results.push(item);
    }
    return results;
}


/**
 * Copy a canvas to a new blank canvas
 * @param oldCanvas
 * @returns {Element}
 */
function cloneCanvas(oldCanvas) {

    //create a new canvas
    var newCanvas = document.createElement('canvas');
    var context = newCanvas.getContext('2d');

    //set dimensions
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;

    //apply the old canvas to the new one
    context.drawImage(oldCanvas, 0, 0);

    //return the new canvas
    return newCanvas;
}

function lineChartTooltipFormatter(params, ticket, callback) {
    // console.debug(params);
    try {
        if (params.componentType === 'markLine')
        {
            return 'Limit ' + params.seriesName + ' : ' + numeral(params.value).format('(0,0)');
        }

        var symbol_ = chartManager.getBaseCcy();
        var res = moment(params[0].value[0]).format('DD-MM-YYYY') + '<br/>';
        for (var i = 0, l = params.length; i < l; i++) {

            var colorEl = '<span style="display:inline-block;margin-right:5px;'
                + 'border-radius:10px;width:9px;height:9px;background-color:' + params[i].color + '"></span>';

            res += colorEl + ' '+ params[i].seriesName + ' : ' + symbol_ + ' ' + numeral(params[i].value[1]).format('(0,0)') + '<br/>';
        }
        return res;
    } catch (e){
        console.error(e);
    }
}

function donutChartTooltipFormatter(params, ticket, callback) {
    // console.debug(params);
    var symbol_ = chartManager.getBaseCcy();

    var res = '';
    var colorEl = '<span style="display:inline-block;margin-right:5px;'
        + 'border-radius:10px;width:9px;height:9px;background-color:' + params.color + '"></span>';

    res += colorEl + ' ' + params.name + ' : ' + symbol_ + ' ' + numeral(params.value).format('(0,0)') + ' : ' + params.percent + '%<br/>';
    return res;
}

function riskGuageTooltipFormatter(params, ticket, callback) {
    console.debug(params);
    var symbol_ = chartManager.getBaseCcy();

    var res = '';

    res += params.name + ' : ' + symbol_ + ' ' + numeral(params.value).format('(0,0)') + ' : ' + params.percent + '%<br/>';
    return res;
}

function riskGaugeLegendFormatter(params, ticket, callback){
    var res = '';
    if (params.value > 90)
        res += 'LIMIT BREACH ';
    res += numeral(params.value).format('(0.00)');
    res += '%';
    return res;
}


function barChartTooltipFormatter(params, ticket, callback) {
    // console.debug(params);
    var res = ''; //'Total : ' + tot_;
    var symbol_ = chartManager.getBaseCcy();

    for (var i = 0, l = params.length; i < l; i++) {

        var colorEl = '<span style="display:inline-block;margin-right:5px;'
            + 'border-radius:10px;width:9px;height:9px;background-color:' + params[i].color + '"></span>';

        res += colorEl + ' '+ params[i].name + ' : ' + symbol_ + ' ' + numeral(params[i].value).format('(0,0)') + '<br/>';
    }
    return res;
}

// window.onresize = function() {
//     $(".ga-charts").each(function(){
//         var id = $(this).attr('_echarts_instance_');
//         window.echarts.getInstanceById(id).resize();
//     });
// };
