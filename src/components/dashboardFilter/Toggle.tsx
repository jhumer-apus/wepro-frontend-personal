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
        <div className="hidden md:flex items-center rounded-full bg-slate-100 dark:bg-slate-800 p-1">
            {props.toggleList.map((item,index) => (
                <Button
                    key={index}
                    size="sm"
                    variant="ghost"
                    onClick={() => props.onSetToggle(item.value)}
                    className={`rounded-full px-4 text-xs transition-all ${
                        props.currentToggled === item.value
                            ? "bg-brandGreen-600 text-white shadow"
                            : "text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700"
                        }`}
                >
                    {item.label}
                </Button>
            ))}
        </div>
    )
}