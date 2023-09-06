import { useState } from 'react';

export const useGlobal = () => {
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState({});
  const [user, setUser] = useState({});



  return {
    roleModalOpen,
    currentRole,
    user,
    setUser,
    setRoleModalOpen,
    setCurrentRole,
  };
};
