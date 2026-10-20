// SANDARBH — Complete Interactive Logic with Backend Database Integration

document.addEventListener('DOMContentLoaded', () => {
    console.log("Sandarbh Website Loaded Successfully!");

    // 1. Dynamic Popups Inject karna
    createModals();

    // 2. Check saved login state
    updateAccountUI();

    // 3. Backend Database se products fetch karke UI par render karna
    fetchProductsFromDatabase();

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const emptyMessage = document.getElementById('emptyMessage');
    
    // Nav Buttons
    const searchNavBtn = document.querySelector('a[href="#search"]');
    const wishlistNavBtn = document.querySelector('a[href="#wishlist"]');
    const accountNavBtn = document.querySelector('a[href="#account"]');
    const sellNavBtns = document.querySelectorAll('.sell-btn, a[href="#sell"]');

    let wishlistCount = 0;
    let wishlistOnlyView = false;

    // 4. Search & Filter Logic
    window.filterProducts = function() {
        const searchInput = document.getElementById('searchInput');
        const productCards = document.querySelectorAll('.product-card');
        const emptyMessage = document.getElementById('emptyMessage');

        if (!searchInput) return;
        const query = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        productCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const categoryAttr = card.getAttribute('data-category')?.toLowerCase() || '';
            const isWishlisted = card.querySelector('.wishlist')?.classList.contains('active');

            const matchesSearch = cardText.includes(query) || categoryAttr.includes(query);
            const matchesWishlist = !wishlistOnlyView || isWishlisted;

            if (matchesSearch && matchesWishlist) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (emptyMessage) {
            emptyMessage.hidden = (visibleCount > 0);
        }
    };

    // Search Input Typing & Button Click
    if (searchInput) {
        searchInput.addEventListener('input', window.filterProducts);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.filterProducts();
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.filterProducts();
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 5. Nav "Search" Link Click -> Focus Search Bar
    if (searchNavBtn) {
        searchNavBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (searchInput) {
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => searchInput.focus(), 400);
            }
        });
    }

    // 6. Category Click Filtering (Event Delegation for dynamic items)
    document.addEventListener('click', (e) => {
        const catBtn = e.target.closest('.category');
        if (catBtn) {
            e.preventDefault();
            wishlistOnlyView = false;
            const catName = catBtn.querySelector('span')?.textContent.trim() || '';
            const searchInput = document.getElementById('searchInput');
            if (searchInput && catName) {
                searchInput.value = catName;
                window.filterProducts();
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    // Nav "Wishlist" Click -> Filter Wishlisted Items Only
    if (wishlistNavBtn) {
        wishlistNavBtn.addEventListener('click', (e) => {
            e.preventDefault();
            wishlistOnlyView = !wishlistOnlyView;
            window.filterProducts();
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 7. Account Link Click -> Open Login or Profile Details Modal
    if (accountNavBtn) {
        accountNavBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const savedUser = localStorage.getItem('sandarbhUser');
            if (savedUser) {
                openUserProfileModal(savedUser);
            } else {
                openAccountModal();
            }
        });
    }

    // 8. Sell Buttons Click -> Open Sell Item Modal
    sellNavBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openSellModal();
        });
    });
});

// --- BACKEND API INTEGRATION ---

async function fetchProductsFromDatabase() {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products from backend server');
        }
        const products = await response.json();
        console.log("Database Products Loaded:", products);
        renderProductsToUI(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        const container = document.querySelector('.products-container') || document.getElementById('product-list') || document.querySelector('.product-grid');
        if (container) {
            container.innerHTML = '<p style="color: red; text-align: center; grid-column: 1/-1;">Backend server se connect nahi ho pa raha hai! Check karein ki Node server chal raha hai ya nahi.</p>';
        }
    }
}

function renderProductsToUI(products) {
    const container = document.querySelector('.products-container') || document.getElementById('product-list') || document.querySelector('.product-grid');

    if (!container) {
        console.error('Product container element nahi mila HTML mein!');
        return;
    }

    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Koi product available nahi hai.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.style.cursor = 'pointer';
        card.setAttribute('data-category', product.category);

        card.innerHTML = `
            <button class="wishlist" title="Add to Wishlist">♡</button>
            <div class="product-image" style="height: 200px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f9f9f9;">
                <img src="${product.imgSrc || 'images/default.jpg'}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="product-details" style="padding: 15px;">
                <span class="product-category" style="font-size: 0.75rem; text-transform: uppercase; color: #666; font-weight: 700;">${product.category}</span>
                <h3 style="font-size: 1.1rem; margin: 8px 0; font-weight: 700;">${product.title}</h3>
                <p class="condition" style="font-size: 0.85rem; color: #555; margin-bottom: 10px;">${product.condition || 'Good'}</p>
                <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="price" style="font-weight: 800; font-size: 1.1rem; color: #171717;">${product.price}</span>
                    <span style="font-size: 0.85rem; color: var(--burgundy, #800020); font-weight: 600;">View Details</span>
                </div>
            </div>
        `;

        // Wishlist button click event listener inside card
        const wishlistBtn = card.querySelector('.wishlist');
        wishlistBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            wishlistBtn.classList.toggle('active');

            let wishlistCount = 0;
            if (wishlistBtn.classList.contains('active')) {
                wishlistBtn.textContent = '♥';
            } else {
                wishlistBtn.textContent = '♡';
            }

            // Recalculate total active wishlists
            const activeWishlists = document.querySelectorAll('.wishlist.active').length;
            const wishlistNavBtn = document.querySelector('a[href="#wishlist"]');
            if (wishlistNavBtn) {
                wishlistNavBtn.textContent = activeWishlists > 0 ? `Wishlist (${activeWishlists})` : 'Wishlist';
            }

            const profileWishlistCount = document.getElementById('profileWishlistCount');
            if (profileWishlistCount) profileWishlistCount.textContent = activeWishlists;
        });

        // Click card to open modal
        card.addEventListener('click', () => {
            openProductModal(product.title, product.price, product.condition || 'Good', product.category, product.imgSrc || 'images/default.jpg');
        });

        container.appendChild(card);
    });
}

// --- MODAL & UI UTILITIES ---

function createModals() {
    if (document.getElementById('productModal')) return;

    const modalHTML = `
    <!-- Product View Modal -->
    <div id="productModal" class="sandarbh-modal" hidden>
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-body">
                <img id="modalImg" src="" alt="Product">
                <div class="modal-details">
                    <span id="modalCat" class="modal-tag">CATEGORY</span>
                    <h2 id="modalTitle">Product Title</h2>
                    <p id="modalCond" class="modal-cond">Condition</p>
                    <p id="modalPrice" class="modal-price">₹0</p>
                    <p class="modal-desc">Authentic pre-loved vintage item inspected carefully for sandarbh collection.</p>
                    <button class="modal-buy-btn" onclick="alert('Offer request sent to seller!')">Buy Now / Contact Seller</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Sell Modal -->
    <div id="sellModal" class="sandarbh-modal" hidden>
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-form">
                <h2>Sell an Item</h2>
                <p>Post your vintage find on संदर्भ marketplace.</p>
                <form onsubmit="handleSellSubmit(event)">
                    <div class="form-group">
                        <label>Item Name</label>
                        <input type="text" placeholder="e.g. Classic Vintage Watch" required>
                    </div>
                    <div class="form-group">
                        <label>Price (₹)</label>
                        <input type="number" placeholder="e.g. 1499" required>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select required>
                            <option value="">Select Category</option>
                            <option value="watches">Watches</option>
                            <option value="clothing">Clothing</option>
                            <option value="collectibles">Collectibles</option>
                            <option value="antiques">Antiques & Decor</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Condition</label>
                        <input type="text" placeholder="e.g. Pre-owned · Excellent Condition">
                    </div>
                    <button type="submit" class="modal-buy-btn">Post Your Item</button>
                </form>
            </div>
        </div>
    </div>

    <!-- Account Login Modal -->
    <div id="accountModal" class="sandarbh-modal" hidden>
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-form">
                <h2>Welcome Back</h2>
                <p>Log in to manage your listings and wishlist.</p>
                <form onsubmit="handleAccountSubmit(event)">
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" placeholder="name@example.com" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="modal-buy-btn">Sign In</button>
                </form>
            </div>
        </div>
    </div>

    <!-- User Profile Details Modal (After Login) -->
    <div id="userProfileModal" class="sandarbh-modal" hidden>
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-form">
                <h2>Account Profile</h2>
                <p>Your member details on संदर्भ marketplace.</p>
                
                <div style="display: flex; flex-direction: column; gap: 12px; margin-block: 10px 20px;">
                    <div class="form-group">
                        <label>Logged In Email</label>
                        <input type="text" id="profileEmail" readonly style="background: #f0f0f3; font-weight: 600;">
                    </div>
                    <div class="form-group">
                        <label>Account Status</label>
                        <input type="text" value="Verified Collector / Seller" readonly style="background: #f0f0f3; color: var(--burgundy, #800020); font-weight: 700;">
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px 16px; background: var(--burgundy-soft, #f9f0f2); border-radius: 10px; border: 1px solid #EAE2E4;">
                        <div>
                            <span style="font-size: 0.8rem; color: #666; font-weight: 700; display: block;">WISHLIST SAVED</span>
                            <span id="profileWishlistCount" style="font-size: 1.2rem; font-weight: 800; color: var(--burgundy, #800020);">0</span>
                        </div>
                        <div>
                            <span style="font-size: 0.8rem; color: #666; font-weight: 700; display: block;">ACTIVE LISTINGS</span>
                            <span id="profileListingsCount" style="font-size: 1.2rem; font-weight: 800; color: #171717;">0</span>
                        </div>
                    </div>
                </div>

                <button class="modal-buy-btn" style="background: #171717;" onclick="handleLogout()">Log Out</button>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.sandarbh-modal').forEach(m => m.hidden = true);
        });
    });
}

function openProductModal(title, price, condition, category, imgSrc) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalPrice').textContent = price;
    document.getElementById('modalCond').textContent = condition;
    document.getElementById('modalCat').textContent = category;
    document.getElementById('modalImg').src = imgSrc;
    document.getElementById('productModal').hidden = false;
}

function openSellModal() {
    document.getElementById('sellModal').hidden = false;
}

function openAccountModal() {
    document.getElementById('accountModal').hidden = false;
}

function openUserProfileModal(email) {
    const activeWishlist = document.querySelectorAll('.wishlist.active').length;
    document.getElementById('profileEmail').value = email;
    document.getElementById('profileWishlistCount').textContent = activeWishlist;
    document.getElementById('userProfileModal').hidden = false;
}

function handleSellSubmit(e) {
    e.preventDefault();
    alert('🎉 Your item has been submitted for approval!');
    
    const listingsElem = document.getElementById('profileListingsCount');
    if (listingsElem) {
        listingsElem.textContent = parseInt(listingsElem.textContent || 0) + 1;
    }

    document.getElementById('sellModal').hidden = true;
    e.target.reset();
}

function handleAccountSubmit(e) {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    const userEmail = emailInput ? emailInput.value : 'User';

    localStorage.setItem('sandarbhUser', userEmail);
    
    alert(`🎉 Welcome back, ${userEmail}! Logged in successfully.`);
    document.getElementById('accountModal').hidden = true;
    e.target.reset();

    updateAccountUI();
}

function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('sandarbhUser');
        document.getElementById('userProfileModal').hidden = true;
        
        const accountNavBtn = document.querySelector('a[href="#account"]');
        if (accountNavBtn) {
            accountNavBtn.textContent = 'Account';
        }
        
        alert('Logged out successfully.');
    }
}

function updateAccountUI() {
    const accountNavBtn = document.querySelector('a[href="#account"]');
    const savedUser = localStorage.getItem('sandarbhUser');

    if (accountNavBtn && savedUser) {
        accountNavBtn.textContent = '👤 My Account';
    }
}