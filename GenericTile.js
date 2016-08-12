var zenith = zenith || {};
zenith.AnalyticsDashboard = zenith.AnalyticsDashboard || {};
zenith.AnalyticsDashboard.Tiles = zenith.AnalyticsDashboard.Tiles || {};
zenith.AnalyticsDashboard.Tiles.GenericTile = (function () {
    function GenericTile ($tile, callback) {
        this.branchSelection = null;

        this.createTileSummary($tile, callback);
    };
    GenericTile.prototype.url = "tiles/html/GenericTile.html";
    GenericTile.prototype.html = null;

    GenericTile.prototype.createTileSummary = function ($tile, callback) {
        var _this = this;
        
        var data_interval = $tile.data("data_interval");
        var tile_id = $tile.data("tile_id");
        var user_branches = $tile.data("branches");

        _this.loadHtml($tile, function () {
            _this.branchSelection = new zenith.AnalyticsDashboard.BranchSelection({
                initial_branches: $.isEmptyObject(user_branches) ? zenith.AnalyticsDashboard.User.location_cd : user_branches,
                $container: $tile.find(".graph-control"),
                onLoad: function () {
                    zenith.AnalyticsDashboard.Resources.getTileSummary({ tile_id: tile_id, data_interval: data_interval }, function (data) {
                        _this.populateSummary($tile, data_interval, data);
                        $tile.data("summary-data", data);
                        $tile.data("branches", _this.branchSelection.GetSelectedBranches());
                        $.isFunction(callback) && callback();
                    });
                },
                onBranchChange: function (obj) {
                    var $graph_container_div = $tile.find(".graph-container");
                    var branches = {};
                    if (obj && obj.isBranchSelected) {
                        branches = obj.branches;
                        _this.ShowGraph($tile, $graph_container_div);
                        _this.CreateReport($tile, $graph_container_div);
                    }
                    else {
                        _this.HideGraph($tile, $graph_container_div, "No Branch Selected");
                    }

                    $tile.data("branches", branches);
                    _this.populateSummary($tile, $tile.data("data_interval"), $tile.data("summary-data"));

                    zenith.AnalyticsDashboard.Resources.saveTileBranches({ branches: $tile.data("branches"), user_tile_id: $tile.data("user_tile_id"), user_alias: zenith.AnalyticsDashboard.User.log_in_name });
                }
            });
        });
    };

    GenericTile.prototype.populateSummary = function ($tile, data_interval, data) {
        var _this = this;
        var selectedBranches = _this.branchSelection.GetSelectedBranches();
        var summaryOptions = $tile.data("tile_options").summary_options;
        var $tileSummary = $tile.find(".tile-summary-content").css({ "padding-top": "25px", "text-align": "center" }).empty();

        var summary = "";
        var icon = "";
        var color = "";

        if (data && data.length > ((summaryOptions.necessary_data_elements || 1) - 1)) {
            var pre_loop_variables = summaryOptions.pre_loop_variables;
            var loop_variables = summaryOptions.loop_variables;
            var post_loop_variables = summaryOptions.post_loop_variables;
            var data_length = data.length;

            if (pre_loop_variables && pre_loop_variables.length) {
                for (var i = 0; i < pre_loop_variables.length; i++) {
                    var variable = pre_loop_variables[i];
                    if (variable.calc_type == "value") {
                        eval("var " + variable.name + " = " + ((variable.val_type || "string") == "string" ? "'" : "") + data[variable.dataIndex][variable.field] + ((variable.val_type || "string") == "string" ? "'" : "") + ";");
                    }
                    else if (variable.calc_type == "eval") {
                        eval("var " + variable.name + " = " + ((variable.val_type || "string") == "string" ? "'" : "") + eval(variable.eval_text) + ((variable.val_type || "string") == "string" ? "'" : "") + ";");
                    }
                }
            }

            if (loop_variables && loop_variables.length) {
                for (var i = 0; i < loop_variables.length; i++) {
                    var variable = loop_variables[i];
                    variable.value = variable.initial_value || 0;
                }

                for (var i = 0; i < data.length; i++) {
                    for (var branch in selectedBranches) {
                        for (var k = 0; k < loop_variables.length; k++) {
                            var variable = loop_variables[k];
                            if ((variable.type == "total" || variable.type == "average") && (variable.dataIndex === undefined || variable.dataIndex === null || variable.dataIndex === "" || variable.dataIndex === i)) {
                                variable.value += (data[i].branches[branch] || {})[variable.field] || 0;
                            }
                        }
                    }
                }

                for (var i = 0; i < loop_variables.length; i++) {
                    var variable = loop_variables[i];
                    if (variable.type == "average") {
                        variable.value /= data_length;
                    }
                    eval("var " + variable.name + " = " + variable.value + ";");
                }
            }

            if (post_loop_variables && post_loop_variables.length) {
                for (var i = 0; i < post_loop_variables.length; i++) {
                    var variable = post_loop_variables[i];
                    if (variable.calc_type == "value") {
                        eval("var " + variable.name + " = " + ((variable.val_type || "string") == "string" ? "'" : "") + data[variable.dataIndex][variable.field] + ((variable.val_type || "string") == "string" ? "'" : "") + ";");
                    }
                    else if (variable.calc_type == "eval") {
                        eval("var " + variable.name + " = " + ((variable.val_type || "string") == "string" ? "'" : "") + eval(variable.eval_text) + ((variable.val_type || "string") == "string" ? "'" : "") + ";");
                    }
                }
            }

            //simulate an if-else structure by looping through the conditions in summary_options
            var ifEvaluated = false;
            for (var i = 0; !ifEvaluated && summaryOptions.if_conditions && i < summaryOptions.if_conditions.length; i++) {
                var if_object = summaryOptions.if_conditions[i];
                if (if_object.condition === undefined || if_object.condition === null || if_object.condition === "" || eval(if_object.condition)) {
                    ifEvaluated = true;

                    //initialize variables
                    for (var j = 0; if_object.variables && j < if_object.variables.length; j++) {
                        var variable = if_object.variables[j];
                        eval("var " + variable.name + " = " + ((variable.val_type || "string") == "string" ? "'" : "") + eval(variable.eval_text) + ((variable.val_type || "string") == "string" ? "'" : "") + ";");
                    }

                    summary = eval(if_object.summary);
                    icon = if_object.icon;
                    color = if_object.color;
                }
            }
        }
        else {
            color = "#DC8E00";
            icon = "glyphicon glyphicon-warning-sign";
            summary = "Summary could not be loaded";
        }

        if (!$.isEmptyObject(selectedBranches)) {
            $tileSummary.append("<div><span class='" + icon + "' style='color:" + color + ";font-size:3em;'></span></div><div><span style='color:" + color + ";' >" + summary + "</span></div><div style='padding-top:20px;font-size: 1.5em;'><span>" + summaryOptions.title + "</span></div>");
        }
        else {
            $tileSummary.append("<div style='padding-top:20px;font-size: 1.5em;'><span>" + summaryOptions.title + "</span></div>");
        }

        var branchGroupName = _this.branchSelection.GetBranchGroupName();
        $tile.find(".branch-group-name").text(branchGroupName);
    };
    
    GenericTile.prototype.createTileContent = function ($tile, options, callback) {
        var _this = this;

        $tile.find(".toggle-table-visibility").on("click", function () {
            var $this = $(this);
            var $container = $this.closest(".data-table-container");
            var $graph_details = $this.siblings().filter(".graph_details");
            if ($this.is("[action=show]")) {
                $this.attr("action", "hide").text("Hide Table");
                _this.showDataTable($container, $this, $graph_details);
            }
            else {
                $this.attr("action", "show").text("Show Table");
                _this.hideDataTable($container, $this, $graph_details);
            }
        });

        _this.applyOptions($tile, options);
        _this.GetReport($tile, callback);
        _this.onResize($tile);
    };

    GenericTile.prototype.showDataTable = function ($container, $button, $graph_details) {
        $container.find(".graph_details").slideDown();
    };

    GenericTile.prototype.hideDataTable = function ($container, $button, $graph_details) {
        $container.find(".graph_details").slideUp();
    };

    GenericTile.prototype.openTileContent = function ($tile, options, callback) {
        var _this = this;
        _this.applyOptions($tile, options);
        _this.CreateReport($tile, $tile.find(".graph-container"));

        $.isFunction(callback) && callback();
    };

    GenericTile.prototype.applyOptions = function ($tile, options) {
        var _this = this;
        if (options.containerWidth) {
            $tile.find(".graph-container").css({ "width": options.containerWidth });
        }
    };

    GenericTile.prototype.loadHtml = function ($tile, callback) {
        var _this = this;

        var htmlDef = $.Deferred();
        if (GenericTile.prototype.html == null) {
            $.ajax({
                url: _this.url,
                success: function (html) {
                    GenericTile.prototype.html = html;
                    htmlDef.resolve();
                },
                cache: false
            });
        }
        else {
            htmlDef.resolve();
        }

        htmlDef.done(function () {
            $tile.find(".tile-content").prepend(GenericTile.prototype.html);
            $.isFunction(callback) && callback();
        });
    };

    GenericTile.prototype.GetReport = function ($tile, callback) {
        var _this = this;
        var $graph_container_div = $tile.find(".graph-container");

        $tile.find(".graph-control").append("<div class='graph_choice' style='padding-top:10px;'><span>Display:</span><span class='choices'></span></div>");

        var data_interval = $tile.data("data_interval");
        zenith.AnalyticsDashboard.Resources.getTileReport({ tile_id: $tile.data("tile_id"), data_interval: data_interval }, function (data) {
            var tile_options = $tile.data("tile_options");
            var graphOptions = tile_options.graph_options;
            var data_options = tile_options.data_options;

            var graph_data = [];
            for (var i = 0; i < data_options.length; i++) {
                var data_option = data_options[i];
                graph_data[i] = _this.formatDataForGraph(data, data_option.y_axes_data, data_option.x_axes_data, data_option.metadata_value_fields);

                var $graph_choices = $tile.find(".graph-control").find(".choices");
                for (var seriesName in graph_data[i].series) {
                    var seriesOption = graph_data[i].series[seriesName];

                    if (seriesOption.options.stack_name) {
                        if ($graph_choices.find("[stack='" + seriesOption.options.stack_name + "']").length == 0) {
                            $graph_choices.append("<label><span style='padding-left:10px;'><input type='checkbox'" + (seriesOption.show ? "checked='checked' " : "") + " stack='" + seriesOption.options.stack_name + "' graph='" + graphOptions[i].graph_title + "'> " + seriesOption.options.stack_label + (seriesOption.split ? " (" + seriesOption.splitValue + ")" : "") + "</span></label>")
                        }
                    }
                    else {
                        $graph_choices.append("<label><span style='padding-left:10px;'><input type='checkbox'" + (seriesOption.show ? "checked='checked' " : "") + " value='" + seriesOption.name + "' graph='" + graphOptions[i].graph_title + "'> " + seriesOption.options.label + "</span></label>");
                    }
                }
            }

            $tile.data({ graphOptions: graphOptions, graph_data: graph_data });

            _this.branchSelection.UpdateBranchSelections();
            _this.CreateReport($tile, $graph_container_div);

            $.isFunction(callback) && callback();
        });

        $tile.find(".graph_choice").on("change", "input[type=checkbox]", function () {
            _this.CreateReport($tile, $graph_container_div);
        });
    };

    GenericTile.prototype.CreateReport = function ($tile, $graph_container_div) {
        var _this = this;
        var branches = _this.branchSelection.GetSelectedBranches();

        var graphOptions = $.extend(true, [], $tile.data("graphOptions"));
        var graph_data_array = $tile.data("graph_data");
        var has_data_table = false;

        for (var i = 0; i < graphOptions.length; i++) {
            var graphOption = graphOptions[i];
            var graph_data = graph_data_array[i];
            var series_stacks = {};

            var $selected_choices = $tile.find(".graph-control .choices input[type=checkbox][graph='" + graphOption.graph_title + "']:checked");

            var series = {};
            var seriesIndex = 0;
            for (var series_name in graph_data.series) {
                var currentSeries = graph_data.series[series_name];

                //create a new y-axis objects
                while (graphOption.graph_data.y.length <= currentSeries.y_axis) {
                    graphOption.graph_data.y.push([]);
                }

                //create new series object
                var series_obj = { data: [] };
                series_obj = $.extend(true, series_obj, currentSeries.options);
                series_obj.color = series_obj.color || zenith.AnalyticsDashboard.graph.color[seriesIndex];
                series[series_name] = series_obj;

                seriesIndex++;
            }

            _this.PrepareGraphFunctions(graphOption);

            //prepare graphOption
            for (var j = 0; j < graph_data.x_axes.length; j++) {
                var x_axis = graph_data.x_axes[j];

                //add options to the current x-axis
                var axisOptions = $.extend(true, {}, x_axis.options);

                //for each label (i.e. category) in the x-axis, populate the data for each series
                $.each(x_axis.labels, function (label_idx, x_axis_label) {
                    axisOptions.data.push([label_idx, x_axis_label]);

                    for (var series_name in graph_data.series) {
                        var currentSeries = graph_data.series[series_name];
                        if (j == currentSeries.x_axis) { //only process the current series if it is for the current axis
                            var dataForLabel = currentSeries.x_axis_labels[x_axis_label];//this data is a list of objects; one object for each possible group within this label (e.g. branches)
                            var series_obj = series[series_name];

                            series_obj.data.push([label_idx, []]);
                            for (var k = 0; dataForLabel && k < dataForLabel.length; k++) {
                                var value_object = dataForLabel[k];
                                //change this so that branches are not hardcoded (a variety of criteria should be possible such as state)
                                if (branches[value_object.branch]) {
                                    for (var h = 0; h < value_object.values.length; h++) {
                                        series_obj.data[label_idx][1][h] = (series_obj.data[label_idx][1][h] || 0) + value_object.values[h];
                                    }
                                    //series_obj.data[label_idx][1] += value_object.value;
                                }
                            }

                            var value = 0;
                            if (currentSeries.type == "total") {
                                var total = 0;
                                for (var k = 0; k < series_obj.data[label_idx][1].length; k++) {
                                    total += series_obj.data[label_idx][1][k];
                                }
                                value = total;
                            }
                            else if (currentSeries.type == "average") {
                                var average = 0;
                                var count = series_obj.data[label_idx][1].length;
                                for (var k = 0; k < series_obj.data[label_idx][1].length; k++) {
                                    var data_value = series_obj.data[label_idx][1][k];
                                    if (data_value !== null && data_value !== undefined) {
                                        average += data_value;
                                    }
                                    else {
                                        count--;
                                    }
                                }
                                value = count > 0 ? (average / count) : 0;
                            }
                            else if (currentSeries.type == "ratio") {
                                value = series_obj.data[label_idx][1][1] != 0 ? (series_obj.data[label_idx][1][0] / series_obj.data[label_idx][1][1]) : 0;
                            }

                            if (series_obj.chart_type == "stack") {
                                var stack = series_stacks[series_obj.stack_name] || { labels: {} };
                                stack.y_axis = currentSeries.y_axis;
                                stack.labels[x_axis_label] = stack.labels[x_axis_label] === undefined ? value : stack.labels[x_axis_label] + value;
                                series_stacks[series_obj.stack_name] = stack;
                            }
                            else {
                                series_obj.min = series_obj.min == undefined ? value : Math.min(series_obj.min, value);
                                series_obj.max = series_obj.max == undefined ? value : Math.max(series_obj.max, value);
                            }

                            series_obj.data[label_idx][1] = $.extend(true, { value: value }, currentSeries.metadata, currentSeries.category_metadata[x_axis_label]);
                        }
                    }
                });

                graphOption.graph_data.x.push(axisOptions);
            }

            for (var series_name in series) {
                var currentSeries = series[series_name];
                //only add series to y_axis if it is selected to be displayed
                if ((currentSeries.chart_type == "stack" && $selected_choices.filter("[stack='" + currentSeries.stack_name + "']:checked").length > 0) || $selected_choices.filter("[value='" + series_name + "']:checked").length > 0) {
                    var y_axis = graph_data.series[series_name].y_axis;
                    var axisOptions = graphOption.yAxisOptions[y_axis];
                    if (axisOptions.scale && currentSeries.chart_type != "stack") {
                        axisOptions.min = axisOptions.min === undefined ? currentSeries.min : Math.min(axisOptions.min, currentSeries.min);
                        axisOptions.max = axisOptions.max === undefined ? currentSeries.max : Math.max(axisOptions.max, currentSeries.max);
                    }

                    graphOption.graph_data.y[y_axis].push(currentSeries);
                }
            }

            for (stack_name in series_stacks) {
                var stack = series_stacks[stack_name];
                var axisOptions = graphOption.yAxisOptions[stack.y_axis];

                for (var label in stack.labels) {
                    stack.min = stack.min === undefined ? stack.labels[label] : Math.min(stack.min, stack.labels[label]);
                    stack.max = stack.max === undefined ? stack.labels[label] : Math.max(stack.max, stack.labels[label]);
                }

                axisOptions.min = axisOptions.min === undefined ? stack.min : Math.min(axisOptions.min, stack.min);
                axisOptions.max = axisOptions.max === undefined ? stack.max : Math.max(axisOptions.max, stack.max);
            }

            for (var j = 0; j < graphOption.yAxisOptions.length; j++) {
                var axisOptions = graphOption.yAxisOptions[j];
                if (axisOptions.scale) {
                    var diff = axisOptions.max - axisOptions.min;
                    axisOptions.min = (axisOptions.min < diff / 20 ? 0 : axisOptions.min - diff / 20);
                    axisOptions.max = (axisOptions.max + diff / 20);
                }
            }

            var $graph_div = $graph_container_div.find(".graph[graph-num=" + i + "]");

            if ($selected_choices.length == 0) {
                $graph_div.hide();
            }
            else {
                $graph_div.show();

                if ($graph_div.length == 0) {
                    $graph_div = $("<div class='graph' graph-num='" + i + "'></div>").appendTo($graph_container_div);
                }

                if (graphOption.show_details_table) {
                    has_data_table = true;
                }

                $graph_div.data(
                    "graph_api",
                    $graph_div.GraphDynamic(graphOption, function () {
                        _this.SetTableEvents($graph_container_div);
                        var $container = $tile.find(".data-table-container")
                        var $button = $tile.find(".toggle-table-visibility");
                        var $graph_details = $tile.find(".graph_details");
                        if ($button.attr("action") === "hide") {
                            _this.showDataTable($container, $button, $graph_details);
                        }
                    })
                );
            }
        }

        has_data_table ? $tile.find(".data-table-container").removeClass("hidden") : $tile.find(".data-table-container").addClass("hidden");

        $tile.data("currentGraphOptions", graphOptions);
    };

    GenericTile.prototype.PrepareGraphFunctions = function (graphOptions) {
        if (graphOptions) {
            //format for the y-axes' displays
            if (graphOptions.yAxisFormatterOptions && graphOptions.yAxisFormatterOptions.length) {
                $.each(graphOptions.yAxisFormatterOptions, function (i, yAxisFormatterOption) {
                    graphOptions.yAxisOptions[i].axisLabel = {
                        formatter: function (value) {
                            return (yAxisFormatterOption.prependText || "") + numeral(value).format(yAxisFormatterOption.format);
                        }
                    }
                });
            }

            if (graphOptions.tooltipFormatterOptions) {
                graphOptions.tooltip_formatter = {
                    content: function (params, ticket, callback) {
                        var tooltip = params[0].name;
                        $.each(params, function (i, series) {
                            for (var j = 0; j < graphOptions.tooltipFormatterOptions.series.length; j++) {
                                var seriesOptions = graphOptions.tooltipFormatterOptions.series[j];
                                for (var k = 0; k < seriesOptions.names.length; k++) {
                                    if (seriesOptions.names[k] == series.data.seriesName) {
                                        var seriesDisplayName = series.seriesName;
                                        if (seriesOptions.displayNameEval) {
                                            //initialize variables
                                            for (var variable in series.data) {
                                                eval("var " + variable + " = '" + series.data[variable] + "';");
                                            }

                                            //set value
                                            seriesDisplayName = eval(seriesOptions.displayNameEval);
                                        }

                                        var seriesDisplayData = numeral(series.data[seriesOptions.valueField]).format(seriesOptions.format);
                                        tooltip += "<br>" + seriesDisplayName + ": " + seriesDisplayData;
                                    }
                                }
                            }
                        });

                        if (graphOptions.tooltipFormatterOptions.additionalDisplays) {
                            for (var i = 0; i < graphOptions.tooltipFormatterOptions.additionalDisplays.length; i++) {
                                var additionalDisplay = graphOptions.tooltipFormatterOptions.additionalDisplays[i];

                                if (additionalDisplay.type == "changeOverYear") {
                                    //var value = params[additionalDisplay.dataIndex1].data.value - params[additionalDisplay.dataIndex2].data.value;
                                    var parameter1 = null;
                                    var parameter2 = null;

                                    for (var j = 0; j < params.length; j++) {
                                        if (params[j].data.seriesName == additionalDisplay.seriesNames[0]) {
                                            parameter1 = params[j].data[additionalDisplay.valueField];
                                        }
                                        else if (params[j].data.seriesName == additionalDisplay.seriesNames[1]) {
                                            parameter2 = params[j].data[additionalDisplay.valueField];
                                        }
                                    }

                                    if (parameter1 != null && parameter2 != null) {
                                        var value = parameter2 - parameter1;
                                        tooltip += "<br>" + additionalDisplay.displayName + ": <span style='font-weight:bold; color:" + (value >= 0 ? (additionalDisplay.positiveColor || "green") : (additionalDisplay.negativeColor || "red")) + ";'>" + (value >= 0 ? "+" : "-") + numeral(Math.abs(value)).format(additionalDisplay.format) + "</span>";
                                    }
                                }
                                else if (additionalDisplay.type == "combined") {
                                    for (var j = 0; additionalDisplay.variables && j < additionalDisplay.variables.length; j++) {
                                        var variable = additionalDisplay.variables[j];
                                        for (var k = 0; k < params.length; k++) {
                                            if (params[k].data.seriesName == variable.seriesName) {
                                                eval("var " + variable.name + " = " + params[k].data[variable.valueField] + ";");
                                            }
                                        }
                                    }

                                    var value = 0;
                                    var foundAllSeries = true;
                                    for (var j = 0; foundAllSeries && j < additionalDisplay.seriesNames.length; j++) {
                                        var found = false;
                                        for (var k = 0; !found && k < params.length; k++) {
                                            if (params[k].data.seriesName == additionalDisplay.seriesNames[j]) {
                                                found = true;
                                                value += params[k].data[additionalDisplay.valueField];
                                            }
                                        }

                                        if (!found) {
                                            foundAllSeries = false;
                                        }
                                    }

                                    if (additionalDisplay.displayNameEval) {
                                        additionalDisplay.displayName = eval(additionalDisplay.displayNameEval);
                                    }

                                    tooltip += "<br>" + additionalDisplay.displayName + ": " + numeral(value).format(additionalDisplay.format);
                                }
                            }
                        }

                        return tooltip;
                    }
                };
            }
            else {
                graphOptions.tooltip_formatter = {
                    content: null
                };
            }
        }
    };

    GenericTile.prototype.SetTableEvents = function ($graph_container_div) {
        $graph_container_div.parent().find(".data-element").on("click", function () {
            var $this = $(this);
            console.log($this.attr("x_data"));
            console.log($this.attr("series"));
        });
    };

    GenericTile.prototype.ShowGraph = function ($tile, $graph_container_div) {
        var _this = this;
        $graph_container_div.find(".graph").stop();
        $graph_container_div.parent().find(".hide_graph_message").remove();
        $graph_container_div.show();
        $graph_container_div.animate({ opacity: 1 }, 500);
        $tile.find(".data-table-container").show();
    };

    GenericTile.prototype.HideGraph = function ($tile, $graph_container_div, message) {
        var _this = this;
        $graph_container_div.find(".graph").stop();
        $graph_container_div.animate({ opacity: 0 }, 500, function () {
            $tile.find(".data-table-container").hide();
            $graph_container_div.siblings(".hide_graph_message").remove();
            $graph_container_div.parent().append("<div class='hide_graph_message' style='padding-top:50px;padding-bottom:50px;text-align:center;'><p>" + message + "</p></div>");
            $graph_container_div.hide();

            _this.branchSelection.EnableAllBranches();
        });
    };

    GenericTile.prototype.onResize = function ($tile) {
        var _this = this;

        $(window).on("resize.dashboard-tile-" + $tile.attr("data-user-tile-id"), function () {
            if ($tile.is(".expanded:visible")) {
                var $graph_container_div = $tile.find(".graph-container");
                var graphOptions = $tile.data("currentGraphOptions");
                if (graphOptions && graphOptions.length > 0) {
                    $graph_container_div.css({ width: $tile.width() });

                    for (var i = 0; i < graphOptions.length; i++) {
                        var graphOption = graphOptions[i];
                        var $graph_div = $graph_container_div.find(".graph[graph-num=" + i + "]");
                        $graph_div.data("graph_api", $graph_div.GraphDynamic(graphOption));
                    }
                }
            }
        });
    };

    GenericTile.prototype.formatDataForGraph = function (data, y_axes_data, x_axes_data, metadata_value_fields) {
        var _this = this;
        var series = {};
        var x_axes = [];

        //create axis object for all x-axes and append it to x_axes
        $.each(x_axes_data, function (idx, x_axis_data) {
            var x_axis = { labels: [], options: $.extend(true, {}, x_axis_data.options) };
            x_axis.options.data = [];
            x_axes.push(x_axis);
        });

        $.each(data, function (i, data_row) {
            var splitNames = {};
            $.each(y_axes_data, function (j, currentSeriesData) {
                //get series object and x-axis object
                var currentSeriesName = currentSeriesData.name;

                if (!currentSeriesData.split || splitNames[currentSeriesData.splitName] != true) {
                    if (currentSeriesData.split) {
                        currentSeriesData.splitValue = data_row[currentSeriesData.splitField];
                    }

                    var currentSeries = _this.addToSeriesObject(series, currentSeriesData, data_row);

                    if (!currentSeries.split || currentSeries.splitValue == currentSeriesData.splitValue) {
                        if (currentSeriesData.split) {
                            splitNames[currentSeriesData.splitName] = true;
                        }

                        var x_axis_data = x_axes_data[currentSeriesData.x_axis];
                        var x_axis = x_axes[currentSeriesData.x_axis];

                        //add the current x-axis label to the x-axis object and the series object
                        var x_axis_label = data_row[x_axis_data.label];
                        _this.addLabelToXAxisAndSeries({ label: x_axis_label, order: data_row[x_axis_data.order] }, x_axis.labels, currentSeries.x_axis_labels, data_row, currentSeries.category_metadata, currentSeriesData.metadata_category_fields);

                        //create object to store an object with values and value-specific metadata
                        var value_obj = { values: [] };

                        for (var k = 0; k < currentSeriesData.fields.length; k++) {
                            var field = currentSeriesData.fields[k];
                            value_obj.values.push(data_row[field]);
                        }

                        for (var k = 0; metadata_value_fields && k < metadata_value_fields.length; k++) {
                            var metadata = metadata_value_fields[k];
                            value_obj[metadata] = data_row[metadata];
                        };
                        currentSeries.x_axis_labels[x_axis_label].push(value_obj);
                    }
                }
            });
        });

        return { series: series, x_axes: x_axes };
    };

    GenericTile.prototype.addToSeriesObject = function (series, series_data, data_row) {
        var series_obj = null;

        if (!series[series_data.name]) {
            series[series_data.name] = $.extend(true, { x_axis_labels: {}, category_metadata: {} }, series_data);
            series[series_data.name].options.data = [];

            if (series_data.split) {
                series[series_data.name].options.label += (" (" + series_data.splitValue + ")")
            }

            series[series_data.name].metadata = { seriesName: series_data.name, label: series_data.options.label };
            for (var i = 0; series_data.metadata_series_fields && i < series_data.metadata_series_fields.length; i++) {
                var metadata_field = series_data.metadata_series_fields[i];
                series[series_data.name].metadata = series[series_data.name].metadata;
                series[series_data.name].metadata[metadata_field] = data_row[metadata_field];
            }
        }

        return series[series_data.name];
    };

    GenericTile.prototype.addLabelToXAxisAndSeries = function (label_obj, labelsList, series, data_row, category_metadata, metadata_category_fields) {
        var found = false;
        var label = label_obj.label;
        var label_order = label_obj.order;
        if (label) {
            for (var i = 0; !found && i < labelsList.length; i++) {
                if (labelsList[i] == label) {
                    found = true;
                }
            }

            if (!found) {
                labelsList[label_order - 1] = label;
            }
        }

        if (!series[label]) {
            series[label] = [];
            category_metadata[label] = {};
            for (var i = 0; metadata_category_fields && i < metadata_category_fields.length; i++) {
                category_metadata[label][metadata_category_fields[i]] = data_row[metadata_category_fields[i]];
            }
        }
    };

    return GenericTile;
}());