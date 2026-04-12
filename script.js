// --- CONFIGURATION SUPABASE ---
const S_URL = "https://pmzsjnjvsqywaeyopdfn.supabase.co";
const S_KEY = "sb_publishable_n57ZUmKJlWwRmVv6UCKjog_38T8XL3s";

if (typeof supabase !== 'undefined') {
    window.supabaseClient = window.supabase.createClient(S_URL, S_KEY);
}

// --- ANIMATIONS ---
function onmouseover0(id) {
    let el = document.getElementById(id);
    if(el) el.style.transform = "scale(1.1)";
}
function onmouseout0(id) {
    let el = document.getElementById(id);
    if(el) el.style.transform = "scale(1.0)";
}

// --- 1. CHARGEMENT DES BOX (Catégories) ---
async function loadMainCategories(parentCat) {
    const list = document.getElementById('galleries-list');
    if (!list) return;
    list.innerHTML = ''; 

    try {
        const { data, error } = await window.supabaseClient
            .from('galleries')
            .select('*')
            .eq('parent_category', parentCat);

        if (error) throw error;

        if (data && data.length > 0) {
            let htmlContent = "<tr>"; // On ouvre la première ligne du tableau

            data.forEach((gal, index) => {
                // Si on a déjà mis 3 éléments, on passe à la ligne suivante
                if (index > 0 && index % 3 === 0) {
                    htmlContent += "</tr><tr>";
                }

                const id = `gal_${index}`;
                const isDirect = ['rewind', 'best_ones', 'spotting_best'].includes(parentCat);
                const isInsideHtmlFolder = window.location.pathname.includes('/html/');
                const galleryPath = isInsideHtmlFolder ? 'gallery.html' : 'html/gallery.html';
                const targetLink = isDirect ? gal.hd_url : `${galleryPath}?cat=${gal.parent_category}&year=${encodeURIComponent(gal.year)}`;

                let caseContent = "";
                const useBigStyle = ['spotting_year', 'spotting_airline', 'spotting_aircraft', 'rewind', 'best_ones', 'spotting_best'].includes(parentCat);

                if (useBigStyle) {
                    caseContent = `
                        <br/>
                        <span style="font-size:3vw;color:#f1b4b4;">${gal.year}</span><br/>
                        <img src="${gal.thumbnail_url}" class="photo_case_big_with_title"/>`;
                } else {
                    // TON CODE EXACT DE BASE
                    caseContent = `
                        <br/>
                        <span style="font-size:3vw;color:#f1b4b4;">${gal.year}</span><br/>
                        <span style="font-size:1vw;color:#a45656;">${gal.description || ''}</span><br/>
                        <img src="${gal.thumbnail_url}" class="photo_case"/>`;
                }

                htmlContent += `
                    <th>
                        <a href="${targetLink}">
                            <p onmouseover="onmouseover0('${id}')" onmouseout="onmouseout0('${id}')" class="case1" id="${id}">
                                ${caseContent}
                            </p>
                        </a>
                    </th>`;
            });

            htmlContent += "</tr>"; // On ferme la dernière ligne
            list.innerHTML = htmlContent;
        } else {
            list.innerHTML = `<tr><td style="color: #f1b4b4; font-size: 2vw; text-align: center; padding: 50px;">No archives found.</td></tr>`;
        }
    } catch (err) { console.error(err); }
}

// --- 2. CHARGEMENT DES PHOTOS (Galerie unique) ---
async function loadGallery(type, boxName) {
    const list = document.getElementById('gallery-row');
    if (!list) return;
    list.innerHTML = ''; 

    try {
        let query = window.supabaseClient.from('portfolio').select('*');
        if (type === 'spotting_airline') query = query.eq('airline', boxName);
        else if (type === 'spotting_aircraft') query = query.eq('model_global', boxName);
        else if (type === 'spotting_year') query = query.eq('date', boxName).eq('categorie', 'spotting');
        else query = query.eq('sous_categorie', type).eq('date', boxName);

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
            let htmlContent = "<tr>"; // On ouvre la première ligne

            data.forEach((item, index) => {
                // Retour à la ligne tous les 3 éléments
                if (index > 0 && index % 3 === 0) {
                    htmlContent += "</tr><tr>";
                }

                const id = `img_${index}`;
                htmlContent += `
                    <th>
                        <a href="${item.image_url_hd}">
                            <img src="${item.image_url}" id="${id}" class="case1" onmouseover="onmouseover0('${id}')" onmouseout="onmouseout0('${id}')" style="object-fit: cover;" />
                        </a>
                    </th>`;
            });

            htmlContent += "</tr>"; // On ferme la dernière ligne
            list.innerHTML = htmlContent;
        } else {
            list.innerHTML = `<tr><td style="color: #f1b4b4; font-size: 2vw; text-align: center; padding: 50px;">No photos found.</td></tr>`;
        }
    } catch (err) { console.error(err); }
}

function initDynamicGallery() {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('cat');
    const year = urlParams.get('year');
    if (cat && year) loadGallery(cat, year);
}