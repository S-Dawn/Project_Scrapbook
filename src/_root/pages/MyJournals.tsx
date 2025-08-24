import { Link, useNavigate } from "react-router-dom";
import { Models } from "appwrite";

import { Button } from "@/components/ui";
import { Loader, JournalCard } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserJournals, useDeletePost } from "@/lib/react-query/queries";
import { useToast } from "@/components/ui/use-toast";

const MyJournals = () => {
  const { user, isLoading: isUserLoading, isAuthenticated } = useUserContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: userJournals, isLoading } = useGetUserJournals(user.id);
  const { mutate: deletePost } = useDeletePost();

  const handleEdit = (journalId: string) => {
    navigate(`/update-journal/${journalId}`);
  };

  const handleDelete = (journalId: string, imageId: string) => {
    deletePost({ postId: journalId, imageId });
    toast({
      title: "Journal deleted successfully",
    });
  };

  // Show loading if user context is still loading
  if (isUserLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isAuthenticated) {
    navigate('/sign-in');
    return null;
  }

  // Show loading if journals are being fetched
  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="common-container">
      <div className="flex-between w-full max-w-5xl">
        <div className="flex gap-2 items-center">
          <img
            src="/assets/icons/posts.svg"
            width={36}
            height={36}
            alt="journals"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">My Travel Journals</h2>
        </div>
        
        <Link to="/create-journal">
          <Button className="shad-button_primary">
            <img 
              src="/assets/icons/gallery-add.svg" 
              alt="add" 
              width={20} 
              height={20}
              className="invert-white mr-2"
            />
            Create New Journal
          </Button>
        </Link>
      </div>      <div className="w-full max-w-5xl mt-8">
        {!userJournals || userJournals.documents.length === 0 ? (
          <div className="flex-center flex-col gap-4 mt-10">
            <img
              src="/assets/icons/posts.svg"
              alt="no journals"
              width={80}
              height={80}
              className="opacity-50"
            />
            <p className="text-light-4 text-center">
              You haven't created any travel journals yet.
            </p>
            <p className="text-light-4 text-center text-sm">
              Start documenting your adventures by creating your first journal!
            </p>
            <Link to="/create-journal">
              <Button className="shad-button_primary mt-4">
                Create Your First Journal
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userJournals.documents.map((journal: Models.Document) => (
                <JournalCard
                  key={journal.$id}
                  journal={journal}
                  onEdit={() => handleEdit(journal.$id)}
                  onDelete={() => handleDelete(journal.$id, journal.imageId)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJournals;
