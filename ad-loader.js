(function() {
    // Apka Username aur Repo name set kar diya hai
    const jsonUrl = "https://msklyar.github.io/my-ad-system/ads.json"; 

    const adContainer = document.getElementById("my-github-ad");

    if (!adContainer) return;

    fetch(jsonUrl)
        .then(response => response.json())
        .then(data => {
            const randomIndex = Math.floor(Math.random() * data.length);
            const ad = data[randomIndex];
            const shortText = ad.text.length > 90 ? ad.text.substring(0, 90) + "..." : ad.text;

            const adHTML = `
                <a href="${ad.link}" target="_blank" style="text-decoration: none; color: inherit;">
                    <div style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; max-width: 300px; font-family: 'Arial', sans-serif; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.12); margin-bottom: 15px;">
                        <div style="height: 160px; overflow: hidden; background: #f1f1f1;">
                            <img src="${ad.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="Ad">
                        </div>
                        <div style="padding: 12px;">
                            <h3 style="margin: 0 0 6px; font-size: 16px; color: #202124; font-weight: 600;">${ad.title}</h3>
                            <p style="margin: 0; font-size: 14px; color: #5f6368; line-height: 1.4; height: 40px; overflow: hidden;">${shortText}</p>
                            <div style="margin-top: 10px; font-size: 11px; color: #006621; font-weight: bold; text-transform: uppercase;">Ad &bull; Sponsored</div>
                        </div>
                    </div>
                </a>
            `;
            adContainer.innerHTML = adHTML;
        })
        .catch(err => console.error("Ad loading failed:", err));
})();
