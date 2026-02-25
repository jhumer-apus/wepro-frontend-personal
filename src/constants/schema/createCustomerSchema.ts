import { z } from "zod"

export const formSchema = z.object({
  clientName: z.string().min(2, "Client name is required"),
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),

  sourceTitle: z.string().min(1, "Source is required"),

  apartmentUnit: z.string().min(1, "Apartment / Unit is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "Zip code is required"),

  billingAddress: z.string().min(1, "Billing address is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),

  status: z.enum(["active", "inactive"]),
})

