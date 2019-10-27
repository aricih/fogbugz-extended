// ==UserScript==
// @name         FogBugz Extended
// @namespace    https://www.netsparker.com/
// @version      1.5.0
// @updateURL    https://github.com/aricih/fogbugz-extended/raw/master/fogbugz-extended.user.js
// @description  Make FogBugz great again!
// @author       Hakan Arıcı
// @include      https://msltd.fogbugz.com*
// ==/UserScript==

(function() {

    // Abstract Extension class
    class Extension {
        // Inheritors should define their members in __initializeFields method instead of ctor as it'll throw due to early 'this' reference.
        constructor() {
            this.__initializeFields();
            this.initialize();
        }

        // Non-abstract inheritors should hide this method
        __initializeFields() {
            throw new TypeError('Abstract class "Extension" cannot be instantiated directly. "__initializeFields" method should be overwritten.');
        }

        // Non-abstract inheritors should hide this method
        initialize() {
            throw new TypeError('Abstract class "Extension" cannot be instantiated directly. "initialize" method should be overwritten.');
        }
    }

    // Abstract DomExtension class
    class DomExtension extends Extension {
        createDomElementOnce(parentElem, elem, elemId, withPadding, shouldAppend) {
            var existingElem = parentElem.find("#"+elemId);

            if(existingElem.length > 0) {
                return $(existingElem[0]);
            }

            if(!elem.html) {
                elem = $(elem);
            }

            elem.attr("id", elemId);

            if(withPadding) {
                elem.attr("style", elem.attr("style") + ";padding: 2px 4px 0px 4px !important; margin-left: 2px !important; margin-right: 2px !important;");
            }
            else {
                elem.attr("style", elem.attr("style") + ";margin-left: 2px !important; margin-right: 2px !important;");
            }

            if(shouldAppend) {
                parentElem.append(elem);
            }
            else {
                parentElem.prepend(elem);
            }
            return elem;
        };
    }

    class StyleExtension extends Extension {
        __initializeFields() {
            // Define new styles here
            this.ToggleSwitchStyle = '.switch{position:relative;display:inline-block;width:30px;height:17px}.switch input{opacity:0;width:0;height:0}.slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;-webkit-transition:.4s;transition:.4s}.slider:before{position:absolute;content:"";height:13px;width:13px;left:2px;bottom:2px;background-color:#fff;-webkit-transition:.4s;transition:.4s}input:checked+.slider{background-color:#2196f3}input:focus+.slider{box-shadow:0 0 1px #2196f3}input:checked+.slider:before{-webkit-transform:translateX(13px);-ms-transform:translateX(13px);transform:translateX(13px)}.slider.round{border-radius:17px}.slider.round:before{border-radius:50%}';
        }

        _injectStyle(css, id) {
            $('head').append("<style id=" + id + ">" + css + "</style>");
        }

        _injectCustomStyles() {
            for(var i in this.CustomStyles) {
                this._injectStyle(this.CustomStyles[i], "custom-style-"+i);
            }
        }

        initialize() {
            // Register new custom styles here
            this.CustomStyles = [this.ToggleSwitchStyle];
            this._injectCustomStyles();
        }
    };

    class ThemeExtension extends StyleExtension {
        __initializeFields() {
            this.DarkTheme = 'body,html{background:#101010!important;color:#c5c5c5}nav.clear{background:#202019!important}.twofa-barcode{background:#101010!important;color:#c5c5c5}#filter-bar-title,.context-menu-action,.list-choices-header,.status,.view-name,h1,list-add-case{color:#fff!important}.action-button,.grid-column-Priority,.grid-column-RemainingTime,.grid-column-Status,.timesheet-popup th,.timesheet-popup time{color:#000!important}.action,.bodycontent,.case-popup>div.comment,.case-popup>dl,.case-popup>h2,.edit-timesheet,.list-choices-expander,.specify-case,header h1{color:#0b45d9!important}.action-button.disabled{color:#aaa!important}.gw-nav-entry-feedback{display:none}.biglist{width:100%!important;border:1px #c5c5c5 solid;margin-top:5px;margin-bottom:20px}.biglist .row,.close-button{border:1px #c5c5c5 solid}#filter-bar,.action-bar,.biglist,.bug-grid,.case .case-category:not(.icon-wrench),.case .status,.filterbar-refine-further-popup .droplist,.filterbar-refine-further-popup .list-choices-section,.filterbar-view-popup svg,.gw-header-main,.gw-nav-mobile,.gw-nav-pane,.gw-nav-submenus,.list-group-footer,.menu-small-blue,.mini-report,.person-page,.popup,.userPrefs .main,nav.clear,section.case{-webkit-filter:invert(1);-moz-filter:invert(1);filter:invert(1)}.biglist img,.bug-grid svg,.case .clear,.case .controls,.case-add-category-popup svg,.case-popup svg,.gw-nav-entry-time .gw-nav-link-icon .active,.gw-nav-entry-time .gw-nav-link-label.active,.gw-nav-mobile img,.gw-nav-pane img,.gw-nav-submenus svg,.list-group-footer svg,.person-page h1,.person-page img,.person-page svg,.priority,.userPrefs .main img,section.case img{-webkit-filter:invert(1)!important;-moz-filter:invert(1)!important;filter:invert(1)!important}.donotinvert,.popup .context-menu-popup,a[title="Click to view selected case"]{-webkit-filter:invert(1)!important;-moz-filter:invert(1)!important;filter:invert(1)!important}.case .left{width:15%;min-width:15%}.case .events{width:85%;min-width:85%}.case{width:90%;max-width:none}.event{border:1px #d3d3d3 solid;padding:10px}.event header .summary{padding-bottom:3px;border-bottom:1px #d3d3d3 solid}.event.email .event-content.event-email-incoming:before,.event.email .event-content.event-email-outgoing:before{background-image:none}.event.email .event-content{margin-left:0;width:100%;background:#ededf1}.event header .summary{padding-bottom:5px}.event header .changes{margin-left:0;margin-top:5px}.event .timestamp{margin:4px 0 0 0}.event .body:before{border-width:0;left:0}.event .body{margin-left:0;border-radius:4px;border-top-left-radius:inherit;width:100%}';
            this.ThemeSwitch = '<li class="gw-nav-link"><h3>Theme</h3><hr />Light <label class="switch donotinvert"><input id="themeswitch" type="checkbox"><span class="slider round"></span></label> Dark</li>';
        }

        _injectTheme() {
            if(localStorage.getItem("theme") != "dark") {
                return;
            }

            super._injectStyle(this.DarkTheme, "theme");
        }

        _createThemeSwitch() {
            $(".gw-nav-pane")
                .find(".gw-nav-entry-time")
                .parent()
                .append(this.ThemeSwitch);

            if(localStorage.getItem("theme") == "dark"){
                $("#themeswitch").attr("checked", "");
            }

            var self = this;
            var superInjectStyle = super._injectStyle;

            $("#themeswitch").click(function() {
                if(localStorage.getItem("theme") == "dark") {
                    localStorage.setItem("theme", "light");
                    window.location.reload();
                }
                else {
                    superInjectStyle(self.DarkTheme);
                    localStorage.setItem("theme", "dark");
                }
            });
        };


        initialize() {
            this._injectTheme();
            this._createThemeSwitch();
        };
    };

    class ActionButtonsExtension extends DomExtension {
        __initializeFields() {
            this.ActionButtonTemplate = "<a class='control' id='someid' href='somehref'>Some Label</button>";
            this.TransitionElement = "<a class='control'>⟫</a>";

            this.CaseStateMap = JSON.parse('{"Bug":{"Active":"1","Waiting For Another":"37","Developing":"47","In Code Review":"48","QA Testing":"49","Sec Testing":"50","Tests Completed":"53"},"Task-Test":{"Active":"34","Waiting For Another":"38","Developing":"54","In Code Review":"55","QA Testing":"58","Sec Testing":"60","Tests Completed":"62"},"Feature":{"Active":"17","Waiting For Another":"41","Developing":"56","In Code Review":"57","QA Testing":"59","Sec Testing":"61","Tests Completed":"63"},"Schedule Item":{"Active":"23"},"Message":{"Active":"20"}}');

            /*
            SCRIPT TO UPDATE CaseStateMap IN NEED:

            - Requires FB Admin privileges.
            - In case of FB case status list update, run below method in https://msltd.fogbugz.com/f/page?P11_pg=pgStatuses&ixPlugin=11&pg=pgPlugin
            - Then update CaseStateMap with the produced map.

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
        }

        _buildActionHref(caseNumber, caseState) {
            return "https://msltd.fogbugz.com/f/cases/edit/" + caseNumber + "/?ixStatus=" + caseState;
        };

        _mapCaseStateToDescription(caseState) {
            for(var caseType in this.CaseStateMap) {
                for(var caseStateName in this.CaseStateMap[caseType]){
                    if(this.CaseStateMap[caseType][caseStateName] === caseState) {
                        return caseStateName;
                    }
                }
            }
        };

        _createHistory(caseState) {
            const seperator = ", ";
            var history = "";

            var selector = (caseState && caseState.contains("Completed"))
            ? "div.changes:contains(to '" + this._mapCaseStateToDescription(caseState) + "')"
            : "div.changes:contains(from '" + this._mapCaseStateToDescription(caseState) + "')";

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

        _createActionButton(label, buttonId, parentElem, caseNumber, caseState) {
            var actionButton = super.createDomElementOnce(parentElem, this.ActionButtonTemplate, buttonId, true);

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
                actionButton.attr("href", this._buildActionHref(caseNumber, caseState));
            }

            var history = this._createHistory(caseState);

            if(history.length > 0) {
                actionButton.attr("title", history);
                actionButton.html(label + " <span class='donotinvert' style='font-weight:bold; color:#65cc8b !important;'>✓</b>");
            }

            actionButton.prop("initialized", true);

            return actionButton;
        }

        _createActionButtons() {
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
            for(var caseStatus in this.CaseStateMap[caseCategory]) {
                stack.push(caseStatus);
            }

            var nextStatus = stack.pop();

            while(nextStatus) {
                var buttonId = nextStatus.replace(new RegExp(" ", 'g'), "-").toLowerCase();

                if(nextStatus.contains("Waiting")) {
                    nextStatus = stack.pop();
                    continue;
                }

                this._createActionButton(nextStatus, buttonId, parentElem, caseNumber, this.CaseStateMap[caseCategory][nextStatus]);

                nextStatus = stack.pop();

                if(nextStatus) {
                    super.createDomElementOnce(parentElem, this.TransitionElement, buttonId+"-transition");
                }
            }
        }

        initialize() {
            var status = $('.status').html();

            if(!status || status.startsWith("Resolved") || status.startsWith("Closed")) {
                return;
            }

            this._createActionButtons();
        }
    };

    class SupportExtension extends DomExtension {
        __initializeFields() {
            this.SupportCaseIndicator = '<span class="status" style="background-color: #e62121 !important">Support Related Case</span></h1>';
            this.AddWaitingCustomer = '<span class="status active" style="margin-top: 2px !important; cursor: pointer">Add Waiting Customer</span></h1>';
            this.OpenWaitingCustomers = '<span class="status resolved" style="margin-top: 8px !important; cursor: pointer">Open Waiting Customers</span></h1>';
        }

        _openWaitingCustomers(urlBuilder) {
            var waitingCustomers = this.tags.filter((tag) => tag.startsWith("zd"));

            for(var i in waitingCustomers) {
                var zendeskUrl = urlBuilder(waitingCustomers[i].replace("zd",""));
                window.open(zendeskUrl, '_blank');
            }
        }

        _addWaitingCustomer() {
            var editAction = $('.case .controls [name=edit]').first();

            if(editAction.length == 0) {
                return;
            }

            editAction.click();

            var handle = window.setInterval(function() {
                //<input type="hidden" name="tags" class="droplist-storage-input" value="[&quot;support&quot;,&quot;test&quot;]">

                var tagsElem = $('input[name=tags]');

                if(tagsElem.length == 0) {
                    return;
                }

                window.clearInterval(handle);

                var zendeskId = prompt("Please enter the Zendesk case id (i.e. 12345)")

                if(!zendeskId || isNaN(zendeskId)) {
                    $('#btnCancel').click();
                    return;
                }

                $('#sidebarTags .droplist-input').focus().val("zd"+zendeskId).blur()
                $('#btnSubmit').click();

            }, 50);
        }

        _createGenericControls() {
            var self = this;

            if(!this._isSupportCase(false) && this._isSupportCase(true)) {
                super.createDomElementOnce($('header h1'), "<br/>", 'support-controls-br', false, true);
                super.createDomElementOnce($('header h1'), this.SupportCaseIndicator, 'support-indicator', false, true);
            }

            super.createDomElementOnce($('.top > .left, .corner'), "<hr/>", 'support-controls-hr', false, true);
            super.createDomElementOnce($('.top > .left, .corner'), this.AddWaitingCustomer, 'add-waiting-customer', true, true)
                .off('click')
                .click(function() {
                self._addWaitingCustomer();
            });

            if(this.tags && this.tags.filter((tag) => tag.startsWith("zd")).length > 0) {
                super.createDomElementOnce($('.top > .left, .corner'), this.OpenWaitingCustomers, 'open-waiting-customers', true, true)
                    .off('click')
                    .click(function() {
                    self._openWaitingCustomers(self._buildZendeskUrl);
                });
            }
        }

        _buildZendeskUrl(zendeskCase) {
            return "https://netsparker.zendesk.com/agent/tickets/" + zendeskCase;
        }

        _buildZendeskLink() {
            if(this.zendeskLink) {
                return this.zendeskLink;
            }

            var caseNameSplit = this.caseName.split("ZD#");

            if(caseNameSplit.length != 2) {
                return;
            }

            return caseNameSplit[0] + "<a href='" + this._buildZendeskUrl(caseNameSplit[1]) + "' target='_blank' initialized>ZD#" + caseNameSplit[1] + "</a>";
        }

        _createCaseRelatedControls() {
            // Cache the built link to prevent re-calculation.
            this.zendeskLink = this._buildZendeskLink();

            if($('.case .top header > h1 a[initialized]').length == 0) {
                $('.case .top header > h1').html(this.zendeskLink);
            }
        }

        _isSupportCase(checkTags) {
            return (this.caseName && this.caseName.contains("ZD#")) || (checkTags && this.tags && this.tags.filter(tag => tag.startsWith("support") || tag.startsWith("zd")).length > 0);
        }

        initialize() {
            this.caseName = $('.case .top header > h1').text();

            if(!this.caseName) {
                return;
            }

            this.tags = $('#sidebarTags li a').map((i, o) => $(o).text()).get();

            this._createGenericControls();

            if(!this._isSupportCase(false)) {
                return;
            }

            this._createCaseRelatedControls();
        }
    };

    class FogbugzExtendedPlugin {
        constructor() {
            var self = this;

            $(document).ready(function() {
                // Register 'initialize-once' extensions here.
                this.Extensions = [
                    new StyleExtension(),
                    new ThemeExtension(),
                ];

                // Register live extensions here.
                FogbugzExtendedPlugin.Extensions = [
                    new ActionButtonsExtension(),
                    new SupportExtension(),
                ];
            });
        }

        _runImpl() {
            for(var i in FogbugzExtendedPlugin.Extensions) {
                FogbugzExtendedPlugin.Extensions[i].initialize();
            }
        };

        run() {
            var self = this;
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
                self._runImpl();
            });
        }
    };

    new FogbugzExtendedPlugin().run();
})();
