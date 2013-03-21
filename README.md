# RWD Wireframes

RWD Wireframes was created for designers who want to make responsive web design wireframe quickly and be able to share with others easily.

You can find the live application at [www.lifeishao.com/rwdwire](http://www.lifeishao.com/rwdwire) .

## Install Note

RWD Wireframes application has a client side and server side component.  This repo is the client side code.  You'll find the server side code by searching "rwdwire-server".

The client side is functional by itself, it just won't have the login, register, and save functionality.

The main application is mainly located in `public/js`.  The Entry point is `main.js`.

After you clone the repo, you will need [bower](https://github.com/twitter/bower) to install the dependencies.

You'll need to create a facebook.js file in `public/js/`. You can read about [facebook SDK](https://developers.facebook.com/docs/reference/javascript/#loading). facebook.js is the initialization code.