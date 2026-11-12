import plugin from "../eslint-plugin/index.js";
import { base } from "./configs/base.js";
import { react } from "./configs/react.js";

export { base, plugin, react };
export { IGNORED, JS_FILES, SOURCE_FILES, TS_FILES } from "./globs.js";

export default { base, react };
