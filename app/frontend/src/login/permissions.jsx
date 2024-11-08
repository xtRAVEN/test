export const hasPermission = (requiredPermission) => {
    const permissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
    return permissions.includes(requiredPermission);
  };
  
  export const hasAnyPermission = (requiredPermissions) => {
    const permissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
    return requiredPermissions.some(perm => permissions.includes(perm));
  };
  