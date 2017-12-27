# bookshelf-cast

![](https://travis-ci.org/dak0rn/bookshelf-cast.svg?branch=master)
![](https://img.shields.io/badge/dependencies-none-green.svg)
![](https://img.shields.io/badge/tested%20with-ava-blue.svg)

Plugin for Bookshelf that makes it easy to convert model values fetched from a database.
Custom or built-in cast functions for properties can be set in a `casts` object
on a model.

## Installation

Install the plugin with `npm install bookshelf-cast` and load it in your bookshelf
instance.

```javascript
const bookshelf = new Bookshelf();

bookshelf.plugin('bookshelf-cast');
```

## Usage

Configure the cast functions in the `casts` object by using built-in converters (see below) or custom functions.
Each function is applied in the model context (`this` = model), passed the value and meant to return
a value. Attributes that do not have a cast function assigned will be ignored.

```javascript
const Model = bookshelf.Model.extend({
    casts: {
        // Property 'locked' will be converted into a boolean value
        locked: 'boolean',

        age(dbValue) {
            return parseInt(dbValue, 10);
        },

        notFourtyTwo() {
            return 42;
        }
    }
});

Model.forge().fetch('id', 91)
        .then( model => {
            typeof modal.get('locked'); // 'boolean'
            model.get('notFourtyTwo');  // 42
            typeof model.get('age'); // 'number'
        });
```

## Built-in cast functions

**boolean**

Converts `0` and `'false'` into `false` and everything else into `true`.
