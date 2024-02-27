import HomeFilters from '@/components/home/HomeFilters';
import Filter from '@/components/shared/Filter';
import NoResult from '@/components/shared/NoResult';
import LocalSearch from '@/components/shared/search/LocalSearch';
import { Button } from '@/components/ui/button';
import { HomePageFilters } from '@/constants/filters';
import Link from 'next/link';

const questions = [
  {
    _id: 1,
    title: 'Cascading Deletes in SQLAlchemy',
    tags: [
      { _id: 1, name: 'python' },
      { _id: 2, name: 'javascript' },
      { _id: 3, name: 'html' },
    ],
    author: 'John Doe',
    upvotes: 10,
    views: 100,
    answers: 2,
    createdAt: '2023-02-27T19:00:00Z',
  },
  {
    _id: 2,
    title: 'What is HTML',
    tags: [
      { _id: 1, name: 'python' },
      { _id: 2, name: 'javascript' },
      { _id: 3, name: 'html' },
    ],
    author: 'John Doe',
    upvotes: 8,
    views: 10,
    answers: 5,
    createdAt: '2023-02-27T19:00:00Z',
  },
  {
    _id: 3,
    title: 'What is CSS',
    tags: [
      { _id: 1, name: 'javascript' },
      { _id: 2, name: 'html' },
    ],
    author: 'John Doe',
    upvotes: 10,
    views: 100,
    answers: 2,
    createdAt: '2023-02-27T19:00:00Z',
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
          questions.map((question) => 'QuestionCard')
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
