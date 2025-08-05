// UserProfileBadge.tsx
import React from 'react';
import ProfileIcon from '../assets/noun-profile-7808629.svg';
import PlusIcon from '../assets/symbols/noun-plus-rounded-5432794.svg';
import CheckIcon from '../assets/symbols/noun-check-rounded-5432747.svg';

interface UserProfileBadgeProps {
  user: { photo?: string; username?: string } | null;
  onClick?: () => void;
  disabled?: boolean;
}

export const UserProfileBadge: React.FC<UserProfileBadgeProps> = ({
  user,
  onClick,
  disabled = false,
}) => {
  const avatarSrc = user?.photo
    ? user.photo
    : user?.username
      ? `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(user.username)}`
      : ProfileIcon;

  return (
    <div
      className={`relative w-12 h-12 ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
      onClick={!disabled && onClick ? onClick : undefined}
    >
      <img
        src={avatarSrc}
        alt="User Profile"
        className="w-full h-full rounded-full bg-white object-cover border border-black"
      />
      {!disabled && (
        <img
          src={user ? CheckIcon : PlusIcon}
          alt={user ? 'Confirmed' : 'Add User'}
          className="absolute top-0 right-0 translate-x-1/4 w-5 h-5 bg-white rounded-full"
        />
      )}
    </div>
  );
};

// encodeURIComponent ensures the username works safely in URLs.
// The priority is:
// photoUrl
// username → DiceBear
// Static ProfileIcon