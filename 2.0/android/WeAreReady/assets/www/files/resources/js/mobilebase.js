String.prototype.trim = String.prototype.trim || function () {
    if (!this) return this;
    return this.replace(/^\s+|\s+$/g, "");
};

function showSpinner(directOptions) {
    var loaderOptions;
    if (directOptions != undefined && $.type(directOptions) === "object") {
        loaderOptions = directOptions;
    } else {
        if (Appery.loaderOptions != undefined && $.type(Appery.loaderOptions) === "object") {
            loaderOptions = Appery.loaderOptions;
        }
    }
    if (loaderOptions != undefined) {
        $.mobile.loading('show', loaderOptions);
    } else {
        $.mobile.loading('show');
    }
}

function hideSpinner() {
    $.mobile.loading('hide');
}

function resetActivePageContentHeight() {
    var aPage, aPageContent, aPageHeader, aPageFooter, resultHeight;

    aPage = $("." + $.mobile.activePageClass);

    // It's OK with dialogue, we don't need extra sizing
    if (aPage.is("[data-dialog='true']")) return;

    aPageContent = aPage.find(".ui-content:eq(0)");
    if (aPage.hasClass("detail-content")) {
        // If it's a detail content page, we must consider height of master page header and footer
        aPageHeader = aPage.closest(".ui-page:not(.detail-content)").find(".ui-header:visible:eq(0)");
        aPageFooter = aPage.closest(".ui-page:not(.detail-content)").find(".ui-footer:visible:eq(0)");
    } else {
        aPageHeader = aPage.find(".ui-header:visible:eq(0)");
        aPageFooter = aPage.find(".ui-footer:visible:eq(0)");
    }
    resultHeight = $.mobile.getScreenHeight();

    // Considering page paddings and borders
    resultHeight -= parseFloat(aPage.css("padding-top"));
    resultHeight -= parseFloat(aPage.css("padding-bottom"));
    resultHeight -= parseFloat(aPage.css("border-top-width"));
    resultHeight -= parseFloat(aPage.css("border-bottom-width"));

    // Considering page content paddings and borders
    resultHeight -= parseFloat(aPageContent.css("padding-top"));
    resultHeight -= parseFloat(aPageContent.css("padding-bottom"));
    resultHeight -= parseFloat(aPageContent.css("border-top-width"));
    resultHeight -= parseFloat(aPageContent.css("border-bottom-width"));

    // Considering inline page header height, paddings and borders
    if (!aPageHeader.is(".ui-header-fixed")) {
        resultHeight -= parseFloat(aPageHeader.height());
        resultHeight -= parseFloat(aPageHeader.css("padding-top"));
        resultHeight -= parseFloat(aPageHeader.css("padding-bottom"));
        resultHeight -= parseFloat(aPageHeader.css("border-top-width"));
        resultHeight -= parseFloat(aPageHeader.css("border-bottom-width"));
    }

    // Considering inline page footer height, paddings and borders
    if (!aPageFooter.is(".ui-footer-fixed")) {
        resultHeight -= parseFloat(aPageFooter.height());
        resultHeight -= parseFloat(aPageFooter.css("padding-top"));
        resultHeight -= parseFloat(aPageFooter.css("padding-bottom"));
        resultHeight -= parseFloat(aPageFooter.css("border-top-width"));
        resultHeight -= parseFloat(aPageFooter.css("border-bottom-width"));
    }

    aPageContent.css("min-height", resultHeight);
}

$.mobile.document.bind("pagecontainershow", resetActivePageContentHeight);
$.mobile.window.bind("throttledresize", resetActivePageContentHeight);

// Replacing native jQuery show/hide logic to handle mobileinput
(function () {

    var nativeHide = jQuery.fn.hide;
    jQuery.fn.hide = function () {
        if (this.prop('tagName') == 'INPUT' && this.parent(".ui-input-text").length > 0) {
            return nativeHide.apply(this.parent(".ui-input-text").parent(), arguments);
        } else if (this.prop('tagName') == 'A' && this.attr('data-role') == "button") {
            this.css("display", "none");
        } else if (this.prop('tagName') == 'DIV' && this.attr('data-role') == "navbar") {
			if (this.css("display") == "none") {
				return this;
			}
			var nbp = this.parent()
			if (nbp.prop('tagName') == 'DIV' && nbp.attr('data-role') == "header") {
				nbp = nbp.parent();
				var nbh = this.height();
				if (nbp.attr('data-role') == "page") {
					var nbpt = parseInt(nbp.css("padding-top")) - nbh;;
					nbp.css("padding-top", nbpt + "px");
				}
			}
			return nativeHide.apply(this, arguments);
        } else {
            return nativeHide.apply(this, arguments);
        }
    };

    var nativeShow = jQuery.fn.show;
    jQuery.fn.show = function () {
        if (this.prop('tagName') == 'INPUT' && this.parent(".ui-input-text").length > 0) {
            return nativeShow.apply(this.parent(".ui-input-text").parent(), arguments);
        } else if (this.prop('tagName') == 'A' && this.attr('data-role') == "button") {
            if (this.hasClass("ui-btn-left") || this.hasClass("ui-btn-right") || this.hasClass("ui-btn-inline")) {
                this.css("display", "inline-block");
            } else {
                this.css("display", "block");
            }

        } else if (this.prop('tagName') == 'DIV' && this.attr('data-role') == "navbar") {
			if (this.css("display") != "none") {
				return this;
			}
			var result = nativeShow.apply(this, arguments);
			var nbp = this.parent()
			if (nbp.prop('tagName') == 'DIV' && nbp.attr('data-role') == "header") {
				nbp = nbp.parent();
				var nbh = this.height();
				if (nbp.attr('data-role') == "page") {
					var nbpt = parseInt(nbp.css("padding-top")) + nbh;;
					nbp.css("padding-top", nbpt + "px");
				}
			}
			return result;
        } else {
            return nativeShow.apply(this, arguments);
        }
    };

})();
