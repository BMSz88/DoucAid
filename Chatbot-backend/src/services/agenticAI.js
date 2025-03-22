const { OpenAI } = require('langchain/llms/openai');
const { Document } = require('langchain/document');
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { PineconeClient } = require('@pinecone-database/pinecone');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { PromptTemplate } = require('langchain/prompts');
const fetch = require('node-fetch');

// Initialize OpenAI model with fallback mechanism
function initializeOpenAI() {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        console.log('OpenAI API Key loaded from env:', apiKey ? 'Yes' : 'No');
        
        // Check if the API key is missing or is a placeholder
        if (!apiKey || apiKey.startsWith('sk-placeholder')) {
            console.warn('WARNING: Using demo mode - OpenAI API key is missing or is a placeholder');
            return null; // Return null to indicate demo mode
        }
        
        return new OpenAI({
            openAIApiKey: apiKey,
            modelName: process.env.OPENAI_MODEL || 'gpt-4',
            temperature: 0.1,
        });
    } catch (error) {
        console.error('Error initializing OpenAI:', error.message);
        return null; // Return null on error
    }
}

const llm = initializeOpenAI();

// Initialize OpenAI Embeddings
const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY
});

// Initialize Pinecone
const initializePinecone = async () => {
    try {
        // Skip if no Pinecone credentials
        if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_INDEX) {
            console.log('Pinecone credentials not found, skipping initialization');
            return null;
        }

        const pinecone = new PineconeClient();
        await pinecone.init({
            environment: process.env.PINECONE_ENVIRONMENT,
            apiKey: process.env.PINECONE_API_KEY,
        });

        const index = pinecone.Index(process.env.PINECONE_INDEX);
        console.log('Pinecone initialized successfully');
        return index;
    } catch (error) {
        console.error('Error initializing Pinecone:', error);
        return null;
    }
};

// Text splitter for chunking content
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', ' ', '']
});

// Initialize vector store
let vectorStore;
async function getVectorStore() {
    if (!vectorStore) {
        const pineconeIndex = await initializePinecone();

        if (!pineconeIndex) {
            console.log('Pinecone not available, vector store will not be initialized');
            return null;
        }

        vectorStore = await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex });
        console.log('Vector store initialized successfully');
    }
    return vectorStore;
}

/**
 * Creates a document index from web content
 * @param {Object} content - Web content object
 * @returns {Promise<void>}
 */
async function createContentIndex(content) {
    try {
        // If no valid OpenAI connection, use demo mode
        if (!llm) {
            console.log('[DEMO MODE] Would index content:', content.content ? content.content.substring(0, 100) + '...' : '');
            return { success: true, demo: true };
        }
        
        const store = await getVectorStore();

        // Skip if vector store is not available
        if (!store) {
            console.log('Vector store not available, skipping content indexing');
            return { success: true };
        }

        // Split content into chunks
        const textToSplit = content.content || '';
        const docs = await textSplitter.createDocuments([textToSplit]);

        // Add metadata to documents
        const documentsWithMetadata = docs.map(doc => {
            return new Document({
                pageContent: doc.pageContent,
                metadata: {
                    title: content.title || 'No Title',
                    url: content.url || 'No URL',
                    timestamp: new Date().toISOString()
                }
            });
        });

        // Store documents in vector store
        await store.addDocuments(documentsWithMetadata);
        console.log('Content indexed successfully');
        return { success: true };
    } catch (error) {
        console.error('Error creating content index:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Decides whether to use web content or general knowledge
 * @param {string} question - User's question
 * @returns {Promise<Object>} - Decision object
 */
async function decideResponseStrategy(question) {
    try {
        const prompt = PromptTemplate.fromTemplate(`
            Analyze the following question and decide whether it requires web content or general knowledge to answer.
            Question: {question}
            
            Consider:
            1. Does it require specific information from a webpage?
            2. Can it be answered with general knowledge?
            3. Is it a follow-up question to previous web content?
            
            Return a JSON object with:
            {
                "strategy": "web_content" | "general_knowledge",
                "reasoning": "explanation of the decision",
                "confidence": 0-1 number
            }
        `);

        const formattedPrompt = await prompt.format({ question });
        let response = await llm.call(formattedPrompt);

        // Try to clean up the response for JSON parsing
        response = response.trim();
        if (response.startsWith('```json')) {
            response = response.replace(/```json/, '').replace(/```/, '').trim();
        } else if (response.startsWith('```')) {
            response = response.replace(/```/, '').replace(/```/, '').trim();
        }

        try {
            // Try to parse the JSON response
            const parsedResponse = JSON.parse(response);

            // Validate required fields
            if (!parsedResponse.strategy || !['web_content', 'general_knowledge'].includes(parsedResponse.strategy)) {
                console.warn('Invalid strategy in response, using default');
                parsedResponse.strategy = 'general_knowledge';
            }

            if (!parsedResponse.reasoning) {
                parsedResponse.reasoning = 'No reasoning provided';
            }

            if (typeof parsedResponse.confidence !== 'number' || parsedResponse.confidence < 0 || parsedResponse.confidence > 1) {
                parsedResponse.confidence = 0.5;
            }

            return parsedResponse;
        } catch (e) {
            console.error('Error parsing JSON response:', e);
            console.log('Raw response:', response);

            // Return default if parsing fails
            return {
                strategy: 'general_knowledge',
                reasoning: 'Failed to determine strategy, falling back to general knowledge',
                confidence: 0.5
            };
        }
    } catch (error) {
        console.error('Error deciding response strategy:', error);
        // Default strategy
        return {
            strategy: 'general_knowledge',
            reasoning: 'Error occurred, falling back to general knowledge',
            confidence: 0.5
        };
    }
}

/**
 * Retrieves relevant sections from stored content
 * @param {string} question - User's question
 * @returns {Promise<Array>} - Relevant document sections
 */
async function retrieveRelevantContent(question) {
    try {
        const store = await getVectorStore();

        // Return empty array if vector store is not available
        if (!store) {
            console.log('Vector store not available, skipping content retrieval');
            return [];
        }

        // Search for relevant documents
        const results = await store.similaritySearch(question, 3);

        // Format results
        return results.map(doc => ({
            content: doc.pageContent,
            metadata: doc.metadata,
            relevance: 0.9 // Default since similaritySearch doesn't return scores
        }));
    } catch (error) {
        console.error('Error retrieving relevant content:', error);
        return [];
    }
}

/**
 * Generates a response using the appropriate strategy
 * @param {string} question - User's question
 * @param {Object} context - Optional context from previous interactions
 * @returns {Promise<Object>} - Response object
 */
async function generateAgenticResponse(question, context = null) {
    try {
        // If no valid OpenAI connection, use demo mode
        if (!llm) {
            console.log('[DEMO MODE] Would generate response for question:', question);
            return { 
                success: true, 
                demo: true,
                answer: "This is a demo response as the OpenAI API key is not configured. In a real setup, I would analyze your document and provide a specific answer to your question." 
            };
        }
        
        let strategy = {
            strategy: 'general_knowledge',
            reasoning: 'No context provided, using general knowledge',
            confidence: 0.5
        };

        // If we have context, use web content strategy
        if (context && context.content) {
            console.log('Context provided, using web content strategy');
            strategy = {
                strategy: 'web_content',
                reasoning: 'Using provided webpage content to answer question',
                confidence: 0.9
            };
        } else {
            // Try decideResponseStrategy but with fallback if it fails
            try {
                const decisionResult = await decideResponseStrategy(question);
                if (decisionResult && decisionResult.strategy) {
                    strategy = decisionResult;
                }
            } catch (error) {
                console.error('Error in response strategy decision, using default:', error);
                // Continue with default strategy
            }
        }

        console.log(`Using strategy: ${strategy.strategy}, confidence: ${strategy.confidence}`);

        let responseText;
        let relevantContent = [];

        // For web content strategy
        if (strategy.strategy === 'web_content') {
            // If context is provided, use it directly
            if (context && context.content) {
                console.log('Using provided context content');

                // Truncate content to avoid token limit errors (approximately 10,000 chars ~ 2,500 tokens)
                const MAX_CONTENT_LENGTH = 10000;
                let truncatedContent = context.content;

                if (truncatedContent.length > MAX_CONTENT_LENGTH) {
                    console.log(`Content too large (${truncatedContent.length} chars), truncating to ${MAX_CONTENT_LENGTH} chars`);
                    truncatedContent = truncatedContent.substring(0, MAX_CONTENT_LENGTH) +
                        "... [Content truncated due to length]";
                }

                // Format the context for the prompt
                const contentContext = `
                    Title: ${context.title || 'No title'}
                    URL: ${context.url || 'No URL'}
                    Content: ${truncatedContent}
                `;

                try {
                    responseText = await llm.call(`
                        Based on the following web page content, answer the question.
                        If the answer cannot be found in the content, say so clearly.
                        
                        Web Page Content:
                        ${contentContext}
                        
                        Question: ${question}
                        
                        Provide a clear, concise answer with relevant information from the content.
                    `);
                } catch (error) {
                    console.error('Error generating response with web content:', error);
                    // Fallback to general knowledge if error occurs
                    strategy.strategy = 'general_knowledge';
                    strategy.reasoning = 'Error using web content, falling back to general knowledge';
                    strategy.confidence = 0.5;
                }
            } else {
                // Try to retrieve from vector store if no direct context
                relevantContent = await retrieveRelevantContent(question);

                if (relevantContent.length === 0) {
                    console.log('No relevant content found, falling back to general knowledge');
                    strategy.strategy = 'general_knowledge';
                    strategy.reasoning += ' (No relevant content found, falling back to general knowledge)';
                } else {
                    // Format context from relevant content
                    const contentContext = relevantContent
                        .map(doc => `From ${doc.metadata.title}:\n${doc.content}`)
                        .join('\n\n');

                    try {
                        responseText = await llm.call(`
                            Based on the following content, answer the question.
                            If the answer cannot be found in the content, say so clearly.
                            
                            Content:
                            ${contentContext}
                            
                            Question: ${question}
                            
                            Provide a clear, concise answer with relevant quotes from the content.
                        `);
                    } catch (error) {
                        console.error('Error generating response with retrieved content:', error);
                        strategy.strategy = 'general_knowledge';
                        strategy.reasoning = 'Error using retrieved content, falling back to general knowledge';
                        strategy.confidence = 0.5;
                    }
                }
            }
        }

        // General knowledge as fallback
        if (strategy.strategy === 'general_knowledge') {
            responseText = await llm.call(`
                Answer the following question based on your general knowledge.
                Question: ${question}
                
                Provide a clear, concise answer with relevant examples or explanations.
            `);
        }

        return {
            success: true,
            answer: responseText, // Changed from 'response' to 'answer' to match frontend expectations
            metadata: {
                strategy: strategy.strategy,
                reasoning: strategy.reasoning,
                confidence: strategy.confidence,
                context_used: context ? true : false,
                relevant_content: relevantContent.map(doc => ({
                    title: doc.metadata?.title || 'Unknown',
                    url: doc.metadata?.url || 'Unknown',
                    relevance: doc.relevance || 0
                }))
            }
        };
    } catch (error) {
        console.error('Error generating response:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    createContentIndex,
    generateAgenticResponse,
    initializePinecone
}; 