// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useUserContext } from '../context/UserContext';

// import ProfileIcon from '../assets/noun-profile-7808629.svg';
// import PlusIcon from '../assets/symbols/noun-plus-rounded-5432794.svg';
// import CheckIcon from '../assets/symbols/noun-check-rounded-5432747.svg';

// const UserProfileBadge: React.FC = () => {
//   const { user } = useUserContext();
//   const navigate = useNavigate();

//   const handleClick = () => {
//     if (!user) {
//       navigate('/login-player');
//     }
//   };

//   return (
//     <div className="relative w-16 h-16 cursor-pointer" onClick={handleClick}>
//       <img
//         src={user?.profilePic || ProfileIcon}
//         alt="User Profile"
//         className="w-full h-full rounded-full object-cover border border-gray-300"
//       />
//       <img
//         src={user ? CheckIcon : PlusIcon}
//         alt={user ? 'Confirmed' : 'Add User'}
//         className="absolute top-0 right-0 w-5 h-5"
//       />
//     </div>
//   );
// };

// export default UserProfileBadge;


// UserProfileBadge.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

import ProfileIcon from '../assets/noun-profile-7808629.svg';
import PlusIcon from '../assets/symbols/noun-plus-rounded-5432794.svg';
import CheckIcon from '../assets/symbols/noun-check-rounded-5432747.svg';

interface UserProfileBadgeProps {
  user: { photoUrl?: string } | null;
  onClick: () => void;
}

export const UserProfileBadge: React.FC<UserProfileBadgeProps> = ({ user, onClick }) => {
  return (
    <div className="relative w-12 h-12 cursor-pointer" onClick={onClick}>
      <img
        src={user?.photoUrl || ProfileIcon}
        alt="User Profile"
    className="w-full h-full rounded-full bg-white object-cover border border-black"
      />
      <img
        src={user ? CheckIcon : PlusIcon}
        alt={user ? 'Confirmed' : 'Add User'}
        className="absolute top-0 right-0 translate-x-1/4 w-5 h-5 bg-white rounded-full"
      />
    </div>
  );
};
