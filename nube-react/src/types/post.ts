export interface Post {
    id: string;
    userId: string;
    userDisplayName: string;
    userPhotoURL?: string;
    content: string;
    imageURL?: string;
    likesCount: number;
    commentsCount: number;
    createdAt: any;
    updatedAt: any;
}

export interface CreatePostData {
    content: string;
    imageURL?: string;
}

export interface PostContextType {
    posts: Post[];
    loading: boolean;
    createPost: (postData: CreatePostData) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
    getUserPosts: (userId: string) => Promise<Post[]>;
    getAllPosts: () => Promise<void>;
    refreshPosts: () => Promise<void>;
}