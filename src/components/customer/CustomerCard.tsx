import { CustomerT } from "@/src/constants/interface/customer"
import { Card, CardContent } from "../ui/card"
import { Avatar, AvatarFallback } from "../ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import {
  Eye,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Building2,
} from "lucide-react"
import { Badge } from "../ui/badge"

type CustomerCardProps = {
  customer: CustomerT
  openCustomerProfile: (customer: CustomerT) => void
}

export const CustomerCard = ({
  customer,
  openCustomerProfile,
}: CustomerCardProps) => {
  return (
    <Card
      className="border-0 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => openCustomerProfile(customer)}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <Avatar className="w-14 h-14">
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white text-lg font-semibold">
              {customer.clientName
                ?.split(" ")
                .map(n => n[0])
                .join("") || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-slate-900 truncate">
                  {customer.clientName ?? "Unknown Client"}
                </h3>
                {customer.companyName && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {customer.companyName}
                  </p>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={e => e.stopPropagation()}
                >
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation()
                      openCustomerProfile(customer)
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Contact info */}
            <div className="space-y-1 text-sm text-slate-600">
              {customer.email && (
                <p className="flex items-center space-x-2">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{customer.email}</span>
                </p>
              )}

              {customer.phoneNumber && (
                <p className="flex items-center space-x-2">
                  <Phone className="w-3 h-3" />
                  <span>{customer.phoneNumber}</span>
                </p>
              )}

              {(customer.addressUnit || customer.location) && (
                <p className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">
                    {[customer.addressUnit, customer.location]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </p>
              )}
            </div>

            {/* Source */}
            <div className="mt-3">
              <Badge variant="secondary" className="text-xs">
                {customer.sourceTitle}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
