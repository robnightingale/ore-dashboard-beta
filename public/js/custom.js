/**
 * Created by robnightingale on 04/08/2016.
 */
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
/**
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
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
    console.info('got json data from server');
    return response.json();
}
var parseTextResponse = function (response) {
    console.info('got text data from server');
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
