'use client';

import { useState } from 'react';
import { getOfficialArtwork, getAnimatedSprite, getShinyArtwork } from '@/data/pokemon';

interface PokemonSpriteProps {
  pokedexId: number;
  name: string;
  size?: number;
  variant?: 'official' | 'animated' | 'shiny';
  className?: string;
  silhouette?: boolean;
  bounce?: boolean;
}

export default function PokemonSprite({
  pokedexId,
  name,
  size = 200,
  variant = 'animated',
  className = '',
  silhouette = false,
  bounce = false,
}: PokemonSpriteProps) {
  const [useFallback, setUseFallback] = useState(false);

  const getSrc = () => {
    if (variant === 'shiny') return getShinyArtwork(pokedexId);
    if (variant === 'official' || useFallback) return getOfficialArtwork(pokedexId);
    return getAnimatedSprite(pokedexId);
  };

  const isAnimated = variant === 'animated' && !useFallback;

  // Stagger bounce animation by pokedexId so multiple sprites don't sync
  const bounceDelay = bounce ? `${(pokedexId % 7) * 0.3}s` : undefined;

  return (
    <img
      src={getSrc()}
      alt={name}
      width={size}
      height={size}
      className={`pokemon-sprite ${silhouette ? 'silhouette' : ''} ${bounce ? 'pokemon-bounce' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        filter: silhouette ? 'brightness(0)' : 'none',
        imageRendering: isAnimated ? 'pixelated' : 'auto',
        animationDelay: bounceDelay,
      }}
      draggable={false}
      onError={() => {
        if (!useFallback) setUseFallback(true);
      }}
    />
  );
}
