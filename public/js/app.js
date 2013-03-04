define(["backbone",
		"collections/WidthCollection", 
		"views/width/WidthView", 
		"views/width/WidthCollectionView", 
		"views/width/WidthCollectionEditView",
		"collections/ToolsCollection",
		"views/tool/ToolsCollectionView",
		"models/Element",
		"views/element/ElementView",
		"collections/ElementsCollection",
		"views/element/ElementsCollectionView",
		"views/element/CreateElementOverlayView",
		"views/element/EditElementOverlayView",
		"views/element/PreviewElementsCollectionView",
		"models/User",
		"views/user/UserOverlayView",
		"views/orphan/InstructionOverlayView"], 

	function (Backbone, 
			WidthCollection, 
			WidthView, 
			WidthCollectionView, 
			WidthCollectionEditView,
			ToolsCollection,
			ToolsCollectionView,
			Element,
			ElementView,
			ElementsCollection,
			ElementsCollectionView,
			CreateElementOverlayView,
			EditElementOverlayView,
			PreviewElementsCollectionView,
			User,
			UserOverlayView,
			InstructionOverlayView){

		// var Width =

		// var WidthCollection =

		// var WidthCollectionView =

		// var WidthCollectionEditView = 

		// var Tool = 

		// var ToolView = 

		// var ToolsCollection = 

		// var ToolsCollectionView = 

		// var Element = 

		// var ElementView = 

		// var ElementsCollection = 

		// var ElementsCollectionView = 

		// var CreateElementOverlayView = 

		// var EditElementOverlayView = 

		// var PreviewElementsCollectionView = 

		// var User = 

		// var UserOverlayView = 

		// var InstructionOverlayView = 

		/** Application View **/
		var AppView = Backbone.View.extend({
			el: $("body"),
			urlRoot : '../rwdwire-server/layouts/',
			notificationTemplate: _.template($("#notificationItemTemp").html()),
			uid: "",
			initialize: function (options) {

				this.dispatch = options.dispatch;
				var data = {
					tools: [{iconClass: "icon-question-sign", name: "Show Tutorial", task: "Instructions"},
							{iconClass: "icon-pencil", name: "Edit Viewports", task: "Edit Widths"},
							{iconClass: "icon-plus", name: "New Element", task: "New Element"},
							{iconClass: "icon-save", name: "Save Layout", task: "Save Layout"},
							{iconClass: "icon-signin", name: "Login Here", task: "Login"}]
				};
				this.widthsCollection = new WidthCollection();
				this.widthsCollectionView = new WidthCollectionView({collection: this.widthsCollection, dispatch: this.dispatch});
				this.widthsCollectionEditView = new WidthCollectionEditView({collection: this.widthsCollection, dispatch: this.dispatch});
				this.toolsCollection = new ToolsCollection(data.tools);
				this.toolsCollectionView = new ToolsCollectionView({collection: this.toolsCollection, dispatch: this.dispatch});
				this.elementsCollection = new ElementsCollection();
				this.elementsCollectionView = new ElementsCollectionView({
					collection: this.elementsCollection,
					dispatch: this.dispatch
				});
				this.createElementOverlayView = new CreateElementOverlayView({dispatch: this.dispatch});
				this.editElementOverlayView = new EditElementOverlayView({dispatch: this.dispatch});
				this.previewElementsCollectionView = new PreviewElementsCollectionView({dispatch: this.dispatch, collection : this.elementsCollection});
				this.user = new User();
				this.userOverlayView = new UserOverlayView({model: this.user, dispatch: this.dispatch});
				this.instructionOverlayView = new InstructionOverlayView({dispatch: this.dispatch});
			},
			notify: function (type, message, options){
				var data = {},
					item;
				data.type = type;
				data.message = message;
				data.className = options.class;
				this.$el.find(".notification").append(this.notificationTemplate(data));

			},
			closeNotify: function (e){
				$(e.currentTarget).remove();
			},
			events: function () {
				this.dispatch.on("EditWidthButton:click", this.editWidth,this);
				this.dispatch.on("NewElementButton:click", this.newElement, this);
				this.dispatch.on("SaveLayoutButton:click", this.saveLayout, this);
				this.dispatch.on("LoginButton:click", this.showLogin, this);
				this.dispatch.on("UserInfo:click", this.showUserInfo, this);
				this.dispatch.on("InstructionsButton:click", this.showInstructions, this);

				this.dispatch.on("element:edit", this.editElement, this);
				this.dispatch.on("WidthView:click", this.updateViewport, this);

				this.dispatch.on("WidthCollection/viewportColor:change", this.changeViewportColor, this);
				this.dispatch.on("ElementsCollectionView/width:change", this.updateElementsState, this);
				this.dispatch.on("PreviewElementCollection:sortupdate", this.sortElements, this);

				this.dispatch.on("CreateElementOverlayView:createElement", this.createElement, this);
				this.dispatch.on("ElementView:resize", this.resizeElement, this);
				this.dispatch.on("ElementView:move", this.moveElement, this);
				this.dispatch.on("UserLogin:success", this.successLogin, this);
				this.$el.on("click", ".notification-item", this.closeNotify);
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

				//save current state
				this.elementsCollection.each( function (model) {
					model.saveCurrentState();
				});

				data.key = this.user.get("api_key");
				data.uid = this.uid;
				data.widths = JSON.stringify(this.widthsCollection.toJSON());
				data.elements= JSON.stringify(this.elementsCollection.toJSON());

				//$.parseJSON(string)
				$.ajax({
					url: this.urlRoot + "save_layout",
					data: data,
					type: 'POST'
				}).done(function (data){
					var json = $.parseJSON(data);
					if ( json.error) {
						self.notify("Uh oh..",json.error, {"class":"error"});
						return;
					}
					self.dispatch.trigger("saveLayout:success", {url:json.url});
					self.notify("Yay!",json.success, {"class":"success"});
					self.uid = json.url;
				});
			},
			showLogin: function (payload) {
				this.userOverlayView.renderLogin();
			},
			showUserInfo: function (payload){
				this.userOverlayView.renderUserInfo({key: this.user.get("api_key")});
			},
			showInstructions: function (payload){
				this.instructionOverlayView.show();
			},
			editElement: function (payload){
				var model = this.elementsCollection.get(payload.cid);
				this.editElementOverlayView.show(model);
			},
			updateViewport: function (payload) {
				this.elementsCollectionView.changeDimension(payload.width, payload.height);
				this.elementsCollectionView.changeColor(payload.color);
			},
			changeViewportColor: function (payload) {
				if (payload.width === this.elementsCollectionView.width) {
					this.elementsCollectionView.changeColor(payload.color);
				}
			},
			updateElementsState: function (payload) {
				this.elementsCollection.each( function (model) {
					model.updateCurrentState(payload.width);
				});
				this.elementsCollection.sort();
			},
			sortElements: function (payload) {
				var self = this,
					count = payload.visible.length;
				_.each(payload.visible, function(value){
					self.elementsCollection.get(value).set("zindex", count);
					count--;
				});
				_.each(payload.disable, function(value){
					self.elementsCollection.get(value).set("zindex", -1);
				});
			},
			createElement: function (payload) {
				var modelSpec = (function () {
					var x = payload.rawx - this.elementsCollectionView.$el.offset().left,
						y = payload.rawy - this.elementsCollectionView.$el.offset().top,
						width = payload.width,
						height = payload.height;
					return {x: x, y: y, width: width, height: height, disable: false, zindex: this.elementsCollection.length+1};
				}).call(this);
				var newElement = new Element(modelSpec);
				this.elementsCollection.add(newElement);
				this.elementsCollection.sort();
				this.editElementOverlayView.show(newElement);
			},

			resizeElement: function (payload) {
				var modelSpec = (function () {
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
				this.notify("Yay!","You are logged in", { "class":"success" });
			}
		});
		
		var App = Backbone.Router.extend({
			initialize: function () {
				this.dispatch = _.clone(Backbone.Events);
				this.appView = new AppView({dispatch: this.dispatch});
				this.dispatch.on("saveLayout:success", this.addURL, this);
			},
			routes: {
				"layout/:layoutUid": "loadLayout",
				"*actions": "defaultAction"
			},
			loadLayout: function (layoutUid) {
				var self = this;
				this.appView.uid = layoutUid;
				$.ajax({
					url: "../rwdwire-server/layouts/load_layout/"+layoutUid,
					data: {
						uid : layoutUid
					},
					type: "POST"
				}).done(function (data) {
					data = $.parseJSON(data);
					self.appView.widthsCollection.cleanReset($.parseJSON(data.dimensions));
					self.appView.elementsCollectionView.changeDimension(self.appView.widthsCollection.first().get("xmax"),self.appView.widthsCollection.first().get("y"));
					self.appView.elementsCollectionView.changeColor(self.appView.widthsCollection.first().get("viewportColor"));
					self.appView.elementsCollection.cleanReset($.parseJSON(data.elements));
					self.appView.elementsCollectionView.render();
					self.appView.previewElementsCollectionView.render();
				});
			},
			defaultAction: function () {
				var self = this,
					data = {dimensions: [{xmax: 480, y: 700, title: "mobile portrait", viewportColor: "#eedee0"},
								{xmin: 481, xmax: 767, y: 700, title: "mobile landscape", viewportColor: "#eedee0"},
								{xmin: 768, xmax:979, y: 700, title: "default", viewportColor: "#eedee0"},
								{xmin: 980, xmax:1200, y:700, title: "large display", viewportColor: "#eedee0"}],
							elements: [{"name": "logo","x":7,"y":4,"width":103,"height":59,"disable":false,"type":"div","content":"Logo","bcolor":"#eeeeee","zindex":"1","opacity":1},
								{"name": "nav","x":113,"y":3,"width":360,"height":60,"disable":false,"type":"div","content":"Navigation","bcolor":"#eeeeee","zindex":"2","opacity":1},
								{"name": "main","x":7,"y":69,"width":466,"height":275,"disable":false,"type":"div","content":"Main Content","bcolor":"#ddccee","zindex":"3","opacity":1},
								{"name": "supplement","x":7,"y":347,"width":242,"height":178,"disable":false,"type":"div","content":"Supplement","bcolor":"#aabbcc","zindex":"4","opacity":1},
								{"name": "sidebar","x":252,"y":347,"width":221,"height":178,"disable":false,"type":"div","content":"Sidebar","bcolor":"#eeeeee","zindex":"5","opacity":1}]
							};
				this.appView.widthsCollection.add(data.dimensions);
				this.appView.elementsCollectionView.changeDimension(this.appView.widthsCollection.first().get("xmax"),this.appView.widthsCollection.first().get("y"));
				this.appView.elementsCollectionView.changeColor(this.appView.widthsCollection.first().get("viewportColor"));
				this.appView.elementsCollectionView.render();
				this.appView.elementsCollection.add(data.elements);
				this.appView.previewElementsCollectionView.render();
			},
			addURL: function (payload) {
				this.navigate("layout/"+payload.url);
			}
		});

		var app= new App();
		Backbone.history.start();
		
		$(".loading").addClass("hidden");
		return app;
});