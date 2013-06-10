define(['backbone', 'collections/ToolsCollection', 'views/tool/ToolView'],
	function (Backbone, ToolsCollection, ToolView) {
		var ToolsCollectionView = Backbone.View.extend({
			el: $(".main-menu"),
			initialize: function (options) {
				this.dispatch = options.dispatch;
				this.render();
			},
			render: function () {
				this.collection.each(function (modelTool) {
					var modelView = new ToolView({model: modelTool, dispatch: this.dispatch});
					this.$el.append(modelView.el);
				}, this);
			}
		});
		return ToolsCollectionView;
	}
);