define(['backbone','collections/ToolsCollection', 'views/tool/ToolView'], function (Backbone,ToolsCollection, ToolView)
	{
		var ToolsCollectionView = Backbone.View.extend({
			//model: Tool,
			el: $(".main-menu"),
			events: {

			},
			initialize: function (options) {
				this.dispatch = options.dispatch;
				this.render();
			},
			render: function() {
				var toolsHTML = "";
				this.collection.each(function(modelTool){
					var modelView = new ToolView({model: modelTool, dispatch: this.dispatch});
					this.$el.append(modelView.el);
				},this);

			}
		});
		return ToolsCollectionView;
	}
);