
import { GoogleGenAI, GenerateContentResponse, GroundingChunk, Chat } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
let keyIsAvailable = false;

const MODEL_NAME = "gemini-2.5-flash-preview-04-17";

try {
  if (typeof process !== 'undefined' && 
      typeof process.env !== 'undefined' && 
      process.env.API_KEY && 
      process.env.API_KEY.trim() !== "") {
    const envApiKey = process.env.API_KEY;
    aiInstance = new GoogleGenAI({ apiKey: envApiKey });
    keyIsAvailable = true;
    console.info("Gemini Service: Initialized successfully with API Key from environment.");
  } else {
    if (typeof process !== 'undefined' && typeof process.env !== 'undefined' && (!process.env.API_KEY || process.env.API_KEY.trim() === "")) {
        console.warn("Gemini Service: API_KEY environment variable is present but empty or invalid. AI features will be disabled.");
    } else {
        console.warn("Gemini Service: API_KEY environment variable not found. AI features will be disabled. This is expected in frontend environments without direct environment variable injection or a backend proxy.");
    }
  }
} catch (error) {
  console.error("Gemini Service: Error during GoogleGenAI client initialization. AI features will be disabled.", error);
  aiInstance = null; 
  keyIsAvailable = false;
}

export const getAiChat = (): Chat | null => {
  if (!keyIsAvailable || !aiInstance) {
    console.warn("Gemini Service (getAiChat): API key not available or client not initialized.");
    return null;
  }
  try {
    const chat = aiInstance.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: "You are a friendly and helpful travel assistant for FLATS UG, a transportation and services company in Uganda. Your goal is to help users plan their trips and understand the services offered. Answer questions about travel, destinations, culture in Uganda, and provide information about booking rides, hotels, flights, and courier services through the app. Keep your answers concise, helpful, and engaging. When appropriate, encourage users to use the app's features by saying things like 'You can book that right from the Services screen!' or 'Just tap on Book Now on the Home screen to get started.'",
      },
    });
    return chat;
  } catch(error) {
    console.error("Gemini Service: Error creating chat session.", error);
    return null;
  }
};


interface GeminiTripSuggestion {
  suggestionText: string;
  sources?: GroundingChunk[];
  error?: string;
}

export const getTripSuggestions = async (destination: string): Promise<GeminiTripSuggestion> => {
  if (!navigator.onLine) {
    return { 
      suggestionText: `Cannot fetch suggestions for ${destination}. You are currently offline.`,
      error: "Offline" 
    };
  }
  if (!keyIsAvailable || !aiInstance) {
    console.warn("Gemini Service (getTripSuggestions): API key not available or client not initialized. Returning mock suggestion.");
    return { 
      suggestionText: `Consider visiting the local market in ${destination} for authentic crafts! (Mocked: AI service disabled)`,
      error: "AI service disabled"
    };
  }
  
  try {
    const prompt = `Provide a short, interesting travel suggestion or fun fact about ${destination}. If relevant, use Google Search for current information.`;
    
    const response: GenerateContentResponse = await aiInstance.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const suggestionText = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return { suggestionText, sources };

  } catch (error) {
    console.error("Error fetching trip suggestions from Gemini:", error);
    if (error instanceof Error && error.message.toLowerCase().includes("api key not valid")) {
         return { suggestionText: `Could not fetch suggestions for ${destination}. API Key is invalid.`, error: "API Key Invalid" };
    }
    return { suggestionText: `Could not fetch suggestions for ${destination}. Please try again later.`, error: "API Error" };
  }
};

interface ServiceDescriptionResult {
    description: string;
    error?: string;
}

export const getServiceDescription = async (serviceTitle: string): Promise<ServiceDescriptionResult> => {
  if (!navigator.onLine) {
    return { 
        description: `Cannot fetch details for ${serviceTitle}. You are currently offline.`,
        error: "Offline"
    };
  }
  if (!keyIsAvailable || !aiInstance) {
    console.warn("Gemini Service (getServiceDescription): API key not available or client not initialized. Returning mock description.");
    return {
        description: `Enjoy our ${serviceTitle.toLowerCase()} with premium comfort and reliability. (Mocked: AI service disabled)`,
        error: "AI service disabled"
    };
  }
  try {
    const prompt = `Generate a concise and appealing 1-2 sentence description for a transportation service titled "${serviceTitle}".`;
    const response: GenerateContentResponse = await aiInstance.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return { description: response.text };
  } catch (error) {
    console.error(`Error fetching description for ${serviceTitle}:`, error);
    if (error instanceof Error && error.message.toLowerCase().includes("api key not valid")) {
        return { description: `Learn more about our excellent ${serviceTitle.toLowerCase()} options. (Error: API Key is invalid)`, error: "API Key Invalid"};
    }
    return { description: `Learn more about our excellent ${serviceTitle.toLowerCase()} options.`, error: "API Error" };
  }
};

interface EstimatedDistanceResult {
  distance: number | null;
  routeSummary: string | null;
  error?: string;
}

export const getEstimatedDistanceAndRoute = async (pickup: string, dropoff: string): Promise<EstimatedDistanceResult> => {
  if (!navigator.onLine) {
    return { 
      distance: null, 
      routeSummary: "Distance estimation requires an internet connection. You are currently offline.",
      error: "Offline" 
    };
  }
  if (!keyIsAvailable || !aiInstance) {
    console.warn("Gemini Service (getEstimatedDistanceAndRoute): API key not available or client not initialized. Returning mock data.");
    return { 
      distance: null, 
      routeSummary: "Distance estimation service is currently unavailable. Please enter distance manually. (Mocked: AI service disabled)",
      error: "AI service disabled" 
    };
  }

  const prompt = `You are a route distance estimator for Uganda.
Provide the estimated driving distance in kilometers between "${pickup}" and "${dropoff}".
Also, give a very brief, single-sentence summary of a likely route.
Your response MUST start *exactly* with "Distance: [NUMBER] km. Route: [SUMMARY]".
For example: "Distance: 12.5 km. Route: Via the main highway and Kampala Northern Bypass."
If you cannot reliably estimate the distance or route, respond *exactly* with: "Distance: N/A. Route: Unable to estimate the route or distance for the provided locations."`;

  try {
    const response: GenerateContentResponse = await aiInstance.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      // config: { tools: [{ googleSearch: {} }] } // Optionally enable search if direct estimation is poor
    });

    const text = response.text;
    const distanceRegex = /Distance: ([\d\.]+|N\/A) km\. Route: (.*)/s;
    const match = text.match(distanceRegex);

    if (match) {
      const distanceStr = match[1];
      const routeSum = match[2];

      if (distanceStr === "N/A") {
        return { distance: null, routeSummary: routeSum || "Unable to estimate the route or distance.", error: "N/A response from AI." };
      }
      const dist = parseFloat(distanceStr);
      if (isNaN(dist)) {
         return { distance: null, routeSummary: "AI provided an invalid distance format.", error: "Invalid distance format from AI." };
      }
      return { distance: dist, routeSummary: routeSum };
    } else {
      console.warn("Gemini Service (getEstimatedDistanceAndRoute): Response format unexpected.", text);
      return { distance: null, routeSummary: "Could not parse distance information from AI response. The AI might be providing a conversational answer. Please try rephrasing locations or enter distance manually.", error: "Parsing error." };
    }
  } catch (error) {
    console.error("Error fetching distance estimation from Gemini:", error);
    if (error instanceof Error && error.message.toLowerCase().includes("api key not valid")) {
        return { distance: null, routeSummary: "Could not estimate distance. API Key is invalid.", error: "API Key Invalid" };
    }
    return { distance: null, routeSummary: "An error occurred while estimating distance. Please try again or enter manually.", error: "API Error" };
  }
};
