import { getGenerationByPokemonId, capitalize } from "../utils/helpers.js";

const TYPE_TRANSLATIONS = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  electric: "Electrico",
  grass: "Planta",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psiquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragon",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada",
};

async function getRandomPokemon() {
  try {
    const maxPokemon = 1025;
    const randomId = Math.floor(Math.random() * maxPokemon) + 1;

    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${randomId}`
    );
    if (!response.ok) {
      throw new Error("Error al obtener el Pokémon");
    }

    const pokemon = await response.json();
    const speciesData = await fetchPokemonSpecies(pokemon.species.url);

    return {
      id: pokemon.id,
      name: pokemon.name,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
      types: pokemon.types.map(
        (t) => TYPE_TRANSLATIONS[t.type.name] || capitalize(t.type.name)
      ),
      color: speciesData.color?.name || "desconocido",
      habitat: speciesData.habitat?.name || "desconocido",
      generation: getGenerationByPokemonId(pokemon.id),
      evolutionStage: speciesData.evolves_from_species ? 2 : 1,
      fullyEvolved:
        !speciesData.evolves_into_species ||
        speciesData.evolves_into_species.length === 0,
    };
  } catch (error) {
    console.error("Error obteniendo Pokémon aleatorio:", error);
    return null;
  }
}

async function fetchPokemonSpecies(speciesUrl) {
  const response = await fetch(speciesUrl);
  if (!response.ok) {
    throw new Error("Error al obtener datos de especie");
  }
  return await response.json();
}

export { getRandomPokemon };
