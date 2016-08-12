var zenith = zenith || {};
zenith.AnalyticsDashboard = zenith.AnalyticsDashboard || {};
zenith.AnalyticsDashboard.Tiles = zenith.AnalyticsDashboard.Tiles || {};
zenith.AnalyticsDashboard.Tiles.AlertsTile = (function () {
    function AlertsTile($tile, callback) {
        this.css = "tiles/css/AlertsTile.css";
        this.employee_list = [];
        this.root_employee = [];
        this.alert_types = {};

        this.createTileSummary($tile, callback);
    };

    AlertsTile.prototype.url = "tiles/html/AlertsTile.html";
    AlertsTile.prototype.html = null;

    AlertsTile.prototype.createTileSummary = function ($tile, callback) {
        var _this = this;
        $tile.find(".tile-settings").remove();

        var alertsDef = $.Deferred();
        zenith.AnalyticsDashboard.Resources.getAlerts({ log_in_name: zenith.AnalyticsDashboard.User.log_in_name }, function (data) {
            _this.root_employee = data;
            alertsDef.resolve();
        });

        var alertTypesDef = $.Deferred();
        zenith.AnalyticsDashboard.Resources.getAlertTypes(zenith.AnalyticsDashboard.User.log_in_name, function (data) {
            _this.alert_types = data;
            alertTypesDef.resolve();
        });

        $.when.apply($, [alertsDef, alertTypesDef]).done(function () {
            _this.populateSummary($tile);
            $.isFunction(callback) && callback();
        });
    };

    AlertsTile.prototype.populateSummary = function ($tile) {
        var _this = this;
        var root_employee = _this.root_employee;

        var numberOfAlertsToDisplay = 3;
        var topAlerts = [];

        var numberOfAlertTypesDisplayed = 0;
        if (root_employee) {
            for (var alert_type_name in root_employee.alert_types) {
                var alert = root_employee.alert_types[alert_type_name];
                var added = false;

                if (_this.alert_types[alert_type_name].display) {
                    numberOfAlertTypesDisplayed++;
                    for (var i = 0; !added && i < numberOfAlertsToDisplay; i++) {
                        if (topAlerts[i] === null || topAlerts[i] === undefined) {
                            topAlerts[i] = alert;
                            added = true;
                        }
                        else if (alert.alert_count_with_employees > topAlerts[i].alert_count_with_employees) {
                            if (topAlerts[i + 1]) {
                                topAlerts[i + 2] = topAlerts[i + 1];
                            }
                            topAlerts[i + 1] = topAlerts[i];
                            topAlerts[i] = alert;
                            added = true;
                        }
                    }
                }
            }
        }

        var content = "";
        if (topAlerts.length) {
            content += "<div style='padding-bottom: 10px;" + (numberOfAlertTypesDisplayed > numberOfAlertsToDisplay ? "" : "visibility: hidden;") + "'>Top " + (topAlerts.length < numberOfAlertsToDisplay ? topAlerts.length : numberOfAlertsToDisplay) + " Alerts</div>";
            for (var i = 0; i < numberOfAlertsToDisplay && i < topAlerts.length; i++) {
                var alert = topAlerts[i];
                content += "<div style='color:#000;'>" + alert.title + " (<span style='color: #FF5252;'>" + alert.alert_count_with_employees + "</span>)</div>";
            }
        }
        else {
            content += "<br><br><div style='font-size: 1.5em;'>No Alerts</div>";
        }

        var $summaryContent = $tile.find(".tile-summary-content").empty().css({ "padding-top": (topAlerts.length > 0 ? "5px" : "20px"), "text-align": "center" });
        $summaryContent.append("<div><span class='glyphicon glyphicon-exclamation-sign' style='color: #FF5252; font-size: 5em;'></span></div>");
        $summaryContent.append("<div style='color: #FF5252;'>" + content + "</div>");
    };

    AlertsTile.prototype.createTileContent = function ($tile, options, callback) {
        var _this = this;

        _this.loadHtml($tile, function () {
            _this.loadCss($tile, function () {
                _this.loadAlerts($tile, function () {
                    $.isFunction(callback) && callback();
                });
            });
        });
    };

    AlertsTile.prototype.loadAlerts = function ($tile, callback) {
        var _this = this;

        //load the list of alert types
        var alert_types = _this.alert_types;
        var $modal = $tile.find(".all-alert-types-modal");

        var alert_type_array = [];
        for (var alert_name in alert_types) {
            alert_type_array.push(alert_types[alert_name]);
        }

        $modal.find("table").dataTable({
            data: alert_type_array,
            columnDefs: [{
                targets: 0,
                title: "Alert",
                data: "alert_title"
            },
            {
                targets: 1,
                title: "Type",
                data: "alert_type"
            },
            {
                targets: 2,
                title: "Description",
                data: "alert_description"
            },
            {
                targets: 3,
                title: "Display",
                data: null,
                render: function (data, type, row) {
                    return "<span class='glyphicon glyphicon-ok-circle'></span>";
                },
                createdCell: function (td, cellData, rowData, rowIndex, colIndex) {
                    $(td).addClass("display").attr("display", rowData.display);
                }
            }],
            "dom": 'ft',
            "paging": false,
            "bAutoWidth": false,
            createdRow: function (row, data, dataIndex) {
                var $row = $(row);
                $row.attr("title", "Toggle Display");

                $row.on("click", function () {
                    var display = !($row.find(".display").attr("display") === "true");
                    $row.find(".display").attr("display", display);
                    zenith.AnalyticsDashboard.Resources.saveUserAlert({ log_in_name: zenith.AnalyticsDashboard.User.log_in_name, alert_id: data.alert_id, display: display });
                    _this.toggleAlertTypeDisplay($tile, data.alert_title, display);
                });
            }
        });

        //load the actual actual alerts
        _this.calculateTotalAlertCounts();

        var root_employee = _this.root_employee;
        $tile.find(".option-display-root-manager").data("manager", root_employee).attr("title", "View " + root_employee.known_as);

        _this.ActivatePerson($tile, root_employee);
        _this.setEvents($tile);

        //populate employee_list
        var persons = [root_employee];
        while (persons.length > 0) {
            var person = persons.pop(); //dequeue
            _this.employee_list[person.log_in_name] = person;

            for (var i = 0; i < person.employees.length; i++) {
                persons.unshift(person.employees[i]); //enqueue
            }
        }

        $.isFunction(callback) && callback();
    };

    AlertsTile.prototype.calculateTotalAlertCounts = function () {
        var _this = this;
        var persons = [_this.root_employee];

        while (persons.length > 0) {
            var person = persons.pop();

            var total = 0;
            var total_with_employees = 0;
            for (var alert_type_title in person.alert_types) {
                if (_this.alert_types[alert_type_title].display) {
                    var alert_type = person.alert_types[alert_type_title];
                    total += alert_type.alert_count;
                    total_with_employees += alert_type.alert_count_with_employees;
                }
            }

            person.total_alert_count = total;
            person.total_alert_count_with_employees = total_with_employees;

            for (var i = 0; i < person.employees.length; i++) {
                persons.push(person.employees[i]);
            }
        }
    };

    AlertsTile.prototype.updateDisplayedAlertCounts = function ($tile) {
        $tile.find(".person-list .person").each(function (i, elem) {
            var $person = $(elem);
            var personData = $person.data("employee");

            $person.find(".alert-count").text(personData.total_alert_count_with_employees > 99 ? "99+" : personData.total_alert_count_with_employees);
        });
    };

    AlertsTile.prototype.toggleAlertTypeDisplay = function ($tile, alert_type_title, display) {
        var _this = this;
        var $alert_type_list = $tile.find(".alert-type-list");

        _this.alert_types[alert_type_title].display = display;

        if (display) {
            var person = $tile.find(".person-list .person.active").data("employee");
            _this.AddAlertTypeToList($alert_type_list, person, alert_type_title);
            $alert_type_list.find(".no-alerts-div").remove();
        }
        else {
            $alert_type_list.find(".alert-type[data-alert-type-title='" + alert_type_title + "']").remove();

            if ($alert_type_list.find(".alert-type").length == 0) {
                _this.AddNoAlertsDiv($alert_type_list);
            }
        }

        _this.calculateTotalAlertCounts();
        _this.updateDisplayedAlertCounts($tile);
        _this.populateSummary($tile);
    };

    AlertsTile.prototype.populateEmployees = function ($tile, root_person) {
        var _this = this;
        var $personContainer = $tile.find(".person-list").empty();

        _this.AddEmployeeToContainer(root_person, $personContainer);

        for (var i = 0; i < root_person.employees.length; i++) {
            _this.AddEmployeeToContainer(root_person.employees[i], $personContainer);
        }

        $personContainer.find(".person:first-child").addClass("active");

        var manager = _this.employee_list[root_person.supervisor_log_in_name];
        if (manager) {
            $tile.find(".option-display-manager").data("manager", manager).attr("title", "View " + manager.known_as).show();
            $tile.find(".option-type-separator").show();

            if (_this.employee_list[manager.supervisor_log_in_name]) {
                $tile.find(".option-display-root-manager").show();
            }
            else {
                $tile.find(".option-display-root-manager").hide();
            }
        }
        else {
            $tile.find(".option-display-manager").data("manager", null).hide();
            $tile.find(".option-display-root-manager, .option-type-separator").hide();
        }
    };

    AlertsTile.prototype.AddEmployeeToContainer = function (person, $personContainer) {
        var $person = $("<div class='person'><span class='name'>" + person.known_as + "</span><div class='alert-count-container'" + (person.total_alert_count_with_employees > 0 ? "" : " style='display:none;'") + "><span class='alert-count'>" + (person.total_alert_count_with_employees > 99 ? "99+" : person.total_alert_count_with_employees) + "</span></div></div>")
        $person.data("employee", person);
        $personContainer.append($person);
    };

    AlertsTile.prototype.populateAlertTypes = function ($tile, root_person) {
        var _this = this;

        $tile.find(".alert-type-list-header").text("Alerts - " + root_person.known_as);

        var $alertTypeContainer = $tile.find(".alert-type-list").empty();

        //ability to see a list of all alerts possible
        var $allAlertTypes = $("<div class='display-all-alert-types'><span>View All Available Alerts</span></div>");
        $alertTypeContainer.append($allAlertTypes);

        var alert_added = false;
        for (var alert_name in _this.alert_types) {
            if (_this.alert_types[alert_name].display) {
                _this.AddAlertTypeToList($alertTypeContainer, root_person, alert_name);
                alert_added = true;
            }
        }

        if (!alert_added) {
            _this.AddNoAlertsDiv($alertTypeContainer);
        }
    };

    AlertsTile.prototype.AddNoAlertsDiv = function ($alertTypeContainer) {
        $alertTypeContainer.append("<div class='no-alerts-div'>You have not added any alerts to your display list</div>");
    };

    AlertsTile.prototype.AddAlertTypeToList = function ($alertTypeContainer, root_person, alert_name) {
        var alert_type = root_person.alert_types[alert_name];
        var alert_count = (alert_type ? alert_type.alert_count_with_employees : 0);
        var $alert_type_div = $("<div class='alert-type' data-alert-type-title='" + alert_name + "'><div class='alert-type-header'><span class='alert-type-title'>" + alert_name + "</span><div class='alert-count-container'><span class='alert-count'>" + zenith.AnalyticsDashboard.Utils.addCommasToNumber(alert_count) + "</span></div></div><div class='alert-type-body' style='display:none;'></div></div>");
        $alert_type_div.data("alert_type", alert_type);
        $alertTypeContainer.append($alert_type_div);
    };

    AlertsTile.prototype.ActivatePerson = function ($tile, person_data) {
        var _this = this;

        var $active_option = $tile.find(".person-list-container .options-container .active");
        if ($active_option.is(".option-display-alerts")) {
            _this.populateAlertTypes($tile, person_data);
        }
        else if ($active_option.is(".option-display-tree")) {
            _this.DisplayOrgTree($tile, person_data);
        }

        _this.populateEmployees($tile, person_data);
    };

    AlertsTile.prototype.setEvents = function ($tile) {
        var _this = this;

        $tile.find(".all-alert-types-modal .close-alerts, .all-alert-types-modal .outside-all-alert-types-modal").on("click", function () {
            $tile.find(".all-alert-types-modal").hide();
        });

        $tile.on("click", ".display-all-alert-types span", function () {
            $tile.find(".all-alert-types-modal").show();
        });

        $tile.on("click", ".person", function () {
            var $person = $(this);
            if (!$person.is(".active")) {
                var person_data = $person.data("employee");
                _this.ActivatePerson($tile, person_data);
            }
        });

        $tile.find(".alert-type-list").on("click", ".alert-type-header", function () {
            var $this = $(this);
            var $alert_type = $this.parent();

            if ($this.hasClass("active")) {
                $this.removeClass("active");
                $alert_type.find(".alert-type-body").hide();
            }
            else {
                $this.addClass("active");
                $alert_type.find(".alert-type-body").show();
            }

            _this.populateAlerts($alert_type, $tile.find(".person.active").data("employee"), $alert_type.data("alertTypeTitle"));
        });

        $tile.find(".options-container .option-display-tree").on("click", function () {
            $tile.find(".options-container .active").removeClass("active");
            $(this).addClass("active");
            _this.DisplayOrgTree($tile, $tile.find(".person.active").data("employee"));
        });

        $tile.find(".options-container .option-display-alerts").on("click", function () {
            $tile.find(".options-container .active").removeClass("active");
            $(this).addClass("active");
            _this.populateAlertTypes($tile, $tile.find(".person.active").data("employee"));
        });

        $tile.find(".options-container .option-display-manager").on("click", function () {
            var person = $(this).data("manager");
            if (person) {
                _this.ActivatePerson($tile, person);
            }
        });

        $tile.find(".options-container .option-display-root-manager").on("click", function () {
            var active_employee = $tile.find(".person.active").data("employee");
            var root_manager = $(this).data("manager");
            if (active_employee && active_employee.log_in_name != root_manager.log_in_name) {
                _this.ActivatePerson($tile, root_manager);
            }
        });
    };

    AlertsTile.prototype.DisplayOrgTree = function ($tile, user) {
        var _this = this;

        $tile.find(".alert-type-list-header").text("Org Chart - " + user.known_as);

        var $graph_div = $("<div>");
        var $container = $tile.find(".alert-type-list").empty().append($graph_div);
        $graph_div.GraphTree({
            data: _this.prepareDataForTreeGraph(user),
            graph_size: {
                width: $container.width(),
                height: $container.height()
            },
            tooltip_formatter: {
                content: function (params, ticket, callback) {
                    return params.data.name + "<br> Alerts: " + params.data.value;
                }
            },
            onclick: function (data) {
                if (data && data.log_in_name) {
                    $tile.find(".options-container .option.active").removeClass("active");
                    $tile.find(".options-container .option-display-alerts").addClass("active");
                    _this.ActivatePerson($tile, _this.employee_list[data.log_in_name]);
                }
            }
        });
    };

    AlertsTile.prototype.prepareDataForTreeGraph = function (user) {
        var _this = this;
        var root_person = user;
        var tree_root = { name: root_person.known_as, log_in_name: root_person.log_in_name, value: root_person.total_alert_count_with_employees, children: [] };

        var queue = [{ original: root_person, graph_tree: tree_root }];

        while (queue.length > 0) {
            var current_nodes = queue.pop();
            var original_node = current_nodes.original;
            var graph_tree_node = current_nodes.graph_tree;

            for (var i = 0; i < original_node.employees.length; i++) {
                var current_node = original_node.employees[i];
                var new_node = { name: current_node.known_as, log_in_name: current_node.log_in_name, value: current_node.total_alert_count_with_employees, children: [] };
                graph_tree_node.children.push(new_node);
                queue.unshift({ original: current_node, graph_tree: new_node });
            }
        }

        return [tree_root];
    };

    AlertsTile.prototype.populateAlerts = function ($alertType, root_person, alert_type_title) {
        var _this = this;

        var $body = $alertType.find(".alert-type-body").empty();
        var alert_type = root_person.alert_types[alert_type_title];

        if (alert_type) {
            var columnDefs = [];

            var str = "<table class='table'><thead>";
            str += "<tr>";

            var alert_fields = _this.alert_types[alert_type_title].columns;
            for (var i = 0; i < alert_fields.length; i++) {
                str += "<th>" + alert_fields[i].label + "</th>"
                columnDefs.push({ targets: i, title: alert_fields[i].label, data: alert_fields[i].column_name });
            }

            str += "</tr></thead></table>";

            var $root_table = $(str).addClass("root-employee-table");
            $root_table.find("thead").prepend("<tr><td colspan='" + columnDefs.length + "'>Alerts for " + root_person.first_name + " " + root_person.last_name + "</td></tr>");
            $body.append($root_table);

            if (alert_type.alerts.length > 0) {
                $root_table.dataTable({
                    data: alert_type.alerts,
                    columnDefs: columnDefs,
                    "dom": 't',
                    "paging": false
                });
            }
            else {
                $root_table.append("<tbody><tr><td colspan='4'>No alerts</td></tr></tbody>");
            }

            if (root_person.employees.length > 0) {
                var employee_alerts = [];
                var persons = [];

                for (var i = 0; i < root_person.employees.length; i++) {
                    persons.push(root_person.employees[i]);
                }

                while (persons.length > 0) {
                    var person = persons.pop();
                    var current_alert_type = person.alert_types[alert_type_title];
                    if (current_alert_type) {
                        for (var i = 0; i < current_alert_type.alerts.length; i++) {
                            employee_alerts.push(current_alert_type.alerts[i]);
                        }

                        for (var i = 0; i < person.employees.length; i++) {
                            persons.push(person.employees[i]);
                        }
                    }
                }

                var $employees_table = $(str).addClass("employees-table");
                $employees_table.find("thead").prepend("<tr><td colspan='" + columnDefs.length + "'>Alerts for employees of " + root_person.first_name + " " + root_person.last_name + "</td></tr>");
                $body.append($employees_table);
                if (employee_alerts.length > 0) {
                    $employees_table.dataTable({
                        data: employee_alerts,
                        columnDefs: columnDefs,
                        "dom": 't',
                        "paging": false,
                    });
                }
                else {
                    $employees_table.append("<tbody><tr><td colspan='4'>No alerts</td></tr></tbody>");
                }
            }
        }
        else {
            $body.append("<div class='no-alerts-div'>No Alerts</div>");
        }
    };

    AlertsTile.prototype.openTileContent = function ($tile, options, callback) {
        var _this = this;
        _this.applyOptions($tile, options);
        $.isFunction(callback) && callback();
    };

    AlertsTile.prototype.applyOptions = function ($tile, options) {
        var _this = this;
    };

    AlertsTile.prototype.loadHtml = function ($tile, callback) {
        var _this = this;
        var def = $.Deferred();

        if (AlertsTile.prototype.html == null) {
            $.ajax({
                url: AlertsTile.prototype.url,
                success: function (html) {
                    AlertsTile.prototype.html = html;
                    def.resolve();
                },
                cache: false
            });
        }
        else {
            def.resolve();
        }

        def.done(function () {
            $tile.find(".tile-content").prepend(AlertsTile.prototype.html);
            $.isFunction(callback) && callback();
        });
    };

    AlertsTile.prototype.loadCss = function ($tile, callback) {
        var _this = this;

        if ($("head link[href='" + _this.css + "']").length === 0) {
            $("head").append($("<link rel='stylesheet' type='text/css' />").attr("href", _this.css + "?_=" + Date.now()));
        }

        $.isFunction(callback) && callback();
    };

    AlertsTile.prototype.onResize = function ($tile) {
        var _this = this;

        $(window).on("resize.dashboard-tile-" + $tile.attr("data-user-tile-id"), function () {
            if ($tile.is(".expanded")) {

            }
        });
    }

    return AlertsTile;
}());