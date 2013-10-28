define(['backbone', 'highlight'], function (Backbone, hljs)
	{
		var ExportCodeElementsOverlayView = Backbone.View.extend({
			el: $(".export-overlay"),
			opened: false,
			events: {
				"click .close" : "close",
			},
			initialize: function (options) {
				this.dispatch = options.dispatch;
			},
			open: function () {
				this.$el.removeClass("hidden");
				this.opened = true;
				this.render();
			},
			close: function () {
				this.$el.addClass("hidden");
				this.opened = false;
			},
			render: function () {
				var self = this;
				this.renderHTML();
				$('pre code').each(function (i, e) {
					hljs.highlightBlock(e);
				});
				return self;
			},
			renderHTML: function () {
				var $htmlContainer = this.$el.find('#html-export code'),
				$rawButton = this.$el.find('#raw-html');
				value = "<html>\n\t<head> \n\t\t<meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\">\n\t</head>\n\t<body>\n\t\t{content}\n\t</body>\n</html>";
				$htmlContainer.text(value);
				value = $htmlContainer.html();
				value = hljs.fixMarkup(value, '&nbsp;&nbsp;&nbsp;&nbsp;', true);
				$rawButton.attr('href', 'data:text/html, <html contenteditable>' + value);
			},
			renderCSS: function () {
				var cssContainer = this.$el.find('#css-export code .content');

			}
		});

		return ExportCodeElementsOverlayView;
	}
);