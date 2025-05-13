const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.gemini_api_key });

exports.getairesponse = async (req, res) => {
    try {
        const message = req.body.text;
        
        if (!message) {
            return res.status(400).json({ error: 'No message provided' });
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: message, 
        });

        const responseText = response.text;
        
        return res.status(200).json({ 
            text: responseText 
        });
    } catch (error) {
        console.error('AI API error:', error);
        return res.status(500).json({ 
            error: 'Failed to generate AI response',
            message: error.message 
        });
    }
}