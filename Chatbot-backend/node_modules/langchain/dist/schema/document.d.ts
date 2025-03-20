import { BaseDocumentTransformer } from "@langchain/core/documents";
import { Document } from "../document.js";
export { BaseDocumentTransformer };
/**
 * Class for document transformers that return exactly one transformed document
 * for each input document.
 */
export declare abstract class MappingDocumentTransformer extends BaseDocumentTransformer {
    transformDocuments(documents: Document[]): Promise<Document[]>;
    abstract _transformDocument(document: Document): Promise<Document>;
}
