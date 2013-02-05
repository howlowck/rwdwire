function passwordHash(raw){
	return CryptoJS.SHA256(raw).toString().substring(0,15);
}

$(function(){
	
	Width = Backbone.Model.extend({
		defaults: {xmax: "1200", xmin: "0", y: "700", title :"No Name"},
	});

	WidthView = Backbone.View.extend({
		className: "width-view",
		
		events: {
			"click" : "updateViewportDim"
		},
		
		template: _.template($("#widthViewTemp").html()),
		initialize: function (options) {
			this.dispatch = options.dispatch;
		},
		dimension: function () {
			return this.model.get("xmax") - this.model.get("xmin");
		},
		updateViewportDim: function () {
			this.dispatch.trigger("WidthView:click", {width: this.model.get("xmax"), height: this.model.get("y")});
		},
		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			this.$el.css({"width": this.dimension()});
			this.$el.attr("title", this.model.get("title"));
			return this;
		}
	});

	var WidthCollection = Backbone.Collection.extend({
		model : Width
	});

	var WidthCollectionView = Backbone.View.extend({
		el: $("#sizes"),

		initialize: function(options) {
			this.dispatch = options.dispatch;
			this.render();
			this.listenTo(this.collection,"add",this.addModelToView);
		},
		render: function () {
			_.each(this.collection.models, function (widthModel){
				this.addModelToView(widthModel);
			},this);
			return this;
		},
		updateViewportWidth: function (e) {

		},
		addModelToView: function (widthModel) {
			var tempView = new WidthView( {model: widthModel, dispatch: this.dispatch} );
			this.$el.append(tempView.render().el);
		}
	});

	var Tool = Backbone.Model.extend({
	 	defaults: {
	 		iconClass: "icon-plus icon-2x",
			name: "New Element",
			task: "New Element"
	 	}
	});

	var ToolView = Backbone.View.extend({
		tagName: "button",
		className: "tool-view",
		template: _.template($("#toolViewTemp").html()),
		taskToAction: {
			"New Element": "NewElementButton:click",
			"Save Layout": "SaveLayoutButton:click",
			"Login": "LoginButton:click",
			"ListProjects": "ListButton: click"
		},
		events: {
			 "click": "dispatcherTrigger"
		},
		initialize: function (options) {
			this.dispatch = options.dispatch;
			this.render();
			this.listenTo(this.model, "change", this.render);
		},

		dispatcherTrigger: function () {
			if (!!this.taskToAction[this.model.get("task")]) {
				this.dispatch.trigger(this.taskToAction[this.model.get("task")], {model: this.model});
			} else {
				console.log("sorry don't know what the button is");
			}
		},

		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}

	});

	var ToolsCollection = Backbone.Collection.extend({
		model: Tool
	});

	var ToolsCollectionView = Backbone.View.extend({
		model: Tool,
		el: $(".main-menu"),
		events: {

		},
		initialize: function (options) {
			this.dispatch = options.dispatch;
			this.render();
		},
		render: function() {
			_.each(this.collection.models, function(modelTool){
				var modelView = new ToolView({model: modelTool, dispatch: this.dispatch});
				this.$el.append(modelView.el);
			},this)
		}
	}); 

	Element = Backbone.Model.extend({
		previousState : "",
		currentState : "defaults",
		defaults: { 
			disable: false,
			width: 200,
			height: 200,
			x: 10,
			y: 10,
			type: "div",
			content: "Hi! I'm a new Element.  Edit me.",
			bcolor: "#eee",
			zindex: 0
		},
		updateCurrentState: function (width) {
			//Store dimension to current (soon previous state)
			if (this.currentState !== "defaults") {
				this.set(this.currentState+"_x",  this.get("x"))
					.set(this.currentState+"_y",  this.get("y"))
					.set(this.currentState+"_width", this.get("width"))
					.set(this.currentState+"_height", this.get("height"))
					.set(this.currentState+"_disable", this.get("disable"));
			}
			this.previousState = this.currentState;
			//change current state and set dimension to stored dimension if exists
			this.currentState = "state"+width.toString();
			if (!!this.get(this.currentState+"_width")) {
				this.set({
						width: this.get(this.currentState+"_width"), 
						height: this.get(this.currentState+"_height"), 
						x: this.get(this.currentState+"_x"), 
						y: this.get(this.currentState+"_y"), 
						disable: this.get(this.currentState+"_disable")
					});
			}
		}
	});

	ElementView = Backbone.View.extend({
		className: "element-view",
		template: _.template($("#elementViewTemp").html()),
		attributes: {
			"draggable" : "true"
		},
		cssAnimateSetting:{
			"-webkit-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s", /* Safari and Chrome */
			"-moz-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s", /* Firefox 4 */
			"-ms-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s", /* MS */
			"-o-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s", /* Opera */
			"transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s"
		},
		events: {
			"click .edit-content" : "editContent",
			"click .save-content" : "saveContent",
			"click .remove-element" : "removeElement"
		},

		initialize: function (options) {
			
			this.dispatch = options.dispatch;
			this.listenTo(this.model, "change", this.render);
			this.listenTo(this.model, "destroy", this.remove);		

			this.$el.append('<div class="inner"></div>');	
			this.render();

			this.$el.css({"position": "absolute"}).css(this.cssAnimateSetting);

		},
		dispatcherTriggerResize: function (ui) {
			this.dispatch.trigger("ElementView:resize", {cid: this.model.cid, ui: ui});
		},
		dispatcherTriggerMove: function (ui) {
			this.dispatch.trigger("ElementView:move", {cid: this.model.cid, ui: ui});
		},

		editContent: function () {
			this.$el.find(".edit-content").addClass("hidden");

			this.$el.find(".input-content").val(this.model.get("content"));
			this.$el.find(".input-color").val(this.model.get("bcolor"));
			this.$el.find(".input-zindex").val(this.model.get("zindex"));

			this.$el.find(".edit").removeClass("hidden");
			this.$el.find(".save-content").removeClass("hidden");
			this.$el.find(".content").addClass("hidden");
		},
		saveContent: function () {
			this.$el.find(".save-content").addClass("hidden");

			this.model.set({"content" :this.$el.find(".input-content").val(), 
							"bcolor" : this.$el.find(".input-color").val(), 
							"zindex": this.$el.find(".input-zindex").val()
							});

			this.$el.find(".edit").addClass("hidden");
			this.$el.find(".edit-content").removeClass("hidden");
			this.$el.find(".content").removeClass("hidden");
		},
		
		removeElement: function (){
			console.log("triggered");
			this.model.destroy();
		},
		
		render: function () {
			var self = this,
				visibleValue = this.model.get("disable")? "hidden" :"visible";
			this.$el.children(".inner").html(this.template(this.model.toJSON()));
			this.$el.position({left: this.model.get("x"), top: this.model.get("y")});
			this.$el.css({
				"background-color": this.model.get("bcolor"), 
				"left" : this.model.get("x"), 
				"top" : this.model.get("y"), 
				"width": this.model.get("width"), 
				"height": this.model.get("height"), 
				"z-index": this.model.get("zindex"), 
				"visibility": visibleValue});
			

			this.$el.resizable({
				ghost: true,
				handles: 'n, e, s, w, ne, se, sw, nw ',
				stop: function (event, ui) {
					self.dispatcherTriggerResize(ui);
				}
			}).draggable({
				stack: ".element-view",
				start: function () {
					self.$el.css({
						"-webkit-transition": "none", /* Safari and Chrome */
						"-moz-transition": "none", /* Firefox 4 */
						"-ms-transition": "none", /* MS */
						"-o-transition": "none", /* Opera */
						"transition": "none"
					});
				},
				stop: function (event, ui) {
					self.$el.css(self.cssAnimateSetting);
					self.dispatcherTriggerMove(ui);
				}
			});
			return this;
		}
	});

	ElementsCollection = Backbone.Collection.extend({
		model: Element
	});

	ElementsCollectionView = Backbone.View.extend({
		el: $(".main-view"),
		width: "",
		height: "",
		events: {
		},
		initialize: function (options) {
			this.dispatch = options.dispatch;
			this.changeDimension(options.width, options.height);
			this.render();

			this.listenTo(this.collection, 'add', this.initRenderElement);
		},

		initRenderElement: function (model , collection , options) {
			model.updateCurrentState(this.width);
			var modelView = new ElementView({model: model, dispatch: this.dispatch});
			this.$el.append(modelView.el);
		},

		changeDimension: function (width, height) {
			this.width = width;
			this.height = height;
			this.dispatch.trigger("ElementsCollectionView/width:change", {width: width});
			this.render();
		},
		render: function () {
			this.$el.css({"width": this.width, "height": this.height});
			return this;
		}
	});

	var CreateElementOverlayView = Backbone.View.extend({
		el: $(".create-element-overlay"),
		events: {
			"click .close": "closeCreateElementOverlay",
			"mousedown" : "startCreateElement",
			"mouseup" : "endCreateElement",
			"mousemove" : "drawShadowElement"	
		},
		initialize: function (options) {
			this.dispatch = options.dispatch;
		},
		startCreateElement: function (e) {
			this.drawing = {
				start: {
					x: e.originalEvent.clientX - 1, 
					y: e.originalEvent.clientY - 1, 
					mousex: e.originalEvent.clientX -1, 
					mousey:e.originalEvent.clientY -1 
				}};
			this.$el.children(".shadow-element")
					.removeClass("hidden")
					.css({"left": this.drawing.start.x, 
						  "top": this.drawing.start.y
						});
			this.drawing.start.x = this.$el.children(".shadow-element").offset().left;
			this.drawing.start.y = this.$el.children(".shadow-element").offset().top;
		},
		
		drawShadowElement: function (e) {
			if (!this.drawing) {
				return false;
			};
			this.$el.children(".shadow-element").css({
				"width": e.originalEvent.clientX-this.drawing.start.mousex , 
				"height": e.originalEvent.clientY-this.drawing.start.mousey
			});
		},

		endCreateElement: function (e) {
			var width = this.$el.children(".shadow-element").css("width"),
				height = this.$el.children(".shadow-element").css("height");

			this.$el.children(".shadow-element")
					.addClass("hidden")
					.css({"width": 0, "height": 0, "top": 0, "left" : 0});
			
			this.closeCreateElementOverlay();
			
			if ( parseInt(width, 10) <10 || parseInt(height, 10)<10 ) {
				this.drawing = false;
				return false;
			};

			this.dispatch.trigger("CreateElementOverlayView:createElement",{
				rawx:this.drawing.start.x, 
				rawy: this.drawing.start.y, 
				width: width, 
				height: height
			});

			this.drawing = false;
		},

		showCreateElementOverlay: function () {
			this.$el.removeClass("hidden");
		},
		closeCreateElementOverlay: function () {
			this.$el.addClass("hidden");
		}
	});
	
	var User = Backbone.Model.extend({
		urlRoot : '../rwdwire-server/users',
		loginUrl: "/login",
		registerUrl: "/register",
		defaults : {
			"email" : "",
			"api_key" : ""
		}
		//User.fetch({data:{email: 'yay@gmail.com', pass:'asdfasdfdadf'}, type: 'POST'});
	});
	var UserOverlayView = Backbone.View.extend({
		el:$(".user-overlay"),
		loginTemplate: _.template($("#loginTemp").html()),
		//loginUrl: "/login",
		registerTemplate: _.template($("#registerTemp").html()),
		//registerUrl: "/register",
		userTemplate: _.template($("#userTemp").html()),
		events: {
			"submit #loginForm" : "onLoginSubmit",
			"click .close" : "closeOverlay",
			"click #registerButton" : "renderRegister",
			"submit #registerForm" : "onRegisterSubmit"
		},
		onLoginSubmit: function (e) {
			e.preventDefault();
			var self = this;
			this.hideError();
			this.model.fetch({
				url: this.model.urlRoot + this.model.loginUrl,
				data:{email: this.$el.find("#inputEmail").val(), pass: passwordHash(this.$el.find("#inputPass").val())}, 
				type: 'POST',
				success: this.loginCallback.bind(this)
			});
		}, 
		onRegisterSubmit: function (e) {
			var self = this;
			e.preventDefault();
			this.hideError();
			$.ajax({
				url: this.model.urlRoot + this.model.registerUrl,
				data:{email: this.$el.find("#inputRegisterEmail").val(),
					  pass: passwordHash(this.$el.find("#inputRegisterPass").val()),
					  vpass: passwordHash(this.$el.find("#vinputRegisterPass").val())
					},
				type: 'POST',
			}).done(function (data){
				self.registerCallback(data);
			});
		},
		initialize: function (options) {
			this.dispatch = options.dispatch;
		},
		closeOverlay: function () {
			this.$el.addClass("hidden");
		},
		loginCallback: function (model, resp) {
			//console.log(resp);
			if (!!resp.error) {
				this.showError("#loginError", resp.error);
			} else {
				model.set(resp);
				this.closeOverlay();
				this.dispatch.trigger("UserLogin:success", {user: this.model});
			}
		},
		registerCallback: function (data) {
			if (!!data.error) {
				this.showError("#registerError", data.error);
			} else {
				this.model.set(data);
				this.closeOverlay();
				this.dispatch.trigger("UserLogin:success", {user: this.model});
			}
		},
		hideError: function () {
			this.$el.find(".error").addClass("hidden");
		},
		showError: function (selector, errorMessage) {
			this.$el.find(selector).html(errorMessage);
			this.$el.find(selector).removeClass("hidden");
		},
		renderLogin: function () {
			this.$el.removeClass("hidden");
			this.$el.html(this.loginTemplate());
		},
		renderRegister: function () {
			this.$el.empty();
			this.$el.html(this.registerTemplate());
		}
	});
	/** Application View **/

	var AppView = Backbone.View.extend({
		el: $("body"),

		initialize: function () {

			this.dispatch = _.clone(Backbone.Events);
			data = {
				dimensions: [{xmax: "480", y: "700", title: "mobile portrait"}, 
							{xmin: "481", xmax: "767", y: "700", title: "mobile landscape"}, 
							{xmin: "768", xmax:"979", y: "700", title: "default"}, 
							{xmin: "980", y:"700", title: "large display"} ],
				tools: [{iconClass: "icon-plus", name: "New Element", task: "New Element"}, 
						{iconClass: "icon-save", name: "Save Layout", task: "Save Layout"},
						{iconClass: "icon-signin", name: "Login Here", task: "Login"}],
				elements: [{
							disable: false,
							width: 200,
							height: 100,
							x: 10,
							y: 10,
							type: "div",
							content: "Hi! I'm a new Element.  Edit me.",
							bcolor: "#eee",
							zindex: 1,
							state767_x: 30,
							state767_y: 30,
							state767_width: 300,
							state767_height: 300 
						},{
							disable: false,
							width: 300,
							height: 200,
							x: 50,
							y: 100,
							type: "div",
							content: "New Div!!!",
							bcolor: "#abc",
							zindex: 0
						}]
			};
			this.widthCollection = new WidthCollection(data.dimensions);
			this.widthCollectionView = new WidthCollectionView({collection: this.widthCollection, dispatch: this.dispatch});
			this.toolsCollection = new ToolsCollection(data.tools);
			this.toolsCollectionView = new ToolsCollectionView({collection: this.toolsCollection, dispatch: this.dispatch});
			this.elementsCollection = new ElementsCollection();
			this.elementsCollectionView = new ElementsCollectionView({
				collection: this.elementsCollection, 
				dispatch: this.dispatch, 
				width: this.widthCollection.first().get("xmax"), 
				height: this.widthCollection.first().get("y")
			});
			this.createElementOverlayView = new CreateElementOverlayView({dispatch: this.dispatch});
			this.user = new User();
			this.userOverlayView = new UserOverlayView({model: this.user, dispatch: this.dispatch});
			this.elementsCollection.add(data.elements);
		},

		events: function () {
			this.dispatch.on("NewElementButton:click", this.showCreateElementOverlay, this);
			this.dispatch.on("SaveLayoutButton:click", this.saveLayout, this);
			this.dispatch.on("LoginButton:click", this.login, this);
			this.dispatch.on("WidthView:click", this.updateViewportDim, this);
			this.dispatch.on("ElementsCollectionView/width:change", this.updateElementsState, this);
			this.dispatch.on("CreateElementOverlayView:createElement", this.createElement, this);
			this.dispatch.on("ElementView:resize", this.resizeElement, this);
			this.dispatch.on("ElementView:move", this.moveElement, this);
			this.dispatch.on("UserLogin:success", this.successLogin, this);
		},

		showCreateElementOverlay: function () {
			this.createElementOverlayView.showCreateElementOverlay();
		},
		saveLayout: function() {
			console.log(this.elementsCollection.toJSON());
		},
		login: function (payload) {
			//payload.model.set({name: "User Info"});
			this.userOverlayView.renderLogin();
		},
		updateViewportDim: function (payload) {
			this.elementsCollectionView.changeDimension(payload.width, payload.height);
		},

		updateElementsState: function (payload) {
			_.each(this.elementsCollection.models, function(model) {
				model.updateCurrentState(payload.width);
			});
		},
		createElement: function (payload) {
			var modelSpec = (function (self) {
				var x = payload.rawx - this.elementsCollectionView.$el.offset().left,
					y = payload.rawy - this.elementsCollectionView.$el.offset().top,
					width = payload.width,
					height = payload.height;
				return {x: x, y: y, width: width, height: height, disable: false};
			}).call(this);
			this.elementsCollection.add(modelSpec);
		},

		resizeElement: function (payload) {
			var modelSpec = (function (self) {
				var x = payload.ui.position.left - this.elementsCollectionView.$el.offset().left,
					y = payload.ui.position.top- this.elementsCollectionView.$el.offset().top,
					width = payload.ui.size.width,
					height = payload.ui.size.height;
				return {x: x, y: y, width: width, height: height};
			}).call(this);
			this.elementsCollection.get(payload.cid).set(modelSpec);
		},
		moveElement: function (payload) {
			this.elementsCollection.get(payload.cid).set({x: payload.ui.position.left, y: payload.ui.position.top});
		},
		successLogin: function (payload) {
			this.toolsCollection.where({task: "Login"})[0].set({name: "List Proj", task: "ListProjects"});
		}
	});
	
	var App = Backbone.Router.extend({
		initialize: function () {
			this.appView = new AppView();
		}
	});

	app= new App();
});