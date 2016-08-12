$(document).ready(function () {
    $.keyframe.define([{
        name: "spin",
        "100%": { "transform": "rotate(45deg)" }
    }]);
    $.keyframe.define([{
        name: "spin-reverse",
        "100%": { "transform": "rotate(-45deg)" }
    }]);
    $(".cog").pauseKeyframe();

    zenith.AnalyticsDashboard.Controller.init();
});