// Netlify Function for AI Document Analysis
// This would integrate with OpenAI/Claude API for real analysis

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // In a real implementation, you would:
    // 1. Parse the uploaded file
    // 2. Extract text/data from the document
    // 3. Send to OpenAI/Claude API for analysis
    // 4. Return structured analysis

    // For now, return mock analysis
    const mockAnalysis = {
      summary: "AI-Powered Financial Analysis Complete",
      insights: [
        {
          category: "Expense Categories",
          items: [
            "Office Supplies: $2,450 (15%)",
            "Travel & Transportation: $3,200 (20%)",
            "Marketing & Advertising: $1,800 (11%)",
            "Software & Subscriptions: $950 (6%)",
            "Utilities: $1,200 (7%)"
          ]
        },
        {
          category: "Financial Trends",
          items: [
            "Monthly spending increased 12% over last quarter",
            "Travel expenses peaked in March (+45%)",
            "Software costs remained consistent",
            "Office supplies showed seasonal variation"
          ]
        },
        {
          category: "Key Metrics",
          items: [
            "Total transactions analyzed: 247",
            "Average transaction value: $156",
            "Largest expense category: Travel (20%)",
            "Potential monthly savings: $890"
          ]
        }
      ],
      processedAt: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockAnalysis)
    };

  } catch (error) {
    console.error('Analysis error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Analysis failed',
        message: error.message 
      })
    };
  }
};

/*
TO ADD REAL AI ANALYSIS:

1. Install dependencies in package.json:
   "dependencies": {
     "openai": "^4.0.0"
   }

2. Add environment variables in Netlify:
   OPENAI_API_KEY=your_key_here

3. Replace mock analysis with:

const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "user",
    content: `Analyze this financial document and provide:
    1. Expense categorization
    2. Trend analysis
    3. Key insights
    4. Recommendations
    
    Document data: ${documentText}`
  }]
});

*/