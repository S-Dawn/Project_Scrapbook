import { ID, Query } from "appwrite";

import { appwriteConfig, account, databases, storage, avatars } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser, INewJournal } from "@/types";
import { storeImageLocally } from "@/lib/imageBackup";

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailSession(user.email, user.password);

    if (session) {
      // Store session info in localStorage for persistence check
      localStorage.setItem("cookieFallback", JSON.stringify([session]));
    }

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================== CHECK SESSION
export async function checkActiveSession() {
  try {
    const session = await account.getSession('current');
    return !!session;
  } catch (error: any) {
    // No active session
    return false;
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;  } catch (error: any) {
    // Don't log 401 errors as they're expected when user is not authenticated
    if (error.code !== 401) {
      console.log(error);
    }
    return null;
  }
}

// ============================== GET USER
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) {
      return null;
    }

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    // Only log errors that are not related to authentication
    console.log(error);
    return null;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    if (session) {
      // Clear session info from localStorage
      localStorage.removeItem("cookieFallback");
    }

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
        // Travel journal specific fields
        source: post.source || "",
        destination: post.destination || "",
        dayNumber: post.dayNumber || 1,
        journalTitle: post.journalTitle || "",
        duration: post.duration || "",
        // Journal relationship fields
        journalId: post.journalId || "",
        activityDate: post.activityDate || "",
        isJournal: false, // Regular posts are not journals
      }
    );if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Store image locally immediately after successful post creation
    try {
      await storeImageLocally({
        imageId: uploadedFile.$id,
        file: post.file[0]
      });
    } catch (storageError) {
      console.warn('Image storage failed, but post was created successfully:', storageError);
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      "top",
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];    //  Update post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
        // Travel journal specific fields
        source: post.source || "",
        destination: post.destination || "",
        dayNumber: post.dayNumber || 1,
        journalTitle: post.journalTitle || "",
        duration: post.duration || "",
        // Journal relationship fields
        journalId: post.journalId || "",
        activityDate: post.activityDate || "",
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
      
      // Store new image locally after successful update
      try {
        await storeImageLocally({
          imageId: image.imageId,
          file: post.file[0]
        });
      } catch (storageError) {
        console.warn('Image storage failed, but post was updated successfully:', storageError);
      }
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}
// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
        // Store new user profile image locally after successful update
      try {
        await storeImageLocally({
          imageId: image.imageId,
          file: user.file[0]
        });
      } catch (storageError) {
        console.warn('User profile image storage failed, but user was updated successfully:', storageError);
      }
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// JOURNALS
// ============================================================

// ============================== CREATE JOURNAL
export async function createJournal(journal: INewJournal) {
  try {
    let coverImage = {
      coverImageUrl: "",
      coverImageId: "",
    };

    // Upload cover image if provided
    if (journal.coverImageFile && journal.coverImageFile.length > 0) {
      const uploadedFile = await uploadFile(journal.coverImageFile[0]);
      if (!uploadedFile) throw Error;

      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      coverImage = { 
        coverImageUrl: fileUrl.toString(), 
        coverImageId: uploadedFile.$id 
      };
    }

    // Convert tags into array
    const tags = journal.tags?.replace(/ /g, "").split(",") || [];

    // Create journal as a special post type
    const newJournal = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: journal.userId,
        caption: journal.description,
        imageUrl: coverImage.coverImageUrl,
        imageId: coverImage.coverImageId,
        location: `${journal.source} → ${journal.destination}`,
        tags: tags,
        // Journal specific fields
        source: journal.source,
        destination: journal.destination,
        journalTitle: journal.title,
        duration: journal.duration,
        dayNumber: 0, // 0 indicates this is a journal header
        // Additional journal fields stored as custom properties
        startDate: journal.startDate,
        endDate: journal.endDate,
        isJournal: true, // Flag to identify journals vs activities
      }
    );

    if (!newJournal) {
      if (coverImage.coverImageId) {
        await deleteFile(coverImage.coverImageId);
      }
      throw Error;
    }

    // Store cover image locally if uploaded
    if (journal.coverImageFile && journal.coverImageFile.length > 0 && coverImage.coverImageId) {
      try {
        await storeImageLocally({
          imageId: coverImage.coverImageId,
          file: journal.coverImageFile[0]
        });
      } catch (storageError) {
        console.warn('Cover image storage failed, but journal was created successfully:', storageError);
      }
    }

    return newJournal;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET JOURNAL BY ID
export async function getJournalById(journalId?: string) {
  if (!journalId) throw Error;

  try {
    const journal = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      journalId
    );

    if (!journal) throw Error;

    return journal;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S JOURNALS
export async function getUserJournals(userId?: string) {
  if (!userId) return;

  try {
    const journals = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [
        Query.equal("creator", userId), 
        Query.equal("isJournal", true),
        Query.orderDesc("$createdAt")
      ]
    );

    if (!journals) throw Error;

    return journals;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET JOURNAL ACTIVITIES (Posts linked to journal)
export async function getJournalActivities(journalId?: string) {
  if (!journalId) return;

  try {
    const activities = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [
        Query.equal("journalId", journalId),
        Query.notEqual("isJournal", true),
        Query.orderAsc("dayNumber")
      ]
    );

    if (!activities) throw Error;

    return activities;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET RECENT JOURNALS
export async function getRecentJournals() {
  try {
    const journals = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [
        Query.equal("isJournal", true),
        Query.orderDesc("$createdAt"), 
        Query.limit(20)
      ]
    );

    if (!journals) throw Error;

    return journals;
  } catch (error) {
    console.log(error);
  }
}
