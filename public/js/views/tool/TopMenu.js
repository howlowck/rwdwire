define(['backbone'], function (Backbone)
    {
        var TopMenu = Backbone.View.extend({
            el: $(".main-menu"),
            initialize: function (options) {
                this.dispatch = options.dispatch;
            },
            events: {
                "click button" : "buttonTrigger"
            },
            buttonTrigger: function (e) {
                this.dispatch.trigger($(e.currentTarget).data("trigger"));
            }
        });
        return TopMenu;
    }
);