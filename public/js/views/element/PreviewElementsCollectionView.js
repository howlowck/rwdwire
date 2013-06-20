define(['backbone', 'jqueryui'], function (Backbone)
	{
		var PreviewElementsCollectionView = Backbone.View.extend({
			el: $(".elements-overview"),
			template: _.template($("#overviewElementItemTemp").html()),
			opened: false,
			events: {
				"click .overview-handle": "toggleOpenState",
				"click .close" : "close",
				"mouseenter" : "enterFade",
				"mouseleave": "exitFade",
				"sortupdate .overview-list": "updateSort",
				"dragstart": "addDragClass",
				"dragstop": "removeDragClass"
			},
			initialize: function (options) {
				this.dispatch = options.dispatch;
				this.listenTo(this.collection, "sort destroy change:name", this.render);
			},
			toggleOpenState: function () {
				if (!this.opened) {
					this.open();
				} else {
					this.close();
				}
			},
			open: function () {
				this.$el.removeClass("hidden");
				this.opened = true;
			},
			close: function () {
				this.$el.addClass("hidden");
				this.opened = false;
			},
			enterFade: function () {
				this.$el.css("opacity", 1);
			},
			exitFade: function () {
				this.$el.css("opacity", 0.5);
			},
			addDragClass: function () {
				this.$el.addClass("dragging");
			},
			removeDragClass: function () {
				this.$el.removeClass("dragging");
			},
			updateSort: function () {
				this.dispatch.trigger(
					"OverviewElementCollection:sortupdate", {
						visible: this.$("#overviewVisible").sortable("toArray"),
						disable: this.$("#overviewDisable").sortable("toArray")
					}
				);
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
				self.$el.find("#overviewVisible").html(visOutput);
				self.$el.find("#overviewDisable").html(invisOutput)
						.append("<span class='placeholder'>Drag here to disable</span>");
				self.$el.find("#overviewVisible, #overviewDisable").sortable({
					connectWith: ".overview-list"
				});
				self.$el.draggable({handle: 'h3'});
				return self;
			}
		});
		return PreviewElementsCollectionView;
	}
);