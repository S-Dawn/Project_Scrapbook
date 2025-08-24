import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { PostStats, SmartImage } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

type PostCardProps = {
  post: Models.Document;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();

  if (!post.creator) return;

  const isJournal = post.journalTitle || post.source || post.destination;
  const linkPath = isJournal ? `/journal/${post.$id}` : `/posts/${post.$id}`;
  const editPath = isJournal ? `/update-journal/${post.$id}` : `/update-post/${post.$id}`;

  return (
    <div className="post-card">
      <div className="flex-between">        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.creator.$id}`}>
            <SmartImage
              src={post.creator?.imageUrl}
              alt="creator"
              imageId={post.creator?.imageId}
              className="w-12 lg:h-12 rounded-full"
              fallbackSrc="/assets/icons/profile-placeholder.svg"
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {post.creator.name}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular ">
                {multiFormatDateString(post.$createdAt)}
              </p>
              •
              <p className="subtle-semibold lg:small-regular">
                {post.location}
              </p>
            </div>
          </div>
        </div>

        <Link
          to={editPath}
          className={`${user.id !== post.creator.$id && "hidden"}`}>
          <img
            src={"/assets/icons/edit.svg"}
            alt="edit"
            width={20}
            height={20}
          />
        </Link>
      </div>

      <Link to={linkPath}>
        <div className="small-medium lg:base-medium py-5">
          {/* Show journal title if it's a travel journal */}
          {post.journalTitle && (
            <h3 className="text-lg font-semibold text-light-1 mb-2">
              {post.journalTitle}
            </h3>
          )}
          
          {/* Show travel route if available */}
          {post.source && post.destination && (
            <div className="flex items-center gap-2 text-light-3 text-sm mb-3">
              <img
                src="/assets/icons/wallpaper.svg"
                alt="route"
                width={16}
                height={16}
              />
              <span>{post.source} → {post.destination}</span>
              {post.dayNumber && (
                <>
                  <span>•</span>
                  <span>Day {post.dayNumber}</span>
                </>
              )}
              {post.duration && (
                <>
                  <span>•</span>
                  <span>{post.duration}</span>
                </>
              )}
            </div>
          )}
          
          <p>{post.caption}</p>
          <ul className="flex gap-1 mt-2">
            {post.tags.map((tag: string, index: string) => (
              <li key={`${tag}${index}`} className="text-light-3 small-regular">
                #{tag}
              </li>
            ))}
          </ul>        </div>

        <SmartImage
          src={post.imageUrl}
          alt="post image"
          imageId={post.imageId}
          className="post-card_img"
        />
      </Link>

      <PostStats post={post} userId={user.id} />
    </div>
  );
};

export default PostCard;
