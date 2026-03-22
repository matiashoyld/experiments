'use client';

import { getOfficialArtwork, getAnimatedSprite, getShinyArtwork } from '@/data/pokemon';

interface PokemonSpriteProps {
  pokedexId: number;
  name: string;
  size?: number;
  variant?: 'official' | 'animated' | 'shiny';
  className?: string;
  silhouette?: boolean;
}

export default function PokemonSprite({
  pokedexId,
  name,
  size = 200,
  variant = 'official',
  className = '',
  silhouette = false,
}: PokemonSpriteProps) {
  const src = variant === 'animated'
    ? getAnimatedSprite(pokedexId)
    : variant === 'shiny'
    ? getShinyArtwork(pokedexId)
    : getOfficialArtwork(pokedexId);

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={`pokemon-sprite ${silhouette ? 'silhouette' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        filter: silhouette ? 'brightness(0)' : 'none',
        imageRendering: variant === 'animated' ? 'pixelated' : 'auto',
      }}
      draggable={false}
    />
  );
}
