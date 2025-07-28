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

const maxCharacters = 260; // limit the number of characters
const padding = 5;
const inputEle = document.querySelector("#input");
const AI_select = document.querySelector("#ai-select");
const cover_letter = document.querySelector("#Cover-letter");

let CV_obj = {
  name: "",
  email: "",
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

function updatePreview() {
  const preview = document.getElementById("cv-preview");
  preview.innerHTML = `
      <!-- Personal Info -->
      <div class="text-center">
          <h1 class="text-3xl font-bold">${
            document.getElementById("name").value
          }</h1>
          <div class="flex flex-wrap justify-center gap-2 mt-2 text-gray-600">
              ${PersonalInfo()}
          </div>
      </div>
  
      <!-- Summary -->
      ${
        document.getElementById("summary").value
          ? `
      <div>
          <h2 class="text-xl font-bold mb-2 border-b-2 border-gray-300">Summary</h2>
          <p class="text-gray-700 break-words">${
            document.getElementById("summary").value
          }</p>
      </div>`
          : ""
      }
  
      <!-- Experience -->
      <div>
          <h2 class="text-xl font-bold mb-2 border-b-2 border-gray-300">Experience</h2>
          ${Array.from(document.querySelectorAll(".experience-entry"))
            .map((entry) => {
              const fields = entry.querySelectorAll("input, textarea");
              return `
              <div>
                  <div class="flex justify-between">
                      <h3 class="font-semibold">${fields[0].value}</h3>
                      <span class="text-gray-600">${fields[3].value}</span>
                  </div>
                  <div class="flex justify-between text-gray-600">
                      <span>${fields[1].value}</span>
                      <span>${fields[2].value}</span>
                  </div>
                  <ul class="list-disc ml-6 mt-2">
                      ${fields[4].value
                        .split("\n")
                        .map(
                          (point) => `<li class="text-gray-700">${point}</li>`
                        )
                        .join("")}
                  </ul>
              </div>
            `;
            })
            .join("")}
      </div>
  
      <!-- Projects -->
      <div>
          <h2 class="text-xl font-bold mb-2 border-b-2 border-gray-300">Projects</h2>
          ${Array.from(document.querySelectorAll(".project-entry"))
            .map((entry) => {
              const fields = entry.querySelectorAll("input, textarea");
              return `
              <div>
                  <div class="flex justify-between">
                      <h3 class="font-semibold">${fields[0].value}</h3>
                      <span class="text-gray-600">${fields[1].value}</span>
                  </div>
                  <ul class="list-disc ml-6 mt-2">
                      ${fields[2].value
                        .split("\n")
                        .map(
                          (point) => `<li class="text-gray-700">${point}</li>`
                        )
                        .join("")}
                  </ul>
              </div>
            `;
            })
            .join("")}
      </div>
  
      <!-- Education -->
      <div>
          <h2 class="text-xl font-bold mb-2 border-b-2 border-gray-300">Education</h2>
          ${Array.from(document.querySelectorAll(".education-entry"))
            .map((entry) => {
              const fields = entry.querySelectorAll("input");
              return `
              <div class="flex justify-between">
                  <div>
                      <h3 class="font-semibold">${fields[0].value}</h3>
                      <p class="text-gray-600">${fields[1].value}</p>
                  </div>
                  <div class="text-right">
                      <p class="text-gray-600">${fields[3].value}</p>
                      ${
                        fields[2].value
                          ? `<p class="text-gray-600">GPA: ${fields[2].value}</p>`
                          : ""
                      }
                  </div>
              </div>
            `;
            })
            .join("")}
      </div>
  
      <!-- Skills -->
      <div>
          <h2 class="text-xl font-bold mb-2 border-b-2 border-gray-300">Skills</h2>
          ${Array.from(document.querySelectorAll(".skills-entry"))
            .map((entry) => {
              const fields = entry.querySelectorAll("input");
              return `
              <div class="flex flex-row">
                  <p class="font-semibold">${fields[0].value}</p>
                  <p class="text-gray-600">: ${fields[1].value}</p>
              </div>
            `;
            })
            .join("")}
      </div>
    `;
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
  if (obj.linkedin) data.push(obj.linkedin);
  return data.join(" • ");
}

function getPersonalInfo2FromObj(obj) {
  const data = [];
  if (obj.github) data.push(obj.github);
  if (obj.website) data.push(obj.website);
  return data.join(" • ");
}

function deleteBlock(btn, containerId) {
  const container = document.getElementById(containerId);
  // Count only the block entries (child elements)
  if (container.children.length > 1) {
    btn.parentElement.remove();
    updatePreview();
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
  const location = document.getElementById("location")?.value;
  const linkedin = document.getElementById("linkedin")?.value;
  const github = document.getElementById("github")?.value;
  const website = document.getElementById("website")?.value;
  const summary = document.getElementById("summary")?.value;
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

  // Get image data from ImageHandler module
  const imageData = getImageData();

  const obj = {
    cv: {
      name,
      email,
      location,
      linkedin,
      github,
      website,
      summary,
      experiences,
      projects,
      skills,
      educations,
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
  let marginRight = doc.internal.pageSize.getWidth() - 40;
  let marginBottom = doc.internal.pageSize.getHeight() - 40;
  let marginTop = 40;
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

  // Add profile image if available - treated as absolute positioned element
  let headerStartY = y; // Save starting position for header

  // Use ImageHandler module to add image to PDF
  const imageInfo = addImageToPDF(doc, marginLeft, y);
  const imageWidth = imageInfo.width;
  const imageHeight = imageInfo.height;

  // Personal Information - always centered on full page width (ignore image)
  doc.setFont("NotoSans", "bold");
  doc.setFontSize(16);
  const name = obj.name;

  // Always center on full page width
  doc.text(name || "Your Name", midPage, y, { align: "center" });

  // Move to next line for personal info
  let personalInfoY = y + lineHeight + padding;

  doc.setFont("NotoSans", "normal");
  doc.setFontSize(10);
  const personalInfo = getPersonalInfoFromObj(obj);
  const personalInfo2 = getPersonalInfo2FromObj(obj);

  // Personal info always centered on full page width (ignore image)
  if (personalInfo) {
    const fullLength = doc.getStringUnitWidth(personalInfo) * 10;

    let location = obj.location;
    let email = obj.email;
    let linkedin = obj.linkedin;
    let github = obj.github;
    let website = obj.website;

    // location
    let content = location ? `${location}` : "";
    let temp = location ? `${location}` : "";
    let tempLength = doc.getStringUnitWidth(temp) * 10;
    doc.text(content, midPage - (fullLength / 2 - tempLength), personalInfoY, {
      align: "right",
    });

    // email
    content = temp && email ? ` • ${email}` : email ? `${email}` : "";
    temp += temp && email ? ` • ${email}` : email ? `${email}` : "";
    tempLength = doc.getStringUnitWidth(temp) * 10;
    doc.text(content, midPage - (fullLength / 2 - tempLength), personalInfoY, {
      align: "right",
    });

    // linkedin
    content =
      temp && linkedin ? ` • ${linkedin}` : linkedin ? `${linkedin}` : "";
    temp += temp && linkedin ? ` • ${linkedin}` : linkedin ? `${linkedin}` : "";
    tempLength = doc.getStringUnitWidth(temp) * 10;
    if (content.includes("https://") || content.includes("www.")) {
      doc.setTextColor("#115bca");
      doc.setDrawColor("#115bca");
      doc.textWithLink(
        content,
        midPage - (fullLength / 2 - tempLength),
        personalInfoY,
        { align: "right" }
      );
      const textWidth = doc.getStringUnitWidth(linkedin) * 10;
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

    console.log(fullLength - tempLength, fullLength, tempLength);

    personalInfoY += lineHeight + padding;
  }

  if (personalInfo2) {
    const fullLength = doc.getStringUnitWidth(personalInfo2) * 10;

    let github = obj.github;
    let website = obj.website;

    // github
    let content = github ? `${github}` : "";
    let temp = github ? `${github}` : "";
    let tempLength = doc.getStringUnitWidth(temp) * 10;
    if (content.includes("https://") || content.includes("www.")) {
      doc.setTextColor("#115bca");
      doc.setDrawColor("#115bca");
      doc.textWithLink(
        content,
        midPage - (fullLength / 2 - tempLength),
        personalInfoY,
        { align: "right" }
      );
      const textWidth = doc.getStringUnitWidth(github) * 10;
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
    content = temp && website ? ` • ${website}` : website ? `${website}` : "";
    temp += temp && website ? ` • ${website}` : website ? `${website}` : "";
    tempLength = doc.getStringUnitWidth(temp) * 10;
    if (content.includes("https://") || content.includes("www.")) {
      doc.setTextColor("#115bca");
      doc.setDrawColor("#115bca");
      doc.textWithLink(
        content,
        midPage - (fullLength / 2 - tempLength),
        personalInfoY,
        { align: "right" }
      );
      const textWidth = doc.getStringUnitWidth(website) * 10;
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

    personalInfoY += lineHeight + padding;
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
      padding
    );
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
            ? `, ${description.trim()}`
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

        if (index != skillsEntries.length - 1) y += lineHeight;
        else y += lineHeight + padding;
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
      // y += lineHeight;
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
              if (index != bullets.length) {
                y += lineHeight;
                checkAndAddPage();
              }
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
              if (index != bullets.length) {
                y += lineHeight;
                checkAndAddPage();
              }
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

        if (index != educationEntries.length - 1) {
          y += lineHeight;
          checkAndAddPage();
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
  document.getElementById("location").value = obj.location;
  document.getElementById("linkedin").value = obj.linkedin;
  document.getElementById("github").value = obj.github;
  document.getElementById("website").value = obj.website;
  document.getElementById("summary").value = obj.summary;

  // Load profile image using ImageHandler module
  loadImageFromData(obj);

  // Delete all existing skill entries
  const skillEntries = document.querySelectorAll(".skills-entry");
  skillEntries.forEach((entry, index) => {
    if (index != 0) entry.remove();
  });

  const skills = obj.skills;
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

  const exps = obj.experiences;
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

  const projs = obj.projects;
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

  // Delete all existing education entries
  const educationEntries = document.querySelectorAll(".education-entry");
  educationEntries.forEach((entry, index) => {
    if (index != 0) entry.remove();
  });

  const edus = obj.educations;
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

// Initialize all event listeners for buttons
function initializeEventListeners() {
  // Main action buttons
  document.getElementById("update-btn")?.addEventListener("click", AutoUpdate);
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
  document.getElementById("add-skill-btn")?.addEventListener("click", addSkill);
  document
    .getElementById("add-experience-btn")
    ?.addEventListener("click", addExperience);
  document
    .getElementById("add-project-btn")
    ?.addEventListener("click", addProject);
  document
    .getElementById("add-education-btn")
    ?.addEventListener("click", addEducation);

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

const INSprompt = `
1. Goal Statement
I need you to generate both a tailored CV and a cover letter in response to a job description and (optional) user-provided information. The output must:

Be in JSON format matching the schema below.

Translate all fields into the specified language, using natural, real-life phrasing and tone appropriate to professional job applications.

The cover letter should:

Be role-specific and company-aware.

Highlight relevant experience, skills, and achievements aligned with the job description.

Follow a standard business letter structure (header, greeting, intro, body, closing, sign-off).

Sound authentic, enthusiastic, and tailored to the job.

2. Return Format
Please return a single JSON object with the following structure. Every text field must be in the requested language:

{
  "cv": {
    "name": "",  
    "email": "",  
    "location": "",  
    "linkedin": "",  
    "github": "",  
    "website": "",  
    "summary": "",  
    "experiences": [  
      {  
        "position": "",  
        "company": "",  
        "location": "",  
        "dates": "",  
        "bullets": []  
      }  
    ],  
    "educations": [  
      {  
        "university": "",  
        "degree": "",  
        "gpa": "",  
        "graduationDate": ""  
      }  
    ],  
    "projects": [  
      {  
        "projectName": "",  
        "projectLink": "",  
        "bullets": []  
      }  
    ],  
    "skills": [  
      {  
        "skill": "",  
        "description": ""  
      }  
    ]
  },
  "coverLetter": {
    "header": {
      "name": "",
      "email": "",
      "phone": "",
      "location": "",
      "date": "",
      "recipientName": "",
      "recipientTitle": "",
      "companyName": "",
      "companyAddress": ""
    },
    "greeting": "",
    "openingParagraph": "",
    "bodyParagraphs": [],
    "closingParagraph": "",
    "signOff": ""
  }
}
3. Warnings & Requirements
CV:
summary: Only include if strongly aligned with the job.

experiences[].bullets: Start with strong past-tense action verbs.

projects: Only include real, meaningful projects (no tutorials or academic assignments unless notable).

skills: Group related skills clearly; include a brief, useful description (not exhaustive lists).

Integrate keywords naturally from the job description.

Omit GPA if not provided or if weak.

Make all entries concise and results-driven.

Good vs. Bad Examples (CV)
Good summary:
“Software Engineer with 6+ years of experience in scalable e-commerce systems using Ruby on Rails and PostgreSQL.”
Bad summary:
“Passionate software developer seeking challenges.”

Good experience bullet:
“Led migration from monolith to microservices, reducing server load by 42%.”
Bad bullet:
“Improved system performance.”

Good project:
"projectName": "Real-Time Chat App", "bullets": ["Built an encrypted WebSocket server handling 500+ concurrent users."]
Bad project:
"projectName": "Chat tutorial", "bullets": ["Learned how to build a chat."]

Good skill section:
"skill": "Backend", "description": "Node.js, Express, Fastify"
Bad:
"skill": "Languages", "description": "C, C++, Java, Kotlin, Swift, Haskell, Go, Python, Ruby, ..."

Cover Letter:
Follow this structure:

Header (personal and company info)

Greeting (personalized if possible)

Opening paragraph: Introduce yourself, state the job you're applying for, and why you're interested

Body paragraph(s): Highlight relevant achievements, qualifications, or transferable skills

Closing paragraph: Reaffirm interest, availability, and gratitude

Sign-off (e.g., “Sincerely,”)

Match tone to the company culture (formal or slightly conversational).

Include specific, relevant experiences (not generic traits).

Keep the letter within 300-350 words max.

Tailor to the company and role—don't copy the resume.

Good vs. Bad Examples (Cover Letter)
Good opening:
“I'm excited to apply for the Frontend Engineer role at SmartTech. As a React developer who recently improved load time by 60% on a similar product, I believe I can immediately contribute to your user experience goals.”
Bad:
“To whom it may concern, I am applying for a job at your company because I am looking for a new challenge.”

Good body paragraph:
“While leading the redesign of our e-commerce checkout flow, I collaborated with design and backend teams to launch a responsive interface that increased conversion rates by 32%.”
Bad:
“I work well in teams and am good at solving problems.”

Translation Requirements
Translate all output fields into the target language. The tone must remain professional, natural, and native-sounding. Do not translate literally. Prioritize readability and local fluency over word-for-word accuracy.
Good vs. Bad Translations (Example: English → Vietnamese - (for illustration only))
Good Summary Translation:
“Kỹ sư phần mềm với 6 năm kinh nghiệm full-stack chuyên về Ruby on Rails và hệ thống thương mại điện tử.”
Bad Summary Translation:
“Lập trình viên phần mềm đam mê tìm kiếm thử thách mới.”

Good Name Translation:
“Đại học Sư phạm Kỹ thuật Thành phố Hồ Chí Minh”
Bad Name Translation:
“Đại học Công nghệ và Giáo dục Hồ Chí Minh”

Good Cover Letter Greeting Translation:
"Kính gửi Nhà tuyển dụng,"
Bad Cover Letter Greeting Translation:
"Kính gửi Người tuyển dụng," or "Dear Người nhận,"

4. Context
You will receive a JSON input structured like this:

{
  "Job-description": "<full job posting>",
  "user-information": "<optional CV-like content or freeform text>",
  "language": "<language code, e.g., 'english', 'vietnamese'>"
  "today": "<date string for today>"
}
Please:

Translate all generated content (CV + cover letter) into the specified language.

Invent or infer realistic details only if the user’s data is missing or insufficient.

Prioritize relevance, clarity, and ATS optimization.

Ensure cover letter does not exceed 350 words unless the job clearly favors a detailed narrative.
`;

async function generateAI() {
  const JD = document.getElementById("JD").value;
  const yourself = document.getElementById("yourself").value;
  const language = document.getElementById("language").value;
  const error = document.querySelector("#AI-error");
  const aiLoader = document.querySelector("#AiLoader");
  error.innerText = "";
  if (!JD) {
    error.innerText = "Job Description is required";
    return;
  }
  try {
    aiLoader.classList.replace("hidden", "flex");
    const res = await fetch("https://text.pollinations.ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: `openai`,
        response_format: {
          type: "json_object",
        },
        private: true,
        reasoning_effort: "medium",
        messages: [
          {
            role: "developer",
            content: INSprompt,
          },
          {
            role: "user",
            content: JSON.stringify({
              "Job-description": JD,
              "user-information": yourself,
              "language": language,
              "today": new Date().toDateString(),
            }),
          },
        ],
      }),
    });
    const json = await res.json();
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