$(function(){

	/** Models and Collections **/
	Width = Backbone.Model.extend({
		defaults: {max: "1200", min: "0"},
		getView: function () {
			return $(this).data("view");
		}
	});

	MainViewport = Backbone.Model.extend({
		defaults: {width: 1200}
	});

	Element = Backbone.Model.extend({

	});

	var WidthCollection = Backbone.Collection.extend({
		model : Width,
		initialize: function (models, options) {
		}
	});


	/** Views **/
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

	MainViewportView = Backbone.View.extend({
		el: $(".main-view"),
		initialize: function (options) {
			this.dispatch = options.dispatch;
		},
		render: function () {

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


	/** Executions **/
	var AppView = Backbone.View.extend({
		el: $("body"),

		initialize: function () {
			dispatch = _.clone(Backbone.Events);
			widths = [{max: "450"}, {min: "451", max: "750"}, {min: "751"}];
			widthCollection = new WidthCollection(widths);
			widthCollectionView = new WidthCollectionView({collection: widthCollection, dispatch: dispatch});
			mainViewportView = new MainViewportView({dispatch: dispatch});
			
		},

		events: function () {
			dispatch.on("widthView:click", this.updateViewportWidth);
		},

		updateViewportWidth: function (payload) {
			console.log(payload.model.get("max"));
			console.log("clicked! (from app view!)");
		}
	});
	
	App = new AppView();
})