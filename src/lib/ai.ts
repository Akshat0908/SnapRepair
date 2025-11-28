import { AIDiagnosis } from './db';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const SITE_URL = 'https://snaprepair.app'; // Mock URL for OpenRouter headers
const SITE_NAME = 'Snap Repair';

export async function analyzeIssue(mediaBase64: string, description: string): Promise<AIDiagnosis> {
    const prompt = `
You are a home appliance and household repair expert.
Analyze the provided image/video and description: "${description}"

Return your answer in this exact JSON format:
{
  "device_type": "string",
  "likely_causes": ["string", "string", "string"],
  "safety_warning": "string",
  "troubleshooting_steps": ["string", "string", "string"],
  "recommended_action": "self fix" | "remote consult" | "on site",
  "estimated_cost": "string (INR)"
}

Be concise, simple, and beginner-friendly.
`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': SITE_URL,
                'X-Title': SITE_NAME,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'qwen/qwen-2-vl-72b-instruct', // Using a VL model for image analysis
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: prompt,
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: mediaBase64,
                                },
                            },
                        ],
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`AI API Error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        // Clean content (remove markdown code blocks if present)
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(content) as AIDiagnosis;
        } catch (e) {
            console.error("Failed to parse AI response:", content);
            // Fallback if JSON parsing fails
            return {
                device_type: "Unknown",
                likely_causes: ["Could not analyze image", "Please try again"],
                safety_warning: "Please proceed with caution.",
                troubleshooting_steps: ["Contact support if issue persists"],
                recommended_action: "remote consult",
                estimated_cost: "Unknown",
            };
        }
    } catch (error) {
        console.error("AI Analysis failed:", error);
        throw error;
    }
}

export async function chatWithExpert(messages: { role: 'user' | 'assistant' | 'system', content: string }[]): Promise<string> {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': SITE_URL,
                'X-Title': SITE_NAME,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'qwen/qwen-2.5-coder-32b-instruct',
                messages: messages,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`AI Chat API Error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        // Remove <think> blocks if present (common in some reasoning models)
        content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

        return content;
    } catch (error) {
        console.error("AI Chat failed:", error);
        throw error;
    }
}

export async function detectDeviceFromImage(mediaBase64: string): Promise<{ device_type: string; description: string }> {
    const prompt = `
    Identify the home appliance in this image.
    Also, briefly describe any visible damage or the state of the appliance (e.g., "Washing machine with error code E4", "Refrigerator with door open", "AC unit leaking water").
    
    Return ONLY a JSON object:
    {
      "device_type": "Fan" | "Laptop" | "AC" | "Washing Machine" | "Kitchen Appliance" | "Refrigerator" | "Television" | "Water Heater" | "Other",
      "description": "string"
    }
    `;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': SITE_URL,
                'X-Title': SITE_NAME,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'qwen/qwen-2-vl-72b-instruct',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            { type: 'image_url', image_url: { url: mediaBase64 } },
                        ],
                    },
                ],
            }),
        });

        if (!response.ok) {
            throw new Error(`AI API Error: ${response.status}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        // Clean content
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(content);
    } catch (error) {
        console.error("Auto-detect failed:", error);
        return { device_type: "Other", description: "" };
    }
}
