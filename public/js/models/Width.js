define(["backbone"],function(Backbone){
	var Width = Backbone.Model.extend({
					defaults: {
						xmax: 1300,
						xmin: "0",
						y: "700",
						title :"What device am I supposed to be?",
						viewportColor: "#eeeeee"
					}
				});
	return Width;
});