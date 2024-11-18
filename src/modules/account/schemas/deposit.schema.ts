import { z } from "zod";
import { realNumberRegex } from "../../../app/utils/constants/real-number-regex";

export const depositSchema = z.object({
	body: z.object({
		amount: z.string().regex(realNumberRegex, "String must be numeric.").min(1),
		time: z.coerce.number().optional(),
	}),
});
