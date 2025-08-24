import JournalForm from "@/components/forms/JournalForm";

const CreateJournal = () => {
  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          <img
            src="/assets/icons/gallery-add.svg"
            width={36}
            height={36}
            alt="add"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Create Travel Journal</h2>
        </div>

        <JournalForm action="Create" />
      </div>
    </div>
  );
};

export default CreateJournal;
