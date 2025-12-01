// Simple client-side i18n helper
// - Uses language names from the <select id="language"> as keys (e.g. "English", "Vietnamese")
// - Elements:
//   - text content:    data-i18n-key="..."
//   - placeholders:    data-i18n-placeholder="..."

const translations = {
  English: {
    cv_information_title: "CV Information",
    personal_information_title: "Personal Information",
    full_name_placeholder: "Full Name",
    email_placeholder: "Email",
    location_placeholder: "Location (optional)",
    phone_placeholder: "Phone Number",
    github_ph_placeholder: "GitHub placeholder (optional)",
    github_url_placeholder: "GitHub URL (optional)",
    website_ph_placeholder: "Website placeholder (optional)",
    website_url_placeholder: "Personal Website (optional)",
    linkedin_ph_placeholder: "Linkedin placeholder (optional)",
    linkedin_url_placeholder: "LinkedIn URL (optional)",
    profile_picture_label: "Profile Picture (optional)",
    save_profile_legend: "Save a Personal Profile",
    save_profile_hint: "We just load the Personal Profile -> The rest below will be the same",
    save_profile_btn: "Save Personal Profile",
    load_profile_btn: "Load Personal Profile",
    delete_profile_btn: "Delete Personal Profile",
    summary_title: "Professional Summary",
    summary_placeholder: "Tailored summary (2-3 sentences)",
    skills_title: "Skills",
    skill_name_placeholder: "Skill Name",
    skill_desc_placeholder: "Description",
    experience_title: "Experience",
    position_placeholder: "Position",
    company_placeholder: "Company",
    exp_location_placeholder: "Location (optional)",
    dates_placeholder: "Dates",
    bullets_placeholder: "Bullet points (one per line)",
    projects_title: "Projects",
    project_name_placeholder: "Project Name",
    project_link_placeholder: "Link (optional)",
    education_title: "Education",
    university_placeholder: "University",
    degree_placeholder: "Degree",
    gpa_placeholder: "GPA (optional)",
    graduation_placeholder: "Graduation Date",
    certifications_title: "Certifications",
    certification_name_placeholder: "Certification Name",
    certification_issuer_placeholder: "Issuer/Description",
    certification_date_placeholder: "Certification Date",
    ai_editor_title: "AI Editor",
    gemini_api_title: "Gemini API Key",
    gemini_api_placeholder: "Enter your Gemini API Key",
    gemini_api_hint: "Your API key is stored in your browser's local storage not the cloud!",
    job_description_title: "Job Description",
    job_description_placeholder: "Job Description",
    yourself_title: "Yourself",
    yourself_placeholder: "Describe Yourself",
    ai_generation_btn: "AI Generation",
    cover_letter_title: "Cover Letter",
    cover_letter_placeholder: "Cover Letter will be generated here",
    update_btn: "Update",
    download_pdf_btn: "Download File",
    download_docx_btn: "Download DOCX",
    download_json_btn: "Save CV JSON",
    load_file_label: "Load CV JSON",
    primary_actions_group: "Primary & File Actions",
    profile_actions_group: "Personal Profile Actions",
    bullets_help_experience: "Use # for header (no bullet), - for level 1 bullets and + for level 2 bullets.",
    bullets_help_projects: "Use # for header (no bullet), - for level 1 bullets and + for level 2 bullets.",
    choose_image_btn: "Choose Image",
    remove_image_btn: "Remove",
    delete_btn: "Delete",
    add_skill_btn: "Add Skills",
    add_experience_btn: "Add Experience",
    add_project_btn: "Add Project",
    add_education_btn: "Add Education",
    add_certificate_btn: "Add Certification",
    instructions_title: "How to use",
    instructions_fill_form: "Fill in your CV information on the left; the preview on the right updates automatically.",
    instructions_save_export: "Use the buttons on the right to save JSON data or export your CV as PDF/DOCX.",
    instructions_bullets_syntax: "For Experience/Projects bullets: use # for header, - for level 1, and + for level 2.",
    auto_update_label: "Auto update",
    cv_language_label: "CV language",
    ui_language_label: "UI language",
    prompt_helper_title: "Prompt helper (for AI tools)",
    prompt_helper_description:
      "Use this prompt in your AI tool (ChatGPT, Gemini, etc.). It should reply with a single JSON code block that you can paste back into this editor.",
    copy_prompt_btn: "Copy prompt",
    json_input_label: "Paste CV JSON from AI (or other tools)",
    load_json_text_btn: "Load CV from JSON",
    font_label: "Font",
    font_basic: "Basic (NotoSans)",
    font_arial: "Arial",
    font_custom: "Custom",
    custom_font_label: "Custom font",
    custom_font_placeholder: "e.g., Times New Roman, Roboto",
  },
  Vietnamese: {
    cv_information_title: "Thông tin CV",
    personal_information_title: "Thông tin cá nhân",
    full_name_placeholder: "Họ và tên",
    email_placeholder: "Email",
    location_placeholder: "Địa điểm (không bắt buộc)",
    phone_placeholder: "Số điện thoại",
    github_ph_placeholder: "Nhãn GitHub (không bắt buộc)",
    github_url_placeholder: "Đường dẫn GitHub (không bắt buộc)",
    website_ph_placeholder: "Nhãn website (không bắt buộc)",
    website_url_placeholder: "Website cá nhân (không bắt buộc)",
    linkedin_ph_placeholder: "Nhãn LinkedIn (không bắt buộc)",
    linkedin_url_placeholder: "Đường dẫn LinkedIn (không bắt buộc)",
    profile_picture_label: "Ảnh đại diện (không bắt buộc)",
    save_profile_legend: "Lưu hồ sơ cá nhân",
    save_profile_hint: "Chỉ lưu phần hồ sơ cá nhân -> Các phần bên dưới giữ nguyên",
    save_profile_btn: "Lưu hồ sơ",
    load_profile_btn: "Tải hồ sơ",
    delete_profile_btn: "Xoá hồ sơ",
    summary_title: "Tóm tắt nghề nghiệp",
    summary_placeholder: "Tóm tắt ngắn gọn (2-3 câu)",
    skills_title: "Kỹ năng",
    skill_name_placeholder: "Tên kỹ năng",
    skill_desc_placeholder: "Mô tả",
    experience_title: "Kinh nghiệm làm việc",
    position_placeholder: "Vị trí",
    company_placeholder: "Công ty",
    exp_location_placeholder: "Địa điểm (không bắt buộc)",
    dates_placeholder: "Thời gian",
    bullets_placeholder: "Ghi gạch đầu dòng (mỗi dòng một ý)",
    projects_title: "Dự án",
    project_name_placeholder: "Tên dự án",
    project_link_placeholder: "Đường dẫn (không bắt buộc)",
    education_title: "Học vấn",
    university_placeholder: "Trường / Học viện",
    degree_placeholder: "Bằng cấp",
    gpa_placeholder: "GPA (không bắt buộc)",
    graduation_placeholder: "Thời gian tốt nghiệp",
    certifications_title: "Chứng chỉ",
    certification_name_placeholder: "Tên chứng chỉ",
    certification_issuer_placeholder: "Đơn vị cấp / mô tả",
    certification_date_placeholder: "Ngày cấp chứng chỉ",
    ai_editor_title: "Trình biên tập AI",
    gemini_api_title: "Khoá Gemini API",
    gemini_api_placeholder: "Nhập khoá Gemini API của bạn",
    gemini_api_hint: "Khoá API được lưu trong localStorage của trình duyệt, không lên cloud!",
    job_description_title: "Mô tả công việc",
    job_description_placeholder: "Mô tả công việc",
    yourself_title: "Giới thiệu bản thân",
    yourself_placeholder: "Mô tả ngắn về bản thân",
    ai_generation_btn: "Sinh nội dung bằng AI",
    cover_letter_title: "Thư xin việc",
    cover_letter_placeholder: "Thư xin việc sẽ được sinh tại đây",
    update_btn: "Cập nhật",
    download_pdf_btn: "Tải PDF",
    download_docx_btn: "Tải DOCX",
    download_json_btn: "Lưu CV JSON",
    load_file_label: "Tải CV JSON",
    primary_actions_group: "Nhóm thao tác chính & file",
    profile_actions_group: "Nhóm thao tác hồ sơ cá nhân",
    bullets_help_experience: "Dùng # cho tiêu đề (không có bullet), - cho bullet cấp 1 và + cho bullet cấp 2.",
    bullets_help_projects: "Dùng # cho tiêu đề (không có bullet), - cho bullet cấp 1 và + cho bullet cấp 2.",
    instructions_title: "Hướng dẫn sử dụng",
    instructions_fill_form: "Điền thông tin CV ở bên trái; phần preview bên phải sẽ tự cập nhật.",
    instructions_save_export: "Dùng các nút bên phải để lưu JSON hoặc xuất CV thành PDF/DOCX.",
    instructions_bullets_syntax: "Với Experience/Projects: dùng # cho tiêu đề, - cho bullet cấp 1, + cho bullet cấp 2.",
    auto_update_label: "Tự động cập nhật",
    cv_language_label: "Ngôn ngữ CV",
    ui_language_label: "Ngôn ngữ giao diện",
    prompt_helper_title: "Prompt gợi ý (dùng cho AI)",
    prompt_helper_description:
      "Dùng prompt này trong công cụ AI (ChatGPT, Gemini, ...). AI nên trả về duy nhất một code block JSON để bạn dán lại vào editor này.",
    copy_prompt_btn: "Copy prompt",
    json_input_label: "Dán JSON CV từ AI (hoặc công cụ khác)",
    load_json_text_btn: "Tải CV từ JSON",
    font_label: "Font",
    font_basic: "Cơ bản (NotoSans)",
    font_arial: "Arial",
    font_custom: "Tùy chỉnh",
    custom_font_label: "Font tùy chỉnh",
    custom_font_placeholder: "vd: Times New Roman, Roboto",
    choose_image_btn: "Chọn ảnh",
    remove_image_btn: "Xoá ảnh",
    delete_btn: "Xoá",
    add_skill_btn: "Thêm kỹ năng",
    add_experience_btn: "Thêm kinh nghiệm",
    add_project_btn: "Thêm dự án",
    add_education_btn: "Thêm học vấn",
    add_certificate_btn: "Thêm chứng chỉ",
  },
};

function getCurrentDictionary(languageName) {
  return translations[languageName] || translations["English"];
}

export function applyTranslations(languageName) {
  const dict = getCurrentDictionary(languageName);

  // Static text nodes
  document.querySelectorAll("[data-i18n-key]").forEach((el) => {
    const key = el.getAttribute("data-i18n-key");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Placeholders
  document
    .querySelectorAll("[data-i18n-placeholder]")
    .forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key]) {
        el.setAttribute("placeholder", dict[key]);
      }
    });
}

export function initializeI18n(languageSelect) {
  if (!languageSelect) return;
  applyTranslations(languageSelect.value);

  languageSelect.addEventListener("change", () => {
    applyTranslations(languageSelect.value);
  });
}
