function passwordHash(raw){
	return CryptoJS.SHA256(raw).toString().substring(0,15);
}

$(function(){
	
	var Width = Backbone.Model.extend({
		defaults: {xmax: 1300, xmin: "0", y: "700", title :"What device am I supposed to be?"}
	});

	var WidthView = Backbone.View.extend({
		className: "width-view",
		
		events: {
			"click" : "updateViewportDim"
		},
		
		template: _.template($("#widthViewTemp").html()),
		initialize: function (options) {
			this.dispatch = options.dispatch;
			this.listenTo(this.model, "change", this.render);
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
		model : Width,
		comparator: function (model) {
			return model.get("xmax");
		}
	});

	var WidthCollectionView = Backbone.View.extend({
		el: $("#sizes"),

		initialize: function(options) {
			this.dispatch = options.dispatch;
			this.render();
			this.listenTo(this.collection,"add destroy change:xmax", this.render);
		},
		maxWidth: function () {
			this.collection.sort();
			return(this.collection.last().get("xmax"));
		},
		render: function () {
			this.calcWidthDim();
			this.$el.empty();
			this.collection.each(function (widthModel){
				this.addModelToView(widthModel);
			},this);
			this.maxWidth();
			this.$el.width(this.maxWidth() + 5);
			return this;
		},
		calcWidthDim: function () {
			var prevMax = 0;
			this.collection.sort();
			this.collection.each(
				function(model){
					if (prevMax !== 0) {
						model.set("xmin", prevMax + 1);
					}
					prevMax = model.get("xmax");
				}
			);
		},
		addModelToView: function (widthModel) {
			var tempView = new WidthView( {model: widthModel, dispatch: this.dispatch} );
			this.$el.append(tempView.render().el);
		}
	});

	var WidthCollectionEditView = Backbone.View.extend({
		el: $(".width-overlay"),
		template: _.template($("#widthOverlayTemp").html()),
		formItemTemplate: _.template($("#widthFormItemTemp").html()),
		events: {
			"click .close": "closeOverlay",
			"click .remove-width": "removeWidth",
			"click .add-width": "addWidth",
			"change .edit-width": "editWidth",
			"change .edit-height": "editHeight",
			"change .edit-title": "editTitle"
		},
		initialize: function(options){
			this.dispatch = options.dispatch;
			this.render();
			this.listenTo(this.collection,"add destroy sort",this.render);
		},
		removeWidth: function (e){
			$removeElement = $(e.target).parent();
			this.collection.get($removeElement.attr("data-cid")).destroy();
			$removeElement.remove();
		},
		addWidth: function () {
			this.collection.add({});
		},
		editWidth: function (e) {
			$editElement = $(e.target).parent();
			this.collection.get($editElement.attr("data-cid")).set("xmax", parseInt($(e.target).val(),10));
		},
		editHeight: function (e) {
			$editElement = $(e.target).parent();
			this.collection.get($editElement.attr("data-cid")).set("y", parseInt($(e.target).val(),10));
		},
		editTitle: function (e) {
			$editElement = $(e.target).parent();
			this.collection.get($editElement.attr("data-cid")).set("title", $(e.target).val());
		},

		closeOverlay: function () {
			this.$el.addClass("hidden");
		},
		showOverlay: function () {
			this.$el.removeClass("hidden");
		},
		render: function () {
			this.$el.html(this.template());
			var $formItemDiv= this.$el.find(".width-form-items");
			$formItemDiv.empty();
			this.collection.each(function(model){
				var data = model.toJSON();
				data.cid=model.cid;
				$formItemDiv.append(this.formItemTemplate(data));
			},this);
			this.$el.find(".remove-width").first().remove(); //removes the first remove button because there should be at least one width.
			this.$el.find(".window").draggable();
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
			"Edit Widths": "EditWidthButton:click",
			"New Element": "NewElementButton:click",
			"Save Layout": "SaveLayoutButton:click",
			"Login": "LoginButton:click",
			"UserInfo": "UserInfo:click"
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
			this.collection.each(function(modelTool){
				var modelView = new ToolView({model: modelTool, dispatch: this.dispatch});
				this.$el.append(modelView.el);
			},this);
		}
	});

	var Element = Backbone.Model.extend({
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
			zindex: 10
		},
		updateCurrentState: function (width) {
			//Store dimension to current (soon previous state)
			if (this.currentState !== "defaults") {
				this.set(this.currentState+"_x",  this.get("x"))
					.set(this.currentState+"_y",  this.get("y"))
					.set(this.currentState+"_width", this.get("width"))
					.set(this.currentState+"_height", this.get("height"))
					.set(this.currentState+"_zindex", this.get("zindex"));
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
						zindex: this.get(this.currentState+"_zindex")
					});
			}
		}
	});

	var ElementView = Backbone.View.extend({
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
				//stack: ".element-view",
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

	var ElementsCollection = Backbone.Collection.extend({
		model: Element
	});

	var ElementsCollectionView = Backbone.View.extend({
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
		el: $(".element-overlay"),
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
					.css({	"left": this.drawing.start.x,
							"top": this.drawing.start.y
						});
			this.drawing.start.x = this.$el.children(".shadow-element").offset().left;
			this.drawing.start.y = this.$el.children(".shadow-element").offset().top;
		},
		
		drawShadowElement: function (e) {
			if (!this.drawing) {
				return false;
			}
			this.$el.children(".shadow-element").css({
				"width": e.originalEvent.clientX-this.drawing.start.mousex ,
				"height": e.originalEvent.clientY-this.drawing.start.mousey
			});
		},

		endCreateElement: function (e) {
			var width = parseInt(this.$el.children(".shadow-element").css("width"),10),
				height = parseInt(this.$el.children(".shadow-element").css("height"),10);

			this.$el.children(".shadow-element")
					.addClass("hidden")
					.css({"width": 0, "height": 0, "top": 0, "left" : 0});
			
			this.closeCreateElementOverlay();
			
			if ( parseInt(width, 10) <10 || parseInt(height, 10)<10 ) {
				this.drawing = false;
				return false;
			}

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
	});
	var UserOverlayView = Backbone.View.extend({
		el:$(".user-overlay"),
		loginTemplate: _.template($("#loginOverlayTemp").html()),
		registerTemplate: _.template($("#registerOverlayTemp").html()),
		userTemplate: _.template($("#userOverlayTemp").html()),
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
				data:{	email: this.$el.find("#inputEmail").val(),
						pass: passwordHash(this.$el.find("#inputPass").val())
					},
				type: 'POST',
				success: this.loginCallback.bind(this)
			});
		},
		onRegisterSubmit: function (e) {
			var self = this;
			e.preventDefault();
			this.hideError();
			if (this.$el.find("#inputRegisterPass").val() === "") {
				this.showError("#registerError", "Your password is empty");
				return;
			}
			$.ajax({
				url: this.model.urlRoot + this.model.registerUrl,
				data:{	email: this.$el.find("#inputRegisterEmail").val(),
						pass: passwordHash(this.$el.find("#inputRegisterPass").val()),
						vpass: passwordHash(this.$el.find("#vinputRegisterPass").val())
					},
				type: 'POST'
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
		},
		renderUserInfo: function (data) {
			var self = this;
			this.$el.removeClass("hidden");
			this.$el.html(this.userTemplate());
			// TODO: get list from server
			$.ajax({
				url: this.model.urlRoot + "/getProjects",
				data: {
					key: data.key
				},
				type: 'POST'
			}).done(function (data) {
				self.renderProjects($.parseJSON(data));
			});
		},
		renderProjects: function (data) {
			$projects = this.$el.find(".projects");
			$projects.empty();
			_(data).each(function(data){
				var datetime =  new Date((Date.parse(data.ts)/60000 - new Date().getTimezoneOffset())*60000).toISOString();
					$oneProject = $("<div></div>").addClass("project");
				$oneProject.append("<a class='project-name' href='"+"#"+data.name+"'>"+data.name+"</a>");
				$oneProject.append("<abbr class='project-time timeago' title='"+datetime+"'></abbr>");
				$projects.append($oneProject);
			});
			$projects.find(".timeago").timeago();
		}
	});
	/** Application View **/

	var AppView = Backbone.View.extend({
		el: $("body"),
		urlRoot : '../rwdwire-server/layouts/',
		uid: "",
		initialize: function (options) {

			this.dispatch = options.dispatch;
			data = {
				dimensions: [{xmax: 480, y: 700, title: "mobile portrait"},
							{xmin: 481, xmax: 767, y: 700, title: "mobile landscape"},
							{xmin: 768, xmax:979, y: 700, title: "default"},
							{xmin: 980, xmax:1200, y:700, title: "large display"} ],
				tools: [{iconClass: "icon-pencil", name: "Edit Views", task: "Edit Widths"},
						{iconClass: "icon-plus", name: "New Element", task: "New Element"},
						{iconClass: "icon-save", name: "Save Layout", task: "Save Layout"},
						{iconClass: "icon-signin", name: "Login Here", task: "Login"}],
				elements: [{"x":7,"y":4,"width":103,"height":59,"disable":false,"type":"div","content":"Logo","bcolor":"#eee","zindex":"10"},
				{"x":7,"y":347,"width":242,"height":178,"disable":false,"type":"div","content":"Supplement","bcolor":"#abc","zindex":"10"},
				{"x":7,"y":69,"width":466,"height":275,"disable":false,"type":"div","content":"Main Content","bcolor":"#dce","zindex":"10"},
				{"x":113,"y":3,"width":360,"height":60,"disable":false,"type":"div","content":"Navigation","bcolor":"#eee","zindex":"10"},
				{"x":252,"y":347,"width":221,"height":178,"disable":false,"type":"div","content":"Sidebar","bcolor":"#eee","zindex":"10"}]
			};
			this.widthsCollection = new WidthCollection(data.dimensions);
			this.widthsCollectionView = new WidthCollectionView({collection: this.widthsCollection, dispatch: this.dispatch});
			this.widthsCollectionEditView = new WidthCollectionEditView({collection: this.widthsCollection, dispatch: this.dispatch});
			this.toolsCollection = new ToolsCollection(data.tools);
			this.toolsCollectionView = new ToolsCollectionView({collection: this.toolsCollection, dispatch: this.dispatch});
			this.elementsCollection = new ElementsCollection();
			this.elementsCollectionView = new ElementsCollectionView({
				collection: this.elementsCollection,
				dispatch: this.dispatch,
				width: this.widthsCollection.first().get("xmax"),
				height: this.widthsCollection.first().get("y")
			});
			this.createElementOverlayView = new CreateElementOverlayView({dispatch: this.dispatch});
			this.user = new User();
			this.userOverlayView = new UserOverlayView({model: this.user, dispatch: this.dispatch});
			this.elementsCollection.add(data.elements);
		},

		events: function () {
			this.dispatch.on("EditWidthButton:click", this.editWidth,this);
			this.dispatch.on("NewElementButton:click", this.newElement, this);
			this.dispatch.on("SaveLayoutButton:click", this.saveLayout, this);
			this.dispatch.on("LoginButton:click", this.login, this);
			this.dispatch.on("UserInfo:click", this.showUserInfo, this);

			this.dispatch.on("WidthView:click", this.updateViewportDim, this);
			this.dispatch.on("ElementsCollectionView/width:change", this.updateElementsState, this);
			this.dispatch.on("CreateElementOverlayView:createElement", this.createElement, this);
			
			this.dispatch.on("ElementView:resize", this.resizeElement, this);
			this.dispatch.on("ElementView:move", this.moveElement, this);
			this.dispatch.on("UserLogin:success", this.successLogin, this);
		},
		editWidth: function () {
			this.widthsCollectionEditView.showOverlay();
		},
		newElement: function () {
			this.createElementOverlayView.showCreateElementOverlay();
		},
		saveLayout: function() {
			var data= {},
				self = this;
			data.key = this.user.get("api_key");
			data.uid = this.uid;
			data.tools = JSON.stringify(this.toolsCollection.toJSON());
			data.widths = JSON.stringify(this.widthsCollection.toJSON());
			data.elements= JSON.stringify(this.elementsCollection.toJSON());
			//$.parseJSON(string)

			$.ajax({
				url: this.urlRoot + "save_layout",
				data: data,
				type: 'POST'
			}).done(function (data){
				console.log(data);
				//TODO: set url to uid
				//TODO: implement self.displayMessage();
			});

			
			console.log(data);
		},
		login: function (payload) {
			this.userOverlayView.renderLogin();
		},
		showUserInfo: function (payload){
			this.userOverlayView.renderUserInfo({key: this.user.get("api_key")});
		},
		updateViewportDim: function (payload) {
			this.elementsCollectionView.changeDimension(payload.width, payload.height);
		},

		updateElementsState: function (payload) {
			this.elementsCollection.each( function (model) {
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
			this.toolsCollection.where({task: "Login"})[0].set({name: "User Info", task: "UserInfo"});
		}
	});
	
	var App = Backbone.Router.extend({
		initialize: function () {
			this.dispatch = _.clone(Backbone.Events);
			this.appView = new AppView({dispatch: this.dispatch});
		},
		routes: {
			"layout/:layoutUid": "loadLayout"
		},
		loadLayout: function (layoutUid) {
			console.log("this is running");
			$.ajax({
				url: "../rwdwire-server/layouts/"+layoutUid+".json"
			}).done(function (data) {

			});
		}
	});

	app= new App();
	Backbone.history.start();
});
//TODO: on login provide a list of projects
//TODO: add notification system
//TODO: fetch layout
