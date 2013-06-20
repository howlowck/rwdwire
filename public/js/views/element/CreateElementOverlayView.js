define(['backbone'], function (Backbone)
	{
		var CreateElementOverlayView = Backbone.View.extend({
			el: $(".element-overlay"),
			events: {
				"click .close": "close",
				"mousedown" : "startCreateElement",
				"mouseup" : "endCreateElement",
				"mousemove" : "drawShadowElement"
			},
			initialize: function (options) {
				this.dispatch = options.dispatch;
			},
			startCreateElement: function (e) {
				this.drawing = {
					start: {
						x: e.originalEvent.clientX - 1,
						y: e.originalEvent.clientY - 1,
						mousex: e.originalEvent.clientX - 1,
						mousey: e.originalEvent.clientY - 1
					}
				};
				this.$el.children(".shadow-element")
						.removeClass("hidden")
						.css({	"left": this.drawing.start.x,
								"top": this.drawing.start.y
							});
				this.drawing.start.x = this.$el.children(".shadow-element").offset().left;
				this.drawing.start.y = this.$el.children(".shadow-element").offset().top;
			},
			drawShadowElement: function (e) {
				if (!this.drawing) {
					return false;
				}
				this.$el.children(".shadow-element").css({
					"width": e.originalEvent.clientX - this.drawing.start.mousex,
					"height": e.originalEvent.clientY - this.drawing.start.mousey
				});
			},
			endCreateElement: function () {
				var width = parseInt(this.$el.children(".shadow-element").css("width"), 10),
					height = parseInt(this.$el.children(".shadow-element").css("height"), 10);

				this.$el.children(".shadow-element")
						.addClass("hidden")
						.css({"width": 0, "height": 0, "top": 0, "left" : 0});
				this.close();
				if (parseInt(width, 10) < 10 || parseInt(height, 10) < 10) {
					this.drawing = false;
					return false;
				}
				this.dispatch.trigger("CreateElementOverlayView:createElement", {
					rawx: this.drawing.start.x,
					rawy: this.drawing.start.y,
					width: width,
					height: height
				});
				this.drawing = false;
			},
			open: function () {
				this.dispatch.trigger("overlay:open");
				this.$el.removeClass("hidden");
			},
			close: function () {
				this.$el.addClass("hidden");
				this.dispatch.trigger("overlay:close");
			}
		});
		return CreateElementOverlayView;
	}
);