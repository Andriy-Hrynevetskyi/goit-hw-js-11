import axios from 'axios';

const searchParams = new URLSearchParams({
  key: '28043383-13411f478fe95414de8ce4565',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  per_page: 40,
});

const BASE_URL = 'https://pixabay.com/api/';

export default class ImagesAPIService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }
  async fetchImages() {
    const images = await axios.get(
      `${BASE_URL}?q=${this.searchQuery}&${searchParams}&page=${this.page}`
    );
    return images;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }

  increasePage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 12;
  }

  returnURLForInfScroll() {
    return `${BASE_URL}?q=${this.searchQuery}&${searchParams}&page=`;
  }
}
