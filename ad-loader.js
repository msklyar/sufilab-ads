(function() {
    // --- SETTINGS ---
    const sitesListUrl = "https://msklyar.github.io/my-ad-system/sites.json"; 
    const adContainer = document.getElementById("my-github-ad");
    
    if (!adContainer) return;

    // --- CSS STYLES (Google Style) ---
    const style = document.createElement('style');
    style.innerHTML = `
        #my-github-ad { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; width: 100%; display: block; margin: 20px 0; }
        .g-ad-card { display: flex; background: #fff; border: 1px solid #dadce0; border-radius: 8px; overflow: hidden; text-decoration: none; color: inherit; box-shadow: 0 1px 2px rgba(60,64,67,0.3); transition: box-shadow 0.2s; }
        .g-ad-card:hover { box-shadow: 0 1px 3px 1px rgba(60,64,67,0.15), 0 1px 2px rgba(60,64,67,0.3); }
        .g-ad-content-wrapper { display: flex; flex-direction: column; width: 100%; }
        .g-ad-image { width: 100%; height: 180px; object-fit: cover; background: #f1f3f4; }
        .g-ad-text { padding: 12px; display: flex; flex-direction: column; justify-content: center; }
        @media (min-width: 480px) {
            .g-ad-content-wrapper { flex-direction: row; height: 140px; }
            .g-ad-image { width: 35%; height: 100%; min-width: 120px; }
            .g-ad-text { width: 65%; padding: 10px 15px; }
        }
        .g-ad-title { margin: 0 0 5px; font-size: 16px; font-weight: 500; color: #202124; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .g-ad-desc { margin: 0; font-size: 13px; color: #5f6368; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .g-ad-meta { margin-top: auto; padding-top: 8px; font-size: 11px; color: #1a73e8; font-weight: 500; display: flex; align-items: center; }
        .g-badge { background: #f1f3f4; color: #5f6368; padding: 2px 6px; border-radius: 4px; margin-right: 8px; font-size: 10px; font-weight: bold; }
    `;
    document.head.appendChild(style);

    // --- MAIN LOGIC ---
    async function loadAd() {
        try {
            // 1. Get Site List
            const response = await fetch(sitesListUrl);
            if (!response.ok) throw new Error("sites.json failed to load");
            const sites = await response.json();
            
            if (!sites || sites.length === 0) return;

            // Pick Random Site
            let site = sites[Math.floor(Math.random() * sites.length)];
            site = site.replace(/\/$/, ""); // Remove trailing slash

            console.log("Trying to fetch ad from:", site);

            // 2. Try Fetching (Detect Platform)
            let adData = null;
            
            // PEHLE: Try Blogger API
            try {
                const bloggerUrl = `${site}/feeds/posts/default?alt=json&max-results=10`;
                const res = await fetch(bloggerUrl);
                if (res.ok) {
                    const data = await res.json();
                    adData = parseBlogger(data, site);
                }
            } catch (e) { console.log("Not Blogger, trying WordPress..."); }

            // AGAR BLOGGER FAIL HO: Try WordPress API
            if (!adData) {
                try {
                    const wpUrl = `${site}/wp-json/wp/v2/posts?per_page=10&_embed`;
                    const res = await fetch(wpUrl);
                    if (res.ok) {
                        const data = await res.json();
                        adData = parseWordPress(data, site);
                    }
                } catch (e) { console.log("Not WordPress either."); }
            }

            // 3. Render Ad
            if (adData) {
                renderAd(adData);
            } else {
                console.error("Koi data nahi mila us website se:", site);
                // Agar fail ho jaye to dobara try karein (Optional recursion)
                // loadAd(); 
            }

        } catch (error) {
            console.error("Ad System Error:", error);
        }
    }

    // --- HELPER: Parse Blogger Data ---
    function parseBlogger(data, siteDomain) {
        if (!data.feed || !data.feed.entry || data.feed.entry.length === 0) return null;
        const post = data.feed.entry[Math.floor(Math.random() * data.feed.entry.length)];
        
        let link = "#";
        post.link.forEach(l => { if (l.rel === 'alternate') link = l.href; });

        let image = "https://via.placeholder.com/400x300?text=Visit+Site";
        if (post.media$thumbnail) image = post.media$thumbnail.url.replace("s72-c", "w400-h300-p");

        let text = post.summary ? post.summary.$t : (post.content ? post.content.$t : "");
        // Remove HTML tags
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = text;
        text = tempDiv.textContent || "";

        return {
            title: post.title.$t,
            link: link,
            image: image,
            text: text.substring(0, 150),
            domain: new URL(link).hostname.replace('www.', '')
        };
    }

    // --- HELPER: Parse WordPress Data ---
    function parseWordPress(posts, siteDomain) {
        if (!posts || posts.length === 0) return null;
        const post = posts[Math.floor(Math.random() * posts.length)];

        let image = "https://via.placeholder.com/400x300?text=Visit+Site";
        if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
            image = post._embedded['wp:featuredmedia'][0].source_url;
        }

        let text = post.excerpt ? post.excerpt.rendered : post.content.rendered;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = text;
        text = tempDiv.textContent || "";

        return {
            title: post.title.rendered,
            link: post.link,
            image: image,
            text: text.substring(0, 150),
            domain: new URL(post.link).hostname.replace('www.', '')
        };
    }

    // --- HELPER: Render HTML ---
    function renderAd(data) {
        const adHTML = `
            <a href="${data.link}" target="_blank" class="g-ad-card">
                <div class="g-ad-content-wrapper">
                    <img src="${data.image}" class="g-ad-image" alt="${data.title}">
                    <div class="g-ad-text">
                        <h3 class="g-ad-title">${data.title}</h3>
                        <p class="g-ad-desc">${data.text}</p>
                        <div class="g-ad-meta">
                            <span class="g-badge">Ad</span> ${data.domain} &bull; Open
                        </div>
                    </div>
                </div>
            </a>
        `;
        adContainer.innerHTML = adHTML;
    }

    // Start
    loadAd();
})();
