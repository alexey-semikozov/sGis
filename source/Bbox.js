sGis.module('Bbox', [
    'utils',
    'CRS',
    'Point'
], function(/**sGis.utils*/ utils, /**sGis.CRS*/ CRS, /** sGis.Point.constructor */ Point) {
    'use strict';

    var defaults = {
        _crs: CRS.geo
    };

    /**
     * Simple rectangular area on a map
     * @class
     * @alias sGis.Bbox
     */
    class Bbox {
        /**
         * @constructor
         * @param {Number[]} point1
         * @param {Number[]} point2
         * @param {sGis.Crs} [crs=sGis.CRS.geo]
         */
        constructor(point1, point2, crs)
        {
            this._crs = crs;
            this._p = [Math.min(point1[0], point2[0]), Math.min(point1[1], point2[1]), Math.max(point1[0], point2[0]), Math.max(point1[1], point2[1])];
        }

        /**
         * Returns a new Bbox in the specified coordinate system
         * @param {sGis.Crs} crs - target coordinate system
         * @returns {sGis.Bbox}
         */
        projectTo(crs) {
            var projected1 = new Point(this._p.slice(0,2), this._crs).projectTo(crs).position;
            var projected2 = new Point(this._p.slice(2,4), this._crs).projectTo(crs).position;
            return new Bbox(projected1, projected2, crs);
        }

        /**
         * Returns a copy of the bbox
         * @returns {sGis.Bbox}
         */
        clone() {
            return this.projectTo(this._crs);
        }

        /**
         * Returns true if the given bbox is equal (geographically) to the target bbox
         * @param {sGis.Bbox} bbox - target bbox
         * @returns {boolean}
         */
        equals(bbox) {
            var target = bbox.coordinates;
            for (var i = 0; i < 4; i++) if (!utils.softEquals(this._p[i], target[i])) return false;
            return this._crs.equals(bbox.crs);
        }

        /**
         * Returns true if at list one point of the given bbox lies inside the target bbox
         * @param {sGis.Bbox} bbox - target bbox
         * @returns {boolean}
         */
        intersects(bbox) {
            var projected = bbox.projectTo(this._crs);
            return this.xMax > projected.xMin && this.xMin < projected.xMax && this.yMax > projected.yMin && this.yMin < projected.yMax;
        }

        /**
         * Returns true, if the target point is inside the bbox
         * @param {sGis.Point} point
         * @returns {boolean}
         */
        contains(point) {
            var projected = point.projectTo(this.crs);
            return this.xMin <= projected.x && this.xMax >= projected.x && this.yMin <= projected.y && this.yMax >= projected.y;
        }

        /**
         * Coordinate system of the bbox
         * @type sGis.Crs
         */
        get crs() { return this._crs; }

        /**
         * Right border of the bbox
         */
        get xMax() { return this._p[2] }
        set xMax(value) {
            if (value < this.xMin) utils.error('Max value cannot be lower than the min value');
            this._p[2] = value;
        }

        /**
         * Top border of the bbox
         */
        get yMax() { return this._p[3]; }
        set yMax(value) {
            if (value < this.yMin) sGis.utils.error('Max value cannot be lower than the min value');
            this._p[3] = value;
        }

        /**
         * Left border of the bbox
         */
        get xMin() { return this._p[0]; }
        set xMin(value) {
            if (value > this.xMax) sGis.utils.error('Min value cannot be higher than the max value');
            this._p[0] = value;
        }

        /**
         * Bottom border of the bbox
         */
        get yMin() { return this._p[1]; }
        set yMin(value) {
            if (value > this.yMax) sGis.utils.error('Min value cannot be higher than the max value');
            this._p[1] = value;
        }

        /**
         * Width of the bbox
         * @type number
         */
        get width() { return this.xMax - this.xMin; }

        /**
         * Height of the bbox
         * @type number
         */
        get height() { return this.yMax - this.yMin; }

        /**
         * Coordinates of the bbox in the form [xMin, yMin, xMax, yMax]
         * @type number[]
         */
        get coordinates() { return utils.copyArray(this._p); }

        /** @deprecated */
        get p() { return [this.p1, this.p2]; }

        /** @deprecated */
        get p1() { return new Point([this._p[0], this._p[1]], this._crs); }
        set p1(point){ this._setPoint(0, point); }

        /** @deprecated */
        get p2() { return new Point([this._p[2], this._p[3]]); }
        set p2(point) { this._setPoint(1, point); }

        /** @deprecated */
        _setPoint(index, point) {
            if (point instanceof Point) {
                var projected = point.projectTo(this._crs);
                this._p[index * 2] = projected.x;
                this._p[1 + index * 2] = projected.y;
            } else if (sGis.utils.isArray(point)) {
                this._p[index * 2] = point[0];
                this._p[1 + index * 2] = point[1];
            } else {
                sGis.utils.error('Point is expected but got ' + point + ' instead');
            }
        }
    }

    utils.extend(Bbox.prototype, defaults);

    return Bbox;

});
