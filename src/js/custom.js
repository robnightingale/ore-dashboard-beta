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
