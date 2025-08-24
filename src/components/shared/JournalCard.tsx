import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
import { multiFormatDateString } from "@/lib/utils";
import { SmartImage } from "@/components/shared";

type JournalCardProps = {
  journal: Models.Document;
  onEdit?: () => void;
  onDelete?: () => void;
};

const JournalCard = ({ journal, onEdit, onDelete }: JournalCardProps) => {
  return (    <div className="bg-dark-2 rounded-xl p-4 border border-dark-4 hover:border-dark-3 transition-colors">
      <Link to={`/journal/${journal.$id}`}>
        <SmartImage
          src={journal.imageUrl}
          alt="journal cover"
          imageId={journal.imageId}
          className="w-full h-48 object-cover rounded-lg mb-4"
          fallbackSrc="/assets/icons/profile-placeholder.svg"
        />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-light-1 line-clamp-2">
            {journal.journalTitle || journal.caption}
          </h3>
          
          {(journal.source || journal.destination) && (
            <div className="flex items-center gap-2 text-light-3 text-sm">
              <img
                src="/assets/icons/wallpaper.svg"
                alt="route"
                width={16}
                height={16}
              />
              <span>{journal.source || "Unknown"}</span>
              <span>→</span>
              <span>{journal.destination || "Travel"}</span>
            </div>
          )}
          
          <div className="flex items-center gap-4 text-light-3 text-sm">
            {journal.dayNumber && (
              <div className="flex items-center gap-1">
                <img
                  src="/assets/icons/posts.svg"
                  alt="day"
                  width={14}
                  height={14}
                />
                <span>Day {journal.dayNumber}</span>
              </div>
            )}
            {journal.duration && (
              <div className="flex items-center gap-1">
                <img
                  src="/assets/icons/home.svg"
                  alt="duration"
                  width={14}
                  height={14}
                />
                <span>{journal.duration}</span>
              </div>
            )}
          </div>
          
          <p className="text-light-4 text-sm line-clamp-3">
            {journal.caption}
          </p>
          
          <div className="flex items-center gap-2 text-light-3 text-xs">
            <img
              src="/assets/icons/home.svg"
              alt="created"
              width={12}
              height={12}
            />
            <span>{multiFormatDateString(journal.$createdAt)}</span>
          </div>
        </div>
      </Link>
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-dark-4">
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <img
                src="/assets/icons/edit.svg"
                alt="edit"
                width={16}
                height={16}
                className="invert-white"
              />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <img
                src="/assets/icons/delete.svg"
                alt="delete"
                width={16}
                height={16}
                className="invert-white"
              />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-light-3 text-sm">
          <img
            src="/assets/icons/like.svg"
            alt="likes"
            width={16}
            height={16}
          />
          <span>{journal.likes?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default JournalCard;
