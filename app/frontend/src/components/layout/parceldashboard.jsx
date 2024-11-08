import React, { useReducer, useEffect, useMemo, useCallback, memo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RefreshCw, Download, Search } from 'lucide-react';
// import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
import { MapPin, Building, Square, GitBranch } from 'lucide-react';
import api from '@/login/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { intl } from '@/i18n';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Memoized Input component with debounce
const SearchInput = memo(({ onSearch }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Debounce search to prevent excessive API calls
  const debouncedSearch = useCallback(
    React.useCallback(
      debounce((term) => {
        onSearch(term);
      }, 300),
      [onSearch]
    )
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  return (
    <div className="flex space-x-2">
      <Input
        type="text"
        placeholder={intl.formatMessage({ id: "searchParcelByName" })}
        value={searchTerm}
        onChange={handleChange}
      />
      <Button onClick={() => onSearch(searchTerm)}>
        <Search className="h-4 w-4 mr-2" />
        {intl.formatMessage({ id: "search" })}
      </Button>
    </div>
  );
});

// Memoized Map Control component
const MapControl = memo(({ searchedParcel }) => {
  const map = useMap();
  
  useEffect(() => {
    if (searchedParcel) {
      map.setView(searchedParcel.coordinates, 13);
    }
  }, [searchedParcel, map]);

  return null;
});


// Memoized Info Item component
const InfoItem = memo(({ icon, label, value }) => (
  <div className="flex items-center p-2 rounded-lg shadow-sm">
    {icon}
    <div className="ml-3">
      <p className="text-xs text-gray-500">{intl.formatMessage({ id: label })}</p>
      <p className="font-semibold">{value}</p>
    </div>
  </div>
));

// Action types constants
const ACTION_TYPES = {
  SET_DATA: 'SET_DATA',
  SET_MAP_DATA: 'SET_MAP_DATA',
  SET_FILTER: 'SET_FILTER',
  SET_FILTERED_PARCELS: 'SET_FILTERED_PARCELS',
  SET_SELECTED_PARCEL: 'SET_SELECTED_PARCEL',
  SET_SELECTED_PARCEL_DETAILS: 'SET_SELECTED_PARCEL_DETAILS',
  SET_CSV_DATA: 'SET_CSV_DATA',
  SET_LOCATION_DATA: 'SET_LOCATION_DATA',
  SET_CUSTOM_PARCEL_TYPES: 'SET_CUSTOM_PARCEL_TYPES'
};

// Initial state
const initialState = {
  data: null,
  mapData: [],
  filteredParcels: [],
  filters: {
    timeRange: 'all',
    parcelType: 'all',
    workflowStatus: 'all',
    region: 'all',
    province: 'all',
    city: 'all'
  },
  selectedParcel: null,
  selectedParcelDetails: null,
  csvData: null,
  locationData: null,
  customParcelTypes: []
};

// Reducer function
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_DATA:
      return { ...state, data: action.payload };
    case ACTION_TYPES.SET_MAP_DATA:
      return { ...state, mapData: action.payload };
    case ACTION_TYPES.SET_FILTER:
      return {
        ...state,
        filters: { ...state.filters, [action.filterType]: action.value }
      };
    case ACTION_TYPES.SET_FILTERED_PARCELS:
      return { ...state, filteredParcels: action.payload };
    case ACTION_TYPES.SET_SELECTED_PARCEL:
      return { ...state, selectedParcel: action.payload };
    case ACTION_TYPES.SET_SELECTED_PARCEL_DETAILS:
      return { ...state, selectedParcelDetails: action.payload };
    case ACTION_TYPES.SET_CSV_DATA:
      return { ...state, csvData: action.payload };
    case ACTION_TYPES.SET_LOCATION_DATA:
      return { ...state, locationData: action.payload };
    case ACTION_TYPES.SET_CUSTOM_PARCEL_TYPES:
      return { ...state, customParcelTypes: action.payload };
    default:
      return state;
  }
};

// Debounce helper function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Main component
const ParcelDashboard = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Memoized API calls
  const fetchData = useCallback(async () => {
    try {
      const { data: dashboardData } = await api.get('/parcel/parcel-dashboard/', {
        params: state.filters
      });
      
      dispatch({ type: ACTION_TYPES.SET_DATA, payload: dashboardData });
      dispatch({ type: ACTION_TYPES.SET_MAP_DATA, payload: dashboardData.parcels });
      dispatch({ type: ACTION_TYPES.SET_FILTERED_PARCELS, payload: dashboardData.parcels });
      dispatch({ type: ACTION_TYPES.SET_LOCATION_DATA, payload: dashboardData.location_data });
      dispatch({ type: ACTION_TYPES.SET_CUSTOM_PARCEL_TYPES, payload: dashboardData.custom_parcel_types });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [state.filters]);

  const fetchParcelDetails = useCallback(async (parcelId) => {
    try {
      const { data } = await api.get(`/parcel/parcel-detail/${parcelId}/`);
      return data;
    } catch (error) {
      console.error('Error fetching parcel details:', error);
      return null;
    }
  }, []);

  // Filter handler with debounce
  const handleFilterChange = useCallback(
    debounce((filterType, value) => {
      dispatch({ type: ACTION_TYPES.SET_FILTER, filterType, value });
    }, 300),
    []
  );

  // Memoized filter function
  const filterParcels = useCallback(() => {
    const filteredParcels = state.mapData.filter(parcel => 
      Object.entries(state.filters).every(([key, value]) => {
        if (value === 'all') return true;
        if (key === 'workflowStatus') {
          return parcel.workflows.some(workflow => 
            (value === 'ongoing' && workflow.state !== 'completed') ||
            (value === 'completed' && workflow.state === 'completed')
          );
        }
        return parcel[key] === value;
      })
    );
    dispatch({ type: ACTION_TYPES.SET_FILTERED_PARCELS, payload: filteredParcels });
  }, [state.mapData, state.filters]);

  // Effects
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    filterParcels();
  }, [filterParcels, state.filters]);
  let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
  
  L.Marker.prototype.options.icon = DefaultIcon;
  
  // Memoized handlers
  const handleParcelSelect = useCallback(async (parcel) => {
    dispatch({ type: ACTION_TYPES.SET_SELECTED_PARCEL, payload: parcel });
    const details = await fetchParcelDetails(parcel.id);
    if (details) {
      dispatch({ type: ACTION_TYPES.SET_SELECTED_PARCEL_DETAILS, payload: details });
    }
  }, [fetchParcelDetails]);

  const handleSearch = useCallback((searchTerm) => {
    const searchedParcels = state.mapData.filter(parcel => {
      const matchesSearch = parcel.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilters = Object.entries(state.filters).every(([key, value]) => {
        if (value === 'all') return true;
        if (key === 'workflowStatus') {
          return parcel.workflows.some(workflow => 
            (value === 'ongoing' && workflow.state !== 'completed') ||
            (value === 'completed' && workflow.state === 'completed')
          );
        }
        return parcel[key] === value;
      });
      return matchesSearch && matchesFilters;
    });
    
    dispatch({ type: ACTION_TYPES.SET_FILTERED_PARCELS, payload: searchedParcels });
    
    if (searchedParcels.length > 0) {
      handleParcelSelect(searchedParcels[0]);
    } else {
      alert(intl.formatMessage({ id: "noMatchingParcels" }));
      dispatch({ type: ACTION_TYPES.SET_SELECTED_PARCEL, payload: null });
      dispatch({ type: ACTION_TYPES.SET_SELECTED_PARCEL_DETAILS, payload: null });
    }
  }, [state.mapData, state.filters, handleParcelSelect]);

  // Memoized components and sections (rest of the code remains the same)
  const ParcelTypesPieChart = useMemo(() => {
    if (!state.data?.parcel_types?.length) {
      return <div>{intl.formatMessage({ id: "noDataAvailable" })}</div>;
    }

    const parcelTypeMap = new Map();
    state.data.parcel_types.forEach(({ parcel_type, count }) => {
      const name = intl.formatMessage({ id: parcel_type }) || parcel_type;
      parcelTypeMap.set(name, { name, value: count });
    });

    state.customParcelTypes.forEach(type => {
      const name = intl.formatMessage({ id: type }) || type;
      if (!parcelTypeMap.has(name)) {
        parcelTypeMap.set(name, { name, value: 0 });
      }
    });

    const chartData = Array.from(parcelTypeMap.values());
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];

    return (
      <ResponsiveContainer width="100%" height={290}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }, [state.data?.parcel_types, state.customParcelTypes]);
  const convertToPDF = useCallback((data) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
  
    pdf.setFontSize(14);
    pdf.setTextColor(40);
    pdf.text(intl.formatMessage({ id: "parcelDataReport" }), pageWidth / 2, 10, { align: 'center' });
  
    pdf.setFontSize(8);
    pdf.setTextColor(100);
    const date = new Date().toLocaleString();
    pdf.text(intl.formatMessage({ id: "generatedOn" }, { date }), pageWidth - 10, 6, { align: 'right' });
  
    const columns = [
      { header: intl.formatMessage({ id: "id" }), dataKey: 'id' },
      { header: intl.formatMessage({ id: "landRef" }), dataKey: 'land_ref' },
      { header: intl.formatMessage({ id: "type" }), dataKey: 'type' },
      { header: intl.formatMessage({ id: "name" }), dataKey: 'name' },
      { header: intl.formatMessage({ id: "city" }), dataKey: 'city' },
      { header: intl.formatMessage({ id: "situation" }), dataKey: 'situation' },
      { header: intl.formatMessage({ id: "area" }), dataKey: 'area' },
      { header: intl.formatMessage({ id: "price" }), dataKey: 'price' },
      { header: intl.formatMessage({ id: "totalValue" }), dataKey: 'total_value' },
      { header: intl.formatMessage({ id: "proprietaire" }), dataKey: 'proprietaire' }
    ];
  
    const tableData = data.map(parcel => ({
      id: parcel.id || '',
      land_ref: parcel.land_reference || '',
      type: parcel.type || '',
      name: parcel.name || '',
      city: parcel.city || '',
      situation: parcel.situation || '',
      area: parcel.area || '',
      price: parcel.price || '',
      total_value: parcel.total_price || '',
      proprietaire: parcel.proprietaire || ''
    }));
  
    const tableWidth = 195;
    const startX = (pageWidth - tableWidth) / 2;
  
    pdf.autoTable({
      columns: columns,
      body: tableData,
      startY: 15,
      margin: { left: startX },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fontSize: 7,
        cellPadding: 2,
        halign: 'center'
      },
      bodyStyles: {
        textColor: 20,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fontSize: 7,
        cellPadding: 2,
        halign: 'center'
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: {
        id: { cellWidth: 13 },
        land_ref: { cellWidth: 19 },
        type: { cellWidth: 16 },
        name: { cellWidth: 26 },
        city: { cellWidth: 21 },
        situation: { cellWidth: 21 },
        area: { cellWidth: 16 },
        price: { cellWidth: 16 },
        total_value: { cellWidth: 21 },
        proprietaire: { cellWidth: 26 }
      },
      styles: {
        font: 'helvetica',
        overflow: 'linebreak',
        halign: 'center'
      },
      didDrawCell: function(data) {
        if (data.section === 'body') {
          var doc = data.doc;
          var cell = data.cell;
          doc.setDrawColor(180);
          doc.rect(cell.x, cell.y, cell.width, cell.height);
        }
      },
      didDrawPage: function (data) {
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(
          intl.formatMessage({ id: "page" }, { current: data.pageNumber, total: pdf.internal.getNumberOfPages() }),
          pageWidth / 2,
          pageHeight - 7,
          { align: 'center' }
        );
      }
    });
  
    return pdf;
  }, []);
  
  // Add prepareExport function
  const prepareExport = useCallback(async () => {
    try {
      // Show loading state
      dispatch({ type: ACTION_TYPES.SET_CSV_DATA, payload: null });
      
      // Fetch filtered data
      const { data: filteredData } = await api.get('/parcel/parcel-dashboard/', {
        params: state.filters
      });
      
      // Get detailed data for each parcel
      const detailedParcels = await Promise.all(
        filteredData.parcels.map(async (parcel) => {
          const details = await fetchParcelDetails(parcel.id);
          return { ...parcel, ...details };
        })
      );
  
      // Generate PDF
      const pdf = convertToPDF(detailedParcels);
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      // Update state with PDF URL
      dispatch({ type: ACTION_TYPES.SET_CSV_DATA, payload: url });
    } catch (error) {
      console.error('Error preparing export:', error);
      alert(intl.formatMessage({ id: "exportError" }));
    }
  }, [state.filters, fetchParcelDetails, convertToPDF]);

  const WorkflowStatusChart = useMemo(() => {
    if (!state.data || !state.data.workflow_status) {
      return <div>{intl.formatMessage({ id: "noDataAvailable" })}</div>;
    }

    const chartData = Object.entries(state.data.workflow_status).map(([workflowName, statuses]) => {
      const ongoingCount = statuses.reduce((sum, status) => 
        status.state !== 'completed' ? sum + status.count : sum, 0);
      const completedCount = statuses.find(s => s.state === 'completed')?.count || 0;

      return {
        name: intl.formatMessage({ id: workflowName }) || workflowName,
        [intl.formatMessage({ id: 'ongoing' })]: ongoingCount,
        [intl.formatMessage({ id: 'completed' })]: completedCount
      };
    });

    return (
      <ResponsiveContainer width="100%" height={290}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={intl.formatMessage({ id: 'ongoing' })} fill="#82ca9d" />
          <Bar dataKey={intl.formatMessage({ id: 'completed' })} fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  }, [state.data]);

  const TotalAreaSection = useMemo(() => {
    return (
      <div className="flex justify-between items-center">
        <div className="text-lg">{intl.formatMessage({ id: "totalParcelArea" })}</div>
        <p className="text-2xl font-bold">{state.data?.total_area?.toLocaleString()} m²</p>
      </div>
    );
  }, [state.data]);

  const MemoizedInteractiveMap = useMemo(() => {
    const mapKey = state.filteredParcels.map(p => p.id).join(',');

    return (
      <div className="map-container" style={{ width: '100%', height: '500px', position: 'relative', zIndex: 1 }}>
        <MapContainer
          key={mapKey}
          scrollWheelZoom={true}
          center={[25.4050,-14.5598]}
          zoom={6}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            padding: '1rem'
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {state.filteredParcels.map((parcel) => (
            <Marker
              key={parcel.id}
              position={parcel.coordinates}
              eventHandlers={{
                click: () => handleParcelSelect(parcel),
              }}
            >
              <Popup>
                <h3>{parcel.name}</h3>
                <p>{intl.formatMessage({ id: "type" })}: {intl.formatMessage({ id: parcel.type }) || parcel.type}</p>
                <p>{intl.formatMessage({ id: "area" })}: {parcel.area} m²</p>
                <h4>{intl.formatMessage({ id: "workflows" })}:</h4>
                <ul>
                  {parcel.workflows.map((workflow, index) => (
                    <li key={index}>{intl.formatMessage({ id: workflow.type }) || workflow.type}: {intl.formatMessage({ id: workflow.state }) || workflow.state}</li>
                  ))}
                </ul>
              </Popup>
            </Marker>
          ))}
          <MapControl searchedParcel={state.selectedParcel} />
        </MapContainer>
      </div>
    );
  }, [state.filteredParcels, state.selectedParcel, handleParcelSelect]);

  const ParcelInfoSection = useMemo(() => {
    const InfoItem = ({ icon, label, value }) => (
      <div className="flex items-center p-2 rounded-lg shadow-sm">
        {icon}
        <div className="ml-3">
          <p className="text-xs text-gray-500">{intl.formatMessage({ id: label })}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </div>
    );
  
    return (
      <Card className="flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-lg flex items-center gap-2">
            {intl.formatMessage({ id: "parcelInfo" })}
            {!state.selectedParcelDetails && (
              <span className="text-sm font-normal text-gray-500">
                {intl.formatMessage({ id: "clickParcelForDetails" })}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 overflow-y-auto flex-grow">
          {state.selectedParcelDetails ? (
            <div className="grid grid-cols-2 gap-4 pr-2">
              <InfoItem
                icon={<Building className="h-5 w-5 text-blue-500" />}
                label="type"
                value={intl.formatMessage({ id: state.selectedParcelDetails.type }) || state.selectedParcelDetails.type}
              />
              <InfoItem
                icon={<Square className="h-5 w-5 text-green-500" />}
                label="area"
                value={`${state.selectedParcelDetails.area} m²`}
              />
              <InfoItem
                icon={<MapPin className="h-5 w-5 text-red-500" />}
                label="region"
                value={state.selectedParcelDetails.region}
              />
              <InfoItem
                icon={<MapPin className="h-5 w-5 text-orange-500" />}
                label="province"
                value={state.selectedParcelDetails.province}
              />
              <InfoItem
                icon={<MapPin className="h-5 w-5 text-yellow-500" />}
                label="city"
                value={state.selectedParcelDetails.city}
              />
              <InfoItem
                icon={<GitBranch className="h-5 w-5 text-indigo-500" />}
                label="landReference"
                value={state.selectedParcelDetails.land_reference}
              />
              <InfoItem
                icon={<GitBranch className="h-5 w-5 text-purple-500" />}
                label="situation"
                value={state.selectedParcelDetails.situation}
              />
            </div>
          ) : (
            <p>{intl.formatMessage({ id: "selectParcelOnMap" })}</p>
          )}
        </CardContent>
      </Card>
    );
  }, [state.selectedParcelDetails]);

  const LocationFilters = useMemo(() => (
    <>
      <Select 
        value={state.filters.region} 
        onValueChange={(value) => dispatch({ type: 'SET_FILTER', filterType: 'region', value })}
      >
        <SelectTrigger className="z-10">
          <SelectValue placeholder={intl.formatMessage({ id: "region" })} />
        </SelectTrigger>
        <SelectContent className="z-50">
          <SelectItem value="all">{intl.formatMessage({ id: "allRegions" })}</SelectItem>
          {state.locationData?.regions.map(region => (
            <SelectItem key={region.id} value={region.id.toString()}>{region.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select 
        value={state.filters.province} 
        onValueChange={(value) => dispatch({ type: 'SET_FILTER', filterType: 'province', value })}
      >
        <SelectTrigger className="z-10">
          <SelectValue placeholder={intl.formatMessage({ id: "province" })} />
        </SelectTrigger>
        <SelectContent className="z-50">
          <SelectItem value="all">{intl.formatMessage({ id: "allProvinces" })}</SelectItem>
          {state.locationData?.provinces
            .filter(province => state.filters.region === 'all' || province.region_id.toString() === state.filters.region)
            .map(province => (
              <SelectItem key={province.id} value={province.id.toString()}>{province.name}</SelectItem>
            ))
          }
        </SelectContent>
      </Select>
      <Select 
        value={state.filters.city} 
        onValueChange={(value) => dispatch({ type: 'SET_FILTER', filterType: 'city', value })}
      >
        <SelectTrigger className="z-10">
          <SelectValue placeholder={intl.formatMessage({ id: "city" })} />
        </SelectTrigger>
        <SelectContent className="z-50">
          <SelectItem value="all">{intl.formatMessage({ id: "allCities" })}</SelectItem>
          {state.locationData?.cities
            .filter(city => 
              (state.filters.province === 'all' || city.province_id.toString() === state.filters.province) &&
              (state.filters.region === 'all' || state.locationData.provinces.find(p => p.id.toString() === state.filters.province)?.region_id.toString() === state.filters.region)
            )
            .map(city => (
              <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>
            ))
          }
        </SelectContent>
      </Select>
    </>
  ), [state.filters, state.locationData]);

  const ParcelTypeFilter = useMemo(() => (
    <Select 
      value={state.filters.parcelType} 
      onValueChange={(value) => dispatch({ type: 'SET_FILTER', filterType: 'parcelType', value })}
    >
      <SelectTrigger className="z-10">
        <SelectValue placeholder={intl.formatMessage({ id: "parcelType" })} />
      </SelectTrigger>
      <SelectContent className="z-50">
        <SelectItem value="all">{intl.formatMessage({ id: "allTypes" })}</SelectItem>
        <SelectItem value="bare land">{intl.formatMessage({ id: "bareLand" })}</SelectItem>
        <SelectItem value="service station">{intl.formatMessage({ id: "serviceStation" })}</SelectItem>
        <SelectItem value="building">{intl.formatMessage({ id: "building" })}</SelectItem>
        <SelectItem value="warehouse">{intl.formatMessage({ id: "warehouse" })}</SelectItem>
        <SelectItem value="fishing supply point">{intl.formatMessage({ id: "fishingSupplyPoint" })}</SelectItem>
        {state.customParcelTypes.map((type) => (
          <SelectItem key={type} value={type}>{intl.formatMessage({ id: type }) || type}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  ), [state.filters.parcelType, state.customParcelTypes]);
  
  if (!state.data) {
    return <div>{intl.formatMessage({ id: "loading" })}</div>;
  }

  return (
    <div className="p-2 relative">
      <style jsx global>{`
        .map-container {
          z-index: 1;
        }
        .z-50 {
          z-index: 50 !important;
        }
      `}</style>
      <div>
        <h1 className="text-xl md:text-2xl font-bold">{intl.formatMessage({ id: "parcelManagementDashboard" })}</h1>
      </div>
      <div className="flex justify-between items-center my-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm hidden md:block">
            {intl.formatMessage({ id: "lastUpdated" })}: {new Date(state.data.lastUpdated).toLocaleString()}
          </p>
          <Button onClick={fetchData} size="sm" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> {intl.formatMessage({ id: "refresh" })}
          </Button>
          <Button onClick={prepareExport} size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" /> {intl.formatMessage({ id: "export" })}
          </Button>

        </div>
      </div>

      {state.csvData && (
        <div className="mb-4">
          <a href={state.csvData} download="parcel_data.pdf" className="text-blue-500 underline text-sm"
             onClick={() => URL.revokeObjectURL(state.csvData)}>
            {intl.formatMessage({ id: "downloadPDF" })}
          </a>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
        <Select 
          value={state.filters.timeRange} 
          onValueChange={(value) => dispatch({ type: 'SET_FILTER', filterType: 'timeRange', value })}
        >
          <SelectTrigger className="z-10">
            <SelectValue placeholder={intl.formatMessage({ id: "timeRange" })} />
          </SelectTrigger>
          <SelectContent className="z-50">
            <SelectItem value="all">{intl.formatMessage({ id: "allTime" })}</SelectItem>
            <SelectItem value="month">{intl.formatMessage({ id: "thisMonth" })}</SelectItem>
            <SelectItem value="year">{intl.formatMessage({ id: "thisYear" })}</SelectItem>
          </SelectContent>
        </Select>
        {ParcelTypeFilter}
        <Select 
          value={state.filters.workflowStatus} 
          onValueChange={(value) => dispatch({ type: 'SET_FILTER', filterType: 'workflowStatus', value })}
        >
          <SelectTrigger className="z-10">
            <SelectValue placeholder={intl.formatMessage({ id: "workflowStatus" })} />
          </SelectTrigger>
          <SelectContent className="z-50">
            <SelectItem value="all">{intl.formatMessage({ id: "allStatuses" })}</SelectItem>
            <SelectItem value="ongoing">{intl.formatMessage({ id: "ongoing" })}</SelectItem>
            <SelectItem value="completed">{intl.formatMessage({ id: "completed" })}</SelectItem>
          </SelectContent>
        </Select>
        {LocationFilters}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-9 gap-4"><Card className="md:col-span-3 h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{intl.formatMessage({ id: "parcelTypes" })}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {ParcelTypesPieChart}
          </CardContent>
        </Card>
        <Card className="md:col-span-3 h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{intl.formatMessage({ id: "workflowStatus" })}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {WorkflowStatusChart}
          </CardContent>
        </Card>

        <div className="lg:col-span-3 md:col-span-6 md:row-span-12 h-[620px]">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{TotalAreaSection}</CardTitle>
              <SearchInput onSearch={handleSearch} />
            </CardHeader>
            <CardContent className="pt-0">
              {MemoizedInteractiveMap}
            </CardContent>
          </Card>
        </div>

        <div className='md:col-span-6 gap-4 w-auto'>
          {ParcelInfoSection}



          
        </div>
        
      </div>
      <div>
      <p>{intl.formatMessage({ id: "showingParcels" }, { count: state.filteredParcels.length })}</p>

      </div>
    </div>
  );
};

export default memo(ParcelDashboard);