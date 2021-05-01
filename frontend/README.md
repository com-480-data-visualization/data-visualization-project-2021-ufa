# Frontend

_[Source](https://github.com/wbkd/webpack-starter) of the template used (with some minor modifications)._

## Installation

1. Make sure you are in this directory: `cd frontend`
2. `npm install`
   
   Ignore the various warnings and deprecation notices (this is fairly usual).

## Development

1. `npm start`
   
   It will start a (local) development server and open the link in your browser (usually under [http://localhost:8080](http://localhost:8080)).
   The page will automatically reload when you do changes in the code.

It is highly recommended using an IDE that supports at least syntax highlighting for `.(html|s?css|js)` files, and that optionally integrates eslint warnings or does some static analysis.
Most modern IDEs usually do all of that natively (JetBrains, VSCode).

## Deployment

1. `npm run build`

   It will create a minified package ready to be served on a webserver.
   The files will be created under `build/`
