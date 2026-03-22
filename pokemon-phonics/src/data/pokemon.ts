const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

export function getOfficialArtwork(pokedexId: number): string {
  return `${SPRITE_BASE}/other/official-artwork/${pokedexId}.png`;
}

export function getAnimatedSprite(pokedexId: number): string {
  return `${SPRITE_BASE}/other/showdown/${pokedexId}.gif`;
}

export function getShinyArtwork(pokedexId: number): string {
  return `${SPRITE_BASE}/other/official-artwork/shiny/${pokedexId}.png`;
}

export function getPixelSprite(pokedexId: number): string {
  return `${SPRITE_BASE}/${pokedexId}.png`;
}
