import { getGenerationByPokemonId, capitalize } from "../utils/helpers.js";
import { getRandomPokemon } from "../utils/randomizer.js";

document.addEventListener("DOMContentLoaded", function () {
  const loader = document.getElementById("loader");
  const gameContent = document.getElementById("gameContent");

  if (loader && gameContent) {
    loader.style.display = "flex";
    gameContent.style.display = "none";
  } else {
    console.error("No se encontraron los elementos loader o gameContent");
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const input = document.getElementById("pokemonInput");
  const suggestions = document.getElementById("suggestions");
  const guessButton = document.getElementById("confirmPokemon");
  const guessesContainer = document.getElementById("guessesContainer");
  const gameInfo = document.getElementById("gameInfo");
  const pokemonInfo = document.getElementById("pokemonInfo");
  
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

  if (!input || !suggestions || !guessButton || !guessesContainer) {
    console.error("Elementos esenciales no encontrados en el DOM.");
    return;
  }

  let allPokemon = [];
  let chosenPokemon = null;
  let attempts = 0;
  const maxAttempts = 12;
  let gameOver = false;

  async function initGame() {
    try {
      console.log("Inicializando juego...");
      await loadPokemon();
      await selectRandomPokemon();
      console.log("Juego listo. Pokémon oculto:", chosenPokemon.name);

      input.disabled = false;
      guessButton.disabled = false;
    } catch (error) {
      console.error("Error al inicializar el juego:", error);
      alert(
        "Ocurrió un error al cargar el juego. Por favor recarga la página."
      );
    }
  }

  async function loadPokemon() {
    try {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=649"
      );
      if (!response.ok) throw new Error("Error en la respuesta de la API");

      const data = await response.json();

      if (!data.results || !Array.isArray(data.results)) {
        throw new Error("Formato de datos inesperado");
      }

      const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon, index) => {
          try {
            const pokemonId = index + 1;
            const detailsResponse = await fetch(pokemon.url);
            if (!detailsResponse.ok) return null;
            const details = await detailsResponse.json();

            const speciesResponse = await fetch(details.species.url);
            if (!speciesResponse.ok) return null;
            const species = await speciesResponse.json();

            return {
              id: pokemonId,
              name: pokemon.name,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
              types:
                details.types?.map(
                  (t) =>
                    TYPE_TRANSLATIONS[t.type.name] || capitalize(t.type.name)
                ) || [],
              evolutionStage: species.evolves_from_species ? 2 : 1,
              fullyEvolved:
                !species.evolves_into_species ||
                species.evolves_into_species.length === 0,
              color: species.color?.name || "desconocido",
              habitat: species.habitat?.name || "desconocido",
              generation: getGenerationByPokemonId(pokemonId),
              generation_api: species.generation?.name.match(/\d+/)?.[0] || "?",
            };
          } catch (error) {
            console.error(`Error cargando ${pokemon.name}:`, error);
            return null;
          }
        })
      );

      allPokemon = pokemonDetails.filter((p) => p !== null);

      if (allPokemon.length === 0) {
        throw new Error("No se pudieron cargar datos de Pokémon");
      }

      console.log("Pokémon cargados:", allPokemon.length);
      console.log("Ejemplo de Pokémon:", allPokemon[0]);
    } catch (error) {
      console.error("Error crítico al cargar Pokémon:", error);
      throw error;
    }
  }

  async function selectRandomPokemon() {
    try {
      chosenPokemon = await getRandomPokemon();
      if (!chosenPokemon) {
        throw new Error("No se pudo seleccionar un Pokémon válido");
      }
      console.log("Pokémon oculto seleccionado:", chosenPokemon.name);
    } catch (error) {
      console.error("Error al seleccionar Pokémon aleatorio:", error);
      throw error;
    }
  }

  input.addEventListener("input", async () => {
    const query = input.value.toLowerCase().trim();
    suggestions.innerHTML = "";

    if (allPokemon.length === 0) {
      await loadPokemon();
    }

    if (query.length < 2) {
      suggestions.style.display = "none";
      return;
    }

    const normalize = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedQuery = normalize(query);

    const filtered = allPokemon
      .filter((pokemon) => normalize(pokemon.name).includes(normalizedQuery))
      .slice(0, 8);

    if (filtered.length === 0) {
      const noResults = document.createElement("div");
      noResults.textContent = "No se encontraron Pokémon";
      noResults.style.padding = "5px";
      suggestions.appendChild(noResults);
      suggestions.style.display = "block";
      return;
    }

    filtered.forEach((pokemon) => {
      const div = document.createElement("div");
      div.classList.add("suggestion-item");

      const img = document.createElement("img");
      img.src = pokemon.image;
      img.alt = pokemon.name;
      img.width = 50;
      img.height = 50;

      const name = document.createElement("span");
      name.textContent = pokemon.name;

      div.appendChild(img);
      div.appendChild(name);
      div.addEventListener("click", () => {
        input.value = pokemon.name;
        suggestions.innerHTML = "";
        suggestions.style.display = "none";
        input.focus();
      });

      suggestions.appendChild(div);
    });

    suggestions.style.display = "block";
  });

  document.addEventListener("click", (e) => {
    if (e.target !== input && !suggestions.contains(e.target)) {
      suggestions.style.display = "none";
    }
  });

  guessButton.addEventListener("click", async () => {
    if (gameOver) return;

    const selectedName = input.value.toLowerCase().trim();
    if (!selectedName) {
      alert("Por favor escribe un nombre de Pokémon");
      return;
    }

    const selectedPokemon = allPokemon.find((p) => p.name === selectedName);
    if (!selectedPokemon) {
      alert(
        "Pokémon no encontrado. Usa las sugerencias para seleccionar uno válido."
      );
      return;
    }

    attempts++;
    input.value = "";
    suggestions.innerHTML = "";

    const comparison = comparePokemon(selectedPokemon, chosenPokemon);
    displayGuessResult(selectedPokemon, comparison);

    if (selectedName === chosenPokemon.name) {
      gameOver = true;
      setTimeout(() => {
        alert(`¡Felicidades! Adivinaste el Pokémon en ${attempts} intentos.`);
        revealPokemon();
      }, 500);
      return;
    }

    if (attempts >= maxAttempts) {
      gameOver = true;
      setTimeout(() => {
        alert(
          `¡Se acabaron los intentos! El Pokémon era ${chosenPokemon.name}.`
        );
        revealPokemon();
      }, 500);
    }
  });

  function comparePokemon(guess, target) {
    return {
      name: guess.name === target.name,
      types: {
        type1: guess.types[0] === target.types[0],
        type2: (guess.types[1] || null) === (target.types[1] || null),
      },
      evolutionStage: guess.evolutionStage === target.evolutionStage,
      fullyEvolved: guess.fullyEvolved === target.fullyEvolved,
      color: guess.color === target.color,
      habitat: guess.habitat === target.habitat,
      generation: guess.generation === target.generation,
    };
  }

  function displayGuessResult(pokemon, comparison) {
    const attemptContainer = document.createElement("div");
    attemptContainer.className = "attempt-container";

    const attributes = [
      {
        name: "Pokémon",
        value: pokemon.name,
        status: comparison.name ? "correct" : "incorrect",
        image: pokemon.image,
      },
      {
        name: "Tipo 1",
        value: pokemon.types[0],
        status: comparison.types.type1 ? "correct" : "incorrect",
      },
      {
        name: "Tipo 2",
        value: pokemon.types[1] || "Ninguno",
        status: comparison.types.type2
          ? "correct"
          : pokemon.types[1] && chosenPokemon.types[1]
          ? "partial"
          : "incorrect",
      },
      {
        name: "Etapa",
        value: pokemon.evolutionStage,
        status: comparison.evolutionStage ? "correct" : "incorrect",
      },
      {
        name: "Evolución",
        value: pokemon.fullyEvolved ? "Sí" : "No",
        status: comparison.fullyEvolved ? "correct" : "incorrect",
      },
      {
        name: "Color",
        value: pokemon.color,
        status: comparison.color ? "correct" : "incorrect",
      },
      {
        name: "Hábitat",
        value: pokemon.habitat,
        status: comparison.habitat ? "correct" : "incorrect",
      },
      {
        name: "Generación",
        value: pokemon.generation,
        status: comparison.generation ? "correct" : "incorrect",
      },
    ];

    attributes.forEach((attr) => {
      const card = document.createElement("div");
      card.className = `attribute-card ${attr.status} animated`;

      if (attr.image) {
        const img = document.createElement("img");
        img.src = attr.image;
        img.alt = attr.value;
        card.appendChild(img);
      } else {
        card.textContent = attr.value;
      }

      attemptContainer.appendChild(card);
    });

    guessesContainer.insertBefore(
      attemptContainer,
      guessesContainer.firstChild
    );
  }

  function revealPokemon() {
    gameInfo.style.display = "block";
    pokemonInfo.innerHTML = `
      <div style="text-align: center;">
        <img src="${chosenPokemon.image}" width="200" height="200" />
        <h3>${chosenPokemon.name}</h3>
      </div>
      <p><strong>Tipo Primario:</strong> ${chosenPokemon.types[0]}</p>
      <p><strong>Tipo Secundario:</strong> ${
        chosenPokemon.types[1] || "Ninguno"
      }</p>
      <p><strong>Etapa de Evolución:</strong> ${
        chosenPokemon.evolutionStage
      }</p>
      <p><strong>Totalmente Evolucionado:</strong> ${
        chosenPokemon.fullyEvolved ? "Sí" : "No"
      }</p>
      <p><strong>Color:</strong> ${chosenPokemon.color}</p>
      <p><strong>Hábitat:</strong> ${chosenPokemon.habitat}</p>
      <p><strong>Generación:</strong> ${chosenPokemon.generation}</p>
    `;
  }

  try {
    await initGame();
    
    loader.style.display = "none";
    gameContent.style.display = "block";
    
  } catch (error) {
    loader.innerHTML = `
      <p class="loader-text" style="color: #ff3333;">
        Error al cargar el juego. 
        <button onclick="window.location.reload()">Reintentar</button>
      </p>
    `;
    console.error("Error inicializando el juego:", error);
  }
});
