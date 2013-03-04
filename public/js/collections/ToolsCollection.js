define(['backbone','models/Tool'], function (Backbone, Tool)
	{
		var ToolsCollection = Backbone.Collection.extend({
			model: Tool
		});
		return ToolsCollection;
	}
);