import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showAdoptionForm, setShowAdoptionForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const [filter, setFilter] = useState({ species: "", age: "", gender: "", search: "" });
  const [page, setPage] = useState(1);

  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // Carrega os animais do backend
  useEffect(() => {
    fetchAnimals();
  }, []);

  async function fetchAnimals(pageNumber = 1) {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/pets?limit=5&page=${pageNumber}`);
      const data = await res.json();
      setAnimals((prev) => [...prev, ...data]);
      setPage(pageNumber);
    } catch (error) {
      console.error("Erro ao buscar animais:", error);
    } finally {
      setLoading(false);
    }
  }

  function loadMore() {
    fetchAnimals(page + 1);
  }

  function handleInputChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleFilterChange(e) {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  }

  function toggleFavorite(pet) {
    const isFav = favorites.find((f) => f.id === pet.id);
    if (isFav) setFavorites(favorites.filter((f) => f.id !== pet.id));
    else setFavorites([...favorites, pet]);
  }

  // Aplica filtros
  const filteredAnimals = animals.filter((a) => {
    return (
      (filter.species === "" || a.species.toLowerCase() === filter.species.toLowerCase()) &&
      (filter.age === "" || a.age.toLowerCase() === filter.age.toLowerCase()) &&
      (filter.gender === "" || a.gender.toLowerCase() === filter.gender.toLowerCase()) &&
      (filter.search === "" || a.name.toLowerCase().includes(filter.search.toLowerCase()))
    );
  });

  // Escolhe o que será exibido: favoritos ou lista filtrada
  const displayedAnimals = showFavorites ? favorites : filteredAnimals;

  return (
    <div className="container">
      <h1 className="title">🐾 PetConnect - Adoção de Animais</h1>

      {/* Barra de abas */}
      <div className="tabs">
        <button onClick={() => setShowFavorites(false)}>Todos</button>
        <button onClick={() => setShowFavorites(true)}>
          Favoritos ({favorites.length})
        </button>
      </div>

      {/* Filtros */}
      {!showFavorites && (
        <div className="filters">
          <input
            type="text"
            name="search"
            placeholder="Buscar por nome"
            value={filter.search}
            onChange={handleFilterChange}
          />
          <select name="species" value={filter.species} onChange={handleFilterChange}>
            <option value="">Todas as espécies</option>
            <option value="Dog">Cachorro</option>
            <option value="Cat">Gato</option>
          </select>
          <select name="age" value={filter.age} onChange={handleFilterChange}>
            <option value="">Todas as idades</option>
            <option value="Baby">Filhote</option>
            <option value="Young">Jovem</option>
            <option value="Adult">Adulto</option>
            <option value="Senior">Idoso</option>
          </select>
          <select name="gender" value={filter.gender} onChange={handleFilterChange}>
            <option value="">Qualquer gênero</option>
            <option value="Male">Macho</option>
            <option value="Female">Fêmea</option>
          </select>
          <button
            className="clear-button"
            onClick={() => setFilter({ species: "", age: "", gender: "", search: "" })}
          >
            Limpar filtros
          </button>
        </div>
      )}

      {loading && <p className="loading">Carregando...</p>}
      {displayedAnimals.length === 0 && !loading && (
        <p className="loading">Nenhum animal encontrado.</p>
      )}

      {/* Lista de animais */}
      <ul className="animal-list">
        {displayedAnimals.map((a) => (
          <li key={a.id} className="animal-card">
            {a.photos?.[0] && (
              <div className="image-wrapper">
                <img src={a.photos[0].medium} alt={a.name} className="animal-photo" />
              </div>
            )}
            <div className="animal-info">
              <h2 className="animal-name">{a.name}</h2>
              <p className="animal-species">{a.species}</p>

              <div className="buttons">
                <button
                  className={`favorite-btn ${
                    favorites.find((f) => f.id === a.id) ? "favorited" : ""
                  }`}
                  onClick={() => toggleFavorite(a)}
                >
                  ❤️
                </button>
                <button
                  className="details-button"
                  onClick={() => {
                    setSelectedPet(a);
                    setShowAdoptionForm(false);
                  }}
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {!showFavorites && filteredAnimals.length >= 5 && (
        <button className="show-more-button" onClick={loadMore}>
          Mostrar Mais
        </button>
      )}

      {/* Modal de detalhes do pet */}
      {selectedPet && (
        <div className="modal-overlay" onClick={() => setSelectedPet(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedPet.name}</h2>
            <p><strong>Espécie:</strong> {selectedPet.species}</p>
            {selectedPet.breeds?.primary && <p><strong>Raça:</strong> {selectedPet.breeds.primary}</p>}
            {selectedPet.age && <p><strong>Idade:</strong> {selectedPet.age}</p>}
            {selectedPet.gender && <p><strong>Gênero:</strong> {selectedPet.gender}</p>}
            {selectedPet.contact && (
              <>
                {selectedPet.contact.phone && <p><strong>Telefone:</strong> {selectedPet.contact.phone}</p>}
                {selectedPet.contact.email && <p><strong>Email:</strong> {selectedPet.contact.email}</p>}
                {(selectedPet.contact.address?.city || selectedPet.contact.address?.state) && (
                  <p><strong>Cidade/Estado:</strong> {selectedPet.contact.address.city || "-"}, {selectedPet.contact.address.state || "-"}</p>
                )}
              </>
            )}
            {selectedPet.photos?.[0] && <img src={selectedPet.photos[0].medium} alt={selectedPet.name} className="modal-photo" />}

            {!showAdoptionForm ? (
              <button className="adopt-button" onClick={() => {setShowAdoptionForm(true); setFormData({ name: "", email: "", message: "" }); setSubmitted(false);}}>Adotar</button>
            ) : (
              <form className="adoption-form" onSubmit={handleSubmit}>
                <h3>Formulário de Adoção</h3>
                <input type="text" name="name" placeholder="Seu nome" value={formData.name} onChange={handleInputChange} required />
                <input type="email" name="email" placeholder="Seu email" value={formData.email} onChange={handleInputChange} required />
                <textarea name="message" placeholder="Mensagem" value={formData.message} onChange={handleInputChange} rows="4" required />
                <button type="submit">Enviar</button>
                {submitted && <p className="success-msg">Formulário enviado com sucesso!</p>}
              </form>
            )}

            <button className="close-button" onClick={() => setSelectedPet(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
