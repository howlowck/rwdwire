define(['backbone'], function (Backbone)
	{
		var Element = Backbone.Model.extend({
			previousState : "",
			currentState : "defaults",
			defaults: {
				name: "change me",
				disable: false,
				width: 200,
				height: 200,
				x: 10,
				y: 10,
				type: "div",
				content: "Hi! I'm a new Element.  Edit me.",
				bcolor: "#eeeeee",
				zindex: 10,
				opacity: 1
			},
			updateCurrentState: function (width) {
				/* save the model config on the prevous state and updates the model to the current state. */

				//Store dimension to current (soon previous state)
				
				this.previousState = this.currentState;

				this.savePrevState();

				//change current state and set dimension to stored dimension if exists
				this.currentState = "state"+width.toString();
				if (!!this.get(this.currentState+"_width")) {
					this.set({
							width: this.get(this.currentState+"_width"),
							height: this.get(this.currentState+"_height"),
							x: this.get(this.currentState+"_x"),
							y: this.get(this.currentState+"_y"),
							zindex: this.get(this.currentState+"_zindex"),
							opacity: this.get(this.currentState+"_opacity")
						});
				}
			},
			savePrevState: function () {
				if (this.previousState !== "defaults") {
					this.set(this.previousState+"_x",  this.get("x"))
						.set(this.previousState+"_y",  this.get("y"))
						.set(this.previousState+"_width", this.get("width"))
						.set(this.previousState+"_height", this.get("height"))
						.set(this.previousState+"_zindex", this.get("zindex"))
						.set(this.previousState+"_opacity", this.get("opacity"));
				}
			},
			saveCurrentState: function () {
				this.set(this.currentState+"_x",  this.get("x"))
					.set(this.currentState+"_y",  this.get("y"))
					.set(this.currentState+"_width", this.get("width"))
					.set(this.currentState+"_height", this.get("height"))
					.set(this.currentState+"_zindex", this.get("zindex"))
					.set(this.currentState+"_opacity", this.get("opacity"));
			}
		});
		return Element;
	}
);