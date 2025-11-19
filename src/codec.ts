import { ex } from "./export";
import { im } from "./import";
import {schema} from "./generated/vs_shape_schema";
import Ajv from "ajv";
import { VS_Shape } from "./vs_shape_def";

export const codecVS = new Codec("codecVS", {
            name: "Vintage Story Codec",
            extension: "json",
            remember: true,
            load_filter: {
                extensions: ["json"],
                type: 'text',
                condition(model) {
                    const content = autoParseJSON(model);
                    // Quick check for VS-specific structure before full validation
                    if (!content || typeof content !== 'object') return false;
                    if (!content.elements || !Array.isArray(content.elements)) return false;
                    if (!content.textures || typeof content.textures !== 'object') return false;
                    // Full schema validation
                    return validate_json(content);
                }
            },
            compile(options) {
                // Removed for now since it doesn't work
                // resetStepparentTransforms();
                return autoStringify(ex(options));
            },
            parse(data, file_path, _add) {
                im(autoParseJSON(data) as VS_Shape, file_path, false);
                // Removed for now since it doesn't work
                // loadBackDropShape();
                // resolveStepparentTransforms();
            },
        });

function validate_json(content) {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(content);
    if (!valid) console.log(validate.errors);
    return valid;
}