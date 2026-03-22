export interface GymLeader {
  regionId: number;
  name: string;
  title: string;
  greeting: string;
  defeat: string;
  // Pokedex ID for the gym leader's signature Pokemon (used as their sprite)
  pokemonId: number;
  pokemonName: string;
  hp: number;
}

export const GYM_LEADERS: GymLeader[] = [
  {
    regionId: 1, name: 'Lila', title: 'Pallet Meadow Gym Leader',
    greeting: "Hi there! I'm Lila! Let's see if you can read these words!",
    defeat: "Wow, you did it! You're a great reader!",
    pokemonId: 35, pokemonName: 'Clefairy', hp: 5,
  },
  {
    regionId: 2, name: 'Finn', title: 'Viridian Woods Gym Leader',
    greeting: "Welcome to my forest gym! I'm Finn! Can you read my words?",
    defeat: "Amazing! You read every word! You're getting so strong!",
    pokemonId: 52, pokemonName: 'Meowth', hp: 5,
  },
  {
    regionId: 3, name: 'Rocky', title: 'Pewter Mountains Gym Leader',
    greeting: "I'm Rocky, the mountain champion! Let's battle with words!",
    defeat: "You beat me! Your reading is rock solid!",
    pokemonId: 95, pokemonName: 'Onix', hp: 6,
  },
  {
    regionId: 4, name: 'Marina', title: 'Cerulean Caves Gym Leader',
    greeting: "I'm Marina! My words are tricky like the caves. Ready?",
    defeat: "You found your way through every word! Incredible!",
    pokemonId: 121, pokemonName: 'Starmie', hp: 6,
  },
  {
    regionId: 5, name: 'Bolt', title: 'Vermilion Coast Gym Leader',
    greeting: "I'm Bolt! Fast as lightning! Can you read just as fast?",
    defeat: "You're faster than lightning! What a reader!",
    pokemonId: 101, pokemonName: 'Electrode', hp: 6,
  },
  {
    regionId: 6, name: 'Sage', title: 'Lavender Fields Gym Leader',
    greeting: "I'm Sage. My words are a bit harder. Do your best!",
    defeat: "Beautiful reading! You've mastered these sounds!",
    pokemonId: 196, pokemonName: 'Espeon', hp: 7,
  },
  {
    regionId: 7, name: 'Nova', title: 'Saffron City Gym Leader',
    greeting: "I'm Nova, the final gym leader! Show me everything you've learned!",
    defeat: "You beat all seven gyms! You're a true Pokemon Phonics Champion!",
    pokemonId: 149, pokemonName: 'Dragonite', hp: 7,
  },
];

export function getGymLeader(regionId: number): GymLeader | undefined {
  return GYM_LEADERS.find(g => g.regionId === regionId);
}
