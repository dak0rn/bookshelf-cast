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
orm.plugin( bookshelfCast );

// Set up
test.before( () => {

    return db.schema.hasTable(tableName)
            .then( has => has ? db.schema.dropTable(tableName) : null )
            .then( () => db.schema.createTable(tableName, table => {
                table.string('id').primary();
                table.integer('booleanValue');
                table.string('numberValue');
            }))
            .then( () => db(tableName).insert({ booleanValue: 1, id, numberValue: '12345' }) )
            .then( () => db(tableName).insert({ booleanValue: 0, id: id2, numberValue: '8' }) );
});

test('parses truthy boolean value', t => {
    const Model = orm.Model.extend({
        tableName,

        casts: {
            booleanValue: 'boolean'
        }
    });

    return Model.forge().fetch({ id })
            .then( m => {
                t.is( m.get('booleanValue'), true );
            });
});

test('parses falsy boolean value', t => {
    const Model = orm.Model.extend({
        tableName,

        casts: {
            booleanValue: 'boolean'
        }
    });

    return Model.forge().fetch({ id: id2 })
        .then( m => {
            t.is( m.get('booleanValue'), false);
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

    return Model.forge().fetch({ id })
        .then( m => {
            t.is( m.get('numberValue'), 12345);
            t.is( m.get('nonDb'), 42);
        });
});