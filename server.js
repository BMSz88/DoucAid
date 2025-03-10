const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { scrapeWebpage, scrapeDocumentation } = require('./scraper');
const { KnowledgeBase, AnswerGenerator } = require('./answerGenerator');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/documentation-chatbot';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const documentSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  markdown: { type: String, required: true },
  toc: [{ 
    text: String, 
    level: Number, 
    id: String 
  }],
  sections: { type: Map, of: String },
  codeBlocks: [{ 
    language: String, 
    code: String 
  }],
  lastScraped: { type: Date, default: Date.now },
});

const Document = mongoose.model('Document', documentSchema);

const app = express();
app.use(cors());
app.use(express.json());

const knowledgeBase = new KnowledgeBase();
const answerGenerator = new AnswerGenerator(knowledgeBase);

async function loadKnowledgeBase() {
  try {
    const documents = await Document.find();
    console.log(`Loading ${documents.length} documents from database...`);
    
    documents.forEach(doc => {
      const formattedDoc = {
        url: doc.url,
        title: doc.title,
        markdown: doc.markdown,
        toc: doc.toc,
        sections: Object.fromEntries(doc.sections),
        codeBlocks: doc.codeBlocks,
        timestamp: doc.lastScraped
      };
      
      knowledgeBase.addDocument(formattedDoc);
    });
    
    console.log("Knowledge base loaded successfully.");
  } catch (error) {
    console.error("Error loading knowledge base:", error);
  }
}

loadKnowledgeBase();

app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const existingDoc = await Document.findOne({ url });
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    if (existingDoc && existingDoc.lastScraped > oneDayAgo) {
      console.log(`Using cached data for ${url}`);
      
      if (!knowledgeBase.urlIndex.has(url)) {
        const formattedDoc = {
          url: existingDoc.url,
          title: existingDoc.title,
          markdown: existingDoc.markdown,
          toc: existingDoc.toc,
          sections: Object.fromEntries(existingDoc.sections),
          codeBlocks: existingDoc.codeBlocks,
          timestamp: existingDoc.lastScraped
        };
        
        knowledgeBase.addDocument(formattedDoc);
      }
      
      return res.json({ 
        success: true, 
        data: {
          url: existingDoc.url,
          title: existingDoc.title,
          cached: true
        }
      });
    }
    
    const scrapedData = await scrapeWebpage(url);
    if (!scrapedData) {
      return res.status(404).json({ error: 'Failed to scrape the URL' });
    }
    
    const update = {
      title: scrapedData.title,
      markdown: scrapedData.markdown,
      toc: scrapedData.toc,
      sections: scrapedData.sections,
      codeBlocks: scrapedData.codeBlocks,
      lastScraped: new Date()
    };
    
    await Document.findOneAndUpdate(
      { url },
      update,
      { upsert: true, new: true, runValidators: true }
    );
    
    knowledgeBase.addDocument(scrapedData);
    
    res.json({ success: true, data: scrapedData });
  } catch (error) {
    console.error(`Error in /api/scrape:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/scrape-site', async (req, res) => {
  try {
    const { baseUrl, paths } = req.body;
    if (!baseUrl) {
      return res.status(400).json({ error: 'Base URL is required' });
    }
    
    const scrapedData = await scrapeDocumentation(baseUrl, paths || ['/']);
    const results = [];
    
    for (const data of scrapedData) {
      const update = {
        title: data.title,
        markdown: data.markdown,
        toc: data.toc,
        sections: data.sections,
        codeBlocks: data.codeBlocks,
        lastScraped: new Date()
      };
      
      await Document.findOneAndUpdate(
        { url: data.url },
        update,
        { upsert: true, new: true, runValidators: true }
      );
      
      knowledgeBase.addDocument(data);
      results.push(data.url);
    }
    
    res.json({ 
      success: true, 
      count: results.length,
      urls: results
    });
  } catch (error) {
    console.error(`Error in /api/scrape-site:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ask', async (req, res) => {
  try {
    const { question, url } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    if (url && !knowledgeBase.urlIndex.has(url)) {
      const existingDoc = await Document.findOne({ url });
      if (existingDoc) {
        const formattedDoc = {
          url: existingDoc.url,
          title: existingDoc.title,
          markdown: existingDoc.markdown,
          toc: existingDoc.toc,
          sections: Object.fromEntries(existingDoc.sections),
          codeBlocks: existingDoc.codeBlocks,
          timestamp: existingDoc.lastScraped
        };
        
        knowledgeBase.addDocument(formattedDoc);
      } else {
        const scrapedData = await scrapeWebpage(url);
        if (scrapedData) {
          const newDoc = new Document({
            url: scrapedData.url,
            title: scrapedData.title,
            markdown: scrapedData.markdown,
            toc: scrapedData.toc,
            sections: scrapedData.sections,
            codeBlocks: scrapedData.codeBlocks,
            lastScraped: new Date()
          });
          
          await newDoc.save();
          
          knowledgeBase.addDocument(scrapedData);
        }
      }
    }
    
    const answer = await answerGenerator.generateAnswer(question);
    res.json(answer);
  } catch (error) {
    console.error(`Error in /api/ask:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/knowledge-base/status', async (req, res) => {
  try {
    const totalDocuments = await Document.countDocuments();
    const recentlyScraped = await Document.countDocuments({
      lastScraped: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    res.json({
      totalDocuments,
      recentlyScraped,
      loadedInMemory: knowledgeBase.documents.length,
      urls: Array.from(knowledgeBase.urlIndex.keys()).slice(0, 10) 
    });
  } catch (error) {
    console.error(`Error in /api/knowledge-base/status:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/knowledge-base/clear-old', async (req, res) => {
  try {
    const { olderThanDays } = req.body;
    const days = olderThanDays || 7; 
    
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await Document.deleteMany({
      lastScraped: { $lt: cutoffDate }
    });
    
    await loadKnowledgeBase();
    
    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} documents older than ${days} days`
    });
  } catch (error) {
    console.error(`Error in /api/knowledge-base/clear-old:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/knowledge-base/reload', async (req, res) => {
  try {
    knowledgeBase.documents = [];
    knowledgeBase.tfidf = new natural.TfIdf();
    knowledgeBase.urlIndex = new Map();
    
    await loadKnowledgeBase();
    
    res.json({
      success: true,
      loadedDocuments: knowledgeBase.documents.length,
      message: `Successfully reloaded knowledge base from database`
    });
  } catch (error) {
    console.error(`Error in /api/knowledge-base/reload:`, error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});