var zenith = zenith || {};
zenith.AnalyticsDashboard = zenith.AnalyticsDashboard || {};
zenith.AnalyticsDashboard.Controller = {
    init: function (callback) {
        var _this = this;

        _this.activateCogs(true);
        $.blockUI({
            message: "Loading. Please wait.",
            css: {
                padding: "25px",
                "min-width": "500px"
            },
            onBlock: function () {
                _this.getUserInfo(function (userObj, isValidUser) {
                    if (isValidUser) {
                        zenith.AnalyticsDashboard.Resources.getUserList(function (user_list) {
                            var $user_select = $("#change-user");
                            $.each(user_list, function (idx, user) {
                                $user_select.append("<option value='" + user.log_in_name + "'>" + user.known_as + "</option>");
                            });

                            $user_select.on("change", function () {
                                var user_log_in = $(this).val();
                                window.open(location.origin + location.pathname + "?user=" + user_log_in, "_self");
                            });

                            $("#change-user").val(userObj.log_in_name.toUpperCase());
                            $("#disp_user_name").text(userObj.first_name + " " + userObj.last_name).parent().show();

                            $(".navbar.pages").show();
                            _this.setupNavClick();

                            _this.getReferenceData(function () {
                                _this.navClick($("ul.pages a[action='analytics-dashboard']"), function () {
                                    //_this.loadAlerts(function () {
                                    _this.deactivateCogs(true);
                                    $.isFunction(callback) && callback();
                                    //});
                                });
                            });
                        });
                    }
                    else {
                        $("#wrapper .navbar.pages, #change-user").remove();
                        $("#wrapper .access-denied-div").show();
                        _this.deactivateCogs(true);
                        $.unblockUI();
                        $.isFunction(callback) && callback();
                    }
                });
            }
        });
    },

	getUserInfo: function (callback) {
	    var regex = /[?]user=([a-zA-Z0-9]+)/;
	    var regexResults = regex.exec(location.href);

	    var user = null;
	    if (regexResults && regexResults.length > 1) {
	        user = regexResults[1];
	    }

	    zenith.AnalyticsDashboard.Resources.getUserInfo(user, function (userData) {
	        var isValidUser = false;
	        if (userData && !$.isEmptyObject(userData)) {
	            zenith.AnalyticsDashboard.User = userData;
	            isValidUser = true;
	        }

	        $.isFunction(callback) && callback(zenith.AnalyticsDashboard.User, isValidUser);
	    });
	},

	getReferenceData: function (callback) {
	    var _this = this;
	    zenith.AnalyticsDashboard.referenceData = {};
	    var defs = [];

	    var branchDef = $.Deferred();
	    defs.push(branchDef);
	    zenith.AnalyticsDashboard.Resources.getBranchList(function (branches) {
	        zenith.AnalyticsDashboard.referenceData.branches = branches;
	        branchDef.resolve();
	    });

	    var branchGroupingDef = $.Deferred();
	    defs.push(branchGroupingDef);
	    zenith.AnalyticsDashboard.Resources.getBranchGrouping(function (branch_grouping) {
	        zenith.AnalyticsDashboard.referenceData.branch_grouping = branch_grouping;
	        branchGroupingDef.resolve();
	    });

	    $.when.apply($, defs).done(function () {
	        $.isFunction(callback) && callback();
	    });
	},

	loadAnalyticsDashboard: function (callback) {
	    var _this = this;

	    _this.blockUICogs();
	    $.blockUI({
	        message: "Loading the dashboard. Please wait.",
	        css: {
	            padding: "25px",
	            "min-width": "500px"
	        },
	        onUnblock: function () {
	            _this.unblockUICogs();
	            $.isFunction(callback) && callback();
	        }
	    });

	    var mainDef = $.Deferred();
	    var $section = $("<div id='analytics-dashboard' class='dashboard-content'>");
	    $("#wrapper").append($section);
	    _this.dashboard = new zenith.AnalyticsDashboard.Dashboard({
	        $container: $section,
	        onLoad: function () { mainDef.resolve() },
	        showAlerts: function () { _this.Alerts ? _this.Alerts.ShowAlerts() : null; },
	        onStartAddTile: function () { _this.activateCogs(); },
	        onFinishAddTile: function () { _this.deactivateCogs(); },
	        onStartDeleteTile: function () { _this.activateCogs(); },
	        onFinishDeleteTile: function () { _this.deactivateCogs(); },
	        onStartOpenTile: function () { _this.activateCogs(); },
	        onFinishOpenTile: function () { _this.deactivateCogs(); },
	        onStartCloseTile: function () { _this.activateCogs(); },
	        onFinishCloseTile: function () { _this.deactivateCogs(); },
	        onStartFilter: function () { _this.activateCogs(); },
	        onFinishFilter: function () { _this.deactivateCogs(); }
	    });

	    $.when.apply($, [mainDef]).done(function () {
	        $.unblockUI();
	    });
	},

	loadTraditionalReports: function (callback) {
	    var _this = this;

	    _this.blockUICogs();
	    $.blockUI({
	        message: "Loading report list. Please wait.",
	        css: {
	            padding: "25px",
	            "min-width": "500px"
	        },
	        onUnblock: function () {
	            _this.unblockUICogs();
	            $.isFunction(callback) && callback();
	        }
	    });

	    var mainDef = $.Deferred();
	    var $section = $("<div id='traditional-reports' class='dashboard-content'>");
	    $("#wrapper").append($section);
	    _this.reports = new zenith.AnalyticsDashboard.Reports({
	        $container: $section,
	        onLoad: function () { mainDef.resolve() },
	        onStartCollapseMenu: function () { _this.activateCogs(); },
	        onFinishCollapseMenu: function () { _this.deactivateCogs(); }
	    });

	    $.when.apply($, [mainDef]).done(function () {
	        $.unblockUI();
	    });
	},

	loadSelfServe: function (callback) {
	    var _this = this;

	    _this.blockUICogs();
	    $.blockUI({
	        message: "Loading data mart list. Please wait.",
	        css: {
	            padding: "25px",
	            "min-width": "500px"
	        },
	        onUnblock: function () {
	            _this.unblockUICogs();
	            $.isFunction(callback) && callback();
	        }
	    });

	    var mainDef = $.Deferred();
	    var $section = $("<div id='self-serve' class='dashboard-content'>");
	    $("#wrapper").append($section);
	    _this.SelfServe = new zenith.AnalyticsDashboard.SelfServe({
	        $container: $section,
	        onLoad: function () { mainDef.resolve() },
	        onStartLoadCube: function () { _this.activateCogs(); },
	        onFinishLoadCube: function () { _this.deactivateCogs(); },
	        onStartCollapseMenu: function () { _this.activateCogs(); },
	        onFinishCollapseMenu: function () { _this.deactivateCogs(); }
	    });

	    $.when.apply($, [mainDef]).done(function () {
	        $.unblockUI();
	    });
	},

	loadAlerts: function (callback) {
	    var _this = this;

	    var alertDef = $.Deferred();
	    var $alert_section = $("<div id='alerts'>");
	    var $alert_symbol_container = $("<div id='alerts-symbol-container'>");
	    $("#wrapper").append($alert_section);
	    //$("body").append($alert_symbol_container);
	    _this.Alerts = new zenith.AnalyticsDashboard.Alerts({
	        $symbol_container: $alert_symbol_container,
	        $alerts_container: $alert_section,
	        onLoad: function () { alertDef.resolve(); }
	    });

	    alertDef.done(function () {
	        $.isFunction(callback) && callback();
	    });
	},

	displaySection: function ($section, callback) {
	    var _this = this;

	    var sectionId = $section.attr("id");
	    var $activeSection = $("#wrapper .dashboard-content.active");

	    var hideDef = $.Deferred();
	    if ($activeSection.length > 0) {
	        $activeSection.removeClass("active").animate({ opacity: 0, width: 0 }, 500, function () {
	            $activeSection.hide();
	            hideDef.resolve();
	        });
	    }
	    else {
	        hideDef.resolve();
	    }

	    hideDef.done(function () {
	        $section.show();
	        $section.addClass("active").animate({ opacity: 1, width: "100%" }, 500, function () {
	            switch (sectionId) {
	                case "analytics-dashboard": $.isFunction(_this.dashboard.Activate) && _this.dashboard.Activate(); break;
	                case "traditional-reports": $.isFunction(_this.reports.Activate) && _this.reports.Activate(); break;
	                case "self-serve": $.isFunction(_this.SelfServe.Activate) && _this.SelfServe.Activate(); break;
	            }
	            $.isFunction(callback) && callback();
	        });
	    });
	},

	setupNavClick: function () {
	    var _this = this;
	    $("nav > .dropdown.pages > ul > li > a, nav > ul.pages > li > a").click(function (e) {
	        var $this = $(this);
	        e.preventDefault();

	        _this.navClick($this);
	    });
	},

	navClick: function ($elem, callback) {
	    var _this = this;

	    var linkText = $elem.text();
	    var $buttonText = $elem.closest(".dropdown").find("button .button-text");

	    if (($elem.closest(".pages").is("div") && $buttonText.text() != linkText) || ($elem.closest(".pages").is("ul") && !$elem.is(".active"))) {
	        $elem.closest("ul").find("a").removeClass("active");
	        $elem.addClass("active");
	        $buttonText.text(linkText);
	        _this.loadSection($elem.attr("target-id"), callback);
	    }
	    else {
	        $.isFunction(callback) && callback();
	    }
	},

	loadSection: function (sectionId, callback) {
	    var _this = this;
	    _this.activateCogs();

	    var $section = $("#" + sectionId);
	    if ($section.length == 0) {
	        var def = $.Deferred();
	        switch (sectionId) {
	            case "analytics-dashboard": _this.loadAnalyticsDashboard(function () { def.resolve(); }); break;
	            case "traditional-reports": _this.loadTraditionalReports(function () { def.resolve(); }); break;
	            case "self-serve": _this.loadSelfServe(function () { def.resolve(); }); break;
	        }

	        def.done(function () {
	            $section = $("#" + sectionId);
	            _this.displaySection($section, function () {
	                _this.deactivateCogs();
	                $.isFunction(callback) && callback();
	            });
	        });
	    }
	    else {
	        _this.displaySection($section, function () {
	            _this.deactivateCogs();
	            $.isFunction(callback) && callback();
	        });
	    }
	},

	activateCogs: function (blockUI) {
	    var _this = this;
	    if (_this.activeCogs == undefined || _this.activeCogs == null) {
	        _this.activeCogs = [];
	    }
	    if (_this.blockedUICogs == undefined || _this.blockedUICogs == null) {
	        _this.blockedUICogs = [];
	    }

	    if (blockUI) {
	        _this.blockUICogs();
	        _this.blockedUICogs.push(true);
	    }

	    _this.activeCogs.push(true);
	    $(".cog").resumeKeyframe();
	},
	deactivateCogs: function (unblockUI) {
	    var _this = this;
	    _this.activeCogs.pop();

	    if (unblockUI) {
	        _this.blockedUICogs.pop();
	        if (_this.blockedUICogs.length == 0) {
	            _this.unblockUICogs();
	        }
	    }

	    if (_this.activeCogs.length == 0) {
	        $(".cog").pauseKeyframe();
	    }
	},
	blockUICogs: function () {
	    $(".block-ui-cog").addClass("block-ui-cog-active");
	},
	unblockUICogs: function () {
	    $(".block-ui-cog").removeClass("block-ui-cog-active");
	}
}