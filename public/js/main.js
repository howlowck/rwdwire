$(function(){
	
	Element = Backbone.Model.extend({
		defaults: {
			width: "200",
			height: "200",
			x: "0",
			y: "0",
			type: "div",
			content: " a Div",
			bcolor: "blue"
		}
	});

	ElementView = Backbone.View.extend({
		className: "element-view",
		initialize: function (options) {
			this.dispatch = options.dispatch;
		},
		render: function () {
			this.$el.width(this.model.get("width"));
			this.$el.height(this.model.get("height"));
			this.$el.position({left: this.model.get("x"), top: this.model.get("y")});
			this.$el.css("background-color", this.model.get("bcolor"));
			return this;
		}
	});
	
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
			this.dispatch.trigger("widthView:click", {model: this.model});
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

	MainViewport = Backbone.Collection.extend({

	});

	MainViewportView = Backbone.View.extend({
		el: $(".main-view"),
		width: "1200",
		initialize: function (options) {
			this.dispatch = options.dispatch;
			this.render();
			this.dispatch.on("mainViewportView:change", this.render,this);
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
			mainViewport = new MainViewport();
			mainViewportView = new MainViewportView({model: mainViewport, dispatch: dispatch});
		},

		events: function () {
			dispatch.on("widthView:click", this.updateViewportWidth);

		},

		updateViewportWidth: function (payload) {
			mainViewportView.width = payload.model.get("max");
			dispatch.trigger("mainViewportView:change");
		}
	});
	
	App = new AppView();
})