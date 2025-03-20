import { BaseRetriever, type BaseRetrieverInput } from "../schema/retriever.js";
import { Document } from "../document.js";
import { AsyncCaller, type AsyncCallerParams } from "../util/async_caller.js";
export interface ChaindeskRetrieverArgs extends AsyncCallerParams, BaseRetrieverInput {
    datastoreId: string;
    topK?: number;
    filter?: Record<string, unknown>;
    apiKey?: string;
}
/**
 * @example
 * ```typescript
 * const retriever = new ChaindeskRetriever({
 *   datastoreId: "DATASTORE_ID",
 *   apiKey: "CHAINDESK_API_KEY",
 *   topK: 8,
 * });
 * const docs = await retriever.getRelevantDocuments("hello");
 * ```
 */
export declare class ChaindeskRetriever extends BaseRetriever {
    static lc_name(): string;
    lc_namespace: string[];
    caller: AsyncCaller;
    datastoreId: string;
    topK?: number;
    filter?: Record<string, unknown>;
    apiKey?: string;
    constructor({ datastoreId, apiKey, topK, filter, ...rest }: ChaindeskRetrieverArgs);
    getRelevantDocuments(query: string): Promise<Document[]>;
}
