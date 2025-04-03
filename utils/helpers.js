function getGenerationByPokemonId(pokemonId) {
  const generations = [
    { start: 1, end: 151, gen: "1" },
    { start: 152, end: 251, gen: "2" },
    { start: 252, end: 386, gen: "3" },
    { start: 387, end: 493, gen: "4" },
    { start: 494, end: 649, gen: "5" },
    { start: 650, end: 721, gen: "6" },
    { start: 722, end: 809, gen: "7" },
    { start: 810, end: 905, gen: "8" },
    { start: 906, end: 1025, gen: "9" },
  ];

  const gen = generations.find(
    (g) => pokemonId >= g.start && pokemonId <= g.end
  );
  return gen ? gen.gen : "?";
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

export { getGenerationByPokemonId, capitalize };
