import { create_format } from "../format_definition";
import { createBlockbenchMod } from "../util/moddingTools";
import * as PACKAGE from "../../package.json";


createBlockbenchMod(
    `${PACKAGE.name}:vs_format_mod`,
    {
        vs_format: Format
    },
    context => {
        context.vs_format = create_format();
        return context;
        },
    context => {
        context.vs_format.delete();
    }

);
