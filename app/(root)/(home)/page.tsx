import QuestionCard from '@/components/cards/QuestionCard';
import HomeFilters from '@/components/home/HomeFilters';
import Filter from '@/components/shared/Filter';
import NoResult from '@/components/shared/NoResult';
import LocalSearch from '@/components/shared/search/LocalSearch';
import { Button } from '@/components/ui/button';
import { HomePageFilters } from '@/constants/filters';
import Link from 'next/link';

const questions = [
  {
    _id: '1',
    title:
      'Cascading Deletes in SQLAlchemy, can anyone explain it in very easy language.',
    tags: [
      { _id: '1', name: 'python' },
      { _id: '2', name: 'javascript' },
      { _id: '3', name: 'html' },
    ],
    author: {
      _id: 'author_id_1',
      name: 'John Doe',
      picture: 'author_picture_url_1',
    },
    upvotes: 100,
    views: 100003,
    answers: [{ answerProp: 'example' }, { answerProp: 'example' }],
    createdAt: new Date('2024-02-12T19:00:00Z'), // Use Date directly
  },
  {
    _id: '2',
    title: 'What is HTML',
    tags: [
      { _id: '1', name: 'python' },
      { _id: '2', name: 'javascript' },
      { _id: '3', name: 'html' },
    ],
    author: {
      _id: 'author_id_2',
      name: 'John Doe',
      picture: 'author_picture_url_2',
    },
    upvotes: 8070,
    views: 1005,
    answers: [{ answerProp: 'example' }], // Replace this with the actual structure of answers
    createdAt: new Date('2023-02-27T19:00:00Z'), // Use Date directly
  },
  {
    _id: '3',
    title: 'What is CSS',
    tags: [
      { _id: '1', name: 'javascript' },
      { _id: '2', name: 'html' },
    ],
    author: {
      _id: 'author_id_3',
      name: 'John Doe',
      picture: 'author_picture_url_3',
    },
    upvotes: 10,
    views: 100,
    answers: [{ answerProp: 'example' }], // Replace this with the actual structure of answers
    createdAt: new Date('2023-02-27T19:00:00Z'), // Use Date directly
  },
];

export default function Home() {
  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Link href="ask-question" className="flex justify-end max-sm:w-full">
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
            Ask a Question
          </Button>
        </Link>
      </div>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for questions..."
          otherClasses="flex-1"
        />

        <Filter
          filters={HomePageFilters}
          otherClasses="m in-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>

      <HomeFilters />

      <div className="mt-10 flex w-full flex-col gap-6">
        {questions.length > 0 ? (
          questions.map((question) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There’s no question to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved! 💡"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>
    </>
  );
}
