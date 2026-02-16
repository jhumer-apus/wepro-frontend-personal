"use client"

import React, { Dispatch, SetStateAction, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"

import { CustomerT } from "@/src/constants/interface/customer"
import { toast } from "sonner"

interface Props {
  customer: CustomerT | null
  onUpdate: (customer: CustomerT) => void
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

/* ------------------ Schema ------------------ */

const formSchema = z.object({
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

  location: z.string().min(1, "Location is required"),
})

const Required = () => (
  <span className="text-red-500">*</span>
)

export default function EditCustomerDialog({
  customer,
  onUpdate,
  open,
  setOpen,
}: Props) {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      clientName: "",
      companyName: "",
      email: "",
      phoneNumber: "",
      sourceTitle: "",
      apartmentUnit: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      location: "",
    },
  })

  /* 🔥 Prefill when customer changes */
  useEffect(() => {
    if (customer) {
      form.reset({
        clientName: customer.clientName || "",
        companyName: customer.companyName || "",
        email: customer.email || "",
        phoneNumber: customer.phoneNumber || "",
        sourceTitle: customer.sourceTitle || "",
        apartmentUnit: customer.apartmentUnit || "",
        city: customer.city || "",
        state: customer.state || "",
        country: customer.country || "",
        zipCode: customer.zipCode || "",
        location: customer.location || "",
      })
    }
  }, [customer, form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!customer) return

    const updatedCustomer: CustomerT = {
      ...customer, // keep id + serialNumber + other untouched fields

      clientName: values.clientName,
      companyName: values.companyName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      sourceTitle: values.sourceTitle,

      apartmentUnit: values.apartmentUnit,
      city: values.city,
      state: values.state,
      country: values.country,
      zipCode: values.zipCode,

      location: values.location,
    }

    onUpdate(updatedCustomer)

    toast.success("Customer updated successfully ✨", {
      description: `${values.clientName} has been updated.`,
    })

    setOpen(false)
  }

  if (!customer) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4"
          >

            {[
              { name: "clientName", label: "Client Name" },
              { name: "companyName", label: "Company Name" },
              { name: "email", label: "Email", type: "email" },
              { name: "phoneNumber", label: "Phone Number" },
              { name: "apartmentUnit", label: "Apartment / Unit" },
              { name: "city", label: "City" },
              { name: "state", label: "State" },
              { name: "country", label: "Country" },
              { name: "zipCode", label: "Zip Code" },
              { name: "location", label: "Location (Service Area)" },
            ].map(({ name, label, type }) => (
              <FormField
                key={name}
                control={form.control}
                name={name as any}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-800">
                      {label} <Required />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={type || "text"}
                        {...field}
                        className={
                          fieldState.error
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            {/* Source Select */}
            <FormField
              control={form.control}
              name="sourceTitle"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-slate-800">
                    Source <Required />
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={
                          fieldState.error
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Walk-in">Walk-in</SelectItem>
                      <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2 flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Customer
              </Button>
            </div>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
