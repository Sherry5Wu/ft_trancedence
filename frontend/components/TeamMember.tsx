// /src/components/TeamMember.tsx

import React from 'react';

interface TeamMemberProps {
  name: string;
  role: string;
  profile42: string;
  github: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, role, profile42, github }) => {
  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold">{name}</h4>
      <p className="text-sm text-black">{role}</p>
      <p className="text-sm text-black">
        <a href={profile42} target="_blank" rel="noopener noreferrer" className="underline mr-1">
          42 Profile
        </a> | 
        <a href={github} target="_blank" rel="noopener noreferrer" className="underline ml-2">
          GitHub
        </a>
      </p>
    </div>
  );
};

export default TeamMember;
