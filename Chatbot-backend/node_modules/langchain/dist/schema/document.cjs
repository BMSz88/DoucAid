"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingDocumentTransformer = exports.BaseDocumentTransformer = void 0;
const documents_1 = require("@langchain/core/documents");
Object.defineProperty(exports, "BaseDocumentTransformer", { enumerable: true, get: function () { return documents_1.BaseDocumentTransformer; } });
/**
 * Class for document transformers that return exactly one transformed document
 * for each input document.
 */
class MappingDocumentTransformer extends documents_1.BaseDocumentTransformer {
    async transformDocuments(documents) {
        const newDocuments = [];
        for (const document of documents) {
            const transformedDocument = await this._transformDocument(document);
            newDocuments.push(transformedDocument);
        }
        return newDocuments;
    }
}
exports.MappingDocumentTransformer = MappingDocumentTransformer;
