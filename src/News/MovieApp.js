import React, { useEffect, useState } from 'react';
import axios from 'axios';
import YouTube from 'react-youtube';
import "./MovieApp.css"; // Asegúrate de que la ruta sea correcta

const API_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'f7105901c26d6c46da4af30a3098ea22';
const URL_IMAGE = 'https://image.tmdb.org/t/p/original';

const MovieApp = () => {
  // Variables de estado
  const [movies, setMovies] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [error, setError] = useState(null);
  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [playing, setPlaying] = useState(false);

  // Función para realizar la petición GET a la API y obtener las películas
  const fetchMovies = async (searchKey = "") => {
    const type = searchKey ? "search" : "discover";
    try {
      const { data: { results } } = await axios.get(`${API_URL}/${type}/movie`, {
        params: {
          api_key: API_KEY,
          query: searchKey,
        },
      });

      if (results.length === 0) {
        setError('No se encontraron películas.');
      } else {
        setError(null);
        setMovies(results);
        if (results.length) {
          await fetchMovie(results[0].id); // Obtener detalles de la primera película en la lista
        }
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError('Hubo un error al buscar las películas.');
    }
  };

  // Función para obtener los detalles de una película y mostrar el reproductor de video
  const fetchMovie = async (id) => {
    try {
      const { data } = await axios.get(`${API_URL}/movie/${id}`, {
        params: {
          api_key: API_KEY,
          append_to_response: "videos",
        },
      });

      if (data.videos && data.videos.results) {
        const trailer = data.videos.results.find(vid => vid.name === "Official Trailer");
        setTrailer(trailer ? trailer : data.videos.results[0]);
      }
      setMovie(data);
    } catch (error) {
      console.error("Error fetching movie:", error);
    }
  };

  // Función para seleccionar una película y obtener sus detalles
  const selectMovie = async (movie) => {
    await fetchMovie(movie.id);
    setMovie(movie);
    window.scrollTo(0, 0);
  };

  // Función para buscar películas
  const searchMovies = (e) => {
    e.preventDefault();
    fetchMovies(searchKey);
  };

  // useEffect para cargar las películas al iniciar el componente
  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="MovieApp">
      <h2 className="text-center mt-5 mb-5">Noticias y estrenos</h2>
      {/* Buscador */}
      <form className="container mb-4" onSubmit={searchMovies}>
        <input 
          type="text" 
          placeholder="Buscar películas..." 
          onChange={(e) => setSearchKey(e.target.value)} 
        />
        <button className="btn btn-primary">Buscar</button>
      </form>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {/* Contenedor del banner y reproductor de video */}
      <div>
        <main>
          {movie ? (
            <div
              className="viewtrailer"
              style={{
                backgroundImage: `url("${URL_IMAGE}${movie.backdrop_path}")`,
              }}
            >
              {playing ? (
                <>
                  <YouTube
                    videoId={trailer.key}
                    className="reproductor container"
                    containerClassName={"youtube-container amru"}
                    opts={{
                      width: "100%",
                      height: "100%",
                      playerVars: {
                        autoplay: 1,
                        controls: 0,
                        cc_load_policy: 0,
                        fs: 0,
                        iv_load_policy: 0,
                        modestbranding: 0,
                        rel: 0,
                        showinfo: 0,
                      },
                    }}
                  />
                  <button onClick={() => setPlaying(false)} className="boton">
                    Close
                  </button>
                </>
              ) : (
                <div className="container">
                  <div>
                    {trailer ? (
                      <button
                        className="boton"
                        onClick={() => setPlaying(true)}
                        type="button"
                      >
                        Play Trailer
                      </button>
                    ) : (
                      "Sorry, no trailer available"
                    )}
                    <h1 className="text-white">{movie.title}</h1>
                    <p className="text-white">{movie.overview}</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>

      {/* Contenedor para agregar las películas */}
      <div className="container mt-3">
        <div className="row">
          {movies.map((movie) => (
            <div key={movie.id} className="col-md-4 mb-3" onClick={() => selectMovie(movie)}>
              {movie.poster_path ? (
                <img 
                  src={`${URL_IMAGE + movie.poster_path}`} 
                  alt={movie.title} 
                  height={600} 
                  width="100%" 
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center" 
                     style={{ height: '600px', backgroundColor: '#f0f0f0' }}>
                  <span>Imagen no disponible</span>
                </div>
              )}
              <h4 className="text-center">{movie.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MovieApp;
