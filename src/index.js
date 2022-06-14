import axios from 'axios';

const refs = {
  form: document.querySelector('#search-form'),
  submitBtn: document.querySelector('button'),
  gallery: document.querySelector('.gallery'),
};

const BASE_URL = 'https://pixabay.com/api/';

const searchParams = new URLSearchParams({
  key: '28043383-13411f478fe95414de8ce4565',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
});

function getImages(userQuery) {
  return axios.get(`${BASE_URL}?${searchParams}&q=${userQuery}`);
}

function createCardMarkup(image) {
  let { webformatURL, largeImageURL, tags, likes, views, comments, downloads } =
    image;
  return `<div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes: ${likes}</b>
    </p>
    <p class="info-item">
      <b>Vievs: ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments: ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads: ${downloads}</b>
    </p>
  </div>
</div>
`;
}

function renderImages(images) {
  return images.map(createCardMarkup).join('');
}

function onFormSubmit(event) {
  event.preventDefault();

  let userQuery = event.currentTarget.elements.searchQuery.value;

  getImages(userQuery).then(images => {
    refs.gallery.innerHTML = '';
    refs.gallery.insertAdjacentHTML(
      'beforeend',
      renderImages(images.data.hits)
    );
  });
}

refs.form.addEventListener('submit', onFormSubmit);

//  Object fields
// webformatURL - посилання на маленьке зображення для списку карток.
// largeImageURL - посилання на велике зображення.
// tags - рядок з описом зображення. Підійде для атрибуту alt.
// likes - кількість лайків.
// views - кількість переглядів.
// comments - кількість коментарів.
// downloads - кількість завантажень.
