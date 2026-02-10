import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/src/components/ui/dropdown-menu"
import {
  Plus,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react"
import { CustomerT } from "@/src/constants/interface/customer"
import { Notes } from "@/src/constants/dummyData/customers"

interface NotesCustomerTabProps {
  selectedCustomer: CustomerT
}

export const NotesCustomerTab: React.FC<NotesCustomerTabProps> = ({
  selectedCustomer,
}) => {
  const notes = Array.isArray(selectedCustomer.notes)
    ? selectedCustomer.notes
    : []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Customer Notes
        </h3>
        <Button className="bg-gradient-to-r from-[#53a533] to-[#53a533] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Notes list */}
      {notes.map((note: Notes) => (
        <Card
          key={note.id}
          className="border-0 bg-white/70 backdrop-blur-sm"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#4a9430]" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {note.type}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {note.date}
                    </span>
                    <span className="text-sm text-slate-500">
                      by {note.author}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700">
                    {note.content}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Note
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Note
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
