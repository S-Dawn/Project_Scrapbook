import { useParams } from "react-router-dom";
import { useGetPostById } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import ActivityForm from "@/components/forms/ActivityForm";

const AddActivity = () => {
  const { journalId } = useParams();
  const { data: journal, isLoading } = useGetPostById(journalId);

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="flex-center w-full h-full">
        <div className="text-center">
          <h2 className="h2-bold text-light-1 mb-4">Journal not found</h2>
          <p className="text-light-3">The journal you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/add-post.svg"
            width={36}
            height={36}
            alt="add"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Add Activity</h2>
        </div>

        <ActivityForm 
          journalId={journalId!} 
          journalTitle={journal.journalTitle} 
        />
      </div>
    </div>
  );
};

export default AddActivity;
