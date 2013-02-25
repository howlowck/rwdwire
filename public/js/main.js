// Require JS boostrap file

require.config({
	paths:{
		jquery: "../assets/jquery/jquery.min",
		underscore: "../assets/underscore/underscore-min",
		backbone: "../assets/backbone/backbone-min",
		crypto: "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha256",
		jqueryui: "../assets/jquery-ui/ui/minified/jquery-ui.custom.min",
		timeago: "../assets/jquery-timeago/jquery.timeago",
		app: "../js/app"
	},
	shim:{
		underscore:{
			exports: "_"
		},
		backbone:{
			deps:["underscore", "jquery"],
			exports: "Backbone"
		},
		jqueryui : ['jquery'],
		timeago: ['jquery']
	}
});

define(["app"], function(App){
	console.log(App);
});