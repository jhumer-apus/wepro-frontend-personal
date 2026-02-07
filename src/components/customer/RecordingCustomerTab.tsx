import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { PlayCircle, Download } from "lucide-react"
import { CustomerT } from "@/src/constants/interface/customer"

interface RecordingCustomerTabProps {
  selectedCustomer: CustomerT
}

export const RecordingCustomerTab: React.FC<RecordingCustomerTabProps> = ({
  selectedCustomer,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">
        Call Recordings
      </h3>

      {selectedCustomer.callRecordings?.map(recording => (
        <Card
          key={recording.id}
          className="border-0 bg-white/70 backdrop-blur-sm"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-green-600" />
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900">
                    {recording.type}
                  </h4>
                  <p className="text-sm text-slate-500">
                    {recording.date}
                  </p>

                  <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                    <span>Duration: {recording.duration}</span>
                    <Badge variant="outline" className="text-xs">
                      {recording.quality}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Play
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-slate-600">
                {recording.notes}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
