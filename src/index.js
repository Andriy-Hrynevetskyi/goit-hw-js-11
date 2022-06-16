import ImagesAPIService from './js/images-api-service';
import InfiniteScroll from 'infinite-scroll';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import debounce from 'lodash.debounce';

const refs = {
  form: document.querySelector('#search-form'),
  submitBtn: document.querySelector('button'),
  gallery: document.querySelector('.gallery'),
};

const imagesAPIService = new ImagesAPIService();

let infScroll = new InfiniteScroll(refs.gallery, {
  loadOnScroll: false,
  history: false,
  scrollThreshold: 100,
  path: function () {
    let pageNumber = this.loadCount + 1;
    let url = imagesAPIService.returnURLForInfScroll();
    return `${url}${pageNumber}`;
  },
});

let simplelightbox = new SimpleLightbox('.gallery a');

infScroll.on('scrollThreshold', debounce(onLoadMore, 400));

refs.form.addEventListener('submit', onFormSubmit);

function createCardMarkup(image) {
  let { webformatURL, largeImageURL, tags, likes, views, comments, downloads } =
    image;
  return `<a href=${largeImageURL} class="gallery__item">
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
</a>
`;
}

function createImagesListMarkup(images) {
  return images.map(createCardMarkup).join('');
}

function onFormSubmit(event) {
  event.preventDefault();

  imagesAPIService.query =
    event.currentTarget.elements.searchQuery.value.trim();
  imagesAPIService.resetPage();

  imagesAPIService.fetchImages().then(images => {
    refs.gallery.innerHTML = '';
    refs.gallery.insertAdjacentHTML(
      'beforeend',
      createImagesListMarkup(images)
    );
    simplelightbox.refresh();
  });
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function onLoadMore() {
  imagesAPIService.increasePage();

  imagesAPIService.fetchImages().then(images => {
    refs.gallery.insertAdjacentHTML(
      'beforeend',
      createImagesListMarkup(images)
    );
    simplelightbox.refresh();
    smoothScroll();
  });
}
