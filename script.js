const S_URL = "https://pmzsjnjvsqywaeyopdfn.supabase.co";
const S_KEY = "sb_publishable_n57ZUmKJlWwRmVv6UCKjog_38T8XL3s";
const sb = window.supabase.createClient(S_URL, S_KEY);

function onmouseover0(id) { let el = document.getElementById(id); if(el) el.style.transform = "scale(1.1)"; }
function onmouseout0(id) { let el = document.getElementById(id); if(el) el.style.transform = "scale(1.0)"; }

// --- 1. CHARGEMENT DES CATÉGORIES ---
async function loadMainCategories(parentCat) {
    const list = document.getElementById('galleries-list');
    if (!list) return;
    list.innerHTML = '<tr><td style="color:#f1b4b4;padding:50px;text-align:center;">Loading...</td></tr>'; 

    try {
        let query = sb.from('galleries').select('*').eq('parent_category', parentCat);

        // TRI DES BOÎTES (CASES)
        if (parentCat === 'spotting_year') {
            // Années Spotting : Ordre Chronologique (2024, 2025, 2026...)
            query = query.order('year', { ascending: true });
        } else if (parentCat === 'spotting_aircraft') {
            // Aircraft : Par Constructeur puis par Modèle
            query = query.order('manufacturer', { ascending: true }).order('year', { ascending: true });
        } else if (parentCat === 'spotting_airline' || parentCat === 'spotting_best') {
            // Airline & Best Spotting : Ordre Alphabétique (A-Z)
            query = query.order('year', { ascending: true });
        } else {
            // Astro, Rewind : Ordre de création (ID)
            query = query.order('id', { ascending: true });
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
            let html = "<tr>";
            data.forEach((gal, i) => {
                if (i > 0 && i % 3 === 0) html += "</tr><tr>";
                const id = `gal_${i}`;
                const isDirect = ['rewind', 'best_ones', 'spotting_best'].includes(parentCat);
                const isInsideHtmlFolder = window.location.pathname.includes('/html/');
                const galleryPath = isInsideHtmlFolder ? 'gallery.html' : 'html/gallery.html';
                const target = isDirect ? gal.hd_url : `${galleryPath}?cat=${gal.parent_category}&year=${encodeURIComponent(gal.year)}`;

                let inner = "";
                if (['spotting_year', 'spotting_airline', 'spotting_aircraft', 'rewind', 'best_ones', 'spotting_best'].includes(parentCat)) {
                    inner = `<br/><span style="font-size:3vw;color:#f1b4b4;">${gal.year}</span><br/><img src="${gal.thumbnail_url}" class="photo_case_big_with_title" loading="lazy"/>`;
                } else {
                    inner = `<br/><span style="font-size:3vw;color:#f1b4b4;">${gal.year}</span><br/><span style="font-size:1vw;color:#a45656;">${gal.description || ''}</span><br/><img src="${gal.thumbnail_url}" class="photo_case"/>`;
                }
                html += `<th><a href="${target}"><p onmouseover="onmouseover0('${id}')" onmouseout="onmouseout0('${id}')" class="case1" id="${id}">${inner}</p></a></th>`;
            });
            list.innerHTML = html + "</tr>";
        } else {
            list.innerHTML = '<tr><td style="color:#f1b4b4;padding:50px;text-align:center;">No archives found.</td></tr>';
        }
    } catch (e) { list.innerHTML = '<tr><td style="color:#f1b4b4;padding:50px;text-align:center;">Error loading.</td></tr>'; }
}

// --- 2. CHARGEMENT DES GALERIES ---
async function loadGallery(type, boxName) {
    const row = document.getElementById('gallery-row');
    if (!row) return;
    row.innerHTML = '<tr><td style="color:#f1b4b4;padding:50px;text-align:center;">Loading...</td></tr>'; 

    try {
        let query = sb.from('portfolio').select('*');
        const isCarouselCat = ['spotting_year', 'spotting_airline', 'spotting_aircraft'].includes(type);
        
        if (isCarouselCat) {
            query = query.eq('is_cover', true);
            if (type === 'spotting_year') query = query.ilike('date', `%${boxName}%`);
            else if (type === 'spotting_airline') query = query.ilike('airline', `%${boxName}%`);
            else if (type === 'spotting_aircraft') query = query.ilike('model_global', `%${boxName}%`);
        } else if (type === 'spotting_best') {
            query = query.ilike('date', `%${boxName}%`).eq('categorie', 'spotting');
        } else {
            query = query.eq('sous_categorie', type).eq('date', boxName);
        }

        query = query.order('id', { ascending: true });

        const { data, error } = await query;
        if (error) throw error;

        let finalData = data || [];

        // TRI CHRONOLOGIQUE DES SESSIONS DANS LA GALERIE (Janvier -> Décembre)
        if (type === 'spotting_year' && finalData.length > 0) {
            finalData.sort((a, b) => {
                const parseDate = (dateStr) => {
                    if (!dateStr) return 0;
                    const parts = dateStr.split('/');
                    if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
                    return 0;
                };
                const timeA = parseDate(a.spotting_date || a.date);
                const timeB = parseDate(b.spotting_date || b.date);
                return timeA !== timeB ? timeA - timeB : a.id - b.id;
            });
        }

        if (finalData.length > 0) {
            let html = "<tr>";
            finalData.forEach((item, i) => {
                if (i > 0 && i % 3 === 0) html += "</tr><tr>";
                const id = `img_${i}`;
                const exactDate = item.date || item.spotting_date;
                const clickAction = isCarouselCat ? `onclick="openLightbox('${item.registration}', '${exactDate}')"` : `onclick="window.location.href='${item.image_url_hd}'"`;
                
                html += `<th><div ${clickAction} style="cursor:pointer;"><img src="${item.image_url}" id="${id}" class="case1" onmouseover="onmouseover0('${id}')" onmouseout="onmouseout0('${id}')" style="object-fit:cover;" loading="lazy"/></div></th>`;
            });
            row.innerHTML = html + "</tr>";
        } else {
            row.innerHTML = '<tr><td style="color:#f1b4b4;padding:50px;text-align:center;">Empty gallery.</td></tr>';
        }
    } catch (e) { row.innerHTML = '<tr><td style="color:#f1b4b4;padding:50px;text-align:center;">Error loading.</td></tr>'; }
}

// --- 3. LE CARROUSEL ---
let currentPhotos = [], currentIndex = 0;
async function openLightbox(reg, exact_date) {
    const { data, error } = await sb.from('portfolio')
        .select('image_url_hd')
        .eq('registration', reg)
        .eq('date', exact_date)
        .order('id', { ascending: true });
    
    if (error || !data.length) return;
    currentPhotos = data.map(p => p.image_url_hd);
    currentIndex = 0;
    renderLightbox();
}

function renderLightbox() {
    let modal = document.getElementById('lightbox');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'lightbox';
        modal.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:10000;display:flex;align-items:center;justify-content:center;flex-direction:column;";
        document.body.appendChild(modal);
    }
    
    const hdUrl = currentPhotos[currentIndex];
    modal.innerHTML = `
        <span onclick="this.parentElement.remove()" style="position:absolute;top:20px;right:40px;color:white;font-size:50px;cursor:pointer;font-family:helvetica;z-index:10001;">&times;</span>
        <img src="${hdUrl}" onclick="window.location.href='${hdUrl}'" style="max-width:90%;max-height:80%;border:2px solid #f1b4b4;border-radius:10px;object-fit:contain;cursor:pointer;">
        <div style="margin-top:20px;display:flex;gap:30px;align-items:center;">
            <button onclick="changeImg(-1)" style="background:#a45656;color:white;border:none;padding:15px 25px;cursor:pointer;border-radius:5px;font-family:helvetica;font-weight:bold;">PREV</button>
            <span style="color:white;font-family:helvetica;font-size:1.5vw;">${currentIndex + 1} / ${currentPhotos.length}</span>
            <button onclick="changeImg(1)" style="background:#a45656;color:white;border:none;padding:15px 25px;cursor:pointer;border-radius:5px;font-family:helvetica;font-weight:bold;">NEXT</button>
        </div>
    `;
}

function changeImg(s) {
    currentIndex = (currentIndex + s + currentPhotos.length) % currentPhotos.length;
    renderLightbox();
}

function initDynamicGallery() {
    const p = new URLSearchParams(window.location.search);
    const cat = p.get('cat'), year = p.get('year');
    if (cat && year) loadGallery(cat, year);
}