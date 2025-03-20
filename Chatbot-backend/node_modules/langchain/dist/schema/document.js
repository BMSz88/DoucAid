import { BaseDocumentTransformer } from "@langchain/core/documents";
export { BaseDocumentTransformer };
/**
 * Class for document transformers that return exactly one transformed document
 * for each input document.
 */
export class MappingDocumentTransformer extends BaseDocumentTransformer {
    async transformDocuments(documents) {
        const newDocuments = [];
        for (const document of documents) {
            const transformedDocument = await this._transformDocument(document);
            newDocuments.push(transformedDocument);
        }
        return newDocuments;
    }
}
