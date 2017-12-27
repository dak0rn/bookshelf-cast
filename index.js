/**
 * bookshelf-cast
 *
 * A cast plugin for bookshelf that makes it easier to
 * to cast values.
 *
 * Copyright 2016 Daniel Koch
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Functions that are supported out of the box
 */
const bakedInFns = {
    boolean(what) {
        if(! what)
            return false;

        /* eslint-disable eqeqeq */
        if( 'false' === what || 0 == what )
            return false;
        /* eslint-enable eqeqeq */

        return true;
    }
};

module.exports = bookshelf => {
    const proto = bookshelf.Model.prototype;

    bookshelf.Model = bookshelf.Model.extend({

        parse(attrs) {
            // Call parent
            const parsed = proto.parse.call(this, attrs);
            const casts = this.casts || {};
            const keys = Object.keys( casts );

            for( const key of keys ) {
                const def = { name: key, fn: casts[key] };

                // Something we provide? Use that.
                if( 'function' === typeof bakedInFns[def.fn] )
                    def.fn = bakedInFns[def.fn];
                else if ('function' !== typeof def.fn)
                    throw new Error(`bookshelf-cast: don't know how to handle cast value ${def.fn}`);

                // Call the cast function and update the model value
                parsed[def.name] = def.fn.call(this, parsed[def.name]);
            }

            return parsed;
        }

    });

};
