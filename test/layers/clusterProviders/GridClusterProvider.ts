import {GridClusterProvider} from "../../../source/layers/clusterProviders/GridClusterProvider";
import {FeatureGroup} from "../../../source/features/FeatureGroup";
import {Feature} from "../../../source/features/Feature";
import {PointFeature} from "../../../source/features/PointFeature";
import {wgs84, webMercator} from "../../../source/Crs";

describe('GridClusterProvider', () => {
    const resolution = 9595;
    const clusterSize = 44;

    const pythagoras = (p1: Feature, p2: Feature): number => {
        return Math.hypot(p2.centroid[0] - p1.centroid[0], p2.centroid[1] - p1.centroid[1]);
    }

    const points = [
        [73.355357, 54.878128],
        [59.822013, 53.521495],
        [60.520713, 54.827998],
        [61.579522, 55.061807],
        [60.74531, 56.082793],
        [150.839039, 59.549667],
        [150.809511, 59.570643],
        [150.797609, 59.56511],
        [39.79428, 43.548443],
    ].map(point => new PointFeature([point[0], point[1]], {crs: wgs84}));

    const clusters = new GridClusterProvider({
        size: clusterSize,
        features: points,
        crs: webMercator,
        resolution,
    }).getClusters();

    it('.getClusters() should return 4 featureGroup', () => {
        expect(clusters.length).toBe(4);
    });

    it('.getClusters() should return contains the same length', () => {
        const sumFeaturesLength = clusters.reduce((prev: number, curr: FeatureGroup) => {
            return prev + curr.features.length;
        }, 0);

        expect(points.length).toBe(sumFeaturesLength);
    });

    it('The distance between clusters does not exceed the specified size', () => {
        let distanceIsExceeded = false;

        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                if (pythagoras(clusters[i], clusters[j]) < clusterSize * resolution)
                    distanceIsExceeded = true;
            }
        }

        expect(distanceIsExceeded).toBe(false);
    });

    it('property check', () => {
        interface SecretPoint extends PointFeature {
            name?: string;
        }
        const secretPoint: SecretPoint = new PointFeature([150.834439, 59.544667], {crs: wgs84});
        const pointName = 'Секретная точка';
        secretPoint.name = pointName;
        points.push(secretPoint);

        const clusters = new GridClusterProvider({
            size: clusterSize,
            features: points,
            crs: webMercator,
            resolution,
        }).getClusters();

        interface MbSecretPoint extends Feature {
            name?: string;
        }

        const mbSecretPoint: MbSecretPoint = clusters[2].features[3];

        expect(clusters[2].features.length).toBe(4);
        expect(mbSecretPoint.name).toBe(pointName);
    });
});
