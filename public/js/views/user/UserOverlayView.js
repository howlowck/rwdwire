define(['backbone','models/User','crypto','timeago'], function (Backbone, User, CryptoJS)
	{
		function passwordHash(raw){
			return CryptoJS.SHA256(raw).toString().substring(0,15);
		}

		var UserOverlayView = Backbone.View.extend({
			el:$(".user-overlay"),
			loginTemplate: _.template($("#loginOverlayTemp").html()),
			registerTemplate: _.template($("#registerOverlayTemp").html()),
			userTemplate: _.template($("#userOverlayTemp").html()),
			events: {
				"submit #loginForm" : "onLoginSubmit",
				"click .close" : "close",
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
							self.close();
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
						self.close();
						self.dispatch.trigger("UserLogin:success", {user: self.model});
					}
				});
			},
			initialize: function (options) {
				this.dispatch = options.dispatch;
			},
			close: function () {
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
									+"<a class='project-name' href='"+"#layout/"+data.name+"'>"+data.name+"</a>"
									+ "<abbr class='project-time timeago' title='"+datetime+"'></abbr>"
									+ "</div>"; 
					
				});
				$projects.append(projectItems);
				$projects.find(".timeago").timeago();
			}
		});
		return UserOverlayView;
	}
);