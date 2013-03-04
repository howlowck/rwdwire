define(['backbone','models/Tool'], function (Backbone, Tool)
	{
		var ToolView = Backbone.View.extend({
			tagName: "button",
			className: "tool-view",
			template: _.template($("#toolViewTemp").html()),
			taskToAction: {
				"Edit Widths": "EditWidthButton:click",
				"New Element": "NewElementButton:click",
				"Save Layout": "SaveLayoutButton:click",
				"Login": "LoginButton:click",
				"UserInfo": "UserInfo:click",
				"Instructions": "InstructionsButton:click"
			},
			events: {
				"click": "dispatcherTrigger"
			},
			initialize: function (options) {
				this.dispatch = options.dispatch;
				this.render();
				this.listenTo(this.model, "change", this.render);
			},

			dispatcherTrigger: function () {
				if (!!this.taskToAction[this.model.get("task")]) {
					this.dispatch.trigger(this.taskToAction[this.model.get("task")], {model: this.model});
				} else {
					console.log("sorry don't know what the button is");
				}
			},

			render: function () {
				this.$el.html(this.template(this.model.toJSON()));
				return this;
			}

		});
		return ToolView;
	}
);