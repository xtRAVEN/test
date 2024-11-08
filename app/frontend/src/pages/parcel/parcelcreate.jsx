import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../login/api';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Check, ChevronsUpDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { intl } from '@/i18n';

const parcelSchema = z.object({
  parcel_type: z.string().min(1, intl.formatMessage({ id: "parcelTypeRequired" })),
  name: z.string().min(1, intl.formatMessage({ id: "nameRequired" })).max(100, intl.formatMessage({ id: "nameMaxLength" })),
  region: z.string().min(1, intl.formatMessage({ id: "regionRequired" })),
  province: z.string().min(1, intl.formatMessage({ id: "provinceRequired" })),
  city: z.string().min(1, intl.formatMessage({ id: "cityRequired" })),
  situation: z.string().max(200, intl.formatMessage({ id: "situationMaxLength" })),
  land_reference: z.string().max(100, intl.formatMessage({ id: "landReferenceMaxLength" })),
  area: z.string().min(1, intl.formatMessage({ id: "areaPositive" })),
  point_kilometrique: z.string().max(100, intl.formatMessage({ id: "pointKilometriqueMaxLength" })),
  les_coordonnees_lambert: z.string().max(100, intl.formatMessage({ id: "lesCoordonneesMambertMaxLength" })),
  long_lat: z.string().max(100, intl.formatMessage({ id: "longLatMaxLength" })),
  coordinates: z.string().min(1, intl.formatMessage({ id: "coordinatesRequired" })).refine(
    (val) => {
      try {
        const coords = JSON.parse(`[${val}]`);
        return Array.isArray(coords) && 
               coords.length === 2 && 
               coords.every(num => typeof num === 'number' && !isNaN(num));
      } catch {
        return false;
      }
    },
    { message: intl.formatMessage({ id: "invalidPointFormat" }) }
  ),
});

const ParcelC = () => {
  const form = useForm({
    resolver: zodResolver(parcelSchema),
    mode: "onSubmit",
    defaultValues: {
      parcel_type: localStorage.getItem("parcel_type") || "",
      name: localStorage.getItem("name") || "",
      region: localStorage.getItem("region") || "",
      province: localStorage.getItem("province") || "",
      city: localStorage.getItem("city") || "",
      situation: localStorage.getItem("situation") || "",
      land_reference: localStorage.getItem("land_reference") || "",
      area: localStorage.getItem("area") || "",
      point_kilometrique: localStorage.getItem("point_kilometrique") || "",
      les_coordonnees_lambert: localStorage.getItem("les_coordonnees_lambert") || "",
      long_lat: localStorage.getItem("long_lat") || "",
      coordinates: localStorage.getItem("coordinates") || "",
    },
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const { watch, setValue, handleSubmit, control } = form;

  const [parcelTypeOptions, setParcelTypeOptions] = useState([
    { value: 'bare land', label: intl.formatMessage({ id: "bareLand" }) },
    { value: 'service station', label: intl.formatMessage({ id: "serviceStation" }) },
    { value: 'building', label: intl.formatMessage({ id: "building" }) },
    { value: 'warehouse', label: intl.formatMessage({ id: "warehouse" }) },
    { value: 'fishing supply point', label: intl.formatMessage({ id: "fishingSupplyPoint" }) },
  ]);

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [coorderror, setCoordError] = useState("");
  const [isCustomType, setIsCustomType] = useState(false);
  const [point, setPoint] = useState(null);
  const [position, setPosition] = useState([25.4050, -14.5598]);

  const handleParcelTypeChange = (value) => {
    if (value === "custom") {
      setIsCustomType(true);
      setValue("parcel_type", "");
    } else {
      setIsCustomType(false);
      setValue("parcel_type", value);
    }
  };

  const [locations, setLocations] = useState({
    regions: [],
    provinces: [],
    cities: []
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await api.get('parcel/locations/');
      setLocations(response.data);
    } catch (error) {
      console.error(intl.formatMessage({ id: "errorFetchingLocations" }), error);
    }
  };

  const filteredProvinces = locations.provinces.filter(
    p => p.region_id === locations.regions.find(r => r.name === selectedRegion)?.id
  );

  const filteredCities = locations.cities.filter(
    c => c.province_id === filteredProvinces.find(p => p.name === selectedProvince)?.id
  );

  useEffect(() => {
    const subscription = watch((values) => {
      Object.keys(values).forEach((key) => {
        localStorage.setItem(key, values[key] !== undefined ? values[key] : "");
      });
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        coordinates: JSON.parse(`[${data.coordinates}]`)
      };
      const response = await api.post('parcel/create/', formattedData);
      toast({
        variant: 'success',
        title: intl.formatMessage({ id: "parcelSavedSuccessfully" }),
        description: intl.formatMessage({ id: "parcelSavedSuccessfullyDescription" }, { name: response.data.name }),
      });
      setTimeout(() => {
        navigate('/parcel');
      }, 2000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: intl.formatMessage({ id: "error" }),
        description: error.response?.data || error.message || intl.formatMessage({ id: "anErrorOccurred" }),
      });
    }
  };

  const checkcoords = (coordString) => {
    try {
      setCoordError('');
      const parsedCoord = JSON.parse(`[${coordString}]`);
      
      if (!Array.isArray(parsedCoord) || parsedCoord.length !== 2 || 
          !parsedCoord.every(num => typeof num === 'number' && !isNaN(num))) {
        setCoordError(intl.formatMessage({ id: "invalidPointFormat" }));
        return;
      }
      
      setPoint(parsedCoord);
      setPosition(parsedCoord);
    } catch (error) {
      setCoordError(intl.formatMessage({ id: "invalidCoordinateFormat" }));
    }
  };

  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (point) {
        map.setView(point, 13);
      }
    }, [point, map]);
    return null;
  };

  return (
    <>
      <div className="flex items-center justify-center">    
        <Form {...form}>
          <form className="w-full h-full p-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              {/* Parcel Type Field */}
              <FormField
                control={form.control}
                name="parcel_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{intl.formatMessage({ id: "parcelType" })}</FormLabel>
                    <Select onValueChange={handleParcelTypeChange} value={isCustomType ? "custom" : field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={intl.formatMessage({ id: "selectParcelType" })} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {parcelTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">{intl.formatMessage({ id: "custom" })}</SelectItem>
                      </SelectContent>
                    </Select>
                    {isCustomType && (
                      <Input
                        {...field}
                        placeholder={intl.formatMessage({ id: "enterCustomParcelType" })}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{intl.formatMessage({ id: "name" })}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={intl.formatMessage({ id: "parcelName" })} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Region Field */}
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block">{intl.formatMessage({ id: "region" })}</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between mt-1">
                            {selectedRegion || intl.formatMessage({ id: "selectRegion" })}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 mt-2">
                          <Command>
                            <CommandInput placeholder={intl.formatMessage({ id: "searchRegion" })} />
                            <CommandList>
                              <CommandEmpty>{intl.formatMessage({ id: "noRegionFound" })}</CommandEmpty>
                              <CommandGroup>
                                {locations.regions.map((region) => (
                                  <CommandItem
                                    key={region.id}
                                    value={region.name}
                                    onSelect={(currentValue) => {
                                      setSelectedRegion(currentValue);
                                      setSelectedProvince("");
                                      setSelectedCity("");
                                      setValue("region", currentValue);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedRegion === region.name ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {region.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Province Field */}
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block">{intl.formatMessage({ id: "province" })}</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between mt-1">
                            {selectedProvince || intl.formatMessage({ id: "selectProvince" })}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 mt-2">
                          <Command>
                            <CommandInput placeholder={intl.formatMessage({ id: "searchProvince" })} />
                            <CommandList>
                              <CommandEmpty>{intl.formatMessage({ id: "noProvinceFound" })}</CommandEmpty>
                              <CommandGroup>
                                {filteredProvinces.map((province) => (
                                  <CommandItem
                                    key={province.id}
                                    value={province.name}
                                    onSelect={(currentValue) => {
                                      setSelectedProvince(currentValue);
                                      setSelectedCity("");
                                      setValue("province", currentValue);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedProvince === province.name ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {province.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City Field */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block">{intl.formatMessage({ id: "city" })}</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between mt-1">
                            {selectedCity || intl.formatMessage({ id: "selectCity" })}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 mt-2">
                          <Command>
                            <CommandInput placeholder={intl.formatMessage({ id: "searchCity" })} />
                            <CommandList>
                              <CommandEmpty>{intl.formatMessage({ id: "noCityFound" })}</CommandEmpty>
                              <CommandGroup>
                                {filteredCities.map((city) => (
                                  <CommandItem
                                    key={city.id}
                                    value={city.name}
                                    onSelect={(currentValue) => {
                                      setSelectedCity(currentValue);
                                      setValue("city", currentValue);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedCity === city.name ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {city.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Situation Field */}
              <FormField
                control={form.control}
                name="situation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block">{intl.formatMessage({ id: "situation" })}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={intl.formatMessage({ id: "situationPlaceholder" })} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Land Reference Field */}
              <FormField
                control={form.control}
                name="land_reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{intl.formatMessage({ id: "landReference" })}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={intl.formatMessage({ id: "landReferencePlaceholder" })} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Area Field */}
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{intl.formatMessage({ id: "area" })}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder={intl.formatMessage({ id: "areaPlaceholder" })} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Point Kilometrique Field */}
              <FormField
                control={form.control}
                name="point_kilometrique"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{intl.formatMessage({ id: "pointKilometrique" })}</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder={intl.formatMessage({ id: "pointKilometriquePlaceholder" })} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Les Coordonnees Lambert Field */}
              <FormField
                control={form.control}
                name="les_coordonnees_lambert"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{intl.formatMessage({ id: "lesCoordonneesLambert" })}</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder={intl.formatMessage({ id: "lesCoordonneesLambertPlaceholder" })} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Long Lat Field */}
              <FormField
                control={form.control}
                name="long_lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{intl.formatMessage({ id: "longitudeLatitude" })}</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder={intl.formatMessage({ id: "longitudeLatitudePlaceholder" })} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Coordinates Field */}
              <div className="col-span-2">
                <FormField
                  control={control}
                  name="coordinates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{intl.formatMessage({ id: "coordinates" })}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={coordinates}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setCoordinates(newValue);
                            field.onChange(e);
                          }}
                          placeholder={intl.formatMessage({ id: "pointCoordinatesPlaceholder" })}
                        />
                      </FormControl>
                      <FormDescription>
                        {intl.formatMessage({ id: "pointCoordinatesDescription" })}
                        <a 
                          href="https://tool-online.com/en/coordinate-converter.php" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-500 hover:underline"
                        >
                          {intl.formatMessage({ id: "coordinatesConverter" })}
                          <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      </FormDescription>
                      <FormMessage>{coorderror}</FormMessage>
                    </FormItem>
                  )}
                />

                <div className="flex gap-x-2">
                  <Button 
                    className="mt-4" 
                    type="button" 
                    size="sm" 
                    onClick={() => checkcoords(coordinates)}
                  >
                    {intl.formatMessage({ id: "showPoint" })}
                  </Button>
                  <Button 
                    className="mt-4" 
                    type="button" 
                    size="sm" 
                    onClick={() => {setCoordinates(''); setPoint(null)}}  
                    variant="destructive"
                  >
                    {intl.formatMessage({ id: "removePoint" })}
                  </Button>
                </div>
              </div>
            </div>
            <Button type="submit" className="mt-4" size="sm">
              {intl.formatMessage({ id: "submit" })}
            </Button>
          </form>
        </Form>
      </div>

      {/* Map Container */}
      <div style={{ width: '100%', height: '620px', position: 'relative' }}>
        <MapContainer
          scrollWheelZoom={true}
          center={position}
          zoom={6}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            borderRadius: '0.7rem',
            padding: '1rem'
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {point && (
            <Marker position={point}>
              <Popup>
                {intl.formatMessage({ id: "parcelLocation" })}
              </Popup>
            </Marker>
          )}
          <MapUpdater />
        </MapContainer>
      </div>
    </>
  );
}

export default ParcelC;