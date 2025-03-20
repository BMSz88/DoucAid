import { OptionalImportMap } from "./import_type.js";
export declare function load<T>(text: string, secretsMap?: Record<string, any>, optionalImportsMap?: OptionalImportMap): Promise<T>;
