export const Role = {
  ADMIN: "ADMIN",
  CONTRIBUTOR: "CONTRIBUTOR",
  USER: "USER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const BlogStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  APPROVED: "APPROVED",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  ARCHIVED: "ARCHIVED",
} as const;

export type BlogStatus = (typeof BlogStatus)[keyof typeof BlogStatus];

export const NotificationType = {
  BLOG_SUBMITTED: "BLOG_SUBMITTED",
  BLOG_APPROVED: "BLOG_APPROVED",
  BLOG_REJECTED: "BLOG_REJECTED",
  NEW_COMMENT: "NEW_COMMENT",
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
