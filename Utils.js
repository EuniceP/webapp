var zenith = zenith || {};
zenith.AnalyticsDashboard = zenith.AnalyticsDashboard || {};
zenith.AnalyticsDashboard.Utils = {
    getBranchList: function (callback) {
        if (zenith.AnalyticsDashboard.Utils.branchList && zenith.AnalyticsDashboard.Utils.branchList.length > 0) {
            $.isFunction(callback) && callback(zenith.AnalyticsDashboard.Utils.branchList);
        }
        else {
            zenith.AnalyticsDashboard.Resources.getBranchList(function (branches) {
                zenith.AnalyticsDashboard.Utils.branchList = branches;
                $.isFunction(callback) && callback(branches);
            });
        }
    },

    getNumWithSetDec: function (num, numOfDec) {
        var pow10s = Math.pow(10, numOfDec || 0);
        return (numOfDec || numOfDec === 0) ? Math.round(pow10s * num) / pow10s : num;
    },

    addCommasToNumber: function (newNumber) {
        if (newNumber && newNumber !== "") {
            //add commas to the value
            var split = newNumber.toString().split('.');
            while (/(\d+)(\d{3})/.test(split[0].toString())) {
                split[0] = split[0].toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
            }

            if (split.length == 2) { //if there were decimals
                newNumber = split[0] + "." + split[1]; //add decimals back
            }
            else {
                newNumber = split[0];
            }
        }

        return newNumber;
    },

    convertNumberToCurrencyFormat: function (number, numberOfDecimals) {
        if (number || number === 0) {
            var negativeSign = "";

            if (number < 0) {
                number *= -1;
                negativeSign = "-";
            }

            var currency = zenith.AnalyticsDashboard.Utils.getNumWithSetDec(number, numberOfDecimals);
            return currency !== "" ? negativeSign + "$" + zenith.AnalyticsDashboard.Utils.addCommasToNumber(currency) : "";
        }
        else {
            return "";
        }
    },

    loadCss: function (url) {
        var $head = $("head");
        if ($head.find("link[href='" + url + "']").length == 0) {
            $head.append("<link rel='stylesheet' type='text/css' href='" + url + "'>");
        }
    }
};