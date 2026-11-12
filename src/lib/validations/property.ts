import { z } from "zod";

export const propertyFilterSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  propertyType: z
    .enum([
      "VILLA",
      "MANSION",
      "PENTHOUSE",
      "APARTMENT",
      "PRIVATE_ISLAND",
      "CHATEAU",
      "ESTATE",
      "COMMERCIAL",
    ])
    .optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
});

export const propertyInquirySchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z
    .string()
    .min(7, { message: "Please provide a valid contact number." }),
  agencyName: z.string().optional(),
  isB2BPartner: z.boolean(),
  message: z
    .string()
    .min(10, { message: "Message must contain at least 10 characters." }),
  propertyId: z.string().optional(),
});

export type PropertyFilterInput = z.infer<typeof propertyFilterSchema>;
export type PropertyInquiryInput = z.infer<typeof propertyInquirySchema>;

