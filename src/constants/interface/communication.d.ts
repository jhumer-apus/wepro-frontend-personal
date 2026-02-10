

export interface CommunicationActivity {
  id: string
  type: string
  date: string            
  direction: string
  duration?: string      
  content: string
  channel: string
  recordingUrl?: string 
}
