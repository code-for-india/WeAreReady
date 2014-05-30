var __GLOBAL_INNERHTML_TAGS = ['a', 'div', 'td', 'th', 'li'];
var __GLOBAL_CHECKED_TAGS = ['checkbox', 'radio'];
var __GLOBAL_TEXT_PROPERTIES = ['value', 'text'];
var __GLOBAL_ATTRIBUTES = ['style', 'onclick', 'ondblclick', 'onmouseout', 'onblur', 'onchange', 'onkeydown',
    'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseover', 'onmouseup'];
var ___JQM_MOBILE_LIST_BUILT_INS = ['src', 'text'];
var __JQM_DATA_ATTRIBUTES = ['data-title', 'data-image-url'];

function str2Bool(string) {
    if ((typeof string) == "string") {
        switch (string.toLowerCase()) {
            case "true":
            case "checked":
            case "yes":
            case "1":
                return true;
            case "false":
            case "no":
            case "0":
            case null:
                return false;
            default:
                return Boolean(false);
        }
    } else {
        return string;
    }
}

function toggle(id, src, value, subselector) {
    var elem;
    var tag;
    if (src != "html") {
        elem = $(document).find('[id="' + id + '"]');
        if (elem) {
            if (elem.attr("apperytype") == "marker") {
                // Hide marker on the map
                elem.attr("rendered", value);
                if (elem.find("[reRender]").size() == 1) {
                    parentMap = Appery(elem.find("[reRender]").attr("reRender"));
                    if (parentMap != undefined && parentMap.refresh != undefined) {
                        parentMap.refresh();
                    }
                }
                return;
            }
            if (subselector != undefined) {
                elem = elem.find(subselector);
                if (elem.size() == 0) return;

            }
            switch (elem.prop("tagName")) {
                case "INPUT":
                    if (elem.attr("type") == "radio" || elem.attr("type") == "checkbox") {
                        elem = elem.parent().parent();
                    } else {
                        elem = elem.closest("div[data-role='fieldcontain']");
                    }
                    break;
                case "SELECT":
                case "TEXTAREA":
                    elem = elem.closest(".ui-field-contain");
                    break;
                case "A":
                    if (elem.hasClass('ui-link-inherit') || elem.hasClass('ui-icon-carat-r')) {
                        elem = elem.closest('li');
                    }
                    break;
            }
        }
    } else {
        elem = $(document).find('[id="' + id + '_comp"]');
        if (elem.size() == 0) {
            elem = $(document).find('[id="' + id + '"]');
            tag = elem.prop("tagName").toLowerCase();
            if (tag == "div" && elem.prop("class").indexOf("tabpanel") != -1
                && elem.prop("class").indexOf("tabs-top") == -1) {
                var elem_title = elem.parent().find('[href=#' + id + ']');
                if (value == undefined || "" == value) {
                    elem_title.toggle();
                } else {
                    elem_title.toggle(str2Bool(value));
                }
                if (elem.css('display') == 'block' && !str2Bool(value)) {
                    if (elem.prop("class").indexOf("ui-tabs-hide") == -1) {
                        var elem_tab_panel = elem.parent();
                        var sel_idx = elem_tab_panel.tabs("option", "selected");
                        sel_idx++;
                        sel_idx = (sel_idx == elem_tab_panel.tabs("length")) ? 0 : sel_idx;
                        elem_tab_panel.tabs("select", sel_idx);
                    }
                }
            }
        }
    }

    if (!elem) return;

    if (value == undefined || "" == value) {
        elem.toggle();
    } else {
        if (elem.is("a") && elem.attr("data-role") == "button") {
            // mobilebutton
            if (elem.hasClass("ui-btn-inline")) {
                elem.css("display", str2Bool(value) ? "inline-block" : "none");
            } else {
                elem.css("display", str2Bool(value) ? "block" : "none");
            }
        } else if (elem.is("iframe")) {
			elem.css("display", str2Bool(value) ? "block" : "none");
		} else {
            // default
            elem.toggle(str2Bool(value));
        }
    }
}

function setText(id, text, src) {
    var elem = $("#" + id);
    if (!elem.length) {
        return;
    }
    var attr = "value";
    var tag = elem.prop("tagName").toLowerCase();
    if (jQuery.inArray(tag, __GLOBAL_INNERHTML_TAGS) > -1) {
        attr = "innerHTML";
    } else if (tag == "img") {
        attr = "src";
    } else if (tag == "input" && jQuery.inArray(elem.prop("type").toLowerCase(), __GLOBAL_CHECKED_TAGS) > -1) {
        attr = "innerHTML";
        elem = $("#" + id + "_label");
    }
    if ($("#" + id + " .ui-btn-text:first").length) {
        $("#" + id + " .ui-btn-text:first").text(text);
    } else if ($("#" + id + " .ui-collapsible-heading-toggle:first").length) {
        $("#" + id + " .ui-collapsible-heading-toggle:first").text(text);
	} else if (tag == "a" && elem.parent().prop("tagName").toLowerCase() == "li"
			&& elem.parent().parent().attr("data-role") == 'listview') {
		elem = elem.find("h3").prop(attr, text);
    } else {
        elem.prop(attr, text);
    }
}


function getText(id, src, context) {
    var elem = $(document).find('[id=' + id + ']');
    if (elem.size() == 0) return;
    if ((elem[0].getAttribute('_tmpl')
			|| elem[elem.length - 1].getAttribute('_tmpl'))
			&& context) {
        var ctx = $(context);
        var el_name = elem.attr('name');
        elem = ctx.closest('[dsrefid]').find('[name="' + el_name + '"]').filter('[_tmpl!="true"]').eq(0);

        /* ETST-7540 */
        try {
            if (ctx.is("a") && ctx.parent().parent().parent().is("li") &&
                ctx.parent().parent().parent().hasClass("ui-li-static") == false &&
                jQuery.inArray(property.toLowerCase(), ___JQM_MOBILE_LIST_BUILT_INS) > -1) {
                elem = ctx;
            }
        } catch (e) {
        }

        while (elem.size() == 0) {
            ctx = ctx.parent().closest('[dsrefid]').eq(0);
            if (ctx.size() == 0) return;
            elem = ctx.find('[name="' + el_name + '"]').filter('[_tmpl!="true"]').eq(0);
        }
    }
    var attr = "value";
    var tag = elem.prop("tagName").toLowerCase();
    if (jQuery.inArray(tag, __GLOBAL_INNERHTML_TAGS) > -1) {
        attr = "innerHTML";
        if (tag == "div" && elem.prop("class").indexOf("titledpanel") != -1) {
            elem = $('[id=' + id + '_title]');
        } else if (tag == "div" && elem.prop("class").indexOf("ui-tabs-panel") != -1) {
            elem = elem.parent().find('[href=#' + id + ']');
        } else if (tag == "a" && elem.parent().prop("tagName").toLowerCase() == "li"
				&& elem.parent().parent().attr("data-role") == 'listview') {
            elem = elem.find("h3");
        }
    } else if (tag == "img") {
        attr = "src";
    } else if (tag == "input" && jQuery.inArray(elem.prop('type').toLowerCase(), __GLOBAL_CHECKED_TAGS) > -1) {
        if (src == "html") {
            elem = $('[id=' + id + '_label]');
        } else {
            elem = $('[id=' + id + '_label] .ui-btn-text');
        }
        attr = "innerHTML";
    }

    if (elem.attr('data-role') == "collapsible") {
        return $('[id=' + id + '] .ui-btn-text:first').text();
    } else if ($('[id=' + id + '] .ui-btn-text').size() > 0) {
        return $('[id=' + id + '] .ui-btn-text').text();
    } else {
		if(attr == "innerHTML"){			
			return $('<div />').html(elem.prop(attr)).text();
		}else{
			return elem.prop(attr);
		}
    }
}

function setEnabled(id, text) {
    var elem = $(document).find('[id=' + id + ']');
    if (elem.size() == 0) return;
    var attr = "disabled";
    var tag = elem.prop("tagName").toLowerCase();
    $(elem).find('[id]').each(function () {
        __setEnabled__($(this), text);
    });
    __setEnabled__(elem, text);
    if (tag == "input" && jQuery.inArray(elem.prop('type').toLowerCase(), __GLOBAL_CHECKED_TAGS) > -1) {
        __setEnabled__($(document).find('[id=' + id + '_label]'), text);
    }
}

function __setEnabled__(elem, text) {
    if (elem.size() == 0) return;
    var attr = "disabled";
    var tag = elem.prop("tagName").toLowerCase();
    text = str2Bool(text) ? "" : "disabled";
    elem.prop(attr, text);
    if (text == "disabled") {
        elem.addClass("disabled-cntrl");
    } else {
        elem.removeClass("disabled-cntrl");
    }
    if (((tag == "input" && elem.prop('type').toLowerCase() == "text") || (tag == "div"))
        && elem.prop('class').toLowerCase().indexOf("hasdatepick") != -1) {
        if (text == "disabled") {
            elem.datepick('disable');
        } else {
            elem.datepick('enable');
        }
    }
}

function setChecked(id, text) {
    var elem = $(document).find('[id=' + id + ']');
    if (elem.size() == 0) return;
    var attr = "checked";
    var tag = elem.prop("tagName").toLowerCase();
    if (tag == "input" && jQuery.inArray(elem.prop('type').toLowerCase(), __GLOBAL_CHECKED_TAGS) > -1) {
        text = str2Bool(text) ? "checked" : "";
    }
    elem.prop(attr, text);
}

function setVar_(key, id, property, src, context) {
    var elem = $(document).find('[id="' + id + '"]');
    if (elem.size() == 0) return;
    if (elem[0].getAttribute('_tmpl')
			|| elem[elem.length - 1].getAttribute('_tmpl')) {
        var ctx = $(context);
        var el_name = elem.attr('name');
        elem = ctx.closest('[dsrefid]').find('[name="' + el_name + '"]').filter('[_tmpl!="true"]').eq(0);

        /* ETST-7540 */
        try {
            if (ctx.is("a") && ctx.parent().is("li") &&
                ctx.parent().hasClass("ui-li-static") == false &&
                jQuery.inArray(property.toLowerCase(), ___JQM_MOBILE_LIST_BUILT_INS) > -1) {
                elem = ctx;
            }
        } catch (e) {
        }

        while (elem.size() == 0) {
            ctx = ctx.parent().closest('[dsrefid]').eq(0);
            if (ctx.size() == 0) return;
            elem = ctx.find('[name="' + el_name + '"]').filter('[_tmpl!="true"]').eq(0);
        }
    }

    var attr = property;

    if (elem.attr('apperytype') == 'object') {
        localStorage.setItem(key, Appery(elem.attr('dsid')).attr(attr));
        return;
    }

    var tag = elem.prop("tagName").toLowerCase();

    if (attr == 'text') {
        var text = getText(elem[0].id, src, context).trim();
        localStorage.setItem(key, text);
    } else {
        if (jQuery.inArray(attr.toLowerCase(), __GLOBAL_TEXT_PROPERTIES) > -1) {
            attr = "value";
            if (jQuery.inArray(tag, __GLOBAL_INNERHTML_TAGS) > -1) {
                attr = "innerHTML";
            } else if (tag == "img") {
                attr = "src";
            }
        }

        if (tag == "input" && jQuery.inArray(elem.prop('type').toLowerCase(), __GLOBAL_CHECKED_TAGS) > -1 &&
            (attr == "selected" || attr == "checkboxSelected")) {
            attr = "checked";
        }

        var value;

        if (property == 'visible') {
            value = elem.css('display') == 'none' ? 'false' : 'true';
        } else if (property == 'enable') {
            value = elem.hasClass('ui-state-disabled') ? 'false' : 'true';
        } else if (property == 'src' && tag == "a" &&
            elem.parent().is("li") &&
            elem.parent().parent().attr("data-role") == 'listview') {
            value = elem.find(".ui-li-thumb").prop(property);
        } else {
            value = elem.prop(attr);
        }

        localStorage.setItem(key, value);
    }
}

function closePopup() {
    $.mobile.back();
}

function format(str) {
    for (i = 1; i < arguments.length; i++) {
        str = str.replace("{" + (i - 1) + "}", arguments[i]);
    }
    return str;
}

(function ($) {
    $.fn.getType = function () {
        try {
            if (this.prop('type')) {
                switch ($(this).prop('type')) {
                    case 'radio':
                    case 'checkbox':
                        return "checkboxradio"
                    case 'button':
                        return "button"
                    default:
                }
            }
            if ($(this).attr('data-type')) {
                switch (this.attr('data-type')) {
                    case 'range':
                        return "slider"
                    default:
                }

            }
            if (this.attr('data-role')) {
                switch ($(this).attr('data-role')) {
                    case 'flipswitch':
                        return    "flipswitch"
                    default:
                }

            }
            if ($(this).prop("tagName") == "SELECT") {
                return "selectmenu"
            }
            return null
        } catch (e) {
            return null
        }
    };
})(jQuery);


(function ($) {
    $.fn.setEnabled = function (value) {
        if (value != "") {
            var method = str2Bool(value) ? "enable" : "disable";
            var text = str2Bool(value) ? "" : "disabled";
            var s = "$(this).{0}('" + method + "');"
            this.each(function () {
                var type;
                try {
                    type = $(this).getType();
                    if (type != null) {
                        eval(format(s, type));
                    }
                    else if ($(this).prop('tagName') == 'DIV' || $(this).prop('tagName') == 'OL') {
                        if ($(this).attr('data-role') == "collapsible" || $(this).attr('data-role') == "appery_label") {
                            if (text == "disabled") {
                                $(this).addClass('ui-state-disabled');
                                this.onclick = function (event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    return false;
                                }
                            } else {
                                $(this).removeClass('ui-state-disabled');
                                this.onclick = null;
                            }

                        }
                        $(this).find("[id]").setEnabled(value);

                    }
                    else {
                        if (text == "disabled") {
                            $(this).addClass('ui-state-disabled');
                            if ($(this).closest('li')) {
                                $(this).closest('li').addClass('ui-state-disabled');
                            }
                        } else {
                            $(this).removeClass('ui-state-disabled');
                            if ($(this).closest('li')) {
                                $(this).closest('li').removeClass('ui-state-disabled');
                            }
                        }
                        $(this).prop("disabled", text);
                    }

                } catch (e) {

                }
            });
        }
    };
})(jQuery);

(function ($) {
    $.fn.refresh = function (action) {
        if (action == null)
            action = "refresh";
        return this.each(function () {
            var s = "$(this).{0}('refresh');"
            var type;
            try {
                switch (action) {
                    case "refresh":
                        type = $(this).getType();
                        if (type != null) {
                            eval(format(s, type));
                        }
                        break
                    case "checkedRefresh":
                        $(this).click();
                        break
                    default:
                }
            } catch (e) {

            }
        });
    };
})(jQuery);

function setAttribute_(id, name, val) {
    var elem = $(document).find('[id="' + id + '"]');
    if (elem.size() == 0) return;

    if (elem.attr("apperytype") == "object") {
        if (elem.attr("name") != undefined && Appery != undefined) {
            Appery(elem.attr("name")).attr(name, val);
            if (Appery(elem.attr("name")).refresh != undefined) {
                Appery(elem.attr("name")).refresh();
            }
        }
    } else if (elem.attr("apperytype") == "marker") {
        elem.attr(name, val);
        if (Appery(elem.attr("reRender")) != undefined && Appery(elem.attr("reRender")).refresh != undefined) {
            Appery(elem.attr("reRender")).refresh();
        }
    } else if (elem.data('role') == 'flipswitch' && name == 'toggled') {
        // Slider component "toggled" property must be processed through "value" property
        elem.val(val == "true" ? "on" : "off");
    } else if (elem[0].tagName == "OPTION" && name == "label") {
        elem.text(val).parent().refresh();
        if (Appery(elem.attr("reRender")) != undefined && Appery(elem.attr("reRender")).refresh != undefined) {
            Appery(elem.attr("reRender")).refresh();
        }
    } else {
        if (jQuery.inArray(name, __GLOBAL_ATTRIBUTES) > -1 || jQuery.inArray(name, __JQM_DATA_ATTRIBUTES) > -1) {
            elem.attr(name, val);
            if (Appery(elem.attr("reRender")) != undefined && Appery(elem.attr("reRender")).refresh != undefined) {
                Appery(elem.attr("reRender")).refresh();
            }
        } else {
            if (elem[0].tagName == "A" && name == "src" && elem.find("img:first")) {
                elem.find("img:first").prop(name, val);
            } else if (name == "checked" && elem.prop("tagName") == "INPUT" && (elem.prop("type") == "radio" || elem.prop("type") == "checkbox")) {
                elem.parent().parent().setAttr(name, str2Bool(val));
            } else if (name == "selectedOption" && elem.data("role") == "fieldcontain") {
                elem.find(".ui-controlgroup-controls > span").eq(val).setAttr("checked", true);
            } else if (elem[0].tagName == "IFRAME" && $(document).find('[id="' + id + '"]').data("youtube-player-object")) {
				var elem = $(document).find('[id="' + id + '"]'),
					ytObj = elem.data("youtube-player-object");
				switch (name) {
				case 'videoId':
					if (ytObj.cueVideoById) {
						ytObj.cueVideoById(val);
					} else {
						elem.prop(name, val);
					}
					break;
				default:
					elem.prop(name, val);
				}
            } else {
                elem.prop(name, val);
            }
        }
    }
}

function setAttribute(id, attr, key) {
    $(document).find('[id="' + id + '"]').attr(attr, getVariable(key));
}

function setCssProperty(id, attr, key) {
    $(document).find('[id="' + id + '"]').css(attr, getVariable(key));
}
