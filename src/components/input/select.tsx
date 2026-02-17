import { useMemo } from "react";
import { Button } from "@/src/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import { Label } from "@/src/components/ui/label";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

type SelectOption = {
  label: string;
  value: string;
};

type SelectInputProps = {
  onSelect: (value: string | string[]) => void;
  options: SelectOption[];
  multiselect?: boolean;
  value: string | string[];
  placeholder?: string;
  label?: string;
  onSearch?: (term: string) => void;
  onAction?: () => void;
  actionLabel?: string;
};

const SelectInput = ({
  onSelect,
  options,
  multiselect = false,
  value,
  placeholder = "Select an option",
  label,
  onSearch,
  onAction,
  actionLabel,
}: SelectInputProps) => {
  const selectedValues = multiselect
    ? (Array.isArray(value) ? value : [])
    : (typeof value === "string" ? value : "");

  const displayValue = useMemo(() => {
    if (multiselect) {
      const selectedArray = selectedValues as string[];
      if (selectedArray.length === 0) return placeholder;
      const firstLabel = options.find(opt => opt.value === selectedArray[0])?.label;
      const extraCount = selectedArray.length - 1;
      return extraCount > 0
        ? `${firstLabel ?? selectedArray[0]} +${extraCount}`
        : (firstLabel ?? selectedArray[0]);
    }

    const singleValue = selectedValues as string;
    if (!singleValue) return placeholder;
    return options.find(opt => opt.value === singleValue)?.label ?? placeholder;
  }, [multiselect, options, placeholder, selectedValues]);

  const handleSelectOption = (optionValue: string) => {
    if (multiselect) {
      const currentValues = Array.isArray(selectedValues) ? selectedValues : [];
      const nextValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onSelect(nextValues);
      return;
    }

    onSelect(optionValue);
  };

  const showSearch = typeof onSearch === "function";
  const isActionVisible = Boolean(actionLabel);
  const allValues = useMemo(() => options.map(opt => opt.value), [options]);

  const handleSelectAll = () => {
    if (multiselect) {
      onSelect(allValues);
    }
  };

  const handleDeselectAll = () => {
    if (multiselect) {
      onSelect([]);
    }
  };

  return (
    <div className="space-y-1">
      {label ? (
        <Label className="text-sm font-medium">{label}</Label>
      ) : null}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="h-10 w-full justify-between mt-1"
          >
            {displayValue}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full" align="start">
          <Command>
            {showSearch ? (
              <CommandInput
                placeholder="Search..."
                onValueChange={onSearch}
                className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
              />
            ) : null}
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {isActionVisible ? (
                  <div className="px-3 py-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center"
                      onClick={() => onAction?.()}
                    >
                      {actionLabel}
                    </Button>
                  </div>
                ) : null}
                {multiselect ? (
                  <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                    <button
                      type="button"
                      className="underline-offset-4 hover:underline"
                      onClick={handleSelectAll}
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      className="underline-offset-4 hover:underline"
                      onClick={handleDeselectAll}
                    >
                      Deselect all
                    </button>
                  </div>
                ) : null}
                {options.map(opt => {
                  const isSelected = multiselect
                    ? (Array.isArray(selectedValues) && selectedValues.includes(opt.value))
                    : selectedValues === opt.value;

                  return (
                    <CommandItem
                      key={opt.value}
                      value={opt.label}
                      onSelect={() => handleSelectOption(opt.value)}
                      className="cursor-pointer"
                    >
                      {isSelected ? <Check className="mr-2 h-4 w-4" /> : null}
                      {opt.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SelectInput;

