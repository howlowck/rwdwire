define(['backbone'], function (Backbone) 
	{
		var ActionsOverlayView = Backbone.View.extend({
			el:$(".actions-overlay"),
			events: {
				"click .close" : "close"
			},
			close: function (e) {
				this.$el.addClass("hidden");
			},
			show: function () {
				this.$el.removeClass("hidden");
			},
			changeShare: function (){
				this.$el.find("#AppShare").addClass("hidden");
				this.$el.find("#LayoutShare").removeClass("hidden");
			}
		});
		return ActionsOverlayView;
	}
);