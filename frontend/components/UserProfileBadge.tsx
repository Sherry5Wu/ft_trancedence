// UserProfileBadge.tsx

// encodeURIComponent ensures the username works safely in URLs.
// The priority is:
// photoUrl
// username → DiceBear
// Static ProfileIcon

import React from 'react';
import ProfileIcon from '../assets/icons/profile-icon.svg';
import PlusIcon from '../assets/icons/symbols/plus-rounded.svg';
import CheckIcon from '../assets/icons/symbols/check-rounded.svg';
import { DEFAULT_AVATAR } from '../utils/constants';

interface UserProfileBadgeProps {
  user: { photo?: string; username?: string } | null;
  onClick?: () => void;
  disabled?: boolean;
  alwaysShowPlus?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const UserProfileBadge: React.FC<UserProfileBadgeProps> = ({
  user,
  onClick,
  disabled = false,
  alwaysShowPlus = false,
  size = 'md',
}) => {
  const avatarSrc = user?.photo
    ? user.photo
    : user?.username
      ? `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(user.username)}&backgroundColor=ffee8c,ffcc00,fdfbd4,2e6f40,cd1c18,272757,b5c7eb,4682b4&textColor=000000`
      : ProfileIcon;
  
  const sizeClasses = {
    sm: {
      container: 'w-16 h-16',
      icon: 'w-6 h-6',
    },
    md: {
      container: 'w-20 h-20',
      icon: 'w-8 h-8',
    },
    lg: {
      container: 'w-32 h-32',
      icon: 'w-10 h-10',
    },
  };

  const selectedSize = sizeClasses[size];

  return (
    <div className={`relative ${selectedSize.container}`}>
      <img
        src={avatarSrc}
        alt="User Profile"
        className="w-full h-full rounded-full bg-white object-cover border-3 border-black"
      />

      {!disabled && (
        <button
          type="button"
          onClick={onClick}
          className={`absolute top-0 right-0 translate-x-1/4 bg-white rounded-full flex items-center justify-center p-1 cursor-pointer ${selectedSize.icon}`}
        >
          <img
            src={alwaysShowPlus || !user ? PlusIcon : CheckIcon}
            alt="Action Icon"
            className="w-full h-full"
          />
        </button>
      )}
    </div>
  );
};
