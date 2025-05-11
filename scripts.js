// DOM elements cache - consolidated and organized by functionality
const domElements = {
    // Navigation
    mobileMenuToggle: document.getElementById('mobileMenuToggle'),
    navLinks: document.getElementById('navLinks'),
    menuIconBars: null, // Will be set after DOM load
    
    // Cart
    cartIcon: document.getElementById('cartIcon'),
    cartPanel: document.getElementById('cartPanel'),
    closeCart: document.getElementById('closeCart'),
    cartItems: document.getElementById('cartItems'),
    cartTotal: document.getElementById('cartTotal'),
    cartCount: document.querySelector('.cart-count'),
    
    // Products
    productsContainer: document.getElementById('productsContainer'),
    
    // Modal
    productModal: document.getElementById('productModal'),
    closeModal: document.getElementById('closeModal'),
    mainProductImage: document.getElementById('mainProductImage'),
    thumbnailContainer: document.getElementById('thumbnailContainer'),
    modalProductTitle: document.getElementById('modalProductTitle'),
    originalPrice: document.getElementById('originalPrice'),
    discountedPrice: document.getElementById('discountedPrice'),
    discountBadge: document.getElementById('discountBadge'),
    productDescription: document.getElementById('productDescription'),
    addToCartModal: document.getElementById('addToCartModal'),
    whatsappBtnModal: document.getElementById('whatsappBtnModal'),
    
    // Forms
    customOrderForm: document.getElementById('customOrderForm'),
    
    // General
    overlay: document.getElementById('overlay'),
    checkoutBtn: document.querySelector('.checkout-btn')
  };
  
  // Configuration
  const config = {
    whatsappNumber: "+22238342468", 
  };
  
  // State management
  let state = {
    cart: [],
    currentProductId: null,
    isMenuOpen: false,
    isCartOpen: false,
    isModalOpen: false
  };
  
  /**
   * Mobile Menu Management
   */
  const mobileMenu = {
    toggle() {
      if (!domElements.navLinks) return;
      
      state.isMenuOpen = !state.isMenuOpen;
      domElements.navLinks.classList.toggle('active');
      overlay.toggleVisibility(state.isMenuOpen);
      
      // Animate hamburger icon
      if (domElements.menuIconBars) {
        if (state.isMenuOpen) {
          domElements.menuIconBars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
          domElements.menuIconBars[1].style.opacity = '0';
          domElements.menuIconBars[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
          domElements.menuIconBars.forEach(bar => {
            bar.style.transform = '';
            bar.style.opacity = '';
          });
        }
      }
    },
    
    close() {
      if (!domElements.navLinks) return;
      
      state.isMenuOpen = false;
      domElements.navLinks.classList.remove('active');
      
      if (!state.isCartOpen && !state.isModalOpen) {
        overlay.hide();
      }
      
      // Reset menu icon
      if (domElements.menuIconBars) {
        domElements.menuIconBars.forEach(bar => {
          bar.style.transform = '';
          bar.style.opacity = '';
        });
      }
    }
  };
  
  /**
   * Cart Management
   */
  const cart = {
    open() {
      if (!domElements.cartPanel) return;
      
      state.isCartOpen = true;
      domElements.cartPanel.classList.add('open');
      overlay.show();
    },
    
    close() {
      if (!domElements.cartPanel) return;
      
      state.isCartOpen = false;
      domElements.cartPanel.classList.remove('open');
      
      if (!state.isMenuOpen && !state.isModalOpen) {
        overlay.hide();
      }
    },
    
    add(productId, quantity = 1) {
      if (!productsData || !productsData.products) return;
      
      const product = productsData.products.find(p => p.id === productId);
      if (!product) return;
      
      // Determine the price to use (discounted or original)
      const price = product.discount > 0 ? product.discountedPrice : product.originalPrice;
      
      // Check if product already in cart
      const existingProduct = state.cart.find(item => item.id === productId);
      
      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        state.cart.push({
          id: product.id,
          name: product.name,
          price: price,
          image: product.images[0],
          quantity: quantity
        });
      }
      
      this.update();
      notifications.showSuccess(`${product.name} added to cart`);
    },
    
    remove(productId) {
      state.cart = state.cart.filter(item => item.id !== productId);
      this.update();
    },
    
    updateQuantity(productId, newQuantity) {
      const item = state.cart.find(item => item.id === productId);
      if (item) {
        item.quantity = newQuantity;
        this.update();
      }
    },
    
    update() {
      if (!domElements.cartItems || !domElements.cartTotal || !domElements.cartCount) return;
      
      domElements.cartItems.innerHTML = '';
  
      if (state.cart.length === 0) {
        domElements.cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        domElements.cartTotal.textContent = '0.00';
        domElements.cartCount.textContent = '0';
        localStorage.setItem('cart', JSON.stringify(state.cart));
        return;
      }
  
      state.cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.price.toFixed(2)} UM x ${item.quantity}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn minus" data-id="${item.id}" aria-label="Decrease quantity">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">Remove</button>
            </div>
        `;
        domElements.cartItems.appendChild(div);
      });
  
      const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      domElements.cartTotal.textContent = total.toFixed(2);
  
      const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
      domElements.cartCount.textContent = count;
  
      localStorage.setItem('cart', JSON.stringify(state.cart));
    },
    
    checkout() {
      if (state.cart.length === 0) {
        alert('vide');
        return;
      }
      
      const itemsText = state.cart.map(item => 
          `${item.name} (${item.quantity} x ${item.price.toFixed(2)} UM)`
      ).join('\n');
      
      const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const message = `Je souhaite acheter :\n${itemsText}\n\nTotal: ${total.toFixed(2)} UM`;
      
      window.open(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };
  
  /**
   * Product Modal Management
   */
  const productModal = {
    open(productId) {
      if (!productsData || !productsData.products || !domElements.productModal) return;
      
      const product = productsData.products.find(p => p.id === productId);
      if (!product) return;
      
      state.currentProductId = productId;
      state.isModalOpen = true;
      
      // Set main image
      if (domElements.mainProductImage) {
        domElements.mainProductImage.src = product.images[0];
        domElements.mainProductImage.alt = product.name;
      }
      
      // Load thumbnails
      if (domElements.thumbnailContainer) {
        domElements.thumbnailContainer.innerHTML = '';
        product.images.forEach((image, index) => {
          const thumbnail = document.createElement('div');
          thumbnail.className = 'thumbnail' + (index === 0 ? ' active' : '');
          thumbnail.innerHTML = `<img src="${image}" alt="${product.name} view ${index + 1}">`;
          thumbnail.addEventListener('click', () => {
            // Update main image
            domElements.mainProductImage.src = image;
            
            // Update active thumbnail
            document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
            thumbnail.classList.add('active');
          });
          domElements.thumbnailContainer.appendChild(thumbnail);
        });
      }
      
      // Set product details
      if (domElements.modalProductTitle) {
        domElements.modalProductTitle.textContent = product.name;
      }
      
      // Set pricing info
      if (domElements.originalPrice && domElements.discountedPrice && domElements.discountBadge) {
        if (product.discount > 0) {
          domElements.originalPrice.textContent = `${product.originalPrice.toFixed(2)} UM`;
          domElements.originalPrice.style.display = 'block';
          domElements.discountedPrice.textContent = `${product.discountedPrice.toFixed(2)} UM`;
          domElements.discountBadge.textContent = `-${product.discount}%`;
          domElements.discountBadge.style.display = 'inline-block';
        } else {
          domElements.originalPrice.style.display = 'none';
          domElements.discountedPrice.textContent = `${product.originalPrice.toFixed(2)} UM`;
          domElements.discountBadge.style.display = 'none';
        }
      }
      
      // Set description
      if (domElements.productDescription) {
        let descriptionHTML = `<p>${product.description}</p>`;
        
        if (product.features && product.features.length) {
          descriptionHTML += '<h4>Features:</h4><ul>';
          product.features.forEach(feature => {
            descriptionHTML += `<li>${feature}</li>`;
          });
          descriptionHTML += '</ul>';
        }
        
        domElements.productDescription.innerHTML = descriptionHTML;
      }
      
      // Update WhatsApp button
      if (domElements.whatsappBtnModal) {
        domElements.whatsappBtnModal.href = `https://wa.me/${config.whatsappNumber}?text=je%20suis%20intéressé%20par%20${encodeURIComponent(product.name)}`;
      }
      
      // Show modal
      domElements.productModal.style.display = 'flex';
      overlay.show();
      document.body.style.overflow = 'hidden';
    },
    
    close() {
      if (!domElements.productModal) return;
      
      state.isModalOpen = false;
      domElements.productModal.style.display = 'none';
      
      if (!state.isMenuOpen && !state.isCartOpen) {
        overlay.hide();
      }
      
      document.body.style.overflow = '';
      state.currentProductId = null;
    }
  };
  
  /**
   * Overlay Management
   */
  const overlay = {
    show() {
      if (domElements.overlay) {
        domElements.overlay.style.display = 'block';
      }
    },
    
    hide() {
      if (domElements.overlay) {
        domElements.overlay.style.display = 'none';
      }
    },
    
    toggleVisibility(isVisible) {
      if (domElements.overlay) {
        domElements.overlay.style.display = isVisible ? 'block' : 'none';
      }
    }
  };
  
  /**
   * Products Management
   */
  const products = {
    load() {
      if (!domElements.productsContainer) return;
      
      domElements.productsContainer.innerHTML = '';
      
      if (!productsData || !productsData.products) {
        domElements.productsContainer.innerHTML = '<p class="error-message">No products available at the moment.</p>';
        return;
      }
      
      productsData.products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product';
        productElement.dataset.id = product.id;
  
        const hasDiscount = product.discount > 0;
        const priceToShow = hasDiscount ? product.discountedPrice : product.originalPrice;
        
        let priceHTML = '';
        if (hasDiscount) {
          priceHTML = `
              <div class="price-container">
                  <span class="original-price">${product.originalPrice.toFixed(2)} UM</span>
                  <span class="discounted-price">${priceToShow.toFixed(2)} UM</span>
                  <span class="discount-badge">-${product.discount}%</span>
              </div>
          `;
        } else {
          priceHTML = `<div class="price-container"><span class="discounted-price">${priceToShow.toFixed(2)} UM</span></div>`;
        }
  
        productElement.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}" class="product-img open-modal" data-id="${product.id}">
            <div class="product-info">
                <h3 class="product-title open-modal" data-id="${product.id}">${product.name}</h3>
                ${priceHTML}
                <button class="add-to-cart" data-id="${product.id}">jouter au panier</button>
                <a href="https://wa.me/${config.whatsappNumber}je%20suis%20intéressé%20par%20${encodeURIComponent(product.name)}" 
                   class="whatsapp-btn" target="_blank" aria-label="Contact on WhatsApp about ${product.name}">
                   <i class="fab fa-whatsapp"></i> WhatsApp
                </a>
            </div>
        `;
  
        domElements.productsContainer.appendChild(productElement);
      });
    }
  };
  
  /**
   * Forms Management
   */
  const forms = {
    handleCustomOrderSubmit(e) {
      e.preventDefault();
      
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const phone = document.getElementById('phone')?.value.trim();
      const details = document.getElementById('orderDetails')?.value.trim();
      
      // Simple validation
      if (!name || !email || !phone || !details) {
        alert('Please fill in all fields');
        return;
      }
      
      const message = `New Custom Order Request:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nOrder Details:\n${details}`;
      
      window.open(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
      
      // Reset form
      domElements.customOrderForm.reset();
      notifications.showSuccess('Your custom order request has been submitted');
    }
  };
  
  /**
   * Notifications Management
   */
  const notifications = {
    showSuccess(message) {
      const successMsg = document.createElement('div');
      successMsg.className = 'success-message';
      successMsg.textContent = message;
      document.body.appendChild(successMsg);
      
      // Used for transition
      setTimeout(() => {
        successMsg.style.display = 'block';
        successMsg.style.opacity = '1';
        
        setTimeout(() => {
          successMsg.style.opacity = '0';
          setTimeout(() => {
            successMsg.remove();
          }, 300);
        }, 3000);
      }, 10);
    }
  };
  
  /**
   * Event Handlers
   */
  function setupEventListeners() {
    // Once DOM is loaded, set menu icon bars
    domElements.menuIconBars = document.querySelectorAll('.menu-icon-bar');
    
    // Mobile menu
    if (domElements.mobileMenuToggle) {
      domElements.mobileMenuToggle.addEventListener('click', mobileMenu.toggle);
    }
    
    // Nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', mobileMenu.close);
    });
    
    // Cart
    if (domElements.cartIcon) {
      domElements.cartIcon.addEventListener('click', cart.open);
    }
    
    if (domElements.closeCart) {
      domElements.closeCart.addEventListener('click', cart.close);
    }
    
    // Modal
    if (domElements.closeModal) {
      domElements.closeModal.addEventListener('click', productModal.close);
    }
    
    // Overlay
    if (domElements.overlay) {
      domElements.overlay.addEventListener('click', () => {
        cart.close();
        productModal.close();
        mobileMenu.close();
      });
    }
    
    // Product container clicks (delegation)
    if (domElements.productsContainer) {
      domElements.productsContainer.addEventListener('click', e => {
        // Open modal when clicking product image or title
        if (e.target.classList.contains('open-modal')) {
          const id = parseInt(e.target.dataset.id);
          productModal.open(id);
        }
  
        // Add to cart
        if (e.target.classList.contains('add-to-cart')) {
          const id = parseInt(e.target.dataset.id);
          cart.add(id);
        }
      });
    }
    
    // Cart item interactions (delegation)
    if (domElements.cartItems) {
      domElements.cartItems.addEventListener('click', e => {
        if (e.target.classList.contains('remove-item')) {
          const id = parseInt(e.target.dataset.id);
          cart.remove(id);
        }
        
        if (e.target.classList.contains('quantity-btn')) {
          const id = parseInt(e.target.dataset.id);
          const item = state.cart.find(item => item.id === id);
          if (!item) return;
          
          if (e.target.classList.contains('plus')) {
            cart.updateQuantity(id, item.quantity + 1);
          } else if (e.target.classList.contains('minus')) {
            if (item.quantity > 1) {
              cart.updateQuantity(id, item.quantity - 1);
            } else {
              cart.remove(id);
            }
          }
        }
      });
    }
    
    // Add to cart from modal
    if (domElements.addToCartModal) {
      domElements.addToCartModal.addEventListener('click', () => {
        if (state.currentProductId) {
          cart.add(state.currentProductId);
        }
      });
    }
    
    // Checkout button
    if (domElements.checkoutBtn) {
      domElements.checkoutBtn.addEventListener('click', cart.checkout);
    }
    
    // Custom order form
    if (domElements.customOrderForm) {
      domElements.customOrderForm.addEventListener('submit', forms.handleCustomOrderSubmit);
    }
  }
  
  /**
   * Initialize Application
   */
  function init() {
    // Bind methods to their objects for event handlers
    mobileMenu.toggle = mobileMenu.toggle.bind(mobileMenu);
    mobileMenu.close = mobileMenu.close.bind(mobileMenu);
    cart.open = cart.open.bind(cart);
    cart.close = cart.close.bind(cart);
    cart.add = cart.add.bind(cart);
    cart.remove = cart.remove.bind(cart);
    cart.updateQuantity = cart.updateQuantity.bind(cart);
    cart.update = cart.update.bind(cart);
    cart.checkout = cart.checkout.bind(cart);
    productModal.open = productModal.open.bind(productModal);
    productModal.close = productModal.close.bind(productModal);
    forms.handleCustomOrderSubmit = forms.handleCustomOrderSubmit.bind(forms);
    
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        state.cart = JSON.parse(savedCart);
      } catch (e) {
        console.error('Error parsing cart from localStorage:', e);
        state.cart = [];
      }
    }
    
    // Load products if on product page
    if (domElements.productsContainer) {
      products.load();
    }
    
    // Update cart display
    cart.update();
    
    // Setup event listeners
    setupEventListeners();
  }
  
  // Run initialization when DOM is fully loaded
  document.addEventListener('DOMContentLoaded', init);