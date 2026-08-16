export interface FieldMappingRule {
  canonicalName: string;
  category: "Personal" | "Education" | "Experience" | "Document" | "Preference" | "Social";
  profilePath: string;
  aliases: string[];
  regexPattern: RegExp;
}

export const CANONICAL_FIELD_DICTIONARY: FieldMappingRule[] = [
  // Personal Info Mappings
  {
    canonicalName: "Full Name",
    category: "Personal",
    profilePath: "personal.fullName",
    aliases: ["fullName", "full_name", "candidate_name", "candidateName", "name", "applicant_name", "workday.applicantName", "lever.name"],
    regexPattern: /(full.*name|candidate.*name|applicant.*name|^name$)/i,
  },
  {
    canonicalName: "First Name",
    category: "Personal",
    profilePath: "personal.firstName",
    aliases: ["firstName", "first_name", "fname", "given_name", "greenhouse.candidate[first_name]", "workday.firstName"],
    regexPattern: /(first.*name|fname|given.*name)/i,
  },
  {
    canonicalName: "Last Name",
    category: "Personal",
    profilePath: "personal.lastName",
    aliases: ["lastName", "last_name", "lname", "surname", "family_name", "greenhouse.candidate[last_name]", "workday.lastName"],
    regexPattern: /(last.*name|lname|surname|family.*name)/i,
  },
  {
    canonicalName: "Father's Name",
    category: "Personal",
    profilePath: "personal.fatherName",
    aliases: ["fatherName", "father_name", "fathers_name", "father_full_name", "otr.father_name"],
    regexPattern: /(father.*name|father)/i,
  },
  {
    canonicalName: "Mother's Name",
    category: "Personal",
    profilePath: "personal.motherName",
    aliases: ["motherName", "mother_name", "mothers_name", "mother_full_name", "otr.mother_name"],
    regexPattern: /(mother.*name|mother)/i,
  },
  {
    canonicalName: "Email Address",
    category: "Personal",
    profilePath: "user.email",
    aliases: ["email", "emailAddress", "email_address", "user_email", "mail", "greenhouse.candidate[email]", "lever.email"],
    regexPattern: /(email|mail)/i,
  },
  {
    canonicalName: "Phone / Mobile Number",
    category: "Personal",
    profilePath: "personal.phone",
    aliases: ["phone", "mobile", "phoneNumber", "mobile_number", "contact_no", "cellphone", "greenhouse.candidate[phone]", "lever.phone"],
    regexPattern: /(phone|mobile|contact.*no|cell)/i,
  },
  {
    canonicalName: "Date of Birth",
    category: "Personal",
    profilePath: "personal.dateOfBirth",
    aliases: ["dob", "dateOfBirth", "date_of_birth", "birth_date", "birthdate", "otr.dob"],
    regexPattern: /(dob|date.*of.*birth|birth.*date)/i,
  },
  {
    canonicalName: "Gender",
    category: "Personal",
    profilePath: "personal.gender",
    aliases: ["gender", "sex", "otr.gender"],
    regexPattern: /(gender|sex)/i,
  },
  {
    canonicalName: "Category / Reservation",
    category: "Personal",
    profilePath: "personal.category",
    aliases: ["category", "caste_category", "reservation_category", "social_category", "otr.category"],
    regexPattern: /(category|caste|reservation)/i,
  },
  {
    canonicalName: "Category Certificate Number",
    category: "Personal",
    profilePath: "personal.categoryCertNo",
    aliases: ["categoryCertNo", "caste_cert_no", "caste_certificate_number", "otr.category_cert_no"],
    regexPattern: /(caste.*cert|category.*cert)/i,
  },
  {
    canonicalName: "Address",
    category: "Personal",
    profilePath: "personal.address",
    aliases: ["address", "street_address", "residential_address", "address_line_1"],
    regexPattern: /(address|street)/i,
  },
  {
    canonicalName: "City",
    category: "Personal",
    profilePath: "personal.city",
    aliases: ["city", "current_city", "town"],
    regexPattern: /(city|town)/i,
  },
  {
    canonicalName: "State",
    category: "Personal",
    profilePath: "personal.state",
    aliases: ["state", "province", "region"],
    regexPattern: /(state|province|region)/i,
  },
  {
    canonicalName: "Pincode / Postal Code",
    category: "Personal",
    profilePath: "personal.pincode",
    aliases: ["pincode", "postal_code", "zip", "zipcode"],
    regexPattern: /(pincode|postal.*code|zip)/i,
  },
  {
    canonicalName: "Aadhaar Number",
    category: "Personal",
    profilePath: "personal.aadhaarNumber",
    aliases: ["aadhaar", "aadhaar_no", "uidai", "aadhar_number", "otr.aadhaar_no"],
    regexPattern: /(aadhaar|aadhar|uidai)/i,
  },

  // Social Links
  {
    canonicalName: "LinkedIn Profile URL",
    category: "Social",
    profilePath: "personal.linkedinUrl",
    aliases: ["linkedin", "linkedinUrl", "linkedin_url", "urls[linkedin]", "lever.urls[LinkedIn]"],
    regexPattern: /(linkedin)/i,
  },
  {
    canonicalName: "GitHub Profile URL",
    category: "Social",
    profilePath: "personal.githubUrl",
    aliases: ["github", "githubUrl", "github_url", "urls[github]", "lever.urls[GitHub]"],
    regexPattern: /(github)/i,
  },
  {
    canonicalName: "Portfolio / Website URL",
    category: "Social",
    profilePath: "personal.portfolioUrl",
    aliases: ["portfolio", "website", "portfolioUrl", "urls[portfolio]", "lever.urls[Portfolio]"],
    regexPattern: /(portfolio|website|site)/i,
  },

  // Education Mappings
  {
    canonicalName: "Highest Degree / Qualification",
    category: "Education",
    profilePath: "education[0].degree",
    aliases: ["qualification", "highest_degree", "degree", "education_level", "workday.degree"],
    regexPattern: /(degree|qualification|education.*level)/i,
  },
  {
    canonicalName: "College / University Name",
    category: "Education",
    profilePath: "education[0].institution",
    aliases: ["college", "university", "institution", "school_name", "workday.school"],
    regexPattern: /(college|university|institution|school)/i,
  },

  // Experience Mappings
  {
    canonicalName: "Current Job Title",
    category: "Experience",
    profilePath: "experience[0].jobTitle",
    aliases: ["designation", "job_title", "current_role", "position", "workday.jobTitle"],
    regexPattern: /(designation|job.*title|current.*role|position)/i,
  },
  {
    canonicalName: "Current Company",
    category: "Experience",
    profilePath: "experience[0].companyName",
    aliases: ["current_employer", "company_name", "organization", "workday.company"],
    regexPattern: /(employer|company|organization)/i,
  },

  // Document Vault Mappings
  {
    canonicalName: "Resume Document File",
    category: "Document",
    profilePath: "vault.Resume",
    aliases: ["resume", "cv", "resume_file", "upload_resume", "attach_cv", "greenhouse.resume", "lever.resume"],
    regexPattern: /(resume|cv|attachment)/i,
  },
  {
    canonicalName: "Passport Photo File",
    category: "Document",
    profilePath: "vault.Photograph",
    aliases: ["photo", "passport_photo", "user_image", "upload_photo", "otr.photo"],
    regexPattern: /(photo|passport.*photo|user.*image)/i,
  },
  {
    canonicalName: "Signature Specimen File",
    category: "Document",
    profilePath: "vault.Signature",
    aliases: ["signature", "sign_file", "upload_signature", "otr.signature"],
    regexPattern: /(sign|signature)/i,
  },
];
