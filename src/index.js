import ImagesAPIService from './js/images-api-service';

const refs = {
  form: document.querySelector('#search-form'),
  submitBtn: document.querySelector('button'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const imagesAPIService = new ImagesAPIService();

refs.form.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function createCardMarkup(image) {
  let { webformatURL, largeImageURL, tags, likes, views, comments, downloads } =
    image;
  return `<div class="gallery__item">
  <img class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="image-info">
    <p class="image-info__item">
      Likes: ${likes}
    </p>
    <p class="info-item">
      Views: ${views}
    </p>
    <p class="info-item">
      Comments: ${comments}
    </p>
    <p class="info-item">
      Downloads: ${downloads}
    </p>
  </div>
</div>
`;
}

function createImagesListMarkup(images) {
  return images.map(createCardMarkup).join('');
}

function onFormSubmit(event) {
  event.preventDefault();

  imagesAPIService.query = event.currentTarget.elements.searchQuery.value;
  imagesAPIService.resetPage();

  imagesAPIService.fetchImages().then(images => {
    imagesAPIService.increasePage();

    refs.gallery.innerHTML = '';
    refs.gallery.insertAdjacentHTML(
      'beforeend',
      createImagesListMarkup(images.data.hits)
    );
  });
}

function onLoadMore(event) {
  imagesAPIService.fetchImages().then(images => {
    imagesAPIService.increasePage();

    refs.gallery.insertAdjacentHTML(
      'beforeend',
      createImagesListMarkup(images.data.hits)
    );
  });
}
