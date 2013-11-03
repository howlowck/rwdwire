define(['backbone','models/Element','jqueryui'], function (Backbone, Element)
	{
		var ElementView = Backbone.View.extend({
			className: "element-view",
			template: _.template($("#elementViewTemp").html()),
			events: {
				"click .remove-element" : "removeElement",
				"dblclick": "editContent"
			},
			initialize: function (options) {
				this.dispatch = options.dispatch;
				console.log("i'm initializing it???");
				this.listenTo(this.model, "reset", this.render);
				this.listenTo(this.model, "change", this.refresh);
				this.listenTo(this.model, "destroy", this.remove);

				this.$el.append('<div class="inner"></div>');
				this.render();

				this.$el.css({"position": "absolute"});
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
			removeElement: function () {
				this.model.destroy();
			},
			showHandle: function () {
				this.$el.addClass("show-handle");
			},
			hideHandle: function () {
				this.$el.removeClass("show-handle");
			},
			iniHandles: function () {
				var ins = this,
					$element,
					$ghost,
					oriWidth,
					oriHeight,
					oriX,
					oriY;
				ins.$el.append($("#resizableMarkers").html());
				ins.$(".marker-w").draggable({
					"axis": "x",
					"start": function () {
						$element = $(this).parent().parent();
						$ghost = $element.find(".element-resize-ghost");
						$ghost.removeClass("hidden");
						oriWidth = ins.model.get("width");
						oriHeight = ins.model.get("height");
						oriX = ins.model.get("x");
						oriY = ins.model.get("y");
						$element.addClass("no-transition");
					},
					"drag" : function (e, ui) {
						$ghost.css({
							left: (ui.position.left + 2) + 'px',
							width: (oriWidth - ui.position.left - 2) + "px",
							height: (oriHeight - 2)  + "px"
						});
					},
					"stop" : function (e, ui) {
						$ghost.addClass("hidden");
						$element.css("width", $ghost.css("width"));
						$(this).css("left", "-5px");
						$element.removeClass("no-transition");
						ui = {
							size: {
								width: parseInt($ghost.css("width"), 10) - 1,
								height: oriHeight
							},
							position: {
								left: oriX + parseInt($ghost.css('left'), 10) + 1,
								top: oriY
							}
						};
						ins.dispatcherTriggerResize(ui);
					}
				});
				ins.$(".marker-e").draggable({
					"axis" : "x",
					"start": function () {
						$element = $(this).parent().parent();
						$ghost = $element.find(".element-resize-ghost");
						$ghost.removeClass("hidden");
						oriWidth = ins.model.get("width");
						oriHeight = ins.model.get("height");
						oriX = ins.model.get("x");
						oriY = ins.model.get("y");
						$element.addClass("no-transition");
					},
					"drag" : function (e, ui) {
						$ghost.css({
							left: "0px",
							width : (oriWidth + (ui.position.left - ui.originalPosition.left)) + "px",
							height: (oriHeight - 2)  + "px"
						});
					},
					"stop" : function (e, ui) {
						$ghost.addClass("hidden");
						$element.css("width", $ghost.css("width"));
						$(this).css("left", "-3px");
						$element.removeClass("no-transition");
						ui = {
							size: {
								width: parseInt($ghost.css("width"), 10) + 1,
								height: oriHeight
							},
							position: {
								left: oriX,
								top: oriY
							}
						};
						ins.dispatcherTriggerResize(ui);
					}
				});
				ins.$(".marker-s").draggable({
					"axis" : "y",
					"start": function () {
						$element = $(this).parent().parent();
						$ghost = $element.find(".element-resize-ghost");
						$ghost.removeClass("hidden");
						oriWidth = ins.model.get("width");
						oriHeight = ins.model.get("height");
						oriX = ins.model.get("x");
						oriY = ins.model.get("y");
						$element.addClass("no-transition");
					},
					"drag" : function (e, ui) {
						$ghost.css({
							left: "0px",
							height: (oriHeight + (ui.position.top - ui.originalPosition.top)) + "px",
							width: (oriWidth - 2)  + "px"
						});
					},
					"stop" : function (e, ui) {
						$ghost.addClass("hidden");
						$element.css("height", $ghost.css("height"));
						$(this).css("top", "-4px");
						$element.removeClass("no-transition");
						ui = {
							size: {
								width: oriWidth,
								height: parseInt($ghost.css("height"), 10) + 1
							},
							position: {
								left: oriX,
								top: oriY
							}
						};
						ins.dispatcherTriggerResize(ui);
					}
				});
				ins.$(".marker-se").draggable({
					"start": function () {
						$element = $(this).parent().parent();
						$ghost = $element.find(".element-resize-ghost");
						$ghost.removeClass("hidden");
						oriWidth = ins.model.get("width");
						oriHeight = ins.model.get("height");
						oriX = ins.model.get("x");
						oriY = ins.model.get("y");
						$element.addClass("no-transition");
					},
					"drag" : function (e, ui) {
						$ghost.css({
							left: "0px",
							width: (oriWidth + (ui.position.left - ui.originalPosition.left)) + "px",
							height: (oriHeight + (ui.position.top - ui.originalPosition.top)) + 1 + "px"
						});
					},
					"stop" : function (e, ui) {
						$ghost.addClass("hidden");
						$element.css("height", $ghost.css("height"));
						$(this).css({
							"right": "-5px",
							"bottom": "-4px",
							"left": "auto",
							"top": "auto"
						});
						$element.removeClass("no-transition");
						ui = {
							size: {
								width: parseInt($ghost.css("width"), 10) + 1,
								height: parseInt($ghost.css("height"), 10) + 1
							},
							position: {
								left: oriX,
								top: oriY
							}
						};
						ins.dispatcherTriggerResize(ui);
					}
				});
			},
			render: function () {
				var ins = this,
					visibleValue = this.model.get("disable") ? "hidden" : "visible";
				ins.$el.children(".inner").html(ins.template(ins.model.toJSON()))
						.position({left: ins.model.get("x"), top: ins.model.get("y")});
				ins.$el.attr("title", "Double Click to Edit Element").css({
					"background-color": ins.model.get("bcolor"),
					"left" : ins.model.get("x"),
					"top" : ins.model.get("y"),
					"width": ins.model.get("width"),
					"height": ins.model.get("height"),
					"z-index": ins.model.get("zindex"),
					"opacity": ins.model.get("opacity"),
					"visibility": visibleValue
				});
				ins.$el.draggable({
					handle: ".handle-drag",
					start: function () {
						ins.$el.addClass("no-transition");
					},
					stop: function (event, ui) {
						ins.$el.removeClass("no-transition");
						ins.dispatcherTriggerMove(ui);
					}
				}).hover(function () {
					ins.showHandle();
				}, function () {
					ins.hideHandle();
				});
				ins.iniHandles();
				return ins;
			},
			refresh: function () {
				var visibleValue = this.model.get("disable") ? "hidden" : "visible";
				this.$el.children(".inner").html(this.template(this.model.toJSON()))
					.position({left: this.model.get("x"), top: this.model.get("y")});
				this.$el.css({
					"background-color": this.model.get("bcolor"),
					"left" : this.model.get("x"),
					"top" : this.model.get("y"),
					"width": this.model.get("width"),
					"height": this.model.get("height"),
					"z-index": this.model.get("zindex"),
					"opacity": this.model.get("opacity"),
					"visibility": visibleValue
				});
			}
		});
		return ElementView;
	}
);