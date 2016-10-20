
## Getting started

Text Explorer runs on Flask + Python 3 + SQLite on the backend and React on the frontend. This section will walk you through setting all that up.

### Python 3 + Flask
To get started, first ensure you have Python 3 installed. To do this on a mac, run 

```
$ brew install python3
```

If you don't already have virtualenvwrapper installed, follow the instructions [here](http://virtualenvwrapper.readthedocs.io/en/latest/install.html#basic-installation) to set it up. Once you've installed it, create a Python 3 virtualenv for this project, then install all required packages:

```
$ mkvirtualenv --python=`which python3` text-explorer
(text-explorer)$ pip install -r requirements.txt
```

Finally, run all our database migrations with

```
(text-explorer)$ ./manage.py db upgrade
```

### React

On the frontend, Text Explorer is driven by the React framework. We write all of our javascript in JSX, which is essentially ES6 (newest version of javascript) that also provides support for some HTML-like syntax. With the help of our friend webpack, our JSX is compiled down to regular old minified javascript. This section will walk you through the steps of compiling our JSX code to browser-ready javascript.

To start, make sure you have npm (node package manager) installed:

```
$ brew install npm
```

Next, install all the javascript dependencies listed in `package.json`:

```
$ npm install
```

Finally, compile our ES6 to javascript with

```
$ ./node_modules/.bin/webpack
```

### Database

The database we'll use is the standard iPhone backup. To set up the database, first back up your iPhone to your computer. To find that backup on a Mac, list the contents of `~/Library/Application Support/MobileSync/Backup/`. In that directory, you should see a bunch (or at least one) folder seemingly randomly named. Find the most recently created one, and copy it to the app directory with

```
(text-explorer)$ cp -r ~/Library/Application Support/MobileSync/Backup/<FOLDER_NAME> ./app/db/
```

### Run the server

You should be all set to run the development server! Make sure your virtualenv is activated, then give it a shot with

```
(text-explorer)$ ./run_server.py
```

## Development

### Javascript


All of our javascript gets compiled into a file `app/static/js/main.min.js`. The entire directory is .gitignored, so you should never put any code there. Instead, you should write code in the `jsx/` directory, and let webpack generate that `main.min.js` file.

When our Flask app recieves a request for a route that does not have an explicit assignment in `views.py`, it just renders `app/templates/index.html`. This file loads up `main.min.js`, which in turn starts up our React app. React then examines the URL, then chooses a component to render.

#### Javascript control flow

The entrypoint for our app is `jsx/main.jsx`. This file just creates an instance of the `AppRouter` component (`jsx/components/AppRouter.jsx`), then tells it to render inside of the element with id "content". The `AppRouter` is the root component of our javascript app, and is responsible for rendering everthing.

The `AppRouter` component is essentially the React equivalent of Django's `urls.py` - it examines the URL, potentially does some basic pattern-matching, then chooses a subcomponent to render. 

#### Writing javascript

To create a new page at a new URL, you first need to create a new file `jsx/components/MyComponent.jsx`, and in that file define a component that will render the page you want. Feel free to create subcomponents for this page - no individual component should be too complex, and ideally they should be reusable as well. Once you've finished writing your component, decide on a URL for the component, and then create a new Route that renders that component.

If you'd like to install a new javascript package, run 

```
$ npm install <package_name> --save
```

The `--save` flag adds the package and version to `package.json`, which is essentially javascript's beefed-up version of Python's `requirements.txt`. Commit the changes to `package.json` so that others can run `npm install` and download the package you added. Similarly, when you pull in new code, you may want to run `npm install` to ensure that your javascript packages are up to date.

#### Linting javascript

As you write your javascript code, you'll want to check your code for style and errors. To achieve this, run

```
$ npm run lint
```

which will check your javascript for errors and warnings and output them nicely for you. If you see any errors or warnings, you should fix them before committing your code.

#### Compiling javascript

As you're writing your javascript, it'll be useful to have your JSX compile to javascript as you go. To achieve this, run

```
$ npm run build
```

which will detect changes to JSX files and recompile your javascript.

## Recommended Reading

- **[Flask mega tutorial](http://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world)** - long and slightly out of date, but it'll give you an idea of why we organized our Flask app the way we did
- **[React tutorial](https://facebook.github.io/react/docs/tutorial.html)** - get an idea of how React works
- **[React Router tutorial](https://github.com/reactjs/react-router-tutorial/tree/master/lessons/01-setting-up)** - start here and look through the rest of the lessons
