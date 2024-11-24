document.addEventListener("DOMContentLoaded", () => {
  const map = L.map('map', {
    minZoom: 6,
    maxZoom: 18
  }).setView([-14.8615, -40.8448], 10);

  // Carregar crimes do DB
  loadCrimesFromDb();

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  const bounds = [
    [-18.500, -46.000],
    [-8.000, -37.000]
  ];
  map.setMaxBounds(bounds);

  // Tentar usar a geolocalização do usuário
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 13);

        // Adicionar marcador na localização do usuário
        L.marker([latitude, longitude], {
          icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [0, -30],
          }),
        })
          .addTo(map)
          .bindPopup("Você está aqui.")
          .openPopup();
      },
      (error) => {
        console.warn("Geolocalização não permitida ou não disponível. Carregando localização padrão.");
        map.setView(defaultLocation, 13);
      }
    );
  } else {
    console.warn("Geolocalização não suportada pelo navegador. Carregando localização padrão.");
    map.setView(defaultLocation, 13);
  }

  // Variável para armazenar o local selecionado
  let selectedLatLng = null;

  // Ícones personalizados
  const icons = {
    assalto: L.icon({
      iconUrl: 'https://img.icons8.com/?size=100&id=Tzf2oaGSBJAq&format=png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    }),
    roubo: L.icon({
      iconUrl: 'https://img.icons8.com/?size=100&id=8785&format=png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    }),
    assedio: L.icon({
      iconUrl: 'https://img.icons8.com/?size=100&id=lVDdsOR58ZVt&format=png&color=000000',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    }),
    racismo: L.icon({
      iconUrl: 'https://img.icons8.com/?size=100&id=8992&format=png&color=000000',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    }),
  };

  // Modal e interações
  const modal = document.getElementById("crime-modal");
  const openModalBtn = document.getElementById("report-crime-btn");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const form = document.getElementById("crime-form");
  const selectLocationBtn = document.getElementById("select-location-btn");
  const selectedLocationText = document.getElementById("selected-location");
  const crimeTypeSelect = document.getElementById("crime-type");
  const crimeIconPreview = document.getElementById("crime-icon-preview");

  // Abrir modal
  openModalBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  // Fechar modal
  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    form.reset(); // Limpar formulário
    crimeIconPreview.src = "https://img.icons8.com/?size=100&id=Tzf2oaGSBJAq&format=png";
    selectedLatLng = null; // Resetar seleção de local
    selectedLocationText.textContent = "Nenhum local selecionado";
  });

  // Atualizar ícone ao alterar tipo de crime
  crimeTypeSelect.addEventListener("change", () => {
    const selectedOption = crimeTypeSelect.value;
    const iconUrl = icons[selectedOption]?.options.iconUrl || "";
    crimeIconPreview.src = iconUrl;
  });

  // Selecionar localização no mapa
  selectLocationBtn.addEventListener("click", () => {
    //alert("Clique no mapa para selecionar o local.");

    // Ocultar modal temporariamente para permitir o clique no mapa
    modal.classList.add("hidden");

    // Adicionar classe ao mapa para alterar o cursor
    map.getContainer().classList.add("map-pin-cursor");

    // Ativar evento de clique no mapa para escolher localização
    const onMapClick = (e) => {
      selectedLatLng = e.latlng;
      selectedLocationText.textContent = `Local Selecionado: ${selectedLatLng.lat.toFixed(4)}, ${selectedLatLng.lng.toFixed(4)}`;
      map.off("click", onMapClick); // Remover o evento após selecionar

      // Reabrir modal após selecionar o local
      modal.classList.remove("hidden");

      // Remover a classe de cursor personalizado após a seleção
      map.getContainer().classList.remove("map-pin-cursor");
    };

    map.on("click", onMapClick);
  });

  // Adicionar relato ao mapa com círculo
  document.querySelector('.btn.btn-success').addEventListener("click", async (e) => {
    e.preventDefault();

    if (!selectedLatLng) {
      alert("Por favor, selecione um local no mapa.");
      return;
    }

    const tipo = crimeTypeSelect.value;
    const detalhes = document.getElementById("crime-details").value;
    const dateTime = document.getElementById("crime-date-time").value;

    // Configurar ícone do crime
    const crimeIconToUse = icons[tipo];

    // Adicionar título do crime
    let crimeTitle;
    if (tipo === "assalto") {
      crimeTitle = "Assalto";
    } else if (tipo === "roubo") {
      crimeTitle = "Roubo";
    } else if (tipo === "assedio") {
      crimeTitle = "Assédio";
    } else if (tipo === "racismo") {
      crimeTitle = "Racismo";
    }

    // Criar dados do crime
    const crimeData = {
      tipo: tipo,
      detalhes: detalhes,
      dateTime: dateTime,
      latitude: selectedLatLng.lat,
      longitude: selectedLatLng.lng,
    };

    // Criar conteúdo do popup
    const popupContent = `
    <div>
        <h3>${crimeTitle}</h3>
        <p><strong>Detalhes:</strong> ${detalhes}</p>
        <p><strong>Data e Hora:</strong> ${new Date(dateTime).toLocaleString()}</p>
        <p><strong>Local:</strong> ${selectedLatLng.lat.toFixed(4)}, ${selectedLatLng.lng.toFixed(4)}</p>
    </div>
  `;

    // Adicionar marcador no mapa
    const marker = L.marker([selectedLatLng.lat, selectedLatLng.lng], { icon: crimeIconToUse })
      .addTo(map)
      .bindPopup(popupContent);

    // Adicionar círculo em torno do marcador
    const circle = L.circle([selectedLatLng.lat, selectedLatLng.lng], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.3,
      radius: 200 // Raio em metros
    }).addTo(map);

    // Sincronizar abertura de popup com o círculo
    marker.on('click', () => {
      // Configurar o nível de zoom desejado e o tempo de transição
      const zoomLevel = 16; // Nível de zoom ao clicar no marcador
      const zoomDuration = 800; // Duração da animação em milissegundos

      // Animar o zoom
      map.flyTo(marker.getLatLng(), zoomLevel, {
        animate: true,
        duration: zoomDuration / 1000 // Conversão para segundos
      });

      // Abrir o popup após o zoom com atraso
      setTimeout(() => {
        marker.openPopup();
      }, zoomDuration);
    });

    await saveCrimeToDb(crimeData);

    // Limpar formulário e fechar modal
    form.reset();
    crimeIconPreview.src = "https://img.icons8.com/?size=100&id=Tzf2oaGSBJAq&format=png";
    selectedLocationText.textContent = "Nenhum local selecionado";
    selectedLatLng = null;
    modal.classList.add("hidden");
  });

  // Configurar a busca de cidade
  const searchBar = document.getElementById("search-bar");
  const filterBtn = document.getElementById("filter-btn");

  // Função para buscar coordenadas usando a API Nominatim
  async function searchCity(cityName) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`
      );
      const results = await response.json();

      if (results.length > 0) {
        const { lat, lon } = results[0]; // Pega as coordenadas do primeiro resultado
        return { lat: parseFloat(lat), lon: parseFloat(lon) };
      } else {
        alert("Cidade não encontrada. Tente novamente.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar a cidade:", error);
      alert("Erro ao buscar a cidade. Tente novamente mais tarde.");
      return null;
    }
  }

  const suggestionsList = document.getElementById("suggestions-list");

  // Função para buscar sugestões da API Nominatim restrita a cidades na Bahia
  async function getSuggestions(query) {
    try {
      const viewbox = "-46.00,-8.00,-37.00,-18.50"; // Limites da Bahia (lon1, lat1, lon2, lat2)
      const bounded = 1; // Restringir a busca ao viewbox
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&viewbox=${viewbox}&bounded=${bounded}`
      );
      const results = await response.json();

      // Processar resultados para cidade, estado e CEP
      return results
        .filter(result => {
          // Filtrar apenas lugares administrativos (cidade, estado) e CEPs
          return (
            result.type === "administrative" || // Cidades e estados
            result.class === "place" || // Outros lugares
            result.type === "postcode" // CEPs
          );
        })
        .map(result => ({
          name: result.display_name, // Nome completo (cidade, estado ou CEP)
          type: result.type === "postcode" ? "CEP" : result.type, // Identifica se é cidade, estado ou CEP
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
        }))
        .filter((item, index, self) =>
          index === self.findIndex(other => other.name === item.name) // Remove duplicados
        );
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
      return [];
    }
  }

  async function updateSuggestions() {
    const query = searchBar.value.trim();
    if (query.length < 3) {
      suggestionsList.classList.add("hidden");
      return;
    }

    const suggestions = await getSuggestions(query);
    suggestionsList.innerHTML = "";

    if (suggestions.length > 0) {
      suggestions.forEach(suggestion => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${suggestion.name}</strong> <em>(${suggestion.type})</em>`; // Exibe nome e tipo
        li.dataset.lat = suggestion.lat;
        li.dataset.lon = suggestion.lon;

        // Adicionar evento de clique para selecionar a sugestão
        li.addEventListener("click", () => {
          map.setView([suggestion.lat, suggestion.lon], 13); // Centralizar no local
          searchBar.value = suggestion.name; // Atualizar o campo de busca
          suggestionsList.classList.add("hidden"); // Esconder a lista
        });

        suggestionsList.appendChild(li);
      });

      suggestionsList.classList.remove("hidden");
    } else {
      suggestionsList.classList.add("hidden");
    }
  }

  // Adicionar evento ao campo de entrada
  searchBar.addEventListener("input", updateSuggestions);

  // Esconder a lista de sugestões ao clicar fora
  document.addEventListener("click", (e) => {
    if (!searchBar.contains(e.target) && !suggestionsList.contains(e.target)) {
      suggestionsList.classList.add("hidden");
    }
  });

  // Permitir busca ao pressionar Enter
  searchBar.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      const query = searchBar.value.trim();
      const suggestions = await getSuggestions(query);
      if (suggestions.length > 0) {
        const firstSuggestion = suggestions[0];
        map.setView([firstSuggestion.lat, firstSuggestion.lon], 13);
        suggestionsList.classList.add("hidden");
      }
    }
  });

  async function saveCrimeToDb(crimeData) {
    try {
      const response = await fetch('http://localhost:3000/markers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(crimeData),
      });
      const data = await response.json();
    } catch (error) {
      console.error("Erro ao salvar o crime:", error);
    }
  }

  async function loadCrimesFromDb() {
    try {
      const response = await fetch('http://localhost:3000/markers');
      const crimes = await response.json();
      crimes.forEach(crime => {
        const crimeIconToUse = icons[crime.tipo];
        const popupContent = `

          <div>
            <h3>${crime.tipo}</h3>
            <p><strong>Detalhes:</strong> ${crime.detalhes}</p>
            <p><strong>Data e Hora:</strong> ${new Date(crime.dateTime).toLocaleString()}</p>
            <p><strong>Local:</strong> ${crime.latitude.toFixed(4)}, ${crime.longitude.toFixed(4)}</p>
          </div>
        `;

        const circle = L.circle([crime.latitude, crime.longitude], {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.3,
          radius: 200 // Raio em metros
        }).addTo(map);


        const marker = L.marker([crime.latitude, crime.longitude], { icon: crimeIconToUse })
          .addTo(map)
          .bindPopup(popupContent)


      });
    } catch (error) {
      console.error("Erro ao carregar os crimes:", error);
    }
  }

  // Botão de filtro também faz a busca
  filterBtn.addEventListener("click", async () => {
    const query = searchBar.value.trim();
    const suggestions = await getSuggestions(query);
    if (suggestions.length > 0) {
      const firstSuggestion = suggestions[0];
      map.setView([firstSuggestion.lat, firstSuggestion.lon], 13);
      suggestionsList.classList.add("hidden");
    }
  });
  const regionBtn = document.getElementById("regiao-btn");

  regionBtn.addEventListener("click", () => {
    // Verificar se o navegador suporta geolocalização
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador.");
      return;
    }

    // Obter localização do usuário
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Centralizar o mapa na localização do usuário com zoom 13
        map.setView([latitude, longitude], 13);

        // Adicionar um marcador vermelho na localização
        const marker = L.marker([latitude, longitude], {
          icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41], // Tamanho do ícone
            iconAnchor: [12, 41], // Ponto de ancoragem do ícone
            popupAnchor: [0, -30], // Onde o popup aparece
            iconColor: 'red',
          }),
        })
          .addTo(map)
          .bindPopup("Você está aqui.")
          .openPopup(); // Abre o popup imediatamente
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
        alert("Não foi possível obter sua localização.");
      }
    );
  });
});