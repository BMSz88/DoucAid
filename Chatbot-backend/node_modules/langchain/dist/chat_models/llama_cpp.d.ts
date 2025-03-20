import { LlamaModel, LlamaContext, LlamaChatSession, type ConversationInteraction } from "node-llama-cpp";
import { SimpleChatModel, BaseChatModelParams } from "./base.js";
import { LlamaBaseCppInputs } from "../util/llama_cpp.js";
import { BaseLanguageModelCallOptions } from "../base_language/index.js";
import { CallbackManagerForLLMRun } from "../callbacks/manager.js";
import { BaseMessage, ChatGenerationChunk } from "../schema/index.js";
/**
 * Note that the modelPath is the only required parameter. For testing you
 * can set this in the environment variable `LLAMA_PATH`.
 */
export interface LlamaCppInputs extends LlamaBaseCppInputs, BaseChatModelParams {
}
export interface LlamaCppCallOptions extends BaseLanguageModelCallOptions {
    /** The maximum number of tokens the response should contain. */
    maxTokens?: number;
    /** A function called when matching the provided token array */
    onToken?: (tokens: number[]) => void;
}
/**
 *  To use this model you need to have the `node-llama-cpp` module installed.
 *  This can be installed using `npm install -S node-llama-cpp` and the minimum
 *  version supported in version 2.0.0.
 *  This also requires that have a locally built version of Llama2 installed.
 * @example
 * ```typescript
 * // Initialize the ChatLlamaCpp model with the path to the model binary file.
 * const model = new ChatLlamaCpp({
 *   modelPath: "/Replace/with/path/to/your/model/gguf-llama2-q4_0.bin",
 *   temperature: 0.5,
 * });
 *
 * // Call the model with a message and await the response.
 * const response = await model.call([
 *   new HumanMessage({ content: "My name is John." }),
 * ]);
 *
 * // Log the response to the console.
 * console.log({ response });
 *
 * ```
 */
export declare class ChatLlamaCpp extends SimpleChatModel<LlamaCppCallOptions> {
    CallOptions: LlamaCppCallOptions;
    static inputs: LlamaCppInputs;
    maxTokens?: number;
    temperature?: number;
    topK?: number;
    topP?: number;
    trimWhitespaceSuffix?: boolean;
    _model: LlamaModel;
    _context: LlamaContext;
    _session: LlamaChatSession | null;
    static lc_name(): string;
    constructor(inputs: LlamaCppInputs);
    _llmType(): string;
    /** @ignore */
    _combineLLMOutput(): {};
    invocationParams(): {
        maxTokens: number | undefined;
        temperature: number | undefined;
        topK: number | undefined;
        topP: number | undefined;
        trimWhitespaceSuffix: boolean | undefined;
    };
    /** @ignore */
    _call(messages: BaseMessage[], options: this["ParsedCallOptions"]): Promise<string>;
    _streamResponseChunks(input: BaseMessage[], _options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
    protected _buildSession(messages: BaseMessage[]): string;
    protected _convertMessagesToInteractions(messages: BaseMessage[]): ConversationInteraction[];
    protected _buildPrompt(input: BaseMessage[]): string;
}
