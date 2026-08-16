export interface FieldMappingRule {
  canonicalName: string;
  category: "Personal" | "Education" | "Experience" | "Document" | "Preference";
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
    aliases: ["fullName", "full_name", "candidate_name", "candidateName", "name", "applicant_name"],
    regexPattern: /(full.*name|candidate.*name|applicant.*name|^name$)/i,
  },
  {
    canonicalName: "First Name",
    category: "Personal",
    profilePath: "personal.firstName",
    aliases: ["firstName", "first_name", "fname", "given_name"],
    regexPattern: /(first.*name|fname|given.*name)/i,
  },
  {
    canonicalName: "Last Name",
    category: "Personal",
    profilePath: "personal.lastName",
    aliases: ["lastName", "last_name", "lname", "surname", "family_name"],
    regexPattern: /(last.*name|lname|surname|family.*name)/i,
  },
  {
    canonicalName: "Email Address",
    category: "Personal",
    profilePath: "user.email",
    aliases: ["email", "emailAddress", "email_address", "user_email", "mail"],
    regexPattern: /(email|mail)/i,
  },
  {
    canonicalName: "Phone / Mobile Number",
    category: "Personal",
    profilePath: "personal.phone",
    aliases: ["phone", "mobile", "phoneNumber", "mobile_number", "contact_no", "cellphone"],
    regexPattern: /(phone|mobile|contact.*no|cell)/i,
  },
  {
    canonicalName: "Date of Birth",
    category: "Personal",
    profilePath: "personal.dateOfBirth",
    aliases: ["dob", "dateOfBirth", "date_of_birth", "birth_date", "birthdate"],
    regexPattern: /(dob|date.*of.*birth|birth.*date)/i,
  },
  {
    canonicalName: "Gender",
    category: "Personal",
    profilePath: "personal.gender",
    aliases: ["gender", "sex"],
    regexPattern: /(gender|sex)/i,
  },
  {
    canonicalName: "Category / Reservation",
    category: "Personal",
    profilePath: "personal.category",
    aliases: ["category", "caste_category", "reservation_category", "social_category"],
    regexPattern: /(category|caste|reservation)/i,
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
    canonicalName: "Aadhaar Number",
    category: "Personal",
    profilePath: "personal.aadhaarNumber",
    aliases: ["aadhaar", "aadhaar_no", "uidai", "aadhar_number"],
    regexPattern: /(aadhaar|aadhar|uidai)/i,
  },

  // Education Mappings
  {
    canonicalName: "Highest Degree / Qualification",
    category: "Education",
    profilePath: "education[0].degree",
    aliases: ["qualification", "highest_degree", "degree", "education_level"],
    regexPattern: /(degree|qualification|education.*level)/i,
  },
  {
    canonicalName: "College / University Name",
    category: "Education",
    profilePath: "education[0].institution",
    aliases: ["college", "university", "institution", "school_name"],
    regexPattern: /(college|university|institution|school)/i,
  },

  // Experience Mappings
  {
    canonicalName: "Current Job Title",
    category: "Experience",
    profilePath: "experience[0].jobTitle",
    aliases: ["designation", "job_title", "current_role", "position"],
    regexPattern: /(designation|job.*title|current.*role|position)/i,
  },
  {
    canonicalName: "Current Company",
    category: "Experience",
    profilePath: "experience[0].companyName",
    aliases: ["current_employer", "company_name", "organization"],
    regexPattern: /(employer|company|organization)/i,
  },

  // Document Vault Mappings
  {
    canonicalName: "Resume Document File",
    category: "Document",
    profilePath: "vault.Resume",
    aliases: ["resume", "cv", "resume_file", "upload_resume", "attach_cv"],
    regexPattern: /(resume|cv|attachment)/i,
  },
  {
    canonicalName: "Passport Photo File",
    category: "Document",
    profilePath: "vault.Photograph",
    aliases: ["photo", "passport_photo", "user_image", "upload_photo"],
    regexPattern: /(photo|passport.*photo|user.*image)/i,
  },
  {
    canonicalName: "Signature Specimen File",
    category: "Document",
    profilePath: "vault.Signature",
    aliases: ["signature", "sign_file", "upload_signature"],
    regexPattern: /(sign|signature)/i,
  },
];
