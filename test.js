/**
 * Tests for bookshelf-cast
 */
const test = require('ava');
const Bookshelf = require('bookshelf');
const knex = require('knex');

const bookshelfCast = require('./index');
const filename = './test-db';
const tableName = 'testTable';
const id = 'mod';
const id2 = 'mod2';

const db = knex({
    client: 'sqlite3',
    connection: {
        filename
    }
});

const orm = new Bookshelf(db);
orm.plugin(bookshelfCast);

// Set up
test.before(() => {
    return db.schema
        .hasTable(tableName)
        .then(has => (has ? db.schema.dropTable(tableName) : null))
        .then(() =>
            db.schema.createTable(tableName, table => {
                table.string('id').primary();
                table.integer('booleanValue');
                table.string('numberValue');
            })
        )
        .then(() => db(tableName).insert({ booleanValue: 1, id, numberValue: '12345' }))
        .then(() => db(tableName).insert({ booleanValue: 0, id: id2, numberValue: '8' }));
});

test('parses truthy boolean value', t => {
    const Model = orm.Model.extend({
        tableName,

        casts: {
            booleanValue: 'boolean'
        }
    });

    return Model.forge()
        .where({ id })
        .fetch()
        .then(m => {
            t.true(m.get('booleanValue'));
        });
});

test('parses falsy boolean value', t => {
    const Model = orm.Model.extend({
        tableName,

        casts: {
            booleanValue: 'boolean'
        }
    });

    return Model.forge()
        .where({ id: id2 })
        .fetch()
        .then(m => {
            t.false(m.get('booleanValue'));
        });
});

test('parses with custom functions', t => {
    const Model = orm.Model.extend({
        tableName,

        casts: {
            numberValue(val) {
                return parseInt(val, 10);
            },

            nonDb() {
                return 42;
            }
        }
    });

    return Model.forge()
        .where({ id })
        .fetch()
        .then(m => {
            t.is(m.get('numberValue'), 12345);
            t.is(m.get('nonDb'), 42);
        });
});

test('ignores non-set attributes', t => {
    const Model = orm.Model.extend({
        tableName
    });

    return Model.forge()
        .where({ id })
        .fetch()
        .then(m => {
            t.is(m.get('numberValue'), '12345');
            t.is(m.get('booleanValue'), 1);
        });
});

test('throws when non-built in function referenced', t => {
    const Model = orm.Model.extend({
        tableName,

        casts: {
            booleanValue: 'not-found'
        }
    });

    return Model.forge()
        .where({ id })
        .fetch()
        .then(() => t.fail())
        .catch(err => {
            t.is(err.message, "bookshelf-cast: don't know how to handle cast value not-found");
        });
});

test('throws when non-function and non-string cast given', t => {
    const Model = orm.Model.extend({
        tableName,

        casts: {
            booleanValue: 42
        }
    });

    return Model.forge()
        .where({ id })
        .fetch()
        .then(() => t.fail())
        .catch(err => {
            t.is(err.message, "bookshelf-cast: don't know how to handle cast value 42");
        });
});
