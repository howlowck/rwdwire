define(['backbone','jqueryui'], function (Backbone)
	{
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
		return PreviewElementsCollectionView;
	}
);