export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
  // Travel journal specific fields
  source?: string;
  destination?: string;
  dayNumber?: number;
  journalTitle?: string;
  duration?: string;
  // Journal relationship
  journalId?: string; // Link post to a specific journal
  activityDate?: string; // Specific date for this activity
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: URL;
  file: File[];
  location?: string;
  tags?: string;
  // Travel journal specific fields
  source?: string;
  destination?: string;
  dayNumber?: number;
  journalTitle?: string;
  duration?: string;
  // Journal relationship
  journalId?: string; // Link post to a specific journal
  activityDate?: string; // Specific date for this activity
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  imageId: string;
  bio: string;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

// Journal Types
export type INewJournal = {
  userId: string;
  title: string;
  description: string;
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: string;
  tags?: string;
  coverImageFile?: File[];
  coverImageUrl?: string;
  coverImageId?: string;
};

export type IUpdateJournal = {
  journalId: string;
  title: string;
  description: string;
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: string;
  tags?: string;
  coverImageFile?: File[];
  coverImageUrl?: string;
  coverImageId?: string;
};

export type IJournal = {
  $id: string;
  title: string;
  description: string;
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: string;
  tags: string[];
  coverImageUrl?: string;
  coverImageId?: string;
  creator: IUser;
  $createdAt: string;
  $updatedAt: string;
};

// Activity/Post within a journal
export type IJournalActivity = {
  $id: string;
  caption: string;
  imageUrl: string;
  imageId: string;
  location: string;
  tags: string[];
  dayNumber: number;
  activityDate: string;
  journalId: string;
  creator: IUser;
  $createdAt: string;
  $updatedAt: string;
};
