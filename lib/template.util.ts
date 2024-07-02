// import {
//   generateEmbeddings,
//   getValidQuery,
// } from "./llm.lib";
// import { EmbeddedExcerciseQuery } from "./prisma.lib";

import { BodyPart } from "@prisma/client";
export function formatDateShort(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are 0-based
  const year = date.getFullYear() % 100; // Get last two digits of year

  return `${month}/${day}/${year}`;
}
export const excerciseEmbeddingQueryTemplate = ({
  BodyPart,
  Desc,
  Type,
  Title,
  Equipment,
  Level,
}: {
  BodyPart: string;
  Desc: string;
  Type: string;
  Title: string;
  Equipment: string;
  Level: string;
}) =>
  `MUSCLE USED: ${BodyPart} \n DESCRIPTION: ${Desc} \n FOR ${Type} \n EXERCISE NAME: ${Title} \n EQUIPMENTS NEEDED: ${Equipment} \n Difficulty Level: ${Level} \n`;

export const aggregateTemplate = async (
  query: string,
  limit: number,
  numCandidates: number
) => [
  {
    //   $vectorSearch: {
    //     index: "ExcerciseEmbeddedIndex",
    //     path: "embeddings",
    //     queryVector: await generateEmbeddings(await getValidQuery(query)),
    //     numCandidates, // Increase numCandidates to retrieve more potential matches
    //     limit,
    //   },
    // },
    // {
    //   $project: {
    //     BodyPart: 1,
    //     Desc: 1,
    //     Equipment: 1,
    //     Level: 1,
    //     Type: 1,
    //     Title: 1,
    //     score: {
    //       $meta: "vectorSearchScore",
    //     },
    //   },
  },
];
export const BodyParts: BodyPart[] = [
  "Abdominals",
  "Abductors",
  "Adductors",
  "Biceps",
  "Calves",
  "Chest",
  "Hamstrings",
  "Traps",
  "Neck",
  "Glutes",
  "Lower_Back",
  "Lats",
  "Middle_Back",
  "Shoulders",
  "Triceps",
  "Quadriceps",
  "Forearms",
];
export const navs = [
  {
    title: "Profile",
    titlePt2: "Details",
    titleEmoji: "🙋🏻‍♂️",
    nav: "profile",
  },
  {
    title: "Past",
    titlePt2: "Workouts",
    titleEmoji: "💪🏻",
    nav: "past",
  },
  {
    title: "Favourite",
    titlePt2: "Workouts",
    titleEmoji: "⭐",
    nav: "favourite",
  },
  {
    title: "Virtual",
    titlePt2: "AI Coach",
    titleEmoji: "🪄",
    nav: "virtual",
  },
  {
    title: "Workout",
    titlePt2: "Tracker",
    titleEmoji: "📝",
    nav: "tracker",
  },
];

export function formatDate(date: Date) {
  const options: any = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  // Format the date using toLocaleDateString
  let formattedDate = date.toLocaleDateString("en-GB", options);

  // Add suffixes to day numbers (1st, 2nd, 3rd, 4th, etc.)
  const day = date.getDate();
  let daySuffix;
  if (day > 3 && day < 21) {
    daySuffix = "th";
  } else {
    switch (day % 10) {
      case 1:
        daySuffix = "st";
        break;
      case 2:
        daySuffix = "nd";
        break;
      case 3:
        daySuffix = "rd";
        break;
      default:
        daySuffix = "th";
        break;
    }
  }

  // Replace day with day + suffix
  formattedDate = formattedDate.replace(day as any, `${day}${daySuffix}`);

  return formattedDate;
}
// export const consolidatedGetSuitableWorkout = async (query: string) => {
//   const workouts = await EmbeddedExcerciseQuery(query, 20, 200);
//   console.log({ workouts });
//   console.log("Reasoning...");
//   const response = await getResponseBasedOnQueryAndWorkouts(query, workouts);
//   return response;
// };
export const queryGeneratorSystemMessages = [
  {
    role: "system",
    content: `You are a highly experienced AI Gym trainer. Based on user input, extract the following data and respond in JSON format with the keys: \`BodyPart\`, \`Desc\`, \`Type\`, \`Title\`, \`Equipment\`, and \`Level\`. Follow the rules below to fill each field:

### Rules for Extraction

1. **BodyPart**:
   - Identify the body part the user wants to train based on their message.
   - If the user mentions that they have an injury (e.g., "injury in my chest") and mentions a specific body part that is injured, select any body part other than the injured one. The body parts you can choose from are:
     - Abdominals
     - Abductors
     - Adductors
     - Biceps
     - Calves
     - Chest
     - Hamstrings
     - Traps
     - Neck
     - Glutes
     - Lower Back
     - Lats
     - Middle Back
     - Shoulders
     - Triceps
     - Quadriceps
     - Forearms
   - If no specific body part is mentioned, choose a suitable body part based on the context.

2. **Desc**:
   - Leave this field blank unless the user explicitly names a specific workout or exercise, in which case provide a vague description of that exercise.

3. **Type**:
   - Determine whether the workout is for cardio or strength based on the text in the user's message.
   - If unsure, leave this field blank.

4. **Title**:
   - Only populate this field if the user specifically names a workout or exercise. If no specific workout is mentioned, leave this field blank.

5. **Equipment**:
   - Extract the equipment the user has or wants to use from the following list:
     - Foam Roll
     - Cable
     - Dumbbell
     - Barbell
     - Kettlebells
     - Body Only
     - Bands
     - Exercise Ball
     - None
     - E-Z Curl Bar
     - Medicine Ball
     - Machine
     - Other
   - If the user says they do not have a specific piece of equipment, include every other equipment from the list except the one they do not have.

6. **Level**:
   - Figure out if the user is at a beginner, intermediate, or advanced level based on the text in their message. If it’s not clear, leave this field blank.
`,
  },
  {
    role: "user",
    content:
      "Hi, I am new to the gym, I have an injury in my chest but I want to workout right now, I don’t want to do back or legs, I only have dumbbells in my home what should I do",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "Biceps, Shoulder, Neck, Abdominals",\n  "Desc": "",\n  "Type": "Strength",\n  "Title": "",\n  "Equipment": "Dumbbell",\n  "Level": "Beginner"\n}',
  },
  {
    role: "user",
    content:
      "I have a sore shoulder and want to work out my abs. I only have a yoga mat.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "Abdominals",\n  "Desc": "",\n  "Type": "Strength",\n  "Title": "",\n  "Equipment": "Body Only, Exercise Ball",\n  "Level": ""\n}',
  },
  {
    role: "user",
    content:
      "I don’t want to work on my chest today. I have dumbbells and a medicine ball.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "Back Legs Shoulder Abdominals",\n  "Desc": "",\n  "Type": "Strength",\n  "Title": "",\n  "Equipment": "Dumbbell, Medicine Ball",\n  "Level": ""\n}',
  },
  {
    role: "user",
    content:
      "I’m new to working out and have a knee injury. I want to do some light cardio. I have an exercise ball.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "",\n  "Desc": "",\n  "Type": "Cardio",\n  "Title": "",\n  "Equipment": "Exercise Ball",\n  "Level": "Beginner"\n}',
  },
  {
    role: "user",
    content:
      "I am recovering from a back injury. What exercises can I do for my legs? I only have bands.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "Quadriceps",\n  "Desc": "",\n  "Type": "Strength",\n  "Title": "",\n  "Equipment": "Bands",\n  "Level": ""\n}',
  },
  {
    role: "user",
    content: "I want to focus on my biceps today. I have a pair of dumbbells.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "Biceps",\n  "Desc": "",\n  "Type": "Strength",\n  "Title": "",\n  "Equipment": "Dumbbell",\n  "Level": ""\n}',
  },
  {
    role: "user",
    content:
      "I’m looking for a workout for my calves. I have a kettlebell and a foam roll.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "Calves",\n  "Desc": "",\n  "Type": "Strength",\n  "Title": "",\n  "Equipment": "Kettlebell, Foam Roll",\n  "Level": ""\n}',
  },
  {
    role: "user",
    content:
      "I need a workout for my abs but I don't have any equipment except a yoga mat.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "Abdominals",\n  "Desc": "",\n  "Type": "Strength",\n  "Title": "",\n  "Equipment": "Body Only, Yoga Mat",\n  "Level": ""\n}',
  },
  {
    role: "user",
    content: "I want to improve my endurance but only have a set of bands.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "",\n  "Desc": "",\n  "Type": "Cardio",\n  "Title": "",\n  "Equipment": "Bands",\n  "Level": ""\n}',
  },
  {
    role: "user",
    content:
      "I have a sore chest and want to work on my triceps. I have a barbell.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "Triceps",\n  "Desc": "",\n  "Type": "Strength",\n  "Title": "",\n  "Equipment": "Barbell",\n  "Level": ""\n}',
  },
  {
    role: "user",
    content:
      "I’m an intermediate level gym-goer and need a workout for my glutes. I have a medicine ball and a set of bands.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "Glutes",\n  "Desc": "",\n  "Type": "Strength",\n  "Title": "",\n  "Equipment": "Medicine Ball, Bands",\n  "Level": "Intermediate"\n}',
  },
  {
    role: "user",
    content:
      "I’m a beginner and looking for a workout for my shoulders. I only have a foam roll.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "Shoulders",\n  "Desc": "",\n  "Type": "Strength",\n  "Title": "",\n  "Equipment": "Foam Roll",\n  "Level": "Beginner"\n}',
  },
  {
    role: "user",
    content:
      "I’m not sure what to do today. I want to work on my abs but my legs are sore from yesterday.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "Abdominals",\n  "Desc": "",\n  "Type": "Strength",\n  "Title": "",\n  "Equipment": "Body Only",\n  "Level": ""\n}',
  },
  {
    role: "user",
    content:
      "I’m dealing with a shoulder injury and want to work on my lower back. I don’t have any equipment.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "Lower Back",\n  "Desc": "",\n  "Type": "Strength",\n  "Title": "",\n  "Equipment": "Body Only",\n  "Level": ""\n}',
  },
  {
    role: "user",
    content:
      "I’m sore from yesterday’s workout and just want to do a gentle workout for my glutes. I have a yoga mat.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "Glutes",\n  "Desc": "",\n  "Type": "Strength",\n  "Title": "",\n  "Equipment": "Yoga Mat",\n  "Level": ""\n}',
  },
  {
    role: "user",
    content:
      "I’m looking for a workout that’s easy on the knees but effective for my calves. I have a set of bands.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "Calves",\n  "Desc": "",\n  "Type": "Strength",\n  "Title": "",\n  "Equipment": "Bands",\n  "Level": ""\n}',
  },
  {
    role: "user",
    content:
      "I have a sore chest and want to work on my triceps. I have a set of dumbbells.",
  },
  {
    role: "assistant",
    content:
      '{\n  "BodyPart": "Triceps",\n  "Desc": "",\n  "Type": "Strength",\n  "Title": "",\n  "Equipment": "Dumbbell",\n  "Level": ""\n}',
  },
];
