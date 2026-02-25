import { Button } from "../ui/button"

interface Toggle {
    label: string;
    value: string;
}
interface Props {
    toggleList: Toggle[];
    currentToggled: string;
    onSetToggle: (value: string) => void;
}
export default function(props: Props){
    return (
        <div className="flex items-center gap-1 rounded-full bg-slate-50 border border-slate-100 dark:bg-slate-800 px-1 py-1 h-10">
            {props.toggleList.map((item,index) => (
                <Button
                    key={index}
                    size="sm"
                    variant="ghost"
                    onClick={() => props.onSetToggle(item.value)}
                    className={`flex-1 h-8 rounded-full px-4 text-xs ${
                        props.currentToggled === item.value
                            ? "bg-brandGreen-900 text-white hover:bg-brandGreen-600"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700"
                        }`}
                >
                    {item.label}
                </Button>
            ))}
        </div>
    )
}