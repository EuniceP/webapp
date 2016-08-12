var zenith = zenith || {};
zenith.AnalyticsDashboard = zenith.AnalyticsDashboard || {};
zenith.AnalyticsDashboard.Resources = {

    baseUrl: "WCF_DASHBOARD/",
    useCrossDomain: true,

    getUserInfo: function (log_in_name, callback, errorCallback) {
        return $.ajax({
            type: "GET",
            data: { log_in_name: log_in_name },
            url: this.baseUrl + "Service.svc/GetUserInfo",
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },

    getUserList: function (callback, errorCallback) {
        return $.ajax({
            type: "GET",
            url: this.baseUrl + "Service.svc/GetUserList",
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },

    getTileSummary: function (data, callback, errorCallback) {
        return $.ajax({
            type: "GET",
            url: this.baseUrl + "Service.svc/GetTileSummary",
            data: data,
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },

    getTileReport: function (data, callback, errorCallback) {
        return $.ajax({
            type: "GET",
            url: this.baseUrl + "Service.svc/GetTileReport",
            data: data,
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },

    getBranchList: function (callback, errorCallback) {
        return $.ajax({
            type: "GET",
            url: this.baseUrl + "Service.svc/GetBranchList",
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },

    getBranchGrouping: function (callback, errorCallback) {
        return $.ajax({
            type: "GET",
            url: this.baseUrl + "Service.svc/GetBranchGrouping",
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },

    getTiles: function (callback, errorCallback) {
        var user = zenith.AnalyticsDashboard.User;
        return $.ajax({
            type: "GET",
            url: this.baseUrl + "Service.svc/GetDashboardTiles",
            data: { user_id: user.log_in_name, department: user.dept_name, branch_code: user.location_cd, region: user.region },
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },

    saveTile: function (data, callback, errorCallback) {
        return $.ajax({
            type: "POST",
            contentType : "application/x-www-form-urlencoded",
            url: this.baseUrl + "Service.svc/SaveTile",
            data: JSON.stringify(data),
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            }
        });
    },

    saveTileBranches: function (data, callback, errorCallback) {
        return $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            url: this.baseUrl + "Service.svc/SaveTileBranches",
            data: JSON.stringify(data),
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            }
        });
    },

    deleteTile: function (tileID, callback, errorCallback) {
        return $.ajax({
            type: "GET",
            url: this.baseUrl + "Service.svc/DeleteTile",
            data: { user_tile_id: tileID, user_id: zenith.AnalyticsDashboard.User.log_in_name },
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },

    getDashboardDepartments: function (callback, errorCallback) {
        return $.ajax({
            type: "GET",
            url: this.baseUrl + "Service.svc/getDashboardDepartments",
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },

    getTilesForDepartment: function (department_id, callback, errorCallback) {
        return $.ajax({
            type: "GET",
            url: this.baseUrl + "Service.svc/GetTilesForDepartment",
            data: { department_id: department_id },
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },

    getMenu: function (data, callback, errorCallback) {
        return $.ajax({
            type: "GET",
            url: this.baseUrl + "Service.svc/GetMenu",
            data: data,
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },

    getAlerts: function (data, callback, errorCallback) {
        return $.ajax({
            type: "GET",
            url: this.baseUrl + "Service.svc/GetAlerts",
            data: data,
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },

    getAlertTypes: function (log_in_name, callback, errorCallback) {
        return $.ajax({
            type: "GET",
            data: { log_in_name: log_in_name },
            url: this.baseUrl + "Service.svc/GetAlertTypes",
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },

    saveUserAlert: function (data, callback, errorCallback) {
        return $.ajax({
            type: "GET",
            data: data,
            url: this.baseUrl + "Service.svc/SaveUserAlert",
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },

    searchReports: function (data, callback, errorCallback) {
        return $.ajax({
            type: "GET",
            data: data,
            url: this.baseUrl + "Service.svc/SearchReports",
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },

    addUserReport: function (data, callback, errorCallback) {
        return $.ajax({
            type: "GET",
            data: data,
            url: this.baseUrl + "Service.svc/AddUserReport",
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },
    deleteUserReport: function (data, callback, errorCallback) {
        return $.ajax({
            type: "GET",
            data: data,
            url: this.baseUrl + "Service.svc/DeleteUserReport",
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },
    updateUserReport: function (data, callback, errorCallback) {
        return $.ajax({
            type: "GET",
            data: data,
            url: this.baseUrl + "Service.svc/UpdateUserReport",
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },
    getUserReport: function (data, callback, errorCallback) {
        return $.ajax({
            type: "GET",
            data: data,
            url: this.baseUrl + "Service.svc/GetUserReport",
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    },
    getDataIntervalsForTile: function (data, callback, errorCallback) {
        return $.ajax({
            type: "GET",
            data: data,
            url: this.baseUrl + "Service.svc/GetDataIntervalsForTile",
            success: function (data, textStatus, jqXHR) {
                $.isFunction(callback) && callback(data, textStatus, jqXHR);
            },
            error: function () {
                $.isFunction(errorCallback) && errorCallback.apply(this, arguments);
            },
            dataType: this.useCrossDomain ? "jsonp" : "json"
        });
    }
};