window.fbAsyncInit = function() {
	FB.init({
	  appId      : '412572172152958',
	  status     : true, 
	  cookie     : true, 
	  xfbml      : true  
	});

};


(function(d, debug){
 var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement('script'); js.id = id; js.async = true;
 js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
 ref.parentNode.insertBefore(js, ref);
}(document, /*debug*/ false));