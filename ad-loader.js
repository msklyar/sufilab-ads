(function() {
    // 1. Apni sites.json ka link yahan lagayen
    const sitesListUrl = "https://msklyar.github.io/my-ad-system/sites.json"; 

    const adContainer = document.getElementById("my-github-ad");
    if (!adContainer) return;

    // Step 1: Website List lana
    fetch(sitesListUrl)
        .then(res => res.json())
        .then(sites => {
            if (!sites || sites.length === 0) return;

            // Random Website Select karna
            let randomSite = sites[Math.floor(Math.random() * sites.length)];
            
            // URL clean karna (akhir mein slash / ho to hata dena)
            randomSite = randomSite.replace(/\/$/, "");

            // Step 2: Us Website ki Feed (Latest Posts) lana
            // Note: Ye code Blogger websites ke liye best hai
            const feedUrl = `${randomSite}/feeds/posts/default?alt=json&max-results=15`;

            return fetch(feedUrl);
        })
        .then(res => res.json())
        .then(data => {
            const posts = data.feed.entry;
            if (!posts || posts.length === 0) return;

            // Step 3: Us Website se Random Post uthana
            const randomPost = posts[Math.floor(Math.random() * posts.length)];

            // Data Extract karna (Title, Image, Link, Summary)
            const title = randomPost.title.$t;
            
            // Link dhoondna
            let link = "#";
            for (let i = 0; i < randomPost.link.length; i++) {
                if (randomPost.link[i].rel === "alternate") {
                    link = randomPost.link[i].href;
                    break;
                }
            }

            // Image dhoondna (Agar ho, nahi to default lagana)
            let image = "https://via.placeholder.com/300x200?text=No+Image";
            if (randomPost.media$thumbnail) {
                image = randomPost.media$thumbnail.url.replace("s72-c", "w300-h200-p"); // High quality image
            }

            // Text Summary (Thora sa text)
            let text = "";
            if (randomPost.summary) {
                text = randomPost.summary.$t;
            } else if (randomPost.content) {
                // Agar summary na ho to content se text nikalna (HTML tags hata kar)
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = randomPost.content.$t;
                text = tempDiv.textContent || tempDiv.innerText || "";
            }
            // Text ko 2 lines tak katna
            const shortText = text.length > 90 ? text.substring(0, 90) + "..." : text;

            // Step 4: Ad HTML Banana
            const adHTML = `
                <a href="${link}" target="_blank" style="text-decoration: none; color: inherit;">
                    <div style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; max-width: 300px; font-family: 'Arial', sans-serif; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.12); margin-bottom: 15px;">
                        
                        <!-- Thumbnail -->
                        <div style="height: 160px; overflow: hidden; background: #f1f1f1;">
                            <img src="${image}" style="width: 100%; height: 100%; object-fit: cover;" alt="${title}">
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 12px;">
                            <h3 style="margin: 0 0 6px; font-size: 16px; color: #202124; font-weight: 600; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${title}</h3>
                            <p style="margin: 0; font-size: 14px; color: #5f6368; line-height: 1.4; height: 40px; overflow: hidden;">
                                ${shortText}
                            </p>
                            <div style="margin-top: 10px; font-size: 11px; color: #006621; font-weight: bold; text-transform: uppercase;">
                                Ad &bull; ${new URL(randomSite).hostname}
                            </div>
                        </div>
                    </div>
                </a>
            `;

            adContainer.innerHTML = adHTML;
        })
        .catch(err => {
            console.error("Ad System Error:", err);
            // Agar error aye to container chupana
            if(adContainer) adContainer.style.display = 'none';
        });
})();
