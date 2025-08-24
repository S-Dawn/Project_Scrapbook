import * as z from "zod";
import { Models } from "appwrite";
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
import { JournalValidation } from "@/lib/validation";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { FileUploader, Loader } from "@/components/shared";
import { useCreateJournal, useUpdatePost } from "@/lib/react-query/queries";

type JournalFormProps = {
  post?: Models.Document;
  action: "Create" | "Update";
};

const JournalForm = ({ post, action }: JournalFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();
  const form = useForm<z.infer<typeof JournalValidation>>({
    resolver: zodResolver(JournalValidation),
    defaultValues: {
      journalTitle: post ? post?.journalTitle : "",
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post.location : "",
      source: post ? post?.source : "",
      destination: post ? post?.destination : "",
      dayNumber: post ? post?.dayNumber?.toString() : "1",
      duration: post ? post?.duration : "",
      tags: post ? post.tags.join(",") : "",
    },
  });
  // Query
  const { mutateAsync: createJournal, isLoading: isLoadingCreate } = useCreateJournal();
  const { mutateAsync: updatePost, isLoading: isLoadingUpdate } = useUpdatePost();

  // Handler
  const handleSubmit = async (value: z.infer<typeof JournalValidation>) => {
    // ACTION = UPDATE
    if (post && action === "Update") {
      const updatedPost = await updatePost({
        ...value,
        postId: post.$id,
        imageId: post.imageId,
        imageUrl: post.imageUrl,
        dayNumber: parseInt(value.dayNumber),
      });

      if (!updatedPost) {
        toast({
          title: `${action} journal failed. Please try again.`,
        });
      }
      return navigate(`/journal/${post.$id}`);
    }    // ACTION = CREATE
    const newJournal = await createJournal({
      userId: user.id,
      title: value.journalTitle,
      description: value.caption,
      source: value.source,
      destination: value.destination,
      startDate: "", // You might want to add these fields to the form
      endDate: "",   // You might want to add these fields to the form
      duration: value.duration,
      tags: value.tags,
      coverImageFile: value.file,
    });

    if (!newJournal) {
      toast({
        title: `${action} journal failed. Please try again.`,
      });
    }
    navigate("/my-journals");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl">
        
        <FormField
          control={form.control}
          name="journalTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Journal Title</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  placeholder="e.g., Amazing Trip to Tokyo"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Source Location</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="shad-input"
                    placeholder="e.g., New York"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Destination</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="shad-input"
                    placeholder="e.g., Tokyo"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dayNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Day Number</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="shad-input"
                    placeholder="1"
                    min="1"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Duration</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="shad-input"
                    placeholder="e.g., 5 days, 1 week"
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
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Journal Entry</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  placeholder="Tell us about your travel experience..."
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
                  mediaUrl={post?.imageUrl}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Specific Location</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  placeholder="e.g., Shibuya District, Tokyo"
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
                  placeholder="Travel, Adventure, Food, Culture"
                  type="text"
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
            onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}>
            {(isLoadingCreate || isLoadingUpdate) && <Loader />}
            {action} Journal
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default JournalForm;
