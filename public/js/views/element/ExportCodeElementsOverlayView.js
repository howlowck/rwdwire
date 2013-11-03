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
				this.widths = options.widths;
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
				this.renderCSS();
				$('pre code').each(function (i, e) {
					hljs.highlightBlock(e);
				});
				return self;
			},
			renderHTML: function () {
				var $htmlContainer = this.$el.find('#html-export code'),
				$rawButton = this.$el.find('#raw-html'),
				elements = this.collection.clone(),
				value = "<!doctype html>\n<html lang=\"en\">\n\t<head>\n\t\t<meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\">\n\t</head>\n\t<body>{content}\n\t</body>\n</html>";
				content = '';
				elements.comparator = 'y';

				elements.sort().each(function (model) {
					content += this.htmlRenderEngine(model);
				}, this);
				value = value.replace("{content}", content);
				$htmlContainer.text(value);

				value = $htmlContainer.html();
				value = hljs.fixMarkup(value, '&nbsp;&nbsp;&nbsp;&nbsp;', true);
				$rawButton.attr('href', 'data:text/html, <html contenteditable>' + value);
			},
			renderCSS: function () {
				var $cssContainer = this.$el.find('#css-export code'),
				$rawButton = this.$el.find('#raw-css'),
				value = '',
				elements = this.collection.clone(),
				widths = this.widths.clone();
				elements.comparator = 'y';
				widths.comparator = 'xmax';
				widths.each(function (width, index) {
					value += this.cssWidthRenderEngine(width, index, elements);
				}, this);
				// console.log(value);
				$cssContainer.text(value);

				value = $cssContainer.html();
				value = hljs.fixMarkup(value, '&nbsp;&nbsp;&nbsp;&nbsp;', true);
				$rawButton.attr('href', 'data:text/html, <html contenteditable>' + value);
			},
			htmlRenderEngine: function (element) {
				result = "\n\t\t<div class=\"" + element.get('name') + "\">\n\t\t\t" +
					element.get('content')
				+ "\n\t\t</div>";
				return result;
			},
			cssWidthRenderEngine: function (width, index, elements) {
				if (index == 0) {
					result = "@media (max-width: " + width.get('xmax') + "px) {\n{content}}\n\n";
				} else {
					result = "@media (min-width: " + width.get('xmin') + "px) and (max-width: " + width.get('xmax') + "px) {\n{content}}\n\n";
				}
				var content = '';
				elements.sort().each(function (element) {
					var className = '.' + element.get('name').replace(' ', '.'),
						info = element.getInfoByState(width.get('xmax')),
						elementStyles = this.cssElementRenderEngine(info);
					var style = '\t' + className + ' {';
					style += elementStyles.replace(/\n/g, '\n\t\t');
					style += '\n\t}\n';
					content += style;
				}, this);
				result = result.replace('{content}', content);
				return result;
			},
			cssElementRenderEngine: function (info) {
				// element.getInfoByState(width);
				if (info.state == '') {
					return '';
				} else if (info.zindex == '-1') {
					return '\ndisplay: none;';
				}
				var result = '';
				result += '\nwidth: ' + info.width + 'px;';
				result += '\nheight: ' + info.height + 'px;';
				return result;
			}
		});

		return ExportCodeElementsOverlayView;
	}
);