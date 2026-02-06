import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { PlayCircle } from "lucide-react"
import { CustomerT } from "@/src/types/customer"

interface CommunicationsCustomerTabProps {
  selectedCustomer: CustomerT
  getCommunicationIcon: (type: string, channel: string) => JSX.Element
}

export const CommunicationsCustomerTab: React.FC<CommunicationsCustomerTabProps> = ({
  selectedCustomer,
  getCommunicationIcon,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">
        Communication History
      </h3>

      {selectedCustomer.communications?.map(comm => (
        <Card
          key={comm.id}
          className="border-0 bg-white/70 backdrop-blur-sm"
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              {getCommunicationIcon(comm.type, comm.channel)}

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-slate-900 capitalize">
                      {comm.type}
                    </span>

                    <Badge variant="outline" className="text-xs">
                      {comm.channel}
                    </Badge>

                    <Badge
                      variant={
                        comm.direction === "incoming"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {comm.direction}
                    </Badge>
                  </div>

                  <span className="text-sm text-slate-500">
                    {comm.date}
                  </span>
                </div>

                <p className="text-sm text-slate-700">
                  {comm.content}
                </p>

                {comm.type === "call" && (
                  <div className="mt-2 flex items-center space-x-4 text-sm text-slate-500">
                    <span>Duration: {comm.duration}</span>

                    {comm.recordingUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#4a9430] p-0 h-auto"
                      >
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Play Recording
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
