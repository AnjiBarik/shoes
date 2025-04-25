// Get the configuration element
const configElement = document.getElementById('config');

// Read URLs from data attributes
const URLAPI = configElement.getAttribute('data-url-api');
const globalURL = configElement.getAttribute('data-global-url');

let books = []; 
let filteredBooks = [];
let fieldState = {};
let aggregatedData = [];
let sortedBooks = [];
let searchBooks = [];

const bookList = document.getElementById('book-list');
const catalogFilterSearch = document.getElementById('catalog-filter-search-container');
const paginationContainer = document.getElementById('pagination');
const loadingSpinner = document.getElementById('loading-spinner');
const themeToggle = document.getElementById('theme-toggle');
const seeMoreButton = document.getElementById('see-more-btn');
const mainHeader = document.getElementById('main-header');
const filtersSection = document.querySelector('.filters');  
const scrollToTopButton = document.getElementById('scroll-to-top-btn'); 
const catalogButton = document.getElementById('catalog-button');
const filtersButton = document.getElementById('filters-button');
const catalogModal = document.getElementById('catalog-modal');
const closeCatalogModal = document.getElementById('close-catalog-modal');
const sectionList = document.getElementById('section-list');
const currentFilter = document.getElementById('current-filter');
const bookTitleElem = document.getElementById('book-title');
const bookshortDescriptionElem = document.getElementById('book-short-description');
const bookDescriptionElem = document.getElementById('book-description');
const bookAuthorElem = document.getElementById('book-author');
const bookPriceElem = document.getElementById('book-price');
const bookTagsElem = document.getElementById('book-tags');
const bookOverTagsElem = document.getElementById('book-over-tags');
const imageGallery = document.getElementById('image-gallery');
const scrollRange = document.getElementById('scroll-range');
const bookModalImg = document.getElementById('book-modal-img');
const modalElem = document.getElementById('modal');
const bookID = document.getElementById('book-ID');
const bookRatingElem = document.getElementById('book-rating'); 
const closeModalButton = document.getElementById('close-modal');
const modal = document.getElementById('modal');
const searchInput = document.getElementById('search-input');
const noResultsMessage = document.getElementById('no-results-message');
const sortButtons = document.querySelectorAll('.sort-button:not(#catalog-button):not(#filters-button)');
const clearButton = document.getElementById('clear-search-btn');
const positions = document.querySelectorAll('.position');
const indicators = document.querySelectorAll('.indicator');
const mainCircle = document.querySelector('.main-circle');
const mainImage = document.getElementById('main-image');
const descriptionParagraph = document.querySelector('.description-container p'); 
const viewReviewsBtn = document.getElementById('view-reviews-btn');
const reviewsSection = document.getElementById('reviews-section');
const reviewsContainer = document.getElementById('reviews-container');
const sortButtonsContainer = document.querySelector('.sort-buttons');
const sortNewestButton = document.getElementById('sort-newest');
const sortOldestButton = document.getElementById('sort-oldest');
const floatingButton = document.getElementById('floatingButton');
const filterModal = document.getElementById('filter-modal');
const errorMessage = document.getElementById('error-message');
const applyFiltersButton = document.getElementById('apply-filters');
const resetFiltersButton = document.getElementById('reset-filters');
const pinButton = document.getElementById('pinFilterButton');
const catalogBtn = document.getElementById("scroll-catalog-btn");
const searchBtn  = document.getElementById("scroll-search-btn");
const filterBtn  = document.getElementById("scroll-filter-btn");
const toggleIcon = document.getElementById("toggle-search-options");
const searchOptions = document.getElementById("search-options");
const checkboxes = document.querySelectorAll("#search-options input");
const goToStoreBtn = document.getElementById('go-to-store-btn');

let selectedSection = null;
let selectedPartition = null; 
let currentIndex = 0;
let userInteracted = false;
const delay = 3000;
let autoRotateInterval;
let isLoading = false;
let forceShowApply = false;


const ITEMS_PER_PAGE_LARGE_SCREEN = 10;
const ITEMS_PER_PAGE_MEDIUM_SCREEN = 7;
const ITEMS_PER_PAGE_SMALL_SCREEN = 5;
const Widescreenfilter_SCREEN_WIDTH = 1600;
const LARGE_SCREEN_WIDTH = 1200;
const MEDIUM_SCREEN_WIDTH = 700;
const tagFields = ['tags1', 'tags2', 'tags3', 'tags4', 'tags5', 'tags6', 'tags7', 'tags8'];
const preferredTags = ['author', 'color', 'size'];
let currentPage = 1; 
let itemsPerPage = 1;
 
searchInput.value = '';

let reviewCache = {};

floatingButton.addEventListener('click', () => {  
  window.location.href = globalURL;
});

function updateActiveState(index) {
  positions.forEach((pos) => pos.classList.remove('active'));
  indicators.forEach((ind) => ind.classList.remove('active'));

  positions[index].classList.add('active');
  indicators[index].classList.add('active');

  const selectedPosition = positions[index];
  const imageSrc = selectedPosition.querySelector('.position-circle img').src;
  const description = selectedPosition.dataset.description;

  mainImage.src = imageSrc;
  descriptionParagraph.textContent = description;
  // Update the shadow on the main circle based on the active position
  mainCircle.classList.remove('shadow-down', 'shadow-right', 'shadow-up'); // Remove all shadow classes

  if (index === 0) {
   mainCircle.classList.add('shadow-down'); 
  } else if (index === 1) {
   mainCircle.classList.add('shadow-right'); 
  } else if (index === 2) {
   mainCircle.classList.add('shadow-up'); 
  }
}

function startAutoRotate() {
  autoRotateInterval = setInterval(() => {
    if (!userInteracted) {
      currentIndex = (currentIndex + 1) % positions.length;
      updateActiveState(currentIndex);
    }
  }, delay);
}

function stopAutoRotate() {
  clearInterval(autoRotateInterval);
}

function setupPositionClicks() {
  positions.forEach((position, index) => {
    position.addEventListener('click', () => {
      userInteracted = true;
      currentIndex = index;
      updateActiveState(index);
      setTimeout(() => {
        userInteracted = false;
      }, delay);
    });
  });
}

// Function for removing event handlers for positions
function removePositionListeners() {
  positions.forEach((position, index) => {
    position.removeEventListener('click', () => {
      userInteracted = true;
      currentIndex = index;
      updateActiveState(index);
      setTimeout(() => {
        userInteracted = false;
      }, delay);
    });
  });
}

function setupSeeMoreButton() { 
  seeMoreButton.addEventListener('click', (e) => {
    e.preventDefault();

    if (isLoading) return; 
    isLoading = true; 

    stopAutoRotate(); 
    positions.forEach((pos) => pos.classList.remove('active')); 
    indicators.forEach((ind) => ind.classList.remove('active'));

    loadingSpinner.style.display = 'block';

    // Loading Data
    fetchBooks()
  .then(() => {
    mainHeader.style.display = 'none'; 
    filtersSection.style.display = 'flex'; 
    bookList.style.display = 'flex'; 
    paginationContainer.style.display = 'flex'; 
    floatingButton.style.display = 'block';
    updateSortButtonsVisibility(filteredBooks);
    removePositionListeners(); 
    window.addEventListener('scroll', updateScrollProgress);
    updateCurrencySymbols();
  })
  .catch((error) => {
    console.error('Error loading data:', error);
    errorMessage.style.display = 'block';
  })
  .finally(() => {
    loadingSpinner.style.display = 'none'; 
    isLoading = false; 
  });    
  });
}

// Function for removing the "See More" button handler
function removeSeeMoreListener() {
  seeMoreButton.removeEventListener('click', setupSeeMoreButton);
}

// Initialization function
function initialize() {  
  updateActiveState(currentIndex); 
  startAutoRotate(); 
  setupPositionClicks(); 
  setupSeeMoreButton();
}

// Function for smooth scrolling to the top of the page
function scrollToTop() { 
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

document.addEventListener('DOMContentLoaded', initialize);
  
  // Smooth scrolling up
   scrollToTopButton.addEventListener('click', scrollToTop);   

  // Function to update scrolling progress
  function updateScrollProgress() {
    const scrollTop = window.scrollY; // Current scroll position
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // Full Page Height
    const scrollPercent = (scrollTop / docHeight) * 100; // Scroll percentage

    // Update the background gradient for progress
    const progress = scrollToTopButton.querySelector('.scroll-progress');
    if (progress) {
      // Set progress color depending on scrolling
      progress.style.background = `conic-gradient(#4caf50 ${scrollPercent}%, var(--modal-bg) ${scrollPercent}% 100%)`;
    }

    // Show/hide the button depending on scrolling
    if (scrollTop > 100) {
      scrollToTopButton.style.display = 'flex';
      catalogBtn.style.display = 'flex';
      searchBtn.style.display = 'flex';
      filterBtn.style.display = 'flex';
    } else {
      scrollToTopButton.style.display = 'none';
      catalogBtn.style.display = 'none';
      searchBtn.style.display = 'none';
      filterBtn.style.display = 'none';
    }
  }      
  
    // Assigning click handlers
    catalogBtn.addEventListener("click", function() {      
      renderSections();
      highlightActiveSelection();
      openModal(catalogModal);
    });
  
    searchBtn.addEventListener("click", function() {
      searchInput.classList.add("active");
      searchInput.focus();
    });
  
    filterBtn.addEventListener("click", function() {      
      showFilterModal();
    });
 
  

  let isFilterPinned = false;

  function togglePinFilter() {
    isFilterPinned = !isFilterPinned;
    updatePinButtonState();
    updateFilterModalState();
  }
  
  function updatePinButtonState() {    
    if (window.innerWidth > Widescreenfilter_SCREEN_WIDTH) {
      pinButton.style.visibility = 'visible';
      pinButton.style.border = isFilterPinned ? '2px solid' : 'none';
    } else {
      pinButton.style.visibility = 'hidden';
      isFilterPinned = false; 
    }
  }
  
  function updateFilterModalState() {    
    if (window.innerWidth > Widescreenfilter_SCREEN_WIDTH && isFilterPinned) {
      document.body.classList.add('wide-screen-filter');
    } else {
      document.body.classList.remove('wide-screen-filter');
    }
  }
  
  function showFilterModal() {    
    openModal(filterModal);
  
    applyFilter(filteredBooks);
  
    const uniqueTags = getUniqueTags(filteredBooks, selectedFilters);
    renderFilterSections(uniqueTags);
    updateButtonStates();
  
    updateFilterModalState();
    updatePinButtonState();
  }
  
  function closeModal(modal) { 
    modal.style.display = 'none';
    state.modalOpen = false;
  
    if (modal === filterModal) {
      document.body.classList.remove('wide-screen-filter');
    }
  } 
  
  
  pinButton.addEventListener('click', togglePinFilter);
  
  updatePinButtonState();
  updateFilterModalState();  

// Object to store the current state
const state = {
  modalOpen: false,
  fullscreenOpen: false
};

// Function to open a modal window
function openModal(modal) { 
  modal.style.display = 'block';
  state.modalOpen = true;  
  history.pushState(null, null, location.href);
}

// Function to open fullscreen mode
function openFullscreen() {
  const fullscreenContainer = document.getElementById('fullscreen-container');  
  state.fullscreenOpen = true;
  history.pushState(null, null, location.href);
}

// Function to close fullscreen mode
function closeFullscreen() {  
  const fullscreenContainer = document.getElementById('fullscreen-container');
  if (fullscreenContainer) {
    document.body.removeChild(fullscreenContainer);
    state.fullscreenOpen = false;
  }
}

// Handler for the "Back" button
window.addEventListener('popstate', (event) => {   
  if (state.fullscreenOpen) {
    closeFullscreen();    
  } else if (state.modalOpen) {
    closeModal(catalogModal);
    closeModal(modal);
    closeModal(filterModal);
    closeModal(contactModal);    
  }
}); 


function handleOutsideClick(event, modal) { 
  if (event.target === modal) {
    closeModal(modal);
  }
}

function handleEscapeKey(event) {
  if (event.key === 'Escape') {
    closeModal(catalogModal);
    closeModal(modal);
    closeModal(filterModal);
    closeFullscreen();
    closeModal(contactModal);
  }
}

if (catalogButton) {
  catalogButton.addEventListener('click', () => {
    renderSections();
    highlightActiveSelection();
    openModal(catalogModal);
  });
}

if (closeCatalogModal) {
  closeCatalogModal.addEventListener('click', () => {
    closeModal(catalogModal);
  });
}

if (closeModalButton) {
  closeModalButton.addEventListener('click', () => {
    closeModal(modal);
  });
}

window.addEventListener('click', (e) => {
  handleOutsideClick(e, catalogModal);
  handleOutsideClick(e, modal);
  handleOutsideClick(e, filterModal);
  handleOutsideClick(e, contactModal);
});

window.addEventListener('keydown', handleEscapeKey);


// Main function to display book details in a modal
window.showMoreInfo = function (bookId) {
  const book = books.find(b => b.id == bookId);
  if (!book) {
    console.error('Book not found for ID:', bookId);
    return;
  }
  
  openModal(modal)

  // Update modal content elements
  if (bookID) bookID.textContent = `ID:${bookId}`;
  if (bookTitleElem) bookTitleElem.textContent = `${book.title || ''}`;

  // Display tags for size and color first
  if (bookTagsElem) bookTagsElem.innerHTML = renderSizeColorTags(book, fieldState);

  if (bookAuthorElem) bookAuthorElem.textContent = `Author: ${book.author || ''}`;

  
  // Display price information
  if (bookPriceElem) {
    const parsedPrice = parsePrice(book.price);
    const parsedSalePrice = parsePrice(book.saleprice);
  
    if (parsedSalePrice !== undefined) {
      bookPriceElem.innerHTML = `
        <span class="sale-price">${parsedSalePrice} ${fieldState.payment || '$'}</span>
        <span class="original-price">${parsedPrice !== undefined ? parsedPrice : 'N/A'} ${fieldState.payment || '$'}</span>
      `;
    } else {
      bookPriceElem.textContent = `Price: ${parsedPrice !== undefined ? `${parsedPrice} ${fieldState.payment || '$'}` : 'N/A'}`;
    }
  }  
  
  // Display goToStore
  if (goToStoreBtn) {
    goToStoreBtn.onclick = function() {
      window.location.href = `${globalURL}/${bookId}`;
    };
  }
  // Display short description
  if (bookshortDescriptionElem) {
    bookshortDescriptionElem.textContent = book.shortDescription || '';
  }

  // Display tags 
  if (bookOverTagsElem) bookOverTagsElem.innerHTML = renderTags(book, fieldState);

  // Display full description
  if (bookDescriptionElem) {
    bookDescriptionElem.textContent = book.description || '';
  }

  // Clear and populate the image gallery
  if (imageGallery) {
    imageGallery.innerHTML = '';

    const images =
      (book.imageblockpublic && typeof book.imageblockpublic === 'string' && book.imageblockpublic.trim() !== '')
        ? book.imageblockpublic.split(',')
            .map(img => img.trim())
            .filter(img => img !== '')
            .map(img => `img/publik/${img}`)
        : (book.imageblock && typeof book.imageblock === 'string' && book.imageblock.trim() !== '')
        ? book.imageblock.split(',')
            .map(img => img.trim())
            .filter(img => img !== '')
        : [];

    images.forEach((image, index) => {
      const img = document.createElement('img');
      img.src = image.trim();
      img.alt = `Book Image ${index + 1}`;
      img.classList.add('image-option');

      // Checking image loading
      img.onerror = function () {
        this.onerror = null;
        this.src = 'img/imageNotFound.png';
      };
      img.onclick = () => changeImage(image.trim());
      imageGallery.appendChild(img);
    });

    // Set the first image if available
    if (bookModalImg && images.length > 0) {
      bookModalImg.src = images[0].trim();
      bookModalImg.onerror = function () {
        this.onerror = null;
        this.src = 'img/imageNotFound.png';
      };
    }
    updateScrollRange();
  }

// Sync the range slider with the gallery scroll position
scrollRange.addEventListener('input', () => {
    imageGallery.scrollLeft = scrollRange.value;
});

imageGallery.addEventListener('scroll', () => {
    scrollRange.value = imageGallery.scrollLeft;
});


  // Display rating and reviews
  const productRating = findProductRating(aggregatedData, fieldState.idprice, book.id);
  if (bookRatingElem) {
    bookRatingElem.innerHTML = productRating
      ? `
        ${renderStars(productRating.Average_Rating)}
        <span class="review-count">${productRating.Review_Count} </span>
      `
      : ''; // Display a message if no rating data is found
  }

  // Configure reviews button
  if (viewReviewsBtn) {
    const idPrice = fieldState.idprice;
    const cacheKey = `${idPrice}-${bookId}`;

    const addRatingToButton = () => {      
      const existingRating = viewReviewsBtn.querySelector('.id-rating');
      if (existingRating) {
          existingRating.remove();
      }
      
      if (bookRatingElem) {
          const ratingCopy = bookRatingElem.cloneNode(true);
          ratingCopy.style.display = 'inline-block'; 
          viewReviewsBtn.appendChild(ratingCopy); 
      }
    };

    if (productRating && productRating.Review_Count > 0) {
      if (reviewCache[cacheKey] && reviewCache[cacheKey].length > 0) {
        viewReviewsBtn.style.display = 'block';
        viewReviewsBtn.disabled = false;
        viewReviewsBtn.textContent = 'Refresh Reviews🔄';
        addRatingToButton();
        displayCachedReviews(reviewCache[cacheKey]);

        viewReviewsBtn.onclick = async () => {
          viewReviewsBtn.disabled = true;
          viewReviewsBtn.textContent = 'Loading...';
          const reviews = await loadAndDisplayReviews(bookId, idPrice);
          if (reviews.length > 0) {
            reviewCache[cacheKey] = reviews;
            displayCachedReviews(reviews);
          }
          viewReviewsBtn.disabled = false;
          viewReviewsBtn.textContent = 'Refresh Reviews🔄';
          addRatingToButton();
        };
      } else {
        clearReviews();
        viewReviewsBtn.style.display = 'block';
        viewReviewsBtn.disabled = false;
        viewReviewsBtn.textContent = 'View Reviews ';
        addRatingToButton();

        viewReviewsBtn.onclick = async () => {
          viewReviewsBtn.disabled = true;
          viewReviewsBtn.textContent = 'Loading...';
          const reviews = await loadAndDisplayReviews(bookId, idPrice);
          if (reviews.length > 0) {
            reviewCache[cacheKey] = reviews;
            displayCachedReviews(reviews);
          }
          viewReviewsBtn.disabled = false;
          viewReviewsBtn.textContent = 'Refresh Reviews🔄';
          addRatingToButton();
        };
      }
    } else {
      clearReviews();
      viewReviewsBtn.style.display = 'none';
    }
  }

  // Show the modal if it exists
  if (modalElem) {
    modalElem.style.display = 'block';
    updateMenuVisibility()
  }
};

// Unified resize handler function
function handleWindowResize() {
  updateScrollRange();
  handleResize();
  updatePinButtonState();
  updateFilterModalState();
}

// Attach the debounced event listener
window.addEventListener('resize', debounce(handleWindowResize, 150));

// Function to update the scroll range and toggle visibility
function updateScrollRange() {
  scrollRange.style.display = 'none';
  
  const isOverflowing = imageGallery.scrollWidth > imageGallery.clientWidth;
  if (isOverflowing) {
      scrollRange.style.display = 'block';
      scrollRange.max = imageGallery.scrollWidth - imageGallery.clientWidth;
  }
}

// Scroll to section functionality
document.querySelectorAll('.menu-item').forEach(div => {
  div.addEventListener('click', function () {
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

    // Add active class to the clicked menu item
    this.classList.add('active');

    const targetId = this.getAttribute('data-target');
    const targetElem = document.getElementById(targetId);
    
    if (targetElem) {
      targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      targetElem.scrollTop -= 50;
    }
  });
});

// Update menu visibility based on content availability
function updateMenuVisibility() {

  document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
  // Ensure Main Info is always visible
  const mainInfoMenu = document.querySelector('[data-target="Main Info"]');
  if (mainInfoMenu) mainInfoMenu.style.display = 'inline-block';

  // Update Details menu visibility based on description or tags
  const detailsMenu = document.querySelector('[data-target="Details"]');
  if (detailsMenu) {
    const hasDetails = bookDescriptionElem?.textContent.trim() || bookOverTagsElem?.innerHTML.trim();
    detailsMenu.style.display = hasDetails ? 'inline-block' : 'none';
  }

  // Update Reviews menu visibility based on reviews button state
  const reviewsMenu = document.querySelector('[data-target="Reviews"]');
  if (reviewsMenu) {
    reviewsMenu.style.display = viewReviewsBtn?.style.display === 'block' ? 'inline-block' : 'none';
  }
}


// Load and display reviews with caching
async function loadAndDisplayReviews(bookId, idPrice) {
  
  const formData = new FormData();
  formData.append('isReviews', 2);
  formData.append('idPrice', idPrice);
  formData.append('idProduct', bookId);

  try {    
    const response = await fetch(URLAPI, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch product reviews');
    }

    return data.data || [];
  } catch (error) {
    console.error('Error fetching product reviews:', error.message);
    return [];
  }
}

// Display cached reviews in the modal
function displayCachedReviews(reviews) {  
  if (!reviewsSection) return;
  populateReviewsSection(reviews);
  // Ensure the reviews section is visible
  reviewsSection.classList.remove('hidden');
}

// Clear reviews when switching products
function clearReviews() { 
  if (reviewsContainer) reviewsContainer.innerHTML = '';
  if (reviewsSection) reviewsSection.classList.add('hidden');
}

// Function to populate the reviews section
function populateReviewsSection(reviews) {  
  if (!reviewsContainer) return;

  reviewsContainer.innerHTML = ''; // Clear existing reviews

  // Initially display reviews sorted by newest
  displayReviews(reviews, 'newest');

  // Only show sort buttons if there are more than one review
  if (reviews.length > 1) {
    sortButtonsContainer.style.display = 'flex'; // Show sorting buttons    
    sortNewestButton.onclick = () => displayReviews(reviews, 'newest');
    sortOldestButton.onclick = () => displayReviews(reviews, 'oldest');
  } else {
    sortButtonsContainer.style.display = 'none'; // Hide sorting buttons if only one or no review
  }
}

// Function to display reviews based on sort order
function displayReviews(reviews, sortOrder) {  

  const sortedReviews = [...reviews].sort((a, b) => {
    const dateA = new Date(a.DateTime);
    const dateB = new Date(b.DateTime);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  reviewsContainer.innerHTML = sortedReviews.map(createReviewHTML).join('');
}

// Function to create HTML for a single review
function createReviewHTML(review) {
  const stars = renderStars(review.Rating);
  return `
    <div class="review">
      <div class="review-header">
        <span class="review-author">${review.Name}</span>
        <span class="review-date">${new Date(review.DateTime).toLocaleDateString()}</span>
      </div>
      <div class="review-rating">${stars}</div>
      <p class="review-text">${review.Review}</p>
    </div>
  `;
}

// Function to change the image in the modal
function changeImage(imageUrl) {
  const bookModalImg = document.getElementById('book-modal-img');
  if (bookModalImg) {
    bookModalImg.src = imageUrl;
  }
}

// Function to display an image in fullscreen mode
const fullscreenBtn = document.getElementById('fullscreen-btn');
if (fullscreenBtn) {
  fullscreenBtn.onclick = function() {   
    const img = document.getElementById('book-modal-img');
    if (img) {
      openFullscreen();      
      const fullscreenContainer = document.createElement('div');
      fullscreenContainer.id = 'fullscreen-container';
      fullscreenContainer.classList.add('fullscreen-overlay');

      // Copy the image into the new container
      const fullscreenImage = img.cloneNode();
      fullscreenImage.classList.add('fullscreen-image');      
      const closeButtonTemplate = document.getElementById('close-fullscreen-template');
      const closeButton = closeButtonTemplate.firstElementChild.cloneNode(true);     

      // Attach click handler to the close button
      closeButton.onclick = closeFullscreen;

      // Add the image and close button to the container
      fullscreenContainer.appendChild(fullscreenImage);
      fullscreenContainer.appendChild(closeButton);

      // Add the container to the page
      document.body.appendChild(fullscreenContainer);
    }
  };
}

// Function to find product rating
function findProductRating(aggregatedData, idPrice, idProduct) {
  return aggregatedData.find(
    item => `${item.ID_Price}` === `${idPrice}` && `${item.ID_Product}` === `${idProduct}`
  );
}

function updateCurrentFilterDisplay() {
  currentFilter.innerHTML = '';

  const showAllLink = document.createElement('a');
  showAllLink.textContent = 'Show all';
  showAllLink.addEventListener('click', resetFilters);
  currentFilter.appendChild(showAllLink);

  if (!selectedSection && !selectedPartition) {
    currentFilter.style.display = 'block'; 
    return;
  }

  if (selectedSection) {
    const sectionLink = document.createElement('a');
    sectionLink.textContent = selectedSection;
    sectionLink.addEventListener('click', () => filterBooksBySection(selectedSection));
    currentFilter.appendChild(document.createTextNode(' / '));
    currentFilter.appendChild(sectionLink);
  }

  if (selectedPartition) {
    const partitionLink = document.createElement('a');
    partitionLink.textContent = selectedPartition;
    partitionLink.addEventListener('click', () => filterBooksBySectionPartition(selectedSection, selectedPartition));
    currentFilter.appendChild(document.createTextNode(' / '));
    currentFilter.appendChild(partitionLink);
  }

  currentFilter.style.display = 'block'; 
}

function resetFilters() {
  selectedSection = null;
  selectedPartition = null;
  filteredBooks = books; 
  displayBooks(filteredBooks, fieldState);
  resetFiltersConst()
  clearSearch()
  catalogModal.style.display = 'none';
  updateCurrentFilterDisplay();
  updateSortButtonsVisibility(filteredBooks)
}

function renderSections() {
  sectionList.innerHTML = '';   
  const showAllItem = document.createElement('li');
  showAllItem.textContent = 'Show all';
  showAllItem.classList.add('section-item');
  if (!selectedSection && !selectedPartition) {
    showAllItem.classList.add('active'); 
  }
  showAllItem.addEventListener('click', resetFilters);
  sectionList.appendChild(showAllItem);

  const uniqueSections = [...new Set(books.map(book => book.section))];
  uniqueSections.forEach(section => {
    const li = document.createElement('li');
    const sectionKey = `section:${section}`;    
    li.innerHTML = `
      <div class="section-toggle">
      <div class="section">
      <img 
        class="social-icon" 
        src="${fieldState[sectionKey] || 'img/icon/category.png'}"  
        alt="Section Icon"
        onerror="this.onerror=null;this.src='img/icon/category.png'"
      />
        <p>${section}</p>
      </div>
        ${hasPartitions(section) ? getToggleIconHTML() : ''}
      </div>`;
    li.classList.add('section-item');

    const toggleIcon = li.querySelector('.toggle-icon');
    if (toggleIcon) {
      toggleIcon.addEventListener('click', (e) => {
        e.stopPropagation();      
        togglePartitions(li, section);
      });
    }

    li.addEventListener('click', (event) => {
      if (event.target.classList.contains('toggle-icon')) return; 
      selectedSection = section;
      selectedPartition = null;    
      filterBooksBySection(section);  
    });
    
    sectionList.appendChild(li);
  });
}

// Helper function to get the toggle icon HTML from the template
function getToggleIconHTML() {
  const template = document.getElementById('toggle-icon-template');
  return template ? template.innerHTML : ''; // Return the HTML content of the template
}

function hasPartitions(section) {
  return books.some(book => book.section === section && book.partition);
}

function togglePartitions(liElement, section) {
  const toggle = liElement.querySelector('.toggle-icon');
  const existingContainer = liElement.querySelector('.partition-container');

  if (!toggle) return;

  if (existingContainer) {
    // Remove the partition container
    existingContainer.remove();

    // Reset toggle icon to its original state
    toggle.classList.remove('rotated');
  } else {
    // Create a new container for partitions
    const partitionContainer = document.createElement('ul');
    partitionContainer.classList.add('partition-container');

    const partitions = [...new Set(
      books.filter(book => book.section === section).map(book => book.partition)
    )];
    partitions.forEach(partition => {
      const partitionLi = document.createElement('li');
      partitionLi.textContent = partition || 'Without subsection';
      partitionLi.classList.add('partition-item');

      if (section === selectedSection && partition === selectedPartition) {
        partitionLi.classList.add('active');
      }

      partitionLi.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedSection = section;
        selectedPartition = partition || 'Without subsection';
        filterBooksBySectionPartition(section, partition);
      });

      partitionContainer.appendChild(partitionLi);
    });

    liElement.appendChild(partitionContainer);

    // Rotate toggle icon to indicate expanded state
    toggle.classList.add('rotated');
  }
}

function highlightActiveSelection() {
  const sectionItems = document.querySelectorAll('.section-item');
  const partitionItems = document.querySelectorAll('.partition-item');

  sectionItems.forEach(item => item.classList.remove('active'));
  partitionItems.forEach(item => item.classList.remove('active'));

  if (!selectedSection && !selectedPartition) {
    const showAllItem = sectionList.querySelector('.section-item:first-child');
    if (showAllItem) showAllItem.classList.add('active');
  }

  if (selectedSection && !selectedPartition) {
    sectionItems.forEach(item => {
      if (item.textContent.trim().includes(selectedSection)) {
        item.classList.add('active');
      }
    });
  }

  if (selectedPartition) {
    partitionItems.forEach(item => {
      if (item.textContent.trim() === selectedPartition) {
        item.classList.add('active');
      }
    });
    expandSectionIfPartitionSelected(); // Expand section if subsection is selected
  }
}

function expandSectionIfPartitionSelected() {
  const sectionItems = document.querySelectorAll('.section-item');

  sectionItems.forEach(item => {
    const sectionToggle = item.querySelector('.section-toggle'); // Ensure this exists
    if (!sectionToggle) return; // Skip if not found

    const sectionName = sectionToggle.textContent.trim().split(' ')[0]; // Get section name
    if (sectionName === selectedSection) {
      const toggleIcon = item.querySelector('.toggle-icon'); // Ensure this exists
      if (toggleIcon && !toggleIcon.classList.contains('rotated')) {
        togglePartitions(item, sectionName);
      }
    }
  });
}

function filterBooksBySection(section) {
  selectedSection = section;
  selectedPartition = null;
  filteredBooks = books.filter(book => book.section === section);  
  updateSortButtonsVisibility(filteredBooks);
  currentPage = 1;  
  displayBooks(filteredBooks, fieldState);
  resetFiltersConst()
  clearSearch()
  catalogModal.style.display = 'none';
  updateCurrentFilterDisplay();
}

function filterBooksBySectionPartition(section, partition) {
  selectedSection = section;
  selectedPartition = partition;
  filteredBooks = books.filter(book => {
    return book.section === section && (partition === 'Without subsection' ? !book.partition : book.partition === partition);
  });  
  updateSortButtonsVisibility(filteredBooks);
  currentPage = 1;  
  displayBooks(filteredBooks, fieldState);
  scrollToTop()
  resetFiltersConst()
  clearSearch()
  catalogModal.style.display = 'none';
  updateCurrentFilterDisplay();
  expandSectionIfPartitionSelected(); //Expand section
}


const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme); 
  try {
      localStorage.setItem('theme', theme);
  } catch (error) {
    //  console.error("Error writing theme to localStorage:", error.message);
  }
  
  const sunIcon = themeToggle.querySelector('.icon-sun');
  const moonIcon = themeToggle.querySelector('.icon-moon');
  if (theme === 'dark') {
      sunIcon.style.transform = 'rotate(-180deg) scale(0)';
      moonIcon.style.transform = 'rotate(0deg) scale(1)';
  } else {
      sunIcon.style.transform = 'rotate(0deg) scale(1)';
      moonIcon.style.transform = 'rotate(180deg) scale(0)';
  }
};

themeToggle?.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  setTheme(currentTheme === 'light' ? 'dark' : 'light');
});    

// Safe functions for reading and writing to localStorage
const initTheme = () => {
  let savedTheme;        
 
  try {
      savedTheme = localStorage.getItem('theme');
  } catch (error) {
    //  console.error("Error reading theme from localStorage:", error.message);
      savedTheme = null; 
  }

  const urlTheme = new URLSearchParams(window.location.search).get('theme');
  const browserTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';        
  
  setTheme(urlTheme || savedTheme || browserTheme || 'light');
};    

initTheme();


// Function to show spinner when loading
function showLoadingSpinner() {
  loadingSpinner.style.display = 'block';
}

// Function to hide the spinner after loading
function hideLoadingSpinner() {
  loadingSpinner.style.display = 'none';
}

async function fetchBooks() {
  try {    
    showLoadingSpinner();    
    
    const formData = new FormData();
    formData.append('isReviews', 10);
    const response = await fetch(URLAPI, {
      method: 'POST',
      body: formData,
      redirect: 'follow'
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Error fetching combined data');

    books = data.data.sheet1Data
      ? data.data.sheet1Data.filter((book) => book && book.Visibility !== '0')
      : [];
    fieldState = data.data.sheet2Data?.[0] || {};    
    filteredBooks = books;  
    
    catalogFilterSearch.style.display = 'flex';
    displayBooks(filteredBooks, fieldState);
    
    if (fieldState.idprice) {
      fetchReviews(fieldState.idprice);
    }

  } catch (error) {
    console.error('Error fetching books:', error);
    errorMessage.style.display = 'block';
  } finally {
    hideLoadingSpinner();
  }
}

// function for downloading reviews
async function fetchReviews(idPrice) {
  try {
    const formDataReviews = new FormData();
    formDataReviews.append('isReviews', 1);
    formDataReviews.append('idPrice', idPrice);
    const responseReviews = await fetch(URLAPI, {
      method: 'POST',
      body: formDataReviews,
      redirect: 'follow'
    });

    const dataReviews = await responseReviews.json();
    if (!dataReviews.success) throw new Error(dataReviews.message || 'Failed to fetch review data');

    aggregatedData = dataReviews.data || [];    
    
    updateBooksWithReviews(aggregatedData);

  } catch (error) {
    console.error('Error fetching reviews:', error);
  }
}

// Book update function after downloading reviews
function updateBooksWithReviews(reviews) {
  books = books.map(book => {
    const bookReviews = reviews.find(review => review.bookId === book.id);
    return {
      ...book,
      reviews: bookReviews ? bookReviews.reviews : [],
      rating: bookReviews ? bookReviews.rating : null
    };
  });
  
  displayBooks(books, fieldState);
}



if (filtersButton) {
    filtersButton.addEventListener('click', () => {
       showFilterModal();      
    });
}

let selectedFilters = {};
let filtered =[];
let expandedSections = new Set(); 

function resetFiltersConst () { 
  selectedFilters = {};  
  resetFilter();
}


document.getElementById('apply-filters').addEventListener('click', applyFilters);
document.getElementById('reset-filters').addEventListener('click', resetFilter);
document.getElementById('close-filters-modal').addEventListener('click', ()=> closeModal(filterModal));

function updateFilters(tag, value, isChecked) { 
  
  if (!selectedFilters[tag]) {
    selectedFilters[tag] = [];
  }

  if (!tag || value === undefined) {
      console.error('Tag or value is missing:', { tag, value });
      return;
  }

  if (isChecked) {
      selectedFilters[tag] = selectedFilters[tag] || [];
      if (!selectedFilters[tag].includes(value)) {
          selectedFilters[tag].push(value);
      }
  } else {
      selectedFilters[tag] = selectedFilters[tag].filter(val => val !== value);
      if (selectedFilters[tag].length === 0) {
          delete selectedFilters[tag];
      }
  }
  
  filterBooksByTags(selectedFilters);
  updateButtonStates();
}

function filterBooks(selectedFilters, books, minRangeValue, maxRangeValue) {
  let filtered = books.filter(book => 
      Object.entries(selectedFilters).every(([tag, values]) =>
          values.some(value => book[tag] == value)
      )
  );
  
  if (minRangeValue !== undefined && maxRangeValue !== undefined) {
      filtered = filtered.filter(book => {
          let price = parsePrice(book.price);
          return price !== undefined && price >= minRangeValue && price <= maxRangeValue;
      });
  }

  return filtered;
}

function filterBooksByTags(selectedFilters) {
  filtered = filterBooks(selectedFilters, filteredBooks, minRangeValue, maxRangeValue);
  applyFilter(filtered);  
  const uniqueTags = getUniqueTags(filteredBooks, selectedFilters);  
  renderFilterSections(uniqueTags);  
  updateButtonStates();
  document.getElementById('filter-count').textContent = `Found: ${filtered.length}`;
}

function applyFilters() {
  let filtered = filterBooks(selectedFilters, filteredBooks, minRangeValue, maxRangeValue);

  if (filtered.length > 0) {
      forceShowApply = false;
      updateButtonStates();
      currentPage = 1;
      displayBooks(filtered, fieldState);
      scrollToTop();
      updateSortButtonsVisibility(filtered);      
  } 
}

function updateButtonStates() {
  const hasSelectedFilters = Object.values(selectedFilters).some(arr => arr.length);
  const isPriceFiltered = minRangeValue != undefined && maxRangeValue != undefined;
  const filteredBooksList = filterBooks(selectedFilters, filteredBooks, minRangeValue, maxRangeValue);

  const shouldShowApply = forceShowApply || ((hasSelectedFilters || isPriceFiltered) && filteredBooksList.length > 0);
  const shouldShowReset = hasSelectedFilters || isPriceFiltered;

  applyFiltersButton.style.display = shouldShowApply ? 'block' : 'none';
  resetFiltersButton.style.display = shouldShowReset ? 'block' : 'none';
}


function processTags(uniqueTags, preferredTags, fieldState) {
  // Creating a map for priority tags
  const preferredTagMap = new Map(preferredTags.map((tag, index) => [tag, index]));

  const preferredTagObjects = [];
  const otherTagObjects = [];
  
  uniqueTags.forEach(tagObj => {
    if (preferredTagMap.has(tagObj.tagName)) {
      preferredTagObjects.push(tagObj);
    } else {
      otherTagObjects.push(tagObj);
    }
  });
  
  preferredTagObjects.sort((a, b) => preferredTagMap.get(a.tagName) - preferredTagMap.get(b.tagName));
  
  const sortedTags = [...preferredTagObjects, ...otherTagObjects].map(tagObj => {
    let sectionTitle = tagObj.tagName;    
    const fieldStateValue = fieldState && fieldState[tagObj.tagName];
    
    if (fieldStateValue) {      
      // If fieldState has several values ​​(separated by ;), split them
      if (fieldStateValue.includes(';')) {
        const parts = fieldStateValue.split(';').filter(Boolean);        
        parts.forEach(part => {
          const [key, title] = part.split('~');          
          if (key && title && selectedSection == key) {
            sectionTitle = title;
          }
        });
      } else {        
        sectionTitle = fieldStateValue || tagObj.tagName;
      }
    }
    return { ...tagObj, sectionTitle };
  });
  return sortedTags;
}


// Function to get unique tags based on current filters
function getUniqueTags(books, selectedFilters = {}) {
  const tagsMap = {};

  books.forEach(book => {
      Object.entries(book).forEach(([key, value]) => {
          if ((key.startsWith('tags') || ['color', 'size', 'author'].includes(key)) && value) {
              
              // If the tag is already selected, add ALL its values
              if (selectedFilters[key]) {
                  tagsMap[key] = tagsMap[key] || new Set();
                  tagsMap[key].add(value);
              } 
              // ЕIf a tag is not selected, add only available ones
              else {
                  const booksWithSelected = books.filter(b => 
                      Object.entries(selectedFilters).every(([tag, values]) =>
                          values.some(v => b[tag] == v)
                      )
                  );

                  const availableValues = booksWithSelected.map(b => b[key]).filter(v => v);
                  if (availableValues.includes(value)) {
                      tagsMap[key] = tagsMap[key] || new Set();
                      tagsMap[key].add(value);
                  }
              }
          }
      });
  });
  
  let uniqueTags = Object.entries(tagsMap).map(([tagName, values]) => ({
    tagName,
    values: Array.from(values)
  }));  
  
  uniqueTags = processTags(uniqueTags, preferredTags, fieldState);  
  return uniqueTags;  
}

// Function to render sections and partitions for the filter modal
function renderFilterSections(uniqueTags) {    
  const sectionList = document.getElementById('filters-section-list');
  sectionList.innerHTML = '';  
  const sortedTags = processTags(uniqueTags, preferredTags, fieldState);
  sortedTags.forEach(tagObj => {
      if (tagObj && tagObj.values.length > 0) {
          const sectionItem = document.createElement('li');
          sectionItem.classList.add('section-item');

          sectionItem.innerHTML = `
              <div class="section-toggle">
                  ${tagObj.sectionTitle}
                  ${tagObj.values.length > 0 ? getToggleIconHTML() : ''}
              </div>`;

          const toggleIcon = sectionItem.querySelector('.toggle-icon');
          if (toggleIcon) {
              toggleIcon.addEventListener('click', (e) => {
                  e.stopPropagation();
                  togglePartitionsFilters(sectionItem, tagObj.tagName, uniqueTags);
              });
          }

          sectionItem.addEventListener('click', (event) => {
              if (event.target !== toggleIcon && !event.target.classList.contains('filter-checkbox')) {
                  togglePartitionsFilters(sectionItem, tagObj.tagName, uniqueTags);
              }
          });

          sectionList.appendChild(sectionItem);

          // Auto-opening if the section was previously expanded
          if (expandedSections.has(tagObj.tagName)) {
              togglePartitionsFilters(sectionItem, tagObj.tagName, uniqueTags);
          }
      }
  });
}



function togglePartitionsFilters(sectionItem, tagName, uniqueTags) {
  const toggle = sectionItem.querySelector('.toggle-icon');
  const existingPartitionList = sectionItem.querySelector('.partition-container');

  if (!toggle) return;

  if (existingPartitionList) {
      existingPartitionList.remove();
      toggle.classList.remove('rotated');
      expandedSections.delete(tagName); 
  } else {
      const partitionList = document.createElement('ul');
      partitionList.classList.add('partition-container');

      const tagObj = uniqueTags.find(tag => tag.tagName === tagName);
      if (!tagObj) return;
  // color-circle
      let colorRGB = {};
    if (fieldState?.colorblock) {
      colorRGB = fieldState.colorblock
        .split(';')
        .map(colorItem => colorItem.split(':'))
        .reduce((acc, [colorName, rgb]) => {
          if (colorName && rgb) {
            acc[colorName.trim()] = rgb.trim().slice(1, -1);
          }
          return acc;
        }, {});
    }

      tagObj.values.forEach(value => {        
          if (value) {
            const isColor = tagName.toLowerCase() === 'color';            
            const trimmedValue = typeof value === 'string' ? value.trim() : String(value).trim();

            const rgbValue = isColor && colorRGB[trimmedValue] ? `rgb(${colorRGB[trimmedValue]})` : null;

              const partitionItem = document.createElement('li');
              partitionItem.classList.add('partition-item');
              partitionItem.innerHTML = `
                  <label>
                      <input type="checkbox" class="filter-checkbox" data-tag="${tagName}" value="${value}">
                      ${value}
                      ${rgbValue ? `<span class='circle' style='background-color: ${rgbValue}'></span>` : ''}
                  </label>
              `;

              const checkbox = partitionItem.querySelector('.filter-checkbox');
              const label = partitionItem.querySelector('label');
              if (checkbox) {
                  let isChecked = false;
                  try {
                      if (Array.isArray(selectedFilters[tagName])) {
                          isChecked = selectedFilters[tagName].map(String).includes(String(value));
                      }
                  } catch (error) {
                      console.error('Error checking checkbox state:', error);
                  }
                  checkbox.checked = isChecked;

                  checkbox.addEventListener('change', (e) => {
                      e.stopPropagation();                      
                      updateFilters(e.target.dataset.tag, e.target.value, e.target.checked);
                  });
                  
              label.addEventListener('click', (e) => {
               e.stopPropagation();
               checkbox.checked = !checkbox.checked;
               checkbox.dispatchEvent(new Event('change', { bubbles: true }));
              });
              }
              partitionList.appendChild(partitionItem);
          }
      });

      sectionItem.appendChild(partitionList);
      toggle.classList.add('rotated');
      expandedSections.add(tagName); // Remember the expanded section
  }
}

// Function to reset filters
function resetFilter() {
  selectedFilters={};

  minRangeValue = undefined;
  maxRangeValue = undefined;
  applyFilter(filteredBooks);

  filtered = [];

  document.querySelectorAll('.filter-checkbox').forEach(checkbox => checkbox.checked = false);
  document.getElementById('filter-count').textContent = '';

  const uniqueTags = getUniqueTags(filteredBooks, selectedFilters);
  renderFilterSections(uniqueTags);
  forceShowApply = false;
  updateButtonStates(); 
  currentPage = 1;       
  displayBooks(filteredBooks, fieldState);
  scrollToTop()
  updateSortButtonsVisibility(filteredBooks);
}

// Helper function to get the toggle icon HTML
function getToggleIconHTML() {
    const template = document.getElementById('toggle-icon-template');
    return template ? template.innerHTML : '';
}

// Helper function for rendering tags with default labels for size and color
function renderTags(book, fieldState) {  
  
  // Create colorRGB object for color mappings
  const colorRGB = fieldState.colorblock
    ? fieldState.colorblock
        .split(';')
        .map(colorItem => colorItem.split(':'))
        .reduce((acc, [colorName, rgb]) => ({ ...acc, [colorName.trim()]: rgb.trim().slice(1, -1) }), {})
    : {};
  
  // Helper function to render specific tag rows
  function renderTagRow(tagKey, selectedBook, fieldState) {
    const selectedTag = selectedBook?.[tagKey] ?? ''; 
    const fieldTag = fieldState?.[tagKey] ?? ''; 
    let sectionField = null;
    let sectionValue = selectedTag;

    if (typeof fieldTag === 'string' && fieldTag.includes(';')) {
      try {
        const tagPairs = fieldTag.split(';').map(pair => pair.split('~').map(s => s.trim()));
        const matchingPair = tagPairs.find(([sectionName]) => sectionName === selectedBook?.section);

        if (matchingPair) {
          sectionField = matchingPair[1]; 
        }
      } catch (error) {
        console.error(`Error parsing tag ${tagKey}: ${error}`);
      }
    }

    if (sectionField) {
      return `<p><b>${sectionField}</b> ${sectionValue}</p>`;
    }
    return `<p><b>${fieldTag || `Tag ${tagKey.slice(-1)}`}</b> ${selectedTag}</p>`;
  }

  return tagFields
    .filter(tagKey => book[tagKey]) // Only if the book has data for the tag
    .map(tagKey => {
      if (['tags5', 'tags6', 'tags7', 'tags8'].includes(tagKey)) {
        return renderTagRow(tagKey, book, fieldState);
      }

      let label = fieldState[tagKey] || (tagKey === 'size' ? 'Size' : tagKey === 'color' ? 'Color' : `Tag ${tagKey.slice(-1)}`);
      
      if (tagKey === 'color' && colorRGB[book[tagKey]?.trim()]) {
        return `<p><b>${label}</b> ${book[tagKey]} 
          <span class='circle' style='background-color: rgb(${colorRGB[book[tagKey]?.trim()]})'></span>
        </p>`;
      }

      return `<p><b>${label}</b> ${book[tagKey]}</p>`;
    })
    .join('');
}

// Helper function to capitalize any word (used for general tags if needed)
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

let previousWidth = window.innerWidth; 
let previousItemsPerPage = itemsPerPage; 

function calculateItemsPerPage(screenWidth) {
  if (screenWidth > LARGE_SCREEN_WIDTH) {
    return ITEMS_PER_PAGE_LARGE_SCREEN;
  } else if (screenWidth > MEDIUM_SCREEN_WIDTH) {
    return ITEMS_PER_PAGE_MEDIUM_SCREEN;
  } else {
    return ITEMS_PER_PAGE_SMALL_SCREEN;
  }
}

function compareArrays(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;

  const validId = id => id !== null && id !== undefined && id !== '';

  const set1 = new Set(arr1.map(obj => validId(obj.id) ? obj.id : null));
  const set2 = new Set(arr2.map(obj => validId(obj.id) ? obj.id : null));

  if (set1.has(null) || set2.has(null)) return false;
  if (set1.size !== set2.size) return false;

  for (let id of set1) {
    if (!set2.has(id)) return false;
  }

  return true;
}

function handleResize() {
  const currentWidth = window.innerWidth;

  if (currentWidth !== previousWidth) {
    previousWidth = currentWidth;
    const newItemsPerPage = calculateItemsPerPage(currentWidth);

    if (newItemsPerPage !== previousItemsPerPage) {
      previousItemsPerPage = newItemsPerPage;
      itemsPerPage = newItemsPerPage;
      currentPage = 1;      
      try {
        let booksToDisplay = searchBooks.length ? 
          (compareArrays(sortedBooks, searchBooks) ? sortedBooks : searchBooks) :
          filtered.length ? 
          (compareArrays(sortedBooks, filtered) ? sortedBooks : filtered) :
          filteredBooks.length ? 
          (compareArrays(sortedBooks, filteredBooks) ? sortedBooks : filteredBooks) :
          [];          
       
        displayBooks(booksToDisplay, fieldState);
        scrollToTop();
      } catch (error) {
        console.error("An error occurred while processing the books: ", error);
      }
    }
  }
}

// First initialization
previousItemsPerPage = calculateItemsPerPage(window.innerWidth);
itemsPerPage = previousItemsPerPage;

function displayBooks(books, fieldState) {
  const bookList = document.getElementById('book-list');
  const bookTemplate = document.getElementById('book-card-template');
  bookList.innerHTML = '';
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = books.slice(startIndex, endIndex);
  paginatedBooks.forEach(book => {
    const bookElement = bookTemplate.content.cloneNode(true);
    const shelfElement = bookElement.querySelector('.shelf-element');
    shelfElement.setAttribute('data-sorted', book.sorted || '');
    shelfElement.setAttribute('data-id', book.id);

    // Set Book ID
    const bookId = book.id ? `ID: ${book.id}` : '';
    bookElement.querySelector('.book-id').textContent = bookId;    
    const productRating = findProductRating(aggregatedData, fieldState.idprice, book.id);
    const ratingDisplay = productRating
      ? renderStars(productRating.Average_Rating) +
        `<span class="review-count">${productRating.Review_Count}</span>`
      : '';
    bookElement.querySelector('.rating-stars').innerHTML = ratingDisplay;

    // Set Image
    const firstImage = getFirstImage(book);   
    const img = bookElement.querySelector('.img-container img');
    img.src = firstImage;
    img.alt = book.title;
    img.setAttribute('onclick', `showMoreInfo(${book.id})`); // Add onclick for image

    // Set Title
    const titleElement = bookElement.querySelector('.book-name');
    titleElement.textContent = book.title;
    titleElement.setAttribute('onclick', `showMoreInfo(${book.id})`); // Add onclick for title

    // Set Price
    const priceContainer = bookElement.querySelector('.book-price');
    const parsedPrice = parsePrice(book.price);
    const parsedSalePrice = parsePrice(book.saleprice);

    priceContainer.innerHTML = parsedSalePrice !== undefined
     ? `<span class="sale-price">${parsedSalePrice} ${fieldState.payment || '$'}</span>
     <span class="original-price">${parsedPrice !== undefined ? parsedPrice : 'N/A'} ${fieldState.payment || '$'}</span>`
    : `${parsedPrice !== undefined ? parsedPrice : 'N/A'} ${fieldState.payment || '$'}`;
    

    // Set Button Action
    const showMoreBtn = bookElement.querySelector('.show-more-btn');
    showMoreBtn.setAttribute('onclick', `showMoreInfo(${book.id})`);

    // Add badge if applicable
    const badgeIcon = getBadgeIcon(book.sorted);
    if (badgeIcon) {
      const imgContainer = bookElement.querySelector('.img-container');
      imgContainer.insertAdjacentHTML('afterbegin', badgeIcon);
    }

   // Update size and color display if available
   const sizeColorDiv = bookElement.querySelector('.book-size-color');
   const sizeColorDisplay = renderSizeColorTags(book, fieldState);  
   
   if (sizeColorDisplay) {
     sizeColorDiv.innerHTML = sizeColorDisplay; 
     sizeColorDiv.classList.add('visible'); 
   } else {
     sizeColorDiv.classList.remove('visible'); 
   }

    // Append to list
    bookList.appendChild(bookElement);
  });

  renderPagination(books, fieldState);
}

function renderStars(averageRating) {
  const fullStars = Math.floor(averageRating);
  const halfStar = averageRating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return `
    ${Array(fullStars).fill().map(() => '<span class="star filled">★</span>').join('')}
    ${halfStar ? '<span class="star half-filled">★</span>' : ''}
    ${Array(emptyStars).fill().map(() => '<span class="star">★</span>').join('')}
  `;
}

function getFirstImage(book) {
  const getFirstValidImage = (images, prefix = '') =>
    images?.split(',').map(img => img.trim()).find(img => img) ? `${prefix}${images.split(',').map(img => img.trim()).find(img => img)}` : '';

  return (
    (book.imagepublic && `img/publik/${book.imagepublic.trim()}`) ||
    getFirstValidImage(book.imageblockpublic, 'img/publik/') ||
    (book.image && book.image.trim()) ||
    getFirstValidImage(book.imageblock) ||
    'img/imageNotFound.png'
  );
}

function getBadgeIcon(sorted) {
  const badgeIcons = document.getElementById('badge-icons');
  if (sorted === 'new') {
    return badgeIcons.querySelector('#icon-new').innerHTML;
  } else if (sorted === 'sale') {
    return badgeIcons.querySelector('#icon-sale').innerHTML;
  } else if (sorted === 'popular') {
    return badgeIcons.querySelector('#icon-popular').innerHTML;
  }
  return '';
}

function renderPagination(books, fieldState) {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = ''; 

  const totalPages = Math.ceil(books.length / itemsPerPage);
  // Show pagination only if there are more than 1 pages
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.classList.add('page-btn');
    if (i === currentPage) pageButton.classList.add('active');

    pageButton.addEventListener('click', () => {
      currentPage = i;     
      displayBooks(books, fieldState);
      scrollToTop();     
    });

    paginationContainer.appendChild(pageButton);
  }

  // "Show all" button
  const showAllButton = document.createElement('button');
  showAllButton.textContent = 'Show All';
  showAllButton.classList.add('show-all-btn');
  showAllButton.addEventListener('click', () => {
    itemsPerPage = books.length;
    currentPage = 1;    
    displayBooks(filteredBooks, fieldState);
    paginationContainer.innerHTML = ''; 
    scrollToTop();
  });

  paginationContainer.appendChild(showAllButton);
}

// Helper function for rendering only size and color tags
function renderSizeColorTags(book, fieldState) {
  const tagFieldsRender = ['size', 'color'];
  const colorRGB = fieldState.colorblock
    ? fieldState.colorblock
        .split(';')
        .map(colorItem => colorItem.split(':'))
        .reduce((acc, [colorName, rgb]) => ({ ...acc, [colorName.trim()]: rgb.trim().slice(1, -1) }), {})
    : {};

  return tagFieldsRender
    .filter(tagKey => book[tagKey]) 
    .map(tagKey => {
      if (tagKey === 'color' && book[tagKey] && colorRGB[book[tagKey].trim()]) {
        return `<p><b>${fieldState[tagKey] || capitalize(tagKey)}</b> ${book[tagKey]} 
          <span class='circle' style='background-color: rgb(${colorRGB[book[tagKey].trim()]})'></span>
        </p>`;
      }
      return `<p><b>${fieldState[tagKey] || capitalize(tagKey)}</b> ${book[tagKey]}</p>`;
    })
    .join('');
}

function updateSortButtonsVisibility(filtersBooks) {  
  if (!Array.isArray(filtersBooks) || filtersBooks === undefined || filtersBooks.length === 0) { 
    sortButtons.forEach(button => button.style.display = 'none'); 
    catalogButton.style.display = 'inline-block';
    return; 
  }
  sortButtons.forEach(btn => btn.classList.remove('selected')); 
  const availableTypes = new Set(filtersBooks.map(book => book.sorted));
  sortButtons.forEach(button => {
    const buttonType = button.getAttribute('data-type');

    if (buttonType === 'low-price' || buttonType === 'high-price') {
      // Price buttons are shown only if there are more than 1 products
      button.style.display = filtersBooks.length > 1 ? 'inline-block' : 'none';
    } else {
      // Show the button if the type exists
      if (availableTypes.has(buttonType)) {
        button.style.display = 'inline-block';
      } else {
        button.style.display = 'none';
      }
    }
  });

  // The "Categories" button is always visible
  catalogButton.style.display = 'inline-block';  
  filtersButton.style.display = 'inline-block';
  
  // Add the selected style
  filtersButton.classList.toggle('selected', filtered.length > 0);
  catalogButton.classList.toggle('selected', selectedSection !== null || selectedPartition !== null);
  
  
function sortBy(type) {   
  sortedBooks = [...filtersBooks].sort((a, b) => {    
    if (a.sorted == type && b.sorted != type) return -1; 
    if (a.sorted != type && b.sorted == type) return 1;  
    return 0;  
  });  
  displayBooks(sortedBooks, fieldState);
}

function sortByPrice(order) {
  sortedBooks = [...filtersBooks].sort((a, b) => {
    const priceA = parsePrice(a.price);
    const priceB = parsePrice(b.price);
    
    if (priceA === undefined) return 1;
    if (priceB === undefined) return -1;
    
    return order === 'low' ? priceA - priceB : priceB - priceA;
  });   
  displayBooks(sortedBooks, fieldState);
}

sortButtons.forEach(button => {
  button.addEventListener('click', () => {
    sortButtons.forEach(btn => btn.classList.remove('selected'));    
    button.classList.add('selected');
    const type = button.getAttribute('data-type');

    if (type === 'low-price') {
      sortByPrice('low');
    } else if (type === 'high-price') {
      sortByPrice('high');
    } else if (type != null) {      
      sortBy(type);
    }
  
  });
});
}

// debounce function
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

searchInput.addEventListener('input', checkInput);
searchInput.addEventListener('blur', checkInput);
// Restore the previous page before clearing the search
clearButton.addEventListener('click', () => {
  currentPage = previousPage;
  clearSearch();
});

  function checkInput() {
    if (searchInput.value || searchInput === document.activeElement
       || toggleIcon === document.activeElement) {
      searchInput.classList.add('active');
      clearButton.style.display = 'flex';
      filtersButton.style.display = 'none';
      //closeModal(filterModal)
    } else {
      searchInput.classList.remove('active');
      clearButton.style.display = 'none';
      filtersButton.style.display = 'block';
    }
  } 

  let previousPage = currentPage; 

toggleIcon.addEventListener("click", () => {
  toggleIcon.classList.toggle("rotated");
  searchOptions.classList.toggle("show-options");
});

// Search
function searchBooksBy() {
  const searchQuery = searchInput.value.trim().toLowerCase();
  if (!searchQuery) {
    resetToPreviousState();
    return;
  }

  const searchByIdTitle = document.getElementById("search-by-id-title").checked;
  const searchByTags = document.getElementById("search-by-tags").checked;
  const searchByDescription = document.getElementById("search-by-description").checked;
  

  let searchBooks = books.filter(book => {
    let match = false;

    if (searchByIdTitle) {
      match = book.title?.toLowerCase().includes(searchQuery) || book.id?.toLowerCase().includes(searchQuery);
    }

    if (searchByTags) {
      match = match || tagFields.some(tag => book[tag] && String(book[tag]).toLowerCase().includes(searchQuery)) || 
                     preferredTags.some(tag => book[tag] && String(book[tag]).toLowerCase().includes(searchQuery));
    }

    if (searchByDescription) {
      match = match || book.shortDescription?.toLowerCase().includes(searchQuery) ||
                     book.description?.toLowerCase().includes(searchQuery);
    }

    return match;
  });

  if (searchBooks.length > 0) {
    updateStateWithSearchResults(searchBooks);
  } else {
    showNoResults();
  }
}


checkboxes.forEach(checkbox => {
  checkbox.addEventListener("change", searchBooksBy);
});  
  
  function resetToPreviousState() {
    currentPage = previousPage;

    let booksToDisplay = filtered.length ? filtered :
                          filteredBooks.length ? filteredBooks : [];    
    displayBooks(booksToDisplay, fieldState);
    updateSortButtonsVisibility(booksToDisplay);
    noResultsMessage.style.display = 'none';
    bookList.style.display = 'flex';
    paginationContainer.style.display = 'flex';
    currentFilter.style.display = 'block';
  }
  
  function updateStateWithSearchResults(searchBooks) {
    previousPage = currentPage;
    currentPage = 1;    
    displayBooks(searchBooks, fieldState);
    noResultsMessage.style.display = 'none';
    bookList.style.display = 'flex';
    paginationContainer.style.display = 'flex';
    currentFilter.style.display = 'none';
    updateSortButtonsVisibility(searchBooks);
    filtersButton.style.display = 'none';
  }
  
  function showNoResults() {
    currentPage = previousPage;
    noResultsMessage.style.display = 'flex';
    bookList.style.display = 'none';
    paginationContainer.style.display = 'none';
    currentFilter.style.display = 'none';
    updateSortButtonsVisibility([]);
  }
  
  
  // Event handler for search field with debounce
  searchInput.addEventListener('input', debounce(searchBooksBy, 300));
  
  // Function to reset search and display all books
  function clearSearch() {  
      searchInput.value = '';
      searchBooks = []; 
      let booksToDisplay = filtered.length ? filtered :
                          filteredBooks.length ? filteredBooks : [];       
      displayBooks(booksToDisplay, fieldState); 
      noResultsMessage.style.display = 'none';
      bookList.style.display = 'flex'; 
      paginationContainer.style.display = 'flex';        
      updateSortButtonsVisibility(booksToDisplay); 
      clearButton.style.display = 'none'; 
      searchInput.classList.remove('active'); 
      currentFilter.style.display = 'block'; 
  }

// Form elements
const contactForm = document.getElementById('contactForm');
const formResponse = document.getElementById('formResponse');
const emailField = document.getElementById('email');
const messageField = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const contactModal = document.getElementById('contact-modal');
const closeModalContact = document.getElementById('close-modal-contact');
const contactToggleButton = document.querySelector('.contact-toggle');

// Toggle contact form visibility and open modal
contactToggleButton.addEventListener('click', function() {  
        openModal(contactModal);          
});

closeModalContact.addEventListener('click', function() {
    closeModal(contactModal);    
});

// Form Validation
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate input lengths and email format
const validateForm = () => {
  const isEmailValid = emailPattern.test(emailField.value.trim()) &&
      emailField.value.trim().length >= 5 &&
      emailField.value.trim().length <= 256;

  const isMessageValid = messageField.value.trim().length >= 5 && 
      messageField.value.trim().length <= 256;

  submitBtn.disabled = !(isEmailValid && isMessageValid);
};

// Show alerts on blur events for individual fields
emailField.addEventListener('blur', () => {
  const emailValue = emailField.value.trim();
  if (!emailPattern.test(emailValue) || emailValue.length < 6 || emailValue.length > 256) {
      alert('Please enter a valid email address between 5 and 256 characters.');
  }
});

messageField.addEventListener('blur', () => {
  const messageValue = messageField.value.trim();
  if (messageValue.length < 6 || messageValue.length > 256) {
      alert('Message must be between 5 and 256 characters.');
  }
});

// Attach input validation
emailField.addEventListener('input', validateForm);
messageField.addEventListener('input', validateForm);

// Safe function to read from localStorage
function safeReadStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
       // console.error("Error reading from localStorage:", error.message);
        return [];
    }
}

// Safe function to write to localStorage
function safeWriteStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      //  console.error("Error writing to localStorage:", error.message);
    }
}

// Handle form submission
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();   

    submitBtn.disabled = true;
    formResponse.textContent = '';

    const now = Date.now();
    const oneMinute = 60 * 1000;
    let submissions = safeReadStorage('submissions');

    // Remove entries older than one minute
    const recentSubmissions = submissions.filter(timestamp => now - timestamp < oneMinute);
    
    if (recentSubmissions.length >= 5) {
        formResponse.textContent = 'You have reached the maximum of 5 submissions per minute. Please try again later.';
        formResponse.style.color = 'red';
        submitBtn.disabled = false;
        return;
    }

    if (recentSubmissions.length && now - recentSubmissions[recentSubmissions.length - 1] < oneMinute) {
        formResponse.textContent = 'Please wait at least a minute before submitting again.';
        formResponse.style.color = 'red';
        submitBtn.disabled = false;
        return;
    }

    recentSubmissions.push(now);
    safeWriteStorage('submissions', recentSubmissions);

    // Change button text to "Sending..."
    submitBtn.textContent = 'Sending...';

    const formData = new FormData(contactForm);
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxUbPt7dwfbK928m-KRled0s4km18cJCgZHV9Nohf7MnvCoxxrSvMXqs1zblzi1wWfq/exec', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            formResponse.textContent = 'Message sent successfully!';
            formResponse.style.color = 'green';
            contactForm.reset();
        } else {
            formResponse.textContent = 'Error sending message. Please try again later.';
            formResponse.style.color = 'red';
        }
    } catch (error) {
        console.error('Error sending form:', error.message);
        formResponse.textContent = 'Error connecting to the server. Please try again.';
        formResponse.style.color = 'red';
    } finally {
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
    }
});


// Sort by price
let minRangeValue = undefined;
let maxRangeValue = undefined;

const priceFilter = document.getElementById("price-filter");
const minRange = document.getElementById("minRange");
const maxRange = document.getElementById("maxRange");
const minInput = document.getElementById("minInput");
const maxInput = document.getElementById("maxInput");
const applyButton = document.getElementById("applyButton");
const resetButton = document.getElementById("resetButton");
const minCurrencySpan = document.getElementById('minCurrency');
const maxCurrencySpan = document.getElementById('maxCurrency');

minRange.addEventListener("input", handleRangeChange);
maxRange.addEventListener("input", handleRangeChange);
minInput.addEventListener("input", () => handleInputChange(minInput));
maxInput.addEventListener("input", () => handleInputChange(maxInput));
minInput.addEventListener("blur", () => handleInputBlur(minInput, minRange, true));
maxInput.addEventListener("blur", () => handleInputBlur(maxInput, maxRange, false));
applyButton.addEventListener("click", handleApply);
resetButton.addEventListener("click", handleReset);

let minPrice = undefined;
let maxPrice = undefined;

function getPriceRange(filteredBooks) {
  let min = Infinity;
  let max = -Infinity;

  filteredBooks.forEach(book => {
    let price = parsePrice(book.price);    
    if (price !== undefined) {
      if (price < min) min = price;
      if (price > max) max = price;
    }
  });
  
  if (min === Infinity || max === -Infinity || min == max) {
    if (priceFilter) {
      priceFilter.style.display = "none";
    }
    return { min: undefined, max: undefined };
  }
  
  if (priceFilter) {
    priceFilter.style.display = "block";
  }
  return { min, max };
}

function parsePrice(priceString) {
  try {
    // Convert number to string if a number is passed
    if (priceString !== undefined && typeof priceString === 'number') {
      return priceString;
    }

    if (!priceString || !priceString.trim() || priceString === 'null') return undefined;

    // Remove all characters except digits, dots, and commas
    priceString = priceString.replace(/[^\d.,-]/g, '');

    // Handling cases with commas and dots
    const commaCount = (priceString.match(/,/g) || []).length;
    const dotCount = (priceString.match(/\./g) || []).length;

    if (commaCount === 1 && dotCount === 0) {
      // One comma, replace with dot
      priceString = priceString.replace(',', '.');
    } else if (commaCount > 0 && dotCount === 1) {
      // Commas and one dot, remove all commas
      priceString = priceString.replace(/,/g, '');
    } else if (commaCount > 0 && dotCount === 0) {
      // No dots, replace the last comma with a dot, remove the rest
      const lastCommaIndex = priceString.lastIndexOf(',');
      priceString = priceString.slice(0, lastCommaIndex).replace(/,/g, '') + '.' + priceString.slice(lastCommaIndex + 1).replace(/,/g, '');
    }

    // Convert the string to a number
    const price = parseFloat(priceString);

    return isNaN(price) ? undefined : price;
  } catch (error) {    
    return undefined;
  }
}

// Function to update currency symbols
function updateCurrencySymbols() {
  if (typeof fieldState === 'undefined' || !fieldState.payment) {
    return; 
  }

  const paymentCurrency = fieldState.payment;
  if (!document.getElementById('minCurrency') || !document.getElementById('maxCurrency')) {
    return; 
  }

  if (paymentCurrency && paymentCurrency !== 'null' && paymentCurrency !== '') {
    const minCurrencySpan = document.getElementById('minCurrency');
    const maxCurrencySpan = document.getElementById('maxCurrency');

    minCurrencySpan.textContent = ` ${paymentCurrency}`;
    maxCurrencySpan.textContent = ` ${paymentCurrency}`;
  }
}

function applyFilter(filteredBooks) {  
  const { min, max } = getPriceRange(filteredBooks);
  
  if (min === undefined || max === undefined) {
    return;
  }

  minPrice = min;
  maxPrice = max;

  minRange.min = min;
  minRange.max = max;
  maxRange.min = min;
  maxRange.max = max;
  
  minRange.value = (minRangeValue !== undefined ? minRangeValue : min).toFixed(2);
  maxRange.value = (maxRangeValue !== undefined ? maxRangeValue : max).toFixed(2);  
  minInput.value = minRange.value;  
  maxInput.value = maxRange.value;

  updateButtonVisibility();
}

function updateButtonVisibility() {
  const minRangeValueDefined = minRangeValue !== undefined;
  const maxRangeValueDefined = maxRangeValue !== undefined;

  const isApplyVisible =
    (!minRangeValueDefined && minInput.value != minPrice) ||
    (minRangeValueDefined && minInput.value != parseFloat(minRangeValue)) ||
    (!maxRangeValueDefined && maxInput.value != maxPrice) ||
    (maxRangeValueDefined && maxInput.value != parseFloat(maxRangeValue));

  const isResetVisible = minRangeValueDefined && maxRangeValueDefined;  

  applyButton.style.display = isApplyVisible ? "block" : "none";
  resetButton.style.display = isResetVisible ? "block" : "none";
}


function validateInput(value) {
  return value === '' || /^[0-9]*\.?[0-9]*$/.test(value);
}

function handleRangeChange() {
  if (parseFloat(minRange.value) > parseFloat(maxRange.value)) {
    maxRange.value = minRange.value; 
  }

  minInput.value = minRange.value;  
  maxInput.value = maxRange.value;

  updateButtonVisibility();
}

function handleInputChange(input) {
  if (!validateInput(input.value)) {
    input.value = input.value.slice(0, -1); 
  }

  updateButtonVisibility();
}

function handleInputBlur(input, range, isMin) {
  let value = parseFloat(input.value);
  if (isNaN(value) || value < minPrice || value > maxPrice) {
    input.value = isMin ? minPrice : maxPrice;
    value = isMin ? minPrice : maxPrice;
  }

  if (isMin && value > parseFloat(maxInput.value)) {
    value = parseFloat(maxInput.value);
  }

  if (!isMin && value < parseFloat(minInput.value)) {
    value = parseFloat(minInput.value);
  }
  input.value = value;
  range.value = value;
}

function handleApply() {  
  minRangeValue = parseFloat(minRange.value);
  maxRangeValue = parseFloat(maxRange.value);
  filterBooksByTags(selectedFilters);
  updateButtonVisibility();
}

function handleReset() {
  minRange.value = minPrice;
  maxRange.value = maxPrice;
  minInput.value = minPrice;
  maxInput.value = maxPrice;
 
  minRangeValue = undefined;
  maxRangeValue = undefined;
  
  filterBooksByTags(selectedFilters);
  updateButtonVisibility();
  applyFiltersButton.style.display = 'block';
  forceShowApply = true;
}
