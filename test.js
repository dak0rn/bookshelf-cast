/**
 * Tests for bookshelf-cast
 */
const test = require('ava');
const Bookshelf = require('bookshelf');
const knex = require('knex');
const sinon = require('sinon');

const bookshelfCast = require('./index');
const filename = './test-db';

const db = knex({
    client: 'sqlite3',
    connection: {
        filename
    }
});

const orm = new Bookshelf(db);
orm.plugin( bookshelfCast );

test('parses truthy boolean value', t => {
    const model = orm.Model.extend({

        casts: {
            booleanValue: 'boolean'
        }
    }).forge();

    const json = model.toJSON();
    t.is( json.booleanValue, true );
});

test('parses falsy boolean value', t => {
    const model = orm.Model.extend({

        casts: {
            booleanValue: 'boolean'
        }
    }).forge();

    const json = model.toJSON();
    t.is( json.booleanValue, false );

});

test('custom functions are called when serializing', t => {
    const spy = sinon.spy();

    const model = orm.Model.extend({

        casts: {
            spy
        }
    }).forge();

    model.toJSON();

    t.is( spy.called, true );
});

test('parses with custom functions', t => {
    const model = orm.Model.extend({

        casts: {
            numberValue(val) {
                return parseInt(val, 10);
            },

            nonDb() {
                return 42;
            }
        }
    }).forge();

    const json = model.toJSON();

    t.is( json.numberValue, 12345 );
    t.is( json.nonDB, 42 );

});