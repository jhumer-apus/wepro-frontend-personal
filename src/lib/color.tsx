export const CustomerStatusColors = {
  active: {
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  inactive: {
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
  pending: {
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  cancelled: {
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
  completed: {
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
}

export const JobStatusColors = {
  pending: {
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  rejected: {
    badge: 'bg-[#53a533]/10 text-[#2f5f1f] border-[#53a533]/20',
  },
  'no answer': {
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  cancelled: {
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
  done: {
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  'in progress': {
    badge: 'bg-[#53a533]/10 text-[#2f5f1f] border-[#53a533]/20',
  },
  submitted: {
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  appointments: {
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  'not confirmed': {
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
  confirmed: {
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  'follow up': {
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
}

export const UserTypeColors = {
  technician: {
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  office: {
    badge: 'bg-[#53a533]/10 text-[#2f5f1f] border-[#53a533]/20',
  },
  dispatcher: {
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  agent: {
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
  },
}

export const SourceColors = {
  google: {
    badge: 'bg-[#53a533]/10 text-[#2f5f1f] border-[#53a533]/20',
  },
  facebook: {
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  instagram: {
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  twitter: {
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  linkedin: {
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
  youtube: {
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  other: {
    badge: 'bg-[#53a533]/10 text-[#2f5f1f] border-[#53a533]/20',
  },
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
    case "in-progress": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "completed": return "bg-green-100 text-green-800 border-green-200";
    case "cancelled": return "bg-red-100 text-red-800 border-red-200";
    case "unassigned": return "bg-gray-100 text-gray-800 border-gray-200";
    case "urgent": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getStatusBorderColor = (status: string) => {
  switch (status) {
    case "scheduled": return "border-l-blue-500";
    case "in-progress": return "border-l-yellow-500";
    case "completed": return "border-l-green-500";
    case "cancelled": return "border-l-red-500";
    case "unassigned": return "border-l-gray-500";
    case "urgent": return "border-l-red-600";
    default: return "border-l-gray-500";
  }
};

