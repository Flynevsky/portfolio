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
            data.forEach((gal, index) => {
                const id = `gal_${index}`;
                const isDirect = ['rewind', 'best_ones', 'spotting_best', 'spotting_ksp'].includes(parentCat);
                const isInsideHtmlFolder = window.location.pathname.includes('/html/');
                const galleryPath = isInsideHtmlFolder ? 'gallery.html' : 'html/gallery.html';
                const targetLink = isDirect ? gal.hd_url : `${galleryPath}?cat=${gal.parent_category}&year=${encodeURIComponent(gal.year)}`;

                let caseContent = "";
                const useBigStyle = ['spotting_year', 'spotting_airline', 'spotting_aircraft', 'rewind', 'best_ones', 'spotting_best', 'spotting_ksp'].includes(parentCat);

                if (useBigStyle) {
                    // STYLE BIG (Titre + Image large)
                    caseContent = `
                        <br/><span style="font-size:3vw;color:#f1b4b4;">${gal.year}</span><br/>
                        <img src="${gal.thumbnail_url}" class="photo_case_big_with_title"/>`;
                } else {
                    // STYLE STANDARD (Titre + Sous-titre + Image)
                    caseContent = `
                        <br/><span style="font-size:3vw;color:#f1b4b4;">${gal.year}</span><br/>
                        <span style="font-size:1vw;color:#a45656;">${gal.description || ''}</span><br/>
                        <img src="${gal.thumbnail_url}" class="photo_case"/>`;
                }

                list.innerHTML += `
                    <th>
                        <a href="${targetLink}">
                            <div onmouseover="onmouseover0('${id}')" onmouseout="onmouseout0('${id}')" class="case1" id="${id}">
                                ${caseContent}
                            </div>
                        </a>
                    </th>`;
            });
        } else {
            list.innerHTML = `<td style="color:#666; padding:50px; text-align:center; width:100vw;">No archives found for ${parentCat}.</td>`;
        }
    } catch (err) {
        list.innerHTML = `<td style="color:red; text-align:center; width:100vw;">Connection error.</td>`;
    }
}

// --- 2. CHARGEMENT DES PHOTOS (Galerie unique) ---
async function loadGallery(type, boxName) {
    const row = document.getElementById('gallery-row');
    if (!row) return;
    row.innerHTML = ''; 

    try {
        let query = window.supabaseClient.from('portfolio').select('*');
        if (type === 'spotting_airline') query = query.eq('airline', boxName);
        else if (type === 'spotting_aircraft') query = query.eq('model_global', boxName);
        else if (type === 'spotting_year') query = query.eq('date', boxName).eq('categorie', 'spotting');
        else query = query.eq('sous_categorie', type).eq('date', boxName);

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
            data.forEach((item, index) => {
                row.innerHTML += `
                    <th>
                        <a href="${item.image_url_hd}">
                            <img src="${item.image_url}" id="img_${index}" class="case1" onmouseover="onmouseover0(this.id)" onmouseout="onmouseout0(this.id)" />
                        </a>
                    </th>`;
            });
        } else {
            row.innerHTML = `<td style="color:#666; padding:50px; text-align:center; width:100vw;">No photos found.</td>`;
        }
    } catch (err) {
        row.innerHTML = `<td style="color:red; text-align:center; width:100vw;">Error loading images.</td>`;
    }
}

function initDynamicGallery() {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('cat');
    const year = urlParams.get('year');
    if (cat && year) loadGallery(cat, year);
}