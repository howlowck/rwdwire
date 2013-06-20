define(['backbone'], function (Backbone) 
	{
		var InstructionOverlayView = Backbone.View.extend({
			el:$(".instruction-overlay"),
			currentPane: 0,
			events: {
				"click .next": "goToNext",
				"click .close": "close"
			},
			getClassName: function (number) {
				return ".pane-" + number;
			},
			goToBeginning: function () {
				this.currentPane = 0;
			},
			goToNext: function () {
				this.$el.find(this.getClassName(this.currentPane)).addClass("hidden");
				if (this.currentPane === this.$el.find(".pane").length - 1) {
					this.currentPane = 0;
					this.$el.find(".next").html('<i class="icon-arrow-right"></i> Next');
				} else {
					this.currentPane = this.currentPane + 1;
				}
				this.$el.find(this.getClassName(this.currentPane)).removeClass("hidden");
				if (this.currentPane === this.$el.find(".pane").length - 1) {
					this.$el.find(".next").html('<i class="icon-repeat"></i> Start Over');
				}
			},
			close: function () {
				this.$el.find(this.getClassName(this.currentPane)).addClass("hidden");
				this.$el.addClass("hidden");
			},
			open: function () {
				this.$el.find(this.getClassName(this.currentPane)).removeClass("hidden");
				this.$el.removeClass("hidden");
			}
			// show: function () {
			// 	this.$el.find(this.getClassName(this.currentPane)).removeClass("hidden");
			// 	this.$el.removeClass("hidden");
			// }
		});
		return InstructionOverlayView;
	}
);