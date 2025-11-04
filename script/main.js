import {
  handleImageUpload,
  removeProfileImage,
  addImageToPDF,
  getImageBottomPosition,
  loadImageFromData,
  getImageData,
  initializeImageHandler,
  hasImage,
} from "./imageHandler.js";

import {
  initializeProfileHandler,
  saveProfileToStorage,
  loadProfile,
  mapObject_profile,
  mapObject_cv,
  deleteProfile
} from "./personalProfileHandler.js"

import HideShowKey from "./hideShowKey.js";

const maxCharacters = 260; // limit the number of characters
const padding = 5;
const inputEle = document.querySelector("#input");
const AI_select = document.querySelector("#ai-select");
const cover_letter = document.querySelector("#Cover-letter");
let GEMINI_API_KEY = "";
const apiKeyInput = document.getElementById("api-key");
const saveApiKeyBtn = document.getElementById("save-api-key");
const apiEyeDiv = document.getElementById("api-eye-div");
const languageSelect = document.getElementById("language");


// Load saved API key from localStorage if available
GEMINI_API_KEY = localStorage.getItem("gemini_api_key");
if (GEMINI_API_KEY) {
  apiKeyInput.value = GEMINI_API_KEY;
}

// Initialize HideShowKey functionality
new HideShowKey(apiEyeDiv, apiKeyInput);

saveApiKeyBtn.addEventListener("click", () => {
  GEMINI_API_KEY = apiKeyInput.value;
  localStorage.setItem("gemini_api_key", GEMINI_API_KEY);
});

let CV_obj = {
  name: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  website: "",
  summary: "",
  experiences: [
    {
      position: "",
      company: "",
      location: "",
      dates: "",
      bullets: "",
    },
  ],
  educations: [
    {
      university: "",
      degree: "",
      gpa: "",
      graduationDate: "",
    },
  ],
  projects: [
    {
      projectName: "",
      projectLink: "",
      bullets: "",
    },
  ],
  skills: [
    {
      skill: "",
      description: "",
    },
  ],
  certificates: [
    {
      certName: "",
      "issuer/description": "",
      certDate: "",
    },
  ],
};

let CoverLetter_Obj = {
  header: {
    name: "",
    email: "",
    phone: "",
    location: "",
    date: "",
    recipientName: "",
    recipientTitle: "",
    companyName: "",
    companyAddress: "",
  },
  greeting: "",
  openingParagraph: "",
  bodyParagraphs: [],
  closingParagraph: "",
  signOff: "",
};

function limitCharacters(input) {
  if (input.value.length > maxCharacters) {
    input.value = input.value.slice(0, maxCharacters);
  }
}

function PersonalInfo() {
  const data = [];
  if (document.getElementById("location").value)
    data.push(document.getElementById("location").value);
  if (document.getElementById("email").value)
    data.push(document.getElementById("email").value);
  if (document.getElementById("linkedin").value)
    data.push(document.getElementById("linkedin").value);
  return data.join(" • ");
}

function PersonalInfo2() {
  const data = [];
  if (document.getElementById("github").value)
    data.push(document.getElementById("github").value);
  if (document.getElementById("website").value)
    data.push(document.getElementById("website").value);
  return data.join(" • ");
}

// Helper functions for PDF generation using object data
function getPersonalInfoFromObj(obj) {
  const data = [];
  if (obj.location) data.push(obj.location);
  if (obj.email) data.push(obj.email);
  if (obj.phone) data.push(obj.phone);
  return data.join(" • ");
}

function getPersonalInfo2FromObj(obj) {
  const data = [];
  if (obj.github || obj.github_placeholder) {
    if (obj.github_placeholder) {
      data.push(obj.github_placeholder);
    } else if (obj.github) {
      data.push(obj.github);
    }
  }
  if (obj.website || obj.website_placeholder) {
    if (obj.website_placeholder) {
      data.push(obj.website_placeholder);
    } else if (obj.website) {
      data.push(obj.website);
    }
  }
  if (obj.linkedin || obj.linkedin_placeholder) {
    if (obj.linkedin_placeholder) {
      data.push(obj.linkedin_placeholder);
    } else if (obj.linkedin) {
      data.push(obj.linkedin);
    }
  }
  return data.join(" • ");
}

function deleteBlock(btn, containerId) {
  const container = document.getElementById(containerId);
  // Count only the block entries (child elements)
  if (container.children.length > 1) {
    btn.parentElement.remove();
    // AutoUpdate();
  } else {
    alert("At least one block must remain in this section.");
  }
}

function addExperience() {
  const newEntry = document.createElement("div");
  newEntry.className = "experience-entry";
  newEntry.innerHTML = `
      <input type="text" placeholder="Position" class="w-full p-2 border rounded">
      <input type="text" placeholder="Company" class="w-full p-2 border rounded mt-2">
      <input type="text" placeholder="Location (optional)" class="w-full p-2 border rounded mt-2">
      <input type="text" placeholder="Dates" class="w-full p-2 border rounded mt-2">
      <textarea placeholder="Bullet points (one per line)" class="w-full p-2 border rounded mt-2 h-24"></textarea>
      <button class="delete-btn btn btn-error text-white px-2 py-1 rounded mt-2" data-container="experience-fields">
        Delete
      </button>
    `;
  document.getElementById("experience-fields").appendChild(newEntry);
  AutoUpdate();
}

function addEducation() {
  const newEntry = document.createElement("div");
  newEntry.className = "education-entry space-y-4 mt-6";
  newEntry.innerHTML = `
      <input type="text" placeholder="University" class="w-full p-2 border rounded">
      <input type="text" placeholder="Degree" class="w-full p-2 border rounded">
      <input type="text" placeholder="GPA (optional)" class="w-full p-2 border rounded">
      <input type="text" placeholder="Graduation Date" class="w-full p-2 border rounded">
      <button class="delete-btn btn btn-error text-white px-2 py-1 rounded mt-2" data-container="education-fields">
        Delete
      </button>
    `;
  document.getElementById("education-fields").appendChild(newEntry);
  AutoUpdate();
}

function addCertificate() {
  const newEntry = document.createElement("div");
  newEntry.className = "certificate-entry space-y-4 mt-6";
  newEntry.innerHTML = `
      <input type="text" placeholder="Certification Name" class="w-full p-2 border rounded" />
      <input type="text" placeholder="Issuer/Description" class="w-full p-2 border rounded" />
      <input type="text" placeholder="Certification Date" class="w-full p-2 border rounded" />
      <button class="delete-btn btn btn-error text-white px-2 py-1 rounded mt-2" data-container="certificate-fields">
        Delete
      </button>
    `;
  document.getElementById("certificate-fields").appendChild(newEntry);
  AutoUpdate();
}

function addProject() {
  const newEntry = document.createElement("div");
  newEntry.className = "project-entry";
  newEntry.innerHTML = `
      <input type="text" placeholder="Project Name" class="w-full p-2 border rounded">
      <input type="text" placeholder="Link (optional)" class="w-full p-2 border rounded mt-2">
      <textarea placeholder="Bullet points (one per line)" class="w-full p-2 border rounded mt-2 h-24"></textarea>
      <button class="delete-btn btn btn-error text-white px-2 py-1 rounded mt-2" data-container="project-fields">
        Delete
      </button>
    `;
  document.getElementById("project-fields").appendChild(newEntry);
  AutoUpdate();
}

function addSkill() {
  const newEntry = document.createElement("div");
  newEntry.className = "skills-entry space-y-4 mt-6";
  newEntry.innerHTML = `
      <input type="text" placeholder="Skill Name" class="w-full p-2 border rounded">
      <input type="text" placeholder="Description" class="w-full p-2 border rounded">
      <button class="delete-btn btn btn-error text-white px-2 py-1 rounded mt-2" data-container="skills-fields">
        Delete
      </button>
    `;
  document.getElementById("skills-fields").appendChild(newEntry);
  AutoUpdate();
}

function AutoUpdate() {
  // Update preview on any input
  const obj = getObject();
  generatePDF(obj.cv);
}
AutoUpdate();

function getObject() {
  const name = document.getElementById("name")?.value;
  const email = document.getElementById("email")?.value;
  const phone = document.getElementById("phone")?.value;
  const location = document.getElementById("location")?.value;
  const linkedin = document.getElementById("linkedin")?.value;
  const linkedin_placeholder = document.getElementById("linkedin_placeholder")?.value;
  const github = document.getElementById("github")?.value;
  const github_placeholder = document.getElementById("github_placeholder")?.value;
  const website = document.getElementById("website")?.value;
  const website_placeholder = document.getElementById("website_placeholder")?.value;
  const summary = document.getElementById("summary")?.value;
  const language = document.getElementById("language")?.value;
  const experiences = Array.from(
    document.querySelectorAll(".experience-entry")
  ).map((entry, index) => {
    const fields = entry.querySelectorAll("input, textarea");
    const position = fields[0].value;
    const company = fields[1].value;
    const location = fields[2].value;
    const dates = fields[3].value;
    const bullets = fields[4].value;
    console.log(index, fields);
    return { position, company, location, dates, bullets };
  });
  const projects = Array.from(document.querySelectorAll(".project-entry")).map(
    (entry) => {
      const fields = entry.querySelectorAll("input, textarea");
      const projectName = fields[0].value;
      const projectLink = fields[1].value;
      const bullets = fields[2].value;
      return { projectName, projectLink, bullets };
    }
  );
  const skills = Array.from(document.querySelectorAll(".skills-entry")).map(
    (entry) => {
      const fields = entry.querySelectorAll("input");
      const skill = fields[0].value;
      const description = fields[1].value;
      return { skill, description };
    }
  );
  const educations = Array.from(
    document.querySelectorAll(".education-entry")
  ).map((entry) => {
    const fields = entry.querySelectorAll("input");
    const university = fields[0].value;
    const degree = fields[1].value;
    const gpa = fields[2].value;
    const graduationDate = fields[3].value;
    return { university, degree, gpa, graduationDate };
  });
  const certificates = Array.from(
    document.querySelectorAll(".certificate-entry")
  ).map((entry) => {
    const fields = entry.querySelectorAll("input");
    const certName = fields[0].value;
    const issuer = fields[1].value;
    const certDate = fields[2].value;
    return { certName, "issuer/description": issuer, certDate };
  })

  // Get image data from ImageHandler module
  const imageData = getImageData();

  const obj = {
    cv: {
      name,
      email,
      phone,
      language,
      location,
      linkedin,
      linkedin_placeholder,
      github,
      github_placeholder,
      website,
      website_placeholder,
      summary,
      experiences,
      projects,
      skills,
      educations,
      certificates,
      ...imageData,
    },
    coverLetter: CoverLetter_Obj,
  };
  console.log("get object", obj);
  return obj;
}

function downloadJson() {
  const obj = getObject();
  const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const saveName = prompt("Enter a name for your save file");
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  // the filename you want
  a.download = `${saveName ? saveName : "resume"}.json`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Generate a selectable PDF using jsPDF text functions
function generatePDF(obj, save = false) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "p",
    unit: "pt",
    format: "a4",
    putOnlyUsedFonts: true,
  });
  let marginLeft = 40;
  let y = 40;
  const lineHeight = 16;
  var midPage = doc.internal.pageSize.getWidth() / 2;
  let marginRight = doc.internal.pageSize.getWidth() - 30;
  let marginBottom = doc.internal.pageSize.getHeight() - 30;
  let marginTop = 40;
  let deliminator = ' | '
  let deliminatorLength = doc.getStringUnitWidth(deliminator) * 10
  console.log(
    "doc",
    doc.internal.pageSize.getWidth(),
    doc.internal.pageSize.getHeight()
  );
  // const obj = getObject()

  const language = document.getElementById("language").value;
  if (language == "Japanese") {
    doc.addFileToVFS("NotoSans-normal.ttf", RegJap);
    doc.addFileToVFS("NotoSans-bold.ttf", Boldjap);
  } else if (language == "Korean") {
    doc.addFileToVFS("NotoSans-normal.ttf", KrRegular);
    doc.addFileToVFS("NotoSans-bold.ttf", KrBold);
  } else if (language == "Chinese") {
    doc.addFileToVFS("NotoSans-normal.ttf", RegCN);
    doc.addFileToVFS("NotoSans-bold.ttf", BoldCN);
  } else {
    doc.addFileToVFS("NotoSans-normal.ttf", font);
    doc.addFileToVFS("NotoSans-bold.ttf", fontBold);
  }
  doc.addFont("NotoSans-normal.ttf", "NotoSans", "normal");
  doc.addFont("NotoSans-bold.ttf", "NotoSans", "bold");

  const fonts = doc.getFontList();
  console.log(fonts);

  // Utility function to add wrapped text
  function addWrappedText(text, x, y, maxWidth) {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length;
  }

  function checkAndAddPage() {
    if (y > marginBottom) {
      console.log("adding page");
      doc.addPage("a4", "p");
      y = marginTop;
    }
  }

  // information string function
  function formatOutput(temp, placeholder, link) {
    if (temp) {
      if (placeholder) return `${deliminator}${placeholder}`;
      if (link) return `${deliminator}${link}`;
    } else {
      if (placeholder) return `${placeholder}`;
      if (link) return `${link}`;
    }
    return "";
  }

  function formatOutputNoDot(placeholder, link) {
    if (placeholder) return `${placeholder}`;
    if (link) return `${link}`;
    return "";
  }

  // Add profile image if available - treated as absolute positioned element
  let headerStartY = y; // Save starting position for header

  // Use ImageHandler module to add image to PDF
  const imageInfo = addImageToPDF(doc, marginLeft, y);
  const imageWidth = imageInfo.width;
  const imageHeight = imageInfo.height;
  const ImageMarginRight = marginLeft + imageWidth + padding + lineHeight / 2; // Margin after image

  const personalInfo = getPersonalInfoFromObj(obj);
  const personalInfo2 = getPersonalInfo2FromObj(obj);
  let personalInfoY = y + lineHeight + padding;



  if (hasImage()) {
    // Personal Information 
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(16);
    const name = obj.name;

    // Place name at right side of the image
    doc.text(name || "Your Name", ImageMarginRight, y);

    // Move to next line for personal info
    personalInfoY = y + lineHeight + padding;
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(10);

    // Place Personal Info right of the image
    if (personalInfo) {
      let location = obj.location;
      let email = obj.email;
      let phone = obj.phone;

      // location
      let content = location ? `${location}` : "";
      let temp = location ? `${location}` : "";
      let tempLength = doc.getStringUnitWidth(temp) * 10;
      doc.text(content, ImageMarginRight, personalInfoY);

      // email
      content = temp && email ? `${deliminator}${email}` : email ? `${email}` : "";
      temp += temp && email ? `${deliminator}${email}` : email ? `${email}` : "";
      doc.text(content, ImageMarginRight + tempLength, personalInfoY);
      tempLength = doc.getStringUnitWidth(temp) * 10;

      // phone
      content = temp && phone ? `${deliminator}${phone}` : phone ? `${phone}` : "";
      temp += temp && phone ? `${deliminator}${phone}` : phone ? `${phone}` : "";
      doc.text(content, ImageMarginRight + tempLength, personalInfoY);
      tempLength = doc.getStringUnitWidth(temp) * 10;

      // console.log(fullLength - tempLength, fullLength, tempLength);

      personalInfoY += lineHeight + padding;
    }

    if (personalInfo2) {
      let github = obj.github;
      let website = obj.website;
      let linkedin = obj.linkedin;
      let linkedin_placeholder = obj.linkedin_placeholder;
      let github_placeholder = obj.github_placeholder;
      let website_placeholder = obj.website_placeholder;

      // github
      let content = formatOutput("", github_placeholder, github);
      let temp = formatOutput("", github_placeholder, github);
      let rawText = formatOutputNoDot(github_placeholder, github);
      console.log("github", content, "|", temp);
      if (github.includes("https://") || github.includes("www.")) {
        doc.setTextColor("#115bca");
        doc.setDrawColor("#115bca");
        doc.textWithLink(
          rawText,
          ImageMarginRight,
          personalInfoY,
          { url: github }
        );
        const textWidth = doc.getStringUnitWidth(rawText) * 10;
        doc.line(
          ImageMarginRight,
          personalInfoY,
          ImageMarginRight + textWidth,
          personalInfoY
        );
        doc.setTextColor("#000000");
        doc.setDrawColor("#000000");
      } else
        doc.text(
          content,
          ImageMarginRight,
          personalInfoY,
        );
      let tempLength = doc.getStringUnitWidth(temp) * 10;


      // website
      content = formatOutput(temp, website_placeholder, website);
      temp += formatOutput(temp, website_placeholder, website);
      rawText = formatOutputNoDot(website_placeholder, website);
      if (website.includes("https://") || website.includes("www.")) {
        doc.text(
          deliminator,
          ImageMarginRight + tempLength,
          personalInfoY
        )
        doc.setTextColor("#115bca");
        doc.setDrawColor("#115bca");
        doc.textWithLink(
          rawText,
          ImageMarginRight + tempLength + deliminatorLength,
          personalInfoY,
          { url: website }
        );
        const textWidth = doc.getStringUnitWidth(rawText) * 10;
        doc.line(
          ImageMarginRight + tempLength + deliminatorLength,
          personalInfoY,
          ImageMarginRight + tempLength + deliminatorLength + textWidth,
          personalInfoY
        );
        doc.setTextColor("#000000");
        doc.setDrawColor("#000000");
      } else
        doc.text(
          content,
          ImageMarginRight + tempLength,
          personalInfoY,
        );
      tempLength = doc.getStringUnitWidth(temp) * 10;

      // linkedin
      content = formatOutput(temp, linkedin_placeholder, linkedin);
      temp += formatOutput(temp, linkedin_placeholder, linkedin);
      rawText = formatOutputNoDot(linkedin_placeholder, linkedin);
      // console.log("linkedin", content, "|", temp);
      if (linkedin.includes("https://") || linkedin.includes("www.")) {
        doc.text(
          deliminator,
          ImageMarginRight + tempLength,
          personalInfoY
        )
        doc.setTextColor("#115bca");
        doc.setDrawColor("#115bca");
        doc.textWithLink(
          rawText,
          ImageMarginRight + tempLength + deliminatorLength,
          personalInfoY,
          { url: linkedin }
        );
        const textWidth = doc.getStringUnitWidth(rawText) * 10;
        doc.line(
          ImageMarginRight + tempLength + deliminatorLength,
          personalInfoY,
          ImageMarginRight + tempLength + deliminatorLength + textWidth,
          personalInfoY
        );
        doc.setTextColor("#000000");
        doc.setDrawColor("#000000");
      } else
        doc.text(
          content,
          ImageMarginRight + tempLength,
          personalInfoY
        );
      tempLength = doc.getStringUnitWidth(temp) * 10;

      personalInfoY += lineHeight + padding;
    }
  }
  else {
    // Personal Information 
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(16);
    const name = obj.name;

    // Center name at mid-page
    doc.text(name || "Your Name", midPage, y, { align: "center" });

    // Move to next line for personal info
    personalInfoY = y + lineHeight + padding;
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(10);

    // centered Personal Info
    if (personalInfo) {
      const fullLength = doc.getStringUnitWidth(personalInfo) * 10;

      let location = obj.location;
      let email = obj.email;
      let phone = obj.phone;

      // location
      let content = location ? `${location}` : "";
      let temp = location ? `${location}` : "";
      let tempLength = doc.getStringUnitWidth(temp) * 10;
      doc.text(content, midPage - (fullLength / 2 - tempLength), personalInfoY, {
        align: "right",
      });

      // email
      content = temp && email ? `${deliminator}${email}` : email ? `${email}` : "";
      temp += temp && email ? `${deliminator}${email}` : email ? `${email}` : "";
      tempLength = doc.getStringUnitWidth(temp) * 10;
      doc.text(content, midPage - (fullLength / 2 - tempLength), personalInfoY, {
        align: "right",
      });

      // phone
      content = temp && phone ? `${deliminator}${phone}` : phone ? `${phone}` : "";
      temp += temp && phone ? `${deliminator}${phone}` : phone ? `${phone}` : "";
      tempLength = doc.getStringUnitWidth(temp) * 10;
      doc.text(content, midPage - (fullLength / 2 - tempLength), personalInfoY, {
        align: "right",
      });

      personalInfoY += lineHeight + padding;
    }

    if (personalInfo2) {
      const fullLength = doc.getStringUnitWidth(personalInfo2) * 10;

      let github = obj.github;
      let website = obj.website;
      let linkedin = obj.linkedin;
      let linkedin_placeholder = obj.linkedin_placeholder;
      let github_placeholder = obj.github_placeholder;
      let website_placeholder = obj.website_placeholder;

      // github
      let content = formatOutput("", github_placeholder, github);
      let temp = formatOutput("", github_placeholder, github);
      let rawText = formatOutputNoDot(github_placeholder, github);
      let tempLength = doc.getStringUnitWidth(temp) * 10;
      let rawLength = doc.getStringUnitWidth(rawText) * 10;
      console.log("github", content, "|", temp);
      if (github.includes("https://") || github.includes("www.")) {
        doc.setTextColor("#115bca");
        doc.setDrawColor("#115bca");
        doc.textWithLink(
          rawText,
          midPage - (fullLength / 2 - tempLength),
          personalInfoY,
          { url: github, align: "right" }
        );
        const textWidth = doc.getStringUnitWidth(rawText) * 10;
        doc.line(
          midPage - (fullLength / 2 - tempLength) - textWidth,
          personalInfoY,
          midPage - (fullLength / 2 - tempLength),
          personalInfoY
        );
        doc.setTextColor("#000000");
        doc.setDrawColor("#000000");
      } else
        doc.text(
          content,
          midPage - (fullLength / 2 - tempLength),
          personalInfoY,
          { align: "right" }
        );

      // website
      content = formatOutput(temp, website_placeholder, website);
      temp += formatOutput(temp, website_placeholder, website);
      rawText = formatOutputNoDot(website_placeholder, website);
      tempLength = doc.getStringUnitWidth(temp) * 10;
      rawLength = doc.getStringUnitWidth(rawText) * 10;
      if (website.includes("https://") || website.includes("www.")) {
        doc.text(
          deliminator,
          midPage - (fullLength / 2 - tempLength + rawLength),
          personalInfoY,
          { align: "right" }
        )
        doc.setTextColor("#115bca");
        doc.setDrawColor("#115bca");
        doc.textWithLink(
          rawText,
          midPage - (fullLength / 2 - tempLength),
          personalInfoY,
          { url: website, align: "right" }
        );
        const textWidth = doc.getStringUnitWidth(rawText) * 10;
        doc.line(
          midPage - (fullLength / 2 - tempLength) - textWidth,
          personalInfoY,
          midPage - (fullLength / 2 - tempLength),
          personalInfoY
        );
        doc.setTextColor("#000000");
        doc.setDrawColor("#000000");
      } else
        doc.text(
          content,
          midPage - (fullLength / 2 - tempLength),
          personalInfoY,
          { align: "right" }
        );

      // linkedin
      content = formatOutput(temp, linkedin_placeholder, linkedin);
      temp += formatOutput(temp, linkedin_placeholder, linkedin);
      rawText = formatOutputNoDot(linkedin_placeholder, linkedin);
      // console.log("linkedin", content, "|", temp);
      tempLength = doc.getStringUnitWidth(temp) * 10;
      rawLength = doc.getStringUnitWidth(rawText) * 10;
      if (linkedin.includes("https://") || linkedin.includes("www.")) {
        doc.text(
          deliminator,
          midPage - (fullLength / 2 - tempLength + rawLength),
          personalInfoY,
          { align: "right" }
        )
        doc.setTextColor("#115bca");
        doc.setDrawColor("#115bca");
        doc.textWithLink(
          rawText,
          midPage - (fullLength / 2 - tempLength),
          personalInfoY,
          { url: linkedin, align: "right" }
        );
        const textWidth = doc.getStringUnitWidth(rawText) * 10;
        doc.line(
          midPage - (fullLength / 2 - tempLength) - textWidth,
          personalInfoY,
          midPage - (fullLength / 2 - tempLength),
          personalInfoY
        );
        doc.setTextColor("#000000");
        doc.setDrawColor("#000000");
      } else
        doc.text(
          content,
          midPage - (fullLength / 2 - tempLength),
          personalInfoY,
          { align: "right" }
        );

      console.log(fullLength - tempLength, fullLength, tempLength, temp);

      personalInfoY += lineHeight + padding;
    }
  }

  // If no personal info was displayed, set personalInfoY to continue from name
  if (!personalInfo && !personalInfo2) {
    personalInfoY = headerStartY + lineHeight + padding;
  }

  // Set y position to continue below the header (image + personal info)
  if (hasImage()) {
    const imageBottom = getImageBottomPosition(
      headerStartY,
      imageHeight,
      lineHeight + padding
    );
    console.log("imageBottom", imageBottom, "|", personalInfoY);
    y = Math.max(personalInfoY, imageBottom);
  } else {
    y = personalInfoY;
  }

  // Summary
  // const summary = document.getElementById('summary').value;
  const summary = obj.summary;
  if (summary.trim()) {
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(14);
    doc.text("Summary", marginLeft, y);
    doc.line(marginLeft, y + 5, marginRight, y + 5);
    y += lineHeight + padding;
    checkAndAddPage();

    doc.setFont("NotoSans", "normal");
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(summary, 500);
    doc.text(summary, marginLeft, y, {
      align: "justify",
      maxWidth: 500,
      lineHeightFactor: 1.5,
    });
    for (let i = 0; i < summaryLines.length; i++) {
      // doc.text(summaryLines[i], marginLeft, y, {align: "justify", maxWidth: 500});
      y += lineHeight;
      if (i == summaryLines.length - 1) y += 5;
      checkAndAddPage();
    }
    // console.log(summaryLines)
  }

  // Skills Section
  const skillsEntries = obj.skills;
  if (skillsEntries.length) {
    const check = obj.skills;
    if (check[0].skill || check[0].description) {
      doc.setFont("NotoSans", "bold");
      doc.setFontSize(14);
      doc.text("Skills", marginLeft, y);
      doc.line(marginLeft, y + 5, marginRight, y + 5);
      y += lineHeight + padding;
      checkAndAddPage();

      skillsEntries.forEach((entry, index) => {
        // const fields = entry.querySelectorAll('input');
        // const skill = fields[0].value;
        // const description = fields[1].value;
        const skill = entry.skill;
        const description = entry.description;
        doc.setFontSize(10);
        let temp = skill ? `**${skill.trim()}**` : "";
        temp +=
          temp && description
            ? `: ${description.trim()}`
            : description
              ? `${description.trim()}`
              : "";
        let startX = marginLeft;
        temp.split("**").forEach((line, index) => {
          doc.setFont("NotoSans", "bold");
          if (index % 2 === 0) {
            doc.setFont("NotoSans", "normal");
          }
          const tempLines = doc.splitTextToSize(
            line.trim(),
            500 - doc.getStringUnitWidth(skill.trim()) * 10
          );
          // console.log(tempLines)
          for (let bline = 0; bline < tempLines.length; bline++) {
            doc.text(tempLines[bline], startX, y);
            if (bline == 0 && tempLines.length == 1)
              startX = startX + doc.getStringUnitWidth(tempLines[bline]) * 10;
            else if (tempLines.length > 1 && bline != tempLines.length - 1) {
              console.log("drop");
              startX = marginLeft;
              y += lineHeight;
              checkAndAddPage();
            }
          }
          // doc.text(line, startX, y);
          // startX = startX + doc.getStringUnitWidth(line) * 10;
        });

        // doc.setFont('NotoSans', 'bold');
        // doc.text(skill, marginLeft, y);
        // doc.setFont('NotoSans', 'normal');
        // doc.text(skill ? " : " + description : description, doc.getTextWidth(skill) + marginLeft, y);

        y += lineHeight;
        if (index != skillsEntries.length - 1 || y < marginBottom)
          checkAndAddPage();
      });
    }
  }

  // Experience Section
  const experienceEntries = obj.experiences;
  if (experienceEntries.length) {
    const check = obj.experiences;
    if (
      check[0].position ||
      check[0].company ||
      check[0].location ||
      check[0].dates ||
      check[0].bullets
    ) {
      doc.setFont("NotoSans", "bold");
      doc.setFontSize(14);
      y += padding;
      checkAndAddPage();
      doc.text("Experience", marginLeft, y);
      doc.line(marginLeft, y + 5, marginRight, y + 5);
      y += lineHeight + padding;
      checkAndAddPage();

      experienceEntries.forEach((entry, index) => {
        const position = entry.position;
        const company = entry.company;
        const location = entry.location;
        const dates = entry.dates;
        const bullets = entry.bullets.split("\n");

        doc.setFontSize(10);
        let temp = position ? `**${position.trim()}**` : "";
        let startX = marginLeft;
        temp.split("**").forEach((line, index) => {
          doc.setFont("NotoSans", "bold");
          if (index % 2 === 0) {
            doc.setFont("NotoSans", "normal");
          }
          doc.text(line, startX, y);
          startX = startX + doc.getStringUnitWidth(line) * 10;
        });
        doc.text(dates, doc.internal.pageSize.getWidth() - 40, y, {
          align: "right",
        });
        y += lineHeight;
        checkAndAddPage();

        // company and location
        temp = company ? `${company.trim()}` : "";
        temp +=
          temp && location
            ? ` - ${location.trim()}`
            : location
              ? `${location.trim()}`
              : "";
        doc.text(temp, marginLeft, y);
        y += lineHeight;
        checkAndAddPage();

        doc.setFont("NotoSans", "normal");
        bullets.forEach((bullet, index) => {
          if (bullet.trim()) {
            const bulletLines = doc.splitTextToSize(bullet.trim(), 500);
            for (let i = 0; i < bulletLines.length; i++) {
              if (i == 0) doc.text("•      " + bulletLines[i], marginLeft, y);
              else doc.text("        " + bulletLines[i], marginLeft, y);
              y += lineHeight;
              if (index != bullets.length - 1 || y < marginBottom)
                checkAndAddPage();
            }
          }
        });
        // if (index != experienceEntries.length - 1)
        //   y += lineHeight
        // checkAndAddPage()
      });
    }
  }

  // Projects Section
  const projectEntries = obj.projects;
  if (projectEntries.length) {
    const check = obj.projects;
    if (check[0].projectName || check[0].projectLink || check[0].bullets) {
      doc.setFont("NotoSans", "bold");
      doc.setFontSize(14);
      y += padding;
      checkAndAddPage();
      doc.text("Projects", marginLeft, y);
      doc.line(marginLeft, y + 5, marginRight, y + 5);
      y += lineHeight + padding;
      checkAndAddPage();

      projectEntries.forEach((entry, index) => {
        // const fields = entry.querySelectorAll('input, textarea');
        // const projectName = fields[0].value;
        // const projectLink = fields[1].value;
        // const bullets = fields[2].value.split('\n');
        const projectName = entry.projectName;
        const projectLink = entry.projectLink;
        const bullets = entry.bullets.split("\n");
        doc.setFont("NotoSans", "bold");
        doc.setFontSize(10);
        const projectNameLines = doc.splitTextToSize(projectName.trim(), 520);
        for (let i = 0; i < projectNameLines.length; i++) {
          doc.text(projectNameLines[i], marginLeft, y);
          if (i != projectNameLines.length - 1) {
            y += lineHeight;
            checkAndAddPage();
          }
        }

        if (projectLink.trim()) {
          doc.setFont("NotoSans", "normal");
          if (
            projectLink.includes("https://") ||
            projectLink.includes("www.")
          ) {
            y += lineHeight;
            checkAndAddPage();
            doc.setTextColor("#115bca");
            doc.setDrawColor("#115bca");
            const projectLinkLines = doc.splitTextToSize(
              projectLink.trim(),
              520
            );
            for (let i = 0; i < projectLinkLines.length; i++) {
              doc.textWithLink(projectLinkLines[i], marginLeft, y, {
                align: "left",
              });
              const textWidth =
                doc.getStringUnitWidth(projectLinkLines[i]) * 10;
              doc.line(marginLeft, y, marginLeft + textWidth, y);
              if (i != projectLinkLines.length - 1) {
                y += lineHeight;
                checkAndAddPage();
              }
            }
            doc.setTextColor("#000000");
            doc.setDrawColor("#000000");
          } else {
            y += lineHeight;
            checkAndAddPage();
            const projectLinkLines = doc.splitTextToSize(
              projectLink.trim(),
              520
            );
            for (let i = 0; i < projectLinkLines.length; i++) {
              doc.text(projectLinkLines[i], marginLeft, y, { align: "left" });
              if (i != projectLinkLines.length - 1) {
                y += lineHeight;
                checkAndAddPage();
              }
            }
          }
          y += lineHeight;
          checkAndAddPage();
        } else {
          doc.setFont("NotoSans", "normal");
          y += lineHeight;
          checkAndAddPage();
        }

        bullets.forEach((bullet, index) => {
          if (bullet.trim()) {
            const bulletLines = doc.splitTextToSize(bullet.trim(), 500);
            for (let i = 0; i < bulletLines.length; i++) {
              if (i == 0) doc.text("•      " + bulletLines[i], marginLeft, y);
              else doc.text("        " + bulletLines[i], marginLeft, y);
              y += lineHeight;
              if (index != bullets.length - 1 || y < marginBottom)
                checkAndAddPage();
            }
          }
        });

        // if (index != projectEntries.length - 1)
        //   y += lineHeight
        // else
        //   y += padding
        // checkAndAddPage()
      });
    }
  }

  // Education Section
  const educationEntries = obj.educations;
  if (educationEntries.length) {
    if (
      obj.educations[0].university ||
      obj.educations[0].degree ||
      obj.educations[0].gpa ||
      obj.educations[0].graduationDate
    ) {
      doc.setFont("NotoSans", "bold");
      doc.setFontSize(14);
      y += padding;
      checkAndAddPage();
      doc.text("Education", marginLeft, y);
      doc.line(marginLeft, y + 5, marginRight, y + 5);
      y += lineHeight + padding;
      checkAndAddPage();

      educationEntries.forEach((entry, index) => {
        // const fields = entry.querySelectorAll('input');
        // const university = fields[0].value;
        // const degree = fields[1].value;
        // const gpa = fields[2].value;
        // const graduationDate = fields[3].value;

        const university = entry.university;
        const degree = entry.degree;
        const gpa = entry.gpa;
        const graduationDate = entry.graduationDate;

        doc.setFontSize(10);
        let temp = university ? `**${university.trim()}**` : "";
        // temp += temp && degree ? `| ${degree.trim()}` : degree ? `${degree.trim()}` : '';
        // temp += temp && gpa ? ` - GPA: ${gpa.trim()}` : gpa ? `GPA: ${gpa.trim()}` : '';
        let startX = marginLeft;
        temp.split("**").forEach((line, index) => {
          doc.setFont("NotoSans", "bold");
          if (index % 2 === 0) {
            doc.setFont("NotoSans", "normal");
          }
          doc.text(line, startX, y);
          startX = startX + doc.getStringUnitWidth(line) * 10;
        });

        doc.setFont("NotoSans", "normal");
        doc.text(graduationDate, marginRight, y, { align: "right" });
        y += lineHeight;
        checkAndAddPage();

        // degree and gpa
        temp = degree ? `${degree.trim()}` : "";
        temp += temp && gpa ? ` - ${gpa.trim()}` : gpa ? `${gpa.trim()}` : "";
        doc.text(temp, marginLeft, y);

        y += lineHeight;
        if (index != educationEntries.length - 1 || y < marginBottom)
          checkAndAddPage();
      });
    }
  }

  // Certifications Section
  const certificateEntries = obj.certificates;
  if (certificateEntries.length) {
    if (
      obj.certificates[0].certName ||
      obj.certificates[0]["issuer/description"]
    ) {
      doc.setFont("NotoSans", "bold");
      doc.setFontSize(14);
      y += padding;
      checkAndAddPage();
      doc.text("Certificates", marginLeft, y);
      doc.line(marginLeft, y + 5, marginRight, y + 5);
      y += lineHeight + padding;
      checkAndAddPage();

      certificateEntries.forEach((entry, index) => {
        // const fields = entry.querySelectorAll('input');
        // const university = fields[0].value;
        // const degree = fields[1].value;
        // const gpa = fields[2].value;
        // const graduationDate = fields[3].value;

        const certName = entry.certName;
        const issuer = entry["issuer/description"];
        const certDate = entry.certDate;

        doc.setFontSize(10);
        let temp = certName ? `**${certName.trim()}**` : "";
        // temp += temp && degree ? `| ${degree.trim()}` : degree ? `${degree.trim()}` : '';
        // temp += temp && gpa ? ` - GPA: ${gpa.trim()}` : gpa ? `GPA: ${gpa.trim()}` : '';
        let startX = marginLeft;
        temp.split("**").forEach((line, index) => {
          doc.setFont("NotoSans", "bold");
          if (index % 2 === 0) {
            doc.setFont("NotoSans", "normal");
          }
          doc.text(line, startX, y);
          startX = startX + doc.getStringUnitWidth(line) * 10;
        });

        doc.setFont("NotoSans", "normal");
        doc.text(certDate, marginRight, y, { align: "right" });
        if (issuer || index != certificateEntries.length - 1) {
          y += lineHeight;
          checkAndAddPage();
        }

        // issuer/description
        if (issuer) {
          temp = issuer ? `${issuer.trim()}` : "";
          doc.text(temp, marginLeft, y);

          if (index != certificateEntries.length - 1) {
            y += lineHeight;
            checkAndAddPage();
          }
        }
      });
    }
  }

  document
    .querySelector("#pdf-embed")
    .setAttribute("data", doc.output("bloburl"));
  if (save) {
    const saveName = prompt("Enter a name for your save file");
    doc.save(`${saveName ? saveName : "resume"}.pdf`);
  }

  // Open the PDF in a new window (selectable text)
  // window.open(doc.output('bloburl'), '_blank');
}

function downloadPDF() {
  const obj = getObject();
  generatePDF(obj.cv, true);
}

function loadHtml(obj) {
  // const obj = getObject()
  document.getElementById("name").value = obj.name;
  document.getElementById("email").value = obj.email;
  document.getElementById("phone").value = obj.phone;
  document.getElementById("location").value = obj.location;
  document.getElementById("linkedin").value = obj.linkedin;
  document.getElementById("github").value = obj.github;
  document.getElementById("website").value = obj.website;
  document.getElementById("summary").value = obj.summary;

  document.getElementById("linkedin_placeholder").value = obj.linkedin_placeholder || "";
  document.getElementById("github_placeholder").value = obj.github_placeholder || "";
  document.getElementById("website_placeholder").value = obj.website_placeholder || "";

  // Load profile image using ImageHandler module
  loadImageFromData(obj);

  // Delete all existing skill entries
  const skillEntries = document.querySelectorAll(".skills-entry");
  skillEntries.forEach((entry, index) => {
    if (index != 0) entry.remove();
  });

  const skills = obj.skills || [];
  skills.map((skill, index) => {
    if (index == 0) {
      const inputs = document
        .querySelector(".skills-entry")
        .querySelectorAll("input");
      inputs[0].value = skill.skill;
      inputs[1].value = skill.description;
    } else {
      const newEntry = document.createElement("div");
      newEntry.className = "skills-entry space-y-4 mt-6";
      newEntry.innerHTML = `
          <input type="text" placeholder="Skill Name" class="w-full p-2 border rounded" value="${skill.skill}">
          <input type="text" placeholder="Description" class="w-full p-2 border rounded" value="${skill.description}">
          <button class="delete-btn btn btn-error text-white px-2 py-1 rounded mt-2" data-container="skills-fields">
            Delete
          </button>
        `;
      document.getElementById("skills-fields").appendChild(newEntry);
    }
  });

  // Delete all existing experience entries
  const experienceEntries = document.querySelectorAll(".experience-entry");
  experienceEntries.forEach((entry, index) => {
    if (index != 0) entry.remove();
  });

  const exps = obj.experiences || [];
  exps.map((exp, index) => {
    if (index == 0) {
      const inputs = document
        .querySelector(".experience-entry")
        .querySelectorAll("input, textarea");
      inputs[0].value = exp.position;
      inputs[1].value = exp.company;
      inputs[2].value = exp.location;
      inputs[3].value = exp.dates;
      inputs[4].value = exp.bullets;
    } else {
      const newEntry = document.createElement("div");
      newEntry.className = "experience-entry";
      newEntry.innerHTML = `
          <input type="text" placeholder="Position" class="w-full p-2 border rounded" value="${exp.position}">
          <input type="text" placeholder="Company" class="w-full p-2 border rounded mt-2" value="${exp.company}">
          <input type="text" placeholder="Location" class="w-full p-2 border rounded mt-2" value="${exp.location}">
          <input type="text" placeholder="Dates" class="w-full p-2 border rounded mt-2" value="${exp.dates}">
          <textarea placeholder="Bullet points (one per line)" class="w-full p-2 border rounded mt-2 h-24" value="${exp.bullets}">${exp.bullets}</textarea>
          <button class="delete-btn btn btn-error text-white px-2 py-1 rounded mt-2" data-container="experience-fields">
            Delete
          </button>
        `;
      document.getElementById("experience-fields").appendChild(newEntry);
    }
  });

  // Delete all existing project entries
  const projectEntries = document.querySelectorAll(".project-entry");
  projectEntries.forEach((entry, index) => {
    if (index != 0) entry.remove();
  });

  const projs = obj.projects || [];
  projs.map((proj, index) => {
    if (index == 0) {
      const inputs = document
        .querySelector(".project-entry")
        .querySelectorAll("input, textarea");
      inputs[0].value = proj.projectName;
      inputs[1].value = proj.projectLink;
      inputs[2].value = proj.bullets;
    } else {
      const newEntry = document.createElement("div");
      newEntry.className = "project-entry";
      newEntry.innerHTML = `
      <input type="text" placeholder="Project Name" class="w-full p-2 border rounded" value="${proj.projectName}">
      <input type="text" placeholder="Link" class="w-full p-2 border rounded mt-2" value="${proj.projectLink}">
      <textarea placeholder="Bullet points (one per line)" class="w-full p-2 border rounded mt-2 h-24" value="${proj.bullets}">${proj.bullets}</textarea>
      <button class="delete-btn btn btn-error text-white px-2 py-1 rounded mt-2" data-container="project-fields">
        Delete
      </button>
    `;
      document.getElementById("project-fields").appendChild(newEntry);
    }
  });

  // Delete all existing certificate entries
  const certificateEntries = document.querySelectorAll(".certificate-entry");
  certificateEntries.forEach((entry, index) => {
    if (index != 0) entry.remove();
  });

  const certs = obj.certificates || [];
  certs.map((cert, index) => {
    if (index == 0) {
      const inputs = document
        .querySelector(".certificate-entry")
        .querySelectorAll("input, textarea");
      inputs[0].value = cert.certName;
      inputs[1].value = cert["issuer/description"];
      inputs[2].value = cert.certDate;
    } else {
      const newEntry = document.createElement("div");
      newEntry.className = "certificate-entry space-y-4 mt-6";
      newEntry.innerHTML = `
      <input type="text" placeholder="Certification Name" class="w-full p-2 border rounded" value="${cert.certName}">
      <input type="text" placeholder="Issuer/Description" class="w-full p-2 border rounded" value="${cert['issuer/description']}">
      <input type="text" placeholder="Certification Date" class="w-full p-2 border rounded" value="${cert.certDate}">
      <button class="delete-btn btn btn-error text-white px-2 py-1 rounded mt-2" data-container="certificate-fields">
        Delete
      </button>
    `;
      document.getElementById("certificate-fields").appendChild(newEntry);
    }
  });

  // Delete all existing education entries
  const educationEntries = document.querySelectorAll(".education-entry");
  educationEntries.forEach((entry, index) => {
    if (index != 0) entry.remove();
  });

  const edus = obj.educations || [];
  edus.map((edu, index) => {
    if (index == 0) {
      const inputs = document
        .querySelector(".education-entry")
        .querySelectorAll("input, textarea");
      inputs[0].value = edu.university;
      inputs[1].value = edu.degree;
      inputs[2].value = edu.gpa;
      inputs[3].value = edu.graduationDate;
    } else {
      const newEntry = document.createElement("div");
      newEntry.className = "education-entry space-y-4 mt-6";
      newEntry.innerHTML = `
      <input type="text" placeholder="University" class="w-full p-2 border rounded" value="${edu.university}">
      <input type="text" placeholder="Degree" class="w-full p-2 border rounded" value="${edu.degree}">
      <input type="text" placeholder="GPA (optional)" class="w-full p-2 border rounded" value="${edu.gpa}">
      <input type="text" placeholder="Graduation Date" class="w-full p-2 border rounded" value="${edu.graduationDate}">
      <button class="delete-btn btn btn-error text-white px-2 py-1 rounded mt-2" data-container="education-fields">
        Delete
      </button>
    `;
      document.getElementById("education-fields").appendChild(newEntry);
    }
  });

  // Update preview after loading data
  AutoUpdate();
}

// Handle save file json upload
inputEle.onchange = async function () {
  document.querySelector(".err").innerText = "";
  if (inputEle.files.length == 0) return;
  const file = inputEle.files[0];
  console.log(file);
  if (file.type != "application/json") {
    document.querySelector(".err").innerText = "not a json file";
    return;
  }
  const obj = JSON.parse(await inputEle.files[0].text());
  loadHtml(obj.cv);
  loadCoverLetter(obj.coverLetter);
  // generatePDF will be called by AutoUpdate in loadHtml
  console.log(obj);
};

const radios = document.querySelectorAll('input[name="my_tabs"]');

radios[0].addEventListener("change", () => {
  document.querySelector("#cv-editor").classList.remove("hidden");
  document.querySelector("#ai-editor").classList.add("hidden");
});

radios[1].addEventListener("change", () => {
  document.querySelector("#ai-editor").classList.remove("hidden");
  document.querySelector("#cv-editor").classList.add("hidden");
});

// Initialize image handler
initializeImageHandler();

// initialize personal profile handler
initializeProfileHandler();

function profileEventListener() {
  document.getElementById("save-profile").addEventListener("click", () => {
    const profile_idx = parseInt(document.getElementById("profile-select").value);
    console.log("profile_idx: ", profile_idx);
    const obj = getObject();
    obj["cv"]['language'] = languageSelect.value;
    const temp_obj = mapObject_profile(obj);
    // console.log(temp_obj);
    saveProfileToStorage(profile_idx, temp_obj);
  });
  document.getElementById("load-profile").addEventListener("click", () => {
    let profile_idx = parseInt(document.getElementById("profile-select").value);
    profile_idx = profile_idx < 0 ? 0 : profile_idx;
    const obj_cv = getObject();
    const obj_profile = loadProfile(profile_idx);
    console.log(obj_cv, obj_profile);
    const obj_final = mapObject_cv(obj_profile, obj_cv);
    loadHtml(obj_final.cv);
  })
  document.getElementById("delete-profile").addEventListener("click", () => {
    const profile_idx = parseInt(document.getElementById("profile-select").value);
    deleteProfile(profile_idx);
  })
}
profileEventListener();

// Initialize all event listeners for buttons
function initializeEventListeners() {
  // Main action buttons
  document
    .getElementById("update-btn")
    ?.addEventListener("click", AutoUpdate);
  document
    .getElementById("download-pdf-btn")
    ?.addEventListener("click", downloadPDF);
  document
    .getElementById("download-json-btn")
    ?.addEventListener("click", downloadJson);
  document
    .getElementById("generate-ai-btn")
    ?.addEventListener("click", generateAI);

  // Add section buttons
  document
    .getElementById("add-skill-btn")
    ?.addEventListener("click", addSkill);
  document
    .getElementById("add-experience-btn")
    ?.addEventListener("click", addExperience);
  document
    .getElementById("add-project-btn")
    ?.addEventListener("click", addProject);
  document
    .getElementById("add-education-btn")
    ?.addEventListener("click", addEducation);
  document
    .getElementById("add-certificate-btn")
    ?.addEventListener("click", addCertificate);

  // Delete buttons event delegation
  document.body.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-btn")) {
      const container = e.target.getAttribute("data-container");
      deleteBlock(e.target, container);
    }
  });
}

// Initialize event listeners when DOM is loaded
initializeEventListeners();

let INSprompt = "";

try {
  INSprompt = await fetch("instruction.txt").then((response) =>
    response.text()
  );
  console.log("fetch INSprompt successfully");
}
catch (e) {
  console.warn("fetch INSprompt failed");
  console.warn(e)
}


async function generateAI() {
  const JD = document.getElementById("JD").value;
  const yourself = document.getElementById("yourself").value;
  const language = languageSelect.value;
  const error = document.querySelector("#AI-error");
  const aiLoader = document.querySelector("#AiLoader");
  const MODEL_ID = "gemini-flash-lite-latest"
  const GENERATE_CONTENT_API = "generateContent"
  error.innerText = "";
  if (!JD) {
    error.innerText = "Job Description is required";
    return;
  }
  try {
    aiLoader.classList.replace("hidden", "flex");
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          "contents": [
            {
              "parts": [
                {
                  "text": JSON.stringify({
                    "Job-description": JD,
                    "user-information": yourself,
                    "translate-to-language": language,
                    today: new Date().toDateString(),
                  })
                },
              ]
            },
          ],
          "generationConfig": {
            "thinkingConfig": {
              "thinkingBudget": -1,
            },
            "responseMimeType": "application/json",
            "responseSchema": {
              "type": "object",
              "properties": {
                "cv": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string"
                    },
                    "email": {
                      "type": "string",
                      "format": "email"
                    },
                    "phone": {
                      "type": "string"
                    },
                    "location": {
                      "type": "string"
                    },
                    "linkedin": {
                      "type": "string",
                      "format": "uri"
                    },
                    "github": {
                      "type": "string",
                      "format": "uri"
                    },
                    "website": {
                      "type": "string",
                      "format": "uri"
                    },
                    "summary": {
                      "type": "string"
                    },
                    "experiences": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "position": {
                            "type": "string"
                          },
                          "company": {
                            "type": "string"
                          },
                          "location": {
                            "type": "string"
                          },
                          "dates": {
                            "type": "string"
                          },
                          "bullets": {
                            "type": "array",
                            "items": {
                              "type": "string"
                            }
                          }
                        },
                        "propertyOrdering": [
                          "position",
                          "company",
                          "location",
                          "dates",
                          "bullets"
                        ]
                      }
                    },
                    "educations": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "university": {
                            "type": "string"
                          },
                          "degree": {
                            "type": "string"
                          },
                          "gpa": {
                            "type": "string"
                          },
                          "graduationDate": {
                            "type": "string"
                          }
                        },
                        "propertyOrdering": [
                          "university",
                          "degree",
                          "gpa",
                          "graduationDate"
                        ]
                      }
                    },
                    "projects": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "projectName": {
                            "type": "string"
                          },
                          "projectLink": {
                            "type": "string",
                            "format": "uri"
                          },
                          "bullets": {
                            "type": "array",
                            "items": {
                              "type": "string"
                            }
                          }
                        },
                        "propertyOrdering": [
                          "projectName",
                          "projectLink",
                          "bullets"
                        ]
                      }
                    },
                    "skills": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "skill": {
                            "type": "string"
                          },
                          "description": {
                            "type": "string"
                          }
                        },
                        "propertyOrdering": [
                          "skill",
                          "description"
                        ]
                      }
                    },
                    "certificates": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "certName": {
                            "type": "string"
                          },
                          "issuer/description": {
                            "type": "string"
                          },
                          "certDate": {
                            "type": "string"
                          }
                        },
                        "propertyOrdering": [
                          "certName",
                          "issuer/description",
                          "certDate"
                        ]
                      }
                    }
                  },
                  "propertyOrdering": [
                    "name",
                    "email",
                    "phone",
                    "location",
                    "linkedin",
                    "github",
                    "website",
                    "summary",
                    "experiences",
                    "educations",
                    "projects",
                    "skills",
                    "certificates"
                  ]
                },
                "coverLetter": {
                  "type": "object",
                  "properties": {
                    "header": {
                      "type": "object",
                      "properties": {
                        "name": {
                          "type": "string"
                        },
                        "email": {
                          "type": "string",
                          "format": "email"
                        },
                        "phone": {
                          "type": "string"
                        },
                        "location": {
                          "type": "string"
                        },
                        "date": {
                          "type": "string",
                          "format": "date"
                        },
                        "recipientName": {
                          "type": "string"
                        },
                        "recipientTitle": {
                          "type": "string"
                        },
                        "companyName": {
                          "type": "string"
                        },
                        "companyAddress": {
                          "type": "string"
                        }
                      },
                      "propertyOrdering": [
                        "name",
                        "email",
                        "phone",
                        "location",
                        "date",
                        "recipientName",
                        "recipientTitle",
                        "companyName",
                        "companyAddress"
                      ]
                    },
                    "greeting": {
                      "type": "string"
                    },
                    "openingParagraph": {
                      "type": "string"
                    },
                    "bodyParagraphs": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    },
                    "closingParagraph": {
                      "type": "string"
                    },
                    "signOff": {
                      "type": "string"
                    }
                  },
                  "propertyOrdering": [
                    "header",
                    "greeting",
                    "openingParagraph",
                    "bodyParagraphs",
                    "closingParagraph",
                    "signOff"
                  ]
                }
              },
              "propertyOrdering": [
                "cv",
                "coverLetter"
              ]
            },
          },
          "system_instruction": {
            "parts": [
              {
                "text": INSprompt
              }
            ]
          },
        }
      ),
    });
    const json = await res.json().then(res => JSON.parse(res.candidates[0].content.parts[0].text));
    // console.log(typeof(json))
    const cv = json.cv;
    const coverLetter = json.coverLetter;
    if (coverLetter) {
      CoverLetter_Obj = coverLetter;
    }
    cv.experiences.map((value, index) => {
      // let ex_temp = ''
      // json.experiences[index]['bullets'].map((value2, index2) => {
      //   ex_temp += value2 + '\n'
      // })
      // json.experiences[index]['bullets'] = ex_temp
      cv.experiences[index]["bullets"] =
        cv.experiences[index]["bullets"].join("\n");
    });
    cv.projects.map((value, index) => {
      // let pr_temp = ''
      // json.projects[index]['bullets'].map((value2, index2) => {
      //   pr_temp += value2 + '\n'
      // })
      // json.projects[index]['bullets'] = pr_temp
      cv.projects[index]["bullets"] = cv.projects[index]["bullets"].join("\n");
    });
    console.log(json);
    loadHtml(cv);
    // generatePDF will be called by AutoUpdate in loadHtml
    loadCoverLetter(coverLetter);
  } catch (err) {
    console.log(err), (error.innerText = err);
  } finally {
    aiLoader.classList.replace("flex", "hidden");
  }
}

// async function fetchModels() {
//   const res = await fetch('https://text.pollinations.ai/models');
//   const data = await res.json();
//   // console.log(data);
//   for (let model of data) {
//     if (model.output_modalities[0] !== 'text')
//       continue; // Skip models that do not output text
//     const option = document.createElement('option');
//     option.value = model.name;
//     option.innerText = model.description;
//     AI_select.appendChild(option);
//   }
// }

// fetchModels();

function loadCoverLetter(coverLetter) {
  const {
    header,
    greeting,
    openingParagraph,
    bodyParagraphs,
    closingParagraph,
    signOff,
  } = coverLetter;

  // Format header lines
  const headerLines = [
    header.name,
    header.location,
    header.phone,
    header.email,
    header.date,
    greeting,
  ];

  // Format body paragraphs with line breaks between each
  const body = [openingParagraph, ...bodyParagraphs, closingParagraph]
    .filter(Boolean) // Remove empty strings/nulls
    .map((p) => p.trim())
    .join("\n\n");

  // Final assembly
  const letter = [
    headerLines.filter(Boolean).join("\n"), // Join non-empty header lines
    "", // Blank line before body
    body,
    "", // Blank line before signoff
    signOff,
  ].join("\n");

  // Assign to textarea (assumes a textarea with id="coverLetterTextarea")
  if (cover_letter) {
    cover_letter.value = letter;
  } else {
    console.warn("Textarea with id 'coverLetterTextarea' not found.");
  }
}