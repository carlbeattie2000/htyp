import Htyp from "./core/Htyp";

export type { default as Htyp } from "./core/Htyp";
export type { HtypRequestConfig } from "./types/config";
export type { HtypResponse } from "./types/response";

const htyp = new Htyp();

export default htyp;
