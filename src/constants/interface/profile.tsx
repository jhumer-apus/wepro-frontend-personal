import type { UserData } from '@/src/store/slices/userSlice'

export interface Permission {
  _id: string
  moduleCode: string
  key: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface Module {
  _id: string
  name: string
  isP1Module: boolean
  active: boolean
  createdAt: string
  updatedAt: string
  code: string
  permissions: Permission[]
}

export interface Timezone {
  _id: string
  value: string
  name: string
}

export interface Profile {
  _id: string
  name: string
  type: string
  username: string
  passwordHash: string
  timezoneId: Timezone
  createdAt: string
  updatedAt: string
  tenantId: string
  modules: Module[]
  permissions: Permission[]
}

export interface ProfileApiResponse {
  success: boolean
  message: string
  data: Profile
}

// Technician profile API response from /v3/technicians/users/profile (on login)
export interface TechnicianProfilePhoneFormat {
  country_code: string
  number: string
}

export interface TechnicianProfile {
  profile_status: string
  firstname: string
  lastname: string
  dob: string | null
  stripeAccIdSet: string
  picture: string | null
  imgDLF: string | null
  imgDLB: string | null
  username: string
  email: string
  status: string
  phone_number: string | null
  phone_numberFormat: TechnicianProfilePhoneFormat | null
  phoneNo: string
  emailCheck: string
  lat: string | null
  lng: string | null
  formatted_address: string | null
  place_id: string | null
  address: string | null
  location: string | null
  city: string | null
  zip: string | null
  state: string | null
  country: string | null
  is_clock_in: string
  user_status: string
  userAvail: string
  availability_hours: boolean
  created_date: string
}

export interface TechnicianProfileCompanies {
  total_records: number
  companies: unknown[]
}

export interface TechnicianProfileApiResponse {
  status: 'success' | string
  profile: TechnicianProfile
  companies: TechnicianProfileCompanies
}

/** Map technician profile API response to Redux UserData shape */
export function mapTechnicianProfileToUserData(
  response: TechnicianProfileApiResponse
): UserData {
  const { profile } = response
  const name = [profile.firstname, profile.lastname].filter(Boolean).join(' ') || profile.username
  return {
    name,
    username: profile.username,
    type: 'Technician',
    firstname: profile.firstname,
    lastname: profile.lastname,
    email: profile.email,
    status: profile.status,
    picture: profile.picture,
    phone_number: profile.phone_number,
    phone_numberFormat: profile.phone_numberFormat ?? undefined,
    address: profile.address,
    location: profile.location,
    city: profile.city,
    zip: profile.zip,
    state: profile.state,
    country: profile.country,
    lat: profile.lat,
    lng: profile.lng,
    formatted_address: profile.formatted_address,
    place_id: profile.place_id,
    profile_status: profile.profile_status,
    phoneNo: profile.phoneNo,
    emailCheck: profile.emailCheck,
    is_clock_in: profile.is_clock_in,
    user_status: profile.user_status,
    userAvail: profile.userAvail,
    availability_hours: profile.availability_hours,
    created_date: profile.created_date,
  }
}
