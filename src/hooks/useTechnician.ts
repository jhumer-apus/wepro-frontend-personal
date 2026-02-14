import { useScheduleOptions } from "./use-schedule-options";

export const useTechnician = () => {
    const { technicians } = useScheduleOptions();

    const getTechnicianColor = (technicianId: string) => {
        const technician = technicians.find(t => t.id === technicianId);
        return technician ? technician.color : "#6B7280";
    };

    const getTechnicianName = (technicianId: string) => {
        const technician = technicians.find(t => t.id === technicianId);
        return technician ? technician.name : "Unassigned";
    };

    return {
        getTechnicianColor,
        getTechnicianName
    }
}