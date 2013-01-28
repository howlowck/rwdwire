$(function(){
	
	Width = Backbone.Model.extend({
		defaults: {max: "1200", min: "0"},
		getView: function () {
			return $(this).data("view");
		}
	});

	WidthView = Backbone.View.extend({

		className: "width-view",
		events: {
			"click" : "updateViewportWidth"
		},
		
		template: _.template($("#widthViewTemp").html()),
		initialize: function (options) {
			this.dispatch = options.dispatch;
			$(this.model).data("view", this);
		},
		dimension: function () {
			return this.model.get("max") - this.model.get("min");
		},
		updateViewportWidth: function () {
			this.dispatch.trigger("WidthView:click", {model: this.model});
		},
		render: function () {
			//console.log(this.model);
			this.$el.html(this.template(this.model.toJSON()));
			this.$el.width(this.dimension());
			return this;
		}
	});


	var WidthCollection = Backbone.Collection.extend({
		model : Width,
		initialize: function (models, options) {
		}
	});

	var WidthCollectionView = Backbone.View.extend({
		el: $("#sizes"),
		events: {
			
		},
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
		defaults: {
			width: "200",
			height: "200",
			x: "10",
			y: "10",
			type: "div",
			content: " a Div",
			bcolor: "blue"
		}
	});

	ElementView = Backbone.View.extend({
		className: "element-view",
		//template: _.template($("#elementViewTemp").html()),
		attributes: {
			"draggable" : "true"
		},
		events: {
			"dragstart" : "collectDragInfo",
			"resizestop" : "updateDimension"
		},

		initialize: function (options) {
			this.dispatch = options.dispatch;
			this.listenTo(this.model, "change:x, change:y", this.render);
		},
		updateDimension: function () {
			this.model.set("width", this.$el.width() );
			this.model.set("height", this.$el.height());
		},
		collectDragInfo: function (e) {
			var topVal = e.originalEvent.clientY - this.$el.position().top;
			var leftVal = e.originalEvent.clientX - this.$el.position().left;
			e.originalEvent.dataTransfer.setData("application/json",'{"top" :'+ topVal + ', "left": ' + leftVal + ', "id" : "' + this.model.cid + '" }');
		},

		render: function () {
			this.$el.width(this.model.get("width"));
			this.$el.height(this.model.get("height"));
			this.$el.position({left: this.model.get("x"), top: this.model.get("y")});
			this.$el.css({"background-color": this.model.get("bcolor") , "left" : this.model.get("x") , "top" : this.model.get("y")});
			this.$el.resizable({
				ghost: true
			});
			return this;
		}
	});

	ElementsCollection = Backbone.Collection.extend({
		initialize: function () {

		}
	});

	ElementsCollectionView = Backbone.View.extend({
		el: $(".main-view"),
		width: "1200",
		events: {
			"dragover": "allowdrag",
			"drop" : "updateElementPosition"
		},
		initialize: function (options) {
			this.dispatch = options.dispatch;
			this.render();
			this.dispatch.on("ElementsCollectionView:change", this.updateWidth,this);
			this.listenTo(this.collection, 'add', this.renderElement);
		},
		allowdrag: function (e) {
			e.preventDefault();
		},
		updateElementPosition: function (e) {
			var eventData = $.parseJSON(e.originalEvent.dataTransfer.getData("application/json"));
			this.collection.get(eventData.id).set('x', e.originalEvent.clientX - eventData.left).set('y', e.originalEvent.clientY - eventData.top);
			console.log(eventData);
		},
		updateWidth: function () {
			this.render();
		},

		renderElement: function (model , collection , options) {
			var modelView = new ElementView({model: model, dispatch: this.dispatch});
			this.$el.append(modelView.render().el);
		},

		render: function () {
			this.$el.width(this.width);
			return this;
		}


	});

	/** Executions **/
	var AppView = Backbone.View.extend({
		el: $("body"),

		initialize: function () {
			dispatch = _.clone(Backbone.Events);
			widths = [{max: "450"}, {min: "451", max: "750"}, {min: "751"}];
			widthCollection = new WidthCollection(widths);
			widthCollectionView = new WidthCollectionView({collection: widthCollection, dispatch: dispatch});
			elementsCollection = new ElementsCollection();
			elementsCollectionView = new ElementsCollectionView({collection: elementsCollection, dispatch: dispatch});
			elementsCollection.add(new Element());
		},

		events: function () {
			dispatch.on("WidthView:click", this.updateViewportWidth);

		},

		updateViewportWidth: function (payload) {
			elementsCollectionView.width = payload.model.get("max");
			dispatch.trigger("ElementsCollectionView:change");
		}
	});
	
	App = new AppView();
})