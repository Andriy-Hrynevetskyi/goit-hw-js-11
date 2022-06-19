import ImagesAPIService from './js/images-api-service';
import InfiniteScroll from 'infinite-scroll';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  form: document.querySelector('#search-form'),
  submitBtn: document.querySelector('button'),
  gallery: document.querySelector('.gallery'),
  animation: document.querySelector('.loader-ellips'),
};

const MAX_LIMIT_RICHED_MSG =
  "We're sorry, but you've reached the end of search results.";
const BAD_REQUEST_MSG =
  'Sorry, there are no images matching your search query. Please try again.';
const ERROR_MSG = 'An error occurred!!!!';

const imagesAPIService = new ImagesAPIService();

let infScroll = new InfiniteScroll(refs.gallery, {
  responseBody: 'json',
  loadOnScroll: false,
  history: false,
  scrollThreshold: 300,
  path: function () {
    let pageNumber = this.loadCount + 1;
    let url = imagesAPIService.returnURLForInfScroll();
    return `${url}${pageNumber}`;
  },
});

let simplelightbox = new SimpleLightbox('.gallery a');

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

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

function renderGallery(images) {
  refs.gallery.insertAdjacentHTML('beforeend', createImagesListMarkup(images));
}

function showSuccessMsg(quantity) {
  let message = `"Hooray! We found ${quantity} images."`;
  return Notify.success(message);
}

function showErrorMsg(message) {
  return Notify.failure(message);
}

const infiniteScrollListener = debounce(loadMore, 400);

async function onFormSubmit(event) {
  event.preventDefault();
  infScroll.on('scrollThreshold', infiniteScrollListener);

  imagesAPIService.query =
    event.currentTarget.elements.searchQuery.value.trim();

  imagesAPIService.resetPage();
  clearGallery();

  try {
    refs.animation.classList.remove('hidden');

    const images = await imagesAPIService.fetchImages();
    let { totalHits, hits } = images.data;
    if (hits.length === 0 || totalHits === 0) {
      showErrorMsg(BAD_REQUEST_MSG);
      return;
    }
    showSuccessMsg(totalHits);
    renderGallery(hits);
    simplelightbox.refresh();
  } catch (error) {
    showErrorMsg(ERROR_MSG);
  } finally {
    refs.animation.classList.add('hidden');
  }
}

async function loadMore() {
  imagesAPIService.increasePage();
  refs.animation.classList.remove('hidden');

  try {
    const images = await imagesAPIService.fetchImages();
    let { hits } = images.data;

    if (images.data.hits.length === 0 && images.status === 200) {
      showErrorMsg(MAX_LIMIT_RICHED_MSG);
      infScroll.off('scrollThreshold', infiniteScrollListener);

      return;
    }

    renderGallery(hits);
    simplelightbox.refresh();
    smoothScroll();
  } catch (error) {
    if (error.response.status === 400) {
      showErrorMsg(MAX_LIMIT_RICHED_MSG);
      infScroll.off('scrollThreshold', infiniteScrollListener);
      return;
    } else {
      showErrorMsg(ERROR_MSG);
      infScroll.off('scrollThreshold', infiniteScrollListener);

      return;
    }
  } finally {
    refs.animation.classList.add('hidden');
  }
}
