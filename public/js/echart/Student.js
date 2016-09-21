/** @constructor */

var ChartBase = (function () {
    function ChartBase(options, parameters) {
        this.options = options;
        this.parameters = parameters;
    }
    ChartBase.prototype.getOptions = function(){
        return this.options;
    }
    ChartBase.prototype.setNewData = function (chartInstance_, data_) {
        // abstract method - override
        console.debug(chartInstance_, data_);
    };
    ChartBase.prototype.canDrillDown = function () {
        // abstract method - override
        return true;
        // if ((args.chartType == 'bargraph' || args.chartType == 'totalexposure') && args.level < 3) return true;
        // if (args.level <2) return true;
        // return false;
    };
    ChartBase.prototype.initChart = function (chartTagName_, options, data_) {
        // once data is resolved, render it
        Promise.resolve(data_).then(function (res) {
            // console.debug( chartTagName_, data_ );
            var theChart_ = echarts.init(document.getElementById(chartTagName_), theme);
            theChart_.setOption(options);
            theChart_.on('click', chartManager.drilldownChartClick);
            this.setNewData(theChart_, res);
        });
    };
        return ChartBase;
    })();

var BarChart = (function() {
    OO.inherits(BarChart, ChartBase);
    function BarChart(options, parameters) {
        this.paamters = parameters;
        args = Array.prototype.slice.call(arguments);
        BarChart.__super__.constructor.apply(this, args);
    }
    BarChart.prototype.getOptions = function(){
        return BarChart.__super__.getOptions.call(this);
    };
    BarChart.prototype.setNewData = function(chart_, data_) {
        this.constructor.__super__.setNewData.call(this);
        var localOptions_ = this.options;

        localOptions_.series = [{
            type: data_.seriesType,
            data: data_.yaxisValues,
            name: data_.seriesName
        }];
        localOptions_.title = [{text: data_.title, subtext: data_.subTitleText}];
        localOptions_.legend.data = data_.yaxisLabels;
        localOptions_.yAxis[0].data = data_.yaxisLabels;

        chart_.setOption(localOptions_, true);

    };
    BarChart.prototype.initialiseAllCharts = function(){
        // set the initial entry point to 'Total' level
        var args = {
            date: chartManager.getBusinessDate(),
            hierarchy: chartManager.getHierarchy(),
            item: 'Total',
            level: chartManager.getDrillDownLevel()[0].level
        };

        barGraphs.forEach(function(elem){
            var promise_ = chartManager.getGraphData(args, elem.metric,'bargraph');
            BarChart.__super__.initChart.call(this, elem.id, BarChart.prototype.getOptions(), promise_);

            promise_.then(function(res){
                // lookup the category in the chartCategories array
                var cat_ = filter(chartCategory, function(e){return e.metric == elem.metric;});
                document.getElementById(elem.id).parentNode.parentNode.getElementsByTagName('h2')[0].innerText = cat_[0].category;
            });

        });
    };

    return BarChart;
})();

var opts_ = {
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
