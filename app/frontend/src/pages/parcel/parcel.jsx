import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { XIcon, Settings2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import api from "@/login/api";
import { USER_PERMISSIONS } from '@/login/constants';
import { intl } from '@/i18n';

// Helper function to get unique options from table data
const getUniqueOptions = (data, field) => {
  const uniqueValues = [...new Set(data.map(item => item[field]))].filter(Boolean);
  return uniqueValues.map(value => ({
    id: value,
    name: value,
    value: value,
    label: value
  }));
};

const Parcel = () => {
  // State management
  const [page, setPage] = useState(0);
  const [parceldata, setParcelData] = useState([]);
  const [pagescount, setPagesCount] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedParcelId, setSelectedParcelId] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    parcel_type: null,
    region: null,
    province: null,
    city: null,
  });
  
  const [filterOptions, setFilterOptions] = useState({
    parcelTypes: [],
    regions: [],
    provinces: [],
    cities: [],
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize user permissions
  useEffect(() => {
    const permissions = JSON.parse(localStorage.getItem(USER_PERMISSIONS) || '[]');
    setUserPermissions(permissions);
  }, []);

  const hasPermission = (permission) => {
    return userPermissions.includes(permission);
  };

  const fetchdata = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page + 1,
        page_size: 10,
        search: search || '',
      });

      // Add filters only if they are not null
      if (filters.parcel_type) queryParams.append('parcel_type', filters.parcel_type);
      if (filters.region) queryParams.append('region', filters.region);
      if (filters.province) queryParams.append('province', filters.province);
      if (filters.city) queryParams.append('city', filters.city);

      const response = await api.get(`parcel/list/?${queryParams}`);
      const data = response.data.results;
      const totalCount = response.data.count;
      const pages = Math.ceil(totalCount / 10);
      
      // Update data and pages
      setPagesCount(pages);
      setParcelData(data);

      // Update filter options based on the received data
      setFilterOptions({
        parcelTypes: getUniqueOptions(data, 'parcel_type'),
        regions: getUniqueOptions(data, 'region_name'),
        provinces: getUniqueOptions(data, 'province_name'),
        cities: getUniqueOptions(data, 'city_name'),
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "error" }),
        description: intl.formatMessage({ id: "fetchParcelDataError" }),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchdata();
  }, [page, search, filters]);

  const handleFilterChange = (filterName, value) => {
    const newValue = value === 'all' ? null : value;
    
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterName]: newValue
      };

      // Clear dependent fields
      if (filterName === 'region') {
        newFilters.province = null;
        newFilters.city = null;
      } else if (filterName === 'province') {
        newFilters.city = null;
      }

      return newFilters;
    });

    setPage(0);
  };

  const handleDelete = async (id) => {
    if (!hasPermission('parcel.delete_parcel')) {
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "permissionDenied" }),
        description: intl.formatMessage({ id: "deleteParcelPermissionDenied" }),
      });
      return;
    }
    try {
      await api.delete(`parcel/list/${id}/`);
      fetchdata();
      toast({
        title: intl.formatMessage({ id: "success" }),
        description: intl.formatMessage({ id: "parcelDeletedSuccessfully" }),
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "error" }),
        description: intl.formatMessage({ id: "deleteParcelError" }),
      });
    }
  };

  const handleRowClick = (id) => {
    navigate(`/parcelsdetail/${id}`);
  };

  const handleEdit = (id) => {
    if (!hasPermission('parcel.change_parcel')) {
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "permissionDenied" }),
        description: intl.formatMessage({ id: "editParcelPermissionDenied" }),
      });
      return;
    }
    navigate(`/parcel/update/${id}`);
  };

  return (
    <div className="p-4">
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-6">
        {intl.formatMessage({ id: "parcelList" })}
      </h3>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Parcel Type Filter */}
        <div>
          <Label>{intl.formatMessage({ id: "parcelType" })}</Label>
          <Select
            value={filters.parcel_type || "all"}
            onValueChange={(value) => handleFilterChange('parcel_type', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={intl.formatMessage({ id: "selectParcelType" })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {intl.formatMessage({ id: "all" })}
              </SelectItem>
              {filterOptions.parcelTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Region Filter */}
        <div>
          <Label>{intl.formatMessage({ id: "region" })}</Label>
          <Select
            value={filters.region || "all"}
            onValueChange={(value) => handleFilterChange('region', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={intl.formatMessage({ id: "selectRegion" })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {intl.formatMessage({ id: "all" })}
              </SelectItem>
              {filterOptions.regions.map((region) => (
                <SelectItem key={region.value} value={region.name}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Province Filter */}
        <div>
          <Label>{intl.formatMessage({ id: "province" })}</Label>
          <Select
            value={filters.province || "all"}
            onValueChange={(value) => handleFilterChange('province', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={intl.formatMessage({ id: "selectProvince" })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {intl.formatMessage({ id: "all" })}
              </SelectItem>
              {filterOptions.provinces
                .filter(province => !filters.region || 
                  parceldata.some(item => 
                    item.region_name === filters.region && 
                    item.province_name === province.name
                  ))
                .map((province) => (
                  <SelectItem key={province.value} value={province.name}>
                    {province.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Filter */}
        <div>
          <Label>{intl.formatMessage({ id: "city" })}</Label>
          <Select
            value={filters.city || "all"}
            onValueChange={(value) => handleFilterChange('city', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={intl.formatMessage({ id: "selectCity" })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {intl.formatMessage({ id: "all" })}
              </SelectItem>
              {filterOptions.cities
                .filter(city => !filters.province || 
                  parceldata.some(item => 
                    item.province_name === filters.province && 
                    item.city_name === city.name
                  ))
                .map((city) => (
                  <SelectItem key={city.value} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <Label htmlFor="parcellabel" className="mb-2 block">
          {intl.formatMessage({ id: "searchParcel" })}
        </Label>
        <Input
          id="parcelsearch"
          placeholder={intl.formatMessage({ id: "parcelNamePlaceholder" })}
          className="w-full max-w-sm"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <Table className="w-full border rounded-2xl">
          <TableHeader>
            <TableRow>
              <TableHead className="px-2 py-3 text-left">{intl.formatMessage({ id: "type" })}</TableHead>
              <TableHead className="px-2 py-3 text-left">{intl.formatMessage({ id: "name" })}</TableHead>
              <TableHead className="px-2 py-3 text-left hidden md:table-cell">{intl.formatMessage({ id: "region" })}</TableHead>
              <TableHead className="px-2 py-3 text-left hidden md:table-cell">{intl.formatMessage({ id: "province" })}</TableHead>
              <TableHead className="px-2 py-3 text-left hidden lg:table-cell">{intl.formatMessage({ id: "city" })}</TableHead>
              <TableHead className="px-2 py-3 text-left hidden lg:table-cell">{intl.formatMessage({ id: "situation" })}</TableHead>
              <TableHead className="px-2 py-3 text-left hidden xl:table-cell">{intl.formatMessage({ id: "landRef" })}</TableHead>
              <TableHead className="px-2 py-3 text-right hidden sm:table-cell">{intl.formatMessage({ id: "area" })}</TableHead>
              <TableHead className="px-2 py-3 text-right">{intl.formatMessage({ id: "actions" })}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : parceldata.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  {intl.formatMessage({ id: "noData" })}
                </TableCell>
              </TableRow>
            ) : (
              parceldata.map((row) => (
                <TableRow 
                  key={row.id}
                  onClick={() => handleRowClick(row.id)}
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <TableCell className="px-2 py-3 font-medium">{row.parcel_type}</TableCell>
                  <TableCell className="px-2 py-3">{row.name}</TableCell>
                  <TableCell className="px-2 py-3 hidden md:table-cell">{row.region_name}</TableCell>
                  <TableCell className="px-2 py-3 hidden md:table-cell">{row.province_name}</TableCell>
                  <TableCell className="px-2 py-3 hidden lg:table-cell">{row.city_name}</TableCell>
                  <TableCell className="px-2 py-3 hidden lg:table-cell">{row.situation}</TableCell>
                  <TableCell className="px-2 py-3 hidden xl:table-cell">{row.land_reference}</TableCell>
                  <TableCell className="px-2 py-3 text-right hidden sm:table-cell">{row.area}</TableCell>
                  <TableCell className="px-2 py-3 text-right">
                    <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                      {hasPermission('parcel.change_parcel') && (
                        <button 
                          onClick={() => handleEdit(row.id)}
                          className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
                        >
                          <Settings2 className="w-5 h-5" />
                        </button>
                      )}
                      {hasPermission('parcel.delete_parcel') && (
  <AlertDialog>
    <AlertDialogTrigger
      className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
      onClick={() => setSelectedParcelId(row.id)}
    >
      <XIcon className="w-5 h-5" />
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {intl.formatMessage({ id: "areYouSure" })}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {intl.formatMessage({ id: "deleteParcelWarning" })}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>
          {intl.formatMessage({ id: "cancel" })}
        </AlertDialogCancel>
        <AlertDialogAction 
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={() => handleDelete(selectedParcelId)}
        >
          {intl.formatMessage({ id: "delete" })}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Section */}
      {parceldata.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {intl.formatMessage(
              { id: "showingResults" },
              {
                start: page * 10 + 1,
                end: Math.min((page + 1) * 10, parceldata.length),
                total: pagescount * 10
              }
            )}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0}
                  className={page === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: pagescount }, (_, i) => (
                <PaginationItem key={i} className="hidden sm:inline-block">
                  <PaginationLink
                    onClick={() => setPage(i)}
                    className={`cursor-pointer ${
                      page === i ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setPage((prev) =>
                      prev + 1 < pagescount ? prev + 1 : prev
                    )
                  }
                  disabled={page >= pagescount - 1}
                  className={page >= pagescount - 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Add Button - Only show if user has create permission */}
    
    </div>
  );
};

export default Parcel;