// Load environment variables first - IMPORTANT
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { extractContent } = require('./services/contentExtractor');
const { parseQuestion, shouldProcessQuestion, getErrorMessage } = require('./services/questionParser');
const { createContentIndex, generateAgenticResponse } = require('./services/agenticAI');

const app = express();
// Use Railway's PORT environment variable with multiple fallbacks
const PORT = process.env.PORT || process.env.RAILWAY_PORT || 3001;

// Enhanced CORS configuration
const corsOptions = {
    origin: '*', // Allow any origin for Railway deployment
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Debug middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers));
    next();
});

// Pre-flight requests
app.options('*', cors(corsOptions));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// MongoDB Connection - Optional
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch((err) => console.error('MongoDB connection error:', err));
} else {
    console.log('MongoDB URI not provided, skipping database connection');
}

// Routes
app.post('/api/extract', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`Extracting content from URL: ${url}`);
        const extractedContent = await extractContent(url);

        // Store the extracted content for later use
        req.app.locals.lastExtractedContent = {
            title: extractedContent.title,
            content: extractedContent.content,
            url: extractedContent.url,
            timestamp: new Date().toISOString()
        };

        // Try to index the content if Pinecone is available, but don't fail if it's not
        try {
            await createContentIndex(extractedContent);
            console.log('Content indexed successfully in Pinecone');
        } catch (indexError) {
            console.warn('Warning: Could not index content in Pinecone:', indexError.message);
            // Continue without interrupting the flow - extraction was still successful
        }

        // Return the extracted content to the client
        res.json({
            title: extractedContent.title,
            content: extractedContent.content,
            url: extractedContent.url,
            extraction_method: extractedContent.extraction_method
        });
    } catch (error) {
        console.error('Content extraction error:', error);

        // Specific error handling for extraction
        if (error.message.includes('Failed to extract')) {
            return res.status(422).json({
                error: 'Content Extraction Failed',
                message: 'Unable to extract meaningful content from the provided URL'
            });
        }

        if (error.message.includes('HTTP error')) {
            const statusMatch = error.message.match(/Status: (\d+)/);
            const status = statusMatch ? parseInt(statusMatch[1]) : 500;
            return res.status(status).json({
                error: 'HTTP error! Status: ' + status,
                message: error.message
            });
        }

        if (error.code === 'ENOTFOUND' || error.message.includes('No response received')) {
            return res.status(404).json({
                error: 'URL Not Found',
                message: 'The provided URL could not be reached'
            });
        }

        res.status(500).json({
            error: 'Failed to extract content',
            message: error.message
        });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        // Extract either message or question from request to support both formats
        const userInput = req.body.question || req.body.message;
        const { context } = req.body;

        console.log(`Received question: ${userInput}`);
        console.log(`Context provided: ${context ? 'Yes' : 'No'}`);

        if (!userInput) {
            return res.status(400).json({
                error: 'Question is required',
                message: 'Please provide a question to process'
            });
        }

        // Parse and correct the question if needed
        const parsedQuestion = await parseQuestion(userInput);
        console.log(`Question parsed: ${parsedQuestion.parsedQuestion}`);
        console.log(`Corrected: ${parsedQuestion.corrected}`);

        // Check if the question should be processed
        if (!shouldProcessQuestion(parsedQuestion)) {
            const errorMessage = getErrorMessage(parsedQuestion);
            return res.status(400).json({
                error: 'Invalid Question',
                message: errorMessage,
                parsedQuestion
            });
        }

        // Use the corrected question if available
        const question = parsedQuestion.corrected ? parsedQuestion.parsedQuestion : userInput;

        // Generate response using Agentic AI
        console.log(`Generating response for: ${question}`);
        try {
            // Create proper context object from extracted content if available
            let contextData = context;
            if (!contextData && req.app.locals.lastExtractedContent) {
                console.log('Using last extracted content as context');
                contextData = {
                    type: 'webpage',
                    title: req.app.locals.lastExtractedContent.title,
                    content: req.app.locals.lastExtractedContent.content,
                    url: req.app.locals.lastExtractedContent.url
                };
            }

            const result = await generateAgenticResponse(question, contextData);
            console.log(`Response generated successfully. Strategy: ${result.metadata?.strategy}`);

            // Add question parsing metadata to the response
            if (result.metadata) {
                result.metadata.question_parsing = {
                    original_question: parsedQuestion.originalQuestion,
                    corrected: parsedQuestion.corrected,
                    confidence: parsedQuestion.confidence
                };
            }

            console.log(`Sending response with length: ${result.answer ? result.answer.length : 0} characters`);
            res.json(result);
        } catch (aiError) {
            console.error('Error in AI response generation:', aiError);
            res.status(500).json({
                error: 'AI Processing Error',
                message: 'Error generating AI response',
                details: aiError.message
            });
        }
    } catch (error) {
        console.error('Chat error:', error);

        // Handle specific OpenAI API errors
        if (error.name === 'OpenAIError') {
            return res.status(503).json({
                error: 'AI Service Unavailable',
                message: 'The AI service is currently unavailable. Please try again later.'
            });
        }

        res.status(500).json({
            error: 'Failed to generate response',
            message: 'An error occurred while processing your request.',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    console.log('Health check endpoint hit');
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            chat: '/api/chat',
            extract: '/api/extract'
        }
    });
});

// Root endpoint for Railway health check
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'DocuAid API is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`OpenAI API Key loaded from env: ${process.env.OPENAI_API_KEY ? 'Yes (length: ' + process.env.OPENAI_API_KEY.length + ')' : 'No'}`);
    console.log(`Using OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
}); 