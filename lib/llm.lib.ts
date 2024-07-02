import { Ollama } from "ollama";
import { queryGeneratorSystemMessages } from "./template.util";

const llm = new Ollama();

export async function generateEmbeddings(query: string) {
  const result = await llm.embeddings({
    model: "nomic-embed-text",
    prompt: query,
  });
  console.log("Embeddings generated");
  return result.embedding;
}

export async function getValidQuery(query: string) {
  const validQuery = await llm.chat({
    model: "llama3",
    options: {
      temperature: 0.9,
    },
    format: "json",
    messages: [
      ...queryGeneratorSystemMessages,
      {
        role: "user",
        content: query,
      },
    ],
  });

  try {
    // Parse the JSON response
    const parsedResponse = JSON.parse(validQuery.message.content);
    console.log({ parsedResponse });
    return validQuery.message.content;
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    throw new Error("Failed to parse response from AI model");
  }
}

export async function getResponseBasedOnQueryAndWorkouts(
  query: string,
  workouts: any[]
) {
  const response = await llm.chat({
    model: "llama3",
    options: {
      temperature: 0.9,
    },
    format: "json",
    messages: [
      {
        role: "system",
        content: `You are a highly experienced Gym Trainer, based on user's query and workouts we found for them present the most suitable top 7 workouts, and tell them why it'll be good for them in short
          
          return a json which is an array like this [ {workout_obj:workout[i], reason:"reason for choosing this workout"} ]`,
      },
      {
        role: "user",
        content: `Query: ${query} \n Workouts Decided Based on Query: ${JSON.stringify(
          workouts
        )}`,
      },
    ],
  });

  return response.message.content;
}
