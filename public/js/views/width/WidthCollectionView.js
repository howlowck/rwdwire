define(['models/Width', 'collections/WidthCollection', 'views/width/WidthView'], function (Width, WidthCollection, WidthView)
	{
		var WidthCollectionView = Backbone.View.extend({
			el: $("#sizes"),

			initialize: function(options) {
				this.dispatch = options.dispatch;
				this.listenTo(this.collection,"reset add destroy change:xmax", this.render);
			},
			render: function () {
				this.calcWidthDim();
				this.$el.empty();
				this.collection.each(function (widthModel){
					this.addModelToView(widthModel);
				},this);
				return this;
			},
			calcWidthDim: function () {
				var prevMax = 0;
				this.collection.sort();
				this.collection.each(
					function(model){
						if (prevMax !== 0) {
							model.set("xmin", prevMax + 1);
						} else {
							model.set("xmin", 0);
						}
						prevMax = model.get("xmax");
					}
				);
			},
			addModelToView: function (widthModel) {
				var tempView = new WidthView( {model: widthModel, dispatch: this.dispatch});
				this.$el.append(tempView.render().el);
			}
		});
		return WidthCollectionView;
	}
);