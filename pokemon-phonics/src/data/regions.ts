export interface Region {
  id: number;
  name: string;
  set: number;
  phase: 1 | 2;
  badgeName: string;
  badgeColor: string;
  description: string;
}

export const REGIONS: Region[] = [
  { id: 1, name: 'Pallet Meadow', set: 1, phase: 1, badgeName: 'Boulder Badge', badgeColor: '#A0A0A0', description: 'A sunny meadow where your adventure begins!' },
  { id: 2, name: 'Viridian Woods', set: 2, phase: 1, badgeName: 'Cascade Badge', badgeColor: '#6890F0', description: 'A lush forest full of friendly Pokemon!' },
  { id: 3, name: 'Pewter Mountains', set: 3, phase: 1, badgeName: 'Thunder Badge', badgeColor: '#F8D030', description: 'Rocky mountains with Pokemon hiding in caves!' },
  { id: 4, name: 'Cerulean Caves', set: 4, phase: 1, badgeName: 'Rainbow Badge', badgeColor: '#78C850', description: 'Sparkling caves with mysterious Pokemon!' },
  { id: 5, name: 'Vermilion Coast', set: 5, phase: 1, badgeName: 'Soul Badge', badgeColor: '#F85888', description: 'A beautiful coastline with waves and Pokemon!' },
  { id: 6, name: 'Lavender Fields', set: 6, phase: 1, badgeName: 'Marsh Badge', badgeColor: '#A040A0', description: 'Purple flower fields with rare Pokemon!' },
  { id: 7, name: 'Saffron City', set: 7, phase: 1, badgeName: 'Volcano Badge', badgeColor: '#F08030', description: 'A big city where the strongest trainers gather!' },
  // Phase 2 regions
  { id: 8, name: 'Fuchsia Jungle', set: 8, phase: 2, badgeName: 'Earth Badge', badgeColor: '#E0C068', description: 'A tropical jungle with new sounds to discover!' },
  { id: 9, name: 'Cinnabar Island', set: 9, phase: 2, badgeName: 'Glacier Badge', badgeColor: '#98D8D8', description: 'A volcanic island with powerful Pokemon!' },
  { id: 10, name: 'Indigo Plateau', set: 10, phase: 2, badgeName: 'Rising Badge', badgeColor: '#C03028', description: 'The champion awaits at the top!' },
  { id: 11, name: 'Victory Road', set: 11, phase: 2, badgeName: 'Champion Badge', badgeColor: '#FFD700', description: 'The final challenge! Can you master all the sounds?' },
];

export function getRegionBySet(set: number): Region | undefined {
  return REGIONS.find(r => r.set === set);
}

export function getRegionById(id: number): Region | undefined {
  return REGIONS.find(r => r.id === id);
}
