// ==UserScript==
// @name         FogBugz Extended
// @namespace    https://www.netsparker.com/
// @version      1.2.0
// @updateURL    https://github.com/aricih/fogbugz-extended/raw/master/fogbugz-extended.user.js
// @description  Make FogBugz great again!
// @author       Hakan Arıcı
// @include      https://msltd.fogbugz.com*
// ==/UserScript==

(function() {
    const ActionButtonTemplate = "<a class='control' id='someid' href='somehref'>Some Label</button>";

    const TransitionElement = "<a class='control'>⟫</a>";

    const CaseStateMap = JSON.parse('{"Bug":{"Active":"1","Waiting For Another":"37","Developing":"47","In Code Review":"48","QA Testing":"49","Sec Testing":"50","Tests Completed":"53"},"Task-Test":{"Active":"34","Waiting For Another":"38","Developing":"54","In Code Review":"55","QA Testing":"58","Sec Testing":"60","Tests Completed":"62"},"Feature":{"Active":"17","Waiting For Another":"41","Developing":"56","In Code Review":"57","QA Testing":"59","Sec Testing":"61","Tests Completed":"63"},"Schedule Item":{"Active":"23"},"Message":{"Active":"20"}}');

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

        $("div.changes:contains(to '" + mapCaseStateToDescription(caseState) + "')")
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
                .removeAttr("href");
        }
        else{
            actionButton.attr("href", buildActionHref(caseNumber, caseState));
        }

        var history = createHistory(caseState);

        if(history.length > 0) {
            actionButton.attr("title", history);
            actionButton.html(label + " <span style='font-weight:bold; color:green !important;'>✓</b>");
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

    var initialize = function() {
        var status = $('.status').html();

        if(!status || status.startsWith("Resolved") || status.startsWith("Closed")) {
            return;
        }

        createActionButtons();
    };

    $(document).ready(initialize);

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
