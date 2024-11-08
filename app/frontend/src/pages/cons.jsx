import ParcelC from "./parcel/parcelcreate"
import { MapContainer, TileLayer,Popup ,Marker} from 'react-leaflet'


const Cons = () =>{
    return (
 
            <>
            <div className="p-4">
            <h3 className="scroll-m-20 text-bg  md:text-xl lg:text-xl font-semibold tracking-tight">
                Create New Parcel
            </h3>
        
          
            
 <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2 gap-4 ">
    
              <ParcelC/>
      
          </div>
          </div>

            </>
      
    )
}

export default Cons