import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { Button } from "@/components/ui";
import { Loader, SmartImage, JournalFlowchart } from "@/components/shared";
import { GridPostList, PostStats } from "@/components/shared";

import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
  useGetJournalActivities,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

const JournalDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();
  const [activeTab, setActiveTab] = useState<'details' | 'flowchart' | 'activities'>('details');

  const { data: post, isLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator.$id
  );
  const { data: journalActivities, isLoading: isActivitiesLoading } = useGetJournalActivities(id);
  const { mutate: deletePost } = useDeletePost();

  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );

  const handleDeletePost = () => {
    deletePost({ postId: id, imageId: post?.imageId });
    navigate(-1);
  };

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <SmartImage
            src={post?.imageUrl}
            alt="journal image"
            imageId={post?.imageId}
            className="post_details-img"
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post?.creator.$id}`}
                className="flex items-center gap-3">
                <SmartImage
                  src={post?.creator.imageUrl}
                  alt="creator"
                  imageId={post?.creator.imageId}
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                  fallbackSrc="/assets/icons/profile-placeholder.svg"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator.name}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular ">
                      {multiFormatDateString(post?.$createdAt)}
                    </p>
                    •
                    <p className="subtle-semibold lg:small-regular">
                      {post?.location}
                    </p>
                  </div>
                </div>
              </Link>              <div className="flex-center gap-4">
                <Link
                  to={`/add-activity/${post?.$id}`}
                  className={`${user.id !== post?.creator.$id && "hidden"}`}>
                  <img
                    src={"/assets/icons/add-post.svg"}
                    alt="add activity"
                    width={24}
                    height={24}
                  />
                </Link>

                <Link
                  to={`/update-journal/${post?.$id}`}
                  className={`${user.id !== post?.creator.$id && "hidden"}`}>
                  <img
                    src={"/assets/icons/edit.svg"}
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`post_details-delete_btn ${
                    user.id !== post?.creator.$id && "hidden"
                  }`}>
                  <img
                    src={"/assets/icons/delete.svg"}
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>

            {/* Journal specific information */}
            <div className="flex flex-col gap-4 w-full">
              {post?.journalTitle && (
                <h1 className="h3-bold lg:h2-bold text-light-1">
                  {post.journalTitle}
                </h1>
              )}
              
              <div className="flex flex-wrap gap-4 text-light-3">
                {post?.source && post?.destination && (
                  <div className="flex items-center gap-2">
                    <img
                      src="/assets/icons/wallpaper.svg"
                      alt="route"
                      width={16}
                      height={16}
                    />
                    <span className="small-medium">
                      {post.source} → {post.destination}
                    </span>
                  </div>
                )}
                
                {post?.duration && (
                  <div className="flex items-center gap-2">
                    <img
                      src="/assets/icons/home.svg"
                      alt="duration"
                      width={16}
                      height={16}
                    />
                    <span className="small-medium">{post.duration}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 w-full border-b border-dark-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-light-4 hover:text-light-2'
                }`}>
                Details
              </button>
              <button
                onClick={() => setActiveTab('flowchart')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'flowchart'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-light-4 hover:text-light-2'
                }`}>
                Journey Flowchart
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'activities'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-light-4 hover:text-light-2'
                }`}>
                Activities ({journalActivities?.documents?.length || 0})
              </button>
            </div>

            {/* Tab Content */}
            <div className="w-full">
              {activeTab === 'details' && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
                    <p>{post?.caption}</p>
                    <ul className="flex gap-1 mt-2">
                      {post?.tags.map((tag: string, index: string) => (
                        <li
                          key={`${tag}${index}`}
                          className="text-light-3 small-regular">
                          #{tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <PostStats post={post} userId={user.id} />
                </div>
              )}

              {activeTab === 'flowchart' && (
                <div className="py-4">
                  {isActivitiesLoading ? (
                    <Loader />
                  ) : (
                    <JournalFlowchart
                      activities={journalActivities?.documents || []}
                      journalTitle={post?.journalTitle}
                      source={post?.source}
                      destination={post?.destination}
                    />
                  )}
                </div>
              )}

              {activeTab === 'activities' && (
                <div className="py-4">
                  {isActivitiesLoading ? (
                    <Loader />
                  ) : journalActivities?.documents && journalActivities.documents.length > 0 ? (
                    <GridPostList posts={journalActivities.documents} />
                  ) : (
                    <div className="flex flex-col items-center py-8">
                      <img
                        src="/assets/icons/posts.svg"
                        alt="no activities"
                        width={48}
                        height={48}
                        className="opacity-50"
                      />
                      <h3 className="h3-bold text-light-2 mt-4">No Activities Yet</h3>
                      <p className="body-medium text-light-4 mt-2 text-center">
                        Add daily activities to this journal to see them here
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Journals from {post?.creator.name}
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default JournalDetails;
