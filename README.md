# bookshelf-cast

This plugin for Bookshelf makes it easy to convert values fetched from a database.
Custom or built-in cast functions for properties can be set in a `.casts` object
in a model.

## Installation

Install the plugin with `npm install bookshelf-cast` and load it in your bookshelf
instance.

```javascript
const bookshelf = new Bookshelf();
bookshelf.plugin('bookshelf-cast');
```

## Usage

Configure the cast functions in the `.cast` object by using built-in identifiers or custom functions.
Each function is applied in the model context (`this` = model), passed the value and meant to return
a value. Attributes that do not have a cast function assigned will be ignored.

```javascript
const Model = bookshelf.Model.extend({
    cast: {
        booleanValue: 'boolean',
        numberValue(what) {
            return parseInt(what, 10);
        },
        notFourtyTwo() {
            return 42;
        }
    }
});

Model.forge().fetch('id', 91)
        .then( model => {
            model.get('notFourtyTwo');  // 42
        });
```

## Built-in cast functions

**boolean**

Converts `0` and `'false'` into `false` and everything else into `true`.