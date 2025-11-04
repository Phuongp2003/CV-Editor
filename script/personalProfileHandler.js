const save_slots = 7
let slot_data = []
let profile_data = {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "linkedin_placeholder": "",
    "github": "",
    "github_placeholder": "",
    "website": "",
    "website_placeholder": "",
    "profileImage": "",
    "profileImageType": "",
    "language": "",
}

export function mapObject_profile(obj_cv) {
    const keys = Object.keys(profile_data);
    const temp = {};
    keys.forEach(key => {
        temp[key] = obj_cv["cv"][key] || '';
    })
    return temp;
}

export function mapObject_cv(obj_profile, obj_cv) {
    const keys = Object.keys(profile_data);
    keys.forEach(key => {
        obj_cv["cv"][key] = obj_profile[key] || '';
    })
    console.log("obj_cv: ", obj_cv)
    return obj_cv;
}

export function initializeProfileHandler() {
    for (let i = 0; i < save_slots; i++) {
        slot_data.push("")
    }
    const storedData = loadProfilesFromStorage();
    const profileSelect = document.getElementById("profile-select");
    console.log("storedData: ", !storedData, storedData)
    if (!storedData)
        localStorage.setItem('profileData', JSON.stringify(slot_data));
    else
        slot_data = storedData
    for (let i = 0; i < save_slots; i++) {
        const option = document.createElement("option");
        option.value = i;
        if (slot_data[i])
            option.innerText = `${slot_data[i].name} - ${slot_data[i].language}`;
        else
            option.innerText = `${i + 1}`;
        profileSelect.appendChild(option);
    }
    console.log("slot_data: ", slot_data)
}

export function deleteProfile(slot_idx) {
    slot_data[slot_idx] = ""
    const profileOptions = document.getElementById("profile-select").querySelectorAll("option");
    profileOptions[slot_idx + 1].innerText = `${slot_idx + 1}`;
    localStorage.setItem('profileData', JSON.stringify(slot_data));
    document.getElementById("profile-label").innerText = `Profile in slot ${slot_idx + 1} deleted`;
}

export function saveProfileToStorage(slot_idx, obj) {
    slot_data[slot_idx] = obj
    console.log("slot_data: ", slot_data)
    const profileOptions = document.getElementById("profile-select").querySelectorAll("option");
    profileOptions[slot_idx + 1].innerText = `${obj.name} - ${obj.language}`;
    localStorage.setItem('profileData', JSON.stringify(slot_data));
    document.getElementById("profile-label").innerText = `Profile saved to slot ${slot_idx + 1}`;
}

export function loadProfile(slot_idx) {
    document.getElementById("profile-select").value = slot_idx;
    document.getElementById("profile-label").innerText = `Profile loaded from slot ${slot_idx + 1}`;
    return slot_data[slot_idx]
}

function loadProfilesFromStorage() {
    try {
        return JSON.parse(localStorage.getItem('profileData'));
    }
    catch (e) {
        console.error("Error loading profile data from storage:", e);
        return null
    }
}