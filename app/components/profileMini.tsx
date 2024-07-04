import React from "react";
import { Avatar } from "./avatar";

interface ProfileMiniProps {
  avatar: string;
  username: string;
  logout: React.ReactNode;
}

const ProfileMini = ({ avatar, username, logout }: ProfileMiniProps) => {
  return (
    <div className="max-w-[300px] shadow-inner flex items-center justify-center space-x-4 border-4 p-4 border-coral bg-mardi rounded-lg">
      <Avatar src={avatar} />
      <aside className="flex flex-col justify-start items-center">
        <p className="text-white text-lg font-semibold">{username}</p>
        {logout}
      </aside>
    </div>
  );
};

export default ProfileMini;
