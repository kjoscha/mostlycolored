![current design](https://user-images.githubusercontent.com/3657707/32664167-b5d29ac0-c630-11e7-8333-a6003ea9d22a.png)

# Based on a react-sinatra-boilerplate 
This is a boilerplate for a basic React project. It has a Sinatra backend, so
the Sinatra server will be serving your React code up to the browser.

You'll need to run the following commands to get started!

`npm install`
`bundle install`

Then in order to get the application up and running you have to open up two
tabs and run `bundle exec puma` in one and `npm start` in the other!

You can add your React components within the `react` folder, where you will see
there is already a `main.js` setup for you. This `main.js` replaces the `<div>`
with an id of `app` in the `index.html` file of the application with your React
app.

Also, be sure to replace the title in the `<title>` tag in the `index.html` file
with the actual title of your application. Enjoy!
