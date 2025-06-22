const { useState, useEffect } = React;

const API_KEY = "9246bd2926b54ab04b3db26b7ab51283";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`;

function setRandomBackground() {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es&page=${Math.floor(Math.random() * 10 + 1)}`;

  axios.get(url).then((res) => {
    const posters = res.data.results.filter(movie => movie.poster_path);
    const posterUrls = posters.map(movie => `${IMAGE_BASE_URL}${movie.poster_path}`);

    const container = document.createElement("div");
    container.id = "dynamic-bg";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.zIndex = "-2";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fill, minmax(150px, 1fr))";
    container.style.gridAutoRows = "200px";
    container.style.gap = "0";
    container.style.overflow = "hidden";
    container.style.opacity = "0.8";

    const screenHeight = window.innerHeight;
    const rowHeight = 200;
    const columns = Math.floor(window.innerWidth / 150);
    const rows = Math.ceil(screenHeight / rowHeight);
    const totalCells = columns * rows;

    for (let i = 0; i < totalCells; i++) {
      const url = posterUrls[i % posterUrls.length]; // se repite si hay menos
      const img = document.createElement("div");
      img.style.backgroundImage = `url("${url}")`;
      img.style.backgroundSize = "cover";
      img.style.backgroundPosition = "center";
      img.style.width = "100%";
      img.style.height = "100%";
      container.appendChild(img);
    }

    const existing = document.getElementById("dynamic-bg");
    if (existing) existing.remove();

    document.body.appendChild(container);
  });
}

function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [ratings, setRatings] = useState(() => {
    const saved = localStorage.getItem("ratings");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    setRandomBackground();
  }, []);

  useEffect(() => {
    if (query) {
      axios.get(API_URL + encodeURIComponent(query)).then((res) => {
        setMovies(res.data.results || []);
      });
    }
  }, [query]);

  const handleRating = (id, value) => {
    const newRatings = { ...ratings, [id]: value };
    setRatings(newRatings);
    localStorage.setItem("ratings", JSON.stringify(newRatings));
  };

  return React.createElement("div", { className: "p-4 max-w-6xl mx-auto" }, [
    React.createElement("h1", { className: "text-3xl font-bold mb-4 text-white text-center", key: "title" }, "Ranking de Películas"),

    React.createElement("div", { className: "search-section", key: "search-container" }, [
      React.createElement("div", { className: "search-content" }, [
        React.createElement("input", {
          className: "border p-2 rounded w-full max-w-xl bg-white/80 text-black placeholder-gray-500",
          type: "text",
          placeholder: "Buscar película...",
          onChange: (e) => setQuery(e.target.value),
        })
      ])
    ]),

    React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", key: "grid" },
      movies.map((movie) =>
        React.createElement("div", {
          key: movie.id,
          className: "border rounded-lg p-2 shadow-md bg-white text-black",
        }, [
          React.createElement("img", {
            src: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "https://via.placeholder.com/150",
            alt: movie.title,
            className: "w-full h-64 object-cover rounded"
          }),
          React.createElement("div", { className: "mt-2 mb-1" }, [
            React.createElement("h2", {
              key: "title",
              className: "text-lg font-semibold truncate",
              title: movie.title
            }, movie.title),
            React.createElement("small", {
              key: "year",
              className: "text-gray-500 block"
            }, movie.release_date ? movie.release_date.slice(0,4) : "Año desconocido")
          ]),
          React.createElement("div", { className: "flex" },
            [1, 2, 3, 4, 5].map((star) =>
              React.createElement("svg", {
                key: star,
                onClick: () => handleRating(movie.id, star),
                xmlns: "http://www.w3.org/2000/svg",
                fill: ratings[movie.id] >= star ? "#facc15" : "none",
                stroke: ratings[movie.id] >= star ? "#facc15" : "#9ca3af",
                viewBox: "0 0 24 24",
                strokeWidth: 2,
                className: "w-5 h-5 cursor-pointer"
              },
                React.createElement("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  d: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                })
              )
            )
          )
        ])
      )
    )
  ]);
}

ReactDOM.render(React.createElement(App), document.getElementById("root"));
