'use server';

import { FilterQuery } from 'mongoose';
import Tag, { ITag } from '../database/tag.model';
import User from '../database/user.model';
import { connectToDatabase } from '../mongoose';
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from './shared.types';
import Question from '../database/question.model';

export async function getAllTags(params: GetAllTagsParams) {
  try {
    connectToDatabase();
    const { searchQuery, filter, page = 1, pageSize = 10 } = params;
    const skipAmount = (page - 1) * pageSize;
    const query: FilterQuery<typeof Tag> = {};
    if (searchQuery) {
      query.$or = [{ name: { $regex: new RegExp(searchQuery, 'i') } }];
    }
    let sortOptions = {};
    switch (filter) {
      case 'popular':
        sortOptions = { questions: -1 }; // Sorting by number of questions in descending order
        break;
      case 'recent':
        sortOptions = { createdOn: -1 };
        break;
      case 'name':
        sortOptions = { name: 1 };
        break;
      case 'old':
        sortOptions = { createdOn: 1 };
        break;
      default:
        break;
    }
    if (filter === 'popular') {
      const totalTags = await Tag.aggregate([
        {
          $match: query,
        },
        {
          $project: {
            name: 1,
            description: 1,
            followers: 1,
            createdOn: 1,
            questions: 1,
            questionsCount: { $size: '$questions' }, // Counting the number of questions for each tag
          },
        },
        {
          $sort: { questionsCount: -1 }, // Sorting based on the number of questions in descending order
        },
        {
          $skip: skipAmount,
        },
        {
          $limit: pageSize,
        },
      ]);
      const isNext = totalTags.length > skipAmount + pageSize;
      return { tags: totalTags, isNext };
    } else {
      const totalTags = await Tag.countDocuments(query);
      const tags = await Tag.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize);
      const isNext = totalTags > skipAmount + tags.length;
      return { tags, isNext };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    connectToDatabase();

    // user is who reply on any particular tag or create any tag
    const { userId, limit = 3 } = params;

    const user = await User.findById(userId);

    if (!user) throw new Error('User not found');

    // Find interactions for the user and group by tags...
    // Interaction

    return [
      { _id: '1', name: 'tag1' },
      { _id: '2', name: 'tag2' },
    ];
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    connectToDatabase();

    const { tagId, page = 1, pageSize = 1, searchQuery } = params;

    const skipAmount = (page - 1) * pageSize;

    const tagFilter: FilterQuery<ITag> = { _id: tagId };

    const tag = await Tag.findOne(tagFilter).populate({
      path: 'questions',
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: 'i' } }
        : {},
      options: {
        sort: { createdAt: -1 },
        skip: skipAmount,
        limit: pageSize + 1,
      },
      populate: [
        { path: 'tags', model: Tag, select: '_id name' },
        { path: 'author', model: User, select: '_id clerkId name picture' },
      ],
    });

    if (!tag) {
      throw new Error('Tag not found');
    }

    const isNext = tag.questions.length > pageSize;

    const questions = tag.questions;

    return { tagTitle: tag.name, questions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getTopPopularTags() {
  try {
    connectToDatabase();

    const popularTags = await Tag.aggregate([
      { $project: { name: 1, numberOfQuestions: { $size: '$questions' } } },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ]);

    return popularTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
