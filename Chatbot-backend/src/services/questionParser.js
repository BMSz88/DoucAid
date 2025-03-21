const OpenAI = require('openai');
require('dotenv').config();

// Add debugging to see if API key is loading
const apiKey = process.env.OPENAI_API_KEY;
console.log('OpenAI API Key loaded from env:', apiKey ? `Yes (length: ${apiKey.length})` : 'No');

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
    apiKey: apiKey
});

/**
 * Checks and corrects misspelled questions
 * @param {string} question - The original question from the user
 * @returns {Object} - Object containing parsed question and metadata
 */
async function parseQuestion(question) {
    // If question is empty or too short, return error indication
    if (!question || question.trim().length < 2) {
        return {
            originalQuestion: question,
            parsedQuestion: question,
            corrected: false,
            error: 'EMPTY_QUESTION',
            confidence: 0
        };
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful assistant that corrects misspelled questions. 
          If the input is clearly a question with spelling errors, correct it. 
          If it's just gibberish or completely unintelligible, indicate that it's invalid.
          Output should be JSON with the following format:
          {
            "originalQuestion": "Original user input",
            "parsedQuestion": "Corrected question if possible",
            "corrected": true/false (whether corrections were made),
            "error": null or one of ["INVALID_QUESTION", "UNINTELLIGIBLE", "EMPTY_QUESTION"],
            "confidence": 0-1 number indicating confidence in the correction
          }`
                },
                {
                    role: "user",
                    content: question
                }
            ],
            temperature: 0.3,
            max_tokens: 300,
            response_format: { type: "json_object" }
        });

        // Parse the JSON response
        const result = JSON.parse(response.choices[0].message.content);

        // Add low-level validation
        if (!result.parsedQuestion) {
            result.parsedQuestion = question;
            result.corrected = false;
            result.error = "PROCESSING_ERROR";
            result.confidence = 0;
        }

        return result;
    } catch (error) {
        console.error('Error parsing question:', error);
        // Fallback to the original question if processing fails
        return {
            originalQuestion: question,
            parsedQuestion: question,
            corrected: false,
            error: null,
            confidence: 1
        };
    }
}

/**
 * Determine if the error is serious enough to prevent processing
 * @param {Object} parsedQuestion - The result from parseQuestion
 * @returns {boolean} - True if the question should be processed
 */
function shouldProcessQuestion(parsedQuestion) {
    // Don't process if unintelligible or empty
    if (parsedQuestion.error === 'UNINTELLIGIBLE' ||
        parsedQuestion.error === 'EMPTY_QUESTION') {
        return false;
    }

    // Process if confidence is high enough
    return parsedQuestion.confidence > 0.4;
}

/**
 * Get appropriate error message based on parsing result
 * @param {Object} parsedQuestion - The result from parseQuestion
 * @returns {string|null} - Error message or null if no error
 */
function getErrorMessage(parsedQuestion) {
    switch (parsedQuestion.error) {
        case 'UNINTELLIGIBLE':
            return "I couldn't understand your question. Could you please rephrase it?";
        case 'EMPTY_QUESTION':
            return "Please provide a question so I can help you.";
        case 'INVALID_QUESTION':
            return "Your question seems incomplete or unclear. Could you provide more details?";
        default:
            return null;
    }
}

module.exports = {
    parseQuestion,
    shouldProcessQuestion,
    getErrorMessage
}; 