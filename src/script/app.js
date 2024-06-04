import { baseUrl, posterImageUrl, apiKey } from "./config.js";
const appElm = document.querySelector("#app");
const title = document.querySelector(".movie-title");
const status = document.querySelector(".status");
const poster = document.querySelector(".poster");
const genre = document.querySelector(".genre");
const director = document.querySelector(".director");
const writer = document.querySelector(".writer");
const rating = document.querySelector(".rating");
const runtime = document.querySelector(".runtime");
const year = document.querySelector(".year");
const voteCount = document.querySelector(".voteCount");

const app = () => {
  const showMovieList = (movies) => {
    let template = `
      <div class="row row-cols-1 row-cols-md-3 g-4">
      `;

    movies.forEach((movieItem) => {
      const trim = movieItem.overview;
      function sliceTextByWord(text, maxWord) {
        var word = text.split(" ");
        if (word.length <= maxWord) {
          return text; // Mengembalikan teks asli jika tidak melebihi jumlah maksimal kata
        } else {
          var trimText = word.slice(0, maxWord).join(" ");
          return trimText + "...";
        }
      }
      var textResult = sliceTextByWord(trim, 10);
      template += `
            <div class="col">
                <div class="card h-100">
                    <img src="${posterImageUrl}${movieItem.poster_path}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${movieItem.original_title}</h5>
                        <p class="card-text" style="font-size:14px">${textResult}</p>
                    </div>
                    <div class="card-footer">
                    <button type="button" class="btn btn-primary btn-sm detail-btn" data-bs-toggle="modal"  data-id="${movieItem.id}" data-bs-target="#exampleModal">
                    Details</button>
                    </div>
                </div>
            </div>
            `;
    });
    template += `</div>`;
    return template;
  };

  const showAlert = (msg) => `
            <div class="alert alert-warning" role="alert">
                ${msg}
            </div>
        `;

  const showLoading = (state) => {
    if (state) {
      let loadingElm = `
            <div class="col text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            `;
      appElm.innerHTML = loadingElm;
    }
  };
  const searchMovie = async (keyword) => {
    showLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}search/movie?api_key=${apiKey}&query=${keyword}`
      );
      const responseJson = await response.json();
      if (responseJson.results.length > 0) {
        appElm.innerHTML = showMovieList(responseJson.results);
      } else {
        console.log("show alert");
        appElm.innerHTML = showAlert("film yang anda cari tidak ditemukan");
      }
    } catch (error) {
      appElm.innerHTML = showAlert(error);
    }
  };

  const getNowPlaying = () => {
    fetch(`${baseUrl}movie/now_playing?api_key=${apiKey}`)
      .then((response) => {
        return response.json();
      })
      .then((responseJson) => {
        // console.log(responseJson.results);
        if (responseJson.results.length > 0) {
          appElm.innerHTML = showMovieList(responseJson.results);
        } else {
          appElm.innerHTML = showAlert("data tidak ditemukan");
        }
      })
      .catch((error) => {
        appElm.innerHTML = showAlert(error);
      });
  };

  document.addEventListener("DOMContentLoaded", getNowPlaying);

  const searchText = document.querySelector(".search-text");
  document.querySelector(".search-btn").addEventListener("click", function (e) {
    if (searchText.value.length > 0) searchMovie(searchText.value);
  });

  searchText.addEventListener("input", function () {
    if (this.value === "") getNowPlaying();
  });

  appElm.addEventListener("click", function (e) {
    if (e.target.classList.contains("detail-btn")) {
      const detailBtn = e.target;
      const id = detailBtn.dataset.id;
      fetch(`${baseUrl}movie/${id}?api_key=${apiKey}`)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log(data);
          //title
          title.innerHTML = data.title;
          //runtime
          var hours = Math.floor(data.runtime / 60);
          var minutes = data.runtime % 60;
          var formattedTime = hours + "h " + minutes + "m";
          runtime.innerHTML = formattedTime;
          //year release
          var release_date = data.release_date.split("-");
          var splittedYear = release_date[0];
          year.innerHTML = splittedYear;
          //rating
          rating.innerHTML = data.vote_average.toFixed(1);
          //rating count
          function formatNumber(number) {
            // Jika angka lebih dari 1000, lakukan pemformatan
            if (number >= 1000) {
              // Mengubah angka menjadi ribuan (k)
              var formattedNumber = (number / 1000).toFixed(0) + "k";
              return formattedNumber;
            }

            // Jika angka kurang dari 1000, tidak ada pemformatan yang diperlukan
            return number.toString();
          }
          voteCount.innerHTML = formatNumber(data.vote_count);
          //poster
          poster.setAttribute("src", posterImageUrl + "" + data.poster_path);
          //genre
          while (genre.firstChild) {
            genre.removeChild(genre.firstChild);
          }
          data.genres.forEach((item) => {
            const genreElement = document.createElement("p");
            genreElement.style.fontSize = "12px";
            genreElement.style.fontWeight = 500;
            genreElement.className =
              "genre border border-dark-subtle rounded-pill mx-1 px-2 py-1";
            genreElement.textContent = item.name;
            genre.appendChild(genreElement);
          });
          //overview
          const overviewElement = document.querySelector(".overview");
          overviewElement.innerHTML = data.overview;
          //status
          status.innerHTML = data.status;
        });
      fetch(`${baseUrl}movie/${id}/credits?api_key=${apiKey}`)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          data.crew.forEach((crew) => {
            if (crew.job == "Director") {
              director.innerHTML = crew.name;
            }
            if (crew.job == "Writer") {
              writer.innerHTML = crew.name;
            }
          });
        });
    }
  });
};
export default app;
