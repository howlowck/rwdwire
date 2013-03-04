define(['backbone'], function (Backbone)
	{
		var Tool = Backbone.Model.extend({
			defaults: {
				iconClass: "icon-plus icon-2x",
				name: "New Element",
				task: "New Element"
			}
		});
		return Tool;
	}
);