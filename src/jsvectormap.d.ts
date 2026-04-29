declare module "jsvectormap" {
  type Coords = [number, number];
  interface Marker {
    coords: Coords;
    name?: string;
    style?: Record<string, unknown>;
  }
  interface Options {
    selector: HTMLElement | string;
    map: string;
    [key: string]: unknown;
  }
  class jsVectorMap {
    constructor(options: Options);
    destroy(destroyInstance?: boolean): void;
    static addMap(name: string, map: unknown): void;
    [key: string]: unknown;
  }
  export default jsVectorMap;
}

declare module "jsvectormap/dist/maps/world.js";
declare module "jsvectormap/dist/maps/world-merc.js";
declare module "jsvectormap/dist/jsvectormap.css";
