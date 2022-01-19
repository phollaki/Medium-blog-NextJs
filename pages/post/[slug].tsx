import { GetStaticProps } from 'next/types';
import PortableText from 'react-portable-text';
import Header from '../../components/Header';
import { sanityClient, urlFor } from '../../sanity';
import { Post } from '../../typings';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';

interface Props {
  post: Post;
}
interface InputForm {
  _id: string;
  name: string;
  email: string;
  comment: string;
}
function Post({ post }: Props) {
  const [submitted, setSubmitted] = useState(false);
  console.log(post);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InputForm>();

  const onSubmit: SubmitHandler<InputForm> = (data) => {
    setSubmitted(false);
    fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then(() => {
        console.log(data);
        setSubmitted(true);
      })
      .catch((err) => {
        setSubmitted(false);
        console.log(err);
      });
  };

  return (
    <main>
      <Header />
      <img
        src={urlFor(post.mainImage).url()!}
        className='w-full h-40 object-cover'
        alt={post.title}
      />
      <article className='max-w-3xl mx-auto md:px-0 px-10'>
        <h1 className='text-3xl mb-3 mt-10'>{post.title}</h1>
        <h2 className='text-xl font-light text-gray-500 mb-2  pb-5'>
          {post.description}
        </h2>
        <div className='flex items-center space-x-2'>
          <img
            className='rounded-full h-12 w-12'
            src={urlFor(post.author.image).url()!}
            alt=''
          />
          <p className='font-extralight text-sm'>
            Blog post by{' '}
            <span className='text-green-600'>{post.author.name}</span> -
            Published at {new Date(post._createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className='mt-10'>
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            content={post.body}
            className=''
            serializers={{
              h1: (props: any) => {
                <h1 className='text-2xl font-bold my-5' {...props} />;
              },
              h2: (props: any) => {
                <h2 className='text-xl font-bold my-5' {...props} />;
              },
              li: ({ children }: any) => {
                <li className='ml-4 list-disc'>{children}</li>;
              },
              link: ({ href, children }: any) => {
                <a className='text-blue-500 hover:underline'>{children}</a>;
              },
            }}
          />
        </div>
      </article>
      <hr className='max-w-lg my-5 mx-auto border border-yellow-500' />
      {submitted ? (
        <div className='flex flex-col p-10 bg-yellow-500 text-white max-w-2xl mx-auto'>
          <h1 className='text-3xl font-bold'>
            Thank you for submitting your comment
          </h1>
          <p>Once it has approved, it will appear below!</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-col p-5 max-w-2xl mx-auto mb-10'>
          <h3 className='text-sm text-yellow-500'>Enjoyed this article?</h3>
          <h4 className='text-3xl font-bold'>Leave a comment below!</h4>
          <hr className='py-3 mt-2' />

          <input
            {...register('_id')}
            type='hidden'
            name='_id'
            value={post._id}
          />

          <label className='block mb-5' htmlFor='name'>
            <span>Name</span>
            <input
              type='text'
              {...register('name', { required: true })}
              className='shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 focus:ring outline-none'
              id='name'
              placeholder='John Appleseed'
            />
          </label>

          <label className='block mb-5' htmlFor='email'>
            <span>Email</span>
            <input
              {...register('email', { required: true })}
              type='email'
              className='shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 focus:ring outline-none'
              id='email'
              placeholder='johnappleseed@gmail.com'
            />
          </label>

          <label className='block mb-5' htmlFor='comment'>
            <span>Comment</span>
            <textarea
              {...register('comment', { required: true })}
              rows={8}
              className='shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500 focus:ring outline-none'
              id='comment'
              placeholder='This article was awesome!'
            />
          </label>

          <div className='flex flex-col p-5'>
            {errors.name && (
              <span className='text-red-500'>The name field is required</span>
            )}
            {errors.comment && (
              <span className='text-red-500'>
                The comment field is required
              </span>
            )}
            {errors.email && (
              <span className='text-red-500'>The email field is required</span>
            )}
          </div>

          <button
            type='submit'
            className='shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer'>
            Comment
          </button>
        </form>
      )}

      {/* Comments */}
      <div className='flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500 shadow space-x-2'>
        <h3 className='text-4xl'>Comments</h3>
        <hr className='pb-2' />
        {post.comments.map((comment) => (
          <div className='my-3'>
            <p className=''>
              <span className='text-yellow-500 mr-2'>{comment.name}:</span>
              {comment.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Post;

export const getStaticPaths = async () => {
  const query = `*[_type=="post"]{
        _id,
        slug,
      }`;
  const posts = await sanityClient.fetch(query);
  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));
  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type=="post" && slug.current == $slug][0]{
        _id,
        _createdAt,
        title,
        author->{
      name,
      image
    },
    'comments':*[
      _type == 'comment' &&
      post._ref == ^._id &&
      approved == true
    ],
    description,
    mainImage,
    slug,
    body
      }`;
  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });
  if (!post) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      post,
    },
    revalidate: 3600, // after 60sec it will update the cache
  };
};
