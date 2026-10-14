import { z } from "zod";
import {
  ALLOWED_ACADEMIC_YEARS,
  REQUIRED_ADDITIONAL_MEMBERS,
  STUDENT_ID_HELP,
  STUDENT_ID_PATTERN,
} from "@/lib/registration-options";

const studentIdSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(z.string().regex(STUDENT_ID_PATTERN, STUDENT_ID_HELP));

const teamMemberSchema = z
  .object({
    full_name: z.string().trim().min(2, "Member names must contain at least 2 characters.").max(80),
    student_id: studentIdSchema,
  })
  .strict();

export const registrationSchema = z
  .object({
    team_name: z.string().trim().min(2, "Team name must contain at least 2 characters.").max(60),
    full_name: z.string().trim().min(2, "Leader name must contain at least 2 characters.").max(80),
    email: z.string().trim().toLowerCase().max(254).email("Enter a valid email address."),
    student_id: studentIdSchema,
    academic_year: z.enum(ALLOWED_ACADEMIC_YEARS),
    team_members: z
      .array(teamMemberSchema)
      .length(
        REQUIRED_ADDITIONAL_MEMBERS,
        `A team must have exactly ${REQUIRED_ADDITIONAL_MEMBERS + 1} members (the leader plus ${REQUIRED_ADDITIONAL_MEMBERS} more).`,
      ),
    website: z.string().max(200).optional().default(""),
    form_started_at: z.number().int().positive(),
  })
  .strict()
  .superRefine((registration, context) => {
    const ids = [registration.student_id, ...registration.team_members.map((member) => member.student_id)];

    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        path: ["team_members"],
        message: "Each team member must use a unique student ID.",
      });
    }
  });

export type ValidatedRegistration = z.infer<typeof registrationSchema>;
