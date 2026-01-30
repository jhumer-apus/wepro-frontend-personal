import { Customer } from "@/src/constants/dummyData/customers"
import { Card, CardContent } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { Edit, Eye, Mail, MapPin, MessageSquare, MoreVertical, Phone, Star } from "lucide-react"
import { Badge } from "../ui/badge"

type CustomerCardProps = {
  customer: Customer
  openCustomerProfile: (id: string) => void
}

const getStatusColor = (status: string) => {
    switch (status) {
    case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
    case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200'
    default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
}

export const CustomerCard = ({
  customer,
  openCustomerProfile,
}: CustomerCardProps) => {

  return (
    <Card
      className="border-0 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => openCustomerProfile(customer.id)}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={customer.avatar} alt={customer.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white text-lg font-semibold">
              {customer.name
                .split(" ")
                .map(n => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-900 truncate">
                {customer.name}
              </h3>

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
                      openCustomerProfile(customer.id)
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={e => e.stopPropagation()}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Customer
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={e => e.stopPropagation()}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={e => e.stopPropagation()}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call Customer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Contact info */}
            <div className="space-y-1 text-sm text-slate-600">
              <p className="flex items-center space-x-2">
                <Mail className="w-3 h-3" />
                <span className="truncate">{customer.email}</span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className="w-3 h-3" />
                <span>{customer.phone}</span>
              </p>
              <p className="flex items-center space-x-2">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{customer.address}</span>
              </p>
            </div>

            {/* Status + rating */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2 flex-wrap">
                <Badge className={getStatusColor(customer.status)}>
                  {customer.status}
                </Badge>

                {customer.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center space-x-1">
                {Array.from({ length: customer.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3 h-3 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-center">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {customer.totalJobs}
                </p>
                <p className="text-xs text-slate-500">Jobs</p>
              </div>

              <div>
                <p className="text-lg font-semibold text-green-600">
                  ${customer.totalSpent.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">Spent</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Last Contact</p>
                <p className="text-sm font-medium text-slate-900">
                  {customer.lastContact}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
