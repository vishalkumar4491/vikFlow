import { z } from 'zod';

export const QuestionsSchema = z.object({
  title: z.string().min(5).max(150),
  explanation: z.string().min(25),
  tags: z.array(z.string().min(3).max(15)).min(1).max(3),
});

export const AnswerSchema = z.object({
  answer: z.string().min(25),
});

export const ProfileSchema = z.object({
  name: z.string().min(5).max(50),
  username: z.string().min(5).max(50),
  bio: z.string().min(10).max(150),
  portfolioWebsite: z.string().url(),
  location: z.string().min(5).max(50),
});
