document.addEventListener("DOMContentLoaded", () => {
  const map = L.map('map', {
    minZoom: 6,
    maxZoom: 18
  }).setView([-12.9714, -38.5014], 8);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap & CartoDB contributors',
    subdomains: 'abcd',
    maxZoom: 18
  }).addTo(map);

  const bounds = [
    [-18.500, -46.000],
    [-8.000, -37.000]
  ];
  map.setMaxBounds(bounds);

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
    })
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

  // Adicionar relato ao mapa
  form.addEventListener("submit", (e) => {
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

    // Adicionar marcador no mapa
    let crimeTitle;
    if (tipo === "assalto") {
      crimeTitle = "Assalto";
    } else if (tipo === "roubo") {
      crimeTitle = "Roubo";
    } else if (tipo === "assedio") {
      crimeTitle = "Assédio";
    }

    const popupContent = `
    <div>
        <h3>${crimeTitle}</h3>
        <p><strong>Detalhes:</strong> ${detalhes}</p>
        <p><strong>Data e Hora:</strong> ${new Date(dateTime).toLocaleString()}</p>
        <p><strong>Local:</strong> ${selectedLatLng.lat.toFixed(4)}, ${selectedLatLng.lng.toFixed(4)}</p>
    </div>
`;

    L.marker([selectedLatLng.lat, selectedLatLng.lng], { icon: crimeIconToUse })
      .addTo(map)
      .bindPopup(popupContent);

    // Limpar formulário e fechar modal
    form.reset();
    selectedLocationText.textContent = "Nenhum local selecionado";
    selectedLatLng = null;
    modal.classList.add("hidden");
  });
});