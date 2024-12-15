const URLAPI = 'https://script.google.com/macros/s/AKfycbxFZwSOjMbKYn6J81HYdcK0Y8MM2YH4tYjBjRha_sLgPrmpjEOpjUYccq5zAJQVt1RD/exec';
//const URLAPI = 'https://script.google.com/macros/s/AKfycbxGXnRt_9VFqY9K8-j3Jdx7uMOfbYxAg6ug5mt7Uim5i_wuDUg4I1J0iLpblKB9xp0zIQ/exec';
const globalURL = 'https://anjibarik.github.io/do/#/BookList/1';
let books = []; 
let filteredBooks = [];
let fieldState = {};
let aggregatedData = [];

const bookList = document.getElementById('book-list');
const paginationContainer = document.getElementById('pagination');
const loadingSpinner = document.getElementById('loading-spinner');
const themeToggle = document.getElementById('theme-toggle');
const seeMoreButton = document.getElementById('see-more-btn');
const mainHeader = document.getElementById('main-header');
const filtersSection = document.querySelector('.filters');  
const scrollToTopButton = document.getElementById('scroll-to-top-btn'); 
const catalogButton = document.getElementById('catalog-button');
const catalogModal = document.getElementById('catalog-modal');
const closeCatalogModal = document.getElementById('close-catalog-modal');
const sectionList = document.getElementById('section-list');
const currentFilter = document.getElementById('current-filter');
const bookTitleElem = document.getElementById('book-title');
const bookDescriptionElem = document.getElementById('book-description');
const bookAuthorElem = document.getElementById('book-author');
const bookPriceElem = document.getElementById('book-price');
const bookTagsElem = document.getElementById('book-tags');
const imageGallery = document.getElementById('image-gallery');
const bookModalImg = document.getElementById('book-modal-img');
const modalElem = document.getElementById('modal');
const bookID = document.getElementById('book-ID');
const bookRatingElem = document.getElementById('book-rating'); 
const closeModalButton = document.getElementById('close-modal');
const modal = document.getElementById('modal');
const searchInput = document.getElementById('search-input');
const noResultsMessage = document.getElementById('no-results-message');
const sortButtons = document.querySelectorAll('.sort-button:not(#catalog-button)');
const clearButton = document.getElementById('clear-search-btn');
const positions = document.querySelectorAll('.position');
const indicators = document.querySelectorAll('.indicator');
const mainImage = document.getElementById('main-image');
const descriptionParagraph = document.querySelector('.description-container p'); 
let selectedSection = null;
let selectedPartition = null; 
let currentIndex = 0;
let userInteracted = false;
const delay = 3000;
let autoRotateInterval;
let isLoading = false;

const ITEMS_PER_PAGE_LARGE_SCREEN = 20;
const ITEMS_PER_PAGE_MEDIUM_SCREEN = 10;
const ITEMS_PER_PAGE_SMALL_SCREEN = 5;
const LARGE_SCREEN_WIDTH = 1200;
const MEDIUM_SCREEN_WIDTH = 700;
let currentPage = 1; 
let itemsPerPage = 1;
 
searchInput.value = '';

const floatingButton = document.createElement('button');
floatingButton.classList.add('floating-button');
floatingButton.textContent = 'GET FIRST DIBS!';
document.body.appendChild(floatingButton); 

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

        updateSortButtonsVisibility();

        removePositionListeners(); 
      })
      .catch((error) => {
        console.error('Error loading data:', error);
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

   // Scroll event handler
   window.addEventListener('scroll', updateScrollProgress);

  // Function to update scrolling progress
  function updateScrollProgress() {
    const scrollTop = window.scrollY; // Current scroll position
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // Full Page Height
    const scrollPercent = (scrollTop / docHeight) * 100; // Scroll percentage

    // Update the background gradient for progress
    const progress = scrollToTopButton.querySelector('.scroll-progress');
    if (progress) {
      // Set progress color depending on scrolling
      progress.style.background = `conic-gradient(#4caf50 ${scrollPercent}%, #ddd ${scrollPercent}% 100%)`;
    }

    // Show/hide the button depending on scrolling
    if (scrollTop > 100) {
      scrollToTopButton.style.display = 'flex';
    } else {
      scrollToTopButton.style.display = 'none';
    }
  } 

// Open Closing a modal window 
function openModal(modal) {
  modal.style.display = 'block';
}

function closeModal(modal) {
  modal.style.display = 'none';
}

function handleOutsideClick(event, modal) {
  if (event.target === modal) {
    closeModal(modal);
  }
}

function handleEscapeKey(event) {
  if (event.key === 'Escape') {
    closeModal(catalogModal);
    closeModal(modal);
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
});

window.addEventListener('keydown', handleEscapeKey);


// Main function to display book details in a modal
window.showMoreInfo = function(bookId) {
  const book = books.find(b => b.id == bookId);     
  if (!book) {
    console.error('Book not found for ID:', bookId);
    return;
  }

  // Update modal content elements
  if (bookID) bookID.textContent = `ID: ${bookId}`;
  if (bookTitleElem) bookTitleElem.textContent = book.title;
  if (bookDescriptionElem) bookDescriptionElem.textContent = book.description || 'No description';
  if (bookAuthorElem) bookAuthorElem.textContent = `Author: ${book.author || 'Unknown'}`;  
  if (bookPriceElem) { if (book.saleprice && book.saleprice.trim() !== '')
     { bookPriceElem.innerHTML = `
      <span class="sale-price">${book.price} ${fieldState.payment || '$'}</span>
      <span class="original-price">${book.saleprice} ${fieldState.payment || '$'}</span> `; }
  else { bookPriceElem.textContent = `Price: ${book.price ? `${book.price} ${fieldState.payment}` : 'Price not specified'}`; } }
  if (bookTagsElem) bookTagsElem.innerHTML = renderTags(book, fieldState);

  // Rating Data Processing
  const productRating = aggregatedData.find(
    (item) => `${item.ID_Price}` === `${fieldState.idprice}` && `${item.ID_Product}` === `${book.id}`
  );

  // Render star rating
  const renderStars = (averageRating) => {
    const fullStars = Math.floor(averageRating);
    const halfStar = averageRating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return `
      <span class="rating-stars">
        ${Array(fullStars).fill().map(() => '<span class="star filled">★</span>').join('')}
        ${halfStar ? '<span class="star half-filled">★</span>' : ''}
        ${Array(emptyStars).fill().map(() => '<span class="star">★</span>').join('')}
      </span>
    `;
  };

  // Display Rating and Review Count if rating data is available
  if (bookRatingElem) {
    bookRatingElem.innerHTML = productRating
      ? `
        ${renderStars(productRating.Average_Rating)}
        <span class="review-count">${productRating.Review_Count} </span>
      `
      : ''; // Display a message if no rating data is found
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
      //Checking image loading
      img.onerror = function() {
        this.onerror = null;
        this.src = 'img/imageNotFound.png';
      };
      img.onclick = () => changeImage(image.trim());
      imageGallery.appendChild(img);
    });
  
    // Set the first image if available
    if (bookModalImg && images.length > 0) {
      bookModalImg.src = images[0].trim();
      bookModalImg.onerror = function() {
        this.onerror = null;
        this.src = 'img/imageNotFound.png';
      };
    }
  }

  // Show the modal if it exists
  if (modalElem) {
    modalElem.style.display = 'block';
  }
};

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
      const fullscreenContainer = document.createElement('div');
      fullscreenContainer.id = 'fullscreen-container';
      fullscreenContainer.classList.add('fullscreen-overlay');

      // Copy the image into the new container
      const fullscreenImage = img.cloneNode();
      fullscreenImage.classList.add('fullscreen-image');
      
      // Add a close button for exiting fullscreen mode
      const closeButton = document.createElement('div');
      closeButton.id = 'close-fullscreen-btn';
      closeButton.classList.add('close-fullscreen');
      closeButton.innerHTML = '&times;';
      closeButton.onclick = function() {
        document.body.removeChild(fullscreenContainer); // Remove the fullscreen container
      };

      // Add the image and close button to the container
      fullscreenContainer.appendChild(fullscreenImage);
      fullscreenContainer.appendChild(closeButton);

      // Add the container to the page
      document.body.appendChild(fullscreenContainer);
    }
  };
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
    partitionLink.addEventListener('click', () => filterBooks(selectedSection, selectedPartition));
    currentFilter.appendChild(document.createTextNode(' / '));
    currentFilter.appendChild(partitionLink);
  }

  currentFilter.style.display = 'block'; 
}

function resetFilters() {
  selectedSection = null;
  selectedPartition = null;
  displayBooks(books, fieldState);
  catalogModal.style.display = 'none';
  updateCurrentFilterDisplay();
}

function renderSections() {
  sectionList.innerHTML = '';   
  const showAllItem = document.createElement('li');
  showAllItem.textContent = ' Show all';
  showAllItem.classList.add('section-item');
  if (!selectedSection && !selectedPartition) {
    showAllItem.classList.add('active'); 
  }
  showAllItem.addEventListener('click', resetFilters);
  sectionList.appendChild(showAllItem);

  const uniqueSections = [...new Set(books.map(book => book.section))];

  uniqueSections.forEach(section => {
    const li = document.createElement('li');
    li.innerHTML = `<div class="section-toggle">${section} ${
      hasPartitions(section) ? '<span class="toggle">+</span>' : ''
    }</div>`;
    li.classList.add('section-item');

    const toggle = li.querySelector('.toggle');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePartitions(li, section);
      });
    }

    li.addEventListener('click', (event) => {
      if (event.target.classList.contains('toggle')) return; 
      selectedSection = section;
      selectedPartition = null;
      filterBooksBySection(section);  
    });
    

    sectionList.appendChild(li);
  });
}

function hasPartitions(section) {
  return books.some(book => book.section === section && book.partition);
}

function togglePartitions(liElement, section) {
  const toggle = liElement.querySelector('.toggle');
  const existingContainer = liElement.querySelector('.partition-container');

  if (!toggle) return;

if (existingContainer ) {
  existingContainer.remove();
  toggle.textContent = '+';
  } else {
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
        filterBooks(section, partition);
      });

      partitionContainer.appendChild(partitionLi);
    });

    liElement.appendChild(partitionContainer);
    toggle.textContent = '-';
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
    const sectionName = item.textContent.trim().split(' ')[0]; // Get section name
    if (sectionName === selectedSection) {
      const toggle = item.querySelector('.toggle');

      if (toggle && toggle.textContent === '+') {        
        togglePartitions(item, sectionName);
      }
    }
  });
}

function filterBooksBySection(section) {
  selectedSection = section;
  selectedPartition = null;
  filteredBooks = books.filter(book => book.section === section);  
  updateSortButtonsVisibility()
  displayBooks(filteredBooks, fieldState);
  catalogModal.style.display = 'none';
  updateCurrentFilterDisplay();
}

function filterBooks(section, partition) {
  selectedSection = section;
  selectedPartition = partition;
  filteredBooks = books.filter(book => {
    return book.section === section && (partition === 'Without subsection' ? !book.partition : book.partition === partition);
  });  
  updateSortButtonsVisibility()
  displayBooks(filteredBooks, fieldState);
  catalogModal.style.display = 'none';
  updateCurrentFilterDisplay();
  expandSectionIfPartitionSelected(); //Expand section
}


const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme); 
  try {
      localStorage.setItem('theme', theme);
  } catch (error) {
      console.error("Error writing theme to localStorage:", error.message);
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
      console.error("Error reading theme from localStorage:", error.message);
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

// Function for getting data from API
async function fetchBooks() {
  try {
    showLoadingSpinner();
    const formData = new FormData();
    formData.append('isReviews', 10);

    const response = await fetch(URLAPI, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!data.success) throw new Error(data.message || 'Error fetching combined data');

    books = data.data.sheet1Data
    ? data.data.sheet1Data.filter((book) => book && book.Visibility !== '0')
    : [];
    fieldState = data.data.sheet2Data?.[0] || {};    
    filteredBooks = books
    if (fieldState.idprice) {
      const formDataReviews = new FormData();
      formDataReviews.append('isReviews', 1);
      formDataReviews.append('idPrice', fieldState.idprice);

      const responseReviews = await fetch(URLAPI, {
        method: 'POST',
        body: formDataReviews,
      });

      const dataReviews = await responseReviews.json();

      if (!dataReviews.success) throw new Error(dataReviews.message || 'Failed to fetch review data');
      
      aggregatedData = dataReviews.data || [];     
     
    }

    document.querySelector('.filters').style.display = 'flex';

    displayBooks(books, fieldState);
  } catch (error) {
    console.error('Error fetching books:', error);
  } finally {
    hideLoadingSpinner();
  }
}

// Helper function for rendering tags with default labels for size and color
function renderTags(book, fieldState) {
  const tagFields = ['size', 'color', 'tags1', 'tags2', 'tags3', 'tags4', 'tags5', 'tags6', 'tags7', 'tags8'];
  
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
      return `<p><b>${sectionField}:</b> ${sectionValue}</p>`;
    }
    return `<p><b>${fieldTag || `Tag ${tagKey.slice(-1)}`}:</b> ${selectedTag}</p>`;
  }

  return tagFields
    .filter(tagKey => book[tagKey]) // Only if the book has data for the tag
    .map(tagKey => {
      if (['tags5', 'tags6', 'tags7', 'tags8'].includes(tagKey)) {
        return renderTagRow(tagKey, book, fieldState);
      }

      let label = fieldState[tagKey] || (tagKey === 'size' ? 'Size' : tagKey === 'color' ? 'Color' : `Tag ${tagKey.slice(-1)}`);
      
      if (tagKey === 'color' && colorRGB[book[tagKey]?.trim()]) {
        return `<p><b>${label}:</b> ${book[tagKey]} 
          <span class='circle' style='background-color: rgb(${colorRGB[book[tagKey]?.trim()]})'></span>
        </p>`;
      }

      return `<p><b>${label}:</b> ${book[tagKey]}</p>`;
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

function handleResize() {
  const currentWidth = window.innerWidth;
  
  if (currentWidth !== previousWidth) {
    previousWidth = currentWidth; 
    const newItemsPerPage = calculateItemsPerPage(currentWidth);
    
    if (newItemsPerPage !== previousItemsPerPage) {
      previousItemsPerPage = newItemsPerPage; 
      itemsPerPage = newItemsPerPage; 
      currentPage = 1; 
      displayBooks(filteredBooks, fieldState);       
      scrollToTop();      
    }
  }
}

// Debounce resize event
 window.addEventListener('resize', debounce(handleResize, 150));

// First initialization
previousItemsPerPage = calculateItemsPerPage(window.innerWidth);
itemsPerPage = previousItemsPerPage;
displayBooks(books, fieldState);

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

    // Set Rating
    const productRating = aggregatedData.find(
      item => `${item.ID_Price}` === `${fieldState.idprice}` && `${item.ID_Product}` === `${book.id}`
    );
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

    // Set Title
    bookElement.querySelector('.book-name').textContent = book.title;

    // Set Price
    const priceContainer = bookElement.querySelector('.book-price');
    priceContainer.innerHTML = book.saleprice && book.saleprice.trim() !== ''
      ? `<span class="sale-price">${book.price} ${fieldState.payment || '$'}</span>
         <span class="original-price">${book.saleprice} ${fieldState.payment || '$'}</span>`
      : `${book.price || 'Price not specified'} ${fieldState.payment || '$'}`;

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
  if (sorted === 'new') {
    return `<img src="img/new.png" class="art-icon" alt="New Cart">`;
  } else if (sorted === 'sale') {
    return `<img src="img/discont.png" class="art-icon" alt="Discount Cart">`;
  } else if (sorted === 'popular') {
    return `<img src="img/popular.png" class="art-icon" alt="Popular Cart">`;
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
    displayBooks(books, fieldState);
    paginationContainer.innerHTML = ''; 
    scrollToTop();
  });

  paginationContainer.appendChild(showAllButton);
}

// Helper function for rendering only size and color tags
function renderSizeColorTags(book, fieldState) {
  const tagFields = ['size', 'color'];
  const colorRGB = fieldState.colorblock
    ? fieldState.colorblock
        .split(';')
        .map(colorItem => colorItem.split(':'))
        .reduce((acc, [colorName, rgb]) => ({ ...acc, [colorName.trim()]: rgb.trim().slice(1, -1) }), {})
    : {};

  return tagFields
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

function updateSortButtonsVisibility() {
 
  const availableTypes = new Set(filteredBooks.map(book => book.sorted));
  sortButtons.forEach(button => {
    const buttonType = button.getAttribute('data-type');

    if (buttonType === 'low-price' || buttonType === 'high-price') {
      // Price buttons are shown only if there are more than 1 products
      button.style.display = filteredBooks.length > 1 ? 'inline-block' : 'none';
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
}

function sortBy(type) {  
  const sortedBooks = [...filteredBooks].sort((a, b) => {    
    if (a.type === type && b.type !== type) return -1;
    if (a.type !== type && b.type === type) return 1;
    return 0; 
  });
  
  displayBooks(sortedBooks, fieldState);
}


function sortByPrice(order) {  
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    return order === 'low' ? a.price - b.price : b.price - a.price;
  });
  
  displayBooks(sortedBooks, fieldState);
}

sortButtons.forEach(button => {
  button.addEventListener('click', () => {
    const type = button.getAttribute('data-type');

    if (type === 'low-price') {
      sortByPrice('low');
    } else if (type === 'high-price') {
      sortByPrice('high');
    } else {
      sortBy(type);
    }
  });
});

updateSortButtonsVisibility();

// Helper function to extract a numeric value from a price string
function extractPrice(priceText) {
  // Remove all non-numeric characters (except the dot for decimals)
  const price = parseFloat(priceText.replace(/[^\d.-]/g, ''));
  
  // Return the price (if the price is not numeric, return 0)
  return isNaN(price) ? 0 : price;
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
searchInput.addEventListener('focus', checkInput);
searchInput.addEventListener('blur', checkInput);
clearButton.addEventListener('click', clearSearch);

  function checkInput() {
    if (searchInput.value || searchInput === document.activeElement) {
      searchInput.classList.add('active');
      clearButton.style.display = 'inline-block';
    } else {
      searchInput.classList.remove('active');
      clearButton.style.display = 'none';
    }
  } 

  let previousPage = currentPage; 

  function searchBooks() { 
      const searchQuery = searchInput.value ? searchInput.value.trim().toLowerCase() : ''; 
  
      if (!searchQuery || searchQuery === "") { 
          currentPage = previousPage; 
          displayBooks(books, fieldState);
          noResultsMessage.style.display = 'none';
          bookList.style.display = 'flex';
          paginationContainer.style.display = 'flex';          
          return;
      }
  
      const searchBooks = books.filter(book => 
          book.title.toLowerCase().includes(searchQuery) || 
          book.id.toLowerCase().includes(searchQuery)
      );
  
      if (searchBooks.length > 0) {
          previousPage = currentPage; 
          currentPage = 1; 
          displayBooks(searchBooks, fieldState);
          noResultsMessage.style.display = 'none';
          bookList.style.display = 'flex';
          paginationContainer.style.display = 'flex';          
      } else {
          currentPage = previousPage; 
          noResultsMessage.style.display = 'flex';
          bookList.style.display = 'none';
          paginationContainer.style.display = 'none';          
      }
  }
  
  // Event handler for search field with debounce
  searchInput.addEventListener('input', debounce(searchBooks, 300));
  
  // Function to reset search and display all books
  function clearSearch() {  
      searchInput.value = '';
      currentPage = previousPage; 
      displayBooks(books, fieldState); 
      noResultsMessage.style.display = 'none';
      bookList.style.display = 'flex'; 
      paginationContainer.style.display = 'flex';      
  }

// Contact form
const contactForm = document.getElementById('contactForm');
const formResponse = document.getElementById('formResponse');
const emailField = document.getElementById('email');
const messageField = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn'); // Form Validation
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;    

const validateForm = () => {
    const isEmailValid = emailPattern.test(emailField.value.trim());
    const isMessageValid = messageField.value.trim() !== '';
    submitBtn.disabled = !(isEmailValid && isMessageValid);
};

emailField.addEventListener('input', validateForm);
messageField.addEventListener('input', validateForm);

// Safe function to read from localStorage
function safeReadStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        console.error("Error reading from localStorage:", error.message);
        return [];
    }
}

// Safe function to write to localStorage
function safeWriteStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Error writing to localStorage:", error.message);
    }
}

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    formResponse.textContent = '';

    // Spam Protection
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

// Toggle contact form visibility
document.querySelector('.contact-toggle').addEventListener('click', function() {
    var contactFormSection = document.querySelector('.contact-form-section');
    if (contactFormSection.style.display === 'none' || contactFormSection.style.display === '') {
        contactFormSection.style.display = 'flex';
        this.textContent = '- Hide Contact Form';
    } else {
        contactFormSection.style.display = 'none';
        this.textContent = '+ Show Contact Form';
    }
});
