define(['backbone'], function (Backbone) 
	{
		var SocialOverlayView = Backbone.View.extend({
			el:$(".social-overlay"),
			events: {
				"click .close" : "close"
			},
			close: function (e) {
				this.$el.addClass("hidden");
			},
			// show: function () {
			// 	this.$el.removeClass("hidden");
			// },
			open: function () {
				this.$el.removeClass("hidden");
			},
			changeShare: function (){
				this.$el.find("#LayoutShare").removeClass("disable").removeAttr("disabled");
			}
		});
		return SocialOverlayView;
	}
);