export const checkcoords = (coord, setCoordError, setNewCoords, setPosition) => {
    try {
      setCoordError('');
      const parsedCoord = JSON.parse(coord);
  
      const firstCoord = parsedCoord[0];
      const lastCoord = parsedCoord[parsedCoord.length - 1];
  
      if (firstCoord[0] !== lastCoord[0] || firstCoord[1] !== lastCoord[1]) {
        setCoordError('The polygon is not closed. The first and last coordinates must be the same.');
        return;
      }
  
      setNewCoords([]);
      setNewCoords(parsedCoord);
      setPosition(parsedCoord[0]);
      return ''; // No errors
    } catch (error) {
      setCoordError('Invalid coordinate format.');
      return;
    }
  };
  