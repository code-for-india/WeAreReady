(function ($) {
    var components = {};

    var apperyFunction = function () {
        var id;
        var context;
        var elem;
        var screenCtxt = $("#" + Apperyio.CurrentScreen);

        if (arguments.length == 1) {
            id = arguments[0];
            if (components[id]) {
                return components[id].__element;
            } else {
                elem = $('[dsid="' + id + '"]:eq(0)', screenCtxt);
                if (elem.length == 0 && screenCtxt.attr('dsid') == id)
                    elem = screenCtxt;
                return elem;
            }
        } else {
            for (var i = 0; i < arguments.length - 1; i++) {
                id ? id += "_" + arguments[i] : id = arguments[i];
            }

            if (typeof arguments[arguments.length - 1] == 'string') {
                id += "_" + arguments[arguments.length - 1];
                if (components[id]) {
                    return $(components[id].__element);
                } else {
                    elem = $('[dsid="' + id + '"]:eq(0)', screenCtxt);
                    if (elem.length == 0 && screenCtxt.attr('dsid') == id)
                        elem = screenCtxt;
                    return elem;
                }
            } else {
                var ctx = $(arguments[arguments.length - 1]);
                elem = ctx.closest('[apperytype="mobiletemplate"]');
                if (elem.length != 0) {
                    var ccname = elem.eq(0).attr('dsid') + "_" + arguments[0];
                    elem = $('[dsid="' + ccname + '"]:eq(0)', screenCtxt);
                    return elem;
                } else {
                    while (elem.size() == 0) {
                        ctx = ctx.parent().closest('[dsrefid]').eq(0);
                        if (ctx.size() == 0) return $();
                        elem = ctx.find('[dsid=' + id + ']').filter('[_tmpl!=true]').eq(0);
                    }
                    return elem.eq(0);
                }
            }
        }
    };

    apperyFunction.__registerComponent = function (id, component) {
        components[id] = component;
    };

    apperyFunction.__unregisterComponent = function (id) {
        delete components[id];
    };

    apperyFunction.__deleteAllComponents = function () {
        for (o in components) delete components[o];
    };

    // simulates behaviour of java.net.URLEncoder + escapes "*"
    apperyFunction.__URLEncodeSpecial = function (input) {
        if (typeof input == 'string') {
            return encodeURIComponent(input)
                .replace(/%20/g, "+")       // %20
                .replace(/\*/g, '%2A')     // *
                .replace(/~/g, '%7E')      // ~
                .replace(/!/g, '%21')      // !
                .replace(/\(/g, '%28')     // (
                .replace(/\)/g, '%29');    // )
        }
        return undefined;
    };

    var Apperyio;
    /**
     * Finds components on current screen.
     * @param {...string} names - stack of component name and parent custom components names.
     * As an example Apperyio("mobileimage1") will find image component on the screen,
     * when Apperyio("myComplexComp1", "mobileimage1") will find image component in myComplexComp1
     * custom component presented on the screen.
     * @class
     */
    Apperyio = window.Apperyio = window.$a = apperyFunction;

    // Backward compatibility
    window.$t = window.Appery = window.Tiggzi = window.Tiggr = apperyFunction;

    /**
     * @lends Apperyio.prototype
     * @private
     * Links prototypes
     */
    function linkPrototypes(parent, child) {
        var F = function () {
        };
        F.prototype = parent.prototype;
        child.prototype = new F();
        child.prototype.constructor = child;
        child.$super = parent.prototype;

        return child;
    };

    /**
     * Creates new class.
     * @param {Object} base - super class
     * @param {Object} methods - object containing methods extending the base class (with <i>jQuery.extend</i>). NOTE that if function "init" is presented in methods, it will be run automatically, when new object is created.
     * @param {Object} properties - object containing properties extending the base class (with <i>Object.defineProperties</i>).
     * @see <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperties">Object.defineProperties</a>
     * @see <a href="http://api.jquery.com/jQuery.extend/">jQuery.extend</a>
     * @example <b>Example of using Apperyio.createClass</b>
     * <code>
     * // Creating class A with one init method and one readonly property id
     * A = Apperyio.createClass(
     *     // base
     *     null, // base class will be set to Object by default
     *     // methods
     *     {
     *         init:function(options) {
     *             this.options = options;
     *         }
     *     },
     *     // properties
     *     {
     *         id: {value: 1, writable: false}
     *     }
     * );
     * a = new A("paramA"); // Method init is called implicitly
     * a.id                 // 1
     * a.options            // "paramA"
     *
     * // Creating class B with log_options method.
     * B = Apperyio.createClass(
     *     // base
     *     A,
     *     // methods
     *     {
     *         log_options:function() {
     *             if (this.options) console.log(this.options);
     *         }
     *     },
     *     // properties
     *     {}
     * );
     * b = new B("paramB"); // Method init, inherited from A is called implicitly
     * b.id                 // 1, inherited
     * b.options            // "paramB", options is set by init
     * b.log_options()      // "paramB", own method invocation
     * </code>
     */
    Apperyio.createClass = function (base, methods, properties) {
        base = base || Object;
        methods = methods || {};
        properties = properties || {};

        var derived = function () {
            if (this.init) {
                this.init.apply(this, $.makeArray(arguments));
            }
        };
        linkPrototypes(base, derived);
        $.extend(derived.prototype, methods);

        Object.defineProperties(derived.prototype, properties);

        return derived;
    };

    /**
     * @class
     */
    Apperyio.BaseComponent = $a.createClass(null, /** @lends Apperyio.BaseComponent.prototype */ {

        init: function (options) {
            this.options = options;
            this.__element = $('[dsid="' + options.id + '"]:eq(0)', options.context);

            this.attachToDOM();
        },

        __registerComponent: function () {
            this.__componentRegistered = true;
            $a.__registerComponent(this.id, this);
            return this;
        },

        destroy: function () {
            if (this.__componentRegistered) {
                $a.__unregisterComponent(this.id);
            }
            this.__element = $();
        },

        __getUnknownAttribute: function (name) {
            return this.element().attr(name);
        },

        __getAttribute: function (name) {
            if (this.hasOwnProperty(name)) {
                return this[name];
            } else {
                return this.__getUnknownAttribute(name);
            }
        },

        __setUnknownAttribute: function (name, value) {
            this.element().attr(name, value);
        },

        __setAttribute: function (name, value) {
            if (this.hasOwnProperty(name)) {
                this[name] = value;
            } else {
                this.__setUnknownAttribute(name, value);
            }
        },

        getId: function () {
            return this.id;
        },

        element: function () {
            return this.__element;
        },

        attachToDOM: function () {
            this.element().data('Apperyio.component', this);
        },

        attr: function () {
            if (arguments.length == 1) {
                return this.__getAttribute(arguments[0]);
            } else {
                this.__setAttribute(arguments[0], arguments[1]);
                return this;
            }
        }

    }, {
        id: {
            get: function () {
                return this.options.id;
            },
            configurable: false
        }
    });

    var eventHandlerDelegates = ['bind', 'unbind', 'one', 'live', 'die', 'trigger', 'on', 'off'];
    $.each(eventHandlerDelegates, function (idx, methodName) {
        $a.BaseComponent.prototype[methodName] = function () {
            var elts = this.element();
            return elts[methodName].apply(elts, $.makeArray(arguments));
        };
    });

    var commonEvents = ['mouseup', 'mousedown', 'mouseover', 'mouseout', 'mousemove', 'keypress', 'keyup', 'keydown', 'dblclick', 'click'];
    $.each(commonEvents, function (idx, type) {
        $a.BaseComponent.prototype[type] = function () {
            if (arguments.length == 0) {
                return this.trigger(type);
            } else {
                return this.bind.apply(this, $.makeArray(arguments));
            }
        };
    });

    /**
     * @class ConsoleLogger is an object that allows logging debug messages at various levels.
     */
    Apperyio.ConsoleLogger = $a.createClass(null, /** @lends Apperyio.ConsoleLogger.prototype */ {

        __formatMessage: function (message, params) {
            var params = $.makeArray(arguments);
            params.shift();

            return message.replace(/\{(\d+)\}/g, function (str, p1, offset, s) {
                var num = parseInt(p1, 10);
                return params[num - 1 /* one-based -> zero-based */];
            });
        },

        /**
         * Logs message with error level
         * @param {...Object} params - message formatting parameters
         */
        error: function (message, params) {
            if (this.isLevelEnabled($a.Logger.Levels.ERROR)) {
                console.error(this.__formatMessage(message, params));
            }
        },

        /**
         * Logs message with warning level
         * @param {...Object} params - message formatting parameters
         */
        warn: function (message, params) {
            if (this.isLevelEnabled($a.Logger.Levels.WARN)) {
                console.warn(this.__formatMessage(message, params));
            }
        },

        /**
         * Logs message with info level
         * @param {...Object} params - message formatting parameters
         */
        info: function (message, params) {
            if (this.isLevelEnabled($a.Logger.Levels.INFO)) {
                console.info(this.__formatMessage(message, params));
            }
        },

        /**
         * Logs message with debug level
         * @param {...Object} params - message formatting parameters
         */
        debug: function (message, params) {
            if (this.isLevelEnabled($a.Logger.Levels.DEBUG)) {
                console.log(this.__formatMessage(message, params));
            }
        },

        /**
         * Clears logged messages
         */
        clear: function () {
            console.clear();
        },

        /**
         * Logs properties of object passed as argument
         * @param {Object} o - object which properties should be printed
         */
        dir: function (o) {
            console.dir(o);
        },

        /**
         * Sets current logging level. Messages with level smaller than the ConsoleLogger level won't be logged.
         * @param level - new logging level to set
         */
        setLevel: function (level) {
            this.level = level;
        },

        /**
         * Returns current logging level
         * @return level currently being used
         */
        getLevel: function () {
            return this.level || $a.Logger.Levels.DEBUG;
        },

        /**
         * Checks whether logging is enabled for the passed in level.
         * @param level - level value to check for
         * @return <code>true</code> if logging for this level is enabled, <code>false</code> otherwise
         */
        isLevelEnabled: function (level) {
            return this.getLevel() <= level;
        }
    });

    var booleanAttributes = {
        'checked': true, 'compact': true, 'declare': true, 'defer': true, 'disabled': true, 'ismap': true,
        'multiple': true, 'nohref': true, 'noresize': true, 'noshade': true, 'nowrap': true, 'readonly': true,
        'selected': true
    };

    /**
     * @class
     */
    Apperyio.MappingVisitor = $a.createClass(null, /** @lends Apperyio.MappingVisitor.prototype */{

        init: function () {
            this.__contexts = new Array();
            this.__mappings = new Array();
            this.__visitArrayElement$Proxied = $.proxy(this.__visitArrayElement, this);
        },

        /* TODO
         * Finds components considering current context and mapping and filter it with jQuery.filter
         * @param {string} name of an Apperyio component
         * @param {(string|function(number):boolean|jQueryObject|Element)} filter argument to pass to jQuery.filter
         *        @see The <a href="http://api.jquery.com/filter/">jQuery.filter</a>
         * @param {string} subselector (optional) used to find HTML node in complex jQuery mobile component
         */
        findComponent: function (name, filter, subselector) {
            var context = this.getContext();
            var result;

            if (name) {
                elem = context.find("[dsid='" + name + "'], " +
                    "[dsrefid='" + name + "']");
                type = elem.attr("apperytype");
                if (type && type == "object") {
                    if (elem.attr("_idx") == undefined) {
                        return Apperyio(name);
                    } else {
                        // clone appery JS object
                        if (Apperyio(name) != undefined && Apperyio(name).getOptions != undefined) {
                            if (elem.attr("apperyclass") != undefined) {
                                if (elem.attr("apperyclass") == "datepicker") {
                                    options = Apperyio(name).getOptions();
                                    result = new Apperyio.ApperyMobileDatePickerComponent(elem.attr("id"), options);
                                } else if (elem.attr("apperyclass") == "carousel") {
                                    options = Apperyio(name).getOptions();
                                    result = new Apperyio.ApperyMobileCarouselComponent(elem.attr("id"), options);
                                } else {
                                    result = elem.length ? elem : context;
                                }
                            } else {
                                result = elem.length ? elem : context;
                            }
                        } else {
                            result = elem.length ? elem : context;
                        }
                    }
                } else {
                    result = elem.length ? elem : context;
                }
            } else {
                result = context;
            }

            if (result != context) {
                // Filtering by filter argument
                if (result.filter && filter) {
                    result = result.filter(filter);
                }
            }

            // Filtering by "subselector"
            if (subselector) {
                result = result.find(subselector);
            }

            return result;
        },

        /* TODO
         * returns current context
         * @return {jQueryObject} current context
         */
        getContext: function () {
            return this.__contexts[this.__contexts.length - 1];
        },

        /* TODO
         * returns current mapping
         * @return {Object} current context
         */
        getMapping: function () {
            return this.__mappings[this.__mappings.length - 1];
        },

        __validateRequiredMappingAttributes: function (entry) {
            //if (!entry.PATH) {
            //	$a.log.error("Error processing entry {0} - no PATH specified", JSON.stringify(entry));
            //	return false;
            //}

            return true;
        },

        beforeArrayElementVisit: function (elt, idx) {
        },

        afterArrayElementVisit: function (elt, idx) {
        },

        beforeArrayVisit: function () {
        },

        afterArrayVisit: function () {
        },

        visitEntry: function () {
        },

        getArrayElements: function () {
            return [];
        },

        /* TODO
         * @protected
         * Visits element of mapped array
         * @param {number} idx array element index
         * @param {Element}
         */
        __visitArrayElement: function (idx, elt) {
            this.pushPath(idx);

            this.beforeArrayElementVisit(elt, idx);

            this.__visitMappingsArray(this.getMapping().SET);

            this.afterArrayElementVisit(elt, idx, this.getMapping());

            this.popPath();
        },

        __visitMapping: function (mapping) {
            if (!this.__validateRequiredMappingAttributes(mapping)) {
                return;
            }

            if (mapping.PATH) {
                for (var i = 0; i < mapping.PATH.length; i++) {
                    this.pushPath(mapping.PATH[i]);
                }
            }

            this.__mappings.push(mapping);

            if (!mapping.SET) {
                this.visitEntry();
            } else {
                this.beforeArrayVisit();

                if (arrayElementsBuf = this.getArrayElements()) {
                    if (Object.prototype.toString.call(arrayElementsBuf) === '[object Array]') {
                        $.each(arrayElementsBuf, this.__visitArrayElement$Proxied);
                    } else {
                        this.__visitArrayElement$Proxied();
                    }
                }

                this.afterArrayVisit();
            }

            this.__mappings.pop();

            if (mapping.PATH) {
                for (var i = 0; i < mapping.PATH.length; i++) {
                    this.popPath();
                }
            }
        },

        __visitMappingsArray: function (mappings) {
            for (var i = 0; i < mappings.length; i++) {
                this.__visitMapping(mappings[i]);
            }
        },

        visit: function (mappings) {
            var ctxt;
            if (mappings.SCREEN) {
                ctxt = $("#" + mappings.SCREEN);
            } else {
                ctxt = $("#" + $a.CurrentScreen);
            }

            if (ctxt.length) {
                this.__contexts.push(ctxt);
            } else {
                this.__contexts.push($(document));
            }

            this.__visitMappingsArray(mappings);

            this.__contexts.pop();
        }
    });


    var MAPPING_TIMEOUT = 2500; //If mapping last more that 2.5s make it async.
    var MAPPING_PAUSE = 150; //Pause between mapping procedures.
    /**
     * @class
     * @extends Apperyio.MappingVisitor
     */
    Apperyio.RenderVisitor = $a.createClass($a.MappingVisitor, /** @lends Apperyio.RenderVisitor.prototype */ {
        init: function (data) {
            $a.RenderVisitor.$super.init.apply(this);
            this.data = data;
            this.__components = new Array();
        },

        __setupDisplay: function (cs) {
            if (cs.length == 0) {
                return;
            }
            cs.each(function (i) {
                var c = cs.eq(i);

                // Special case with interactive mobilelistitem as a container
                if (c[0].tagName == "A" && c.parents().eq(1).is("[data-role='listview']")) {
                    c = c.parents().eq(0);
                }

                if (c[0].tagName) {
                    var display = c.attr('__tiggrDisplay');
                    if (typeof display == 'undefined') {
                        //first time call - backup 'display' settings
                        c.attr('__tiggrDisplay', c.css('display'));
                    } else {
                        c.css('display', display);
                    }
                }
            });
        },

        __getComponents: function () {
            return this.__components[this.__components.length - 1];
        },

        beforeArrayElementVisit: function (arrayIndex) {
            var that = this;
            var clonedElements = new Array();

            var tmplComponents = this.__getComponents();

            if (tmplComponents.length == 0) {
                return;
            }
            tmplComponents.each(function (componentIdx, component) {
                component = $(component);

                var dsid = component.attr('dsid');

                if (dsid != undefined) {
                    // Special case with interactive mobilelistitem as a container
                    var imli_cloning = component[0].tagName == "A" && component.parents().eq(1).is("[data-role='listview']");

                    if (imli_cloning) {
                        component = component.parents().eq(0);
                    }
                    var clonedComponent = that.__specialClone(component);
                    component.before(clonedComponent);
                    clonedComponent.show();

                    if (imli_cloning) {
                        clonedComponent = clonedComponent.find("> a[dsid]");
                    }

                    that.changeIds(clonedComponent, dsid, arrayIndex);

                    if (component.parent().parent().attr('data-role') === 'controlgroup') {
                        clonedComponent.enhanceWithin();
                        // Fixing round borders for checkbox/radio
                        if (arrayIndex > 0) {
                            clonedComponent.find("label").removeClass("ui-first-child");
                            clonedComponent.parent().find("input[_idx='_" + (arrayIndex - 1) + "']").siblings("label").removeClass("ui-last-child");
                        }
                    }

                    if (component.find($.mobile.selectmenu.prototype.initSelector).length) {
                        clonedComponent.find($.mobile.selectmenu.prototype.initSelector).selectmenu();
                    }

                    $.merge(clonedElements, clonedComponent);
                }
            });

            this.__contexts.push($(clonedElements));
        },

        __specialClone: function (originalComponent) {
            var that = this;
            var clonedComponent;

            originalComponent = originalComponent.jquery ? originalComponent : jQuery(originalComponent);

            if (originalComponent.jquery && originalComponent.attr('data-role') === 'collapsible') {
                clonedComponent = $('<div data-role="collapsible"><h3></h3><div></div></div>');
                clonedComponent.collapsible();

                this.__specialAtributesCopy(originalComponent, clonedComponent);

                clonedComponent.children('h3').children().remove();
                this.__specialChildrenCopy(originalComponent.children('h3'), clonedComponent.children('h3'));
                this.__specialAtributesCopy(originalComponent.children('h3'), clonedComponent.children('h3'));
                clonedComponent.children('div').children().remove();
                this.__specialChildrenCopy(originalComponent.children('div'), clonedComponent.children('div'));
                this.__specialAtributesCopy(originalComponent.children('div'), clonedComponent.children('div'));
            } else if (originalComponent.parent().parent().attr('data-role') === 'controlgroup' && originalComponent.attr('data-role') != 'button') {
                var typeGroup = originalComponent.children('div').children('input').attr('type');
                var nameGroup = originalComponent.children('div').children('input').attr('name');
                clonedComponent = $('<span><input></input><label></label></span>');
                this.__specialAtributesCopy(originalComponent, clonedComponent);
                this.__specialAtributesCopy(originalComponent.children('div').children('label'), clonedComponent.children('label'));
                this.__specialAtributesCopy(originalComponent.children('div').children('input'), clonedComponent.children('input'));
                this.__specialChildrenCopy(originalComponent.children('div').children('label'), clonedComponent.children('label'));
            } else if (originalComponent.children('select').attr('data-role') === 'flipswitch') {
                clonedComponent = $('<div><select/></div>');
                this.__specialAtributesCopy(originalComponent, clonedComponent);
                this.__specialAtributesCopy(originalComponent.children('select'), clonedComponent.children('select'));
                this.__specialChildrenCopy(originalComponent.children('select'), clonedComponent.children('select'));
            } else if (originalComponent.attr('data-role') === 'fieldcontain' && originalComponent.children('div').hasClass('ui-select')) {
                clonedComponent = $('<div><select></select></div>');
                clonedComponent.children('select').html(originalComponent.find($.mobile.selectmenu.prototype.initSelector).html());
                this.__specialAtributesCopy(originalComponent, clonedComponent);
                this.__specialAtributesCopy(originalComponent.find($.mobile.selectmenu.prototype.initSelector), clonedComponent.children('select'));
            } else if (originalComponent.attr('data-role') === 'fieldcontain' && originalComponent.find('input').hasClass('ui-slider-input')) {
                // slider
                clonedComponent = $('<div><div><input/></div></div>');
                this.__specialAtributesCopy(originalComponent, clonedComponent);
                var originalInternalDiv = originalComponent.children("div");
                var clonedInternalDiv = clonedComponent.children("div");
                this.__specialAtributesCopy(originalInternalDiv, clonedInternalDiv);
                this.__specialAtributesCopy(originalInternalDiv.children('input'), clonedInternalDiv.children('input'));
            } else if (originalComponent[0].nodeName == 'OPTION') {
                //Case of cloning option in mobile select menu
                clonedComponent = $('<' + originalComponent[0].nodeName + '/>');
                this.__specialAtributesCopy(originalComponent, clonedComponent);
                this.__specialChildrenCopy(originalComponent, clonedComponent);

                //After cloning option 'placeholder' flag must be reseted, to make select menu component work.
                clonedComponent.data('placeholder', false);
                clonedComponent.attr('data-placeholder', "false");
            } else if (originalComponent.attr("apperyclass") == "carousel") {
                var self = this;
                clonedComponent = $('<' + originalComponent[0].nodeName + '/>');
                this.__specialAtributesCopy(originalComponent, clonedComponent);
                originalComponent.children(".ui-carousel-items").each(function (i, element) {
                    clonedComponent.append(self.__specialClone(element));
                });
            } else {
                clonedComponent = $('<' + originalComponent[0].nodeName + '/>');
                this.__specialAtributesCopy(originalComponent, clonedComponent);
                this.__specialChildrenCopy(originalComponent, clonedComponent);

            }
            return clonedComponent;
        },

        __specialChildrenCopy: function (originalComponent, clonedComponent) {
            var that = this;
            originalComponent.contents().each(function () {
                if (this.nodeType == Node.TEXT_NODE) {
                    clonedComponent.append(this.cloneNode(false));
                }
                else if (this.nodeType == Node.ELEMENT_NODE) {
                    var child = that.__specialClone(this);
                    clonedComponent.append(child);

                    if (child.children('select').attr('data-role') === 'flipswitch')
                        $.mobile.slider.prototype.enhanceWithin(child);
                }
            });
        },

        __specialAtributesCopy: function (originalComponent, clonedComponent) {
            for (var i = 0; i < originalComponent[0].attributes.length; i++) {
                clonedComponent[0].attributes.setNamedItem(originalComponent[0].attributes.item(i).cloneNode(true));
            }
        },

        changeIds: function (c, dsid, idx) {
			c.attr('dsrefid', dsid);
            var children = [];
			if (c.attr('id')) {
                children.push(c);
            } else {
                children = c.children();
            }
            for (var i = 0; i < children.length; i++) {
				var $el = $(children[i]);
				if ($el.attr('id')) {
					$el.attr('id', $el.attr('id') + '_' + idx);
					$el.attr('_idx', '_' + idx);
					$el.attr('dsid', $el.attr('dsid') + '_' + idx);
				}
			}
            c.find('[for]').each(function (i, elt) {
				var $elt = $(elt);
                $elt.attr('for', $elt.attr('for') + '_' + idx);
            });
            c.find('input[type="checkbox"], fieldset input[type="radio"]').each(function (i, elt) {
				var $elt = $(elt);
                $elt.attr('name', $elt.attr('name') + '_' + idx);
            });
            c.find('[_tmpl]').addBack().removeAttr('_tmpl');
        },

        beforeArrayVisit: function (data, elementId) {
            var components = this.findComponent(elementId, '[dsrefid]');
            if (components === this.getContext()) {
                components = [];
            }

            // Special case with interactive mobilelistitem as a container
            if (components.length > 0 && components[0].tagName == "A" && components.eq(0).parents().eq(1).is("[data-role='listview']")) {
                components = components.map(function (ind, elt) {
                    return $(elt).parents()[0];
                });
            }
            if (components.length > 0) {
                components.remove();
            }

            components = this.findComponent(elementId);
            if (components === this.getContext()) {
                components = [];
            } else {
                this.__setupDisplay(components);
            }
            this.__components.push(components);
        },

        afterArrayVisit: function (data, elementId) {
            var components = this.__components.pop();
            if (components === this.getContext()) {
                components = [];
            }

            // Special case with interactive mobilelistitem as a container
            if (components.length > 0 && components[0].tagName == "A" && components.eq(0).parents().eq(1).is("[data-role='listview']")) {
                components = components.map(function (idx, elt) {
                    return $(elt).parents()[0];
                });
            }

            if (components.length > 0) {
                components.hide();
                components.each(function (idx) {
                    if (this.tagName == 'OPTION') {
                        $(this).text('');
                    }

                });
                components.attr('_tmpl', 'true');
                components.removeAttr('selected');
                var templates = components.find('[id]');
                templates.each(function (idx) {
                    var tmplEl = templates.eq(idx);
                    tmplEl.attr('_tmpl', 'true');
                });
            }
        },

        afterArrayElementVisit: function (idx, data, jsTransformation) {
            var elt = this.__contexts.pop();
            if (jsTransformation !== undefined) {
                jsTransformation(data, elt);
            }
        },

        __updateComponent: function (elt, attr, value) {
            //TODO remove this legacy case (attrib!='@')
            if (attr && attr != '@') {
                //attribute can have boolean type so we need string conversion
                if (booleanAttributes[attr] && typeof value != 'boolean') {
                    value = /^\s*true\s*$/i.test(String(value));
                }
                if (elt.hasOwnProperty("__setAttribute")) {
                    elt.__setAttribute(attr, value);
                } else {
                    if (value instanceof Object) {
                        try {
                            value = JSON.stringify(value);
                        } catch (ex) {
                            console.error(ex.name + '  ' + ex.message);
                        }
                    }
                    elt.setAttr(attr, value);
                }
            } else {
                //TODO - do we need explicit string constructor call here?
                elt.setText(String(value));
            }

            if (elt.parents != undefined) {
                if (elt.attr("reRender") != undefined || elt.parents("[reRender]").size() > 0) {
                    if (this.componentsForRefresh == undefined && this.clonedComponentsForRefresh == undefined) {
                        this.componentsForRefresh = [];
                    }
                }
                if (elt.attr("reRender") != undefined) {
                    if (this.componentsForRefresh.indexOf(elt.attr("reRender")) == -1) {
                        this.componentsForRefresh.push(elt.attr("reRender"));
                    }
                }
                var eltParents = elt.parents("[reRender]");
                for (var i = 0; i < eltParents.length; i++) {
                    if (this.componentsForRefresh.indexOf($(eltParents[i]).attr("reRender")) == -1) {
                        this.componentsForRefresh.push($(eltParents[i]).attr("reRender"));
                    }
                }
            }
        },

        __refreshComponent: function () {
            if (this.componentsForRefresh != undefined) {
                $.each(this.componentsForRefresh, function (i, val) {
                    var elem = Apperyio(val);
                    if (elem != undefined && elem.refresh != undefined) {
                        if (elem.length > 0 && elem[0].tagName == "SELECT") {
                            elem.children(':not([_tmpl])').removeAttr('selected');
                            elem.children(':not([_tmpl])').eq(0).attr('selected', 'selected');
                        }
                        if (elem.attr && elem.attr('data-role') == "controlgroup")
                            elem.controlgroup();
                        else
                            elem.refresh();
                    }
                    clonedElementsSelector = "[name='" + val + "'][_idx]";

                    $.each($(clonedElementsSelector), function () {
                        if (this.tagName == "SELECT") {
                            $(this).children(':not([_tmpl])').removeAttr('selected');
                            $(this).children(':not([_tmpl])').eq(0).attr('selected', 'selected');
                        }

                        if ($(this).refresh != undefined)
                            $(this).refresh();
                        if ($(this).attr("apperyclass") != undefined) {
                            if ($(this).attr("apperyclass") == "carousel") {
                                var options = Apperyio($(this).attr("name"));
                                new Apperyio.ApperyMobileCarouselComponent($(this).attr("id"), options);
                            }
                        }
                    });

                });

            }
        },

        visitEntry: function (value, elementId, attr, transformation, subselector) {
            if (elementId == '___local_storage___') {
                var valueType = typeof value;

                if (transformation) {
                    var result = transformation(value, undefined);
                    if (result != undefined) value = result;
                }

                if (valueType == 'object' || valueType == 'array') {
                    value = JSON.stringify(value);
                }

                if (valueType != 'undefined') {
                    $a.persistentStorage.setItem(attr, value);
                } else {
                    $a.persistentStorage.removeItem(attr);
                }
            } else if (elementId == '___js___') {
                if (transformation) {
                    var result = transformation(value, undefined);
                    if (result != undefined) value = result;
                }
            } else if (elementId == undefined && transformation) {
                var element = this.findComponent(subselector);
                transformation(value, element);
            } else {
                var element = this.findComponent(elementId, undefined, subselector);
                if (transformation) {
                    var result = transformation(value, element);
                    if (result !== undefined) value = result;
                }

                this.__updateComponent(element, attr, value);
            }
        },

        visit: function (mapping) {
            var ctxt;
            if (mapping.SCREEN) {
                ctxt = $("#" + mapping.SCREEN);
            } else {
                ctxt = $("#" + $a.CurrentScreen);
            }

            if (ctxt.length) {
                this.__contexts.push(ctxt);
            } else {
                this.__contexts.push($(document));
            }


            this.__mappingPlan = this.buildMappingPlan(mapping, this.data);
            this.mappingPlanIndex = 0;
            this.isMappingSynchronous = true; //By default mapping is done synchronously.
            //Only if mapping lasts more than "MAPPING_TIMEOUT" it becomes async.
            var visitor = this;

            function executeMappingPlan() {
                var mappingStart = new Date();
                while (!visitor.isMappingFinished()) {
                    visitor.execNextPlanEntry();
                    //Check timeout
                    if (new Date() - mappingStart > MAPPING_TIMEOUT) {
                        setTimeout(executeMappingPlan, MAPPING_PAUSE);
                        visitor.isMappingSynchronous = false;
                        return false;
                    }
                }

                if (visitor.successHandler) {
                    //Invoke success event handler of a datasource;
                    visitor.successHandler(visitor.data);
                }

                if (visitor.completeHandler) {
                    //Invoke complete event handler of a datasource;
                    visitor.completeHandler();
                }
                return true;
            };
            return executeMappingPlan();
        },

        isMappingFinished: function () {
            if (this.__mappingPlan === undefined) {
                return true;
            }
            if (this.mappingPlanIndex === undefined) {
                return true;
            }
            return this.mappingPlanIndex >= this.__mappingPlan.length;
        },

        buildMappingPlan: function (mappingStructure, mappingData, currentPath) {
            var mappingPlan = [];
            if (currentPath === undefined) {
                currentPath = [];
            }
            var i, count = mappingStructure.length;
            for (i = 0; i < count; i++) {
                var mappingEntry = mappingStructure[i];
                if ('SET' in mappingEntry) {
                    var arrayPath = currentPath.concat(mappingEntry.PATH);
                    var arrayData = jsonPath(mappingData, arrayPath.join("."))[0] || [];

                    /* Handling case when xml array with just one element was
                     misconverted to json attribute (not a json array) */
                    var misconvertedXMLArray = false;
                    if (!(arrayData instanceof Array)) {
                        misconvertedXMLArray = true;
                        arrayData = [arrayData];
                    }

                    var arrayLength = arrayData.length;

                    mappingPlan.push({
                        'fullPath': arrayPath,
                        'type': 'MAPPING_ARRAY_BEFORE',
                        'id': mappingEntry.ID,
                        'jsTransformation': mappingEntry.TRANSFORMATION
                    });

                    //Iterate through array data
                    for (var j = 0; j < arrayLength; j++) {
                        var arrayElementPath = misconvertedXMLArray ? arrayPath : arrayPath.concat(j);

                        mappingPlan.push({
                            'fullPath': arrayElementPath,
                            'type': 'MAPPING_ARRAY_ITEM_BEFORE'
                        });

                        var recursivePlan = this.buildMappingPlan(mappingEntry.SET, mappingData, arrayElementPath);
                        mappingPlan = mappingPlan.concat(recursivePlan);

                        mappingPlan.push({
                            'fullPath': arrayElementPath,
                            'type': 'MAPPING_ARRAY_ITEM_AFTER',
                            'jsTransformation': mappingEntry.TRANSFORMATION
                        });
                    }

                    mappingPlan.push({
                        'fullPath': arrayPath,
                        'type': 'MAPPING_ARRAY_AFTER',
                        'id': mappingEntry.ID
                    });
                }
                else {
                    mappingPlan.push({
                        'fullPath': currentPath.concat(mappingEntry.PATH),
                        'type': 'MAPPING_SIMPLE_ENTRY',
                        'id': mappingEntry.ID,
                        'attr': mappingEntry.ATTR,
                        'jsTransformation': mappingEntry.TRANSFORMATION,
                        'subselector': mappingEntry.SUBSELECTOR
                    });
                }
            }

            return mappingPlan;
        },

        execNextPlanEntry: function () {
            var idx = this.mappingPlanIndex;
            var mappingPlanEntity = this.__mappingPlan[idx];
            var mappingType = mappingPlanEntity.type;
            var data = jsonPath(this.data, mappingPlanEntity.fullPath.join('.'))[0];
            var elementId = mappingPlanEntity.id;
            var jsTransformation = mappingPlanEntity.jsTransformation;
            mappingPlanEntity.actualData = String(data);

            if (mappingType == 'MAPPING_SIMPLE_ENTRY') {
                var subselector = mappingPlanEntity.subselector;
                this.visitEntry(data, elementId, mappingPlanEntity.attr, jsTransformation, subselector);
            }
            else if (mappingType == 'MAPPING_ARRAY_BEFORE') {
                this.beforeArrayVisit(data, elementId);
            }
            else if (mappingType == 'MAPPING_ARRAY_AFTER') {
                this.afterArrayVisit(data, elementId);
            }
            else if (mappingType == 'MAPPING_ARRAY_ITEM_BEFORE') {
                var arrayElementIndex = mappingPlanEntity.fullPath[mappingPlanEntity.fullPath.length - 1];
                this.beforeArrayElementVisit(arrayElementIndex);
            }
            else if (mappingType == 'MAPPING_ARRAY_ITEM_AFTER') {
                var arrayElementIndex = mappingPlanEntity.fullPath[mappingPlanEntity.fullPath.length - 1];
                this.afterArrayElementVisit(arrayElementIndex, data, jsTransformation);
            }

            this.mappingPlanIndex++;
        }
    });

    /**
     * @class
     * @extends Apperyio.MappingVisitor
     */
    Apperyio.RequestDataBuilderVisitor = $a.createClass($a.MappingVisitor, /** @lends Apperyio.RequestDataBuilderVisitor.prototype */ {
        init: function (isJsonp) {
            $a.RequestDataBuilderVisitor.$super.init.apply(this);
            this.__params = {};
            this.__headers = {};

            this.__paramStack = new Array();
            this.__paramStack.push(this.__params);

            this.__headerStack = new Array();
            this.__headerStack.push(this.__headers);

            this.__paths = new Array();

            this.__currentPath = new Array();

            this.__isJsonp = isJsonp;
        },


        __getParam: function () {
            return this.__paramStack[this.__paramStack.length - 1];
        },


        __getHeader: function () {
            return this.__headerStack[this.__headerStack.length - 1];
        },


        __clearPath: function () {
            this.__currentPath = new Array();
        },


        pushPath: function (p) {
            this.__currentPath.push(p);
        },


        popPath: function () {
            if (this.__currentPath.length != 0) {
                this.__currentPath.pop();
            }
        },


        __setValue: function (data, value) {
            for (var i = 0; i < this.__currentPath.length - 1; i++) {
                var p = this.__currentPath[i];
                if (!data[p]) {
                    data = data[p] = {};
                } else {
                    data = data[p];
                }
            }

            var pathSegment = this.__currentPath[this.__currentPath.length - 1];

            var prevValue = data[pathSegment];
            if (typeof prevValue != 'undefined') {
                if ($.isArray(prevValue)) {
                    prevValue.push(value);
                } else {
                    data[pathSegment] = [data[pathSegment], value];
                }
            } else {
                data[pathSegment] = value;
            }
        },


        __isHeader: function () {
            var l = this.__mappings.length - 1;
            for (var i = l; 0 <= i && l - 2 < i; i--) {
                var mapping = this.__mappings[i];
                if (mapping.HEADER) {
                    return true;
                }
            }

            return false;
        },


        findComponent: function () {
            var mapping = this.getMapping();
            var compId = mapping.ID;
            var subselector = mapping.SUBSELECTOR;

            var elts = $a.RequestDataBuilderVisitor.$super.findComponent.call(this, compId, '[dsrefid]', subselector);
            elts = elts.length ? elts : $a.RequestDataBuilderVisitor.$super.findComponent.call(this, compId, null, subselector);
            return elts;
        },


        getArrayElements: function () {
            return this.findComponent();
        },


        beforeArrayElementVisit: function (elt, idx) {
            this.__contexts.push($(elt));
        },


        afterArrayElementVisit: function (elt, idx) {
            this.__contexts.pop();
        },


        beforeArrayVisit: function () {
            this.__paths.push($.merge([], this.__currentPath));
            this.__clearPath();

            this.__paramStack.push([]);
            this.__headerStack.push([]);
        },


        afterArrayVisit: function () {
            this.__currentPath = this.__paths.pop();

            var paramArray = this.__paramStack.pop();
            if (paramArray.length != 0) {
                this.__setValue(this.__getParam(), paramArray);
            }

            var headerArray = this.__headerStack.pop();
            if (headerArray.length != 0) {
                this.__setValue(this.__getHeader(), headerArray);
            }

            this.__clearPath();
        },


        __setHeaderOrValue: function (value) {
            this.__setValue(this.__isHeader() ? this.__getHeader() : this.__getParam(), value);
        },


        visitEntry: function () {
            var entry = this.getMapping();
            var result;

            if (entry.ATTR) {
                var value;
                if (entry.ID) {
                    if (entry.ID == '___local_storage___') {

                        value = $a.persistentStorage.getItem(entry.ATTR) || '';
                        if (entry.TRANSFORMATION) {
                            result = entry.TRANSFORMATION(value);
                            if (result != undefined) value = result;
                        }
                        this.__setHeaderOrValue(value);
                    }
                    else {
                        var requestData = entry.ATTR == '@' ? this.findComponent().text().trim() : this.findComponent().getAttr(entry.ATTR);
                        if (entry.TYPE == "OBJECT") {
                            try {
                                requestData = JSON.parse(requestData);
                            } catch (ex) {
                                console.error(ex.name + '  ' + ex.message);
                            }
                        }
                        if (entry.TRANSFORMATION) {
                            result = entry.TRANSFORMATION(requestData);
                            if (result != undefined) requestData = result;
                        }

                        this.__setHeaderOrValue(requestData);
                    }
                } else if (this.__isJsonp && entry.ATTR == '?') {
                    this.jsonp = this.__currentPath.join('.');
                } else {
                    value = entry.ATTR;
                    if (entry.TRANSFORMATION) {
                        result = entry.TRANSFORMATION(value);
                        if (result != undefined) value = result;
                    }
                    this.__setHeaderOrValue(value);
                }
            } else if (entry.ID) {
                var requestData = this.findComponent().serializeArray();
                if (entry.TRANSFORMATION) {
                    result = entry.TRANSFORMATION(requestData[0].value);
                    if (result != undefined) requestData[0].value = result;
                }
                for (var i = 0; i < requestData.length; i++) {
                    this.__setHeaderOrValue(requestData[i].value);
                }
            } else if (entry.TRANSFORMATION) {
                result = entry.TRANSFORMATION(undefined);
                if (result != undefined) this.__setHeaderOrValue(result);
            }
        },

        getHeaders: function () {
            return this.__headers;
        },
        getParams: function () {
            return this.__params;
        },

        getJsonp: function () {
            return this.jsonp;
        }
    });

    /**
     * Creates new data source
     * @class
     */
    Apperyio.DataSource = $a.createClass(null, /** @lends Apperyio.DataSource.prototype */{
            /**
             * Called implicitly when object is created
             * @param {Object} service - service providing data
             * @param {Object} options - response/request mappings structures and complete/success/error handlers passed here
             * @link Apperyio.createClass
             */
            init: function (service, options) {
                this.service = service;
                this.options = options;
                this.__responseMapping = options.responseMapping || [];
                this.__responseMapping.SCREEN = Apperyio.CurrentScreen;
                this.__requestMapping = options.requestMapping || [];
                this.service.serviceLoaderOptions = options.serviceLoaderOptions;
                this.__requestOptions = $.extend({}, this.requestDefaults, options);
            },

            __setupDisplay: function (cs) {
                for (var i = 0; i < this.__responseMapping.length; i++) {
                    if (this.__responseMapping[i].SET) {
                        var c = $("#" + Apperyio.CurrentScreen + " [dsid=" + this.__responseMapping[i].ID + "]");

                        // Special case with interactive mobilelistitem as a container
                        if (c.length > 0 && c[0].tagName == "A" && c.parents().eq(1).is("[data-role='listview']")) {
                            c = c.parents().eq(0);
                        }

                        if (c.length > 0) {
                            var display = c.attr('__tiggrDisplay');
                            if (typeof display == 'undefined') {
                                //first time call - backup 'display' settings
                                var oldDisplay = c.css('display');
                                if (oldDisplay && oldDisplay != 'none') {
                                    c.attr('__tiggrDisplay', c.css('display'));
                                } else if (c[0].tagName == 'TABLE') {
                                    c.attr('__tiggrDisplay', 'table');
                                }
                                else {
                                    c.attr('__tiggrDisplay', 'block');
                                }
                            } else {
                                c.css('display', display);
                            }
                            if (c[0].tagName == "OPTION" && c.val() != "") {

                                // Array is mapped to existing select menu option
                                var selectElement = c.parent();
                                c.removeAttr("selected");

                                // Change element DSID attribute to avoid cloning
                                c.attr("dsid", this.__responseMapping[i].ID + "_orig");
                                var reRenderer = c.attr("rerender");

                                // Create new element to be cloned on mapping
                                c = $('<option dsid="' + this.__responseMapping[i].ID
                                    + '" style="display: none;" selected="selected" rerender="' + reRenderer + '"/>');
                                selectElement.prepend(c).refresh();
                            }
                            if (c.attr('data-role') == "collapsible" && !c.hasClass('ui-collapsible-collapsed')) {
                                c.attr("data-collapsed", "true");
                                c.collapsible("collapse");
                            }
                            c.hide();
                        }
                    }
                }
            },

            /* TODO jsDocs
             * Method to update components according to the predefined mapping rules using given data
             * @param {Object<String, Object>} data - data object to use for component updates
             */
            updateComponents: function (data) {
                this.data = data;
                var visitor = new $a.RenderVisitor(data);
                visitor.visit(this.__responseMapping);
                visitor.__refreshComponent();
                this.visitor = visitor;
            },

            __successHandler: function (data) {
                this.updateComponents(data);

                if (this.options.onSuccess) {
                    this.options.onSuccess.apply(this, $.merge([], arguments));
                }
            },

            __responseDataHandler: function () {
                var args = $.merge([], arguments);
                var data = args[0];

                if (this.service.__requestOptions.dataType === "xml") {
                    data = $.xml2json(data);
                }

                if ($.type(data) == 'string') {
                    data = $.parseJSON(data);
                } else if ($.type(data) == 'null') {
                    data = {};
                }

                args[0] = data;

                var transformer = this.getTransformer();
                if (transformer) {
                    args[0] = transformer.transform(args[0]);
                }

                this.__successHandler.apply(this, args);
            },


            __errorHandler: function () {
                //we are not resetting this.data here - that's done intentionally

                //TODO store error data
                if (this.options.onError) {
                    this.options.onError.apply(this, $.merge([], arguments));
                }
            },

            __completeHandler: function () {
                var dataSource = this;
                var handlerArguments = arguments; //Actual arguments of this function to be passed to closure:
                var actualCompleteHandler = function () {
                    if (dataSource.options.onComplete) {
                        dataSource.options.onComplete.apply(dataSource, $.merge([], handlerArguments));
                    }

                    hideSpinner();
                }

                if (this.visitor && this.visitor.isMappingSynchronous == false && this.visitor.isMappingFinished() == false) {
                    //Delay execution of complete event actions of this datasource till mapping is finished
                    this.visitor.completeHandler = actualCompleteHandler;
                }
                else {
                    //Execute actions of complete event of this datasource instantly.
                    actualCompleteHandler();
                }
            },

            __beforeSendHandler: function () {
                var dataSource = this;
                var handlerArguments = arguments; //Actual arguments of this function to be passed to closure:
                if (dataSource.options.onBeforeSend) {
                    dataSource.options.onBeforeSend.apply(dataSource, $.merge([], handlerArguments));
                }
                showSpinner(this.service.serviceLoaderOptions);
            },

            __buildRequestSettings: function (settings) {
                var handlers = {
                    'success': $.proxy(this.__responseDataHandler, this),
                    'error': $.proxy(this.__errorHandler, this),
                    'complete': $.proxy(this.__completeHandler, this),
                    'beforeSend': $.proxy(this.__beforeSendHandler, this)
                };
                settings = $.extend(handlers, this.service.__requestOptions, settings || {});

                var builder = new $a.RequestDataBuilderVisitor(!settings.jsonp && /\bjsonp\b/.test(settings.dataType || ''));
                builder.visit(this.__requestMapping);

                if (settings.allowDataModification == undefined || settings.allowDataModification == true) {
                    if (!(Object.prototype.toString.call(settings.data) === '[object Array]' && $.isEmptyObject(builder.getParams()))) {
                        settings.data = $.extend(builder.getParams(), settings.data || {});
                    }
                }
                settings.headers = $.extend(builder.getHeaders(), settings.headers || {});

                var jsonp = builder.getJsonp();
                if (jsonp) {
                    settings.jsonp = jsonp;
                }

                settings.datasource = this;

                return settings;
            },

            /**
             * Sends asynchronous request to the server using given settings. If request has been completed successfully,
             * updates components with the received data according to the defined mapping rules and fires 'success' event followed by 'complete' event.
             * <p>If request has not completed successfully, fires 'error' event followed by 'complete'.</p>
             * @see The <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax</a>.
             * @param {Object<String, Object>} settings - exactly the same object as is required by jQuery.ajax method
             */
            execute: function (settings) {
                settings = this.__buildRequestSettings(settings);
                this.service.process(settings);
            },

            /* TODO jsDocs
             * Returns transformer currently associated with data source
             */
            getTransformer: function () {
                return this.__transformer;
            },

            /* TODO jsDocs
             * Associates data source with transformer that's used to handle received data
             */
            setTransformer: function (transformer) {
                this.__transformer = transformer;
            }
        },
        {}
    );

    /**
     * @class
     */
    Apperyio.GenericService = $a.createClass(null, /** @lends Apperyio.GenericService.prototype */ {

        init: function (requestOptions) {
            this.__requestOptions = $.extend({}, requestOptions);
        },

        process: function (settings) {
            settings.beforeSend(settings);
            if (this.__requestOptions.echo) {
                settings.success(this.__requestOptions.echo);
            } else {
                console.log('Default implementation is used. Please define your own.');
                settings.success({});
            }
            settings.complete('success');
        }

    });

    /**
     * @class
     */
    Apperyio.RestService = $a.createClass(null, /** @lends Apperyio.RestService.prototype */ {

        // see correspondent variable in TestConnectionServiceImpl.java
        paramPattern: /\{([^{"':]+?)\}/g,

        requestDefaults: {
//            dataType: 'json',
            cache: true,
            crossDomain: true,
            timeout: 20000,
            traditional: true
        },


        init: function (requestOptions) {
            /* This need for correct IE ajax json requests, otherwise 'no trasport' error */
            if (navigator.userAgent.toLowerCase().indexOf('msie') != -1) {
                jQuery.support.cors = true;
            }
            this.__requestOptions = $.extend({}, this.requestDefaults, requestOptions);
        },


        process: function (settings) {
            if (this.__requestOptions.echo) {
                settings.beforeSend(settings);
                settings.success(this.__requestOptions.echo.replace(/(\r\n|\n|\r)/gm, ""));
                settings.complete("success");
            } else {
                settings.ssc_data = {};
                if (this.__requestOptions.securityContext && this.__requestOptions.securityContext.settings) {
                    $.extend(settings.ssc_data, this.__requestOptions.securityContext.settings);
                }

                settings.service_settings_data = {};
                if (this.__requestOptions.serviceSettings) {
                    $.extend(settings.service_settings_data, this.__requestOptions.serviceSettings);
                }

                settings.substitutedParams = new Array();

                this.__performParametersSubstitutions(settings);

                this.__performHeaderParametersSubstitutions(settings);

                this.__performURLSubstitutions(settings);

                for (var i = 0; i < settings.substitutedParams.length; i++) {
                    if (settings.substitutedParams[i] != undefined) delete settings.data[settings.substitutedParams[i]];
                }

                delete settings.substitutedParams;

                if (settings.contentType && settings.contentType.indexOf('json') !== -1) {
                    settings.data = JSON.stringify(settings.data);
                } else if (settings.contentType && settings.contentType.indexOf('xml') !== -1) {
                    settings.data = this.dataToXml(settings.data);
                } else if (!settings.contentType) {
                    if (!this.isMultipart(settings.data)) {
                        settings.data = settings.data.data;
                    }
                    settings.processData = false;
                    if ((settings.data instanceof Object)
                        && (typeof FormData != 'undefined')
                        && !(settings.data instanceof FormData)) {
                        settings.processData = true;
                    }
                }

                if (this.__requestOptions.securityContext) {
                    this.__requestOptions.securityContext.invoke({execute: $.ajax}, settings);
                } else {
                    $.ajax(settings);
                }
            }
        },

        isMultipart: function (data) {
            for (var prop in data) {
                if (prop != "data") {
                    return true;
                }
            }
            return false;
        },

        dataToXml: function (data) {
            var result = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            if (Object.keys(data).length > 1) {
                result = result + "<inputParameters>";
                result += this.objectToXml(data) + "</inputParameters>";
            } else {
                result += this.objectToXml(data);
            }
            return result;
        },

        /* TODO jsDocs
         * Serializes javascript object to xml
         * @param {Object} data object to encode
         * @return {string} xml string representing data
         */
        objectToXml: function (data) {
            var encodedData = "";
            var key;
            for (key in data) {
                var value = data[key];
                if (typeof value != 'string') {
                    value = this.objectToXml(value);
                }
                encodedData += "<" + key + ">" + value + "</" + key + ">";
            }
            return encodedData;
        },

        __performParametersSubstitutions: function (settings) {

            var that = this,
                contentType = settings.contentType;

            if (settings.data) {
                function __performParametersSubstitution(str, param) {
                    return (settings.service_settings_data[param] || '{' + param + '}');
                }

                function __performParametersSubstitutionRecursively(obj) {

                    if (typeof obj == 'string') {
                        obj = obj.replace(that.paramPattern, __performParametersSubstitution);
                    } else if (typeof obj == 'object') {

                        var param, value, newParam, newValue;

                        for (param in obj) {
                            if (!(contentType == false && param == "data")) {
                                value = obj[param];

                                newParam = __performParametersSubstitutionRecursively(param);
                                if (contentType != false) {
                                    newValue = __performParametersSubstitutionRecursively(value);
                                } else {
                                    newValue = value;
                                }

                                delete obj[param];
                                obj[newParam] = newValue;
                            }
                        }
                    }

                    return obj;
                }

                settings.data = __performParametersSubstitutionRecursively(settings.data);

            }
        },

        __performHeaderParametersSubstitutions: function (settings) {
            if (!$.isEmptyObject(settings.headers)) {
                function __performHeaderParametersSubstitution(str, param) {
                    var paramValue = settings.data[param] || settings.service_settings_data[param] || '{' + param + '}';
                    if (settings.substitutedParams.indexOf(param) == -1) settings.substitutedParams.push(param);
                    return paramValue;
                }

                var param, value, newParam, newValue;

                for (param in settings.headers) {

                    // Skip our appery header parameters
                    if ($.inArray(param, ["appery-key", "appery-rest", "appery-proxy-url"]) > -1) continue;

                    value = settings.headers[param];

                    newParam = param.replace(this.paramPattern, __performHeaderParametersSubstitution);
                    newValue = value.replace(this.paramPattern, __performHeaderParametersSubstitution);

                    delete settings.headers[param];
                    settings.headers[newParam] = newValue;
                }
            }
        },

        __performURLSubstitutions: function (settings) {

            var urlBuffer;

            if (settings.headers && "appery-proxy-url" in settings.headers) {
                urlBuffer = settings.headers["appery-proxy-url"];
            } else if (settings.url) {
                urlBuffer = settings.url;
            }

            if (urlBuffer) {
                function __performURLSubstitution(str, param) {
                    var paramValue = settings.data[param] || settings.ssc_data[param] || settings.service_settings_data[param] || '';
                    if (settings.substitutedParams.indexOf(param) == -1) settings.substitutedParams.push(param);

                    if ($.isArray(paramValue)) {
                        paramValue = paramValue.join(',');
                    } else if (typeof paramValue == 'object') {
                        try {
                            paramValue = JSON.stringify(paramValue);
                        } catch (ex) {
                            console.error(ex.name + '  ' + ex.message);
                        }
                    }

                    return isEncoded ? encodeURIComponent(paramValue) : paramValue;
                }

                function __performParamSubstitution(str, param) {
                    var paramValue = settings.data[param] || settings.ssc_data[param] || settings.service_settings_data[param] || '{' + param + '}';
                    if (settings.substitutedParams.indexOf(param) == -1) settings.substitutedParams.push(param);

                    if ($.isArray(paramValue)) {
                        paramValue = paramValue.join(',');
                    } else if (typeof paramValue == 'object') {
                        try {
                            paramValue = JSON.stringify(paramValue);
                        } catch (ex) {
                            console.error(ex.name + '  ' + ex.message);
                        }
                    }

                    return isEncoded ? encodeURIComponent(paramValue) : paramValue;
                }

                var urlPart = urlBuffer.indexOf('?') != -1 ? urlBuffer.substr(0, urlBuffer.indexOf('?')) : urlBuffer;
                var getParamsPart = urlBuffer.indexOf('?') != -1 ? urlBuffer.substr(urlBuffer.indexOf('?'), urlBuffer.length) : undefined;
                var isEncoded;

                isEncoded = false;
                urlPart = urlPart.replace(this.paramPattern, __performURLSubstitution);
                isEncoded = true;
                getParamsPart = getParamsPart && getParamsPart.replace(this.paramPattern, __performParamSubstitution);

                urlBuffer = urlPart + (getParamsPart ? getParamsPart : "");

                if (settings.headers && "appery-proxy-url" in settings.headers) {
                    settings.headers["appery-proxy-url"] = urlBuffer;
                } else if (settings.url) {
                    settings.url = urlBuffer;
                }
            }
        }
    });

    /**
     * @class
     */
    Apperyio.GeolocationService = $a.createClass(null, /** @lends Apperyio.GeolocationService.prototype */ {
        watchIDSet: [],
        requestDefaults: {
            frequency: 3000
        },

        init: function (requestOptions) {
            this.__requestOptions = $.extend({}, requestOptions);
        },

        process: function (settings) {
            var that = this;

            if (this.__requestOptions.echo) {
                settings.beforeSend(this.__requestOptions);
                showSpinner();
                settings.success(this.__requestOptions.echo);
                settings.complete('success');
                hideSpinner();
            } else {
                settings.beforeSend(this.__requestOptions)
                showSpinner();
                var options = settings.data.options;

                // "/^true$/i" is accepting both boolean true and string "true"
                if (options.watchPosition && (/^true$/i).test(options.watchPosition)) {
                    /* Watch Position */
                    if (settings.datasource.watchID && this.watchIDSet.indexOf(settings.datasource.watchID) != -1) {
                        // This datasource is already watching positions
                        hideSpinner();
                        return;
                    } else {
                        options.frequency = options.frequency || this.requestDefaults.frequency;
                        var watchID = navigator.geolocation.watchPosition(
                            function (position) {
                                settings.success(that.convertPositionObject(position));
                                settings.complete('success');
                                hideSpinner();
                            },
                            function (error) {
                                settings.error(null, error.message, error);
                                settings.complete('error');
                                hideSpinner();
                            },
                            settings.data.options);

                        settings.datasource.watchID = watchID;
                        this.watchIDSet.push(watchID);
                    }
                } else {
                    /* Get Current Position */
                    navigator.geolocation.getCurrentPosition(
                        function (position) {
                            settings.success(that.convertPositionObject(position));
                            settings.complete('success');
                            hideSpinner();
                        },
                        function (error) {
                            settings.error(null, error.message, error);
                            settings.complete('error');
                            hideSpinner();
                        },
                        settings.data.options);
                }
            }
        },

        /**
         * Stop geolocation service watching position
         */
        stop: function (watchID) {
            if (this.watchIDSet.length == 0) return;
            if (watchID !== undefined) {
                navigator.geolocation.clearWatch(watchID);
                delete this.watchIDSet[this.watchIDSet.indexOf(watchID)];
            } else {
                for (var i = 0; i < this.watchIDSet.length; i++) {
                    if (this.watchIDSet[i] !== undefined) {
                        navigator.geolocation.clearWatch(this.watchIDSet[i]);
                    }
                }
                this.watchIDSet = [];
            }
        },

        convertPositionObject: function (position) {
            if (position) {
                if (position.coords.timestamp) {
                    // Mozilla browser position object
                    position.timestamp = position.coords.timestamp;
                }
                return position;
            } else {
                console.error("Apperyio.GeolocationService.convertPositionObject: Attempt to convert undefined position!");
                return;
            }
        }

    });

    /**
     * @class
     */
    Apperyio.ContactsService = $a.createClass(null, /** @lends Apperyio.ContactsService.prototype */ {


        init: function (requestOptions) {
            this.__requestOptions = $.extend({}, requestOptions);
        },


        process: function (settings) {
            if (this.__requestOptions.echo) {
                settings.beforeSend(this.__requestOptions);
                showSpinner();
                settings.success(this.__requestOptions.echo);
                settings.complete('success');
                hideSpinner();
            } else {
                settings.beforeSend(this.__requestOptions);
                showSpinner();
				settings.data.options.multiple = Boolean(settings.data.options.multiple);
                navigator.contacts.find(settings.data.params.fields.split(' '),
                    function (contacts) {
                        settings.success(contacts);
                        settings.complete('success');
                        hideSpinner();
                    },
                    function (error) {
                        settings.error(null, error.code, error);
                        settings.complete('error');
                        hideSpinner();
                    },
                    settings.data.options);
            }
        }
    });

    /**
     * @class
     */
    Apperyio.BarCodeService = $a.createClass(null, /** @lends Apperyio.BarCodeService.prototype */ {


        init: function (requestOptions) {
            this.__requestOptions = $.extend({}, requestOptions);
        },


        process: function (settings) {
            if (this.__requestOptions.echo) {
                settings.beforeSend(this.__requestOptions);
                settings.success(this.__requestOptions.echo);
                settings.complete('success');
            } else {
                settings.beforeSend(this.__requestOptions);
                BarcodeScanner.scan(function (result) {
                        settings.success(JSON.stringify(result));
                        settings.complete('success');
                    }, function (error) {
                        settings.error(null, null, error);
                        settings.complete('error');
                    }
                );
            }
        }

    });

    /**
     * @class
     */
    Apperyio.CameraService = $a.createClass(null, /** @lends Apperyio.CameraService.prototype */ {

        init: function (requestOptions) {
            //Ignore component properties (quality, width, height ...) Its will be read from responseMapping
            this.__requestOptions = {};
        },

        /* TODO jsdoc
         * Note: "encodingTypes", "destinationTypes", "sourceTypes" are constants
         * But it's impossible to move this object outside of function scope
         * because class Camera is not defined when appery.js is parsed.
         */
        getEncodingType: function (strType) {
            var encodingTypes = {"JPEG": Camera.EncodingType.JPEG,
                "PNG": Camera.EncodingType.PNG};

            if (strType in encodingTypes)
                return encodingTypes[strType];
            else
                return Camera.EncodingType.JPEG;
        },


        getDestinationType: function (strType) {
            var destinationTypes = { "Data URL": Camera.DestinationType.DATA_URL,
                "File URI": Camera.DestinationType.FILE_URI,
                "Native URI": Camera.DestinationType.NATIVE_URI };

            if (strType in destinationTypes)
                return destinationTypes[strType];
            else
                return Camera.DestinationType.DATA_URL;
        },

        getSourceType: function (strType) {
            var sourceTypes = { "Photolibrary": Camera.PictureSourceType.PHOTOLIBRARY,
                "Camera": Camera.PictureSourceType.CAMERA,
                "Saved photo album": Camera.PictureSourceType.SAVEDPHOTOALBUM};

            if (strType in sourceTypes)
                return sourceTypes[strType];
            else
                return Camera.PictureSourceType.CAMERA;
        },

        //This method parses options recieved by camera service.
        //Options are converted from string to appropriate type.
        getRequestOptions: function (data) {
            var options = {};
            options['quality'] = parseInt(data.quality) || 80;
            options['destinationType'] = this.getDestinationType(data.destinationType);
            options['sourceType'] = this.getSourceType(data.sourcetype);
            options['allowEdit'] = (data.allowedit === 'true');
            options['correctOrientation'] = true;
            options['encodingType'] = this.getEncodingType(data.encodingType);
            options['targetWidth'] = parseInt(data.targetWidth) || 1024;
            options['targetHeight'] = parseInt(data.targetHeight) || 768;

            return options;
        },

        process: function (settings) {
            settings.beforeSend(this.__requestOptions);
            this.__requestOptions = this.getRequestOptions(settings.data);
            var requestOptions = this.__requestOptions;
            if (this.__requestOptions.echo) {
                settings.success(this.__requestOptions.echo);
                settings.complete('success');
            } else {
                navigator.camera.getPicture(
                    function (imageData) {
                        if (requestOptions.destinationType == Camera.DestinationType.DATA_URL) {
                            settings.success({ 'imageDataBase64': "data:image/jpeg;base64," + imageData });
                        }
                        else {
                            settings.success({ 'imageURI': imageData });
                        }
                        settings.complete('success');
                    },
                    function (errorMessage) {
                        settings.error(null, errorMessage);
                        settings.complete('error');
                    },
                    this.__requestOptions);
            }
        }

    });

    /**
     * @class
     */
    Apperyio.ApperyWrapper = $a.TiggziWrapper = $a.TiggrWrapper =
        $a.createClass(null, /** @lends Apperyio.ApperyWrapper.prototype */ {

            init: function (componentId, options) {
                this.__element = $("#"+Apperyio.CurrentScreen).find('[dsid="' + componentId + '"]:eq(0)');
                this.__element.options = options;
            },
            setProperty: function (name, value) {
                if (this.__element.hasOwnProperty(name)) {
                    this.__element[name] = value;
                    return;
                }
                if (this.__element.hasOwnProperty("setProperty")) {
                    this.setProperty(name, value);
                    return;
                }
                this.__element.attr(name, value);
            },
            refresh: function () {
                if (this.__element.hasOwnProperty("refresh")) {
                    this.__element.refresh();
                }
            }
        });

    /**
     * @class
     */
    Apperyio.ApperyMapComponent = $a.TiggziMapComponent = $a.TiggrMapComponent =
        $a.createClass($a.ApperyWrapper, /** @lends Apperyio.ApperyMapComponent.prototype */ {

            init: function (componentId, options) {
                try {
                    this.geocoder = new google.maps.Geocoder();
                } catch (e) {
                    return;
                }
                this.constructor.$super.init(componentId, options);
                this.isInitialized = false;
                this.options = options;
                this.options.mapElement = this.constructor.$super.__element;
                this.__element = this;
                this.specifiedLocMarker = null;
                this.delayOptions = null;
                this.DOM_ELEMENT_ATTRIBUTES = ['id'];
                this.supportedMarkerEvents = ["animation_changed",
                    "click",
                    "clickable_changed",
                    "cursor_changed",
                    "dblclick",
                    "drag",
                    "dragend",
                    "draggable_changed",
                    "dragstart",
                    "flat_changed",
                    "icon_changed",
                    "mousedown",
                    "mouseout",
                    "mouseover",
                    "mouseup",
                    "position_changed",
                    "rightclick",
                    "shadow_changed",
                    "shape_changed",
                    "title_changed",
                    "visible_changed",
                    "zindex_changed"];

                this.mapDomElementEvents = {
                    "blur": true,
                    "focus": true,
                    "keydown": true,
                    "keypress": true,
                    "keyup": true,
                    "swipe": true,
                    "swipeleft": true,
                    "swiperight": true,
                    "tap": true,
                    "taphold": true};

                this.mapAPIEvents = {"bounds_changed": true,
                    "center_changed": true,
                    "click": true,
                    "dblclick": true,
                    "drag": true,
                    "dragend": true,
                    "dragstart": true,
                    "heading_changed": true,
                    "idle": true,
                    "maptypeid_changed": true,
                    "mousemove": true,
                    "mouseout": true,
                    "mouseover": true,
                    "projection_changed": true,
                    "resize": true,
                    "rightclick": true,
                    "tilesloaded": true,
                    "tilt_changed": true,
                    "zoom_changed": true};
                this.renderMap();
            },
            renderMap: function () {
                var _that = this;
                if (this.options.address != "") {
                    //evaluate center coordinates from address
                    this.geocoder.geocode({ 'address': this.options.address}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            _that.options.latitude = results[0].geometry.location.lat();
                            _that.options.longitude = results[0].geometry.location.lng();
                        } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                            console.error("Can't find location with address : '" + _that.options.address + "'");
                        } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                            setTimeout(function () {
                                _that.renderMap();
                            }, 200);
                            return;
                        } else {
                            console.error("Geocode was not successful for the following reason: " + status);
                        }
                        _that.initializeMapComponent();
                    });
                    return;
                }
                this.initializeMapComponent();
            },
            initializeMapComponent: function () {
                this.isInitialized = false;
                var _that = this;
                mapCenter = new google.maps.LatLng(this.options.latitude, this.options.longitude);
                this.options.mapElement.gmap({
                    'center': mapCenter,
                    'zoom': this.options.zoom
                }).bind('init', function (evt, map) {
                        _that.gmap = map;
                        _that.isInitialized = true;
                        //_that.bindListeners.call(_that);

                        if (_that.delayOptions != null) {
                            $.extend(_that.options, _that.delayOptions);
                            _that.delayOptions = null;
                            _that.refresh();
                        } else {
                            _that.renderMarkers();
                        }


                    });
            },
            renderSpecifiedLocationMarker: function () {
                //Setting specified location marker if enabled
                if (this.isInitialized) {
                    if (this.options.showLocationMarker) {
                        if (typeof(this.options.showLocationMarker) == "string") {
                            switch (this.options.showLocationMarker.toLowerCase()) {
                                case "true":
                                case "yes":
                                case "1":
                                    this.options.showLocationMarker = true;
                                    break;
                                default:
                                    this.options.showLocationMarker = false;
                            }
                        }
                        if (this.options.showLocationMarker) {
                            specifiedLoc = new google.maps.LatLng(this.options.latitude, this.options.longitude);
                            this.specifiedLocMarker = new google.maps.Marker({
                                'position': specifiedLoc,
                                'title': "Specified location"
                            });
                            this.options.mapElement.gmap('addMarker', this.specifiedLocMarker);
                        }
                    }
                } else {
                    console.log("Is not initialized yet, please try again later");
                }
            },
            renderMarkers: function () {
                if (this.isInitialized) {
                    var _that = this;
                    this.options.mapElement.gmap("clear", "markers");
                    this.renderSpecifiedLocationMarker();

                    $("#"+Apperyio.CurrentScreen).find("[dsid=" + this.options.markerSourceName + "] li").each(function (index) {
                        var isRenderedmarker = $(this).attr("rendered") ? $(this).attr("rendered") : "true";
                        var isTemplate = $(this).attr("_tmpl") ? $(this).attr("_tmpl") : "false";

                        if (isRenderedmarker == "true" && isTemplate != "true") {
                            var markerDomElemId = $(this).attr("id");
                            lat = $(this).attr("latitude") ? $(this).attr("latitude") : $(this).find("[req]").attr("latitude");
                            longt = $(this).attr("longitude") ? $(this).attr("longitude") : $(this).find("[req]").attr("longitude");
                            title = $(this).attr("text") ? $(this).attr("text") : $(this).find("[req]").attr("text");
                            address = $(this).attr("address") ? $(this).attr("address") : $(this).find("[req]").attr("address");
                            showInfoWindow = $(this).attr("show_info") ? $(this).attr("show_info") : $(this).find("[req]").attr("show_info");
                            markerName = $(this).attr("name");
                            var marker = new google.maps.Marker({
                                'title': title
                            });
                            if (showInfoWindow == "true") {
                                var infoWindowContent = "";
                                //rendering info window
                                tagName = $(this).get(0).tagName;
                                if ((tagName == "LI") || (tagName == "OI")) {
                                    //$(this).wrapInner("<div style='display:block'/>");
                                    infoWindowContent = $(this).html();
                                } else {
                                    if ($(this).parent().children().size() > 1) {
                                        $(this).wrap("<div/>");
                                    }
                                    $(this).css('display', 'block');
                                    infoWindowContent = $(this).parent().html();
                                    $(this).css('display', 'none');
                                }

                                var iw = new google.maps.InfoWindow({
                                    content: infoWindowContent
                                });
                                google.maps.event.addListener(marker, "click", function (e) {
                                    iw.open(_that.gmap, this);

                                });
                                iw.apperyMarkerName = markerName;
                                /*
                                 google.maps.event.addListener(iw, 'domready', function () {
                                 $("[name=" + iw.apperyMarkerName + "_infoWindowContent]").parent().parent().css("overflow", "");
                                 $("[name=" + iw.apperyMarkerName + "_infoWindowContent]").parent().css("overflow", "");
                                 });
                                 */
                            }
                            $.each(_that.supportedMarkerEvents, function (index, event) {
                                google.maps.event.addListener(marker, event, function () {
                                    $("#"+Apperyio.CurrentScreen).find("#" + markerDomElemId).trigger(event, arguments);
                                });
                            });
                            //if marker address specified then geocode address
                            if (address != "" && address != undefined) {
                                _that.createMarkerFromAddress(_that, address, marker);
                            } else if (lat != "" && longt != "") {
                                var markerPosition = new google.maps.LatLng(lat, longt);
                                marker.setPosition(markerPosition);
                                _that.options.mapElement.gmap('addMarker', marker);
                            }

                        }
                    });
                } else {
                    console.log("Is not initialized yet, please try again later");
                }
            },

            createMarkerFromAddress: function (context, address, marker) {
                var _that = context;
                _that.geocoder.geocode({ 'address': address}, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        lat = results[0].geometry.location.lat();
                        longt = results[0].geometry.location.lng();
                        var markerPosition = new google.maps.LatLng(lat, longt);
                        marker.setPosition(markerPosition);
                        _that.options.mapElement.gmap('addMarker', marker);
                    } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                        console.error("Can't find location with address : '" + _that.options.address + "'");
                    } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                        setTimeout(function () {
                            _that.createMarkerFromAddress(_that, address, marker);
                        }, 200);
                        return;
                    } else {
                        console.error("Geocode was not successful for the following reason: " + status);
                    }
                });
            },

            setProperty: function (name, value) {
                if (this.isInitialized) {
                    if (this.gmap.hasOwnProperty(name)) {
                        if (name == "zoom") {
                            try {
                                value = parseInt(value);
                            } catch (e) {
                                return;
                            }
                        }
                        this.gmap.set(name, value);
                    } else {
                        if (this.options.hasOwnProperty(name)) {
                            this.options[name] = value;
                        } else if (name == "visible") {
                            value = String(value);
                            var el =  $(this.options.mapElement);
                            if (value == "true" || value == "visible") {
                                $(this.options.mapElement).css("display", "block");
                            } else if (value == "false" || value == "hidden") {
                                $(this.options.mapElement).css("display", "none");
                            }
                        }
                    }
                } else {
                    if (this.options.hasOwnProperty(name)) {
                        if (this.delayOptions == null) {
                            this.delayOptions = {};
                        }
                        this.delayOptions[name] = value;
                    } else if (name == "visible") {
                        value = String(value);
                        var el =  $(this.options.mapElement);
                        if (value == "true" || value == "visible") {
                            $(this.options.mapElement).css("display", "block");
                        } else if (value == "false" || value == "hidden") {
                            $(this.options.mapElement).css("display", "none");
                        }
                    }
                }
            },


            __setAttribute: function (name, value) {
                this.setProperty(name, value);
            },

            setAttr: function (name, value) {
                if (jQuery.inArray(name, this.DOM_ELEMENT_ATTRIBUTES) > -1) {
                    this.setDomElementAttr(name, value);
                } else {
                    this.setProperty(name, value);
                }
            },


            attr: function (name, value) {
                if (value == undefined) {
                    return this.getAttr(name);
                } else {
                    if (jQuery.inArray(name, this.DOM_ELEMENT_ATTRIBUTES) > -1) {
                        this.setDomElementAttr(name, value);
                    } else {
                        this.setProperty(name, value);
                    }
                }
            },

            setDomElementAttr: function (name, value) {
                this.options.mapElement.attr(name, value);
            },

            getAttr: function (attrName) {
                return this.options[attrName];
            },

            addAPIEventListener: function (map, event, handler) {
                google.maps.event.addListener(map, event, handler);
            },

            addDOMEventListener: function (mapContainer, event, handler) {
                google.maps.event.addDomListener(mapContainer, event, handler);
            },

            bindListeners: function () {
                console.log("Registering events");
                var _that = this;
                $.each(this.mapEventHanlers, function (event, handler) {
                    if (_that.mapAPIEvents[event] != undefined && _that.mapAPIEvents[event]) {
                        console.log("Registering API event : " + event);
                        _that.addAPIEventListener(_that.gmap, event, handler);
                    } else if (_that.mapDomElementEvents[event] != undefined && _that.mapDomElementEvents[event]) {
                        console.log("Registering DOM event : " + event);
                        _that.addDOMEventListener(_that.options.mapElement, event, handler);
                    }
                });
            },

            addListener: function (events) {
                this.mapEventHanlers = events;
                if (this.isInitialized) {
                    this.bindListeners.call(this);
                }
            },

            refresh: function () {
                if (this.isInitialized) {
                    _that = this;
                    if (this.options.address != "") {
                        this.geocoder.geocode({ 'address': this.options.address}, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                _that.options.latitude = results[0].geometry.location.lat();
                                _that.options.longitude = results[0].geometry.location.lng();
                                _that.gmap.set("center", new google.maps.LatLng(_that.options.latitude, _that.options.longitude));
                                _that.renderMarkers();
                                _that.options.mapElement.gmap('refresh');
                            } else {
                                console.log("Geocode was not successful for the following reason: " + status);
                            }
                        });
                    } else {
                        this.gmap.set("center", new google.maps.LatLng(this.options.latitude, this.options.longitude));
                        //refresh markers
                        this.renderMarkers();
                        this.options.mapElement.gmap('refresh');
                    }
                } else {
                    console.log("Cannot refresh, map is not initialized!");
                }
            },

            get: function (index) {
                if (index != undefined) {
                    return this.options.mapElement.get(index);
                }
            },

            show: function () {
                this.options.mapElement.show();
            },

            hide: function () {
                this.options.mapElement.hide();
            },

            toggle: function () {
                this.options.mapElement.toggle();
            }
        });

    Apperyio.ApperyMobileAudioComponent = $a.TiggziMobileAudioComponent = $a.TiggrMobileAudioComponent =
        $a.createClass($a.ApperyWrapper, /** @lends Apperyio.ApperyMobileAudioComponent.prototype */ {

            init: function (componentId, options) {
                this.audio_selector = "#" + componentId;
				this.autoplay = $(this.audio_selector).attr("autoplay") != undefined ? true : false;
				this.audioPath = $(this.audio_selector).find("source:first").attr("src");
				this.state = "stopped";

				if(this.isLocalAudio() && this.isAndroidPlatform()){
				    console.log("this.isLocalAudio(): "+this.isLocalAudio()+" this.isAndroidPlatform(): "+this.isAndroidPlatform());
				    var self = this;
					document.addEventListener("deviceready",
						function() {
							self.initializeNativePlayer();
						}
						, false);
				}
            },

			isLocalAudio : function(){
				return !this.audioPath.indexOf("http") == 0;
			},

			isAndroidPlatform : function(){
				return Apperyio.getTargetPlatform() == "A";
			},

			initializeNativePlayer  : function(){
				console.log("initializeNativePlayer with: "+this.audioPath);
				var androidLocalAssetsPath = "/android_asset/www/";
				var audioPath = androidLocalAssetsPath + this.audioPath;
				this.native_media = new Media(audioPath,
            	    function () {
            	        console.log("playAudio():Audio Success");
            	    },
            	    function (err) {
            	        console.error("playAudio():Audio Error: " + err);
            	    }
            	);

				console.log("autoplay: "+this.autoplay);
				if(this.autoplay){
					this.native_media.play();
					this.state = "playing";
				}
				this.bindUIEvents();
			},

			bindUIEvents : function(){
				console.log("Bind UI events");
				var self = this;
				$(this.audio_selector).unbind("tap").bind("tap",
					function() {
						self.onPlayButtonClick();
					}
				);

			},

			onPlayButtonClick : function(){
				if(this.native_media != undefined){
					if(this.state == "stopped"){
						this.native_media.play();
						this.state = "playing";
					}else if(this.state == "playing"){
						this.native_media.stop();
						this.state = "stopped";
					}
				}else{
					console.error("Phonegap Media player not ready!");
				}
			}
        });
    /**
     * @class
     */
    Apperyio.ApperyMobileCarouselComponent = $a.TiggziMobileCarouselComponent = $a.TiggrMobileCarouselComponent =
        $a.createClass($a.ApperyWrapper, /** @lends Apperyio.ApperyMobileCarouselComponent.prototype */ {

            init: function (componentId, options) {
                //this.constructor.$super.init(componentId,options);
                this.carouselOptions = options;
                this.carouselRoot = $('#' + componentId);
                this.carouselRootId = this.carouselRoot.attr("id");
                this.__element = this;
                this.DOM_ELEMENT_ATTRIBUTES = ['visible', 'id'];
                this.initializeCarousel();
            },

            initializeCarousel: function () {
                var _that = this,
                    currentPage = $("#" + Apperyio.CurrentScreen),
                    initCarouselWidget = function () {
                        if (_that.carouselOptions != undefined) {
                            _that.carouselRoot.carousel(_that.carouselOptions);
                        } else {
                            _that.carouselRoot.carousel();
                        }
                    };

                if (currentPage[0] == $("body").pagecontainer("getActivePage")[0]) {
                    initCarouselWidget();
                } else if(currentPage.parent()[0].tagName === "DIV") {
                    currentPage.bind("tabletpagecontainershow", initCarouselWidget);
                } else {
                    currentPage.parent().bind("pagecontainershow", initCarouselWidget);
                }
            },

            setProperty: function (name, value) {
                if (name != undefined) {
                    if (this.carouselOptions.hasOwnProperty(name)) {
                        this.carouselOptions[name] = value;
                        this.carouselRoot.carousel(this.carouselOptions);
                    }
                }
            },

            __setAttribute: function (name, value) {
                this.setProperty(name, value);
            },

            setAttr: function (name, value) {
                if (jQuery.inArray(name, this.DOM_ELEMENT_ATTRIBUTES) > -1) {
                    this.setDomElementAttr(name, value);
                } else {
                    this.setProperty(name, value);
                }
            },

            attr: function (name, value) {
                if (value == undefined) {
                    return this.getAttr(name);
                } else {
                    if (jQuery.inArray(name, this.DOM_ELEMENT_ATTRIBUTES) > -1) {
                        this.setDomElementAttr(name, value);
                    } else {
                        this.setProperty(name, value);
                    }
                }
            },

            setDomElementAttr: function (name, value) {
                if (name == "visible") {
                    value = String(value);
                    var el = $(this.carouselRoot)
                    if (value == "true" || value == "visible") {
                        el.css("display", "block");
                    } else if (value == "false" || value == "hidden") {
                        el.css("display", "none");
                    }
                    this.refresh();
                } else {
                    this.carouselRoot.attr(name, value);
                }
            },

            getAttr: function (attrName) {
                return this.carouselOptions[attrName];
            },


            getOptions: function () {
                return this.carouselOptions;
            },

            refresh: function () {
                console.log("carousel refresh");
                if (this.carouselRoot != undefined) {
                    this.carouselRoot.carousel("refresh");
                }
            },

            show: function () {
                this.carouselRoot.show();
            },

            hide: function () {
                this.carouselRoot.hide();
            },

            toggle: function () {
                this.carouselRoot.toggle();
            }
        });

    /**
     * @class
     */
	 Apperyio.ApperyMobileDatePickerComponent = $a.TiggziMobileDatePickerComponent = $a.TiggrMobileDatePickerComponent =
        $a.createClass($a.ApperyWrapper, /** @lends Apperyio.ApperyMobileDatePickerComponent.prototype */ {

            init: function (componentId, options) {
                this.datepicker_selector = "#" + componentId;
                this.datapickerRoot = $(this.datepicker_selector);
                this.datepicker_openButtonSelector = this.datepicker_selector + " .datepickeropenbutton";
                this.datepicker_calendarConteinerSelector = this.datepicker_selector + " .datePickerControls";
                this.datepicker_inputSelector = this.datepicker_selector + " input";
                this.datepicker_controlsContainerSelector = this.datepicker_selector + " .datePickerControls";
                this.datepicker_existDatePickerSelector = this.datepicker_selector + " .hasDatepicker";
                this.datepicker_dataPickerOptions = options;
                this.calendarscrollcontainerselector = this.datepicker_selector + " .calendarscroll";
                this.DOM_ELEMENT_ATTRIBUTES = ['id'];
                this.__element = this;
                this.initializeDataPicker();
            },

            initializeDataPicker: function () {
                // Correct Datepicker width
                var _that = this;

                if (this.datepicker_dataPickerOptions.defaultDate != undefined) {
                    this.datepicker_dataPickerOptions.defaultDate = $.datepicker.formatDate(this.datepicker_dataPickerOptions.dateFormat, new Date(this.datepicker_dataPickerOptions.defaultDate));
                    // Setting formatted defaultDate to input
                    $(this.datepicker_inputSelector).val(this.datepicker_dataPickerOptions.defaultDate);
                } else {
                    this.datepicker_dataPickerOptions.defaultDate = $.datepicker.formatDate(this.datepicker_dataPickerOptions.dateFormat, new Date());
                }
                // Register input change action
                $(this.datepicker_inputSelector).change(
                    function () {
                        _that.setProperty("defaultDateValue", $(this).val());
                    });

                // Register open calendar action
                $(document).off("click", this.datepicker_openButtonSelector).on("click", this.datepicker_openButtonSelector, function () {
                    _that.datepicker_dataPickerOptions.onSelect = function (dateText, inst) {
                        $(_that.datepicker_inputSelector).trigger("change");
                        /* see ETST-8518 */
                        _that.setProperty("defaultDateValue", dateText);
                        $(this).datepicker("destroy");
                        $(_that.calendarscrollcontainerselector).remove();

                    }
                    _that.datepicker_dataPickerOptions.altField = _that.datepicker_inputSelector;
                    // Creates datePicker
                    if ($(_that.datepicker_existDatePickerSelector + ":visible").size() == 0) {
                        if ($(_that.datepicker_existDatePickerSelector).size() > 0) {
                            $(_that.datepicker_existDatePickerSelector).datepicker("destroy");
                            $(_that.calendarscrollcontainerselector).remove();
                        }
                        if (_that.datepicker_dataPickerOptions.defaultDate == undefined || _that.datepicker_dataPickerOptions.defaultDate == "") {
                            _that.datepicker_dataPickerOptions.defaultDate = $.datepicker.formatDate(_that.datepicker_dataPickerOptions.dateFormat, new Date());
                        }
                        //save control panel width
                        var controlsContainerWidth = $(_that.datepicker_controlsContainerSelector).width();
                        //restore control panel width
                        $(_that.datepicker_controlsContainerSelector).width(controlsContainerWidth);
                        _that.datepicker_dataPickerOptions.dataThemeSwatch = _that.datapickerRoot.attr("data-theme");
                        $(_that.datepicker_calendarConteinerSelector).after($("<div />").datepicker(_that.datepicker_dataPickerOptions));
                        datepicker_widthDiff = $(_that.datepicker_existDatePickerSelector + " .ui-datepicker-calendar").width() - $(_that.datepicker_existDatePickerSelector + " .ui-datepicker-header").width();
                        if (datepicker_widthDiff > 3) {
                            $(_that.datepicker_existDatePickerSelector).width($("[data-role='content']").width());
                            wrappedScrollComponent = '<div class="calendarscroll" style="overflow-x:scroll;width:' + $(_that.datepicker_selector).css("width") + '" />';
                            $(_that.datepicker_existDatePickerSelector).wrap(wrappedScrollComponent);
                        }
                    } else {
                        $(_that.datepicker_existDatePickerSelector).datepicker("destroy");
                        $(_that.calendarscrollcontainerselector).remove();
                    }
                });
                //ETST-14489
                $(window).resize(function () {
                    $(_that.datepicker_controlsContainerSelector).width("auto");
                });
            },

            setProperty: function (name, value) {
                if (name == "dateFormat") {
                    // Changing datepicker dateFormat
                    try {
                        dtObject = $.datepicker.parseDate(this.datepicker_dataPickerOptions.dateFormat, this.datepicker_dataPickerOptions.defaultDate);
                        this.datepicker_dataPickerOptions.dateFormat = value;
                        dateFormattedValue = $.datepicker.formatDate(this.datepicker_dataPickerOptions.dateFormat, dtObject);
                        this.datepicker_dataPickerOptions.defaultDate = dateFormattedValue;
                        $(this.datepicker_inputSelector).val(dateFormattedValue);
                    } catch (e) {
                        console.log("Error: Incorrect date format");
                        return;
                    }
                } else if (name == "defaultDateValue") {
                    // Setting new date
                    try {
                        $.datepicker.parseDate(this.datepicker_dataPickerOptions.dateFormat, value);
                        this.datepicker_dataPickerOptions.defaultDate = value;
                        $(this.datepicker_inputSelector).val(value);
                    } catch (e) {
                        console.log("Error: Input date must be in'" + this.datepicker_dataPickerOptions.dateFormat + "' format");
                        return;
                    }

                } else if (name == "visible") {
                    value = String(value);
                    var el = $(this.datepicker_selector)
                    if (value == "true" || value == "visible") {
                        el.css("display", "block");
                    } else if (value == "false" || value == "hidden") {
                        el.css("display", "none");
                    }
                }

            },
            __setAttribute: function (name, value) {
                this.setProperty(name, value);
            },


            setAttr: function (name, value) {
                if (jQuery.inArray(name, this.DOM_ELEMENT_ATTRIBUTES) > -1) {
                    this.setDomElementAttr(name, value);
                } else {
                    this.setProperty(name, value);
                }
            },


            attr: function (name, value) {
                if (value == undefined) {
                    return this.getAttr(name);
                } else {
                    if (jQuery.inArray(name, this.DOM_ELEMENT_ATTRIBUTES) > -1) {
                        this.setDomElementAttr(name, value);
                    } else {
                        this.setProperty(name, value);
                    }
                }
            },

            setDomElementAttr: function (name, value) {
                this.datapickerRoot.attr(name, value);
            },


            getAttr: function (attrName) {
                if (attrName == "defaultDateValue") {
                    return this.datepicker_dataPickerOptions.defaultDate;
                } else {
                    return this.datepicker_dataPickerOptions[attrName];
                }
            },

            getOptions: function () {
                return this.datepicker_dataPickerOptions;
            },

            show: function () {
                this.datapickerRoot.show();
            },

            hide: function () {
                this.datapickerRoot.hide();
            },

            toggle: function () {
                this.datapickerRoot.toggle();
            }
        });

    /**
     * @class
     */
    Apperyio.DefaultSecurityContext = $a.DefaultSecurityContext = $a.createClass(SecurityContext, {
        invoke: function (service, settings) {
            $a.DefaultSecurityContext.$super.invoke.call(this, service, settings);
        }
    });


    $a.screenStorage = new $a.createClass(null, $a.Storage);
    $a.persistentStorage = localStorage;

    try {
        if (window.location.href.search('file') === -1) {
            $a.applicationStorage = sessionStorage;
        }
    } catch (err) {
        console.error(err);
    }

    $a.adjustContentHeightWithPadding = function (page) {
        if (!page) {
            $("[data-role='page']").each(function (ind, elt) {
                Apperyio.adjustContentHeightWithPadding(elt);
            });
            return;
        }

        page = $(page);

        // It's OK with dialogue, we don't need extra sizing
        if (page.is("[data-dialog='true']")) return;

        var header, footer, content;

        content = page.find(".ui-content:visible:eq(0)");
        if (page.hasClass("detail-content")) {
            // If it's a detail content page, we must consider height of master page header and footer
            header = page.closest(".ui-page:not(.detail-content)").find(".ui-header:visible:eq(0)");
            footer = page.closest(".ui-page:not(.detail-content)").find(".ui-footer:visible:eq(0)");
        } else {
            header = page.find(".ui-header:visible:eq(0)");
            footer = page.find(".ui-footer:visible:eq(0)");
        }

        var hh = header.outerHeight() || 0,
            fh = footer.outerHeight() || 0,
            topPad = content.css("padding-top") ? content.css("padding-top").replace("px", "") : 0,
            bottomPad = content.css("padding-bottom") ? content.css("padding-bottom").replace("px", "") : 0;

        content.css("min-height", window.innerHeight - hh - fh - topPad - bottomPad);

        if (page.hasClass("detail-content")) {
            page.css("min-height", window.innerHeight - hh - fh - topPad - bottomPad);
        } else {
            if ($(window).width() >= 650) {
                $('.scroller').height(window.innerHeight - hh - fh);
            }
        }
    };


    /**
     * Loads specified page to as detail content in tablet (iPad) page layout
     * @param {string} pageUrl - page to be loaded
     */
    Apperyio.setDetailContent = function (pageUrl) {
        // iPad template only has .content-primary and .content-secondary sections
        if ($("#" + Apperyio.CurrentScreen + " .content-primary").length ||
            $(".ui-page-active .content-primary").length) {
            if (pageUrl.indexOf("#") == 0) {
                data = $(pageUrl);
                processResponce(data);
            } else {
                // Workaround for refreshing Default content oniPad screen in IE (ETST-14626)
                if (navigator.userAgent.toLowerCase().indexOf('msie') != -1) {
                    $.get(pageUrl, {"_": $.now()}, function (data) {
                        processResponce(data);
                    });
                } else {
                    $.get(pageUrl, function (data) {
                        processResponce(data);
                    });
                }
            }
        } else {
            window.location = pageUrl;
        }


        function unwrapAndApply(selector, content) {
            var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
            var rhead = /<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi;
            var oldContent = [];
            // Create a dummy div to hold the results
            var tmpDiv = jQuery("<div>");
            // Inject the contents of the document in, removing the scripts
            // to avoid any 'Permission Denied' errors in IE
            if (typeof content == "object") {
                oldContent = jQuery(selector).find("div[data-role='page']");
                if (oldContent.length != 0) {
                    oldContent.hide();
                    $("body").append(oldContent);
                }
                tmpDiv.append(content);
            } else {
                tmpDiv.append(content.replace(rhead, ""));
            }

            var tmpDivPage = tmpDiv.find("[data-role='page']"),
                tmpDivHeader = tmpDiv.find("div[data-role='header']"),
                tmpDivHeaderCaption = tmpDivHeader.children("h1, h2, h3, h4, h5, h6").text(),
                tmpDivContent = tmpDiv.find("div[data-role='content']"),
                tmpDivFooter = tmpDiv.find("div[data-role='footer']"),
                tmpDivPanels = tmpDiv.find("div[data-role='panel']"),
                tmpDivSliders = tmpDiv.find("input[type='range']"),
                tmpDivSearches = tmpDiv.find("input[type='search']");

            window.primaryContentOnLoad = { id: tmpDivPage.attr("id"), init: false };

            // Removing toolbars
            tmpDivHeader.remove();
            tmpDivFooter.remove();

            // Moving all Detail Content Page panels to main Master Detail page
            var currentMasterDetailPage = $("body > .ui-page");
            tmpDivPanels.each(function () {
                if (currentMasterDetailPage.find("#" + $(this).attr("id")).length == 0) {
                    $(this).clone().appendTo(currentMasterDetailPage).panel();
                }
                $(this).remove();
            });

            jQuery(selector).html(tmpDiv);

            // Workaround for corrupted sliders ETST-8234
            $.each(tmpDivSliders, function () {
                this.type = "number";
                $(this).attr("data-type", "range");
            });

            $.each(tmpDivSearches, function () {
                this.type = "text";
                $(this).attr("data-type", "search");
            });

            if (!tmpDivPage.hasClass('ui-page')) {

                tmpDivPage.addClass('ui-page detail-content');
                tmpDivContent.addClass('ui-content');

                tmpDivPage.enhanceWithin(); // ex trigger("create")
                window.primaryContentOnLoad.init = true;
            }

            // Workaround for empty slider's textbox in IE (ETST-8234)
            tmpDivSliders = tmpDiv.find(".ui-slider");
            $.each(tmpDivSliders, function () {
                var slider = $(this).children("input[type='number']");
                if (slider[0]) {
                    slider.val(slider[0].getAttribute("value")).slider("refresh");
                }
            });

            tmpDiv.find("div[data-role=page]").css('position', 'static');
            tmpDiv.find("div[data-role=page]").show();

            return tmpDivHeaderCaption;
        }


        function processResponce(data) {
            var selector;
            if ($('.ui-page-active .content-primary').length == 1) {
                selector = ".ui-page-active .content-primary";
            } else {
                selector = "#" + Apperyio.CurrentScreen + " .content-primary";
            }
            var pageTitle = unwrapAndApply(selector, data);
            if ($('.ui-scrollview-view:visible').length != 0) {
                if ($('.scroller:visible').data('scrollview') != undefined)
                    $('.scroller:visible').scrollview("scrollTo", 0, 0);
            }
            if (!pageTitle && (typeof data == "string")) {
                pageTitle = data.match(/<title[^>]*>([^<]*)/) && RegExp.$1;
            }
            // Set title
            if (pageTitle) {
                document.title = pageTitle;
                $("div[data-role='page']").children(":jqmData(role='header')").find(".ui-title").text(pageTitle);
            }

            $('.content-primary input, .content-primary textarea').unbind('blur', adjustContentHeightWithPadding);
            $('.content-primary input, .content-primary textarea').bind('blur', adjustContentHeightWithPadding);

            if (window.primaryContentOnLoad) {
                if (window.primaryContentOnLoad.init)
                    eval(window.primaryContentOnLoad.id + "_js()");
                eval(window.primaryContentOnLoad.id + "_js(true)");
                $("#" + window.primaryContentOnLoad.id).triggerHandler("pagecontainershow");
                if($("#" + window.primaryContentOnLoad.id).parent()[0].tagName === "DIV"){
                    $("#" + window.primaryContentOnLoad.id).triggerHandler("tabletpagecontainershow");
                }
                window.primaryContentOnLoad = undefined;
            }
        }
    };

    /**
     * Programmatically changes from one page to specified
     *
     * @param {string} outcome - page name
     * @param {Object<String, Object>} options - exactly the same object as is required by pagecontainer change method
     * @see The <a href="http://jquerymobile.com/test/docs/api/methods.html">JQM API methods</a>.
     */
    Apperyio.navigateTo = function (outcome, options) {

        function loadjscssfile(filename, filetype) {
            if (filetype == "js") {
                var resourceRef = document.createElement('script')
                resourceRef.setAttribute("type", "text/javascript")
                resourceRef.setAttribute("src", filename)
            }
            else if (filetype == "css") {
                var resourceRef = document.createElement("link")
                resourceRef.setAttribute("rel", "stylesheet")
                resourceRef.setAttribute("type", "text/css")
                resourceRef.setAttribute("href", filename)
            }
            if (typeof resourceRef != "undefined") {
                document.getElementsByTagName("head")[0].appendChild(resourceRef);
            }

        }

        function loadExternalPageResource(resourceName, resourceType) {
            var resourceSelector = null;
            if (resourceType == "js") {
                resourceSelector = "script[src='" + resourceName + "']";
            } else if (resourceType == "css") {
                resourceSelector = "link[href='" + resourceName + "']";
            }
            var isResourceAlreadyLoaded = $(resourceSelector).size() > 0;
            if (!isResourceAlreadyLoaded) {
                loadjscssfile(resourceName, resourceType);
            }
        }

        function prepareExternalPageResourcesIfNeeded(pageName) {
            var platform;
            if (window.device != undefined) {
                if (window.device.platform != undefined) {
                    platform = window.device.platform;
                }
            }
            if (platform === "Win32NT" || platform === "WinCE" || platform === "Android") {
                if (pageName != undefined && pageName != "") {
                    var jsResourceName = pageName + ".js";
                    var cssResourceName = pageName + ".css";
                    loadExternalPageResource(jsResourceName, "js");
                    loadExternalPageResource(cssResourceName, "css");
                }
            }
        }

        for (var i = 0; i < this.AppPages.length; i++) {
            if (this.AppPages[i].name == outcome) {
                // for WP7 only
                prepareExternalPageResourcesIfNeeded(outcome);
                if (options && typeof options == 'object') {
                    $("body").pagecontainer("change", this.AppPages[i].location, options);
                } else {
                    $("body").pagecontainer("change", this.AppPages[i].location);
                }
            }
        }
    };

    /**
     * Getting uploaded image URL by it's name. Works both on appery.io and in built mobile apps.
     * @param {string} imageName uploaded image name (with extension)
     * @return {string} image URL
     */
    Apperyio.getImagePath = function (imageName) {
        var result, encodedImageName = this.__URLEncodeSpecial(this.__URLEncodeSpecial(imageName));

        if (Apperyio.env == 'web') {
            if (location.hostname.indexOf("project.") == 0) {
                // old domain model
                result = location.protocol + '//' + location.hostname +
                    (location.port == "" ? "" : (":" + location.port)) + "/views/" +
                    location.pathname.split('\/')[2] + "/image/" + encodedImageName;
            } else {
                // new domain model
                result = location.protocol + '//' + location.hostname +
                    (location.port == "" ? "" : (":" + location.port)) + "/app/views/" +
                    location.pathname.split('\/')[3] + "/image/" + encodedImageName;
            }

        } else {
            result = "files/views/assets/image/" + encodedImageName;
        }

        return result;
    };

    /**
     * Refreshes screen jQueryMobile components, audio and video elements.
     * @param {(string|Element)} screen - jQueryMobile screen id or screen DOM Element
     */
    Apperyio.refreshScreenFormElements = function (screen) {
        var ctx;
        if (screen) {
            if (typeof screen == 'object') {
                ctx = $(screen);
            } else if (typeof screen == 'string') {
                ctx = $("#" + screen);
            }
        }

        if (!ctx) {
            ctx = $("body");
        }

        // JQM elements
        ctx.find("input[type='radio'], input[type='checkbox']").checkboxradio("refresh");
//      ctx.find("input[data-type='range']").slider("refresh");
        ctx.find("input[data-type='range']").slider();
        ctx.find("select[data-role='flipswitch']").refresh();
        ctx.find("div.ui-select select").selectmenu('refresh');
        ctx.find("ul[data-role='listview']:not([_idx]), ol[data-role='listview']:not([_idx])").listview('refresh');
        var elements = ctx.find("div[data-role='collapsible-set']");
        elements.each(function (elementIdx) {
            var element = elements.eq(elementIdx);
            element.collapsibleset();
            element.find("div.ui-collapsible-content:not(:last)").removeClass('ui-corner-bottom');
            if (element.find("div.ui-collapsible-content:last").hasClass('ui-corner-bottom')) {
                element.find("a.ui-collapsible-heading-toggle:visible:first").addClass('ui-corner-top');
            }
            element.find("div[data-role=collapsible]:visible:first").addClass('ui-first-child');
        });

        // html audio and video
        ctx.find("audio, video").load();
    };

    /**
     * Process all select menus and copy custom CSS class from &lt;select .../> tag to a JQM button
     * @param {(string|Element)} screen - jQueryMobile screen id or screen DOM Element
     */
    Apperyio.processSelectMenu = function (screen) {
        var ctx;
        if (screen) {
            if (typeof screen == 'object') {
                ctx = $(screen);
            } else if (typeof screen == 'string') {
                ctx = $("#" + screen);
            }
        }
        ctx.find('.ui-select select').each(function () {
            var selectElement = $(this);
            var customClass = selectElement.attr('class');
            var apperyDefaultClassName = selectElement.attr('appery-class');
            var button = undefined;
            if (customClass != undefined && customClass.trim() != "") {
                //get select button depends on menu type
                if (selectElement.attr("data-native-menu") != undefined && selectElement.attr("data-native-menu") == "true") {
                    button = $(selectElement).parent();
                    //delete appery component class from select button, if JQM already added it and menu type is 'native menu'
                    if (button.hasClass(apperyDefaultClassName)) {
                        button.removeClass(apperyDefaultClassName);
                    }
                } else {
                    button = $(selectElement).prev();
                }
                var selectMenuCSSClasses = customClass.split(" ");
                for (var i = 0; i < selectMenuCSSClasses.length; i++) {
                    if (selectMenuCSSClasses[i].indexOf(apperyDefaultClassName) == -1 && selectMenuCSSClasses[i].trim() != "") {
                        if (!button.hasClass(selectMenuCSSClasses[i])) {
                            button.addClass(selectMenuCSSClasses[i]);
                        }
                    }
                }
            }
        });
    };

    $.fn.getAttr = function (attrName) {
        if (attrName == 'visible')
            return this.is(':visible');
        else if (attrName == "value" && this.attr('data-role') === "fieldcontain") {
            return (function (el) {
                var arr = [];
                var ret = "";
                el.find(":checked").each(function (idx) {
                    arr.push($(this).val());
                });
                if (arr.length == 1)
                    ret = arr[0]
                else if (arr.length > 1)
                    ret = arr
                return ret;
            })(this);
        } else if (this.children('.ui-checkbox').length) {
            return this.find('input[type=checkbox]').prop(attrName)
        } else if (this.children('.ui-radio').length) {
            return this.find('input[type=radio]').prop(attrName)
        } else {
            return this.prop(attrName).trim();
        }
    };

    $.fn.findElement = function (element) {
        var el;
        if (element.prop("tagName") == 'A'
            && (el = element.parent())
            && (el = el.parent())
            && el.attr('data-role') == 'listview') {
            return element.parent();
        } else if (element.prop("tagName") == 'SELECT'
            && element.attr('data-role') == 'flipswitch') {
            return element.parent();
        } else if (element.prop("tagName") == 'INPUT'
            && element.hasClass('ui-slider-input')) {
            return element.parent().parent();
        }
        return element;
    };

    $.fn.setAttr = function (attrName, value) {
        function getParentContainer(element) {
            var result = element;
            var tagName = element.prop("tagName");
            if (tagName == "INPUT" || tagName == "SELECT") {
                result = el.parent().parent();
            } else if (tagName == "TEXTAREA") {
                result = el.parent();
            }
            return result;
        };

        var el, checkedRadio;
        if (attrName == "visible") {
            value = String(value);
            el = $.fn.findElement(this);

            if (el.attr("tiggzitype") != undefined && el.attr("tiggzitype") == "marker") {
                el.attr("rendered", value);
            } else {

                el = getParentContainer(el);
                if (this.attr('data-role') === 'flipswitch') {
                    el = el.parent();
                }
                if (value == "true" || value == "visible") {
                    if (el.css('display') != "none") {
                        /* no need to show, it's already shown */
                    } else {
                        var display = "block";
                        if (el.attr("data-role") == "button"
                            && el.hasClass("ui-btn-inline")) {
                            display = "inline-block";
                        }
                        el.css("display", display);
                    }
                } else if (value == "false" || value == "hidden") {
                    if (el.css('display') == "none") {
                        /* no need to hide, it's already hidden */
                    } else {
                        el.css("display", "none");
                    }
                }

            }

        } else {
            if (this.children('.ui-checkbox').length) {
                el = this.find('input[type=checkbox]:first').attr(attrName, value);
                if (attrName == "checked") el.refresh();
            } else if (this.children('.ui-radio').length) {
                if (attrName == "checked") {
                    if (value == true) {
                        //Deselected radio button
                        checkedRadio = this.closest(".ui-controlgroup-controls").find("input[type='radio']:checked");
                        checkedRadio.removeAttr("checked").refresh();
                    }
                    el = this.find('input[type=radio]:first');
                    el.prop(attrName, value).refresh();
                } else {
                    this.find('input[type=radio]:first').attr(attrName, value);
                }
            } else if (this.attr('data-role') === 'flipswitch' && attrName == 'value') {
                var val;
                var bool = false;
                if (typeof value != "string") bool = Boolean(value)
                else if (["on", "true"].indexOf(value.toLowerCase()) != -1) bool = true;
                val = bool ? "on" : "off";
                this.val(val);
                this.refresh();
            } else if (this.attr('apperytype') === 'marker') {
                this.attr(attrName, value);
            } else if (this.prop && (this.prop('nodeName') === 'TEXTAREA') && (attrName == "value")) {
                this.text(value);
            } else if (this.prop && (this.prop('nodeName') === 'SELECT') && (attrName == "value")) {
                this.val(value).refresh();
            } else if (this[0].tagName == "IFRAME" && this.data("youtube-player-object")) {
                this.attr(attrName, value);
				var	ytObj = this.data("youtube-player-object");
				switch (attrName) {
				case 'videoId':
					if (ytObj.cueVideoById) {
						ytObj.cueVideoById(value);
					} else {
						elem.prop(name, value);
					}
					break;
				}
            } else {
                this.attr(attrName, value);
                if (this.attr("reRender") != undefined) {
                    if ($("[name='" + this.attr("reRender") + "']").size() > 0 &&
                        $("[name='" + this.attr("reRender") + "']").attr("apperyclass") == "carousel") {
                        var dataPropName = false;
                        if (attrName == "data-title") {
                            dataPropName = "title";
                        } else if (attrName == "data-image-url") {
                            dataPropName = "image-url";
                        }
                        if (dataPropName) {
                            this.data(dataPropName, value);
                        }
                    }
                }
            }
        }
        return this;
    };

    $.fn.setText = function (str) {
        if (this.length > 0) {
            if (this.children('.ui-radio').length)
                this.find('.ui-btn').text(str)
            else if (this.children('.ui-checkbox').length)
                this.find('.ui-btn').text(str)
            else if (this.hasClass('ui-collapsible-heading'))
                this.find('.ui-collapsible-heading-toggle').text(str)
            else if (this[0].tagName == "OPTION") {
                this.text(str)
            } else if ($(this.parents().get(2)).is('.ui-navbar')) {
                this.text(str)
            } else {
                this.html(String(str));
            }
        }
        return this;
    };

    $.fn.copyCSS = function (source) {
        var dom = $(source).get(0);
        var style;
        var dest = {};
        if (window.getComputedStyle) {
            var camelize = function (a, b) {
                return b.toUpperCase();
            };
            style = window.getComputedStyle(dom, null);
            for (var i = 0, l = style.length; i < l; i++) {
                var prop = style[i];
                var camel = prop.replace(/\-([a-z])/g, camelize);
                var val = style.getPropertyValue(prop);
                dest[camel] = val;
            }
            return this.css(dest);
        }
        if (style = dom.currentStyle) {
            for (var prop in style) {
                dest[prop] = style[prop];
            }
            return this.css(dest);
        }
        if (style = dom.style) {
            for (var prop in style) {
                if (typeof style[prop] != 'function') {
                    dest[prop] = style[prop];
                }
            }
        }
        return this.css(dest);
    };

}(jQuery));
