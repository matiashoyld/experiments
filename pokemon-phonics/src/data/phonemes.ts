export interface PhonemeData {
  id: string;
  grapheme: string;
  displayGrapheme: string;
  sound: string;
  description: string;
  phase: 1 | 2;
  set: number;
  pokemon: {
    id: number;
    name: string;
    evolutionLine: {
      stage1: { id: number; name: string };
      stage2: { id: number; name: string };
      stage3: { id: number; name: string };
    };
  };
  exampleWords: {
    cvc: string[];
    ccvc?: string[];
    cvcc?: string[];
    sentences?: string[];
  };
  trickyWord?: string;
  mnemonicPhrase: string;
}

// Phase 1 — Single Letter Sounds
export const PHASE_1_PHONEMES: PhonemeData[] = [
  // Set 1: s, a, t, p
  {
    id: 's', grapheme: 's', displayGrapheme: 's', sound: '/s/', description: 'the sss sound, like a snake',
    phase: 1, set: 1,
    pokemon: { id: 7, name: 'Squirtle', evolutionLine: { stage1: { id: 7, name: 'Squirtle' }, stage2: { id: 8, name: 'Wartortle' }, stage3: { id: 9, name: 'Blastoise' } } },
    exampleWords: { cvc: ['sat', 'sip', 'sun', 'sit', 'sap', 'sob', 'sum', 'set'] },
    mnemonicPhrase: 'S is for Squirtle! Sssss!',
  },
  {
    id: 'a', grapheme: 'a', displayGrapheme: 'a', sound: '/æ/', description: 'the a sound, like in cat',
    phase: 1, set: 1,
    pokemon: { id: 63, name: 'Abra', evolutionLine: { stage1: { id: 63, name: 'Abra' }, stage2: { id: 64, name: 'Kadabra' }, stage3: { id: 65, name: 'Alakazam' } } },
    exampleWords: { cvc: ['at', 'an', 'am', 'cat', 'hat', 'bat', 'mat', 'rat'] },
    mnemonicPhrase: 'A is for Abra! Aaa!',
  },
  {
    id: 't', grapheme: 't', displayGrapheme: 't', sound: '/t/', description: 'the t sound, a quick tap',
    phase: 1, set: 1,
    pokemon: { id: 255, name: 'Torchic', evolutionLine: { stage1: { id: 255, name: 'Torchic' }, stage2: { id: 256, name: 'Combusken' }, stage3: { id: 257, name: 'Blaziken' } } },
    exampleWords: { cvc: ['tap', 'tin', 'top', 'tip', 'tub', 'ten', 'tan', 'tag'] },
    mnemonicPhrase: 'T is for Torchic! T-t-t!',
  },
  {
    id: 'p', grapheme: 'p', displayGrapheme: 'p', sound: '/p/', description: 'the p sound, a little puff',
    phase: 1, set: 1,
    pokemon: { id: 172, name: 'Pichu', evolutionLine: { stage1: { id: 172, name: 'Pichu' }, stage2: { id: 25, name: 'Pikachu' }, stage3: { id: 26, name: 'Raichu' } } },
    exampleWords: { cvc: ['pat', 'pin', 'pot', 'pan', 'peg', 'pig', 'pup', 'pen'] },
    mnemonicPhrase: 'P is for Pichu! P-p-p!',
  },
  // i and n moved to Set 1 for more Pokemon in Pallet Meadow
  {
    id: 'i', grapheme: 'i', displayGrapheme: 'i', sound: '/ɪ/', description: 'the i sound, like in sit',
    phase: 1, set: 1,
    pokemon: { id: 174, name: 'Igglybuff', evolutionLine: { stage1: { id: 174, name: 'Igglybuff' }, stage2: { id: 39, name: 'Jigglypuff' }, stage3: { id: 40, name: 'Wigglytuff' } } },
    exampleWords: { cvc: ['in', 'it', 'is', 'sit', 'tip', 'pin', 'pit', 'dim'] },
    mnemonicPhrase: 'I is for Igglybuff! Ih-ih-ih!',
  },
  {
    id: 'n', grapheme: 'n', displayGrapheme: 'n', sound: '/n/', description: 'the n sound, like nnn',
    phase: 1, set: 1,
    pokemon: { id: 32, name: 'Nidoran', evolutionLine: { stage1: { id: 32, name: 'Nidoran♂' }, stage2: { id: 33, name: 'Nidorino' }, stage3: { id: 34, name: 'Nidoking' } } },
    exampleWords: { cvc: ['nap', 'net', 'not', 'nip', 'nod', 'nut', 'nag', 'nib'] },
    mnemonicPhrase: 'N is for Nidoran! Nnn!',
  },
  {
    id: 'm', grapheme: 'm', displayGrapheme: 'm', sound: '/m/', description: 'the m sound, like mmm',
    phase: 1, set: 2,
    pokemon: { id: 258, name: 'Mudkip', evolutionLine: { stage1: { id: 258, name: 'Mudkip' }, stage2: { id: 259, name: 'Marshtomp' }, stage3: { id: 260, name: 'Swampert' } } },
    exampleWords: { cvc: ['man', 'map', 'mat', 'mop', 'mud', 'mix', 'met', 'mug'] },
    mnemonicPhrase: 'M is for Mudkip! Mmm!',
  },
  {
    id: 'd', grapheme: 'd', displayGrapheme: 'd', sound: '/d/', description: 'the d sound, a quick tap',
    phase: 1, set: 2,
    pokemon: { id: 633, name: 'Deino', evolutionLine: { stage1: { id: 633, name: 'Deino' }, stage2: { id: 634, name: 'Zweilous' }, stage3: { id: 635, name: 'Hydreigon' } } },
    exampleWords: { cvc: ['dig', 'dog', 'dip', 'dim', 'dam', 'din', 'dot', 'dug'] },
    mnemonicPhrase: 'D is for Deino! D-d-d!',
  },
  // g and o moved to Set 2 for more Pokemon in Viridian Woods
  {
    id: 'g', grapheme: 'g', displayGrapheme: 'g', sound: '/ɡ/', description: 'the g sound, like guh',
    phase: 1, set: 2,
    pokemon: { id: 810, name: 'Grookey', evolutionLine: { stage1: { id: 810, name: 'Grookey' }, stage2: { id: 811, name: 'Thwackey' }, stage3: { id: 812, name: 'Rillaboom' } } },
    exampleWords: { cvc: ['got', 'gas', 'gap', 'gum', 'gig', 'gag', 'gob', 'gut'] },
    mnemonicPhrase: 'G is for Grookey! G-g-g!',
  },
  {
    id: 'o', grapheme: 'o', displayGrapheme: 'o', sound: '/ɒ/', description: 'the o sound, like in hot',
    phase: 1, set: 2,
    pokemon: { id: 501, name: 'Oshawott', evolutionLine: { stage1: { id: 501, name: 'Oshawott' }, stage2: { id: 502, name: 'Dewott' }, stage3: { id: 503, name: 'Samurott' } } },
    exampleWords: { cvc: ['on', 'off', 'hot', 'pot', 'cot', 'dog', 'log', 'mop'] },
    mnemonicPhrase: 'O is for Oshawott! Ooo!',
  },
  {
    id: 'c', grapheme: 'c', displayGrapheme: 'c', sound: '/k/', description: 'the c sound, like k',
    phase: 1, set: 3,
    pokemon: { id: 10, name: 'Caterpie', evolutionLine: { stage1: { id: 10, name: 'Caterpie' }, stage2: { id: 11, name: 'Metapod' }, stage3: { id: 12, name: 'Butterfree' } } },
    exampleWords: { cvc: ['cat', 'can', 'cot', 'cup', 'cap', 'cod', 'cub', 'cog'] },
    mnemonicPhrase: 'C is for Caterpie! C-c-c!',
  },
  {
    id: 'k', grapheme: 'k', displayGrapheme: 'k', sound: '/k/', description: 'the k sound, same as c',
    phase: 1, set: 3,
    pokemon: { id: 98, name: 'Krabby', evolutionLine: { stage1: { id: 98, name: 'Krabby' }, stage2: { id: 99, name: 'Kingler' }, stage3: { id: 99, name: 'Kingler' } } },
    exampleWords: { cvc: ['kit', 'kid', 'keg', 'ken', 'kin'] },
    mnemonicPhrase: 'K is for Krabby! K-k-k!',
  },
  // ck and e moved to Set 3
  {
    id: 'ck', grapheme: 'ck', displayGrapheme: 'ck', sound: '/k/', description: 'the ck sound at the end of words',
    phase: 1, set: 3,
    pokemon: { id: 155, name: 'Cyndaquil', evolutionLine: { stage1: { id: 155, name: 'Cyndaquil' }, stage2: { id: 156, name: 'Quilava' }, stage3: { id: 157, name: 'Typhlosion' } } },
    exampleWords: { cvc: ['duck', 'sock', 'neck', 'kick', 'pick', 'tick', 'dock', 'lock'] },
    mnemonicPhrase: 'CK is for Cyndaquil! Quick!',
  },
  {
    id: 'e', grapheme: 'e', displayGrapheme: 'e', sound: '/ɛ/', description: 'the e sound, like in pet',
    phase: 1, set: 3,
    pokemon: { id: 133, name: 'Eevee', evolutionLine: { stage1: { id: 133, name: 'Eevee' }, stage2: { id: 136, name: 'Flareon' }, stage3: { id: 134, name: 'Vaporeon' } } },
    exampleWords: { cvc: ['egg', 'end', 'red', 'pet', 'bed', 'ten', 'pen', 'hen'] },
    mnemonicPhrase: 'E is for Eevee! Eh-eh-eh!',
  },
  {
    id: 'u', grapheme: 'u', displayGrapheme: 'u', sound: '/ʌ/', description: 'the u sound, like in cup',
    phase: 1, set: 4,
    pokemon: { id: 197, name: 'Umbreon', evolutionLine: { stage1: { id: 197, name: 'Umbreon' }, stage2: { id: 197, name: 'Umbreon' }, stage3: { id: 197, name: 'Umbreon' } } },
    exampleWords: { cvc: ['up', 'us', 'cup', 'sun', 'but', 'cut', 'run', 'fun'] },
    mnemonicPhrase: 'U is for Umbreon! Uh-uh-uh!',
  },
  {
    id: 'r', grapheme: 'r', displayGrapheme: 'r', sound: '/r/', description: 'the r sound, like rrr',
    phase: 1, set: 4,
    pokemon: { id: 722, name: 'Rowlet', evolutionLine: { stage1: { id: 722, name: 'Rowlet' }, stage2: { id: 723, name: 'Dartrix' }, stage3: { id: 724, name: 'Decidueye' } } },
    exampleWords: { cvc: ['run', 'red', 'rat', 'rip', 'rug', 'rim', 'rot', 'ram'] },
    mnemonicPhrase: 'R is for Rowlet! Rrr!',
  },
  // h and b moved to Set 4
  {
    id: 'h', grapheme: 'h', displayGrapheme: 'h', sound: '/h/', description: 'the h sound, like a breath',
    phase: 1, set: 4,
    pokemon: { id: 187, name: 'Hoppip', evolutionLine: { stage1: { id: 187, name: 'Hoppip' }, stage2: { id: 188, name: 'Skiploom' }, stage3: { id: 189, name: 'Jumpluff' } } },
    exampleWords: { cvc: ['hat', 'hot', 'hit', 'hug', 'hen', 'him', 'hop', 'hum'] },
    mnemonicPhrase: 'H is for Hoppip! Hhh!',
  },
  {
    id: 'b', grapheme: 'b', displayGrapheme: 'b', sound: '/b/', description: 'the b sound, a little burst',
    phase: 1, set: 4,
    pokemon: { id: 1, name: 'Bulbasaur', evolutionLine: { stage1: { id: 1, name: 'Bulbasaur' }, stage2: { id: 2, name: 'Ivysaur' }, stage3: { id: 3, name: 'Venusaur' } } },
    exampleWords: { cvc: ['bat', 'bed', 'big', 'bus', 'but', 'beg', 'bit', 'bun'] },
    mnemonicPhrase: 'B is for Bulbasaur! B-b-b!',
  },
  {
    id: 'f', grapheme: 'f', displayGrapheme: 'f', sound: '/f/', description: 'the f sound, like blowing',
    phase: 1, set: 5,
    pokemon: { id: 653, name: 'Fennekin', evolutionLine: { stage1: { id: 653, name: 'Fennekin' }, stage2: { id: 654, name: 'Braixen' }, stage3: { id: 655, name: 'Delphox' } } },
    exampleWords: { cvc: ['fan', 'fit', 'fig', 'fun', 'fog', 'fin', 'fat', 'fix'] },
    mnemonicPhrase: 'F is for Fennekin! Fff!',
  },
  {
    id: 'ff', grapheme: 'ff', displayGrapheme: 'ff', sound: '/f/', description: 'the ff sound at the end',
    phase: 1, set: 5,
    pokemon: { id: 180, name: 'Flaaffy', evolutionLine: { stage1: { id: 179, name: 'Mareep' }, stage2: { id: 180, name: 'Flaaffy' }, stage3: { id: 181, name: 'Ampharos' } } },
    exampleWords: { cvc: ['off', 'puff', 'huff', 'cuff', 'buff', 'miff', 'doff'] },
    mnemonicPhrase: 'FF is for Flaaffy! Off!',
  },
  {
    id: 'l', grapheme: 'l', displayGrapheme: 'l', sound: '/l/', description: 'the l sound, tongue up',
    phase: 1, set: 5,
    pokemon: { id: 607, name: 'Litwick', evolutionLine: { stage1: { id: 607, name: 'Litwick' }, stage2: { id: 608, name: 'Lampent' }, stage3: { id: 609, name: 'Chandelure' } } },
    exampleWords: { cvc: ['leg', 'lip', 'lot', 'let', 'lid', 'log', 'lit', 'lug'] },
    mnemonicPhrase: 'L is for Litwick! Lll!',
  },
  {
    id: 'll', grapheme: 'll', displayGrapheme: 'll', sound: '/l/', description: 'the ll sound at the end',
    phase: 1, set: 5,
    pokemon: { id: 506, name: 'Lillipup', evolutionLine: { stage1: { id: 506, name: 'Lillipup' }, stage2: { id: 507, name: 'Herdier' }, stage3: { id: 508, name: 'Stoutland' } } },
    exampleWords: { cvc: ['bell', 'doll', 'hill', 'tall', 'tell', 'fill', 'mill', 'bull'] },
    mnemonicPhrase: 'LL is for Lillipup! Bell!',
  },
  {
    id: 'ss', grapheme: 'ss', displayGrapheme: 'ss', sound: '/s/', description: 'the ss sound at the end',
    phase: 1, set: 5,
    pokemon: { id: 27, name: 'Sandshrew', evolutionLine: { stage1: { id: 27, name: 'Sandshrew' }, stage2: { id: 28, name: 'Sandslash' }, stage3: { id: 28, name: 'Sandslash' } } },
    exampleWords: { cvc: ['hiss', 'miss', 'boss', 'mess', 'fuss', 'loss', 'moss'] },
    mnemonicPhrase: 'SS is for Sandshrew! Hiss!',
  },
  // Set 6: j, v, w, x
  {
    id: 'j', grapheme: 'j', displayGrapheme: 'j', sound: '/dʒ/', description: 'the j sound, like jump',
    phase: 1, set: 6,
    pokemon: { id: 135, name: 'Jolteon', evolutionLine: { stage1: { id: 135, name: 'Jolteon' }, stage2: { id: 135, name: 'Jolteon' }, stage3: { id: 135, name: 'Jolteon' } } },
    exampleWords: { cvc: ['jog', 'jam', 'jet', 'jug', 'jab', 'jig', 'job', 'jot'] },
    mnemonicPhrase: 'J is for Jolteon! J-j-j!',
  },
  {
    id: 'v', grapheme: 'v', displayGrapheme: 'v', sound: '/v/', description: 'the v sound, teeth on lip',
    phase: 1, set: 6,
    pokemon: { id: 37, name: 'Vulpix', evolutionLine: { stage1: { id: 37, name: 'Vulpix' }, stage2: { id: 38, name: 'Ninetales' }, stage3: { id: 38, name: 'Ninetales' } } },
    exampleWords: { cvc: ['van', 'vet', 'vat', 'vim', 'vow', 'via'] },
    mnemonicPhrase: 'V is for Vulpix! Vvv!',
  },
  {
    id: 'w', grapheme: 'w', displayGrapheme: 'w', sound: '/w/', description: 'the w sound, round lips',
    phase: 1, set: 6,
    pokemon: { id: 194, name: 'Wooper', evolutionLine: { stage1: { id: 194, name: 'Wooper' }, stage2: { id: 195, name: 'Quagsire' }, stage3: { id: 980, name: 'Clodsire' } } },
    exampleWords: { cvc: ['wet', 'win', 'wag', 'web', 'wig', 'wok', 'wit', 'wax'] },
    mnemonicPhrase: 'W is for Wooper! Www!',
  },
  {
    id: 'x', grapheme: 'x', displayGrapheme: 'x', sound: '/ks/', description: 'the x sound, like ks',
    phase: 1, set: 6,
    pokemon: { id: 178, name: 'Xatu', evolutionLine: { stage1: { id: 177, name: 'Natu' }, stage2: { id: 178, name: 'Xatu' }, stage3: { id: 178, name: 'Xatu' } } },
    exampleWords: { cvc: ['box', 'fox', 'mix', 'six', 'fix', 'wax', 'tax'] },
    mnemonicPhrase: 'X is for Xatu! Box!',
  },
  // Set 7: y, z, zz, qu
  {
    id: 'y', grapheme: 'y', displayGrapheme: 'y', sound: '/j/', description: 'the y sound, like yes',
    phase: 1, set: 7,
    pokemon: { id: 835, name: 'Yamper', evolutionLine: { stage1: { id: 835, name: 'Yamper' }, stage2: { id: 836, name: 'Boltund' }, stage3: { id: 836, name: 'Boltund' } } },
    exampleWords: { cvc: ['yes', 'yet', 'yam', 'yap', 'yak'] },
    mnemonicPhrase: 'Y is for Yamper! Yyy!',
  },
  {
    id: 'z', grapheme: 'z', displayGrapheme: 'z', sound: '/z/', description: 'the z sound, like a bee',
    phase: 1, set: 7,
    pokemon: { id: 570, name: 'Zorua', evolutionLine: { stage1: { id: 570, name: 'Zorua' }, stage2: { id: 571, name: 'Zoroark' }, stage3: { id: 571, name: 'Zoroark' } } },
    exampleWords: { cvc: ['zip', 'zap', 'zig', 'zoo', 'zen'] },
    mnemonicPhrase: 'Z is for Zorua! Zzz!',
  },
  {
    id: 'zz', grapheme: 'zz', displayGrapheme: 'zz', sound: '/z/', description: 'the zz sound at the end',
    phase: 1, set: 7,
    pokemon: { id: 263, name: 'Zigzagoon', evolutionLine: { stage1: { id: 263, name: 'Zigzagoon' }, stage2: { id: 264, name: 'Linoone' }, stage3: { id: 862, name: 'Obstagoon' } } },
    exampleWords: { cvc: ['buzz', 'fizz', 'fuzz', 'jazz'] },
    mnemonicPhrase: 'ZZ is for Zigzagoon! Buzz!',
  },
  {
    id: 'qu', grapheme: 'qu', displayGrapheme: 'qu', sound: '/kw/', description: 'the qu sound, like kw',
    phase: 1, set: 7,
    pokemon: { id: 912, name: 'Quaxly', evolutionLine: { stage1: { id: 912, name: 'Quaxly' }, stage2: { id: 913, name: 'Quaxwell' }, stage3: { id: 914, name: 'Quaquaval' } } },
    exampleWords: { cvc: ['quiz', 'quit', 'quip'] },
    mnemonicPhrase: 'QU is for Quaxly! Qu-qu-qu!',
  },
];

// Phase 2 — Digraphs & Trigraphs
export const PHASE_2_PHONEMES: PhonemeData[] = [
  {
    id: 'ch', grapheme: 'ch', displayGrapheme: 'ch', sound: '/tʃ/', description: 'the ch sound, like choo choo',
    phase: 2, set: 8,
    pokemon: { id: 4, name: 'Charmander', evolutionLine: { stage1: { id: 4, name: 'Charmander' }, stage2: { id: 5, name: 'Charmeleon' }, stage3: { id: 6, name: 'Charizard' } } },
    exampleWords: { cvc: ['chip', 'chop', 'chin', 'chat'], cvcc: ['much', 'rich', 'such'] },
    mnemonicPhrase: 'CH is for Charmander! Ch-ch-ch!',
  },
  {
    id: 'sh', grapheme: 'sh', displayGrapheme: 'sh', sound: '/ʃ/', description: 'the sh sound, like shh quiet',
    phase: 2, set: 8,
    pokemon: { id: 492, name: 'Shaymin', evolutionLine: { stage1: { id: 492, name: 'Shaymin' }, stage2: { id: 492, name: 'Shaymin' }, stage3: { id: 492, name: 'Shaymin' } } },
    exampleWords: { cvc: ['ship', 'shop', 'shin', 'shed'], cvcc: ['fish', 'wish', 'rush', 'gush'] },
    mnemonicPhrase: 'SH is for Shaymin! Shh!',
  },
  {
    id: 'th', grapheme: 'th', displayGrapheme: 'th', sound: '/θ/', description: 'the th sound, tongue between teeth',
    phase: 2, set: 8,
    pokemon: { id: 642, name: 'Thundurus', evolutionLine: { stage1: { id: 642, name: 'Thundurus' }, stage2: { id: 642, name: 'Thundurus' }, stage3: { id: 642, name: 'Thundurus' } } },
    exampleWords: { cvc: ['thin', 'than', 'them', 'then'], cvcc: ['with', 'bath', 'math', 'moth'] },
    mnemonicPhrase: 'TH is for Thundurus! Th-th-th!',
  },
  {
    id: 'ng', grapheme: 'ng', displayGrapheme: 'ng', sound: '/ŋ/', description: 'the ng sound, like ring',
    phase: 2, set: 8,
    pokemon: { id: 114, name: 'Tangela', evolutionLine: { stage1: { id: 114, name: 'Tangela' }, stage2: { id: 465, name: 'Tangrowth' }, stage3: { id: 465, name: 'Tangrowth' } } },
    exampleWords: { cvc: ['ring', 'song', 'bang', 'king', 'sing', 'long', 'gong'] },
    mnemonicPhrase: 'NG is for Tangela! Ring!',
  },
  {
    id: 'ai', grapheme: 'ai', displayGrapheme: 'ai', sound: '/eɪ/', description: 'the ai sound, like rain',
    phase: 2, set: 9,
    pokemon: { id: 190, name: 'Aipom', evolutionLine: { stage1: { id: 190, name: 'Aipom' }, stage2: { id: 424, name: 'Ambipom' }, stage3: { id: 424, name: 'Ambipom' } } },
    exampleWords: { cvc: ['rain', 'tail', 'wait', 'mail', 'paid', 'sail', 'main'] },
    mnemonicPhrase: 'AI is for Aipom! Rain!',
  },
  {
    id: 'ee', grapheme: 'ee', displayGrapheme: 'ee', sound: '/iː/', description: 'the ee sound, like tree',
    phase: 2, set: 9,
    pokemon: { id: 603, name: 'Eelektrik', evolutionLine: { stage1: { id: 602, name: 'Tynamo' }, stage2: { id: 603, name: 'Eelektrik' }, stage3: { id: 604, name: 'Eelektross' } } },
    exampleWords: { cvc: ['see', 'tree', 'feel', 'free', 'seed', 'feed', 'keen'] },
    mnemonicPhrase: 'EE is for Eelektrik! See!',
  },
  {
    id: 'igh', grapheme: 'igh', displayGrapheme: 'igh', sound: '/aɪ/', description: 'the igh sound, like night',
    phase: 2, set: 9,
    pokemon: { id: 717, name: 'Yveltal', evolutionLine: { stage1: { id: 717, name: 'Yveltal' }, stage2: { id: 717, name: 'Yveltal' }, stage3: { id: 717, name: 'Yveltal' } } },
    exampleWords: { cvc: ['high', 'night', 'light', 'right', 'sight', 'fight', 'might'] },
    mnemonicPhrase: 'IGH is for Yveltal! Night!',
  },
  {
    id: 'oa', grapheme: 'oa', displayGrapheme: 'oa', sound: '/əʊ/', description: 'the oa sound, like boat',
    phase: 2, set: 9,
    pokemon: { id: 673, name: 'Gogoat', evolutionLine: { stage1: { id: 672, name: 'Skiddo' }, stage2: { id: 673, name: 'Gogoat' }, stage3: { id: 673, name: 'Gogoat' } } },
    exampleWords: { cvc: ['boat', 'coat', 'road', 'toad', 'soap', 'goat', 'load'] },
    mnemonicPhrase: 'OA is for Gogoat! Boat!',
  },
  {
    id: 'oo', grapheme: 'oo', displayGrapheme: 'oo', sound: '/uː/', description: 'the oo sound, like moon',
    phase: 2, set: 10,
    pokemon: { id: 163, name: 'Hoothoot', evolutionLine: { stage1: { id: 163, name: 'Hoothoot' }, stage2: { id: 164, name: 'Noctowl' }, stage3: { id: 164, name: 'Noctowl' } } },
    exampleWords: { cvc: ['moon', 'food', 'too', 'cool', 'boot', 'pool', 'room'] },
    mnemonicPhrase: 'OO is for Hoothoot! Moon!',
  },
  {
    id: 'ar', grapheme: 'ar', displayGrapheme: 'ar', sound: '/ɑː/', description: 'the ar sound, like car',
    phase: 2, set: 10,
    pokemon: { id: 59, name: 'Arcanine', evolutionLine: { stage1: { id: 58, name: 'Growlithe' }, stage2: { id: 59, name: 'Arcanine' }, stage3: { id: 59, name: 'Arcanine' } } },
    exampleWords: { cvc: ['car', 'park', 'star', 'farm', 'dark', 'bark', 'card'] },
    mnemonicPhrase: 'AR is for Arcanine! Car!',
  },
  {
    id: 'or', grapheme: 'or', displayGrapheme: 'or', sound: '/ɔː/', description: 'the or sound, like for',
    phase: 2, set: 10,
    pokemon: { id: 304, name: 'Aron', evolutionLine: { stage1: { id: 304, name: 'Aron' }, stage2: { id: 305, name: 'Lairon' }, stage3: { id: 306, name: 'Aggron' } } },
    exampleWords: { cvc: ['for', 'corn', 'sort', 'fork', 'torn', 'born', 'cord'] },
    mnemonicPhrase: 'OR is for Aron! For!',
  },
  {
    id: 'ur', grapheme: 'ur', displayGrapheme: 'ur', sound: '/ɜː/', description: 'the ur sound, like burn',
    phase: 2, set: 10,
    pokemon: { id: 217, name: 'Ursaring', evolutionLine: { stage1: { id: 216, name: 'Teddiursa' }, stage2: { id: 217, name: 'Ursaring' }, stage3: { id: 901, name: 'Ursaluna' } } },
    exampleWords: { cvc: ['burn', 'turn', 'fur', 'hurt', 'surf', 'curl', 'burp'] },
    mnemonicPhrase: 'UR is for Ursaring! Burn!',
  },
  {
    id: 'ow', grapheme: 'ow', displayGrapheme: 'ow', sound: '/aʊ/', description: 'the ow sound, like cow',
    phase: 2, set: 11,
    pokemon: { id: 52, name: 'Meowth', evolutionLine: { stage1: { id: 52, name: 'Meowth' }, stage2: { id: 53, name: 'Persian' }, stage3: { id: 53, name: 'Persian' } } },
    exampleWords: { cvc: ['cow', 'now', 'town', 'how', 'down', 'owl', 'bow'] },
    mnemonicPhrase: 'OW is for Meowth! Cow!',
  },
  {
    id: 'oi', grapheme: 'oi', displayGrapheme: 'oi', sound: '/ɔɪ/', description: 'the oi sound, like coin',
    phase: 2, set: 11,
    pokemon: { id: 803, name: 'Poipole', evolutionLine: { stage1: { id: 803, name: 'Poipole' }, stage2: { id: 804, name: 'Naganadel' }, stage3: { id: 804, name: 'Naganadel' } } },
    exampleWords: { cvc: ['oil', 'coin', 'join', 'boil', 'soil', 'foil', 'coil'] },
    mnemonicPhrase: 'OI is for Poipole! Coin!',
  },
  {
    id: 'ear', grapheme: 'ear', displayGrapheme: 'ear', sound: '/ɪə/', description: 'the ear sound, like hear',
    phase: 2, set: 11,
    pokemon: { id: 585, name: 'Deerling', evolutionLine: { stage1: { id: 585, name: 'Deerling' }, stage2: { id: 586, name: 'Sawsbuck' }, stage3: { id: 586, name: 'Sawsbuck' } } },
    exampleWords: { cvc: ['hear', 'near', 'fear', 'dear', 'year', 'gear', 'tear'] },
    mnemonicPhrase: 'EAR is for Deerling! Hear!',
  },
  {
    id: 'air', grapheme: 'air', displayGrapheme: 'air', sound: '/eə/', description: 'the air sound, like fair',
    phase: 2, set: 11,
    pokemon: { id: 661, name: 'Fletchling', evolutionLine: { stage1: { id: 661, name: 'Fletchling' }, stage2: { id: 662, name: 'Fletchinder' }, stage3: { id: 663, name: 'Talonflame' } } },
    exampleWords: { cvc: ['hair', 'fair', 'pair', 'chair', 'stair', 'air'] },
    mnemonicPhrase: 'AIR is for Fletchling! Fair!',
  },
  {
    id: 'ure', grapheme: 'ure', displayGrapheme: 'ure', sound: '/ʊə/', description: 'the ure sound, like sure',
    phase: 2, set: 11,
    pokemon: { id: 183, name: 'Marill', evolutionLine: { stage1: { id: 298, name: 'Azurill' }, stage2: { id: 183, name: 'Marill' }, stage3: { id: 184, name: 'Azumarill' } } },
    exampleWords: { cvc: ['sure', 'pure', 'cure'] },
    mnemonicPhrase: 'URE is for Marill! Sure!',
  },
  {
    id: 'er', grapheme: 'er', displayGrapheme: 'er', sound: '/ə/', description: 'the er sound, like her',
    phase: 2, set: 11,
    pokemon: { id: 677, name: 'Espurr', evolutionLine: { stage1: { id: 677, name: 'Espurr' }, stage2: { id: 678, name: 'Meowstic' }, stage3: { id: 678, name: 'Meowstic' } } },
    exampleWords: { cvc: ['her', 'fern', 'term', 'herd', 'verb', 'germ'] },
    mnemonicPhrase: 'ER is for Espurr! Her!',
  },
];

export const ALL_PHONEMES: PhonemeData[] = [...PHASE_1_PHONEMES, ...PHASE_2_PHONEMES];

export function getPhonemeById(id: string): PhonemeData | undefined {
  return ALL_PHONEMES.find(p => p.id === id);
}

export function getPhonemesBySet(set: number): PhonemeData[] {
  return ALL_PHONEMES.filter(p => p.set === set);
}

export function getPhonemesByPhase(phase: 1 | 2): PhonemeData[] {
  return ALL_PHONEMES.filter(p => p.phase === phase);
}

export const TRICKY_WORDS_PHASE_1 = ['the', 'to', 'I', 'no', 'go', 'into'];
export const TRICKY_WORDS_PHASE_2 = [
  'he', 'she', 'we', 'me', 'be', 'was', 'my', 'you', 'they', 'her',
  'all', 'are', 'said', 'so', 'have', 'like', 'some', 'come', 'were',
  'there', 'little', 'one', 'do', 'when', 'out', 'what',
];
