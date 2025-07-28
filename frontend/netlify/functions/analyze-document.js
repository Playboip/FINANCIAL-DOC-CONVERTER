// Enhanced Netlify Function for AI Document Analysis with OpenAI
const multipart = require('parse-multipart-data');

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
    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.log('OpenAI API key not configured, using mock analysis');
      return mockAnalysisResponse(headers);
    }

    // Parse the multipart form data
    const boundary = event.headers['content-type'].split('boundary=')[1];
    const parts = multipart.parse(Buffer.from(event.body, 'base64'), boundary);
    
    if (!parts || parts.length === 0) {
      throw new Error('No file uploaded');
    }

    const file = parts[0];
    const fileName = file.filename;
    const fileData = file.data;

    // Extract text content from file (simplified - in production, use proper parsers)
    let textContent = '';
    
    if (fileName.toLowerCase().endsWith('.csv')) {
      textContent = fileData.toString('utf-8');
    } else if (fileName.toLowerCase().endsWith('.txt')) {
      textContent = fileData.toString('utf-8');
    } else {
      // For other formats, you'd use libraries like pdf-parse, xlsx, etc.
      textContent = `Financial document: ${fileName}`;
    }

    // Call OpenAI API for real analysis
    const analysis = await analyzeWithOpenAI(textContent, fileName, openaiApiKey);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(analysis)
    };

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Fallback to mock analysis if real analysis fails
    return mockAnalysisResponse(headers);
  }
};

// Real OpenAI Analysis Function
async function analyzeWithOpenAI(textContent, fileName, apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: `You are a financial analyst AI. Analyze the provided financial document and return a JSON response with this exact structure:
          {
            "summary": "Brief summary of analysis",
            "insights": [
              {
                "category": "Expense Categories",
                "items": ["List of categorized expenses with amounts and percentages"]
              },
              {
                "category": "Financial Trends", 
                "items": ["List of identified trends and patterns"]
              },
              {
                "category": "Key Metrics",
                "items": ["Important financial metrics and totals"]
              },
              {
                "category": "Recommendations",
                "items": ["Actionable recommendations for improvement"]
              }
            ]
          }`
        }, {
          role: 'user',
          content: `Analyze this financial document (${fileName}):\n\n${textContent.substring(0, 4000)}`
        }],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    try {
      const parsedAnalysis = JSON.parse(analysisText);
      return {
        ...parsedAnalysis,
        fileInfo: {
          name: fileName,
          processedAt: new Date().toISOString(),
          source: 'OpenAI GPT-4'
        }
      };
    } catch (parseError) {
      // If JSON parsing fails, create structured response from text
      return {
        summary: "AI Financial Analysis Complete",
        insights: [{
          category: "AI Analysis Results",
          items: [analysisText]
        }],
        fileInfo: {
          name: fileName,
          processedAt: new Date().toISOString(),
          source: 'OpenAI GPT-4'
        }
      };
    }

  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw error;
  }
}

// Mock Analysis Response (fallback)
function mockAnalysisResponse(headers) {
  const mockAnalysis = {
    summary: "Demo Financial Analysis (Connect OpenAI for real analysis)",
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
      },
      {
        category: "Recommendations",
        items: [
          "Consider negotiating better rates for travel bookings",
          "Review recurring software subscriptions",
          "Implement expense approval workflow for amounts over $500",
          "Track seasonal patterns for better budget planning"
        ]
      }
    ],
    fileInfo: {
      processedAt: new Date().toISOString(),
      source: 'Demo Mode'
    }
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(mockAnalysis)
  };
}