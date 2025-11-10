import { create_format } from "../format_definition";
import { createBlockbenchMod } from "../util/moddingTools";
import * as PACKAGE from "../../package.json";

export let formatVS;

createBlockbenchMod(
    `${PACKAGE.name}:vs_format_mod`,
    {},
    _context => {
        formatVS = create_format();
        return;
        },
    _context => {
        formatVS?.delete();
    }

);
