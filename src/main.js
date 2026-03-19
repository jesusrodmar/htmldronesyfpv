import './styles/globals.css';

let appData = null;

async function loadData() {
    try {
        const response = await fetch('/data.json');
        appData = await response.json();
        renderNavigation();
        handleRoute();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('app-content').innerHTML = '<p class="text-center py-20 text-red-500">Error cargando el contenido.</p>';
    }
}

function renderNavigation() {
    const desktopNav = document.getElementById('desktop-nav');
    const mobileNavContent = document.getElementById('mobile-nav-content');
    
    if (!appData || !appData.navigation) return;

    let desktopHTML = '';
    let mobileHTML = '';

    appData.navigation.forEach(item => {
        // Desktop Nav Item
        desktopHTML += `
            <div class="relative group">
                <a href="#${item.path}" class="text-sm font-medium transition-colors hover:text-neon-pink relative py-5 flex items-center gap-1 text-gray-400">
                    ${item.name}
                    ${item.subItems ? '<i data-lucide="chevron-down" class="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"></i>' : ''}
                </a>
                ${item.subItems ? `
                    <div class="absolute left-0 top-full pt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div class="bg-dark-card border border-white/10 rounded-xl shadow-xl py-2 min-w-[220px] flex flex-col">
                            ${item.subItems.map(sub => `
                                <a href="#${sub.path}" class="px-4 py-2.5 text-sm transition-colors text-gray-400 hover:text-neon-pink hover:bg-white/5">
                                    ${sub.name}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // Mobile Nav Item
        mobileHTML += `
            <div>
                <a href="#${item.path}" class="mobile-link flex items-center justify-between px-3 py-2 rounded-md text-base font-medium transition-colors text-gray-400 hover:bg-white/5 hover:text-neon-pink">
                    ${item.name}
                    ${item.subItems ? '<i data-lucide="chevron-down" class="w-4 h-4 opacity-50"></i>' : ''}
                </a>
                ${item.subItems ? `
                    <div class="pl-4 mt-1 space-y-1 mb-2">
                        ${item.subItems.map(sub => `
                            <a href="#${sub.path}" class="mobile-link flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-500 hover:text-neon-pink hover:bg-white/5">
                                ${sub.name}
                            </a>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    });

    desktopNav.innerHTML = desktopHTML;
    mobileNavContent.innerHTML = mobileHTML;

    // Re-initialize icons for newly added HTML
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Add event listeners to mobile links to close menu
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('mobile-nav').classList.add('hidden');
        });
    });
}

function handleRoute() {
    if (!appData) return;

    const hash = window.location.hash || '#/';
    const path = hash.replace('#', '');
    const contentArea = document.getElementById('app-content');

    // Find page in data
    const page = appData.pages.find(p => p.path === path);

    if (page) {
        contentArea.innerHTML = page.content;
    } else if (path === '/blog') {
        renderBlogList(contentArea);
    } else if (path.startsWith('/blog/')) {
        const postId = path.split('/')[2];
        renderBlogPost(contentArea, postId);
    } else {
        contentArea.innerHTML = `
            <section class="py-32 text-center">
                <h1 class="text-6xl font-bold mb-6 text-neon-pink">404</h1>
                <p class="text-xl text-gray-400">Página no encontrada o en construcción.</p>
                <a href="#/" class="mt-8 inline-block px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">Volver al inicio</a>
            </section>
        `;
    }

    window.scrollTo(0, 0);
}

function renderBlogList(container) {
    let html = `
        <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 class="text-4xl font-display font-bold mb-12">Noticias y Novedades</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    `;

    appData.posts.forEach(post => {
        html += `
            <a href="#/blog/${post.id}" class="group block bg-dark-card border border-white/5 rounded-2xl overflow-hidden hover:border-${post.color}/50 transition-all duration-300">
                <div class="aspect-video overflow-hidden relative">
                    <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div class="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-xs font-medium text-${post.color} border border-${post.color}/20">
                        ${post.category}
                    </div>
                </div>
                <div class="p-6">
                    <div class="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>${post.date}</span>
                        <span>•</span>
                        <span>${post.readTime} lectura</span>
                    </div>
                    <h3 class="text-xl font-bold mb-3 group-hover:text-white transition-colors">${post.title}</h3>
                    <p class="text-gray-400 text-sm line-clamp-3">${post.excerpt}</p>
                </div>
            </a>
        `;
    });

    html += `</div></section>`;
    container.innerHTML = html;
}

function renderBlogPost(container, id) {
    const post = appData.posts.find(p => p.id === id);
    if (!post) {
        container.innerHTML = '<p class="text-center py-20">Post no encontrado.</p>';
        return;
    }

    container.innerHTML = `
        <article class="py-16 max-w-3xl mx-auto px-4 w-full">
            <a href="#/blog" class="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                <i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i> Volver al blog
            </a>
            <div class="mb-8">
                <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span class="text-${post.color}">${post.category}</span>
                    <span>•</span>
                    <span>${post.date}</span>
                    <span>•</span>
                    <span>${post.readTime} lectura</span>
                </div>
                <h1 class="text-4xl md:text-5xl font-display font-bold mb-6">${post.title}</h1>
            </div>
            <img src="${post.image}" alt="${post.title}" class="w-full aspect-video object-cover rounded-2xl mb-12" />
            <div class="prose prose-invert prose-lg max-w-none">
                ${post.content}
            </div>
        </article>
    `;
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Mobile menu toggle
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    const mobileNav = document.getElementById('mobile-nav');
    mobileNav.classList.toggle('hidden');
});

// Listen for hash changes
window.addEventListener('hashchange', handleRoute);

// Initialize
loadData();
