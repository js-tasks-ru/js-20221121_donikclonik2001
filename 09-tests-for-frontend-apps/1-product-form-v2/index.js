import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  }

  constructor (productId = '') {
    this.productId = productId;
    this.productUrl = new URL('api/rest/products', BACKEND_URL);
    this.categoriesUrl = new URL('api/rest/categories', BACKEND_URL);
  }

  uploadImage() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';

    fileInput.addEventListener('change', async () => {
      const imageFile = fileInput.files[0];

      const formData = new FormData();
      formData.append('image', imageFile);

      this.subElements.uploadImage.classList.add('is-loading');
      this.subElements.uploadImage.disabled = true;

      const response = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData,
          referrer: ''
      });

      this.imagesList.element.append(this.getImageItem(imageFile.name, response.data.link));

      this.subElements.uploadImage.classList.remove('is-loading');
      this.subElements.uploadImage.disabled = false;
      fileInput.remove();
    });

    fileInput.hidden = true;
    document.body.appendChild(fileInput);
    fileInput.click();
  }

  async loadProductData () {
    this.productUrl.searchParams.set('id', this.productId);
    return fetchJson(this.productUrl);
  }

  async loadCategories () {
    this.categoriesUrl.searchParams.set('_sort', 'weight');
    this.categoriesUrl.searchParams.set('_refs', 'subcategory');
    return fetchJson(this.categoriesUrl);
  }

  async save() {
    if (this.productId) {
      const response = await fetchJson(this.productUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(this.getFormData())
      });
      this.dispatchEvent(response.id)
    } else {
      await fetchJson(this.productUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(this.getFormData())
      });
      this.dispatchEvent();
    }
  }

  dispatchEvent(id = '') {
    if (this.productId) {
      this.element.dispatchEvent(new CustomEvent('product-updated', {
        bubbles: true,
        detail: id
      }))
    } else {
      this.element.dispatchEvent(new CustomEvent('product-saved', {
        bubbles: true,
      }))
    }
  }

  async render () {
    const element = document.createElement('div');

    const categoriesPromise = this.loadCategories();

    const formPromise = this.productId
    ? this.loadProductData()
    : Promise.resolve(this.defaultFormData);

    const [productData, categoriesData] = await Promise.all([formPromise, categoriesPromise]);

    this.productData = productData[0];
    this.categoriesData = categoriesData;

    element.innerHTML = this.productData ? this.getTemplate() : this.getEmptyPage();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.renderImagesList();
    this.initEventListeners();

    return this.element;
  }

  renderImagesList() {
    const imagesItems = this.productData.images.map(imageInfo => {
      return this.getImageItem(imageInfo.source, imageInfo.url);
    });

    this.imagesList = new SortableList({ items: imagesItems });

    this.subElements.imageListContainer.append(this.imagesList.element);
  }

  getImageItem(source, url) {
    const div = document.createElement('div');
    div.innerHTML = `
    <li class="products-edit__imagelist-item sortable-list__item">
      <input type="hidden" name="url" value="${url}">
      <input type="hidden" name="source" value="${source}">
      <span>
        <img src="./icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="${escapeHtml(source)}" src="${escapeHtml(url)}">
        <span>${escapeHtml(source)}</span>
      </span>
      <button type="button">
        <img src="./icon-trash.svg" data-delete-handle="" alt="delete">
      </button>
    </li>`;
    return div.firstElementChild;
  }

  getOptionsList() {
    return this.categoriesData.map(category => {
      return category.subcategories.map(subcategory => {
        const title = `${category.title} > ${subcategory.title}`;
        return this.getOptionItem(title, subcategory.id);
      }).join('');
    }).join('');
  }

  getOptionItem (title, value) {
    return `<option value="${value}">${title}</option>`
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const fields = Object.keys(this.defaultFormData);
    const values = {};

    for (const field of fields) {
      if (field === 'images') continue;
      values[field] = productForm.querySelector(`#${field}`).value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return values;
  }

  initEventListeners() {
    this.subElements.uploadImage.addEventListener('click', () => this.uploadImage());
  }

  getTemplate() {
    return `
    <div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара" value="${escapeHtml(this.productData.title)}" id="title">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара" id="description">${escapeHtml(this.productData.description)}</textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
        </div>
        <button type="button" name="uploadImage" class="button-primary-outline" data-element="uploadImage"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory">
          ${this.getOptionsList()}
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="100" value="${this.productData.price}" id="price">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="0" value="${this.productData.discount}" id="discount">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="1" value="${this.productData.quantity}" id="quantity">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status" id="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>
  </div>
  `
  }

  getEmptyPage() {
    return `<div>
      <h1 class="page-title">Страница не найдена</h1>
      <p>Извините, данный товар не существует</p>
    </div>`;
  }

  getSubElements() {
    const subElements = {};

    this.element.querySelectorAll('[data-element]').forEach(dataElement => {
      subElements[dataElement.dataset.element] = dataElement;
    });

    return subElements;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove()
  }
}
