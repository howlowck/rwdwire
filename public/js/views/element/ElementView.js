define(['backbone','models/Element','jqueryui'], function (Backbone, Element)
	{
		var ElementView = Backbone.View.extend({
			className: "element-view",
			template: _.template($("#elementViewTemp").html()),
			cssAnimateSetting:{
				"-webkit-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s, opacity 0.5s", /* Safari and Chrome */
				"-moz-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s, opacity 0.5s", /* Firefox 4 */
				"-ms-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s, opacity 0.5s", /* MS */
				"-o-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s, opacity 0.5s", /* Opera */
				"transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s, opacity 0.5s"
			},
			events: {
				"click .remove-element" : "removeElement",
				"dblclick": "editContent"
			},

			initialize: function (options) {
				
				this.dispatch = options.dispatch;
				this.listenTo(this.model, "reset change", this.render);
				this.listenTo(this.model, "destroy", this.remove);

				this.$el.append('<div class="inner"></div>');
				this.render();

				this.$el.css({"position": "absolute"}).css(this.cssAnimateSetting);
			},
			dispatcherTriggerResize: function (ui) {
				this.dispatch.trigger("ElementView:resize", {cid: this.model.cid, ui: ui});
			},
			dispatcherTriggerMove: function (ui) {
				this.dispatch.trigger("ElementView:move", {cid: this.model.cid, ui: ui});
			},

			editContent: function () {
				this.dispatch.trigger("element:edit", {cid: this.model.cid});
			},
			
			removeElement: function (){
				this.model.destroy();
			},
			
			render: function () {
				var self = this,
					visibleValue = this.model.get("disable")? "hidden" :"visible";
				this.$el.children(".inner").html(this.template(this.model.toJSON()))
						.position({left: this.model.get("x"), top: this.model.get("y")});
				this.$el.attr("title", "Double Click to Edit Element").css({
					"background-color": this.model.get("bcolor"),
					"left" : this.model.get("x"),
					"top" : this.model.get("y"),
					"width": this.model.get("width"),
					"height": this.model.get("height"),
					"z-index": this.model.get("zindex"),
					"opacity": this.model.get("opacity"),
					"visibility": visibleValue});
				
				this.$el.resizable({
					ghost: true,
					handles: 'n, e, s, w, ne, se, sw, nw ',
					stop: function (event, ui) {
						self.dispatcherTriggerResize(ui);
					}
				}).draggable({
					//stack: ".element-view",
					start: function () {
						self.$el.css({
							"-webkit-transition": "none", /* Safari and Chrome */
							"-moz-transition": "none", /* Firefox 4 */
							"-ms-transition": "none", /* MS */
							"-o-transition": "none", /* Opera */
							"transition": "none"
						});
					},
					stop: function (event, ui) {
						self.$el.css(self.cssAnimateSetting);
						self.dispatcherTriggerMove(ui);
					}
				});
				return this;
			}
		});
		return ElementView;
	}
);