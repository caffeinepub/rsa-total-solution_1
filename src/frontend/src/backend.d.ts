import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Category = string;
export type Time = bigint;
export interface Inquiry {
    name: string;
    email: string;
    message: string;
    timestamp: Time;
    phone: string;
}
export interface PortfolioItem {
    title: string;
    description: string;
    imageUrl: string;
    category: Category;
}
export interface Testimonial {
    review: string;
    clientName: string;
    role: string;
    rating: bigint;
}
export interface backendInterface {
    addPortfolioItem(title: string, description: string, category: Category, imageUrl: string): Promise<void>;
    addTestimonial(clientName: string, role: string, review: string, rating: bigint): Promise<void>;
    getAllInquiries(): Promise<Array<Inquiry>>;
    getAllPortfolioItems(): Promise<Array<PortfolioItem>>;
    getAllTestimonials(): Promise<Array<Testimonial>>;
    getPortfolioByCategory(category: Category): Promise<Array<PortfolioItem>>;
    submitInquiry(name: string, email: string, phone: string, message: string): Promise<void>;
}
