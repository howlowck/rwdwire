define(["backbone",
		"collections/WidthCollection",
		"views/width/WidthView",
		"views/width/WidthCollectionView",
		"views/width/WidthCollectionEditView",
		"views/tool/TopMenu",
		"views/tool/SideBar",
		"models/Element",
		"views/element/ElementView",
		"collections/ElementsCollection",
		"views/element/ElementsCollectionView",
		"views/element/CreateElementOverlayView",
		"views/element/EditElementOverlayView",
		"views/element/ExportCodeElementsOverlayView",
		"views/element/PreviewElementsCollectionView",
		"models/User",
		"views/user/UserOverlayView",
		"views/orphan/InstructionOverlayView",
		"views/orphan/SocialOverlayView"],

	function (Backbone,
			WidthCollection,
			WidthView,
			WidthCollectionView,
			WidthCollectionEditView,
			TopMenu,
			SideBar,
			Element,
			ElementView,
			ElementsCollection,
			ElementsCollectionView,
			CreateElementOverlayView,
			EditElementOverlayView,
			ExportCodeElementsOverlayView,
			PreviewElementsCollectionView,
			User,
			UserOverlayView,
			InstructionOverlayView,
			SocialOverlayView) {

		/** Application View **/
		var AppView = Backbone.View.extend({
			el: $("body"),
			urlRoot : '../rwdwire-server/layouts/',
			notificationTemplate: _.template($("#notificationItemTemp").html()),
			uid: "",
			initialize: function (options) {
				this.overlays = [];
				this.dispatch = options.dispatch;
				this.widthsCollection = new WidthCollection();
				this.widthsCollectionView = new WidthCollectionView({
					collection: this.widthsCollection,
					dispatch: this.dispatch
				});
				this.widthsCollectionEditView = new WidthCollectionEditView({
					collection: this.widthsCollection,
					dispatch: this.dispatch
				});
				this.overlays.push(this.widthsCollectionEditView);
				this.topMenu = new TopMenu({dispatch: this.dispatch});
				this.sideBar = new SideBar({dispatch: this.dispatch});
				this.elementsCollection = new ElementsCollection();
				this.elementsCollectionView = new ElementsCollectionView({
					collection: this.elementsCollection,
					dispatch: this.dispatch
				});
				this.createElementOverlayView = new CreateElementOverlayView({dispatch: this.dispatch});
				this.overlays.push(this.createElementOverlayView);
				this.editElementOverlayView = new EditElementOverlayView({dispatch: this.dispatch});
				this.overlays.push(this.editElementOverlayView);
				this.exportCodeOverlayView = new ExportCodeElementsOverlayView({
					collection: this.elementsCollection,
					widths: this.widthsCollection,
					dispatch: this.dispatch
				});
				this.overlays.push(this.exportCodeOverlayView);

				this.previewElementsCollectionView = new PreviewElementsCollectionView({
					dispatch: this.dispatch,
					collection : this.elementsCollection
				});

				this.user = new User();
				this.userOverlayView = new UserOverlayView({model: this.user, dispatch: this.dispatch});
				this.overlays.push(this.userOverlayView);
				this.instructionOverlayView = new InstructionOverlayView({dispatch: this.dispatch});
				this.overlays.push(this.instructionOverlayView);
				this.socialOverlayView = new SocialOverlayView({dispatch: this.dispatch});
				this.overlays.push(this.socialOverlayView);
			},
			notify: function (type, message, options) {
				var data = {};
				data.type = type;
				data.message = message;
				data.className = options.class;
				var $notification = $(this.notificationTemplate(data));
				this.$(".notification").append($notification);
				$notification.css("opacity", 1);

				setTimeout(function () {
					$notification.remove();
				}, 2000);
				setTimeout(function () {
					$notification.css("opacity", 0);
				}, 1500);
			},
			events: function () {
				this.dispatch.on("EditWidthButton:click", this.editWidth, this);
				this.dispatch.on("NewElementButton:click", this.newElement, this);
				this.dispatch.on("SaveLayoutButton:click", this.saveLayout, this);
				this.dispatch.on('ExportCodeButton:click', this.exportCode, this);
				this.dispatch.on("ElementsOverviewButton:click", this.openSortElementsDialogue, this);
				this.dispatch.on("LoginButton:click", this.showLogin, this);
				this.dispatch.on("UserInfo:click", this.showUserInfo, this);
				this.dispatch.on("InstructionsButton:click", this.showInstructions, this);
				this.dispatch.on("SocialButton:click", this.showSocial, this);
				this.dispatch.on("element:edit", this.editElement, this);
				this.dispatch.on("WidthView:click", this.updateViewport, this);

				this.dispatch.on("WidthCollection/viewportColor:change", this.changeViewportColor, this);
				this.dispatch.on("ElementsCollectionView/width:change", this.updateElementsState, this);
				this.dispatch.on("OverviewElementCollection:sortupdate", this.sortElements, this);

				this.dispatch.on("CreateElementOverlayView:createElement", this.createElement, this);
				this.dispatch.on("ElementView:resize", this.resizeElement, this);
				this.dispatch.on("ElementView:move", this.moveElement, this);
				this.dispatch.on("UserLogin:success", this.successLogin, this);
				this.dispatch.on("overlay:open", this.hideNavBars, this);
				this.dispatch.on("overlay:close", this.showNavBars, this);
				//this.$el.on("click", ".notification-item .close", this.closeNotify);
			},
			editWidth: function () {
				this.closeAllOverlays();
				this.widthsCollectionEditView.open();
			},
			exportCode: function () {
				this.closeAllOverlays();
				this.exportCodeOverlayView.open();
			},
			hideNavBars: function () {
				this.topMenu.hide();
				this.sideBar.hide();
			},
			showNavBars: function () {
				this.topMenu.show();
				this.sideBar.show();
			},
			newElement: function () {
				this.closeAllOverlays();
				this.createElementOverlayView.open();
			},
			saveLayout: function () {
				var data = {},
					self = this;

				//save current state
				this.elementsCollection.each(function (model) {
					model.saveCurrentState();
				});

				data.key = this.user.get("api_key");
				data.uid = this.uid;
				data.widths = JSON.stringify(this.widthsCollection.toJSON());
				data.elements = JSON.stringify(this.elementsCollection.toJSON());

				//$.parseJSON(string)
				$.ajax({
					url: this.urlRoot + "save_layout",
					data: data,
					type: 'POST'
				}).done(function (data) {
					var json = $.parseJSON(data);
					if (json.error) {
						self.notify("Uh oh..", json.error, {"class": "error"});
						return;
					}
					self.dispatch.trigger("saveLayout:success", {url: json.url});
					self.notify("Yay!", json.success, {"class": "success"});
					self.socialOverlayView.changeShare();
					self.uid = json.url;
				});
			},
			openSortElementsDialogue: function () {
				this.previewElementsCollectionView.toggleOpenState();
			},
			closeAllOverlays: function () {
				this.overlays.forEach(function (overlay) {
					overlay.close();
				});
			},
			showLogin: function () {
				this.closeAllOverlays();
				this.userOverlayView.renderLogin();
			},
			showUserInfo: function () {
				this.closeAllOverlays();
				this.userOverlayView.renderUserInfo({key: this.user.get("api_key")});
			},
			showInstructions: function () {
				this.closeAllOverlays();
				this.instructionOverlayView.open();
			},
			showSocial: function () {
				this.closeAllOverlays();
				this.socialOverlayView.open();
			},
			editElement: function (payload) {
				this.closeAllOverlays();
				var model = this.elementsCollection.get(payload.cid);
				this.editElementOverlayView.open(model);
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
				this.elementsCollection.each(function (model) {
					model.updateCurrentState(payload.width);
				});
				this.elementsCollection.sort();
			},
			sortElements: function (payload) {
				var self = this,
					count = payload.visible.length;
				_.each(payload.visible, function (value) {
					self.elementsCollection.get(value).set("zindex", count);
					count--;
				});
				_.each(payload.disable, function (value) {
					if (value !== "") {
						self.elementsCollection.get(value).set("zindex", -1);
					}
				});
			},
			createElement: function (payload) {
				var modelSpec = (function () {
					var x = payload.rawx - this.elementsCollectionView.$el.offset().left,
						y = payload.rawy - this.elementsCollectionView.$el.offset().top,
						width = payload.width,
						height = payload.height;
					return {x: x,
							y: y,
							width: width,
							height: height,
							disable: false,
							zindex: this.elementsCollection.length + 1};
				}).call(this);
				var newElement = new Element(modelSpec);
				this.elementsCollection.add(newElement);
				this.elementsCollection.sort();
				this.editElementOverlayView.open(newElement);
			},

			resizeElement: function (payload) {
				var modelSpec = (function () {
					var x = payload.ui.position.left ;//- this.elementsCollectionView.$el.offset().left - 1,
						y = payload.ui.position.top ;//- this.elementsCollectionView.$el.offset().top,
						width = payload.ui.size.width,
						height = payload.ui.size.height;
					return {x: x, y: y, width: width, height: height};
				}).call(this);
				this.elementsCollection.get(payload.cid).set(modelSpec);
			},
			moveElement: function (payload) {
				this.elementsCollection.get(payload.cid).set({x: payload.ui.position.left, y: payload.ui.position.top});
			},
			successLogin: function () {
				this.topMenu.$(".user").data("trigger", "UserInfo:click").data("title", "User Info");
				this.notify("Yay!", "You are logged in", {"class": "success" });
			}
		});
		var App = Backbone.Router.extend({
			initialize: function () {
				this.dispatch = _.clone(Backbone.Events);
				this.appView = new AppView({dispatch: this.dispatch});
				this.dispatch.on("saveLayout:success", this.addURL, this);
				Backbone.history.start();
				$(".loading").addClass("hidden");
			},
			routes: {
				"layout/:layoutUid": "loadLayout",
				"*actions": "defaultAction"
			},
			loadLayout: function (layoutUid) {
				var self = this;
				this.appView.uid = layoutUid;
				$.ajax({
					url: "../rwdwire-server/layouts/load_layout/" + layoutUid,
					data: {
						uid : layoutUid
					},
					type: "POST"
				}).done(function (data) {
					data = $.parseJSON(data);
					self.appView.widthsCollection.cleanReset($.parseJSON(data.dimensions));
					self.appView.elementsCollectionView.changeDimension(
						self.appView.widthsCollection.first().get("xmax"),
						self.appView.widthsCollection.first().get("y")
					);
					self.appView.elementsCollectionView.changeColor(
						self.appView.widthsCollection.first().get("viewportColor")
					);
					self.appView.elementsCollection.cleanReset($.parseJSON(data.elements));
					self.appView.elementsCollectionView.render();
					self.appView.previewElementsCollectionView.render();
				});
			},
			defaultAction: function () {
				var data =
						{dimensions: [{xmax: 480, y: 700, title: "mobile portrait", viewportColor: "#eeeeee"},
							{xmin: 481, xmax: 767, y: 700, title: "mobile landscape", viewportColor: "#eeeeee"},
							{xmin: 768, xmax: 979, y: 700, title: "default", viewportColor: "#eeeeee"},
							{xmin: 980, xmax: 1200, y: 700, title: "large display", viewportColor: "#eeeeee"}],
						elements: [{"name": "logo", "x": 7, "y": 4, "width": 103, "height": 59, "disable": false,
									"type": "div", "content": "Logo", "bcolor": "#eeeeee", "zindex": "1", "opacity": 1},
								{"name": "nav", "x": 113, "y": 3, "width": 360, "height": 60, "disable": false,
								"type": "div", "content": "Navigation", "bcolor": "#eeeeee",
								"zindex": "2", "opacity": 1},
								{"name": "main", "x": 7, "y": 69, "width": 466, "height": 275, "disable": false,
								"type": "div", "content": "Main Content", "bcolor": "#ddccee",
								"zindex": "3", "opacity": 1},
								{"name": "supplement", "x": 7, "y": 347, "width": 242, "height": 178, "disable": false,
								"type": "div", "content": "Supplement", "bcolor": "#aabbcc",
								"zindex": "4", "opacity": 1},
								{"name": "sidebar", "x": 252, "y": 347, "width": 221, "height": 178, "disable": false,
								"type": "div", "content": "Sidebar", "bcolor": "#eeeeee",
								"zindex": "5", "opacity": 1}]
							};
				this.appView.widthsCollection.add(data.dimensions);
				this.appView.elementsCollectionView.changeDimension(
					this.appView.widthsCollection.first().get("xmax"),
					this.appView.widthsCollection.first().get("y")
				);
				this.appView.elementsCollectionView.changeColor(
					this.appView.widthsCollection.first().get("viewportColor")
				);
				this.appView.elementsCollectionView.render();
				this.appView.elementsCollection.add(data.elements);
				this.appView.previewElementsCollectionView.render();
			},
			addURL: function (payload) {
				this.navigate("layout/" + payload.url);
			}
		});
		return App;
	});