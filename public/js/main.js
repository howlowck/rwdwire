$(function(){
	
	Width = Backbone.Model.extend({
		defaults: {xmax: "1200", xmin: "0", y: "700"},
		getView: function () {
			return $(this).data("view");
		}
	});

	WidthView = Backbone.View.extend({
		className: "width-view",
		events: {
			"click" : "updateViewportDim"
		},
		
		template: _.template($("#widthViewTemp").html()),
		initialize: function (options) {
			this.dispatch = options.dispatch;
			$(this.model).data("view", this);
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
			return this;
		}
	});

	// var Tool = Backbone.Model.extend({
	// 	defaults: {
	// 		name: "New Element"
	// 	}
	// });

	// var ToolView = Backbone.View.extend({
		
	// 	className: "tool",
	// 	initialize: function (options) {
	// 		this.dispatch = options.dispatch;
	// 		this.render();
	// 	},
	// 	render: function () {

	// 	}

	// });

	var WidthCollection = Backbone.Collection.extend({
		model : Width,
		initialize: function (models, options) {
		}
	});

	var WidthCollectionView = Backbone.View.extend({
		el: $("#sizes"),

		initialize: function(options) {
			this.dispatch = options.dispatch;
			this.render();
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
			bcolor: "#eee"
		},
		initialize: function (attibutes, options) {
			_.each(options.states, function(value, key) {
				this[key] = value;
			}, this)
		},
		updateCurrentState: function (width) {
			//Store dimension to current (soon previous state)
			if (this.currentState !== "defaults") {
				this[this.currentState] = {width: this.get("width"), height: this.get("height"), x: this.get("x"), y: this.get("y")};
			}
			this.previousState = this.currentState;
			//change current state and update dimension
			this.currentState = "state"+width.toString();
			if (!!this[this.currentState]) {
				this.set({width: this[this.currentState].width, height: this[this.currentState].height, x: this[this.currentState].x, y: this[this.currentState].y});
			}
		}
	});

	ElementView = Backbone.View.extend({
		className: "element-view",
		template: _.template($("#elementViewTemp").html()),
		attributes: {
			"draggable" : "true"
		},
		events: {
			"dragstart" : "collectDragInfo",
			"resizestop" : "updateDimension",
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
			this.$el.resizable({
				ghost: true
			});

			this.$el.css({ 
				"position": "absolute",
				//Transition needs to be inline since everything else is inline.
				"-webkit-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s", /* Safari and Chrome */
				"-moz-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s", /* Firefox 4 */
				"-ms-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s", /* MS */
				"-o-transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s", /* Opera */
				"transition": "top 0.5s, left 0.5s, width 0.5s, height 0.5s"
			});

		},
		updateDimension: function () {
			this.model.set({"width": $(".ui-resizable-helper").width(), "height": $(".ui-resizable-helper").height()});
			this.render();
		},
		collectDragInfo: function (e) {
			var topVal = e.originalEvent.clientY - this.$el.position().top;
			var leftVal = e.originalEvent.clientX - this.$el.position().left;
			e.originalEvent.dataTransfer.setData("application/json",'{"top" :'+ topVal + ', "left": ' + leftVal + ', "id" : "' + this.model.cid + '" }');
		},
		editContent: function () {
			this.$el.find(".edit-content").addClass("hidden");

			this.$el.find(".inputContent").val(this.model.get("content"));
			this.$el.find(".inputColor").val(this.model.get("bcolor"));

			this.$el.find(".edit").removeClass("hidden");
			this.$el.find(".save-content").removeClass("hidden");
			this.$el.find(".content").addClass("hidden");
		},
		saveContent: function () {
			this.$el.find(".save-content").addClass("hidden");

			this.model.set({"content" :this.$el.find(".inputContent").val(), "bcolor" : this.$el.find(".inputColor").val()});

			this.$el.find(".edit").addClass("hidden");
			this.$el.find(".edit-content").removeClass("hidden");
			this.$el.find(".content").removeClass("hidden");
		},
		
		removeElement: function (){
			console.log("triggered");
			this.model.destroy();
		},
		
		render: function () {
			this.$el.children(".inner").html(this.template(this.model.toJSON()));
			this.$el.position({left: this.model.get("x"), top: this.model.get("y")});
			this.$el.css({"background-color": this.model.get("bcolor") , "left" : this.model.get("x") , "top" : this.model.get("y"), "width": this.model.get("width"), "height": this.model.get("height")});
			return this;
		}
	});

	ElementsCollection = Backbone.Collection.extend({
		model: Element,

		initLoad: function (modelsData) {
			_.each(modelsData, function (oneModelData) {
				this.add(oneModelData.property, {states: _.omit(oneModelData, 'property')});
			}, this);
		}
	});

	ElementsCollectionView = Backbone.View.extend({
		el: $(".main-view"),
		width: "",
		height: "",
		events: {
			"dragover": "allowdrag",
			"drop" : "updateElementPosition",
			"mousedown" : "startCreateElement",
			"mouseup" : "endCreateElement"
		},
		initialize: function (options) {
			this.dispatch = options.dispatch;
			this.changeDimension(options.width, options.height);
			this.render();

			this.listenTo(this.collection, 'add', this.initRenderElement);
		},
		allowdrag: function (e) {
			e.preventDefault();
		},
		updateElementPosition: function (e) {
			var eventData = $.parseJSON(e.originalEvent.dataTransfer.getData("application/json"));
			this.collection.get(eventData.id).set({'x':e.originalEvent.clientX - eventData.left , 'y' : e.originalEvent.clientY - eventData.top});
		},
		initRenderElement: function (model , collection , options) {
			model.updateCurrentState(this.width);
			var modelView = new ElementView({model: model, dispatch: this.dispatch});
			this.$el.append(modelView.el);
		},
		startCreateElement: function (e){
			if (e.shiftKey) {
				console.log(e);
				this.createElementStartLocation = {x: e.originalEvent.clientX, y: e.originalEvent.clientY};
			}
		},
		endCreateElement: function (e) {
			if (e.shiftKey) {
				console.log(e);
			}
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

	/** Executions **/

	var AppView = Backbone.View.extend({
		el: $("body"),

		initialize: function () {

			dispatch = _.clone(Backbone.Events);
			data = {
				dimension: [{xmax: "450", y: "700"}, {xmin: "451", xmax: "750", y: "700"}, {xmin: "751", y: "700"} ],
				elements: [{
							property: {
								disable: false,
								width: 200,
								height: 100,
								x: 10,
								y: 10,
								type: "div",
								content: "Hi! I'm a new Element.  Edit me.",
								bcolor: "#eee"
							},
							state750: {
								width: 300,
								height: 300,
								x: 30,
								y: 30
							} 
						},{
							property: {
								disable: false,
								width: 300,
								height: 200,
								x: 50,
								y: 100,
								type: "div",
								content: "New Div!!!",
								bcolor: "#abc"
							}
						}
				]
			};
			this.widthCollection = new WidthCollection(data.dimension);
			this.widthCollectionView = new WidthCollectionView({collection: this.widthCollection, dispatch: dispatch});
			this.elementsCollection = new ElementsCollection();
			this.elementsCollectionView = new ElementsCollectionView({collection: this.elementsCollection, dispatch: dispatch, width: this.widthCollection.first().get("xmax"), height: this.widthCollection.first().get("y")});

			this.elementsCollection.initLoad(data.elements);
			//elementsCollection.add(new Element());
		},

		events: function () {
			dispatch.on("WidthView:click", this.updateViewportDim);
			dispatch.on("ElementsCollectionView/width:change", this.updateElementsState);
		},

		updateViewportDim: function (payload) {
			this.elementsCollectionView.changeDimension(payload.width, payload.height);
		},

		updateElementsState: function (payload) {
			_.each(elementsCollection.models, function(model) {
				model.updateCurrentState(payload.width);
			});
		}
	});
	
	var App = Backbone.Router.extend({
		initialize: function () {
			this.appView = new AppView();
		}
	});

	app= new App();
});