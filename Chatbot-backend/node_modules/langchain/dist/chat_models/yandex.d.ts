import { CallbackManagerForLLMRun } from "../callbacks/manager.js";
import { YandexGPTInputs } from "../llms/yandex.js";
import { BaseMessage, ChatResult } from "../schema/index.js";
import { BaseChatModel } from "./base.js";
/**
 * @example
 * ```typescript
 * const chat = new ChatYandexGPT({});
 * // The assistant is set to translate English to French.
 * const res = await chat.call([
 *   new SystemMessage(
 *     "You are a helpful assistant that translates English to French."
 *   ),
 *   new HumanMessage("I love programming."),
 * ]);
 * console.log(res);
 * ```
 */
export declare class ChatYandexGPT extends BaseChatModel {
    apiKey?: string;
    iamToken?: string;
    temperature: number;
    maxTokens: number;
    model: string;
    constructor(fields?: YandexGPTInputs);
    _llmType(): string;
    _combineLLMOutput?(): {};
    /** @ignore */
    _generate(messages: BaseMessage[], options: this["ParsedCallOptions"], _?: CallbackManagerForLLMRun | undefined): Promise<ChatResult>;
}
