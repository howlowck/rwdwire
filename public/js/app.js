define(["backbone","crypto","CKEditor", "jqueryui","timeago", "spectrum"], function(Backbone, CryptoJS, CKEDITOR){

	function passwordHash(raw){
		return CryptoJS.SHA256(raw).toString().substring(0,15);
	}

	var Width = Backbone.Model.extend({
		defaults: {xmax: 1300, xmin: "0", y: "700", title :"What device am I supposed to be?", viewportColor: "#eeeeee"}
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
			this.dispatch.trigger("WidthView:click", {width: this.model.get("xmax"), height: this.model.get("y"), color: this.model.get("viewportColor")});
		},
		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			this.$el.css({"width": this.dimension()});
			this.$el.attr("title", this.model.get("title")+ " (click to activate)");
			return this;
		}
	});

	var WidthCollection = Backbone.Collection.extend({
		model : Width,
		comparator: function (model) {
			return model.get("xmax");
		},
		cleanReset: function (data) {
			var model;
			while (!!(model = this.pop())) {
				model.destroy();
			}
			this.reset(data);
		}
	});

	var WidthCollectionView = Backbone.View.extend({
		el: $("#sizes"),

		initialize: function(options) {
			this.dispatch = options.dispatch;
			this.listenTo(this.collection,"reset add destroy change:xmax", this.render);
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
					} else {
						model.set("xmin", 0);
					}
					prevMax = model.get("xmax");
				}
			);
		},
		addModelToView: function (widthModel) {
			var tempView = new WidthView( {model: widthModel, dispatch: this.dispatch});
			this.$el.append(tempView.render().el);
		}
	});

	var WidthCollectionEditView = Backbone.View.extend({
		el: $(".width-overlay"),
		template: _.template($("#widthOverlayTemp").html()),
		formItemTemplate: _.template($("#widthFormItemTemp").html()),
		events: {
			"keypress" : "keyEvents",
			"click .close" : "closeOverlay",
			"click .remove-width" : "removeWidth",
			"click .add-width" : "addWidth",
			"change .edit-width" : "editWidth",
			"change .edit-height" : "editHeight",
			"change .edit-title" : "editTitle",
			"change .edit-vcolor": "editViewportColor"
		},
		initialize: function (options) {
			this.dispatch = options.dispatch;
			this.render();
			this.listenTo(this.collection,"reset add destroy sort",this.render);
		},
		keyEvents: function (e) {
			
		},
		removeWidth: function (e){
			var $removeElement = $(e.target).parent();
			this.collection.get($removeElement.attr("data-cid")).destroy();
			$removeElement.remove();
		},
		addWidth: function () {
			this.collection.add({});
		},
		editWidth: function (e) {
			var $editElement = $(e.target).parent();
			this.collection.get($editElement.attr("data-cid")).set("xmax", parseInt($(e.target).val(),10));
		},
		editHeight: function (e) {
			var $editElement = $(e.target).parent();
			this.collection.get($editElement.attr("data-cid")).set("y", parseInt($(e.target).val(),10));
		},
		editTitle: function (e) {
			var $editElement = $(e.target).parent();
			this.collection.get($editElement.attr("data-cid")).set("title", $(e.target).val());
		},
		editViewportColor: function (e) {
			var $editElement = $(e.target).parent();
			var widthModel = this.collection.get($editElement.attr("data-cid"));
			widthModel.set("viewportColor", $(e.target).val());
			this.dispatch.trigger("WidthCollection/viewportColor:change",{width: widthModel.get("xmax"), color: $(e.target).val()});
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
				widthsHTML = "";
			$formItemDiv.empty();
			this.collection.each(function(model){
				var data = model.toJSON();
				data.cid=model.cid;
				widthsHTML += this.formItemTemplate(data);
			},this);
			$formItemDiv.append(widthsHTML);
			this.$el.find(".remove-width").first().remove(); //removes the first remove button because there should be at least one width.
			this.$el.find(".window").draggable();
			return this;
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
			"UserInfo": "UserInfo:click",
			"Instructions": "InstructionsButton:click"
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
			var toolsHTML = "";
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
			name: "change me",
			disable: false,
			width: 200,
			height: 200,
			x: 10,
			y: 10,
			type: "div",
			content: "Hi! I'm a new Element.  Edit me.",
			bcolor: "#eeeeee",
			zindex: 10,
			opacity: 1
		},
		updateCurrentState: function (width) {
			/* save the model config on the prevous state and updates the model to the current state. */

			//Store dimension to current (soon previous state)
			
			this.previousState = this.currentState;

			this.savePrevState();

			//change current state and set dimension to stored dimension if exists
			this.currentState = "state"+width.toString();
			if (!!this.get(this.currentState+"_width")) {
				this.set({
						width: this.get(this.currentState+"_width"),
						height: this.get(this.currentState+"_height"),
						x: this.get(this.currentState+"_x"),
						y: this.get(this.currentState+"_y"),
						zindex: this.get(this.currentState+"_zindex"),
						opacity: this.get(this.currentState+"_opacity")
					});
			}
		},
		savePrevState: function () {
			if (this.previousState !== "defaults") {
				this.set(this.previousState+"_x",  this.get("x"))
					.set(this.previousState+"_y",  this.get("y"))
					.set(this.previousState+"_width", this.get("width"))
					.set(this.previousState+"_height", this.get("height"))
					.set(this.previousState+"_zindex", this.get("zindex"))
					.set(this.previousState+"_opacity", this.get("opacity"));
			}
		},
		saveCurrentState: function () {
			this.set(this.currentState+"_x",  this.get("x"))
				.set(this.currentState+"_y",  this.get("y"))
				.set(this.currentState+"_width", this.get("width"))
				.set(this.currentState+"_height", this.get("height"))
				.set(this.currentState+"_zindex", this.get("zindex"))
				.set(this.currentState+"_opacity", this.get("opacity"));
		}
	});

	var ElementView = Backbone.View.extend({
		className: "element-view",
		template: _.template($("#elementViewTemp").html()),
		cssAnimateSetting:{
			"-webkit-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s, opacity 0.5s", /* Safari and Chrome */
			"-moz-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s, opacity 0.5s", /* Firefox 4 */
			"-ms-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s, opacity 0.5s", /* MS */
			"-o-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s, opacity 0.5s", /* Opera */
			"transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s, opacity 0.5s"
		},
		events: {
			"click .remove-element" : "removeElement",
			"dblclick": "editContent"
		},

		initialize: function (options) {
			
			this.dispatch = options.dispatch;
			this.listenTo(this.model, "reset change", this.render);
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
			this.dispatch.trigger("element:edit", {cid: this.model.cid});
		},
		
		removeElement: function (){
			this.model.destroy();
		},
		
		render: function () {
			var self = this,
				visibleValue = this.model.get("disable")? "hidden" :"visible";
			this.$el.children(".inner").html(this.template(this.model.toJSON()))
					.position({left: this.model.get("x"), top: this.model.get("y")});
			this.$el.attr("title", "Double Click to Edit Element").css({
				"background-color": this.model.get("bcolor"),
				"left" : this.model.get("x"),
				"top" : this.model.get("y"),
				"width": this.model.get("width"),
				"height": this.model.get("height"),
				"z-index": this.model.get("zindex"),
				"opacity": this.model.get("opacity"),
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
		model: Element,
		comparator: function (model) {
			return -model.get("zindex");
		},
		cleanReset: function (data) {
			var model;
			while (!!(model = this.pop())) {
				model.destroy();
			}
			this.reset(data);
		}
	});

	var ElementsCollectionView = Backbone.View.extend({
		el: $(".main-view"),
		width: "",
		height: "",
		events: {
		},
		initialize: function (options) {
			this.dispatch = options.dispatch;
			this.listenTo(this.collection, 'add', this.initRenderElement);
			this.listenTo(this.collection, 'reset', this.resetElementsCollection);
		},
		initRenderElement: function (model , collection , options) {
			model.updateCurrentState(this.width);
			var modelView = new ElementView({model: model, dispatch: this.dispatch});
			this.$el.append(modelView.$el);
		},
		resetElementsCollection: function (collection, options) {
			this.collection.each(function (model) {
				this.initRenderElement(model, collection);
			},this);
		},
		changeDimension: function (width, height) {
			this.width = width;
			this.height = height;
			this.dispatch.trigger("ElementsCollectionView/width:change", {width: width});
			this.render();
		},
		changeColor: function (color) {
			this.color = color;			
			this.render();
		},
		render: function () {
			this.$el.css({"width": this.width, "height": this.height, "background-color": this.color});
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

	var EditElementOverlayView = Backbone.View.extend({
		el: $(".edit-overlay"),
		events: {
			"submit #editElementForm": "saveElement",
			"click .remove-element": "removeElement",
			"click .close" : "close",
			"click .cancel" : "close"
		},
		template: _.template($("#editElementItemTemp").html()),
		initialize: function (options) {
			this.dispatch = options.dispatch;
		},
		saveElement: function (e){
			e.preventDefault();
			this.model.set("name", this.$el.find(".input-name").val());
			this.model.set("content", this.$el.find(".input-content").val());
			this.model.set("bcolor", this.$el.find(".input-bcolor").val());
			this.model.set("opacity", this.$el.find(".input-opacity").val());
			this.close();
		},
		removeElement: function (e) {
			e.preventDefault();
			this.model.destroy();
			this.close();
		},
		show: function(model){
			this.model = model;
			this.render();
		},
		close: function (e) {
			this.$el.addClass("hidden");
		},
		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			//this.$el.find(".input-content").height(this.model.get("height")).width(this.model.get("width"));
			CKEDITOR.replace("element-content");
			this.$el.removeClass("hidden");
			return this;
		}

	});
	var PreviewElementsCollectionView = Backbone.View.extend({
		el: $(".elements-preview"),
		template: _.template($("#previewElementItemTemp").html()),
		opened: false,
		events: {
			"click .preview-handle":"toggleOpenState",
			"sortupdate .preview-list": "updateSort"
		},

		initialize: function (options) {
			this.dispatch = options.dispatch;
			this.listenTo(this.collection, "sort destroy change:name", this.render);
		},
		toggleOpenState: function () {
			if (!this.opened) {
				this.$el.addClass("opened");
				this.opened = true;
			} else {
				this.$el.removeClass("opened");
				this.opened = false;
			}
		},
		updateSort: function (e, ui){
			this.dispatch.trigger("PreviewElementCollection:sortupdate", {visible: $("#previewVisible").sortable("toArray"), disable: $("#previewDisable").sortable("toArray")});
		},
		render: function () {
			var self = this,
				visOutput = "",
				invisOutput = "";
			self.collection.each(function (model) {
				var data = model.toJSON();
				data.cid = model.cid;
				if (model.get("zindex") >= 0) {
					visOutput += self.template(data);
				} else {
					invisOutput += self.template(data);
				}
				
			});
			self.$el.find("#previewVisible").html(visOutput);
			self.$el.find("#previewDisable").html(invisOutput);
			self.$el.find( "#previewVisible, #previewDisable" ).sortable({
				connectWith: ".preview-list"
			});
			return self;
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
				success: function (model, resp) {
					if (!!resp.error) {
						self.showError("#loginError", resp.error);
					} else {
						model.set(resp);
						self.closeOverlay();
						self.dispatch.trigger("UserLogin:success", {user: self.model});
					}
				}
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
				if (!!data.error) {
					self.showError("#registerError", data.error);
				} else {
					self.model.set(data);
					self.closeOverlay();
					self.dispatch.trigger("UserLogin:success", {user: self.model});
				}
			});
		},
		initialize: function (options) {
			this.dispatch = options.dispatch;
		},
		closeOverlay: function () {
			this.$el.addClass("hidden");
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
			projectItems = "";
			if (data.length === 0) {
				return;
			}
			$projects = this.$el.find(".projects");
			$projects.empty();

			_(data).each(function(data){
				var datetime =  new Date((Date.parse(data.ts.replace(" ","T"))/60000 - new Date().getTimezoneOffset())*60000).toISOString();
				projectItems += "<div class=\"project\">" 
								+"<a class='project-name' href='"+"#/layout/"+data.name+"'>"+data.name+"</a>"
								+ "<abbr class='project-time timeago' title='"+datetime+"'></abbr>"
								+ "</div>"; 
				
			});
			$projects.append(projectItems);
			$projects.find(".timeago").timeago();
		}
	});
	var InstructionOverlayView = Backbone.View.extend({
		el:$(".instruction-overlay"),
		currentPane: 0,
		events: {
			"click .next": "goToNext",
			"click .close": "close"
		},
		getClassName: function (number) {
			return ".pane-" + number;
		},
		goToBeginning: function () {
			this.currentPane = 0;
		},
		goToNext: function (e) {
			
			this.$el.find(this.getClassName(this.currentPane)).addClass("hidden");
			if (this.currentPane===this.$el.find(".pane").length-1) {
				this.currentPane=0;
				this.$el.find(".next").html('<i class="icon-arrow-right"></i> Next');
			} else {
				this.currentPane=this.currentPane+1;
			}
			this.$el.find(this.getClassName(this.currentPane)).removeClass("hidden");
			if (this.currentPane===this.$el.find(".pane").length-1) {
				this.$el.find(".next").html('<i class="icon-repeat"></i> Start Over');
			}
		},
		close: function (e) {
			this.$el.find(this.getClassName(this.currentPane)).addClass("hidden");
			this.$el.addClass("hidden");
		},
		show: function () {
			this.$el.find(this.getClassName(this.currentPane)).removeClass("hidden");
			this.$el.removeClass("hidden");
		}
	});
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