// ==UserScript==
// @name         FogBugz Extended
// @namespace    https://www.netsparker.com/
// @version      1.3.0
// @updateURL    https://github.com/aricih/fogbugz-extended/raw/master/fogbugz-extended.user.js
// @description  Make FogBugz great again!
// @author       Hakan Arıcı
// @include      https://msltd.fogbugz.com*
// ==/UserScript==

(function() {
    const ActionButtonTemplate = "<a class='control' id='someid' href='somehref'>Some Label</button>";

    const TransitionElement = "<a class='control'>⟫</a>";

    const CaseStateMap = JSON.parse('{"Bug":{"Active":"1","Waiting For Another":"37","Developing":"47","In Code Review":"48","QA Testing":"49","Sec Testing":"50","Tests Completed":"53"},"Task-Test":{"Active":"34","Waiting For Another":"38","Developing":"54","In Code Review":"55","QA Testing":"58","Sec Testing":"60","Tests Completed":"62"},"Feature":{"Active":"17","Waiting For Another":"41","Developing":"56","In Code Review":"57","QA Testing":"59","Sec Testing":"61","Tests Completed":"63"},"Schedule Item":{"Active":"23"},"Message":{"Active":"20"}}');

    const DarkTheme = 'body,html{background:#101010!important;color:#c5c5c5}nav.clear{background:#202019!important}.twofa-barcode{background:#101010!important;color:#c5c5c5}#filter-bar-title,.context-menu-action,.list-choices-header,.status,.view-name,h1,list-add-case{color:#fff!important}.action-button,.grid-column-Priority,.grid-column-RemainingTime,.grid-column-Status,.timesheet-popup th,.timesheet-popup time{color:#000!important}.action,.bodycontent,.case-popup>div.comment,.case-popup>dl,.case-popup>h2,.edit-timesheet,.list-choices-expander,.specify-case,header h1{color:#0b45d9!important}.action-button.disabled{color:#aaa!important}.gw-nav-entry-feedback{display:none}.biglist{width:100%!important;border:1px #c5c5c5 solid;margin-top:5px;margin-bottom:20px}.biglist .row,.close-button{border:1px #c5c5c5 solid}#filter-bar,.action-bar,.biglist,.bug-grid,.case .case-category:not(.icon-wrench),.case .status,.filterbar-refine-further-popup .droplist,.filterbar-refine-further-popup .list-choices-section,.filterbar-view-popup svg,.gw-header-main,.gw-nav-mobile,.gw-nav-pane,.gw-nav-submenus,.list-group-footer,.menu-small-blue,.mini-report,.person-page,.popup,.userPrefs .main,nav.clear,section.case{-webkit-filter:invert(1);-moz-filter:invert(1);filter:invert(1)}.biglist img,.bug-grid svg,.case .clear,.case .controls,.case-add-category-popup svg,.case-popup svg,.gw-nav-entry-time .gw-nav-link-icon .active,.gw-nav-entry-time .gw-nav-link-label.active,.gw-nav-mobile img,.gw-nav-pane img,.gw-nav-submenus svg,.list-group-footer svg,.person-page h1,.person-page img,.person-page svg,.priority,.userPrefs .main img,section.case img{-webkit-filter:invert(1)!important;-moz-filter:invert(1)!important;filter:invert(1)!important}.donotinvert,.popup .context-menu-popup,a[title="Click to view selected case"]{-webkit-filter:invert(1)!important;-moz-filter:invert(1)!important;filter:invert(1)!important}.case .left{width:15%;min-width:15%}.case .events{width:85%;min-width:85%}.case{width:90%;max-width:none}.event{border:1px #d3d3d3 solid;padding:10px}.event header .summary{padding-bottom:3px;border-bottom:1px #d3d3d3 solid}.event.email .event-content.event-email-incoming:before,.event.email .event-content.event-email-outgoing:before{background-image:none}.event.email .event-content{margin-left:0;width:100%;background:#ededf1}.event header .summary{padding-bottom:5px}.event header .changes{margin-left:0;margin-top:5px}.event .timestamp{margin:4px 0 0 0}.event .body:before{border-width:0;left:0}.event .body{margin-left:0;border-radius:4px;border-top-left-radius:inherit;width:100%}';

    const ToggleSwitchStyle = '.switch{position:relative;display:inline-block;width:30px;height:17px}.switch input{opacity:0;width:0;height:0}.slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;-webkit-transition:.4s;transition:.4s}.slider:before{position:absolute;content:"";height:13px;width:13px;left:2px;bottom:2px;background-color:#fff;-webkit-transition:.4s;transition:.4s}input:checked+.slider{background-color:#2196f3}input:focus+.slider{box-shadow:0 0 1px #2196f3}input:checked+.slider:before{-webkit-transform:translateX(13px);-ms-transform:translateX(13px);transform:translateX(13px)}.slider.round{border-radius:17px}.slider.round:before{border-radius:50%}';

    const CustomStyles = [ ToggleSwitchStyle ];

    /*
    Requires FB Admin privileges.
    In case of FB case status list update, run below method in https://msltd.fogbugz.com/f/page?P11_pg=pgStatuses&ixPlugin=11&pg=pgPlugin
    Then update CaseStateMap with the produced map.
    var createCaseMap = function() {
        var caseMap = {};
        $(".accordionContainer").each(function(i, o) {
            var caseTypeGroup = $(o);
            var caseType = caseTypeGroup.find(".accordion").text();
            caseMap[caseType] = {};
            caseTypeGroup.find("h4:contains('Active')").siblings("div").first().find(".cell-left").each(function(si, status) {
                var statusElem = $(status);
                var caseStatus = statusElem.text().trim();
                var caseStatusId = statusElem.find("a").attr("href").split("_ixStatus=")[1];
                caseMap[caseType][caseStatus] = caseStatusId;
            });
        });
        return JSON.stringify(caseMap);
    };
    */

    var createDomElementOnce = function(parentElem, elem, elemId, withPadding) {
        var existingElem = parentElem.find("#"+elemId);

        if(existingElem.length > 0) {
            return $(existingElem[0]);
        }

        if(!elem.html) {
            elem = $(elem);
        }

        elem.attr("id", elemId);

        if(withPadding) {
            elem.attr("style", "padding: 2px 4px 0px 4px !important; margin-left: 2px !important; margin-right: 2px !important;");
        }
        else {
            elem.attr("style", "margin-left: 2px !important; margin-right: 2px !important;");
        }
        parentElem.prepend(elem);

        return elem;
    };

    var mapCaseStateToDescription = function(caseState) {
        for(var caseType in CaseStateMap) {
            for(var caseStateName in CaseStateMap[caseType]){
                if(CaseStateMap[caseType][caseStateName] === caseState) {
                    return caseStateName;
                }
            }
        }
    };

    var createHistory = function(caseState) {
        const seperator = ", ";
        var history = "";

        var selector = (caseState && caseState.contains("Completed"))
        ? "div.changes:contains(to '" + mapCaseStateToDescription(caseState) + "')"
        : "div.changes:contains(from '" + mapCaseStateToDescription(caseState) + "')";

        $(selector)
            .parent()
            .find(".summary")
            .each(function(i,o) {
            var person = $(o).find('.person').first().text();

            if(history.indexOf(person) < 0) {
                if(history.length > 0) {
                    history += seperator;
                }
                history += person;
            }
        });

        return history;
    };

    var buildActionHref = function(caseNumber, caseState) {
        return "https://msltd.fogbugz.com/f/cases/edit/" + caseNumber + "/?ixStatus=" + caseState;
    };

    var createActionButton = function(label, buttonId, parentElem, caseNumber, caseState) {
        var actionButton = createDomElementOnce(parentElem, ActionButtonTemplate, buttonId, true);

        if(actionButton.prop("initialized")) {
            return;
        }

        actionButton.html(label);

        if($('.status').html() === label) {
            actionButton
                .css("font-weight","Bold")
                .css("border", "2px solid")
                .css("border-radius", "4px")
                .removeAttr("href");
        }
        else{
            actionButton.attr("href", buildActionHref(caseNumber, caseState));
        }

        var history = createHistory(caseState);

        if(history.length > 0) {
            actionButton.attr("title", history);
            actionButton.html(label + " <span class='donotinvert' style='font-weight:bold; color:#65cc8b !important;'>✓</b>");
        }

        actionButton.prop("initialized", true);

        return actionButton;
    }

    var createActionButtons = function() {
        var parentElem = $(".controls");
        var caseNumber = $("#case-link").find(".case").html();

        if(isNaN(caseNumber)) {
            return;
        }

        if(parentElem.find("#divider").length == 0) {
            parentElem.prepend("<hr id='divider' style='margin-left: 8px !important;'/>");
        }

        var caseCategory = $(".case * .case-category").attr("title");

        if(!caseCategory) {
            return;
        }

        var lastSeperatorCreated = 0;
        var stack = [];
        for(var caseStatus in CaseStateMap[caseCategory]) {
            stack.push(caseStatus);
        }

        var nextStatus = stack.pop();

        while(nextStatus) {
            var buttonId = nextStatus.replace(new RegExp(" ", 'g'), "-").toLowerCase();

            if(nextStatus.contains("Waiting")) {
                nextStatus = stack.pop();
                continue;
            }

            createActionButton(nextStatus, buttonId, parentElem, caseNumber, CaseStateMap[caseCategory][nextStatus]);

            nextStatus = stack.pop();

            if(nextStatus) {
                createDomElementOnce(parentElem, TransitionElement, buttonId+"-transition");
            }
        }
    };

    var createThemeSwitch = function() {
        $("li:contains(Time Tracking)")
        .append('<li class="gw-nav-link">Sucky <label class="switch donotinvert"><input id="themeswitch" type="checkbox"><span class="slider round"></span></label> Cool</li>');

        if(localStorage.getItem("theme") == "dark"){
            $("#themeswitch").attr("checked", "");
        }

        $("#themeswitch").click(function() {
            if(localStorage.getItem("theme") == "dark") {
                localStorage.setItem("theme", "light");
                window.location.reload();
            }
            else {
                injectStyle(DarkTheme);
                localStorage.setItem("theme", "dark");
            }
        });
    };

    var injectStyle = function(css, id) {
        $('head').append("<style id=" + id + ">" + css + "</style>");
    };

    var injectCustomStyles = function() {
        for(var i in CustomStyles) {
            injectStyle(CustomStyles[i], "custom-style-"+i);
        }

        if(localStorage.getItem("theme") == "dark") {
            injectStyle(DarkTheme, "theme");
        }
    };

    var initialize = function() {
        var status = $('.status').html();

        if(!status || status.startsWith("Resolved") || status.startsWith("Closed")) {
            return;
        }

        createActionButtons();
    };

    $(document).ready(function() {
        injectCustomStyles();
        createThemeSwitch();
        initialize();
    });

    var observeDOM = (function(){
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        return function( obj, callback ){
            if(!obj || !obj.nodeType === 1 ) return;

            if( MutationObserver ){
                var obs = new MutationObserver(function(mutations, observer){
                    callback(mutations);
                });
                obs.observe( obj, { childList:true, subtree:true });
            }
            else if( window.addEventListener ){
                obj.addEventListener('DOMNodeInserted', callback, false);
                obj.addEventListener('DOMNodeRemoved', callback, false);
            }
        }
    })();

    observeDOM(document, function(mutation) {
        // TODO: Analyze mutation to avoid the second intialize() call.
        initialize();
    });
})();
