import * as z from "zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { FileUploader, Loader } from "@/components/shared";
import { useCreatePost } from "@/lib/react-query/queries";

const ActivityValidation = z.object({
  caption: z.string().min(5, { message: "Minimum 5 characters." }).max(2200, { message: "Maximum 2,200 characters" }),
  file: z.custom<File[]>(),
  location: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
  dayNumber: z.string().min(1, { message: "Day number is required" }),
  activityDate: z.string().min(1, { message: "Activity date is required" }),
  tags: z.string(),
});

type ActivityFormProps = {
  journalId: string;
  journalTitle?: string;
  onSuccess?: () => void;
};

const ActivityForm = ({ journalId, journalTitle, onSuccess }: ActivityFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();

  const form = useForm<z.infer<typeof ActivityValidation>>({
    resolver: zodResolver(ActivityValidation),
    defaultValues: {
      caption: "",
      file: [],
      location: "",
      dayNumber: "1",
      activityDate: new Date().toISOString().split('T')[0], // Today's date
      tags: "",
    },
  });

  const { mutateAsync: createPost, isLoading: isLoadingCreate } = useCreatePost();

  const handleSubmit = async (value: z.infer<typeof ActivityValidation>) => {
    try {
      const newPost = await createPost({
        ...value,
        dayNumber: parseInt(value.dayNumber),
        userId: user.id,
        journalId: journalId, // Link to the journal
        journalTitle: journalTitle || "", // Include journal title for context
      });

      if (newPost) {
        toast({
          title: `Activity added successfully!`,
        });
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(`/journal-details/${journalId}`);
        }
      }
    } catch (error) {
      toast({
        title: `Failed to add activity. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl">
        
        <div className="flex flex-col gap-4">
          <h2 className="h2-bold text-light-1">Add Daily Activity</h2>
          {journalTitle && (
            <p className="text-light-3">Adding activity to: <span className="text-primary-500">{journalTitle}</span></p>
          )}
        </div>

        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Activity Description</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  placeholder="Describe what you did on this day..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Photos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl=""
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center">
          <FormField
            control={form.control}
            name="dayNumber"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="shad-form_label">Day Number</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    className="shad-input"
                    placeholder="1"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activityDate"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="shad-form_label">Activity Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="shad-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Specific Location</FormLabel>
              <FormControl>
                <Input
                  className="shad-input"
                  placeholder="e.g., Eiffel Tower, Paris or Central Park, NYC"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Tags (separated by comma " , ")
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Art, Food, Adventure, Culture"
                  className="shad-input"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}
            disabled={isLoadingCreate}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate}>
            {isLoadingCreate && <Loader />}
            Add Activity
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ActivityForm;
