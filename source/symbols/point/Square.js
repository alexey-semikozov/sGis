sGis.module('symbol.point.Square', [
    'Symbol',
    'render.Polygon',
    'serializer.symbolSerializer'
], (Symbol, PolygonRender, symbolSerializer) => {

    'use strict';

    /**
     * Symbol of point drawn as a square.
     * @alias sGis.symbol.point.Square
     * @extends sGis.Symbol
     */
    class SquareSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(/** sGis.feature.Point */ feature, resolution, crs) {
            if (feature.position === undefined) return [];

            var position = feature.projectTo(crs).position;
            var pxPosition = [position[0] / resolution, - position[1] / resolution];
            var halfSize = this.size / 2;
            var offset = this.offset;
            var coordinates = [
                [pxPosition[0] - halfSize + offset.x, pxPosition[1] - halfSize + offset.y],
                [pxPosition[0] - halfSize + offset.x, pxPosition[1] + halfSize + offset.y],
                [pxPosition[0] + halfSize + offset.x, pxPosition[1] + halfSize + offset.y],
                [pxPosition[0] + halfSize + offset.x, pxPosition[1] - halfSize + offset.y]
            ];

            return [new sGis.render.Polygon(coordinates, {fillColor: this.fillColor, strokeColor: this.strokeColor, strokeWidth: this.strokeWidth})];
        }
    }

    /**
     * Size of the square.
     * @member {Number} sGis.symbol.point.Square#size
     * @default 10
     */
    SquareSymbol.prototype.size = 10;

    /**
     * Offset of the point from the feature position in {x: dx, y: dy} format. If set to {x:0, y:0}, center of the square will be at the position of the feature.
     * @member {Object} sGis.symbol.point.Square#offset
     * @default {x: 0, y: 0}
     */
    SquareSymbol.prototype.offset = {x: 0, y: 0};

    /**
     * Color of the inner part of the square. Can be any valid css color string.
     * @member {String} sGis.symbol.point.Square#fillColor
     * @default "black"
     */
    SquareSymbol.prototype.fillColor = 'black';

    /**
     * Color of the outline of the square. Can be any valid css color string.
     * @member {String} sGis.symbol.point.Square#strokeColor
     * @default "transparent"
     */
    SquareSymbol.prototype.strokeColor = 'transparent';

    /**
     * Width of the outline.
     * @member {Number} sGis.symbol.point.Square#strokeWidth
     * @default 1
     */
    SquareSymbol.prototype.strokeWidth = 1;

    symbolSerializer.registerSymbol(SquareSymbol, 'point.Square', ['size', 'offset', 'fillColor', 'strokeColor', 'strokeWidth']);

    return SquareSymbol;

});