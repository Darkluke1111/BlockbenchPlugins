import { ex } from "./export";
import { im } from "./import";
import * as vs_schema from "./generated/vs_shape_schema";
import Ajv from "ajv";

export const codecVS = new Codec("codecVS", {
            name: "Vintage Story Codec",
            extension: "json",
            remember: true,
            load_filter: {
                extensions: ["json"],
                type: 'text',
                condition(model) {
                    const content = autoParseJSON(model);
                    return validate_json(content);
                }
            },
            compile(options) {
                // Removed for now since it doesn't work
                // resetStepparentTransforms();
                return ex(options);
            },
            parse(data, file_path, _add) {
                im(data, file_path, false);
                // Removed for now since it doesn't work
                // loadBackDropShape();
                // resolveStepparentTransforms();
            },
        });

function validate_json(content) {
    const ajv = new Ajv();
    const validate = ajv.compile(vs_schema);
    const valid = validate(content);
    if (!valid) console.log(validate.errors);
    return valid;
}