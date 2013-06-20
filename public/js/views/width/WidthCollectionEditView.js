define(['backbone', 'models/Width', 'collections/WidthCollection','jqueryui'], function (Backbone, Width, WidthCollection)
	{
		var WidthCollectionEditView = Backbone.View.extend({
			el: $(".width-overlay"),
			template: _.template($("#widthOverlayTemp").html()),
			formItemTemplate: _.template($("#widthFormItemTemp").html()),
			events: {
				"click .close" : "close",
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
				this.listenTo(this.collection, "reset add destroy sort", this.render);
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
				this.collection.get($editElement.attr("data-cid")).set("xmax", parseInt($(e.target).val(), 10));
			},
			editHeight: function (e) {
				var $editElement = $(e.target).parent();
				this.collection.get($editElement.attr("data-cid")).set("y", parseInt($(e.target).val(), 10));
			},
			editTitle: function (e) {
				var $editElement = $(e.target).parent();
				this.collection.get($editElement.attr("data-cid")).set("title", $(e.target).val());
			},
			editViewportColor: function (e) {
				var $editElement = $(e.target).parent();
				var widthModel = this.collection.get($editElement.attr("data-cid"));
				widthModel.set("viewportColor", $(e.target).val());
				this.dispatch.trigger("WidthCollection/viewportColor:change",
					{
						width: widthModel.get("xmax"),
						color: $(e.target).val()
					}
				);
			},
			close: function () {
				this.$el.addClass("hidden");
			},
			open: function () {
				this.$el.removeClass("hidden");
			},
			render: function () {
				this.$el.html(this.template());
				var $formItemDiv = this.$el.find(".width-form-items"),
					widthsHTML = "";
				$formItemDiv.empty();
				this.collection.each(function (model) {
					var data = model.toJSON();
					data.cid = model.cid;
					widthsHTML += this.formItemTemplate(data);
				}, this);
				$formItemDiv.append(widthsHTML);
				//removes the first remove button because there should be at least one width.
				this.$el.find(".remove-width").first().remove();
				this.$el.find(".window").draggable();
				return this;
			}
		});
		return WidthCollectionEditView;
	}
);