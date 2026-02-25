import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { CustomerT } from "@/src/constants/interface/customer";
import SidePanel from "../sidePanel";

type Props = {
  customer: CustomerT;
  onViewFullProfile: (customer: CustomerT) => void;
};

export default function CustomerQuickView({ customer, onViewFullProfile }: Props){
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase text-slate-500">Client</p>
        <p className="text-lg font-semibold text-slate-900">
          {customer.clientName ?? "—"}
        </p>
        {customer.sourceTitle && (
          <Badge variant="outline">{customer.sourceTitle}</Badge>
        )}
      </div>

      {customer.companyName && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs uppercase text-slate-500 mb-1">Company</p>
          <p className="text-sm font-medium text-slate-900">
            {customer.companyName}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="text-xs uppercase text-slate-500 mb-1">Contact</p>
        <div className="space-y-1 text-sm text-slate-900">
          {customer.email && <p>{customer.email}</p>}
          {customer.phoneNumber && <p>{customer.phoneNumber}</p>}
          {!customer.email && !customer.phoneNumber && (
            <p className="text-slate-500">No contact info</p>
          )}
        </div>
      </div>

      {(customer.city ||
        customer.state ||
        customer.country ||
        customer.location) && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs uppercase text-slate-500 mb-1">
            Address / Location
          </p>
          <div className="space-y-1 text-sm text-slate-700">
            {customer.apartmentUnit && <p>{customer.apartmentUnit}</p>}
            <p>
                {(
                    [customer.city, customer.state, customer.zipCode, customer.country]
                    .filter(Boolean)
                    .join(", ") || customer.location
                ) ?? "—"}
            </p>
            {customer.location && customer.city && (
              <p className="text-slate-500">
                Location: {customer.location}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          size="sm"
          className="bg-gradient-to-r from-[#53a533] to-[#53a533] text-white"
          onClick={() => {
            SidePanel.close();
            onViewFullProfile(customer);
          }}
        >
          View full profile
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => SidePanel.close()}
        >
          Close
        </Button>
      </div>
    </div>
  );
};