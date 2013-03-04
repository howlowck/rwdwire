define(['backbone'], function (Backbone)
	{
		var User = Backbone.Model.extend({
			urlRoot : '../rwdwire-server/users',
			loginUrl: "/login",
			registerUrl: "/register",
			defaults : {
				"email" : "",
				"api_key" : ""
			}
		});
		return User;
	}
);