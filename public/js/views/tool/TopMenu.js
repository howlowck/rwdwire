define(['backbone'], function (Backbone)
    {
        var TopMenu = Backbone.View.extend({
            el: $(".main-menu"),
            initialize: function (options) {
                this.dispatch = options.dispatch;
                var ins = this;
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
                $mainNav = this.$el.parent();
                $mainNav.addClass("hide");
            },
            show: function () {
                $mainNav = this.$el.parent();
                $mainNav.removeClass("hide");
            },
            buttonTrigger: function (e) {
                this.dispatch.trigger($(e.currentTarget).data("trigger"));
            },
            showToolTip: function ($this) {
                var $tooltip = this.$(".top-tooltip");
                $tooltip.html($this.data("title")).css("left", $this.offset().left - this.$el.offset().left - 30 + "px").removeClass("hidden");
            },
            hideToolTip: function () {
                this.$(".top-tooltip").addClass("hidden");
            }
        });
        return TopMenu;
    }
);