"use client"

import React, { Dispatch, SetStateAction } from "react"
import { v4 as uuidv4 } from "uuid"
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
import SelectInput from "@/src/components/input/select"

import { CustomerT } from "@/src/constants/interface/customer"
import { toast } from "sonner"

interface Props {
  onCreate: (customer: CustomerT) => void
  nextSerialNumber: number
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

  // Address
  apartmentUnit: z.string().min(1, "Apartment / Unit is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "Zip code is required"),

  // Separate business location
  location: z.string().min(1, "Location is required"),
})

const Required = () => (
  <span className="text-red-500">*</span>
)

export default function CreateCustomerDialog({
  onCreate,
  nextSerialNumber,
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {

    const newCustomer: CustomerT = {
      id: `cst-${uuidv4()}`,
      serialNumber: nextSerialNumber,

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

      billingAddress: "",
      paymentMethod: "",

      totalSpent: 0,
      jobHistory: [],
      jobActivities: [],
      communications: [],
      callRecordings: [],
      notes: [],
    }

    onCreate(newCustomer)
    toast.success("Customer created successfully 🎉", {
        description: `${values.clientName} has been added.`,
    })
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4"
          >

            {/* Basic Info Fields (unchanged) */}
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
              { name: "location", label: "Location (Service Area)" }, // 🔥 Added
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
                  <SelectInput
                    label=""
                    options={[
                      { label: "Website", value: "Website" },
                      { label: "Facebook Ads", value: "Facebook Ads" },
                      { label: "Referral", value: "Referral" },
                      { label: "Walk-in", value: "Walk-in" },
                      { label: "Email Campaign", value: "Email Campaign" },
                    ]}
                    placeholder="Select source"
                    value={field.value}
                    className={
                      fieldState.error
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                    onSearch={() => {}}
                    onSelect={(val) => field.onChange(Array.isArray(val) ? (val[0] ?? "") : val)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2 flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Customer
              </Button>
            </div>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
