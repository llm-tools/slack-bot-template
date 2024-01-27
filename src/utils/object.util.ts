import * as util from 'util';

export class ObjectUtils {
    /**
     * Returns the array of values
     *
     * @param Obj - It has multiple key - value pairs
     */
    public static getObjectValues<T>(obj: { [key: string]: T }): T[] {
        return Object.keys(obj).map((key) => obj[key]);
    }

    public static toString(object: any) {
        return util.inspect(object, { showHidden: false, depth: null, colors: true });
    }

    public static isNumber(n) {
        return !isNaN(parseInt(n)) && !isNaN(n - 0);
    }
}
