export interface PostRequest {
    title: string;
    content: string;
    authorId: number;
    categoryId: number;
}

export interface CategoryRequest {
    name: string;
}

export interface AuthRequest {
    email: string;
    password: string;
}

export interface EmptyParams {}
export interface EmptyResponse {}
