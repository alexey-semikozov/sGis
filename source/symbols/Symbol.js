sGis.module('Symbol', [
    
], function() {
    'use strict';

    var Symbol = function(options) {
        for (var i in options) {
            this[i] = options[i];
        }
    };

    Symbol.fromDescription = function(desc) {
        var classDesc = desc.symbolName.split('.');
        var classLink = sGis.symbol[classDesc[0]];
        for (var i = 1; i < classDesc.length; i++) {
            classLink = classLink[classDesc[i]];
        }

        return new classLink(desc);
    };

    Symbol.prototype = {
        setDefaults: function(style) {
            this.defaults = {};
            for (var i in this.style) {
                Object.defineProperty(this.defaults, i, {
                    get: this.style[i].get,
                    set: this.style[i].set
                });
                this.defaults[i] = style && style[i] ? style[i] : this.style[i].defaultValue;
            }
        }
    };
    
    return Symbol;
    
});

sGis.module('symbol.label', [
    'utils',
    'Symbol'
], function(utils, Symbol) {
    'use strict';

    var labelSymbols = {
        Label: function(style) {
            sGis.utils.init(this, style, true);
        }
    };

    labelSymbols.Label.prototype = new sGis.Symbol({
        _width: 200,
        _height: 20,
        _offset: {x: -100, y: -10},
        _align: 'center',
        _css: '',

        renderFunction: function(feature, resolution, crs) {
            if (!feature._cache || !sGis.math.softEquals(resolution, feature._cache[0].resolution)) {
                var div = document.createElement('div');
                div.className = this.css;
                div.appendChild(feature.content);
                div.style.position = 'absolute';
                div.style.height = this.height + 'px';
                div.style.width = this.width + 'px';

                var point = feature.point.projectTo(crs);
                div.position = [point.x / resolution + this.offset.x, -point.y / resolution + this.offset.y];
                div.style.pointerEvents = 'none';
                div.style.cursor = 'inherit';
                div.style.textAlign = this.align;

                feature._cache = [{node: div, position: div.position, resolution: resolution, onAfterDisplay: this._getBboxSetter(point, resolution, div, feature)}];
            }

            return feature._cache;
        },

        _getBboxSetter: function(center, resolution, node, feature) {
            return function() {
                var width = node.offsetWidth * resolution / 2;
                var height = node.offsetHeight * resolution / 2;
                var offset = feature.symbol.offset;

                var bbox = new sGis.Bbox([center.x - width + offset.x, center.y - height + offset.y], [center.x + width + offset.x, center.y + height + offset.y], center.crs);
                feature.currentBbox = bbox;
            }
        }
    });

    Object.defineProperties(labelSymbols.Label.prototype, {
        type: {
            value: 'label'
        },

        width: {
            get: function() {
                return this._width;
            },
            set: function(width) {
                this._width = width;
            }
        },

        height: {
            get: function() {
                return this._height;
            },
            set: function(height) {
                this._height = height;
            }
        },

        offset: {
            get: function() {
                return sGis.utils.copyObject(this._offset);
            },
            set: function(offset) {
                this._offset = offset;
            }
        },

        align: {
            get: function() {
                return this._align;
            },
            set: function(align) {
                this._align = align;
            }
        },

        css: {
            get: function() {
                return this._css;
            },
            set: function(css) {
                this._css = css;
            }
        }
    });
    
    return labelSymbols;
    
});

sGis.module('symbol.image', [
    'utils',
    'Symbol'
], function(utils, Symbol) {
    'use strict';

    var imageSymbols = {
        Image: function(style) {
            sGis.utils.init(this, style, true);
        }
    };

    imageSymbols.Image.prototype = new sGis.Symbol({
        _transitionTime: 0,

        renderFunction: function(feature, resolution, crs) {
            if (!feature._cache) {
                var render = new sGis.render.Image(feature.src, feature.bbox, feature.width, feature.height);
                if (feature.transitionTime > 0) {
                    render.opacity = 0;
                    render.onAfterDisplayed = function(node) {
                        setTimeout(function() {
                            node.style.transition = 'opacity ' + feature.transitionTime / 1000 + 's linear';
                            node.style.opacity = feature.opacity; 
                        }, 0);
                    }
                } else {
                    render.opacity = feature.opacity;
                }
                
                feature._cache = [render];
            }
            return feature._cache;
        }
    });

    Object.defineProperties(imageSymbols.Image.prototype, {
        type: {
            value: 'image'
        },

        transitionTime: {
            get: function() {
                return this._transitionTime;
            },
            set: function(time) {
                this._transitionTime = time;
            }
        }
    });

    return imageSymbols;
    
});
