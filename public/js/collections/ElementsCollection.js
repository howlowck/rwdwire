define(['backbone', 'models/Element'], function (Backbone, Element)
	{
		var ElementsCollection = Backbone.Collection.extend({
			model: Element,
			comparator: function (model) {
				return -model.get("zindex");
			},
			cleanReset: function (data) {
				var model;
				while (!!(model = this.pop())) {
					model.destroy();
				}
				this.reset(data);
			}
		});
		return ElementsCollection;
	}
);