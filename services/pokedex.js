import { capitalize } from "../utils/helpers.js";

const API_URL = "https://pokeapi.co/api/v2/pokemon";
const REGION_MAP = {
  kanto: { start: 1, end: 151 },
  johto: { start: 152, end: 251 },
  hoenn: { start: 252, end: 386 },
  sinnoh: { start: 387, end: 493 },
  unova: { start: 494, end: 649 },
  kalos: { start: 650, end: 721 },
  alola: { start: 722, end: 809 },
  galar: { start: 810, end: 898 },
  paldea: { start: 899, end: 1010 },
};

const TYPE_COLORS = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

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

let currentPage = 1;
const pageSize = 15;
let allPokemon = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchAllPokemon();
});

async function fetchAllPokemon() {
  try {
    const response = await fetch(`${API_URL}?limit=1010`);
    const data = await response.json();
    allPokemon = data.results.map((pokemon, index) => ({
      name: pokemon.name,
      id: index + 1,
      url: pokemon.url,
    }));
    displayPokemon();
  } catch (error) {
    console.error("Error al obtener los Pokémon:", error);
  }
}

function displayPokemon(region = "all") {
  let filteredPokemon = [...allPokemon];

  if (region !== "all") {
    const { start, end } = REGION_MAP[region];
    filteredPokemon = allPokemon.filter(
      (pokemon) => pokemon.id >= start && pokemon.id <= end
    );
  }

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pokemonToDisplay = filteredPokemon.slice(start, end);

  const pokemonList = document.getElementById("pokemon-list");
  pokemonList.innerHTML = "";

  pokemonToDisplay.forEach((pokemon) => {
    const pokemonCard = document.createElement("div");
    pokemonCard.classList.add("pokemon-card");
    pokemonCard.innerHTML = `
              <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                pokemon.id
              }.png" alt="${pokemon.name}">
              <p class="pokemon-name-list">#${pokemon.id} ${capitalize(
      pokemon.name
    )}</p>
          `;

    pokemonCard.addEventListener("click", () =>
      fetchPokemonDetails(pokemon.id)
    );

    pokemonList.appendChild(pokemonCard);
  });

  updatePagination(filteredPokemon.length);
}

async function fetchPokemonDetails(pokemonId) {
  try {
    const response = await fetch(`${API_URL}/${pokemonId}`);
    const data = await response.json();

    document.getElementById("pokemon-image").innerHTML = `
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png" alt="${data.name}">
      `;

    document.getElementById("pokemon-name").textContent = capitalize(data.name);

    const speciesResponse = await fetch(data.species.url);
    const speciesData = await speciesResponse.json();
    const descriptionEntry = speciesData.flavor_text_entries.find(
      (entry) => entry.language.name === "es"
    );

    document.getElementById("pokemon-description").textContent =
      descriptionEntry
        ? descriptionEntry.flavor_text
        : "Descripcion no disponible.";

    const typeContainer = document.createElement("div");
    typeContainer.id = "pokemon-types";

    data.types.forEach((typeInfo) => {
      const typeName = typeInfo.type.name;
      const translatedType =
        TYPE_TRANSLATIONS[typeName] || capitalize(typeName);
      const typeBadge = document.createElement("span");
      typeBadge.classList.add("type-badge");
      typeBadge.style.backgroundColor = TYPE_COLORS[typeName] || "#777";
      typeBadge.textContent = translatedType;
      typeContainer.appendChild(typeBadge);
    });

    const existingTypes = document.getElementById("pokemon-types");
    if (existingTypes) {
      existingTypes.replaceWith(typeContainer);
    } else {
      document.getElementById("pokemon-detail").appendChild(typeContainer);
    }
  } catch (error) {
    console.error("Error al obtener detalles del Pokémon:", error);
  }
}

export function filterByZone() {
  const selectedZone = document.getElementById("regions").value;
  currentPage = 1;
  displayPokemon(selectedZone);
}

export function changePage(step) {
  currentPage += step;
  const selectedZone = document.getElementById("regions").value;
  displayPokemon(selectedZone);
}

function updatePagination(totalItems) {
  document.getElementById("page-number").textContent = currentPage;
  document.getElementById("prev-page").disabled = currentPage === 1;
  document.getElementById("next-page").disabled =
    currentPage * pageSize >= totalItems;
}

export async function showPokemonDetail(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const data = await response.json();

    const speciesResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${id}/`
    );
    const speciesData = await speciesResponse.json();

    const descriptionEntry = speciesData.flavor_text_entries.find(
      (entry) => entry.language.name === "es"
    );
    const description = descriptionEntry
      ? descriptionEntry.flavor_text
      : "Descripcion no disponible.";

    const types = data.types
      .map((type) => capitalize(type.type.name))
      .join(", ");

    document.getElementById("pokemon-image").innerHTML = `
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png" alt="${data.name}" id="pokemon-selected-img">
    `;
    document.getElementById("pokemon-name").textContent = `#${id} ${capitalize(
      data.name
    )}`;
    document.getElementById(
      "pokemon-description"
    ).textContent = `Tipo: ${types}\n${description}`;
  } catch (error) {
    console.error("Error al obtener los detalles del Pokémon:", error);
  }
}

window.filterByZone = filterByZone;
window.changePage = changePage;