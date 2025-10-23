import * as path from "path";
import * as TJS from "typescript-json-schema";
import * as fs from "fs";

// optionally pass argument to schema generator
const settings: TJS.PartialArgs = {
    required: true,
};

// optionally pass ts compiler options
const compilerOptions: TJS.CompilerOptions = {
    strictNullChecks: true,
};

// optionally pass a base path
const basePath = "./src";

const program = TJS.getProgramFromFiles(
  [path.resolve("src/vs_shape_def.ts")],
  compilerOptions,
  basePath
);

// We can either get the schema for one file and one type...
const schema = TJS.generateSchema(program, "VS_Shape", settings);

fs.mkdir('src/generated/', {recursive: true}, (err) => {
  if (err) throw err;
});

const schema_str = JSON.stringify(schema, null, 2);

fs.writeFileSync(path.resolve("src/generated/vs_shape_schema.js"), `module.exports = ${schema_str}`);