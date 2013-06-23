define(['backbone'], function (Backbone)
    {
        var SideBar = Backbone.View.extend({
            el: $(".side-bar"),
            initialize: function (options) {
                var ins = this;
                ins.dispatch = options.dispatch;
                ins.$("button").hover(function () {
                    ins.showToolTip($(this));
                }, function () {
                    ins.hideToolTip();
                });
            },
            events: {
                "click button" : "buttonTrigger"
            },
            hide: function () {
                this.$el.addClass("hide");
            },
            show: function () {
                this.$el.removeClass("hide");
            },
            buttonTrigger: function (e) {
                this.dispatch.trigger($(e.currentTarget).data("trigger"));
            },
            showToolTip: function ($this) {
                var $tooltip = this.$(".side-tooltip");
                $tooltip.html($this.data("title")).css("top", $this.position().top + "px").removeClass("hidden");
            },
            hideToolTip: function () {
                this.$(".side-tooltip").addClass("hidden");
            }
        });
        return SideBar;
    }
);