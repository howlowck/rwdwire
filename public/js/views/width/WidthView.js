define(['models/Width'], function (Width)
	{
		var WidthView = Backbone.View.extend({
			className: "width-view",
			
			events: {
				"click" : "updateViewportDim"
			},
			
			template: _.template($("#widthViewTemp").html()),
			initialize: function (options) {
				this.dispatch = options.dispatch;
				this.listenTo(this.model, "change", this.render);
			},
			dimension: function () {
				return this.model.get("xmax") - this.model.get("xmin");
			},
			updateViewportDim: function () {
				this.dispatch.trigger("WidthView:click", {width: this.model.get("xmax"), height: this.model.get("y"), color: this.model.get("viewportColor")});
			},
			render: function () {
				this.$el.html(this.template(this.model.toJSON()));
				this.$el.css({"width": this.dimension()});
				this.$el.attr("title", this.model.get("title")+ " (click to activate)");
				return this;
			}
		});

		return WidthView;
	}
);
