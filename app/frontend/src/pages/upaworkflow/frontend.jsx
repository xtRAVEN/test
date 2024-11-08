import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from '@/login/api';

function Frontenddd() {
    const [parcels, setParcels] = useState([]);
    const [selectedParcel, setSelectedParcel] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        // Fetch parcels data from the API
        api.get('/parcel/parcelall/')
            .then(response => {
                // Assuming the API returns an array of parcels
                setParcels(response.data);
            })
            .catch(error => {
                console.error("Error fetching parcels:", error);
            });
    }, []);

    // Handle parcel selection and navigation
    const handleParcelSelect = (value) => {
        setSelectedParcel(value); // Update the selected parcel state
        console.log("Selected parcel:", value);
        if (value) {
            navigate(`/urban_autorisation/${value}/`); // Navigate to the selected parcel URL
        }
    };

    return (
        <>
            <div className="p-4">
                <h3 className="scroll-m-20 text-bg md:text-xl lg:text-xl font-semibold tracking-tight">
                Autorisation d'urbanisme Workflow
                </h3>
            </div>
            <div className="flex items-center justify-center">
                <div className="grid grid-cols-1 gap-4 p-4">
                    <div className='my-2'>
                        <Select onValueChange={handleParcelSelect}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a Parcel to start combustible workflow" />
                            </SelectTrigger>
                            <SelectContent>
                                {/* Dynamically render parcels */}
                                {parcels.map((parcel) => (
                                    <SelectItem key={parcel.id} value={parcel.id}>
                                        {parcel.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Frontenddd;
