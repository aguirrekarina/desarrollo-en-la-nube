export interface Post {
    id: string;
    userId: string;
    userDisplayName: string;
    userPhotoURL?: string;
    content: string;
    imageURL?: string;
    likesCount: number;
    dislikesCount: number;
    commentsCount: number;
    createdAt: any;
    updatedAt: any;
    likedBy?: string[];
    dislikedBy?: string[];
    isModerated?: boolean;
    moderated?: boolean;
    moderatedAt?: any;
}

export interface CreatePostData {
    content: string;
    imageURL?: string;
}

export interface LikeDislikeData {
    postId: string;
    userId: string;
    action: 'like' | 'dislike' | 'remove';
}

export interface Notification {
    id: string;
    userId: string;
    fromUserId: string;
    fromUserName?: string;
    fromUserPhoto?: string;
    type: 'like' | 'dislike' | 'comment' | 'moderation';
    postId: string;
    message: string;
    read: boolean;
    createdAt: any;
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