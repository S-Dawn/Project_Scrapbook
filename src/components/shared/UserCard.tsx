import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { Button } from "../ui/button";
import { SmartImage } from "@/components/shared";

type UserCardProps = {
  user: Models.Document;
};

const UserCard = ({ user }: UserCardProps) => {  return (
    <Link to={`/profile/${user.$id}`} className="user-card">
      <SmartImage
        src={user.imageUrl}
        alt="creator"
        imageId={user.imageId}
        className="rounded-full w-14 h-14"
        fallbackSrc="/assets/icons/profile-placeholder.svg"
      />

      <div className="flex-center flex-col gap-1">
        <p className="base-medium text-light-1 text-center line-clamp-1">
          {user.name}
        </p>
        <p className="small-regular text-light-3 text-center line-clamp-1">
          @{user.username}
        </p>
      </div>      <Button type="button" size="sm" className="shad-button_primary px-5">
        Connect
      </Button>
    </Link>
  );
};

export default UserCard;
