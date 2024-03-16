'use server';

import { revalidatePath } from 'next/cache';
import User from '../database/user.model';
import { connectToDatabase } from '../mongoose';
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from './shared.types';
import { BadgeCriteriaType } from '@/types';
import Question from '../database/question.model';
import { FilterQuery } from 'mongoose';
import Tag from '../database/tag.model';
import Answer from '../database/answer.model';
import Interaction from '../database/interaction.model';
import { assignBadges } from '../utils';

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof User> = {};

    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, 'i') } },
        { username: { $regex: new RegExp(searchQuery, 'i') } },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case 'new_users':
        sortOptions = { joinedAt: -1 };

        break;
      case 'old_users':
        sortOptions = { joinedAt: 1 };

        break;
      case 'top_contributors':
        sortOptions = { reputaion: -1 };

        break;

      default:
        break;
    }

    // const { page = 1, pageSize = 20, filter, searchQuery } = params;

    const users = await User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsers = await User.countDocuments(query);
    const isNext = totalUsers > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserById(params: any) {
  try {
    connectToDatabase();

    const { userId } = params;
    const user = await User.findOne({ clerkId: userId });

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  console.log('in create user block');
  try {
    connectToDatabase();

    const newUser = await User.create(userData);
    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();
    const { clerkId, updateData, path } = params;
    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });
    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();
    const { clerkId } = params;

    // const user = await User.findOneAndDelete({ clerkId });
    const user = await User.findOne({ clerkId });

    console.log('user', user);

    if (!user) {
      throw new Error('User not found');
    }

    // Delete user from db
    // and questions, answers, comments, etc.

    // Get the IDs of questions authored by the current user
    const userQuestionIds = await Question.find({
      author: user._id,
    }).distinct('_id');
    console.log('User Question IDs:', userQuestionIds);

    // const userAnswerIds = await Answer.find({
    //   author: user._id,
    // })

    // Remove user's answer IDs from questions
    for (const questionId of userQuestionIds) {
      console.log('Current user QUestion ID:', questionId);

      // Retrieve the question document by ID
      const question = await Question.findById(questionId);
      console.log('Question before update:', question);

      const answerIds = question.answers; // Get answer IDs from the question
      console.log('Answer IDs:', answerIds);
      // Find all users who have answered this question (excluding the current user)
      const otherUsers = await User.find({
        _id: { $ne: user._id },
        answers: { $in: answerIds },
      });

      console.log('Other users :', otherUsers);

      // Loop through other users and delete their answers
      for (const otherUser of otherUsers) {
        // Delete other user's answers to this question
        const othersAns = await Answer.deleteMany({
          question: question._id,
          author: otherUser._id,
        });
        console.log('othersAns ', othersAns);
      }
    }

    // Find questions authored by other users where the current user has answered
    // answer.author can directly take author value from Answer schema.
    const otherUserQuestions = await Question.find({
      'answers.author': user._id,
    });

    console.log(otherUserQuestions);

    // Loop through other users' questions and remove the current user's answer IDs
    for (const question of otherUserQuestions) {
      console.log(question);
      const deletedOtherAns = await Question.updateOne(
        { _id: question._id },
        { $pull: { answers: { $in: user.answers } } }
      );

      console.log(deletedOtherAns);
    }

    // for (const questionId of userQuestionIds) {
    //   const question = await Question.findById(questionId);
    //   console.log('Question before update:', question);

    //   await Question.findByIdAndUpdate(
    //     questionId,
    //     { $pull: { answers: user.answers } },
    //     { new: true }
    //   );

    //   const updatedQuestion = await Question.findById(questionId);
    //   console.log('Question after update:', updatedQuestion);
    // }

    // for (const questionId of userQuestionIds) {
    //   await Question.findByIdAndUpdate(questionId, {
    //     $pull: { answers: { $in: user.answers } },
    //   });
    // }
    // const userQuestionAnswerIds = await Question.updateMany(
    //   { _id: { $in: userQuestionIds } },
    //   { $pull: { answers: { $in: user.answers } } }
    // );

    // delete user's questions
    const deletedQuestions = await Question.deleteMany({ author: user._id });
    console.log('Deleted Questions:', deletedQuestions);

    // delete user's answers
    const userAnswers = await Answer.deleteMany({ author: user._id });

    console.log('Deleted Answers:', userAnswers);

    // Remove user's upvotes from questions
    await Question.updateMany(
      { upvotes: user._id },
      { $pull: { upvotes: user._id } }
    );

    // Remove user's upvotes from answers
    await Answer.updateMany(
      { upvotes: user._id },
      { $pull: { upvotes: user._id } }
    );

    // Remove user's downvotes from questions
    await Question.updateMany(
      { downvotes: user._id },
      { $pull: { downvotes: user._id } }
    );

    // Remove user's downvotes from answers
    await Answer.updateMany(
      { downvotes: user._id },
      { $pull: { downvotes: user._id } }
    );

    // delete all its interactions
    const deletedInteractions = await Interaction.deleteMany({
      user: user._id,
    });
    console.log('Deleted Interactions:', deletedInteractions);
    // finally delete the user
    const deletedUser = await User.findByIdAndDelete(user._id);
    console.log('Deleted User:', deletedUser);
    return deletedUser;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    connectToDatabase();

    const { userId, questionId, path } = params;

    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const isQuestionSaved = user.saved.includes(questionId);

    if (isQuestionSaved) {
      // remove question from saved
      await User.findByIdAndUpdate(
        userId,
        { $pull: { saved: questionId } },
        { new: true }
      );
    } else {
      // add question to saved
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { saved: questionId } },
        { new: true }
      );
    }
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    connectToDatabase();
    const { clerkId, searchQuery, filter, page = 1, pageSize = 10 } = params;
    const skipAmount = (page - 1) * pageSize;
    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, 'i') } }
      : {};

    let sortOptions = {};

    switch (filter) {
      case 'most_recent':
        sortOptions = { createdAt: -1 };

        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };

        break;
      case 'most_voted':
        sortOptions = { upvotes: -1 };

        break;
      case 'most_viewed':
        sortOptions = { views: -1 };

        break;
      case 'most_answered':
        sortOptions = { answers: -1 };

        break;

      default:
        break;
    }

    const user = await User.findOne({ clerkId }).populate({
      path: 'saved',
      match: query,
      options: {
        sort: sortOptions,
        skip: skipAmount,
        limit: pageSize + 1,
      },
      populate: [
        { path: 'tags', model: Tag, select: '_id name' },
        { path: 'author', model: User, select: '_id clerkId name picture' },
      ],
    });

    const isNext = user.saved.length > pageSize;

    if (!user) {
      throw new Error('User not found');
    }

    const savedQuestions = user.saved;

    return { questions: savedQuestions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    connectToDatabase();
    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error('User not found');
    }
    // how many questions any particular user raise or answer any question
    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });

    const [questionUpvotes] = await Question.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          _id: 0,
          upvotes: { $size: '$upvotes' },
        },
      },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: '$upvotes' },
        },
      },
    ]);

    const [answerUpvotes] = await Answer.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          _id: 0,
          upvotes: { $size: '$upvotes' },
        },
      },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: '$upvotes' },
        },
      },
    ]);

    const [questionViews] = await Question.aggregate([
      { $match: { author: user._id } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
        },
      },
    ]);

    const criteria = [
      { type: 'QUESTION_COUNT' as BadgeCriteriaType, count: totalQuestions },
      { type: 'ANSWER_COUNT' as BadgeCriteriaType, count: totalAnswers },
      {
        type: 'QUESTION_UPVOTES' as BadgeCriteriaType,
        count: questionUpvotes?.totalUpvotes || 0,
      },
      {
        type: 'ANSWER_UPVOTES' as BadgeCriteriaType,
        count: answerUpvotes?.totalUpvotes || 0,
      },
      {
        type: 'TOTAL_VIEWS' as BadgeCriteriaType,
        count: questionViews?.totalViews || 0,
      },
    ];

    const badgeCounts = assignBadges({ criteria });

    return {
      user,
      totalQuestions,
      totalAnswers,
      badgeCounts,
      reputation: user.reputation,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 10 } = params;
    const skipAmount = (page - 1) * pageSize;
    const totalQuestions = await Question.countDocuments({ author: userId });

    const userQuestions = await Question.find({ author: userId })
      .sort({ createdAt: -1, views: -1, upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate('tags', '_id name')
      .populate('author', '_id name clerkId picture');

    const isNext = totalQuestions > skipAmount + userQuestions.length;

    return { totalQuestions, questions: userQuestions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 1 } = params;

    const skipAmount = (page - 1) * pageSize;

    const totalAnswers = await Answer.countDocuments({ author: userId });

    const userAnswers = await Answer.find({ author: userId })
      .sort({ createdAt: -1, upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate('question', '_id title')
      .populate('author', '_id name clerkId picture');

    const isNext = totalAnswers > skipAmount + userAnswers.length;

    return { totalAnswers, answers: userAnswers, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
