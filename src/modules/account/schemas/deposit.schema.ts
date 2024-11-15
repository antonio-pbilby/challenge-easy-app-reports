import { z } from "zod";

const realNumberRegex =
	/^(?:-(?:[1-9](?:\d{0,2}(?:,\d{3})+|\d*))|(?:0|(?:[1-9](?:\d{0,2}(?:,\d{3})+|\d*))))(?:.\d+|)$/;

export const depositSchema = z.object({
	body: z.object({
		amount: z.string().regex(realNumberRegex, "String must be numeric.").min(1),
	}),
});
