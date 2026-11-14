export interface CategoryResponse {
    id: number
    name: string
}

export interface UserResponse {
    id: number
    email: string
}

export interface PostResponse {
    id: number
    title: string
    content: string
    author: UserResponse | null
    category: CategoryResponse | null
}

export interface MessageResponse {
    message: string
}
