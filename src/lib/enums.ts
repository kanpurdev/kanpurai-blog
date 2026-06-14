export const Role = {
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
  AUTHOR: "AUTHOR",
  CONTRIBUTOR: "CONTRIBUTOR",
  USER: "USER",
  GUEST: "GUEST",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const BlogStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
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
  BLOG_CHANGES_REQUESTED: "BLOG_CHANGES_REQUESTED",
  NEW_COMMENT: "NEW_COMMENT",
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
