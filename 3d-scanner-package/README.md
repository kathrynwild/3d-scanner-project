# hello-express

A server that serves a webpage, its resources, and some data

## Your Project

On the front-end,

- `views/index.html` lays out the contents of the web page/web viewer. It connects to the js/ files to present the captures
- `public/js/` is a folder that holds javascript files that integrate the capture data from the hardware components to the web viewer
- `public/style.css` is the styles for `views/index.html`
- Drag in `assets`, like images or music, to add them to your project

In js/ folder,

- `views/index.html` lays out th

On the back-end,

- `server.js` handles all methods to client, receiving captures, database connection, and web viewer connection
- frameworks and packages are stored in `package.json`
- `mongoose/` folder holds javascript files that connect to the mongodb database to send and retrieve capture data

In mongoose/ folder,

- `captureSchema.js` creates the schema of how the information of each capture will be stored
- `mongoUtility.js` holds all methods to connect to MongoDB database clusters and send, modify, or retrieve capture data

Click `Show` in the header to see your app live. Updates to your code will instantly deploy.


