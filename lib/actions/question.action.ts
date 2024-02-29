'use server';

import Question from '../database/question.model';
import Tag from '../database/tag.model';
import { connectToDatabase } from '../mongoose';

export async function createQuestion(params: any) {
  // eslint-disable-next-line no-empty
  try {
    connectToDatabase();

    // all inputs from form which we entered on FE.
    // i.e. accepting parameters from FE
    // path is on which we will redirect, it is using here so that, taht page knwo about something has been changed.
    const { title, content, tags, author, path } = params;

    // create the question
    const question = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];

    // Create the tags or get them if they already exist
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, 'i') } },
        { $setOnInsert: { name: tag }, $push: { question: question._id } },
        { upsert: true, new: true }
      );

      tagDocuments.push(existingTag._id);
    }

    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    // Create an interaction record for the user's ask_question action
    // i.e. we can track the use creating any question

    // Increment author's reputation by +5 for creating a question.
  } catch (error) {}
}
