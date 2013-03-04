define(['backbone','collections/ElementsCollection', 'views/element/ElementView'], function (Backbone, ElementsCollection, ElementView)
	{
		var ElementsCollectionView = Backbone.View.extend({
			el: $(".main-view"),
			width: "",
			height: "",
			events: {
			},
			initialize: function (options) {
				this.dispatch = options.dispatch;
				this.listenTo(this.collection, 'add', this.initRenderElement);
				this.listenTo(this.collection, 'reset', this.resetElementsCollection);
			},
			initRenderElement: function (model , collection , options) {
				model.updateCurrentState(this.width);
				var modelView = new ElementView({model: model, dispatch: this.dispatch});
				this.$el.append(modelView.$el);
			},
			resetElementsCollection: function (collection, options) {
				this.collection.each(function (model) {
					this.initRenderElement(model, collection);
				},this);
			},
			changeDimension: function (width, height) {
				this.width = width;
				this.height = height;
				this.dispatch.trigger("ElementsCollectionView/width:change", {width: width});
				this.render();
			},
			changeColor: function (color) {
				this.color = color;			
				this.render();
			},
			render: function () {
				this.$el.css({"width": this.width, "height": this.height, "background-color": this.color});
				return this;
			}
		});

		return ElementsCollectionView;
	}
);