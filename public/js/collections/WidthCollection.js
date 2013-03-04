define(['backbone','models/Width'], function(Backbone, Width){
	
	var WidthCollection = Backbone.Collection.extend({
							model : Width,
							comparator: function (model) {
								return model.get("xmax");
							},
							cleanReset: function (data) {
								var model;
								while (!!(model = this.pop())) {
									model.destroy();
								}
								this.reset(data);
							}
						});

	return WidthCollection;
	
});