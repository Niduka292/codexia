export const ALLOWED_ACADEMIC_YEARS = ["Year 1", "Year 2", "Year 3"] as const;

// A team has exactly 5 members: the leader plus 4 additional members.
export const REQUIRED_ADDITIONAL_MEMBERS = 4;
export const MAX_ADDITIONAL_MEMBERS = REQUIRED_ADDITIONAL_MEMBERS;
export const MAX_TEAM_SIZE = REQUIRED_ADDITIONAL_MEMBERS + 1;
export const STUDENT_ID_PATTERN = /^[A-Z]{2}\d{6,10}$/;
export const STUDENT_ID_HELP = "Enter a valid student ID, for example AS2023508 or AS20250123.";
export const NAME_WITH_INITIALS_HELP = "Enter the name with initials, for example K.A.S. Perera.";
