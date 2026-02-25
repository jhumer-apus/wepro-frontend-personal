import debounce from "lodash.debounce";
import { type ChangeEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

type ParsedAddress = {
  address: string;
  address2: string;
  city: string;
  zip: string;
  state: string;
  country: string;
};

type AddressInputProps = {
  isEditing: boolean;
  value?: string;
  displayValue?: string;
  onChange: (value: string) => void;
  onAddressChange?: (data: ParsedAddress) => void;
  label?: string;
};

const AddressInput = ({
  isEditing,
  value = "",
  displayValue,
  onChange,
  onAddressChange,
  label = "Location",
}: AddressInputProps) => {

  const [input, setInput] = useState(value);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    if (!window.google) return;

    serviceRef.current =
      new window.google.maps.places.AutocompleteService();

  }, []);

  useEffect(() => {
    setInput(value);
  }, [value]);

  const debouncedFetchPredictions = useMemo(
    () =>
      debounce((nextValue: string) => {
        if (!serviceRef.current) return;

        serviceRef.current.getPlacePredictions(
          {
            input: nextValue,
            componentRestrictions: { country: ["us", "mx"] },
          },
          (results: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              const nextPredictions = results ?? [];
              setPredictions(nextPredictions);
              setHighlightedIndex(nextPredictions.length > 0 ? 0 : -1);
            } else {
              setPredictions([]);
              setHighlightedIndex(-1);
            }
          }
        );
      }, 400),
    []
  );

  useEffect(() => {
    return () => {
      debouncedFetchPredictions.cancel();
    };
  }, [debouncedFetchPredictions]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setInput(nextValue);
    onChange(nextValue);

    if (!nextValue || !serviceRef.current) {
      debouncedFetchPredictions.cancel();
      setPredictions([]);
      setHighlightedIndex(-1);
      return;
    }

    debouncedFetchPredictions(nextValue);
  };

  const getAddressPart = (
    components: google.maps.GeocoderAddressComponent[],
    type: string,
    useShortName = false
  ) => {
    const component = components.find((item) => item.types.includes(type));
    if (!component) return "";
    return useShortName ? component.short_name : component.long_name;
  };

  const emitAddressChange = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!onAddressChange || !window.google?.maps?.Geocoder) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status !== window.google.maps.GeocoderStatus.OK || !results?.length) {
        onAddressChange({
          address: prediction.description,
          address2: "",
          city: "",
          zip: "",
          state: "",
          country: "",
        });
        return;
      }

      const selected = results[0];
      const components = selected.address_components ?? [];
      const streetNumber = getAddressPart(components, "street_number");
      const route = getAddressPart(components, "route");
      const premise = getAddressPart(components, "premise");
      const subpremise = getAddressPart(components, "subpremise");
      const addressLineFromParts = [streetNumber, route].filter(Boolean).join(" ").trim();
      const addressLineFromFormatted = selected.formatted_address?.split(",")[0]?.trim() ?? "";
      const city =
        getAddressPart(components, "locality") ||
        getAddressPart(components, "postal_town") ||
        getAddressPart(components, "administrative_area_level_2");

      onAddressChange({
        address: addressLineFromParts || premise || addressLineFromFormatted || prediction.description,
        address2: subpremise,
        city,
        zip: getAddressPart(components, "postal_code"),
        state: getAddressPart(components, "administrative_area_level_1", true),
        country: getAddressPart(components, "country"),
      });
    });
  };

  const handlePredictionClick = (prediction: google.maps.places.AutocompletePrediction) => {
    const selectedAddress = prediction.description;
    setInput(selectedAddress);
    onChange(selectedAddress);
    emitAddressChange(prediction);
    setPredictions([]);
    setHighlightedIndex(-1);
    debouncedFetchPredictions.cancel();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (predictions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % predictions.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? predictions.length - 1 : prev - 1));
      return;
    }

    if (e.key === "Enter") {
      if (highlightedIndex < 0) return;
      e.preventDefault();
      handlePredictionClick(predictions[highlightedIndex]);
      return;
    }

    if (e.key === "Escape") {
      setPredictions([]);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="relative">
      <Label className="text-sm font-medium">{label}</Label>
      {isEditing ? (
        <div className="relative">
          <Input
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="mt-1"
          />
          {predictions.length > 0 ? (
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-white shadow-sm dark:bg-slate-900">
              {predictions.map((prediction, index) => (
                <button
                  key={prediction.place_id}
                  type="button"
                  className={`w-full cursor-pointer px-3 py-2 text-left text-sm focus:outline-none ${
                    highlightedIndex === index
                      ? "bg-slate-100 dark:bg-slate-800"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => handlePredictionClick(prediction)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {prediction.description}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-1 text-sm">{displayValue}</div>
      )}
    </div>
  );
};

export default AddressInput;
