/*!
 * My Superbundle
 */

/*!
 * Superjoin module loader
 * Copyright by Andi Heinkelein <andi.oxidant@noname-media.com>
 */
(function(window) {
    var require = function(file) {
        'use strict';

        console.log('Req', this, file);

        var module = {
            exports: {},
            file: file
        };

        file = require.resolve(file, this ? this.file : null);

        if (window.require.cache[file]) {
            
            return window.require.cache[file];
        }

        if (!window.require.autoload || file.charAt(0) !== '/') {
            throw new Error('Module ' + file + ' not found!');
        }

        var remoteFile = location.protocol
            .concat('//', location.host)
            .concat(file);
        
        var xhr = new XMLHttpRequest();
        xhr.open('GET', remoteFile, false);
        xhr.send();
        var source = xhr.responseText;

        var fn;
        try {
            //jshint evil:true
            fn = eval('(function(module, exports, require) {\n' + source + '\n})\n\n//# sourceURL=' + file);
        }
        catch (err) {
            throw new Error(err + ' in ' + file);
        }

        fn(module, module.exports, require.bind(module));
        window.require.cache[file] = module.exports;
        return module.exports;
    };

    require.resolve = function(path, parent) {
        'use strict';

        console.log('Resolve', path, parent);

        // if (window.require.alias[path]) {
        //     return window.require.alias[path];
        // }

        var resolved = [];
        if (path.charAt(0) === '.') {
            var newPath = parent || location.pathname;
            newPath = newPath.split('/');
            newPath.pop();
            newPath = newPath.concat(path.split('/'));

            newPath.forEach(function(p) {
                if (p === '..') {
                    resolved.pop();
                    return;
                }
                else if (p === '.' || p === '') {
                    return;
                }

                resolved.push(p);
            });

            resolved.unshift('.');
        }
        else {
            return path;
        }

        resolved = resolved.join('/');
        if (!/\.js(on)?$/.test(resolved)) {
            resolved += '.js';
        }

        console.log(' to', resolved);
        return resolved;
    };

    require.register = function(path, fn) {
        var module = {
            exports: {},
            file: path
        };

        fn(module, module.exports, require.bind(module));
        require.cache[path] = module.exports;
    };

    require.cache = {};
    // require.alias = {};

    window.require = require;
})(window);

require.register('./fixtures/module1.js', function(module, exports, require) {
module.exports = function() {
    'use strict';
    return 'Module 1';  
};
});
require.register('./fixtures/module2.js', function(module, exports, require) {
module.exports = function() {
    'use strict';
    return 'Module 2';  
};
});
require('./fixtures/module1.js');
